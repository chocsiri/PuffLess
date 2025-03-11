const mysql = require('mysql2/promise');
require('dotenv').config();

// ฟังก์ชันสร้าง connection pool
function createPool() {
  return mysql.createPool({
    host: process.env.TIDB_HOST,
    port: process.env.TIDB_PORT,
    user: process.env.TIDB_USER,
    password: process.env.TIDB_PASSWORD,
    database: process.env.TIDB_DATABASE,
    ssl: {
      minVersion: 'TLSv1.2',
      rejectUnauthorized: true
    },
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
  });
}

// ฟังก์ชันทดสอบการเชื่อมต่อ
async function testConnection() {
  const pool = createPool();
  try {
    const connection = await pool.getConnection();
    console.log('เชื่อมต่อกับ TiDB สำเร็จ!');
    connection.release();
    return true;
  } catch (error) {
    console.error('ไม่สามารถเชื่อมต่อกับ TiDB:', error);
    return false;
  } finally {
    await pool.end();
  }
}

// ฟังก์ชันจัดการ Transaction
async function withTransaction(pool, callback) {
  const conn = await pool.getConnection();
  await conn.beginTransaction();
  
  try {
    const result = await callback(conn);
    await conn.commit();
    return result;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

// ฟังก์ชันดึงข้อมูลแบบแบ่งหน้า
async function fetchWithPagination(pool, query, params = [], page = 1, limit = 10) {
  const offset = (page - 1) * limit;
  const countQuery = query.replace(/SELECT .* FROM/, 'SELECT COUNT(*) as total FROM').split('ORDER BY')[0];
  
  try {
    const [rows] = await pool.query(query + ' LIMIT ? OFFSET ?', [...params, limit, offset]);
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0].total;
    
    return {
      data: rows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการดึงข้อมูล:', error);
    throw error;
  }
}

module.exports = {
  createPool,
  testConnection,
  withTransaction,
  fetchWithPagination
}; 