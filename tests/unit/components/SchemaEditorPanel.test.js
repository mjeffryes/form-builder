// Unit tests for SchemaEditorPanel component
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SchemaEditorPanel from '@/components/SchemaEditorPanel.vue'

describe('SchemaEditorPanel.vue', () => {
  const defaultProps = {
    jsonSchema: '{"type": "object"}',
    uiSchema: '{"type": "VerticalLayout"}',
    data: '{}'
  }

  describe('rendering', () => {
    it('renders successfully', () => {
      const wrapper = mount(SchemaEditorPanel, {
        props: defaultProps
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('renders all three editors', () => {
      const wrapper = mount(SchemaEditorPanel, {
        props: defaultProps
      })

      const editors = wrapper.findAllComponents({ name: 'JsonEditor' })
      expect(editors).toHaveLength(3)
    })

    it('has JSON Schema editor', () => {
      const wrapper = mount(SchemaEditorPanel, {
        props: defaultProps
      })

      expect(wrapper.text()).toContain('JSON Schema')
    })

    it('has UI Schema editor', () => {
      const wrapper = mount(SchemaEditorPanel, {
        props: defaultProps
      })

      expect(wrapper.text()).toContain('UI Schema')
    })

    it('has Data editor', () => {
      const wrapper = mount(SchemaEditorPanel, {
        props: defaultProps
      })

      expect(wrapper.text()).toContain('Data')
    })
  })

  describe('props', () => {
    it('passes jsonSchema to JSON Schema editor', () => {
      const wrapper = mount(SchemaEditorPanel, {
        props: defaultProps
      })

      const editors = wrapper.findAllComponents({ name: 'JsonEditor' })
      expect(editors[0].props('content')).toBe(defaultProps.jsonSchema)
    })

    it('passes uiSchema to UI Schema editor', () => {
      const wrapper = mount(SchemaEditorPanel, {
        props: defaultProps
      })

      const editors = wrapper.findAllComponents({ name: 'JsonEditor' })
      expect(editors[1].props('content')).toBe(defaultProps.uiSchema)
    })

    it('passes data to Data editor', () => {
      const wrapper = mount(SchemaEditorPanel, {
        props: defaultProps
      })

      const editors = wrapper.findAllComponents({ name: 'JsonEditor' })
      expect(editors[2].props('content')).toBe(defaultProps.data)
    })
  })

  describe('events', () => {
    it('emits update:jsonSchema when JSON Schema changes', async () => {
      const wrapper = mount(SchemaEditorPanel, {
        props: defaultProps
      })

      const editors = wrapper.findAllComponents({ name: 'JsonEditor' })
      await editors[0].vm.$emit('update:content', '{"updated": true}')

      const emitted = wrapper.emitted('update:jsonSchema')
      expect(emitted).toBeTruthy()
      expect(emitted[0]).toEqual(['{"updated": true}'])
    })

    it('emits update:uiSchema when UI Schema changes', async () => {
      const wrapper = mount(SchemaEditorPanel, {
        props: defaultProps
      })

      const editors = wrapper.findAllComponents({ name: 'JsonEditor' })
      await editors[1].vm.$emit('update:content', '{"updated": true}')

      const emitted = wrapper.emitted('update:uiSchema')
      expect(emitted).toBeTruthy()
      expect(emitted[0]).toEqual(['{"updated": true}'])
    })

    it('emits update:data when Data changes', async () => {
      const wrapper = mount(SchemaEditorPanel, {
        props: defaultProps
      })

      const editors = wrapper.findAllComponents({ name: 'JsonEditor' })
      await editors[2].vm.$emit('update:content', '{"updated": true}')

      const emitted = wrapper.emitted('update:data')
      expect(emitted).toBeTruthy()
      expect(emitted[0]).toEqual(['{"updated": true}'])
    })
  })

  describe('layout', () => {
    it('displays editors in vertical stack', () => {
      const wrapper = mount(SchemaEditorPanel, {
        props: defaultProps
      })

      const panel = wrapper.find('.schema-editor-panel')
      expect(panel.classes()).toContain('flex-col')
    })
  })
})
