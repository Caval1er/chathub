import request from '@/http/index'

export function getChannelByUser(id) {
  return request.get(`/channel-memberships/member/${id}`)
}

export function createChannelByUser(name, avatar, id) {
  const formData = new FormData()
  formData.append('avatar', avatar)
  formData.append('name', name)
  formData.append('userId', id)
  return request.post('/channels', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}
