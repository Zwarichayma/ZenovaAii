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
  ActivityIndicator,
} from "react-native"
import { ChevronRight, Database, Wifi, WifiOff, CheckCircle, Clock } from "lucide-react-native"
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
import { healthConnectService } from "../api/health-connect-service/route"

const { width, height } = Dimensions.get("window")
type RootStackParamList = {
  Fitness: { category: string }
}

type NavigationProp = StackNavigationProp<RootStackParamList, "Fitness">

const ACTIVITIES = [
  { name: "Walking", icon: "👟", color: "#F5F6F8", unit: "steps", key: "steps" },
  { name: "Workout", icon: "🔥", color: "#F5F6F8", unit: "kcal", key: "calories" },
  { name: "Cycling", icon: "🚲", color: "#F5F6F8", unit: "km", key: "totalKilometers" },
  { name: "Push-ups", icon: "🏋️", color: "#F5F6F8", unit: "reps", key: "pushups" },
]

const DAY_WIDTH = 60
const CARD_WIDTH = (width - 60) / 2

// Interface pour les données de santé
interface HealthData {
  steps: number
  totalKilometers: number
  calories: number
  workout: number
  pushups: number
}

export default function HealthConnectScreen() {
  const [isInitialized, setIsInitialized] = useState(false)
  const [hasPermissions, setHasPermissions] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [dailyData, setDailyData] = useState<HealthData | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [showPermissionModal, setShowPermissionModal] = useState(false)
  const [permissionType, setPermissionType] = useState<"initialize" | "permission">("permission")
  const [permissionsSkipped, setPermissionsSkipped] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSyncDate, setLastSyncDate] = useState<Date | null>(null)
  const [isConnected, setIsConnected] = useState(true)
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null)

  // 🆕 Références pour la sauvegarde automatique
  const autoSaveInterval = useRef<NodeJS.Timeout | null>(null)
  const lastDataRef = useRef<HealthData | null>(null)

  const scrollY = useRef(new Animated.Value(0)).current
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
    setupAutoSave()

    // Cleanup
    return () => {
      if (autoSaveInterval.current) {
        clearInterval(autoSaveInterval.current)
      }
    }
  }, [])

  // 🆕 FONCTION: Configuration de la sauvegarde automatique
  const setupAutoSave = () => {
    if (autoSaveInterval.current) {
      clearInterval(autoSaveInterval.current)
    }

    // Sauvegarde automatique toutes les 2 minutes
    autoSaveInterval.current = setInterval(async () => {
      if (autoSaveEnabled && dailyData && hasPermissions) {
        await performAutoSave()
      }
    }, 120000) // 2 minutes

    console.log("🔄 Auto-save configured: every 2 minutes")
  }

  // 🆕 FONCTION: Effectuer la sauvegarde automatique
  const performAutoSave = async () => {
    if (!dailyData || !autoSaveEnabled) return

    // Vérifier si les données ont changé
    const dataChanged =
      !lastDataRef.current ||
      lastDataRef.current.steps !== dailyData.steps ||
      lastDataRef.current.calories !== dailyData.calories ||
      lastDataRef.current.totalKilometers !== dailyData.totalKilometers

    if (!dataChanged) {
      console.log("📊 No data changes, skipping auto-save")
      return
    }

    try {
      console.log("🔄 Performing auto-save...")

      const healthConnectData = {
        steps: dailyData.steps,
        distance: dailyData.totalKilometers,
        total_calories_burned: dailyData.calories,
        active_calories_burned: Math.round(dailyData.calories * 0.7),
        exercise: dailyData.workout > 0 ? "Workout completed" : null,
      }

      const success = await healthConnectService.autoSaveHealthData(healthConnectData)

      if (success) {
        setLastAutoSave(new Date())
        setIsConnected(true)
        lastDataRef.current = { ...dailyData }
        console.log("✅ Auto-save successful")
      } else {
        setIsConnected(false)
        console.log("❌ Auto-save failed")
      }
    } catch (error) {
      console.error("❌ Auto-save error:", error)
      setIsConnected(false)
    }
  }

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

    return (
      (recordStartTime >= startOfDay && recordStartTime <= endOfDay) ||
      (recordEndTime >= startOfDay && recordEndTime <= endOfDay) ||
      (recordStartTime <= startOfDay && recordEndTime >= endOfDay)
    )
  }

  // Récupérer les données depuis Health Connect
  const fetchDailyData = async (date: Date) => {
    try {
      console.log("📊 Fetching Health Connect data for:", date.toISOString())

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

      console.log("=== HEALTH CONNECT RAW DATA ===")
      console.log("Steps:", JSON.stringify(stepsResult, null, 2))
      console.log("Distance:", JSON.stringify(distanceResult, null, 2))
      console.log("Calories:", JSON.stringify(caloriesResult, null, 2))

      // Traitement des pas
      let totalSteps = 0
      if (stepsResult && stepsResult.records) {
        const filteredStepsRecords = stepsResult.records.filter((record) => isRecordInSelectedDay(record, date))
        for (const record of filteredStepsRecords) {
          if (record && typeof record === "object") {
            if ("count" in record && typeof record.count === "number") {
              totalSteps += record.count
            } else if ("steps" in record && typeof (record as any).steps === "number") {
              totalSteps += (record as any).steps
            }
          }
        }
      }

      // Traitement de la distance
      let totalKilometers = 0
      if (distanceResult && distanceResult.records) {
        const filteredDistanceRecords = distanceResult.records.filter((record) => isRecordInSelectedDay(record, date))
        for (const record of filteredDistanceRecords) {
          if (record && typeof record === "object") {
            if ("distance" in record && record.distance) {
              const distance = record.distance
              if ("inKilometers" in distance && typeof distance.inKilometers === "number") {
                totalKilometers += distance.inKilometers
              } else if ("inMeters" in distance && typeof distance.inMeters === "number") {
                totalKilometers += distance.inMeters / 1000
              }
            }
          }
        }
      }

      // Traitement des calories
      let totalCalories = 0
      if (caloriesResult && caloriesResult.records) {
        const filteredCaloriesRecords = caloriesResult.records.filter((record) => isRecordInSelectedDay(record, date))
        for (const record of filteredCaloriesRecords) {
          if (record && typeof record === "object") {
            if ("energy" in record && record.energy) {
              const energy = record.energy
              if ("inKilocalories" in energy && typeof energy.inKilocalories === "number") {
                totalCalories += energy.inKilocalories
              }
            }
          }
        }
      }

      totalKilometers = Number.parseFloat(totalKilometers.toFixed(2))
      totalCalories = Math.round(totalCalories)

      const healthData = {
        steps: totalSteps || 0,
        totalKilometers: totalKilometers || 0,
        calories: totalCalories || 0,
        workout: 45, // Valeur par défaut
        pushups: 230, // Valeur par défaut
      }

      console.log("✅ Processed health data:", healthData)
      return healthData
    } catch (error) {
      console.error("❌ Error fetching daily data:", error)
      return {
        steps: 0,
        totalKilometers: 0,
        calories: 0,
        workout: 45,
        pushups: 230,
      }
    }
  }

  // 🆕 FONCTION: Sauvegarde manuelle
  const saveHealthDataToDatabase = async () => {
    if (!dailyData) {
      Alert.alert("No Data", "No health data available to save")
      return
    }

    try {
      setIsSaving(true)
      console.log("💾 Manual save initiated...")

      const healthConnectData = {
        steps: dailyData.steps,
        distance: dailyData.totalKilometers,
        total_calories_burned: dailyData.calories,
        active_calories_burned: Math.round(dailyData.calories * 0.7),
        exercise: dailyData.workout > 0 ? "Workout completed" : null,
      }

      await healthConnectService.saveHealthConnectData(healthConnectData)

      setLastSyncDate(new Date())
      setIsConnected(true)
      lastDataRef.current = { ...dailyData }

      Alert.alert("Success! 🎉", `Health data saved successfully for ${selectedDate.toLocaleDateString()}`, [
        { text: "OK", style: "default" },
      ])

      console.log("✅ Manual save successful")
    } catch (error: any) {
      console.error("❌ Error saving health data:", error)
      setIsConnected(false)

      Alert.alert("Save Failed", error.message || "Failed to save health data. Please try again.", [
        { text: "OK", style: "default" },
      ])
    } finally {
      setIsSaving(false)
    }
  }

  // 🆕 FONCTION: Basculer la sauvegarde automatique
  const toggleAutoSave = () => {
    setAutoSaveEnabled(!autoSaveEnabled)
    if (!autoSaveEnabled) {
      setupAutoSave()
      console.log("🔄 Auto-save enabled")
    } else {
      if (autoSaveInterval.current) {
        clearInterval(autoSaveInterval.current)
      }
      console.log("⏸️ Auto-save disabled")
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
          lastDataRef.current = data
        }
      }
    } catch (error) {
      console.error("Erreur d'initialisation:", error)
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
        { accessType: "read", recordType: "StepCount" } as any,
      ])

      setHasPermissions(permissions.length > 0)
      setShowPermissionModal(false)

      if (permissions.length > 0) {
        const data = await fetchDailyData(selectedDate)
        setDailyData(data)
        lastDataRef.current = data
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
      lastDataRef.current = data
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

  // 🆕 Actualisation périodique des données avec auto-save
  useEffect(() => {
    if (isInitialized && hasPermissions) {
      const refreshInterval = setInterval(async () => {
        const data = await fetchDailyData(selectedDate)
        setDailyData(data)

        // Déclencher auto-save si les données ont changé
        if (autoSaveEnabled && data && lastDataRef.current) {
          const dataChanged =
            lastDataRef.current.steps !== data.steps ||
            lastDataRef.current.calories !== data.calories ||
            lastDataRef.current.totalKilometers !== data.totalKilometers

          if (dataChanged) {
            await performAutoSave()
          }
        }
      }, 60000) // Actualiser chaque minute

      return () => clearInterval(refreshInterval)
    }
  }, [isInitialized, hasPermissions, selectedDate, autoSaveEnabled])

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
          {/* 🆕 BOUTON AUTO-SAVE */}
          <TouchableOpacity
            onPress={toggleAutoSave}
            style={[styles.autoSaveButton, autoSaveEnabled ? styles.autoSaveEnabled : styles.autoSaveDisabled]}
          >
            {autoSaveEnabled ? <CheckCircle size={16} color="#FFFFFF" /> : <Clock size={16} color="#666666" />}
          </TouchableOpacity>

          {/* BOUTON DE SAUVEGARDE MANUELLE */}
          <TouchableOpacity
            onPress={saveHealthDataToDatabase}
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            disabled={isSaving || !dailyData}
          >
            {isSaving ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Database size={20} color="#FFFFFF" />}
          </TouchableOpacity>

          {/* Indicateur de connexion */}
          <View style={[styles.connectionIndicator, isConnected ? styles.connected : styles.disconnected]}>
            {isConnected ? <Wifi size={16} color="#10B981" /> : <WifiOff size={16} color="#EF4444" />}
          </View>

          <TouchableOpacity onPress={handleSettingsPress} style={styles.settingsButton}>
            <Settings stroke="#666" width={24} height={24} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 🆕 Statut de synchronisation amélioré */}
      <View style={styles.syncStatusContainer}>
        {lastSyncDate && <Text style={styles.syncText}>Manual sync: {lastSyncDate.toLocaleTimeString()}</Text>}
        {lastAutoSave && autoSaveEnabled && (
          <Text style={styles.autoSyncText}>Auto-save: {lastAutoSave.toLocaleTimeString()}</Text>
        )}
        {autoSaveEnabled && <Text style={styles.autoSaveStatus}>🔄 Auto-save: ON</Text>}
      </View>

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
        {/* Banner d'information */}
        {!hasPermissions && !showPermissionModal && (
          <View style={styles.permissionBanner}>
            <Text style={styles.permissionBannerText}>
              💡 {hasPermissions ? "Real-time data from Health Connect" : "Enable Health Connect for real-time data"}
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
                  {getActivityValue(activity.name)} <Text style={{ fontSize: 14, color: "#666" }}>{activity.unit}</Text>
                </Text>
              </View>
            </View>
          ))}
        </View>

        <FitnessCategories />
      </ScrollView>
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
    gap: 8,
  },
  // 🆕 NOUVEAUX STYLES POUR AUTO-SAVE
  autoSaveButton: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  autoSaveEnabled: {
    backgroundColor: "#10B981",
  },
  autoSaveDisabled: {
    backgroundColor: "#F3F4F6",
  },
  saveButton: {
    backgroundColor: "#667eea",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  connectionIndicator: {
    padding: 6,
    borderRadius: 12,
  },
  connected: {
    backgroundColor: "#D1FAE5",
  },
  disconnected: {
    backgroundColor: "#FEE2E2",
  },
  syncStatusContainer: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    alignItems: "center",
  },
  syncText: {
    fontSize: 11,
    color: "#666666",
  },
  autoSyncText: {
    fontSize: 11,
    color: "#10B981",
  },
  autoSaveStatus: {
    fontSize: 10,
    color: "#10B981",
    fontWeight: "600",
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
})
