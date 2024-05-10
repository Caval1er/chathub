<template>
  <v-navigation-drawer
    :rail="props.isRail"
    :location="props.location"
    :width="widthStyle"
    :rail-width="railWidthStyle"
  >
    <sider-detail :type="props.detailType"></sider-detail>
  </v-navigation-drawer>
</template>

<script setup>
import SiderDetail from './SiderDetail.vue'
const props = defineProps({
  detailType: {
    type: String,
    required: true,
  },
  isRail: {
    type: Boolean,
    default: true,
  },
  location: {
    type: String,
    default: 'start',
  },
  widthStyle: {
    type: Number,
    default: 235,
  },
  railWidthStyle: {
    type: Number,
    default: 80,
  },
})
</script>

<style lang="scss" scoped></style>
