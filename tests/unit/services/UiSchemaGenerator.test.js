// Tests for UiSchemaGenerator - generates UI Schema from JSON Schema
import { describe, it, expect } from 'vitest';
import { generateUiSchema } from '@/services/UiSchemaGenerator';

describe('UiSchemaGenerator', () => {
  describe('basic structure', () => {
    it('should generate vertical layout for simple schema', () => {
      const jsonSchema = {
        type: 'object',
        properties: {
          name: { type: 'string' }
        }
      };
      const uiSchema = generateUiSchema(jsonSchema);

      expect(uiSchema.type).toBe('VerticalLayout');
      expect(uiSchema.elements).toBeDefined();
      expect(Array.isArray(uiSchema.elements)).toBe(true);
    });

    it('should generate control for each property', () => {
      const jsonSchema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' }
        }
      };
      const uiSchema = generateUiSchema(jsonSchema);

      expect(uiSchema.elements).toHaveLength(2);
      expect(uiSchema.elements[0].type).toBe('Control');
      expect(uiSchema.elements[1].type).toBe('Control');
    });

    it('should use correct scope for each control', () => {
      const jsonSchema = {
        type: 'object',
        properties: {
          firstName: { type: 'string' },
          lastName: { type: 'string' }
        }
      };
      const uiSchema = generateUiSchema(jsonSchema);

      expect(uiSchema.elements[0].scope).toBe('#/properties/firstName');
      expect(uiSchema.elements[1].scope).toBe('#/properties/lastName');
    });

    it('should handle empty object schema', () => {
      const jsonSchema = {
        type: 'object',
        properties: {}
      };
      const uiSchema = generateUiSchema(jsonSchema);

      expect(uiSchema.type).toBe('VerticalLayout');
      expect(uiSchema.elements).toHaveLength(0);
    });
  });

  describe('format-based controls', () => {
    it('should not add special options for email format', () => {
      const jsonSchema = {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' }
        }
      };
      const uiSchema = generateUiSchema(jsonSchema);

      // JSONForms handles email format automatically
      expect(uiSchema.elements[0].type).toBe('Control');
      expect(uiSchema.elements[0].scope).toBe('#/properties/email');
    });

    it('should not add special options for date format', () => {
      const jsonSchema = {
        type: 'object',
        properties: {
          birthdate: { type: 'string', format: 'date' }
        }
      };
      const uiSchema = generateUiSchema(jsonSchema);

      // JSONForms handles date format automatically
      expect(uiSchema.elements[0].type).toBe('Control');
      expect(uiSchema.elements[0].scope).toBe('#/properties/birthdate');
    });

    it('should not add special options for date-time format', () => {
      const jsonSchema = {
        type: 'object',
        properties: {
          createdAt: { type: 'string', format: 'date-time' }
        }
      };
      const uiSchema = generateUiSchema(jsonSchema);

      // JSONForms handles date-time format automatically
      expect(uiSchema.elements[0].type).toBe('Control');
      expect(uiSchema.elements[0].scope).toBe('#/properties/createdAt');
    });
  });

  describe('type-based controls', () => {
    it('should generate control for string type', () => {
      const jsonSchema = {
        type: 'object',
        properties: {
          name: { type: 'string' }
        }
      };
      const uiSchema = generateUiSchema(jsonSchema);

      expect(uiSchema.elements[0].type).toBe('Control');
    });

    it('should generate control for number type', () => {
      const jsonSchema = {
        type: 'object',
        properties: {
          age: { type: 'number' }
        }
      };
      const uiSchema = generateUiSchema(jsonSchema);

      expect(uiSchema.elements[0].type).toBe('Control');
    });

    it('should generate control for boolean type', () => {
      const jsonSchema = {
        type: 'object',
        properties: {
          active: { type: 'boolean' }
        }
      };
      const uiSchema = generateUiSchema(jsonSchema);

      expect(uiSchema.elements[0].type).toBe('Control');
    });
  });

  describe('enum handling', () => {
    it('should generate control for enum', () => {
      const jsonSchema = {
        type: 'object',
        properties: {
          country: {
            type: 'string',
            enum: ['USA', 'Canada', 'Mexico']
          }
        }
      };
      const uiSchema = generateUiSchema(jsonSchema);

      // JSONForms handles enums automatically
      expect(uiSchema.elements[0].type).toBe('Control');
      expect(uiSchema.elements[0].scope).toBe('#/properties/country');
    });
  });

  describe('nested objects', () => {
    it('should generate nested controls for nested objects', () => {
      const jsonSchema = {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              age: { type: 'number' }
            }
          }
        }
      };
      const uiSchema = generateUiSchema(jsonSchema);

      expect(uiSchema.elements[0].type).toBe('Control');
      expect(uiSchema.elements[0].scope).toBe('#/properties/user');
    });
  });

  describe('arrays', () => {
    it('should generate control for array of primitives', () => {
      const jsonSchema = {
        type: 'object',
        properties: {
          tags: {
            type: 'array',
            items: { type: 'string' }
          }
        }
      };
      const uiSchema = generateUiSchema(jsonSchema);

      expect(uiSchema.elements[0].type).toBe('Control');
      expect(uiSchema.elements[0].scope).toBe('#/properties/tags');
    });

    it('should generate control for array of objects', () => {
      const jsonSchema = {
        type: 'object',
        properties: {
          users: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' }
              }
            }
          }
        }
      };
      const uiSchema = generateUiSchema(jsonSchema);

      expect(uiSchema.elements[0].type).toBe('Control');
      expect(uiSchema.elements[0].scope).toBe('#/properties/users');
    });
  });

  describe('property ordering', () => {
    it('should maintain property order from schema', () => {
      const jsonSchema = {
        type: 'object',
        properties: {
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          email: { type: 'string', format: 'email' },
          age: { type: 'number' }
        }
      };
      const uiSchema = generateUiSchema(jsonSchema);

      expect(uiSchema.elements[0].scope).toBe('#/properties/firstName');
      expect(uiSchema.elements[1].scope).toBe('#/properties/lastName');
      expect(uiSchema.elements[2].scope).toBe('#/properties/email');
      expect(uiSchema.elements[3].scope).toBe('#/properties/age');
    });
  });

  describe('complex schemas', () => {
    it('should generate UI schema for complex form', () => {
      const jsonSchema = {
        type: 'object',
        properties: {
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          email: { type: 'string', format: 'email' },
          birthdate: { type: 'string', format: 'date' },
          age: { type: 'number' },
          active: { type: 'boolean' },
          country: {
            type: 'string',
            enum: ['USA', 'Canada', 'Mexico']
          }
        }
      };
      const uiSchema = generateUiSchema(jsonSchema);

      expect(uiSchema.type).toBe('VerticalLayout');
      expect(uiSchema.elements).toHaveLength(7);
      expect(uiSchema.elements.every(el => el.type === 'Control')).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle schema without properties', () => {
      const jsonSchema = {
        type: 'object'
      };
      const uiSchema = generateUiSchema(jsonSchema);

      expect(uiSchema.type).toBe('VerticalLayout');
      expect(uiSchema.elements).toHaveLength(0);
    });

    it('should handle null schema', () => {
      const uiSchema = generateUiSchema(null);

      expect(uiSchema.type).toBe('VerticalLayout');
      expect(uiSchema.elements).toHaveLength(0);
    });

    it('should handle undefined schema', () => {
      const uiSchema = generateUiSchema(undefined);

      expect(uiSchema.type).toBe('VerticalLayout');
      expect(uiSchema.elements).toHaveLength(0);
    });
  });
});
