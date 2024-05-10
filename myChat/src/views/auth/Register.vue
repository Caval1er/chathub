<template>
  <v-form class="auth_register" v-model="valid" @submit.prevent="register">
    <div class="text-subtitle-1 text-medium-emphasis">
      <span>邮箱</span>
    </div>
    <v-text-field
      clearable
      density="compact"
      variant="outlined"
      v-model="form.email"
      color="primary"
      autofocus
      prepend-inner-icon="mdi-email-outline"
      type="email"
      :rules="rules.emailRules"
      placeholder="example@qq.com"
      validate-on="input lazy"
      :loading="emailDebouceRequest.loading.value"
      :readonly="loading"
      :clearable="!loading"
    ></v-text-field>
    <div class="text-subtitle-1 text-medium-emphasis d-flex align-center mt-3">
      <span>密码</span>
      <v-tooltip location="bottom">
        <template v-slot:activator="{ props }">
          <v-icon v-bind="props" size="x-small" :style="{ cursor: 'pointer' }"
            >mdi-information</v-icon
          >
        </template>
        <span :style="{ 'font-size': '12px' }">
          密码8-16位,同时包含小写、大写字母、数字和特殊符号(@、$、!、%、*、?、&、.)
        </span>
      </v-tooltip>
    </div>
    <v-text-field
      placeholder="输入你的密码"
      :clearable="!loading"
      variant="outlined"
      density="compact"
      :readonly="loading"
      v-model="form.password"
      :rules="rules.passwordRules"
      color="primary"
      :type="showPassword ? 'text' : 'password'"
      :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
      @click:appendInner="showPassword = !showPassword"
      prepend-inner-icon="mdi-lock"
      counter
      maxlength="16"
      validate-on="input lazy"
    ></v-text-field>

    <div class="d-flex mt-4 justify-center">
      <v-btn
        :loading="loading"
        type="submit"
        color="primary"
        text="注册"
        size="large"
        variant="tonal"
        block
      >
      </v-btn>
    </div>
  </v-form>
  <v-dialog max-width="500" v-model="dialog" persistent>
    <template v-slot:default>
      <v-card class="text-center">
        <v-card-text>
          <h3 class="text-h6 mb-4">验证你的账号</h3>

          <div class="text-body-2">
            <span class="font-weight-black">
              我们已发送验证码到<span class="text-primary">{{
                form.email
              }}</span
              ><br />
              请检查你的邮箱并在下方填入验证码
            </span>
          </div>

          <v-sheet color="surface">
            <v-otp-input
              type="password"
              variant="solo"
              v-model="form.vertifyCode"
            ></v-otp-input>
          </v-sheet>

          <v-btn
            class="my-4"
            color="purple"
            height="40"
            text="验证"
            variant="flat"
            width="70%"
            @click="vertifyOTPAndRegister"
            :loading="vertifyCodeRequest.loading.value"
          ></v-btn>

          <div
            class="text-caption d-flex justify-end align-center"
            style="width: 85%"
          >
            <span>没有收到验证码吗?</span>
            <v-btn
              color="primary"
              variant="flat"
              size="small"
              class="ml-2"
              :disabled="countdown > 0 ? true : false"
              @click="reSendOTP"
              >{{ countdownText }}</v-btn
            >
          </div>
        </v-card-text>
        <template v-slot:actions>
          <v-spacer></v-spacer>

          <v-btn @click="dialog = false"> 关闭 </v-btn>
        </template>
      </v-card>
    </template>
  </v-dialog>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { isValidEmail, isValidPassword, isRequired } from '@/utlis/validator'
import {
  isEmailExistedByEmail,
  sendEmailOTP,
  vertifyEmail,
  registerByLocal,
} from '@/api/auth'

import { useDebounce } from '@/hooks/useVueRequest'
import { useRequest } from 'vue-request'
const valid = ref(false)
const loading = ref(false)

const emailDebouceRequest = useDebounce(isEmailExistedByEmail, 300, {
  loadingKeep: 1000,
})
const vertifyCodeRequest = useRequest(vertifyEmail)
const registerByLocalRequest = useRequest(registerByLocal)
const sendEmailOTPRequest = useRequest(sendEmailOTP)
const showPassword = ref(false)
const dialog = ref(false)
const countdownInterval = ref(null)
const countdown = ref(0)
const countdownText = computed(() => {
  return countdown.value > 0 ? `${countdown.value}秒` : '重新发送'
})
const form = reactive({
  email: '245692084@qq.com',
  password: 'Zhangjiahao123..',
  vertifyCode: '',
})
const rules = {
  emailRules: [
    (v) => isRequired(v),
    (v) => syncvalidateEmail(v),
    (v) => AsyncvalidateEmail(v),
  ],
  passwordRules: [(v) => isRequired(v), (v) => validatePassword(v)],
}
const syncvalidateEmail = (v) => {
  return isValidEmail(v) || '邮箱不合法'
}
const AsyncvalidateEmail = async (v) => {
  return new Promise(async (resolve) => {
    try {
      await emailDebouceRequest.runAsync(v)
      return resolve('邮箱已存在')
    } catch (error) {
      return resolve(true)
    }
  })
}
const validatePassword = async (v) => {
  return new Promise((resolve) => {
    if (!isValidPassword(v)) return resolve('密码不合法')
    return resolve(true)
  })
}
const vertifyOTPAndRegister = async () => {
  try {
    //验证通过
    await vertifyCodeRequest.runAsync(form.email, form.vertifyCode)
    dialog.value = false
    //注册
    loading.value = true
    await registerByLocalRequest.runAsync(form.email, form.password)

    //跳入主页
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}
const reSendOTP = async () => {
  countdown.value = 30
  countdownInterval.value = setInterval(() => {
    countdown.value--
    if (countdown.value === 0) {
      clearInterval(countdownInterval.value)
    }
  }, 1000)
  //重发验证吗
  try {
    await sendEmailOTPRequest.runAsync(form.email)
  } catch (error) {
    console.log(error)
  }
}
const register = async () => {
  loading.value = true
  countdown.value = 0
  clearInterval(countdownInterval.value)
  if (!valid.value) {
    loading.value = false
    return
  }
  try {
    await sendEmailOTPRequest.runAsync(form.email)
    dialog.value = true
  } catch (error) {
    if (error.code === 429) {
      return
    }
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped></style>
@/hooks/useVueRequest
