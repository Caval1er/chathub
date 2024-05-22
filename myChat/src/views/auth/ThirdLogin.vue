<template>
  <div class=""></div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import useUserStore from '@/store/modules/user'
import { onMounted } from 'vue'
const userStore = useUserStore()
const route = useRoute()
const query = route.query
onMounted(() => {
  try {
    userStore.thirdLogin(query.token)
  } catch (error) {}
})
</script>

<style lang="scss" scoped></style>
