<template>
  <div class="login-container">
    <form @submit.prevent="login">
      <h3 class="text-lg font-bold mb-2">Username</h3>
      <input type="text" v-model="username" placeholder="Enter your username" required />
      <h3 class="text-lg font-bold mb-2">Password</h3>
      <input type="password" v-model="password" placeholder="Enter your password" required />
      <button type="submit" class="btn">Login</button>
      <button type="button" @click="goBack" class="btn-back" href="./../HomeView.vue">ย้อนกลับ</button>
    </form>
  </div>
</template>

<script>
export default {
  name: 'LoginView',
  data() {
    return {
      username: 'admin',
      password: '123456',
      error: null
    }
  },
  created() {
    // ตรวจสอบว่าผู้ใช้เข้าสู่ระบบแล้วหรือยัง
    const user = localStorage.getItem('user')
    if (user) {
      // ถ้าเข้าสู่ระบบแล้วให้ redirect ไปที่หน้า Dashboard
      this.$router.push('/addminnn/Dashboard')
    }
  },
  methods: {
    login() {
      // ตรวจสอบการเข้าสู่ระบบแบบง่าย
      if (this.username === 'admin' && this.password === '123456') {
        const userData = {
          username: this.username,
          role: 'admin',
          loggedInAt: new Date().toISOString()
        };
        
        // เก็บข้อมูลผู้ใช้ใน localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        
        // กลับไปใช้ Router
        this.$router.push('/addminnn/Dashboard');
      } else {
        this.error = 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'
        alert(this.error)
      }
    },
    
    // เพิ่มเมธอดสำหรับย้อนกลับ
    goBack() {
      this.$router.go(-1) // ย้อนกลับไปหน้าก่อนหน้า
    }
  }
}
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
  margin-bottom: 10px;
}

button:hover {
  background-color: #c06600;
}

.btn-back {
  background-color: #6c757d;
  color: white;
}

.btn-back:hover {
  background-color: #5a6268;
}
</style>
