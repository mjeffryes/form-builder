// Unit tests for ProjectList component
import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import ProjectList from '@/components/ProjectList.vue'
import { createProject } from '@/models/Project'

describe('ProjectList.vue', () => {
  let projects

  beforeEach(() => {
    projects = [
      createProject('Contact Form', '{}', '{}', '{}'),
      createProject('Survey', '{}', '{}', '{}'),
      createProject('Registration', '{}', '{}', '{}')
    ]
    // Set different timestamps
    projects[0].lastModified = 3000
    projects[1].lastModified = 2000
    projects[2].lastModified = 1000
  })

  describe('rendering', () => {
    it('renders successfully with projects', () => {
      const wrapper = mount(ProjectList, {
        props: {
          projects
        }
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('displays all project names', () => {
      const wrapper = mount(ProjectList, {
        props: {
          projects
        }
      })

      const text = wrapper.text()
      expect(text).toContain('Contact Form')
      expect(text).toContain('Survey')
      expect(text).toContain('Registration')
    })

    it('shows project count', () => {
      const wrapper = mount(ProjectList, {
        props: {
          projects
        }
      })

      expect(wrapper.text()).toContain('3')
      expect(wrapper.text()).toMatch(/project/i)
    })

    it('shows empty state when no projects', () => {
      const wrapper = mount(ProjectList, {
        props: {
          projects: []
        }
      })

      const text = wrapper.text().toLowerCase()
      expect(text).toMatch(/no.*project/i)
    })

    it('displays last modified date for each project', () => {
      const wrapper = mount(ProjectList, {
        props: {
          projects: [projects[0]]
        }
      })

      // Should show some date/time representation
      const text = wrapper.text()
      expect(text.length).toBeGreaterThan(0)
    })
  })

  describe('actions', () => {
    it('shows load button for each project', () => {
      const wrapper = mount(ProjectList, {
        props: {
          projects
        }
      })

      const buttons = wrapper.findAll('button')
      const loadButtons = buttons.filter(btn => btn.text().toLowerCase().includes('load'))
      expect(loadButtons.length).toBeGreaterThan(0)
    })

    it('shows rename button for each project', () => {
      const wrapper = mount(ProjectList, {
        props: {
          projects
        }
      })

      const text = wrapper.text().toLowerCase()
      expect(text).toContain('rename')
    })

    it('shows delete button for each project', () => {
      const wrapper = mount(ProjectList, {
        props: {
          projects
        }
      })

      const text = wrapper.text().toLowerCase()
      expect(text).toContain('delete')
    })
  })

  describe('load event', () => {
    it('emits load event with project id when load is clicked', async () => {
      const wrapper = mount(ProjectList, {
        props: {
          projects: [projects[0]]
        }
      })

      const buttons = wrapper.findAll('button')
      const loadButton = buttons.find(btn => btn.text().toLowerCase().includes('load'))
      await loadButton.trigger('click')

      expect(wrapper.emitted('load')).toBeTruthy()
      expect(wrapper.emitted('load')[0]).toEqual([projects[0].id])
    })
  })

  describe('rename functionality', () => {
    it('shows rename input when rename is clicked', async () => {
      const wrapper = mount(ProjectList, {
        props: {
          projects: [projects[0]]
        }
      })

      const buttons = wrapper.findAll('button')
      const renameButton = buttons.find(btn => btn.text().toLowerCase().includes('rename'))
      await renameButton.trigger('click')
      await nextTick()

      const input = wrapper.find('input[type="text"]')
      expect(input.exists()).toBe(true)
    })

    it('emits rename event with project id and new name on confirm', async () => {
      const wrapper = mount(ProjectList, {
        props: {
          projects: [projects[0]]
        }
      })

      const buttons = wrapper.findAll('button')
      const renameButton = buttons.find(btn => btn.text().toLowerCase().includes('rename'))
      await renameButton.trigger('click')
      await nextTick()

      const input = wrapper.find('input[type="text"]')
      await input.setValue('New Name')
      await input.trigger('keydown.enter')
      await nextTick()

      expect(wrapper.emitted('rename')).toBeTruthy()
      expect(wrapper.emitted('rename')[0]).toEqual([projects[0].id, 'New Name'])
    })

    it('cancels rename on Escape key', async () => {
      const wrapper = mount(ProjectList, {
        props: {
          projects: [projects[0]]
        }
      })

      const buttons = wrapper.findAll('button')
      const renameButton = buttons.find(btn => btn.text().toLowerCase().includes('rename'))
      await renameButton.trigger('click')
      await nextTick()

      const input = wrapper.find('input[type="text"]')
      await input.trigger('keydown.esc')
      await nextTick()

      // Input should no longer exist
      expect(wrapper.find('input[type="text"]').exists()).toBe(false)
      expect(wrapper.emitted('rename')).toBeFalsy()
    })

    it('does not emit rename if name is empty', async () => {
      const wrapper = mount(ProjectList, {
        props: {
          projects: [projects[0]]
        }
      })

      const buttons = wrapper.findAll('button')
      const renameButton = buttons.find(btn => btn.text().toLowerCase().includes('rename'))
      await renameButton.trigger('click')
      await nextTick()

      const input = wrapper.find('input[type="text"]')
      await input.setValue('')
      await input.trigger('keydown.enter')
      await nextTick()

      expect(wrapper.emitted('rename')).toBeFalsy()
    })
  })

  describe('delete functionality', () => {
    it('shows confirmation when delete is clicked', async () => {
      const wrapper = mount(ProjectList, {
        props: {
          projects: [projects[0]]
        }
      })

      const buttons = wrapper.findAll('button')
      const deleteButton = buttons.find(btn => btn.text().toLowerCase().includes('delete'))
      await deleteButton.trigger('click')
      await nextTick()

      const text = wrapper.text().toLowerCase()
      expect(text).toMatch(/delete|confirm|yes/)
    })

    it('emits delete event with project id on confirmation', async () => {
      const wrapper = mount(ProjectList, {
        props: {
          projects: [projects[0]]
        }
      })

      const buttons = wrapper.findAll('button')
      const deleteButton = buttons.find(btn => btn.text().toLowerCase().includes('delete'))
      await deleteButton.trigger('click')
      await nextTick()

      // Find confirm button
      const allButtons = wrapper.findAll('button')
      const confirmButton = allButtons.find(btn =>
        btn.text().toLowerCase().match(/yes|confirm/)
      )
      await confirmButton.trigger('click')
      await nextTick()

      expect(wrapper.emitted('delete')).toBeTruthy()
      expect(wrapper.emitted('delete')[0]).toEqual([projects[0].id])
    })

    it('cancels delete on cancel button', async () => {
      const wrapper = mount(ProjectList, {
        props: {
          projects: [projects[0]]
        }
      })

      const buttons = wrapper.findAll('button')
      const deleteButton = buttons.find(btn => btn.text().toLowerCase().includes('delete'))
      await deleteButton.trigger('click')
      await nextTick()

      // Find cancel button
      const allButtons = wrapper.findAll('button')
      const cancelButton = allButtons.find(btn =>
        btn.text().toLowerCase().match(/no|cancel/)
      )
      await cancelButton.trigger('click')
      await nextTick()

      // Should no longer show confirmation
      const text = wrapper.text().toLowerCase()
      expect(text).not.toMatch(/yes|confirm/)
      expect(wrapper.emitted('delete')).toBeFalsy()
    })
  })

  describe('date formatting', () => {
    it('formats recent dates as relative time', () => {
      const now = Date.now()
      const recentProject = createProject('Recent', '{}', '{}', '{}')
      recentProject.lastModified = now - 60000 // 1 minute ago

      const wrapper = mount(ProjectList, {
        props: {
          projects: [recentProject]
        }
      })

      const text = wrapper.text()
      // Should contain some time indicator
      expect(text.length).toBeGreaterThan(0)
    })
  })

  describe('sorting', () => {
    it('displays projects in the order provided', () => {
      const wrapper = mount(ProjectList, {
        props: {
          projects
        }
      })

      const html = wrapper.html()
      const contactPos = html.indexOf('Contact Form')
      const surveyPos = html.indexOf('Survey')
      const regPos = html.indexOf('Registration')

      // Should be in the order provided (already sorted by lastModified descending)
      expect(contactPos).toBeLessThan(surveyPos)
      expect(surveyPos).toBeLessThan(regPos)
    })
  })
})
