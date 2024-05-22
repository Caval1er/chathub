import request from '@/http/index'

export function getRoomsByChannel(channelId) {
  return request.get(`/rooms/channel/${channelId}`)
}

export function createRoomByChannel(name, channelId, password) {
  return request.post('/rooms', { name, channelId, password })
}

export function getRoomById(roomId) {
  return request.get(`/rooms/${roomId}`)
}

export function vertifyRoom(roomId, password) {
  return request.get(`/rooms/${roomId}/password`, { params: { password } })
}

export function updateRoomById(id, name, password) {
  return request.patch(`/rooms/${id}`, { name, password })
}
