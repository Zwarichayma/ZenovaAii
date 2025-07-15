import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { authService } from '../api/auth/auth-service'

interface User {
  id: string
  username: string
  email: string
  profileImage?: string
  joinDate: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkAuthStatus: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true)
      
      // Vérifier si un UUID/token existe dans le stockage local
      const storedUuid = await AsyncStorage.getItem('userUuid')
      const storedToken = await AsyncStorage.getItem('authToken')
      
      if (storedUuid && storedToken) {
        // ✅ CORRECTION: Vérifier d'abord les données stockées localement
        const storedUserData = await AsyncStorage.getItem('userData')
        
        if (storedUserData) {
          try {
            const parsedUserData = JSON.parse(storedUserData)
            console.log('📱 Found stored user data:', parsedUserData)
            
            // Vérifier si l'utilisateur est toujours valide côté serveur
            try {
              const serverUserData = await authService.getUserData()
              if (serverUserData && serverUserData.id?.toString() === storedUuid) {
                // Utiliser les données du serveur si elles sont à jour
                setUser({
                  id: serverUserData.id?.toString() || storedUuid,
                  username: serverUserData.username,
                  email: serverUserData.email,
                  profileImage: serverUserData.profileImage,
                  joinDate: serverUserData.joinDate
                })
                console.log('✅ User authenticated with server data')
              } else {
                // Utiliser les données stockées localement si le serveur n'est pas accessible
                setUser({
                  id: parsedUserData.id?.toString() || storedUuid,
                  username: parsedUserData.username,
                  email: parsedUserData.email,
                  profileImage: parsedUserData.profileImage,
                  joinDate: parsedUserData.joinDate
                })
                console.log('✅ User authenticated with local data')
              }
            } catch (serverError) {
              console.log('⚠️ Server not accessible, using local data')
              // Utiliser les données stockées localement
              setUser({
                id: parsedUserData.id?.toString() || storedUuid,
                username: parsedUserData.username,
                email: parsedUserData.email,
                profileImage: parsedUserData.profileImage,
                joinDate: parsedUserData.joinDate
              })
            }
          } catch (parseError) {
            console.error('❌ Error parsing stored user data:', parseError)
            await clearAuthData()
          }
        } else {
          // Pas de données utilisateur stockées, essayer de les récupérer du serveur
          try {
            const userData = await authService.getUserData()
            if (userData) {
              setUser({
                id: userData.id?.toString() || storedUuid,
                username: userData.username,
                email: userData.email,
                profileImage: userData.profileImage,
                joinDate: userData.joinDate
              })
              
              // Stocker les données récupérées
              await AsyncStorage.setItem('userData', JSON.stringify(userData))
            } else {
              await clearAuthData()
            }
          } catch (error) {
            console.error('❌ Error fetching user data from server:', error)
            await clearAuthData()
          }
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error)
      await clearAuthData()
    } finally {
      setIsLoading(false)
    }
  }

  const clearAuthData = async () => {
    await AsyncStorage.multiRemove(['userUuid', 'authToken', 'userData'])
    setUser(null)
  }

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const response = await authService.login(email, password)
      
      // ✅ VALIDATION: S'assurer que la réponse contient les données utilisateur
      if (!response.user || !response.user.id) {
        throw new Error('Invalid login response: missing user data')
      }
      
      const userId = response.user.id?.toString()
      console.log('✅ Login successful for user:', userId)
      
      // Stocker les données d'authentification
      await AsyncStorage.setItem('userUuid', userId)
      await AsyncStorage.setItem('authToken', response.token || '')
      await AsyncStorage.setItem('userData', JSON.stringify(response.user))
      
      setUser({
        id: userId,
        username: response.user.username,
        email: response.user.email,
        profileImage: response.user.profileImage,
        joinDate: response.user.joinDate
      })
    } catch (error) {
      console.error('❌ Login error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (email: string, username: string, password: string) => {
    try {
      setIsLoading(true)
      const response = await authService.register(email, username, password)
      
      // ✅ VALIDATION: S'assurer que la réponse contient les données utilisateur
      if (!response.user || !response.user.id) {
        throw new Error('Invalid registration response: missing user data')
      }
      
      const userId = response.user.id?.toString()
      console.log('✅ Registration successful for new user:', userId)
      
      // Stocker les données d'authentification après inscription
      await AsyncStorage.setItem('userUuid', userId)
      await AsyncStorage.setItem('authToken', response.token || '')
      await AsyncStorage.setItem('userData', JSON.stringify(response.user))
      
      setUser({
        id: userId,
        username: response.user.username,
        email: response.user.email,
        profileImage: response.user.profileImage,
        joinDate: response.user.joinDate
      })
      
      console.log('🆕 New user registered and authenticated:', username)
    } catch (error) {
      console.error('❌ Registration error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      setIsLoading(true)
      await authService.clearAuthData()
      await clearAuthData()
      console.log('✅ User logged out successfully')
    } catch (error) {
      console.error('Error during logout:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    checkAuthStatus
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}