<template>
  <div class=""></div>
</template>

<script setup>
import { io } from 'socket.io-client'
import useUserStore from '@/store/modules/user'
const userStore = useUserStore()
const socket = io('http://localhost:3000', {
  query: {
    token: userStore.getToken,
  },
})

socket.on('connect', () => {})
socket.emit(
  'join-channel',
  {
    userId: userStore.getUserId,
    channelId: '66248b7bf22895993bb17edd',
  },
  (info) => {
    console.log(info)
  },
)
</script>

<style lang="scss" scoped></style>
