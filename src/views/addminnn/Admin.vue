<template>
  <div class="admin-dashboard">
    <div class="container mx-auto px-4 py-8">
      <!-- Navigation Bar -->
      <div class="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-lg">
        <router-link to="/" class="flex items-center text-gray-700 hover:text-gray-900 transition-all duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span class="text-lg font-medium">กลับหน้าหลัก</span>
        </router-link>
        <div class="flex items-center gap-4">
          <div class="text-gray-700">
            <span class="font-medium">ผู้ใช้งาน:</span> <span class="text-blue-600">{{ username }}</span>
          </div>
          <button
            @click="logout"
            class="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-all duration-300 text-lg font-medium hover:shadow-lg"
          >
            ออกจากระบบ
          </button>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-lg p-6">
        <h1 class="text-2xl font-bold text-gray-800 mb-6">แผงควบคุมผู้ดูแลระบบ</h1>
        
        <!-- PM2.5 Summary -->
        <div class="mb-8">
          <h2 class="text-xl font-semibold text-gray-700 mb-4">สรุปข้อมูล PM2.5 ล่าสุด</h2>
          <div v-if="loading" class="text-center py-4">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p class="mt-2 text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
          <div v-else-if="latestPM25.length === 0" class="bg-gray-100 rounded-lg p-4 text-center">
            <p class="text-gray-600">ไม่พบข้อมูล PM2.5</p>
          </div>
          <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div v-for="(entry, index) in latestPM25" :key="index" 
                 class="bg-white border rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="font-semibold text-lg">{{ entry.location }}</h3>
                  <p class="text-sm text-gray-500">{{ formatDate(entry.timestamp) }}</p>
                </div>
                <div :class="getPM25StatusClass(entry.value)" class="text-xl font-bold px-3 py-1 rounded-full">
                  {{ entry.value }} µg/m³
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Quick Actions -->
        <div class="mb-8">
          <h2 class="text-xl font-semibold text-gray-700 mb-4">การจัดการข้อมูล</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <router-link
              to="/admin/pm25-input"
              class="bg-blue-100 p-6 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-3"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              <div>
                <h3 class="text-lg font-semibold text-blue-800">บันทึกค่า PM2.5</h3>
                <p class="text-blue-600">เพิ่ม แก้ไข หรือลบข้อมูล PM2.5</p>
              </div>
            </router-link>
            
            <div class="bg-green-100 p-6 rounded-lg hover:bg-green-200 transition-colors cursor-pointer flex items-center gap-3" @click="refreshData">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <div>
                <h3 class="text-lg font-semibold text-green-800">รีเฟรชข้อมูล</h3>
                <p class="text-green-600">โหลดข้อมูลล่าสุดจากฐานข้อมูล</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- System Status -->
        <div class="mb-8">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">สถานะระบบ</h3>
          <div class="bg-gray-100 p-4 rounded-lg">
            <div class="flex items-center mb-2">
              <span class="inline-block w-4 h-4 rounded-full bg-green-500 mr-2"></span>
              <span class="text-gray-700">ฐานข้อมูล MongoDB: ออนไลน์</span>
            </div>
            <div class="flex items-center mb-2">
              <span class="inline-block w-4 h-4 rounded-full bg-red-500 mr-2"></span>
              <span class="text-gray-700">การจัดเก็บข้อมูล: ไม่ใช้งาน LocalStorage</span>
            </div>
            <div class="flex items-center">
              <span class="inline-block w-4 h-4 rounded-full bg-green-500 mr-2"></span>
              <span class="text-gray-700">API Server: ออนไลน์</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'AdminDashboard',
  data() {
    return {
      latestPM25: [],
      loading: true,
      dbStatus: false,
      username: 'แอดมิน'
    };
  },
  mounted() {
    this.fetchLatestPM25();
    this.checkDbStatus();
  },
  methods: {
    logout() {
      localStorage.removeItem('admin_token');
      this.$router.push('/Login');
    },
    async fetchLatestPM25() {
      try {
        this.loading = true;
        const response = await axios.get('http://localhost:8000/pm25');
        if (response.data && Array.isArray(response.data.data)) {
          this.latestPM25 = response.data.data.slice(0, 6); // แสดง 6 รายการล่าสุด
        } else if (Array.isArray(response.data)) {
          this.latestPM25 = response.data.slice(0, 6);
        } else {
          this.latestPM25 = [];
        }
      } catch (error) {
        console.error('Error fetching PM2.5 data:', error);
        this.latestPM25 = [];
      } finally {
        this.loading = false;
      }
    },
    async checkDbStatus() {
      try {
        const response = await axios.get('http://localhost:8000/mongodb-status');
        this.dbStatus = response.data.status === 'connected';
      } catch (error) {
        console.error('Error checking database status:', error);
        this.dbStatus = false;
      }
    },
    formatDate(timestamp) {
      return new Date(timestamp).toLocaleString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    getPM25StatusClass(value) {
      if (value <= 25) return 'bg-green-100 text-green-800';
      if (value <= 50) return 'bg-yellow-100 text-yellow-800';
      if (value <= 100) return 'bg-orange-100 text-orange-800';
      if (value <= 200) return 'bg-red-100 text-red-800';
      return 'bg-purple-100 text-purple-800';
    },
    refreshData() {
      this.fetchLatestPM25();
      this.checkDbStatus();
    }
  }
};
</script>

<style scoped>
.admin-dashboard {
  min-height: 100vh;
  background-color: #f3f4f6;
}
</style> 