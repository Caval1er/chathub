<template>
  <v-app-bar :elevation="3">
    <template v-slot:prepend>
      <v-app-bar-nav-icon></v-app-bar-nav-icon>
    </template>
    <v-app-bar-title>{{ socketStore.getCurrentRoom.name }}</v-app-bar-title>
    <template v-slot:append>
      <v-btn icon="mdi-heart"></v-btn>

      <v-btn icon="mdi-magnify"></v-btn>

      <v-btn icon="mdi-dots-vertical"></v-btn>
    </template>
  </v-app-bar>
</template>

<script setup>
import { useSocketStore } from '@/store/modules/socket'
const socketStore = useSocketStore()
</script>

<style lang="scss" scoped></style>