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
import { ArrowLeft, Search, Filter, Clock, ChevronRight, Heart } from "lucide-react-native"
import { useNavigation } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"
import { getCategories, getRecipes } from "../api/recipes/route"
import { API_BASE_URL } from "@env"

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
  const scrollY = new Animated.Value(0)

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
      imageUrl =   imageUrl = API_BASE_URL + imageUrl;
      + category.attributes.image.data.attributes.formats.small.url
    }

    return (
      <TouchableOpacity
        style={styles.categoryCard}
        onPress={() => navigation.navigate("Recette", { category: documentId })}
      >
        <ImageBackground source={{ uri: imageUrl }} style={styles.categoryImage}>
          <View style={styles.categoryOverlay} />
          <View style={styles.categoryContent}>
            <Text style={styles.categoryTitle}>{title}</Text>
            <Text style={styles.categoryDescription}>Nutritious recipes</Text>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    )
  }

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.headerBackground, { opacity: headerOpacity }]} />
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
        <Animated.ScrollView 
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
        >
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
                <TouchableOpacity style={styles.seeAllButton}>
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
                <TouchableOpacity style={styles.seeAllButton}>
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
                    <View style={styles.recipeImageContainer}>
                      <Image
                        source={{
                          uri:
                            recipe.image && recipe.image.length > 0
                              ? `${API_BASE_URL}${recipe.image[0].formats.small.url}`
                              : "https://via.placeholder.com/300x200?text=No+Image",
                        }}
                        style={styles.recipeImage}
                      />
                      <TouchableOpacity style={styles.favoriteButton}>
                        <Heart size={16} color="#FF4757" />
                      </TouchableOpacity>
                    </View>
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
            <View style={[styles.section, styles.healthySection]}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Healthy Recipes</Text>
                <TouchableOpacity style={styles.seeAllButton}>
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
                          ? `${API_BASE_URL}${recipe.image[0].formats.small.url}`
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
          
          {/* Bottom padding */}
          <View style={{ height: 30 }} />
        </Animated.ScrollView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: '#FFFFFF',
    zIndex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: "transparent",
    zIndex: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
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
    paddingVertical: 12,
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
    marginBottom: 30,
    paddingHorizontal: 16,
  },
  healthySection: {
    backgroundColor: "#F9F9F9",
    paddingTop: 24,
    paddingBottom: 10,
    marginHorizontal: -16,
    paddingHorizontal: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
  },
  seeAllButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#007AFF",
  },
  categoriesContainer: {
    marginLeft: -16,
    paddingLeft: 16,
  },
  categoryCard: {
    width: width * 0.7,
    height: 140,
    marginRight: 16,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  categoryImage: {
    width: "100%",
    height: "100%",
    justifyContent: "flex-end",
  },
  categoryOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  categoryContent: {
    padding: 16,
    zIndex: 1,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10
  },
  categoryDescription: {
    fontSize: 14,
    color: "#FFF",
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10
  },
  recipeCard: {
    width: width * 0.65,
    marginRight: 20,
    borderRadius: 20,
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: "hidden",
  },
  recipeImageContainer: {
    position: "relative",
  },
  recipeImage: {
    width: "100%",
    height: 180,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  favoriteButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  recipeContent: {
    padding: 16,
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
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
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recipeTimeText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
    fontWeight: "500",
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
    fontSize: 14,
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
    height: 120,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  healthyRecipeContent: {
    flex: 1,
    padding: 12,
  },
  healthyRecipeTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
    color: "#000",
  },
  healthyRecipeDescription: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
    lineHeight: 16,
  },
  healthyRecipeArrow: {
    alignSelf: "center",
    marginRight: 12,
  },
})