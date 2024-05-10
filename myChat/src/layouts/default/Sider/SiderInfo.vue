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
          style="position: absolute; right: 10%"
          @click.stop="dialog = true"
          >mdi-plus</v-icon
        >
      </v-expansion-panel-title>
      <v-expansion-panel-text>
        <v-list nav @click:select="onItemSelect">
          <v-list-item
            v-for="room in channelStore.getCurrentChannel
              ? channelStore.getCurrentChannel.rooms
              : []"
            :key="room._id"
            :value="room._id"
            color="primary"
            :active="isActive(room._id)"
          >
            <template v-slot:prepend>
              <v-icon size="x-small">mdi-pound</v-icon>
            </template>
            <template v-slot:append v-if="isActive(room._id)">
              <v-icon size="small" class="mr-1"
                >mdi-account-multiple-plus</v-icon
              >
              <v-icon size="small">mdi-cog</v-icon>
            </template>
            <template v-slot:append v-else>
              <div class="actions">
                <v-icon size="small" class="mr-1"
                  >mdi-account-multiple-plus</v-icon
                >
                <v-icon size="small">mdi-cog</v-icon>
              </div>
            </template>

            <v-list-item-title class="text-subtitle-1"
              >{{ room.name }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-expansion-panel-text>
    </v-expansion-panel>

    <v-dialog v-model="dialog">
      <v-card :title="formTitle">
        <v-card-text>
          <v-form v-model="valid" @submit.prevent="createRoom" ref="formRef">
            <v-row>
              <v-col cols="12"><span>房间类型</span></v-col>
            </v-row>
            <v-row>
              <v-col cols="6">
                <v-radio-group inline v-model="radios">
                  <v-radio label="文字房间" value="text-room"></v-radio>
                </v-radio-group>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12"><span>房间名称</span></v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <v-text-field v-model="form.name"></v-text-field>
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
</template>

<script setup>
import { reactive, computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRequest } from 'vue-request'
import { getRoomsByChannel, createRoomByChannel } from '@/api/chat/room'
import { useSocketStore } from '@/store/modules/socket'
import useChannelStore from '@/store/modules/channel'
import useUserStore from '@/store/modules/user'
const getRoomsByChannelRequest = useRequest(getRoomsByChannel)
const createRoomByChannelRequest = useRequest(createRoomByChannel)
const route = useRoute()
const router = useRouter()
const rooms = reactive([])
const dialog = ref(false)
const radios = ref('text-room')
const valid = ref(false)
const formRef = ref(null)
const channelStore = useChannelStore()
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
})
async function onItemSelect(item) {
  router.push({
    name: 'Channel',
    params: { channelId: route.params.channelId, roomId: item.id },
  })
  // const currentRoom = socketStore.getCurrentRoom
  // if (currentRoom) {
  //   if (currentRoom === item.id) {
  //     return
  //   }
  //   socketStore.getSocket.emit(
  //     'leave-room',
  //     { userId: userStore.getUserId, roomId: socketStore.getCurrentRoom },
  //     (s) => console.log('s:', s),
  //   )
  // }
  // socketStore.setCurrentRoom(item.id)
  // socketStore.getSocket.emit(
  //   'join-room',
  //   { userId: userStore.getUserId, roomId: item.id },
  //   (s) => console.log('s:', s),
  // )
}

const createRoom = async () => {
  try {
    await createRoomByChannelRequest.runAsync(form.name, route.params.channelId)
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
