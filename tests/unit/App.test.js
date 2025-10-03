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
})
