// Service for exporting projects as ZIP files
import JSZip from 'jszip'

/**
 * Sanitize a filename by removing special characters and spaces
 * @param {string} filename - The filename to sanitize
 * @returns {string} Sanitized filename
 */
export function sanitizeFilename(filename) {
  if (!filename || typeof filename !== 'string') {
    return 'untitled'
  }

  // Convert to lowercase, replace spaces with hyphens
  let sanitized = filename.toLowerCase().trim()

  // Replace multiple spaces with single hyphen
  sanitized = sanitized.replace(/\s+/g, '-')

  // Remove all non-alphanumeric characters except hyphens
  sanitized = sanitized.replace(/[^a-z0-9-]/g, '')

  // Remove multiple consecutive hyphens
  sanitized = sanitized.replace(/-+/g, '-')

  // Remove leading and trailing hyphens
  sanitized = sanitized.replace(/^-+|-+$/g, '')

  // If empty after sanitization, use default
  return sanitized || 'untitled'
}

/**
 * Export a project as a ZIP file containing JSON files
 * @param {Project} project - The project to export
 * @returns {Promise<Blob>} A promise that resolves to a Blob containing the ZIP file
 */
export async function exportProject(project) {
  const zip = new JSZip()

  // Parse and format JSON with 2-space indentation
  const formatJson = (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString)
      return JSON.stringify(parsed, null, 2)
    } catch (error) {
      // If parsing fails, return original string
      return jsonString
    }
  }

  // Add files to the ZIP
  zip.file('schema.json', formatJson(project.jsonSchema))
  zip.file('uischema.json', formatJson(project.uiSchema))
  zip.file('data.json', formatJson(project.data))

  // Generate the ZIP file as a Blob
  const blob = await zip.generateAsync({ type: 'blob' })
  return blob
}

/**
 * Trigger a download of a Blob in the browser
 * @param {Blob} blob - The blob to download
 * @param {string} filename - The filename for the download
 */
export function downloadBlob(blob, filename) {
  // Create a temporary URL for the blob
  const url = URL.createObjectURL(blob)

  // Create a temporary link element
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.style.display = 'none'

  // Append to body, click, and remove
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // Clean up the URL
  URL.revokeObjectURL(url)
}

/**
 * Export and download a project as a ZIP file
 * @param {Project} project - The project to export and download
 * @returns {Promise<void>}
 */
export async function exportAndDownload(project) {
  const blob = await exportProject(project)
  const filename = `${sanitizeFilename(project.name)}.zip`
  downloadBlob(blob, filename)
}
