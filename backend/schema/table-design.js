/**
 * คำแนะนำสำหรับการออกแบบและจัดการตารางใน TiDB
 * ใช้เป็นแนวทางในการปรับปรุงและพัฒนาโครงสร้างตาราง
 */

const db = require('../config');

/**
 * ตัวอย่างการออกแบบตารางที่มีประสิทธิภาพสำหรับ TiDB
 * คำแนะนำเหล่านี้จะช่วยปรับปรุงประสิทธิภาพและการทำงานของ TiDB
 */

/**
 * 1. Primary Key ควรเป็น Clustered Index 
 * TiDB จัดเก็บข้อมูลตาม Primary Key ของตาราง ดังนั้นควรเลือก Primary Key ที่เหมาะสม
 * - ควรใช้ค่าที่เพิ่มขึ้นเรื่อยๆ เช่น AUTO_INCREMENT 
 * - หลีกเลี่ยง UUID เป็น Primary Key
 * - ไม่ควรใช้คอลัมน์ที่มีการอัพเดทบ่อยเป็น Primary Key
 */
const PRIMARY_KEY_BEST_PRACTICES = `
-- รูปแบบที่แนะนำ:
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- หลีกเลี่ยงการใช้ UUID เป็น Primary Key โดยตรง:
-- ไม่แนะนำ: 
-- CREATE TABLE events (
--   id CHAR(36) PRIMARY KEY,
--   event_name VARCHAR(255) NOT NULL,
--   event_data JSON
-- );

-- แนะนำให้ใช้เป็น Secondary Index แทน:
CREATE TABLE events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  uuid CHAR(36) UNIQUE NOT NULL,
  event_name VARCHAR(255) NOT NULL,
  event_data JSON
);
`;

/**
 * 2. การจัดการ Indexes
 * - ควรสร้างดัชนีสำหรับคอลัมน์ที่ใช้ในการค้นหาบ่อย
 * - TiDB รองรับ Composite Indexes เพื่อเพิ่มประสิทธิภาพ
 * - ควรสร้างดัชนีเฉพาะที่จำเป็น เพราะมีผลต่อการเขียนข้อมูล
 */
const INDEXING_BEST_PRACTICES = `
-- สร้างดัชนีสำหรับคอลัมน์ที่ใช้ค้นหาบ่อย:
CREATE INDEX idx_pm25_location ON pm25_data (location);

-- Composite Index สำหรับการค้นหาหลายเงื่อนไข:
CREATE INDEX idx_pm25_loc_time ON pm25_data (location, timestamp);

-- เลือกใช้ดัชนีที่ครอบคลุมการค้นหา (Covering Index):
CREATE INDEX idx_pm25_search ON pm25_data (location, timestamp, value);
`;

/**
 * 3. การใช้ Partitioning
 * - TiDB รองรับ Range Partitioning และ Hash Partitioning
 * - Partitioning ช่วยในการจัดการข้อมูลขนาดใหญ่และปรับปรุงประสิทธิภาพ
 */
const PARTITIONING_EXAMPLES = `
-- ตัวอย่างการทำ Range Partitioning ตามช่วงเวลา:
CREATE TABLE pm25_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  value FLOAT NOT NULL,
  location VARCHAR(255) NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  description TEXT
)
PARTITION BY RANGE (UNIX_TIMESTAMP(timestamp)) (
  PARTITION p2022 VALUES LESS THAN (UNIX_TIMESTAMP('2023-01-01 00:00:00')),
  PARTITION p2023 VALUES LESS THAN (UNIX_TIMESTAMP('2024-01-01 00:00:00')),
  PARTITION future VALUES LESS THAN MAXVALUE
);

-- ตัวอย่างการทำ Hash Partitioning สำหรับการกระจายข้อมูล:
CREATE TABLE sensor_data (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sensor_id INT NOT NULL,
  value FLOAT NOT NULL,
  timestamp TIMESTAMP NOT NULL
)
PARTITION BY HASH(sensor_id) PARTITIONS 4;
`;

/**
 * 4. การเลือกชนิดข้อมูล (Data Types)
 * - เลือกชนิดข้อมูลที่เหมาะสมเพื่อประหยัดพื้นที่และเพิ่มประสิทธิภาพ
 * - ใช้ชนิดข้อมูลเลขจำนวนเต็มเมื่อเป็นไปได้
 * - ระบุขนาดคอลัมน์ VARCHAR ให้เหมาะสม
 */
const DATA_TYPE_RECOMMENDATIONS = `
-- การเลือกชนิดข้อมูลที่เหมาะสม:
CREATE TABLE optimized_data (
  -- ใช้ INT แทน BIGINT เมื่อไม่จำเป็น
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- กำหนดขนาด VARCHAR ให้เหมาะสม
  title VARCHAR(100) NOT NULL,
  
  -- ใช้ TINYINT(1) สำหรับข้อมูล Boolean
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  
  -- ใช้ DECIMAL สำหรับค่าเงินแทน FLOAT
  price DECIMAL(10,2) NOT NULL,
  
  -- ใช้ TIMESTAMP แทน DATETIME เมื่อเป็นไปได้
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- ใช้ TEXT เมื่อความยาวไม่แน่นอน
  description TEXT
);
`;

/**
 * 5. การจัดการ Foreign Keys
 * - TiDB รองรับ Foreign Keys แต่มีข้อจำกัดบางประการ
 * - ใช้ Foreign Keys เมื่อจำเป็น แต่พิจารณาผลกระทบต่อประสิทธิภาพ
 */
const FOREIGN_KEY_HANDLING = `
-- ตัวอย่างการใช้ Foreign Keys:
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category_id INT NOT NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- ข้อควรระวัง: Foreign Keys มีผลต่อประสิทธิภาพการเขียนข้อมูล
-- พิจารณาการตรวจสอบความสัมพันธ์ในระดับแอพพลิเคชันแทน
`;

/**
 * 6. การจัดการกับตารางขนาดใหญ่
 * - TiDB เหมาะกับข้อมูลขนาดใหญ่ แต่ต้องมีการจัดการที่ดี
 * - ใช้เทคนิค Sharding, Partitioning, และ Archive Data 
 */
const LARGE_TABLE_MANAGEMENT = `
-- การแบ่งข้อมูลเก่าไปเก็บในตารางแยกต่างหาก (Archiving):
CREATE TABLE pm25_archive AS
SELECT * FROM pm25_data WHERE timestamp < DATE_SUB(NOW(), INTERVAL 1 YEAR);

-- จากนั้นลบข้อมูลเก่าออกจากตารางหลัก:
DELETE FROM pm25_data WHERE timestamp < DATE_SUB(NOW(), INTERVAL 1 YEAR);

-- สร้างมุมมอง (VIEW) เพื่อให้สามารถเข้าถึงข้อมูลทั้งหมดได้:
CREATE VIEW pm25_all AS
SELECT * FROM pm25_data
UNION ALL
SELECT * FROM pm25_archive;
`;

/**
 * 7. การปรับแต่งตารางที่มีอยู่
 * คำแนะนำในการปรับแต่งตารางปัจจุบันของระบบ PuffLess
 */
const OPTIMIZE_EXISTING_TABLES = `
-- ปรับปรุงตาราง admins โดยการเพิ่มดัชนีและปรับปรุงคอลัมน์:
ALTER TABLE admins
  ADD COLUMN last_login TIMESTAMP NULL,
  ADD COLUMN status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  ADD INDEX idx_username_status (username, status);

-- ปรับปรุงตาราง pm25_data โดยการเพิ่มดัชนีและการแบ่งพาร์ทิชัน:
ALTER TABLE pm25_data
  ADD INDEX idx_location_time (location, timestamp),
  ADD COLUMN data_source VARCHAR(50) DEFAULT 'manual';

-- เพิ่มตารางใหม่สำหรับการบันทึกประวัติการใช้งาน:
CREATE TABLE activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  action VARCHAR(100) NOT NULL,
  details TEXT,
  ip_address VARCHAR(45),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_action (user_id, action),
  INDEX idx_timestamp (timestamp)
);
`;

// Export คำแนะนำและตัวอย่างต่างๆ สำหรับใช้ในการออกแบบตาราง
module.exports = {
  PRIMARY_KEY_BEST_PRACTICES,
  INDEXING_BEST_PRACTICES,
  PARTITIONING_EXAMPLES,
  DATA_TYPE_RECOMMENDATIONS,
  FOREIGN_KEY_HANDLING,
  LARGE_TABLE_MANAGEMENT,
  OPTIMIZE_EXISTING_TABLES,
  
  // ฟังก์ชันสำหรับการตรวจสอบและปรับปรุงตาราง
  async analyzeTable(pool, tableName) {
    try {
      console.log(`🔍 กำลังวิเคราะห์ตาราง ${tableName}...`);
      
      // ดึงข้อมูลโครงสร้างตาราง
      const [columns] = await pool.query(`SHOW COLUMNS FROM ${tableName}`);
      const [indices] = await pool.query(`SHOW INDEX FROM ${tableName}`);
      
      // ตรวจสอบ Primary Key
      const primaryKey = columns.find(col => col.Key === 'PRI');
      console.log(`- Primary Key: ${primaryKey ? primaryKey.Field : 'ไม่มี'}`);
      
      // ตรวจสอบดัชนี
      const indexCount = new Set(indices.map(idx => idx.Key_name)).size;
      console.log(`- จำนวนดัชนี: ${indexCount}`);
      
      // ตรวจสอบจำนวนข้อมูล
      const [count] = await pool.query(`SELECT COUNT(*) as count FROM ${tableName}`);
      console.log(`- จำนวนข้อมูล: ${count[0].count} รายการ`);
      
      // ตรวจสอบขนาดข้อมูล
      const [size] = await pool.query(`
        SELECT
          table_name AS 'Table',
          round(((data_length + index_length) / 1024 / 1024), 2) 'Size (MB)'
        FROM information_schema.TABLES
        WHERE table_schema = DATABASE()
        AND table_name = '${tableName}'
      `);
      
      if (size.length > 0) {
        console.log(`- ขนาดข้อมูล: ${size[0]['Size (MB)']} MB`);
      }
      
      // คำแนะนำ
      let recommendations = [];
      
      // ตรวจสอบ Primary Key
      if (!primaryKey) {
        recommendations.push('- ควรเพิ่ม Primary Key ให้กับตาราง');
      } else if (primaryKey.Type.includes('varchar') || primaryKey.Type.includes('char')) {
        recommendations.push('- ควรใช้ INT AUTO_INCREMENT เป็น Primary Key แทนการใช้ข้อความ');
      }
      
      // ตรวจสอบดัชนี
      if (indexCount === 0) {
        recommendations.push('- ควรพิจารณาการเพิ่มดัชนีสำหรับคอลัมน์ที่ใช้ในการค้นหาบ่อย');
      } else if (indexCount > 5) {
        recommendations.push('- มีดัชนีจำนวนมาก ควรตรวจสอบว่าจำเป็นต้องใช้ทั้งหมดหรือไม่');
      }
      
      // ตรวจสอบขนาดข้อมูล
      if (size.length > 0 && size[0]['Size (MB)'] > 100) {
        recommendations.push('- ข้อมูลมีขนาดใหญ่ ควรพิจารณาการแบ่งพาร์ทิชันหรือการจัดเก็บข้อมูลเก่า');
      }
      
      if (recommendations.length > 0) {
        console.log('\nคำแนะนำในการปรับปรุง:');
        recommendations.forEach(rec => console.log(rec));
      } else {
        console.log('\n✅ ตารางมีการออกแบบที่ดีแล้ว ไม่มีคำแนะนำเพิ่มเติม');
      }
      
      return {
        tableName,
        primaryKey: primaryKey ? primaryKey.Field : null,
        indexCount,
        recordCount: count[0].count,
        sizeInMB: size.length > 0 ? size[0]['Size (MB)'] : null,
        recommendations
      };
    } catch (error) {
      console.error(`❌ เกิดข้อผิดพลาดในการวิเคราะห์ตาราง ${tableName}:`, error);
      return {
        tableName,
        error: error.message
      };
    }
  }
}; 