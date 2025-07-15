"use client"

import { useState, useEffect, useCallback, useRef } from "react"
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
  SafeAreaView,
  TextInput,
  RefreshControl,
  Animated,
} from "react-native"
import { ChevronLeft, Clock, Search, Filter, X } from "lucide-react-native"
import { getFitnessPlans, type FitnessPlan, getImageUrl } from "@/api/fitness-plans/route"
import { useNavigation } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"
import { LinearGradient } from "expo-linear-gradient"

const { width } = Dimensions.get("window")

// Palette de couleurs noir et blanc
const COLORS = {
  primary: "#000000",
  secondary: "#333333",
  accent: "#555555",
  background: "#FFFFFF",
  backgroundAlt: "#F5F5F5",
  border: "#E0E0E0",
  text: "#000000",
  textSecondary: "#555555",
  textLight: "#FFFFFF",
}

type RootStackParamList = {
  Fitness: { category: string; planId?: string }
  FitnessCategories: undefined
  FitnessPlanDetail: { planId: string }
}

type NavigationProp = StackNavigationProp<RootStackParamList>

export default function AllCategories() {
  const [fitnessPlans, setFitnessPlans] = useState<FitnessPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState("All")
  const [showSearch, setShowSearch] = useState(false)
  const navigation = useNavigation<NavigationProp>()
  const scrollY = useRef(new Animated.Value(0)).current

  const loadFitnessPlans = async (isRefreshing = false) => {
    try {
      if (!isRefreshing) setLoading(true)
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

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    loadFitnessPlans(true)
  }, [])

  useEffect(() => {
    loadFitnessPlans()
  }, [])

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [0, 1],
    extrapolate: "clamp",
  })

  // Fixed: Create the animated event handler properly
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false } // Set to false for opacity animations
  )

  const renderFilterButton = (title: string) => (
    <TouchableOpacity
      style={[styles.filterButton, activeFilter === title && styles.filterButtonActive]}
      onPress={() => setActiveFilter(title)}
    >
      <Text style={[styles.filterButtonText, activeFilter === title && styles.filterButtonTextActive]}>{title}</Text>
    </TouchableOpacity>
  )

  const filteredPlans = fitnessPlans.filter((plan) => {
    // Filter by search query
    if (searchQuery && !plan.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }

    // Filter by category
    if (activeFilter !== "All" && plan.type.toLowerCase() !== activeFilter.toLowerCase()) {
      return false
    }

    return true
  })

  const toggleSearch = () => {
    setShowSearch(!showSearch)
    if (showSearch) {
      setSearchQuery("")
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading categories...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => loadFitnessPlans()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <Animated.View style={[styles.headerBackground, { opacity: headerOpacity }]} />

      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <ChevronLeft size={24} color={COLORS.text} />
          <Text style={styles.backButtonText}></Text>
        </TouchableOpacity>
        {!showSearch ? (
          <>
            <Text style={styles.headerTitle}>All Categories</Text>
            <TouchableOpacity style={styles.searchButton} onPress={toggleSearch}>
              <Search size={22} color={COLORS.text} />
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.searchHeaderContainer}>
            <TextInput
              style={styles.searchHeaderInput}
              placeholder="Search workouts..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
              placeholderTextColor={COLORS.textSecondary}
            />
            <TouchableOpacity onPress={toggleSearch}>
              <X size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {!showSearch && (
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
            {renderFilterButton("All")}
            {renderFilterButton("Cardio")}
            {renderFilterButton("CrossFit")}
            {renderFilterButton("Yoga")}
            {renderFilterButton("Mind-Body")}
            {renderFilterButton("Pilates")}
          </ScrollView>
          <TouchableOpacity style={styles.filterIconButton}>
            <Filter size={18} color={COLORS.text} />
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {filteredPlans.length > 0 ? (
          <View style={styles.categoriesGrid}>
            {filteredPlans.map((plan) => {
              const isTitleSameAsType = plan.title.toLowerCase() === plan.type.toLowerCase()

              return (
                <TouchableOpacity
                  key={plan.id}
                  style={styles.categoryCard}
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate("FitnessPlanDetail", { planId: plan.id })}
                >
                  <Image
                    source={{
                      uri:
                        plan.image && plan.image.length > 0
                          ? getImageUrl(plan.image[0].url)
                          : require("../assets/images/cardio.jpg"),
                    }}
                    style={styles.categoryImage}
                    resizeMode="cover"
                  />
                  <LinearGradient colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.8)"]} style={styles.categoryGradient}>
                    {!isTitleSameAsType && (
                      <View style={styles.categoryBadge}>
                        <Text style={styles.categoryBadgeText}>{plan.type.toUpperCase()}</Text>
                      </View>
                    )}
                    <Text style={styles.categoryTitle}>{plan.title}</Text>
                    <View style={styles.categoryMeta}>
                      <Clock size={12} color={COLORS.textLight} style={styles.categoryMetaIcon} />
                      <Text style={styles.categoryMetaText}>{plan.duration} min</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              )
            })}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No workouts found</Text>
            <Text style={styles.emptySubtitle}>Try changing your search or filters</Text>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => {
                setSearchQuery("")
                setActiveFilter("All")
                setShowSearch(false)
              }}
            >
              <Text style={styles.resetButtonText}>Reset Filters</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: COLORS.background,
    zIndex: 1,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 2,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.backgroundAlt,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  backButtonText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.backgroundAlt,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },
  searchHeaderContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.backgroundAlt,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginLeft: 10,
    height: 40,
  },
  searchHeaderInput: {
    flex: 1,
    height: 40,
    fontSize: 15,
    color: COLORS.text,
  },
  filtersContainer: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
  },
  filtersScroll: {
    paddingHorizontal: 16,
    flexGrow: 1,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 10,
    backgroundColor: COLORS.backgroundAlt,
    borderWidth: 1,
    borderColor: COLORS.backgroundAlt,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterButtonText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  filterButtonTextActive: {
    color: COLORS.textLight,
  },
  filterIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.backgroundAlt,
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  categoryCard: {
    width: (width - 40) / 2,
    height: 180,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 16,
    backgroundColor: COLORS.backgroundAlt,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryImage: {
    width: "100%",
    height: "100%",
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
  categoryBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 10,
  },
  categoryBadgeText: {
    color: COLORS.textLight,
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textLight,
    marginBottom: 6,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  categoryMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryMetaIcon: {
    marginRight: 4,
  },
  categoryMetaText: {
    fontSize: 12,
    color: COLORS.textLight,
    marginLeft: 4,
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.text,
    fontWeight: "500",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: COLORS.background,
  },
  errorText: {
    fontSize: 16,
    color: "#ff3b30",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  retryButtonText: {
    color: COLORS.textLight,
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 20,
  },
  resetButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  resetButtonText: {
    color: COLORS.textLight,
    fontSize: 14,
    fontWeight: "600",
  },
})