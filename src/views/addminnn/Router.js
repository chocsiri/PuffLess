import { createRouter, createWebHistory } from "vue-router";
import Dashboard from "./views/Dashboard.vue";
import Admin from "./views/Admin.vue";
import Login from "./views/Login.vue";

const routes = [
  { path: "/", component: Dashboard },
  { path: "/login", component: Login },
  { path: "/admin", component: Admin, meta: { requiresAuth: true } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem("admin_token");
  if (to.meta.requiresAuth && !isAuthenticated) {
    next("/login");
  } else {
    next();
  }
});

export default router;
