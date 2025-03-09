<script>
import axios from "axios";

export default {
  data() {
    return { username: "", password: "" };
  },
  methods: {
    async login() {
      try {
        // ส่งข้อมูลล็อกอินไปที่ API
        const response = await axios.post("http://localhost:8000/admin/login", {
          username: this.username,
          password: this.password,
        });
        
        // ถ้าล็อกอินสำเร็จ ให้เก็บ token ใน localStorage และนำทางไปที่หน้า admin
        localStorage.setItem("admin_token", response.data.token);
        this.$router.push("/admin"); // เปลี่ยนหน้าไปที่ /admin
      } catch (error) {
        // ถ้าล็อกอินไม่สำเร็จ แสดงข้อความผิดพลาด
        alert("ล็อกอินไม่สำเร็จ! กรุณาตรวจสอบชื่อผู้ใช้และรหัสผ่าน");
      }
    },
  },
};
</script>

<template>
  <div class="login-container">
    <div>
      <svg xmlns="http://www.w3.org/2000/svg" fill="black" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-12">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
      </svg>
    </div>
    <form @submit.prevent="login">
      <h3 class="text-lg font-bold mb-2">User Email</h3>
      <input type="text" v-model="username" placeholder="email" required />
      <h3 class="text-lg font-bold mb-2">Password</h3>
      <input type="password" v-model="password" placeholder="password" required />
      <button type="submit" class="text-lg font-bold">Sign in</button>
    </form>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: url("https://media.thairath.co.th/image/q03GjDy2QTbVPe5TnA1CMU0OpFnw2hTcaYQGUUOB8OMe9vA1.jpg") no-repeat center center/cover;
}

form {
  display: flex;
  flex-direction: column;
  padding: 20px;
  border-radius: 8px;
  align-items: center;
}

input {
  margin-bottom: 20px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 50px;
  width: 400px;
}

button {
  padding: 10px;
  background-color: #EB922C;
  color: rgb(0, 0, 0);
  border: none;
  border-radius: 50px;
  cursor: pointer;
  width: 170px;
  margin-top: 20px;
}

button:hover {
  background-color: #c06600;
}
</style>
