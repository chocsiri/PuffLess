<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { RouterView } from 'vue-router';


// ประกาศฟังก์ชัน fetchCartData
const fetchCartData = async () => {
  const response = await fetch('/api/cart'); // URL ของ API ที่ใช้ดึงข้อมูล
  const data = await response.json();
  return data;
};

const cartData = ref([]);

// ดึงข้อมูลเมื่อ component ถูก mounted
onMounted(async () => {
  const data = await fetchCartData();
  cartData.value = data;
});
</script>

<template>
  <div>
    <ul>
      <li v-for="(item, index) in cartData" :key="index">
        {{ item }}
      </li>
    </ul>
    <RouterView />
  </div>
</template>
