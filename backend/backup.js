/**
 * ไฟล์สำหรับการสำรองและกู้คืนข้อมูลในฐานข้อมูล TiDB
 * สำหรับสร้างไฟล์สำรองข้อมูลและนำข้อมูลกลับเข้าระบบ
 */

const fs = require('fs');
const path = require('path');
const db = require('./config');
require('dotenv').config();

// ตำแหน่งที่เก็บไฟล์สำรองข้อมูล
const BACKUP_DIR = path.join(__dirname, 'backups');

// ฟังก์ชันหลักสำหรับการสำรองข้อมูล
async function backup() {
  console.log('==========================================================');
  console.log('💾 เริ่มต้นการสำรองข้อมูลจาก TiDB');
  console.log('==========================================================');
  
  // สร้าง connection pool
  const pool = db.createPool();
  
  try {
    // ตรวจสอบการเชื่อมต่อ
    if (!(await db.testConnection(pool))) {
      console.error('❌ ไม่สามารถเชื่อมต่อกับ TiDB ได้');
      process.exit(1);
    }
    
    // สร้างโฟลเดอร์สำหรับเก็บไฟล์สำรองข้อมูล
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }
    
    // ชื่อไฟล์สำรองข้อมูล (timestamp)
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `backup-${timestamp}.json`;
    const backupFilePath = path.join(BACKUP_DIR, backupFileName);
    
    // ดึงข้อมูลจากฐานข้อมูล
    console.log('🔄 กำลังดึงข้อมูลจากฐานข้อมูล...');
    
    // ดึงข้อมูลจากตาราง admins (ไม่สำรองรหัสผ่าน)
    const [admins] = await pool.query('SELECT id, username, role, created_at FROM admins');
    console.log(`ℹ️ ดึงข้อมูล admin จำนวน ${admins.length} รายการ`);
    
    // ดึงข้อมูลจากตาราง pm25_data
    const [pm25Data] = await pool.query('SELECT * FROM pm25_data');
    console.log(`ℹ️ ดึงข้อมูล PM2.5 จำนวน ${pm25Data.length} รายการ`);
    
    // รวมข้อมูลทั้งหมด
    const backupData = {
      timestamp: new Date().toISOString(),
      database: process.env.TIDB_DATABASE,
      metadata: {
        version: process.env.APP_VERSION || '1.0.0',
        tables: ['admins', 'pm25_data']
      },
      data: {
        admins,
        pm25Data
      }
    };
    
    // บันทึกไฟล์
    fs.writeFileSync(backupFilePath, JSON.stringify(backupData, null, 2));
    console.log(`✅ สำรองข้อมูลลงในไฟล์ ${backupFilePath} สำเร็จ`);
    
    console.log('==========================================================');
    console.log('✅ การสำรองข้อมูลเสร็จสมบูรณ์');
    console.log('==========================================================');
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการสำรองข้อมูล:', error);
    process.exit(1);
  } finally {
    // ปิด connection pool
    await pool.end();
  }
}

// ฟังก์ชันหลักสำหรับการกู้คืนข้อมูล
async function restore(backupFile) {
  console.log('==========================================================');
  console.log('🔄 เริ่มต้นการกู้คืนข้อมูลเข้า TiDB');
  console.log('==========================================================');
  
  if (!backupFile) {
    console.error('❌ กรุณาระบุชื่อไฟล์สำรองข้อมูล');
    console.log('ตัวอย่าง: node backup.js restore backup-2023-01-01T00-00-00-000Z.json');
    process.exit(1);
  }
  
  // ตรวจสอบไฟล์สำรองข้อมูล
  const backupFilePath = path.join(BACKUP_DIR, backupFile);
  if (!fs.existsSync(backupFilePath)) {
    console.error(`❌ ไม่พบไฟล์สำรองข้อมูล: ${backupFilePath}`);
    process.exit(1);
  }
  
  // อ่านไฟล์สำรองข้อมูล
  console.log(`🔄 กำลังอ่านไฟล์สำรองข้อมูล: ${backupFilePath}`);
  const backupData = JSON.parse(fs.readFileSync(backupFilePath, 'utf8'));
  
  // สร้าง connection pool
  const pool = db.createPool();
  
  try {
    // ตรวจสอบการเชื่อมต่อ
    if (!(await db.testConnection(pool))) {
      console.error('❌ ไม่สามารถเชื่อมต่อกับ TiDB ได้');
      process.exit(1);
    }
    
    // ยืนยันการกู้คืนข้อมูล
    console.log('⚠️ คำเตือน: การกู้คืนข้อมูลจะทำให้ข้อมูลปัจจุบันสูญหาย');
    console.log(`ℹ️ ไฟล์สำรองข้อมูล: ${backupFile}`);
    console.log(`ℹ️ สร้างเมื่อ: ${backupData.timestamp}`);
    console.log(`ℹ️ ฐานข้อมูล: ${backupData.database}`);
    console.log(`ℹ️ ข้อมูล Admin: ${backupData.data.admins.length} รายการ`);
    console.log(`ℹ️ ข้อมูล PM2.5: ${backupData.data.pm25Data.length} รายการ`);
    
    // สร้างตารางใหม่ก่อนการกู้คืน
    await pool.query('DROP TABLE IF EXISTS pm25_data');
    await pool.query(`
      CREATE TABLE pm25_data (
        id INT AUTO_INCREMENT PRIMARY KEY,
        value FLOAT NOT NULL,
        location VARCHAR(255) NOT NULL,
        description TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ สร้างตาราง pm25_data ใหม่สำเร็จ');
    
    // กู้คืนข้อมูล PM2.5
    console.log('🔄 กำลังกู้คืนข้อมูล PM2.5...');
    
    if (backupData.data.pm25Data.length > 0) {
      // ใช้ batch insert เพื่อความเร็ว
      const batchSize = 100;
      for (let i = 0; i < backupData.data.pm25Data.length; i += batchSize) {
        const batch = backupData.data.pm25Data.slice(i, i + batchSize);
        
        // สร้าง query และ values สำหรับ batch insert
        const placeholders = batch.map(() => '(?, ?, ?, ?)').join(', ');
        const values = [];
        
        batch.forEach(item => {
          values.push(
            item.value,
            item.location,
            item.description || null,
            item.timestamp
          );
        });
        
        await pool.query(
          `INSERT INTO pm25_data (value, location, description, timestamp) VALUES ${placeholders}`,
          values
        );
      }
      
      console.log(`✅ กู้คืนข้อมูล PM2.5 จำนวน ${backupData.data.pm25Data.length} รายการสำเร็จ`);
    } else {
      console.log('ℹ️ ไม่มีข้อมูล PM2.5 ที่ต้องกู้คืน');
    }
    
    console.log('==========================================================');
    console.log('✅ การกู้คืนข้อมูลเสร็จสมบูรณ์');
    console.log('==========================================================');
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการกู้คืนข้อมูล:', error);
    process.exit(1);
  } finally {
    // ปิด connection pool
    await pool.end();
  }
}

// ตรวจสอบคำสั่งที่ต้องการทำงาน
if (require.main === module) {
  const command = process.argv[2] || 'backup';
  const argument = process.argv[3];
  
  if (command === 'backup') {
    backup();
  } else if (command === 'restore') {
    restore(argument);
  } else {
    console.error(`❌ คำสั่งไม่ถูกต้อง: ${command}`);
    console.log('คำสั่งที่รองรับ:');
    console.log('  node backup.js backup');
    console.log('  node backup.js restore [ชื่อไฟล์]');
    process.exit(1);
  }
}

module.exports = { backup, restore }; 