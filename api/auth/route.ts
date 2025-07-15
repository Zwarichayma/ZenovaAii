import axios from "axios"

const API_URL = "http://172.20.10.13:1337/api"
const API_KEY =
  "6e3e7d4353b4e4ad2db82c3a91145ae7b9245c7eb5318dcf77db9a9267f621066c24d9cfea255f458117486715465f7aff103744afa4ce13f128dfed55220257b949a558e83f963f14c68991ec3389ad8fbf34a23da5911d2b23a02820bdd6033f5fae80a90916ee82ca7e839e9a4ff74fceb51bfc1c5b5afa2a7e2d948aeaed"
console.log(API_URL); 
console.log(API_KEY);
// Types for authentication responses
export interface AuthResponse {
  jwt: string
  user: {
    id: number
    username: string
    email: string
    provider: string
    confirmed: boolean
    blocked: boolean
    createdAt: string
    updatedAt: string
  }
}

export interface AuthError {
  status: number
  name: string
  message: string
  details?: any
}

// Authentication service
export const authService = {
  // Login with email and password
  login: async (identifier: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await axios.post(`${API_URL}/auth/local`, {
        identifier,
        password,
      })

      // Store the JWT token for future requests
      await storeAuthToken(response.data.jwt)

      return response.data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw (
          error.response.data.error || {
            message: "Authentication failed",
          }
        )
      }
      throw { message: "Network error" }
    }
  },

  // Register a new user
  register: async (email: string, username: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await axios.post(`${API_URL}/auth/local/register`, {
        username,
        email,
        password,
      })

      // Store the JWT token for future requests
      await storeAuthToken(response.data.jwt)

      return response.data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw (
          error.response.data.error || {
            message: "Registration failed",
          }
        )
      }
      throw { message: "Network error" }
    }
  },

  // Get the current user profile
  getCurrentUser: async (): Promise<any> => {
    try {
      const token = await getAuthToken()

      if (!token) {
        throw { message: "Not authenticated" }
      }

      const response = await axios.get(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      return response.data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw (
          error.response.data.error || {
            message: "Failed to get user profile",
          }
        )
      }
      throw { message: "Network error" }
    }
  },

  // Logout the user
  logout: async (): Promise<void> => {
    await removeAuthToken()
  },
}

// Helper functions for token management
// In a real app, you would use AsyncStorage or a more secure storage option
let authToken: string | null = null

const storeAuthToken = async (token: string): Promise<void> => {
  // In a real app, use AsyncStorage or a secure storage solution
  // await AsyncStorage.setItem('authToken', token);
  authToken = token
}

const getAuthToken = async (): Promise<string | null> => {
  // In a real app, use AsyncStorage or a secure storage solution
  // return await AsyncStorage.getItem('authToken');
  return authToken
}

const removeAuthToken = async (): Promise<void> => {
  // In a real app, use AsyncStorage or a secure storage solution
  // await AsyncStorage.removeItem('authToken');
  authToken = null
}

// Create an axios instance with the auth token
export const createAuthenticatedClient = async () => {
  const token = await getAuthToken()

  return axios.create({
    baseURL: API_URL,
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
    },
  })
}

