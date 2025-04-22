import { authService } from "../auth/auth-service"
import axios from "axios"
import { API_KEY, API_URL } from "@env"

// Your Strapi API URL

export const anonymousUserService = {
  /**
   * Create a new anonymous user record
   * @param anonymousId The anonymous ID to register
   * @returns Promise with the created anonymous user
   */
  createAnonymousUser: async (anonymousId: string): Promise<any> => {
    try {
      console.log("Creating anonymous user with ID:", anonymousId)

      // Make the POST request to create the anonymous user
      const response = await axios.post(`${API_URL}/anonymous-users`, {
        data: {
          anonymousId: anonymousId,
          lastActivity: new Date(),
          convertedToUser: false,
        },
      })

      console.log("Anonymous user created successfully:", response.data)
      return response.data
    } catch (error: any) {
      console.error("Error creating anonymous user:", error)

      // Provide more detailed error information
      if (error.response) {
        console.error("Server response error:", {
          status: error.response.status,
          data: error.response.data,
        })
      }

      throw new Error(error.response?.data?.error?.message || error.message || "Failed to create anonymous user")
    }
  },

  /**
   * Update the lastActivity timestamp for an anonymous user
   * @param anonymousId The anonymous ID to update
   * @returns Promise with the updated anonymous user
   */
  updateLastActivity: async (anonymousId: string): Promise<any> => {
    try {
      // First, find the anonymous user by anonymousId
      const findResponse = await axios.get(`${API_URL}/anonymous-users`, {
        params: {
          filters: {
            anonymousId: {
              $eq: anonymousId,
            },
          },
        },
      })

      // Check if we found the anonymous user
      if (!findResponse.data.data || findResponse.data.data.length === 0) {
        // If not found, create a new one
        return await anonymousUserService.createAnonymousUser(anonymousId)
      }

      // Get the ID of the found anonymous user
      const anonymousUserId = findResponse.data.data[0].id

      // Update the lastActivity timestamp
      const response = await axios.put(`${API_URL}/anonymous-users/${anonymousUserId}`, {
        data: {
          lastActivity: new Date(),
        },
      })

      console.log("Anonymous user activity updated:", response.data)
      return response.data
    } catch (error: any) {
      console.error("Error updating anonymous user activity:", error)

      // Provide more detailed error information
      if (error.response) {
        console.error("Server response error:", {
          status: error.response.status,
          data: error.response.data,
        })
      }

      throw new Error(
        error.response?.data?.error?.message || error.message || "Failed to update anonymous user activity",
      )
    }
  },

  /**
   * Convert anonymous user data to a registered user
   * This should be called after a user registers or logs in
   * @param anonymousId The anonymous ID to convert
   * @returns Promise with the conversion result
   */
  convertToUser: async (anonymousId: string): Promise<any> => {
    try {
      // Get the authentication token
      const token = await authService.getToken()

      if (!token) {
        throw new Error("Authentication token not found. User must be logged in to convert anonymous data.")
      }

      // Create an authenticated client
      const client = await authService.createAuthenticatedClient()

      // Make the POST request to convert the anonymous user
      const response = await client.post("/anonymous-users/convert", {
        anonymousId: anonymousId,
      })

      console.log("Anonymous user conversion successful:", response.data)
      return response.data
    } catch (error: any) {
      console.error("Error converting anonymous user:", error)

      // Provide more detailed error information
      if (error.response) {
        console.error("Server response error:", {
          status: error.response.status,
          data: error.response.data,
        })
      }

      throw new Error(error.response?.data?.error?.message || error.message || "Failed to convert anonymous user")
    }
  },
}

