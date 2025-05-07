"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  Animated,
} from "react-native"
import { ChevronLeft, Clock, Flame, Tag } from "lucide-react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import type { RouteProp } from "@react-navigation/native"
import { type FitnessPlan, getFitnessPlanByType, getImageUrl, getPlainTextDescription } from "@/api/fitness-plans/route"
import { LinearGradient } from "expo-linear-gradient"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"

const { width, height } = Dimensions.get("window")
const HEADER_MAX_HEIGHT = height * 0.5
const HEADER_MIN_HEIGHT = 90
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT

type RootStackParamList = {
  Fitness: { category: string }
  SubCategories: { category: string } // ✅ Add this
}

type FitnessScreenRouteProp = RouteProp<RootStackParamList, "Fitness">
type NavigationProp = NativeStackNavigationProp<RootStackParamList>

export default function FitnessDetail() {
  const [fitnessPlan, setFitnessPlan] = useState<FitnessPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const route = useRoute<FitnessScreenRouteProp>()
  const { category } = route.params
  const navigation = useNavigation<NavigationProp>()

  const scrollY = new Animated.Value(0)

  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: "clamp",
  })

  const imageOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.5, 0],
    extrapolate: "clamp",
  })

  const titleScale = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.9, 0.8],
    extrapolate: "clamp",
  })

  useEffect(() => {
    const loadFitnessPlan = async () => {
      try {
        setLoading(true)
        const plans = await getFitnessPlanByType(category)
        if (plans && plans.length > 0) {
          setFitnessPlan(plans[0])
        } else {
          setError("No fitness plan found for this category.")
        }
      } catch (err) {
        console.error("Failed to load fitness plan:", err)
        setError("Failed to load fitness plan details. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    loadFitnessPlan()
  }, [category])

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <ActivityIndicator size="large" color="#5E72E4" />
        <Text style={styles.loadingText}>Loading your fitness plan...</Text>
      </View>
    )
  }

  if (error || !fitnessPlan) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <TouchableOpacity style={styles.backButtonError} onPress={() => navigation.goBack()}>
          <ChevronLeft stroke="#000" width={24} height={24} />
        </TouchableOpacity>

        <Text style={styles.errorTitle}>Oops!</Text>
        <Text style={styles.errorText}>{error || "No fitness plan found"}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const imageUrl =
    fitnessPlan.image && fitnessPlan.image.length > 0
      ? getImageUrl(fitnessPlan.image[0].url)
      : require("../assets/images/cardio.jpg") // Fallback image

  const description = getPlainTextDescription(fitnessPlan.description)

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <Animated.View style={[styles.header, { height: headerHeight }]}>
        <Animated.Image source={{ uri: imageUrl }} style={[styles.headerImage, { opacity: imageOpacity }]} />
        <LinearGradient colors={["transparent", "rgba(0,0,0,0.7)"]} style={styles.gradient} />
      </Animated.View>

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <ChevronLeft stroke="#fff" width={24} height={24} />
      </TouchableOpacity>

      <Animated.ScrollView
        contentContainerStyle={styles.scrollViewContent}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
      >
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Clock size={24} color="#5E72E4" />
            <Text style={styles.statValue}>{fitnessPlan.duration} min</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statItem}>
            <Flame size={24} color="#FB6340" />
            <Text style={styles.statValue}>{fitnessPlan.calories_burned}</Text>
            <Text style={styles.statLabel}>Calories</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statItem}>
            <Tag size={24} color="#11CDEF" />
            <Text style={styles.statValue}>{fitnessPlan.type.split(" ")[0]}</Text>
            <Text style={styles.statLabel}>Category</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About this workout</Text>
          <Text style={styles.description}>{description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What you'll need</Text>
          <View style={styles.equipmentList}>
            <View style={styles.equipmentItem}>
              <View style={styles.equipmentIcon}>
                <Text style={styles.equipmentIconText}>🏋️</Text>
              </View>
              <Text style={styles.equipmentText}>Comfortable clothes</Text>
            </View>
            <View style={styles.equipmentItem}>
              <View style={styles.equipmentIcon}>
                <Text style={styles.equipmentIconText}>👟</Text>
              </View>
              <Text style={styles.equipmentText}>Athletic shoes</Text>
            </View>
            <View style={styles.equipmentItem}>
              <View style={styles.equipmentIcon}>
                <Text style={styles.equipmentIconText}>💧</Text>
              </View>
              <Text style={styles.equipmentText}>Water bottle</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Benefits</Text>
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <View style={[styles.benefitIcon, { backgroundColor: "#5E72E4" }]}>
                <Text style={styles.benefitIconText}>💪</Text>
              </View>
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Strength</Text>
                <Text style={styles.benefitText}>Builds muscle and improves overall strength</Text>
              </View>
            </View>
            <View style={styles.benefitItem}>
              <View style={[styles.benefitIcon, { backgroundColor: "#FB6340" }]}>
                <Text style={styles.benefitIconText}>🔥</Text>
              </View>
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Fat Loss</Text>
                <Text style={styles.benefitText}>Burns calories and helps with weight management</Text>
              </View>
            </View>
            <View style={styles.benefitItem}>
              <View style={[styles.benefitIcon, { backgroundColor: "#11CDEF" }]}>
                <Text style={styles.benefitIconText}>🧠</Text>
              </View>
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Mental Health</Text>
                <Text style={styles.benefitText}>Reduces stress and improves mood</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.spacer} />
      </Animated.ScrollView>

      <View style={styles.footer}>
        
        <TouchableOpacity style={styles.startButton} onPress={() => navigation.navigate("SubCategories", { category })}>
          <Text style={styles.startButtonText}>Rejoindre</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#5E72E4",
    fontWeight: "500",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  errorImage: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
    color: "#333",
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    maxWidth: "80%",
  },
  backButtonError: {
    position: "absolute",
    top: 50,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  retryButton: {
    backgroundColor: "#5E72E4",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 30,
    shadowColor: "#5E72E4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  headerImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    width: null,
    height: HEADER_MAX_HEIGHT,
    resizeMode: "cover",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "50%",
  },
  titleContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "700",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  tagContainer: {
    flexDirection: "row",
    marginTop: 8,
  },
  tag: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tagText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  scrollViewContent: {
    paddingTop: HEADER_MAX_HEIGHT,
    paddingBottom: 20,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: -40,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 15,
    fontWeight: "700",
    marginTop: 8,
    color: "#333",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  divider: {
    width: 1,
    height: "70%",
    backgroundColor: "#E0E0E0",
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
    color: "#333",
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#555",
  },
  equipmentList: {
    marginTop: 12,
  },
  equipmentItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  equipmentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  equipmentIconText: {
    fontSize: 20,
  },
  equipmentText: {
    fontSize: 16,
    color: "#333",
  },
  benefitsList: {
    marginTop: 12,
  },
  benefitItem: {
    flexDirection: "row",
    marginBottom: 16,
  },
  benefitIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  benefitIconText: {
    fontSize: 20,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    color: "#333",
  },
  benefitText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  spacer: {
    height: 80,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "transparent",
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 30,
  },
  startButton: {
    backgroundColor: "#000000",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  startIcon: {
    marginRight: 8,
  },
  startButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    borderRadius: 30,
    marginBottom: 20,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: "center",
  },
  activeTabButton: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#888",
  },
  activeTabButtonText: {
    color: "#000",
    fontWeight: "600",
  },
})
