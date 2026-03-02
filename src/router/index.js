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
    path: '/test',
    name: 'test',
    component: () => import('@/views/TestView.vue')
  },
  {
    path: '/random',
    name: 'random',
    component: () => import('@/views/RandomView.vue')
  },
  {
    path: '/admin',
    component: () => import('@/views/AdminView.vue'),
    children: [
      {
        path: 'datos',
        name: 'admin-datos',
        component: () => import('@/views/AdminDataEntryView.vue')
      },
      {
        path: 'metricas',
        name: 'admin-metricas',
        component: () => import('@/views/AdminMetricsView.vue')
      },
      {
        path: 'exportar',
        name: 'admin-exportar',
        component: () => import('@/views/AdminExportView.vue')
      }
    ]
  },
  {
    path: '/upload/:userId',
    name: 'upload',
    component: () => import('@/views/UploadView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
