import { useNotificationStoreWithOut } from '@/store/modules/notification'
const notificationStore = useNotificationStoreWithOut()
export function checkStatus(status, msg, errorMessageMode = 'message') {
  //引入userStore
  let errMessage = ''

  switch (status) {
    case 400:
      errMessage = msg
      break
    case 401:
      errMessage = msg || '访问未授权'
      break
    case 404:
      errMessage = msg || '页面不存在'
      break
    case 500:
      errMessage = msg || '服务端出现错误'
      break
  }
  console.log('error:', errMessage)
  if (errMessage) {
    if (errorMessageMode === 'message') {
      notificationStore.setSnackbars({ text: errMessage, color: 'error' })
    }
  }
}
