import { pageConst } from '@/constant/pageConstant'
import { useUserStoreWithOut } from '@/store/modules/user'
import { useSocketStoreWithOut } from '@/store/modules/socket'
const AUTH_PATH = pageConst.BASE_LOGIN
const THIRD_LOGIN_PATH = pageConst.BASE_THIRD_LOGIN
// 白名单
const whitePathList = [AUTH_PATH, THIRD_LOGIN_PATH]
// 权限路由
export function createPermissionGuard(router) {
  const userStore = useUserStoreWithOut()
  const socketStore = useSocketStoreWithOut()
  router.beforeEach(async (to, from) => {
    const token = userStore.getToken
    if (whitePathList.includes(to.path)) {
      if (to.path === AUTH_PATH && token) {
        try {
          await userStore.afterLoginAction()
          let path
          if (to.query && to.query.redirect)
            path = encodeURIComponent(to.query.redirect)
          else path = '/'
          return path
        } catch (error) {
          Promise.reject(error)
          return false
        }
      }
      return true
    }
    if (!token) {
      const redirectData = {
        path: AUTH_PATH,
        replace: true,
      }
      if (to.path) {
        redirectData.query = {
          redirect: to.path,
        }
      }
      return redirectData
    } else {
      if (!socketStore.getSocket) {
        socketStore.initializeSocket(token)
      }
      if (userStore.getLastUpdateTime === 0) {
        try {
          await userStore.getUserInfoAction()
        } catch (error) {
          return false
        }
      }
      if (from.query.redirect) {
        const redirect = decodeURIComponent(from.query.redirect)
        if (redirect === to.fullPath) {
          return true
        } else {
          return { path: redirect, replace: true }
        }
      } else {
        return true
      }
    }
  })
}
