<!-- Panel with three JSON editors for schema, UI schema, and data -->
<template>
  <div class="schema-editor-panel flex flex-col h-full">
    <!-- JSON Schema Editor -->
    <div
      class="editor-section border-b border-gray-200 dark:border-gray-700"
      :style="{ height: expanded.schema ? `${heights.schema}px` : 'auto' }"
    >
      <div
        class="editor-header bg-gray-50 dark:bg-gray-800 px-4 py-2 flex items-center justify-between cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
        @click="toggleSection('schema')"
      >
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">
          JSON Schema
        </h3>
        <svg
          class="w-4 h-4 text-gray-500 transition-transform"
          :class="{ 'rotate-180': expanded.schema }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      <div v-show="expanded.schema" class="editor-content" :style="{ height: `calc(${heights.schema}px - 40px)` }">
        <JsonEditor
          :content="jsonSchema"
          title="JSON Schema"
          @update:content="$emit('update:jsonSchema', $event)"
        />
        <div
          class="resize-handle"
          @mousedown="startResize('schema', $event)"
        ></div>
      </div>
    </div>

    <!-- UI Schema Editor -->
    <div
      class="editor-section border-b border-gray-200 dark:border-gray-700"
      :style="{ height: expanded.uiSchema ? `${heights.uiSchema}px` : 'auto' }"
    >
      <div
        class="editor-header bg-gray-50 dark:bg-gray-800 px-4 py-2 flex items-center justify-between cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
        @click="toggleSection('uiSchema')"
      >
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">
          UI Schema
        </h3>
        <svg
          class="w-4 h-4 text-gray-500 transition-transform"
          :class="{ 'rotate-180': expanded.uiSchema }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      <div v-show="expanded.uiSchema" class="editor-content" :style="{ height: `calc(${heights.uiSchema}px - 40px)` }">
        <JsonEditor
          :content="uiSchema"
          title="UI Schema"
          @update:content="$emit('update:uiSchema', $event)"
        />
        <div
          class="resize-handle"
          @mousedown="startResize('uiSchema', $event)"
        ></div>
      </div>
    </div>

    <!-- Data Editor -->
    <div
      class="editor-section flex-1"
      :style="{ height: expanded.data ? `${heights.data}px` : 'auto' }"
    >
      <div
        class="editor-header bg-gray-50 dark:bg-gray-800 px-4 py-2 flex items-center justify-between cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
        @click="toggleSection('data')"
      >
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">
          Data
        </h3>
        <svg
          class="w-4 h-4 text-gray-500 transition-transform"
          :class="{ 'rotate-180': expanded.data }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      <div v-show="expanded.data" class="editor-content h-full">
        <JsonEditor
          :content="data"
          title="Data"
          @update:content="$emit('update:data', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import JsonEditor from './JsonEditor.vue'

defineProps({
  jsonSchema: {
    type: String,
    required: true
  },
  uiSchema: {
    type: String,
    required: true
  },
  data: {
    type: String,
    required: true
  }
})

defineEmits(['update:jsonSchema', 'update:uiSchema', 'update:data'])

// Expanded state for each section
const expanded = ref({
  schema: true,
  uiSchema: true,
  data: true
})

// Heights for each section
const heights = ref({
  schema: 300,
  uiSchema: 300,
  data: 300
})

// Resize state
const resizing = ref(null)
const startY = ref(0)
const startHeight = ref(0)

function toggleSection(section) {
  expanded.value[section] = !expanded.value[section]
}

function startResize(section, event) {
  resizing.value = section
  startY.value = event.clientY
  startHeight.value = heights.value[section]

  event.preventDefault()

  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
}

function handleResize(event) {
  if (resizing.value) {
    const delta = event.clientY - startY.value
    const newHeight = Math.max(150, Math.min(800, startHeight.value + delta))
    heights.value[resizing.value] = newHeight
  }
}

function stopResize() {
  resizing.value = null
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
}
</script>

<style scoped>
.editor-section {
  display: flex;
  flex-direction: column;
  position: relative;
}

.editor-content {
  position: relative;
  overflow: hidden;
}

.resize-handle {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  cursor: ns-resize;
  background: transparent;
  z-index: 10;
}

.resize-handle:hover {
  background: theme('colors.blue.500');
}

.rotate-180 {
  transform: rotate(180deg);
}
</style>
