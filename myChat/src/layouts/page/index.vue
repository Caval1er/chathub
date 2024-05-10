<template>
  <router-view :key="route.fullPath"> </router-view>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<style lang="scss" scoped></style>
