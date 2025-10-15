// Composable for managing dark mode state
import { ref, watch } from 'vue'

const STORAGE_KEY = 'darkMode'

/**
 * Composable for managing dark mode preference
 * @returns {Object} Object containing isDark ref and toggle function
 */
export function useDarkMode() {
  // Check if there's a stored preference, otherwise use system preference
  const getInitialValue = () => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored !== null) {
      return stored === 'true'
    }
    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  const isDark = ref(getInitialValue())

  // Apply dark mode class to document element
  const applyDarkMode = (dark) => {
    if (dark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // Watch for changes and apply
  watch(isDark, (newValue) => {
    applyDarkMode(newValue)
    localStorage.setItem(STORAGE_KEY, String(newValue))
  }, { immediate: true })

  // Toggle function
  const toggle = () => {
    isDark.value = !isDark.value
  }

  return {
    isDark,
    toggle
  }
}
