// Tests for TypeInferenceService - infers JSON Schema from sample data
import { describe, it, expect } from 'vitest';
import { inferSchema } from '@/services/TypeInferenceService';

describe('TypeInferenceService', () => {
  describe('primitive types', () => {
    it('should infer string type', () => {
      const data = { name: 'John' };
      const schema = inferSchema(data);

      expect(schema.type).toBe('object');
      expect(schema.properties.name.type).toBe('string');
    });

    it('should infer number type', () => {
      const data = { age: 30 };
      const schema = inferSchema(data);

      expect(schema.properties.age.type).toBe('number');
    });

    it('should infer boolean type', () => {
      const data = { active: true };
      const schema = inferSchema(data);

      expect(schema.properties.active.type).toBe('boolean');
    });

    it('should infer null type', () => {
      const data = { value: null };
      const schema = inferSchema(data);

      expect(schema.properties.value.type).toBe('null');
    });
  });

  describe('simple objects', () => {
    it('should infer schema for simple object', () => {
      const data = { name: 'John', age: 30 };
      const schema = inferSchema(data);

      expect(schema.type).toBe('object');
      expect(schema.properties.name.type).toBe('string');
      expect(schema.properties.age.type).toBe('number');
    });

    it('should include $schema field', () => {
      const data = { name: 'John' };
      const schema = inferSchema(data);

      expect(schema.$schema).toBeDefined();
      expect(typeof schema.$schema).toBe('string');
    });

    it('should handle empty object', () => {
      const data = {};
      const schema = inferSchema(data);

      expect(schema.type).toBe('object');
      expect(schema.properties).toBeDefined();
      expect(Object.keys(schema.properties)).toHaveLength(0);
    });
  });

  describe('nested objects', () => {
    it('should infer schema for nested object', () => {
      const data = {
        user: {
          name: 'John',
          age: 30
        }
      };
      const schema = inferSchema(data);

      expect(schema.properties.user.type).toBe('object');
      expect(schema.properties.user.properties.name.type).toBe('string');
      expect(schema.properties.user.properties.age.type).toBe('number');
    });

    it('should handle deeply nested objects', () => {
      const data = {
        level1: {
          level2: {
            level3: {
              value: 'deep'
            }
          }
        }
      };
      const schema = inferSchema(data);

      expect(schema.properties.level1.type).toBe('object');
      expect(schema.properties.level1.properties.level2.type).toBe('object');
      expect(schema.properties.level1.properties.level2.properties.level3.type).toBe('object');
      expect(schema.properties.level1.properties.level2.properties.level3.properties.value.type).toBe('string');
    });
  });

  describe('arrays', () => {
    it('should infer schema for array of primitives', () => {
      const data = { numbers: [1, 2, 3] };
      const schema = inferSchema(data);

      expect(schema.properties.numbers.type).toBe('array');
      expect(schema.properties.numbers.items.type).toBe('number');
    });

    it('should infer schema for array of strings', () => {
      const data = { tags: ['javascript', 'vue', 'json'] };
      const schema = inferSchema(data);

      expect(schema.properties.tags.type).toBe('array');
      expect(schema.properties.tags.items.type).toBe('string');
    });

    it('should infer schema for array of objects', () => {
      const data = {
        users: [
          { id: 1, name: 'John' },
          { id: 2, name: 'Jane' }
        ]
      };
      const schema = inferSchema(data);

      expect(schema.properties.users.type).toBe('array');
      expect(schema.properties.users.items.type).toBe('object');
      expect(schema.properties.users.items.properties.id.type).toBe('number');
      expect(schema.properties.users.items.properties.name.type).toBe('string');
    });

    it('should handle empty array', () => {
      const data = { items: [] };
      const schema = inferSchema(data);

      expect(schema.properties.items.type).toBe('array');
      // Empty array should have items schema, but can be generic
      expect(schema.properties.items.items).toBeDefined();
    });

    it('should handle nested arrays', () => {
      const data = { matrix: [[1, 2], [3, 4]] };
      const schema = inferSchema(data);

      expect(schema.properties.matrix.type).toBe('array');
      expect(schema.properties.matrix.items.type).toBe('array');
      expect(schema.properties.matrix.items.items.type).toBe('number');
    });
  });

  describe('mixed structures', () => {
    it('should handle complex nested structure', () => {
      const data = {
        user: {
          name: 'John',
          age: 30,
          tags: ['admin', 'developer'],
          settings: {
            theme: 'dark',
            notifications: true
          }
        }
      };
      const schema = inferSchema(data);

      expect(schema.properties.user.type).toBe('object');
      expect(schema.properties.user.properties.name.type).toBe('string');
      expect(schema.properties.user.properties.age.type).toBe('number');
      expect(schema.properties.user.properties.tags.type).toBe('array');
      expect(schema.properties.user.properties.tags.items.type).toBe('string');
      expect(schema.properties.user.properties.settings.type).toBe('object');
      expect(schema.properties.user.properties.settings.properties.theme.type).toBe('string');
      expect(schema.properties.user.properties.settings.properties.notifications.type).toBe('boolean');
    });

    it('should handle array of objects with nested arrays', () => {
      const data = {
        users: [
          {
            name: 'John',
            roles: ['admin', 'user']
          }
        ]
      };
      const schema = inferSchema(data);

      expect(schema.properties.users.type).toBe('array');
      expect(schema.properties.users.items.type).toBe('object');
      expect(schema.properties.users.items.properties.name.type).toBe('string');
      expect(schema.properties.users.items.properties.roles.type).toBe('array');
      expect(schema.properties.users.items.properties.roles.items.type).toBe('string');
    });
  });

  describe('edge cases', () => {
    it('should handle object with all primitive types', () => {
      const data = {
        str: 'text',
        num: 42,
        bool: false,
        nil: null
      };
      const schema = inferSchema(data);

      expect(schema.properties.str.type).toBe('string');
      expect(schema.properties.num.type).toBe('number');
      expect(schema.properties.bool.type).toBe('boolean');
      expect(schema.properties.nil.type).toBe('null');
    });

    it('should use JSON Schema Draft 7 or compatible', () => {
      const data = { test: 'value' };
      const schema = inferSchema(data);

      // Check that schema version is specified
      expect(schema.$schema).toBeDefined();
      expect(schema.$schema).toContain('json-schema.org');
    });
  });
});
