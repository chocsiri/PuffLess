/**
 * ไฟล์สำหรับการ Migration ข้อมูลและปรับโครงสร้างตาราง
 * ใช้สำหรับการอัพเกรดระบบและปรับปรุงโครงสร้างฐานข้อมูล
 */

const db = require('./config');
require('dotenv').config();

// เวอร์ชันปัจจุบันของฐานข้อมูล (ใช้เพื่อติดตามการเปลี่ยนแปลง)
const CURRENT_VERSION = 1;

// ฟังก์ชันหลักสำหรับการทำ migration
async function migrate() {
  console.log('==========================================================');
  console.log('🚀 เริ่มต้นการ Migration ฐานข้อมูล TiDB');
  console.log('==========================================================');
  
  // สร้าง connection pool
  const pool = db.createPool();
  
  try {
    // ตรวจสอบการเชื่อมต่อ
    if (!(await db.testConnection(pool))) {
      console.error('❌ ไม่สามารถเชื่อมต่อกับ TiDB ได้');
      process.exit(1);
    }
    
    // สร้างตาราง migrations ถ้ายังไม่มี
    await createMigrationsTable(pool);
    
    // ตรวจสอบเวอร์ชันปัจจุบัน
    const currentVersion = await getCurrentVersion(pool);
    console.log(`ℹ️ เวอร์ชันปัจจุบันของฐานข้อมูล: ${currentVersion}`);
    
    // ทำการ migration ตามเวอร์ชัน
    if (currentVersion < CURRENT_VERSION) {
      for (let version = currentVersion + 1; version <= CURRENT_VERSION; version++) {
        console.log(`🔄 กำลังทำ migration ไปเวอร์ชัน ${version}...`);
        await migrateToVersion(pool, version);
        await updateVersion(pool, version);
        console.log(`✅ อัพเกรดไปเวอร์ชัน ${version} สำเร็จ`);
      }
    } else {
      console.log('✅ ฐานข้อมูลเป็นเวอร์ชันล่าสุดแล้ว ไม่จำเป็นต้องทำ migration');
    }
    
    console.log('==========================================================');
    console.log('✅ การ Migration เสร็จสมบูรณ์');
    console.log('==========================================================');
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการทำ migration:', error);
    process.exit(1);
  } finally {
    // ปิด connection pool
    await pool.end();
  }
}

// สร้างตาราง migrations
async function createMigrationsTable(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      version INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

// ดึงเวอร์ชันปัจจุบันของฐานข้อมูล
async function getCurrentVersion(pool) {
  const [rows] = await pool.query('SELECT MAX(version) as version FROM migrations');
  return rows[0].version || 0;
}

// อัพเดทเวอร์ชันของฐานข้อมูล
async function updateVersion(pool, version) {
  await pool.query('INSERT INTO migrations (version) VALUES (?)', [version]);
}

// ทำการ migration ตามเวอร์ชัน
async function migrateToVersion(pool, version) {
  switch (version) {
    case 1:
      // ตัวอย่างการ migration เวอร์ชัน 1: เพิ่มคอลัมน์ใหม่ในตาราง
      await migration_v1(pool);
      break;
    // เพิ่มเคสสำหรับเวอร์ชันอื่นๆ ในอนาคต
    // case 2:
    //   await migration_v2(pool);
    //   break;
    default:
      console.warn(`⚠️ ไม่พบการ migration สำหรับเวอร์ชัน ${version}`);
  }
}

// Migration เวอร์ชัน 1: เพิ่มคอลัมน์และปรับปรุงโครงสร้างตาราง
async function migration_v1(pool) {
  // ใช้ transaction เพื่อให้มั่นใจว่าการเปลี่ยนแปลงทั้งหมดสำเร็จหรือล้มเหลวพร้อมกัน
  await db.withTransaction(pool, async (connection) => {
    // 1. เพิ่มคอลัมน์ `role` ในตาราง admins
    try {
      await connection.query(`
        ALTER TABLE admins ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'admin'
      `);
      console.log('✅ เพิ่มคอลัมน์ role ในตาราง admins สำเร็จ');
    } catch (error) {
      console.error('❌ เกิดข้อผิดพลาดในการเพิ่มคอลัมน์ role:', error);
      throw error;
    }
    
    // 2. เพิ่มคอลัมน์ `description` ในตาราง pm25_data
    try {
      await connection.query(`
        ALTER TABLE pm25_data ADD COLUMN IF NOT EXISTS description TEXT
      `);
      console.log('✅ เพิ่มคอลัมน์ description ในตาราง pm25_data สำเร็จ');
    } catch (error) {
      console.error('❌ เกิดข้อผิดพลาดในการเพิ่มคอลัมน์ description:', error);
      throw error;
    }
    
    // 3. สร้างดัชนี (index) เพื่อเพิ่มประสิทธิภาพการค้นหา
    try {
      await connection.query(`
        CREATE INDEX IF NOT EXISTS idx_pm25_location ON pm25_data (location)
      `);
      console.log('✅ สร้างดัชนีสำหรับคอลัมน์ location ในตาราง pm25_data สำเร็จ');
    } catch (error) {
      console.error('❌ เกิดข้อผิดพลาดในการสร้างดัชนี:', error);
      throw error;
    }
  });
}

// รันฟังก์ชันหลัก
if (require.main === module) {
  migrate();
}

module.exports = { migrate }; 