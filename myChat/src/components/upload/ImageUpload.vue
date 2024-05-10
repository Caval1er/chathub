<template>
  <div class="imageupload-container">
    <v-avatar
      color="grey lighten-4"
      size="100"
      @click="triggerFileInput"
      style="cursor: pointer; overflow: hidden"
    >
      <v-hover v-slot="{ isHovering, props }">
        <v-img
          :src="imgUrl"
          alt="Image Preview"
          v-bind="props"
          v-if="imgUrl"
          cover
        >
          <div
            v-if="isHovering"
            class="d-flex align-center justify-center transition-fast-in-fast-out"
            style="height: 100%"
          >
            <p>更新</p>
            <p>LOGO</p>
          </div>
          <v-overlay contained :model-value="isHovering" />
        </v-img>
        <v-icon v-else size="56">mdi-camera</v-icon>
      </v-hover>
    </v-avatar>

    <!-- 隐藏的文件输入 -->
    <input
      type="file"
      ref="fileInputRef"
      @change="previewImage"
      accept="image/*"
      style="display: none"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
const imgUrl = ref('')
const fileModel = defineModel('file')
const fileInputRef = ref(null)
function previewImage(event) {
  const file = event.target.files[0]
  fileModel.value = file
  if (file && file.type.startsWith('image')) {
    const reader = new FileReader()
    reader.onload = (e) => {
      imgUrl.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

function triggerFileInput() {
  const input = fileInputRef.value
  if (input) {
    input.click()
  }
}
</script>

<style lang="scss" scoped></style>
