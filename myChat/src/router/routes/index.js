import { pageConst } from '@/constant/pageConstant'

const modules = import.meta.glob('./modules/**/*.js', { eager: true })
const routeModuleList = []

Object.keys(modules).forEach((key) => {
  const mod = modules[key].default || {}
  const modList = Array.isArray(mod) ? [...mod] : [mod]
  routeModuleList.push(...modList)
})

//根路由
export const RootRoute = {
  path: '/',
  name: 'Root',
  redirect: pageConst.BASE_HOME,
}

//登录路由
export const LoginRoute = {
  path: '/auth',
  name: 'Auth',
  component: () => import('@/views/auth/index.vue'),
}

export const basicRoutes = [RootRoute, LoginRoute, ...routeModuleList]
