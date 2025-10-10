<!-- Main Form Builder application component -->
<template>
  <div id="app" class="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Schema Generation Modal -->
    <GenerateSchemaModal
      :open="showGenerateModal"
      @confirm="handleGenerateConfirm"
      @cancel="handleGenerateCancel"
    />

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
import { ref, computed, onMounted, watch } from 'vue'
import FormPreview from './components/FormPreview.vue'
import SchemaEditorPanel from './components/SchemaEditorPanel.vue'
import GenerateSchemaModal from './components/GenerateSchemaModal.vue'
import { DEFAULT_JSON_SCHEMA, DEFAULT_UI_SCHEMA, DEFAULT_DATA } from './data/defaultTemplate'
import { validateJson } from './services/JsonValidator'
import { generateFromData } from './services/SchemaGenerationService'

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

// Schema generation state
const showGenerateModal = ref(false)
const previousData = ref(data.value)

// Check if schemas are non-empty (not default)
const hasExistingSchemas = computed(() => {
  return jsonSchema.value.trim() !== '' && uiSchema.value.trim() !== ''
})

// Watch for significant data changes
watch(data, (newData) => {
  // Check if data is valid JSON and has changed significantly
  const validation = validateJson(newData)
  if (!validation.valid) {
    previousData.value = newData
    return
  }

  const parsed = validation.parsed

  // Check if it's an object (not array or primitive)
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    previousData.value = newData
    return
  }

  // Check if data has changed significantly (more than just whitespace)
  const currentNormalized = JSON.stringify(parsed)
  let previousNormalized = ''
  try {
    const prevParsed = JSON.parse(previousData.value)
    previousNormalized = JSON.stringify(prevParsed)
  } catch {
    // Previous data was invalid, treat as different
  }

  if (currentNormalized !== previousNormalized && Object.keys(parsed).length > 0) {
    // Data has changed, check if we should show the modal
    if (hasExistingSchemas.value) {
      showGenerateModal.value = true
    } else {
      // No existing schemas, generate immediately
      generateSchemas()
    }
  }

  previousData.value = newData
})

// Generate schemas from data
function generateSchemas() {
  const result = generateFromData(data.value)

  if (result.error) {
    console.error('Failed to generate schemas:', result.error)
    return
  }

  jsonSchema.value = result.jsonSchema
  uiSchema.value = result.uiSchema
}

// Handle modal confirmation
function handleGenerateConfirm() {
  generateSchemas()
  showGenerateModal.value = false
}

// Handle modal cancellation
function handleGenerateCancel() {
  showGenerateModal.value = false
}

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
