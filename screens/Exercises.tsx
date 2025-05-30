"use client"

import { useEffect, useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Image,
  Linking,
  Dimensions,
} from "react-native"
import { useRoute, useNavigation } from "@react-navigation/native"
import type { RouteProp } from "@react-navigation/native"
import axios from "axios"
import { ChevronLeft, Clock, Dumbbell, Play, Star } from "lucide-react-native"
import { API_KEY, API_URL } from "@env"


// Get screen width for responsive sizing
const { width } = Dimensions.get("window")
const CARD_PADDING = 16
const CARD_WIDTH = width - CARD_PADDING * 2

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
  },
})

const getImageUrl = (url: string | null) => {
  if (!url) return null
  // If the URL is already absolute, return it as is
  if (url.startsWith("http")) return url
  // Otherwise, prepend the base URL
  return `${API_URL.replace("/api", "")}${url}`
}

type RootStackParamList = {
  SubCategories: { category: string }
  Exercises: { subCategoryId: number; subCategoryName: string }
}

type ExercisesRouteProp = RouteProp<RootStackParamList, "Exercises">

type Exercise = {
  id: number
  documentId?: string
  name: string
  video_url?: string | null
  duration?: string
  sets?: number | null
  rep?: string | null
  calories_burned?: string | number | null
  image?: {
    id?: number
    url?: string
    formats?: {
      small?: {
        url?: string
      }
      thumbnail?: {
        url?: string
      }
    }
  } | null
}

// Mock data for fallback when API fails
const mockExercises: Exercise[] = [
  {
    id: 1,
    name: "Jumping Jacks",
    duration: "2",
    sets: 3,
    rep: "20 reps",
    calories_burned: 50,
  },
  {
    id: 2,
    name: "Push-ups",
    duration: "3",
    sets: 3,
    rep: "15 reps",
    calories_burned: 30,
  },
  {
    id: 3,
    name: "Squats",
    duration: "3",
    sets: 4,
    rep: "12 reps",
    calories_burned: 40,
  },
  {
    id: 4,
    name: "Plank",
    duration: "1",
    sets: 3,
    rep: "30 sec",
    calories_burned: 25,
  },
  {
    id: 5,
    name: "Mountain Climbers",
    duration: "2",
    sets: 3,
    rep: "20 reps",
    calories_burned: 35,
  }
];

export default function Exercises() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [useMockData, setUseMockData] = useState<boolean>(false)

  const navigation = useNavigation<any>()
  const route = useRoute<ExercisesRouteProp>()
  const { subCategoryId, subCategoryName } = route.params

  console.log("Exercises screen - Received params:", { subCategoryId, subCategoryName })

  useEffect(() => {
    const fetchExercises = async () => {
      setLoading(true)
      setError(null)

      try {
        console.log(`Fetching exercises for sub-category ID: ${subCategoryId}`)
       
        // Use the correct endpoint to get fitness plans with their sub-categories and exercises
        const response = await axiosInstance.get(
          `/fitness-plans?populate[sub_categories][populate][exercises][populate]=image`,
        )

        if (!response.data || !response.data.data) {
          throw new Error("Invalid response format")
        }

        console.log("API Response received with status:", response.status)
        
        const fitnessPlans = response.data.data
        let subCategoryExercises: Exercise[] = []
        let found = false

        // Loop through all fitness plans
        for (const plan of fitnessPlans) {
          // Check if the plan has sub_categories
          if (plan.sub_categories && Array.isArray(plan.sub_categories)) {
            // Find the matching sub-category by ID
            const matchingSubCategory = plan.sub_categories.find((sc: any) => sc.id === subCategoryId)

            if (matchingSubCategory && matchingSubCategory.exercises) {
              // Found the matching sub-category with exercises
              subCategoryExercises = matchingSubCategory.exercises.map((ex: any) => ({
                id: ex.id,
                documentId: ex.documentId,
                name: ex.name,
                video_url: ex.video_url,
                duration: ex.duration,
                sets: ex.sets,
                rep: ex.rep,
                calories_burned: ex.calories_burned,
                image: ex.image,
              }))
              found = true;
              console.log("Found exercises in direct structure:", subCategoryExercises.length);
              break
            }
          }
        }

        if (!found) {
          // Try the nested structure if the first approach didn't work
          for (const plan of fitnessPlans) {
            if (plan.attributes && plan.attributes.sub_categories && plan.attributes.sub_categories.data) {
              const subCategories = plan.attributes.sub_categories.data

              // Find the matching sub-category by ID
              const matchingSubCategory = subCategories.find((sc: any) => sc.id === subCategoryId)

              if (
                matchingSubCategory &&
                matchingSubCategory.attributes &&
                matchingSubCategory.attributes.exercises &&
                matchingSubCategory.attributes.exercises.data
              ) {
                // Found the matching sub-category with exercises
                const exercises = matchingSubCategory.attributes.exercises.data

                subCategoryExercises = exercises.map((ex: any) => ({
                  id: ex.id,
                  documentId: ex.attributes?.documentId,
                  name: ex.attributes?.name,
                  video_url: ex.attributes?.video_url,
                  duration: ex.attributes?.duration,
                  sets: ex.attributes?.sets,
                  rep: ex.attributes?.rep,
                  calories_burned: ex.attributes?.calories_burned,
                  image: ex.attributes?.image?.data
                    ? {
                        id: ex.attributes.image.data.id,
                        url: ex.attributes.image.data.attributes.url,
                        formats: ex.attributes.image.data.attributes.formats,
                      }
                    : null,
                }))
                found = true;
                console.log("Found exercises in nested structure:", subCategoryExercises.length);
                break
              }
            }
          }
        }

        if (subCategoryExercises.length > 0) {
          console.log(`Found ${subCategoryExercises.length} exercises for sub-category ${subCategoryName}`)
          setExercises(subCategoryExercises)
        } else {
          console.log("No exercises found for this sub-category")
          setError(`Aucun exercice trouvé pour ${subCategoryName}`)
        }
      } catch (err) {
        console.error("Error fetching exercises:", err)
        if (axios.isAxiosError(err)) {
          console.log("API Error Response:", err.response?.data)
          console.log("API Error Status:", err.response?.status)
          setError(`Impossible de charger les exercices. Erreur: ${err.message}. Status: ${err.response?.status || "unknown"}`)
        } else {
          setError("Impossible de charger les exercices. Veuillez réessayer.")
        }
      } finally {
        setLoading(false)
      }
    }

    fetchExercises()
  }, [subCategoryId, subCategoryName])

  const handleExercisePress = (exercise: Exercise) => {
    // Navigate to exercise details or video player
    console.log(`Exercise pressed: ${exercise.name}`)
    if (exercise.video_url) {
      openVideoUrl(exercise.video_url)
    }
  }

  const openVideoUrl = (videoUrl: string | undefined | null) => {
    if (videoUrl) {
      Linking.openURL(videoUrl).catch((err) => {
        console.error("Erreur lors de l'ouverture de l'URL:", err)
      })
    }
  }

  const getExerciseImageUrl = (exercise: Exercise) => {
    if (!exercise.image) return null

    // Try to get small format first, then original
    const imageUrl = exercise.image.formats?.small?.url || exercise.image.formats?.thumbnail?.url || exercise.image.url

    return getImageUrl(imageUrl || null)
  }

  const loadMockData = () => {
    console.log("Loading mock data")
    setUseMockData(true)
    setExercises(mockExercises)
    setError(null)
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
         <TouchableOpacity style={styles.backButtonError} onPress={() => navigation.goBack()}>
                  <ChevronLeft stroke="#000" width={24} height={24} />
                </TouchableOpacity>
        <Text style={styles.headerTitle}>{subCategoryName}</Text>
        <View style={styles.placeholder} />
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.mockDataButton} onPress={loadMockData}>
            <Text style={styles.mockDataButtonText}>Charger des exemples</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#333" />
          <Text style={styles.loadingText}>Chargement des exercices...</Text>
        </View>
      ) : (
        <FlatList
          data={exercises}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Aucun exercice trouvé pour cette catégorie</Text>
              {!useMockData && (
                <TouchableOpacity style={styles.mockDataButton} onPress={loadMockData}>
                  <Text style={styles.mockDataButtonText}>Charger des exemples</Text>
                </TouchableOpacity>
              )}
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.exerciseCard} onPress={() => handleExercisePress(item)} activeOpacity={0.9}>
              {/* Image and Info Layout */}
              <View style={styles.cardLayout}>
                {/* Image Section */}
                <View style={styles.imageContainer}>
                  {getExerciseImageUrl(item) ? (
                    <Image
                      source={{ uri: getExerciseImageUrl(item) as string }}
                      style={styles.exerciseImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.placeholderImage}>
                      <Text style={styles.placeholderText}>
                        {item.name && typeof item.name === "string" ? item.name.charAt(0).toUpperCase() : "E"}
                      </Text>
                    </View>
                  )}

                  {/* Play button overlay */}
                  {item.video_url && (
                    <TouchableOpacity style={styles.playButton} onPress={() => openVideoUrl(item.video_url)}>
                      <Play size={20} color="#fff" fill="#fff" />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Content Section */}
                <View style={styles.contentSection}>
                  <Text style={styles.exerciseName} numberOfLines={1}>
                    {item.name || "Exercise"}
                  </Text>

                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <Clock size={14} color="#666" />
                      <Text style={styles.statText}>{item.duration || "0"} min</Text>
                    </View>

                    <View style={styles.statItem}>
                      <Dumbbell size={14} color="#666" />
                      <Text style={styles.statText}>{item.sets || "0"} sets</Text>
                    </View>
                  </View>

                  {/* Additional stats */}
                  <View style={styles.statsRow}>
                    {item.rep && (
                      <View style={styles.statBadge}>
                        <Text style={styles.badgeText}>{item.rep}</Text>
                      </View>
                    )}

                    {item.calories_burned && (
                      <View style={styles.calorieBadge}>
                        <Text style={styles.calorieBadgeText}>{item.calories_burned} cal</Text>
                      </View>
                    )}
                  </View>
                </View>

                
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    backgroundColor: "#fff",
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#ff3b30",
  },
  errorText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 10,
  },
  mockDataButton: {
    backgroundColor: "#5E72E4",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginTop: 10,
  },
  mockDataButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  backButtonError: {
    position: "absolute",
    top: 25,
    left: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#000",
    flex: 1,
    paddingTop:20,
    textAlign: "center",
  },
  placeholder: {
    width: 40,
  },
  listContainer: {
    padding: 12,
    paddingBottom: 24,
  },
  exerciseCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardLayout: {
    flexDirection: "row",
    height: 120,
    position: "relative",
  },
  imageContainer: {
    width: 120,
    height: "100%",
    position: "relative",
  },
  exerciseImage: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#9370FF",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  starContainer: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 10,
  },
  playButton: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  contentSection: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 4,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  statText: {
    fontSize: 13,
    color: "#666",
    marginLeft: 4,
  },
  statBadge: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 12,
    color: "#333",
  },
  calorieBadge: {
    backgroundColor: "rgba(78, 76, 76, 0.16)",
    paddingHorizontal: 5,
    paddingVertical: 0,
    borderRadius: 12,
  },
  calorieBadgeText: {
    fontSize: 12,
    color: "#333",
    fontWeight: "500",
  },
})
