<template>
  <div class="admin-pm25-input">

    <router-link to="/admin" class="back-button">
      <button class="absolute top-6 left-6 bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition-all duration-300 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span class="text-gray-700 text-lg font-medium"></span>
      </button>
    </router-link>

    <div class="container mx-auto px-4 py-8">
      <div class="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
        <h2 class="text-2xl font-bold text-gray-800 mb-6">บันทึกค่า PM2.5</h2>
        
        <!-- Form -->
        <form @submit.prevent="submitPM25Data" class="space-y-6">
          <!-- Location Selection -->
          <div>
            <label for="location" class="block text-sm font-medium text-gray-700 mb-2">
              เลือกสถานที่
            </label>
            <select
              id="location"
              v-model="pm25Data.location"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="" disabled>กรุณาเลือกสถานที่</option>
              <option value="คณะ ICT">คณะ ICT</option>
              <option value="โรงพยาบาลมหาวิทยาลัยพะเยา">โรงพยาบาลมหาวิทยาลัยพะเยา</option>
              <option value="คณะสาธารณสุขศาสตร์">คณะสาธารณสุขศาสตร์</option>
              <option value="อาคารเรียนรวม(PKY)">อาคารเรียนรวม(PKY)</option>
              <option value="อาคารพระอุบาลี(UB)">อาคารพระอุบาลี(UB)</option>
              <option value="UP Dorm">UP Dorm</option>
            </select>
          </div>

          <!-- PM2.5 Value Input -->
          <div>
            <label for="pm25Value" class="block text-sm font-medium text-gray-700 mb-2">
              ค่า PM2.5 (µg/m³)
            </label>
            <input
              id="pm25Value"
              v-model.number="pm25Data.value"
              type="number"
              step="0.01"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="กรอกค่า PM2.5"
            />
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            บันทึกข้อมูล
          </button>
        </form>

        <!-- Status Messages -->
        <div v-if="message" :class="['mt-4 p-4 rounded-md', messageClass]">
          {{ message }}
        </div>

        <!-- Recent Entries Table -->
        <div class="mt-8">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">รายการล่าสุด</h3>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    วันที่/เวลา
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ค่า PM2.5
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    สถานที่
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="entry in recentEntries" :key="entry.timestamp">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDate(entry.timestamp) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ entry.value }} µg/m³
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ entry.location }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'AdminPM25Input',
  data() {
    return {
      pm25Data: {
        value: '',
        location: ''
      },
      message: '',
      messageClass: '',
      recentEntries: []
    };
  },
  mounted() {
    this.fetchRecentEntries();
  },
  methods: {
    async submitPM25Data() {
      try {
        const token = localStorage.getItem('admin_token');
        if (!token) {
          throw new Error('กรุณาเข้าสู่ระบบใหม่');
        }

        await axios.post('http://localhost:8000/admin/pm25', this.pm25Data, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        this.message = 'บันทึกข้อมูลสำเร็จ';
        this.messageClass = 'bg-green-100 text-green-700';
        
        // รีเซ็ตฟอร์ม
        this.pm25Data = {
          value: '',
          location: ''
        };
        
        // โหลดข้อมูลล่าสุดใหม่
        await this.fetchRecentEntries();
      } catch (error) {
        this.message = error.response?.data?.detail || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล';
        this.messageClass = 'bg-red-100 text-red-700';
      }
    },
    async fetchRecentEntries() {
      try {
        const response = await axios.get('http://localhost:8000/pm25');
        this.recentEntries = response.data.slice(0, 5); // แสดง 5 รายการล่าสุด
      } catch (error) {
        console.error('Error fetching recent entries:', error);
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
    }
  }
};
</script>

<style scoped>
.admin-pm25-input {
  min-height: 100vh;
  background-color: #f3f4f6;
}
</style> 