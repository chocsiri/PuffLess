const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./config');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// สร้าง connection pool
const pool = db.createPool();

// ทดสอบการเชื่อมต่อกับ TiDB
db.testConnection(pool).then(success => {
  if (!success) {
    console.warn('⚠️ เริ่มต้นเซิร์ฟเวอร์แม้ว่าการเชื่อมต่อกับ TiDB จะล้มเหลว');
  }
});

// Middleware สำหรับตรวจสอบ token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token is required' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET || 'default_secret_key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// Health check API
app.get('/health', async (req, res) => {
  const dbStatus = await db.healthCheck(pool);
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    database: dbStatus ? 'connected' : 'disconnected'
  });
});

// Login API
app.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    // ตรวจสอบการเชื่อมต่อกับฐานข้อมูล
    if (!(await db.healthCheck(pool))) {
      return res.status(503).json({ error: 'Database is currently unavailable' });
    }
    
    const [rows] = await pool.query(
      'SELECT * FROM admins WHERE username = ?',
      [username]
    );
    
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const admin = rows[0];
    const isValidPassword = await bcrypt.compare(password, admin.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // สร้าง token
    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      process.env.JWT_SECRET || 'default_secret_key',
      { expiresIn: '2h' }
    );
    
    res.json({ 
      token,
      user: {
        id: admin.id,
        username: admin.username
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Register admin API
app.post('/admin/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    // ตรวจสอบการเชื่อมต่อกับฐานข้อมูล
    if (!(await db.healthCheck(pool))) {
      return res.status(503).json({ error: 'Database is currently unavailable' });
    }
    
    // ตรวจสอบว่ามี username นี้อยู่แล้วหรือไม่
    const [existingUsers] = await pool.query(
      'SELECT * FROM admins WHERE username = ?',
      [username]
    );
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    
    // เข้ารหัสรหัสผ่าน
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // บันทึกข้อมูล admin ใหม่
    await pool.query(
      'INSERT INTO admins (username, password) VALUES (?, ?)',
      [username, hashedPassword]
    );
    
    res.status(201).json({
      status: 'success',
      message: 'Admin registered successfully',
      username
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add PM2.5 data API
app.post('/admin/pm25', authenticateToken, async (req, res) => {
  try {
    const { value, location } = req.body;
    
    if (!value || !location) {
      return res.status(400).json({ error: 'Value and location are required' });
    }
    
    // ตรวจสอบการเชื่อมต่อกับฐานข้อมูล
    if (!(await db.healthCheck(pool))) {
      return res.status(503).json({ error: 'Database is currently unavailable' });
    }
    
    await pool.query(
      'INSERT INTO pm25_data (value, location) VALUES (?, ?)',
      [value, location]
    );
    
    res.json({ message: 'PM2.5 value added' });
  } catch (error) {
    console.error('Add PM2.5 error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get PM2.5 data API
app.get('/pm25', async (req, res) => {
  try {
    // ตรวจสอบการเชื่อมต่อกับฐานข้อมูล
    if (!(await db.healthCheck(pool))) {
      return res.status(503).json({ error: 'Database is currently unavailable' });
    }
    
    const [rows] = await pool.query('SELECT * FROM pm25_data ORDER BY timestamp DESC');
    res.json(rows);
  } catch (error) {
    console.error('Get PM2.5 error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check admin API
app.get('/admin/check', async (req, res) => {
  try {
    // ตรวจสอบการเชื่อมต่อกับฐานข้อมูล
    if (!(await db.healthCheck(pool))) {
      return res.status(503).json({ error: 'Database is currently unavailable' });
    }
    
    const [rows] = await pool.query('SELECT id, username, created_at FROM admins');
    res.json({ admins: rows });
  } catch (error) {
    console.error('Check admin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🔍 Health check: http://localhost:${PORT}/health`);
}); 