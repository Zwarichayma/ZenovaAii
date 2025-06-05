"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ActivityIndicator } from "react-native"
import { useNavigation } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"
import type { RootStackParamList } from "../types/navigation"
import { authService } from "../api/auth/auth-service"

type AuthCheckNavigationProp = StackNavigationProp<RootStackParamList>

export default function AuthCheckScreen() {
  const [isChecking, setIsChecking] = useState(true)
  const navigation = useNavigation<AuthCheckNavigationProp>()

  useEffect(() => {
    checkAuthenticationStatus()
  }, [])

  const checkAuthenticationStatus = async () => {
    try {
      console.log("🔍 Checking authentication status...")

      // Vérifier l'authentification par token et UUID
      const isAuthenticated = await authService.isAuthenticated()

      if (isAuthenticated) {
        console.log("✅ User is authenticated, navigating to WellnessProfile")
        navigation.replace("WellnessProfile" as any)
      } else {
        console.log("❌ User is not authenticated, navigating to Auth")
        navigation.replace("Auth" as any)
      }
    } catch (error) {
      console.error("Error checking authentication:", error)
      // En cas d'erreur, rediriger vers l'écran de connexion
      navigation.replace("Auth" as any)
    } finally {
      setIsChecking(false)
    }
  }

  if (isChecking) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Checking authentication...</Text>
      </View>
    )
  }

  return null
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666666",
  },
})
