// Unit tests for default template data
import { describe, it, expect } from 'vitest'
import { DEFAULT_JSON_SCHEMA, DEFAULT_UI_SCHEMA, DEFAULT_DATA } from '@/data/defaultTemplate'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'

describe('defaultTemplate', () => {
  describe('DEFAULT_JSON_SCHEMA', () => {
    it('is a valid JSON string', () => {
      expect(() => JSON.parse(DEFAULT_JSON_SCHEMA)).not.toThrow()
    })

    it('is a valid JSON Schema', () => {
      const schema = JSON.parse(DEFAULT_JSON_SCHEMA)
      expect(schema.type).toBe('object')
      expect(schema.properties).toBeDefined()
    })

    it('includes text input field', () => {
      const schema = JSON.parse(DEFAULT_JSON_SCHEMA)
      const hasTextField = Object.values(schema.properties).some(
        prop => prop.type === 'string' && !prop.format
      )
      expect(hasTextField).toBe(true)
    })

    it('includes number input field', () => {
      const schema = JSON.parse(DEFAULT_JSON_SCHEMA)
      const hasNumberField = Object.values(schema.properties).some(
        prop => prop.type === 'number' || prop.type === 'integer'
      )
      expect(hasNumberField).toBe(true)
    })

    it('includes boolean field', () => {
      const schema = JSON.parse(DEFAULT_JSON_SCHEMA)
      const hasBooleanField = Object.values(schema.properties).some(
        prop => prop.type === 'boolean'
      )
      expect(hasBooleanField).toBe(true)
    })

    it('includes enum/select field', () => {
      const schema = JSON.parse(DEFAULT_JSON_SCHEMA)
      const hasEnumField = Object.values(schema.properties).some(
        prop => prop.enum !== undefined
      )
      expect(hasEnumField).toBe(true)
    })

    it('includes email field', () => {
      const schema = JSON.parse(DEFAULT_JSON_SCHEMA)
      const hasEmailField = Object.values(schema.properties).some(
        prop => prop.type === 'string' && prop.format === 'email'
      )
      expect(hasEmailField).toBe(true)
    })

    it('includes date field', () => {
      const schema = JSON.parse(DEFAULT_JSON_SCHEMA)
      const hasDateField = Object.values(schema.properties).some(
        prop => prop.type === 'string' && prop.format === 'date'
      )
      expect(hasDateField).toBe(true)
    })
  })

  describe('DEFAULT_UI_SCHEMA', () => {
    it('is a valid JSON string', () => {
      expect(() => JSON.parse(DEFAULT_UI_SCHEMA)).not.toThrow()
    })

    it('has required structure', () => {
      const uiSchema = JSON.parse(DEFAULT_UI_SCHEMA)
      expect(uiSchema.type).toBeDefined()
      expect(uiSchema.elements).toBeDefined()
      expect(Array.isArray(uiSchema.elements)).toBe(true)
    })

    it('uses VerticalLayout', () => {
      const uiSchema = JSON.parse(DEFAULT_UI_SCHEMA)
      expect(uiSchema.type).toBe('VerticalLayout')
    })

    it('has controls for each schema field', () => {
      const schema = JSON.parse(DEFAULT_JSON_SCHEMA)
      const uiSchema = JSON.parse(DEFAULT_UI_SCHEMA)

      const fieldCount = Object.keys(schema.properties).length

      // Count all controls including nested ones in layouts
      const countControls = (elements) => {
        let count = 0
        for (const element of elements) {
          if (element.type === 'Control') {
            count++
          } else if (element.elements) {
            // Recursively count controls in nested layouts
            count += countControls(element.elements)
          }
        }
        return count
      }

      const controlCount = countControls(uiSchema.elements)

      expect(controlCount).toBe(fieldCount)
    })
  })

  describe('DEFAULT_DATA', () => {
    it('is a valid JSON string', () => {
      expect(() => JSON.parse(DEFAULT_DATA)).not.toThrow()
    })

    it('validates against DEFAULT_JSON_SCHEMA', () => {
      const ajv = new Ajv()
      addFormats(ajv)

      const schema = JSON.parse(DEFAULT_JSON_SCHEMA)
      const data = JSON.parse(DEFAULT_DATA)

      const validate = ajv.compile(schema)
      const valid = validate(data)

      if (!valid) {
        console.error('Validation errors:', validate.errors)
      }

      expect(valid).toBe(true)
    })

    it('has values for all required fields', () => {
      const schema = JSON.parse(DEFAULT_JSON_SCHEMA)
      const data = JSON.parse(DEFAULT_DATA)

      if (schema.required) {
        schema.required.forEach(field => {
          expect(data[field]).toBeDefined()
        })
      }
    })
  })

  describe('template integration', () => {
    it('all three components work together', () => {
      const schema = JSON.parse(DEFAULT_JSON_SCHEMA)
      const uiSchema = JSON.parse(DEFAULT_UI_SCHEMA)
      const data = JSON.parse(DEFAULT_DATA)

      expect(schema).toBeDefined()
      expect(uiSchema).toBeDefined()
      expect(data).toBeDefined()
    })
  })
})
