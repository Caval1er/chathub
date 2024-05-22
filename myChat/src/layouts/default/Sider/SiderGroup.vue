<template>
  <div class="ml-2 mt-2">在线用户</div>

  <v-list lines="three">
    <v-list-item
      v-for="user in userList.filter((user) => user.isOnline === true)"
      :key="user._id"
      :subtitle="user.bio"
      :value="user._id"
    >
      <template v-slot:title
        ><span>{{ user.nickname }}</span></template
      >
      <template v-slot:prepend>
        <v-avatar color="grey-lighten-1">
          <v-img :src="user.avatar"></v-img>
        </v-avatar>
      </template>
    </v-list-item>
  </v-list>

  <div class="ml-2">离线用户</div>

  <v-list lines="three">
    <v-list-item
      v-for="user in userList.filter((user) => user.isOnline === false)"
      :key="user._id"
      :subtitle="user.bio"
      :value="user._id"
    >
      <template v-slot:title
        ><span class="text-disabled">{{ user.nickname }}</span></template
      >
      <template v-slot:prepend>
        <v-avatar color="grey-lighten-1" style="opacity: 0.3">
          <v-img :src="user.avatar"></v-img>
        </v-avatar>
      </template>
    </v-list-item>
  </v-list>
</template>

<script setup>
import { reactive, watch } from 'vue'
import { useSocketStore } from '@/store/modules/socket'
import { getUsersByChannel } from '@/api/chat/channel-membership'
import { useRoute } from 'vue-router'
import { useRequest } from 'vue-request'
const route = useRoute()
const socketStore = useSocketStore()
const getgetUsersByChannelRequest = useRequest(getUsersByChannel)
const activeUserList = reactive([])
const userList = reactive([])
// watch(
//   [() => route.params.channelId, socketStore.getChannelUserList],
//   ([channelId, userlist]) => {
//     if (userlist.size > 0 && userlist.get(channelId)) {
//       activeUserList.splice(
//         0,
//         activeUserList.length,
//         ...userlist.get(channelId),
//       )
//     }
//   },
//   { immediate: true },
// )

watch(
  () => route.params.channelId,
  async (val) => {
    try {
      const userlistData = await getgetUsersByChannelRequest.runAsync(val)
      userList.splice(0, userList.length, ...userlistData)
    } catch (error) {}
  },
  { immediate: true },
)
watch(
  socketStore.getChannelUserInfo,
  (userInfo) => {
    console.log('ui', userInfo)
    userList.forEach((user) => {
      if (userInfo.get(route.params.channelId)) {
        const info = userInfo.get(route.params.channelId).broadcastInfo
        if (user._id === info.userId) {
          user.isOnline = info.isOnline
        }
      }
    })
  },
  { immediate: true },
)
</script>

<style lang="scss" scoped></style>
