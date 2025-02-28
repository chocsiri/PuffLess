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
const currentTime = ref('');  // Add currentTime ref

// Function to fetch data
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

// Function to update current time every second
const updateTime = () => {
  currentTime.value = new Date().toLocaleString("th-TH", {
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

// Start auto-update every second
const startAutoUpdate = () => {
  if (updateInterval) clearInterval(updateInterval);
  updateInterval = setInterval(() => {
    updateTime(); // Update time every second
    fetchPollutantData(); // Update data every 5 minutes
  }, 1000); // Update every second
};

watch(pollutants, () => {
  console.log("อัปเดตค่ามลพิษ:", pollutants.value);
});

onMounted(() => {
  updateTime();  // Initialize currentTime
  fetchPollutantData();
  startAutoUpdate();
});

</script>

<template>
  <div class="header-background flex items-center justify-center text-black text-2xl font-bold p-4 relative">
    <div class="absolute top-1/4 left-0 right-0 text-center">
      <h1 class="text-3xl font-bold">สารมลพิษอื่นๆ</h1>
      <h1 class="text-xl font-bold">ค่าเฉลี่ยรายชั่วโมง</h1><br>
      <p class="text-lg">{{ currentTime }} น.</p> <!-- แสดงเวลาล่าสุดที่อัปเดต -->
    </div>
  </div>

  <div class="container mx-auto p-4 space-y-6 relative -mt-20">
      <div class="bg-white shadow-2xl rounded-lg p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-3xl">
        <div class="p-4 rounded-2xl text-md font-bold w-[500px] h-[440px]">

          <div class="left-[70px] font-bold bg-custom-gray p-4 h-[80px] w-[1280px] mx-auto rounded-full relative flex items-center justify-start mt-5">
            <div class="absolute left-[25px] flex items-center justify-center h-[50px] w-[50px] rounded-full bg-custom-pink">
              NO₂
            </div>
            <h1 class="ml-20">ก๊าซไนโตรเจนไดออกไซด์<br>NO₂</h1>
            <p v-if="pollutants.no2 !== null" class="ml-auto mr-4">{{ pollutants.no2 }} mol/cm2</p>
            <p v-if="errorMessage" class="text-red-500">{{ errorMessage }}</p>
          </div>

          <div class="left-[70px] font-bold bg-custom-gray p-4 h-[80px] w-[1280px] mx-auto rounded-full relative flex items-center justify-start mt-14">
            <div class="absolute left-[25px] flex items-center justify-center h-[50px] w-[50px] rounded-full bg-custom-pink">
              SO₂
            </div>
            <h1 class="ml-20">ก๊าซซัลเฟอร์ไดออกไซด์<br>SO₂</h1>
            <p v-if="pollutants.so2 !== null" class="ml-auto mr-4">{{ pollutants.so2 }} mol/cm2</p>
            <p v-if="errorMessage" class="text-red-500">{{ errorMessage }}</p>
          </div>

          <div class="left-[70px] font-bold bg-custom-gray p-4 h-[80px] w-[1280px] mx-auto rounded-full relative flex items-center justify-start mt-14">
            <div class="absolute left-[25px] flex items-center justify-center h-[50px] w-[50px] rounded-full bg-custom-pink">
              O₃
            </div>
            <h1 class="ml-20">ก๊าซโอโซน<br>O₃</h1>
            <p v-if="pollutants.o3 !== null" class="ml-auto mr-4">{{ pollutants.o3 }} DU</p>
            <p v-if="errorMessage" class="text-red-500">{{ errorMessage }}</p>
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
        <button class="flex flex-col items-center text-black font-bold mt-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" stroke-width="1.5" stroke="currentColor" class="size-7" >
            <path d="M160 80c0-26.5 21.5-48 48-48l32 0c26.5 0 48 21.5 48 48l0 352c0 26.5-21.5 48-48 48l-32 0c-26.5 0-48-21.5-48-48l0-352zM0 272c0-26.5 21.5-48 48-48l32 0c26.5 0 48 21.5 48 48l0 160c0 26.5-21.5 48-48 48l-32 0c-26.5 0-48-21.5-48-48L0 272zM368 96l32 0c26.5 0 48 21.5 48 48l0 288c0 26.5-21.5 48-48 48l-32 0c-26.5 0-48-21.5-48-48l0-288c0-26.5 21.5-48 48-48z"/></svg>
          <span>สถิติ</span>
        </button>
      </router-link>

      <router-link to="/Homeview4">
      <button class="flex flex-col items-center text-custom-blue2 font-bold mt-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" stroke-width="1.5" stroke="currentColor" class="size-7" fill="#0E0069"> 
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
  height: 300px;
  background-image: url('https://media.thairath.co.th/image/q03GjDy2QTbVPe5TnA1CMU0OpFnw2hTcaYQGUUOB8OMe9vA1.jpg');
  background-size: cover;
  background-position: center;
}
.bg-custom-pink {
  background-color: #E7B1E3;
  color: #000000;
}
</style>
