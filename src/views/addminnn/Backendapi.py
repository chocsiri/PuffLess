from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from datetime import datetime, timedelta
import os
import jwt
from passlib.context import CryptContext
from pydantic import BaseModel, validator
from dotenv import load_dotenv
import uvicorn
import re
from typing import Dict
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from bson.objectid import ObjectId
from bson.errors import InvalidId

# Rate limiting and Login Attempts tracking
class SecurityManager:
    def __init__(self, max_requests: int, time_window: int, max_login_attempts: int, lockout_duration: int):
        self.max_requests = max_requests
        self.time_window = time_window
        self.requests: Dict[str, list] = {}
        self.login_attempts: Dict[str, dict] = {}
        self.max_login_attempts = max_login_attempts
        self.lockout_duration = lockout_duration  # in minutes

    def is_allowed(self, ip: str) -> bool:
        now = datetime.now()
        if ip not in self.requests:
            self.requests[ip] = []
        
        self.requests[ip] = [time for time in self.requests[ip] 
                           if (now - time).seconds < self.time_window]
        
        if len(self.requests[ip]) >= self.max_requests:
            return False
        
        self.requests[ip].append(now)
        return True

    def check_login_attempts(self, username: str) -> bool:
        now = datetime.now()
        if username not in self.login_attempts:
            self.login_attempts[username] = {"attempts": 0, "locked_until": None}
        
        user_attempts = self.login_attempts[username]
        
        # ตรวจสอบว่าบัญชีถูกล็อคอยู่หรือไม่
        if user_attempts["locked_until"] and now < user_attempts["locked_until"]:
            remaining_time = (user_attempts["locked_until"] - now).minutes
            raise HTTPException(
                status_code=401,
                detail=f"Account is locked. Try again in {remaining_time} minutes"
            )
        
        # รีเซ็ตการนับถ้าล็อคหมดอายุแล้ว
        if user_attempts["locked_until"] and now >= user_attempts["locked_until"]:
            user_attempts["attempts"] = 0
            user_attempts["locked_until"] = None
        
        return True

    def record_failed_attempt(self, username: str):
        now = datetime.now()
        if username not in self.login_attempts:
            self.login_attempts[username] = {"attempts": 0, "locked_until": None}
        
        self.login_attempts[username]["attempts"] += 1
        
        if self.login_attempts[username]["attempts"] >= self.max_login_attempts:
            self.login_attempts[username]["locked_until"] = now + timedelta(minutes=self.lockout_duration)
            raise HTTPException(
                status_code=401,
                detail=f"Too many failed attempts. Account locked for {self.lockout_duration} minutes"
            )

    def reset_attempts(self, username: str):
        if username in self.login_attempts:
            self.login_attempts[username] = {"attempts": 0, "locked_until": None}

# โหลดค่า .env
load_dotenv()
MONGO_URI = "mongodb://localhost:27017/"
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "localhost").split(",")

# เชื่อมต่อ MongoDB
try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    # ตรวจสอบการเชื่อมต่อ
    client.admin.command('ping')
    print("MongoDB connection successful")
    db = client["air_quality"]
    pm25_collection = db["pm25_data"]
    admin_collection = db["admins"]
    
    # สร้าง admin เริ่มต้นถ้ายังไม่มี
    if admin_collection.count_documents({}) == 0:
        default_admin = {
            "username": "admin",
            "password": pwd_context.hash("Admin@123"),
            "created_at": datetime.utcnow()
        }
        admin_collection.insert_one(default_admin)
        print("Created default admin account: username=admin, password=Admin@123")
    
    # สร้าง index เพื่อเพิ่มประสิทธิภาพในการค้นหา
    pm25_collection.create_index([("location", 1)])
    pm25_collection.create_index([("timestamp", -1)])
    admin_collection.create_index([("username", 1)], unique=True)
    
except Exception as e:
    print(f"MongoDB connection error: {str(e)}")
    raise HTTPException(status_code=500, detail=f"Database connection error: {str(e)}")

app = FastAPI()

# Rate limiter instance
limiter = SecurityManager(max_requests=30, time_window=60, max_login_attempts=5, lockout_duration=30)  # 30 requests per minute

# Security Middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=ALLOWED_HOSTS
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_HOSTS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="admin/login")

class PM25Data(BaseModel):
    value: float
    location: str

class AdminRegister(BaseModel):
    username: str
    password: str
    
    @validator('password')
    def password_complexity(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one number')
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError('Password must contain at least one special character')
        return v

class AdminLogin(BaseModel):
    username: str
    password: str

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

def create_token(username: str):
    expiration = datetime.utcnow() + timedelta(hours=2)
    payload = {"username": username, "exp": expiration}
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

def verify_token(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    if not limiter.is_allowed(request.client.host):
        raise HTTPException(status_code=429, detail="Too many requests")
    response = await call_next(request)
    return response

@app.post("/admin/register")
async def register_admin(data: AdminRegister):
    try:
        if not data.username or not data.password:
            raise HTTPException(status_code=400, detail="Username and password are required")
            
        existing_admin = admin_collection.find_one({"username": data.username})
        if existing_admin:
            raise HTTPException(status_code=400, detail="Username already exists")

        hashed_password = hash_password(data.password)
        new_admin = {
            "username": data.username,
            "password": hashed_password,
            "created_at": datetime.utcnow()
        }
        
        admin_collection.insert_one(new_admin)
        return {
            "status": "success",
            "message": "Admin registered successfully"
        }
        
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/admin/login")
def admin_login(data: AdminLogin):
    # ตรวจสอบว่าบัญชีถูกล็อคหรือไม่
    limiter.check_login_attempts(data.username)
    
    admin = admin_collection.find_one({"username": data.username})
    
    if not admin or not verify_password(data.password, admin["password"]):
        # บันทึกการล็อกอินที่ล้มเหลว
        limiter.record_failed_attempt(data.username)
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # รีเซ็ตการนับเมื่อล็อกอินสำเร็จ
    limiter.reset_attempts(data.username)
    
    token = create_token(data.username)
    return {"token": token}

@app.post("/admin/pm25")
def add_pm25(data: PM25Data, token: str = Depends(verify_token)):
    try:
        # ตรวจสอบการเชื่อมต่อกับ MongoDB
        try:
            client.admin.command('ping')
        except Exception as e:
            print(f"MongoDB connection lost: {str(e)}")
            # พยายามเชื่อมต่อใหม่
            client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
            client.admin.command('ping')
            db = client["air_quality"]
            pm25_collection = db["pm25_data"]
            print("MongoDB reconnection successful")
            
        # ตรวจสอบข้อมูลก่อนบันทึก
        if data.value < 0:
            raise HTTPException(status_code=400, detail="PM2.5 value cannot be negative")
            
        if not data.location:
            raise HTTPException(status_code=400, detail="Location is required")
            
        # บันทึกข้อมูล
        document = {
            "value": data.value,
            "location": data.location,
            "timestamp": datetime.utcnow(),
            "added_by": token["username"]
        }
        
        result = pm25_collection.insert_one(document)
        
        # ส่งคืน ID ของรายการที่เพิ่ม
        return {
            "message": "PM2.5 value added successfully", 
            "id": str(result.inserted_id),
            "data": {
                "id": str(result.inserted_id),
                "value": data.value,
                "location": data.location,
                "timestamp": document["timestamp"].isoformat(),
                "added_by": token["username"]
            }
        }
    except HTTPException as e:
        # ส่งต่อ HTTPException ที่เราสร้างเอง
        raise e
    except Exception as e:
        print(f"Error adding PM2.5 data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error adding PM2.5 data: {str(e)}")

@app.get("/pm25")
def get_pm25():
    try:
        # ตรวจสอบการเชื่อมต่อกับ MongoDB
        try:
            client.admin.command('ping')
        except Exception as e:
            print(f"MongoDB connection lost: {str(e)}")
            # พยายามเชื่อมต่อใหม่
            client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
            client.admin.command('ping')
            db = client["air_quality"]
            pm25_collection = db["pm25_data"]
            print("MongoDB reconnection successful")
            
        # ดึงข้อมูลทั้งหมด เรียงตามเวลาล่าสุด
        cursor = pm25_collection.find().sort("timestamp", -1)
        
        data = []
        for doc in cursor:
            if "_id" in doc:
                doc_id = str(doc["_id"])
                doc_copy = dict(doc)  # สร้างสำเนาของเอกสาร
                doc_copy["id"] = doc_id  # เพิ่มฟิลด์ id
                doc_copy["_id"] = doc_id  # เก็บ _id ไว้ด้วยในรูปแบบ string
                data.append(doc_copy)
                print(f"Processed document with ID: {doc_id}")
            else:
                print(f"Warning: Document without _id found: {doc}")
        
        print(f"Returning {len(data)} documents")
        return {"data": data}
    except Exception as e:
        print(f"Error retrieving PM2.5 data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error retrieving PM2.5 data: {str(e)}")

@app.put("/admin/pm25/{item_id}")
def update_pm25(item_id: str, data: PM25Data, token: str = Depends(verify_token)):
    try:
        # ตรวจสอบการเชื่อมต่อกับ MongoDB
        try:
            client.admin.command('ping')
        except Exception as e:
            print(f"MongoDB connection lost: {str(e)}")
            # พยายามเชื่อมต่อใหม่
            client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
            client.admin.command('ping')
            db = client["air_quality"]
            pm25_collection = db["pm25_data"]
            print("MongoDB reconnection successful")
            
        # ตรวจสอบข้อมูลก่อนอัพเดต
        if data.value < 0:
            raise HTTPException(status_code=400, detail="PM2.5 value cannot be negative")
            
        if not data.location:
            raise HTTPException(status_code=400, detail="Location is required")
            
        # ตรวจสอบว่า ID ถูกต้องหรือไม่
        try:
            object_id = ObjectId(item_id)
        except InvalidId:
            raise HTTPException(status_code=400, detail=f"Invalid ID format: {item_id}")
            
        # ตรวจสอบว่ามีข้อมูลที่ต้องการอัพเดตหรือไม่
        existing_doc = pm25_collection.find_one({"_id": object_id})
        if not existing_doc:
            raise HTTPException(status_code=404, detail=f"PM2.5 record with ID {item_id} not found")
            
        # อัพเดตข้อมูล
        update_data = {
            "value": data.value,
            "location": data.location,
            "timestamp": datetime.utcnow() if data.timestamp is None else data.timestamp,
            "updated_by": token["username"],
            "updated_at": datetime.utcnow()
        }
        
        result = pm25_collection.update_one(
            {"_id": object_id},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail=f"PM2.5 record with ID {item_id} not found")
            
        # ดึงข้อมูลที่อัพเดตแล้ว
        updated_doc = pm25_collection.find_one({"_id": object_id})
        updated_doc["id"] = str(updated_doc["_id"])
        del updated_doc["_id"]
            
        return {
            "message": "PM2.5 value updated successfully",
            "data": updated_doc
        }
    except HTTPException as e:
        # ส่งต่อ HTTPException ที่เราสร้างเอง
        raise e
    except InvalidId as e:
        print(f"Invalid ObjectId format: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Invalid ID format: {item_id}")
    except Exception as e:
        print(f"Error updating PM2.5 data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error updating PM2.5 data: {str(e)}")

@app.delete("/admin/pm25/{item_id}")
def delete_pm25(item_id: str, token: str = Depends(verify_token)):
    try:
        # ตรวจสอบการเชื่อมต่อกับ MongoDB
        try:
            client.admin.command('ping')
        except Exception as e:
            print(f"MongoDB connection lost: {str(e)}")
            # พยายามเชื่อมต่อใหม่
            client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
            client.admin.command('ping')
            db = client["air_quality"]
            pm25_collection = db["pm25_data"]
            print("MongoDB reconnection successful")
            
        # ตรวจสอบว่า ID ถูกต้องหรือไม่
        try:
            object_id = ObjectId(item_id)
        except InvalidId:
            raise HTTPException(status_code=400, detail=f"Invalid ID format: {item_id}")
            
        # ตรวจสอบว่ามีข้อมูลที่ต้องการลบหรือไม่
        existing_doc = pm25_collection.find_one({"_id": object_id})
        if not existing_doc:
            raise HTTPException(status_code=404, detail=f"PM2.5 record with ID {item_id} not found")
            
        # เก็บข้อมูลก่อนลบ
        deleted_doc = dict(existing_doc)
        deleted_doc["id"] = str(deleted_doc["_id"])
        del deleted_doc["_id"]
            
        # ลบข้อมูล
        result = pm25_collection.delete_one({"_id": object_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail=f"PM2.5 record with ID {item_id} not found")
            
        return {
            "message": "PM2.5 value deleted successfully",
            "data": deleted_doc
        }
    except HTTPException as e:
        # ส่งต่อ HTTPException ที่เราสร้างเอง
        raise e
    except InvalidId as e:
        print(f"Invalid ObjectId format: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Invalid ID format: {item_id}")
    except Exception as e:
        print(f"Error deleting PM2.5 data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error deleting PM2.5 data: {str(e)}")

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
