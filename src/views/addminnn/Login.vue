<template>
    <div>
      <h2>Admin Login</h2>
      <form @submit.prevent="login">
        <input type="text" v-model="username" placeholder="Username" required />
        <input type="password" v-model="password" placeholder="Password" required />
        <button type="submit">เข้าสู่ระบบ</button>
      </form>
    </div>
  </template>
  
  <script>
  import axios from "axios";
  
  export default {
    data() {
      return { username: "", password: "" };
    },
    methods: {
      async login() {
        try {
          const response = await axios.post("http://localhost:8000/admin/login", 
            { username: this.username, password: this.password }
          );
          localStorage.setItem("admin_token", response.data.token);
          this.$router.push("/admin");
        } catch (error) {
          alert("ล็อกอินไม่สำเร็จ!");
        }
      },
    },
  };
  </script>
  