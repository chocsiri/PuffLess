<script setup>
import { ref, onMounted, watch } from "vue";
import Chart from "chart.js/auto";

const pm25 = ref(null);
const lastUpdatedTime = ref(null); // เก็บเวลาที่อัปเดตล่าสุด
const pm25History = ref([]);
const isLoading = ref(true);
const errorMessage = ref(null);
const chartCanvas = ref(null);
let chartInstance = null; // เก็บ instance ของกราฟ

const fetchPM25Data = async () => {
  const apiKey = "a1bfffc563959672387f02e517ea1a60";
  const lat = 19.0292;
  const lon = 99.8976;

  const end = Math.floor(Date.now() / 1000); // เวลาปัจจุบัน (UNIX timestamp)
  const start = end - 7 * 24 * 60 * 60; // ย้อนหลัง 7 วัน

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

    pm25History.value = data.list.reduce((acc, entry) => {
      const date = new Date(entry.dt * 1000);
      const day = date.toLocaleDateString("th-TH", { day: "2-digit", month: "short" });

      let existingEntry = acc.find(item => item.date === day);
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

watch(pm25History, () => {
  renderChart();
});

onMounted(() => {
  fetchPM25Data().then(() => renderChart());
});
</script>

<template>
  
  <div class="bg-white shadow-lg rounded-lg p-6 mt-6">
    <h2 class="text-lg font-bold mb-4 text-center">ประวัติค่า PM2.5 (รายวัน)</h2>
    <div class="w-full max-w-full mx-auto h-[400px]">
      <canvas ref="chartCanvas" class="w-full h-full"></canvas>
    </div>
  </div>

 
  <div class="fixed bottom-0 left-0 w-full bg-gray-800 text-white">
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
.material-icons {
  font-size: 24px;
}

.fixed {
  position: fixed;
}
.bottom-0 {
  bottom: 0;
}
.left-0 {
  left: 0;
}
.w-full {
  width: 100%;
}
.bg-gray-800 {
  background-color: #2d3748;
}
.text-white {
  color: white;
}
.p-4 {
  padding: 1rem;
}
.flex {
  display: flex;
}
.justify-between {
  justify-content: space-between;
}
.items-center {
  align-items: center;
}
.flex-col {
  flex-direction: column;
}
</style>
