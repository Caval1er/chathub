<template>
  <div class="avatar d-flex justify-center mb-4 mt-4"> <v-avatar>
      <v-img :src="userStore.getUserInfo.avatar"></v-img>
    </v-avatar></div>
   
  <v-divider></v-divider>
  <v-list density="compact" nav @click:select="onItemSelect" class="d-flex flex-column align-center">
    <v-list-item
      v-for="channel in channelStore.getChannels"
      :key="channel.channel._id"
      :value="channel"
      rounded="sm"
      :active="isActive(channel)"
      active-class="tab-active"
      color="white"
      class="pa-0 mb-3"
      width="45px"
    >
      <template v-slot:prepend>
        <v-tooltip location="right">
          <template v-slot:activator="{ props }">
            <v-avatar size="45px" v-bind="props" rounded="lg" variant="elevated" class="icon-button">
              <v-img
                v-if="validateAvatar(channel.channel.avatar) === 'URL'"
                :src="channel.channel.avatar"
              >
              </v-img>
              <v-icon
                v-else-if="validateAvatar(channel.channel.avatar) === 'MDI'"
                :icon="channel.channel.avatar"
              ></v-icon>
              <span v-else>
                {{ channel.channel.avatar }}
              </span>
            </v-avatar>
          </template>
          <span>{{ channel.channel.name }}</span>
        </v-tooltip>
      </template>
    </v-list-item>
  </v-list>
  <v-divider></v-divider>
  <v-list class="d-flex justify-center">
    <v-list-item value="createChannel" style="padding: 5px"  >
      <template v-slot:prepend>
        <v-list-item-action>
          <v-btn
            icon="mdi-plus"
            @click.prevent="toggleDialog({ dialog1: true })"
          />
        </v-list-item-action>
      </template>
    </v-list-item>
  </v-list>
  <v-dialog
    v-model="dialogList['dialog1']"
    class="dialog-interface"
    width="500"
  >
    <v-card title="开启你的聊天之旅吧">
      <v-list lines="three">
        <v-list-item
          title="创建"
          subtitle="创建一个新的服务器并邀请小伙伴加入"
          value="创建"
          @click.prevent="toggleDialog({ dialog1: false, dialog2: true })"
        >
          <template v-slot:prepend>
            <v-avatar color="grey-lighten-1">
              <v-icon color="white">mdi-folder</v-icon>
            </v-avatar>
          </template>
        </v-list-item>
        <v-list-item
          title="加入"
          subtitle="输入即时邀请并加入你小伙伴的频道"
          value="加入"
          @click.prevent="toggleDialog({ dialog1: false, dialog3: true })"
        >
          <template v-slot:prepend>
            <v-avatar color="grey-lighten-1">
              <v-icon color="white">mdi-folder</v-icon>
            </v-avatar>
          </template>
        </v-list-item>
      </v-list>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          text="关闭"
          variant="text"
          @click="toggleDialog({ dialog1: false })"
        ></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-dialog
    v-model="dialogList['dialog2']"
    class="dialog-interface-create"
    width="500"
  >
    <v-card prepend-icon="mdi-account" title="频道信息">
      <v-card-text>
        <span>创建感兴趣的主题频道，你可以免费与好友进行语言/文字聊天</span>
        <v-form
          class="channel-form"
          v-model="valid"
          @submit.prevent="createChannel"
          ref="formCreateRef"
        >
          <v-row dense class="d-flex align-center">
            <v-col cols="4"
              ><ImageUpload v-model:file="form.avatar" />
            </v-col>
            <v-col cols="8">
              <v-sheet>
                <p>服务器图标最小为 128×128</p>
                <p>我们建议为 512×512 （请别超过5M）</p>
              </v-sheet>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <div>服务器名称</div>
              <v-text-field clearable v-model="form.name"></v-text-field>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          text="返回"
          variant="text"
          @click="toggleDialog({ dialog1: true, dialog2: false })"
        ></v-btn>
        <v-btn text="创建" variant="text" @click="createChannel" :loading="createChannelByUserRequest.loading.value"</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-dialog v-model="dialogList['dialog3']" class="dialog-interface-join" width="500">
<v-card title="加入">
  <v-card-text>
    <v-form  @submit.prevent="joinChannel" ref="formjoinRef">
      <v-text-field clearable v-model="formJoin.messageId" placeholder="请输入频道id"</v-text-field>
    </v-form>
  </v-card-text>
  <v-card-actions>
    <v-spacer></v-spacer>
    <v-btn
          text="返回"
          variant="text"
          @click="toggleDialog({ dialog1: true, dialog3: false })"
          
        ></v-btn>
        <v-btn text="加入" variant="text" @click="joinChannel" :loading="addUserToChannelRequest.loading.value"</v-btn>
  </v-card-actions>
</v-card>
  </v-dialog>
</template>

<script setup>
import { reactive, onMounted, ref, computed, watch } from 'vue'
import { getChannelByUser,createChannelByUser } from '@/api/chat/channel'
import {addUserToChannel} from '@/api/chat/channel-membership'
import { validateAvatar } from '@/utlis/validator'
import { useRequest } from 'vue-request'
import useUserStore from '@/store/modules/user'
import useChannelStore from '@/store/modules/channel'
import { useSocketStore } from '@/store/modules/socket'
import ImageUpload from '@/components/upload/ImageUpload.vue'
import { useRoute, useRouter } from 'vue-router'
const router =useRouter()
const route = useRoute()
const getChannelByUserRequest = useRequest(getChannelByUser)
const createChannelByUserRequest = useRequest(createChannelByUser)
const addUserToChannelRequest =useRequest(addUserToChannel)
const userStore = useUserStore()
const channelStore = useChannelStore()
const socketStore =useSocketStore()
const formjoinRef=ref(null)
const formCreateRef=ref(null)
const dialogList = reactive({
  dialog1: false,
  dialog2: false,
  dialog3:false
})

const form = reactive({
  name: '',
  avatar: '',
})

const formJoin=reactive({
  messageId:''
})
const valid = ref(null)
onMounted(async () => {
  try {
    const channelsInfo = await getChannelByUserRequest.runAsync(
      userStore.getUserId,
    )
    channelStore.assignChannel(...channelsInfo)
    watch(()=>route.params.channelId,(val)=>{
    channelStore.setCurrentChannel(val)

    if(!socketStore.getHasJoinChannel.has(val)){
    socketStore.getSocket.emit('join-channel',{userId:userStore.getUserId,channelId:val},(s)=>console.log("s:",s))
    socketStore.setHasJoinChannel(val,true)
    
  }
  
},{immediate:true})
watch(()=>route.params.roomId,(val)=>{
  if(!val) return
  const currentRoom = socketStore.getCurrentRoom
  if(currentRoom){
    socketStore.getSocket.emit(
      'leave-room',
      { userId: userStore.getUserId, roomId: socketStore.getCurrentRoom },
      (s) => console.log('leave-room:', s),
    )
  }
  socketStore.setCurrentRoom(val)
  socketStore.getSocket.emit(
    'join-room',
    { userId: userStore.getUserId, roomId: val },
    (s) => console.log('s:', s),
  )
    },{immediate:true})
  } catch (error) {
    console.error(error)
  }
})

async function onItemSelect(item){
  router.push({name:'Channel',params:{channelId:item.id.channel._id,roomId:item.id.rooms[0]._id}})
}
function toggleDialog(dialogObj) {
  Object.keys(dialogObj).forEach((key) => {
    console.log('key:', key)
    if (dialogList.hasOwnProperty(key)) {
      dialogList[key] = dialogObj[key]
    }
  })
}

async function createChannel() {
  try {
    const data = await createChannelByUserRequest.runAsync(form.name,form.avatar,userStore.getUserId)
    const channelsInfo=await getChannelByUserRequest.runAsync( userStore.getUserId) 
    channelStore.assignChannel(...channelsInfo)
    router.push({name:'Channel',params:{channelId:data.channel._id,roomId:data.room._id}})
  } catch (error) {
    console.error(error)
  }finally{
    toggleDialog({dialog2:false})
    formCreateRef.value.reset()
  }
}

async function joinChannel(){
  try {
    const data = await addUserToChannelRequest.runAsync(formJoin.messageId,userStore.getUserId)
    const channelsInfo=await getChannelByUserRequest.runAsync( userStore.getUserId) 
    channelStore.assignChannel(...channelsInfo)
    
  } catch (error) {
    
  }finally{
    toggleDialog({dialog3:false})
    formjoinRef.value.reset()
  }
}

function isActive(channel){
  if(channel.channel){
    return route.params.channelId===channel.channel._id
  }
  return false
}
</script>

<style lang="scss" scoped>
.tab-active{
  position: relative;
}
.tab-active::before{
 content:"";
 position: absolute;
    top: 10px;
    left: -15px;
    width: 4px;
    height: 32px;
    background-color:#6cbf00;
    border-radius: 0 4px 4px 0;
}
.icon-button{
  transform-origin: center;
  transition: transform .15s;
}
.icon-button:hover{
  transform: scale(1.1);
}

.v-list-item {
  :deep(.v-list-item__overlay){
    display: none;
  }
  :deep(.v-list-item__prepend){
    width: 45px;
  }
}

</style>
