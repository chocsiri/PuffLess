<script setup>
import { onMounted, ref } from 'vue';
import L from 'leaflet'
const map = ref(null);

onMounted(() => {
  
  map.value = L.map('map').setView([19.0292, 99.8976], 16); 

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map.value);

 
  const bounds = [
    [18.9700, 99.8500], 
    [19.0900, 99.9500]  
  ];

 
  map.value.setMaxBounds(bounds);
  map.value.fitBounds(bounds); 

  
  const redIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x-red.png', 
    iconSize: [25, 41], 
    iconAnchor: [12, 41], 
    popupAnchor: [1, -34],
  });

  const locations = [
    { name: 'คณะ ICT', lat: 19.0292, lon: 99.8976 },
    { name: 'หอใน', lat: 19.0245, lon: 99.8954 },
    { name: 'อาคารเรียน PKY', lat: 19.0276, lon: 99.8921 },
    { name: 'คณะวิศวกรรมศาสตร์', lat: 19.0304, lon: 99.8980 },
    { name: 'หอพักนักศึกษา', lat: 19.0260, lon: 99.8950 }, // จุดใหม่
    { name: 'ศูนย์กีฬา', lat: 19.0320, lon: 99.9000 }, // จุดใหม่
  ];
  locations.forEach(location => {
    const marker = L.marker([location.lat, location.lon], { icon: redIcon })
      .addTo(map.value)
      .bindPopup(`<b>${location.name}</b><br>Click for more details.`);

  
    marker.on('click', () => {
      alert(`You clicked on ${location.name}`);
    });
  });
});
</script>

<template>
  <div class="container mx-auto p-4">
    <div id="map" style="width: 100%; height: 100vh;"></div>
  </div>
</template>

<style scoped>
#map {
  width: 100%; 
  height: 100vh; 
}
</style>
