const express = require('express');
const cors = require('cors');
const app = express();

// ใช้ middleware
app.use(cors());
app.use(express.json());

// ข้อมูลตัวอย่าง
let airQualityData = [
  {
    id: 1,
    location: 'กรุงเทพ',
    pm25_value: 45.5,
    temperature: 32.5,
    humidity: 65.0,
    timestamp: new Date().toISOString()
  }
];

// API เข้าสู่ระบบ
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  // ตรวจสอบข้อมูลเข้าสู่ระบบแบบง่าย
  if (username === 'admin' && password === '123456') {
    res.json({
      success: true,
      user: {
        username: 'admin',
        role: 'admin'
      }
    });
  } else {
    res.status(401).json({
      success: false,
      error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'
    });
  }
});

// API ดึงข้อมูลคุณภาพอากาศ
app.get('/api/air-quality', (req, res) => {
  res.json(airQualityData);
});

// API เพิ่มข้อมูลคุณภาพอากาศ
app.post('/api/air-quality', (req, res) => {
  const { location, pm25_value, temperature, humidity } = req.body;
  
  const newData = {
    id: airQualityData.length + 1,
    location,
    pm25_value,
    temperature,
    humidity,
    timestamp: new Date().toISOString()
  };
  
  airQualityData.push(newData);
  res.json({
    success: true,
    data: newData
  });
});

// API ตรวจสอบสถานะ
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`เซิร์ฟเวอร์ทำงานที่พอร์ต ${PORT}`);
}); 