from fastapi import FastAPI, Depends, HTTPException
from pymongo import MongoClient
from datetime import datetime
import os
import jwt
from typing import List
from pydantic import BaseModel
from dotenv import load_dotenv

# โหลดค่า .env
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
SECRET_KEY = os.getenv("SECRET_KEY")

# เชื่อมต่อ MongoDB
try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    client.admin.command("ping")
    print("✅ Connected to MongoDB!")
except Exception as e:
    print(f"❌ Error connecting to MongoDB: {e}")
    exit()

# กำหนด Database และ Collection
db = client["air_quality"]
pm25_collection = db["pm25_data"]
admin_collection = db["admins"]

# สร้าง FastAPI
app = FastAPI()

# Model สำหรับรับค่าฝุ่น PM2.5
class PM25Data(BaseModel):
    value: float
    location: str

class AdminLogin(BaseModel):
    username: str
    password: str

# ฟังก์ชันตรวจสอบ JWT Token
def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# API - ล็อกอินแอดมิน
@app.post("/admin/login")
def admin_login(data: AdminLogin):
    admin = admin_collection.find_one({"username": data.username, "password": data.password})
    if not admin:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = jwt.encode({"username": data.username}, SECRET_KEY, algorithm="HS256")
    return {"token": token}

# API - บันทึกค่า PM2.5 (ต้องมี Token)
@app.post("/admin/pm25")
def add_pm25(data: PM25Data, token: str = Depends(verify_token)):
    pm25_collection.insert_one({
        "value": data.value,
        "location": data.location,
        "timestamp": datetime.utcnow()
    })
    return {"message": "PM2.5 value added"}

# API - ดึงค่าฝุ่น PM2.5
@app.get("/pm25")
def get_pm25():
    data = list(pm25_collection.find({}, {"_id": 0}))
    return data
