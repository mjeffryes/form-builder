// localStorage wrapper service with JSON serialization and namespacing
export class StorageService {
  constructor(namespace = 'form-builder') {
    this.namespace = namespace
  }

  /**
   * Get the full key with namespace prefix
   */
  _getKey(key) {
    return `${this.namespace}:${key}`
  }

  /**
   * Retrieve and parse a value from localStorage
   * @param {string} key - The key to retrieve
   * @returns {*} The parsed value, or null if not found or invalid
   */
  get(key) {
    try {
      const fullKey = this._getKey(key)
      const item = localStorage.getItem(fullKey)

      if (item === null) {
        return null
      }

      return JSON.parse(item)
    } catch (error) {
      // Return null for JSON parse errors or other issues
      return null
    }
  }

  /**
   * Stringify and store a value in localStorage
   * @param {string} key - The key to store under
   * @param {*} value - The value to store (will be JSON stringified)
   * @throws {Error} When quota is exceeded
   */
  set(key, value) {
    try {
      const fullKey = this._getKey(key)
      const serialized = JSON.stringify(value)
      localStorage.setItem(fullKey, serialized)
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        throw new Error('localStorage quota exceeded')
      }
      throw error
    }
  }

  /**
   * Remove a key from localStorage
   * @param {string} key - The key to remove
   */
  remove(key) {
    const fullKey = this._getKey(key)
    localStorage.removeItem(fullKey)
  }

  /**
   * Clear all keys with this service's namespace
   */
  clear() {
    const keysToRemove = []
    const prefix = `${this.namespace}:`

    // Find all keys with our namespace
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(prefix)) {
        keysToRemove.push(key)
      }
    }

    // Remove them
    keysToRemove.forEach(key => localStorage.removeItem(key))
  }

  /**
   * Check if a key exists in localStorage
   * @param {string} key - The key to check
   * @returns {boolean} True if the key exists
   */
  has(key) {
    const fullKey = this._getKey(key)
    return localStorage.getItem(fullKey) !== null
  }
}
