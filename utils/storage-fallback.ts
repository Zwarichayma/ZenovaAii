// This is a fallback storage solution when AsyncStorage isn't available
// It uses in-memory storage which will be lost when the app restarts

// In-memory storage object
const memoryStorage: Record<string, string> = {}

// Flag to track if we've shown the warning
let warningShown = false

// Show a warning about using in-memory storage
const showWarning = () => {
  if (!warningShown) {
    console.warn(
      "Using in-memory storage fallback instead of AsyncStorage. " +
        "Data will be lost when the app restarts. " +
        "Fix AsyncStorage native module linking for persistence.",
    )
    warningShown = true
  }
}

export const storageFallback = {
  // Store a value
  setItem: async (key: string, value: string): Promise<void> => {
    showWarning()
    memoryStorage[key] = value
    return Promise.resolve()
  },

  // Get a value
  getItem: async (key: string): Promise<string | null> => {
    showWarning()
    return Promise.resolve(memoryStorage[key] || null)
  },

  // Remove a value
  removeItem: async (key: string): Promise<void> => {
    showWarning()
    delete memoryStorage[key]
    return Promise.resolve()
  },

  // Clear all values
  clear: async (): Promise<void> => {
    showWarning()
    Object.keys(memoryStorage).forEach((key) => {
      delete memoryStorage[key]
    })
    return Promise.resolve()
  },

  // Get all keys
  getAllKeys: async (): Promise<string[]> => {
    showWarning()
    return Promise.resolve(Object.keys(memoryStorage))
  },
}

