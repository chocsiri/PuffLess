<script setup>
import { onMounted, ref } from 'vue';
import L from 'leaflet'; // ใช้ leaflet สำหรับแผนที่

const map = ref(null);

onMounted(() => {
  // สร้างแผนที่เมื่อ Component ถูก mount
  map.value = L.map('map').setView([19.0292, 99.8976], 16); // ตั้งพิกัดเริ่มต้นที่ Phayao

  // ใช้ OpenStreetMap TileLayer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map.value);

  // กำหนดขอบเขตของแผนที่ที่แสดงเป็นบล็อกสี่เหลี่ยม (bounding box)
  const bounds = [
    [18.9700, 99.8500], // ล่างซ้าย
    [19.0900, 99.9500]  // มุมขวาบน
  ];

  // จำกัดแผนที่ให้แสดงภายในขอบเขตที่กำหนด
  map.value.setMaxBounds(bounds);
  map.value.fitBounds(bounds); // ให้แผนที่แสดงเต็มขอบเขต

  // สร้าง icon แบบกำหนดเอง (ปุ่มสีแดง)
  const redIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x-red.png', // ใช้สัญลักษณ์ของ marker สีแดง
    iconSize: [25, 41], // ขนาดของ icon
    iconAnchor: [12, 41], // กำหนดตำแหน่ง anchor
    popupAnchor: [1, -34], // กำหนดตำแหน่งที่แสดง popup
  });

  // เพิ่ม Marker สำหรับสถานที่ต่างๆ ภายในมหาวิทยาลัยพะเยา
  const locations = [
    { name: 'คณะ ICT', lat: 19.0292, lon: 99.8976 },
    { name: 'หอใน', lat: 19.0245, lon: 99.8954 },
    { name: 'อาคารเรียน PKY', lat: 19.0276, lon: 99.8921 },
    { name: 'คณะวิศวกรรมศาสตร์', lat: 19.0304, lon: 99.8980 },
    { name: 'หอพักนักศึกษา', lat: 19.0260, lon: 99.8950 }, // จุดใหม่
    { name: 'ศูนย์กีฬา', lat: 19.0320, lon: 99.9000 }, // จุดใหม่
  ];

  // ใช้ redIcon เป็นสัญลักษณ์สำหรับทุก Marker
  locations.forEach(location => {
    const marker = L.marker([location.lat, location.lon], { icon: redIcon })
      .addTo(map.value)
      .bindPopup(`<b>${location.name}</b><br>Click for more details.`);

    // เมื่อคลิกมาร์กเกอร์ ให้แสดงรายละเอียดเพิ่มเติม
    marker.on('click', () => {
      alert(`You clicked on ${location.name}`);
    });
  });
});
</script>

<template>
  <div class="container mx-auto p-4">
    <div id="map" style="width: 100%; height: 100vh;"></div> <!-- แผนที่เต็มขนาดเต็มจอแนวตั้ง -->
  </div>
</template>

<style scoped>
#map {
  width: 100%; /* ให้แผนที่เต็มขนาดพื้นที่ */
  height: 100vh; /* ใช้พื้นที่เต็มจอแนวตั้ง */
}
</style>
