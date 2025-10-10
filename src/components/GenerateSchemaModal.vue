<!-- Modal for confirming schema generation from pasted data -->
<script setup>
import { onMounted, onUnmounted } from 'vue';

const props = defineProps({
  open: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['confirm', 'cancel']);

const handleKeydown = (e) => {
  if (!props.open) return;

  if (e.key === 'Escape') {
    emit('cancel');
  } else if (e.key === 'Enter') {
    emit('confirm');
  }
};

const handleOverlayClick = (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    emit('cancel');
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
  <div v-if="open" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <h2 class="modal-title">Generate Schemas from Data?</h2>
      <p class="modal-message">
        Existing schemas will be replaced with automatically generated schemas based on your data.
        This action cannot be undone.
      </p>
      <div class="modal-actions">
        <button
          data-test="cancel-button"
          class="btn btn-secondary"
          @click="emit('cancel')"
        >
          Cancel
        </button>
        <button
          data-test="replace-button"
          class="btn btn-danger"
          @click="emit('confirm')"
        >
          Replace
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  padding: 24px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-title {
  margin: 0 0 16px 0;
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
}

.modal-message {
  margin: 0 0 24px 0;
  color: #4b5563;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.btn-secondary {
  background-color: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background-color: #e5e7eb;
}

.btn-danger {
  background-color: #dc2626;
  color: white;
}

.btn-danger:hover {
  background-color: #b91c1c;
}

@media (prefers-color-scheme: dark) {
  .modal-content {
    background: #1f2937;
  }

  .modal-title {
    color: #f9fafb;
  }

  .modal-message {
    color: #d1d5db;
  }

  .btn-secondary {
    background-color: #374151;
    color: #f9fafb;
  }

  .btn-secondary:hover {
    background-color: #4b5563;
  }
}
</style>
