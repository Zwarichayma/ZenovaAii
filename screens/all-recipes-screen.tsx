"use client"

import { useEffect, useState, useCallback } from "react"
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ImageBackground,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Platform,
  TextInput,
  RefreshControl,
  FlatList,
  SafeAreaView,
  ScrollView, // Import ScrollView
} from "react-native"
import type { StackNavigationProp } from "@react-navigation/stack"
import {
  Clock,
  BookmarkPlus,
  CalendarRange,
  ArrowLeft,
  ChefHat,
  Search,
  X,
  Heart,
  Share2,
  SlidersHorizontal,
} from "lucide-react-native"
import { getRecipes } from "../api/recipes/route"
import { API_BASE_URL } from "@/config"

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
  Home: undefined
  AllRecipes: undefined
  RecipeDetail: { recipeId: string }
}

type AllRecipesScreenNavigationProp = StackNavigationProp<RootStackParamList, "AllRecipes">

interface AllRecipesScreenProps {
  navigation: AllRecipesScreenNavigationProp
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

type SortOption = "newest" | "prep_time_asc" | "prep_time_desc" | "alphabetical"

export default function AllRecipesScreen({ navigation }: AllRecipesScreenProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearch, setShowSearch] = useState(false)
  const [showSortOptions, setShowSortOptions] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>("newest")
  const [error, setError] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState("All")

  useEffect(() => {
    fetchRecipes()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredRecipes(recipes)
    } else {
      const filtered = recipes.filter(
        (recipe) =>
          recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (recipe.description && recipe.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (recipe.dietary_tags && recipe.dietary_tags.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (recipe.category && recipe.category.toLowerCase().includes(searchQuery.toLowerCase())),
      )
      setFilteredRecipes(filtered)
    }
  }, [searchQuery, recipes])

  const fetchRecipes = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Récupérer toutes les recettes sans filtrage par catégorie
      const allRecipes = await getRecipes("")

      if (allRecipes && allRecipes.length > 0) {
        setRecipes(allRecipes)
        setFilteredRecipes(allRecipes)
        sortRecipes(allRecipes, sortBy)
      } else {
        // Utiliser des données de démonstration si l'API ne renvoie rien
        console.log("Aucune recette trouvée dans l'API, utilisation des données de démonstration")
        const demoRecipes = generateDemoRecipes()
        setRecipes(demoRecipes)
        setFilteredRecipes(demoRecipes)
        sortRecipes(demoRecipes, sortBy)
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des recettes:", error)
      // Utiliser des données de démonstration en cas d'erreur
      console.log("Erreur API, utilisation des données de démonstration")
      const demoRecipes = generateDemoRecipes()
      setRecipes(demoRecipes)
      setFilteredRecipes(demoRecipes)
      sortRecipes(demoRecipes, sortBy)
    } finally {
      setIsLoading(false)
      setRefreshing(false)
    }
  }

  const generateDemoRecipes = (): Recipe[] => {
    return [
      {
        id: 100,
        documentId: "100",
        title: "Polenta with Mushrooms and Spinach",
        description: "A comforting and nutritious dish of creamy polenta topped with sautéed mushrooms and spinach",
        preparation_time: 15,
        cooking_time: 25,
        total_time: 40,
        category: "dinner",
        difficulty: "facile",
        dietary_tags: "vegetarian",
        image: [
          {
            formats: {
              small: {
                url: "https://via.placeholder.com/300x200?text=Polenta+with+Mushrooms",
              },
            },
            url: "https://via.placeholder.com/600x400?text=Polenta+with+Mushrooms",
          },
        ],
      },
      {
        id: 76,
        documentId: "76",
        title: "Pumpkin, Turmeric & Ginger Soup",
        description: "A creamy, comforting soup made with pumpkin, turmeric and ginger",
        preparation_time: 20,
        cooking_time: 30,
        total_time: 50,
        category: "lunch",
        difficulty: "facile",
        dietary_tags: "vegan,gluten-free",
        image: [
          {
            formats: {
              small: {
                url: "https://via.placeholder.com/300x200?text=Pumpkin+Soup",
              },
            },
            url: "https://via.placeholder.com/600x400?text=Pumpkin+Soup",
          },
        ],
      },
      {
        id: 66,
        documentId: "66",
        title: "Refreshing Greek Salad",
        description: "A vibrant and refreshing Greek salad featuring crisp vegetables, feta cheese, and olives",
        preparation_time: 15,
        cooking_time: 0,
        total_time: 15,
        category: "lunch",
        difficulty: "facile",
        dietary_tags: "vegetarian",
        image: [
          {
            formats: {
              small: {
                url: "https://via.placeholder.com/300x200?text=Greek+Salad",
              },
            },
            url: "https://via.placeholder.com/600x400?text=Greek+Salad",
          },
        ],
      },
      {
        id: 78,
        documentId: "78",
        title: "Roasted Broccoli Cheddar Soup",
        description: "A rich and creamy soup made with roasted broccoli and sharp cheddar cheese",
        preparation_time: 15,
        cooking_time: 35,
        total_time: 50,
        category: "dinner",
        difficulty: "moyen",
        dietary_tags: "vegetarian",
        image: [
          {
            formats: {
              small: {
                url: "https://via.placeholder.com/300x200?text=Broccoli+Soup",
              },
            },
            url: "https://via.placeholder.com/600x400?text=Broccoli+Soup",
          },
        ],
      },
      {
        id: 150,
        documentId: "150",
        title: "Sablés Caramel Gianduja",
        description:
          "These Caramel Gianduja shortbread cookies combine buttery shortbread with rich chocolate hazelnut spread",
        preparation_time: 30,
        cooking_time: 15,
        total_time: 45,
        category: "dessert",
        difficulty: "moyen",
        dietary_tags: "vegetarian",
        image: [
          {
            formats: {
              small: {
                url: "https://via.placeholder.com/300x200?text=Caramel+Cookies",
              },
            },
            url: "https://via.placeholder.com/600x400?text=Caramel+Cookies",
          },
        ],
      },
      {
        id: 154,
        documentId: "154",
        title: "Tarte Poire Amandine",
        description: "A delicious and refined French tart with a sweet almond filling and poached pears",
        preparation_time: 40,
        cooking_time: 45,
        total_time: 85,
        category: "dessert",
        difficulty: "difficile",
        dietary_tags: "vegetarian",
        image: [
          {
            formats: {
              small: {
                url: "https://via.placeholder.com/300x200?text=Pear+Tart",
              },
            },
            url: "https://via.placeholder.com/600x400?text=Pear+Tart",
          },
        ],
      },
      {
        id: 152,
        documentId: "152",
        title: "Tarte aux Pommes",
        description: "A classic and comforting homemade apple tart with a buttery crust",
        preparation_time: 30,
        cooking_time: 40,
        total_time: 70,
        category: "dessert",
        difficulty: "moyen",
        dietary_tags: "vegetarian",
        image: [
          {
            formats: {
              small: {
                url: "https://via.placeholder.com/300x200?text=Apple+Tart",
              },
            },
            url: "https://via.placeholder.com/600x400?text=Apple+Tart",
          },
        ],
      },
    ]
  }

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    fetchRecipes()
  }, [])

  const toggleSearch = () => {
    setShowSearch(!showSearch)
    if (showSearch) {
      setSearchQuery("")
    }
  }

  const toggleSortOptions = () => {
    setShowSortOptions(!showSortOptions)
  }

  const sortRecipes = (recipesToSort: Recipe[], option: SortOption) => {
    const sorted = [...recipesToSort]

    switch (option) {
      case "newest":
        // Par défaut, on suppose que les recettes sont déjà triées par date d'ajout
        break
      case "prep_time_asc":
        sorted.sort(
          (a, b) =>
            (a.total_time || a.preparation_time + a.cooking_time) -
            (b.total_time || b.preparation_time + b.cooking_time),
        )
        break
      case "prep_time_desc":
        sorted.sort(
          (a, b) =>
            (b.total_time || b.preparation_time + b.cooking_time) -
            (a.total_time || a.preparation_time + a.cooking_time),
        )
        break
      case "alphabetical":
        sorted.sort((a, b) => a.title.localeCompare(b.title))
        break
    }

    setFilteredRecipes(sorted)
    setSortBy(option)
    setShowSortOptions(false)
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
      // Vérifier si l'URL contient déjà le préfixe API_BASE_URL
      if (imageUrl.includes(API_BASE_URL)) {
        return imageUrl
      }
      return `${API_BASE_URL}${imageUrl}`
    }
    // Image par défaut basée sur le titre de la recette
    return `https://via.placeholder.com/300x200?text=${encodeURIComponent(recipe.title.replace(/ /g, "+"))}`
  }

  const getCategoryMap = (): Record<string, string> => {
    return {
      breakfast: "Petit-déjeuner",
      lunch: "Déjeuner",
      dinner: "Dîner",
      dessert: "Desserts",
      snack: "Collations",
      vegetarian: "Végétarien",
      vegan: "Vegan",
      "gluten-free": "Sans gluten",
    }
  }

  const getCategoryLabel = (category: string) => {
    return getCategoryMap()[category] || category
  }

  const renderFilterButton = (title: string) => (
    <TouchableOpacity
      style={[styles.filterButton, activeFilter === title && styles.filterButtonActive]}
      onPress={() => setActiveFilter(title)}
    >
      <Text style={[styles.filterButtonText, activeFilter === title && styles.filterButtonTextActive]}>{title}</Text>
    </TouchableOpacity>
  )

  useEffect(() => {
    if (activeFilter === "All") {
      setFilteredRecipes(
        recipes.filter(
          (recipe) =>
            searchQuery.trim() === "" ||
            recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (recipe.description && recipe.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (recipe.dietary_tags && recipe.dietary_tags.toLowerCase().includes(searchQuery.toLowerCase())),
        ),
      )
    } else {
      const categoryKey = Object.keys(getCategoryMap()).find(
        (key) => getCategoryMap()[key].toLowerCase() === activeFilter.toLowerCase(),
      )

      setFilteredRecipes(
        recipes.filter((recipe) => {
          const matchesFilter = categoryKey
            ? recipe.category === categoryKey
            : recipe.category && getCategoryLabel(recipe.category) === activeFilter

          const matchesSearch =
            searchQuery.trim() === "" ||
            recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (recipe.description && recipe.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (recipe.dietary_tags && recipe.dietary_tags.toLowerCase().includes(searchQuery.toLowerCase()))

          return matchesFilter && matchesSearch
        }),
      )
    }
  }, [activeFilter, recipes, searchQuery])

  const renderRecipeItem = ({ item }: { item: Recipe }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => {
        navigation.navigate("RecipeDetail", { recipeId: item.documentId })
      }}
    >
      <ImageBackground source={{ uri: getImageUrl(item) }} style={styles.image} imageStyle={styles.imageStyle}>
        <View style={styles.overlay}>
          {item.category && (
            <View style={styles.categoryTag}>
              <Text style={styles.categoryText}>{getCategoryLabel(item.category)}</Text>
            </View>
          )}
          {item.dietary_tags && (
            <View style={styles.tagContainer}>
              {item.dietary_tags
                .split(",")
                .slice(0, 2)
                .map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag.trim()}</Text>
                  </View>
                ))}
              {item.dietary_tags.split(",").length > 2 && (
                <View style={styles.tag}>
                  <Text style={styles.tagText}>+{item.dietary_tags.split(",").length - 2}</Text>
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
            {item.title}
          </Text>
          <TouchableOpacity style={styles.favoriteButton}>
            <Heart size={18} color="#000" stroke="#000" />
          </TouchableOpacity>
        </View>

        <View style={styles.timeContainer}>
          <View style={styles.timeItem}>
            <Clock size={14} color="#555" />
            <Text style={styles.timeText}>
              {formatTime(item.total_time || item.preparation_time + item.cooking_time)}
            </Text>
          </View>
        </View>

        {item.description && (
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
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
  )

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.loadingText}>Chargement des recettes...</Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("Home")} style={styles.backButton}>
          <ArrowLeft size={20} color="#000" />
        </TouchableOpacity>
        {!showSearch ? (
          <>
            <Text style={styles.headerText}>Toutes les recettes</Text>
            <TouchableOpacity onPress={toggleSearch} style={styles.searchButton}>
              <Search size={20} color="#000" />
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

      {/* Filtres */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
          {renderFilterButton("All")}
          {renderFilterButton("Petit-déjeuner")}
          {renderFilterButton("Déjeuner")}
          {renderFilterButton("Dîner")}
          {renderFilterButton("Desserts")}
          {renderFilterButton("Végétarien")}
        </ScrollView>
        <TouchableOpacity style={styles.filterIconButton} onPress={toggleSortOptions}>
          <SlidersHorizontal size={18} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Options de tri */}
      {showSortOptions && (
        <View style={styles.sortOptionsContainer}>
          <TouchableOpacity
            style={[styles.sortOption, sortBy === "newest" && styles.selectedSortOption]}
            onPress={() => sortRecipes(recipes, "newest")}
          >
            <Text style={[styles.sortOptionText, sortBy === "newest" && styles.selectedSortOptionText]}>
              Les plus récentes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortOption, sortBy === "alphabetical" && styles.selectedSortOption]}
            onPress={() => sortRecipes(recipes, "alphabetical")}
          >
            <Text style={[styles.sortOptionText, sortBy === "alphabetical" && styles.selectedSortOptionText]}>
              Ordre alphabétique
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortOption, sortBy === "prep_time_asc" && styles.selectedSortOption]}
            onPress={() => sortRecipes(recipes, "prep_time_asc")}
          >
            <Text style={[styles.sortOptionText, sortBy === "prep_time_asc" && styles.selectedSortOptionText]}>
              Temps de préparation (croissant)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortOption, sortBy === "prep_time_desc" && styles.selectedSortOption]}
            onPress={() => sortRecipes(recipes, "prep_time_desc")}
          >
            <Text style={[styles.sortOptionText, sortBy === "prep_time_desc" && styles.selectedSortOptionText]}>
              Temps de préparation (décroissant)
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Nombre de recettes */}
      <View style={styles.recipeCountContainer}>
        <Text style={styles.recipeCount}>
          {filteredRecipes.length} {filteredRecipes.length > 1 ? "recettes trouvées" : "recette trouvée"}
        </Text>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <ChefHat size={60} color="#333" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={fetchRecipes}>
            <Text style={styles.refreshButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : filteredRecipes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <ChefHat size={60} color="#333" />
          <Text style={styles.emptyText}>
            {searchQuery ? "Aucune recette ne correspond à votre recherche" : "Aucune recette disponible"}
          </Text>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={() => {
              setSearchQuery("")
              setActiveFilter("All")
              fetchRecipes()
            }}
          >
            <Text style={styles.refreshButtonText}>Réinitialiser les filtres</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredRecipes}
          renderItem={renderRecipeItem}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#000" />}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    backgroundColor: "#FFF",
    paddingTop: Platform.OS === "ios" ? 10 : 20,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
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
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  searchButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
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
    paddingHorizontal: 20,
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
  sortOptionsContainer: {
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  sortOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  selectedSortOption: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  sortOptionText: {
    fontSize: 14,
    color: "#555",
  },
  selectedSortOptionText: {
    color: "#000",
    fontWeight: "600",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginBottom: 20,
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
    height: 180,
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
    backgroundColor: "rgba(0,0,0,0.2)",
    zIndex: 1,
  },
  categoryTag: {
    backgroundColor: "#000",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    alignSelf: "flex-start",
  },
  categoryText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#555",
    marginTop: 16,
    marginBottom: 20,
    textAlign: "center",
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
