// router/index.ts
import { createRouter, createWebHistory } from "vue-router";
import Dashboard from "./views/Dashboard.vue";
import SysDetail from "./views/SysDetail.vue";
import AddSystem from "./views/AddSystem.vue";

const routes = [
  {
    path: "/",
    name: "Dashboard",
    component: Dashboard,
  },
  {
    path: "/add-system",
    name: "AddSystem",
    component: AddSystem,
  },
  {
    path: "/system/:id",
    name: "SystemDetail",
    component: SysDetail,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
