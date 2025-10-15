// Repository for managing form projects in localStorage
import { StorageService } from './StorageService.js'
import { createCurrentProject } from '../models/Project.js'

export class ProjectRepository {
  constructor() {
    this.storage = new StorageService()
    this.currentKey = 'current'
  }

  /**
   * Get the storage key for a project
   * @param {string} id - Project ID
   * @returns {string} Storage key
   */
  _getProjectKey(id) {
    return `project:${id}`
  }

  /**
   * Save or update a project
   * @param {Project} project - The project to save
   */
  saveProject(project) {
    const key = this._getProjectKey(project.id)
    this.storage.set(key, project)
  }

  /**
   * Retrieve a project by ID
   * @param {string} id - Project ID
   * @returns {Project|null} The project or null if not found
   */
  getProject(id) {
    const key = this._getProjectKey(id)
    return this.storage.get(key)
  }

  /**
   * Delete a project
   * @param {string} id - Project ID to delete
   */
  deleteProject(id) {
    const key = this._getProjectKey(id)
    this.storage.remove(key)
  }

  /**
   * Get all saved projects, sorted by lastModified descending
   * @returns {Project[]} Array of projects
   */
  getAllProjects() {
    const projects = []
    const prefix = this.storage._getKey('project:')

    // Iterate through localStorage to find all project keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(prefix)) {
        // Extract the project ID from the key
        const id = key.substring(prefix.length)
        const project = this.getProject(id)
        if (project) {
          projects.push(project)
        }
      }
    }

    // Sort by lastModified descending (newest first)
    projects.sort((a, b) => b.lastModified - a.lastModified)

    return projects
  }

  /**
   * Search projects by name (case-insensitive)
   * @param {string} query - Search query
   * @returns {Project[]} Filtered and sorted array of projects
   */
  searchProjects(query) {
    const allProjects = this.getAllProjects()

    // If query is empty, return all projects
    if (!query || query.trim() === '') {
      return allProjects
    }

    // Filter by name (case-insensitive contains)
    const lowerQuery = query.toLowerCase()
    return allProjects.filter(project =>
      project.name.toLowerCase().includes(lowerQuery)
    )
  }

  /**
   * Save current work-in-progress
   * @param {string} jsonSchema - JSON Schema string
   * @param {string} uiSchema - UI Schema string
   * @param {string} data - Data string
   */
  saveCurrent(jsonSchema, uiSchema, data) {
    const current = createCurrentProject(jsonSchema, uiSchema, data)
    this.storage.set(this.currentKey, current)
  }

  /**
   * Get current work-in-progress
   * @returns {CurrentProject|null} Current project or null
   */
  getCurrent() {
    return this.storage.get(this.currentKey)
  }
}
