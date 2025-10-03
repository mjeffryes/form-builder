// Project data model for form projects
/**
 * @typedef {Object} Project
 * @property {string} id - Unique identifier for the project
 * @property {string} name - User-provided project name
 * @property {string} jsonSchema - JSON Schema as a string
 * @property {string} uiSchema - UI Schema as a string
 * @property {string} data - Sample data as a string
 * @property {number} lastModified - Timestamp of last modification
 */

/**
 * @typedef {Object} CurrentProject
 * @property {string} jsonSchema - JSON Schema as a string
 * @property {string} uiSchema - UI Schema as a string
 * @property {string} data - Sample data as a string
 * @property {number} lastModified - Timestamp of last modification
 */

/**
 * Create a new project with generated ID
 * @param {string} name - Project name
 * @param {string} jsonSchema - JSON Schema string
 * @param {string} uiSchema - UI Schema string
 * @param {string} data - Data string
 * @returns {Project}
 */
export function createProject(name, jsonSchema, uiSchema, data) {
  return {
    id: crypto.randomUUID(),
    name,
    jsonSchema,
    uiSchema,
    data,
    lastModified: Date.now()
  }
}

/**
 * Create a current project (without id and name)
 * @param {string} jsonSchema - JSON Schema string
 * @param {string} uiSchema - UI Schema string
 * @param {string} data - Data string
 * @returns {CurrentProject}
 */
export function createCurrentProject(jsonSchema, uiSchema, data) {
  return {
    jsonSchema,
    uiSchema,
    data,
    lastModified: Date.now()
  }
}
