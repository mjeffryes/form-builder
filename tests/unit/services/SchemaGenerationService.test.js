// Tests for SchemaGenerationService - end-to-end schema generation from sample data
import { describe, it, expect } from 'vitest';
import { generateFromData } from '@/services/SchemaGenerationService';

describe('SchemaGenerationService', () => {
  describe('successful generation', () => {
    it('should generate both schemas from simple data', () => {
      const dataString = JSON.stringify({ name: 'John', age: 30 });
      const result = generateFromData(dataString);

      expect(result.error).toBeUndefined();
      expect(result.jsonSchema).toBeDefined();
      expect(result.uiSchema).toBeDefined();

      // Parse to verify valid JSON
      const jsonSchema = JSON.parse(result.jsonSchema);
      const uiSchema = JSON.parse(result.uiSchema);

      expect(jsonSchema.$schema).toBeDefined();
      expect(jsonSchema.type).toBe('object');
      expect(jsonSchema.properties.name.type).toBe('string');
      expect(jsonSchema.properties.age.type).toBe('number');

      expect(uiSchema.type).toBe('VerticalLayout');
      expect(uiSchema.elements).toHaveLength(2);
    });

    it('should format JSON with 2-space indentation', () => {
      const dataString = JSON.stringify({ name: 'John' });
      const result = generateFromData(dataString);

      // Check that JSON is pretty-printed
      expect(result.jsonSchema).toContain('\n');
      expect(result.jsonSchema).toContain('  ');
      expect(result.uiSchema).toContain('\n');
      expect(result.uiSchema).toContain('  ');
    });

    it('should handle data with email format', () => {
      const dataString = JSON.stringify({
        name: 'John',
        email: 'john@example.com'
      });
      const result = generateFromData(dataString);

      const jsonSchema = JSON.parse(result.jsonSchema);
      expect(jsonSchema.properties.email.format).toBe('email');
    });

    it('should handle data with date format', () => {
      const dataString = JSON.stringify({
        name: 'John',
        birthdate: '1990-05-15'
      });
      const result = generateFromData(dataString);

      const jsonSchema = JSON.parse(result.jsonSchema);
      expect(jsonSchema.properties.birthdate.format).toBe('date');
    });

    it('should handle complex nested data', () => {
      const dataString = JSON.stringify({
        user: {
          name: 'John',
          email: 'john@example.com',
          age: 30
        },
        tags: ['developer', 'admin'],
        active: true
      });
      const result = generateFromData(dataString);

      expect(result.error).toBeUndefined();

      const jsonSchema = JSON.parse(result.jsonSchema);
      const uiSchema = JSON.parse(result.uiSchema);

      expect(jsonSchema.properties.user.type).toBe('object');
      expect(jsonSchema.properties.tags.type).toBe('array');
      expect(jsonSchema.properties.active.type).toBe('boolean');

      expect(uiSchema.elements).toHaveLength(3);
    });

    it('should handle array of objects', () => {
      const dataString = JSON.stringify({
        users: [
          { name: 'John', age: 30 },
          { name: 'Jane', age: 25 }
        ]
      });
      const result = generateFromData(dataString);

      const jsonSchema = JSON.parse(result.jsonSchema);
      expect(jsonSchema.properties.users.type).toBe('array');
      expect(jsonSchema.properties.users.items.type).toBe('object');
      expect(jsonSchema.properties.users.items.properties.name.type).toBe('string');
    });
  });

  describe('error handling', () => {
    it('should return error for invalid JSON', () => {
      const dataString = '{ invalid json }';
      const result = generateFromData(dataString);

      expect(result.error).toBeDefined();
      expect(result.error).toContain('Invalid JSON');
      expect(result.jsonSchema).toBeUndefined();
      expect(result.uiSchema).toBeUndefined();
    });

    it('should return error for empty string', () => {
      const dataString = '';
      const result = generateFromData(dataString);

      expect(result.error).toBeDefined();
    });

    it('should return error for non-object data', () => {
      const dataString = JSON.stringify('just a string');
      const result = generateFromData(dataString);

      expect(result.error).toBeDefined();
      expect(result.error).toContain('must be an object');
    });

    it('should return error for array data', () => {
      const dataString = JSON.stringify([1, 2, 3]);
      const result = generateFromData(dataString);

      expect(result.error).toBeDefined();
      expect(result.error).toContain('must be an object');
    });

    it('should return error for null', () => {
      const dataString = 'null';
      const result = generateFromData(dataString);

      expect(result.error).toBeDefined();
      expect(result.error).toContain('must be an object');
    });
  });

  describe('edge cases', () => {
    it('should handle empty object', () => {
      const dataString = JSON.stringify({});
      const result = generateFromData(dataString);

      expect(result.error).toBeUndefined();

      const jsonSchema = JSON.parse(result.jsonSchema);
      const uiSchema = JSON.parse(result.uiSchema);

      expect(jsonSchema.properties).toBeDefined();
      expect(Object.keys(jsonSchema.properties)).toHaveLength(0);
      expect(uiSchema.elements).toHaveLength(0);
    });

    it('should handle object with all primitive types', () => {
      const dataString = JSON.stringify({
        str: 'text',
        num: 42,
        bool: true,
        nil: null
      });
      const result = generateFromData(dataString);

      expect(result.error).toBeUndefined();

      const jsonSchema = JSON.parse(result.jsonSchema);
      expect(jsonSchema.properties.str.type).toBe('string');
      expect(jsonSchema.properties.num.type).toBe('number');
      expect(jsonSchema.properties.bool.type).toBe('boolean');
      expect(jsonSchema.properties.nil.type).toBe('null');
    });

    it('should handle deeply nested structures', () => {
      const dataString = JSON.stringify({
        level1: {
          level2: {
            level3: {
              value: 'deep'
            }
          }
        }
      });
      const result = generateFromData(dataString);

      expect(result.error).toBeUndefined();

      const jsonSchema = JSON.parse(result.jsonSchema);
      expect(jsonSchema.properties.level1.type).toBe('object');
      expect(jsonSchema.properties.level1.properties.level2.type).toBe('object');
    });
  });

  describe('real-world examples', () => {
    it('should generate schema for contact form data', () => {
      const dataString = JSON.stringify({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '555-1234',
        message: 'Hello, I would like to get in touch.',
        contactMe: true
      });
      const result = generateFromData(dataString);

      expect(result.error).toBeUndefined();

      const jsonSchema = JSON.parse(result.jsonSchema);
      const uiSchema = JSON.parse(result.uiSchema);

      expect(jsonSchema.properties.email.format).toBe('email');
      expect(jsonSchema.properties.contactMe.type).toBe('boolean');
      expect(uiSchema.elements).toHaveLength(6);
    });

    it('should generate schema for user registration data', () => {
      const dataString = JSON.stringify({
        username: 'johndoe',
        email: 'john@example.com',
        password: 'secret123',
        birthdate: '1990-05-15',
        country: 'USA',
        acceptTerms: true,
        interests: ['programming', 'music', 'sports']
      });
      const result = generateFromData(dataString);

      expect(result.error).toBeUndefined();

      const jsonSchema = JSON.parse(result.jsonSchema);

      expect(jsonSchema.properties.email.format).toBe('email');
      expect(jsonSchema.properties.birthdate.format).toBe('date');
      expect(jsonSchema.properties.acceptTerms.type).toBe('boolean');
      expect(jsonSchema.properties.interests.type).toBe('array');
    });

    it('should generate schema for product data', () => {
      const dataString = JSON.stringify({
        name: 'Laptop',
        price: 999.99,
        inStock: true,
        category: 'Electronics',
        releaseDate: '2024-01-15',
        specs: {
          processor: 'Intel i7',
          ram: 16,
          storage: 512
        },
        tags: ['computer', 'portable', 'work']
      });
      const result = generateFromData(dataString);

      expect(result.error).toBeUndefined();

      const jsonSchema = JSON.parse(result.jsonSchema);

      expect(jsonSchema.properties.price.type).toBe('number');
      expect(jsonSchema.properties.releaseDate.format).toBe('date');
      expect(jsonSchema.properties.specs.type).toBe('object');
      expect(jsonSchema.properties.tags.type).toBe('array');
    });
  });
});
