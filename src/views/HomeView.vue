<script setup>  
import { ref, onMounted, watch } from "vue";


const pm25 = ref(null);
const lastUpdatedTime = ref(null);
const pm25Hourly = ref([]);
const pm25Locations = ref([]);
const isLoading = ref(true);
const errorMessage = ref(null);
let updateIntervalPM25 = null;
let updateIntervalTime = null;

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

    pm25Locations.value = [
      { name: "คณะ ICT", value: 58.3 },
      { name: "หอใน", value: 62.2 },
      { name: "อาคารเรียน PKY", value: 51.9 },
      { name: "คณะวิศวกรรมศาสตร์", value: 60.3 },
    ].sort((a, b) => b.value - a.value);
  } catch (error) {
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
  // เริ่มการอัปเดตข้อมูล PM2.5 ทุกๆ 5 นาที (300,000 มิลลิวินาที)
  updateIntervalPM25 = setInterval(fetchPM25Data, 300000);
  
  // เริ่มการอัปเดตเวลา ทุกๆ 1 วินาที (1,000 มิลลิวินาที)
  updateTime(); // เรียกใช้อัปเดตเวลาในตอนเริ่มต้น
  updateIntervalTime = setInterval(updateTime, 1000); // อัปเดตเวลา
};

onMounted(() => {
  fetchPM25Data();
  startAutoUpdate();
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
      <router-link to="/">
      <button class="flex flex-col items-center text-custom-blue2 font-bold mt-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" stroke-width="1.5" stroke="currentColor" class="size-7" fill="#0E0069">
          <path d="M543.8 287.6c17 0 32-14 32-32.1c1-9-3-17-11-24L512 185l0-121c0-17.7-14.3-32-32-32l-32 0c-17.7 0-32 14.3-32 32l0 36.7L309.5 7c-6-5-14-7-21-7s-15 1-22 8L10 231.5c-7 7-10 15-10 24c0 18 14 32.1 32 32.1l32 0 0 69.7c-.1 .9-.1 1.8-.1 2.8l0 112c0 22.1 17.9 40 40 40l16 0c1.2 0 2.4-.1 3.6-.2c1.5 .1 3 .2 4.5 .2l31.9 0 24 0c22.1 0 40-17.9 40-40l0-24 0-64c0-17.7 14.3-32 32-32l64 0c17.7 0 32 14.3 32 32l0 64 0 24c0 22.1 17.9 40 40 40l24 0 32.5 0c1.4 0 2.8 0 4.2-.1c1.1 .1 2.2 .1 3.3 .1l16 0c22.1 0 40-17.9 40-40l0-16.2c.3-2.6 .5-5.3 .5-8.1l-.7-160.2 32 0z"/></svg>
        <span>หน้าหลัก</span>
      </button>
    </router-link>
     
     
      <router-link to="/Homeview2">
        <button class="flex flex-col items-center text-black font-bold mt-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" stroke-width="1.5" stroke="currentColor" class="size-7">
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