"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  Modal,
  Dimensions,
  ImageBackground,
  Image,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"
import type { RootStackParamList } from "../types/navigation"
import { authService } from "../api/auth/auth-service"
import * as DocumentPicker from 'expo-document-picker'
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated"
import {
  ArrowLeft,
  Save,
  Upload,
  User,
  Scale,
  Target,
  AlertTriangle,
  Calendar,
  Heart,
  Activity,
  FileText,
  ChevronDown,
  Check,
  Edit,
} from "lucide-react-native"
import { LinearGradient } from "expo-linear-gradient"
import { wellnessService } from "@/api/wellness-service/route"

const { width } = Dimensions.get("window")
type WellnessProfileNavigationProp = StackNavigationProp<RootStackParamList>

interface UserProfile {
  username: string
  email: string
  profileImage: string | null
  joinDate: string
}

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
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<string>("")
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const navigation = useNavigation<WellnessProfileNavigationProp>()

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

  // Animation values
  const opacity = useSharedValue(0)
  const translateY = useSharedValue(50)

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    }
  })

  useEffect(() => {
    loadUserData()
    loadWellnessData()
    // Entry animation
    opacity.value = withTiming(1, { duration: 800 })
    translateY.value = withTiming(0, { duration: 800 })
  }, [])

  const loadUserData = async () => {
    try {
      const userData = await authService.getUserData()
      setUserProfile(userData)
    } catch (error) {
      console.error("Error loading user data:", error)
    }
  }

  const loadWellnessData = async () => {
    try {
      setLoading(true)
      const savedData = await wellnessService.getWellnessData(userProfile?.id || "")
      if (savedData) {
        setWellnessData(savedData)
      }
    } catch (error) {
      console.error("Error loading wellness data:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateBMI = () => {
    if (wellnessData.weight && wellnessData.height) {
      const weight = parseFloat(wellnessData.weight)
      const height = parseFloat(wellnessData.height) / 100
      const bmi = weight / (height * height)
      setWellnessData(prev => ({ ...prev, bmi: bmi.toFixed(1) }))
    }
  }

  useEffect(() => {
    calculateBMI()
  }, [wellnessData.weight, wellnessData.height])

  const saveWellnessData = async () => {
    try {
      setLoading(true)
      await wellnessService.saveWellnessData(userProfile?.id || "", wellnessData)
      setError("Wellness profile saved successfully!")
      setTimeout(() => setError(null), 3000)
    } catch (error: any) {
      console.error("Error saving wellness data:", error)
      setError(`Error saving data: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const uploadMedicalReport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      })

      if (!result.canceled && result.assets[0]) {
        setWellnessData(prev => ({
          ...prev,
          medicalReport: result.assets[0]
        }))
        setError("Medical report uploaded successfully!")
        setTimeout(() => setError(null), 3000)
      }
    } catch (error) {
      console.error("Error uploading medical report:", error)
      setError("Error uploading medical report")
    }
  }

  const handleGoBack = () => {
    navigation.goBack()
  }

  const openModal = (type: string) => {
    setModalType(type)
    setShowModal(true)
  }

  const selectOption = (option: string) => {
    if (modalType === "sex") {
      setWellnessData(prev => ({ ...prev, sex: option }))
    } else if (modalType === "mood") {
      setWellnessData(prev => ({ ...prev, mood: option }))
    } else if (modalType === "activityLevel") {
      setWellnessData(prev => ({ ...prev, activityLevel: option }))
    } else if (modalType === "weightGoal") {
      setWellnessData(prev => ({ ...prev, weightGoal: option }))
    }
    setShowModal(false)
  }

  const toggleAllergy = (allergy: string) => {
    setWellnessData(prev => ({
      ...prev,
      allergies: prev.allergies.includes(allergy)
        ? prev.allergies.filter(a => a !== allergy)
        : [...prev.allergies, allergy]
    }))
  }

  const toggleCondition = (condition: string) => {
    setWellnessData(prev => ({
      ...prev,
      chronicConditions: prev.chronicConditions.includes(condition)
        ? prev.chronicConditions.filter(c => c !== condition)
        : [...prev.chronicConditions, condition]
    }))
  }

  const getInitials = () => {
    if (!userProfile?.username) return "MW"
    return userProfile.username.substring(0, 2).toUpperCase()
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

  const renderModal = () => {
    let options: string[] = []
    let title = ""

    switch (modalType) {
      case "sex":
        options = sexOptions
        title = "Select your gender"
        break
      case "mood":
        options = moodOptions
        title = "How are you feeling today?"
        break
      case "activityLevel":
        options = activityOptions
        title = "Physical activity level"
        break
      case "weightGoal":
        options = weightGoalOptions
        title = "Weight goal"
        break
    }

    return (
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{title}</Text>
            {options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.modalOption}
                onPress={() => selectOption(option)}
              >
                <Text style={styles.modalOptionText}>{option}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    )
  }

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
        {/* Hero Section with User Profile */}
        <View style={styles.heroContainer}>
          <ImageBackground 
            source={require("../assets/images/back.jpg")} 
            style={styles.heroBackground}
            imageStyle={styles.heroBackgroundImage}
          >
            <LinearGradient
              colors={["rgba(0, 0, 0, 0.3)", "rgba(0, 0, 0, 0.7)"]}
              style={styles.heroGradient}
            >
              {/* Header */}
              <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
                  <ArrowLeft size={20} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Wellness Profile</Text>
                <TouchableOpacity style={styles.saveButton} onPress={saveWellnessData}>
                  <Save size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {/* Profile Content */}
              <View style={styles.profileContent}>
                {/* Avatar */}
                <View style={styles.avatarContainer}>
                  {userProfile?.profileImage ? (
                    <Image 
                      source={{ uri: userProfile.profileImage }} 
                      style={styles.avatarImage} 
                      resizeMode="cover" 
                    />
                  ) : (
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{getInitials()}</Text>
                    </View>
                  )}
                </View>

                {/* User Info */}
                <Text style={styles.userName}>
                  {userProfile?.username || "Miranda West"}
                </Text>
                <Text style={styles.userQuote}>
                  Your health is your wealth. Take care of it every day.
                </Text>

                {/* Quick Stats */}
                {wellnessData.bmi && (
                  <View style={styles.quickStats}>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{wellnessData.bmi}</Text>
                      <Text style={styles.statLabel}>BMI</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{wellnessData.weight || "--"}</Text>
                      <Text style={styles.statLabel}>Weight (kg)</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{wellnessData.height || "--"}</Text>
                      <Text style={styles.statLabel}>Height (cm)</Text>
                    </View>
                  </View>
                )}
              </View>
            </LinearGradient>
          </ImageBackground>
        </View>

        {/* Content Sections */}
        <Animated.View style={[styles.content, animatedStyle]}>
          
          {/* BMI Card */}
          {wellnessData.bmi && (
            <View style={styles.bmiCard}>
              <View style={styles.bmiHeader}>
                <Scale size={24} color="#555555" />
                <Text style={styles.bmiTitle}>Body Mass Index</Text>
              </View>
              <View style={styles.bmiContent}>
                <Text style={styles.bmiValue}>{wellnessData.bmi}</Text>
                <Text style={[
                  styles.bmiCategory,
                  { color: getBMICategory(parseFloat(wellnessData.bmi)).color }
                ]}>
                  {getBMICategory(parseFloat(wellnessData.bmi)).text}
                </Text>
              </View>
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
                  onChangeText={(text) => setWellnessData(prev => ({ ...prev, weight: text }))}
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
                  onChangeText={(text) => setWellnessData(prev => ({ ...prev, height: text }))}
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
                  onChangeText={(text) => setWellnessData(prev => ({ ...prev, age: text }))}
                  placeholder="25"
                  keyboardType="numeric"
                  placeholderTextColor="#A0A0A0"
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Gender</Text>
                <TouchableOpacity
                  style={styles.selectButton}
                  onPress={() => openModal("sex")}
                >
                  <Text style={[
                    styles.selectButtonText,
                    !wellnessData.sex && styles.placeholderText
                  ]}>
                    {wellnessData.sex || "Select"}
                  </Text>
                  <ChevronDown size={20} color="#555555" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Goals */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎯 Goals</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Weight goal</Text>
              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => openModal("weightGoal")}
              >
                <Text style={[
                  styles.selectButtonText,
                  !wellnessData.weightGoal && styles.placeholderText
                ]}>
                  {wellnessData.weightGoal || "Select a goal"}
                </Text>
                <ChevronDown size={20} color="#555555" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Lifestyle */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏃‍♂️ Lifestyle</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Physical activity level</Text>
              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => openModal("activityLevel")}
              >
                <Text style={[
                  styles.selectButtonText,
                  !wellnessData.activityLevel && styles.placeholderText
                ]}>
                  {wellnessData.activityLevel || "Select"}
                </Text>
                <ChevronDown size={20} color="#555555" />
              </TouchableOpacity>
            </View>

            <View style={styles.row}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Sleep hours</Text>
                <TextInput
                  style={styles.input}
                  value={wellnessData.sleepHours}
                  onChangeText={(text) => setWellnessData(prev => ({ ...prev, sleepHours: text }))}
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
                  onChangeText={(text) => setWellnessData(prev => ({ ...prev, waterIntake: text }))}
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
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => openModal("mood")}
            >
              <Text style={[
                styles.selectButtonText,
                !wellnessData.mood && styles.placeholderText
              ]}>
                {wellnessData.mood || "How are you feeling?"}
              </Text>
              <ChevronDown size={20} color="#555555" />
            </TouchableOpacity>
          </View>

          {/* Allergies */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚠️ Allergies</Text>
            <View style={styles.checkboxContainer}>
              {commonAllergies.map((allergy, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.checkboxItem}
                  onPress={() => toggleAllergy(allergy)}
                >
                  <View style={[
                    styles.checkbox,
                    wellnessData.allergies.includes(allergy) && styles.checkboxChecked
                  ]}>
                    {wellnessData.allergies.includes(allergy) && (
                      <Check size={16} color="#FFFFFF" />
                    )}
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
                <TouchableOpacity
                  key={index}
                  style={styles.checkboxItem}
                  onPress={() => toggleCondition(condition)}
                >
                  <View style={[
                    styles.checkbox,
                    wellnessData.chronicConditions.includes(condition) && styles.checkboxChecked
                  ]}>
                    {wellnessData.chronicConditions.includes(condition) && (
                      <Check size={16} color="#FFFFFF" />
                    )}
                  </View>
                  <Text style={styles.checkboxLabel}>{condition}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Medical report */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📄 Medical report</Text>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={uploadMedicalReport}
            >
              <Upload size={24} color="#555555" />
              <Text style={styles.uploadButtonText}>
                {wellnessData.medicalReport 
                  ? `File: ${wellnessData.medicalReport.name}`
                  : "Upload medical report"
                }
              </Text>
            </TouchableOpacity>
            <Text style={styles.uploadHint}>
              Accepted formats: PDF, JPG, PNG (Max 10MB)
            </Text>
          </View>

        </Animated.View>
      </ScrollView>

      {/* Error/Success Banner */}
      {error && (
        <Animated.View style={styles.banner} entering={FadeInDown}>
          <AlertTriangle size={18} color="#10B981" style={{ marginRight: 10 }} />
          <Text style={styles.bannerText}>{error}</Text>
        </Animated.View>
      )}

      {renderModal()}
    </SafeAreaView>
  )
}

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
    height: 320,
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
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  saveButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
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
  quickStats: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  statLabel: {
    fontSize: 12,
    color: "#FFFFFF",
    opacity: 0.8,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    marginHorizontal: 16,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
  },
  bmiCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  bmiHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  bmiTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginLeft: 12,
  },
  bmiContent: {
    alignItems: "center",
  },
  bmiValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333333",
  },
  bmiCategory: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
  },
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
  selectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
  },
  selectButtonText: {
    fontSize: 16,
    color: "#333333",
  },
  placeholderText: {
    color: "#A0A0A0",
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    textAlign: "center",
    marginBottom: 20,
  },
  modalOption: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  modalOptionText: {
    fontSize: 16,
    color: "#333333",
  },
  modalCancel: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginTop: 10,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
  },
  modalCancelText: {
    fontSize: 16,
    color: "#777777",
    textAlign: "center",
    fontWeight: "600",
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
    borderLeftColor: "#10B981",
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
})