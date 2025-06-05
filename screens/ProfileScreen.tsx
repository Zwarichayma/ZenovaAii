"use client"

import { useEffect } from "react"
import { View, Text, StyleSheet, ActivityIndicator } from "react-native"
import { useNavigation } from "@react-navigation/native"
import WellnessProfileScreen from "./WellnessProfileScreen"
import { useAuth } from "@/context/AuthContext"

export default function ProfileScreen() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const navigation = useNavigation()

  useEffect(() => {
    // Si l'utilisateur n'est pas authentifié, rediriger vers l'écran d'authentification
    if (!isLoading && !isAuthenticated) {
      navigation.navigate("Auth" as never)
    }
  }, [isAuthenticated, isLoading, navigation])

  // Afficher un indicateur de chargement pendant la vérification
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Checking authentication...</Text>
      </View>
    )
  }

  // Si l'utilisateur n'est pas authentifié, afficher un message
  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Redirecting to login...</Text>
      </View>
    )
  }

  // ✅ AFFICHER DIRECTEMENT LE WELLNESS PROFILE
  return <WellnessProfileScreen />
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
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
  message: {
    fontSize: 16,
    color: "#666666",
  },
})
