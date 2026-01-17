// router/index.ts
import { createRouter, createWebHistory } from "vue-router";
import Dashboard from "../views/Dashboard.vue";
import AddSystem from "../views/AddSystem.vue";
import SysDetail from "../views/SysDetail.vue";
import Login from "../views/Login.vue";

const routes = [
  {
    path: "/login",
    name: "Login",
    component: Login,
  },
  {
    path: "/",
    name: "Dashboard",
    component: Dashboard,
    meta: { requiresAuth: true },
  },
  {
    path: "/add-system",
    name: "AddSystem",
    component: AddSystem,
    meta: { requiresAuth: true },
  },
  {
    path: "/system/:id",
    name: "SysDetail",
    component: SysDetail,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard to check authentication
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem("userId");

  if (to.meta.requiresAuth && !isAuthenticated) {
    // Redirect to login if route requires auth and user is not authenticated
    next("/login");
  } else if (to.path === "/login" && isAuthenticated) {
    // Redirect to dashboard if user is already logged in
    next("/");
  } else {
    next();
  }
});

export default router;
