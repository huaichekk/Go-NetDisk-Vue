import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Chat from '@/views/Chat.vue'
import UserCenterView from '@/views/UserCenterView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', name: 'login', component: () => import('../views/Login.vue'), },
    { path: '/home', name: 'Home', component: Home },
    { path: '/register', name: 'register', component: () => import('../views/Register.vue'), },
    { path: '/chat', name: 'Chat', component: Chat },
    { path: '/user', name: 'UserCenter', component: UserCenterView },
  ],
})

export default router
