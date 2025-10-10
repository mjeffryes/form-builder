// Service that infers JSON Schema from sample data
// Detects types, structures, and generates valid JSON Schema

const JSON_SCHEMA_DRAFT = 'https://json-schema.org/draft-07/schema#';

/**
 * Infers JSON Schema from sample data
 * @param {any} data - The sample data to analyze
 * @returns {object} - A valid JSON Schema object
 */
export function inferSchema(data) {
  const schema = {
    $schema: JSON_SCHEMA_DRAFT,
    ...inferType(data)
  };

  return schema;
}

/**
 * Infers the type and structure for a given value
 * @param {any} value - The value to analyze
 * @returns {object} - Schema fragment for the value
 */
function inferType(value) {
  // Handle null
  if (value === null) {
    return { type: 'null' };
  }

  // Handle arrays
  if (Array.isArray(value)) {
    return inferArraySchema(value);
  }

  // Handle objects
  if (typeof value === 'object') {
    return inferObjectSchema(value);
  }

  // Handle primitives
  if (typeof value === 'string') {
    return { type: 'string' };
  }

  if (typeof value === 'number') {
    return { type: 'number' };
  }

  if (typeof value === 'boolean') {
    return { type: 'boolean' };
  }

  // Fallback to string for unknown types
  return { type: 'string' };
}

/**
 * Infers schema for an object
 * @param {object} obj - The object to analyze
 * @returns {object} - Object schema fragment
 */
function inferObjectSchema(obj) {
  const properties = {};

  for (const [key, value] of Object.entries(obj)) {
    properties[key] = inferType(value);
  }

  return {
    type: 'object',
    properties
  };
}

/**
 * Infers schema for an array
 * @param {Array} arr - The array to analyze
 * @returns {object} - Array schema fragment
 */
function inferArraySchema(arr) {
  // For empty arrays, use a generic items schema
  if (arr.length === 0) {
    return {
      type: 'array',
      items: {}
    };
  }

  // For non-empty arrays, infer from first item
  // This assumes homogeneous arrays
  const itemSchema = inferType(arr[0]);

  // If array has multiple items and they're objects, merge their schemas
  if (arr.length > 1 && itemSchema.type === 'object') {
    const mergedProperties = {};

    // Collect all properties from all objects
    for (const item of arr) {
      if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
        const itemTypeSchema = inferType(item);
        if (itemTypeSchema.properties) {
          Object.assign(mergedProperties, itemTypeSchema.properties);
        }
      }
    }

    return {
      type: 'array',
      items: {
        type: 'object',
        properties: mergedProperties
      }
    };
  }

  return {
    type: 'array',
    items: itemSchema
  };
}
