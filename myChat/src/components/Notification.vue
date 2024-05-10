<template>
  <v-snackbar
    v-for="(snackbar, index) in notificationStore.snackbars.filter(
      (s) => s.isShow,
    )"
    :key="snackbar.id"
    v-model="snackbar.isShow"
    :color="snackbar.color"
    :timeout="snackbar.timeout || 5000"
    :style="{ top: `${index * 60 + 8}px ` }"
    location="top"
    >{{ snackbar.text }}
    <template v-slot:actions>
      <v-btn color="indigo" variant="text" @click="snackbar.isShow = false">
        Close
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup>
import { ref } from 'vue'
import { useNotificationStore } from '@/store/modules/notification'
const notificationStore = useNotificationStore()
</script>

<style lang="scss" scoped></style>
@/store/notification
