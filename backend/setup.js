/**
 * ไฟล์สำหรับเตรียมความพร้อมสำหรับฐานข้อมูล TiDB
 * - ตรวจสอบการเชื่อมต่อ
 * - สร้างตารางที่จำเป็น
 * - เพิ่มข้อมูลเริ่มต้น
 */

const bcrypt = require('bcryptjs');
const db = require('./config');
require('dotenv').config();

// ฟังก์ชันหลักสำหรับเตรียมฐานข้อมูล
async function setupDatabase() {
  console.log('==========================================================');
  console.log('🔧 เริ่มต้นการตรวจสอบและเตรียมฐานข้อมูล TiDB');
  console.log('==========================================================');
  
  // สร้าง connection pool
  const pool = db.createPool();
  
  try {
    // ทดสอบการเชื่อมต่อ
    console.log('🔄 กำลังทดสอบการเชื่อมต่อกับ TiDB...');
    const connected = await db.testConnection(pool);
    
    if (!connected) {
      console.error('❌ ไม่สามารถเชื่อมต่อกับ TiDB ได้');
      process.exit(1);
    }
    
    // เตรียมฐานข้อมูล
    console.log('🔄 กำลังเตรียมฐานข้อมูล...');
    
    // สร้างตาราง admins
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ สร้างตาราง admins สำเร็จ');
    
    // สร้างตาราง pm25_data
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pm25_data (
        id INT AUTO_INCREMENT PRIMARY KEY,
        value FLOAT NOT NULL,
        location VARCHAR(255) NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ สร้างตาราง pm25_data สำเร็จ');
    
    // ตรวจสอบว่ามี admin อยู่แล้วหรือไม่
    const [admins] = await pool.query('SELECT * FROM admins');
    
    if (admins.length === 0) {
      console.log('🔄 กำลังสร้าง admin เริ่มต้น...');
      // ถ้าไม่มี admin ให้สร้าง admin เริ่มต้น
      const hashedPassword = await bcrypt.hash('123456', 10);
      await pool.query(
        'INSERT INTO admins (username, password) VALUES (?, ?)',
        ['admin', hashedPassword]
      );
      console.log('✅ สร้าง admin เริ่มต้นสำเร็จ (username: admin, password: 123456)');
    } else {
      console.log(`📝 มี admin ในระบบอยู่แล้ว ${admins.length} คน`);
    }
    
    // เพิ่มข้อมูลทดสอบ (สมมติ)
    const addSampleData = process.env.ADD_SAMPLE_DATA === 'true';
    if (addSampleData) {
      console.log('🔄 กำลังเพิ่มข้อมูลทดสอบ...');
      
      // ตรวจสอบว่ามีข้อมูล PM2.5 อยู่แล้วหรือไม่
      const [pm25Records] = await pool.query('SELECT COUNT(*) as count FROM pm25_data');
      
      if (pm25Records[0].count === 0) {
        // เพิ่มข้อมูลทดสอบสำหรับ PM2.5
        const sampleLocations = ['กรุงเทพ', 'เชียงใหม่', 'ภูเก็ต', 'ขอนแก่น'];
        
        for (const location of sampleLocations) {
          const randomValue = (Math.random() * 100 + 10).toFixed(2);
          await pool.query(
            'INSERT INTO pm25_data (value, location) VALUES (?, ?)',
            [randomValue, location]
          );
        }
        
        console.log('✅ เพิ่มข้อมูลทดสอบสำเร็จ');
      } else {
        console.log(`📝 มีข้อมูล PM2.5 ในระบบอยู่แล้ว ${pm25Records[0].count} รายการ`);
      }
    }
    
    console.log('==========================================================');
    console.log('✅ การเตรียมฐานข้อมูลเสร็จสมบูรณ์');
    console.log('==========================================================');
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการเตรียมฐานข้อมูล:', error);
    process.exit(1);
  } finally {
    // ปิด connection pool
    await pool.end();
  }
}

// รันฟังก์ชันหลัก
setupDatabase(); 