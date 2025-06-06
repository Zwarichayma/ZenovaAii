"use client"

import { useState, useEffect, useCallback } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  Dimensions,
  ImageBackground,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native"
import { useNavigation, useFocusEffect } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"
import type { RootStackParamList } from "../types/navigation"
import * as DocumentPicker from "expo-document-picker"
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"
import {
  Save,
  Upload,
  AlertTriangle,
  Check,
  Edit3,
  User,
  Activity,
  Heart,
  Moon,
  Droplets,
  LogOut,
  Home,
  RefreshCw,
  Shield,
  Calendar,
} from "lucide-react-native"
import { LinearGradient } from "expo-linear-gradient"
import CustomPicker from "../components/CustomPicker"
import { useAuth } from "@/context/AuthContext"
import { wellnessService } from "@/api/wellness-service/route"

const { width } = Dimensions.get("window")
type WellnessProfileNavigationProp = StackNavigationProp<RootStackParamList>

interface WellnessData {
  weight: string
  height: string
  age: string
  sex: string
  weightGoal: string
  allergies: string[]
  mood: string
  medicalReport: any
  chronicConditions: string[]
  activityLevel: string
  sleepHours: string
  waterIntake: string
  bmi: string
}

export default function WellnessProfileScreen() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [hasData, setHasData] = useState(false)
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)
  const [connectionTested, setConnectionTested] = useState(false)

  const [wellnessData, setWellnessData] = useState<WellnessData>({
    weight: "",
    height: "",
    age: "",
    sex: "",
    weightGoal: "",
    allergies: [],
    mood: "",
    medicalReport: null,
    chronicConditions: [],
    activityLevel: "",
    sleepHours: "",
    waterIntake: "",
    bmi: "",
  })

  // Auth context
  const { user, logout } = useAuth()

  // Animation values
  const opacity = useSharedValue(0)
  const translateY = useSharedValue(50)

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    }
  })

  const navigation = useNavigation<WellnessProfileNavigationProp>()

  // ✅ AMÉLIORATION: Test de connexion au démarrage
  const testAPIConnection = async () => {
    try {
      console.log("🔍 Testing API connection...")
      const isConnected = await wellnessService.testConnection()
      setConnectionTested(true)

      if (!isConnected) {
        setError("Unable to connect to the server. Please check your network connection.")
        return false
      }
      return true
    } catch (error) {
      console.error("❌ Connection test failed:", error)
      setError("Connection test failed. Please check your network.")
      setConnectionTested(true)
      return false
    }
  }

  // ✅ AMÉLIORATION: Charger les données avec test de connexion
  useFocusEffect(
    useCallback(() => {
      console.log("🔄 Screen focused, initializing...")
      if (user?.id) {
        initializeScreen()
      }
    }, [user?.id]),
  )

  const initializeScreen = async () => {
    try {
      setLoading(true)
      setError(null)

      // Test de connexion d'abord
      const connectionOK = await testAPIConnection()
      if (!connectionOK) {
        setIsEditing(true) // Mode édition si pas de connexion
        return
      }

      // Puis charger les données
      await loadWellnessData()
    } catch (error) {
      console.error("❌ Error initializing screen:", error)
      setError("Failed to initialize. Please try again.")
    } finally {
      setLoading(false)
      setInitialLoadComplete(true)
    }
  }

  useEffect(() => {
    // Entry animation
    opacity.value = withTiming(1, { duration: 800 })
    translateY.value = withTiming(0, { duration: 800 })
  }, [])

  // ✅ FONCTION CORRIGÉE: Débogage direct de l'API
  const debugDirectAPI = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("🔍 DEBUG: Tentative d'accès direct à l'API...")

      // Accès direct à l'API pour vérifier la structure des données
      const headers = {
        Authorization: `Bearer 6e3e7d4353b4e4ad2db82c3a91145ae7b9245c7eb5318dcf77db9a9267f621066c24d9cfea255f458117486715465f7aff103744afa4ce13f128dfed55220257b949a558e83f963f14c68991ec3389ad8fbf34a23da5911d2b23a02820bdd6033f5fae80a90916ee82ca7e839e9a4ff74fceb51bfc1c5b5afa2a7e2d948aeaed`,
        "Content-Type": "application/json",
      }

      // Utiliser directement le nom d'utilisateur au lieu de l'ID
      const url = `http://192.168.100.7:1337/api/profile-users?populate=*&filters[user][username][$eq]=houyemm`

      console.log("📡 DEBUG URL:", url)

      const response = await fetch(url, {
        method: "GET",
        headers,
      })

      console.log("📊 DEBUG Response status:", response.status)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      console.log("📦 DEBUG Raw API Response:", JSON.stringify(result, null, 2))

      if (result.data && result.data.length > 0) {
        // ✅ CORRECTION: Dans Strapi v5, les données sont directement dans data[0]
        const profileData = result.data[0]

        if (!profileData) {
          throw new Error("No profile data found in the response")
        }

        console.log("🔄 Profile attributes found:", JSON.stringify(profileData, null, 2))

        // ✅ CORRECTION: Mapper les données avec vérifications
        const mappedData = {
          weight: profileData.weight ? profileData.weight.toString() : "",
          height: profileData.height ? profileData.height.toString() : "",
          age: profileData.age ? profileData.age.toString() : "",
          sex: profileData.gendre || "",
          weightGoal: profileData.weight_goal || "",
          allergies: profileData.Allergies
            ? profileData.Allergies.split(",")
                .map((a: string) => a.trim())
                .filter((a: string) => a.length > 0)
            : [],
          mood: profileData.current_mood || "",
          medicalReport: profileData.medical_report || null,
          chronicConditions: profileData.medical_condition
            ? profileData.medical_condition
                .split(",")
                .map((c: string) => c.trim())
                .filter((c: string) => c.length > 0)
            : [],
          activityLevel: profileData.physical_activity || "",
          sleepHours: profileData.sleep_hours ? profileData.sleep_hours.toString() : "",
          waterIntake: profileData.water_intake ? profileData.water_intake.toString() : "",
          bmi: "", // Calculé côté client
        }

        console.log("✅ Mapped data:", JSON.stringify(mappedData, null, 2))

        // ✅ CORRECTION: Mettre à jour l'état avec les données récupérées
        setWellnessData(mappedData)
        setHasData(true)
        setIsEditing(false)

        // Calculer le BMI
        if (mappedData.weight && mappedData.height) {
          const weight = Number.parseFloat(mappedData.weight)
          const height = Number.parseFloat(mappedData.height) / 100
          if (weight > 0 && height > 0) {
            const bmi = weight / (height * height)
            setWellnessData((prev) => ({ ...prev, bmi: bmi.toFixed(1) }))
          }
        }

        Alert.alert("Succès", "Données récupérées directement de l'API avec succès!")
      } else {
        throw new Error("Aucune donnée trouvée dans la réponse de l'API")
      }
    } catch (error: any) {
      console.error("❌ DEBUG Error:", error)
      setError(`Erreur de débogage: ${error.message}`)
      Alert.alert("Erreur", `Impossible de récupérer les données: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Modifiez la fonction loadWellnessData pour utiliser le nom d'utilisateur au lieu de l'ID
  const loadWellnessData = async () => {
    if (!user?.id) {
      console.log("❌ No user ID available")
      return
    }

    try {
      console.log("📊 Loading wellness data for user:", user.id)
      setError(null)

      // ⚠️ CORRECTION: Essayer d'abord avec l'ID, puis avec le nom d'utilisateur si disponible
      const savedData = await wellnessService.getWellnessData(user.id)

      // Si aucune donnée n'est trouvée, essayer le débogage direct
      if (!savedData) {
        console.log("🔄 No data found with user ID, trying direct API access...")
        await debugDirectAPI()
        return // La fonction debugDirectAPI gère déjà la mise à jour de l'état
      }

      if (savedData) {
        console.log("✅ Wellness data loaded successfully:", savedData)
        setWellnessData(savedData)
        setHasData(true)
        setIsEditing(false)

        // Calculer le BMI si les données sont disponibles
        if (savedData.weight && savedData.height) {
          const weight = Number.parseFloat(savedData.weight)
          const height = Number.parseFloat(savedData.height) / 100
          if (weight > 0 && height > 0) {
            const bmi = weight / (height * height)
            setWellnessData((prev) => ({ ...prev, bmi: bmi.toFixed(1) }))
          }
        }
      }
    } catch (error: any) {
      console.error("❌ Error loading wellness data:", error)
      setError(error.message || "Failed to load wellness data")

      // En cas d'erreur, essayer le débogage direct
      console.log("🔄 Trying direct API access due to error...")
      await debugDirectAPI()
    }
  }

  // ✅ NOUVELLE FONCTION: Rafraîchir les données manuellement
  const refreshData = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      setError(null)
      await loadWellnessData()
    } catch (error: any) {
      setError(error.message || "Failed to refresh data")
    } finally {
      setLoading(false)
    }
  }

  const calculateBMI = useCallback(() => {
    if (wellnessData.weight && wellnessData.height) {
      const weight = Number.parseFloat(wellnessData.weight)
      const height = Number.parseFloat(wellnessData.height) / 100
      if (weight > 0 && height > 0) {
        const bmi = weight / (height * height)
        setWellnessData((prev) => ({ ...prev, bmi: bmi.toFixed(1) }))
      }
    }
  }, [wellnessData.weight, wellnessData.height])

  useEffect(() => {
    calculateBMI()
  }, [calculateBMI])

  const saveWellnessData = async () => {
    try {
      console.log("💾 Save button clicked")

      if (!user?.id) {
        console.error("❌ No user profile found")
        Alert.alert("Error", "User not found. Please log in again.")
        return
      }

      setLoading(true)
      setError(null)

      console.log("📤 Saving wellness data...")
      await wellnessService.saveWellnessData(user.id, wellnessData)

      console.log("✅ Wellness data saved successfully")
      setHasData(true)
      setIsEditing(false) // Passer en mode affichage après sauvegarde

      Alert.alert("Success", "Your wellness profile has been saved successfully!", [{ text: "OK", style: "default" }])

      // Recharger les données pour s'assurer qu'elles sont à jour
      setTimeout(() => {
        loadWellnessData()
      }, 1000)
    } catch (error: any) {
      console.error("❌ Error saving wellness data:", error)
      const errorMessage = error.message || "Failed to save wellness profile"
      setError(`Error saving data: ${errorMessage}`)
      Alert.alert("Error", errorMessage, [{ text: "OK", style: "default" }])
    } finally {
      setLoading(false)
    }
  }

  const toggleEditMode = () => {
    console.log("✏️ Toggling edit mode")
    setIsEditing(!isEditing)
    setError(null) // Clear any existing errors
  }

  const uploadMedicalReport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
        copyToCacheDirectory: true,
      })

      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0]

        if (user?.id) {
          setLoading(true)

          try {
            const uploadedFile = await wellnessService.uploadMedicalReport(
              user.id,
              file.uri,
              file.name,
              file.mimeType || "application/octet-stream",
            )

            setWellnessData((prev) => ({
              ...prev,
              medicalReport: uploadedFile,
            }))

            Alert.alert("Success", "Medical report uploaded successfully!")
          } catch (uploadError) {
            console.error("Error uploading file:", uploadError)
            setError("Failed to upload medical report")
          } finally {
            setLoading(false)
          }
        }
      }
    } catch (error) {
      console.error("Error selecting medical report:", error)
      setError("Error selecting medical report")
    }
  }

  const handleGoHome = () => {
    navigation.navigate("MainTabs", { screen: "Home" } as never)
  }

  const handleLogout = async () => {
    try {
      setLoading(true)

      Alert.alert("Logout", "Are you sure you want to log out?", [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => setLoading(false),
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await logout()
              console.log("✅ Logout successful")
              navigation.navigate("Auth" as any)
              Alert.alert("Success", "You have been logged out successfully")
            } catch (error) {
              console.error("❌ Error during logout:", error)
              Alert.alert("Error", "Failed to log out. Please try again.")
            } finally {
              setLoading(false)
            }
          },
        },
      ])
    } catch (error) {
      console.error("❌ Error preparing logout:", error)
      setLoading(false)
      Alert.alert("Error", "Failed to prepare logout. Please try again.")
    }
  }

  const toggleAllergy = (allergy: string) => {
    if (!isEditing) return
    setWellnessData((prev) => ({
      ...prev,
      allergies: prev.allergies.includes(allergy)
        ? prev.allergies.filter((a) => a !== allergy)
        : [...prev.allergies, allergy],
    }))
  }

  const toggleCondition = (condition: string) => {
    if (!isEditing) return
    setWellnessData((prev) => ({
      ...prev,
      chronicConditions: prev.chronicConditions.includes(condition)
        ? prev.chronicConditions.filter((c) => c !== condition)
        : [...prev.chronicConditions, condition],
    }))
  }

  const getInitials = () => {
    if (!user?.username) return "MW"
    return user.username.substring(0, 2).toUpperCase()
  }

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { text: "Underweight", color: "#3B82F6" }
    if (bmi < 25) return { text: "Normal weight", color: "#10B981" }
    if (bmi < 30) return { text: "Overweight", color: "#F59E0B" }
    return { text: "Obesity", color: "#EF4444" }
  }

  const sexOptions = ["Male", "Female", "Other"]
  const moodOptions = ["😊 Excellent", "😌 Good", "😐 Average", "😔 Tired", "😰 Stressed"]
  const activityOptions = ["Sedentary", "Lightly active", "Moderately active", "Very active", "Extremely active"]
  const weightGoalOptions = ["Lose weight", "Maintain weight", "Gain weight", "Build muscle"]
  const commonAllergies = ["Peanuts", "Seafood", "Lactose", "Gluten", "Eggs", "Soy", "Tree nuts", "Fish"]
  const commonConditions = ["Diabetes", "Hypertension", "Asthma", "Arthritis", "Migraine", "Anxiety", "Depression"]

  // Afficher un loader pendant le chargement initial
  if (!initialLoadComplete) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>
            {connectionTested ? "Loading your wellness profile..." : "Connecting to server..."}
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  // Fonction pour afficher les données en mode lecture
  const renderDisplayMode = () => (
    <Animated.View style={[styles.content, animatedStyle]}>
      {/* Cartes d'informations */}
      <View style={styles.cardsContainer}>
        {/* Carte Informations de base */}
        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <User size={24} color="#667eea" />
            <Text style={styles.cardTitle}>Basic Information</Text>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Weight:</Text>
              <Text style={styles.infoValue}>{wellnessData.weight || "--"} kg</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Height:</Text>
              <Text style={styles.infoValue}>{wellnessData.height || "--"} cm</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Age:</Text>
              <Text style={styles.infoValue}>{wellnessData.age || "--"} years</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Gender:</Text>
              <Text style={styles.infoValue}>{wellnessData.sex || "--"}</Text>
            </View>
            {wellnessData.bmi && (
              <View style={styles.bmiRow}>
                <Text style={styles.infoLabel}>BMI:</Text>
                <View style={styles.bmiContainer}>
                  <Text style={styles.bmiValue}>{wellnessData.bmi}</Text>
                  <Text
                    style={[styles.bmiCategory, { color: getBMICategory(Number.parseFloat(wellnessData.bmi)).color }]}
                  >
                    {getBMICategory(Number.parseFloat(wellnessData.bmi)).text}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Carte Objectifs et Style de vie */}
        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <Activity size={24} color="#10B981" />
            <Text style={styles.cardTitle}>Goals & Lifestyle</Text>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Weight Goal:</Text>
              <Text style={styles.infoValue}>{wellnessData.weightGoal || "--"}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Activity Level:</Text>
              <Text style={styles.infoValue}>{wellnessData.activityLevel || "--"}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Current Mood:</Text>
              <Text style={styles.infoValue}>{wellnessData.mood || "--"}</Text>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.iconLabelContainer}>
                <Moon size={16} color="#666666" />
                <Text style={styles.infoLabel}>Sleep Hours:</Text>
              </View>
              <Text style={styles.infoValue}>{wellnessData.sleepHours || "--"} hours</Text>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.iconLabelContainer}>
                <Droplets size={16} color="#666666" />
                <Text style={styles.infoLabel}>Water Intake:</Text>
              </View>
              <Text style={styles.infoValue}>{wellnessData.waterIntake || "--"} L/day</Text>
            </View>
          </View>
        </View>

        {/* Carte Santé */}
        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <Heart size={24} color="#EF4444" />
            <Text style={styles.cardTitle}>Health Information</Text>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.infoColumn}>
              <Text style={styles.infoLabel}>Allergies:</Text>
              <View style={styles.tagsContainer}>
                {wellnessData.allergies.length > 0 ? (
                  wellnessData.allergies.map((allergy, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{allergy}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.infoValue}>None</Text>
                )}
              </View>
            </View>
            <View style={styles.infoColumn}>
              <Text style={styles.infoLabel}>Medical Conditions:</Text>
              <View style={styles.tagsContainer}>
                {wellnessData.chronicConditions.length > 0 ? (
                  wellnessData.chronicConditions.map((condition, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{condition}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.infoValue}>None</Text>
                )}
              </View>
            </View>
            {wellnessData.medicalReport && (
              <View style={styles.infoColumn}>
                <Text style={styles.infoLabel}>Medical Report:</Text>
                <Text style={styles.infoValue}>📄 {wellnessData.medicalReport.name || "Uploaded"}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Boutons d'action */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={styles.homeButton} onPress={handleGoHome} disabled={loading}>
            <Home size={20} color="#FFFFFF" />
            <Text style={styles.homeButtonText}>Back to Home</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} disabled={loading}>
            <LogOut size={20} color="#FFFFFF" />
            <Text style={styles.logoutButtonText}>{loading ? "Logging out..." : "Logout"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  )

  // Fonction pour afficher le mode édition (reste identique)
  const renderEditMode = () => (
    <Animated.View style={[styles.content, animatedStyle]}>
      {/* Loading Indicator */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Saving...</Text>
        </View>
      )}

      {/* Basic Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Basic Information</Text>

        <View style={styles.row}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Weight (kg)</Text>
            <TextInput
              style={styles.input}
              value={wellnessData.weight}
              onChangeText={(text) => setWellnessData((prev) => ({ ...prev, weight: text }))}
              placeholder="70"
              keyboardType="numeric"
              placeholderTextColor="#A0A0A0"
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Height (cm)</Text>
            <TextInput
              style={styles.input}
              value={wellnessData.height}
              onChangeText={(text) => setWellnessData((prev) => ({ ...prev, height: text }))}
              placeholder="175"
              keyboardType="numeric"
              placeholderTextColor="#A0A0A0"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Age</Text>
            <TextInput
              style={styles.input}
              value={wellnessData.age}
              onChangeText={(text) => setWellnessData((prev) => ({ ...prev, age: text }))}
              placeholder="25"
              keyboardType="numeric"
              placeholderTextColor="#A0A0A0"
            />
          </View>
          <View style={styles.inputContainer}>
            <CustomPicker
              label="Gender"
              value={wellnessData.sex}
              placeholder="Select"
              options={sexOptions}
              onSelect={(value) => setWellnessData((prev) => ({ ...prev, sex: value }))}
            />
          </View>
        </View>
      </View>

      {/* Goals */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎯 Goals</Text>
        <CustomPicker
          label="Weight goal"
          value={wellnessData.weightGoal}
          placeholder="Select a goal"
          options={weightGoalOptions}
          onSelect={(value) => setWellnessData((prev) => ({ ...prev, weightGoal: value }))}
        />
      </View>

      {/* Lifestyle */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏃‍♂️ Lifestyle</Text>
        <CustomPicker
          label="Physical activity level"
          value={wellnessData.activityLevel}
          placeholder="Select"
          options={activityOptions}
          onSelect={(value) => setWellnessData((prev) => ({ ...prev, activityLevel: value }))}
        />

        <View style={styles.row}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Sleep hours</Text>
            <TextInput
              style={styles.input}
              value={wellnessData.sleepHours}
              onChangeText={(text) => setWellnessData((prev) => ({ ...prev, sleepHours: text }))}
              placeholder="8"
              keyboardType="numeric"
              placeholderTextColor="#A0A0A0"
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Water per day (L)</Text>
            <TextInput
              style={styles.input}
              value={wellnessData.waterIntake}
              onChangeText={(text) => setWellnessData((prev) => ({ ...prev, waterIntake: text }))}
              placeholder="2.5"
              keyboardType="numeric"
              placeholderTextColor="#A0A0A0"
            />
          </View>
        </View>
      </View>

      {/* Mood */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>😊 Current mood</Text>
        <CustomPicker
          label=""
          value={wellnessData.mood}
          placeholder="How are you feeling?"
          options={moodOptions}
          onSelect={(value) => setWellnessData((prev) => ({ ...prev, mood: value }))}
        />
      </View>

      {/* Allergies */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚠️ Allergies</Text>
        <View style={styles.checkboxContainer}>
          {commonAllergies.map((allergy, index) => (
            <TouchableOpacity key={index} style={styles.checkboxItem} onPress={() => toggleAllergy(allergy)}>
              <View style={[styles.checkbox, wellnessData.allergies.includes(allergy) && styles.checkboxChecked]}>
                {wellnessData.allergies.includes(allergy) && <Check size={16} color="#FFFFFF" />}
              </View>
              <Text style={styles.checkboxLabel}>{allergy}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Medical conditions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏥 Medical conditions</Text>
        <View style={styles.checkboxContainer}>
          {commonConditions.map((condition, index) => (
            <TouchableOpacity key={index} style={styles.checkboxItem} onPress={() => toggleCondition(condition)}>
              <View
                style={[styles.checkbox, wellnessData.chronicConditions.includes(condition) && styles.checkboxChecked]}
              >
                {wellnessData.chronicConditions.includes(condition) && <Check size={16} color="#FFFFFF" />}
              </View>
              <Text style={styles.checkboxLabel}>{condition}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Medical report */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📄 Medical report</Text>
        <TouchableOpacity style={styles.uploadButton} onPress={uploadMedicalReport} disabled={loading}>
          <Upload size={24} color="#555555" />
          <Text style={styles.uploadButtonText}>
            {wellnessData.medicalReport
              ? `File: ${wellnessData.medicalReport.name || "Uploaded"}`
              : "Upload medical report"}
          </Text>
        </TouchableOpacity>
        <Text style={styles.uploadHint}>Accepted formats: PDF, JPG, PNG (Max 10MB)</Text>
      </View>

      {/* Save Button */}
      <TouchableOpacity
        style={[styles.saveButtonBottom, loading && styles.saveButtonDisabled]}
        onPress={saveWellnessData}
        disabled={loading}
      >
        <Save size={20} color="#FFFFFF" />
        <Text style={styles.saveButtonText}>{loading ? "Saving..." : "Save Profile"}</Text>
      </TouchableOpacity>

      {/* Boutons d'action */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity
          style={[styles.homeButton, loading && styles.homeButtonDisabled]}
          onPress={handleGoHome}
          disabled={loading}
        >
          <Home size={20} color="#FFFFFF" />
          <Text style={styles.homeButtonText}>Back to Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.logoutButton, loading && styles.logoutButtonDisabled]}
          onPress={handleLogout}
          disabled={loading}
        >
          <LogOut size={20} color="#FFFFFF" />
          <Text style={styles.logoutButtonText}>{loading ? "Logging out..." : "Logout"}</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="transparent" barStyle="dark-content" translucent />

      {/* Mobile Status Bar */}
      <View style={styles.statusBar}>
        <Text style={styles.statusTime}>4:21</Text>
        <View style={styles.statusIcons}>
          <Text style={styles.statusIcon}>📶</Text>
          <Text style={styles.statusIcon}>🔋</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Section - AMÉLIORÉ */}
        <View style={styles.heroContainer}>
          <ImageBackground
            source={require("../assets/images/back.jpg")}
            style={styles.heroBackground}
            imageStyle={styles.heroBackgroundImage}
          >
            <LinearGradient colors={["rgba(0, 0, 0, 0.3)", "rgba(0, 0, 0, 0.7)"]} style={styles.heroGradient}>
              {/* Header avec icônes Home et Edit au même niveau */}
              <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={handleGoHome}>
                  <Home size={20} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Wellness Profile</Text>
                <TouchableOpacity
                  style={styles.editHeaderButton}
                  onPress={isEditing ? saveWellnessData : toggleEditMode}
                  disabled={loading}
                >
                  {isEditing ? <Save size={20} color="#FFFFFF" /> : <Edit3 size={20} color="#FFFFFF" />}
                </TouchableOpacity>
              </View>

              {/* Profile Content */}
              <View style={styles.profileContent}>
                <View style={styles.avatarContainer}>
                  {user?.profileImage ? (
                    <Image source={{ uri: user.profileImage }} style={styles.avatarImage} resizeMode="cover" />
                  ) : (
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{getInitials()}</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.userName}>{user?.username || "User"}</Text>
                <Text style={styles.userQuote}>
                  {hasData && !isEditing
                    ? "Track your health metrics and wellness journey"
                    : "Complete your wellness profile to get personalized recommendations."}
                </Text>

               
              </View>
            </LinearGradient>
          </ImageBackground>
        </View>

        {/* Nouvelle section de statistiques */}
        {hasData && !isEditing && (
          <View style={styles.statsOverview}>
            <View style={styles.statCard}>
              <Shield size={24} color="#667eea" />
              <Text style={styles.statCardValue}>{wellnessData.bmi || "--"}</Text>
              <Text style={styles.statCardLabel}>BMI</Text>
            </View>

            <View style={styles.statCard}>
              <Activity size={24} color="#10B981" />
              <Text style={styles.statCardValue}>
                {wellnessData.activityLevel ? wellnessData.activityLevel.split(" ")[0] : "--"}
              </Text>
              <Text style={styles.statCardLabel}>Activity</Text>
            </View>

            <View style={styles.statCard}>
              <Calendar size={24} color="#F59E0B" />
              <Text style={styles.statCardValue}>{wellnessData.age || "--"}</Text>
              <Text style={styles.statCardLabel}>Age</Text>
            </View>
          </View>
        )}

        {/* Content - Mode conditionnel */}
        {hasData && !isEditing ? renderDisplayMode() : renderEditMode()}
      </ScrollView>

      {/* Error/Success Banner */}
      {error && (
        <Animated.View style={styles.banner} entering={FadeInDown}>
          <AlertTriangle size={18} color="#EF4444" style={{ marginRight: 10 }} />
          <Text style={styles.bannerText}>{error}</Text>
          <TouchableOpacity onPress={() => setError(null)} style={styles.bannerClose}>
            <Text style={styles.bannerCloseText}>✕</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </SafeAreaView>
  )
}

// STYLES AMÉLIORÉS
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  statusBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
  },
  statusTime: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
  statusIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statusIcon: {
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  heroContainer: {
    height: 300,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    overflow: "hidden",
  },
  heroBackground: {
    flex: 1,
  },
  heroBackgroundImage: {
    borderRadius: 20,
  },
  heroGradient: {
    flex: 1,
    justifyContent: "space-between",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  // ✅ NOUVEAU: Bouton d'édition dans le header
  editHeaderButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  headerRight: {
    width: 40,
    alignItems: "flex-end",
  },
  profileContent: {
    alignItems: "center",
    paddingBottom: 20,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#555555",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
    textAlign: "center",
  },
  userQuote: {
    fontSize: 14,
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 20,
    opacity: 0.9,
    maxWidth: 280,
    marginBottom: 20,
  },
  // ✅ NOUVEAU: Bouton de rafraîchissement centré
  refreshActionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    gap: 8,
  },
  refreshActionText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  // Nouvelle section de statistiques
  statsOverview: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginTop: 16,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  statCardValue: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333333",
    marginTop: 8,
  },
  statCardLabel: {
    fontSize: 12,
    color: "#666666",
    marginTop: 4,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 20,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
  },
  // Styles pour le mode affichage
  displayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  displayTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F8FF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E8F0",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#667eea",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  editButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  cardsContainer: {
    gap: 16,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
  },
  cardContent: {
    gap: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  infoColumn: {
    gap: 8,
  },
  iconLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: "#666666",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 14,
    color: "#333333",
    fontWeight: "600",
  },
  bmiRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    marginTop: 8,
  },
  bmiContainer: {
    alignItems: "flex-end",
  },
  bmiValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
  },
  bmiCategory: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    backgroundColor: "#F0F8FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E0E8F0",
  },
  tagText: {
    fontSize: 12,
    color: "#667eea",
    fontWeight: "500",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  homeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10B981",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  homeButtonDisabled: {
    opacity: 0.5,
  },
  homeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  logoutButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EF4444",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  logoutButtonDisabled: {
    opacity: 0.5,
  },
  logoutButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  // Styles pour le mode édition
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  inputContainer: {
    flex: 1,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555555",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
    color: "#333333",
  },
  checkboxContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  checkboxItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    minWidth: "45%",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    borderRadius: 6,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: "#555555",
    borderColor: "#555555",
  },
  checkboxLabel: {
    fontSize: 14,
    color: "#333333",
    flex: 1,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#E0E0E0",
    borderStyle: "dashed",
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 16,
    gap: 12,
  },
  uploadButtonText: {
    fontSize: 16,
    color: "#555555",
    fontWeight: "600",
  },
  uploadHint: {
    fontSize: 12,
    color: "#A0A0A0",
    textAlign: "center",
    marginTop: 8,
  },
  saveButtonBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#667eea",
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20,
    gap: 8,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  banner: {
    position: "absolute",
    bottom: 30,
    left: 16,
    right: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#EF4444",
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  bannerText: {
    color: "#333333",
    fontSize: 14,
    flex: 1,
    fontWeight: "500",
  },
  bannerClose: {
    marginLeft: 8,
    padding: 4,
  },
  bannerCloseText: {
    color: "#666666",
    fontSize: 16,
    fontWeight: "bold",
  },
  debugButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6366F1",
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },
  debugButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
})
