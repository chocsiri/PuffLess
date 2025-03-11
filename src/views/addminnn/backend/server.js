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

// API เพิ่มข้อมูลสถานที่แบบเป็นชุด (ไม่ต้องยืนยันตัวตนสำหรับการทดสอบ)
app.post('/api/locations/setup', async (req, res) => {
  try {
    const locations = [
      'หอใน',
      'คณะวิศวกรรมศาสตร์',
      'คณะ ICT',
      'อาคารเรียน PKY',
      'สำนักงานอธิการบดี',
      'โรงอาหาร',
      'หอสมุด',
      'ศูนย์การแพทย์'
    ];

    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // เพิ่มข้อมูลสถานที่ทีละรายการ
      for (const locationName of locations) {
        // ตรวจสอบว่าสถานที่มีอยู่แล้วหรือไม่
        const [existingLocations] = await connection.query(
          'SELECT id FROM locations WHERE name = ?',
          [locationName]
        );
        
        if (existingLocations.length === 0) {
          await connection.query(
            'INSERT INTO locations (name, latitude, longitude) VALUES (?, ?, ?)',
            [locationName, 19.0 + Math.random() * 0.05, 99.9 + Math.random() * 0.05]
          );
        }
      }
      
      await connection.commit();
      res.status(201).json({ message: 'เพิ่มข้อมูลสถานที่เรียบร้อยแล้ว' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการเพิ่มข้อมูลสถานที่:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเพิ่มข้อมูลสถานที่' });
  }
});

// API สร้างข้อมูล PM2.5 จำลองสำหรับสถานที่ทั้งหมด (ไม่ต้องยืนยันตัวตนสำหรับการทดสอบ)
app.post('/api/air-quality/sample', async (req, res) => {
  try {
    // ดึงข้อมูลสถานที่ทั้งหมด
    const [locations] = await pool.query('SELECT id, name FROM locations');
    
    if (locations.length === 0) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลสถานที่' });
    }
    
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // สร้างข้อมูลย้อนหลัง 24 ชั่วโมง
      const now = new Date();
      
      for (const location of locations) {
        const baseValue = 15 + Math.random() * 30; // ค่าฐาน PM2.5 ระหว่าง 15-45
        
        for (let i = 0; i < 24; i++) {
          const timestamp = new Date(now);
          timestamp.setHours(now.getHours() - i);
          
          // ค่า PM2.5 มีการเปลี่ยนแปลงไม่เกิน 20% จากค่าฐาน
          const variation = baseValue * (0.8 + Math.random() * 0.4);
          const pm25Value = parseFloat(variation.toFixed(2));
          
          await connection.query(
            'INSERT INTO air_quality_data (location_id, location, pm25_value, timestamp) VALUES (?, ?, ?, ?)',
            [location.id, location.name, pm25Value, timestamp]
          );
        }
      }
      
      await connection.commit();
      res.status(201).json({ message: 'สร้างข้อมูล PM2.5 จำลองเรียบร้อยแล้ว' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการสร้างข้อมูล PM2.5 จำลอง:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการสร้างข้อมูล PM2.5 จำลอง' });
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`เซิร์ฟเวอร์ทำงานที่พอร์ต ${PORT}`);
}); 