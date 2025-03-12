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
              <option value="หอใน">หอใน</option>
              <option value="คณะ ICT">คณะ ICT</option>
              <option value="คณะวิศวกรรมศาสตร์">คณะวิศวกรรมศาสตร์</option>
              <option value="อาคารเรียน PKY">อาคารเรียน PKY</option>
              <option value="อาคารเรียน UB">อาคารเรียน UB</option>
              <option value="คณะสาธารณสุขศาสตร์">คณะสาธารณสุขศาสตร์</option>
              <option value="โรงเรียนสาธิตม.พะเยา">โรงเรียนสาธิตม.พะเยา</option>
              <option value="โรงพยาบาลมหาวิทยาลัยพะเยา">โรงพยาบาลมหาวิทยาลัยพะเยา</option>
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

          <!-- Date and Time Input -->
          <div>
            <label for="timestamp" class="block text-sm font-medium text-gray-700 mb-2">
              วันที่และเวลา
            </label>
            <input
              id="timestamp"
              v-model="pm25Data.timestamp"
              type="datetime-local"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
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
          
          <!-- ตัวเลือกการกรอง -->
          <div class="mb-4 flex flex-wrap items-center gap-4">
            <div class="w-full md:w-auto flex items-center gap-2">
              <label class="text-gray-700 text-sm font-medium">กรองตามสถานที่:</label>
              <select 
                v-model="locationFilter" 
                class="px-3 py-2 border border-gray-300 rounded-md text-sm"
                @change="filterEntries"
              >
                <option value="">ทั้งหมด</option>
                <option v-for="loc in uniqueLocations" :key="loc" :value="loc">{{ loc }}</option>
              </select>
            </div>
            
            <div class="w-full md:w-auto flex items-center gap-2">
              <label class="text-gray-700 text-sm font-medium">เรียงตาม:</label>
              <select 
                v-model="sortOption" 
                class="px-3 py-2 border border-gray-300 rounded-md text-sm"
                @change="filterEntries"
              >
                <option value="newest">ล่าสุดก่อน</option>
                <option value="oldest">เก่าสุดก่อน</option>
                <option value="highest">ค่าสูงสุดก่อน</option>
                <option value="lowest">ค่าต่ำสุดก่อน</option>
              </select>
            </div>
            
            <!-- ปุ่มลบข้อมูลทั้งหมด -->
            <div class="w-full md:w-auto mt-2 md:mt-0">
              <button 
                @click="deleteAllEntries" 
                class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                ลบข้อมูลทั้งหมด
              </button>
            </div>
          </div>
          
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
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="entry in paginatedEntries" :key="entry.timestamp">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDate(entry.timestamp) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ entry.value }} µg/m³
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ entry.location }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div class="flex space-x-2">
                      <button @click="editEntry(entry)" class="text-blue-600 hover:text-blue-800">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button @click="deleteEntry(entry)" class="text-red-600 hover:text-red-800">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- Pagination -->
          <div class="mt-4 flex justify-center">
            <button
              v-for="page in totalPages"
              :key="page"
              @click="changePage(page)"
              class="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {{ page }}
            </button>
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
        location: '',
        timestamp: new Date().toISOString().slice(0, 16),
        id: null
      },
      message: '',
      messageClass: '',
      recentEntries: [],
      isEditing: false,
      allEntries: [],
      locationFilter: '',
      sortOption: 'newest',
      currentPage: 1,
      entriesPerPage: 5,
      uniqueLocations: []
    };
  },
  computed: {
    paginatedEntries() {
      const startIndex = (this.currentPage - 1) * this.entriesPerPage;
      const endIndex = startIndex + this.entriesPerPage;
      return this.recentEntries.slice(startIndex, endIndex);
    },
    totalPages() {
      return Math.ceil(this.recentEntries.length / this.entriesPerPage);
    }
  },
  mounted() {
    this.fetchRecentEntries();
    this.initSampleData();
  },
  methods: {
    initSampleData() {
      console.log('ใช้งาน MongoDB แล้ว ไม่มีความจำเป็นต้องสร้างข้อมูลตัวอย่าง');
    },
    async submitPM25Data() {
      try {
        // ตรวจสอบ admin token เพื่อยังใช้ระบบความปลอดภัยเดิม
        let token = localStorage.getItem('admin_token');
        if (!token) {
          console.warn('ไม่พบ token ในระบบ กำลังใช้ token ชั่วคราว');
          // สร้าง token ชั่วคราวสำหรับการทดสอบ
          try {
            const loginResponse = await axios.post('http://localhost:8000/admin/login', {
              username: 'admin',
              password: 'Admin@123'
            });
            token = loginResponse.data.token;
            localStorage.setItem('admin_token', token);
            console.log('ล็อกอินอัตโนมัติสำเร็จ ได้รับ token ใหม่');
          } catch (loginError) {
            console.error('ไม่สามารถล็อกอินอัตโนมัติได้:', loginError);
            this.message = 'กรุณาเข้าสู่ระบบใหม่';
            this.messageClass = 'bg-red-100 text-red-700';
            setTimeout(() => {
              this.$router.push('/admin/login');
            }, 2000);
            return;
          }
        }

        // ตรวจสอบความถูกต้องของข้อมูล
        if (!this.pm25Data.location) {
          this.message = 'กรุณาเลือกสถานที่';
          this.messageClass = 'bg-red-100 text-red-700';
          return;
        }

        if (this.pm25Data.value === '' || isNaN(this.pm25Data.value) || this.pm25Data.value < 0) {
          this.message = 'กรุณากรอกค่า PM2.5 ที่ถูกต้อง (ต้องเป็นตัวเลขที่มากกว่าหรือเท่ากับ 0)';
          this.messageClass = 'bg-red-100 text-red-700';
          return;
        }

        if (!this.pm25Data.timestamp) {
          this.message = 'กรุณาเลือกวันที่และเวลา';
          this.messageClass = 'bg-red-100 text-red-700';
          return;
        }

        // สร้างข้อมูลที่จะบันทึก
        const dataToSubmit = {
          ...this.pm25Data,
          timestamp: new Date(this.pm25Data.timestamp).toISOString()
        };

        // ลบ id ออกถ้าเป็นการเพิ่มข้อมูลใหม่
        if (!this.isEditing) {
          delete dataToSubmit.id;
        }

        console.log('ข้อมูลที่จะส่ง:', JSON.stringify(dataToSubmit));

        this.message = 'กำลังดำเนินการ...';
        this.messageClass = 'bg-blue-100 text-blue-700';

        try {
          // พยายามส่งข้อมูลไปยัง API
          if (this.isEditing && this.pm25Data.id) {
            console.log(`กำลังแก้ไขข้อมูล ID: ${this.pm25Data.id}`);
            
            try {
              const response = await axios.put(`http://localhost:8000/admin/pm25/${this.pm25Data.id}`, dataToSubmit, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                timeout: 5000 // ลดเวลา timeout ลงเพื่อให้ไม่ต้องรอนาน
              });
              console.log('แก้ไขข้อมูลผ่าน API สำเร็จ:', response.data);
              
              // อัพเดตข้อมูลในตาราง
              this.allEntries = this.allEntries.map(item => {
                if ((item.id && this.pm25Data.id && item.id === this.pm25Data.id) || 
                    (item._id && this.pm25Data.id && item._id === this.pm25Data.id)) {
                  return {
                    ...item,
                    value: dataToSubmit.value,
                    location: dataToSubmit.location,
                    timestamp: dataToSubmit.timestamp
                  };
                }
                return item;
              });
              
              this.message = 'แก้ไขข้อมูลสำเร็จ';
              this.messageClass = 'bg-green-100 text-green-700';
            } catch (putError) {
              console.warn('ไม่สามารถแก้ไขข้อมูลผ่าน API ได้:', putError.message);
              
              if (putError.response && putError.response.status === 400) {
                this.message = `ข้อมูลไม่ถูกต้อง: ${putError.response.data.detail || 'กรุณาตรวจสอบข้อมูลอีกครั้ง'}`;
              } else if (putError.response && putError.response.status === 404) {
                this.message = 'ไม่พบข้อมูลที่ต้องการแก้ไข';
              } else if (putError.response && putError.response.status === 401) {
                this.message = 'สิทธิ์การเข้าถึงหมดอายุ กรุณาเข้าสู่ระบบใหม่';
                setTimeout(() => {
                  localStorage.removeItem('admin_token');
                  this.$router.push('/admin/login');
                }, 2000);
              } else {
                this.message = `ไม่สามารถแก้ไขข้อมูลได้: ${putError.message}`;
              }
              
              this.messageClass = 'bg-red-100 text-red-700';
            }
          } else {
            console.log('กำลังเพิ่มข้อมูลใหม่');
            
            try {
              const response = await axios.post('http://localhost:8000/admin/pm25', dataToSubmit, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                timeout: 5000 // ลดเวลา timeout ลงเพื่อให้ไม่ต้องรอนาน
              });
              console.log('เพิ่มข้อมูลผ่าน API สำเร็จ:', response.data);
              
              // เพิ่มข้อมูลในตาราง
              if (response.data && response.data.data) {
                this.allEntries.unshift(response.data.data);
              } else {
                // ถ้าไม่ได้รับข้อมูลกลับมา ให้ใช้ข้อมูลที่ส่งไป
                this.allEntries.unshift(dataToSubmit);
              }
              
              this.message = 'บันทึกข้อมูลสำเร็จ';
              this.messageClass = 'bg-green-100 text-green-700';
            } catch (postError) {
              console.warn('ไม่สามารถเพิ่มข้อมูลผ่าน API ได้:', postError.message);
              
              if (postError.response && postError.response.status === 400) {
                this.message = `ข้อมูลไม่ถูกต้อง: ${postError.response.data.detail || 'กรุณาตรวจสอบข้อมูลอีกครั้ง'}`;
              } else if (postError.response && postError.response.status === 401) {
                this.message = 'สิทธิ์การเข้าถึงหมดอายุ กรุณาเข้าสู่ระบบใหม่';
                setTimeout(() => {
                  localStorage.removeItem('admin_token');
                  this.$router.push('/admin/login');
                }, 2000);
              } else {
                this.message = `ไม่สามารถเพิ่มข้อมูลได้: ${postError.message}`;
              }
              
              this.messageClass = 'bg-red-100 text-red-700';
            }
          }
          
          // รีเซ็ตฟอร์ม
          this.resetForm();
          
          // อัพเดตตาราง
          this.filterEntries();
          
          // รีโหลดข้อมูลใหม่
          setTimeout(() => {
            this.fetchRecentEntries();
          }, 1000);
          
        } catch (apiError) {
          console.error('เกิดข้อผิดพลาดในการส่งข้อมูลไปยัง API:', apiError);
          this.message = `ไม่สามารถส่งข้อมูลไปยัง API ได้: ${apiError.message}`;
          this.messageClass = 'bg-red-100 text-red-700';
        }
        
      } catch (error) {
        console.error('Error submitting data:', error);
        this.message = error.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล';
        this.messageClass = 'bg-red-100 text-red-700';
      }
    },
    async fetchRecentEntries() {
      try {
        this.message = '';
        
        // ดึงข้อมูลจาก API
        try {
          const response = await axios.get('http://localhost:8000/pm25', { timeout: 5000 });
          console.log('PM2.5 API response:', response);
          
          // แปลงข้อมูลจาก API
          let entries = [];
          
          if (response.data && response.data.data) {
            entries = response.data.data;
            console.log('ข้อมูลจาก API (data.data):', entries);
          } else if (Array.isArray(response.data)) {
            entries = response.data;
            console.log('ข้อมูลจาก API (array):', entries);
          } else {
            console.warn('ข้อมูลจาก API ไม่อยู่ในรูปแบบที่ถูกต้อง:', response.data);
          }
          
          if (entries.length > 0) {
            // แปลงข้อมูลและเพิ่ม ID ถ้าไม่มี
            this.allEntries = entries.map(entry => {
              // แปลงค่าให้เป็นรูปแบบที่ถูกต้อง
              const processedEntry = { ...entry };
              
              // ตรวจสอบว่ามี ID หรือไม่
              if (!processedEntry.id && processedEntry._id) {
                processedEntry.id = processedEntry._id;
              }
              
              // ตรวจสอบว่า value เป็นตัวเลขหรือไม่
              if (typeof processedEntry.value !== 'number') {
                processedEntry.value = parseFloat(processedEntry.value);
              }
              
              return processedEntry;
            });
            
            console.log('ดึงข้อมูลจาก API สำเร็จ:', this.allEntries.length, 'รายการ');
          }
        } catch (apiError) {
          console.warn('ไม่สามารถดึงข้อมูลจาก API ได้:', apiError.message);
          // ไม่ต้อง throw error เพื่อให้ทำงานต่อไปได้
          // ใช้ข้อมูลที่มีอยู่แล้วในตาราง
        }
        
        // ดึงข้อมูลสถานที่ที่ไม่ซ้ำกัน
        this.uniqueLocations = [...new Set(this.allEntries.map(entry => entry.location))];
        
        // กรองและเรียงลำดับข้อมูล
        this.filterEntries();
        
      } catch (error) {
        console.error('Error fetching recent entries:', error);
        this.message = 'ไม่สามารถดึงข้อมูลล่าสุดได้';
        this.messageClass = 'bg-red-100 text-red-700';
      }
    },
    filterEntries() {
      let filteredData = [...this.allEntries];
      
      if (this.locationFilter) {
        filteredData = filteredData.filter(entry => entry.location === this.locationFilter);
      }
      
      switch(this.sortOption) {
        case 'newest':
          filteredData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          break;
        case 'oldest':
          filteredData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
          break;
        case 'highest':
          filteredData.sort((a, b) => b.value - a.value);
          break;
        case 'lowest':
          filteredData.sort((a, b) => a.value - b.value);
          break;
      }
      
      this.recentEntries = filteredData;
      this.currentPage = 1;
    },
    changePage(pageNumber) {
      if (pageNumber >= 1 && pageNumber <= this.totalPages) {
        this.currentPage = pageNumber;
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
    async deleteEntry(entry) {
      try {
        // ยืนยันการลบข้อมูล
        if (!confirm(`คุณต้องการลบข้อมูล PM2.5 ของ ${entry.location} (${entry.value} µg/m³) ใช่หรือไม่?`)) {
          return; // ผู้ใช้ยกเลิก
        }
        
        // ตรวจสอบว่ามี token หรือไม่
        let token = localStorage.getItem('admin_token');
        if (!token) {
          console.warn('ไม่พบ token ในระบบ กำลังใช้ token ชั่วคราว');
          // สร้าง token ชั่วคราวสำหรับการทดสอบ
          try {
            const loginResponse = await axios.post('http://localhost:8000/admin/login', {
              username: 'admin',
              password: 'Admin@123'
            });
            token = loginResponse.data.token;
            localStorage.setItem('admin_token', token);
            console.log('ล็อกอินอัตโนมัติสำเร็จ ได้รับ token ใหม่');
          } catch (loginError) {
            console.error('ไม่สามารถล็อกอินอัตโนมัติได้:', loginError);
            this.message = 'กรุณาเข้าสู่ระบบใหม่';
            this.messageClass = 'bg-red-100 text-red-700';
            setTimeout(() => {
              this.$router.push('/admin/login');
            }, 2000);
            return;
          }
        }
        
        // ตรวจสอบว่ามี ID หรือไม่
        if (!entry.id && !entry._id) {
          this.message = 'ไม่พบ ID ของข้อมูลที่ต้องการลบ';
          this.messageClass = 'bg-red-100 text-red-700';
          return;
        }
        
        const itemId = entry.id || entry._id;
        console.log(`กำลังลบข้อมูล ID: ${itemId}`);
        
        this.message = 'กำลังลบข้อมูล...';
        this.messageClass = 'bg-blue-100 text-blue-700';
        
        try {
          // ลบข้อมูลผ่าน API
          const response = await axios.delete(`http://localhost:8000/admin/pm25/${itemId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            timeout: 5000 // ลดเวลา timeout ลงเพื่อให้ไม่ต้องรอนาน
          });
          
          console.log('ลบข้อมูลผ่าน API สำเร็จ:', response.data);
          
          // ลบข้อมูลออกจากตาราง
          this.allEntries = this.allEntries.filter(item => {
            return !(
              (item.id && item.id === itemId) || 
              (item._id && item._id === itemId)
            );
          });
          
          // อัพเดตตาราง
          this.filterEntries();
          
          this.message = 'ลบข้อมูลสำเร็จ';
          this.messageClass = 'bg-green-100 text-green-700';
          
          // รีโหลดข้อมูลใหม่
          setTimeout(() => {
            this.fetchRecentEntries();
          }, 1000);
          
        } catch (deleteError) {
          console.error('ไม่สามารถลบข้อมูลผ่าน API ได้:', deleteError);
          
          if (deleteError.response && deleteError.response.status === 400) {
            this.message = `รูปแบบ ID ไม่ถูกต้อง: ${deleteError.response.data.detail || 'กรุณาตรวจสอบข้อมูลอีกครั้ง'}`;
          } else if (deleteError.response && deleteError.response.status === 404) {
            this.message = 'ไม่พบข้อมูลที่ต้องการลบในฐานข้อมูล';
          } else if (deleteError.response && deleteError.response.status === 401) {
            this.message = 'สิทธิ์การเข้าถึงหมดอายุ กรุณาเข้าสู่ระบบใหม่';
            setTimeout(() => {
              localStorage.removeItem('admin_token');
              this.$router.push('/admin/login');
            }, 2000);
          } else {
            this.message = `ไม่สามารถลบข้อมูลได้: ${deleteError.message}`;
          }
          
          this.messageClass = 'bg-red-100 text-red-700';
        }
        
      } catch (error) {
        console.error('Error handling delete operation:', error);
        this.message = error.message || 'เกิดข้อผิดพลาดในการลบข้อมูล';
        this.messageClass = 'bg-red-100 text-red-700';
      }
    },
    async editEntry(entry) {
      try {
      if (!entry) {
        this.message = 'ไม่สามารถแก้ไขข้อมูลได้ เนื่องจากไม่พบข้อมูล';
        this.messageClass = 'bg-red-100 text-red-700';
        return;
      }
        
        // ตรวจสอบว่ามี ID หรือไม่ (ตรวจสอบทั้ง id และ _id)
        let itemId = null;
        
        if (entry.id) {
          itemId = entry.id;
          console.log(`ใช้ ID จาก entry.id: ${itemId}`);
        } else if (entry._id) {
          itemId = entry._id;
          console.log(`ใช้ ID จาก entry._id: ${itemId}`);
        }
        
        // ถ้าไม่มี ID ให้ดึงข้อมูลล่าสุดจาก API
        if (!itemId) {
          console.log('ไม่พบ ID ในข้อมูล กำลังดึงข้อมูลล่าสุดจาก API...');
          
          // ดึงข้อมูลล่าสุดจาก API
          const response = await axios.get('http://localhost:8000/pm25');
          let entries = [];
          
          if (response.data && Array.isArray(response.data.data)) {
            entries = response.data.data;
          } else if (Array.isArray(response.data)) {
            entries = response.data;
          } else {
            throw new Error('ไม่สามารถดึงข้อมูลล่าสุดได้');
          }
          
          // ค้นหาข้อมูลที่ตรงกับที่ต้องการแก้ไข
          const matchingEntries = entries.filter(item => {
            const itemValue = typeof item.value === 'number' ? item.value : parseFloat(item.value);
            const entryValue = typeof entry.value === 'number' ? entry.value : parseFloat(entry.value);
            
            return item.location === entry.location && 
                   Math.abs(itemValue - entryValue) < 0.01;
          });
          
          console.log(`พบข้อมูลที่ตรงกัน ${matchingEntries.length} รายการสำหรับการแก้ไข:`, matchingEntries);
          
          if (matchingEntries.length === 0) {
            this.message = 'ไม่พบข้อมูลที่ต้องการแก้ไขในฐานข้อมูล';
            this.messageClass = 'bg-red-100 text-red-700';
            return;
          }
          
          // ใช้ ID จากข้อมูลที่ค้นพบ
          const itemToEdit = matchingEntries[0];
          
          // ตรวจสอบทั้ง id และ _id
          if (itemToEdit.id) {
            itemId = itemToEdit.id;
            console.log(`ใช้ ID จาก API (id): ${itemId}`);
          } else if (itemToEdit._id) {
            itemId = itemToEdit._id;
            console.log(`ใช้ ID จาก API (_id): ${itemId}`);
          } else {
            console.error('ไม่พบ ID ในข้อมูลที่ต้องการแก้ไข:', itemToEdit);
            this.message = 'ไม่พบ ID ของข้อมูลที่ต้องการแก้ไข';
            this.messageClass = 'bg-red-100 text-red-700';
            return;
          }
          
          // ใช้ข้อมูลจาก API
          entry = itemToEdit;
        }
      
      console.log('กำลังแก้ไขข้อมูล:', entry);
      this.isEditing = true;
      this.pm25Data = {
          id: itemId,
        value: typeof entry.value === 'number' ? entry.value : parseFloat(entry.value),
        location: entry.location,
        timestamp: new Date(entry.timestamp).toISOString().slice(0, 16)
      };
      
      console.log('ข้อมูลที่จะแก้ไข:', this.pm25Data);
      document.querySelector('form').scrollIntoView({ behavior: 'smooth' });
      } catch (error) {
        console.error('Error preparing edit operation:', error);
        this.message = error.message || 'เกิดข้อผิดพลาดในการเตรียมแก้ไขข้อมูล';
        this.messageClass = 'bg-red-100 text-red-700';
      }
    },
    resetForm() {
      this.pm25Data = {
        value: '',
        location: '',
        timestamp: new Date().toISOString().slice(0, 16),
        id: null
      };
      this.isEditing = false;
    },
    async deleteAllEntries() {
      try {
        // ยืนยันการลบข้อมูลทั้งหมด
        if (!confirm('คุณต้องการลบข้อมูล PM2.5 ทั้งหมดใช่หรือไม่? การกระทำนี้ไม่สามารถเรียกคืนได้')) {
          return; // ผู้ใช้ยกเลิก
        }
        
        // ตรวจสอบการยืนยันอีกครั้ง
        if (!confirm('โปรดยืนยันอีกครั้ง: คุณแน่ใจหรือไม่ที่จะลบข้อมูลทั้งหมด?')) {
          return; // ผู้ใช้ยกเลิก
        }
        
        // ตรวจสอบว่ามี token หรือไม่
        const token = localStorage.getItem('admin_token');
        if (!token) {
          this.message = 'กรุณาเข้าสู่ระบบใหม่เพื่อดำเนินการลบข้อมูล';
          this.messageClass = 'bg-red-100 text-red-700';
          setTimeout(() => {
            this.$router.push('/admin/login');
          }, 2000);
          return;
        }
        
        this.message = 'กำลังตรวจสอบสิทธิ์การเข้าถึงฐานข้อมูล...';
        this.messageClass = 'bg-blue-100 text-blue-700';
        
        // ตรวจสอบสิทธิ์การเข้าถึงฐานข้อมูล
        try {
          // ทดสอบการเข้าถึง API โดยการดึงข้อมูลสถานะ MongoDB
          const statusResponse = await axios.get('http://localhost:8000/mongodb-status', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            timeout: 5000
          });
          
          if (statusResponse.data.status !== 'Connected') {
            throw new Error('ไม่สามารถเชื่อมต่อกับฐานข้อมูลได้');
          }
          
          console.log('สถานะการเชื่อมต่อฐานข้อมูล:', statusResponse.data);
        } catch (statusError) {
          console.error('เกิดข้อผิดพลาดในการตรวจสอบสถานะฐานข้อมูล:', statusError);
          this.message = 'ไม่สามารถตรวจสอบสถานะฐานข้อมูลได้ กรุณาตรวจสอบการเชื่อมต่อของคุณ';
          this.messageClass = 'bg-red-100 text-red-700';
          return;
        }
        
        this.message = 'กำลังดึงข้อมูลทั้งหมด...';
        this.messageClass = 'bg-blue-100 text-blue-700';
        
        // ดึงข้อมูลทั้งหมดจาก API
        let entries = [];
        try {
          const response = await axios.get('http://localhost:8000/pm25', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            timeout: 10000
          });
          
          if (response.data && Array.isArray(response.data.data)) {
            entries = response.data.data;
          } else if (Array.isArray(response.data)) {
            entries = response.data;
          } else {
            throw new Error('ไม่สามารถดึงข้อมูลได้ เนื่องจากรูปแบบข้อมูลไม่ถูกต้อง');
          }
        } catch (fetchError) {
          console.error('เกิดข้อผิดพลาดในการดึงข้อมูล:', fetchError);
          
          if (fetchError.response && fetchError.response.status === 401) {
            this.message = 'สิทธิ์การเข้าถึงหมดอายุ กรุณาเข้าสู่ระบบใหม่';
            setTimeout(() => {
              localStorage.removeItem('admin_token');
              this.$router.push('/admin/login');
            }, 2000);
          } else if (fetchError.code === 'ECONNABORTED') {
            this.message = 'การเชื่อมต่อหมดเวลา';
          } else {
            this.message = `ไม่สามารถดึงข้อมูลได้: ${fetchError.message || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ'}`;
          }
          
          this.messageClass = 'bg-red-100 text-red-700';
          return;
        }
        
        if (entries.length === 0) {
          this.message = 'ไม่พบข้อมูลที่จะลบ';
          this.messageClass = 'bg-yellow-100 text-yellow-700';
          return;
        }
        
        console.log(`พบข้อมูลทั้งหมด ${entries.length} รายการที่จะลบ`);
        
        // ลบข้อมูลทีละรายการ
        let successCount = 0;
        let failCount = 0;
        let failedEntries = [];
        
        this.message = `กำลังลบข้อมูล... (0/${entries.length})`;
        
        // ใช้ Promise.all เพื่อลบข้อมูลพร้อมกันหลายรายการ แต่จำกัดจำนวน
        const batchSize = 5; // จำนวนการลบพร้อมกันสูงสุด
        
        for (let i = 0; i < entries.length; i += batchSize) {
          const batch = entries.slice(i, i + batchSize);
          const batchPromises = batch.map(async (entry, batchIndex) => {
            const entryIndex = i + batchIndex;
            let itemId = null;
            
            // ตรวจสอบ ID
            if (entry.id) {
              itemId = entry.id;
            } else if (entry._id) {
              itemId = entry._id;
            } else {
              console.warn(`ไม่พบ ID ที่ถูกต้องสำหรับรายการที่ ${entryIndex + 1}:`, entry);
              failCount++;
              failedEntries.push({
                index: entryIndex + 1,
                entry: entry,
                error: 'ไม่พบ ID ที่ถูกต้อง'
              });
              return;
            }
            
            try {
              // ลบข้อมูล
              await axios.delete(`http://localhost:8000/admin/pm25/${itemId}`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                timeout: 8000
              });
              
              successCount++;
            } catch (error) {
              console.error(`ไม่สามารถลบข้อมูล ID ${itemId} ได้:`, error);
              failCount++;
              
              let errorMessage = 'ไม่ทราบสาเหตุ';
              if (error.response) {
                if (error.response.status === 401) {
                  errorMessage = 'สิทธิ์การเข้าถึงหมดอายุ';
                } else if (error.response.status === 404) {
                  errorMessage = 'ไม่พบข้อมูลในฐานข้อมูล';
                } else if (error.response.status === 400) {
                  errorMessage = 'รูปแบบ ID ไม่ถูกต้อง';
                } else {
                  errorMessage = error.response.data?.detail || error.message;
                }
              } else if (error.code === 'ECONNABORTED') {
                errorMessage = 'การเชื่อมต่อหมดเวลา';
              } else {
                errorMessage = error.message;
              }
              
              failedEntries.push({
                index: entryIndex + 1,
                id: itemId,
                entry: entry,
                error: errorMessage
              });
            }
            
            // อัพเดตข้อความสถานะ
            this.message = `กำลังลบข้อมูล... (${successCount}/${entries.length})`;
          });
          
          // รอให้การลบในแต่ละชุดเสร็จสิ้น
          await Promise.all(batchPromises);
          
          // ตรวจสอบว่า token ยังใช้งานได้หรือไม่
          if (failedEntries.some(entry => entry.error === 'สิทธิ์การเข้าถึงหมดอายุ')) {
            this.message = 'สิทธิ์การเข้าถึงหมดอายุ กรุณาเข้าสู่ระบบใหม่';
            this.messageClass = 'bg-red-100 text-red-700';
            setTimeout(() => {
              localStorage.removeItem('admin_token');
              this.$router.push('/admin/login');
            }, 2000);
            return;
          }
        }
        
        // สรุปผลการลบข้อมูล
        if (failCount === 0) {
          this.message = `ลบข้อมูลทั้งหมด ${successCount} รายการสำเร็จ`;
          this.messageClass = 'bg-green-100 text-green-700';
        } else {
          // บันทึกรายละเอียดข้อผิดพลาดลงใน console
          console.error('รายการที่ลบไม่สำเร็จ:', failedEntries);
          
          this.message = `ลบข้อมูลสำเร็จ ${successCount} รายการ, ล้มเหลว ${failCount} รายการ (ดูรายละเอียดเพิ่มเติมใน Console)`;
          this.messageClass = 'bg-yellow-100 text-yellow-700';
        }
        
        // รีโหลดข้อมูลใหม่
        setTimeout(() => {
          this.fetchRecentEntries();
        }, 1000);
        
      } catch (error) {
        console.error('เกิดข้อผิดพลาดในการลบข้อมูลทั้งหมด:', error);
        this.message = `เกิดข้อผิดพลาดในการลบข้อมูลทั้งหมด: ${error.message || 'ไม่ทราบสาเหตุ'}`;
        this.messageClass = 'bg-red-100 text-red-700';
        
        // รีโหลดข้อมูลใหม่เพื่อให้แน่ใจว่าแสดงข้อมูลล่าสุด
        setTimeout(() => {
          this.fetchRecentEntries();
        }, 1000);
      }
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



