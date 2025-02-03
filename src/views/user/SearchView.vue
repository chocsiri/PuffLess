<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import UserLayout from '@/layouts/UserLayout.vue'
import Product from '@/components/Product.vue'

import { useProductStore } from '@/stores/user/product'
import { useCartStore } from '@/stores/user/cart'

const route = useRoute()
const router = useRouter()

const productStore = useProductStore()
const cartStore = useCartStore()

const searchText = ref('')

watch(() => route.query.q, (newSearchText) => {
  searchText.value = newSearchText
}, { immediate: true })

const filterProducts = computed(() => {
  return productStore.filterProducts(searchText.value)
})

const addToCart = (product) => {
  cartStore.addToCart(product)
  router.push({ name: 'cart' })
}
</script>
<template>
  <UserLayout>
    <div class="text-3xl m-4">Search: <b>{{ searchText }}</b></div>
    <product
      :products="filterProducts"
      :addToCart="addToCart"
    ></product>
  </UserLayout>
</template>
