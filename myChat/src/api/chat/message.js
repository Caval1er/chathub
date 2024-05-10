import request from '@/http/index'

export function getMessageByLimit(room, before, limit) {
  return request.get('/messages', {
    params: { room, before, limit },
  })
}

export function getMessageById(id) {
  return request.get(`/messages/${id}`)
}
