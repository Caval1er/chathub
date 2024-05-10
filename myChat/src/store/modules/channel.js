import { defineStore } from 'pinia'

const useChannelStore = defineStore('channel', {
  state: () => ({
    channels: [],
    currentChannel: null,
  }),
  getters: {
    // 获取频道列表
    getChannels: (state) => state.channels,
    // 获取当前频道
    getCurrentChannel: (state) => state.currentChannel,
  },
  actions: {
    // 添加新频道到列表
    addChannel(channel) {
      this.channels.push(channel)
    },
    // 覆盖频道列表
    assignChannel(...channel) {
      console.log('channel:', channel)
      this.channels.splice(0, this.channels.length, ...channel)
    },
    // 设置当前频道
    setCurrentChannel(channelId) {
      this.currentChannel = this.channels.find(
        (c) => c.channel._id === channelId,
      )
    },
    // 可以根据需要添加更多的 actions，如删除频道、更新频道信息等
  },
})

export default useChannelStore
