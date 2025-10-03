// JSON validation service with detailed error handling
/**
 * @typedef {Object} ValidationResult
 * @property {boolean} valid - Whether the JSON is valid
 * @property {string} [error] - Error message if invalid
 * @property {*} [parsed] - Parsed JSON if valid
 */

/**
 * Validate a JSON string and return detailed result
 * @param {string} jsonString - The JSON string to validate
 * @returns {ValidationResult} Validation result with parsed data or error
 */
export function validateJson(jsonString) {
  // Handle edge cases
  if (jsonString === null || jsonString === undefined) {
    return {
      valid: false,
      error: 'Input is null or undefined'
    }
  }

  if (typeof jsonString !== 'string') {
    return {
      valid: false,
      error: 'Input must be a string'
    }
  }

  // Handle empty or whitespace-only strings
  if (jsonString.trim() === '') {
    return {
      valid: false,
      error: 'Input is empty or contains only whitespace'
    }
  }

  // Try to parse the JSON
  try {
    const parsed = JSON.parse(jsonString)
    return {
      valid: true,
      parsed
    }
  } catch (error) {
    // Extract useful error information
    let errorMessage = error.message

    // Try to add position information if available
    if (error instanceof SyntaxError) {
      // The error message usually contains position info
      errorMessage = `JSON Syntax Error: ${error.message}`
    }

    return {
      valid: false,
      error: errorMessage
    }
  }
}
