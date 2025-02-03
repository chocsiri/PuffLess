<script setup>
import { useRouter } from 'vue-router'

import UserLayout from '@/layouts/UserLayout.vue'
import Product from '@/components/Product.vue'

import { useProductStore } from '@/stores/user/product3'
import { useCartStore } from '@/stores/user/cart'

const router = useRouter()
const productStore = useProductStore()
const cartStore = useCartStore()

const addToCart = (product) => {
  cartStore.addToCart(product)
  router.push({ name: 'cart' })
}
</script>
<template>
  <UserLayout>
    <div class="hero min-h-screen" style="background-image: url(https://scontent.fbkk5-4.fna.fbcdn.net/v/t1.15752-9/416378571_739350791507076_6433593169671912012_n.png?_nc_cat=110&ccb=1-7&_nc_sid=8cd0a2&_nc_ohc=uHBVEnPokVkAX_DQn34&_nc_ht=scontent.fbkk5-4.fna&oh=03_AdSbiGlTvV1YZZweAvoh3vWZ-MeArZlJXLEgkRamLBwTAA&oe=65FC70E7);">
      <div class="hero-overlay bg-opacity-60"></div>
      <div class="hero-content text-center text-neutral-content">
        <div class="max-w-md">
          <h1 class="mb-5 text-5xl font-bold">Artemis</h1>
          <p class="mb-5">Trust your intuition!</p>
          <button class="btn btn-primary">Go Shop</button>
        </div>
      </div>
    </div>

    <Product
        :products="productStore.list"
        :addToCart="addToCart"
    ></Product>
    <div class="flex justify-center">
      <div class="join">
        <RouterLink :to="{ name: 'home' }"><input class="join-item btn btn-square" type="radio" name="options" aria-label="1" /></RouterLink>
        <RouterLink :to="{ name: 'home2' }"><input class="join-item btn btn-square" type="radio" name="options" aria-label="2" /></RouterLink>
        <input class="join-item btn btn-square btn-active" type="radio" name="options" aria-label="3" checked />
      </div>
    </div>
  </UserLayout>
</template>