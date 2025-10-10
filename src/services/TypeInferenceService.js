// Service that infers JSON Schema from sample data
// Detects types, structures, and generates valid JSON Schema

const JSON_SCHEMA_DRAFT = 'http://json-schema.org/draft-07/schema#';

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
    return inferStringType(value);
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

/**
 * Infers string type with format detection
 * @param {string} value - The string value to analyze
 * @returns {object} - String schema fragment with optional format
 */
function inferStringType(value) {
  const schema = { type: 'string' };

  // Detect email format
  if (isEmail(value)) {
    schema.format = 'email';
    return schema;
  }

  // Detect date-time format (must check before date)
  if (isDateTime(value)) {
    schema.format = 'date-time';
    return schema;
  }

  // Detect date format
  if (isDate(value)) {
    schema.format = 'date';
    return schema;
  }

  // Return plain string (no format)
  return schema;
}

/**
 * Checks if a string looks like an email address
 * @param {string} str - The string to check
 * @returns {boolean} - True if it looks like an email
 */
function isEmail(str) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(str);
}

/**
 * Checks if a string looks like a date
 * @param {string} str - The string to check
 * @returns {boolean} - True if it looks like a date
 */
function isDate(str) {
  // ISO 8601 date: YYYY-MM-DD
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (isoDateRegex.test(str)) {
    return isValidDate(str);
  }

  // MM/DD/YYYY
  const mmddyyyyRegex = /^\d{2}\/\d{2}\/\d{4}$/;
  if (mmddyyyyRegex.test(str)) {
    return true;
  }

  // DD-MM-YYYY
  const ddmmyyyyRegex = /^\d{2}-\d{2}-\d{4}$/;
  if (ddmmyyyyRegex.test(str)) {
    return true;
  }

  return false;
}

/**
 * Checks if a string looks like a date-time
 * @param {string} str - The string to check
 * @returns {boolean} - True if it looks like a date-time
 */
function isDateTime(str) {
  // ISO 8601 datetime: YYYY-MM-DDTHH:mm:ss with optional timezone
  const isoDateTimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(Z|[+-]\d{2}:\d{2})?$/;
  return isoDateTimeRegex.test(str);
}

/**
 * Validates if an ISO date string represents a valid date
 * @param {string} dateStr - ISO date string (YYYY-MM-DD)
 * @returns {boolean} - True if valid
 */
function isValidDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);

  // Basic validation
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;

  // More thorough validation would check days per month
  // but for inference purposes, basic check is sufficient
  return true;
}
