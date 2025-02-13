import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '@/views/HomeView.vue'
import HomeView2 from '@/views/HomeView2.vue'
import HomeView3 from '@/views/HomeView3.vue'
import SearchView from '@/views/user/SearchView.vue'
import ProfileView from '@/views/user/ProfileView.vue'
import CartView from '@/views/user/CartView.vue'
import CheckoutView from '@/views/user/CheckoutView.vue'
import SuccessView from '@/views/user/SuccessView.vue'
import LoginView from '@/views/user/LoginView.vue'
import RegisterView from '@/views/user/RegisterView.vue'
import Homeview5Vue from '@/views/Homeview5.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView
    },
    {
      path: '/search',
      name: 'search',
      component: SearchView
    },
    {
      path: '/cart',
      name: 'cart',
      component: CartView
    },
    {
      path: '/checkout',
      name: 'checkout',
      component: CheckoutView
    },
    {
      path: '/success',
      name: 'success',
      component: SuccessView
    },
    {
      path: '/Homeview2',
      name: 'home2',
      component: HomeView2
    },
    {
      path: '/home3',
      name: 'home3',
      component: HomeView3
    },
    {
      path: '/Homeview5',
      name: 'home3',
      component: Homeview5Vue
    },
  ]
})

export default router