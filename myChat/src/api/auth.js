import request from '@/http/index'

//访问指定用户的信息
export function findUserByEmail(email) {
  return request.get(`/users/email/${email}`)
}

//检测邮箱是否存在
export function isEmailExistedByEmail(email) {
  return request.get(`/auth/email/${email}`)
}

//获得邮箱验证码
export function sendEmailOTP(email) {
  return request.get('/auth/otp', {
    params: {
      email,
    },
  })
}

//验证邮箱
export function vertifyEmail(email, otp) {
  return request.post('/auth/otp', null, {
    params: {
      email,
      otp,
    },
  })
}

//本地注册
export function registerByLocal(email, password) {
  return request.post('/users', null, {
    params: {
      email,
      password,
    },
  })
}

//本地登录
export function loginByLocal(email, password) {
  return request.post('/users/sessions', { email, password })
}
