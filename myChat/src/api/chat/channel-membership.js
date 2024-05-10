import request from '@/http/index'

export function getUsersByChannel(channelId) {
  return request.get(`channel-memberships/channel/${channelId}`)
}
