import requests
import json
import schedule
import time
from datetime import datetime, timedelta
from pymongo import MongoClient
import pytz
 
MONGO_URI = "mongodb+srv://66022613:computer88@cluster0.u5726.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0"
 
try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    client.admin.command('ping')
    print("✅ Connected to MongoDB!")
except Exception as e:
    print(f"❌ Error connecting to MongoDB: {e}")
 
 
db = client.Pm25
collection = db.pm_data
 
 
def fetch_pm25_data():
    api_key = "a1bfffc563959672387f02e517ea1a60"
    lat = 19.0292
    lon = 99.8976
 
   
    timezone = pytz.timezone('Asia/Bangkok')
    now = datetime.now(timezone)  
    end = int(now.timestamp())
    start = int((now - timedelta(hours=5)).timestamp())  
    url = f"https://api.openweathermap.org/data/2.5/air_pollution/history?lat={lat}&lon={lon}&start={start}&end={end}&appid={api_key}"
 
    try:
        response = requests.get(url)
        data = response.json()
 
        if "list" in data and data["list"]:
           
            pm25 = data["list"][-1]["components"]["pm2_5"]
            last_updated = datetime.now(timezone).strftime('%Y-%m-%d %H:%M:%S')
 
            pm25_hourly = []
            for entry in data["list"]:
               
                entry_time = datetime.utcfromtimestamp(entry["dt"]).replace(tzinfo=pytz.utc).astimezone(timezone)
                time_entry = entry_time.strftime('%H:00')  
                pm25_hourly.append({
                    "time": time_entry,
                    "value": entry["components"]["pm2_5"]  
                })
 
           
            print(f"Latest PM2.5 value: {pm25}")
            print(f"Last updated: {last_updated}")
            print("Hourly PM2.5 data:")
            for entry in pm25_hourly:
                print(f"{entry['time']} - {entry['value']} µg/m³")
 
           
            save_pm25_data(pm25, last_updated, pm25_hourly)
 
    except Exception as e:
        print(f"Error fetching data: {e}")
 
 
def save_pm25_data(pm25, last_updated, pm25_hourly):
    data = {
        "pm25": pm25,
        "lastUpdatedTime": last_updated,
        "pm25Hourly": pm25_hourly,
    }
 
    try:
       
        collection.insert_one(data)
        print("Data saved to MongoDB")
 
        # คอมเมนต์การส่งข้อมูลไปยังเซิร์ฟเวอร์ขณะนี้
        # response = requests.post('http://localhost:5000/save-pm25', json=data)
        # print("Data saved:", response.status_code)
 
    except Exception as e:
        print(f"Error saving data: {e}")
 
 
def start_auto_update():
    schedule.every(5).minutes.do(fetch_pm25_data)  
    while True:
        schedule.run_pending()
        time.sleep(1)
 
 
if __name__ == "__main__":
    fetch_pm25_data()  
    start_auto_update()  