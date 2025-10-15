// Unit tests for ProjectRepository
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { ProjectRepository } from '@/services/ProjectRepository'
import { createProject } from '@/models/Project'

describe('ProjectRepository', () => {
  let repository

  beforeEach(() => {
    repository = new ProjectRepository()
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('saveProject and getProject', () => {
    it('saves and retrieves a project', () => {
      const project = createProject('Test Form', '{"type":"object"}', '{}', '{}')

      repository.saveProject(project)
      const retrieved = repository.getProject(project.id)

      expect(retrieved).toEqual(project)
    })

    it('updates lastModified when saving existing project', () => {
      const project = createProject('Test', '{}', '{}', '{}')
      const originalTime = project.lastModified

      repository.saveProject(project)

      // Save again with new timestamp
      const updatedProject = { ...project, name: 'Updated', lastModified: originalTime + 1000 }
      repository.saveProject(updatedProject)

      const retrieved = repository.getProject(project.id)
      expect(retrieved.lastModified).toBeGreaterThan(originalTime)
      expect(retrieved.name).toBe('Updated')
    })

    it('returns null for non-existent project', () => {
      expect(repository.getProject('non-existent-id')).toBeNull()
    })
  })

  describe('deleteProject', () => {
    it('deletes a project', () => {
      const project = createProject('Test', '{}', '{}', '{}')
      repository.saveProject(project)

      expect(repository.getProject(project.id)).toEqual(project)

      repository.deleteProject(project.id)

      expect(repository.getProject(project.id)).toBeNull()
    })

    it('does not throw when deleting non-existent project', () => {
      expect(() => repository.deleteProject('non-existent')).not.toThrow()
    })
  })

  describe('getAllProjects', () => {
    it('returns empty array when no projects exist', () => {
      expect(repository.getAllProjects()).toEqual([])
    })

    it('returns all saved projects', () => {
      const project1 = createProject('Project 1', '{}', '{}', '{}')
      const project2 = createProject('Project 2', '{}', '{}', '{}')
      const project3 = createProject('Project 3', '{}', '{}', '{}')

      repository.saveProject(project1)
      repository.saveProject(project2)
      repository.saveProject(project3)

      const all = repository.getAllProjects()

      expect(all).toHaveLength(3)
      expect(all).toContainEqual(project1)
      expect(all).toContainEqual(project2)
      expect(all).toContainEqual(project3)
    })

    it('sorts projects by lastModified descending', () => {
      // Create projects with different timestamps
      const old = createProject('Old', '{}', '{}', '{}')
      old.lastModified = 1000

      const newer = createProject('Newer', '{}', '{}', '{}')
      newer.lastModified = 2000

      const newest = createProject('Newest', '{}', '{}', '{}')
      newest.lastModified = 3000

      repository.saveProject(old)
      repository.saveProject(newest)
      repository.saveProject(newer)

      const all = repository.getAllProjects()

      expect(all[0].name).toBe('Newest')
      expect(all[1].name).toBe('Newer')
      expect(all[2].name).toBe('Old')
    })

    it('does not return current project in list', () => {
      repository.saveCurrent('{}', '{}', '{}')

      const project = createProject('Named Project', '{}', '{}', '{}')
      repository.saveProject(project)

      const all = repository.getAllProjects()

      expect(all).toHaveLength(1)
      expect(all[0]).toEqual(project)
    })
  })

  describe('saveCurrent and getCurrent', () => {
    it('saves and retrieves current work-in-progress', () => {
      const jsonSchema = '{"type":"object"}'
      const uiSchema = '{"type":"VerticalLayout"}'
      const data = '{"name":"test"}'

      repository.saveCurrent(jsonSchema, uiSchema, data)
      const current = repository.getCurrent()

      expect(current.jsonSchema).toBe(jsonSchema)
      expect(current.uiSchema).toBe(uiSchema)
      expect(current.data).toBe(data)
      expect(current.lastModified).toBeDefined()
    })

    it('returns null when no current project exists', () => {
      expect(repository.getCurrent()).toBeNull()
    })

    it('updates current project on subsequent saves', () => {
      repository.saveCurrent('{}', '{}', '{}')
      const first = repository.getCurrent()

      // Save again with different data
      repository.saveCurrent('{"updated":true}', '{}', '{}')
      const updated = repository.getCurrent()

      expect(updated.jsonSchema).toBe('{"updated":true}')
      expect(updated.lastModified).toBeGreaterThanOrEqual(first.lastModified)
    })
  })

  describe('storage keys', () => {
    it('stores projects with project:{id} key pattern', () => {
      const project = createProject('Test', '{}', '{}', '{}')
      repository.saveProject(project)

      const key = `form-builder:project:${project.id}`
      const stored = localStorage.getItem(key)

      expect(stored).toBeTruthy()
      expect(JSON.parse(stored)).toEqual(project)
    })

    it('stores current project with current key', () => {
      repository.saveCurrent('{}', '{}', '{}')

      const stored = localStorage.getItem('form-builder:current')
      expect(stored).toBeTruthy()
    })
  })

  describe('searchProjects', () => {
    it('returns all projects when query is empty', () => {
      const project1 = createProject('Contact Form', '{}', '{}', '{}')
      const project2 = createProject('Survey', '{}', '{}', '{}')

      repository.saveProject(project1)
      repository.saveProject(project2)

      const results = repository.searchProjects('')

      expect(results).toHaveLength(2)
    })

    it('filters projects by name (case-insensitive)', () => {
      const project1 = createProject('Contact Form', '{}', '{}', '{}')
      const project2 = createProject('Survey Form', '{}', '{}', '{}')
      const project3 = createProject('User Registration', '{}', '{}', '{}')

      repository.saveProject(project1)
      repository.saveProject(project2)
      repository.saveProject(project3)

      const results = repository.searchProjects('form')

      expect(results).toHaveLength(2)
      expect(results.some(p => p.name === 'Contact Form')).toBe(true)
      expect(results.some(p => p.name === 'Survey Form')).toBe(true)
    })

    it('is case-insensitive', () => {
      const project = createProject('MyProject', '{}', '{}', '{}')
      repository.saveProject(project)

      expect(repository.searchProjects('myproject')).toHaveLength(1)
      expect(repository.searchProjects('MYPROJECT')).toHaveLength(1)
      expect(repository.searchProjects('MyProject')).toHaveLength(1)
    })

    it('returns empty array when no matches found', () => {
      const project = createProject('Contact Form', '{}', '{}', '{}')
      repository.saveProject(project)

      const results = repository.searchProjects('nonexistent')

      expect(results).toEqual([])
    })

    it('sorts results by lastModified descending', () => {
      const old = createProject('Old Form', '{}', '{}', '{}')
      old.lastModified = 1000

      const newer = createProject('Newer Form', '{}', '{}', '{}')
      newer.lastModified = 2000

      const newest = createProject('Newest Form', '{}', '{}', '{}')
      newest.lastModified = 3000

      repository.saveProject(old)
      repository.saveProject(newest)
      repository.saveProject(newer)

      const results = repository.searchProjects('form')

      expect(results[0].name).toBe('Newest Form')
      expect(results[1].name).toBe('Newer Form')
      expect(results[2].name).toBe('Old Form')
    })

    it('handles partial matches', () => {
      const project = createProject('Contact Form Builder', '{}', '{}', '{}')
      repository.saveProject(project)

      expect(repository.searchProjects('contact')).toHaveLength(1)
      expect(repository.searchProjects('form')).toHaveLength(1)
      expect(repository.searchProjects('builder')).toHaveLength(1)
    })
  })

  describe('edge cases', () => {
    it('handles projects with special characters in name', () => {
      const project = createProject('Test: "Special" & <Chars>', '{}', '{}', '{}')
      repository.saveProject(project)

      const retrieved = repository.getProject(project.id)
      expect(retrieved.name).toBe('Test: "Special" & <Chars>')
    })

    it('handles large JSON schemas', () => {
      const largeSchema = JSON.stringify({ type: 'object', properties: {} })
      const project = createProject('Large', largeSchema, '{}', '{}')

      repository.saveProject(project)
      const retrieved = repository.getProject(project.id)

      expect(retrieved.jsonSchema).toBe(largeSchema)
    })

    it('handles empty strings for schemas and data', () => {
      const project = createProject('Empty', '', '', '')
      repository.saveProject(project)

      const retrieved = repository.getProject(project.id)
      expect(retrieved.jsonSchema).toBe('')
      expect(retrieved.uiSchema).toBe('')
      expect(retrieved.data).toBe('')
    })
  })
})
