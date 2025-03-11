<script setup>
import { ref, onMounted, watch } from "vue";
import Chart from "chart.js/auto";
import axios from "axios";

const lastUpdatedTime = ref(null);
const pm25History = ref([]);
const pm25Locations = ref([]);
const isLoading = ref(true);
const errorMessage = ref(null);
const chartCanvas = ref(null);
let chartInstance = null;

const fetchPM25Data = async () => {
  try {
    // ดึงข้อมูลจาก API ภายในที่ admin กรอกเท่านั้น
    const response = await axios.get('http://localhost:8000/api/air-quality');
    
    if (!response.data || response.data.length === 0) {
      throw new Error("ไม่มีข้อมูล PM2.5 จากระบบ");
    }

    // จัดกลุ่มข้อมูลตามสถานที่และเวลา
    const locationGroups = {};
    const timeSeriesData = {};
    
    // วนลูปข้อมูลทั้งหมดและจัดกลุ่มตามสถานที่
    response.data.forEach(item => {
      // กลุ่มข้อมูลสำหรับคำนวณค่าเฉลี่ย
      if (!locationGroups[item.location]) {
        locationGroups[item.location] = [];
      }
      locationGroups[item.location].push(parseFloat(item.value));
      
      // กลุ่มข้อมูลสำหรับแสดงกราฟตามเวลา
      if (!timeSeriesData[item.location]) {
        timeSeriesData[item.location] = [];
      }
      
      const timestamp = new Date(item.timestamp);
      const hour = timestamp.getHours();
      
      timeSeriesData[item.location].push({
        time: `${hour}:00`,
        value: parseFloat(item.value),
        timestamp: timestamp
      });
    });
    
    // คำนวณค่าเฉลี่ยของแต่ละสถานที่
    const locationAverages = [];
    for (const location in locationGroups) {
      const values = locationGroups[location];
      const sum = values.reduce((total, val) => total + val, 0);
      const avg = values.length > 0 ? sum / values.length : 0;
      const maxValue = values.length > 0 ? Math.max(...values) : 0;
      const minValue = values.length > 0 ? Math.min(...values) : 0;
      
      locationAverages.push({
        name: location,
        value: avg,
        max: maxValue,
        min: minValue,
        count: values.length
      });
    }
    
    // เรียงลำดับตามค่าเฉลี่ยจากมากไปน้อย
    pm25Locations.value = locationAverages.sort((a, b) => b.value - a.value);
    
    // หากไม่มีข้อมูลบางสถานที่ ให้เพิ่มเข้าไปด้วยค่าเป็น 0
    const allLocations = [
      "คณะ ICT", 
      "โรงพยาบาลมหาวิทยาลัยพะเยา", 
      "คณะสาธารณสุขศาสตร์", 
      "อาคารเรียนรวม(PKY)", 
      "อาคารพระอุบาลี(UB)", 
      "UP Dorm"
    ];
    
    allLocations.forEach(location => {
      if (!pm25Locations.value.some(item => item.name === location)) {
        pm25Locations.value.push({
          name: location,
          value: 0,
          max: 0,
          min: 0,
          count: 0
        });
      }
    });
    
    // เรียงลำดับอีกครั้งหลังจากเพิ่มข้อมูลที่ขาดหายไป
    pm25Locations.value = pm25Locations.value.sort((a, b) => b.value - a.value);
    
    // เตรียมข้อมูลสำหรับแสดงกราฟ (ใช้ข้อมูลจากสถานที่แรกในรายการ)
    if (pm25Locations.value.length > 0) {
      const firstLocation = pm25Locations.value[0].name;
      if (timeSeriesData[firstLocation]) {
        // เรียงข้อมูลตามเวลา
        timeSeriesData[firstLocation].sort((a, b) => a.timestamp - b.timestamp);
        
        // นำ 24 รายการล่าสุดมาแสดง
        pm25History.value = timeSeriesData[firstLocation].slice(-24);
        
        // ตั้งค่าเวลาที่อัปเดตล่าสุด
        if (pm25History.value.length > 0) {
          const lastIndex = pm25History.value.length - 1;
          const lastTimestamp = timeSeriesData[firstLocation][lastIndex].timestamp;
          lastUpdatedTime.value = lastTimestamp.toLocaleTimeString("th-TH", {
            hour: "2-digit",
            minute: "2-digit",
          });
        }
      }
    }
    
    isLoading.value = false;
    
  } catch (error) {
    console.error('Error fetching PM2.5 data from API:', error);
    errorMessage.value = 'ไม่สามารถดึงข้อมูล PM2.5 จากระบบได้';
    isLoading.value = false;

    // กรณีไม่สามารถเชื่อมต่อกับ API ได้ ให้แสดงข้อมูลจำลอง
    pm25Locations.value = [
      { name: "คณะ ICT", value: 101.7, max: 120, min: 90, count: 24 },
      { name: "โรงพยาบาลมหาวิทยาลัยพะเยา", value: 120.0, max: 135, min: 105, count: 24 },
      { name: "คณะสาธารณสุขศาสตร์", value: 85.3, max: 95, min: 75, count: 24 },
      { name: "อาคารเรียนรวม(PKY)", value: 95.5, max: 110, min: 85, count: 24 },
      { name: "อาคารพระอุบาลี(UB)", value: 90.0, max: 105, min: 80, count: 24 },
      { name: "UP Dorm", value: 105.2, max: 125, min: 95, count: 24 }
    ].sort((a, b) => b.value - a.value);
    
    // สร้างข้อมูลจำลองสำหรับกราฟ
    pm25History.value = [];
    for (let i = 0; i < 24; i++) {
      const hour = i % 24;
      const value = Math.floor(Math.random() * 50) + 80; // สุ่มค่าระหว่าง 80-130
      pm25History.value.push({
        time: `${hour}:00`,
        value: value
      });
    }
    
    lastUpdatedTime.value = new Date().toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
};

const renderChart = () => {
  if (!chartCanvas.value) return;

  if (chartInstance) chartInstance.destroy();

  const colors = [
    "rgba(255, 99, 132, 0.6)",
    "rgba(54, 162, 235, 0.6)",
    "rgba(255, 206, 86, 0.6)",
    "rgba(75, 192, 192, 0.6)",
    "rgba(153, 102, 255, 0.6)",
    "rgba(255, 159, 64, 0.6)",
    "rgba(255, 99, 132, 0.6)",
  ];

  chartInstance = new Chart(chartCanvas.value, {
    type: "line",
    data: {
      labels: pm25History.value.map((d) => d.time),
      datasets: [
        {
          label: "PM2.5 (µg/m³)",
          data: pm25History.value.map((d) => d.value),
          backgroundColor: "rgba(54, 162, 235, 0.6)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true },
      },
    },
  });
};

watch(pm25History, () => {
  renderChart();
});

onMounted(() => {
  fetchPM25Data().then(() => renderChart());
});
</script>

<template>
  <div class="header-background flex items-center justify-center text-black text-2xl font-bold p-4 relative">
    <div class="absolute top-1/4 left-0 right-0 text-center">
      <h1 class="text-3xl font-bold">ปริมาณฝุ่น PM 2.5</h1>
      <h1 class="text-xl font-bold">ค่าเฉลี่ยรายชั่วโมง</h1>
    </div>
  </div>

  <div class="container mx-auto p-4 space-y-6 relative">
    <div class="bg-white shadow-2xl rounded-lg p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-3xl h-[660px]">
      <h1 class="text-2xl font-bold ml-7 mt-5">ปริมาณฝุ่นย้อนหลังรายชั่วโมง</h1>
      <h2 class="text-xl font-bold ml-7 mt-2">แม่กา เมืองพะเยา, พะเยา</h2>
      <h2 class="text-lg font-bold mb-4 text-center mt-8">ประวัติค่า PM2.5 (รายชั่วโมง)</h2>
      <div v-if="pm25History.length > 0" class="w-full max-w-full mx-auto h-[400px]">
        <canvas ref="chartCanvas" class="w-full h-full"></canvas>
      </div>
      <div v-else class="w-full max-w-full mx-auto h-[400px] flex items-center justify-center">
        <p class="text-lg text-gray-500">ไม่พบข้อมูลประวัติค่า PM2.5 จากฐานข้อมูล</p>
      </div>
    </div>

    <div class="bg-white shadow-2xl rounded-lg p-3 transform transition-all duration-300 hover:scale-105 hover:shadow-3xl h-[700px]">
      <h2 class="text-lg font-bold mt-8 mb-4 text-center">อันดับค่าเฉลี่ย<br>PM 2.5</h2>
      <div v-if="pm25Locations.length > 0">
        <div class="flex justify-between items-center mt-16 mb-4 font-bold">
          <span class="ml-56 bg-custom-gray2 p-2 rounded-full">อันดับ</span>
          <span class="mr-56 bg-custom-gray2 p-2 rounded-full">ug/m³</span>
        </div>
        <div class="flex justify-center">
          <div class="space-y-2">
            <div v-for="(location, index) in pm25Locations" :key="location.name" class="flex justify-between p-4 bg-custom-orange rounded-2xl text-md font-bold duration-300 hover:scale-105 w-[1030px]">
              <span>{{ index + 1 }}: {{ location.name }}</span>
              <span class="font-bold text-lg">{{ location.value.toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="flex items-center justify-center h-[500px]">
        <p class="text-lg text-gray-500">ไม่พบข้อมูลค่าเฉลี่ย PM2.5 จากฐานข้อมูล</p>
      </div>
    </div>
  </div>

  <div class="fixed bottom-0 left-0 w-full h-[75px] bg-custom-gray text-white p-2 ">
    <div class="flex justify-around">
      <router-link to="/">
      <button class="flex flex-col items-center text-black font-bold mt-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" stroke-width="1.5" stroke="currentColor" class="size-7">
          <path d="M543.8 287.6c17 0 32-14 32-32.1c1-9-3-17-11-24L512 185l0-121c0-17.7-14.3-32-32-32l-32 0c-17.7 0-32 14.3-32 32l0 36.7L309.5 7c-6-5-14-7-21-7s-15 1-22 8L10 231.5c-7 7-10 15-10 24c0 18 14 32.1 32 32.1l32 0 0 69.7c-.1 .9-.1 1.8-.1 2.8l0 112c0 22.1 17.9 40 40 40l16 0c1.2 0 2.4-.1 3.6-.2c1.5 .1 3 .2 4.5 .2l31.9 0 24 0c22.1 0 40-17.9 40-40l0-24 0-64c0-17.7 14.3-32 32-32l64 0c17.7 0 32 14.3 32 32l0 64 0 24c0 22.1 17.9 40 40 40l24 0 32.5 0c1.4 0 2.8 0 4.2-.1c1.1 .1 2.2 .1 3.3 .1l16 0c22.1 0 40-17.9 40-40l0-16.2c.3-2.6 .5-5.3 .5-8.1l-.7-160.2 32 0z"/></svg>
        <span>หน้าหลัก</span>
      </button>
    </router-link>
     
     
      <router-link to="/Homeview2">
        <button class="flex flex-col items-center text-custom-blue2 font-bold mt-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" stroke-width="1.5" stroke="currentColor" class="size-7" fill="#0E0069">
            <path d="M160 80c0-26.5 21.5-48 48-48l32 0c26.5 0 48 21.5 48 48l0 352c0 26.5-21.5 48-48 48l-32 0c-26.5 0-48-21.5-48-48l0-352zM0 272c0-26.5 21.5-48 48-48l32 0c26.5 0 48 21.5 48 48l0 160c0 26.5-21.5 48-48 48l-32 0c-26.5 0-48-21.5-48-48L0 272zM368 96l32 0c26.5 0 48 21.5 48 48l0 288c0 26.5-21.5 48-48 48l-32 0c-26.5 0-48-21.5-48-48l0-288c0-26.5 21.5-48 48-48z"/></svg>
          <span>สถิติ</span>
        </button>
      </router-link>


      <router-link to="/Homeview4">
      <button class="flex flex-col items-center text-black font-bold mt-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" stroke-width="1.5" stroke="currentColor" class="size-7"> 
          <path d="M32 144c0 79.5 64.5 144 144 144l123.3 0c22.6 19.9 52.2 32 84.7 32s62.1-12.1 84.7-32l27.3 0c61.9 0 112-50.1 112-112s-50.1-112-112-112c-10.7 0-21 1.5-30.8 4.3C443.8 27.7 401.1 0 352 0c-32.6 0-62.4 12.2-85.1 32.3C242.1 12.1 210.5 0 176 0C96.5 0 32 64.5 32 144zM616 368l-336 0c-13.3 0-24 10.7-24 24s10.7 24 24 24l336 0c13.3 0 24-10.7 24-24s-10.7-24-24-24zm-64 96l-112 0c-13.3 0-24 10.7-24 24s10.7 24 24 24l112 0c13.3 0 24-10.7 24-24s-10.7-24-24-24zm-192 0L24 464c-13.3 0-24 10.7-24 24s10.7 24 24 24l336 0c13.3 0 24-10.7 24-24s-10.7-24-24-24zM224 392c0-13.3-10.7-24-24-24L96 368c-13.3 0-24 10.7-24 24s10.7 24 24 24l104 0c13.3 0 24-10.7 24-24z"/></svg>
        <span>สารมลพิษอื่นๆ</span>
      </button>
      </router-link>
      
      <router-link to="/Homeview5">
      <button class="flex flex-col items-center text-black font-bold mt-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" stroke-width="1.5" stroke="currentColor" class="size-6">
          <path d="M0 96C0 78.3 14.3 64 32 64l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 128C14.3 128 0 113.7 0 96zM0 256c0-17.7 14.3-32 32-32l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 288c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32L32 448c-17.7 0-32-14.3-32-32s14.3-32 32-32l384 0c17.7 0 32 14.3 32 32z"/></svg>
        <span>เกี่ยวกับเรา</span>
      </button>
    </router-link>

    <router-link to="/Login">
        <button class="flex flex-col items-center text-black font-bold mt-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="black" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          </svg>
          <span>เข้าสู่ระบบ</span>
        </button>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.header-background {
  width: 100%;
  height: 300px;
  background-image: url('https://media.thairath.co.th/image/q03GjDy2QTbVPe5TnA1CMU0OpFnw2hTcaYQGUUOB8OMe9vA1.jpg');
  background-size: cover;
  background-position: center;
}

.bg-custom-gray-light {
  background-color: #fafafa;
}

.fixed {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 75px;
  
  color: #ffffff;
  padding: 15px;
}
.bg-custom-gray2 {
  background-color: #D9D9D9;
  color: rgb(0, 0, 0);
}
</style>