<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterView } from 'vue-router';
import { useCartStore } from '@/stores/user/indexss.js';

const cartStore = useCartStore();

onMounted(() => {
  cartStore.loadCart(); // เรียกใช้ฟังก์ชันนี้เมื่อโหลด
});
</script>

<template>
  <RouterView />
</template>
