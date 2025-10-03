// Unit tests for main App component
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '@/App.vue'

describe('App.vue', () => {
  it('renders successfully', () => {
    const wrapper = mount(App)
    expect(wrapper.exists()).toBe(true)
  })

  it('displays the app title "Form Builder"', () => {
    const wrapper = mount(App)
    expect(wrapper.text()).toContain('Form Builder')
  })

  it('has a header element', () => {
    const wrapper = mount(App)
    const header = wrapper.find('header')
    expect(header.exists()).toBe(true)
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

    it('displays placeholder text in right panel', () => {
      const wrapper = mount(App)
      const rightPanel = wrapper.find('[data-testid="right-panel"]')
      expect(rightPanel.text()).toContain('Preview')
    })
  })
})
