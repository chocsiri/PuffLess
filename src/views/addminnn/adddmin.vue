<template>
  <div class="admin-container">
    <form @submit.prevent="submitPM25Data">
      <h3 class="text-lg font-bold mb-2">PM2.5 Data</h3>
      <input type="text" v-model="pm25Value" placeholder="Enter PM2.5 value" required />
      <h3 class="text-lg font-bold mb-2">Location</h3>
      <input type="text" v-model="location" placeholder="Enter location" required />
      <button type="submit" class="btn">Submit Data</button>
    </form>

    <div class="pm25-list">
      <h3 class="text-lg font-bold mt-4">Submitted PM2.5 Data</h3>
      <ul>
        <li v-for="(data, index) in pm25Data" :key="index">
          <span>{{ data.location }}: {{ data.pm25Value }} μg/m³</span>
          <button @click="deleteData(index)" class="delete-btn">Delete</button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      pm25Value: '',
      location: '',
      pm25Data: []
    };
  },
  methods: {
    submitPM25Data() {
      const data = {
        pm25Value: this.pm25Value,
        location: this.location
      };
      this.pm25Data.push(data);
      this.pm25Value = '';
      this.location = '';
    },
    deleteData(index) {
      this.pm25Data.splice(index, 1);
    }
  }
};
</script>

<style scoped>
.admin-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
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

.pm25-list {
  margin-top: 40px;
  width: 100%;
  max-width: 600px;
}

.pm25-list ul {
  list-style-type: none;
  padding: 0;
}

.pm25-list li {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background-color: #f4f4f4;
  margin-bottom: 10px;
  border-radius: 8px;
}

.delete-btn {
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  padding: 5px 10px;
}

.delete-btn:hover {
  background-color: #c0392b;
}
</style>
