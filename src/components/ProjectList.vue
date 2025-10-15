<!-- Project list component for viewing and managing saved projects -->
<template>
  <div class="flex flex-col h-full bg-white dark:bg-gray-800">
    <div class="p-6 border-b border-gray-200 dark:border-gray-700">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Saved Projects</h2>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        {{ projects.length }} {{ projects.length === 1 ? 'project' : 'projects' }}
      </p>
    </div>

    <div v-if="projects.length === 0" class="flex-1 flex items-center justify-center p-12">
      <p class="text-sm text-gray-400 dark:text-gray-500">No saved projects yet</p>
    </div>

    <div v-else class="flex-1 overflow-y-auto p-2">
      <div
        v-for="project in projects"
        :key="project.id"
        class="flex items-center justify-between p-4 mb-2 border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-sm transition-all"
      >
        <div class="flex-1 min-w-0">
          <div v-if="renamingId !== project.id" class="font-medium text-sm text-gray-900 dark:text-gray-100 mb-1 break-words">
            {{ project.name }}
          </div>
          <input
            v-else
            ref="renameInput"
            v-model="renameValue"
            type="text"
            class="w-full px-2 py-1 text-sm font-medium border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            @keydown.enter="confirmRename(project.id)"
            @keydown.esc="cancelRename"
            @blur="cancelRename"
          />
          <div class="text-xs text-gray-500 dark:text-gray-400">
            {{ formatDate(project.lastModified) }}
          </div>
        </div>

        <div class="flex items-center gap-2 ml-4 flex-shrink-0">
          <template v-if="deletingId !== project.id">
            <button
              class="px-2.5 py-1 text-xs font-medium rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors"
              @click="$emit('load', project.id)"
            >
              Load
            </button>
            <button
              class="px-2.5 py-1 text-xs font-medium rounded bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
              @click="startRename(project.id, project.name)"
            >
              Rename
            </button>
            <button
              class="px-2.5 py-1 text-xs font-medium rounded bg-red-600 text-white hover:bg-red-700 transition-colors"
              @click="startDelete(project.id)"
            >
              Delete
            </button>
          </template>
          <template v-else>
            <span class="text-sm font-medium text-red-600 dark:text-red-400">Delete?</span>
            <button
              class="px-2.5 py-1 text-xs font-medium rounded bg-red-600 text-white hover:bg-red-700 transition-colors"
              @click="confirmDelete(project.id)"
            >
              Yes
            </button>
            <button
              class="px-2.5 py-1 text-xs font-medium rounded bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
              @click="cancelDelete"
            >
              No
            </button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'

defineProps({
  projects: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['load', 'rename', 'delete'])

// Rename state
const renamingId = ref(null)
const renameValue = ref('')
const renameInput = ref(null)

// Delete state
const deletingId = ref(null)

// Rename functions
async function startRename(projectId, currentName) {
  renamingId.value = projectId
  renameValue.value = currentName
  await nextTick()
  await nextTick()
  if (renameInput.value && renameInput.value[0]) {
    renameInput.value[0].focus()
    renameInput.value[0].select()
  }
}

function confirmRename(projectId) {
  const trimmedName = renameValue.value.trim()
  if (trimmedName) {
    emit('rename', projectId, trimmedName)
  }
  cancelRename()
}

function cancelRename() {
  renamingId.value = null
  renameValue.value = ''
}

// Delete functions
function startDelete(projectId) {
  deletingId.value = projectId
}

function confirmDelete(projectId) {
  emit('delete', projectId)
  deletingId.value = null
}

function cancelDelete() {
  deletingId.value = null
}

// Date formatting
function formatDate(timestamp) {
  const now = Date.now()
  const diff = now - timestamp
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) {
    return 'just now'
  } else if (minutes < 60) {
    return `${minutes}m ago`
  } else if (hours < 24) {
    return `${hours}h ago`
  } else if (days < 7) {
    return `${days}d ago`
  } else {
    const date = new Date(timestamp)
    return date.toLocaleDateString()
  }
}
</script>
