<template>
  <v-form
    class="auth_login"
    v-model="valid"
    @submit.prevent="login"
    validate-on="input"
  >
    <div class="text-subtitle-1 text-medium-emphasis">邮箱</div>
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
    ></v-text-field>
    <div
      class="text-subtitle-1 text-medium-emphasis d-flex align-center justify-space-between mt-3"
    >
      密码

      <a
        class="text-caption text-decoration-none text-blue"
        href="#"
        rel="noopener noreferrer"
        target="_blank"
      >
        Forgot login password?</a
      >
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
    ></v-text-field>

    <div class="d-flex mt-4 justify-center">
      <v-btn
        :loading="loading"
        :disabled="!valid"
        variant="elevated"
        type="submit"
        color="primary"
      >
        登录
      </v-btn>
    </div>
  </v-form>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { isValidEmail, isValidPassword, isRequired } from '@/utlis/validator'
import useUserStore from '@/store/modules/user'
const valid = ref(false)
const loading = ref(false)
const userStore = useUserStore()
const showPassword = ref(false)
const form = reactive({
  email: '245692084@qq.com',
  password: 'Zhangjiahao123..',
})
const rules = {
  emailRules: [(v) => isRequired(v), (v) => validateEmail(v)],
  passwordRules: [(v) => isRequired(v), (v) => validatePassword(v)],
}

const validateEmail = async (v) => {
  return new Promise((resolve) => {
    if (!isValidEmail(v)) return resolve('邮箱不合法')
    return resolve(true)
  })
}
const validatePassword = async (v) => {
  return new Promise((resolve) => {
    if (!isValidPassword(v)) return resolve('密码不合法')
    return resolve(true)
  })
}
const login = async () => {
  loading.value = true
  if (!valid.value) {
    loading.value = false
    return
  }
  try {
    await userStore.login({
      email: form.email,
      password: form.password,
    })
  } catch (error) {
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped></style>
@/store/user
