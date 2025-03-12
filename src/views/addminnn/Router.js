import { createRouter, createWebHistory } from "vue-router";
import Dashboard from "./views/Dashboard.vue";
import Admin from "./Admin.vue";
import Login from "./views/Login.vue";
import AdminPM25Input from './AdminPM25Input.vue'

const routes = [
  { path: "/", component: Dashboard },
  { path: "/login", component: Login },
  { path: "/admin", component: Admin, meta: { requiresAuth: true } },
  {
    path: '/admin/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/admin/pm25-input',
    name: 'AdminPM25Input',
    component: AdminPM25Input,
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      next('/admin/login')
    } else {
      next()
    }
  } else {
    next()
  }
});

export default router;
