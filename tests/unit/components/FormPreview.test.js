// Unit tests for FormPreview component
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import FormPreview from '@/components/FormPreview.vue'

describe('FormPreview.vue', () => {
  const validSchema = JSON.stringify({
    type: 'object',
    properties: {
      name: { type: 'string' }
    }
  })

  const validUiSchema = JSON.stringify({
    type: 'VerticalLayout',
    elements: [
      { type: 'Control', scope: '#/properties/name' }
    ]
  })

  const validData = JSON.stringify({ name: 'Test' })

  describe('rendering', () => {
    it('renders successfully with valid props', () => {
      const wrapper = mount(FormPreview, {
        props: {
          jsonSchema: validSchema,
          uiSchema: validUiSchema,
          data: validData
        }
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('parses JSON string props', () => {
      const wrapper = mount(FormPreview, {
        props: {
          jsonSchema: validSchema,
          uiSchema: validUiSchema,
          data: validData
        }
      })

      // Component should render without errors
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('frozen state', () => {
    it('shows frozen overlay when frozen prop is true', () => {
      const wrapper = mount(FormPreview, {
        props: {
          jsonSchema: validSchema,
          uiSchema: validUiSchema,
          data: validData,
          frozen: true
        }
      })

      const overlay = wrapper.find('[data-testid="frozen-overlay"]')
      expect(overlay.exists()).toBe(true)
    })

    it('does not show frozen overlay when frozen prop is false', () => {
      const wrapper = mount(FormPreview, {
        props: {
          jsonSchema: validSchema,
          uiSchema: validUiSchema,
          data: validData,
          frozen: false
        }
      })

      const overlay = wrapper.find('[data-testid="frozen-overlay"]')
      expect(overlay.exists()).toBe(false)
    })
  })

  describe('error handling', () => {
    it('maintains last valid state when schema cannot be parsed', () => {
      const wrapper = mount(FormPreview, {
        props: {
          jsonSchema: validSchema,
          uiSchema: validUiSchema,
          data: validData
        }
      })

      // Should render initially
      expect(wrapper.find('.jsonforms-container').exists()).toBe(true)

      // Update with invalid schema
      wrapper.setProps({ jsonSchema: '{invalid json}' })

      // Should still show last valid state (not error)
      expect(wrapper.find('.jsonforms-container').exists()).toBe(true)
    })

    it('maintains last valid state when uiSchema cannot be parsed', () => {
      const wrapper = mount(FormPreview, {
        props: {
          jsonSchema: validSchema,
          uiSchema: validUiSchema,
          data: validData
        }
      })

      expect(wrapper.find('.jsonforms-container').exists()).toBe(true)

      wrapper.setProps({ uiSchema: '{invalid}' })

      expect(wrapper.find('.jsonforms-container').exists()).toBe(true)
    })

    it('maintains last valid state when data cannot be parsed', () => {
      const wrapper = mount(FormPreview, {
        props: {
          jsonSchema: validSchema,
          uiSchema: validUiSchema,
          data: validData
        }
      })

      expect(wrapper.find('.jsonforms-container').exists()).toBe(true)

      wrapper.setProps({ data: '{bad data}' })

      expect(wrapper.find('.jsonforms-container').exists()).toBe(true)
    })

    it('handles empty schema gracefully', () => {
      const wrapper = mount(FormPreview, {
        props: {
          jsonSchema: '{}',
          uiSchema: '{}',
          data: '{}'
        }
      })

      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('props', () => {
    it('accepts jsonSchema prop', () => {
      const wrapper = mount(FormPreview, {
        props: {
          jsonSchema: validSchema,
          uiSchema: validUiSchema,
          data: validData
        }
      })

      expect(wrapper.props('jsonSchema')).toBe(validSchema)
    })

    it('accepts uiSchema prop', () => {
      const wrapper = mount(FormPreview, {
        props: {
          jsonSchema: validSchema,
          uiSchema: validUiSchema,
          data: validData
        }
      })

      expect(wrapper.props('uiSchema')).toBe(validUiSchema)
    })

    it('accepts data prop', () => {
      const wrapper = mount(FormPreview, {
        props: {
          jsonSchema: validSchema,
          uiSchema: validUiSchema,
          data: validData
        }
      })

      expect(wrapper.props('data')).toBe(validData)
    })

    it('accepts frozen prop', () => {
      const wrapper = mount(FormPreview, {
        props: {
          jsonSchema: validSchema,
          uiSchema: validUiSchema,
          data: validData,
          frozen: true
        }
      })

      expect(wrapper.props('frozen')).toBe(true)
    })
  })
})
