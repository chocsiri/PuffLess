import { MongoClient } from 'mongodb';
import express from 'express';

const app = express();
const port = 3000;

const uri = "mongodb+srv://66022613:<BBO4Mil4oiV4YRYE>@cluster0.6oxk5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

// ตั้งค่าให้ API ส่งข้อมูลในรูปแบบ JSON
app.use(express.json());

// API สำหรับดึงข้อมูลจาก MongoDB
app.get('/cart', async (req, res) => {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB Atlas!");

    const database = client.db("myappdb");
    const collection = database.collection("myCollection");

    const data = await collection.find({}).toArray();
    res.status(200).json(data);  
  } catch (error) {
    console.error("❌ Connection error:", error);
    res.status(500).send('Internal Server Error');
  } finally {
    await client.close();
  }
});

// เริ่มต้นเซิร์ฟเวอร์
app.listen(port, () => {
  console.log(`API server is running on http://localhost:${3000}`);
});