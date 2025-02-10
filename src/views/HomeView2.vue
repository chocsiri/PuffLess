<script setup>
import { ref, onMounted, watchEffect } from "vue";

const pm25Hourly = ref([]);
const pm25Locations = ref([]);
const isLoading = ref(true);
const errorMessage = ref(null);

const fetchStatisticsData = async () => {
  isLoading.value = true;
  const apiKey = "a1bfffc563959672387f02e517ea1a60";
  const lat = 19.0292;
  const lon = 99.8976;
  const end = Math.floor(Date.now() / 1000);
  const start = end - 24 * 60 * 60;
  const apiUrl = `https://api.openweathermap.org/data/2.5/air_pollution/history?lat=${lat}&lon=${lon}&start=${start}&end=${end}&appid=${apiKey}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error("ไม่สามารถดึงข้อมูล AQI ได้");

    const data = await response.json();
    if (!data.list || data.list.length === 0) throw new Error("ไม่มีข้อมูล PM2.5");

    pm25Hourly.value = data.list.slice(-5).map((entry) => ({
      time: new Date(entry.dt * 1000).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }),
      value: entry.components.pm2_5,
    }));

    pm25Locations.value = [
      { name: "คณะ ICT", value: 62.2 },
      { name: "คณะวิศวกรรมศาสตร์", value: 60.3 },
      { name: "หอใน", value: 58.3 },
      { name: "อาคารเรียน PKY", value: 51.9 },
    ];
  } catch (error) {
    console.error("API Fetch Error:", error);
    errorMessage.value = error.message || "เกิดข้อผิดพลาดในการดึงข้อมูล";
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchStatisticsData);

// Variables to store the min and max values
const minPm25 = ref(null);
const maxPm25 = ref(null);

// Watch for changes in pm25Hourly to update min and max PM2.5 values
watchEffect(() => {
  if (pm25Hourly.value.length > 0) {
    const values = pm25Hourly.value.map(item => item.value);
    minPm25.value = Math.min(...values);
    maxPm25.value = Math.max(...values);
  }
});
</script>

<template>
  <div class="min-h-screen bg-gray-100 p-4">
    <div class="bg-white shadow-lg rounded-lg p-6 text-center">
      <h1 class="text-2xl font-bold">ปริมาณฝุ่น PM 2.5</h1>
      <p class="text-gray-500">ค่าเฉลี่ยรายชั่วโมง</p>
      <div v-if="isLoading" class="text-gray-500 animate-pulse">⏳ กำลังโหลดข้อมูล...</div>
      <div v-else-if="errorMessage" class="text-red-500">⚠️ {{ errorMessage }}</div>
      <div v-else>
        <p class="text-4xl font-bold text-orange-600">{{ pm25Hourly[pm25Hourly.length - 1]?.value }} ug/m3</p>
        <p class="text-sm text-gray-500">อัปเดตล่าสุด: {{ pm25Hourly[pm25Hourly.length - 1]?.time }}</p>
      </div>
    </div>

    <!-- Display Min and Max PM2.5 -->
    <div class="bg-white shadow-md rounded-lg p-6 mt-6">
      <h2 class="text-xl font-bold mb-4 text-center">ค่า PM 2.5 ต่ำสุดและสูงสุด</h2>
      <div v-if="isLoading" class="text-center animate-pulse">⏳ กำลังคำนวณ...</div>
      <div v-else>
        <div class="space-y-2 text-center">
          <div>ค่าต่ำสุด: <span class="font-bold text-orange-600">{{ minPm25 }} ug/m3</span></div>
          <div>ค่าสูงสุด: <span class="font-bold text-orange-600">{{ maxPm25 }} ug/m3</span></div>
        </div>
      </div>
    </div>

    <div class="bg-white shadow-md rounded-lg p-6 mt-6">
      <h2 class="text-xl font-bold mb-4 text-center">อันดับค่าเฉลี่ย PM 2.5</h2>
      <div v-if="isLoading" class="space-y-2">
        <div class="p-2 bg-gray-200 animate-pulse rounded">&nbsp;</div>
        <div class="p-2 bg-gray-200 animate-pulse rounded">&nbsp;</div>
        <div class="p-2 bg-gray-200 animate-pulse rounded">&nbsp;</div>
      </div>
      <div v-else>
        <div class="space-y-2">
          <div v-for="(location, index) in pm25Locations" :key="location.name" class="flex justify-between p-3 bg-orange-100 rounded-lg">
            <span class="font-medium">{{ index + 1 }}: {{ location.name }}</span>
            <span class="font-bold">{{ location.value }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.min-h-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f9fafb;
}
</style>
