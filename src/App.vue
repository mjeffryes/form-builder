<!-- Main Form Builder application component -->
<template>
  <div id="app" class="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
    <header class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div class="px-6 py-4">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Form Builder
        </h1>
      </div>
    </header>

    <main class="flex-1 flex overflow-hidden">
      <!-- Left Panel: Editors -->
      <div
        data-testid="left-panel"
        class="w-1/2 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden"
      >
        <SchemaEditorPanel
          v-model:json-schema="jsonSchema"
          v-model:ui-schema="uiSchema"
          v-model:data="data"
        />
      </div>

      <!-- Right Panel: Preview -->
      <div
        data-testid="right-panel"
        class="w-1/2 bg-gray-50 dark:bg-gray-900 overflow-auto"
      >
        <div class="p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Preview
          </h2>
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
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
import { ref, computed } from 'vue'
import FormPreview from './components/FormPreview.vue'
import SchemaEditorPanel from './components/SchemaEditorPanel.vue'
import { DEFAULT_JSON_SCHEMA, DEFAULT_UI_SCHEMA, DEFAULT_DATA } from './data/defaultTemplate'
import { validateJson } from './services/JsonValidator'

// Reactive state
const jsonSchema = ref(DEFAULT_JSON_SCHEMA)
const uiSchema = ref(DEFAULT_UI_SCHEMA)
const data = ref(DEFAULT_DATA)

// Validation state
const allValid = computed(() => {
  return validateJson(jsonSchema.value).valid &&
         validateJson(uiSchema.value).valid &&
         validateJson(data.value).valid
})
</script>

<style>
#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}
</style>
