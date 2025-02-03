<script setup>
import UserLayout from '@/layouts/UserLayout.vue'
import Close from '@/components/icons/Close.vue'

import { useCartStore } from '@/stores/user/cart'

const cartStore = useCartStore()

const changeQuantity = (event, index) => {
  const newQuantity = parseInt(event.target.value)
  cartStore.updateQuantity(index, newQuantity)
}

</script>

<template>
  <UserLayout>
    <div class="flex text-3xl font-bold m-4">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
      CART
    </div>

    <div class="flex flex-col">
      <div class="flex-auto bg-white p-4">
        <div v-if="cartStore.items.length === 0" class="font-bold text-center text-3xl">
          <div class="container">
            <img width="256" height="256" src="https://img.icons8.com/external-flatart-icons-outline-flatarticons/64/external-cart-complete-common-version-flatart-icons-outline-flatarticons.png" alt="external-cart-complete-common-version-flatart-icons-outline-flatarticons"/>
            YOUR CART IS EMPTY
          </div>
        </div>
        <div v-else v-for="item in cartStore.items" class="flex">
          <div class="flex-1">
            <img width="256" height="256" :src="item.imageUrl">
          </div>
          <div class="flex-1">
            <div class="flex flex-col justify-between">
              <div class="relative grid grid-cols">
                <div class="flex p-8">
                  <div class="mr-auto text-xl"><b>{{ item.name }}</b></div>
                  <div>
                    <select v-model="item.quantity" class="select w-1/2 mx-8" @change="changeQuantity($event, index)">
                      <option v-for="quantity in [1,2,3,4,5]">
                        {{ quantity }}
                      </option>
                    </select>
                  </div>
                  <div class="text-xl"><b>{{ item.price }}</b></div>
                </div>
                <div @click="cartStore.removeItemInCart(index)" class="absolute top-0 right-0">
                  <Close></Close>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="flex-auto bg-white p-4">
        <div class="my-4">
          <div class="flex justify-between border-t border-black py-4">
            <div>Subtotal</div>
            <div>{{ cartStore.summaryPrice }}</div>
          </div>
          <div class="flex justify-between py-4">
            <div>Shipping</div>
            <div>Calculated at next step</div>
          </div>
          <div class="flex justify-between font-bold text-xl border-t border-black py-4">
            <div>Total</div>
              <div>{{ cartStore.summaryPrice }}</div>
          </div>
        </div>
        <div class="flex flex-col items-center">
          <a href="#" class="flex items-center justify-center px-6 py-3 mt-4 text-white bg-black transition-colors duration-300 transform border rounded-lg">
                        <span class="mx-2 font-bold text-xl">
                            <RouterLink :to="{ name: 'checkout' }">CONTINUE TO PAYMENT</RouterLink>
                        </span>
                    </a>
        </div>
      </div>
    </div>
  </UserLayout>
</template>

<style>
.container img{
  display:block;
  margin:0 auto;
}
</style>