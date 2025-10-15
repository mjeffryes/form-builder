<!-- Project list component for viewing and managing saved projects -->
<template>
  <div class="project-list">
    <div class="list-header">
      <h2 class="list-title">Saved Projects</h2>
      <p class="project-count">
        {{ projects.length }} {{ projects.length === 1 ? 'project' : 'projects' }}
      </p>
    </div>

    <div v-if="projects.length === 0" class="empty-state">
      <p>No saved projects yet</p>
    </div>

    <div v-else class="project-items">
      <div
        v-for="project in projects"
        :key="project.id"
        class="project-item"
      >
        <div class="project-info">
          <div v-if="renamingId !== project.id" class="project-name">
            {{ project.name }}
          </div>
          <input
            v-else
            ref="renameInput"
            v-model="renameValue"
            type="text"
            class="rename-input"
            @keydown.enter="confirmRename(project.id)"
            @keydown.esc="cancelRename"
            @blur="cancelRename"
          />
          <div class="project-meta">
            {{ formatDate(project.lastModified) }}
          </div>
        </div>

        <div class="project-actions">
          <template v-if="deletingId !== project.id">
            <button
              class="btn btn-sm btn-primary"
              @click="$emit('load', project.id)"
            >
              Load
            </button>
            <button
              class="btn btn-sm btn-secondary"
              @click="startRename(project.id, project.name)"
            >
              Rename
            </button>
            <button
              class="btn btn-sm btn-danger"
              @click="startDelete(project.id)"
            >
              Delete
            </button>
          </template>
          <template v-else>
            <span class="delete-confirm-text">Delete?</span>
            <button
              class="btn btn-sm btn-danger"
              @click="confirmDelete(project.id)"
            >
              Yes
            </button>
            <button
              class="btn btn-sm btn-secondary"
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

<style scoped>
.project-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
}

.list-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.list-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
}

.project-count {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  color: #9ca3af;
  font-size: 0.875rem;
}

.project-items {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
}

.project-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  margin-bottom: 0.5rem;
  background: white;
  transition: all 0.15s;
}

.project-item:hover {
  border-color: #d1d5db;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.project-info {
  flex: 1;
  min-width: 0;
}

.project-name {
  font-weight: 500;
  color: #111827;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
  word-break: break-word;
}

.project-meta {
  font-size: 0.75rem;
  color: #6b7280;
}

.rename-input {
  width: 100%;
  padding: 0.25rem 0.5rem;
  border: 1px solid #3b82f6;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  outline: none;
}

.rename-input:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.project-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-shrink: 0;
  margin-left: 1rem;
}

.delete-confirm-text {
  font-size: 0.875rem;
  color: #dc2626;
  font-weight: 500;
}

.btn {
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 0.25rem;
  border: none;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}

.btn:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.btn-sm {
  padding: 0.25rem 0.625rem;
  font-size: 0.75rem;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background-color: #2563eb;
}

.btn-secondary {
  background-color: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background-color: #f9fafb;
}

.btn-danger {
  background-color: #dc2626;
  color: white;
}

.btn-danger:hover {
  background-color: #b91c1c;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .project-list {
    background: #1f2937;
  }

  .list-header {
    border-bottom-color: #374151;
  }

  .list-title {
    color: #f9fafb;
  }

  .project-count {
    color: #9ca3af;
  }

  .empty-state {
    color: #6b7280;
  }

  .project-item {
    background: #374151;
    border-color: #4b5563;
  }

  .project-item:hover {
    border-color: #6b7280;
  }

  .project-name {
    color: #f9fafb;
  }

  .project-meta {
    color: #9ca3af;
  }

  .rename-input {
    background-color: #1f2937;
    color: #f9fafb;
    border-color: #3b82f6;
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
