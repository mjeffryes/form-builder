<!-- Live form preview component using JSONForms -->
<template>
  <div class="form-preview relative">
    <!-- JSONForms Renderer (with last valid state) -->
    <div v-if="lastValidSchema" class="jsonforms-container">
      <json-forms
        :data="lastValidData"
        :schema="lastValidSchema"
        :uischema="lastValidUiSchema"
        :renderers="renderers"
        @change="handleChange"
      />

      <!-- Show validation errors from JSONForms -->
      <div v-if="validationErrors.length > 0" class="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
        <p class="text-yellow-800 dark:text-yellow-200 font-semibold text-sm">Validation Errors:</p>
        <ul class="mt-2 space-y-1">
          <li v-for="(error, index) in validationErrors" :key="index" class="text-yellow-700 dark:text-yellow-300 text-xs">
            • {{ error.message }} <span v-if="error.instancePath" class="text-yellow-600 dark:text-yellow-400">({{ error.instancePath }})</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- Frozen Overlay -->
    <div
      v-if="frozen"
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
import { ref, watch } from 'vue'
import { JsonForms } from '@jsonforms/vue'
import { vanillaRenderers } from '@jsonforms/vue-vanilla'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'

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

// Store last valid state
const lastValidSchema = ref(null)
const lastValidUiSchema = ref(null)
const lastValidData = ref(null)
const validationErrors = ref([])

// AJV validator for schema validation
const ajv = new Ajv({ allErrors: true })
addFormats(ajv)

// Parse JSON strings safely and update only if valid
function parseProps() {
  // Don't update if frozen
  if (props.frozen) {
    return
  }

  let schema, uiSchema, data

  try {
    schema = JSON.parse(props.jsonSchema)
  } catch (e) {
    return // Keep last valid state
  }

  try {
    uiSchema = JSON.parse(props.uiSchema)
  } catch (e) {
    return // Keep last valid state
  }

  try {
    data = JSON.parse(props.data)
  } catch (e) {
    return // Keep last valid state
  }

  // All parsed successfully, update state
  lastValidSchema.value = schema
  lastValidUiSchema.value = uiSchema
  lastValidData.value = data

  // Validate data against schema
  validateData(schema, data)
}

// Validate data against schema
function validateData(schema, data) {
  validationErrors.value = []

  try {
    const validate = ajv.compile(schema)
    const valid = validate(data)

    if (!valid && validate.errors) {
      validationErrors.value = validate.errors
    }
  } catch (e) {
    // Schema compilation error, ignore for now
  }
}

// Handle data changes from the form
function handleChange(event) {
  // Update data and revalidate
  if (event.data) {
    lastValidData.value = event.data
    validateData(lastValidSchema.value, event.data)
  }
}

// Parse props on mount
parseProps()

// Watch for prop changes
watch([() => props.jsonSchema, () => props.uiSchema, () => props.data, () => props.frozen], () => {
  parseProps()
})
</script>

<style>
  @reference "../style.css";
/* JSONForms vanilla styles are minimal, we rely on Tailwind for most styling */
.form-preview {
  min-height: 200px;
}

.jsonforms-container {
  @apply p-4;
}

.horizontal-layout {
  @apply flex flex-row gap-4;
}

.control {
  @apply mb-2;
  input, select {
    @apply flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-foreground;
  }

  input[type='checkbox'] {
    @apply h-4 w-4 rounded border border-input bg-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50;
  }

  .error {
    @apply text-red-600 dark:text-red-400 text-xs mt-1;
  }

}

</style>
