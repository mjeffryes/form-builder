// Unit tests for SaveProjectModal component
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import SaveProjectModal from '@/components/SaveProjectModal.vue'

// Setup and cleanup for Teleport
afterEach(() => {
  document.body.innerHTML = ''
})

// Helper to mount modal
function mountModal(props = {}) {
  return mount(SaveProjectModal, {
    props: {
      open: false,
      existingNames: [],
      ...props
    },
    attachTo: document.body
  })
}

describe('SaveProjectModal.vue', () => {
  describe('rendering', () => {
    it('renders when open prop is true', async () => {
      const wrapper = mountModal({ open: true })
      await nextTick()

      const dialog = document.querySelector('[role="dialog"]')
      expect(dialog).toBeTruthy()

      wrapper.unmount()
    })

    it('does not render when open prop is false', async () => {
      const wrapper = mountModal({ open: false })
      await nextTick()

      const dialog = document.querySelector('[role="dialog"]')
      expect(dialog).toBeFalsy()

      wrapper.unmount()
    })

    it('shows input field for project name', async () => {
      const wrapper = mountModal({ open: true })
      await nextTick()

      const input = document.querySelector('input[type="text"]')
      expect(input).toBeTruthy()

      wrapper.unmount()
    })

    it('shows save and cancel buttons', async () => {
      const wrapper = mountModal({ open: true })
      await nextTick()

      const text = document.body.textContent
      expect(text).toContain('Save')
      expect(text).toContain('Cancel')

      wrapper.unmount()
    })
  })

  describe('validation', () => {
    it('shows error when name is empty', async () => {
      const wrapper = mountModal({ open: true })
      await nextTick()

      const input = document.querySelector('input[type="text"]')
      input.value = ''
      input.dispatchEvent(new Event('input'))
      input.dispatchEvent(new Event('blur'))
      await nextTick()

      const text = document.body.textContent
      expect(text.toLowerCase()).toContain('required')

      wrapper.unmount()
    })

    it('shows error when name is duplicate', async () => {
      const wrapper = mountModal({
        open: true,
        existingNames: ['My Project', 'Another Project']
      })
      await nextTick()

      const input = document.querySelector('input[type="text"]')
      input.value = 'My Project'
      input.dispatchEvent(new Event('input'))
      input.dispatchEvent(new Event('blur')) // Trigger touched state
      await nextTick()

      const text = document.body.textContent.toLowerCase()
      expect(text).toMatch(/already exists|duplicate/)

      wrapper.unmount()
    })

    it('does not show error for valid unique name', async () => {
      const wrapper = mountModal({
        open: true,
        existingNames: ['My Project']
      })
      await nextTick()

      const input = document.querySelector('input[type="text"]')
      input.value = 'New Project'
      input.dispatchEvent(new Event('input'))
      await nextTick()

      const text = document.body.textContent.toLowerCase()
      expect(text).not.toContain('required')
      expect(text).not.toContain('exists')

      wrapper.unmount()
    })

    it('disables save button when name is invalid', async () => {
      const wrapper = mountModal({ open: true })
      await nextTick()

      const buttons = Array.from(document.querySelectorAll('button'))
      const saveButton = buttons.find(btn => btn.textContent.includes('Save'))

      expect(saveButton.disabled).toBe(true)

      wrapper.unmount()
    })

    it('enables save button when name is valid', async () => {
      const wrapper = mountModal({ open: true })
      await nextTick()

      const input = document.querySelector('input[type="text"]')
      input.value = 'Valid Name'
      input.dispatchEvent(new Event('input'))
      await nextTick()

      const buttons = Array.from(document.querySelectorAll('button'))
      const saveButton = buttons.find(btn => btn.textContent.includes('Save'))

      expect(saveButton.disabled).toBe(false)

      wrapper.unmount()
    })
  })

  describe('events', () => {
    it('emits save event with project name when save is clicked', async () => {
      const wrapper = mountModal({ open: true })
      await nextTick()

      const input = document.querySelector('input[type="text"]')
      input.value = 'My Project'
      input.dispatchEvent(new Event('input'))
      await nextTick()

      const buttons = Array.from(document.querySelectorAll('button'))
      const saveButton = buttons.find(btn => btn.textContent.includes('Save'))
      saveButton.click()
      await nextTick()

      expect(wrapper.emitted('save')).toBeTruthy()
      expect(wrapper.emitted('save')[0]).toEqual(['My Project'])

      wrapper.unmount()
    })

    it('emits cancel event when cancel is clicked', async () => {
      const wrapper = mountModal({ open: true })
      await nextTick()

      const buttons = Array.from(document.querySelectorAll('button'))
      const cancelButton = buttons.find(btn => btn.textContent.includes('Cancel'))
      cancelButton.click()
      await nextTick()

      expect(wrapper.emitted('cancel')).toBeTruthy()

      wrapper.unmount()
    })

    it('clears input after cancel', async () => {
      const wrapper = mountModal({ open: true })
      await nextTick()

      const input = document.querySelector('input[type="text"]')
      input.value = 'Some Text'
      input.dispatchEvent(new Event('input'))
      await nextTick()

      const buttons = Array.from(document.querySelectorAll('button'))
      const cancelButton = buttons.find(btn => btn.textContent.includes('Cancel'))
      cancelButton.click()
      await nextTick()

      await wrapper.setProps({ open: false })
      await nextTick()
      await wrapper.setProps({ open: true })
      await nextTick()

      const newInput = document.querySelector('input[type="text"]')
      expect(newInput.value).toBe('')

      wrapper.unmount()
    })
  })

  describe('keyboard interactions', () => {
    it('emits cancel when Escape key is pressed', async () => {
      const wrapper = mountModal({ open: true })
      await nextTick()

      const overlay = document.querySelector('.fixed.inset-0')
      overlay.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
      await nextTick()

      expect(wrapper.emitted('cancel')).toBeTruthy()

      wrapper.unmount()
    })

    it('submits form when Enter key is pressed with valid input', async () => {
      const wrapper = mountModal({ open: true })
      await nextTick()

      const input = document.querySelector('input[type="text"]')
      input.value = 'Valid Name'
      input.dispatchEvent(new Event('input'))
      await nextTick()

      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
      await nextTick()

      expect(wrapper.emitted('save')).toBeTruthy()

      wrapper.unmount()
    })

    it('does not submit when Enter is pressed with invalid input', async () => {
      const wrapper = mountModal({ open: true })
      await nextTick()

      const input = document.querySelector('input[type="text"]')
      input.value = ''
      input.dispatchEvent(new Event('input'))
      await nextTick()

      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
      await nextTick()

      expect(wrapper.emitted('save')).toBeFalsy()

      wrapper.unmount()
    })
  })

  describe('accessibility', () => {
    it('has proper ARIA attributes', async () => {
      const wrapper = mountModal({ open: true })
      await nextTick()

      const dialog = document.querySelector('[role="dialog"]')
      expect(dialog).toBeTruthy()
      expect(dialog.getAttribute('aria-labelledby')).toBeTruthy()

      wrapper.unmount()
    })

    it('focuses input when modal opens', async () => {
      const wrapper = mountModal({ open: false })
      await nextTick()

      await wrapper.setProps({ open: true })
      await nextTick()
      await nextTick()

      const input = document.querySelector('input[type="text"]')
      expect(document.activeElement).toBe(input)

      wrapper.unmount()
    })
  })
})
