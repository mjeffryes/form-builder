// Unit tests for JsonEditor component
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import JsonEditor from '@/components/JsonEditor.vue'

describe('JsonEditor.vue', () => {
  describe('rendering', () => {
    it('renders successfully', () => {
      const wrapper = mount(JsonEditor, {
        props: {
          content: '{"test": true}',
          title: 'Test Editor'
        }
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('displays the title', () => {
      const wrapper = mount(JsonEditor, {
        props: {
          content: '{}',
          title: 'JSON Schema'
        }
      })

      expect(wrapper.text()).toContain('JSON Schema')
    })

    it('displays the content in textarea', () => {
      const content = '{"name": "test"}'
      const wrapper = mount(JsonEditor, {
        props: {
          content,
          title: 'Editor'
        }
      })

      const textarea = wrapper.find('textarea')
      expect(textarea.element.value).toBe(content)
    })
  })

  describe('props', () => {
    it('accepts content prop', () => {
      const wrapper = mount(JsonEditor, {
        props: {
          content: '{"test": 123}',
          title: 'Test'
        }
      })

      expect(wrapper.props('content')).toBe('{"test": 123}')
    })

    it('accepts title prop', () => {
      const wrapper = mount(JsonEditor, {
        props: {
          content: '{}',
          title: 'My Editor'
        }
      })

      expect(wrapper.props('title')).toBe('My Editor')
    })

    it('accepts readonly prop', () => {
      const wrapper = mount(JsonEditor, {
        props: {
          content: '{}',
          title: 'Test',
          readonly: true
        }
      })

      expect(wrapper.props('readonly')).toBe(true)
    })

    it('defaults readonly to false', () => {
      const wrapper = mount(JsonEditor, {
        props: {
          content: '{}',
          title: 'Test'
        }
      })

      expect(wrapper.props('readonly')).toBe(false)
    })
  })

  describe('readonly behavior', () => {
    it('disables textarea when readonly is true', () => {
      const wrapper = mount(JsonEditor, {
        props: {
          content: '{}',
          title: 'Test',
          readonly: true
        }
      })

      const textarea = wrapper.find('textarea')
      expect(textarea.attributes('readonly')).toBeDefined()
    })

    it('does not disable textarea when readonly is false', () => {
      const wrapper = mount(JsonEditor, {
        props: {
          content: '{}',
          title: 'Test',
          readonly: false
        }
      })

      const textarea = wrapper.find('textarea')
      expect(textarea.attributes('readonly')).toBeUndefined()
    })
  })

  describe('events', () => {
    it('emits update:content when content changes', async () => {
      const wrapper = mount(JsonEditor, {
        props: {
          content: '{}',
          title: 'Test'
        }
      })

      const textarea = wrapper.find('textarea')
      await textarea.setValue('{"updated": true}')

      // Wait for debounce
      await new Promise(resolve => setTimeout(resolve, 350))

      const emitted = wrapper.emitted('update:content')
      expect(emitted).toBeTruthy()
      expect(emitted[0]).toEqual(['{"updated": true}'])
    })

    it('debounces update:content events', async () => {
      vi.useFakeTimers()

      const wrapper = mount(JsonEditor, {
        props: {
          content: '{}',
          title: 'Test'
        }
      })

      const textarea = wrapper.find('textarea')

      // Make multiple rapid changes
      await textarea.setValue('{"a": 1}')
      await textarea.setValue('{"a": 2}')
      await textarea.setValue('{"a": 3}')

      // Should not have emitted yet
      expect(wrapper.emitted('update:content')).toBeFalsy()

      // Fast forward past debounce time
      vi.advanceTimersByTime(300)

      // Should have emitted once with final value
      const emitted = wrapper.emitted('update:content')
      expect(emitted).toBeTruthy()
      expect(emitted.length).toBe(1)

      vi.useRealTimers()
    })
  })

  describe('styling', () => {
    it('has a textarea element', () => {
      const wrapper = mount(JsonEditor, {
        props: {
          content: '{}',
          title: 'Test'
        }
      })

      const textarea = wrapper.find('textarea')
      expect(textarea.exists()).toBe(true)
    })

    it('textarea has monospace font class', () => {
      const wrapper = mount(JsonEditor, {
        props: {
          content: '{}',
          title: 'Test'
        }
      })

      const textarea = wrapper.find('textarea')
      expect(textarea.classes()).toContain('font-mono')
    })
  })

  describe('content updates', () => {
    it('updates textarea when content prop changes', async () => {
      const wrapper = mount(JsonEditor, {
        props: {
          content: '{"initial": true}',
          title: 'Test'
        }
      })

      await wrapper.setProps({ content: '{"updated": true}' })

      const textarea = wrapper.find('textarea')
      expect(textarea.element.value).toBe('{"updated": true}')
    })
  })

  describe('validation', () => {
    it('validates content and shows no error for valid JSON', async () => {
      const wrapper = mount(JsonEditor, {
        props: {
          content: '{"valid": true}',
          title: 'Test'
        }
      })

      const header = wrapper.find('.editor-header')
      expect(header.classes()).not.toContain('bg-red-100')
    })

    it('shows error state for invalid JSON', async () => {
      const wrapper = mount(JsonEditor, {
        props: {
          content: '{invalid}',
          title: 'Test'
        }
      })

      const header = wrapper.find('.editor-header')
      expect(header.classes()).toContain('bg-red-100')
    })

    it('displays error message for invalid JSON', async () => {
      const wrapper = mount(JsonEditor, {
        props: {
          content: '{bad json}',
          title: 'Test'
        }
      })

      expect(wrapper.text()).toContain('Error')
    })

    it('shows revert button when JSON is invalid', async () => {
      const wrapper = mount(JsonEditor, {
        props: {
          content: '{"valid": true}',
          title: 'Test'
        }
      })

      // Initially no revert button
      expect(wrapper.find('[data-testid="revert-button"]').exists()).toBe(false)

      // Make content invalid
      const textarea = wrapper.find('textarea')
      await textarea.setValue('{invalid}')
      await wrapper.vm.$nextTick()

      // Wait for validation
      await new Promise(resolve => setTimeout(resolve, 50))

      // Should show revert button
      expect(wrapper.find('[data-testid="revert-button"]').exists()).toBe(true)
    })

    it('reverts to last valid content when revert button clicked', async () => {
      const wrapper = mount(JsonEditor, {
        props: {
          content: '{"valid": true}',
          title: 'Test'
        }
      })

      const textarea = wrapper.find('textarea')

      // Make content invalid
      await textarea.setValue('{invalid}')
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 50))

      // Click revert button
      const revertButton = wrapper.find('[data-testid="revert-button"]')
      await revertButton.trigger('click')

      // Should revert to original
      expect(textarea.element.value).toBe('{"valid": true}')
    })

    it('emits validation-change event with validation result', async () => {
      const wrapper = mount(JsonEditor, {
        props: {
          content: '{"test": true}',
          title: 'Test'
        }
      })

      const textarea = wrapper.find('textarea')
      await textarea.setValue('{invalid}')

      // Wait for validation
      await new Promise(resolve => setTimeout(resolve, 50))

      const emitted = wrapper.emitted('validation-change')
      expect(emitted).toBeTruthy()
      expect(emitted[emitted.length - 1][0].valid).toBe(false)
    })

    it('updates validation state when content prop changes', async () => {
      const wrapper = mount(JsonEditor, {
        props: {
          content: '{"valid": true}',
          title: 'Test'
        }
      })

      // Change to invalid content
      await wrapper.setProps({ content: '{invalid}' })
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 50))

      const header = wrapper.find('.editor-header')
      expect(header.classes()).toContain('bg-red-100')
    })
  })
})
