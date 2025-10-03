<!-- Live form preview component using JSONForms -->
<template>
  <div class="form-preview relative">
    <!-- Error State -->
    <div v-if="error" class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
      <p class="text-red-800 dark:text-red-200 font-semibold">Error</p>
      <p class="text-red-600 dark:text-red-400 text-sm mt-1">{{ error }}</p>
    </div>

    <!-- JSONForms Renderer -->
    <div v-else-if="parsedSchema" class="jsonforms-container">
      <json-forms
        :data="parsedData"
        :schema="parsedSchema"
        :uischema="parsedUiSchema"
        :renderers="renderers"
        @change="handleChange"
      />
    </div>

    <!-- Frozen Overlay -->
    <div
      v-if="frozen && !error"
      data-testid="frozen-overlay"
      class="absolute inset-0 bg-gray-900/10 dark:bg-gray-900/30 backdrop-blur-sm flex items-center justify-center"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700">
        <p class="text-gray-700 dark:text-gray-300 font-medium">
          Preview Frozen
        </p>
        <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Fix JSON errors to update preview
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { JsonForms } from '@jsonforms/vue'
import { vanillaRenderers } from '@jsonforms/vue-vanilla'

const props = defineProps({
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
  },
  frozen: {
    type: Boolean,
    default: false
  }
})

const renderers = vanillaRenderers

const error = ref(null)
const parsedSchema = ref(null)
const parsedUiSchema = ref(null)
const parsedData = ref(null)

// Parse JSON strings safely
function parseProps() {
  error.value = null

  try {
    parsedSchema.value = JSON.parse(props.jsonSchema)
  } catch (e) {
    error.value = `Invalid JSON Schema: ${e.message}`
    return
  }

  try {
    parsedUiSchema.value = JSON.parse(props.uiSchema)
  } catch (e) {
    error.value = `Invalid UI Schema: ${e.message}`
    return
  }

  try {
    parsedData.value = JSON.parse(props.data)
  } catch (e) {
    error.value = `Invalid Data: ${e.message}`
    return
  }
}

// Handle data changes from the form (preview only, don't emit back)
function handleChange(event) {
  // In preview mode, we don't need to do anything with changes
  // This is just to prevent errors
}

// Parse props on mount and when they change
parseProps()

watch([() => props.jsonSchema, () => props.uiSchema, () => props.data], () => {
  parseProps()
})
</script>

<style>
/* JSONForms vanilla styles are minimal, we rely on Tailwind for most styling */
.form-preview {
  min-height: 200px;
}

.jsonforms-container {
  padding: 1rem;
}
</style>
