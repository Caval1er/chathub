<template>
  <div class="auth">
    <div class="auth-left">
      <v-img
        src="https://img.kookapp.cn/assets/item/resources/login-icon.png?x-oss-process=style"
      ></v-img>
    </div>
    <div class="auth-right d-flex flex-column justify-center align-center">
      <h1 class="mb-10">欢迎来到ChatHub聊天室</h1>
      <v-card class="mx-auto" width="400" elevation="8" rounded="lg">
        <v-card-text>
          <Login />
        </v-card-text>
        <v-expand-transition>
          <v-card
            v-if="showRegister"
            class="v-card--reveal"
            style="height: 100%"
          >
            <v-card-text> <Register /></v-card-text>
          </v-card>
        </v-expand-transition>
        <v-card-actions>
          <v-btn @click="showRegister = true" v-if="!showRegister">注册</v-btn>
          <v-btn @click="showRegister = false" v-if="showRegister">返回</v-btn>
        </v-card-actions>
      </v-card>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Login from './Login.vue'
import Register from './Register.vue'
const showRegister = ref(false)
</script>

<style lang="scss" scoped>
.v-card--reveal {
  bottom: 0;
  opacity: 1 !important;
  position: absolute;
  width: 100%;
}
.auth {
  display: flex;
  width: 100vw;
  height: 100vh;
  background-image: url('https://img.kookapp.cn/assets/item/resources/login-back.png?x-oss-process=style');
}

.auth-left {
  width: 50%;
}
.auth-right {
  width: 50%;
}
</style>
