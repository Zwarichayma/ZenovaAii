"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  StatusBar,
} from "react-native"
import { ChevronRight, ArrowRight } from "lucide-react-native"
import { getFitnessPlans, type FitnessPlan, getImageUrl } from "@/api/fitness-plans/route"
import { useNavigation } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"
import { LinearGradient } from "expo-linear-gradient"

const { width } = Dimensions.get("window")

type RootStackParamList = {
  Fitness: { category: string }
}

type NavigationProp = StackNavigationProp<RootStackParamList, "Fitness">

export default function FitnessCategories() {
  const [fitnessPlans, setFitnessPlans] = useState<FitnessPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigation = useNavigation<NavigationProp>()

  useEffect(() => {
    const loadFitnessPlans = async () => {
      try {
        setLoading(true)
        const plans = await getFitnessPlans()
        setFitnessPlans(plans)
        setError(null)
      } catch (err) {
        console.error("Failed to load fitness plans:", err)
        setError("Failed to load fitness categories. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    loadFitnessPlans()
  }, [])

  const renderCard = (plan: FitnessPlan) => {
    const imageUrl =
      plan.image && plan.image.length > 0 ? getImageUrl(plan.image[0].url) : require("../assets/images/cardio.jpg") // Fallback image

    return (
      <TouchableOpacity
        key={plan.id}
        style={styles.card}
        onPress={() => navigation.navigate("Fitness", { category: plan.type })}
      >
        <Image
          source={{ uri: imageUrl }}
          style={styles.cardImage}
          defaultSource={require("../assets/images/cardio.jpg")}
        />
        <LinearGradient colors={["transparent", "rgba(0,0,0,0.7)"]} style={styles.cardGradient} />
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{plan.title}</Text>
          <View style={styles.cardMeta}>
            <Text style={styles.cardMetaText}>{plan.duration} min</Text>
            <View style={styles.cardMetaDot} />
            <Text style={styles.cardMetaText}>{plan.calories_burned} kcal</Text>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  const renderFeaturedPlan = (plan: FitnessPlan) => {
    const imageUrl =
      plan.image && plan.image.length > 0 ? getImageUrl(plan.image[0].url) : require("../assets/images/cardio.jpg") // Fallback image

    return (
      <TouchableOpacity
        style={styles.featuredCard}
        key={plan.id}
        onPress={() => navigation.navigate("Fitness", { category: plan.type })}
      >
        <Image
          source={{ uri: imageUrl }}
          style={styles.featuredImage}
          defaultSource={require("../assets/images/cardio.jpg")}
        />
        <LinearGradient colors={["transparent", "rgba(0,0,0,0.8)"]} style={styles.featuredGradient} />
        <View style={styles.featuredContent}>
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredBadgeText}>Featured</Text>
          </View>
          <Text style={styles.featuredTitle}>{plan.title}</Text>
          <View style={styles.featuredMeta}>
            <Text style={styles.featuredMetaText}>{plan.duration} min</Text>
            <View style={styles.featuredMetaDot} />
            <Text style={styles.featuredMetaText}>{plan.calories_burned} kcal</Text>
          </View>
          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={() => navigation.navigate("Fitness", { category: plan.type })}
          >
            <Text style={styles.getStartedText}>Get Started</Text>
            <ArrowRight size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    )
  }

  const renderPlanCard = (plan: FitnessPlan) => {
    const imageUrl =
      plan.image && plan.image.length > 0 ? getImageUrl(plan.image[0].url) : require("../assets/images/cardio.jpg") // Fallback image

    return (
      <TouchableOpacity
        style={styles.planCard}
        key={plan.id}
        onPress={() => navigation.navigate("Fitness", { category: plan.type })}
      >
        <Image
          source={{ uri: imageUrl }}
          style={styles.planImage}
          defaultSource={require("../assets/images/cardio.jpg")}
        />
        <LinearGradient colors={["transparent", "rgba(0,0,0,0.7)"]} style={styles.planGradient} />
        <View style={styles.planOverlay}>
          <View style={styles.planMetaContainer}>
            <Text style={styles.planMetadata}>
              {plan.duration} min • {plan.calories_burned} kcal
            </Text>
          </View>
          <View style={styles.planTitleContainer}>
            <Text style={styles.planTitle}>{plan.title}</Text>
            <ChevronRight size={20} color="#fff" />
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <ActivityIndicator size="large" color="#5E72E4" />
        <Text style={styles.loadingText}>Loading fitness categories...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() =>
            getFitnessPlans()
              .then(setFitnessPlans)
              .catch((err) => setError(String(err)))
          }
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    )
  }

  // Select a featured plan (first one for now)
  const featuredPlan = fitnessPlans.length > 0 ? fitnessPlans[0] : null

  return (
    <>
      {featuredPlan && (
        <View style={styles.featuredSection}>
          <Text style={styles.sectionTitle}>Featured Workout</Text>
          {renderFeaturedPlan(featuredPlan)}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>All Categories</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {fitnessPlans.map(renderCard)}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recommended Plans</Text>
          <TouchableOpacity>
            <Text style={styles.seeDetails}>See All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.plansContainer}>{fitnessPlans.slice(0, 2).map(renderPlanCard)}</View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>For You</Text>
          <TouchableOpacity>
            <Text style={styles.seeDetails}>See All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.plansContainer}>{fitnessPlans.slice(0, 4).map(renderPlanCard)}</View>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
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
  errorText: {
    fontSize: 16,
    color: "#ff3b30",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#5E72E4",
    paddingHorizontal: 24,
    paddingVertical: 12,
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
  featuredSection: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
    color: "#333",
  },
  categoriesContainer: {
    paddingRight: 20,
  },
  card: {
    width: width * 0.4,
    height: 180,
    marginRight: 16,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#f5f5f5",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  cardGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "50%",
  },
  cardContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardMetaText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
  },
  cardMetaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    marginHorizontal: 6,
  },
  featuredCard: {
    width: "100%",
    height: 220,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#f5f5f5",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  featuredImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  featuredGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "70%",
  },
  featuredContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  featuredBadge: {
    backgroundColor: "#5E72E4",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  featuredBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  featuredTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  featuredMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  featuredMetaText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  featuredMetaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    marginHorizontal: 8,
  },
  getStartedButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#5E72E4",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 30,
    alignSelf: "flex-start",
    shadowColor: "#5E72E4",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  getStartedText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginRight: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  seeDetails: {
    color: "#5E72E4",
    fontSize: 14,
    fontWeight: "600",
  },
  plansContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  planCard: {
    width: (width - 56) / 2,
    height: (width - 56) / 2,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    backgroundColor: "#f5f5f5",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  planImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  planGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "50%",
  },
  planOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  planMetaContainer: {
    marginBottom: 4,
  },
  planMetadata: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 12,
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
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
})
