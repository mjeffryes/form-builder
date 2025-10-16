// Tests for GenerateSchemaModal - confirms schema generation from pasted data
import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import GenerateSchemaModal from '@/components/GenerateSchemaModal.vue';

describe('GenerateSchemaModal.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(GenerateSchemaModal, {
      props: {
        open: true
      }
    });
  });

  describe('rendering', () => {
    it('renders when open is true', () => {
      expect(wrapper.exists()).toBe(true);
      expect(wrapper.isVisible()).toBe(true);
    });

    it('does not render when open is false', () => {
      wrapper = mount(GenerateSchemaModal, {
        props: {
          open: false
        }
      });

      expect(wrapper.find('.modal-overlay').exists()).toBe(false);
    });

    it('displays warning message', () => {
      const text = wrapper.text();
      expect(text).toContain('replace');
      expect(text.toLowerCase()).toContain('schema');
    });

    it('displays Replace button', () => {
      const replaceButton = wrapper.find('button[data-test="replace-button"]');
      expect(replaceButton.exists()).toBe(true);
      expect(replaceButton.text()).toContain('Replace');
    });

    it('displays Cancel button', () => {
      const cancelButton = wrapper.find('button[data-test="cancel-button"]');
      expect(cancelButton.exists()).toBe(true);
      expect(cancelButton.text()).toContain('Cancel');
    });
  });

  describe('events', () => {
    it('emits confirm event when Replace button is clicked', async () => {
      const replaceButton = wrapper.find('button[data-test="replace-button"]');
      await replaceButton.trigger('click');

      expect(wrapper.emitted('confirm')).toBeTruthy();
      expect(wrapper.emitted('confirm')).toHaveLength(1);
    });

    it('emits cancel event when Cancel button is clicked', async () => {
      const cancelButton = wrapper.find('button[data-test="cancel-button"]');
      await cancelButton.trigger('click');

      expect(wrapper.emitted('cancel')).toBeTruthy();
      expect(wrapper.emitted('cancel')).toHaveLength(1);
    });

    it('emits cancel event when clicking overlay', async () => {
      const overlay = wrapper.find('.fixed.inset-0');
      await overlay.trigger('click');

      expect(wrapper.emitted('cancel')).toBeTruthy();
    });

    it('does not emit cancel when clicking modal content', async () => {
      const modalContent = wrapper.find('.bg-white');
      await modalContent.trigger('click');

      expect(wrapper.emitted('cancel')).toBeFalsy();
    });
  });

  describe('keyboard interactions', () => {
    it('emits cancel event on Escape key', async () => {
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(event);
      await wrapper.vm.$nextTick();

      expect(wrapper.emitted('cancel')).toBeTruthy();
    });

    it('emits confirm event on Enter key', async () => {
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      document.dispatchEvent(event);
      await wrapper.vm.$nextTick();

      expect(wrapper.emitted('confirm')).toBeTruthy();
    });
  });

  describe('styling', () => {
    it('applies danger/warning styling to Replace button', () => {
      const replaceButton = wrapper.find('button[data-test="replace-button"]');
      const classes = replaceButton.classes().join(' ');

      // Should have some indication of danger/warning
      expect(classes).toMatch(/red|danger|warning/i);
    });

    it('has modal overlay with backdrop', () => {
      const overlay = wrapper.find('.fixed.inset-0');
      expect(overlay.exists()).toBe(true);
    });

    it('has centered modal content', () => {
      const modalContent = wrapper.find('.bg-white');
      expect(modalContent.exists()).toBe(true);
    });
  });
});
