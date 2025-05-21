"use client"

import { useEffect, useState, useCallback } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ImageBackground,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Platform,
  TextInput,
  RefreshControl,
} from "react-native"
import type { StackNavigationProp } from "@react-navigation/stack"
import {
  Clock,
  BookmarkPlus,
  CalendarRange,
  ArrowLeft,
  ChefHat,
  Search,
  Filter,
  X,
  Heart,
  Share2,
} from "lucide-react-native"
import { getRecipes } from "../api/recipes/route"
import { API_BASE_URL } from "@/config"

const { width, height } = Dimensions.get("window")

type RootStackParamList = {
  Home: undefined
  Recette: { category?: string; recipeIds?: number[] }
  RecipeDetail: { recetteId: string }
}

type RecetteScreenNavigationProp = StackNavigationProp<RootStackParamList, "Recette">

interface RecetteScreenProps {
  navigation: RecetteScreenNavigationProp
  route: any
}

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
}

export default function RecetteScreen({ navigation, route }: RecetteScreenProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [category, setCategory] = useState(route.params?.category || "")
  const [categoryName, setCategoryName] = useState("Recettes")
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearch, setShowSearch] = useState(false)
  const recipeIds = route.params?.recipeIds || []

  useEffect(() => {
    fetchRecipes()

    // Déterminer le nom de la catégorie pour l'affichage
    if (category) {
      const categoryMap: Record<string, string> = {
        breakfast: "Petit-déjeuner",
        lunch: "Déjeuner",
        dinner: "Dîner",
        dessert: "Desserts",
        snack: "Collations",
        vegetarian: "Végétarien",
        vegan: "Vegan",
        "gluten-free": "Sans gluten",
      }

      setCategoryName(categoryMap[category] || "Recettes")
    } else if (recipeIds.length > 0) {
      setCategoryName("Sélection de recettes")
    }
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredRecipes(recipes)
    } else {
      const filtered = recipes.filter(
        (recipe) =>
          recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (recipe.description && recipe.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (recipe.dietary_tags && recipe.dietary_tags.toLowerCase().includes(searchQuery.toLowerCase())),
      )
      setFilteredRecipes(filtered)
    }
  }, [searchQuery, recipes])

  const fetchRecipes = async () => {
    setIsLoading(true)
    try {
      const allRecipes = await getRecipes(category)
      const filteredRecipes =
        recipeIds.length > 0 ? allRecipes.filter((recipe: Recipe) => recipeIds.includes(recipe.documentId)) : allRecipes
      setRecipes(filteredRecipes)
      setFilteredRecipes(filteredRecipes)
    } catch (error) {
      console.error("Erreur lors de la récupération des recettes:", error)
    } finally {
      setIsLoading(false)
      setRefreshing(false)
    }
  }

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    fetchRecipes()
  }, [])

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "facile":
        return "Facile"
      case "moyen":
        return "Intermédiaire"
      case "difficile":
        return "Avancé"
      default:
        return difficulty
    }
  }

  const formatTime = (minutes: number) => {
    if (!minutes) return "N/A"

    if (minutes < 60) {
      return `${minutes} min`
    } else {
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`
    }
  }

  const getImageUrl = (recipe: Recipe) => {
    if (recipe.image && recipe.image.length > 0) {
      const imageUrl = recipe.image[0].formats?.small?.url || recipe.image[0].url
      if (imageUrl.startsWith("http")) {
        return imageUrl
      }
      return `${API_BASE_URL}${imageUrl}`
    }
    return "https://via.placeholder.com/300x200?text=No+Image"
  }

  const toggleSearch = () => {
    setShowSearch(!showSearch)
    if (showSearch) {
      setSearchQuery("")
    }
  }

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.loadingText}>Chargement des recettes...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("Home")} style={styles.backButton}>
          <ArrowLeft size={20} color="#FFF" />
        </TouchableOpacity>
        {!showSearch ? (
          <>
            <Text style={styles.headerText}>{categoryName}</Text>
            <TouchableOpacity onPress={toggleSearch} style={styles.searchButton}>
              <Search size={20} color="#FFF" />
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            <TouchableOpacity onPress={toggleSearch} style={styles.clearButton}>
              <X size={18} color="#999" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Nombre de recettes */}
      <View style={styles.recipeCountContainer}>
        <Text style={styles.recipeCount}>
          {filteredRecipes.length} {filteredRecipes.length > 1 ? "recettes trouvées" : "recette trouvée"}
        </Text>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={16} color="#000" />
          <Text style={styles.filterText}>Filtrer</Text>
        </TouchableOpacity>
      </View>

      {filteredRecipes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <ChefHat size={60} color="#333" />
          <Text style={styles.emptyText}>
            {searchQuery ? "Aucune recette ne correspond à votre recherche" : "Aucune recette disponible"}
          </Text>
          <TouchableOpacity style={styles.refreshButton} onPress={fetchRecipes}>
            <Text style={styles.refreshButtonText}>Rafraîchir</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#000" />}
        >
          {filteredRecipes.map((recipe) => (
            <TouchableOpacity
              key={recipe.id}
              style={styles.card}
              activeOpacity={0.9}
              onPress={() => {
                navigation.navigate("RecipeDetail", { recipeId: recipe.documentId })
              }}
            >
              <ImageBackground
                source={{ uri: getImageUrl(recipe) }}
                style={styles.image}
                imageStyle={styles.imageStyle}
              >
                <View style={styles.overlay}>
                  {recipe.dietary_tags && (
                    <View style={styles.tagContainer}>
                      {recipe.dietary_tags
                        .split(",")
                        .slice(0, 2)
                        .map((tag, index) => (
                          <View key={index} style={styles.tag}>
                            <Text style={styles.tagText}>{tag.trim()}</Text>
                          </View>
                        ))}
                      {recipe.dietary_tags.split(",").length > 2 && (
                        <View style={styles.tag}>
                          <Text style={styles.tagText}>+{recipe.dietary_tags.split(",").length - 2}</Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
                <View style={styles.gradientOverlay} />
              </ImageBackground>

              <View style={styles.cardContent}>
                <View style={styles.titleRow}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {recipe.title}
                  </Text>
                  <TouchableOpacity style={styles.favoriteButton}>
                    <Heart size={18} color="#000" stroke="#000" />
                  </TouchableOpacity>
                </View>

                <View style={styles.timeContainer}>
                  <View style={styles.timeItem}>
                    <Clock size={14} color="#555" />
                    <Text style={styles.timeText}>
                      {formatTime(recipe.total_time || recipe.preparation_time + recipe.cooking_time)}
                    </Text>
                  </View>
                </View>

                {recipe.description && (
                  <Text style={styles.description} numberOfLines={2}>
                    {recipe.description}
                  </Text>
                )}

                <View style={styles.buttons}>
                  <TouchableOpacity style={styles.actionButton}>
                    <BookmarkPlus size={16} color="#000" />
                    <Text style={styles.actionButtonText}>Sauvegarder</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <CalendarRange size={16} color="#000" />
                    <Text style={styles.actionButtonText}>Planifier</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.shareButton}>
                    <Share2 size={16} color="#FFF" />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
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
    backgroundColor: "#FFF",
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerText: {
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
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  searchButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
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
  clearButton: {
    padding: 5,
  },
  recipeCountContainer: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  recipeCount: {
    fontSize: 14,
    color: "#555",
    fontWeight: "500",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  filterText: {
    fontSize: 12,
    color: "#000",
    fontWeight: "500",
    marginLeft: 4,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginBottom: 30,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  image: {
    width: "100%",
    height: 200,
  },
  imageStyle: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  overlay: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    zIndex: 2,
  },
  gradientOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    zIndex: 1,
  },

  difficultyText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
  tag: {
    backgroundColor: "rgba(0, 0, 0, 0.31)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    marginLeft: 6,
    marginBottom: 6,
  },
  tagText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "600",
  },
  cardContent: {
    padding: 16,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    flex: 1,
    marginRight: 8,
  },
  favoriteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  timeItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  timeText: {
    fontSize: 13,
    color: "#555",
    marginLeft: 6,
  },
  description: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
    marginBottom: 16,
  },
  buttons: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    paddingTop: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  actionButtonText: {
    fontSize: 12,
    color: "#000",
    fontWeight: "500",
    marginLeft: 6,
  },
  shareButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: "auto",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#555",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#555",
    marginTop: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  refreshButton: {
    backgroundColor: "#000",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: "#FFF",
    fontWeight: "600",
  },
})
