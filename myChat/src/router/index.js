import { createRouter, createWebHistory } from 'vue-router'
import { basicRoutes } from './routes'

export const router = createRouter({
  history: createWebHistory(),
  routes: basicRoutes,
})

export function setupRouter(app) {
  app.use(router)
}

export default router
