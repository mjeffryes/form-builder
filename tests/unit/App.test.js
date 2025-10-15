// Unit tests for main App component
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import App from '@/App.vue'
import { ProjectRepository } from '@/services/ProjectRepository'

describe('App.vue', () => {
  it('renders successfully', () => {
    const wrapper = mount(App)
    expect(wrapper.exists()).toBe(true)
  })

  describe('split-panel layout', () => {
    it('has a left panel for editors', () => {
      const wrapper = mount(App)
      const leftPanel = wrapper.find('[data-testid="left-panel"]')
      expect(leftPanel.exists()).toBe(true)
    })

    it('has a right panel for preview', () => {
      const wrapper = mount(App)
      const rightPanel = wrapper.find('[data-testid="right-panel"]')
      expect(rightPanel.exists()).toBe(true)
    })

    it('displays editors in left panel', () => {
      const wrapper = mount(App)
      const leftPanel = wrapper.find('[data-testid="left-panel"]')
      expect(leftPanel.text()).toContain('JSON Schema')
      expect(leftPanel.text()).toContain('UI Schema')
      expect(leftPanel.text()).toContain('Data')
    })

    it('displays form preview in right panel', () => {
      const wrapper = mount(App)
      const rightPanel = wrapper.find('[data-testid="right-panel"]')
      // TODO: Should have FormPreview component
      expect(rightPanel.exists()).toBe(true)
    })
  })

  describe('auto-save functionality', () => {
    let repository

    beforeEach(() => {
      localStorage.clear()
      repository = new ProjectRepository()
      vi.useFakeTimers()
    })

    afterEach(() => {
      localStorage.clear()
      vi.restoreAllMocks()
      vi.useRealTimers()
    })

    it('saves current work after changes with debouncing', async () => {
      const wrapper = mount(App)
      await nextTick()

      // Get initial data
      const initialCurrent = repository.getCurrent()

      // Change the data
      wrapper.vm.jsonSchema = '{"type":"string"}'
      await nextTick()

      // Should not save immediately (debounced)
      expect(repository.getCurrent()).toEqual(initialCurrent)

      // Advance timers past debounce delay (2 seconds)
      await vi.advanceTimersByTimeAsync(2000)
      await nextTick()

      // Now it should be saved
      const saved = repository.getCurrent()
      expect(saved).not.toBeNull()
      expect(saved.jsonSchema).toBe('{"type":"string"}')
    })

    it('does not save on every keystroke', async () => {
      const wrapper = mount(App)
      await nextTick()

      // Make multiple rapid changes
      wrapper.vm.jsonSchema = '{"type":"string"}'
      await nextTick()
      await vi.advanceTimersByTimeAsync(500)

      wrapper.vm.jsonSchema = '{"type":"number"}'
      await nextTick()
      await vi.advanceTimersByTimeAsync(500)

      wrapper.vm.jsonSchema = '{"type":"boolean"}'
      await nextTick()
      await vi.advanceTimersByTimeAsync(500)

      // Should not have saved yet (total 1500ms < 2000ms)
      let saved = repository.getCurrent()
      // Either nothing saved yet, or it hasn't updated to the latest value
      if (saved !== null) {
        expect(saved.jsonSchema).not.toBe('{"type":"boolean"}')
      }

      // Wait for debounce to complete
      await vi.advanceTimersByTimeAsync(2000)
      await nextTick()

      // Now it should be saved with the final value
      saved = repository.getCurrent()
      expect(saved).not.toBeNull()
      expect(saved.jsonSchema).toBe('{"type":"boolean"}')
    })

    it('initializes with default template when no current project exists', () => {
      const wrapper = mount(App)

      // Should have default values
      expect(wrapper.vm.jsonSchema).toBeTruthy()
      expect(wrapper.vm.uiSchema).toBeTruthy()
      expect(wrapper.vm.data).toBeTruthy()
    })

    it('initializes with saved current project when it exists', async () => {
      // Save a current project first
      repository.saveCurrent(
        '{"type":"object","properties":{"test":{"type":"string"}}}',
        '{"type":"VerticalLayout"}',
        '{"test":"value"}'
      )

      // Mount app - should load from saved current
      const wrapper = mount(App)
      await nextTick()

      expect(wrapper.vm.jsonSchema).toContain('"test"')
      expect(wrapper.vm.data).toContain('"test":"value"')
    })

    it('saves all three editor values', async () => {
      const wrapper = mount(App)
      await nextTick()

      wrapper.vm.jsonSchema = '{"type":"string"}'
      wrapper.vm.uiSchema = '{"type":"Control"}'
      wrapper.vm.data = '{"name":"test"}'

      await vi.advanceTimersByTimeAsync(2000)
      await nextTick()

      const saved = repository.getCurrent()
      expect(saved.jsonSchema).toBe('{"type":"string"}')
      expect(saved.uiSchema).toBe('{"type":"Control"}')
      expect(saved.data).toBe('{"name":"test"}')
    })
  })

  describe('project management UI', () => {
    beforeEach(() => {
      localStorage.clear()
    })

    afterEach(() => {
      localStorage.clear()
    })

    it('displays header with project name', () => {
      const wrapper = mount(App)

      const text = wrapper.text()
      expect(text).toContain('Form Builder')
      expect(text).toContain('Untitled')
    })

    it('shows Save As button', () => {
      const wrapper = mount(App)

      const buttons = wrapper.findAll('button')
      const saveButton = buttons.some(btn => btn.text().includes('Save As'))
      expect(saveButton).toBe(true)
    })

    it('shows Projects button', () => {
      const wrapper = mount(App)

      const buttons = wrapper.findAll('button')
      const projectsButton = buttons.some(btn => btn.text().includes('Projects'))
      expect(projectsButton).toBe(true)
    })

    it('updates project name after save', async () => {
      const wrapper = mount(App)
      await nextTick()

      // Trigger save
      wrapper.vm.handleSaveProject('My Test Project')
      await nextTick()

      expect(wrapper.text()).toContain('My Test Project')
    })

    it('loads saved projects on mount', async () => {
      const repository = new ProjectRepository()
      const { createProject } = await import('@/models/Project')
      const project = createProject('Test Project', '{}', '{}', '{}')
      repository.saveProject(project)

      const wrapper = mount(App)
      await nextTick()

      expect(wrapper.vm.savedProjects.length).toBeGreaterThan(0)
    })
  })
})
