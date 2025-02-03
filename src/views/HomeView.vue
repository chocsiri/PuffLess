<script setup>
import { ref, onMounted, watch } from "vue";
import Chart from "chart.js/auto";

const pm25 = ref(null);
const lastUpdatedTime = ref(null);
const pm25History = ref([]);
const isLoading = ref(true);
const errorMessage = ref(null);
const chartCanvas = ref(null);
let chartInstance = null;
let updateInterval = null;
let timeInterval = null; // สำหรับอัปเดตเวลา

const fetchPM25Data = async () => {
  const apiKey = "a1bfffc563959672387f02e517ea1a60";
  const lat = 19.0292;
  const lon = 99.8976;

  const end = Math.floor(Date.now() / 1000);
  const start = end - 7 * 24 * 60 * 60;

  const apiUrl = `https://api.openweathermap.org/data/2.5/air_pollution/history?lat=${lat}&lon=${lon}&start=${start}&end=${end}&appid=${apiKey}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error("ไม่สามารถดึงข้อมูล AQI ได้");

    const data = await response.json();
    if (!data.list || data.list.length === 0) throw new Error("ไม่มีข้อมูล PM2.5");

    pm25.value = data.list[data.list.length - 1].components.pm2_5;
    lastUpdatedTime.value = new Date();

    pm25History.value = data.list.reduce((acc, entry) => {
      const date = new Date(entry.dt * 1000);
      const day = date.toLocaleDateString("th-TH", { day: "2-digit", month: "short" });

      let existingEntry = acc.find((item) => item.date === day);
      if (existingEntry) {
        existingEntry.value = Math.max(existingEntry.value, entry.components.pm2_5);
      } else {
        acc.push({
          date: day,
          value: entry.components.pm2_5,
        });
      }
      return acc;
    }, []);
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
    type: "bar",
    data: {
      labels: pm25History.value.map((d) => d.date),
      datasets: [
        {
          label: "PM2.5 (µg/m³)",
          data: pm25History.value.map((d) => d.value),
          backgroundColor: barColors,
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
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

// ตั้งให้ดึงข้อมูลใหม่ทุก 5 นาที
const startAutoUpdate = () => {
  if (updateInterval) clearInterval(updateInterval);
  updateInterval = setInterval(fetchPM25Data, 300000); // 5 นาที
};

// อัปเดตเวลา
const updateTime = () => {
  lastUpdatedTime.value = new Date();
};

// ทุก ๆ 1 วินาทีจะอัปเดตเวลา
const startTimeUpdate = () => {
  if (timeInterval) clearInterval(timeInterval);
  timeInterval = setInterval(updateTime, 1000); // ทุกๆ 1 วินาที
};

// ดูค่า pm25 ถ้าเปลี่ยนให้ UI อัปเดตอัตโนมัติ
watch(pm25, () => {
  console.log("อัปเดตค่า PM2.5:", pm25.value);
});

// ถ้าข้อมูลใน pm25History เปลี่ยน ให้เรนเดอร์กราฟใหม่
watch(pm25History, () => {
  renderChart();
});

onMounted(() => {
  fetchPM25Data().then(() => {
    renderChart();
    startAutoUpdate(); // เริ่มอัปเดตข้อมูลอัตโนมัติ
    startTimeUpdate(); // เริ่มอัปเดตเวลา
  });
});
</script>

<template>
  <div class="header-background flex items-center justify-center text-white text-2xl font-bold">
    University of Phayao PM 2.5
  </div>

  <div class="container mx-auto p-4 space-y-6">
    <div class="bg-white shadow-lg rounded-lg p-6 text-center">
      <h1 class="text-xl font-bold">PM 2.5 เฉลี่ย 24 ชั่วโมง</h1>
      <div v-if="isLoading" class="text-gray-500">⏳ กำลังโหลดข้อมูล...</div>
      <div v-else-if="errorMessage" class="text-red-500">⚠️ {{ errorMessage }}</div>
      <div v-else>
        <div class="text-orange-500 text-5xl font-bold">{{ pm25 }}</div>
        <p class="text-lg">ug/m³</p>
        <div class="mt-4 p-2 bg-yellow-400 text-white font-bold rounded">
          เริ่มมีผลต่อสุขภาพ
        </div>
        <p class="mt-2 bg-gray-200 p-2 rounded">หลีกเลี่ยงกิจกรรมกลางแจ้ง สวมหน้ากาก</p>
        <p class="text-sm text-gray-500 mt-2">อัปเดตล่าสุด: {{ lastUpdatedTime.toLocaleTimeString("th-TH") }}</p>
      </div>
    </div>

    <div class="bg-white shadow-md rounded-lg p-4">
      <h2 class="text-lg font-bold mb-4 text-center">ประวัติค่า PM2.5 (รายวัน)</h2>
      <div class="w-full max-w-full mx-auto h-[400px]">
        <canvas ref="chartCanvas" class="w-full h-full"></canvas>
      </div>
    </div>
  </div>

  <div class="fixed bottom-0 left-0 w-full bg-black text-white">
    <div class="flex justify-between p-4">
      <button class="flex flex-col items-center">
        <span class="material-icons">home</span>
        <span>หน้าหลัก</span>
      </button>
      <button class="flex flex-col items-center">
        <span class="material-icons">bar_chart</span>
        <span>สถิติ</span>
      </button>
      <button class="flex flex-col items-center">
        <span class="material-icons">map</span>
        <span>แผนที่</span>
      </button>
      <button class="flex flex-col items-center">
        <span class="material-icons">pollution</span>
        <span>สารมลพิษอื่นๆ</span>
      </button>
      <button class="flex flex-col items-center">
        <span class="material-icons">info</span>
        <span>เกี่ยวกับเรา</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.header-background {
  width: 100%;
  height: 400px; /* ปรับขนาดความสูงของ header ตามต้องการ */
  background: url("https://www.thaihealth.or.th/data/content/2019/10/50235/cms/newscms_thaihealth_c_cdelpqy24689.jpg") no-repeat center center;
  background-size: cover;
}
</style>

