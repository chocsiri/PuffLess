from pymongo import MongoClient

# ใส่ Connection String ที่ได้จาก MongoDB Atlas
uri = "mongodb+srv://admin:XbOMPccL2zAUtx6p@project.eoqdc.mongodb.net/?retryWrites=true&w=majority&appName=project"

# เชื่อมต่อกับ MongoDB Atlas
client = MongoClient(uri)

# เลือกฐานข้อมูลที่ต้องการใช้งาน
db = client["your_database_name"]  # เปลี่ยน "your_database_name" เป็นชื่อฐานข้อมูลที่ต้องการ

# เลือก collection ที่ต้องการ
collection = db["your_collection_name"]  # เปลี่ยน "your_collection_name" เป็นชื่อ collection

# ตัวอย่างการแทรกข้อมูล
collection.insert_one({"name": "John", "age": 30})

# ตัวอย่างการค้นหาข้อมูล
document = collection.find_one({"name": "John"})
print(document)
