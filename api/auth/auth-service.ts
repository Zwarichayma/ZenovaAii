import axios from "axios"
import { storageFallback } from "../../utils/storage-fallback"
import { generateSimpleUuid, isValidUuid } from "../../utils/simple-id-generator"
import { API_URL, API_KEY } from "@env"

// Storage keys
const USER_KEY = "user_data"
const ANONYMOUS_ID_KEY = "anonymous_id"
const ANONYMOUS_ID_TIMESTAMP_KEY = "anonymous_id_timestamp"

// In-memory fallback for anonymous ID in case storage fails completely
let inMemoryAnonymousId: string | null = null

export const authService = {
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
      await storageFallback.removeItem(API_KEY)
      await storageFallback.removeItem(USER_KEY)
      // Note: We don't clear the anonymous ID to maintain user's anonymous data
    } catch (error) {
      console.error("Error clearing auth data:", error)
      throw error
    }
  },

  // Register a new user with improved error handling
  register: async (email: string, username: string, password: string) => {
    try {
      const anonymousId = await authService.getAnonymousId()

      console.log("Registering user with anonymous ID:", anonymousId)

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

      console.log("Logging in with anonymous ID:", anonymousId)

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

      console.log("Google auth with anonymous ID:", anonymousId)

      const response = await axios.post(
        `${API_URL}/auth/google/mobile`,
        {
          access_token: idToken,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-Anonymous-ID": anonymousId,
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

  // Check if user is authenticated
  isAuthenticated: async (): Promise<boolean> => {
    const token = await authService.getToken()
    return token !== null
  },

  // Create API client with auth headers
  createAuthenticatedClient: async () => {
    const token = await authService.getToken()
    const anonymousId = await authService.getAnonymousId()

    console.log("Creating authenticated client with headers:", {
      Authorization: token ? `Bearer ${token}` : "None",
      "X-Anonymous-ID": anonymousId,
    })

    return axios.create({
      baseURL: API_URL,
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "X-Anonymous-ID": anonymousId,
      },
    })
  },
}
