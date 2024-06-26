<template>
  <div ref="editorContainer" class="editor-container"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import * as monaco from 'monaco-editor'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
import { debounce } from 'lodash-es'
import useUserStore from '@/store/modules/user'
import useChannelStore from '@/store/modules/channel'
// 使用 defineModel 宏
const userStore = useUserStore()
const channelStore = useChannelStore()
const modelValue = defineModel({ required: true })
const props = defineProps({
  language: {
    type: String,
    default: 'javascript',
  },
  readyOnly: Boolean,
  socketInfo: {
    type: Object,
    default() {
      return { socket: null, sender: {}, room: '', messageId: '' }
    },
  },
})

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'json') {
      return new jsonWorker()
    }
    if (label === 'css' || label === 'scss' || label === 'less') {
      return new cssWorker()
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return new htmlWorker()
    }
    if (label === 'typescript' || label === 'javascript') {
      return new tsWorker()
    }
    return new editorWorker()
  },
}
// refs
const editorContainer = ref(null)
let editor = null

onMounted(() => {
  editor = monaco.editor.create(editorContainer.value, {
    value: modelValue.value,
    language: props.language,
    readOnly: props.readyOnly,

    theme: 'vs-light',
    wordWrap: 'on', // 启用自动换行

    minimap: {
      enabled: false, // 禁用小地图
    },
  })

  // Emit update:modelValue event when editor content changes
  editor.onDidChangeModelContent(
    debounce(() => {
      modelValue.value = editor.getValue()
      nextTick(() => {
        props.socketInfo.socket.emit(
          'edit-code',
          {
            messageId: props.socketInfo.messageId,
            roomId: props.socketInfo.room,
            editedContent: editor.getValue(),
            userId: props.socketInfo.sender.id,
          },
          (s) => console.log('s:', s),
        )
      })
    }, 500),
  )
})

onBeforeUnmount(() => {
  if (editor) {
    editor.dispose()
  }
})

// Watch for external changes to the modelValue prop
watch(
  () => modelValue.value,
  (newValue) => {
    if (editor && editor.getValue() !== newValue) {
      editor.setValue(newValue)
    }
  },
)

watch(
  [() => props.readyOnly, () => editorContainer.value],
  ([v1, v2]) => {
    console.log('v1:', v1)
    console.log('v2:', v2)
    if (v2) {
      console.log('id:', props.socketInfo.sender.id)
      console.log('uid:', userStore.getUserId)
      if (channelStore.getCreateColUserId !== userStore.getUserId) {
        if (v1) {
          editor.updateOptions({ readOnly: true })
          editorContainer.value.classList.add('readOnly')
        } else {
          editor.updateOptions({ readOnly: false })
          editorContainer.value.classList.remove('readOnly')
        }
      } else {
        editor.updateOptions({ readOnly: false })
      }
    }
  },
  { immediate: true },
)
</script>

<style scoped lang="scss">
.editor-container {
  height: 500px;
}
.editor-container.readOnly {
  :deep(.monaco-mouse-cursor-text) {
    cursor: auto;
  }
}
</style>
