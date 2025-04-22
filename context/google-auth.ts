import axios from "axios"
import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin"
import AsyncStorage from "@react-native-async-storage/async-storage"

const API_URL = "http://192.168.100.25:1337/api"

// Initialiser Google Sign-In
export const initGoogleSignIn = () => {
  GoogleSignin.configure({
    webClientId: "YOUR_WEB_CLIENT_ID", // Obtenez-le depuis la console Google Cloud
    offlineAccess: true,
  })
}

// Types pour les réponses d'authentification
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

// Service d'authentification Google
export const googleAuthService = {
  // Se connecter avec Google
  signIn: async (): Promise<GoogleAuthResponse> => {
    try {
      // Vérifier si l'utilisateur est déjà connecté à Google
      await GoogleSignin.hasPlayServices()

      // Démarrer le flux de connexion Google
      const userInfo = await GoogleSignin.signIn()

      // Obtenir le token ID
      const { idToken } = await GoogleSignin.getTokens()

      if (!idToken) {
        throw new Error("Impossible d'obtenir le token Google")
      }

      // Récupérer l'ID anonyme s'il existe
      const anonymousId = await AsyncStorage.getItem("anonymousId")

      // Envoyer le token à votre backend Strapi
      const response = await axios.post(
        `${API_URL}/auth/google/mobile`,
        {
          access_token: idToken,
        },
        {
          headers: anonymousId ? { "x-anonymous-id": anonymousId } : {},
        },
      )

      // Stocker le JWT pour les futures requêtes
      await storeAuthToken(response.data.jwt)

      // Si nous avions un ID anonyme, nous pouvons le supprimer maintenant
      if (anonymousId) {
        await AsyncStorage.removeItem("anonymousId")
      }

      return response.data
    } catch (error) {
      console.error("Google Sign-In Error:", error)

      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        throw new Error("Connexion annulée")
      } else if (error.code === statusCodes.IN_PROGRESS) {
        throw new Error("Connexion déjà en cours")
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new Error("Google Play Services n'est pas disponible")
      }

      throw new Error("Erreur lors de la connexion avec Google")
    }
  },

  // Déconnexion de Google
  signOut: async (): Promise<void> => {
    try {
      // Déconnexion de Google
      await GoogleSignin.signOut()

      // Supprimer le token JWT
      await AsyncStorage.removeItem("authToken")
    } catch (error) {
      console.error("Google Sign-Out Error:", error)
      throw new Error("Erreur lors de la déconnexion")
    }
  },

  // Vérifier si l'utilisateur est connecté à Google
  isSignedIn: async (): Promise<boolean> => {
    try {
      return await GoogleSignin.isSignedIn()
    } catch (error) {
      console.error("Google isSignedIn Error:", error)
      return false
    }
  },

  // Obtenir l'utilisateur Google actuel
  getCurrentUser: async () => {
    try {
      return await GoogleSignin.getCurrentUser()
    } catch (error) {
      console.error("Google getCurrentUser Error:", error)
      return null
    }
  },
}

function storeAuthToken(jwt: any) {
    throw new Error("Function not implemented.")
}

