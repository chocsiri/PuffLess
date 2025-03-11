<template>
  <div class="dashboard">
    <header>
      <div class="flex items-center">
        <button @click="goBack" class="btn-back mr-4">
          <span>&#8592;</span> ย้อนกลับ
        </button>
        <h1>ระบบจัดการข้อมูลคุณภาพอากาศ</h1>
      </div>
      <div class="header-actions">
        <button @click="goToStatistics" class="btn-secondary">สถิติ</button>
        <button @click="goToGraphs" class="btn-secondary">กราฟ</button>
        <button @click="goToHome" class="btn-secondary">หน้าหลัก</button>
        <button @click="logout" class="btn-logout">ออกจากระบบ</button>
      </div>
    </header>

    <!-- ส่วนเพิ่มข้อมูล -->
    <div class="data-input-section">
      <h2>เพิ่มข้อมูลคุณภาพอากาศ</h2>
      <form @submit.prevent="addData">
        <div class="form-row">
          <div class="form-group">
            <label>สถานที่:</label>
            <select v-model="newData.location" required>
              <option value="">-- เลือกสถานที่ --</option>
              <option v-for="location in locations" :key="location" :value="location">
                {{ location }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>ค่า PM2.5 (µg/m³):</label>
            <input v-model.number="newData.pm25_value" type="number" step="0.1" min="0" required>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>อุณหภูมิ (°C):</label>
            <input v-model.number="newData.temperature" type="number" step="0.1">
          </div>
          <div class="form-group">
            <label>ความชื้น (%):</label>
            <input v-model.number="newData.humidity" type="number" step="0.1" min="0" max="100">
          </div>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn-primary">บันทึกข้อมูล</button>
          <button type="button" @click="resetForm" class="btn-secondary">ล้างฟอร์ม</button>
        </div>
      </form>
    </div>

    <!-- ส่วนแสดงข้อมูล -->
    <div class="data-display-section">
      <h2>ข้อมูลล่าสุด</h2>
      
      <div class="filter-section">
        <div class="search-box">
          <input v-model="searchTerm" placeholder="ค้นหาตามสถานที่...">
        </div>
        <div class="location-filter">
          <select v-model="locationFilter">
            <option value="">ทุกสถานที่</option>
            <option v-for="location in locations" :key="location" :value="location">
              {{ location }}
            </option>
          </select>
        </div>
      </div>

      <div class="data-table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>สถานที่</th>
              <th>PM2.5 (µg/m³)</th>
              <th>อุณหภูมิ (°C)</th>
              <th>ความชื้น (%)</th>
              <th>วันที่และเวลา</th>
              <th>การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredData" :key="item.id" :class="{ 'editing': editingId === item.id }">
              <td>
                <span v-if="editingId !== item.id">{{ item.location }}</span>
                <select v-else v-model="editingData.location">
                  <option v-for="location in locations" :key="location" :value="location">
                    {{ location }}
                  </option>
                </select>
              </td>
              <td :class="getPM25Class(item.pm25_value)">
                <span v-if="editingId !== item.id">{{ item.pm25_value }}</span>
                <input v-else v-model.number="editingData.pm25_value" type="number" step="0.1" min="0">
              </td>
              <td>
                <span v-if="editingId !== item.id">{{ item.temperature }}</span>
                <input v-else v-model.number="editingData.temperature" type="number" step="0.1">
              </td>
              <td>
                <span v-if="editingId !== item.id">{{ item.humidity }}</span>
                <input v-else v-model.number="editingData.humidity" type="number" step="0.1" min="0" max="100">
              </td>
              <td>{{ formatDate(item.timestamp) }}</td>
              <td class="actions">
                <div v-if="editingId !== item.id">
                  <button @click="startEdit(item)" class="btn-edit">แก้ไข</button>
                  <button @click="deleteData(item.id)" class="btn-delete">ลบ</button>
                </div>
                <div v-else>
                  <button @click="saveEdit()" class="btn-save">บันทึก</button>
                  <button @click="cancelEdit()" class="btn-cancel">ยกเลิก</button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredData.length === 0">
              <td colspan="6" class="no-data">ไม่พบข้อมูล</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ส่วนแสดงกราฟสรุป -->
    <div class="summary-section">
      <h2>สรุปข้อมูลล่าสุด</h2>
      <div class="summary-cards">
        <div v-for="location in locations" :key="location" class="summary-card">
          <h3>{{ location }}</h3>
          <div class="summary-value" :class="getPM25Class(getLocationAverage(location))">
            {{ getLocationAverage(location).toFixed(1) }} µg/m³
          </div>
          <div class="summary-details">
            <p>อุณหภูมิเฉลี่ย: {{ getLocationTemperatureAverage(location).toFixed(1) }}°C</p>
            <p>ความชื้นเฉลี่ย: {{ getLocationHumidityAverage(location).toFixed(1) }}%</p>
            <p>จำนวนข้อมูล: {{ getLocationDataCount(location) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DashboardView',
  data() {
    return {
      // ข้อมูลสถานที่ทั้ง 4 จุด
      locations: [
        'หอใน',
        'คณะวิศวกรรมศาสตร์',
        'คณะ ICT',
        'อาคารเรียน PKY',
        'อาคารพระอุบาลี',
        'UP Dorm'
      ],
      // ข้อมูลใหม่ที่จะเพิ่ม
      newData: {
        location: '',
        pm25_value: null,
        temperature: null,
        humidity: null
      },
      // ข้อมูลทั้งหมด
      airQualityData: [],
      // ตัวกรอง
      searchTerm: '',
      locationFilter: '',
      // การแก้ไข
      editingId: null,
      editingData: {
        location: '',
        pm25_value: null,
        temperature: null,
        humidity: null
      }
    }
  },
  computed: {
    // กรองข้อมูลตามการค้นหาและตัวกรอง
    filteredData() {
      return this.airQualityData
        .filter(item => {
          // กรองตามสถานที่
          if (this.locationFilter && item.location !== this.locationFilter) {
            return false
          }
          // กรองตามคำค้นหา
          if (this.searchTerm && !item.location.toLowerCase().includes(this.searchTerm.toLowerCase())) {
            return false
          }
          return true
        })
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) // เรียงตามเวลาล่าสุด
    }
  },
  created() {
    // ตรวจสอบการเข้าสู่ระบบ
    const user = localStorage.getItem('user')
    if (!user) {
      this.$router.push('/addminnn/Login')
      return
    }
    
    // โหลดข้อมูล
    this.loadData()
  },
  methods: {
    // โหลดข้อมูลจาก Local Storage
    loadData() {
      const savedData = localStorage.getItem('airQualityData')
      if (savedData) {
        try {
          this.airQualityData = JSON.parse(savedData)
        } catch (error) {
          console.error('Error parsing airQualityData from localStorage:', error)
          this.generateSampleData()
        }
      } else {
        // ถ้าไม่มีข้อมูล ให้สร้างข้อมูลตัวอย่าง
        this.generateSampleData()
      }
    },
    
    // สร้างข้อมูลตัวอย่าง
    generateSampleData() {
      const sampleData = []
      
      // กำหนดค่า PM2.5 ตามข้อมูลจริง
      const pm25Values = {
        'หอใน': 62.2,
        'คณะวิศวกรรมศาสตร์': 60.3,
        'คณะ ICT': 58.3,
        'อาคารเรียน PKY': 51.9
      }
      
      // สร้างข้อมูลตัวอย่างสำหรับแต่ละสถานที่
      this.locations.forEach((location) => {
        const date = new Date()
        
        sampleData.push({
          id: sampleData.length + 1,
          location: location,
          pm25_value: pm25Values[location],
          temperature: Math.floor(Math.random() * 10) + 25, // สุ่มอุณหภูมิระหว่าง 25-35
          humidity: Math.floor(Math.random() * 30) + 50, // สุ่มความชื้นระหว่าง 50-80
          timestamp: date.toISOString()
        })
      })
      
      this.airQualityData = sampleData
      localStorage.setItem('airQualityData', JSON.stringify(sampleData))
    },
    
    // เพิ่มข้อมูลใหม่
    addData() {
      const newData = {
        id: Date.now(), // ใช้เวลาปัจจุบันเป็น ID
        ...this.newData,
        timestamp: new Date().toISOString()
      }
      
      this.airQualityData.unshift(newData)
      localStorage.setItem('airQualityData', JSON.stringify(this.airQualityData))
      
      // รีเซ็ตฟอร์ม
      this.resetForm()
      
      // แสดงการแจ้งเตือน
      alert('บันทึกข้อมูลสำเร็จ')
    },
    
    // รีเซ็ตฟอร์ม
    resetForm() {
      this.newData = {
        location: '',
        pm25_value: null,
        temperature: null,
        humidity: null
      }
    },
    
    // เริ่มการแก้ไข
    startEdit(item) {
      this.editingId = item.id
      this.editingData = { ...item }
    },
    
    // บันทึกการแก้ไข
    saveEdit() {
      const index = this.airQualityData.findIndex(item => item.id === this.editingId)
      if (index !== -1) {
        this.airQualityData[index] = { ...this.editingData }
        localStorage.setItem('airQualityData', JSON.stringify(this.airQualityData))
        alert('แก้ไขข้อมูลสำเร็จ')
      }
      this.cancelEdit()
    },
    
    // ยกเลิกการแก้ไข
    cancelEdit() {
      this.editingId = null
      this.editingData = {
        location: '',
        pm25_value: null,
        temperature: null,
        humidity: null
      }
    },
    
    // ลบข้อมูล
    deleteData(id) {
      if (confirm('คุณต้องการลบข้อมูลนี้ใช่หรือไม่?')) {
        this.airQualityData = this.airQualityData.filter(item => item.id !== id)
        localStorage.setItem('airQualityData', JSON.stringify(this.airQualityData))
        alert('ลบข้อมูลสำเร็จ')
      }
    },
    
    // จัดรูปแบบวันที่
    formatDate(timestamp) {
      return new Date(timestamp).toLocaleString('th-TH')
    },
    
    // กำหนดคลาสตามค่า PM2.5
    getPM25Class(value) {
      if (value > 50) return 'danger'
      if (value > 25) return 'warning'
      return 'good'
    },
    
    // คำนวณค่าเฉลี่ย PM2.5 ของแต่ละสถานที่
    getLocationAverage(location) {
      const locationData = this.airQualityData.filter(item => item.location === location)
      if (locationData.length === 0) return 0
      
      const sum = locationData.reduce((total, item) => total + (item.pm25_value || 0), 0)
      return sum / locationData.length
    },
    
    // คำนวณค่าเฉลี่ยอุณหภูมิของแต่ละสถานที่
    getLocationTemperatureAverage(location) {
      const locationData = this.airQualityData.filter(item => item.location === location && item.temperature !== null)
      if (locationData.length === 0) return 0
      
      const sum = locationData.reduce((total, item) => total + (item.temperature || 0), 0)
      return sum / locationData.length
    },
    
    // คำนวณค่าเฉลี่ยความชื้นของแต่ละสถานที่
    getLocationHumidityAverage(location) {
      const locationData = this.airQualityData.filter(item => item.location === location && item.humidity !== null)
      if (locationData.length === 0) return 0
      
      const sum = locationData.reduce((total, item) => total + (item.humidity || 0), 0)
      return sum / locationData.length
    },
    
    // นับจำนวนข้อมูลของแต่ละสถานที่
    getLocationDataCount(location) {
      return this.airQualityData.filter(item => item.location === location).length
    },
    
    // แสดงหน้าสถิติ
    goToStatistics() {
      this.$router.push('/HomeView2');
    },
    
    // แสดงหน้ากราฟ
    goToGraphs() {
      this.$router.push('/HomeView4');
    },
    
    // แสดงหน้าหลัก
    goToHome() {
      this.$router.push('/');
    },
    
    // ออกจากระบบ
    logout() {
      localStorage.removeItem('user');
      this.$router.push('/addminnn/Login');
    },
    
    // เพิ่มเมธอด goBack
    goBack() {
      this.$router.push('/');
    }
  }
}
</script>

<style scoped>
.dashboard {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  font-family: 'Kanit', sans-serif;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

h1 {
  font-size: 24px;
  color: #333;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.data-input-section, .data-display-section, .summary-section {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 30px;
}

h2 {
  font-size: 18px;
  color: #333;
  margin-top: 0;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
}

.form-group {
  flex: 1;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #555;
}

input, select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.btn-primary, .btn-secondary, .btn-logout, .btn-edit, .btn-delete, .btn-save, .btn-cancel {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.btn-primary {
  background-color: #4CAF50;
  color: white;
}

.btn-secondary {
  background-color: #f0f0f0;
  color: #333;
}

.btn-logout {
  background-color: #dc3545;
  color: white;
}

.btn-edit {
  background-color: #007bff;
  color: white;
}

.btn-delete {
  background-color: #dc3545;
  color: white;
}

.btn-save {
  background-color: #4CAF50;
  color: white;
}

.btn-cancel {
  background-color: #6c757d;
  color: white;
}

.filter-section {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}

.search-box input, .location-filter select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 250px;
}

.data-table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th, .data-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.data-table th {
  background-color: #f8f9fa;
  font-weight: 500;
}

.data-table tr:hover {
  background-color: #f8f9fa;
}

.data-table .actions {
  white-space: nowrap;
}

.data-table .actions button {
  margin-right: 5px;
  padding: 5px 10px;
  font-size: 12px;
}

.no-data {
  text-align: center;
  color: #999;
  padding: 20px;
}

.good { color: #28a745; }
.warning { color: #ffc107; }
.danger { color: #dc3545; }

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.summary-card {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.summary-card h3 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 16px;
  color: #333;
}

.summary-value {
  font-size: 24px;
  font-weight: bold;
  margin: 10px 0;
}

.summary-details {
  font-size: 14px;
  color: #666;
}

.summary-details p {
  margin: 5px 0;
}

.editing {
  background-color: #fff8e1;
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    gap: 10px;
  }
  
  .filter-section {
    flex-direction: column;
    gap: 10px;
  }
  
  .search-box input, .location-filter select {
    width: 100%;
  }
  
  .summary-cards {
    grid-template-columns: 1fr;
  }
}

.btn-back {
  background-color: #6c757d;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-back:hover {
  background-color: #5a6268;
}
</style> 