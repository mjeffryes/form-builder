<!-- JSON editor component with syntax highlighting -->
<template>
  <div class="json-editor flex flex-col h-full">
    <!-- Header -->
    <div
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

    <!-- Editor Area -->
    <div class="editor-content flex-1 relative">
      <textarea
        v-model="localContent"
        :readonly="readonly"
        @input="handleInput"
        class="w-full h-full p-4 font-mono text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        :class="{ 'cursor-not-allowed bg-gray-50 dark:bg-gray-900': readonly }"
        spellcheck="false"
      ></textarea>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { validateJson } from '@/services/JsonValidator'

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
  }
})

const emit = defineEmits(['update:content', 'validation-change'])

const localContent = ref(props.content)
const validationResult = ref({ valid: true })
const lastValidContent = ref(props.content)

// Debounce timer
let debounceTimer = null

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

<style scoped>
.json-editor {
  border: 1px solid theme('colors.gray.200');
}

.dark .json-editor {
  border-color: theme('colors.gray.700');
}

textarea {
  line-height: 1.5;
  tab-size: 2;
}

textarea::placeholder {
  color: theme('colors.gray.400');
}

.dark textarea::placeholder {
  color: theme('colors.gray.500');
}
</style>
