"use client"

import { useEffect, useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator } from "react-native"
import { useRoute, useNavigation } from "@react-navigation/native"
import type { RouteProp } from "@react-navigation/native"
import axios from "axios"
import { ChevronLeft } from "lucide-react-native"
import { API_KEY, API_URL } from "@env"

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
  },
})
 
// Helper function to get image URL
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

type SubCategoriesRouteProp = RouteProp<RootStackParamList, "SubCategories">

type SubCategory = {
  id: number
  name: string
  description?: string
  image?: string
  exercises: any[]
}

export default function SubCategories() {
  // Define all state variables at the top level
  const [subCategories, setSubCategories] = useState<SubCategory[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [apiResponse, setApiResponse] = useState<any>(null)

  // Get navigation and route params
  const navigation = useNavigation<any>()
  const route = useRoute<SubCategoriesRouteProp>()
  const category = route.params?.category || "CROSSFIT" // Default to CROSSFIT if no params

  console.log("SubCategories screen - Received category param:", category)

  useEffect(() => {
    const fetchSubCategories = async () => {
      setLoading(true)
      
      try {
        console.log("Fetching sub-categories for category:", category)

        // Use the exact URL format specified by the user
        const url = "/fitness-plans?populate[sub_categories][populate]=image"
        console.log("Making API request to:", url)

        const response = await axiosInstance.get(url)
        console.log("API Response received with status:", response.status)

        const fitnessPlans = response.data.data
        setApiResponse(fitnessPlans)

        if (fitnessPlans && fitnessPlans.length > 0) {
          // Extract all sub-categories from all fitness plans
          const extractedSubCategories: SubCategory[] = []

          // Filter plans by category if needed
          const filteredPlans = category
            ? fitnessPlans.filter((plan: any) => plan.attributes?.type === category || plan.type === category)
            : fitnessPlans

          filteredPlans.forEach((plan: any) => {
            console.log("Processing plan:", plan.id || "unknown id")

            // Handle Strapi v4 response format
            if (plan.attributes && plan.attributes.sub_categories && plan.attributes.sub_categories.data) {
              console.log(`Found ${plan.attributes.sub_categories.data.length} sub-categories in plan`)

              plan.attributes.sub_categories.data.forEach((subCat: any) => {
                const subCategory = {
                  id: subCat.id,
                  name: subCat.attributes.name,
                  description:
                    subCat.attributes.description?.[0]?.children?.[0]?.text ||
                    (typeof subCat.attributes.description === "string"
                      ? subCat.attributes.description
                      : "No description available"),
                  exercises: subCat.attributes.exercises?.data || [],
                  image:
                    subCat.attributes.image?.data?.attributes?.formats?.small?.url ||
                    subCat.attributes.image?.data?.attributes?.url ||
                    null,
                }
                extractedSubCategories.push(subCategory)
              })
            }
            // Handle direct sub_categories array (as in your example)
            else if (plan.sub_categories && Array.isArray(plan.sub_categories)) {
              console.log(`Found ${plan.sub_categories.length} sub-categories in plan (direct array)`)

              plan.sub_categories.forEach((subCat: any) => {
                const subCategory = {
                  id: subCat.id,
                  name: subCat.name,
                  description:
                    subCat.description?.[0]?.children?.[0]?.text ||
                    (typeof subCat.description === "string" ? subCat.description : "No description available"),
                  exercises: subCat.exercises || [],
                  image: subCat.image?.[0]?.url || null,
                }
                extractedSubCategories.push(subCategory)
              })
            }
          })

          console.log(`Extracted ${extractedSubCategories.length} sub-categories`)

          if (extractedSubCategories.length === 0) {
            setError("No sub-categories available for this category.")
          } else {
            setSubCategories(extractedSubCategories)
          }
        } else {
          setError("No fitness plans found for this category.")
        }
      } catch (err) {
        console.error("Error loading sub-categories:", err)
        if (axios.isAxiosError(err)) {
          console.log("API Error Response:", err.response?.data)
          console.log("API Error Status:", err.response?.status)
          setError(`Failed to load sub-categories: ${err.message}. Status: ${err.response?.status || "unknown"}`)
        } else {
          setError("Failed to load sub-categories. Please try again.")
        }
      } finally {
        setLoading(false)
      }
    }

    fetchSubCategories()
  }, [category])

  const handleSubCategoryPress = (subCategory: SubCategory) => {
    console.log(`Navigating to Exercises with subCategoryId: ${subCategory.id}, name: ${subCategory.name}`)
    navigation.navigate("Exercises", {
      subCategoryId: subCategory.id,
      subCategoryName: subCategory.name,
    })
  }

  // Function to try a direct API call without filters
  const tryDirectApiCall = async () => {
    setLoading(true)
    setError(null)

    try {
      // Try the exact URL from your example
      const response = await axiosInstance.get("/fitness-plans?populate[sub_categories][populate]=image")
      console.log("Direct API call successful:", response.status)

      // Process the response
      const data = response.data.data
      setApiResponse(data)

      // Process the data to extract sub-categories
      const extractedSubCategories: SubCategory[] = []

      if (data && data.length > 0) {
        data.forEach((plan: any) => {
          if (plan.attributes && plan.attributes.sub_categories && plan.attributes.sub_categories.data) {
            plan.attributes.sub_categories.data.forEach((subCat: any) => {
              const subCategory = {
                id: subCat.id,
                name: subCat.attributes.name,
                description:
                  subCat.attributes.description?.[0]?.children?.[0]?.text ||
                  (typeof subCat.attributes.description === "string"
                    ? subCat.attributes.description
                    : "No description available"),
                exercises: subCat.attributes.exercises?.data || [],
                image:
                  subCat.attributes.image?.data?.attributes?.formats?.small?.url ||
                  subCat.attributes.image?.data?.attributes?.url ||
                  null,
              }
              extractedSubCategories.push(subCategory)
            })
          }
        })

        setSubCategories(extractedSubCategories)
        setError(null)
      } else {
        setError("API call successful but no data returned.")
      }
    } catch (err) {
      console.error("Direct API call failed:", err)
      setError(`Direct API call failed: ${axios.isAxiosError(err) ? (err as any).message : "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  // Render loading state
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Loading sub-categories...</Text>
      </View>
    )
  }

  // Render error state
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={tryDirectApiCall}>
          <Text style={styles.retryButtonText}>Load All Sub-Categories</Text>
        </TouchableOpacity>
      </View>
    )
  }

  // Render main content
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButtonError} onPress={() => navigation.goBack()}>
          <ChevronLeft stroke="#000" width={24} height={24} />
        </TouchableOpacity>

        <Text style={styles.categoryTitle}>{category}</Text>
      </View>

      {subCategories.length > 0 ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {subCategories.map((subCategory, index) => (
            <TouchableOpacity
              key={subCategory.id}
              style={styles.card}
              onPress={() => handleSubCategoryPress(subCategory)}
              activeOpacity={0.7}
            >
              <View style={styles.imageContainer}>
                {subCategory.image ? (
                  <Image source={{ uri: getImageUrl(subCategory.image) }} style={styles.image} resizeMode="cover" />
                ) : (
                  <View style={styles.placeholderImage}>
                    <Text style={styles.placeholderText}>{subCategory.name.charAt(0)}</Text>
                  </View>
                )}
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.cardTitle}>{subCategory.name}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.noDataText}>No sub-categories available.</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    marginBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 24,
    fontWeight: "600",
  },
  shareButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  shareButtonText: {
    fontSize: 24,
    fontWeight: "600",
  },
  scrollContent: {
    paddingBottom: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: "500",
    color: "#000",
    paddingTop: 20,
    textAlign: "center",
    flex: 1,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
  },
  errorText: {
    fontSize: 16,
    color: "#EF4444",
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "500",
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noDataText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 20,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  imageContainer: {
    position: "relative",
    height: 180,
    width: "100%",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  indexBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "rgba(255,255,255,0.8)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  indexText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  lockContainer: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  lockIcon: {
    fontSize: 16,
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#9CA3AF",
  },
  textContainer: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
  },
  durationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  durationText: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 4,
  },
  exerciseCount: {
    fontSize: 14,
    color: "#4F46E5",
    fontWeight: "500",
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
  retryButton: {
    backgroundColor: "#4F46E5",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  debugContainer: {
    marginTop: 20,
    maxHeight: 300,
    width: "100%",
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 8,
  },
  debugTitle: {
    fontWeight: "bold",
    marginBottom: 10,
  },
  debugText: {
    fontFamily: "monospace",
    fontSize: 12,
  },
})
