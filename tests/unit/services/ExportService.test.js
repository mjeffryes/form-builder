// Unit tests for ExportService
import { describe, it, expect, vi } from 'vitest'
import { exportProject, downloadBlob, sanitizeFilename } from '@/services/ExportService'
import { createProject } from '@/models/Project'
import JSZip from 'jszip'

describe('ExportService', () => {
  describe('sanitizeFilename', () => {
    it('replaces spaces with hyphens', () => {
      expect(sanitizeFilename('My Project Name')).toBe('my-project-name')
    })

    it('removes special characters', () => {
      expect(sanitizeFilename('Project: "Test" & <More>')).toBe('project-test-more')
    })

    it('converts to lowercase', () => {
      expect(sanitizeFilename('MyProject')).toBe('myproject')
    })

    it('handles multiple spaces', () => {
      expect(sanitizeFilename('My  Project   Name')).toBe('my-project-name')
    })

    it('removes leading and trailing hyphens', () => {
      expect(sanitizeFilename('  Project  ')).toBe('project')
    })

    it('handles empty string', () => {
      expect(sanitizeFilename('')).toBe('untitled')
    })

    it('provides default for only special characters', () => {
      expect(sanitizeFilename('!!@@##')).toBe('untitled')
    })
  })

  describe('exportProject', () => {
    it('creates a blob from project data', async () => {
      const project = createProject(
        'Test Project',
        '{"type":"object"}',
        '{"type":"VerticalLayout"}',
        '{"name":"test"}'
      )

      const blob = await exportProject(project)

      expect(blob).toBeInstanceOf(Blob)
      expect(blob.type).toBe('application/zip')
    })

    it('includes schema.json in the zip', async () => {
      const project = createProject(
        'Test',
        '{"type":"object"}',
        '{}',
        '{}'
      )

      const blob = await exportProject(project)
      const zip = await JSZip.loadAsync(blob)

      expect(zip.files['schema.json']).toBeDefined()
    })

    it('includes uischema.json in the zip', async () => {
      const project = createProject(
        'Test',
        '{}',
        '{"type":"VerticalLayout"}',
        '{}'
      )

      const blob = await exportProject(project)
      const zip = await JSZip.loadAsync(blob)

      expect(zip.files['uischema.json']).toBeDefined()
    })

    it('includes data.json in the zip', async () => {
      const project = createProject(
        'Test',
        '{}',
        '{}',
        '{"name":"value"}'
      )

      const blob = await exportProject(project)
      const zip = await JSZip.loadAsync(blob)

      expect(zip.files['data.json']).toBeDefined()
    })

    it('formats JSON with 2-space indentation in schema.json', async () => {
      const project = createProject(
        'Test',
        '{"type":"object","properties":{"name":{"type":"string"}}}',
        '{}',
        '{}'
      )

      const blob = await exportProject(project)
      const zip = await JSZip.loadAsync(blob)
      const content = await zip.files['schema.json'].async('string')

      // Should be formatted with indentation
      expect(content).toContain('  "type"')
      expect(content).toContain('  "properties"')
    })

    it('formats JSON with 2-space indentation in uischema.json', async () => {
      const project = createProject(
        'Test',
        '{}',
        '{"type":"VerticalLayout","elements":[]}',
        '{}'
      )

      const blob = await exportProject(project)
      const zip = await JSZip.loadAsync(blob)
      const content = await zip.files['uischema.json'].async('string')

      expect(content).toContain('  "type"')
    })

    it('formats JSON with 2-space indentation in data.json', async () => {
      const project = createProject(
        'Test',
        '{}',
        '{}',
        '{"firstName":"John","lastName":"Doe"}'
      )

      const blob = await exportProject(project)
      const zip = await JSZip.loadAsync(blob)
      const content = await zip.files['data.json'].async('string')

      expect(content).toContain('  "firstName"')
    })

    it('preserves JSON content correctly', async () => {
      const jsonSchema = '{"type":"object","properties":{"test":{"type":"string"}}}'
      const project = createProject('Test', jsonSchema, '{}', '{}')

      const blob = await exportProject(project)
      const zip = await JSZip.loadAsync(blob)
      const content = await zip.files['schema.json'].async('string')
      const parsed = JSON.parse(content)

      expect(parsed.type).toBe('object')
      expect(parsed.properties.test.type).toBe('string')
    })
  })

  describe('downloadBlob', () => {
    it('creates and clicks a download link', () => {
      const blob = new Blob(['test content'], { type: 'text/plain' })
      const filename = 'test.txt'

      // Mock DOM elements
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
        style: {}
      }

      const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink)
      const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => {})
      const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => {})
      const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url')
      const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})

      downloadBlob(blob, filename)

      expect(createElementSpy).toHaveBeenCalledWith('a')
      expect(createObjectURLSpy).toHaveBeenCalledWith(blob)
      expect(mockLink.href).toBe('blob:mock-url')
      expect(mockLink.download).toBe(filename)
      expect(mockLink.click).toHaveBeenCalled()
      expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url')

      // Cleanup
      createElementSpy.mockRestore()
      appendChildSpy.mockRestore()
      removeChildSpy.mockRestore()
      createObjectURLSpy.mockRestore()
      revokeObjectURLSpy.mockRestore()
    })

    it('cleans up resources after download', () => {
      const blob = new Blob(['test'], { type: 'text/plain' })
      const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})

      // Mock DOM
      vi.spyOn(document, 'createElement').mockReturnValue({
        href: '',
        download: '',
        click: vi.fn(),
        style: {}
      })
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => {})
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => {})
      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url')

      downloadBlob(blob, 'test.txt')

      expect(revokeObjectURLSpy).toHaveBeenCalled()

      vi.restoreAllMocks()
    })
  })

  describe('integration', () => {
    it('exports a complete project bundle', async () => {
      const project = createProject(
        'Contact Form',
        JSON.stringify({
          type: 'object',
          properties: {
            name: { type: 'string' },
            email: { type: 'string', format: 'email' }
          }
        }),
        JSON.stringify({
          type: 'VerticalLayout',
          elements: [
            { type: 'Control', scope: '#/properties/name' },
            { type: 'Control', scope: '#/properties/email' }
          ]
        }),
        JSON.stringify({
          name: 'John Doe',
          email: 'john@example.com'
        })
      )

      const blob = await exportProject(project)
      const zip = await JSZip.loadAsync(blob)

      // Verify all files exist
      expect(Object.keys(zip.files)).toHaveLength(3)
      expect(zip.files['schema.json']).toBeDefined()
      expect(zip.files['uischema.json']).toBeDefined()
      expect(zip.files['data.json']).toBeDefined()

      // Verify content can be parsed
      const schemaContent = await zip.files['schema.json'].async('string')
      const uischemaContent = await zip.files['uischema.json'].async('string')
      const dataContent = await zip.files['data.json'].async('string')

      const schema = JSON.parse(schemaContent)
      const uischema = JSON.parse(uischemaContent)
      const data = JSON.parse(dataContent)

      expect(schema.properties.name).toBeDefined()
      expect(uischema.type).toBe('VerticalLayout')
      expect(data.name).toBe('John Doe')
    })
  })
})
