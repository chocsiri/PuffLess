<template>
  <div class="homeview-container">
    <h3 class="text-xl font-bold mb-4">Latest PM2.5 Data</h3>
    <div class="pm25-list">
      <ul>
        <li v-for="(data, index) in pm25Data" :key="index">
          <span>{{ data.location }}: {{ data.pm25Value }} μg/m³</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      pm25Data: [
        { location: "Campus", pm25Value: 45 },
        { location: "Downtown", pm25Value: 30 }
      ]
    };
  }
};
</script>

<style scoped>
.homeview-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.pm25-list {
  margin-top: 20px;
  width: 100%;
  max-width: 600px;
}

.pm25-list ul {
  list-style-type: none;
  padding: 0;
}

.pm25-list li {
  padding: 10px;
  background-color: #f4f4f4;
  margin-bottom: 10px;
  border-radius: 8px;
}
</style>
