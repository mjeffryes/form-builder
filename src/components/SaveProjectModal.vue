<!-- Modal for saving a project with a name -->
<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="open"
        class="modal-overlay"
        @click.self="handleCancel"
        @keydown.esc="handleCancel"
      >
        <div
          role="dialog"
          aria-modal="true"
          :aria-labelledby="modalTitleId"
          class="modal-dialog"
        >
          <div class="modal-header">
            <h2 :id="modalTitleId" class="modal-title">
              Save Project
            </h2>
          </div>

          <div class="modal-body">
            <div class="form-group">
              <label for="project-name" class="form-label">
                Project Name
              </label>
              <input
                id="project-name"
                ref="inputRef"
                v-model="projectName"
                type="text"
                class="form-input"
                placeholder="Enter project name"
                :class="{ 'input-error': hasError }"
                @keydown.enter="handleSave"
                @blur="touched = true"
              />
              <p v-if="hasError" class="error-message">
                {{ errorMessage }}
              </p>
            </div>
          </div>

          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              @click="handleCancel"
            >
              Cancel
            </button>
            <button
              type="button"
              class="btn btn-primary"
              :disabled="!isValid"
              @click="handleSave"
            >
              Save
            </button>
          </div>
        </div>
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

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-dialog {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 28rem;
  width: 100%;
  max-height: 90vh;
  overflow: auto;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.form-input {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input.input-error {
  border-color: #ef4444;
}

.form-input.input-error:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.error-message {
  margin: 0;
  font-size: 0.875rem;
  color: #ef4444;
}

.btn {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  transition: all 0.15s;
}

.btn:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.btn-secondary {
  background-color: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background-color: #f9fafb;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2563eb;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Transition animations */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s;
}

.modal-enter-active .modal-dialog,
.modal-leave-active .modal-dialog {
  transition: transform 0.2s, opacity 0.2s;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-dialog,
.modal-leave-to .modal-dialog {
  transform: scale(0.95);
  opacity: 0;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .modal-dialog {
    background: #1f2937;
  }

  .modal-header {
    border-bottom-color: #374151;
  }

  .modal-title {
    color: #f9fafb;
  }

  .modal-footer {
    border-top-color: #374151;
  }

  .form-label {
    color: #d1d5db;
  }

  .form-input {
    background-color: #374151;
    border-color: #4b5563;
    color: #f9fafb;
  }

  .btn-secondary {
    background-color: #374151;
    color: #d1d5db;
    border-color: #4b5563;
  }

  .btn-secondary:hover {
    background-color: #4b5563;
  }
}
</style>
