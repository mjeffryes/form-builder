// Integrated service that generates both JSON Schema and UI Schema from sample data
// Combines TypeInferenceService and UiSchemaGenerator

import { inferSchema } from './TypeInferenceService.js';
import { generateUiSchema } from './UiSchemaGenerator.js';

/**
 * Generates JSON Schema and UI Schema from sample data string
 * @param {string} dataString - JSON string containing sample data
 * @returns {object} - Object with jsonSchema, uiSchema, and optional error
 */
export function generateFromData(dataString) {
  try {
    // Parse the data string
    if (!dataString || dataString.trim() === '') {
      return {
        error: 'Invalid JSON: empty input'
      };
    }

    const data = JSON.parse(dataString);

    // Validate that data is an object (not array, string, number, etc.)
    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
      return {
        error: 'Data must be an object (not an array, string, number, or null)'
      };
    }

    // Generate JSON Schema using type inference
    const jsonSchema = inferSchema(data);

    // Generate UI Schema from JSON Schema
    const uiSchema = generateUiSchema(jsonSchema);

    // Return both schemas as formatted JSON strings
    return {
      jsonSchema: JSON.stringify(jsonSchema, null, 2),
      uiSchema: JSON.stringify(uiSchema, null, 2)
    };
  } catch (error) {
    // Handle JSON parsing errors
    return {
      error: `Invalid JSON: ${error.message}`
    };
  }
}
