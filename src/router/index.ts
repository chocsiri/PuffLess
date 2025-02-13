import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '@/views/HomeView.vue'
import HomeView2 from '@/views/HomeView2.vue'
import HomeView3 from '@/views/HomeView3.vue'
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