"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Dimensions,
  ScrollView,
  Image,
  ImageBackground,
} from "react-native"
import { useNavigation, useIsFocused } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"
import type { RootStackParamList } from "../types/navigation"
import { authService } from "../api/auth/auth-service"
import Animated, {
  FadeInDown,
  FadeOutDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated"
// Import Lucide icons
import {
  ArrowLeft,
  Edit,
  Lock,
  LogOut,
  ChevronRight,
  AlertTriangle,
  User,
  Bell,
  Bookmark,
  Building,
} from "lucide-react-native"
import { LinearGradient } from "expo-linear-gradient"

const { width, height } = Dimensions.get("window")
type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList>

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigation = useNavigation<ProfileScreenNavigationProp>()
  const isFocused = useIsFocused()

  // Animation values using Reanimated
  const opacity = useSharedValue(0)
  const translateY = useSharedValue(50)

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    }
  })

  // Vérifier l'authentification à chaque fois que l'écran est affiché
  useEffect(() => {
    if (isFocused) {
      checkAuthAndLoadData()
    }
  }, [isFocused])

  // Animation d'entrée
  useEffect(() => {
    if (!loading) {
      opacity.value = withTiming(1, { duration: 800 })
      translateY.value = withTiming(0, { duration: 800 })
    }
  }, [loading])

  // Fonction pour vérifier l'authentification et charger les données
  const checkAuthAndLoadData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Vérifier si l'utilisateur est authentifié
      const isAuthenticated = await authService.isAuthenticated()
      if (!isAuthenticated) {
        // Rediriger vers l'écran d'authentification sans afficher d'erreur
        navigation.replace("Auth")
        return
      }

      // Charger les données utilisateur
      const userData = await authService.getUserData()
      if (!userData) {
        throw new Error("No user data found")
      }

      setUser(userData)
    } catch (error: any) {
      console.error("Error loading user data:", error)
      // Ne pas afficher d'erreur, simplement rediriger
      if (error.message === "No user data found") {
        navigation.replace("Auth")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      setLoading(true)
      // Utiliser clearAuthData pour la déconnexion
      await authService.clearAuthData()
      // Naviguer vers l'écran d'authentification
      navigation.replace("Auth")
    } catch (error: any) {
      console.error("Error during logout:", error)
      setError(`Error during logout: ${error.message || "Unknown error"}`)
      setLoading(false)
    }
  }

  const handleEditProfile = () => {
    // Pour l'instant, juste afficher un message
    setError("Edit Profile feature will be available soon!")
    setTimeout(() => setError(null), 3000)
  }

  const handleSettings = () => {
    // Naviguer vers l'écran de gestion des appareils
    navigation.navigate("DeviceSessions")
  }

  // Fonction pour retourner à l'écran d'accueil
  const handleGoBack = () => {
    navigation.navigate("Home")
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000000" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    )
  }

  // Obtenir les initiales de l'utilisateur pour l'avatar
  const getInitials = () => {
    if (!user?.username) return "U"
    return user.username.charAt(0).toUpperCase()
  }

  // Menu items data with Lucide icons
  const menuItems = [
    {
      id: "configure-profile",
      title: "Configure Profile",
      icon: User,
      onPress: handleEditProfile,
      chevron: true,
    },
    {
      id: "settings",
      title: "Display & Notifications Settings",
      icon: Bell,
      onPress: handleSettings,
      chevron: true,
    },
    {
      id: "logout",
      title: "Logout",
      icon: LogOut,
      onPress: handleLogout,
      chevron: false,
      color: "#E74C3C",
    },
  ]

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#000000" barStyle="light-content" />

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <ImageBackground source={require("../assets/images/back.jpg")} style={styles.backgroundImage}>
          <LinearGradient colors={["rgba(0, 0, 0, 0.04)", "rgba(0, 0, 0, 0.19)"]} style={styles.gradientOverlay}>
            {/* Header avec titre */}
            <View style={styles.header}>
              <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
                <ArrowLeft size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Profile</Text>
              <View style={{ width: 40 }} />
            </View>

            {/* Carte de profil */}
            <View style={styles.profileSection}>
              {/* Avatar */}
              <View style={styles.avatarContainer}>
                {user?.profileImage ? (
                  <Image source={{ uri: user.profileImage }} style={styles.avatarImage} resizeMode="cover" />
                ) : (
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{getInitials()}</Text>
                  </View>
                )}
              </View>

              {/* Informations utilisateur */}
              <View style={styles.userInfoContainer}>
                <Text style={styles.username}>{user?.username || "Joyce Martin"}</Text>
                <TouchableOpacity style={styles.editProfileButton} onPress={handleEditProfile}>
                  <Edit size={14} color="#FFFFFF" />
                  <Text style={styles.editProfileText}>Edit Profile</Text>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>

        <Animated.View style={[styles.content, animatedStyle]}>
          {/* Menu Items */}
          <View style={styles.menuContainer}>
            {menuItems.map((item, index) => (
              <Animated.View key={item.id} entering={FadeInDown.delay(100 * index).springify()}>
                <TouchableOpacity style={styles.menuItem} onPress={item.onPress} activeOpacity={0.7}>
                  <View style={[styles.menuIconContainer, item.id === "logout" && styles.logoutIconContainer]}>
                    <item.icon size={20} color={item.id === "logout" ? "#000000" : "#000000"} />
                  </View>
                  <Text style={[styles.menuText, item.id === "logout" && styles.logoutText]}>{item.title}</Text>
                  {item.chevron && <ChevronRight size={18} color="#CCCCCC" />}
                </TouchableOpacity>
                {index < menuItems.length - 1 && <View style={styles.menuDivider} />}
              </Animated.View>
            ))}
          </View>

          {/* Version de l'application */}
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </Animated.View>
      </ScrollView>

      {/* Error Banner */}
      {error && (
        <Animated.View style={styles.errorBanner} entering={FadeInDown} exiting={FadeOutDown}>
          <AlertTriangle size={18} color="#000000" style={{ marginRight: 10 }} />
          <Text style={styles.errorBannerText}>{error}</Text>
        </Animated.View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContainer: {
    flexGrow: 1,
  },
  backgroundImage: {
    width: "100%",
  },
  gradientOverlay: {
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#000000",
    fontWeight: "500",
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  avatarContainer: {
    alignItems: "center",
    position: "relative",
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  avatarText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#000000",
  },
  userInfoContainer: {
    alignItems: "center",
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  editProfileButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  editProfileText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 5,
  },
  menuContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  menuDivider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginLeft: 56,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  logoutIconContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  menuText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: "#333333",
  },
  logoutText: {
    color: "#000000",
    fontWeight: "600",
  },
  versionText: {
    marginBottom: 24,
    textAlign: "center",
    fontSize: 12,
    color: "#999999",
  },
  errorBanner: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#000000",
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  errorBannerText: {
    color: "#333333",
    fontSize: 14,
    flex: 1,
    fontWeight: "500",
  },
})
