<template>
  <div class="pm25-location-ranking">
    <div class="container mx-auto p-4">
      <h2 class="text-2xl font-bold text-center mb-6">ลำดับค่าฝุ่นเฉลี่ยรายช่วงกายในมหาวิทยาลัยพะเยา</h2>
      
      <!-- ปุ่มกลับหน้าหลัก -->
      <div class="mb-4">
        <router-link to="/" class="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-full inline-flex items-center transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>กลับหน้าหลัก</span>
        </router-link>
      </div>
      
      <!-- แสดงผลอยู่ระหว่างโหลด -->
      <div v-if="isLoading" class="flex justify-center items-center my-8">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        <p class="ml-3 text-gray-600">กำลังโหลดข้อมูล...</p>
      </div>
      
      <!-- แสดงข้อผิดพลาด -->
      <div v-else-if="error" class="bg-red-100 p-4 rounded-lg text-red-700 text-center my-8">
        {{ error }}
      </div>
      
      <!-- แสดงข้อมูลค่าเฉลี่ย PM2.5 แต่ละสถานที่ -->
      <div v-else>
        <!-- แสดงเวลาอัพเดตล่าสุด -->
        <div class="text-center mb-4 text-gray-600">
          อัพเดตล่าสุด: {{ lastUpdated }}
          <div class="mt-2 text-sm text-blue-600">
            (ข้อมูลจะอัพเดตอัตโนมัติทุก 10 วินาที)
          </div>
        </div>
        
        <!-- ปุ่มรีเฟรชข้อมูล -->
        <div class="flex justify-center mb-6">
          <button 
            @click="fetchLocationData" 
            class="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-lg flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>รีเฟรชข้อมูลทันที</span>
          </button>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div 
            v-for="(location, index) in locationData" 
            :key="location.location"
            class="bg-orange-400 rounded-lg shadow-lg p-4 flex items-center justify-between"
          >
            <div class="flex items-center">
              <div class="text-2xl font-bold mr-3">{{ index + 1 }}: {{ location.location }}</div>
            </div>
            <div class="text-2xl font-bold">{{ location.average }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';

export default {
  name: 'PM25LocationRanking',
  setup() {
    const locationData = ref([]);
    const isLoading = ref(true);
    const error = ref(null);
    const lastUpdated = ref('');

    const formatDate = (date) => {
      return date.toLocaleString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    };

    const fetchLocationData = async () => {
      try {
        isLoading.value = true;
        error.value = null;
        
        // ดึงข้อมูลจาก API
        const response = await axios.get('http://localhost:8000/pm25');
        
        // ตรวจสอบโครงสร้างข้อมูล
        const data = response.data && response.data.data ? response.data.data : response.data;
        
        if (!Array.isArray(data)) {
          throw new Error('ข้อมูลไม่ถูกต้อง');
        }
        
        // รวบรวมข้อมูลตามสถานที่
        const locationMap = new Map();
        
        data.forEach(entry => {
          if (!entry.location || isNaN(Number(entry.value))) return;
          
          const value = Number(entry.value);
          
          if (!locationMap.has(entry.location)) {
            locationMap.set(entry.location, {
              location: entry.location,
              values: [value],
              total: value,
              count: 1
            });
          } else {
            const locData = locationMap.get(entry.location);
            locData.values.push(value);
            locData.total += value;
            locData.count += 1;
          }
        });
        
        // คำนวณค่าเฉลี่ย
        const locations = Array.from(locationMap.values()).map(item => {
          return {
            location: item.location,
            average: Math.round((item.total / item.count) * 10) / 10
          };
        });
        
        // เรียงลำดับตามค่าเฉลี่ยจากมากไปน้อย
        locationData.value = locations.sort((a, b) => b.average - a.average);
        lastUpdated.value = formatDate(new Date());
        
      } catch (err) {
        console.error('Error fetching location data:', err);
        error.value = 'ไม่สามารถโหลดข้อมูลได้ โปรดลองอีกครั้งในภายหลัง';
      } finally {
        isLoading.value = false;
      }
    };

    onMounted(() => {
      fetchLocationData();
      
      // อัพเดทข้อมูลทุก 10 วินาที (เร็วขึ้นกว่าเดิม)
      const intervalId = setInterval(fetchLocationData, 10 * 1000);
      
      // ล้าง interval เมื่อ component ถูกทำลาย
      return () => clearInterval(intervalId);
    });

    return {
      locationData,
      isLoading,
      error,
      lastUpdated,
      fetchLocationData
    };
  }
};
</script>

<style scoped>
.pm25-location-ranking {
  min-height: 100vh;
  padding: 2rem 0;
  background-color: #f5f5f5;
}
</style> 