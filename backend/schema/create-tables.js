/**
 * ไฟล์สำหรับการสร้างตารางที่เหมาะสมสำหรับ TiDB
 * ใช้แนวทางการออกแบบที่เหมาะสมกับ TiDB เพื่อประสิทธิภาพสูงสุด
 */

const db = require('../config');
require('dotenv').config();

// SQL สำหรับสร้างตาราง admins ที่เหมาะสมสำหรับ TiDB
const CREATE_ADMINS_TABLE = `
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  role VARCHAR(20) DEFAULT 'admin',
  last_login TIMESTAMP NULL,
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE INDEX idx_username (username),
  INDEX idx_status_role (status, role)
) ENGINE=InnoDB;
`;

// SQL สำหรับสร้างตาราง pm25_data ที่เหมาะสมสำหรับ TiDB
const CREATE_PM25_TABLE = `
CREATE TABLE IF NOT EXISTS pm25_data (
  id INT AUTO_INCREMENT PRIMARY KEY,
  value FLOAT NOT NULL,
  location VARCHAR(255) NOT NULL,
  description TEXT,
  data_source VARCHAR(50) DEFAULT 'manual',
  latitude DECIMAL(10, 8) NULL,
  longitude DECIMAL(11, 8) NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INT NULL,
  
  INDEX idx_location (location),
  INDEX idx_timestamp (timestamp),
  INDEX idx_location_time (location, timestamp),
  INDEX idx_value (value)
) ENGINE=InnoDB
PARTITION BY RANGE (UNIX_TIMESTAMP(timestamp)) (
  PARTITION p_2022 VALUES LESS THAN (UNIX_TIMESTAMP('2023-01-01 00:00:00')),
  PARTITION p_2023h1 VALUES LESS THAN (UNIX_TIMESTAMP('2023-07-01 00:00:00')),
  PARTITION p_2023h2 VALUES LESS THAN (UNIX_TIMESTAMP('2024-01-01 00:00:00')),
  PARTITION p_future VALUES LESS THAN MAXVALUE
);
`;

// SQL สำหรับสร้างตาราง sensors ที่เหมาะสมสำหรับ TiDB
const CREATE_SENSORS_TABLE = `
CREATE TABLE IF NOT EXISTS sensors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  location VARCHAR(255) NOT NULL,
  description TEXT,
  api_key VARCHAR(100) NOT NULL,
  last_reading TIMESTAMP NULL,
  status ENUM('active', 'inactive', 'maintenance') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE INDEX idx_api_key (api_key),
  INDEX idx_location (location),
  INDEX idx_status (status)
) ENGINE=InnoDB;
`;

// SQL สำหรับสร้างตาราง sensor_readings ที่เหมาะสมสำหรับ TiDB
const CREATE_SENSOR_READINGS_TABLE = `
CREATE TABLE IF NOT EXISTS sensor_readings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sensor_id INT NOT NULL,
  pm25_value FLOAT NOT NULL,
  temperature FLOAT NULL,
  humidity FLOAT NULL,
  battery_level FLOAT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_sensor_id (sensor_id),
  INDEX idx_timestamp (timestamp),
  INDEX idx_sensor_time (sensor_id, timestamp)
) ENGINE=InnoDB
PARTITION BY HASH(sensor_id) PARTITIONS 4;
`;

// SQL สำหรับสร้างตาราง activity_logs ที่เหมาะสมสำหรับ TiDB
const CREATE_ACTIVITY_LOGS_TABLE = `
CREATE TABLE IF NOT EXISTS activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  action VARCHAR(100) NOT NULL,
  details TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user_id (user_id),
  INDEX idx_action (action),
  INDEX idx_timestamp (timestamp)
) ENGINE=InnoDB
PARTITION BY RANGE (UNIX_TIMESTAMP(timestamp)) (
  PARTITION p_2023q3 VALUES LESS THAN (UNIX_TIMESTAMP('2023-10-01 00:00:00')),
  PARTITION p_2023q4 VALUES LESS THAN (UNIX_TIMESTAMP('2024-01-01 00:00:00')),
  PARTITION p_2024q1 VALUES LESS THAN (UNIX_TIMESTAMP('2024-04-01 00:00:00')),
  PARTITION p_future VALUES LESS THAN MAXVALUE
);
`;

// SQL สำหรับสร้างตาราง locations ที่เหมาะสมสำหรับ TiDB
const CREATE_LOCATIONS_TABLE = `
CREATE TABLE IF NOT EXISTS locations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  region VARCHAR(100),
  province VARCHAR(100),
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE INDEX idx_name (name),
  INDEX idx_region_province (region, province),
  INDEX idx_coordinates (latitude, longitude),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB;
`;

// SQL สำหรับสร้างตาราง notifications ที่เหมาะสมสำหรับ TiDB
const CREATE_NOTIFICATIONS_TABLE = `
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user_id (user_id),
  INDEX idx_type (type),
  INDEX idx_is_read (is_read),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB;
`;

// SQL สำหรับสร้างตาราง settings ที่เหมาะสมสำหรับ TiDB
const CREATE_SETTINGS_TABLE = `
CREATE TABLE IF NOT EXISTS settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL,
  setting_value TEXT NOT NULL,
  description TEXT,
  is_public TINYINT(1) DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE INDEX idx_setting_key (setting_key),
  INDEX idx_is_public (is_public)
) ENGINE=InnoDB;
`;

// SQL statements
const SQL_STATEMENTS = [
  CREATE_ADMINS_TABLE,
  CREATE_PM25_TABLE,
  CREATE_SENSORS_TABLE,
  CREATE_SENSOR_READINGS_TABLE,
  CREATE_ACTIVITY_LOGS_TABLE,
  CREATE_LOCATIONS_TABLE,
  CREATE_NOTIFICATIONS_TABLE,
  CREATE_SETTINGS_TABLE
];

// ฟังก์ชันหลักสำหรับสร้างตาราง
async function createTables() {
  console.log('==========================================================');
  console.log('🔧 เริ่มต้นการสร้างตารางที่เหมาะสมสำหรับ TiDB');
  console.log('==========================================================');
  
  // สร้าง connection pool
  const pool = db.createPool();
  
  try {
    // ตรวจสอบการเชื่อมต่อ
    if (!(await db.healthCheck(pool))) {
      console.error('❌ ไม่สามารถเชื่อมต่อกับ TiDB ได้');
      process.exit(1);
    }
    
    // สร้างตารางตาม SQL statements
    for (const [index, sql] of SQL_STATEMENTS.entries()) {
      console.log(`🔧 กำลังสร้างตารางที่ ${index + 1}/${SQL_STATEMENTS.length}...`);
      try {
        await pool.query(sql);
        // ดึงชื่อตารางจาก SQL
        const tableName = sql.match(/CREATE TABLE IF NOT EXISTS (\w+)/)[1];
        console.log(`✅ สร้างตาราง ${tableName} สำเร็จ`);
      } catch (error) {
        console.error('❌ เกิดข้อผิดพลาดในการสร้างตาราง:', error);
      }
    }
    
    // สร้างข้อมูลเริ่มต้น
    await createInitialData(pool);
    
    console.log('==========================================================');
    console.log('✅ การสร้างตารางเสร็จสมบูรณ์');
    console.log('==========================================================');
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการสร้างตาราง:', error);
    process.exit(1);
  } finally {
    // ปิด connection pool
    await pool.end();
  }
}

// สร้างข้อมูลเริ่มต้น
async function createInitialData(pool) {
  console.log('🔧 กำลังสร้างข้อมูลเริ่มต้น...');
  
  try {
    // สร้าง admin เริ่มต้น
    const bcrypt = require('bcryptjs');
    const [admins] = await pool.query('SELECT * FROM admins');
    
    if (admins.length === 0) {
      // ถ้าไม่มี admin ให้สร้าง admin เริ่มต้น
      const hashedPassword = await bcrypt.hash('123456', 10);
      await pool.query(
        'INSERT INTO admins (username, password, email, role) VALUES (?, ?, ?, ?)',
        ['admin', hashedPassword, 'admin@puffless.local', 'superadmin']
      );
      console.log('✅ สร้าง admin เริ่มต้นสำเร็จ (username: admin, password: 123456)');
    }
    
    // สร้างข้อมูลการตั้งค่าเริ่มต้น
    const [settings] = await pool.query('SELECT * FROM settings');
    
    if (settings.length === 0) {
      // สร้างการตั้งค่าเริ่มต้น
      const defaultSettings = [
        ['app_name', 'PuffLess', 'ชื่อของแอพพลิเคชัน', 1],
        ['danger_threshold', '150', 'ค่า PM2.5 ที่ถือว่าอันตราย', 1],
        ['warning_threshold', '50', 'ค่า PM2.5 ที่ถือว่าควรระวัง', 1],
        ['refresh_interval', '300', 'ระยะเวลาในการรีเฟรชข้อมูล (วินาที)', 1],
        ['maintenance_mode', '0', 'โหมดบำรุงรักษาระบบ', 0],
        ['api_key', Math.random().toString(36).substring(2, 15), 'API Key สำหรับเรียกใช้งาน API', 0]
      ];
      
      for (const [key, value, description, isPublic] of defaultSettings) {
        await pool.query(
          'INSERT INTO settings (setting_key, setting_value, description, is_public) VALUES (?, ?, ?, ?)',
          [key, value, description, isPublic]
        );
      }
      
      console.log('✅ สร้างการตั้งค่าเริ่มต้นสำเร็จ');
    }
    
    // สร้างข้อมูลตำแหน่งเริ่มต้น
    const [locations] = await pool.query('SELECT * FROM locations');
    
    if (locations.length === 0) {
      // สร้างตำแหน่งเริ่มต้น
      const defaultLocations = [
        ['กรุงเทพมหานคร', 'เมืองหลวงของประเทศไทย', 'ภาคกลาง', 'กรุงเทพมหานคร', 13.7563, 100.5018],
        ['เชียงใหม่', 'เมืองท่องเที่ยวทางภาคเหนือ', 'ภาคเหนือ', 'เชียงใหม่', 18.7883, 98.9853],
        ['ภูเก็ต', 'เกาะท่องเที่ยวทางภาคใต้', 'ภาคใต้', 'ภูเก็ต', 7.9519, 98.3381],
        ['ขอนแก่น', 'ศูนย์กลางภาคตะวันออกเฉียงเหนือ', 'ภาคตะวันออกเฉียงเหนือ', 'ขอนแก่น', 16.4419, 102.8360]
      ];
      
      for (const [name, description, region, province, latitude, longitude] of defaultLocations) {
        await pool.query(
          'INSERT INTO locations (name, description, region, province, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?)',
          [name, description, region, province, latitude, longitude]
        );
      }
      
      console.log('✅ สร้างข้อมูลตำแหน่งเริ่มต้นสำเร็จ');
    }
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการสร้างข้อมูลเริ่มต้น:', error);
  }
}

// เรียกใช้ฟังก์ชันหลักเมื่อรันไฟล์โดยตรง
if (require.main === module) {
  createTables();
}

module.exports = {
  createTables,
  SQL_STATEMENTS
}; 