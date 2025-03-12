/**
 * ไฟล์สำหรับการจัดการ Monitoring และ Logging
 * ช่วยในการตรวจสอบประสิทธิภาพและปัญหาของ TiDB
 */

const fs = require('fs');
const path = require('path');
const db = require('./config');
const { promisify } = require('util');
require('dotenv').config();

// โฟลเดอร์สำหรับเก็บไฟล์ล็อก
const LOG_DIR = path.join(__dirname, 'logs');

// ตรวจสอบว่ามีโฟลเดอร์สำหรับเก็บล็อกหรือไม่
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// ฟังก์ชัน write ไฟล์แบบ async
const writeFileAsync = promisify(fs.writeFile);
const appendFileAsync = promisify(fs.appendFile);

// ฟังก์ชันสำหรับเก็บล็อก
async function logToFile(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] [${type.toUpperCase()}] ${message}\n`;
  
  // สร้างชื่อไฟล์ตามวันที่
  const dateStr = new Date().toISOString().split('T')[0];
  const logFileName = `${dateStr}.log`;
  const logFilePath = path.join(LOG_DIR, logFileName);
  
  try {
    await appendFileAsync(logFilePath, logLine);
  } catch (error) {
    console.error('ไม่สามารถเขียนล็อกได้:', error);
  }
}

// ฟังก์ชันสำหรับเก็บสถิติการใช้งาน DB
async function collectDBStats() {
  const pool = db.createPool();
  
  try {
    const connection = await pool.getConnection();
    
    // ดึงข้อมูลสถิติจากฐานข้อมูล
    console.log('🔄 กำลังเก็บสถิติจากฐานข้อมูล...');
    
    // 1. ข้อมูลสถานะของเซิร์ฟเวอร์
    const [statusRows] = await connection.query('SHOW STATUS');
    const statusMap = statusRows.reduce((map, row) => {
      map[row.Variable_name] = row.Value;
      return map;
    }, {});
    
    // 2. ข้อมูลจำนวนรายการในแต่ละตาราง
    const [adminCount] = await connection.query('SELECT COUNT(*) as count FROM admins');
    const [pm25Count] = await connection.query('SELECT COUNT(*) as count FROM pm25_data');
    
    // รวบรวมข้อมูลสถิติทั้งหมด
    const stats = {
      timestamp: new Date().toISOString(),
      connections: {
        active: parseInt(statusMap.Threads_connected || 0),
        max: parseInt(statusMap.Connections || 0),
        aborted: parseInt(statusMap.Aborted_connects || 0)
      },
      queries: {
        slow: parseInt(statusMap.Slow_queries || 0),
        total: parseInt(statusMap.Queries || 0)
      },
      records: {
        admins: adminCount[0].count,
        pm25Data: pm25Count[0].count
      },
      uptime: parseInt(statusMap.Uptime || 0)
    };
    
    // บันทึกข้อมูลสถิติลงไฟล์
    const statsFileName = `db-stats-${new Date().toISOString().split('T')[0]}.json`;
    const statsFilePath = path.join(LOG_DIR, statsFileName);
    
    // อ่านไฟล์เดิมถ้ามี
    let existingStats = [];
    if (fs.existsSync(statsFilePath)) {
      try {
        existingStats = JSON.parse(fs.readFileSync(statsFilePath, 'utf8'));
      } catch (error) {
        console.error('ไม่สามารถอ่านไฟล์สถิติเดิมได้:', error);
      }
    }
    
    // เพิ่มข้อมูลใหม่
    existingStats.push(stats);
    
    // บันทึกไฟล์
    await writeFileAsync(statsFilePath, JSON.stringify(existingStats, null, 2));
    
    console.log(`✅ บันทึกสถิติลงในไฟล์ ${statsFilePath} สำเร็จ`);
    
    // ล็อกข้อมูลสำคัญ
    await logToFile(
      `DB Stats: Connections=${stats.connections.active}, Queries=${stats.queries.total}, Records: Admins=${stats.records.admins}, PM25=${stats.records.pm25Data}`,
      'stats'
    );
    
    connection.release();
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการเก็บสถิติ:', error);
    await logToFile(`เกิดข้อผิดพลาดในการเก็บสถิติ: ${error.message}`, 'error');
  } finally {
    // ปิด connection pool
    await pool.end();
  }
}

// ฟังก์ชันสำหรับตรวจสอบประสิทธิภาพและความผิดปกติ
async function checkPerformance() {
  const pool = db.createPool();
  
  try {
    const connection = await pool.getConnection();
    
    console.log('🔄 กำลังตรวจสอบประสิทธิภาพของฐานข้อมูล...');
    
    // 1. ตรวจสอบประสิทธิภาพการอ่านข้อมูล
    console.time('Read Performance');
    await connection.query('SELECT * FROM pm25_data LIMIT 1000');
    console.timeEnd('Read Performance');
    
    // 2. ตรวจสอบประสิทธิภาพการเขียนข้อมูล
    console.time('Write Performance');
    await connection.query(
      'INSERT INTO pm25_data (value, location) VALUES (?, ?)',
      [Math.random() * 100, 'Performance Test']
    );
    console.timeEnd('Write Performance');
    
    // 3. ตรวจสอบคิวรี่ที่ใช้เวลานาน
    const [slowQueries] = await connection.query('SHOW PROCESSLIST');
    const longRunningQueries = slowQueries.filter(q => q.Time > 5);
    
    if (longRunningQueries.length > 0) {
      console.warn(`⚠️ พบคิวรี่ที่ทำงานนานเกินไป ${longRunningQueries.length} รายการ`);
      await logToFile(`พบคิวรี่ที่ทำงานนานเกินไป ${longRunningQueries.length} รายการ`, 'warning');
    }
    
    // 4. ตรวจสอบจำนวนการเชื่อมต่อ
    const [connectionStatus] = await connection.query('SHOW STATUS LIKE "Threads_connected"');
    const activeConnections = parseInt(connectionStatus[0].Value);
    
    if (activeConnections > 50) {
      console.warn(`⚠️ จำนวนการเชื่อมต่อสูง: ${activeConnections}`);
      await logToFile(`จำนวนการเชื่อมต่อสูง: ${activeConnections}`, 'warning');
    }
    
    console.log('✅ ตรวจสอบประสิทธิภาพเสร็จสิ้น');
    
    connection.release();
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการตรวจสอบประสิทธิภาพ:', error);
    await logToFile(`เกิดข้อผิดพลาดในการตรวจสอบประสิทธิภาพ: ${error.message}`, 'error');
  } finally {
    // ปิด connection pool
    await pool.end();
  }
}

// ตรวจสอบคำสั่งที่ต้องการทำงาน
if (require.main === module) {
  const command = process.argv[2] || 'stats';
  
  if (command === 'stats') {
    collectDBStats();
  } else if (command === 'performance') {
    checkPerformance();
  } else if (command === 'log') {
    const message = process.argv[3] || 'Manual log entry';
    const type = process.argv[4] || 'info';
    logToFile(message, type);
  } else {
    console.error(`❌ คำสั่งไม่ถูกต้อง: ${command}`);
    console.log('คำสั่งที่รองรับ:');
    console.log('  node monitoring.js stats');
    console.log('  node monitoring.js performance');
    console.log('  node monitoring.js log [ข้อความ] [ประเภท]');
    process.exit(1);
  }
}

module.exports = {
  logToFile,
  collectDBStats,
  checkPerformance
}; 