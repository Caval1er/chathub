// store/socketStore.js
import { defineStore } from 'pinia'
import { io } from 'socket.io-client'
import { pinia } from '../index'
import { getRoomById } from '@/api/chat/room'
export const useSocketStore = defineStore('socket', {
  state: () => ({
    socket: null,
    channelUserInfo: new Map(),
    hasJoinChannel: new Set(),
    roomUserInfo: new Map(),
    currentRoom: '',
  }),
  getters: {
    getSocket: (state) => state.socket,
    getHasJoinChannel: (state) => state.hasJoinChannel,
    getChannelUserInfo: (state) => state.channelUserInfo,
    getCurrentRoom: (state) => state.currentRoom,
  },
  actions: {
    initializeSocket(token) {
      this.socket = io('http://localhost:3000', { query: { token } })
      this.socket.on('connect', () => {
        console.log('Connected to server')
      })
      this.registerEvent()
    },
    registerEvent() {
      this.socket.on('channelUsersUpdate', (data) => {
        this.setChannelUserInfo(data.channelId, {
          users: data.users,
          broadcastInfo: { userId: data.userId, isOnline: data.isOnline },
        })
      })
      this.socket.on('roomUsersUpdate', (data) => {
        console.log(data)
        this.setRoomUserInfo(data.roomId, {
          users: data.users,
        })
      })
    },
    disconnectSocket() {
      if (this.socket) {
        this.socket.close()
        this.socket = null
      }
    },
    setChannelUserInfo(channelId, info) {
      this.channelUserInfo.set(channelId, info)
    },
    setHasJoinChannel(flag) {
      this.hasJoinChannel.add(flag)
    },
    setRoomUserInfo(roomId, info) {
      this.roomUserInfo.set(roomId, info)
    },
    async setCurrentRoom(room) {
      const roomInfo = await getRoomById(room)
      this.currentRoom = roomInfo
    },
  },
})
export function useSocketStoreWithOut() {
  return useSocketStore(pinia)
}
