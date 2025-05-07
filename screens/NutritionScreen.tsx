"use client"

import React, { useEffect, useState, useRef } from "react"
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
  StatusBar,
} from "react-native"
import { Search, Filter, Clock, ChevronRight, Heart, Star } from "lucide-react-native"
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
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Use useRef to ensure the Animated.Value persists across renders
  const scrollY = useRef(new Animated.Value(0)).current

  useEffect(() => {
    fetchData()

    // Cleanup function to prevent memory leaks
    return () => {
      // Remove any listeners if needed
      scrollY.removeAllListeners()
    }
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      // Fetch recipes
      const recipesData = await getRecipes()
      setAllRecipes(recipesData)

      // Filter recipes with nutrition information
      const recipesWithNutrition = recipesData.filter((recipe: Recipe) => recipe.nutrition?.calories?.per_serving)

      // Get featured recipes
      setFeaturedRecipes(recipesWithNutrition.slice(5, 20))

      // Get healthy recipes (low calorie)
      const healthy = recipesWithNutrition
        .filter((recipe) => recipe.nutrition?.calories?.per_serving && recipe.nutrition.calories.per_serving < 400)
        .slice(15, 30)
      setHealthyRecipes(healthy)

      // Fetch categories
      const categoriesData = await getCategories().catch(() => [])
      const validCategories = categoriesData.filter((category: Category) => category?.id && category?.attributes?.title)
      setCategories(validCategories)
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
      // Fix the URL construction
      imageUrl = API_BASE_URL + category.attributes.image.data.attributes.formats.small.url
    }

    const isSelected = selectedCategory === documentId

    return (
      <TouchableOpacity
        style={[styles.categoryCard, isSelected && styles.selectedCategoryCard]}
        onPress={() => {
          setSelectedCategory(isSelected ? null : documentId)
        }}
      >
        <ImageBackground source={{ uri: imageUrl }} style={styles.categoryImage}>
          <View style={[styles.categoryOverlay, isSelected && styles.selectedCategoryOverlay]} />
          <View style={styles.categoryContent}>
            <Text style={styles.categoryTitle}>{title.toUpperCase()}</Text>
            <Text style={styles.categoryDescription}>1 SEMAINE - 2 PERSONNES</Text>
          </View>
          {isSelected && (
            <View style={styles.selectedBadge}>
              <Star size={14} color="#FFFFFF" fill="#FFFFFF" />
            </View>
          )}
        </ImageBackground>
      </TouchableOpacity>
    )
  }

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: "clamp",
  })

  // Memoize the recipe card component to prevent unnecessary re-renders
  const RecipeCard = React.memo(({ recipe }: { recipe: Recipe }) => (
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
          <Heart size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      <View style={styles.recipeContent}>
        <Text style={styles.recipeTitle} numberOfLines={1}>
          {recipe.title}
        </Text>
        <View style={styles.recipeInfo}>
          <View style={styles.recipeTime}>
            <Clock size={12} color="#777777" />
            <Text style={styles.recipeTimeText}>{recipe.total_time || recipe.cooking_time} min</Text>
          </View>
          {renderNutritionInfo(recipe)}
        </View>
      </View>
    </TouchableOpacity>
  ))

  const filteredRecipes = selectedCategory
    ? allRecipes.filter((recipe) => recipe.category === selectedCategory)
    : allRecipes

  // Create a stable callback for the scroll event
  const handleScroll = Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Animated.View style={[styles.headerBackground, { opacity: headerOpacity }]} />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Chargement des recettes...</Text>
        </View>
      ) : (
        <Animated.ScrollView showsVerticalScrollIndicator={false} onScroll={handleScroll} scrollEventThrottle={16}>
          <View style={styles.searchContainer}>
            <TouchableOpacity style={styles.searchBar} activeOpacity={0.8}>
              <Search size={20} color="#777777" />
              <Text style={styles.searchPlaceholder}>Trouve ta recette</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterButton}>
              <Filter size={20} color="#777777" />
            </TouchableOpacity>
          </View>

          {/* Nutrition Categories */}
          {categories.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Plans alimentaires</Text>
                <TouchableOpacity style={styles.seeAllButton}>
                  <Text style={styles.seeAllText}>Voir plus</Text>
                  <ChevronRight size={16} color="#777777" />
                </TouchableOpacity>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
                {categories.map((category, index) => (
                  <View key={`category-${category.id || index}`}>{renderCategoryCard(category)}</View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Featured Recipes */}
          {featuredRecipes.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Nouvelles recettes</Text>
                <TouchableOpacity style={styles.seeAllButton}>
                  <Text style={styles.seeAllText}>Voir plus</Text>
                  <ChevronRight size={16} color="#777777" />
                </TouchableOpacity>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {featuredRecipes.map((recipe) => (
                  <RecipeCard key={`featured-${recipe.id}`} recipe={recipe} />
                ))}
              </ScrollView>
            </View>
          )}

          {/* All Recipes Grid */}
          <View style={[styles.section, styles.allRecipesSection]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Toutes les recettes</Text>
              {selectedCategory && (
                <TouchableOpacity style={styles.clearFilterButton} onPress={() => setSelectedCategory(null)}>
                  <Text style={styles.clearFilterText}>Effacer le filtre</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.recipesGrid}>
              {filteredRecipes.map((recipe) => (
                <TouchableOpacity
                  key={`grid-${recipe.id}`}
                  style={styles.gridRecipeCard}
                  onPress={() => navigation.navigate("RecipeDetail", { recipeId: recipe.documentId })}
                >
                  <View style={styles.gridRecipeImageContainer}>
                    <Image
                      source={{
                        uri:
                          recipe.image && recipe.image.length > 0
                            ? `${API_BASE_URL}${recipe.image[0].formats.small.url}`
                            : "https://via.placeholder.com/300x200?text=No+Image",
                      }}
                      style={styles.gridRecipeImage}
                    />
                    <TouchableOpacity style={styles.gridFavoriteButton}>
                      <Heart size={14} color="#FFFFFF" fill="#000000" />
                    </TouchableOpacity>
                    <View style={styles.gridRecipeCategory}>
                      <Text style={styles.gridRecipeCategoryText}>{recipe.category}</Text>
                    </View>
                  </View>
                  <View style={styles.gridRecipeContent}>
                    <Text style={styles.gridRecipeTitle} numberOfLines={1}>
                      {recipe.title}
                    </Text>
                    <View style={styles.gridRecipeInfo}>
                      <View style={styles.gridRecipeTime}>
                        <Clock size={10} color="#777777" />
                        <Text style={styles.gridRecipeTimeText}>{recipe.total_time || recipe.cooking_time} min</Text>
                      </View>
                      {recipe.nutrition?.calories?.per_serving && (
                        <Text style={styles.gridRecipeCalories}>{recipe.nutrition.calories.per_serving} cal</Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Healthy Recipes */}
          {healthyRecipes.length > 0 && (
            <View style={[styles.section, styles.healthySection]}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recettes santé</Text>
                <TouchableOpacity style={styles.seeAllButton}>
                  <Text style={styles.seeAllText}>Voir plus</Text>
                  <ChevronRight size={16} color="#777777" />
                </TouchableOpacity>
              </View>

              {healthyRecipes.map((recipe) => (
                <TouchableOpacity
                  key={`healthy-${recipe.id}`}
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
                    <View style={styles.healthyRecipeTags}>
                      <View style={styles.healthyRecipeTag}>
                        <Text style={styles.healthyRecipeTagText}>{recipe.category}</Text>
                      </View>
                    </View>
                    <Text style={styles.healthyRecipeTitle} numberOfLines={2}>
                      {recipe.title}
                    </Text>
                    <Text style={styles.healthyRecipeDescription} numberOfLines={2}>
                      {recipe.description ||
                        `Une délicieuse recette ${recipe.category} avec une grande valeur nutritionnelle.`}
                    </Text>
                    {renderNutritionInfo(recipe)}
                  </View>
                  <ChevronRight size={20} color="#FFFFFF" style={styles.healthyRecipeArrow} />
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
    paddingTop: 2,
  },
  headerBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: "#FFFFFF",
    zIndex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: "transparent",
    zIndex: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000000",
    letterSpacing: 1.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#000000",
    fontWeight: "500",
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
    backgroundColor: "#f5f5f5",
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginRight: 12,
  },
  searchPlaceholder: {
    marginLeft: 10,
    color: "#777777",
    fontSize: 14,
    fontWeight: "500",
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },
  section: {
    marginBottom: 30,
    paddingHorizontal: 16,
  },
  healthySection: {
    backgroundColor: "#F5F5F5",
    paddingTop: 24,
    paddingBottom: 10,
    marginHorizontal: -16,
    paddingHorizontal: 32,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#fff",
  },
  allRecipesSection: {
    marginTop: 10,
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
    color: "#000000",
    letterSpacing: 0.5,
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#555555",
    marginRight: 4,
  },
  clearFilterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#333333",
    borderRadius: 20,
  },
  clearFilterText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  categoriesContainer: {
    marginLeft: -16,
    paddingLeft: 16,
  },
  categoryCard: {
    width: width * 0.7,
    height: 160,
    marginRight: 16,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  selectedCategoryCard: {
    borderColor: "#FFFFFF",
    borderWidth: 2,
  },
  categoryImage: {
    width: "100%",
    height: "100%",
    justifyContent: "flex-end",
  },
  categoryOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(80, 80, 80, 0.45)",
    borderRadius: 16,
  },
  selectedCategoryOverlay: {
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  categoryContent: {
    padding: 16,
    zIndex: 1,
  },
  categoryTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 4,
    textShadowColor: "rgba(48, 46, 46, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  categoryDescription: {
    fontSize: 12,
    color: "#FFF",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  selectedBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(80, 80, 80, 0.05)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },
  recipeCard: {
    width: width * 0.65,
    marginRight: 20,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
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
    backgroundColor: "rgba(134, 132, 132, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  recipeContent: {
    padding: 16,
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
    color: "#000000",
  },
  recipeInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  recipeTime: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recipeTimeText: {
    fontSize: 12,
    color: "#555555",
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
    color: "#000000",
  },
  nutritionLabel: {
    fontSize: 10,
    color: "#555555",
  },
  recipesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridRecipeCard: {
    width: (width - 40) / 2,
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: "hidden",
  },
  gridRecipeImageContainer: {
    position: "relative",
  },
  gridRecipeImage: {
    width: "100%",
    height: 140,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  gridFavoriteButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(109, 108, 108, 0.4), 0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  gridRecipeCategory: {
    display: "none",
  },
  gridRecipeCategoryText: {
    fontSize: 10,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  gridRecipeContent: {
    padding: 12,
  },
  gridRecipeTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
    color: "#000000",
  },
  gridRecipeInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  gridRecipeTime: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  gridRecipeTimeText: {
    fontSize: 10,
    color: "#555555",
    marginLeft: 3,
    fontWeight: "500",
  },
  gridRecipeCalories: {
    fontSize: 10,
    color: "#AAAAAA",
    fontWeight: "600",
  },
  healthyRecipeCard: {
    flexDirection: "row",
    marginBottom: 20,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
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
  healthyRecipeTags: {
    flexDirection: "row",
    marginBottom: 4,
  },
  healthyRecipeTag: {
    display: "none",
  },
  healthyRecipeTagText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
  },
  healthyRecipeTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
    color: "#000000",
  },
  healthyRecipeDescription: {
    fontSize: 12,
    color: "#AAAAAA",
    marginBottom: 8,
    lineHeight: 16,
  },
  healthyRecipeArrow: {
    alignSelf: "center",
    marginRight: 12,
  },
  footer: {
    paddingVertical: 20,
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#DDDDDD",
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: "#555555",
  },
})
