<script setup>  
import { ref, onMounted, watch } from "vue";

const pm25 = ref(null);
const lastUpdatedTime = ref(null);
const pm25Hourly = ref([]);
const pm25Locations = ref([]);
const isLoading = ref(true);
const errorMessage = ref(null);
let updateInterval = null;

const fetchPM25Data = async () => {
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

    pm25.value = data.list[data.list.length - 1].components.pm2_5;
    lastUpdatedTime.value = new Date().toLocaleString("th-TH", {
      weekday: "long", 
      year: "numeric", 
      month: "long", 
      day: "numeric", 
      hour: "2-digit", 
      minute: "2-digit", 
      second: "2-digit"
    });

    pm25Hourly.value = data.list.slice(-5).map((entry, index) => {
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

const startAutoUpdate = () => {
  if (updateInterval) clearInterval(updateInterval);
  updateInterval = setInterval(fetchPM25Data, 300000);
};

watch(pm25, () => {
  console.log("อัปเดตค่า PM2.5:", pm25.value);
});

onMounted(() => {
  fetchPM25Data();
  startAutoUpdate();
});
</script>

<template>
  <div class="header-background flex items-center justify-center text-white text-2xl font-bold p-4 relative">
    <div class="absolute top-1/4 left-0 right-0 text-center">
      <h1 class="text-3xl font-bold">เมืองพะเยา, พะเยา</h1>
      <p class="text-lg">{{ lastUpdatedTime }}</p> <!-- แสดงเวลาล่าสุดที่อัปเดต -->
      <p class="text-sm">พิกัด : 19.0374, 99.9380</p>
    </div>
  </div>

  <div class="container mx-auto p-4 space-y-6 relative -mt-20">
    <!-- บล็อก PM2.5 เฉลี่ย 24 ชั่วโมง -->
    <div class="bg-white shadow-2xl rounded-lg p-6 text-center transform transition-all duration-300 hover:scale-105 hover:shadow-3xl">
      <h1 class="text-xl font-bold">PM 2.5 เฉลี่ย 24 ชั่วโมง</h1>
      <div v-if="isLoading" class="text-gray-500">⏳ กำลังโหลดข้อมูล...</div>
      <div v-else-if="errorMessage" class="text-red-500">⚠️ {{ errorMessage }}</div>
      <div v-else>
        <div class="text-orange-500 text-5xl font-bold mx-auto">{{ pm25 }}</div>
        <p class="text-lg">ug/m³</p>
        
        <div class="w-[283px] h-[72px] flex items-center justify-start ml-0 mt-4">
          <img src="http://chihirowada.com/wp-content/uploads/2021/11/%E3%83%9E%E3%82%B9%E3%82%AF%EF%BC%91-229x300.png" alt="PM2.5" class="w-[48px] h-[72px] ml-0">
        </div>

        <div class="mt-4 p-2 bg-yellow-400 text-white font-bold rounded w-[283px] h-[72px] flex items-center justify-center ml-0">
          <span>เริ่มมีผลต่อสุขภาพ</span>
        </div>

        <p class="mt-2 bg-gray-200 p-2 rounded">หลีกเลี่ยงกิจกรรมกลางแจ้ง สวมหน้ากาก</p>
        <p class="text-sm text-gray-500 mt-2">อัปเดตล่าสุด: {{ lastUpdatedTime }}</p>
      </div>
    </div>

    <!-- PM2.5 รายชั่วโมง -->
    <div class="bg-white shadow-2xl rounded-lg p-4 transform transition-all duration-300 hover:scale-105 hover:shadow-3xl">
      <h2 class="text-lg font-bold mb-4 text-center">PM 2.5 รายชั่วโมง (ug/m³)</h2>
      <div class="flex justify-center gap-4">
        <div v-for="entry in pm25Hourly" :key="entry.time" class="p-4 bg-orange-200 rounded-lg text-center w-20 transform transition-all duration-300 hover:scale-110">
          <img src="http://chihirowada.com/wp-content/uploads/2021/11/%E3%83%9E%E3%82%B9%E3%82%AF%EF%BC%91-229x300.png" alt="PM2.5 Hourly" class="w-12 h-16 mx-auto mb-2">
          <p class="text-xl font-bold">{{ entry.time }}</p>
          <p class="text-2xl text-orange-600 font-bold">{{ entry.value }}</p>
        </div>
      </div>
    </div>

    <!-- ลำดับค่าฝุ่น -->
    <div class="bg-white shadow-2xl rounded-lg p-4 transform transition-all duration-300 hover:scale-105 hover:shadow-3xl">
      <h2 class="text-lg font-bold mb-4 text-center">ลำดับค่าฝุ่นเฉลี่ยรายชั่วโมงภายในมหาวิทยาลัยพะเยา</h2>
      <div class="space-y-2">
        <div v-for="(location, index) in pm25Locations" :key="location.name" class="flex justify-between p-2 bg-gray-100 rounded transform transition-all duration-300 hover:scale-105">
          <span>{{ index + 1 }}: {{ location.name }}</span>
          <span class="font-bold">{{ location.value }}</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Fixed Bottom Bar -->
  <div class="fixed bottom-0 left-0 w-full bg-gray-900 text-white p-2">
    <div class="flex justify-around">
      <button class="flex flex-col items-center text-blue-400">
        <span class="material-icons">home</span>
        <span>หน้าหลัก</span>
      </button>
      
      <!-- เพิ่ม <router-link> สำหรับการนำทางไปยังหน้า 'statistics' -->
      <router-link to="/Homeview2.vue">
        <button class="flex flex-col items-center text-white">
          <span class="material-icons">bar_chart</span>
          <span>สถิติ</span>
        </button>
      </router-link>

      <button class="flex flex-col items-center text-white">
        <span class="material-icons">map</span>
        <span>แผนที่</span>
      </button>
      <button class="flex flex-col items-center text-white">
        <span class="material-icons">pollution</span>
        <span>สารมลพิษอื่นๆ</span>
      </button>
      <button class="flex flex-col items-center text-white">
        <span class="material-icons">info</span>
        <span>เกี่ยวกับเรา</span>
      </button>
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
</style>
