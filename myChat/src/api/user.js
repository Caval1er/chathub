import request from '@/http/index'
export function getUserInfoById(userId) {
  return request.get(`/users/${userId}`)
}

export function getUserInfoByToken() {
  return request.get('/users/info/token')
}
