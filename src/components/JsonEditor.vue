<!-- JSON editor component with syntax highlighting -->
<template>
  <div class="json-editor flex flex-col h-full">
    <!-- Header -->
    <div
      v-if="!hideHeader"
      class="editor-header px-4 py-2 border-b flex items-center justify-between"
      :class="validationResult.valid
        ? 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
        : 'bg-red-100 dark:bg-red-900 border-red-300 dark:border-red-700'"
    >
      <div class="flex-1">
        <h3 class="text-sm font-semibold" :class="validationResult.valid ? 'text-gray-700 dark:text-gray-200' : 'text-red-800 dark:text-red-200'">
          {{ title }}
        </h3>
        <p v-if="!validationResult.valid" class="text-xs text-red-600 dark:text-red-400 mt-1">
          Error: {{ validationResult.error }}
        </p>
      </div>
      <button
        v-if="!validationResult.valid && lastValidContent"
        data-testid="revert-button"
        @click="revert"
        class="ml-2 px-3 py-1 text-xs font-medium text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-800 hover:bg-red-100 dark:hover:bg-red-700 rounded border border-red-200 dark:border-red-600"
      >
        Revert
      </button>
    </div>

    <!-- Inline error for hideHeader mode -->
    <div
      v-if="hideHeader && !validationResult.valid"
      class="px-2 py-1 bg-red-100 dark:bg-red-900 border-b border-red-300 dark:border-red-700 flex items-center justify-between"
    >
      <p class="text-xs text-red-600 dark:text-red-400">
        Error: {{ validationResult.error }}
      </p>
      <button
        v-if="lastValidContent"
        data-testid="revert-button"
        @click="revert"
        class="ml-2 px-2 py-0.5 text-xs font-medium text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-800 hover:bg-red-100 dark:hover:bg-red-700 rounded"
      >
        Revert
      </button>
    </div>

    <!-- Editor Area -->
    <div class="editor-content flex-1 relative">
      <!-- Syntax highlighted overlay -->
      <pre
        class="syntax-highlight absolute inset-0 p-4 font-mono text-sm overflow-auto pointer-events-none"
        :class="{ 'opacity-0': !localContent }"
      ><code class="language-json" v-html="highlightedCode"></code></pre>

      <!-- Actual textarea -->
      <textarea
        v-model="localContent"
        :readonly="readonly"
        @input="handleInput"
        @scroll="syncScroll"
        ref="textareaRef"
        class="w-full h-full p-4 font-mono text-sm bg-transparent text-transparent caret-gray-900 dark:caret-gray-100 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none relative z-10"
        :class="{ 'cursor-not-allowed': readonly }"
        spellcheck="false"
      ></textarea>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted, nextTick } from 'vue'
import { validateJson } from '@/services/JsonValidator'
import hljs from 'highlight.js/lib/core'
import json from 'highlight.js/lib/languages/json'
import 'highlight.js/styles/atom-one-light.css'

// Register JSON language
hljs.registerLanguage('json', json)

const props = defineProps({
  content: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  readonly: {
    type: Boolean,
    default: false
  },
  hideHeader: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:content', 'validation-change'])

const localContent = ref(props.content)
const validationResult = ref({ valid: true })
const lastValidContent = ref(props.content)
const textareaRef = ref(null)

// Debounce timer
let debounceTimer = null

// Computed highlighted code
const highlightedCode = computed(() => {
  try {
    return hljs.highlight(localContent.value, { language: 'json' }).value
  } catch (e) {
    // If highlighting fails, return escaped plain text
    return localContent.value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
  }
})

// Sync scroll between textarea and highlight overlay
function syncScroll(event) {
  const highlight = event.target.previousElementSibling
  if (highlight) {
    highlight.scrollTop = event.target.scrollTop
    highlight.scrollLeft = event.target.scrollLeft
  }
}

function validateContent(content) {
  const result = validateJson(content)
  validationResult.value = result

  // Store last valid content
  if (result.valid) {
    lastValidContent.value = content
  }

  // Emit validation change
  emit('validation-change', result)

  return result
}

function handleInput() {
  // Clear existing timer
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }

  // Validate immediately for UI feedback
  validateContent(localContent.value)

  // Set new timer for emit
  debounceTimer = setTimeout(() => {
    emit('update:content', localContent.value)
  }, 300)
}

function revert() {
  localContent.value = lastValidContent.value
  validateContent(localContent.value)
  emit('update:content', localContent.value)
}

// Validate initial content
validateContent(props.content)

// Update local content when prop changes
watch(() => props.content, (newContent) => {
  localContent.value = newContent
  validateContent(newContent)
})
</script>
