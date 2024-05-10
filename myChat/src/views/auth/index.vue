<template>
  <div class="auth">
    <v-card class="mx-auto" width="400">
      <v-card-text>
        <Login />
      </v-card-text>
      <v-expand-transition>
        <v-card v-if="showRegister" class="v-card--reveal" style="height: 100%">
          <v-card-text> <Register /></v-card-text>
        </v-card>
      </v-expand-transition>
      <v-card-actions>
        <v-btn @click="showRegister = true">注册</v-btn>
      </v-card-actions>
    </v-card>
    <Auth />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Auth from './Auth.vue'
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
</style>
