<!-- Main Form Builder application component -->
<template>
  <div id="app" class="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Schema Generation Modal -->
    <GenerateSchemaModal
      :open="showGenerateModal"
      @confirm="handleGenerateConfirm"
      @cancel="handleGenerateCancel"
    />

    <!-- Save Project Modal -->
    <SaveProjectModal
      :open="showSaveModal"
      :existing-names="existingProjectNames"
      @save="handleSaveProject"
      @cancel="handleCancelSave"
    />

    <!-- Header -->
    <header class="header">
      <div class="header-content">
        <h1 class="header-title">Form Builder</h1>
        <div class="header-project-name">
          {{ currentProjectName || 'Untitled' }}
        </div>
      </div>
      <div class="header-actions">
        <button class="btn btn-secondary" @click="showProjectList = !showProjectList">
          Projects
        </button>
        <button class="btn btn-primary" @click="showSaveModal = true">
          Save As
        </button>
      </div>
    </header>

    <main class="flex-1 flex overflow-hidden">
      <!-- Project List Sidebar -->
      <aside
        v-if="showProjectList"
        class="project-sidebar"
      >
        <ProjectList
          :projects="savedProjects"
          @load="handleLoadProject"
          @rename="handleRenameProject"
          @delete="handleDeleteProject"
        />
      </aside>

      <!-- Left Panel: Editors -->
      <div
        data-testid="left-panel"
        class="border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden"
        :style="{ width: `${editorPanelWidth}px` }"
      >
        <SchemaEditorPanel
          v-model:json-schema="jsonSchema"
          v-model:ui-schema="uiSchema"
          v-model:data="data"
        />
      </div>

      <!-- Resize Handle -->
      <div
        class="resize-handle-vertical"
        @mousedown="startResize"
      ></div>

      <!-- Right Panel: Preview -->
      <div data-testid="right-panel" class="flex flex-1 flex-col" >
        <div class="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">JsonForm Vue Playground</h2>
        </div>
        <div class="flex-1 p-4 bg-gray-50 dark:bg-gray-900 overflow-auto" >
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Form Preview</h2>
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
import { ref, computed, onMounted, watch } from 'vue'
import FormPreview from './components/FormPreview.vue'
import SchemaEditorPanel from './components/SchemaEditorPanel.vue'
import GenerateSchemaModal from './components/GenerateSchemaModal.vue'
import SaveProjectModal from './components/SaveProjectModal.vue'
import ProjectList from './components/ProjectList.vue'
import { DEFAULT_JSON_SCHEMA, DEFAULT_UI_SCHEMA, DEFAULT_DATA } from './data/defaultTemplate'
import { validateJson } from './services/JsonValidator'
import { generateFromData } from './services/SchemaGenerationService'
import { ProjectRepository } from './services/ProjectRepository'
import { createProject } from './models/Project'

// Initialize repository
const repository = new ProjectRepository()

// Reactive state
const jsonSchema = ref(DEFAULT_JSON_SCHEMA)
const uiSchema = ref(DEFAULT_UI_SCHEMA)
const data = ref(DEFAULT_DATA)

// Project management state
const currentProjectId = ref(null)
const currentProjectName = ref(null)
const showSaveModal = ref(false)
const showProjectList = ref(false)
const savedProjects = ref([])

// Computed properties
const existingProjectNames = computed(() => {
  return savedProjects.value.map(p => p.name)
})

// Editor panel width state (default to 50em in pixels)
const editorPanelWidth = ref(800) // 50em * 16px/em = 800px
const isResizing = ref(false)
const startX = ref(0)
const startWidth = ref(0)

// Validation state
const allValid = computed(() => {
  return validateJson(jsonSchema.value).valid &&
         validateJson(uiSchema.value).valid &&
         validateJson(data.value).valid
})

// Schema generation state
const showGenerateModal = ref(false)
const previousData = ref(data.value)

// Auto-save state
let autoSaveTimeout = null

// Check if schemas are non-empty (not default)
const hasExistingSchemas = computed(() => {
  return jsonSchema.value.trim() !== '' && uiSchema.value.trim() !== ''
})

// Watch for significant data changes
watch(data, (newData) => {
  // Check if data is valid JSON and has changed significantly
  const validation = validateJson(newData)
  if (!validation.valid) {
    previousData.value = newData
    return
  }

  const parsed = validation.parsed

  // Check if it's an object (not array or primitive)
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    previousData.value = newData
    return
  }

  // Check if data has changed significantly (more than just whitespace)
  const currentNormalized = JSON.stringify(parsed)
  let previousNormalized = ''
  try {
    const prevParsed = JSON.parse(previousData.value)
    previousNormalized = JSON.stringify(prevParsed)
  } catch {
    // Previous data was invalid, treat as different
  }

  if (currentNormalized !== previousNormalized && Object.keys(parsed).length > 0) {
    // Data has changed, check if we should show the modal
    if (hasExistingSchemas.value) {
      showGenerateModal.value = true
    } else {
      // No existing schemas, generate immediately
      generateSchemas()
    }
  }

  previousData.value = newData
})

// Generate schemas from data
function generateSchemas() {
  const result = generateFromData(data.value)

  if (result.error) {
    console.error('Failed to generate schemas:', result.error)
    return
  }

  jsonSchema.value = result.jsonSchema
  uiSchema.value = result.uiSchema
}

// Handle modal confirmation
function handleGenerateConfirm() {
  generateSchemas()
  showGenerateModal.value = false
}

// Handle modal cancellation
function handleGenerateCancel() {
  showGenerateModal.value = false
}

// Auto-save function with debouncing
function saveCurrentWork() {
  // Clear existing timeout
  if (autoSaveTimeout) {
    clearTimeout(autoSaveTimeout)
  }

  // Set new timeout (2 seconds debounce)
  autoSaveTimeout = setTimeout(() => {
    repository.saveCurrent(jsonSchema.value, uiSchema.value, data.value)
  }, 2000)
}

// Project management functions
function loadSavedProjects() {
  savedProjects.value = repository.getAllProjects()
}

function handleSaveProject(name) {
  const project = createProject(name, jsonSchema.value, uiSchema.value, data.value)
  repository.saveProject(project)
  currentProjectId.value = project.id
  currentProjectName.value = project.name
  showSaveModal.value = false
  loadSavedProjects()

  // Update document title
  document.title = `${name} - Form Builder`
}

function handleCancelSave() {
  showSaveModal.value = false
}

function handleLoadProject(projectId) {
  const project = repository.getProject(projectId)
  if (project) {
    jsonSchema.value = project.jsonSchema
    uiSchema.value = project.uiSchema
    data.value = project.data
    currentProjectId.value = project.id
    currentProjectName.value = project.name
    previousData.value = project.data
    showProjectList.value = false

    // Update document title
    document.title = `${project.name} - Form Builder`
  }
}

function handleRenameProject(projectId, newName) {
  const project = repository.getProject(projectId)
  if (project) {
    project.name = newName
    project.lastModified = Date.now()
    repository.saveProject(project)

    // Update current name if this is the current project
    if (currentProjectId.value === projectId) {
      currentProjectName.value = newName
      document.title = `${newName} - Form Builder`
    }

    loadSavedProjects()
  }
}

function handleDeleteProject(projectId) {
  repository.deleteProject(projectId)

  // If deleting the current project, clear current state
  if (currentProjectId.value === projectId) {
    currentProjectId.value = null
    currentProjectName.value = null
    document.title = 'Form Builder'
  }

  loadSavedProjects()
}

// Watch for changes to trigger auto-save
watch([jsonSchema, uiSchema, data], () => {
  saveCurrentWork()
})

// Initialize on mount
onMounted(() => {
  // Calculate 50em in actual pixels based on root font size
  const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize)
  editorPanelWidth.value = Math.min(50 * rootFontSize, window.innerWidth * 0.5)

  // Load current work from localStorage if it exists
  const current = repository.getCurrent()
  if (current) {
    jsonSchema.value = current.jsonSchema
    uiSchema.value = current.uiSchema
    data.value = current.data
    // Update previousData to avoid triggering schema generation on load
    previousData.value = current.data
  }

  // Load saved projects
  loadSavedProjects()
})

// Resize functionality
function startResize(event) {
  isResizing.value = true
  startX.value = event.clientX
  startWidth.value = editorPanelWidth.value

  event.preventDefault()

  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
}

function handleResize(event) {
  if (isResizing.value) {
    const delta = event.clientX - startX.value
    const newWidth = startWidth.value + delta

    // Set min width to 300px and max width to window width - 300px (to ensure right panel has space)
    editorPanelWidth.value = Math.max(300, Math.min(window.innerWidth - 300, newWidth))
  }
}

function stopResize() {
  isResizing.value = false
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
}
</script>

<style>
#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.5rem;
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
}

.header-project-name {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
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

.project-sidebar {
  width: 320px;
  border-right: 1px solid #e5e7eb;
  overflow-y: auto;
  flex-shrink: 0;
}

.resize-handle-vertical {
  width: 4px;
  cursor: ew-resize;
  background: transparent;
  position: relative;
  flex-shrink: 0;
}

.resize-handle-vertical:hover {
  background-color: var(--color-blue-1);
}

.resize-handle-vertical:active {
  background-color: var(--color-blue-1);
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .header {
    background: #1f2937;
    border-bottom-color: #374151;
  }

  .header-title {
    color: #f9fafb;
  }

  .header-project-name {
    color: #9ca3af;
  }

  .btn-secondary {
    background-color: #374151;
    color: #d1d5db;
    border-color: #4b5563;
  }

  .btn-secondary:hover {
    background-color: #4b5563;
  }

  .project-sidebar {
    border-right-color: #374151;
  }
}
</style>
