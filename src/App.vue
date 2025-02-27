<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { RouterView } from 'vue-router';


import { useCartStore } from '@/stores/user/indexss.js';


const cartData = ref([]);


const cartStore = useCartStore();


onMounted(async () => {
  const data = await cartStore.loadCart();
  cartData.value = data;  
});
</script>

<template>
  <div>
    <h1>Cart Data</h1>
    <ul>
  
      <li v-for="(item, index) in cartData" :key="index">
        {{ item }}
      </li>
    </ul>
    <RouterView />
  </div>
</template>

