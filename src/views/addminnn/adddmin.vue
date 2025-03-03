<template>
    <div>
      <h2>Admin - กรอกค่า PM2.5</h2>
      <form @submit.prevent="submitPM25">
        <input type="number" v-model="pm25Value" placeholder="ค่า PM2.5" required />
        <input type="text" v-model="location" placeholder="สถานที่" required />
        <button type="submit">บันทึก</button>
      </form>
      <button @click="fetchPM25">โหลดค่าที่บันทึก</button>
      <ul>
        <li v-for="(item, index) in pm25Data" :key="index">
          {{ item.location }}: {{ item.value }} µg/m³ ({{ item.timestamp }})
        </li>
      </ul>
    </div>
  </template>
  
  <script>
  import axios from "axios";
  
  export default {
    data() {
      return {
        pm25Value: "",
        location: "",
        token: localStorage.getItem("admin_token") || "",
        pm25Data: [],
      };
    },
    methods: {
      async submitPM25() {
        try {
          await axios.post("http://localhost:8000/admin/pm25", 
            { value: this.pm25Value, location: this.location }, 
            { headers: { Authorization: `Bearer ${this.token}` } }
          );
          alert("บันทึกค่า PM2.5 เรียบร้อย!");
        } catch (error) {
          alert("เกิดข้อผิดพลาด: " + error.response.data.detail);
        }
      },
      async fetchPM25() {
        try {
          const response = await axios.get("http://localhost:8000/pm25");
          this.pm25Data = response.data;
        } catch (error) {
          alert("เกิดข้อผิดพลาด: " + error);
        }
      },
    },
  };
  </script>
  