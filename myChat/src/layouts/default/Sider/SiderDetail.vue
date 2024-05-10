<template>
  <component :is="currentComponent"></component>
</template>

<script setup>
import { shallowRef } from 'vue'
import SiderGroup from './SiderGroup.vue'
import SiderInfo from './SiderInfo.vue'
import SiderTab from './SiderTab.vue'
const props = defineProps({
  type: {
    type: String,
    required: true,
  },
})
const componentList = {
  SiderGroup: SiderGroup,
  SiderInfo: SiderInfo,
  SiderTab: SiderTab,
}
const currentComponent = shallowRef(componentList[props.type])
</script>

<style lang="scss" scoped></style>
