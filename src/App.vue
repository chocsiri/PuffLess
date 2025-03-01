<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { RouterView } from 'vue-router';

const cartData = ref([]);

onMounted(async () => {
  // สมมติว่า fetchCartData() คือฟังก์ชันที่ดึงข้อมูลจาก API
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
