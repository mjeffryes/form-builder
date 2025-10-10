// Service that generates UI Schema from JSON Schema
// Creates appropriate controls and layouts for form rendering

/**
 * Generates a UI Schema from a JSON Schema
 * @param {object} jsonSchema - The JSON Schema to generate UI Schema from
 * @returns {object} - A valid JSON UI Schema
 */
export function generateUiSchema(jsonSchema) {
  // Handle null/undefined schemas
  if (!jsonSchema || !jsonSchema.properties) {
    return {
      type: 'VerticalLayout',
      elements: []
    };
  }

  const elements = [];

  // Generate control for each property
  for (const [propertyName, propertySchema] of Object.entries(jsonSchema.properties)) {
    elements.push(createControl(propertyName, propertySchema));
  }

  return {
    type: 'VerticalLayout',
    elements
  };
}

/**
 * Creates a control element for a property
 * @param {string} propertyName - The property name
 * @param {object} propertySchema - The property schema
 * @returns {object} - A control element
 */
function createControl(propertyName, propertySchema) {
  // JSONForms automatically handles rendering based on:
  // - type (string, number, boolean, object, array)
  // - format (email, date, date-time)
  // - enum values
  // So we just need to create a simple Control with the correct scope

  return {
    type: 'Control',
    scope: `#/properties/${propertyName}`
  };
}
