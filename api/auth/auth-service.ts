import axios from "axios"
import { storageFallback } from "../../utils/storage-fallback"
import { generateSimpleUuid, isValidUuid } from "../../utils/simple-id-generator"
import { API_URL, API_KEY } from "@env"

console.log(API_URL); 
console.log(API_KEY);

// Fonction simple pour générer un UUID sans dépendance externe
function generateDeviceUuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Storage keys
const USER_KEY = "user_data"
const ANONYMOUS_ID_KEY = "anonymous_id"
const ANONYMOUS_ID_TIMESTAMP_KEY = "anonymous_id_timestamp"
const DEVICE_UUID_KEY = "device_uuid"

// In-memory fallback for IDs in case storage fails completely
let inMemoryAnonymousId: string | null = null
let inMemoryDeviceUUID: string | null = null

export const authService = {
  // Get or generate device UUID
  getDeviceUUID: async (): Promise<string> => {
    try {
      // If we already have an in-memory UUID, use it
      if (inMemoryDeviceUUID) {
        console.log("Using in-memory device UUID:", inMemoryDeviceUUID)
        return inMemoryDeviceUUID
      }

      // Try to get from storage
      let deviceUUID = await storageFallback.getItem(DEVICE_UUID_KEY)

      // Validate the stored UUID
      if (deviceUUID && isValidUuid(deviceUUID)) {
        console.log("Retrieved existing device UUID:", deviceUUID)

        // Store in memory for future use
        inMemoryDeviceUUID = deviceUUID
        return deviceUUID
      } else {
        // Generate a new UUID if none exists or if invalid
        deviceUUID = generateDeviceUuid()

        // Store with error handling
        try {
          await storageFallback.setItem(DEVICE_UUID_KEY, deviceUUID)
          console.log("Generated and stored new device UUID:", deviceUUID)
        } catch (storageError) {
          console.error("Failed to store device UUID:", storageError)
          // Continue with the new UUID even if storage fails
        }

        // Keep a copy in memory
        inMemoryDeviceUUID = deviceUUID
        return deviceUUID
      }
    } catch (error) {
      console.error("Error getting device UUID:", error)

      // Last resort fallback - generate a new one in memory
      if (!inMemoryDeviceUUID) {
        inMemoryDeviceUUID = generateDeviceUuid()
        console.log("Using new fallback device UUID:", inMemoryDeviceUUID)
      }

      return inMemoryDeviceUUID
    }
  },

  // Get or generate anonymous ID with improved persistence
  getAnonymousId: async (): Promise<string> => {
    try {
      // If we already have an in-memory ID, use it
      if (inMemoryAnonymousId) {
        console.log("Using in-memory anonymous ID:", inMemoryAnonymousId)
        return inMemoryAnonymousId
      }

      // Try to get from storage
      let anonymousId = await storageFallback.getItem(ANONYMOUS_ID_KEY)

      // Validate the stored ID
      if (anonymousId && isValidUuid(anonymousId)) {
        console.log("Retrieved existing anonymous ID:", anonymousId)

        // Store in memory for future use
        inMemoryAnonymousId = anonymousId

        // Update the timestamp to track when this ID was last used
        await storageFallback.setItem(ANONYMOUS_ID_TIMESTAMP_KEY, Date.now().toString())

        return anonymousId
      } else {
        // Generate a new ID if none exists or if invalid
        anonymousId = generateSimpleUuid()

        // Store with error handling
        try {
          await storageFallback.setItem(ANONYMOUS_ID_KEY, anonymousId)
          await storageFallback.setItem(ANONYMOUS_ID_TIMESTAMP_KEY, Date.now().toString())
          console.log("Generated and stored new anonymous ID:", anonymousId)
        } catch (storageError) {
          console.error("Failed to store anonymous ID:", storageError)
          // Continue with the new ID even if storage fails
        }

        // Keep a copy in memory
        inMemoryAnonymousId = anonymousId
        return anonymousId
      }
    } catch (error) {
      console.error("Error getting anonymous ID:", error)

      // Last resort fallback - generate a new one in memory
      if (!inMemoryAnonymousId) {
        inMemoryAnonymousId = generateSimpleUuid()
        console.log("Using new fallback anonymous ID:", inMemoryAnonymousId)
      }

      return inMemoryAnonymousId
    }
  },

  // Reset the anonymous ID (generate a new one)
  resetAnonymousId: async (): Promise<string> => {
    try {
      // Generate a new ID
      const newId = generateSimpleUuid()

      // Store with error handling
      try {
        await storageFallback.setItem(ANONYMOUS_ID_KEY, newId)
        await storageFallback.setItem(ANONYMOUS_ID_TIMESTAMP_KEY, Date.now().toString())
      } catch (storageError) {
        console.error("Failed to store new anonymous ID:", storageError)
      }

      // Update in-memory cache
      inMemoryAnonymousId = newId

      console.log("Reset anonymous ID to:", newId)
      return newId
    } catch (error) {
      console.error("Error resetting anonymous ID:", error)

      // Fallback - generate a new one in memory
      inMemoryAnonymousId = generateSimpleUuid()
      return inMemoryAnonymousId
    }
  },

  // Store the authentication token and user data
  storeAuthData: async (token: string, userData: any): Promise<void> => {
    try {
      await storageFallback.setItem(API_KEY, token)
      await storageFallback.setItem(USER_KEY, JSON.stringify(userData))
      
      // Store device session in Strapi
      try {
        const deviceUUID = await authService.getDeviceUUID()
        const deviceName = "Mobile Device" // Vous pourriez récupérer le nom réel de l'appareil
        
        // Create authenticated client
        const client = axios.create({
          baseURL: API_URL,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
        
        // Check if session already exists
        const existingSessionResponse = await client.get(
          `/device-sessions?filters[deviceUuid][$eq]=${deviceUUID}&filters[user][id][$eq]=${userData.id}`
        )
        
        if (existingSessionResponse.data && 
            existingSessionResponse.data.data && 
            existingSessionResponse.data.data.length > 0) {
          // Update existing session
          const sessionId = existingSessionResponse.data.data[0].id
          await client.put(`/device-sessions/${sessionId}`, {
            data: {
              lastActive: new Date().toISOString()
            }
          })
          console.log("Updated existing device session")
        } else {
          // Create new session
          await client.post('/device-sessions', {
            data: {
              deviceUuid: deviceUUID,
              deviceName: deviceName,
              user: userData.id,
              lastActive: new Date().toISOString()
            }
          })
          console.log("Created new device session")
        }
      } catch (sessionError) {
        console.error("Error managing device session:", sessionError)
        // Continue even if session management fails
      }
    } catch (error) {
      console.error("Error storing auth data:", error)
      throw error
    }
  },

  // Get the stored token
  getToken: async (): Promise<string | null> => {
    try {
      return await storageFallback.getItem(API_KEY)
    } catch (error) {
      console.error("Error getting token:", error)
      return null
    }
  },

  // Get the stored user data
  getUserData: async (): Promise<any | null> => {
    try {
      const userData = await storageFallback.getItem(USER_KEY)
      return userData ? JSON.parse(userData) : null
    } catch (error) {
      console.error("Error getting user data:", error)
      return null
    }
  },

  // Clear the stored token and user data (logout)
  clearAuthData: async (): Promise<void> => {
    try {
      // Try to remove device session before clearing auth data
      try {
        const token = await authService.getToken()
        const userData = await authService.getUserData()
        const deviceUUID = await authService.getDeviceUUID()
        
        if (token && userData && deviceUUID) {
          // Create authenticated client
          const client = axios.create({
            baseURL: API_URL,
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          })
          
          // Find and delete the session
          const sessionResponse = await client.get(
            `/device-sessions?filters[deviceUuid][$eq]=${deviceUUID}&filters[user][id][$eq]=${userData.id}`
          )
          
          if (sessionResponse.data && 
              sessionResponse.data.data && 
              sessionResponse.data.data.length > 0) {
            const sessionId = sessionResponse.data.data[0].id
            await client.delete(`/device-sessions/${sessionId}`)
            console.log("Deleted device session during logout")
          }
        }
      } catch (sessionError) {
        console.error("Error removing device session during logout:", sessionError)
        // Continue with logout even if session removal fails
      }
      
      await storageFallback.removeItem(API_KEY)
      await storageFallback.removeItem(USER_KEY)
      // Note: We don't clear the anonymous ID or device UUID to maintain identity
    } catch (error) {
      console.error("Error clearing auth data:", error)
      throw error
    }
  },

  // Register a new user with improved error handling
  register: async (email: string, username: string, password: string) => {
    try {
      const anonymousId = await authService.getAnonymousId()
      const deviceUUID = await authService.getDeviceUUID()

      console.log("Registering user with anonymous ID:", anonymousId)
      console.log("Device UUID:", deviceUUID)

      const response = await axios.post(
        `${API_URL}/auth/local/register`,
        {
          email,
          username,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-Anonymous-ID": anonymousId,
            "X-Device-UUID": deviceUUID,
          },
        },
      )

      // Store the JWT token and user data
      if (response.data && response.data.jwt) {
        await authService.storeAuthData(response.data.jwt, response.data.user)
        console.log("Registration successful, stored auth data")
      } else {
        console.warn("Registration response missing JWT:", response.data)
      }

      return response.data
    } catch (error: any) {
      console.error("Registration error:", error)

      // Detailed error logging
      if (axios.isAxiosError(error)) {
        console.error("Registration error details:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        })
      }

      // Handle error and provide meaningful message
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data?.error?.message || "Registration failed"
        throw new Error(errorMessage)
      }
      throw new Error("Network error during registration")
    }
  },

  // Login with email and password
  login: async (identifier: string, password: string) => {
    try {
      const anonymousId = await authService.getAnonymousId()
      const deviceUUID = await authService.getDeviceUUID()

      console.log("Logging in with anonymous ID:", anonymousId)
      console.log("Device UUID:", deviceUUID)

      const response = await axios.post(
        `${API_URL}/auth/local`,
        {
          identifier, // Can be email or username
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-Anonymous-ID": anonymousId,
            "X-Device-UUID": deviceUUID,
          },
        },
      )

      // Store the JWT token and user data
      if (response.data && response.data.jwt) {
        await authService.storeAuthData(response.data.jwt, response.data.user)
        console.log("Login successful, stored auth data")
      } else {
        console.warn("Login response missing JWT:", response.data)
      }

      return response.data
    } catch (error: any) {
      console.error("Login error:", error)

      // Detailed error logging
      if (axios.isAxiosError(error)) {
        console.error("Login error details:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        })
      }

      // Handle error and provide meaningful message
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data?.error?.message || "Login failed"
        throw new Error(errorMessage)
      }
      throw new Error("Network error during login")
    }
  },

  // Google authentication
  googleAuth: async (idToken: string) => {
    try {
      const anonymousId = await authService.getAnonymousId()
      const deviceUUID = await authService.getDeviceUUID()

      console.log("Google auth with anonymous ID:", anonymousId)
      console.log("Device UUID:", deviceUUID)

      const response = await axios.post(
        `${API_URL}/auth/google/mobile`,
        {
          access_token: idToken,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-Anonymous-ID": anonymousId,
            "X-Device-UUID": deviceUUID,
          },
          timeout: 10000, // 10 second timeout
        },
      )

      // Store the JWT token and user data
      if (response.data && response.data.jwt) {
        await authService.storeAuthData(response.data.jwt, response.data.user)
        console.log("Google auth successful, stored auth data")
      } else {
        console.warn("Google auth response missing JWT:", response.data)
      }

      return response.data
    } catch (error: any) {
      console.error("Google authentication error:", error)

      // Detailed error logging
      if (axios.isAxiosError(error)) {
        console.error("Google auth error details:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        })
      }

      throw new Error(
        error.response?.data?.error?.message || error.message || "An error occurred during Google authentication",
      )
    }
  },

  // Check if user is authenticated by token
  isAuthenticatedByToken: async (): Promise<boolean> => {
    try {
      const token = await authService.getToken()
      
      if (!token) {
        return false
      }
      
      // Create authenticated client
      const client = axios.create({
        baseURL: API_URL,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      
      // Verify token by making a request to /users/me
      const response = await client.get('/users/me')
      
      return response.status === 200
    } catch (error) {
      console.error("Error checking token authentication:", error)
      return false
    }
  },

  // Check if user is authenticated by UUID
  isAuthenticatedByUUID: async (): Promise<boolean> => {
    try {
      const deviceUUID = await authService.getDeviceUUID()
      const userData = await authService.getUserData()
      const token = await authService.getToken()
      
      if (!userData || !token) {
        return false
      }
      
      // Create authenticated client
      const client = axios.create({
        baseURL: API_URL,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      
      // Check if this UUID is associated with the user
      const response = await client.get(
        `/device-sessions?filters[deviceUuid][$eq]=${deviceUUID}&filters[user][id][$eq]=${userData.id}`
      )
      
      if (response.data && 
          response.data.data && 
          response.data.data.length > 0) {
        // Update last active timestamp
        const sessionId = response.data.data[0].id
        await client.put(`/device-sessions/${sessionId}`, {
          data: {
            lastActive: new Date().toISOString()
          }
        })
        
        return true
      }
      
      return false
    } catch (error) {
      console.error("Error checking UUID authentication:", error)
      return false
    }
  },

  // Check if user is authenticated (by token or UUID)
  isAuthenticated: async (): Promise<boolean> => {
    try {
      // First try token authentication
      const isAuthByToken = await authService.isAuthenticatedByToken()
      
      if (isAuthByToken) {
        console.log("User authenticated by token")
        return true
      }
      
      // If token auth fails, try UUID auth
      const isAuthByUUID = await authService.isAuthenticatedByUUID()
      
      if (isAuthByUUID) {
        console.log("User authenticated by UUID")
        return true
      }
      
      console.log("Authentication failed")
      return false
    } catch (error) {
      console.error("Error checking authentication:", error)
      return false
    }
  },

  // Get device sessions for the current user
  getDeviceSessions: async (userId: number): Promise<any[]> => {
    try {
      const token = await authService.getToken()
      
      if (!token) {
        return []
      }
      
      // Create authenticated client
      const client = axios.create({
        baseURL: API_URL,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      
      // Get all device sessions for this user
      const response = await client.get(
        `/device-sessions?filters[user][id][$eq]=${userId}&sort=lastActive:desc`
      )
      
      if (response.data && response.data.data) {
        return response.data.data
      }
      
      return []
    } catch (error) {
      console.error("Error getting device sessions:", error)
      return []
    }
  },

  // Remove a device session
  removeDeviceSession: async (sessionId: string): Promise<void> => {
    try {
      const token = await authService.getToken()
      
      if (!token) {
        throw new Error("No authentication token found")
      }
      
      // Create authenticated client
      const client = axios.create({
        baseURL: API_URL,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      
      // Delete the session
      await client.delete(`/device-sessions/${sessionId}`)
      console.log("Device session removed successfully")
    } catch (error) {
      console.error("Error removing device session:", error)
      throw error
    }
  },

  // Create API client with auth headers
  createAuthenticatedClient: async () => {
    const token = await authService.getToken()
    const anonymousId = await authService.getAnonymousId()
    const deviceUUID = await authService.getDeviceUUID()

    console.log("Creating authenticated client with headers:", {
      Authorization: token ? `Bearer ${token}` : "None",
      "X-Anonymous-ID": anonymousId,
      "X-Device-UUID": deviceUUID,
    })

    return axios.create({
      baseURL: API_URL,
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "X-Anonymous-ID": anonymousId,
        "X-Device-UUID": deviceUUID,
      },
    })
  },
}