// Unit tests for StorageService
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { StorageService } from '@/services/StorageService'

describe('StorageService', () => {
  let storage

  beforeEach(() => {
    storage = new StorageService()
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('set and get', () => {
    it('stores and retrieves a simple object', () => {
      const data = { name: 'test', value: 123 }
      storage.set('test-key', data)
      const retrieved = storage.get('test-key')
      expect(retrieved).toEqual(data)
    })

    it('stores and retrieves a string', () => {
      storage.set('string-key', 'hello world')
      expect(storage.get('string-key')).toBe('hello world')
    })

    it('stores and retrieves a number', () => {
      storage.set('number-key', 42)
      expect(storage.get('number-key')).toBe(42)
    })

    it('stores and retrieves a boolean', () => {
      storage.set('bool-key', true)
      expect(storage.get('bool-key')).toBe(true)
    })

    it('stores and retrieves an array', () => {
      const arr = [1, 2, 3, 'test']
      storage.set('array-key', arr)
      expect(storage.get('array-key')).toEqual(arr)
    })

    it('stores and retrieves nested objects', () => {
      const nested = {
        level1: {
          level2: {
            level3: 'deep value'
          }
        }
      }
      storage.set('nested-key', nested)
      expect(storage.get('nested-key')).toEqual(nested)
    })

    it('returns null for non-existent key', () => {
      expect(storage.get('non-existent')).toBeNull()
    })

    it('applies namespace prefix to keys', () => {
      storage.set('test', 'value')
      expect(localStorage.getItem('form-builder:test')).toBeTruthy()
    })
  })

  describe('error handling', () => {
    it('returns null for malformed JSON', () => {
      localStorage.setItem('form-builder:bad', '{invalid json}')
      expect(storage.get('bad')).toBeNull()
    })

    it('handles null values gracefully', () => {
      storage.set('null-key', null)
      expect(storage.get('null-key')).toBeNull()
    })

    it('handles undefined by storing null', () => {
      storage.set('undefined-key', undefined)
      expect(storage.get('undefined-key')).toBeNull()
    })
  })

  describe('remove', () => {
    it('removes a key', () => {
      storage.set('temp', 'value')
      expect(storage.get('temp')).toBe('value')
      storage.remove('temp')
      expect(storage.get('temp')).toBeNull()
    })

    it('does not throw when removing non-existent key', () => {
      expect(() => storage.remove('non-existent')).not.toThrow()
    })
  })

  describe('clear', () => {
    it('clears all namespaced keys', () => {
      storage.set('key1', 'value1')
      storage.set('key2', 'value2')
      storage.set('key3', 'value3')

      storage.clear()

      expect(storage.get('key1')).toBeNull()
      expect(storage.get('key2')).toBeNull()
      expect(storage.get('key3')).toBeNull()
    })

    it('does not clear non-namespaced keys', () => {
      localStorage.setItem('other-app:key', 'value')
      storage.set('our-key', 'value')

      storage.clear()

      expect(storage.get('our-key')).toBeNull()
      expect(localStorage.getItem('other-app:key')).toBe('value')
    })
  })

  describe('has', () => {
    it('returns true for existing key', () => {
      storage.set('exists', 'value')
      expect(storage.has('exists')).toBe(true)
    })

    it('returns false for non-existent key', () => {
      expect(storage.has('does-not-exist')).toBe(false)
    })

    it('returns true even if value is null', () => {
      storage.set('null-value', null)
      expect(storage.has('null-value')).toBe(true)
    })
  })
})
