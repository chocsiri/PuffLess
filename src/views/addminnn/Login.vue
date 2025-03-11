<template>
  <div class="login-container">
    <form @submit.prevent="login">
      <h3 class="text-lg font-bold mb-2">Username</h3>
      <input type="text" v-model="username" placeholder="Enter your username" required />
      <h3 class="text-lg font-bold mb-2">Password</h3>
      <input type="password" v-model="password" placeholder="Enter your password" required />
      <button type="submit" class="btn">Login</button>
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
}

form {
  display: flex;
  flex-direction: column;
  padding: 20px;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.8);
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
  padding: 10px;
  background-color: #EB922C;
  color: black;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  width: 100%;
}

button:hover {
  background-color: #c06600;
}
</style>
