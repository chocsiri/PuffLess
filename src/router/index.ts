import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '@/views/HomeView.vue'
import HomeView2 from '@/views/HomeView2.vue'
import HomeView4Vue from '@/views/HomeView4.vue'
import Homeview5Vue from '@/views/Homeview5.vue'
import LoginVue from '@/views/addminnn/Login.vue'
import AdminVue from '@/views/addminnn/Admin.vue'
import AdminPM25InputVue from '@/views/addminnn/AdminPM25Input.vue'

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
      path: '/Homeview4',
      name: 'home4',
      component: HomeView4Vue
    },
    {
      path: '/Homeview5',
      name: 'home5',
      component: Homeview5Vue
    },
    {
      path: '/Login',
      name: 'login',
      component: LoginVue
    },
    {
      path: '/',
      name: 'admin',
      component: LoginVue,
      meta: { requiresAuth: true }
    },
    {
      path: '/admin/pm25-input',
      name: 'adminPM25Input',
      component: AdminPM25InputVue,
      meta: { requiresAuth: true }
    }
  ]
})

// Navigation Guard
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      next('/Login')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router