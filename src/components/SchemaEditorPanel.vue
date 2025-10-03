<!-- Panel with three JSON editors for schema, UI schema, and data -->
<template>
  <div class="schema-editor-panel flex flex-col h-full">
    <!-- JSON Schema Editor -->
    <div class="editor-section flex-1 min-h-0">
      <JsonEditor
        :content="jsonSchema"
        title="JSON Schema"
        @update:content="$emit('update:jsonSchema', $event)"
      />
    </div>

    <!-- UI Schema Editor -->
    <div class="editor-section flex-1 min-h-0 border-t border-gray-200 dark:border-gray-700">
      <JsonEditor
        :content="uiSchema"
        title="UI Schema"
        @update:content="$emit('update:uiSchema', $event)"
      />
    </div>

    <!-- Data Editor -->
    <div class="editor-section flex-1 min-h-0 border-t border-gray-200 dark:border-gray-700">
      <JsonEditor
        :content="data"
        title="Data"
        @update:content="$emit('update:data', $event)"
      />
    </div>
  </div>
</template>

<script setup>
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
</script>

<style scoped>
.editor-section {
  display: flex;
  flex-direction: column;
}
</style>
