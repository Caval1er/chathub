<template>
  <div ref="editorContainer" class="editor-container"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as monaco from 'monaco-editor'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'

const modelValue = defineModel({ required: true })

const props = defineProps({
  language: {
    type: String,
    default: 'javascript',
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
const editorContainer = ref(null)
let editor = null
onMounted(() => {
  editor = monaco.editor.create(editorContainer.value, {
    value: modelValue.value,
    language: props.language,
    theme: 'vs-light',
    wordWrap: 'on', // 启用自动换行
    minimap: {
      enabled: false, // 禁用小地图
    },
  })

  // Emit update:modelValue event when editor content changes
  editor.onDidChangeModelContent(() => {
    modelValue.value = editor.getValue()
  })
})

watch(
  () => props.language,
  (val) => {
    monaco.editor.setModelLanguage(editor.getModel(), val)
  },
)
onBeforeUnmount(() => {
  if (editor) {
    editor.dispose()
  }
})

watch(
  () => modelValue.value,
  (newValue) => {
    if (editor && editor.getValue() !== newValue) {
      editor.setValue(newValue)
    }
  },
)
</script>

<style scoped lang="scss">
.editor-container {
  height: 500px;
}
</style>
