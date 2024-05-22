<template>
  <v-list>
    <v-list-item value="title" :title="channelTitle">
      <template v-slot:append>
        <v-btn icon="mdi-menu-down" variant="text"></v-btn>
      </template>
    </v-list-item>
  </v-list>
  <v-divider></v-divider>
  <v-expansion-panels v-model="panel">
    <v-expansion-panel class="panels-title-container" value="roomList">
      <v-expansion-panel-title class="flex-row-reverse justify-end">
        <span>房间列表</span>
        <v-icon
          v-if="isCreator"
          style="position: absolute; right: 10%"
          @click.stop="dialog = true"
          >mdi-plus</v-icon
        >
      </v-expansion-panel-title>
      <v-expansion-panel-text>
        <v-list nav @click:select="onItemSelect">
          <v-list-item
            v-for="room in rooms ? rooms : []"
            :key="room._id"
            :value="room"
            color="primary"
            :active="isActive(room._id)"
          >
            <template v-slot:prepend>
              <v-icon size="x-small">mdi-pound</v-icon>
            </template>
            <template v-slot:append v-if="isActive(room._id) && isCreator">
              <v-icon size="small" @click.stop="editRoom(room._id)"
                >mdi-cog</v-icon
              >
            </template>
            <template v-slot:append v-else-if="isCreator">
              <div class="actions">
                <v-icon size="small" @click.stop="editRoom(room._id)"
                  >mdi-cog</v-icon
                >
              </div>
            </template>

            <v-list-item-title class="text-subtitle-1"
              >{{ room.name }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-expansion-panel-text>
    </v-expansion-panel>

    <v-dialog v-model="dialog" width="500">
      <v-card :title="formTitle">
        <v-card-text>
          <v-form v-model="valid" @submit.prevent="createRoom" ref="formRef">
            <v-row>
              <v-col cols="12"><span>房间名称</span></v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <v-text-field v-model="form.name"></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12"><span>房间密码(可选)</span></v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <v-text-field v-model="form.password"></v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn text="取消" @click="dialog = false"></v-btn>
          <v-btn
            text="创建"
            @click="createRoom"
            :loading="createRoomByChannelRequest.loading.value"
          ></v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-expansion-panels>

  <v-dialog v-model="dialog2" width="500">
    <v-card title="输入密码">
      <v-card-text>
        <v-form>
          <v-row>
            <v-col cols="12"><span>房间密码</span></v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-text-field v-model="formPassword.password"></v-text-field>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-btn text="取消" @click="dialog2 = false"></v-btn>
        <v-btn
          text="确认"
          @click="vertifyPassword"
          :loading="vertifyRoomRequest.loading.value"
        ></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-dialog v-model="dialog3" width="500">
    <v-card title="房间信息">
      <v-card-text>
        <v-form @submit.prevent="updateRoom" ref="formUpdateRef">
          <v-row>
            <v-col cols="12"><span>房间名称</span></v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-text-field v-model="updateForm.name"></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12"><span>房间密码(可选)</span></v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-text-field v-model="updateForm.password"></v-text-field>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-btn text="取消" @click="dialog3 = false"></v-btn>
        <v-btn
          text="创建"
          @click="updateRoom"
          :loading="updateRoomRequest.loading.value"
        ></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { reactive, computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRequest } from 'vue-request'
import {
  getRoomsByChannel,
  createRoomByChannel,
  vertifyRoom,
  getRoomById,
  updateRoomById,
} from '@/api/chat/room'
import { useSocketStore } from '@/store/modules/socket'
import useChannelStore from '@/store/modules/channel'
import useUserStore from '@/store/modules/user'
import { onMounted } from 'vue'
import { watch } from 'vue'
const getRoomsByChannelRequest = useRequest(getRoomsByChannel)
const createRoomByChannelRequest = useRequest(createRoomByChannel)
const getRoomByIdRequest = useRequest(getRoomById)
const vertifyRoomRequest = useRequest(vertifyRoom)
const updateRoomRequest = useRequest(updateRoomById)
const route = useRoute()
const router = useRouter()
const rooms = reactive([])
const dialog = ref(false)
const dialog2 = ref(false)
const dialog3 = ref(false)
const radios = ref('text-room')
const valid = ref(false)
const formRef = ref(null)
const channelStore = useChannelStore()
const routePush = reactive({})
const socketStore = useSocketStore()
const userStore = useUserStore()
const formTitle = computed(() => {
  if (radios.value === 'text-room') return '创建文字房间'
  else if (radios.value === 'voice-room') return '创建语言房间'
})
const channelTitle = computed(
  () =>
    channelStore.getCurrentChannel &&
    channelStore.getCurrentChannel.channel.name,
)
const panel = ref(['roomList'])
const form = reactive({
  name: '',
  password: '',
})
const formPassword = reactive({
  password: '',
})
const updateForm = reactive({
  id: '',
  name: '',
  password: '',
})
const isCreator = computed(() => {
  if (channelStore.getCurrentChannel) {
    return (
      channelStore.getCurrentChannel.channel.creator === userStore.getUserId
    )
  } else {
    return false
  }
})
async function onItemSelect(item) {
  if (item.id.pass) {
    dialog2.value = true
    Object.assign(routePush, {
      channelId: route.params.channelId,
      roomId: item.id._id,
    })
  } else {
    router.push({
      name: 'Channel',
      params: { channelId: route.params.channelId, roomId: item.id._id },
    })
  }
}

async function editRoom(id) {
  try {
    const data = await getRoomByIdRequest.runAsync(id)
    updateForm.id = data._id
    updateForm.name = data.name
    updateForm.password = data.pass
    dialog3.value = true
  } catch (error) {}
}
async function updateRoom() {
  try {
    await updateRoomRequest.runAsync(
      updateForm.id,
      updateForm.name,
      updateForm.password,
    )
    const roomInfo = await getRoomsByChannelRequest.runAsync(
      route.params.channelId,
    )
    rooms.splice(0, rooms.length, ...roomInfo)
  } catch (error) {
  } finally {
    dialog3.value = false
  }
}

watch(
  () => route.params.channelId,
  async (val) => {
    if (!val) return
    const roomInfo = await getRoomsByChannelRequest.runAsync(val)
    rooms.splice(0, rooms.length, ...roomInfo)
  },
  { immediate: true },
)

const createRoom = async () => {
  try {
    await createRoomByChannelRequest.runAsync(
      form.name,
      route.params.channelId,
      form.password,
    )
    const roomInfo = await getRoomsByChannelRequest.runAsync(
      route.params.channelId,
    )
    rooms.splice(0, rooms.length, ...roomInfo)
  } catch (error) {
    console.error(error)
  } finally {
    formRef.value.reset()
    dialog.value = false
  }
}

function isActive(roomId) {
  return route.params.roomId === roomId
}
async function vertifyPassword() {
  try {
    const data = await vertifyRoomRequest.runAsync(
      routePush.roomId,
      formPassword.password,
    )
    if (data) {
      router.push({
        name: 'Channel',
        params: routePush,
      })
    }
  } catch (error) {
  } finally {
    formPassword.password = ''
    dialog2.value = false
  }
}
</script>

<style lang="scss" scoped>
.panels-title-container {
  :deep(.v-expansion-panel-title__icon) {
    margin-inline-start: 0px;
  }
}

.v-list-item {
  :deep(.v-list-item__prepend) {
    width: 25px;
  }
}

.actions {
  display: none;
}

.v-list-item:hover {
  .actions {
    display: block;
  }
}

.v-expansion-panel-text {
  :deep(.v-expansion-panel-text__wrapper) {
    padding: 0;
  }
}
.v-expansion-panel-title {
  padding: 0px;
}
</style>
