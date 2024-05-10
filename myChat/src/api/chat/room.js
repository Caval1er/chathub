import request from '@/http/index'

export function getRoomsByChannel(channelId) {
  return request.get(`/rooms/channel/${channelId}`)
}

export function createRoomByChannel(name, channelId) {
  return request.post('/rooms', { name, channelId })
}

export function getRoomById(roomId) {
  return request.get(`/rooms/${roomId}`)
}
