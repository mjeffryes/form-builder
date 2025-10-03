// Unit tests for JsonValidator
import { describe, it, expect } from 'vitest'
import { validateJson } from '@/services/JsonValidator'

describe('JsonValidator', () => {
  describe('valid JSON', () => {
    it('validates simple object', () => {
      const result = validateJson('{"name": "test"}')

      expect(result.valid).toBe(true)
      expect(result.parsed).toEqual({ name: 'test' })
      expect(result.error).toBeUndefined()
    })

    it('validates array', () => {
      const result = validateJson('[1, 2, 3]')

      expect(result.valid).toBe(true)
      expect(result.parsed).toEqual([1, 2, 3])
    })

    it('validates string primitive', () => {
      const result = validateJson('"hello"')

      expect(result.valid).toBe(true)
      expect(result.parsed).toBe('hello')
    })

    it('validates number primitive', () => {
      const result = validateJson('42')

      expect(result.valid).toBe(true)
      expect(result.parsed).toBe(42)
    })

    it('validates boolean primitive', () => {
      const result = validateJson('true')

      expect(result.valid).toBe(true)
      expect(result.parsed).toBe(true)
    })

    it('validates null', () => {
      const result = validateJson('null')

      expect(result.valid).toBe(true)
      expect(result.parsed).toBe(null)
    })

    it('validates nested objects', () => {
      const json = '{"user": {"name": "John", "age": 30}}'
      const result = validateJson(json)

      expect(result.valid).toBe(true)
      expect(result.parsed).toEqual({
        user: { name: 'John', age: 30 }
      })
    })

    it('validates complex nested structure', () => {
      const json = `{
        "schema": {
          "type": "object",
          "properties": {
            "field1": { "type": "string" }
          }
        }
      }`
      const result = validateJson(json)

      expect(result.valid).toBe(true)
      expect(result.parsed.schema.type).toBe('object')
    })
  })

  describe('invalid JSON', () => {
    it('detects malformed object', () => {
      const result = validateJson('{invalid json}')

      expect(result.valid).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.parsed).toBeUndefined()
    })

    it('detects trailing comma', () => {
      const result = validateJson('{"name": "test",}')

      expect(result.valid).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('detects single quotes', () => {
      const result = validateJson("{'name': 'test'}")

      expect(result.valid).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('detects unclosed bracket', () => {
      const result = validateJson('{"name": "test"')

      expect(result.valid).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('detects unclosed array', () => {
      const result = validateJson('[1, 2, 3')

      expect(result.valid).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('detects invalid property name', () => {
      const result = validateJson('{name: "test"}')

      expect(result.valid).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('provides helpful error message', () => {
      const result = validateJson('{invalid}')

      expect(result.error).toBeTruthy()
      expect(typeof result.error).toBe('string')
      expect(result.error.length).toBeGreaterThan(0)
    })
  })

  describe('edge cases', () => {
    it('handles empty string', () => {
      const result = validateJson('')

      expect(result.valid).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('handles whitespace only', () => {
      const result = validateJson('   ')

      expect(result.valid).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('handles undefined input', () => {
      const result = validateJson(undefined)

      expect(result.valid).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('handles null input', () => {
      const result = validateJson(null)

      expect(result.valid).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('validates object with whitespace', () => {
      const result = validateJson('  {"name": "test"}  ')

      expect(result.valid).toBe(true)
      expect(result.parsed).toEqual({ name: 'test' })
    })

    it('validates multi-line JSON', () => {
      const json = `{
        "name": "test",
        "value": 123
      }`
      const result = validateJson(json)

      expect(result.valid).toBe(true)
    })

    it('handles very large JSON', () => {
      const largeObject = { data: 'x'.repeat(10000) }
      const json = JSON.stringify(largeObject)
      const result = validateJson(json)

      expect(result.valid).toBe(true)
      expect(result.parsed.data.length).toBe(10000)
    })
  })

  describe('ValidationResult structure', () => {
    it('returns object with valid property', () => {
      const result = validateJson('{}')
      expect(result).toHaveProperty('valid')
    })

    it('includes parsed data when valid', () => {
      const result = validateJson('{"test": true}')
      expect(result).toHaveProperty('parsed')
      expect(result.valid).toBe(true)
    })

    it('includes error message when invalid', () => {
      const result = validateJson('{invalid}')
      expect(result).toHaveProperty('error')
      expect(result.valid).toBe(false)
    })

    it('does not include parsed when invalid', () => {
      const result = validateJson('{invalid}')
      expect(result.parsed).toBeUndefined()
    })
  })
})
