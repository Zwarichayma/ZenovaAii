"use client"

import React, { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Animated,
  ScrollView,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
  Alert,
} from "react-native"
import { ChevronRight, Flame, Activity, Clock } from "lucide-react-native"
import { Settings, ChevronLeft } from "react-native-feather"
import {
  initialize,
  getGrantedPermissions,
  requestPermission,
  openHealthConnectSettings,
  readRecords,
} from "react-native-health-connect"
import PermissionRequest from "../components/permission-request"
import { SafeAreaView } from "react-native-safe-area-context"
import type { StackNavigationProp } from "@react-navigation/stack"
import { useNavigation } from "@react-navigation/native"
const { width, height } = Dimensions.get("window")
type RootStackParamList = {
  Fitness: { category: string }
}

type NavigationProp = StackNavigationProp<RootStackParamList, "Fitness">

  
const ACTIVITIES = [
  { name: "Walking", icon: "👟", color: "#F5F6F8", unit: "steps" },
  { name: "Workout", icon: "🔥", color: "#F5F6F8", unit: "kcal" },
  { name: "Cycling", icon: "🚲", color: "#F5F6F8", unit: "km" },
  { name: "Push-ups", icon: "🏋️", color: "#F5F6F8", unit: "reps" },
]

const DAY_WIDTH = 60
const CARD_WIDTH = (width - 60) / 2 // 60 = padding total (20 * 2 + 20 entre les cartes)

export default function App() {
  const [isInitialized, setIsInitialized] = useState(false)
  const [hasPermissions, setHasPermissions] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [dailyData, setDailyData] = useState<any>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [showPermissionModal, setShowPermissionModal] = useState(false)
  const [permissionType, setPermissionType] = useState<"initialize" | "permission">("permission")
  const [currentScreen, setCurrentScreen] = useState<"health" | "training">("health")
  const scrollY = useRef(new Animated.Value(0)).current
  const [isSearchBarVisible, setIsSearchBarVisible] = useState(true)
  const searchBarHeight = 50 // Ajustez cette valeur en fonction de la hauteur réelle de votre barre de recherche
  const searchBarTranslateY = scrollY.interpolate({
    inputRange: [0, searchBarHeight],
    outputRange: [0, -searchBarHeight],
    extrapolate: "clamp",
  })

  const handleScroll = Animated.event<NativeScrollEvent>([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
    useNativeDriver: true,
    listener: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const currentOffset = event.nativeEvent.contentOffset.y
    },
  })

  // Modify the renderCard function inside the TrainingScreen component
  const navigation = useNavigation<NavigationProp>()

  const renderCard = (imageSource: any, text: string) => (
    <View>
      <TouchableOpacity style={styles.card1} onPress={() => navigation.navigate("Fitness", { category: text })}>
        <Image source={imageSource} style={styles.cardImage1} />
      </TouchableOpacity>
      <View style={styles.categoryOverlay}>
        <Text style={styles.ratingText}>{text}</Text>
      </View>
    </View>
  )

  const workoutPlans = [
    { id: 1, title: "Chest & Triceps", variant: "B Variant", image: require("../assets/images/cardio.jpg") },
    { id: 2, title: "Back & Biceps", variant: "B Variant", image: require("../assets/images/runn.jpg") },
  ]

  const categories = [
    {
      id: 1,
      title: "Cardio",
      rating: 4.5,
      description: "High intensity training",
      image: require("../assets/images/cardio.jpg"),
    },
    { id: 2, title: "Strength", rating: 4.7, description: "Build muscle", image: require("../assets/images/runn.jpg") },
    {
      id: 3,
      title: "Yoga",
      rating: 4.6,
      description: "Flexibility and balance",
      image: require("../assets/images/yooga.jpg"),
    },
    {
      id: 4,
      title: "Pilates",
      rating: 4.5,
      description: "Core strength",
      image: require("../assets/images/pilate.jpg"),
    },
  ]

  const renderWorkoutPlanCard = (plan: any) => (
    <TouchableOpacity style={styles.planCard} key={plan.id}>
      <Image source={plan.image} style={styles.planImage} />
      <View style={styles.planOverlay}>
        <Text style={styles.variantText}>{plan.variant}</Text>
        <View style={styles.planTitleContainer}>
          <Text style={styles.planTitle}>{plan.title}</Text>
          <ChevronRight size={20} color="#fff" />
        </View>
      </View>
    </TouchableOpacity>
  )
  useEffect(() => {
    checkInitialization()
  }, [])

  const getDayName = (date: Date) => {
    return date.toLocaleDateString("en-US", { weekday: "long" })
  }

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  }

  const getDaysInMonth = (month: Date) => {
    const year = month.getFullYear()
    const monthIndex = month.getMonth()
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()

    const days = []
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, monthIndex, i)
      days.push(date)
    }
    return days
  }

  const getActivityValue = (activity: string) => {
    if (!dailyData) return "0"
    switch (activity) {
      case "Walking":
        return dailyData.steps?.toString() || "0"
      case "Workout":
        return dailyData.calories?.toString() || "0"
      case "Cycling":
        return dailyData.totalKilometers?.toString() || "0"
      case "Push-ups":
        return dailyData.pushups?.toString() || "0"
      default:
        return "0"
    }
  }

  const fetchDailyData = async (date: Date) => {
    try {
      const startTime = new Date(date)
      startTime.setHours(0, 0, 0, 0)
      const endTime = new Date(date)
      endTime.setHours(23, 59, 59, 999)

      // Récupérer les pas
      const stepsResult = await readRecords("Steps", {
        timeRangeFilter: {
          operator: "between",
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        },
      })

      // Récupérer la distance
      const distanceResult = await readRecords("Distance", {
        timeRangeFilter: {
          operator: "between",
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        },
      })

      // Récupérer les calories
      const caloriesResult = await readRecords("TotalCaloriesBurned", {
        timeRangeFilter: {
          operator: "between",
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        },
      })

      const totalSteps = stepsResult.records.reduce((sum, record) => sum + (record.count || 0), 0)
      const totalKilometers = distanceResult.records.reduce(
        (sum, record) => sum + (record.distance?.inKilometers || 0),
        0,
      )
      const totalCalories = caloriesResult.records.reduce(
        (sum, record) => sum + (record.energy?.inKilocalories || 0),
        0,
      )

      return {
        steps: totalSteps,
        totalKilometers: Number.parseFloat(totalKilometers.toFixed(2)),
        calories: Math.round(totalCalories),
        workout: 45, // Valeur par défaut
        pushups: 230, // Valeur par défaut
      }
    } catch (error) {
      console.error("Error fetching daily data:", error)
      return {
        steps: 0,
        totalKilometers: 0,
        calories: 0,
        workout: 45,
        pushups: 230,
      }
    }
  }

  const checkInitialization = async () => {
    try {
      const isAvailable = await initialize()
      setIsInitialized(isAvailable)

      if (isAvailable) {
        const existingPermissions = await getGrantedPermissions()
        setHasPermissions(existingPermissions.length > 0)

        if (existingPermissions.length > 0) {
          const data = await fetchDailyData(selectedDate)
          setDailyData(data)
        } else {
          setPermissionType("permission")
          setShowPermissionModal(true)
        }
      } else {
        setPermissionType("initialize")
        setShowPermissionModal(true)
      }
    } catch (error) {
      console.error("Erreur d'initialisation:", error)
      Alert.alert("Erreur", "Impossible d'initialiser Health Connect. Veuillez réessayer.", [{ text: "OK" }])
    }
  }

  const requestHealthPermissions = async () => {
    try {
      if (!isInitialized) {
        await checkInitialization()
        return
      }

      const permissions = await requestPermission([
        { accessType: "read", recordType: "Steps" },
        { accessType: "read", recordType: "Distance" },
        { accessType: "read", recordType: "TotalCaloriesBurned" },
      ])

      setHasPermissions(permissions.length > 0)
      setShowPermissionModal(false)

      if (permissions.length > 0) {
        const data = await fetchDailyData(selectedDate)
        setDailyData(data)
      }
    } catch (error) {
      console.error("Erreur de permission:", error)
      Alert.alert("Erreur", "Impossible d'obtenir les permissions. Veuillez réessayer.", [{ text: "OK" }])
    }
  }

  const handleSettingsPress = () => {
    if (!isInitialized) {
      checkInitialization()
    } else if (!hasPermissions) {
      setPermissionType("permission")
      setShowPermissionModal(true)
    } else {
      openHealthConnectSettings()
    }
  }

  const handleDateChange = async (newDate: Date) => {
    setSelectedDate(newDate)
    const data = await fetchDailyData(newDate)
    setDailyData(data)
  }

  const handlePrevMonth = () => {
    const prevMonth = new Date(currentMonth)
    prevMonth.setMonth(prevMonth.getMonth() - 1)
    setCurrentMonth(prevMonth)
  }

  const handleNextMonth = () => {
    const nextMonth = new Date(currentMonth)
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    setCurrentMonth(nextMonth)
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    )
  }

  const handleLater = () => {
    setShowPermissionModal(false)
  }

  const handleAccept = () => {
    if (permissionType === "initialize") {
      openHealthConnectSettings()
      setShowPermissionModal(false)
    } else {
      requestHealthPermissions()
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {showPermissionModal && (
        <PermissionRequest
          title={permissionType === "initialize" ? "Installation requise" : "Autorisation requise"}
          message={
            permissionType === "initialize"
              ? "Pour suivre vos activités, l'application a besoin d'installer Health Connect. Voulez-vous l'installer maintenant ?"
              : "Pour suivre vos activités, l'application a besoin d'accéder à vos données de santé. Voulez-vous autoriser l'accès ?"
          }
          onAccept={handleAccept}
          onLater={handleLater}
        />
      )}

          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {getDayName(selectedDate)}, {selectedDate.getDate()}
            </Text>
            <View style={styles.headerButtons}>
              
              <TouchableOpacity onPress={handleSettingsPress} style={styles.settingsButton}>
                <Settings size={24} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          {!isInitialized || !hasPermissions ? (
            <View style={styles.placeholderContainer}>
              <View style={styles.placeholderIcon}>
                <Text style={styles.placeholderIconText}>🔒</Text>
              </View>
              <Text style={styles.placeholderTitle}>
                {!isInitialized ? "Installation requise" : "Autorisation requise"}
              </Text>
              <Text style={styles.placeholderText}>
                {!isInitialized
                  ? "Pour suivre vos activités, l'application a besoin d'installer Health Connect."
                  : "Pour suivre vos activités, l'application a besoin d'accéder à vos données de santé."}
              </Text>
              <TouchableOpacity
                style={styles.setupButton}
                onPress={!isInitialized ? handleAccept : requestHealthPermissions}
              >
                <Text style={styles.setupButtonText}>
                  {!isInitialized ? "Installer Health Connect" : "Autoriser l'accès"}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.calendarContainer}>
                <View style={styles.monthSelector}>
                  <TouchableOpacity onPress={handlePrevMonth} style={styles.monthButton}>
                    <ChevronLeft size={20} color="#000" />
                  </TouchableOpacity>
                  <Text style={styles.monthTitle}>{getMonthName(currentMonth)}</Text>
                  <TouchableOpacity onPress={handleNextMonth} style={styles.monthButton}>
                    <ChevronRight size={20} color="#000" />
                  </TouchableOpacity>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.calendar}
                  contentContainerStyle={styles.calendarContent}
                >
                  {getDaysInMonth(currentMonth).map((date, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.dayButton,
                        isSameDay(date, selectedDate) && styles.selectedDay,
                        isToday(date) && styles.todayButton,
                      ]}
                      onPress={() => handleDateChange(date)}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          isSameDay(date, selectedDate) && styles.selectedDayText,
                          isToday(date) && styles.todayText,
                        ]}
                      >
                        {date.toLocaleDateString("en-US", { weekday: "short" })}
                      </Text>
                      <Text
                        style={[
                          styles.dateText,
                          isSameDay(date, selectedDate) && styles.selectedDayText,
                          isToday(date) && styles.todayText,
                        ]}
                      >
                        {date.getDate()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <ScrollView style={styles.content}>
                <View style={styles.grid}>
                  {ACTIVITIES.map((activity, index) => (
                    <View key={index} style={[styles.activityCard, { backgroundColor: activity.color }]}>
                      <View style={styles.activityIcon}>
                        <Text style={styles.activityIconText}>{activity.icon}</Text>
                      </View>
                      <View style={styles.activityInfo}>
                        <Text style={styles.activityName}>{activity.name}</Text>
                        <Text style={styles.activityValue}>
                          {getActivityValue(activity.name)}{" "}
                          <Text style={{ fontSize: 14, color: "#666" }}>{activity.unit}</Text>
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
                
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Animated.View style={{ flexDirection: "row" }}>
              {[
                { image: require("../assets/images/Fitbox.jpg"), text: "Fit Box" },
                { image: require("../assets/images/cardio.jpg"), text: "Cardio" },
                { image: require("../assets/images/tunif.jpg"), text: " Warrior" },
                { image: require("../assets/images/runn.jpg"), text: "Running" },
                { image: require("../assets/images/runn.jpg"), text: "Fitness" }, // Add this line
              ].map((item, index) => (
                <View key={index}>{renderCard(item.image, item.text)}</View>
              ))}
            </Animated.View>
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recommondation</Text>
            <TouchableOpacity>
              <Text style={styles.seeDetails}>See Details</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.plansContainer}>{workoutPlans.map(renderWorkoutPlanCard)}</View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>For you</Text>
            <TouchableOpacity>
              <Text style={styles.seeDetails}>See Details</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.plansContainer}>{categories.map(renderWorkoutPlanCard)}</View>
        </View>
              </ScrollView>
            </>
          )}
  
  
    
      
    

    </SafeAreaView>
  )
}

// Ajouter les nouveaux styles pour les boutons de navigation
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "500",
    textTransform: "capitalize",
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  navButton: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 12,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  settingsButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
  },
  calendarContainer: {
    marginBottom: 16,
  },
  monthSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  monthButton: {
    padding: 8,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  calendar: {
    paddingHorizontal: 8,
  },
  calendarContent: {
    paddingHorizontal: 8,
  },
  dayButton: {
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
    padding: 12,
    borderRadius: 16,
    width: DAY_WIDTH,
    backgroundColor: "#F3F4F6",
  },
  selectedDay: {
    backgroundColor: "#000",
  },
  todayButton: {
    borderWidth: 1,
    borderColor: "#000",
  },
  dayText: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 4,
    textTransform: "capitalize",
  },
  dateText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
  },
  selectedDayText: {
    color: "#fff",
  },
  todayText: {
    fontWeight: "700",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  activityCard: {
    width: CARD_WIDTH,
    padding: 16,
    borderRadius: 35,
    marginBottom: 16,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  activityIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgb(238, 238, 238)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityIconText: {
    fontSize: 24,
  },
  activityInfo: {
    justifyContent: "center",
  },
  activityName: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
    color: "#666",
    opacity: 0.8,
  },
  activityValue: {
    fontSize: 24,
    fontWeight: "600",
    color: "#000",
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  placeholderIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  placeholderIconText: {
    fontSize: 36,
  },
  placeholderTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  placeholderText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    color: "#666",
    lineHeight: 22,
  },
  setupButton: {
    backgroundColor: "#000",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    width: "80%",
  },
  setupButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  headerLogo: {
    width: width * 0.13,
    height: height * 0.031,
    resizeMode: "contain",
  },

  searchBar: {
    marginTop: height * 0.05,
    marginHorizontal: width * 0.05,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    fontSize: 15,
  },
  
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statsCard: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    alignItems: "center",
    padding: 20,
    marginHorizontal: 10,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  statsValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  section: {
    marginBottom: height * 0.04,
  },
  sectionTitle: {
    fontSize: height * 0.019,
    fontWeight: "500",
    marginBottom: height * 0.01,
  },
  card1: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    width: width * 0.4,
    marginRight: width * 0.04,
    alignItems: "center",
  },
  ratingText: {
    fontSize: 25,
    color: "#fff",
    textTransform: "uppercase",
    fontWeight: "bold",
  },
  cardImage1: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
    borderRadius: 12,
  },
  categoryOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  seeDetails: {
    color: "#666",
    fontSize: 14,
  },
  plansContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12,
  },
  planCard: {
    width: (width - (width * 0.1 + 12)) / 2,
    height: (width - (width * 0.1 + 12)) / 2,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
  },
  planImage: {
    width: "100%",
    height: "100%",
  },
  planOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  variantText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    marginBottom: 4,
  },
  planTitleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  planTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
})

