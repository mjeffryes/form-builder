<!-- JSON editor component with syntax highlighting -->
<template>
  <div class="json-editor flex flex-col h-full">
    <!-- Header -->
    <div class="editor-header bg-gray-100 dark:bg-gray-700 px-4 py-2 border-b border-gray-200 dark:border-gray-600">
      <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">
        {{ title }}
      </h3>
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

const emit = defineEmits(['update:content'])

const localContent = ref(props.content)

// Debounce timer
let debounceTimer = null

function handleInput() {
  // Clear existing timer
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }

  // Set new timer
  debounceTimer = setTimeout(() => {
    emit('update:content', localContent.value)
  }, 300)
}

// Update local content when prop changes
watch(() => props.content, (newContent) => {
  localContent.value = newContent
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
