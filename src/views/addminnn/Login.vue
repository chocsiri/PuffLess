<template>
  <div class="login-container">
    <!-- ปุ่มกลับหน้าหลัก -->
    <router-link to="/" class="back-button">
      <button class="absolute top-6 left-6 bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition-all duration-300 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span class="text-gray-700 text-lg font-medium"></span>
      </button>
    </router-link>

    <form @submit.prevent="login">
      <h2 class="text-2xl font-bold text-center mb-6">เข้าสู่ระบบผู้ดูแล</h2>
      <h3 class="text-lg font-bold mb-2">Username</h3>
      <input type="text" v-model="username" placeholder="Enter your username" required />
      <h3 class="text-lg font-bold mb-2">Password</h3>
      <input type="password" v-model="password" placeholder="Enter your password" required />
      <button type="submit" class="btn">เข้าสู่ระบบ</button>
    </form>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      username: 'admin',
      password: '123456',
    };
  },
  methods: {
    async login() {
      try {
        console.log('Attempting login with:', { username: this.username, password: this.password });  // Debug log
        const response = await axios.post('http://localhost:8000/admin/login', {
          username: this.username,
          password: this.password
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        console.log('Login response:', response.data);  // Debug log
        if (response.data.token) {
          localStorage.setItem('admin_token', response.data.token);
          this.$router.push('/admin');   
        } else {
          throw new Error('No token returned');
        }
      } catch (error) {
        console.error('Login error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          config: error.config
        });
        alert(error.response?.data?.detail || 'Login failed, please check your credentials.');
      }
    }
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: url('https://media.thairath.co.th/image/q03GjDy2QTbVPe5TnA1CMU0OpFnw2hTcaYQGUUOB8OMe9vA1.jpg') no-repeat center center/cover;
  position: relative;
}

form {
  display: flex;
  flex-direction: column;
  padding: 20px;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.9);
  width: 400px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

input {
  margin-bottom: 20px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 50px;
  width: 100%;
}

button {
  padding: 12px 20px;
  background-color: #EB922C;
  color: black;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  width: 100%;
  font-weight: bold;
  font-size: 1.1rem;
  transition: all 0.3s ease;
}

button:hover {
  background-color: #c06600;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.back-button {
  position: absolute;
  top: 30px;
  left: 30px;
  z-index: 10;
}

.back-button button {
  background-color: white;
  padding: 12px 24px;
  width: auto;
  display: flex;
  align-items: center;
  gap: 8px;
}

.back-button button:hover {
  background-color: #f3f4f6;
  transform: translateY(-2px);
}
</style>
