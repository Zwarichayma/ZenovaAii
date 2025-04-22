import axios from "axios"
import { storageFallback } from "../../utils/storage-fallback"
import { generateSimpleUuid } from "../../utils/simple-id-generator"

// Your Strapi API URL
const API_URL = "http://localhost:1337/api"

// Storage keys
const AUTH_TOKEN_KEY = "5b1dff440bf75ea7ad008f9ce2198754bb6804270f844bca29502cb42a9fd083a4e70e49bf84efa2e1a765bbb97ef7c5f193ab568c1bc809497297b20d792cda1478890312768df16b3be3a8dad5c9c609270eb38a722dc6c220b7991eaf76f7a7ac8a3cb4fa678748323358a8b33fc4ab9fa8e6a133415a4dd5f20afc50ed1b"
const USER_KEY = "user_data"
const ANONYMOUS_ID_KEY = "anonymous_id"

// In-memory fallback for anonymous ID in case storage fails completely
let inMemoryAnonymousId: string | null = null;

export const authService = {
  // Get or generate anonymous ID
  getAnonymousId: async (): Promise<string> => {
    try {
      // If we already have an in-memory ID, use it
      if (inMemoryAnonymousId) {
        console.log('Using in-memory anonymous ID:', inMemoryAnonymousId);
        return inMemoryAnonymousId;
      }

      // Try to get from storage
      let anonymousId = await storageFallback.getItem(ANONYMOUS_ID_KEY);

      if (!anonymousId) {
        // Generate a new ID if none exists
        anonymousId = generateSimpleUuid();
        await storageFallback.setItem(ANONYMOUS_ID_KEY, anonymousId);
        console.log('Generated new anonymous ID:', anonymousId);
      } else {
        console.log('Retrieved existing anonymous ID:', anonymousId);
      }

      // Keep a copy in memory
      inMemoryAnonymousId = anonymousId;
      return anonymousId;
    } catch (error) {
      console.error("Error getting anonymous ID:", error);
      
      // Last resort fallback - generate a new one in memory
      if (!inMemoryAnonymousId) {
        inMemoryAnonymousId = generateSimpleUuid();
        console.log('Using new fallback anonymous ID:', inMemoryAnonymousId);
      }
      
      return inMemoryAnonymousId;
    }
  },

  // Store the authentication token and user data
  storeAuthData: async (token: string, userData: any): Promise<void> => {
    try {
      await storageFallback.setItem(AUTH_TOKEN_KEY, token);
      await storageFallback.setItem(USER_KEY, JSON.stringify(userData));
    } catch (error) {
      console.error("Error storing auth data:", error);
      throw error;
    }
  },

  // Get the stored token
  getToken: async (): Promise<string | null> => {
    try {
      return await storageFallback.getItem(AUTH_TOKEN_KEY);
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  },

  // Get the stored user data
  getUserData: async (): Promise<any | null> => {
    try {
      const userData = await storageFallback.getItem(USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error getting user data:", error);
      return null;
    }
  },

  // Clear the stored token and user data (logout)
  clearAuthData: async (): Promise<void> => {
    try {
      await storageFallback.removeItem(AUTH_TOKEN_KEY);
      await storageFallback.removeItem(USER_KEY);
      // Note: We don't clear the anonymous ID to maintain user's anonymous data
    } catch (error) {
      console.error("Error clearing auth data:", error);
      throw error;
    }
  },

  // Register a new user
  register: async (email: string, username: string, password: string) => {
    try {
      const anonymousId = await authService.getAnonymousId();

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
        }
      );

      // Store the JWT token and user data
      if (response.data && response.data.jwt) {
        await authService.storeAuthData(response.data.jwt, response.data.user);
      }

      return response.data;
    } catch (error: any) {
      // Handle error and provide meaningful message
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data?.error?.message || "Registration failed";
        throw new Error(errorMessage);
      }
      throw new Error("Network error during registration");
    }
  },

  // Login with email and password
  login: async (identifier: string, password: string) => {
    try {
      const anonymousId = await authService.getAnonymousId();

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
        }
      );

      // Store the JWT token and user data
      if (response.data && response.data.jwt) {
        await authService.storeAuthData(response.data.jwt, response.data.user);
      }

      return response.data;
    } catch (error: any) {
      // Handle error and provide meaningful message
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data?.error?.message || "Login failed";
        throw new Error(errorMessage);
      }
      throw new Error("Network error during login");
    }
  },

  // Google authentication
  googleAuth: async (idToken: string) => {
    try {
      const anonymousId = await authService.getAnonymousId();

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
        }
      );

      // Store the JWT token and user data
      if (response.data && response.data.jwt) {
        await authService.storeAuthData(response.data.jwt, response.data.user);
      }

      return response.data;
    } catch (error: any) {
      console.error("Google authentication error:", error);

      // Detailed error logging
      if (axios.isAxiosError(error)) {
        console.error("Axios error details:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
      }

      throw new Error(
        error.response?.data?.error?.message || error.message || "An error occurred during Google authentication"
      );
    }
  },

  // Check if user is authenticated
  isAuthenticated: async (): Promise<boolean> => {
    const token = await authService.getToken();
    return token !== null;
  },

  // Create API client with auth headers
  createAuthenticatedClient: async () => {
    const token = await authService.getToken();
    const anonymousId = await authService.getAnonymousId();
    
    console.log('Creating authenticated client with headers:', {
      'Authorization': token ? `Bearer ${token}` : 'None',
      'X-Anonymous-ID': anonymousId
    });
    
    return axios.create({
      baseURL: API_URL,
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'X-Anonymous-ID': anonymousId
      }
    });
  },
};
