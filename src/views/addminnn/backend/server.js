const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./config');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = db.createPool();

// Middleware ตรวจสอบ Token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบ' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token ไม่ถูกต้อง' });
    }
    req.user = user;
    next();
  });
};

// API สำหรับ Login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const [users] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);

    if (users.length === 0) {
      return res.status(401).json({ error: 'ไม่พบผู้ใช้งาน' });
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'รหัสผ่านไม่ถูกต้อง' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการเข้าสู่ระบบ:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' });
  }
});

// API บันทึกข้อมูลคุณภาพอากาศ
app.post('/api/air-quality', authenticateToken, async (req, res) => {
  try {
    const { location, pm25_value, temperature, humidity } = req.body;
    
    await db.withTransaction(pool, async (conn) => {
      // บันทึกข้อมูล location ถ้ายังไม่มี
      await conn.query(
        'INSERT IGNORE INTO locations (name) VALUES (?)',
        [location]
      );

      // ดึง location_id
      const [locations] = await conn.query(
        'SELECT id FROM locations WHERE name = ?',
        [location]
      );
      const location_id = locations[0].id;

      // บันทึกข้อมูลคุณภาพอากาศ
      await conn.query(
        'INSERT INTO air_quality_data (location, pm25_value, temperature, humidity) VALUES (?, ?, ?, ?)',
        [location, pm25_value, temperature, humidity]
      );

      // ตรวจสอบและสร้าง alert ถ้า PM2.5 สูงเกินไป
      if (pm25_value > 50) {
        await conn.query(
          'INSERT INTO alerts (location_id, alert_type, message, severity) VALUES (?, ?, ?, ?)',
          [location_id, 'high_pm25', `ค่า PM2.5 สูงเกินมาตรฐาน (${pm25_value})`, 'high']
        );
      }
    });

    res.json({ message: 'บันทึกข้อมูลสำเร็จ' });
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' });
  }
});

// API ดึงข้อมูลคุณภาพอากาศ
app.get('/api/air-quality', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const location = req.query.location;

    let query = 'SELECT * FROM air_quality_data';
    let params = [];

    if (location) {
      query += ' WHERE location = ?';
      params.push(location);
    }

    query += ' ORDER BY timestamp DESC';

    const result = await db.fetchWithPagination(pool, query, params, page, limit);
    res.json(result);
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการดึงข้อมูล:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
  }
});

// API ดึงข้อมูล alerts
app.get('/api/alerts', authenticateToken, async (req, res) => {
  try {
    const [alerts] = await pool.query(
      `SELECT a.*, l.name as location_name 
       FROM alerts a 
       JOIN locations l ON a.location_id = l.id 
       WHERE is_active = true 
       ORDER BY created_at DESC`
    );
    res.json(alerts);
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการดึงข้อมูล alerts:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล alerts' });
  }
});

// API health check
app.get('/health', async (req, res) => {
  try {
    await db.testConnection();
    res.json({ status: 'ok', message: 'ระบบทำงานปกติ' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'ไม่สามารถเชื่อมต่อกับฐานข้อมูลได้' });
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`เซิร์ฟเวอร์ทำงานที่พอร์ต ${PORT}`);
}); 