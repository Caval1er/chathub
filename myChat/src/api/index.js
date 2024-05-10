import request from '@/http/index'
export const testApi = () => {
  return request.get('/users')
}
