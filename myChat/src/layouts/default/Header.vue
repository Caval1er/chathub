<template>
  <v-app-bar :elevation="3">
    <template v-slot:prepend>
      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn
            color="primary"
            v-bind="props"
            icon="mdi-account-group"
            @click="getCollaborates"
          >
          </v-btn>
        </template>
        <v-list
          nav
          @click:select="onItemSelect"
          density="compact"
          variant="tonal"
          color="primary"
        >
          <v-list-item
            v-for="collaborate in roomCollaborates"
            :value="collaborate.messageId"
          >
            <template v-slot:title>
              <span>{{ collaborate.messageId }}</span>
            </template>
            <template v-slot:append>
              <v-avatar v-for="avatar in collaborate.users" size="small">
                <v-img :src="avatar.avatar"></v-img>
              </v-avatar>
            </template>
          </v-list-item>
        </v-list>
      </v-menu>
    </template>
    <v-app-bar-title>{{ socketStore.getCurrentRoom.name }}</v-app-bar-title>

    <v-dialog max-width="500" v-model="dialog">
      <v-card>
        <template v-slot:title
          >代码协作-{{ codeMessage.code.language }}</template
        >
        <template v-slot:subtitle>
          <v-avatar v-for="user in currentCollaborate.users" :key="user.id">
            <v-img :src="user.avatar"></v-img>
          </v-avatar>
        </template>
        <v-card-text>
          <MonacoEditor
            v-model="codeMessage.code.content"
            :language="codeMessage.code.language"
            :socket-info="socketInfo"
            :ready-only="!currentCollaborate.canEdit"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text="退出" @click="exitEditCode"></v-btn>
          <v-btn text="完成" @click="finishEditCode"></v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app-bar>
</template>

<script setup>
import { useSocketStore } from '@/store/modules/socket'
import { reactive, ref, watch, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import MonacoEditor from '@/components/MonacoEditor.vue'
import useChannelStore from '@/store/modules/channel'
import {
  getMessageByLimit,
  getMessageById,
  updateMessageById,
} from '@/api/chat/message'
import { useRequest } from 'vue-request'
import useUserStore from '@/store/modules/user'
const channelStore = useChannelStore()
const userStore = useUserStore()
const dialog = ref(false)
const route = useRoute()
const socketStore = useSocketStore()
const roomCollaborates = reactive({})
const messageId = ref('')
const getMessageByIdRequest = useRequest(getMessageById)
const updateMessageByIdRequest = useRequest(updateMessageById)
onMounted(async () => {
  socketStore.getSocket.on('new-code', ({ content }) => {
    codeMessage.code.content = content
  })
})
watch(
  [() => route.params.roomId, () => socketStore.getRoomCollaborates],
  ([val1, val2]) => {
    if (val1 && val2) {
      console.log('val1:', val1)
      console.log('val2', val2)
      Object.assign(roomCollaborates, val2.get(val1))
    }
  },
  { deep: true, immediate: true },
)
watch(dialog, async (value) => {
  if (!value) {
    const messageId = socketInfo.messageId
    const roomId = socketInfo.room
    const user = socketInfo.sender
    socketStore.getSocket.emit(
      'leave-collaborate',
      { messageId, roomId, user },
      (s) => {
        console.log(s)
      },
    )
  }
})
const currentCollaborate = computed(() => {
  if (messageId.value) {
    if (socketStore.getCurrentRoom.collaborates)
      return socketStore.getCurrentRoom.collaborates[messageId.value]
    else return { content: '', users: [] }
  } else return { content: '', users: [] }
})
async function onItemSelect(item) {
  const data = await getMessageByIdRequest.runAsync(item.id)
  Object.assign(codeMessage, data)
  channelStore.setCreateColUserId(data.sender._id)
  messageId.value = item.id
  socketInfo.socket = socketStore.getSocket
  socketInfo.sender = {
    id: userStore.getUserId,
    info: userStore.getUserInfo,
  }
  socketInfo.messageId = item.id
  socketInfo.room = route.params.roomId
  socketInfo.socket.emit(
    'join-collaborate',
    {
      messageId: socketInfo.messageId,
      roomId: socketInfo.room,
      content: data.code.content,
      user: socketInfo.sender,
    },
    (s) => {
      codeMessage.code.content = s.data.content
      console.log('s:', s)
    },
  )

  dialog.value = true
}
const socketInfo = reactive({
  socket: null,
  sender: '',
  messageId: '',
  room: '',
})
const codeMessage = reactive({
  code: {
    content: '',
    language: '',
  },
})
function exitEditCode() {
  dialog.value = false
}
async function finishEditCode() {
  try {
    await updateMessageByIdRequest.runAsync(socketInfo.messageId, {
      code: codeMessage.code,
    })
  } catch (error) {
  } finally {
    dialog.value = false
  }
}
function getCollaborates() {
  console.log('roomId:', route.params.roomId)
  socketStore.getSocket.emit(
    'get-collaborate',
    { roomId: route.params.roomId },
    (s) => {
      if (s.status === 'ok')
        Object.assign(roomCollaborates, s.data.collaborates)
      else if (s.status === 'error') {
        console.log('error:')
        Object.assign(roomCollaborates, {})
      }
    },
  )
}
</script>

<style lang="scss" scoped></style>
