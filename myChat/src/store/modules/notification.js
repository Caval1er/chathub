import { defineStore } from 'pinia'
import { pinia } from '../index'
import { v4 as uuidv4 } from 'uuid'
export const useNotificationStore = defineStore('notification', {
  state: () => ({
    snackbars: [],
  }),
  actions: {
    setSnackbars(snackbar) {
      snackbar.id = uuidv4()
      snackbar.isShow = snackbar.isShow || true
      snackbar.color = snackbar.color || 'success'
      this.snackbars.push(snackbar)
    },
  },
})

export function useNotificationStoreWithOut() {
  return useNotificationStore(pinia)
}
