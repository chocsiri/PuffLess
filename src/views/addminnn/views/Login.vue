<template>
  <!-- No changes to template section -->
</template>

<script>
import axios from 'axios';

export default {
  methods: {
    async login() {
      try {
        // แสดงข้อมูลที่จะส่งไป
        const loginData = {
          username: this.username,
          password: this.password
        };
        console.log('🔐 Login data:', loginData);

        // ส่งคำขอไปยัง API
        const response = await axios.post('http://localhost:8000/admin/login', loginData, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        // แสดงผลลัพธ์
        console.log('✅ Login successful:', response.data);
        
        if (response.data.token) {
          localStorage.setItem('admin_token', response.data.token);
          this.$router.push('/admin');
        } else {
          console.error('❌ No token in response');
          throw new Error('No token returned');
        }
      } catch (error) {
        // แสดงรายละเอียดข้อผิดพลาด
        console.error('❌ Login error:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers
        });
        
        // แสดง error message ที่เฉพาะเจาะจงมากขึ้น
        const errorMessage = error.response?.data?.detail || 
                           error.message || 
                           'Login failed, please check your credentials.';
        alert(errorMessage);
      }
    }
  }
};
</script>

<style>
  /* No changes to style section */
</style> 