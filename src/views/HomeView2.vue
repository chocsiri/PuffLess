<script setup>
import { ref, onMounted } from "vue";


const pm25Hourly = ref([]);
const pm25Locations = ref([]);  
const isLoading = ref(true);
const errorMessage = ref(null);
 
const fetchStatisticsData = async () => {
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
 
    pm25Hourly.value = data.list.slice(-5).map((entry) => {
      return {
        time: new Date((entry.dt + 5 * 3600) * 1000).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }),
        value: entry.components.pm2_5,
      };
    });
 
    pm25Locations.value = [
      { name: "คณะ ICT", value: 58.3 },
      { name: "หอใน", value: 62.2 },
      { name: "อาคารเรียน PKY", value: 51.9 },
      { name: "คณะวิศวกรรมศาสตร์", value: 60.3 },
    ];
  } catch (error) {
    errorMessage.value = error.message;
  } finally {
    isLoading.value = false;
  }
};
 
onMounted(() => {
  fetchStatisticsData();
});
</script>
 
<template>
  <div class="container mx-auto p-4 space-y-6">
    <div class="bg-white shadow-lg rounded-lg p-6 text-center">
      <h1 class="text-xl font-bold">PM 2.5 รายชั่วโมง</h1>
      <div v-if="isLoading" class="text-gray-500">⏳ กำลังโหลดข้อมูล...</div>
      <div v-else-if="errorMessage" class="text-red-500">⚠️ {{ errorMessage }}</div>
      <div v-else>
        <div class="flex justify-center gap-4">
          <div v-for="entry in pm25Hourly" :key="entry.time" class="p-4 bg-orange-200 rounded-lg text-center w-20">
            <p class="text-xl font-bold">{{ entry.time }}</p>
            <p class="text-2xl text-orange-600 font-bold">{{ entry.value }}</p>
          </div>
        </div>
      </div>
    </div>
 
    <div class="bg-white shadow-md rounded-lg p-4">
      <h2 class="text-lg font-bold mb-4 text-center">ลำดับค่าฝุ่นเฉลี่ยรายชั่วโมงภายในมหาวิทยาลัยพะเยา</h2>
      <div class="space-y-2">
        <div v-for="(location, index) in pm25Locations" :key="location.name" class="flex justify-between p-2 bg-gray-100 rounded">
          <span>{{ index + 1 }}: {{ location.name }}</span>
          <span class="font-bold">{{ location.value }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
 
<style scoped>
.container {
  min-height: 100vh;
  padding-top: 80px;
}
</style>
 