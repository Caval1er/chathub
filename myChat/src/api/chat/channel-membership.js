import request from '@/http/index'

export function getUsersByChannel(channelId) {
  return request.get(`/channel-memberships/channel/${channelId}`)
}

export function addUserToChannel(channelId, userId) {
  return request.post('/channel-memberships', { channelId, userId })
}
