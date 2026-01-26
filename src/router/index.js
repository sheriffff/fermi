import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue')
  },
  {
    path: '/profe',
    name: 'profe',
    component: () => import('@/views/ProfeView.vue')
  },
  {
    path: '/adultos',
    name: 'adultos',
    component: () => import('@/views/AdultosView.vue')
  },
  {
    path: '/random',
    name: 'random',
    component: () => import('@/views/RandomView.vue')
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('@/views/AdminView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
