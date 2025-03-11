from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from datetime import datetime, timedelta
import os
import jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from dotenv import load_dotenv
import uvicorn

# โหลดค่า .env
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")  # กำหนดค่าเริ่มต้นถ้าไม่มี .env

print(f"🔑 Using MONGO_URI: {MONGO_URI}")
print(f"🔒 SECRET_KEY is set: {bool(SECRET_KEY)}")

# เชื่อมต่อ MongoDB
try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    # ทดสอบการเชื่อมต่อ
    client.admin.command('ping')
    print("✅ เชื่อมต่อ MongoDB สำเร็จ!")
    
    # กำหนด Database และ Collection
    db = client["air_quality"]
    pm25_collection = db["pm25_data"]
    admin_collection = db["admins"]
except Exception as e:
    print(f"❌ เกิดข้อผิดพลาดในการเชื่อมต่อ MongoDB: {e}")
    raise HTTPException(status_code=500, detail=f"Database connection error: {str(e)}")

# สร้าง FastAPI
app = FastAPI()

# เพิ่ม CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # อนุญาตทุก origin ในโหมดพัฒนา
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ใช้ bcrypt สำหรับเข้ารหัสรหัสผ่าน
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ใช้ OAuth2PasswordBearer สำหรับตรวจสอบ Token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="admin/login")

# Model สำหรับรับค่าฝุ่น PM2.5
class PM25Data(BaseModel):
    value: float
    location: str                                                      

class AdminRegister(BaseModel):
    username: str
    password: str

class AdminLogin(BaseModel):
    username: str
    password: str

# ฟังก์ชันเข้ารหัสและตรวจสอบรหัสผ่าน
def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

# ฟังก์ชันสร้าง JWT Token (มีอายุ 2 ชั่วโมง)
def create_token(username: str):
    expiration = datetime.utcnow() + timedelta(hours=2)
    payload = {"username": username, "exp": expiration}
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

# ฟังก์ชันตรวจสอบ JWT Token
def verify_token(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ✅ API - สมัครแอดมิน
@app.post("/admin/register")
async def register_admin(data: AdminRegister):
    try:
        print(f"📝 Registering new admin with username: {data.username}")
        
        if not data.username or not data.password:
            raise HTTPException(status_code=400, detail="Username and password are required")
            
        # ตรวจสอบว่า username ที่สมัครมีอยู่แล้วในฐานข้อมูลหรือไม่
        existing_admin = admin_collection.find_one({"username": data.username})
        if existing_admin:
            print(f"❌ Username {data.username} already exists")
            raise HTTPException(status_code=400, detail="Username already exists")

        # เข้ารหัสรหัสผ่านก่อนที่จะเก็บในฐานข้อมูล
        hashed_password = hash_password(data.password)
        print("✅ Password hashed successfully")

        # บันทึกข้อมูลแอดมินใหม่ใน MongoDB
        new_admin = {
            "username": data.username,
            "password": hashed_password,
            "created_at": datetime.utcnow()
        }
        
        result = admin_collection.insert_one(new_admin)
        print(f"✅ Admin registered with id: {result.inserted_id}")
        
        return {
            "status": "success",
            "message": "Admin registered successfully",
            "username": data.username
        }
        
    except HTTPException as he:
        print(f"❌ HTTP Exception: {str(he.detail)}")
        raise he
    except Exception as e:
        error_msg = f"Error registering admin: {str(e)}"
        print(f"❌ {error_msg}")
        raise HTTPException(status_code=500, detail=error_msg)

# ✅ API - ล็อกอินแอดมิน
@app.post("/admin/login")
def admin_login(data: AdminLogin):
    print(f"👉 Login attempt with username: {data.username}")  # Debug log
    print(f"👉 Received password: {data.password}")  # Debug log
    
    admin = admin_collection.find_one({"username": data.username})
    print(f"👉 Found admin in database: {admin}")  # Debug log - แสดงข้อมูลทั้งหมด
    
    if not admin:
        print("❌ Admin not found in database")  # Debug log
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    # ทดสอบการตรวจสอบรหัสผ่าน
    is_valid = verify_password(data.password, admin["password"])
    print(f"👉 Password verification result: {is_valid}")  # Debug log
        
    if not is_valid:
        print("❌ Password verification failed")  # Debug log
        raise HTTPException(status_code=401, detail="Invalid credentials")

    print("✅ Login successful")  # Debug log
    token = create_token(data.username)
    return {"token": token}

# ✅ API - บันทึกค่า PM2.5 (ต้องมี Token)
@app.post("/admin/pm25")
def add_pm25(data: PM25Data, token: str = Depends(verify_token)):
    pm25_collection.insert_one({
        "value": data.value,
        "location": data.location,
        "timestamp": datetime.utcnow()
    })
    return {"message": "PM2.5 value added"}

# ✅ API - ดึงค่าฝุ่น PM2.5
@app.get("/pm25")
def get_pm25():
    data = list(pm25_collection.find({}, {"_id": 0}))
    return data

# ✅ API - ดูข้อมูลแอดมินทั้งหมด (เฉพาะ development)
@app.get("/admin/list")
def list_admins():
    admins = list(admin_collection.find({}, {"_id": 0}))
    return {"admins": admins, "count": len(admins)}

# ✅ API - ดูข้อมูลแอดมิน (เฉพาะ development)
@app.get("/admin/check")
def check_admin():
    admins = list(admin_collection.find({}, {"_id": 0, "password": 0}))
    return {"admins": admins}

# เพิ่ม endpoint ตรวจสอบสถานะ MongoDB
@app.get("/mongodb-status")
def check_mongodb_status():
    try:
        # ทดสอบการเชื่อมต่อ
        client.admin.command("ping")
        # ทดสอบการเข้าถึงฐานข้อมูล
        admin_count = admin_collection.count_documents({})
        return {
            "status": "Connected",
            "database": "air_quality",
            "admin_count": admin_count
        }
    except Exception as e:
        return {"status": "Error", "message": str(e)}

def test_mongodb_connection():
    try:
        # เชื่อมต่อกับ MongoDB
        client = MongoClient('mongodb://localhost:27017/')
        # ทดสอบการเชื่อมต่อ
        client.server_info()
        print("เชื่อมต่อ MongoDB สำเร็จ!")
    except Exception as e:
        print(f"เกิดข้อผิดพลาดในการเชื่อมต่อ: {e}")

if __name__ == "__main__":
    uvicorn.run("src.views.addminnn.Backendapi:app", host="0.0.0.0", port=8000, reload=True)
