import axios from "axios"

const API_URL = "http://192.168.1.7:1337/api"
const API_KEY =
  "6578e396c2ba2edb826af0353b08f55cb03bf56dc12a05ebc42dd7aedc6f190134882aa6d3f76174ff8303499414eb21b321b1807b26b0950b00f39c0d45079a3b9f7df6bc6a1d7532bf5511ff899cc94e5e77c23065eba46458acdc418e7fd50ef5c9021fa051a1d65de430fcec4e27ff527f8515115e4e1b649ecc41c4a54f"
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

