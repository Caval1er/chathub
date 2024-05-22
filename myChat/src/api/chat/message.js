import request from '@/http/index'

export function getMessageByLimit(room, before, limit) {
  return request.get('/messages', {
    params: { room, before, limit },
  })
}

export function getMessageById(id) {
  return request.get(`/messages/${id}`)
}

export function updateMessageById(id, body) {
  return request.put(`/messages/${id}`, body)
}

export function uploadImageByImage(image, sender, room, type) {
  const formData = new FormData()
  formData.append('image', image)
  formData.append('sender', sender)
  formData.append('room', room)
  formData.append('type', type)
  return request.post('/messages/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}
