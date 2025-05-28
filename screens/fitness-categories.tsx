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
  StatusBar,
  SafeAreaView,
  RefreshControl,
  Animated,
} from "react-native"
import { Dumbbell, Flame, Clock, Calendar, Heart, ChevronRight } from "lucide-react-native"
import { getFitnessPlans, type FitnessPlan, getImageUrl } from "@/api/fitness-plans/route"
import { useNavigation } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"
import { LinearGradient } from "expo-linear-gradient"

const { width } = Dimensions.get("window")

// Colors for skeleton
const SKELETON_COLORS = {
  background: "#E8E8E8",
  highlight: "#F5F5F5",
}

type RootStackParamList = {
  Fitness: { category: string }
  AllCategories: undefined
  AllWorkouts: undefined
  AllRecommended: undefined
  FitnessPlanDetail: { planId: string }
}

type NavigationProp = StackNavigationProp<RootStackParamList>

// Skeleton Components
const SkeletonTodayWorkout = () => (
  <View style={[styles.todayWorkoutCard, styles.skeletonCard]}>
    <View style={styles.skeletonTodayContent}>
      <View style={[styles.skeletonTitle, { width: '60%', height: 24, marginBottom: 8 }]} />
      <View style={[styles.skeletonSubtitle, { width: '40%', height: 14, marginBottom: 12 }]} />
      <View style={styles.todayWorkoutMetrics}>
        <View style={[styles.todayWorkoutMetric, styles.skeletonMetric]} />
        <View style={[styles.todayWorkoutMetric, styles.skeletonMetric]} />
        <View style={[styles.todayWorkoutMetric, styles.skeletonMetric]} />
      </View>
    </View>
  </View>
)

const SkeletonCategoryCard = () => (
  <View style={[styles.categoryCard, styles.skeletonCard]}>
    <View style={styles.skeletonCategoryContent}>
      <View style={[styles.skeletonTitle, { width: '70%', height: 16 }]} />
      <View style={styles.categoryMeta}>
        <View style={[styles.skeletonSubtitle, { width: 50, height: 12 }]} />
      </View>
    </View>
  </View>
)

const SkeletonRecommendedCard = () => (
  <View style={[styles.recommendedCard, styles.skeletonCard]}>
    <View style={styles.recommendedContent}>
      <View style={[styles.skeletonTitle, { width: '80%', height: 16, marginBottom: 6 }]} />
      <View style={styles.recommendedMeta}>
        <View style={[styles.skeletonSubtitle, { width: 60, height: 12 }]} />
        <View style={styles.recommendedMetaDot} />
        <View style={[styles.skeletonSubtitle, { width: 60, height: 12 }]} />
      </View>
    </View>
  </View>
)

const SkeletonDifficultyButton = () => (
  <View style={[styles.difficultyButton, styles.skeletonButton]}>
    <View style={[styles.skeletonTitle, { width: 70, height: 14 }]} />
  </View>
)

const SkeletonUI = () => (
  <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
    {/* Today's Workout Section */}
    <View style={styles.todaySection}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleWrapper}>
          <Calendar size={18} color="#333" style={styles.sectionIcon} />
          <Text style={styles.sectionTitle}>Today's Workout Plan</Text>
        </View>
        <View style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>View All</Text>
          <ChevronRight size={16} color="#5E72E4" />
        </View>
      </View>
      <SkeletonTodayWorkout />
    </View>

    {/* Categories Section */}
    <View style={styles.categoriesSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Workout Categories</Text>
        <View style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>See All</Text>
          <ChevronRight size={16} color="#5E72E4" />
        </View>
      </View>

      <View style={styles.difficultyFilter}>
        <SkeletonDifficultyButton />
        <SkeletonDifficultyButton />
        <SkeletonDifficultyButton />
      </View>

      <View style={styles.categoriesGrid}>
        {[1, 2, 3, 4].map((_, index) => (
          <SkeletonCategoryCard key={`skeleton-category-${index}`} />
        ))}
      </View>
    </View>

    {/* Recommended Section */}
    <View style={styles.recommendedSection}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleWrapper}>
          <Flame size={18} color="#333" style={styles.sectionIcon} />
          <Text style={styles.sectionTitle}>Recommended</Text>
        </View>
        <View style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>See All</Text>
          <ChevronRight size={16} color="#5E72E4" />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.recommendedScrollContent}
      >
        {[1, 2, 3].map((_, index) => (
          <SkeletonRecommendedCard key={`skeleton-recommended-${index}`} />
        ))}
      </ScrollView>
    </View>
  </ScrollView>
)

export default function FitnessCategories() {
  const [fitnessPlans, setFitnessPlans] = useState<FitnessPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigation = useNavigation<NavigationProp>()
  const scrollY = new Animated.Value(0)

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
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadFitnessPlans()
  }, [])

  const onRefresh = () => {
    setRefreshing(true)
    loadFitnessPlans()
  }

  // Get today's date in a readable format
  const getTodayDate = () => {
    const today = new Date()
    const options: Intl.DateTimeFormatOptions = { weekday: "long", month: "long", day: "numeric" }
    return today.toLocaleDateString("en-US", options)
  }

  const renderTodayWorkout = (plan: FitnessPlan) => {
    const imageUrl =
      plan.image && plan.image.length > 0 ? getImageUrl(plan.image[0].url) : require("../assets/images/cardio.jpg")

    return (
      <TouchableOpacity
        style={styles.todayWorkoutCard}
        activeOpacity={0.9}
        onPress={() => navigation.navigate("FitnessPlanDetail", { planId: todayWorkout.id })}
      >
        <Image source={{ uri: imageUrl }} style={styles.todayWorkoutImage} />
        <LinearGradient
          colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.7)", "rgba(0,0,0,0.9)"]}
          style={styles.todayWorkoutGradient}
        >
          <View style={styles.todayWorkoutContent}>
            <Text style={styles.todayWorkoutTitle}>{plan.title}</Text>
            <Text style={styles.todayWorkoutSubtitle}>Medium Full Body Workout</Text>

            <View style={styles.todayWorkoutMetrics}>
              <View style={styles.todayWorkoutMetric}>
                <Clock size={14} color="#fff" />
                <Text style={styles.todayWorkoutMetricText}>{plan.duration} min</Text>
              </View>
              <View style={styles.todayWorkoutMetric}>
                <Flame size={14} color="#fff" />
                <Text style={styles.todayWorkoutMetricText}>{plan.calories_burned} cal</Text>
              </View>
              <View style={styles.todayWorkoutMetric}>
                <Heart size={14} color="#fff" />
                <Text style={styles.todayWorkoutMetricText}>Beginner</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    )
  }

  const renderCategoryCard = (plan: FitnessPlan, index: number) => {
    const imageUrl =
      plan.image && plan.image.length > 0 ? getImageUrl(plan.image[0].url) : require("../assets/images/cardio.jpg")

    return (
      <TouchableOpacity
        key={plan.id}
        style={styles.categoryCard}
        activeOpacity={0.9}
        onPress={() => navigation.navigate("FitnessPlanDetail", { planId: plan.id })}
      >
        <Image source={{ uri: imageUrl }} style={styles.categoryImage} />
        <LinearGradient colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.7)"]} style={styles.categoryGradient}>
          <Text style={styles.categoryTitle}>{plan.title}</Text>
          <View style={styles.categoryMeta}>
            <Clock size={12} color="#fff" />
            <Text style={styles.categoryMetaText}>{plan.duration} min</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    )
  }

  const renderDifficultyButton = (title: string, isActive = false) => (
    <TouchableOpacity style={[styles.difficultyButton, isActive && styles.difficultyButtonActive]}>
      <Text style={[styles.difficultyButtonText, isActive && styles.difficultyButtonTextActive]}>{title}</Text>
    </TouchableOpacity>
  )

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadFitnessPlans}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    )
  }

  // Select a featured plan for today's workout
  const todayWorkout = fitnessPlans.length > 0 ? fitnessPlans[0] : null

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerDate}>{getTodayDate()}</Text>
          <Text style={styles.headerTitle}>Fitness</Text>
        </View>
        <TouchableOpacity style={styles.profileButton}>
          <View style={styles.profileButtonInner}>
            <Dumbbell size={16} color="#fff" />
          </View>
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <SkeletonUI />
      ) : (
        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#5E72E4"]} />}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
          scrollEventThrottle={16}
        >
          {todayWorkout && (
            <View style={styles.todaySection}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleWrapper}>
                  <Calendar size={18} color="#333" style={styles.sectionIcon} />
                  <Text style={styles.sectionTitle}>Today's Workout Plan</Text>
                </View>
                <TouchableOpacity style={styles.viewAllButton} onPress={() => navigation.navigate("AllWorkouts")}>
                  <Text style={styles.viewAllText}>View All</Text>
                  <ChevronRight size={16} color="#5E72E4" />
                </TouchableOpacity>
              </View>
              {renderTodayWorkout(todayWorkout)}
            </View>
          )}

          <View style={styles.categoriesSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Workout Categories</Text>
              <TouchableOpacity style={styles.viewAllButton} onPress={() => navigation.navigate("AllCategories")}>
                <Text style={styles.viewAllText}>See All</Text>
                <ChevronRight size={16} color="#5E72E4" />
              </TouchableOpacity>
            </View>

            <View style={styles.difficultyFilter}>
              {renderDifficultyButton("Beginner", true)}
              {renderDifficultyButton("Intermediate")}
              {renderDifficultyButton("Advanced")}
            </View>

            <View style={styles.categoriesGrid}>
              {fitnessPlans.slice(0, 4).map((plan, index) => renderCategoryCard(plan, index))}
            </View>
          </View>

          <View style={styles.recommendedSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleWrapper}>
                <Flame size={18} color="#333" style={styles.sectionIcon} />
                <Text style={styles.sectionTitle}>Recommended</Text>
              </View>
              <TouchableOpacity style={styles.viewAllButton} onPress={() => navigation.navigate("AllRecommended")}>
                <Text style={styles.viewAllText}>See All</Text>
                <ChevronRight size={16} color="#5E72E4" />
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recommendedScrollContent}
            >
              {fitnessPlans.slice(0, 5).map((plan, index) => (
                <TouchableOpacity
                  key={`recommended-${plan.id}`}
                  style={styles.recommendedCard}
                  activeOpacity={0.9}
                  onPress={() => navigation.navigate("FitnessPlanDetail", { planId: plan.id })}
                >
                  <Image
                    source={{
                      uri:
                        plan.image && plan.image.length > 0
                          ? getImageUrl(plan.image[0].url)
                          : require("../assets/images/cardio.jpg"),
                    }}
                    style={styles.recommendedImage}
                  />
                  <View style={styles.recommendedContent}>
                    <Text style={styles.recommendedTitle}>{plan.title}</Text>
                    <View style={styles.recommendedMeta}>
                      <Clock size={12} color="#fff" style={styles.recommendedMetaIcon} />
                      <Text style={styles.recommendedMetaText}>{plan.duration} min</Text>
                      <View style={styles.recommendedMetaDot} />
                      <Flame size={12} color="#fff" style={styles.recommendedMetaIcon} />
                      <Text style={styles.recommendedMetaText}>{plan.calories_burned} cal</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Animated.ScrollView>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerDate: {
    fontSize: 14,
    color: "#888",
    marginBottom: 4,
    fontWeight: "500",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#333",
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(94, 114, 228, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#5E72E4",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  profileButtonInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#5E72E4",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#ffffff",
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
    borderRadius: 12,
    shadowColor: "#5E72E4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  // Today's Workout Section
  todaySection: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitleWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewAllText: {
    fontSize: 14,
    color: "#5E72E4",
    fontWeight: "600",
    marginRight: 2,
  },
  seeAllText: {
    fontSize: 14,
    color: "#5E72E4",
    fontWeight: "600",
  },
  todayWorkoutCard: {
    width: "100%",
    height: 200,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#f8f8f8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  todayWorkoutImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  todayWorkoutGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  todayWorkoutContent: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
  },
  todayWorkoutTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 4,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  todayWorkoutSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 12,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  todayWorkoutMetrics: {
    flexDirection: "row",
    alignItems: "center",
  },
  todayWorkoutMetric: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  todayWorkoutMetricText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 6,
  },

  // Categories Section
  categoriesSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  difficultyFilter: {
    flexDirection: "row",
    marginBottom: 20,
  },
  difficultyButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 10,
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  difficultyButtonActive: {
    backgroundColor: "#5E72E4",
    borderColor: "#5E72E4",
  },
  difficultyButtonText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "600",
  },
  difficultyButtonTextActive: {
    color: "#fff",
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  categoryCard: {
    width: "48%",
    height: 160,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 16,
    backgroundColor: "#f8f8f8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  categoryGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "flex-end",
    padding: 16,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 6,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  categoryMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryMetaText: {
    fontSize: 12,
    color: "#fff",
    marginLeft: 4,
    fontWeight: "500",
  },

  // Recommended Section
  recommendedSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  recommendedScrollContent: {
    paddingRight: 20,
    paddingBottom: 10,
  },
  recommendedCard: {
    width: width * 0.7,
    height: 160,
    borderRadius: 20,
    overflow: "hidden",
    marginRight: 16,
    backgroundColor: "#f8f8f8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recommendedImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  recommendedContent: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  recommendedTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 6,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  recommendedMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  recommendedMetaIcon: {
    marginRight: 4,
  },
  recommendedMetaText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
  },
  recommendedMetaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    marginHorizontal: 6,
  },

  // Skeleton styles
  skeletonCard: {
    backgroundColor: SKELETON_COLORS.background,
  },
  skeletonTitle: {
    backgroundColor: SKELETON_COLORS.highlight,
    borderRadius: 4,
  },
  skeletonSubtitle: {
    backgroundColor: SKELETON_COLORS.highlight,
    borderRadius: 4,
  },
  skeletonTodayContent: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
  },
  skeletonMetric: {
    backgroundColor: SKELETON_COLORS.highlight,
    width: 70,
    height: 28,
  },
  skeletonCategoryContent: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
  },
  skeletonButton: {
    backgroundColor: SKELETON_COLORS.background,
    borderColor: SKELETON_COLORS.background,
  },
})