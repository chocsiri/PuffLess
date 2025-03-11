const db = require('../config');
require('dotenv').config();

async function createTables() {
  const pool = db.createPool();
  
  try {
    console.log('เริ่มสร้างตาราง...');

    // สร้างตาราง users
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'user') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        KEY idx_username (username),
        KEY idx_role (role)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('สร้างตาราง users สำเร็จ');

    // สร้างตาราง air_quality_data
    await pool.query(`
      CREATE TABLE IF NOT EXISTS air_quality_data (
        id INT AUTO_INCREMENT PRIMARY KEY,
        location VARCHAR(100) NOT NULL,
        pm25_value DECIMAL(10,2) NOT NULL,
        temperature DECIMAL(5,2),
        humidity DECIMAL(5,2),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        data_source VARCHAR(50),
        KEY idx_location (location),
        KEY idx_timestamp (timestamp),
        KEY idx_pm25_value (pm25_value)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      PARTITION BY RANGE (UNIX_TIMESTAMP(timestamp)) (
        PARTITION p_2024_01 VALUES LESS THAN (UNIX_TIMESTAMP('2024-02-01 00:00:00')),
        PARTITION p_2024_02 VALUES LESS THAN (UNIX_TIMESTAMP('2024-03-01 00:00:00')),
        PARTITION p_2024_03 VALUES LESS THAN (UNIX_TIMESTAMP('2024-04-01 00:00:00')),
        PARTITION p_max VALUES LESS THAN MAXVALUE
      )
    `);
    console.log('สร้างตาราง air_quality_data สำเร็จ');

    // สร้างตาราง locations
    await pool.query(`
      CREATE TABLE IF NOT EXISTS locations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        latitude DECIMAL(10,8),
        longitude DECIMAL(11,8),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        KEY idx_name (name),
        SPATIAL KEY idx_location (POINT(latitude, longitude))
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('สร้างตาราง locations สำเร็จ');

    // สร้างตาราง alerts
    await pool.query(`
      CREATE TABLE IF NOT EXISTS alerts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        location_id INT NOT NULL,
        alert_type ENUM('high_pm25', 'system_error', 'maintenance') NOT NULL,
        message TEXT NOT NULL,
        severity ENUM('low', 'medium', 'high') NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        resolved_at TIMESTAMP NULL,
        FOREIGN KEY (location_id) REFERENCES locations(id),
        KEY idx_alert_type (alert_type),
        KEY idx_is_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('สร้างตาราง alerts สำเร็จ');

    // เพิ่มข้อมูล admin เริ่มต้น
    await pool.query(`
      INSERT IGNORE INTO users (username, password, role) 
      VALUES ('admin', '$2b$10$rE5VH.kXyYJJsZsQ5tVEYOyTV3bFvtXJ8PWkQCCF8mMPiZjHXHWx.', 'admin')
    `);
    console.log('เพิ่มข้อมูล admin เริ่มต้นสำเร็จ');

    console.log('สร้างตารางทั้งหมดสำเร็จ!');
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการสร้างตาราง:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// รันฟังก์ชันถ้าเรียกไฟล์นี้โดยตรง
if (require.main === module) {
  createTables().catch(console.error);
}

module.exports = createTables; 