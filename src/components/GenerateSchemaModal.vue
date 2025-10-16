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

onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
  <div v-if="open" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]" @click.self="emit('cancel')">
    <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-[90%] shadow-lg">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Generate Schemas from Data?</h2>
      <p class="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
        Existing schemas will be replaced with automatically generated schemas based on your data.
        This action cannot be undone.
      </p>
      <div class="flex gap-3 justify-end">
        <button
          data-test="cancel-button"
          class="px-4 py-2 rounded-md text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          @click="emit('cancel')"
        >
          Cancel
        </button>
        <button
          data-test="replace-button"
          class="px-4 py-2 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
          @click="emit('confirm')"
        >
          Replace
        </button>
      </div>
    </div>
  </div>
</template>
