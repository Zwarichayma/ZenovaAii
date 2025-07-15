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
  ImageBackground,
  Animated,
  StatusBar,
  TextInput,
  Platform,
} from "react-native"
import { Search, Clock, ChevronRight, Heart, Star, X } from "lucide-react-native"
import { useNavigation } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"
import { getCategories, getRecipes } from "../api/recipes/route"
import { API_BASE_URL } from "@/config"

const { width, height } = Dimensions.get("window")

// Colors for skeleton
const SKELETON_COLORS = {
  background: "#E8E8E8",
  highlight: "#F5F5F5",
}

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

// Skeleton Components
const SkeletonCategoryCard = () => (
  <View style={[styles.categoryCard, styles.skeletonCard]}>
    {/* Skeleton overlay to match the gradient overlay */}
    <View style={[styles.categoryOverlay, { backgroundColor: "rgba(232, 232, 232, 0.3)" }]} />

    {/* Skeleton badge in top right to match selected badge */}
    <View
      style={[
        styles.selectedBadge,
        { backgroundColor: SKELETON_COLORS.highlight, borderColor: SKELETON_COLORS.highlight },
      ]}
    />

    {/* Content at bottom matching actual card */}
    <View style={styles.categoryContent}>
      <View style={[styles.skeletonTitle, { width: "70%", height: 22, marginBottom: 4 }]} />
      <View style={[styles.skeletonSubtitle, { width: "50%", height: 12 }]} />
    </View>
  </View>
)

const SkeletonRecipeCard = () => (
  <View style={[styles.recipeCard, styles.skeletonCard]}>
    <View style={styles.recipeImageContainer}>
      <View style={[styles.skeletonImage, { height: 180 }]} />
      {/* Skeleton favorite button */}
      <View style={[styles.favoriteButton, { backgroundColor: SKELETON_COLORS.highlight }]} />
    </View>
    <View style={styles.recipeContent}>
      <View style={[styles.skeletonTitle, { width: "80%", height: 16, marginBottom: 12 }]} />
      <View style={styles.recipeInfo}>
        <View style={[styles.recipeTime, styles.skeletonTime]} />
        <View style={styles.nutritionInfo}>
          <View style={styles.nutritionItem}>
            <View style={[styles.skeletonSubtitle, { width: 30, height: 14 }]} />
            <View style={[styles.skeletonSubtitle, { width: 20, height: 10, marginTop: 2 }]} />
          </View>
          <View style={styles.nutritionItem}>
            <View style={[styles.skeletonSubtitle, { width: 25, height: 14 }]} />
            <View style={[styles.skeletonSubtitle, { width: 35, height: 10, marginTop: 2 }]} />
          </View>
          <View style={styles.nutritionItem}>
            <View style={[styles.skeletonSubtitle, { width: 25, height: 14 }]} />
            <View style={[styles.skeletonSubtitle, { width: 30, height: 10, marginTop: 2 }]} />
          </View>
          <View style={styles.nutritionItem}>
            <View style={[styles.skeletonSubtitle, { width: 20, height: 14 }]} />
            <View style={[styles.skeletonSubtitle, { width: 15, height: 10, marginTop: 2 }]} />
          </View>
        </View>
      </View>
    </View>
  </View>
)

const SkeletonGridRecipeCard = () => (
  <View style={[styles.gridRecipeCard, styles.skeletonCard]}>
    <View style={styles.gridRecipeImageContainer}>
      <View style={[styles.skeletonImage, { height: 140 }]} />
      {/* Skeleton favorite button */}
      <View style={[styles.gridFavoriteButton, { backgroundColor: SKELETON_COLORS.highlight }]} />
    </View>
    <View style={styles.gridRecipeContent}>
      <View style={[styles.skeletonTitle, { width: "90%", height: 14, marginBottom: 8 }]} />
      <View style={styles.gridRecipeInfo}>
        <View style={[styles.gridRecipeTime, styles.skeletonTime, { width: 60, height: 20 }]} />
        <View style={[styles.skeletonSubtitle, { width: 45, height: 10 }]} />
      </View>
    </View>
  </View>
)

const SkeletonHealthyRecipeCard = () => (
  <View style={[styles.healthyRecipeCard, styles.skeletonCard]}>
    <View
      style={[styles.skeletonImage, { width: 120, height: 120, borderTopLeftRadius: 16, borderBottomLeftRadius: 16 }]}
    />
    <View style={styles.healthyRecipeContent}>
      <View style={[styles.skeletonTitle, { width: "80%", height: 16, marginBottom: 4 }]} />
      <View style={[styles.skeletonSubtitle, { width: "90%", height: 12, marginBottom: 4 }]} />
      <View style={[styles.skeletonSubtitle, { width: "70%", height: 12, marginBottom: 8 }]} />
      <View style={styles.nutritionInfo}>
        <View style={styles.nutritionItem}>
          <View style={[styles.skeletonSubtitle, { width: 30, height: 14 }]} />
          <View style={[styles.skeletonSubtitle, { width: 20, height: 10, marginTop: 2 }]} />
        </View>
        <View style={styles.nutritionItem}>
          <View style={[styles.skeletonSubtitle, { width: 25, height: 14 }]} />
          <View style={[styles.skeletonSubtitle, { width: 35, height: 10, marginTop: 2 }]} />
        </View>
        <View style={styles.nutritionItem}>
          <View style={[styles.skeletonSubtitle, { width: 25, height: 14 }]} />
          <View style={[styles.skeletonSubtitle, { width: 30, height: 10, marginTop: 2 }]} />
        </View>
        <View style={styles.nutritionItem}>
          <View style={[styles.skeletonSubtitle, { width: 20, height: 14 }]} />
          <View style={[styles.skeletonSubtitle, { width: 15, height: 10, marginTop: 2 }]} />
        </View>
      </View>
    </View>
    {/* Skeleton arrow */}
    <View
      style={[
        styles.healthyRecipeArrow,
        { width: 20, height: 20, backgroundColor: SKELETON_COLORS.highlight, borderRadius: 10 },
      ]}
    />
  </View>
)

// Skeleton UI Component
const SkeletonUI = () => (
  <ScrollView showsVerticalScrollIndicator={false}>
    {/* Skeleton Nutrition Categories */}
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Meal Plans</Text>
        <View style={styles.seeAllButton}>
          <Text style={styles.seeAllText}>See more</Text>
          <ChevronRight size={16} color="#777777" />
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
        {[1, 2, 3].map((_, index) => (
          <View key={`skeleton-category-${index}`} style={{ marginRight: 16 }}>
            <SkeletonCategoryCard />
          </View>
        ))}
      </ScrollView>
    </View>

    {/* Skeleton Featured Recipes */}
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>New Recipes</Text>
        <View style={styles.seeAllButton}>
          <Text style={styles.seeAllText}>See more</Text>
          <ChevronRight size={16} color="#777777" />
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {[1, 2, 3].map((_, index) => (
          <View key={`skeleton-featured-${index}`} style={{ marginRight: 20 }}>
            <SkeletonRecipeCard />
          </View>
        ))}
      </ScrollView>
    </View>

    {/* Skeleton All Recipes Grid */}
    <View style={[styles.section, styles.allRecipesSection]}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>All Recipes</Text>
      </View>

      <View style={styles.recipesGrid}>
        {[1, 2, 3, 4].map((_, index) => (
          <SkeletonGridRecipeCard key={`skeleton-grid-${index}`} />
        ))}
      </View>
    </View>

    {/* Skeleton Healthy Recipes */}
    <View style={[styles.section, styles.healthySection]}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Healthy Recipes</Text>
        <View style={styles.seeAllButton}>
          <Text style={styles.seeAllText}>See more</Text>
          <ChevronRight size={16} color="#777777" />
        </View>
      </View>

      {[1, 2, 3].map((_, index) => (
        <SkeletonHealthyRecipeCard key={`skeleton-healthy-${index}`} />
      ))}
    </View>

    {/* Bottom padding */}
    <View style={{ height: 30 }} />
  </ScrollView>
)

export default function NutritionScreen() {
  const navigation = useNavigation<NutritionScreenNavigationProp>()
  const [featuredRecipes, setFeaturedRecipes] = useState<Recipe[]>([])
  const [healthyRecipes, setHealthyRecipes] = useState<Recipe[]>([])
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([])
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

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

  // Filter recipes based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredRecipes(
        selectedCategory ? allRecipes.filter((recipe) => recipe.category === selectedCategory) : allRecipes,
      )
    } else {
      const filtered = allRecipes.filter(
        (recipe) =>
          recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (recipe.description && recipe.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (recipe.dietary_tags && recipe.dietary_tags.toLowerCase().includes(searchQuery.toLowerCase())) ||
          recipe.category.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredRecipes(
        selectedCategory ? filtered.filter((recipe) => recipe.category === selectedCategory) : filtered,
      )
    }
  }, [searchQuery, allRecipes, selectedCategory])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      // Fetch recipes
      const recipesData = await getRecipes()
      setAllRecipes(recipesData)
      setFilteredRecipes(recipesData)

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

  const toggleSearch = () => {
    setShowSearch(!showSearch)
    if (showSearch) {
      setSearchQuery("")
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
            <Text style={styles.categoryDescription}>1 WEEK - 2 PEOPLE</Text>
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

  // Create a stable callback for the scroll event
  const handleScroll = Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Animated.View style={[styles.headerBackground, { opacity: headerOpacity }]} />

      {/* Enhanced header with search functionality */}
      <View style={styles.header}>
        {!showSearch ? (
          <>
            <View style={styles.headerLeft} />
            <TouchableOpacity onPress={toggleSearch} style={styles.searchButton}>
              <Search size={20} color="#333" />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity onPress={toggleSearch} style={styles.backButton}>
              <X size={20} color="#333" />
            </TouchableOpacity>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search recipes..."
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
            </View>
          </>
        )}
      </View>

      {/* Recipe count when searching */}
      {searchQuery.trim() !== "" && (
        <View style={styles.recipeCountContainer}>
          <Text style={styles.recipeCount}>
            {filteredRecipes.length} {filteredRecipes.length === 1 ? "recipe found" : "recipes found"}
          </Text>
        </View>
      )}

      {isLoading ? (
        <SkeletonUI />
      ) : (
        <Animated.ScrollView showsVerticalScrollIndicator={false} onScroll={handleScroll} scrollEventThrottle={16}>
          {/* Nutrition Categories */}
          {categories.length > 0 && !searchQuery && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Meal Plans</Text>
                <TouchableOpacity style={styles.seeAllButton}>
                  <Text style={styles.seeAllText}>See more</Text>
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
          {featuredRecipes.length > 0 && !searchQuery && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>New Recipes</Text>
                <TouchableOpacity style={styles.seeAllButton}>
                  <Text style={styles.seeAllText}>See more</Text>
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
              <Text style={styles.sectionTitle}>{searchQuery ? "Search Results" : "All Recipes"}</Text>
              {selectedCategory && !searchQuery && (
                <TouchableOpacity style={styles.clearFilterButton} onPress={() => setSelectedCategory(null)}>
                  <Text style={styles.clearFilterText}>Clear filter</Text>
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
                      <Heart size={14} color="#FFFFFF" />
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
          {healthyRecipes.length > 0 && !searchQuery && (
            <View style={[styles.section, styles.healthySection]}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Healthy Recipes</Text>
                <TouchableOpacity style={styles.seeAllButton}>
                  <Text style={styles.seeAllText}>See more</Text>
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
                      {recipe.description || `A delicious ${recipe.category} recipe with great nutritional value.`}
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
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingBottom: 15,
    backgroundColor: "transparent",
    zIndex: 2,
  },
  headerLeft: {
    width: 44,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    textAlign: "center",
    flex: 1,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f7f7f7",
    alignItems: "center",
    justifyContent: "center",
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f7f7f7",
    borderRadius: 8,
    marginLeft: 10,
    paddingHorizontal: 10,
    height: 36,
  },
  searchInput: {
    flex: 1,
    height: 36,
    color: "#000",
    fontSize: 14,
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f7f7f7",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 3,
  },
  recipeCountContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  recipeCount: {
    fontSize: 14,
    color: "#555",
    fontWeight: "500",
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
  skeletonImage: {
    backgroundColor: SKELETON_COLORS.background,
    height: 180,
  },
  skeletonTime: {
    backgroundColor: SKELETON_COLORS.highlight,
    width: 70,
    height: 24,
    borderRadius: 12,
  },
  skeletonCategoryContent: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
  },
})
