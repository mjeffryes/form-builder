<!-- JSON editor component with CodeMirror -->
<template>
  <div class="json-editor flex flex-col h-full">
    <!-- Header -->
    <div
      v-if="!hideHeader"
      class="editor-header px-4 py-2 border-b flex items-center justify-between"
      :class="validationResult.valid
        ? 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
        : 'bg-red-100 dark:bg-red-900 border-red-300 dark:border-red-700'"
    >
      <div class="flex-1">
        <h3 class="text-sm font-semibold" :class="validationResult.valid ? 'text-gray-700 dark:text-gray-200' : 'text-red-800 dark:text-red-200'">
          {{ title }}
        </h3>
        <p v-if="!validationResult.valid" class="text-xs text-red-600 dark:text-red-400 mt-1">
          Error: {{ validationResult.error }}
        </p>
      </div>
      <button
        v-if="!validationResult.valid && lastValidContent"
        data-testid="revert-button"
        @click="revert"
        class="ml-2 px-3 py-1 text-xs font-medium text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-800 hover:bg-red-100 dark:hover:bg-red-700 rounded border border-red-200 dark:border-red-600"
      >
        Revert
      </button>
    </div>

    <!-- Inline error for hideHeader mode -->
    <div
      v-if="hideHeader && !validationResult.valid"
      class="px-2 py-1 bg-red-100 dark:bg-red-900 border-b border-red-300 dark:border-red-700 flex items-center justify-between"
    >
      <p class="text-xs text-red-600 dark:text-red-400">
        Error: {{ validationResult.error }}
      </p>
      <button
        v-if="lastValidContent"
        data-testid="revert-button"
        @click="revert"
        class="ml-2 px-2 py-0.5 text-xs font-medium text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-800 hover:bg-red-100 dark:hover:bg-red-700 rounded"
      >
        Revert
      </button>
    </div>

    <!-- CodeMirror Editor -->
    <div ref="editorContainer" class="editor-content flex-1 overflow-hidden"></div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter, highlightSpecialChars, drawSelection, highlightActiveLine } from '@codemirror/view'
import { EditorState, Compartment } from '@codemirror/state'
import { json } from '@codemirror/lang-json'
import { oneDark } from '@codemirror/theme-one-dark'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search'
import { autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete'
import { foldGutter, indentOnInput, syntaxHighlighting, defaultHighlightStyle, bracketMatching, foldKeymap } from '@codemirror/language'
import { useDarkMode } from '../composables/useDarkMode'
import { lintKeymap } from '@codemirror/lint'
import { validateJson } from '@/services/JsonValidator'

const props = defineProps({
  content: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  readonly: {
    type: Boolean,
    default: false
  },
  hideHeader: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:content', 'validation-change'])

const editorContainer = ref(null)
const validationResult = ref({ valid: true })
const lastValidContent = ref(props.content)
let editorView = null
let debounceTimer = null

// Detect dark mode
const { isDark, toggle: toggleDarkMode } = useDarkMode()

function validateContent(content) {
  const result = validateJson(content)
  validationResult.value = result

  // Store last valid content
  if (result.valid) {
    lastValidContent.value = content
  }

  // Emit validation change
  emit('validation-change', result)

  return result
}

function handleEditorUpdate(update) {
  if (update.docChanged) {
    const content = update.state.doc.toString()

    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    // Validate immediately for UI feedback
    validateContent(content)

    // Set new timer for emit
    debounceTimer = setTimeout(() => {
      emit('update:content', content)
    }, 300)
  }
}

function revert() {
  if (editorView && lastValidContent.value) {
    const transaction = editorView.state.update({
      changes: {
        from: 0,
        to: editorView.state.doc.length,
        insert: lastValidContent.value
      }
    })
    editorView.dispatch(transaction)
    validateContent(lastValidContent.value)
    emit('update:content', lastValidContent.value)
  }
}

function updateEditorContent(newContent) {
  if (editorView) {
    const currentContent = editorView.state.doc.toString()
    if (currentContent !== newContent) {
      const transaction = editorView.state.update({
        changes: {
          from: 0,
          to: editorView.state.doc.length,
          insert: newContent
        }
      })
      editorView.dispatch(transaction)
    }
  }
}

onMounted(() => {
  if (!editorContainer.value) return

  // Basic CodeMirror setup (equivalent to basicSetup)
  const basicExtensions = [
    lineNumbers(),
    highlightActiveLineGutter(),
    highlightSpecialChars(),
    history(),
    foldGutter(),
    drawSelection(),
    EditorState.allowMultipleSelections.of(true),
    indentOnInput(),
    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
    bracketMatching(),
    closeBrackets(),
    autocompletion(),
    highlightActiveLine(),
    highlightSelectionMatches(),
    keymap.of([
      ...closeBracketsKeymap,
      ...defaultKeymap,
      ...searchKeymap,
      ...historyKeymap,
      ...foldKeymap,
      ...completionKeymap,
      ...lintKeymap
    ])
  ]

  // Create CodeMirror extensions
  const extensions = [
    ...basicExtensions,
    json(),
    EditorView.updateListener.of(handleEditorUpdate),
    EditorState.readOnly.of(props.readonly)
  ]

  // Add dark theme if in dark mode
  if (isDark) {
    //extensions.push(oneDark)
  }

  // Create editor state
  const startState = EditorState.create({
    doc: props.content,
    extensions
  })

  // Create editor view
  editorView = new EditorView({
    state: startState,
    parent: editorContainer.value
  })

  // Validate initial content
  validateContent(props.content)
})

onBeforeUnmount(() => {
  if (editorView) {
    editorView.destroy()
  }
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
})

// Update editor when prop changes
watch(() => props.content, (newContent) => {
  updateEditorContent(newContent)
  validateContent(newContent)
})

// Update readonly state
watch(() => props.readonly, (newReadonly) => {
  if (editorView) {
    editorView.dispatch({
      effects: EditorState.readOnly.reconfigure(EditorState.readOnly.of(newReadonly))
    })
  }
})
</script>

<style>
/* CodeMirror container styling */
.editor-content .cm-editor {
  height: 100%;
  font-size: 14px;
}

.editor-content .cm-scroller {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace;
}

.editor-content .cm-gutters {
  background-color: #f3f4f6;
  border-right: 1px solid #e5e7eb;
}

@media (prefers-color-scheme: dark) {
  .editor-content .cm-gutters {
    background-color: #374151;
    border-right: 1px solid #4b5563;
  }
}
</style>
