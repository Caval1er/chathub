<template>
  <div class="">
    <button @click="login">Login with GitHub</button>
  </div>
</template>

<script setup>
const login = () => {
  window.location.href = 'http://localhost:3000/api/auth/github'
}
</script>

<style lang="scss" scoped></style>
