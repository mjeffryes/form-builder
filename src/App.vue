<!-- Main Form Builder application component -->
<template>
  <div id="app" class="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
    <main class="flex-1 flex overflow-hidden">
      <!-- Left Panel: Editors -->
      <div
        data-testid="left-panel"
        class="border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden"
        :style="{ width: `${editorPanelWidth}px` }"
      >
        <SchemaEditorPanel
          v-model:json-schema="jsonSchema"
          v-model:ui-schema="uiSchema"
          v-model:data="data"
        />
      </div>

      <!-- Resize Handle -->
      <div
        class="resize-handle-vertical"
        @mousedown="startResize"
      ></div>

      <!-- Right Panel: Preview -->
      <div data-testid="right-panel" class="flex flex-1 flex-col" >
        <div class="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">JsonForm Vue Playground</h2>
        </div>
        <div class="flex-1 p-4 bg-gray-50 dark:bg-gray-900 overflow-auto" >
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Form Preview</h2>
            <FormPreview
              :json-schema="jsonSchema"
              :ui-schema="uiSchema"
              :data="data"
              :frozen="!allValid"
            />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import FormPreview from './components/FormPreview.vue'
import SchemaEditorPanel from './components/SchemaEditorPanel.vue'
import { DEFAULT_JSON_SCHEMA, DEFAULT_UI_SCHEMA, DEFAULT_DATA } from './data/defaultTemplate'
import { validateJson } from './services/JsonValidator'

// Reactive state
const jsonSchema = ref(DEFAULT_JSON_SCHEMA)
const uiSchema = ref(DEFAULT_UI_SCHEMA)
const data = ref(DEFAULT_DATA)

// Editor panel width state (default to 50em in pixels)
const editorPanelWidth = ref(800) // 50em * 16px/em = 800px
const isResizing = ref(false)
const startX = ref(0)
const startWidth = ref(0)

// Validation state
const allValid = computed(() => {
  return validateJson(jsonSchema.value).valid &&
         validateJson(uiSchema.value).valid &&
         validateJson(data.value).valid
})

// Initialize panel width on mount based on actual em to px conversion
onMounted(() => {
  // Calculate 50em in actual pixels based on root font size
  const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize)
  editorPanelWidth.value = Math.min(50 * rootFontSize, window.innerWidth * 0.5)
})

// Resize functionality
function startResize(event) {
  isResizing.value = true
  startX.value = event.clientX
  startWidth.value = editorPanelWidth.value

  event.preventDefault()

  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
}

function handleResize(event) {
  if (isResizing.value) {
    const delta = event.clientX - startX.value
    const newWidth = startWidth.value + delta

    // Set min width to 300px and max width to window width - 300px (to ensure right panel has space)
    editorPanelWidth.value = Math.max(300, Math.min(window.innerWidth - 300, newWidth))
  }
}

function stopResize() {
  isResizing.value = false
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
}
</script>

<style>
#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

.resize-handle-vertical {
  width: 4px;
  cursor: ew-resize;
  background: transparent;
  position: relative;
  flex-shrink: 0;
}

.resize-handle-vertical:hover {
  background-color: var(--color-blue-1);
}

.resize-handle-vertical:active {
  background-color: var(--color-blue-1);
}
</style>
