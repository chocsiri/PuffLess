<script setup>  
import { ref, onMounted, watch, computed } from "vue";
import { useRouter } from "vue-router";

// เพิ่ม router
const router = useRouter();

// เพิ่ม computed property เพื่อตรวจสอบการล็อกอิน
const isLoggedIn = computed(() => {
  return localStorage.getItem('user') !== null;
});

const pm25 = ref(null);
const lastUpdatedTime = ref(null);
const pm25Hourly = ref([]);
const pm25Locations = ref([]);
const isLoading = ref(true);
const errorMessage = ref(null);
let updateIntervalPM25 = null;
let updateIntervalTime = null;

// เพิ่มฟังก์ชันสำหรับดึงข้อมูลจาก localStorage
const loadPM25LocationsFromDB = () => {
  try {
    const savedData = localStorage.getItem('airQualityData');
    if (savedData) {
      const data = JSON.parse(savedData);
      
      // สร้าง Map เพื่อเก็บค่าล่าสุดของแต่ละสถานที่
      const locationMap = new Map();
      
      // วนลูปข้อมูลเพื่อหาค่าล่าสุดของแต่ละสถานที่
      data.forEach(item => {
        const existingData = locationMap.get(item.location);
        if (!existingData || new Date(item.timestamp) > new Date(existingData.timestamp)) {
          locationMap.set(item.location, item);
        }
      });
      
      // แปลงข้อมูลให้อยู่ในรูปแบบที่ต้องการ
      const locations = Array.from(locationMap.values()).map(item => ({
        name: item.location,
        value: item.pm25_value
      }));
      
      // เรียงลำดับตามค่า PM2.5 จากมากไปน้อย
      pm25Locations.value = locations.sort((a, b) => b.value - a.value);
    }
  } catch (error) {
    console.error('Error loading PM2.5 locations:', error);
    pm25Locations.value = [];
  }
};

// ฟังก์ชันดึงข้อมูล PM2.5
const fetchPM25Data = async () => {
  const apiKey = "a1bfffc563959672387f02e517ea1a60";
  const lat = 19.0292;
  const lon = 99.8976;

  const now = new Date();
  const end = Math.floor(now.getTime() / 1000);
  const start = Math.floor(new Date(now.getTime() - 5 * 60 * 60 * 1000).getTime() / 1000);

  const apiUrl = `https://api.openweathermap.org/data/2.5/air_pollution/history?lat=${lat}&lon=${lon}&start=${start}&end=${end}&appid=${apiKey}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error("ไม่สามารถดึงข้อมูล AQI ได้");

    const data = await response.json();
    if (!data.list || data.list.length === 0) throw new Error("ไม่มีข้อมูล PM2.5");

    pm25.value = data.list[data.list.length - 1].components.pm2_5;
    lastUpdatedTime.value = new Date().toLocaleString("th-TH", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "Asia/Bangkok",
    });

    pm25Hourly.value = data.list.map((entry) => {
      return {
        time: new Date(entry.dt * 1000).toLocaleTimeString("th-TH", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Asia/Bangkok",
        }),
        value: entry.components.pm2_5,
      };
    });

<<<<<<< HEAD
    // ดึงข้อมูล PM2.5 จาก API
    try {
      const pm25Response = await fetch('http://localhost:8000/pm25');
      console.log('API Response status:', pm25Response.status);
      const pm25Data = await pm25Response.json();
      console.log('API Data:', pm25Data);
      
      const avgValues = {};
      
      if (pm25Data && (pm25Data.data?.length > 0 || Array.isArray(pm25Data))) {
        console.log('PM2.5 data found, processing...');
        // คำนวณค่าเฉลี่ยสำหรับแต่ละสถานที่
        const dataArray = pm25Data.data || pm25Data;
        
        dataArray.forEach(item => {
          if (!item.location) return;
          
          if (!avgValues[item.location]) {
            avgValues[item.location] = [];
          }
          
          // แปลงค่าเป็นตัวเลขและตรวจสอบว่าเป็นตัวเลขที่ถูกต้อง
          const value = typeof item.value === 'number' ? item.value : parseFloat(item.value);
          if (!isNaN(value)) {
            avgValues[item.location].push(value);
          }
        });

        // กำหนดค่าเริ่มต้นสำหรับแต่ละสถานที่
        const defaultValues = {
          "คณะ ICT": "0",
          "หอใน": "0",
          "อาคารเรียน PKY": "0",
          "คณะวิศวกรรมศาสตร์": "0",
          "อาคารเรียน UB": "0",
          "คณะสาธารณสุขศาสตร์": "0",
          "โรงเรียนสาธิตม.พะเยา": "0",
          "โรงพยาบาลมหาวิทยาลัยพะเยา": "0"
        };

        // สร้างอาเรย์ของสถานที่พร้อมค่า PM2.5
        const locationArray = [];
        for (const location of Object.keys(defaultValues)) {
          let value = defaultValues[location];
          if (avgValues[location] && avgValues[location].length > 0) {
            const sum = avgValues[location].reduce((a, b) => a + b, 0);
            const avg = sum / avgValues[location].length;
            value = avg.toFixed(1);
          }
          locationArray.push({
            name: location,
            value: value
          });
        }
        
        // เพิ่มสถานที่ที่ไม่ได้อยู่ในค่าเริ่มต้น
        for (const location in avgValues) {
          if (!Object.keys(defaultValues).includes(location)) {
            const values = avgValues[location];
            if (values && values.length > 0) {
              const sum = values.reduce((a, b) => a + b, 0);
              const avg = sum / values.length;
              locationArray.push({
                name: location,
                value: avg.toFixed(1)
              });
            }
          }
        }
        
        // เรียงลำดับตามค่าจากมากไปน้อย
        locationArray.sort((a, b) => Number(b.value) - Number(a.value));
        pm25Locations.value = locationArray;
        console.log('PM2.5 Locations sorted:', pm25Locations.value);

        // คำนวณค่าเฉลี่ย PM2.5 ทั้งหมด
        const allValues = Object.values(avgValues).flat();
        if (allValues.length > 0) {
          const avgTotal = allValues.reduce((a, b) => a + b, 0) / allValues.length;
          pm25.value = avgTotal.toFixed(1);
          console.log('Overall PM2.5 average:', pm25.value);
        } else {
          console.log('No PM2.5 values found for average calculation');
        }
      } else {
        console.log('No valid PM2.5 data in response, using default values');
        // ถ้าไม่มีข้อมูล ใช้ค่าเริ่มต้น
        pm25Locations.value = [
          { name: "คณะ ICT", value: "0" },
          { name: "หอใน", value: "0" },
          { name: "อาคารเรียน PKY", value: "0" },
          { name: "คณะวิศวกรรมศาสตร์", value: "0" },
          { name: "อาคารเรียน UB", value: "0" },
          { name: "คณะสาธารณสุขศาสตร์", value: "0" },
          { name: "โรงเรียนสาธิตม.พะเยา", value: "0" },
          { name: "โรงพยาบาลมหาวิทยาลัยพะเยา", value: "0" }
        ];
      }
    } catch (error) {
      console.error('Error fetching PM2.5 locations data:', error);
      // กรณีเกิด error ให้ใช้ค่าเริ่มต้น
      pm25Locations.value = [
        { name: "คณะ ICT", value: "0" },
        { name: "หอใน", value: "0" },
        { name: "อาคารเรียน PKY", value: "0" },
        { name: "คณะวิศวกรรมศาสตร์", value: "0" },
        { name: "อาคารเรียน UB", value: "0" },
        { name: "คณะสาธารณสุขศาสตร์", value: "0" },
        { name: "โรงเรียนสาธิตม.พะเยา", value: "0" },
        { name: "โรงพยาบาลมหาวิทยาลัยพะเยา", value: "0" }
      ];
    }

    lastUpdatedTime.value = new Date().toLocaleString("th-TH", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "Asia/Bangkok",
    });

=======
    // เรียกใช้ฟังก์ชันโหลดข้อมูลจาก localStorage
    loadPM25LocationsFromDB();
    
>>>>>>> 6a7b5f8d7470776736d56fc4b9399f50a0bed79e
  } catch (error) {
    console.error('Error fetching PM2.5 data:', error);
    errorMessage.value = error.message;
  } finally {
    isLoading.value = false;
  }
};

// ฟังก์ชันอัปเดตเวลา
const updateTime = () => {
  const now = new Date();
  lastUpdatedTime.value = new Date().toLocaleString("th-TH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "Asia/Bangkok",
  });
};

// ฟังก์ชันเริ่มการอัปเดตอัตโนมัติ
const startAutoUpdate = () => {
  // เริ่มการอัปเดตข้อมูล PM2.5 ทุกๆ 10 วินาที (เร็วขึ้น)
  updateIntervalPM25 = setInterval(fetchPM25Data, 10000);
  
  // เริ่มการอัปเดตเวลา ทุกๆ 1 วินาที (1,000 มิลลิวินาที)
  updateTime(); // เรียกใช้อัปเดตเวลาในตอนเริ่มต้น
  updateIntervalTime = setInterval(updateTime, 1000); // อัปเดตเวลา
};

// ฟังก์ชันสำหรับนำทางไปยังหน้า Login หรือ Dashboard
const navigateToLoginOrDashboard = () => {
  if (isLoggedIn.value) {
    // ถ้าล็อกอินแล้ว ไปที่หน้า Dashboard
    window.location.href = '/addminnn/Dashboard';
  } else {
    // ถ้ายังไม่ได้ล็อกอิน ไปที่หน้า Login
    window.location.href = '/addminnn/Login';
  }
};

onMounted(() => {
  fetchPM25Data();
  startAutoUpdate();
  
  // เพิ่ม event listener สำหรับการเปลี่ยนแปลงใน localStorage
  window.addEventListener('storage', (e) => {
    if (e.key === 'airQualityData') {
      loadPM25LocationsFromDB();
    }
  });
});

</script>
 
<template>
  <div class="header-background flex items-center justify-center text-black text-2xl font-bold p-4 relative">
    <div class="absolute top-1/4 left-0 right-0 text-center">
      <h1 class="text-3xl font-bold">แม่กา</h1>
      <h1 class="text-3xl font-bold">เมืองพะเยา, พะเยา</h1>
      <p class="text-lg">{{ lastUpdatedTime }} น.</p> <!-- แสดงเวลาล่าสุดที่อัปเดต -->
      <p class="text-sm">พิกัด : 19.0374, 99.9380</p>
    </div>
  </div>
 
  <div class="container mx-auto p-4 space-y-6 relative -mt-20">
    <!-- บล็อก PM2.5 เฉลี่ย 24 ชั่วโมง -->
    <div class="bg-white shadow-2xl rounded-lg p-6 text-center transform transition-all duration-300 hover:scale-105 hover:shadow-3xl h-[430px]">
      <h1 class="text-xl font-bold bg-custom-orange p-4 h-[58px] w-[350px] mx-auto text-center rounded-full">PM 2.5 เฉลี่ย 24 ชั่วโมง</h1>
      <div v-if="isLoading" class="text-gray-500">⏳ กำลังโหลดข้อมูล...</div>
      <div v-else-if="errorMessage" class="text-red-500">⚠️ {{ errorMessage }}</div>
      <div v-else>
        <div class="flex items-center justify-center gap-x-96 mt-5">
          <div class="flex items-center flex-col space-y-4">
            <img src="http://chihirowada.com/wp-content/uploads/2021/11/%E3%83%9E%E3%82%B9%E3%82%AF%EF%BC%91-229x300.png" 
                alt="PM2.5" class="w-[100px] h-[120px]">
                <div class="mt-5 p-2 text-black font-bold rounded-2xl w-[200px] h-[50px] flex items-center justify-center"
                    :class="{
                    'bg-custom-green': pm25 <= 25,
                    'bg-custom-yellow': pm25 > 25 && pm25 <= 37,
                    'bg-custom-red': pm25 > 37 && pm25 <= 75
                  }">
                  {{ pm25 <= 25 ? 'คุณภาพอากาศดี' : pm25 > 25 && pm25 <= 37 ? 'คุณภาพอากาศปานกลาง' : pm25 > 37 && pm25 <= 75 ? 'เริ่มมีผลต่อสุขภาพ' : 'ไม่ดี' }}
                </div>
          </div>
          <div class="text-right">
            <div class="text-orange-500 text-5xl font-bold">{{ pm25 }}</div>
            <p class="text-lg">ug/m³</p>
          </div>  
        </div>

        <p class="mt-5 bg-gray-200 p-2 rounded-lg font-bold w-[700px] h-[48px] text-center mx-auto">หลีกเลี่ยงกิจกรรมกลางแจ้ง สวมหน้ากาก</p>
        <p class="text-sm text-gray-500 mt-2">อัปเดตล่าสุด: {{ lastUpdatedTime }}</p>
        <p class="text-xs text-blue-500">(ข้อมูลจาก API จะอัพเดตอัตโนมัติทุก 10 วินาที)</p>

        <!-- ปุ่มดูลำดับค่า PM2.5 ตามสถานที่ -->
        <div class="mt-4">
          <router-link to="/pm25-ranking" class="bg-orange-500 hover:bg-orange-600 text-white py-2 px-6 rounded-full inline-flex items-center transition-all">
            <span>ดูลำดับค่าฝุ่นเฉลี่ยรายช่วงกายในมหาวิทยาลัยพะเยา</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </router-link>
        </div>
      </div>
    </div>
 
    <!-- PM2.5 รายชั่วโมง -->
    <div class="bg-white shadow-2xl rounded-lg p-4 transform transition-all duration-300 hover:scale-105 hover:shadow-3xl h-[370px]">
      <h2 class="text-lg font-bold mt-4 mb-4 bg-custom-orange p-4 h-[58px] w-[350px] mx-auto text-center rounded-full">PM 2.5 รายชั่วโมง (ug/m³)</h2>
      <div class="flex justify-center gap-4">
        <div v-for="entry in pm25Hourly" :key="entry.time" 
            class="p-4 bg-custom-blue rounded-lg text-center transform transition-all duration-300 hover:scale-110 w-[200px] flex flex-col items-center">
          <!-- เวลา -->
          <p class="text-xl font-bold">{{ entry.time }}</p>
          <!-- รูปภาพ -->
          <img src="http://chihirowada.com/wp-content/uploads/2021/11/%E3%83%9E%E3%82%B9%E3%82%AF%EF%BC%91-229x300.png" 
              alt="PM2.5 Hourly" class="w-12 h-16 mx-auto mb-2">
          <!-- ค่า PM2.5 -->
          <p class="mt-3 p-2 text-black font-bold bg-custom-orange h-[40px] w-[71px] rounded-lg flex items-center justify-center">
            {{ entry.value }}
          </p>
        </div>
      </div>
    </div>
 
    <!-- ลำดับค่าฝุ่น -->
    <div class="bg-white shadow-2xl rounded-lg p-3 transform transition-all duration-300 hover:scale-105 hover:shadow-3xl h-[370px]">
      <h2 class="text-lg mt-4 font-bold mb-4 text-center">ลำดับค่าฝุ่นเฉลี่ยรายชั่วโมงภายในมหาวิทยาลัยพะเยา</h2>
      
      <div class="flex justify-center">
        <div class="grid grid-cols-2 gap-6">
          <div v-for="(location, index) in pm25Locations" 
              :key="location.name" 
              class="flex justify-between items-center p-4 bg-custom-orange rounded-2xl text-md font-bold transform transition-all duration-300 hover:scale-105 w-[500px] h-[65px]">
            <span>{{ index + 1 }}: {{ location.name }}</span>
            <span class="font-bold text-lg">{{ location.value }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
  
 
 
  <div class="fixed bottom-0 left-0 w-full h-[75px] bg-custom-gray text-white p-2 ">
    <div class="flex justify-around">
      <router-link to="/" class="no-underline">
        <button class="flex flex-col items-center text-custom-blue2 font-bold mt-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" stroke-width="1.5" stroke="currentColor" class="size-7" fill="#0E0069">
            <path d="M543.8 287.6c17 0 32-14 32-32.1c1-9-3-17-11-24L512 185l0-121c0-17.7-14.3-32-32-32l-32 0c-17.7 0-32 14.3-32 32l0 36.7L309.5 7c-6-5-14-7-21-7s-15 1-22 8L10 231.5c-7 7-10 15-10 24c0 18 14 32.1 32 32.1l32 0 0 69.7c-.1 .9-.1 1.8-.1 2.8l0 112c0 22.1 17.9 40 40 40l16 0c1.2 0 2.4-.1 3.6-.2c1.5 .1 3 .2 4.5 .2l31.9 0 24 0c22.1 0 40-17.9 40-40l0-24 0-64c0-17.7 14.3-32 32-32l64 0c17.7 0 32 14.3 32 32l0 64 0 24c0 22.1 17.9 40 40 40l24 0 32.5 0c1.4 0 2.8 0 4.2-.1c1.1 .1 2.2 .1 3.3 .1l16 0c22.1 0 40-17.9 40-40l0-16.2c.3-2.6 .5-5.3 .5-8.1l-.7-160.2 32 0z"/></svg>
          <span>หน้าหลัก</span>
        </button>
      </router-link>
     
     
      <router-link to="/Homeview2" class="no-underline">
        <button class="flex flex-col items-center text-black font-bold mt-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" stroke-width="1.5" stroke="currentColor" class="size-7">
            <path d="M160 80c0-26.5 21.5-48 48-48l32 0c26.5 0 48 21.5 48 48l0 352c0 26.5-21.5 48-48 48l-32 0c-26.5 0-48-21.5-48-48l0-352zM0 272c0-26.5 21.5-48 48-48l32 0c26.5 0 48 21.5 48 48l0 160c0 26.5-21.5 48-48 48l-32 0c-26.5 0-48-21.5-48-48L0 272zM368 96l32 0c26.5 0 48 21.5 48 48l0 288c0 26.5-21.5 48-48 48l-32 0c-26.5 0-48-21.5-48-48l0-288c0-26.5 21.5-48 48-48z"/></svg>
          <span>สถิติ</span>
        </button>
      </router-link>

      <router-link to="/Homeview4" class="no-underline">
        <button class="flex flex-col items-center text-black font-bold mt-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" stroke-width="1.5" stroke="currentColor" class="size-7"> 
            <path d="M32 144c0 79.5 64.5 144 144 144l123.3 0c22.6 19.9 52.2 32 84.7 32s62.1-12.1 84.7-32l27.3 0c61.9 0 112-50.1 112-112s-50.1-112-112-112c-10.7 0-21 1.5-30.8 4.3C443.8 27.7 401.1 0 352 0c-32.6 0-62.4 12.2-85.1 32.3C242.1 12.1 210.5 0 176 0C96.5 0 32 64.5 32 144zM616 368l-336 0c-13.3 0-24 10.7-24 24s10.7 24 24 24l336 0c13.3 0 24-10.7 24-24s-10.7-24-24-24zm-64 96l-112 0c-13.3 0-24 10.7-24 24s10.7 24 24 24l112 0c13.3 0 24-10.7 24-24s-10.7-24-24-24zm-192 0L24 464c-13.3 0-24 10.7-24 24s10.7 24 24 24l336 0c13.3 0 24-10.7 24-24s-10.7-24-24-24zM224 392c0-13.3-10.7-24-24-24L96 368c-13.3 0-24 10.7-24 24s10.7 24 24 24l104 0c13.3 0 24-10.7 24-24z"/></svg>
          <span>สารมลพิษอื่นๆ</span>
        </button>
      </router-link>

      <router-link to="/Homeview5" class="no-underline">
        <button class="flex flex-col items-center text-black font-bold mt-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path d="M0 96C0 78.3 14.3 64 32 64l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 128C14.3 128 0 113.7 0 96zM0 256c0-17.7 14.3-32 32-32l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 288c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32L32 448c-17.7 0-32-14.3-32-32s14.3-32 32-32l384 0c17.7 0 32 14.3 32 32z"/></svg>
          <span>เกี่ยวกับเรา</span>
        </button>
      </router-link>

      <!-- ปรับปุ่มล็อกอิน/แดชบอร์ดให้ใช้ router-link แทน -->
      <router-link :to="isLoggedIn ? '/addminnn/Dashboard' : '/addminnn/Login'" class="no-underline">
        <button class="flex flex-col items-center text-black font-bold mt-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="black" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          </svg>
          <span>{{ isLoggedIn ? 'แดชบอร์ด' : 'เข้าสู่ระบบ' }}</span>
        </button>
      </router-link>
    </div>
  </div>
</template>
 
<style scoped>
.header-background {
  width: 100%;
  height: 400px;
  background-image: url('https://media.thairath.co.th/image/q03GjDy2QTbVPe5TnA1CMU0OpFnw2hTcaYQGUUOB8OMe9vA1.jpg');
  background-size: cover;
  background-position: center;
}
.bg-custom-green {
  background-color: #7EB06D;
  color: #000000;
}
.bg-custom-yellow {
  background-color: #ffd000;
  color: #000000;
}.bg-custom-red {
  background-color: #ff4f4f;
  color: #000000;
}
</style>