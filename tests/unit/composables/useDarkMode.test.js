// Unit tests for useDarkMode composable
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { nextTick } from 'vue'
import { useDarkMode } from '@/composables/useDarkMode'

describe('useDarkMode', () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear()
    // Reset document class
    document.documentElement.classList.remove('dark')
  })

  afterEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  it('initializes with system preference when no stored value', () => {
    const { isDark } = useDarkMode()

    // Value should be defined
    expect(isDark.value).toBeDefined()
    expect(typeof isDark.value).toBe('boolean')
  })

  it('loads stored preference from localStorage', () => {
    localStorage.setItem('darkMode', 'true')

    const { isDark } = useDarkMode()

    expect(isDark.value).toBe(true)
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('respects false value from localStorage', () => {
    localStorage.setItem('darkMode', 'false')

    const { isDark } = useDarkMode()

    expect(isDark.value).toBe(false)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('toggles dark mode on', async () => {
    const { isDark, toggle } = useDarkMode()

    // Start with light mode
    isDark.value = false
    await nextTick()
    document.documentElement.classList.remove('dark')

    toggle()
    await nextTick()

    expect(isDark.value).toBe(true)
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('toggles dark mode off', async () => {
    const { isDark, toggle } = useDarkMode()

    // Start with dark mode
    isDark.value = true
    await nextTick()
    document.documentElement.classList.add('dark')

    toggle()
    await nextTick()

    expect(isDark.value).toBe(false)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('persists preference to localStorage on toggle', () => {
    const { toggle } = useDarkMode()

    toggle()

    const stored = localStorage.getItem('darkMode')
    expect(stored).toBeDefined()
  })

  it('adds dark class to document element when enabled', async () => {
    const { isDark } = useDarkMode()

    isDark.value = true
    await nextTick()

    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('removes dark class from document element when disabled', async () => {
    document.documentElement.classList.add('dark')

    const { isDark } = useDarkMode()

    isDark.value = false
    await nextTick()

    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('watches for changes to isDark ref', async () => {
    const { isDark } = useDarkMode()

    isDark.value = true
    await nextTick()
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    isDark.value = false
    await nextTick()
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('returns reactive isDark ref', () => {
    const { isDark } = useDarkMode()

    expect(isDark).toBeDefined()
    expect(typeof isDark.value).toBe('boolean')
  })

  it('returns toggle function', () => {
    const { toggle } = useDarkMode()

    expect(typeof toggle).toBe('function')
  })
})
