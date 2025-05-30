"use client"

import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  ScrollView,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
  Alert,
} from "react-native"
import { ChevronRight } from "lucide-react-native"
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
import FitnessCategories from "./fitness-categories"

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

// Define proper types for the health records
interface HealthData {
  steps: number
  totalKilometers: number
  calories: number
  workout: number
  pushups: number
}

export default function App() {
  const [isInitialized, setIsInitialized] = useState(false)
  const [hasPermissions, setHasPermissions] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [dailyData, setDailyData] = useState<HealthData | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [showPermissionModal, setShowPermissionModal] = useState(false)
  const [permissionType, setPermissionType] = useState<"initialize" | "permission">("permission")
  const [currentScreen, setCurrentScreen] = useState<"health" | "training">("health")
  const [permissionsSkipped, setPermissionsSkipped] = useState(false)
  const scrollY = useRef(new Animated.Value(0)).current
  const [isSearchBarVisible, setIsSearchBarVisible] = useState(true)
  const searchBarHeight = 50
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

  const navigation = useNavigation<NavigationProp>()

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
    if (!dailyData) {
      // Return zeros when no permissions
      return "0"
    }
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

  // Fonction pour vérifier si un enregistrement est dans la plage de dates sélectionnée
  const isRecordInSelectedDay = (record: any, selectedDate: Date) => {
    if (!record || !record.startTime || !record.endTime) return false

    const recordStartTime = new Date(record.startTime)
    const recordEndTime = new Date(record.endTime)

    const startOfDay = new Date(selectedDate)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(selectedDate)
    endOfDay.setHours(23, 59, 59, 999)

    // Vérifier si l'enregistrement chevauche la journée sélectionnée
    return (
      (recordStartTime >= startOfDay && recordStartTime <= endOfDay) ||
      (recordEndTime >= startOfDay && recordEndTime <= endOfDay) ||
      (recordStartTime <= startOfDay && recordEndTime >= endOfDay)
    )
  }

  // Fetch dynamic data from Health Connect
  const fetchDailyData = async (date: Date) => {
    try {
      // Pour le déboggage, afficher la date sélectionnée
      console.log("Date sélectionnée:", date.toISOString())

      // Définir le début et la fin de la journée sélectionnée
      const startTime = new Date(date)
      startTime.setHours(0, 0, 0, 0)
      const endTime = new Date(date)
      endTime.setHours(23, 59, 59, 999)

      console.log("Fetching data for date range:", {
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      })

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

      // Log the raw records to the console for debugging
      console.log("=== HEALTH CONNECT RECORDS ===")
      console.log("Steps Records:", JSON.stringify(stepsResult, null, 2))
      console.log("Distance Records:", JSON.stringify(distanceResult, null, 2))
      console.log("Calories Records:", JSON.stringify(caloriesResult, null, 2))
      console.log("==============================")

      // Process steps data
      let totalSteps = 0
      if (stepsResult && stepsResult.records) {
        console.log("Nombre d'enregistrements de pas:", stepsResult.records.length)

        // Filtrer les enregistrements pour la date sélectionnée
        const filteredStepsRecords = stepsResult.records.filter((record) => isRecordInSelectedDay(record, date))

        console.log("Nombre d'enregistrements de pas filtrés pour la date sélectionnée:", filteredStepsRecords.length)

        for (const record of filteredStepsRecords) {
          if (record && typeof record === "object") {
            console.log("Traitement de l'enregistrement de pas:", JSON.stringify(record))
            // Try different possible property names for steps
            if ("count" in record && typeof record.count === "number") {
              console.log("Ajout de pas via count:", record.count)
              totalSteps += record.count
            } else if ("steps" in record && typeof (record as any).steps === "number") {
              console.log("Ajout de pas via steps:", (record as any).steps)
              totalSteps += (record as any).steps
            } else if ("sample" in record && record.sample && typeof record.sample === "object") {
              if ("count" in record.sample && typeof record.sample.count === "number") {
                console.log("Ajout de pas via sample.count:", record.sample.count)
                totalSteps += record.sample.count
              }
            }
          }
        }
        console.log("Total des pas calculé:", totalSteps)
      }

      // Process distance data
      let totalKilometers = 0
      if (distanceResult && distanceResult.records) {
        // Filtrer les enregistrements pour la date sélectionnée
        const filteredDistanceRecords = distanceResult.records.filter((record) => isRecordInSelectedDay(record, date))

        for (const record of filteredDistanceRecords) {
          if (record && typeof record === "object") {
            if ("distance" in record && record.distance) {
              const distance = record.distance
              if ("inKilometers" in distance && typeof distance.inKilometers === "number") {
                totalKilometers += distance.inKilometers
              } else if ("inMeters" in distance && typeof distance.inMeters === "number") {
                // Convert meters to kilometers
                totalKilometers += distance.inMeters / 1000
              }
            } else if ("meters" in record && typeof (record as any).meters === "number") {
              totalKilometers += (record as any).meters / 1000
            }
          }
        }
      }

      // Process calories data
      let totalCalories = 0
      if (caloriesResult && caloriesResult.records) {
        // Filtrer les enregistrements pour la date sélectionnée
        const filteredCaloriesRecords = caloriesResult.records.filter((record) => isRecordInSelectedDay(record, date))

        for (const record of filteredCaloriesRecords) {
          if (record && typeof record === "object") {
            if ("energy" in record && record.energy) {
              const energy = record.energy
              if ("inKilocalories" in energy && typeof energy.inKilocalories === "number") {
                totalCalories += energy.inKilocalories
              } else if ("inCalories" in energy && typeof energy.inCalories === "number") {
                // Convert calories to kilocalories
                totalCalories += energy.inCalories / 1000
              } else if ("inJoules" in energy && typeof energy.inJoules === "number") {
                // Convert joules to kilocalories (1 kcal = 4184 joules)
                totalCalories += energy.inJoules / 4184
              }
            } else if ("calories" in record && typeof (record as any).calories === "number") {
              totalCalories += (record as any).calories
            } else if ("kilocalories" in record && typeof (record as any).kilocalories === "number") {
              totalCalories += (record as any).kilocalories
            }
          }
        }
      }

      // Try to get additional data from alternative sources if no data was found
      if (totalSteps === 0) {
        try {
          const altStepsResult = await readRecords("StepCount", {
            timeRangeFilter: {
              operator: "between",
              startTime: startTime.toISOString(),
              endTime: endTime.toISOString(),
            },
          } as any) // Using 'as any' to bypass TypeScript checking for this alternative record type

          if (altStepsResult && altStepsResult.records) {
            // Filtrer les enregistrements pour la date sélectionnée
            const filteredAltStepsRecords = altStepsResult.records.filter((record) =>
              isRecordInSelectedDay(record, date),
            )

            for (const record of filteredAltStepsRecords) {
              if (record && typeof record === "object" && "count" in record && typeof record.count === "number") {
                totalSteps += record.count
              }
            }
          }
        } catch (error) {
          console.log("Alternative step source not available:", error)
        }
      }

      // Format the values
      totalKilometers = Number.parseFloat(totalKilometers.toFixed(2))
      totalCalories = Math.round(totalCalories)

      console.log("Processed health data:", {
        steps: totalSteps,
        totalKilometers,
        calories: totalCalories,
      })

      console.log("Retour des données dynamiques pour la date sélectionnée")

      // Return the processed data
      return {
        steps: totalSteps || 0,
        totalKilometers: totalKilometers || 0,
        calories: totalCalories || 0,
        workout: 45, // Default value for workout (not available in Health Connect)
        pushups: 230, // Default value for pushups (not available in Health Connect)
      }
    } catch (error) {
      console.error("Error fetching daily data:", error)
      // Return default values in case of error
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
        }
        // Ne plus afficher automatiquement le modal de permission
      } else {
        // Ne plus afficher automatiquement le modal d'installation
      }
    } catch (error) {
      console.error("Erreur d'initialisation:", error)
      // Ne plus afficher d'alerte automatique
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
        { accessType: "read", recordType: "StepCount" } as any, // Alternative step count
      ])

      setHasPermissions(permissions.length > 0)
      setShowPermissionModal(false)

      if (permissions.length > 0) {
        const data = await fetchDailyData(selectedDate)
        setDailyData(data)
      }
    } catch (error) {
      console.error("Erreur de permission:", error)
      Alert.alert("Error", "Unable to get permissions. Please try again.", [{ text: "OK" }])
    }
  }

  const handleSettingsPress = () => {
    if (!isInitialized) {
      setPermissionType("initialize")
      setShowPermissionModal(true)
    } else if (!hasPermissions) {
      setPermissionType("permission")
      setShowPermissionModal(true)
    } else {
      openHealthConnectSettings()
    }
  }

  const handleDateChange = async (newDate: Date) => {
    setSelectedDate(newDate)
    if (hasPermissions) {
      const data = await fetchDailyData(newDate)
      setDailyData(data)
    }
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
    setPermissionsSkipped(true)
  }

  const handleAccept = () => {
    if (permissionType === "initialize") {
      openHealthConnectSettings()
      setShowPermissionModal(false)
    } else {
      requestHealthPermissions()
    }
  }

  // Refresh data periodically only if permissions are granted
  useEffect(() => {
    if (isInitialized && hasPermissions) {
      const refreshInterval = setInterval(async () => {
        const data = await fetchDailyData(selectedDate)
        setDailyData(data)
      }, 60000) // Refresh every minute

      return () => clearInterval(refreshInterval)
    }
  }, [isInitialized, hasPermissions, selectedDate])

  return (
    <SafeAreaView style={styles.container}>
      {showPermissionModal && (
        <PermissionRequest
          title={permissionType === "initialize" ? "Health Connect Required" : "Permission Required"}
          message={
            permissionType === "initialize"
              ? "To track your activities, the app needs to install Health Connect. Would you like to install it now?"
              : "To track your activities, the app needs access to your health data. Would you like to grant access?"
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
            <Settings stroke="#666" width={24} height={24} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Toujours afficher l'interface principale */}
      <>
        <View style={styles.calendarContainer}>
          <View style={styles.monthSelector}>
            <TouchableOpacity onPress={handlePrevMonth} style={styles.monthButton}>
              <ChevronLeft stroke="#000" width={20} height={20} />
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
          {/* Afficher un message discret si pas de permissions */}
          {!hasPermissions && !showPermissionModal && (
            <View style={styles.permissionBanner}>
              <Text style={styles.permissionBannerText}>
                💡 Want real data? Open settings to enable Health Connect
              </Text>
             
            </View>
          )}

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
          <FitnessCategories />
        </ScrollView>
      </>
    </SafeAreaView>
  )
}

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
  permissionBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#E3F2FD",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  permissionBannerText: {
    fontSize: 14,
    color: "#1976D2",
    flex: 1,
  },
  connectButton: {
    backgroundColor: "#1976D2",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  connectButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
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
  demoLabel: {
    fontSize: 10,
    color: "#999",
    marginTop: 4,
    fontStyle: "italic",
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
})