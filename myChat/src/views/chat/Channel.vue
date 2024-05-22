<template>
  <div>
    <LayoutSider detail-type="SiderGroup" location="right" :is-rail="false" />
    <div
      class="message-container pa-4"
      ref="scrollContainer"
      @scroll="onScroll"
      style="background-color: #f2f2f2"
    >
      <div v-for="(messages, date) in groupedMessage" :key="date">
        <div class="date-header mt-8 font-weight-bold">
          {{ formatDateHeader(date) }}
        </div>
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
          <v-col class="message-col pl-2" cols="auto">
            <v-row :gutter="2" class="align-center">
              <v-col
                class="message-content text-body-1 font-weight-bold"
                cols="auto"
              >
                {{ message.sender.nickname }}
              </v-col>
              <v-col cols="auto" class="text-caption font-weight-light">
                {{ formatDate(message.createdAt) }}
              </v-col>
            </v-row>
            <v-row class="mt-1 ml-1">
              <v-card
                v-if="message.type === 'text'"
                variant="elevated"
                :color="
                  message.sender._id === userStore.getUserId
                    ? '#95ec69'
                    : 'white'
                "
                max-width="500"
              >
                <v-card-text class="pa-2 text-body-1">
                  {{ message.text }}
                </v-card-text>
              </v-card>
              <v-card
                v-else-if="message.type === 'code'"
                min-width="500"
                :subtitle="message.code.language"
              >
                <v-card-text>
                  <pre>
              <code v-highlight :class="`language-${message.code.language}`" style="padding: 0px;">{{ message.code.content }}
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
                    size="small"
                    v-if="message.sender._id === userStore.getUserId"
                    @click="initSwitch(message._id)"
                  >
                    <v-icon>mdi-share</v-icon>
                    <v-menu activator="parent" :close-on-content-click="false">
                      <v-list>
                        <v-list-item>
                          <v-switch
                            v-model="switchRef[message._id]"
                            label="与他人一起编辑"
                            color="purple"
                            hide-details
                          >
                          </v-switch>
                        </v-list-item>
                        <v-list-item>
                          <v-btn
                            @click="editCode(message._id, message.sender._id)"
                            block
                          >
                            共享协作
                          </v-btn>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </v-btn>
                </v-card-actions>
              </v-card>
              <v-img
                class="cursor-pointer"
                v-else-if="message.type === 'image'"
                :src="message.imageUrl"
                max-height="125"
                max-width="200"
                @click="dialogs[message._id] = true"
              >
              </v-img>
            </v-row>
            <v-dialog v-model="dialogs[message._id]" max-width="1000">
              <v-img
                :src="message.imageUrl"
                max-width="800"
                max-height="800"
              ></v-img>
            </v-dialog>
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
        @keyup.enter="sendMessage('text')"
      >
        <template v-slot:append-inner>
          <v-icon class="cursor-pointer mr-4" @click.stop="triggerFileInput"
            >mdi-image</v-icon
          >
          <v-icon class="cursor-pointer mr-" @click.stop="toggleCodeEditor"
            >mdi-xml</v-icon
          >
        </template>
      </v-text-field>
    </v-footer>
    <v-dialog v-model="dialog2" width="1000">
      <v-card title="代码编辑器">
        <v-card-text>
          <v-text-field
            v-model="code.language"
            placeholder="请输入编辑的语言"
          ></v-text-field>
        </v-card-text>
        <v-card-text>
          <CodeEditor v-model="code.content" :language="code.language" />
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text="退出" @click="dialog2 = false"></v-btn>
          <v-btn text="完成" @click="sendMessage('code')"></v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <input
      type="file"
      ref="fileInputRef"
      @change="previewImage"
      accept="image/*"
      style="display: none"
    />
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
            :ready-only="!switchRef[messageId]"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text="退出" @click="exitEditCode"></v-btn>
          <v-btn text="完成" @click="finishEditCode"></v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog max-width="500" v-model="dialog1">
      <v-card title="上传图片">
        <v-card-text>
          <v-img :src="imgUrl"></v-img>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text="退出" @click="dialog1 = false"></v-btn>
          <v-btn text="上传" @click="uploadImage"></v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, computed, watch, nextTick } from 'vue'
import LayoutSider from '@/layouts/default/Sider/index.vue'
import useUserStore from '@/store/modules/user'
import useChannelStore from '@/store/modules/channel'
import { useRoute } from 'vue-router'
import { useSocketStore } from '@/store/modules/socket'
import { format, isToday, isYesterday } from 'date-fns'
import { useRequest } from 'vue-request'
import {
  getMessageByLimit,
  getMessageById,
  updateMessageById,
  uploadImageByImage,
} from '@/api/chat/message'
import MonacoEditor from '@/components/MonacoEditor.vue'
import CodeEditor from '@/components/CodeEditor.vue'
const fileInputRef = ref(null)
const socketStore = useSocketStore()
const userStore = useUserStore()
const route = useRoute()
const channelStore = useChannelStore()
const messages = reactive([])
const message = ref('')
const imgUrl = ref('')
const code = reactive({
  language: '',
  content: '',
})
const scrollContainer = ref(null)
const hasMoreMessage = ref(true)
const getMessageByLimitRequest = useRequest(getMessageByLimit)
const getMessageByIdRequest = useRequest(getMessageById)
const updateMessageByIdRequest = useRequest(updateMessageById)
const uploadImageRequest = useRequest(uploadImageByImage)
const switchRef = reactive({})
const dialog1 = ref(false)
const dialog2 = ref(false)
function toggleCodeEditor() {
  dialog2.value = true
}
const socketInfo = reactive({
  socket: null,
  sender: '',
  messageId: '',
  room: '',
})
const messageId = ref('')
const dialog = ref(false)
const dialogs = reactive({})
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
  socketStore.getSocket.on('new-code', ({ content }) => {
    codeMessage.code.content = content
  })
})
watch(
  switchRef,
  (val) => {
    console.log('switch:', val)
    channelStore.setSwitch(val)
  },
  { deep: true },
)
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
const fileModel = ref(null)
function previewImage(event) {
  const file = event.target.files[0]
  fileModel.value = file
  if (file && file.type.startsWith('image')) {
    const reader = new FileReader()
    reader.onload = (e) => {
      imgUrl.value = e.target.result
      dialog1.value = true
    }
    reader.readAsDataURL(file)
  }
}
function triggerFileInput() {
  const input = fileInputRef.value
  if (input) {
    input.click()
  }
}
const currentCollaborate = computed(() => {
  if (messageId.value) {
    if (socketStore.getCurrentRoom.collaborates)
      return socketStore.getCurrentRoom.collaborates[messageId.value]
    else return { content: '', users: [] }
  } else return { content: '', users: [] }
})
const sendMessage = async (contentType) => {
  const sender = userStore.getUserId
  const room = route.params.roomId
  const type = contentType
  const text = message.value
  let codeData
  if (contentType === 'code') {
    codeData = code
    console.log('codeData:', codeData)
  }
  if (type === 'text' && text.trim() === '') return
  socketStore.getSocket.emit(
    'send-message',
    { sender, room, type, text, code: codeData },
    (s) => {
      message.value = ''
      console.log(s)
      if (s.message.type === 'code') {
        dialog2.value = false
        code.language = ''
        code.content = ''
      }
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
function initSwitch(messageId) {
  if (!switchRef[messageId]) {
    switchRef[messageId] = false
  }
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
async function editCode(id, createId) {
  const data = await getMessageByIdRequest.runAsync(id)
  Object.assign(codeMessage, data)
  messageId.value = id
  channelStore.setCreateColUserId(createId)
  socketInfo.socket = socketStore.getSocket
  socketInfo.sender = {
    id: userStore.getUserId,
    info: userStore.getUserInfo,
  }
  socketInfo.messageId = id
  socketInfo.room = route.params.roomId

  socketInfo.socket.emit(
    'join-collaborate',
    {
      messageId: socketInfo.messageId,
      roomId: socketInfo.room,
      content: data.code.content,
      user: socketInfo.sender,
      canEdit: switchRef[id],
    },
    (s) => {
      codeMessage.code.content = s.data.content
      console.log('s:', s)
    },
  )

  dialog.value = true
}

function exitEditCode() {
  dialog.value = false
}
async function uploadImage() {
  try {
    const result = await uploadImageRequest.runAsync(
      fileModel.value,
      userStore.getUserId,
      route.params.roomId,
      'image',
    )
    socketStore.getSocket.emit(
      'send-message',
      {
        sender: result.sender,
        room: result.room,
        type: 'image',
        messageId: result._id,
      },
      (s) => {
        console.log(s)
      },
    )
  } catch (error) {
  } finally {
    dialog1.value = false
  }
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
