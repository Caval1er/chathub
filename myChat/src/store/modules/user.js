import { defineStore } from 'pinia'
import { pinia } from '../index'
import { loginByLocal } from '@/api/auth'
import { getUserInfoById, getUserInfoByToken } from '@/api/user'
import { pageConst } from '@/constant/pageConstant'
import { TOKEN_KEY, USER_INFO_KEY } from '@/constant/cacheConstant'
import { getAuthCache, setAuthCache } from '@/utlis/auth'
import { useSocketStoreWithOut } from './socket'
import router from '@/router'
const socketStore = useSocketStoreWithOut()
const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: null,
    token: '',
    lastUpdatetime: 0,
  }),
  getters: {
    getUserId(state) {
      if (state.userInfo) {
        return state.userInfo.id || getAuthCache(USER_INFO_KEY).id
      }
    },
    getUserInfo(state) {
      return state.userInfo || getAuthCache(USER_INFO_KEY) || {}
    },
    getToken(state) {
      return state.token || getAuthCache(TOKEN_KEY)
    },
    getLastUpdateTime(state) {
      return state.lastUpdatetime
    },
  },
  actions: {
    setToken(token) {
      this.token = token ? token : ''
      setAuthCache(TOKEN_KEY, token)
    },
    setLastUpdateTime(lastUpdateTime) {
      this.lastUpdatetime = lastUpdateTime
    },
    async setUserInfo(info) {
      this.userInfo = info
      const time = new Date().getTime()
      this.setLastUpdateTime(time)
      setAuthCache(USER_INFO_KEY, info)
    },
    async login({ email, password }) {
      try {
        const data = await loginByLocal(email, password)
        const { token } = data
        this.setToken(token)
        socketStore.initializeSocket(this.token)
        await this.afterLoginAction()
      } catch (error) {
        Promise.reject(error)
      }
    },
    async afterLoginAction() {
      if (!this.getToken) return null
      try {
        const userInfo = await this.getUserInfoAction()
        console.log('getuserinfo:', this.getLastUpdateTime)
        await router.replace(pageConst.BASE_HOME)
        return userInfo
      } catch (error) {
        Promise.reject(error)
      }
    },
    async getUserInfoAction() {
      if (!this.getToken) return null
      try {
        const userInfo = await getUserInfoByToken()
        await this.setUserInfo(userInfo)
        return userInfo
      } catch (error) {
        Promise.reject(error)
      }
    },
  },
})

export function useUserStoreWithOut() {
  return useUserStore(pinia)
}

export default useUserStore
