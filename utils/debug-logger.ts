// A utility for consistent debug logging

// Set this to false in production
const DEBUG_ENABLED = true

export const debugLog = {
  // Log anonymous ID related messages
  anonymousId: (message: string, id?: string) => {
    if (DEBUG_ENABLED) {
      if (id) {
        console.log(`🆔 [Anonymous ID] ${message}`, id)
      } else {
        console.log(`🆔 [Anonymous ID] ${message}`)
      }
    }
  },

  // Log authentication related messages
  auth: (message: string, data?: any) => {
    if (DEBUG_ENABLED) {
      if (data) {
        console.log(`🔐 [Auth] ${message}`, data)
      } else {
        console.log(`🔐 [Auth] ${message}`)
      }
    }
  },

  // Log API request related messages
  api: (message: string, data?: any) => {
    if (DEBUG_ENABLED) {
      if (data) {
        console.log(`🌐 [API] ${message}`, data)
      } else {
        console.log(`🌐 [API] ${message}`)
      }
    }
  },

  // Log errors
  error: (message: string, error?: any) => {
    if (DEBUG_ENABLED) {
      console.error(`❌ [Error] ${message}`, error || "")
    }
  },
}

