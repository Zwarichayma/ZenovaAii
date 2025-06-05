import axios from "axios"
import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin"
import AsyncStorage from "@react-native-async-storage/async-storage"

const API_URL = "http://192.168.100.7:1337/api"

// Initialize Google Sign-In with your Web Client ID
export const initGoogleSignIn = () => {
  try {
    console.log("🔧 Configuring Google Sign-In with Web Client ID...")

    GoogleSignin.configure({
      // Your Web Client ID from the screenshot
      webClientId: "306365346326-119quk8seo0t19bs8rnt3ml35o3j0lk6.apps.googleusercontent.com",
      offlineAccess: false,
    })

    console.log("✅ Google Sign-In configured successfully with Web Client ID")
  } catch (error) {
    console.error("❌ Google Sign-In configuration error:", error)
  }
}

export interface GoogleAuthResponse {
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
    profilePicture?: string
  }
}

export const storeAuthToken = async (jwt: string): Promise<void> => {
  try {
    await AsyncStorage.setItem("authToken", jwt)
  } catch (error) {
    console.error("Error storing auth token:", error)
    throw new Error("Failed to store authentication token")
  }
}

export const getAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem("authToken")
  } catch (error) {
    console.error("Error getting auth token:", error)
    return null
  }
}

export const removeAuthToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem("authToken")
  } catch (error) {
    console.error("Error removing auth token:", error)
  }
}

export const googleAuthService = {
  signIn: async (): Promise<GoogleAuthResponse> => {
    try {
      console.log("🚀 === Starting Google Sign-In Process ===")

      // Clear any previous sign-in state
      try {
        await GoogleSignin.signOut()
        console.log("🔄 Cleared previous sign-in state")
      } catch (signOutError) {
        console.log("ℹ️ Sign out error (can be ignored):", signOutError)
      }

      // Check Google Play Services
      console.log("🔍 Checking Google Play Services...")
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      })
      console.log("✅ Google Play Services available")

      // Initiate Google Sign-In
      console.log("🔐 Initiating Google sign-in...")
      const userInfo = await GoogleSignin.signIn()
      console.log("✅ Google sign-in successful for:", userInfo.user.email)

      // Get authentication tokens
      console.log("🎫 Getting tokens...")
      const tokens = await GoogleSignin.getTokens()
      console.log("✅ Tokens retrieved successfully")

      if (!tokens.idToken) {
        throw new Error("Unable to get Google ID token")
      }

      // Send token to Strapi backend
      const anonymousId = await AsyncStorage.getItem("anonymousId")

      console.log("🌐 Sending token to Strapi backend...")
      const response = await axios.post(
        `${API_URL}/auth/google/mobile`,
        {
          access_token: tokens.idToken,
        },
        {
          headers: {
            "Content-Type": "application/json",
            ...(anonymousId ? { "x-anonymous-id": anonymousId } : {}),
          },
        },
      )

      console.log("✅ Strapi authentication successful")

      // Store JWT token
      await storeAuthToken(response.data.jwt)

      // Remove anonymous ID if it existed
      if (anonymousId) {
        await AsyncStorage.removeItem("anonymousId")
      }

      return response.data
    } catch (error: any) {
      console.error("💥 === Google Sign-In Error ===")
      console.error("Error type:", typeof error)
      console.error("Error message:", error.message)
      console.error("Error code:", error.code)

      // Handle specific error codes
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        throw new Error("Sign-in was cancelled by user")
      } else if (error.code === statusCodes.IN_PROGRESS) {
        throw new Error("Sign-in already in progress")
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new Error("Google Play Services not available")
      } else if (error.code === 10 || error.message === "DEVELOPER_ERROR") {
        throw new Error("Configuration error resolved! If you still see this, please restart the app.")
      }

      throw new Error(error.message || "Unknown Google Sign-In error")
    }
  },

  signOut: async (): Promise<void> => {
    try {
      await GoogleSignin.signOut()
      await removeAuthToken()
      console.log("✅ Successfully signed out")
    } catch (error) {
      console.error("❌ Google Sign-Out Error:", error)
      throw new Error("Error signing out")
    }
  },

  isSignedIn: async (): Promise<boolean> => {
    try {
      return await GoogleSignin.isSignedIn()
    } catch (error) {
      console.error("❌ Google isSignedIn Error:", error)
      return false
    }
  },

  getCurrentUser: async () => {
    try {
      return await GoogleSignin.getCurrentUser()
    } catch (error) {
      console.error("❌ Google getCurrentUser Error:", error)
      return null
    }
  },
}
