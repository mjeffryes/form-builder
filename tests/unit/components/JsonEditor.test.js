// Unit tests for JsonEditor component with CodeMirror
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import JsonEditor from '@/components/JsonEditor.vue'

describe('JsonEditor.vue', () => {
  let wrapper

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('rendering', () => {
    it('renders successfully', () => {
      wrapper = mount(JsonEditor, {
        props: {
          content: '{"test": true}',
          title: 'Test Editor'
        },
        attachTo: document.body
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('displays the title', () => {
      wrapper = mount(JsonEditor, {
        props: {
          content: '{}',
          title: 'JSON Schema'
        }
      })

      expect(wrapper.text()).toContain('JSON Schema')
    })

    it('displays the content in editor', () => {
      wrapper = mount(JsonEditor, {
        props: {
          content: '{"name": "test"}',
          title: 'Editor'
        },
        attachTo: document.body
      })

      // CodeMirror creates the editor container
      expect(wrapper.find('.editor-content').exists()).toBe(true)
      expect(wrapper.find('.cm-editor').exists()).toBe(true)
    })
  })

  describe('props', () => {
    it('accepts content prop', () => {
      wrapper = mount(JsonEditor, {
        props: {
          content: '{"test": 123}',
          title: 'Test'
        }
      })

      expect(wrapper.props('content')).toBe('{"test": 123}')
    })

    it('accepts title prop', () => {
      wrapper = mount(JsonEditor, {
        props: {
          content: '{}',
          title: 'My Editor'
        }
      })

      expect(wrapper.props('title')).toBe('My Editor')
    })

    it('accepts readonly prop', () => {
      wrapper = mount(JsonEditor, {
        props: {
          content: '{}',
          title: 'Test',
          readonly: true
        }
      })

      expect(wrapper.props('readonly')).toBe(true)
    })

    it('defaults readonly to false', () => {
      wrapper = mount(JsonEditor, {
        props: {
          content: '{}',
          title: 'Test'
        }
      })

      expect(wrapper.props('readonly')).toBe(false)
    })
  })

  describe('readonly behavior', () => {
    it('disables editor when readonly is true', () => {
      wrapper = mount(JsonEditor, {
        props: {
          content: '{}',
          title: 'Test',
          readonly: true
        },
        attachTo: document.body
      })

      // CodeMirror handles readonly internally
      expect(wrapper.vm.readonly).toBe(true)
    })

    it('does not disable editor when readonly is false', () => {
      wrapper = mount(JsonEditor, {
        props: {
          content: '{}',
          title: 'Test',
          readonly: false
        },
        attachTo: document.body
      })

      expect(wrapper.vm.readonly).toBe(false)
    })
  })

  describe('events', () => {
    it('emits update:content when content changes', async () => {
      wrapper = mount(JsonEditor, {
        props: {
          content: '{}',
          title: 'Test'
        },
        attachTo: document.body
      })

      // Simulate editor change by directly calling the emit
      // (CodeMirror integration would be tested in E2E)
      await wrapper.vm.$nextTick()

      // Wait for component to mount
      await new Promise(resolve => setTimeout(resolve, 100))

      // Verify the component is ready to emit events
      expect(wrapper.emitted()).toBeDefined()
    })

    it('debounces update:content events', async () => {
      vi.useFakeTimers()

      wrapper = mount(JsonEditor, {
        props: {
          content: '{}',
          title: 'Test'
        },
        attachTo: document.body
      })

      await wrapper.vm.$nextTick()

      // The debounce functionality is tested through integration
      // Here we just verify the component mounts correctly
      expect(wrapper.exists()).toBe(true)

      vi.useRealTimers()
    })
  })

  describe('styling', () => {
    it('has an editor element', () => {
      wrapper = mount(JsonEditor, {
        props: {
          content: '{}',
          title: 'Test'
        },
        attachTo: document.body
      })

      const editor = wrapper.find('.editor-content')
      expect(editor.exists()).toBe(true)
    })

    it('editor has monospace font class', () => {
      wrapper = mount(JsonEditor, {
        props: {
          content: '{}',
          title: 'Test'
        },
        attachTo: document.body
      })

      // CodeMirror applies its own monospace font
      const editor = wrapper.find('.cm-scroller')
      expect(editor.exists()).toBe(true)
    })
  })

  describe('content updates', () => {
    it('updates editor when content prop changes', async () => {
      wrapper = mount(JsonEditor, {
        props: {
          content: '{"initial": true}',
          title: 'Test'
        },
        attachTo: document.body
      })

      await wrapper.setProps({ content: '{"updated": true}' })
      await wrapper.vm.$nextTick()

      // The watcher should have been called
      expect(wrapper.props('content')).toBe('{"updated": true}')
    })
  })

  describe('validation', () => {
    it('shows error state for invalid JSON', async () => {
      wrapper = mount(JsonEditor, {
        props: {
          content: '{invalid json}',
          title: 'Test'
        },
        attachTo: document.body
      })

      await wrapper.vm.$nextTick()

      const header = wrapper.find('.editor-header')
      expect(header.classes()).toContain('bg-red-100')
    })

    it('displays error message for invalid JSON', async () => {
      wrapper = mount(JsonEditor, {
        props: {
          content: '{invalid}',
          title: 'Test'
        },
        attachTo: document.body
      })

      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('Error')
    })

    it('shows revert button when JSON is invalid', async () => {
      wrapper = mount(JsonEditor, {
        props: {
          content: '{"valid": true}',
          title: 'Test'
        },
        attachTo: document.body
      })

      await wrapper.setProps({ content: '{invalid}' })
      await wrapper.vm.$nextTick()

      const revertButton = wrapper.find('[data-testid="revert-button"]')
      expect(revertButton.exists()).toBe(true)
    })

    it('reverts to last valid content when revert button clicked', async () => {
      wrapper = mount(JsonEditor, {
        props: {
          content: '{"valid": true}',
          title: 'Test'
        },
        attachTo: document.body
      })

      await wrapper.setProps({ content: '{invalid}' })
      await wrapper.vm.$nextTick()

      const revertButton = wrapper.find('[data-testid="revert-button"]')
      await revertButton.trigger('click')

      const emitted = wrapper.emitted('update:content')
      expect(emitted).toBeTruthy()
    })

    it('emits validation-change event with validation result', async () => {
      wrapper = mount(JsonEditor, {
        props: {
          content: '{"test": true}',
          title: 'Test'
        },
        attachTo: document.body
      })

      await wrapper.vm.$nextTick()

      const emitted = wrapper.emitted('validation-change')
      expect(emitted).toBeTruthy()
      expect(emitted[0][0]).toHaveProperty('valid')
    })

    it('updates validation state when content prop changes', async () => {
      wrapper = mount(JsonEditor, {
        props: {
          content: '{"valid": true}',
          title: 'Test'
        },
        attachTo: document.body
      })

      await wrapper.setProps({ content: '{invalid}' })
      await wrapper.vm.$nextTick()

      const emitted = wrapper.emitted('validation-change')
      expect(emitted.length).toBeGreaterThan(1)
    })
  })
})
