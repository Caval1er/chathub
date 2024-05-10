import axios from 'axios'
import { useEnv } from '@/utlis/vite'
import { checkStatus } from './checkStatus'
import httpConstant from '@/constant/httpConstant'
import { useNotificationStoreWithOut } from '@/store/modules/notification'
import { getToken } from '@/utlis/auth/index'
const notificationStore = useNotificationStoreWithOut()
const { VITE_BASE_API } = useEnv()
const http = axios.create({
  baseURL: VITE_BASE_API,
  timeout: 10 * 1000,
})

//请求拦截器
http.interceptors.request.use(
  (config) => {
    const token = getToken()
    console.log('token:', token)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

//响应拦截器
http.interceptors.response.use(
  (response) => {
    const { data, config } = response
    const messageMode = config.mode || 'none'
    if (!data) {
      throw new Error('未响应')
    }
    const { code, message } = data
    const result = data.data
    let isSuccessed =
      data && Reflect.has(data, 'code') && code === httpConstant.SUCCESS

    if (isSuccessed) {
      let successMsg = message || '访问成功'
      if (messageMode === 'message') {
        notificationStore.setSnackbars({
          text: successMsg,
          color: 'success',
        })
      }
      return result
    } else {
      let msg = ''
      //根据code做其他操作

      switch (code) {
        case 400:
          if (config.mode === 'message') {
            msg = message || '客户端错误'
            notificationStore.setSnackbars({ text: message, color: 'error' })
          }
          return Promise.reject({
            code: 400,
            message: msg,
          })

        case 404:
          return Promise.reject({
            message: '404 not found',
          })

        default:
          msg = message || '异常操作'
          break
      }
    }
  },
  (error) => {
    console.log(error)
    const { response, code, message, config } = error || {}
    const errorMessageMode = config.mode || 'none'
    const msg = response.data.error ? response.data.error.msg : ''
    const status = response.status
    checkStatus(status, msg, errorMessageMode)
    return Promise.reject(error)
  },
)
export default http
