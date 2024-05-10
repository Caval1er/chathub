<template>
  <div>
    <LayoutSider detail-type="SiderGroup" location="right" :is-rail="false" />
    <div
      class="message-container pa-4"
      ref="scrollContainer"
      @scroll="onScroll"
    >
      <div v-for="(messages, date) in groupedMessage" :key="date">
        <div class="date-header">{{ formatDateHeader(date) }}</div>
        <v-divider></v-divider>
        <v-row
          v-for="message in messages"
          :key="message._id"
          class="chat-message"
        >
          <v-col class="avatar-col d-flex justify-end pr-0" cols="auto">
            <v-avatar>
              <v-img :src="message.sender.avatar"></v-img>
            </v-avatar>
          </v-col>
          <v-col class="message-col pl-2" cols="10">
            <v-row :gutter="2" align="start">
              <v-col
                class="message-content text-body-1 font-weight-regular"
                cols="auto"
              >
                {{ message.sender.nickname }}
              </v-col>
              <v-col cols="6" class="text-caption">
                {{ formatDate(message.createdAt) }}
              </v-col>
            </v-row>
            <v-card v-if="message.type === 'text'">
              <v-card-text class="pa-2 text-body-1">
                {{ message.text }}
              </v-card-text>
            </v-card>
            <v-card v-else-if="message.type === 'code'">
              <v-card-text>
                <pre>
              <code v-highlight :class="`language-${message.code.language}`">{{ message.code.content }}
              </code>
                </pre>
              </v-card-text>
              <v-card-actions class="flex">
                <v-spacer></v-spacer>
                <v-btn
                  icon="mdi-content-paste"
                  size="small"
                  @click="copyToClipboard(message.code.content)"
                ></v-btn>
                <v-btn
                  icon="mdi-square-edit-outline"
                  size="small"
                  @click="editCode(message._id)"
                ></v-btn>
                <v-btn
                  icon="mdi-check"
                  size="small"
                  @click="finlishCode"
                ></v-btn>
              </v-card-actions>
            </v-card>
            <v-img v-else-if="message.type === 'image'"></v-img>
            <div v-else></div>
          </v-col>
        </v-row>
      </div>
    </div>

    <v-footer height="72" app>
      <v-text-field
        v-model="message"
        bg-color="grey-lighten-1"
        class="overflow-hidden"
        density="compact"
        rounded="pill"
        variant="solo-filled"
        flat
        hide-details
        autofocus
        @keyup.enter="sendMessage"
      ></v-text-field>
    </v-footer>

    <v-dialog max-width="500" v-model="dialog">
      <v-card title="代码协作">
        <v-card-text>
          <MonacoEditor
            v-model="codeMessage.code.content"
            :language="codeMessage.code.language"
          />
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn text="退出" @click="dialog = false"></v-btn>
          <v-btn text="完成" @click="dialog = false"></v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, computed, watch, nextTick } from 'vue'
import LayoutSider from '@/layouts/default/Sider/index.vue'
import useUserStore from '@/store/modules/user'
import { useRoute } from 'vue-router'
import { useSocketStore } from '@/store/modules/socket'
import { format, isToday, isYesterday } from 'date-fns'
import { useRequest } from 'vue-request'
import { getMessageByLimit, getMessageById } from '@/api/chat/message'
import MonacoEditor from '@/components/MonacoEditor.vue'
const socketStore = useSocketStore()
const userStore = useUserStore()
const route = useRoute()
const messages = reactive([])
const message = ref('')
const scrollContainer = ref(null)
const hasMoreMessage = ref(true)
const getMessageByLimitRequest = useRequest(getMessageByLimit)
const getMessageByIdRequest = useRequest(getMessageById)
const isReadOnly = ref(true)
const socketInfo = reactive({
  socket: null,
  sender: '',
  messageId: '',
  room: '',
})
const dialog = ref(false)
const codeMessage = reactive({
  code: {
    content: '',
    language: '',
  },
})
onMounted(async () => {
  socketStore.getSocket.on('new-message', ({ room, message }) => {
    messages.push(message)
    nextTick(() => {
      scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight
    })
  })
})
watch(
  () => route.params.roomId,
  async (room) => {
    const messageResult = await getMessageByLimitRequest.runAsync(room)
    messages.splice(0, messages.length, ...messageResult)
    nextTick(() => {
      if (scrollContainer.value) {
        scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight
      }
    })
  },
  { immediate: true },
)
const sendMessage = async () => {
  const sender = userStore.getUserId
  const room = route.params.roomId
  const type = 'text'
  const text = message.value
  if (text.trim() === '') return
  socketStore.getSocket.emit(
    'send-message',
    { sender, room, type, text },
    (s) => {
      message.value = ''

      console.log(s)
    },
  )
}
const groupedMessage = computed(() => {
  return messages.reduce((groups, message) => {
    const dateKey = format(new Date(message.createdAt), 'yyyy-MM-dd')
    if (!groups[dateKey]) {
      groups[dateKey] = []
    }
    groups[dateKey].push(message)
    return groups
  }, {})
})

function formatDateHeader(date) {
  const parsedDate = new Date(date)
  if (isToday(parsedDate)) {
    return '今天'
  }
  if (isYesterday(parsedDate)) {
    return '昨天'
  }
  return format(parsedDate, 'yyyy-MM-dd')
}

function formatDate(date) {
  const parsedDate = new Date(date)
  return format(parsedDate, 'HH:mm')
}

async function onScroll() {
  if (
    scrollContainer.value.scrollTop === 0 &&
    !getMessageByLimitRequest.loading.value &&
    hasMoreMessage
  ) {
    const previousScrollHeight = scrollContainer.value.scrollHeight
    const messageResult = await getMessageByLimitRequest.runAsync(
      route.params.roomId,
      messages[0].createdAt,
    )
    if (messageResult.length === 0) {
      hasMoreMessage.value = false
    } else {
      messages.unshift(...messageResult)
      nextTick(() => {
        scrollContainer.value.scrollTop =
          scrollContainer.value.scrollHeight - previousScrollHeight
      })
    }
  }
}
function copyToClipboard(text) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      console.log('Copied editor content to clipboard!')
    })
    .catch((error) => {
      console.error('Failed to copy content:', error)
    })
}
async function editCode(id) {
  const data = await getMessageByIdRequest.runAsync(id)
  Object.assign(codeMessage, data)
  socketInfo.socket = socketStore.getSocket
  socketInfo.sender = useUserStore.getUserId
  socketInfo.messageId = id
  socketInfo.room = route.params.roomId
  dialog.value = true
}

function finlishCode() {
  isReadOnly.value = true
}
</script>

<style lang="scss" scoped>
.message-container {
  overflow-y: auto;
  height: calc(100vh - 64px - 72px);
}

pre code {
  white-space: pre-wrap; /* 保留空格和换行 */
  margin: 0; /* 去除默认的外边距 */
}
</style>
