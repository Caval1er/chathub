<template>
  <v-sheet
    class="d-flex align-center justify-center flex-wrap text-center mx-auto px-4"
    elevation="4"
    height="250"
    max-width="800"
    width="100%"
    rounded
  >
    <div>
      <h2 class="text-h4 font-weight-black text-orange">恭喜!</h2>

      <div class="text-h5 font-weight-medium mb-2">你成为了ChatHub的一员</div>

      <p class="text-body-2 mb-4">
        页面将在5秒后跳转到登录页,若没有跳转你可以点击下面的按钮进入登录页
      </p>

      <v-btn color="orange" variant="text" @click="goToLogin"
        >Go to Login</v-btn
      >
    </div>
  </v-sheet>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
const router = useRouter()
const timeout = ref(null)
function goToLogin() {
  clearTimeout(timeout.value)
  router.push('/auth')
}
onMounted(() => {
  timeout.value = setTimeout(() => {
    router.push('/auth')
  }, 5000)
})
</script>

<style lang="scss" scoped></style>
