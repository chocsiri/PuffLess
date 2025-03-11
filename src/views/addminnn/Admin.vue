<template>
  <div class="admin-dashboard">
    <div class="container mx-auto px-4 py-8">
      <div class="bg-white rounded-lg shadow-lg p-6">
        <h1 class="text-2xl font-bold text-gray-800 mb-6">แผงควบคุมผู้ดูแลระบบ</h1>
        
        <!-- Quick Actions -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <router-link
            to="/admin/pm25-input"
            class="bg-blue-100 p-6 rounded-lg hover:bg-blue-200 transition-colors"
          >
            <h3 class="text-lg font-semibold text-blue-800 mb-2">บันทึกค่า PM2.5</h3>
            <p class="text-blue-600">กรอกค่า PM2.5 แบบ Manual</p>
          </router-link>
          
          <!-- เพิ่ม Quick Actions อื่นๆ ตามต้องการ -->
        </div>

        <!-- Logout Button -->
        <button
          @click="logout"
          class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
        >
          ออกจากระบบ
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminDashboard',
  methods: {
    logout() {
      localStorage.removeItem('admin_token');
      this.$router.push('/Login');
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