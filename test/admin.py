import requests
import schedule
import time
from datetime import datetime, timedelta
from pymongo import MongoClient
import pytz
 
# ------------------------ 🔗 เชื่อมต่อ MongoDB ------------------------
MONGO_URI = "mongodb+srv://66022613:computer88@cluster0.u5726.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0"
 
try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    client.admin.command("ping")
    print("✅ Connected to MongoDB!")
except Exception as e:
    print(f"❌ Error connecting to MongoDB: {e}")
    exit()  # หยุดโปรแกรมถ้าเชื่อมต่อ MongoDB ไม่ได้
<<<<<<< Updated upstream
 
db = client.Pm25
collection = db.pm_data
 
 
=======

db = client.PPPPPMMMM25
collection = db.pm25_data

>>>>>>> Stashed changes
# ------------------------ 🌎 ตั้งค่า API และ Timezone ------------------------
API_KEY = "a1bfffc563959672387f02e517ea1a60"
LAT, LON = 19.0292, 99.8976
TIMEZONE = pytz.timezone("Asia/Bangkok")
 
 
# ------------------------ 📡 ดึงข้อมูล PM2.5 จาก API ------------------------
def fetch_pm25_data():
    """ดึงข้อมูล PM2.5 ย้อนหลัง 24 ชั่วโมง และบันทึกลง MongoDB"""
    now = datetime.now(TIMEZONE)
    end = int(now.timestamp())
<<<<<<< Updated upstream
    start = int((now - timedelta(hours=5)).timestamp())
 
=======
    start = int((now - timedelta(hours=24)).timestamp())  # ดึงย้อนหลัง 24 ชั่วโมง

>>>>>>> Stashed changes
    url = f"https://api.openweathermap.org/data/2.5/air_pollution/history?lat={LAT}&lon={LON}&start={start}&end={end}&appid={API_KEY}"
 
    try:
        response = requests.get(url, timeout=10)  # ตั้ง timeout กันค้าง
        response.raise_for_status()  # ถ้ามี Error (เช่น 404, 500) ให้ raise Exception ทันที
        data = response.json()
 
        if "list" in data and data["list"]:
<<<<<<< Updated upstream
            pm25 = data["list"][-1]["components"]["pm2_5"]
            last_updated = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")  # เก็บเวลาเป็น UTC
 
            pm25_hourly = []
            for entry in data["list"]:
                entry_time = datetime.utcfromtimestamp(entry["dt"]).replace(tzinfo=pytz.utc)
                time_entry = entry_time.astimezone(TIMEZONE).strftime("%H:00")  # แปลงเป็นเวลาไทย
                pm25_hourly.append({"time": time_entry, "value": entry["components"]["pm2_5"]})
 
            print(f"\n🌿 Latest PM2.5 value: {pm25} µg/m³")
            print(f"🕒 Last updated: {last_updated}")
            print("📊 Hourly PM2.5 data:")
            for entry in pm25_hourly:
                print(f"   ⏰ {entry['time']} - {entry['value']} µg/m³")
 
            save_pm25_data(pm25, last_updated, pm25_hourly)
=======
            for entry in data["list"]:
                entry_time = datetime.utcfromtimestamp(entry["dt"]).replace(tzinfo=pytz.utc)
                local_time = entry_time.astimezone(TIMEZONE)
                time_entry = local_time.strftime("%Y-%m-%d %H:00")  # เก็บเป็น `YYYY-MM-DD HH:00`

                pm25_value = entry["components"]["pm2_5"]

                save_pm25_data(time_entry, pm25_value)  # บันทึกข้อมูล

            print("\n✅ PM2.5 data updated successfully!")
>>>>>>> Stashed changes
        else:
            print("⚠️ No valid PM2.5 data found!")
 
    except requests.exceptions.RequestException as e:
        print(f"❌ Error fetching data: {e}")
 
 
# ------------------------ 💾 บันทึกข้อมูลลง MongoDB ------------------------
def save_pm25_data(time_entry, pm25_value):
    """บันทึกข้อมูล PM2.5 ลง MongoDB โดยไม่ให้ซ้ำ"""
    existing_data = collection.find_one({"time": time_entry})

    if existing_data:
        print(f"⚠️ Data for {time_entry} already exists, skipping insert.")
        return

    data = {
        "time": time_entry,
        "pm25": pm25_value,
    }
 
    try:
        collection.insert_one(data)
        print(f"✅ Saved data for {time_entry} - PM2.5: {pm25_value} µg/m³")
    except Exception as e:
        print(f"❌ Error saving data: {e}")
 
 
# ------------------------ ⏳ ตั้ง Scheduler ให้ดึงข้อมูลทุกชั่วโมง ------------------------
def start_auto_update():
    schedule.every().hour.at(":00").do(fetch_pm25_data)  # รันทุกชั่วโมงตรง (:00)
 
    print("\n🔄 Scheduler started! Fetching PM2.5 data every hour...")
    while True:
        schedule.run_pending()
        time.sleep(60)  # เช็คทุก 60 วินาที
 
 
# ------------------------ 🚀 เริ่มรันโปรแกรม ------------------------
if __name__ == "__main__":
    fetch_pm25_data()  # ดึงข้อมูลครั้งแรกก่อนเริ่ม Scheduler
    start_auto_update()