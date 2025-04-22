"use client"

import type React from "react"
import { createContext, useState, useEffect, useContext, type ReactNode } from "react"
import { authService } from "../api/auth/auth-service"

interface User {
  id: number
  username: string
  email: string
  [key: string]: any
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  anonymousId: string | null
  login: (identifier: string, password: string) => Promise<void>
  register: (email: string, username: string, password: string) => Promise<void>
  googleAuth: (idToken: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [anonymousId, setAnonymousId] = useState<string | null>(null)

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Get anonymous ID
        const anonId = await authService.getAnonymousId()
        setAnonymousId(anonId)

        // Check if user is authenticated
        const userData = await authService.getUserData()
        if (userData) {
          setUser(userData)
          setIsAuthenticated(true)
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  // Login function
  const login = async (identifier: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await authService.login(identifier, password)
      setUser(response.user)
      setIsAuthenticated(true)
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Register function
  const register = async (email: string, username: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await authService.register(email, username, password)
      setUser(response.user)
      setIsAuthenticated(true)
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Google authentication function
  const googleAuth = async (idToken: string) => {
    setIsLoading(true)
    try {
      const response = await authService.googleAuth(idToken)
      setUser(response.user)
      setIsAuthenticated(true)
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Logout function
  const logout = async () => {
    setIsLoading(true)
    try {
      await authService.clearAuthData()
      setUser(null)
      setIsAuthenticated(false)
    } catch (error) {
      console.error("Error during logout:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        anonymousId,
        login,
        register,
        googleAuth,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

