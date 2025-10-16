<!-- Main Form Builder application component -->
<template>
  <div id="app" class="flex h-screen bg-gray-50 dark:bg-gray-900">
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
    <div class="w-1 cursor-ew-resize bg-transparent hover:bg-blue-100 dark:hover:bg-blue-900 active:bg-blue-100 dark:active:bg-blue-900 relative flex-shrink-0 transition-colors" @mousedown="startResize"></div>

    <!-- Right Panel: Preview -->
    <div class="flex-grow flex flex-col">
      <!-- Header -->
      <header class="flex items-center justify-between px-6 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center gap-4">
          <h1 class="m-0 text-xl font-semibold text-gray-900 dark:text-gray-50">JsonForms Vue Playground</h1>
          <div class="text-sm text-gray-500 dark:text-gray-400 font-medium">
            {{ currentProjectName || 'Untitled' }}
          </div>
        </div>
        <div class="flex gap-3">
          <button
            class="px-2 py-2 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-600 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-700 text-xl flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-10 transition-all"
            @click="toggleDarkMode"
            :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
            title="Toggle dark mode"
          >
            <span v-if="isDark">☀️</span>
            <span v-else>🌙</span>
          </button>
          <button class="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-10 transition-all" @click="showProjectList = !showProjectList">
            Projects
          </button>
          <button class="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-10 transition-all" @click="handleExport">
            Export
          </button>
          <button class="px-4 py-2 text-sm font-medium rounded-md border-0 bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-10 transition-all" @click="showSaveModal = true">
            Save As
          </button>
        </div>
      </header>

      <main class="flex-1 flex overflow-hidden">
        <!-- Project List Sidebar -->
        <aside
          v-if="showProjectList"
          class="w-80 border-r border-gray-200 dark:border-gray-700 overflow-y-auto flex-shrink-0"
        >
          <ProjectList
            :projects="savedProjects"
            @load="handleLoadProject"
            @rename="handleRenameProject"
            @delete="handleDeleteProject"
          />
        </aside>

        <div data-testid="right-panel" class="flex flex-1 flex-col" >
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
import { exportAndDownload } from './services/ExportService'
import { useDarkMode } from './composables/useDarkMode'

// Initialize repository
const repository = new ProjectRepository()

// Dark mode
const { isDark, toggle: toggleDarkMode } = useDarkMode()

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

// Export function
async function handleExport() {
  // Create a project object with current state
  const projectName = currentProjectName.value || 'Untitled'
  const project = createProject(
    projectName,
    jsonSchema.value,
    uiSchema.value,
    data.value
  )

  await exportAndDownload(project)
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
</style>
