import express from 'express';
import bodyParser from 'body-parser';

const app = express();
const port = 8001;

app.use(bodyParser.json());

// ตรวจสอบข้อมูลก่อนการล็อกอิน
app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;

  // ตรวจสอบข้อมูลที่ส่งมา
  if (!username || !password) {
    return res.status(400).json({ message: 'Please provide both username and password' });
  }

  // ตรวจสอบว่า username และ password ถูกต้องหรือไม่
  if (username === 'admin' && password === '123') {
    // ส่ง token กลับไปหากล็อกอินสำเร็จ
    res.json({ token: 'dummy-token-123456' });
  } else {
    // ส่ง error กลับหากล็อกอินไม่สำเร็จ
    res.status(400).json({ message: 'Invalid username or password' });
  }
});

// เริ่มฟังคำขอ
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
