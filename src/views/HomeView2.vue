<script setup>
import { ref, onMounted, watch } from "vue";
import Chart from "chart.js/auto";

const pm25 = ref(null);
const lastUpdatedTime = ref(null); // เก็บเวลาที่อัปเดตล่าสุด
const pm25History = ref([]);
const pm25Locations = ref([]);
const isLoading = ref(true);
const errorMessage = ref(null);
const chartCanvas = ref(null);
let chartInstance = null; // เก็บ instance ของกราฟ

const fetchPM25Data = async () => {
  const apiKey = "a1bfffc563959672387f02e517ea1a60";
  const lat = 19.0292;
  const lon = 99.8976;

  const end = Math.floor(Date.now() / 1000); // เวลาปัจจุบัน (UNIX timestamp)
  const start = end - 24 * 60 * 60; // ย้อนหลัง 24 ชั่วโมง

  const apiUrl = `https://api.openweathermap.org/data/2.5/air_pollution/history?lat=${lat}&lon=${lon}&start=${start}&end=${end}&appid=${apiKey}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error("ไม่สามารถดึงข้อมูล AQI ได้");

    const data = await response.json();
    if (!data.list || data.list.length === 0) throw new Error("ไม่มีข้อมูล PM2.5");

    pm25.value = data.list[data.list.length - 1].components.pm2_5;

    const timestamp = data.list[data.list.length - 1].dt;
    const date = new Date(timestamp * 1000);
    lastUpdatedTime.value = date.toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
    });

    // ปรับการคำนวณการแสดงผลจากรายวันเป็นรายชั่วโมง
    pm25History.value = data.list.map((entry) => {
      const date = new Date(entry.dt * 1000);
      const hour = date.getHours();  // ใช้ชั่วโมงเป็นตัวแสดงผล
      return {
        time: `${hour}:00`,  // แสดงเวลาเป็นชั่วโมง
        value: entry.components.pm2_5,
      };
    });

    // การคำนวณค่า PM2.5 สำหรับตำแหน่งต่าง ๆ
    const locations = [
      { name: "คณะ ICT", lat: 19.0292, lon: 99.8976 },
      { name: "หอใน", lat: 19.0245, lon: 99.8954 },
      { name: "อาคารเรียน PKY", lat: 19.0276, lon: 99.8921 },
      { name: "คณะวิศวกรรมศาสตร์", lat: 19.0304, lon: 99.8980 },
    ];

    const locationPromises = locations.map(async (location) => {
      const apiUrlForLocation = `https://api.openweathermap.org/data/2.5/air_pollution/history?lat=${location.lat}&lon=${location.lon}&start=${start}&end=${end}&appid=${apiKey}`;
      const response = await fetch(apiUrlForLocation);
      const data = await response.json();
      const pm25Values = data.list.map((entry) => entry.components.pm2_5);
      const averagePm25 = pm25Values.reduce((acc, value) => acc + value, 0) / pm25Values.length;
      return { name: location.name, value: averagePm25 };
    });

    // คำนวณค่าเฉลี่ย PM2.5 สำหรับแต่ละตำแหน่ง
    pm25Locations.value = await Promise.all(locationPromises);

  } catch (error) {
    errorMessage.value = error.message;
  } finally {
    isLoading.value = false;
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

  const barColors = pm25History.value.map((_, index) => colors[index % colors.length]);

  chartInstance = new Chart(chartCanvas.value, {
    type: "line", // เปลี่ยนเป็นกราฟเส้นเพื่อแสดงข้อมูลเป็นช่วงเวลา
    data: {
      labels: pm25History.value.map((d) => d.time), // แสดงเวลาเป็นข้อมูลบนแกน X
      datasets: [
        {
          label: "PM2.5 (µg/m³)",
          data: pm25History.value.map((d) => d.value),
          backgroundColor: "rgba(54, 162, 235, 0.6)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
          fill: false, // ปิดการเติมสีใต้เส้น
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

  <div class="container mx-auto p-4 space-y-6 relative -mt-20">
    <div class="bg-white shadow-2xl rounded-lg p-6 text-center transform transition-all duration-300 hover:scale-105 hover:shadow-3xl">
      <h2 class="text-lg font-bold mb-4 text-center">ประวัติค่า PM2.5 (รายวัน)</h2>
      <div class="w-full max-w-full mx-auto h-[400px]">
        <canvas ref="chartCanvas" class="w-full h-full"></canvas>
      </div>
    </div>

    <div class="bg-white shadow-2xl rounded-lg p-3 transform transition-all duration-300 hover:scale-105 hover:shadow-3xl h-[420px]">
      <h2 class="text-lg font-bold mb-4 text-center">อันดับค่าเฉลี่ย<br>PM 2.5</h2>
      <h2 class="text-lg font-bold mb-4 text-center"></h2>
      <div class="flex justify-center">
        <div class="space-y-2">
          <div v-for="(location, index) in pm25Locations" :key="location.name" class="flex justify-between p-4 bg-custom-orange rounded-2xl text-md font-bold duration-300 hover:scale-105 w-[900px]">
            <span>{{ index + 1 }}: {{ location.name }}</span>
            <span class="font-bold text-lg">{{ location.value.toFixed(2) }}</span>
          </div>
        </div>
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
      
      <router-link to="/Homeview3">
      <button class="flex flex-col items-center text-black font-bold mt-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" stroke-width="1.5" stroke="currentColor" class="size-7"> <path d="M384 476.1L192 421.2l0-385.3L384 90.8l0 385.3zm32-1.2l0-386.5L543.1 37.5c15.8-6.3 32.9 5.3 32.9 22.3l0 334.8c0 9.8-6 18.6-15.1 22.3L416 474.8zM15.1 95.1L160 37.2l0 386.5L32.9 474.5C17.1 480.8 0 469.2 0 452.2L0 117.4c0-9.8 6-18.6 15.1-22.3z"/></svg>
        <span>แผนที่</span>
      </button>
      </router-link>

      <button class="flex flex-col items-center text-black font-bold mt-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" stroke-width="1.5" stroke="currentColor" class="size-7"> 
          <path d="M32 144c0 79.5 64.5 144 144 144l123.3 0c22.6 19.9 52.2 32 84.7 32s62.1-12.1 84.7-32l27.3 0c61.9 0 112-50.1 112-112s-50.1-112-112-112c-10.7 0-21 1.5-30.8 4.3C443.8 27.7 401.1 0 352 0c-32.6 0-62.4 12.2-85.1 32.3C242.1 12.1 210.5 0 176 0C96.5 0 32 64.5 32 144zM616 368l-336 0c-13.3 0-24 10.7-24 24s10.7 24 24 24l336 0c13.3 0 24-10.7 24-24s-10.7-24-24-24zm-64 96l-112 0c-13.3 0-24 10.7-24 24s10.7 24 24 24l112 0c13.3 0 24-10.7 24-24s-10.7-24-24-24zm-192 0L24 464c-13.3 0-24 10.7-24 24s10.7 24 24 24l336 0c13.3 0 24-10.7 24-24s-10.7-24-24-24zM224 392c0-13.3-10.7-24-24-24L96 368c-13.3 0-24 10.7-24 24s10.7 24 24 24l104 0c13.3 0 24-10.7 24-24z"/></svg>
        <span>สารมลพิษอื่นๆ</span>
      </button>
      
      <router-link to="/Homeview5">
      <button class="flex flex-col items-center text-black font-bold mt-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" stroke-width="1.5" stroke="currentColor" class="size-6">
          <path d="M0 96C0 78.3 14.3 64 32 64l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 128C14.3 128 0 113.7 0 96zM0 256c0-17.7 14.3-32 32-32l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 288c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32L32 448c-17.7 0-32-14.3-32-32s14.3-32 32-32l384 0c17.7 0 32 14.3 32 32z"/></svg>
        <span>เกี่ยวกับเรา</span>
      </button>
    </router-link>
    </div>
  </div>
</template>

<style scoped>
.header-background {
  width: 100%;
  height: 300px;
  background-image: url('https://www.thaihealth.or.th/data/content/2019/10/50235/cms/newscms_thaihealth_c_cdelpqy24689.jpg');
  background-size: cover;
  background-position: center;
}




.bg-custom-orange {
  background-color: #ffba0c;
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
</style>
