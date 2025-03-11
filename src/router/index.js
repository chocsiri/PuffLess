import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Login from '../views/addminnn/Login.vue'
import Dashboard from '../views/addminnn/Dashboard.vue'
import HomeView2 from '../views/HomeView2.vue'
import HomeView4 from '../views/HomeView4.vue'
import HomeView5 from '../views/Homeview5.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/addminnn/Login',
      name: 'login',
      component: Login
    },
    {
      path: '/addminnn/Dashboard',
      name: 'dashboard',
      component: Dashboard,
      meta: { requiresAuth: true }
    },
    {
      path: '/HomeView2',
      name: 'statistics',
      component: HomeView2
    },
    {
      path: '/HomeView4',
      name: 'pollutants',
      component: HomeView4
    },
    {
      path: '/HomeView5',
      name: 'about',
      component: HomeView5
    },
    {
      path: '/Login',
      redirect: '/addminnn/Login'
    },
    {
      path: '/Dashboard',
      redirect: '/addminnn/Dashboard'
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
})

// เพิ่ม navigation guard เพื่อตรวจสอบการล็อกอิน
router.beforeEach((to, from, next) => {
  // ตรวจสอบว่า route นี้ต้องการการตรวจสอบการล็อกอินหรือไม่
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // ตรวจสอบว่ามีข้อมูลผู้ใช้ใน localStorage หรือไม่
    const isLoggedIn = localStorage.getItem('user') !== null;
    
    if (!isLoggedIn) {
      // ถ้าไม่ได้ล็อกอิน ให้ไปที่หน้าล็อกอิน
      next({ path: '/addminnn/Login' });
    } else {
      // ถ้าล็อกอินแล้ว ให้ไปที่หน้าที่ต้องการ
      next();
    }
  } else {
    // ถ้า route ไม่ต้องการการตรวจสอบการล็อกอิน ให้ไปต่อได้เลย
    next();
  }
})

export default router 