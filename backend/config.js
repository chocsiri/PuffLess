const mysql = require('mysql2/promise');
require('dotenv').config();

// สร้าง connection pool สำหรับฐานข้อมูล TiDB
const createPool = () => {
  const config = {
    host: process.env.TIDB_HOST,
    port: parseInt(process.env.TIDB_PORT) || 4000,
    user: process.env.TIDB_USER,
    password: process.env.TIDB_PASSWORD,
    database: process.env.TIDB_DATABASE,
    // กำหนดค่า connection pool ที่เหมาะสมสำหรับ TiDB
    connectionLimit: 10,
    queueLimit: 0,
    waitForConnections: true,
    // การตั้งค่า SSL สำหรับ TiDB Cloud
    ssl: {
      minVersion: 'TLSv1.2',
      rejectUnauthorized: true
    }
  };

  // ถ้ามีการกำหนดว่าไม่ใช้ SSL
  if (process.env.DISABLE_SSL === 'true') {
    delete config.ssl;
  }

  return mysql.createPool(config);
};

// สร้างตารางที่จำเป็น โดยคำนึงถึงความเข้ากันได้กับ TiDB
const createTables = async (connection) => {
  try {
    // สร้างตาราง admins
    // หมายเหตุ: TiDB รองรับ AUTO_INCREMENT แต่อาจมีพฤติกรรมต่างจาก MySQL
    await connection.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // สร้างตาราง pm25_data
    await connection.query(`
      CREATE TABLE IF NOT EXISTS pm25_data (
        id INT AUTO_INCREMENT PRIMARY KEY,
        value FLOAT NOT NULL,
        location VARCHAR(255) NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ สร้างตารางสำเร็จ');
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการสร้างตาราง:', error);
    throw error;
  }
};

// สร้าง admin เริ่มต้น
const createInitialAdmin = async (connection) => {
  try {
    const bcrypt = require('bcryptjs');
    // ตรวจสอบว่ามี admin อยู่แล้วหรือไม่
    const [admins] = await connection.query('SELECT * FROM admins');
    
    if (admins.length === 0) {
      // ถ้าไม่มี admin ให้สร้าง admin เริ่มต้น
      const hashedPassword = await bcrypt.hash('123456', 10);
      await connection.query(
        'INSERT INTO admins (username, password) VALUES (?, ?)',
        ['admin', hashedPassword]
      );
      console.log('✅ สร้าง admin เริ่มต้นสำเร็จ (username: admin, password: 123456)');
    }
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการสร้าง admin เริ่มต้น:', error);
  }
};

// ทดสอบการเชื่อมต่อ และจัดการการลองใหม่ (retry)
const testConnection = async (pool, retries = 3) => {
  let lastError = null;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const connection = await pool.getConnection();
      console.log(`✅ เชื่อมต่อกับ TiDB สำเร็จ (พยายามครั้งที่ ${attempt}/${retries})!`);
      
      // ตรวจสอบว่ามีตารางที่จำเป็นหรือไม่
      await createTables(connection);
      
      // สร้าง admin เริ่มต้น
      await createInitialAdmin(connection);
      
      connection.release();
      return true;
    } catch (error) {
      lastError = error;
      console.error(`❌ เกิดข้อผิดพลาดในการเชื่อมต่อกับ TiDB (พยายามครั้งที่ ${attempt}/${retries}):`, error);
      
      if (attempt < retries) {
        // รอก่อนที่จะลองใหม่
        console.log(`⏳ รอ ${attempt * 1000}ms ก่อนที่จะลองใหม่...`);
        await new Promise(resolve => setTimeout(resolve, attempt * 1000));
      }
    }
  }
  
  console.error(`❌ ไม่สามารถเชื่อมต่อกับ TiDB ได้หลังจากพยายาม ${retries} ครั้ง`);
  return false;
};

// ทำ Health check สำหรับการเชื่อมต่อ
const healthCheck = async (pool) => {
  try {
    const connection = await pool.getConnection();
    await connection.query('SELECT 1');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการ health check:', error);
    return false;
  }
};

// ฟังก์ชันสำหรับทำ transaction ใน TiDB
// TiDB มีการรองรับ distributed transaction แต่มีข้อควรระวัง
// - ไม่ควรทำ transaction ที่ยาวนานเกินไป (ไม่เกิน 10 นาที)
// - ควรจำกัดจำนวนการเปลี่ยนแปลงข้อมูลในแต่ละ transaction
const withTransaction = async (pool, callback) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    console.log('🔄 เริ่มต้น transaction');
    
    // เรียกใช้ callback ฟังก์ชันที่ทำงานภายใน transaction
    const result = await callback(connection);
    
    await connection.commit();
    console.log('✅ ทำ transaction สำเร็จ');
    
    return result;
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดใน transaction, กำลัง rollback:', error);
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// ฟังก์ชันสำหรับการดึงข้อมูลพร้อมการแบ่งหน้า (pagination)
const fetchWithPagination = async (pool, query, params, page = 1, pageSize = 10) => {
  const offset = (page - 1) * pageSize;
  
  // สร้าง query สำหรับการนับจำนวนทั้งหมด
  const countQuery = query.replace(/SELECT .* FROM/i, 'SELECT COUNT(*) as total FROM').split('ORDER BY')[0];
  
  // สร้าง query สำหรับดึงข้อมูลแบบแบ่งหน้า
  const paginatedQuery = `${query} LIMIT ? OFFSET ?`;
  const paginatedParams = [...params, pageSize, offset];
  
  try {
    // ดึงจำนวนทั้งหมด
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0].total;
    
    // ดึงข้อมูลตามหน้าที่ต้องการ
    const [rows] = await pool.query(paginatedQuery, paginatedParams);
    
    return {
      data: rows,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    };
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการดึงข้อมูลแบบแบ่งหน้า:', error);
    throw error;
  }
};

module.exports = {
  createPool,
  testConnection,
  healthCheck,
  withTransaction,
  fetchWithPagination
}; 