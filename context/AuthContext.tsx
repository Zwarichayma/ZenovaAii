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
        // Vérifier si l'utilisateur est toujours valide côté serveur
        const userData = await authService.getUserData()
        if (userData) {
          setUser({
            id: userData.id?.toString() || storedUuid,
            username: userData.username,
            email: userData.email,
            profileImage: userData.profileImage,
            joinDate: userData.joinDate
          })
        } else {
          // Token invalide, nettoyer le stockage
          await clearAuthData()
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
      
      // Stocker les données d'authentification
      await AsyncStorage.setItem('userUuid', response.user.id?.toString() || '')
      await AsyncStorage.setItem('authToken', response.token || '')
      await AsyncStorage.setItem('userData', JSON.stringify(response.user))
      
      setUser({
        id: response.user.id?.toString() || '',
        username: response.user.username,
        email: response.user.email,
        profileImage: response.user.profileImage,
        joinDate: response.user.joinDate
      })
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (email: string, username: string, password: string) => {
    try {
      setIsLoading(true)
      const response = await authService.register(email, username, password)
      
      // Stocker les données d'authentification après inscription
      await AsyncStorage.setItem('userUuid', response.user.id?.toString() || '')
      await AsyncStorage.setItem('authToken', response.token || '')
      await AsyncStorage.setItem('userData', JSON.stringify(response.user))
      
      setUser({
        id: response.user.id?.toString() || '',
        username: response.user.username,
        email: response.user.email,
        profileImage: response.user.profileImage,
        joinDate: response.user.joinDate
      })
    } catch (error) {
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
