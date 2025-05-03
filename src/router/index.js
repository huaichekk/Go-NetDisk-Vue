import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {path: '/', redirect:'/login'},
    {path: '/login', name: 'login', component: () => import('../views/Login.vue'),},
    {path: '/home', name: 'home', component: () => import('../views/Home.vue'),},
    {path: '/register', name: 'register', component: () => import('../views/Register.vue'),},
  ],
})

export default router
