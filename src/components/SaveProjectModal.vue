<!-- Modal for saving a project with a name -->
<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4"
        @click.self="handleCancel"
        @keydown.esc="handleCancel"
      >
        <Transition
          enter-active-class="transition-all duration-200"
          leave-active-class="transition-all duration-200"
          enter-from-class="opacity-0 scale-95"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="open"
            role="dialog"
            aria-modal="true"
            :aria-labelledby="modalTitleId"
            class="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-auto"
          >
            <div class="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 :id="modalTitleId" class="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Save Project
              </h2>
            </div>

            <div class="p-6">
              <div class="flex flex-col gap-2">
                <label for="project-name" class="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Project Name
                </label>
                <input
                  id="project-name"
                  ref="inputRef"
                  v-model="projectName"
                  type="text"
                  class="px-3 py-2 border rounded-md text-sm transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  :class="hasError
                    ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                    : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'"
                  placeholder="Enter project name"
                  @keydown.enter="handleSave"
                  @blur="touched = true"
                />
                <p v-if="hasError" class="text-sm text-red-500">
                  {{ errorMessage }}
                </p>
              </div>
            </div>

            <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                type="button"
                class="px-4 py-2 text-sm font-medium rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                @click="handleCancel"
              >
                Cancel
              </button>
              <button
                type="button"
                class="px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                :disabled="!isValid"
                @click="handleSave"
              >
                Save
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'

const props = defineProps({
  open: {
    type: Boolean,
    required: true
  },
  existingNames: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['save', 'cancel'])

// State
const projectName = ref('')
const touched = ref(false)
const inputRef = ref(null)
const modalTitleId = 'modal-title-' + Math.random().toString(36).substr(2, 9)

// Validation
const isEmpty = computed(() => projectName.value.trim() === '')
const isDuplicate = computed(() => {
  const normalizedName = projectName.value.trim().toLowerCase()
  return props.existingNames.some(name =>
    name.toLowerCase() === normalizedName
  )
})

const errorMessage = computed(() => {
  if (isEmpty.value) {
    return 'Project name is required'
  }
  if (isDuplicate.value) {
    return 'A project with this name already exists'
  }
  return ''
})

const hasError = computed(() => touched.value && errorMessage.value !== '')
const isValid = computed(() => !isEmpty.value && !isDuplicate.value)

// Methods
function handleSave() {
  touched.value = true
  if (isValid.value) {
    emit('save', projectName.value.trim())
    resetForm()
  }
}

function handleCancel() {
  emit('cancel')
  resetForm()
}

function resetForm() {
  projectName.value = ''
  touched.value = false
}

// Focus input when modal opens
watch(() => props.open, async (isOpen) => {
  if (isOpen) {
    await nextTick()
    await nextTick()
    inputRef.value?.focus()
  }
})
</script>
