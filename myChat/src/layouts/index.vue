<template>
  <v-app>
    <LayoutSider detail-type="SiderTab" />
    <LayoutSider detail-type="SiderInfo" :is-rail="false" />
    <LayoutHeader />
    <LayoutContent />
  </v-app>
</template>

<script setup>
import LayoutHeader from './default/Header.vue'
import LayoutSider from './default/Sider/index.vue'
import LayoutContent from './default/Content.vue'
</script>

<style lang="scss" scoped></style>
