"use client"

import { useEffect, useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ImageBackground,
  Animated,
} from "react-native"
import { ArrowLeft, Search, Filter, Clock, ChevronRight } from "lucide-react-native"
import { useNavigation } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"
import { getCategories, getRecipes } from "../api/recipes/route"

const { width, height } = Dimensions.get("window")

type RootStackParamList = {
  Home: undefined
  Nutrition: undefined
  RecipeDetail: { recipeId: string }
  NutritionCategory: { category: string }
  Recette: { category?: string }
}

type NutritionScreenNavigationProp = StackNavigationProp<RootStackParamList, "Nutrition">

type Recipe = {
  id: number
  documentId: string
  title: string
  description: string
  preparation_time: number
  cooking_time: number
  total_time: number
  category: string
  difficulty: string
  dietary_tags: string
  image: {
    formats: {
      small: {
        url: string
      }
    }
    url: string
  }[]
  nutrition?: {
    calories?: {
      per_serving?: number
      per_100g?: number
    }
    protein?: {
      per_serving?: number
      per_100g?: number
    }
    carbs?: {
      per_serving?: number
      per_100g?: number
    }
    fat?: {
      per_serving?: number
      per_100g?: number
    }
  }
}

type Category = {
  id: number
  attributes?: {
    title?: string
    image?: {
      data?: {
        attributes?: {
          formats?: {
            small?: {
              url?: string
            }
          }
        }
      }
    }
  }
}

export default function NutritionScreen() {
  const navigation = useNavigation<NutritionScreenNavigationProp>()
  const [featuredRecipes, setFeaturedRecipes] = useState<Recipe[]>([])
  const [healthyRecipes, setHealthyRecipes] = useState<Recipe[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      // Fetch recipes
      const allRecipes = await getRecipes()

      // Filter recipes with nutrition information
      const recipesWithNutrition = allRecipes.filter(
        (recipe: Recipe) => recipe.nutrition && Object.keys(recipe.nutrition).length > 0,
      )

      // Get featured recipes (first 5)
      setFeaturedRecipes(recipesWithNutrition.slice(0, 50))

      // Get healthy recipes (low calorie or high protein)
      const healthy = recipesWithNutrition.filter(
        (recipe: Recipe) =>
          (recipe.nutrition?.calories?.per_serving && recipe.nutrition.calories.per_serving < 400) ||
          (recipe.nutrition?.protein?.per_serving && recipe.nutrition.protein.per_serving > 20),
      )
      setHealthyRecipes(healthy.slice(5,30))

      // Fetch categories
      const categoriesData = await getCategories().catch((error) => {
        console.error("Error fetching categories:", error.response?.data || error.message)
        return []
      })

      // Filter out any invalid categories
      const validCategories = categoriesData.filter(
        (category: Category) => category && category.id && category.attributes,
      )

      setCategories(validCategories || [])
      console.log("Categories fetched:", validCategories.length)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const renderNutritionInfo = (recipe: Recipe) => {
    if (!recipe.nutrition) return null

    return (
      <View style={styles.nutritionInfo}>
        {recipe.nutrition.calories?.per_serving && (
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{recipe.nutrition.calories.per_serving}</Text>
            <Text style={styles.nutritionLabel}>cal</Text>
          </View>
        )}
        {recipe.nutrition.protein?.per_serving && (
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{recipe.nutrition.protein.per_serving}g</Text>
            <Text style={styles.nutritionLabel}>protein</Text>
          </View>
        )}
        {recipe.nutrition.carbs?.per_serving && (
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{recipe.nutrition.carbs.per_serving}g</Text>
            <Text style={styles.nutritionLabel}>carbs</Text>
          </View>
        )}
        {recipe.nutrition.fat?.per_serving && (
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{recipe.nutrition.fat.per_serving}g</Text>
            <Text style={styles.nutritionLabel}>fat</Text>
          </View>
        )}
      </View>
    )
  }

  const renderCategoryCard = (category: Category) => {
    // Skip rendering if category is invalid
    if (!category || !category.id || !category.attributes) {
      return null
    }

    // Safely access properties with optional chaining and default values
    const title = category.attributes?.title || "Untitled"
    const documentId = category.id.toString()

    // Safely build the image URL with fallbacks
    let imageUrl = "https://via.placeholder.com/300x200?text=No+Image"
    if (category.attributes?.image?.data?.attributes?.formats?.small?.url) {
      imageUrl = "http://4301-197-26-47-92.ngrok-free.app" + category.attributes.image.data.attributes.formats.small.url
    }

    return (
      <TouchableOpacity
        style={styles.categoryCard}
        onPress={() => navigation.navigate("Recette", { category: documentId })}
      >
        <ImageBackground source={{ uri: imageUrl }} style={styles.categoryImage}>
          <View style={styles.categoryContent}>
            <Text style={styles.categoryTitle}>{title}</Text>
            <Text style={styles.categoryDescription}>Nutritious recipes</Text>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={22} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nutrition</Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Search size={20} color="#666" />
              <Text style={styles.searchPlaceholder}>Search nutritious recipes...</Text>
            </View>
            <TouchableOpacity style={styles.filterButton}>
              <Filter size={20} color="#000" />
            </TouchableOpacity>
          </View>

          {/* Nutrition Categories */}
          {categories.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Nutrition Categories</Text>
                <TouchableOpacity>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
                <Animated.View style={{ flexDirection: "row" }}>
                  {categories.map((category, index) => (
                    <View key={index}>{renderCategoryCard(category)}</View>
                  ))}
                </Animated.View>
              </ScrollView>
            </View>
          )}

          {/* Featured Recipes */}
          {featuredRecipes.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Featured Recipes</Text>
                <TouchableOpacity>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {featuredRecipes.map((recipe) => (
                  <TouchableOpacity
                    key={recipe.id}
                    style={styles.recipeCard}
                    onPress={() => navigation.navigate("RecipeDetail", { recipeId: recipe.documentId })}
                  >
                    <Image
                      source={{
                        uri:
                          recipe.image && recipe.image.length > 0
                            ? `http://4301-197-26-47-92.ngrok-free.app${recipe.image[0].formats.small.url}`
                            : "https://via.placeholder.com/300x200?text=No+Image",
                      }}
                      style={styles.recipeImage}
                    />
                    <View style={styles.recipeContent}>
                      <Text style={styles.recipeTitle} numberOfLines={1}>
                        {recipe.title}
                      </Text>
                      <View style={styles.recipeInfo}>
                        <View style={styles.recipeTime}>
                          <Clock size={14} color="#666" />
                          <Text style={styles.recipeTimeText}>{recipe.total_time || recipe.cooking_time} min</Text>
                        </View>
                        {renderNutritionInfo(recipe)}
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Healthy Recipes */}
          {healthyRecipes.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Healthy Recipes</Text>
                <TouchableOpacity>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>

              {healthyRecipes.map((recipe) => (
                <TouchableOpacity
                  key={recipe.id}
                  style={styles.healthyRecipeCard}
                  onPress={() => navigation.navigate("RecipeDetail", { recipeId: recipe.documentId })}
                >
                  <Image
                    source={{
                      uri:
                        recipe.image && recipe.image.length > 0
                          ? `http://4301-197-26-47-92.ngrok-free.app${recipe.image[0].formats.small.url}`
                          : "https://via.placeholder.com/300x200?text=No+Image",
                    }}
                    style={styles.healthyRecipeImage}
                  />
                  <View style={styles.healthyRecipeContent}>
                    <Text style={styles.healthyRecipeTitle} numberOfLines={2}>
                      {recipe.title}
                    </Text>
                    <Text style={styles.healthyRecipeDescription} numberOfLines={2}>
                      {recipe.description || `A delicious ${recipe.category} recipe with great nutritional value.`}
                    </Text>
                    {renderNutritionInfo(recipe)}
                  </View>
                  <ChevronRight size={20} color="#666" style={styles.healthyRecipeArrow} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          
        </ScrollView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 12,
  },
  searchPlaceholder: {
    marginLeft: 8,
    color: "#666",
    fontSize: 14,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  seeAllText: {
    fontSize: 14,
    color: "#666",
  },
  categoriesContainer: {
    marginLeft: -16,
    paddingLeft: 16,
  },
  categoryCard: {
    width: width * 0.7,
    height: 120,
    marginRight: 16,
    borderRadius: 16,
    overflow: "hidden",
  },
  categoryImage: {
    width: "100%",
    height: "100%",
    justifyContent: "flex-end",
  },
  categoryContent: {
    padding: 16,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 12,
    color: "#FFF",
  },
  recipeCard: {
    width: width * 0.6,
    marginRight:20,
    borderRadius: 20,
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
    overflow: "hidden",
  },
  recipeImage: {
    width: "100%",
    height: 150,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  recipeContent: {
    padding: 12,
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#000",
  },
  recipeInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  recipeTime: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  recipeTimeText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  nutritionInfo: {
    flexDirection: "row",
    flex: 1,
    justifyContent: "space-around",
  },
  nutritionItem: {
    alignItems: "center",
  },
  nutritionValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#000",
  },
  nutritionLabel: {
    fontSize: 10,
    color: "#666",
  },
  healthyRecipeCard: {
    flexDirection: "row",
    marginBottom: 20,
    borderRadius: 16,
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: "hidden",
  },
  healthyRecipeImage: {
    width: 120,
    height: 150,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  healthyRecipeContent: {
    flex: 1,
    padding: 12,
  },
  healthyRecipeTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    color: "#000",
  },
  healthyRecipeDescription: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  healthyRecipeArrow: {
    alignSelf: "center",
    marginRight: 12,
  },
  
})

