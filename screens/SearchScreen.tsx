"use client"

import { useState, useEffect, useCallback } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
} from "react-native"
import { ChevronLeft, X } from "lucide-react-native"
import { getFitnessPlans, type FitnessPlan } from "@/api/fitness-plans/route"
import { useNavigation } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"

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
  AllCategories: undefined
}

type NavigationProp = StackNavigationProp<RootStackParamList>

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState("")
  const [fitnessPlans, setFitnessPlans] = useState<FitnessPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigation = useNavigation<NavigationProp>()

  const loadFitnessPlans = async () => {
    try {
      setLoading(true)
      const plans = await getFitnessPlans()
      setFitnessPlans(plans)
      setError(null)
    } catch (err) {
      console.error("Failed to load fitness plans:", err)
      setError("Failed to load fitness plans. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFitnessPlans()
  }, [])

  const filteredPlans = fitnessPlans.filter((plan) => {
    // Filter by search query (check both title and type)
    return (
      plan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.type.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  const clearSearch = () => {
    setSearchQuery("")
  }

  const handleGoBack = () => {
    navigation.navigate("AllCategories")
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        <View style={styles.searchHeader}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <ChevronLeft size={24} color={COLORS.text} />
          </TouchableOpacity>
          <View style={styles.searchInputContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search workouts..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
              placeholderTextColor={COLORS.textSecondary}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={clearSearch}>
                <X size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading workouts...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        <View style={styles.searchHeader}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <ChevronLeft size={24} color={COLORS.text} />
          </TouchableOpacity>
          <View style={styles.searchInputContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search workouts..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
              placeholderTextColor={COLORS.textSecondary}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={clearSearch}>
                <X size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.resetButton} onPress={loadFitnessPlans}>
            <Text style={styles.resetButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.searchHeader}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <ChevronLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.searchInputContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search workouts..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
            placeholderTextColor={COLORS.textSecondary}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <X size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {filteredPlans.length === 0 && searchQuery.length > 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No workouts found</Text>
          <Text style={styles.emptySubtitle}>Try changing your search or filters</Text>
          <TouchableOpacity style={styles.resetButton} onPress={clearSearch}>
            <Text style={styles.resetButtonText}>Reset Filters</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.resultsContainer}>
          {searchQuery.length > 0 ? (
            <Text style={styles.resultsText}>
              {filteredPlans.length} {filteredPlans.length === 1 ? "result" : "results"} found
            </Text>
          ) : (
            <Text style={styles.hintText}>Start typing to search workouts</Text>
          )}
          {/* Ici vous pouvez ajouter la liste des résultats */}
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.backgroundAlt,
    marginRight: 8,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.backgroundAlt,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 15,
    color: COLORS.text,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.text,
    fontWeight: "500",
  },
  errorText: {
    fontSize: 16,
    color: "#ff3b30",
    textAlign: "center",
    marginBottom: 20,
  },
  resultsContainer: {
    flex: 1,
    padding: 16,
  },
  resultsText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  hintText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: 20,
  },
})
