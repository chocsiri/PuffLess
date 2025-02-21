<script setup>
import { ref, onMounted, watch } from "vue";

const pollutants = ref({
  no2: 0,
  so2: 0,
  o3: 0,
});
const lastUpdatedTime = ref(null);
const pollutantsHourly = ref([]);
const isLoading = ref(true);
const errorMessage = ref(null);
let updateInterval = null;

const fetchPollutantData = async () => {
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
    if (!data.list || data.list.length === 0) throw new Error("ไม่มีข้อมูลมลพิษ");

    // แสดงข้อมูลมลพิษล่าสุด
    pollutants.value.no2 = data.list[data.list.length - 1].components.no2;
    pollutants.value.so2 = data.list[data.list.length - 1].components.so2;
    pollutants.value.o3 = data.list[data.list.length - 1].components.o3;
    lastUpdatedTime.value = new Date().toLocaleString("th-TH", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });

    // แสดงข้อมูลมลพิษรายชั่วโมงย้อนหลัง
    pollutantsHourly.value = data.list.map((entry) => {
      return {
        time: new Date(entry.dt * 1000).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }),
        no2: entry.components.no2,
        so2: entry.components.so2,
        o3: entry.components.o3,
      };
    });
  } catch (error) {
    errorMessage.value = error.message;
  } finally {
    isLoading.value = false;
  }
};

const startAutoUpdate = () => {
  if (updateInterval) clearInterval(updateInterval);
  updateInterval = setInterval(fetchPollutantData, 300000);
};

watch(pollutants, () => {
  console.log("อัปเดตค่ามลพิษ:", pollutants.value);
});

onMounted(() => {
  fetchPollutantData();
  startAutoUpdate();
});
</script>

<template>
  <div class="header-background flex items-center justify-center text-black text-2xl font-bold p-4 relative">
    <div class="absolute top-1/4 left-0 right-0 text-center">
      <h1 class="text-3xl font-bold">แม่กา</h1>
      <h1 class="text-3xl font-bold">เมืองพะเยา, พะเยา</h1>
      <p class="text-lg">{{ lastUpdatedTime }}</p>
      <p class="text-sm">พิกัด : 19.0374, 99.9380</p>
    </div>
  </div>

  <div class="container mx-auto p-4 space-y-6 relative -mt-20">
    <!-- แสดงค่ามลพิษล่าสุด -->
    <div class="bg-white shadow-2xl rounded-lg p-6 text-center">
      <h1 class="text-xl font-bold bg-custom-orange p-4">ค่ามลพิษล่าสุด (µg/m³)</h1>
      <div v-if="isLoading" class="text-gray-500">⏳ กำลังโหลดข้อมูล...</div>
      <div v-else-if="errorMessage" class="text-red-500">⚠️ {{ errorMessage }}</div>
      <div v-else>
        <div v-if="pollutants.no2 !== null && pollutants.so2 !== null && pollutants.o3 !== null">
          <p>NO₂: {{ pollutants.no2 }}</p>
          <p>SO₂: {{ pollutants.so2 }}</p>
          <p>O₃: {{ pollutants.o3 }}</p>
        </div>
        <p class="text-sm text-gray-500 mt-2">อัปเดตล่าสุด: {{ lastUpdatedTime }}</p>
      </div>
    </div>

    <!-- แสดงค่ามลพิษรายชั่วโมง -->
    <div class="bg-white shadow-2xl rounded-lg p-4">
      <h2 class="text-lg font-bold mb-4 bg-custom-orange p-4">มลพิษรายชั่วโมง</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div v-for="entry in pollutantsHourly" :key="entry.time" class="p-4 bg-custom-light-blue rounded-lg text-center">
          <p class="text-xl font-bold">{{ entry.time }}</p>
          <p>NO₂: {{ entry.no2 }}</p>
          <p>SO₂: {{ entry.so2 }}</p>
          <p>O₃: {{ entry.o3 }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.header-background {
  width: 100%;
  height: 300px;
  background: url("https://www.thaihealth.or.th/data/content/2019/10/50235/cms/newscms_thaihealth_c_cdelpqy24689.jpg") no-repeat center center;
  background-size: cover;
}
.bg-custom-orange {
  background-color: #ff9800;
  color: white;
}
.bg-custom-light-blue {
  background-color: #D1ECF1;
  color: #0C5460;
}
</style>
