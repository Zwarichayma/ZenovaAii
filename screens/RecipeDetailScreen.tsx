"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import type { RouteProp } from "@react-navigation/native"
import { ArrowLeft, Clock, Hourglass, Check, Bookmark, Share2, Calendar } from "lucide-react-native"
import type { StackNavigationProp } from "@react-navigation/stack"
import { getRecipe } from "../api/recipes/route"

const { width } = Dimensions.get("window")

type RootStackParamList = {
  RecipeDetail: { recetteId: string }
}

type RecipeDetailScreenRouteProp = RouteProp<RootStackParamList, "RecipeDetail">
type RecipeDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, "RecipeDetail">

interface Recipe {
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
  ingredients: {
    items: {
      name: string
      quantity: string
      unit: string
      extra?: string
    }[]
  }
  instructions: {
    type: string
    children: {
      type: string
      text: string
    }[]
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

interface RecipeDetailScreenProps {
  route: RecipeDetailScreenRouteProp
  navigation: RecipeDetailScreenNavigationProp
}

const NUTRIENT_COLORS = {
  calories: "#FFD700",
  proteins: "#FF69B4",
  carbs: "#87CEEB",
  lipids: "#98FB98",
}

export default function RecipeDetailScreen({ route, navigation }: RecipeDetailScreenProps) {
  const [activeTab, setActiveTab] = useState("about")
  const { recetteId } = route.params
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRecipe = async () => {
      setIsLoading(true);
      try {
        const data = await getRecipe(recetteId);
        if (data){
          setRecipe(data); // Set the fetched recipe data
        }
      } catch (error) {
        console.error("Error fetching recipe details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipe();
  }, [recetteId]);


  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    )
  }

  if (!recipe) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Recette non trouvée</Text>
      </View>
    )
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "about":
        return (
          <View style={styles.tabContent}>
            <Text style={styles.description}>{recipe.description}</Text>
            {recipe.nutrition && (
              <View style={styles.nutritionSection}>
                <Text style={styles.sectionTitle}>Valeurs nutritionnelles</Text>
                <View style={styles.nutritionCard}>
                  <View style={styles.nutritionHeader}>
                    <Text style={styles.nutritionColumnHeader}>Macronutriments</Text>
                    <Text style={styles.nutritionColumnHeader}>Par portion</Text>
                    <Text style={styles.nutritionColumnHeader}>Pour 100g</Text>
                  </View>

                  <View style={styles.nutritionRow}>
                    <View style={styles.nutrientNameContainer}>
                      <View style={[styles.nutrientDot, { backgroundColor: NUTRIENT_COLORS.calories }]} />
                      <Text style={styles.nutritionText}>Calories</Text>
                    </View>
                    <Text style={styles.nutritionValue}>{recipe.nutrition?.calories?.per_serving ?? "N/A"} kcal</Text>
                    <Text style={styles.nutritionValue}>{recipe.nutrition?.calories?.per_100g ?? "N/A"} kcal</Text>
                  </View>

                  <View style={styles.nutritionRow}>
                    <View style={styles.nutrientNameContainer}>
                      <View style={[styles.nutrientDot, { backgroundColor: NUTRIENT_COLORS.proteins }]} />
                      <Text style={styles.nutritionText}>Protéines</Text>
                    </View>
                    <Text style={styles.nutritionValue}>{recipe.nutrition?.protein?.per_serving ?? "N/A"} g</Text>
                    <Text style={styles.nutritionValue}>{recipe.nutrition?.protein?.per_100g ?? "N/A"} g</Text>
                  </View>

                  <View style={styles.nutritionRow}>
                    <View style={styles.nutrientNameContainer}>
                      <View style={[styles.nutrientDot, { backgroundColor: NUTRIENT_COLORS.carbs }]} />
                      <Text style={styles.nutritionText}>Glucides</Text>
                    </View>
                    <Text style={styles.nutritionValue}>{recipe.nutrition?.carbs?.per_serving ?? "N/A"} g</Text>
                    <Text style={styles.nutritionValue}>{recipe.nutrition?.carbs?.per_100g ?? "N/A"} g</Text>
                  </View>

                  <View style={styles.nutritionRow}>
                    <View style={styles.nutrientNameContainer}>
                      <View style={[styles.nutrientDot, { backgroundColor: NUTRIENT_COLORS.lipids }]} />
                      <Text style={styles.nutritionText}>Lipides</Text>
                    </View>
                    <Text style={styles.nutritionValue}>{recipe.nutrition?.fat?.per_serving ?? "N/A"} g</Text>
                    <Text style={styles.nutritionValue}>{recipe.nutrition?.fat?.per_100g ?? "N/A"} g</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        )
      case "ingredients":
        return (
          <View style={styles.tabContent}>
            {recipe.ingredients.items.map((ingredient, index) => (
              <View key={index} style={styles.ingredientItem}>
                <Text style={styles.ingredientText}>
                  {ingredient.quantity} {ingredient.unit} {ingredient.name}{" "}
                  {ingredient.extra ? `(${ingredient.extra})` : ""}
                </Text>
              </View>
            ))}
          </View>
        )
      case "preparation":
        return (
          <View style={styles.tabContent}>
            {recipe.instructions.map((instruction, index) => (
              <View key={index} style={styles.instructionItem}>
                <Text style={styles.instructionNumber}>{index + 1}</Text>
                <Text style={styles.instructionText}>{instruction.children[0].text}</Text>
              </View>
            ))}
          </View>
        )
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.heroSection}>
          <Image
            source={{ uri: `http://192.168.100.24:1337${recipe.image[0].formats.small.url}` }}
            style={styles.heroImage}
          />
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerBrand}>
            <Text style={styles.headerBrandText}></Text>
          </View>
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.3)", "rgba(0,0,0,0.8)"]}
            locations={[0, 0.5, 1]}
            style={styles.gradient}
          >
            <Text style={styles.heroTitle}>{recipe.title}</Text>
            <View style={styles.timeInfo}>
              <View style={styles.timeItem}>
                <Clock size={16} color="#fff" />
                <Text style={styles.timeText}>{recipe.total_time} min</Text>
              </View>
              <View style={styles.timeItem}>
                <Hourglass size={16} color="#fff" />
                <Text style={styles.timeText}>{recipe.preparation_time} min</Text>
              </View>
            </View>
            <View style={styles.tags}>
              {recipe.dietary_tags && (
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{recipe.dietary_tags}</Text>
                </View>
              )}
            </View>
          </LinearGradient>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <Check size={20} color="#000" />
            <Text style={styles.actionButtonText}>Faite</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Bookmark size={20} color="#000" />
            <Text style={styles.actionButtonText}>Favoris</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Calendar size={20} color="#000" />
            <Text style={styles.actionButtonText}>Planifier</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Share2 size={20} color="#000" />
            <Text style={styles.actionButtonText}>Partager</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "about" && styles.activeTab]}
            onPress={() => setActiveTab("about")}
          >
            <Text style={[styles.tabText, activeTab === "about" && styles.activeTabText]}>À propos</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "ingredients" && styles.activeTab]}
            onPress={() => setActiveTab("ingredients")}
          >
            <Text style={[styles.tabText, activeTab === "ingredients" && styles.activeTabText]}>Ingrédients</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "preparation" && styles.activeTab]}
            onPress={() => setActiveTab("preparation")}
          >
            <Text style={[styles.tabText, activeTab === "preparation" && styles.activeTabText]}>Préparation</Text>
          </TouchableOpacity>
        </View>

        {renderTabContent()}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    color: "red",
  },
  heroSection: {
    position: "relative",
    height: 350,
    backgroundColor: "#000",
  },
  heroImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "100%",
    padding: 16,
    paddingBottom: 24,
    justifyContent: "flex-end",
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
  },
  backButton: {
    position: "absolute",
    top: 10,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },


  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 16,
  },
  headerBrand: {
    position: "absolute",
    top: 40,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 5,
  },
  headerBrandText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 1,
  },
  timeInfo: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
  },
  timeItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timeText: {
    fontSize: 14,
    color: "#fff",
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    backgroundColor: "rgba(0,0,0,0.3)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    color: "#fff",
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  actionButton: {
    alignItems: "center",
    gap: 4,
  },
  actionButtonText: {
    fontSize: 12,
    color: "#4B5563",
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: "#fff",
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#000",
  },
  tabText: {
    fontSize: 16,
    color: "#6B7280",
  },
  activeTabText: {
    color: "#000",
    fontWeight: "600",
  },
  tabContent: {
    padding: 30,
  },
  nutritionSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  nutritionCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  nutritionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  nutritionColumnHeader: {
    fontSize: 14,
    color: "#6B7280",
    flex: 1,
    textAlign: "left",
  },
  nutritionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  nutrientNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  nutrientDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  nutritionText: {
    fontSize: 16,
    color: "#1F2937",
  },
  nutritionValue: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
    textAlign: "left",
  },
  ingredientItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  ingredientText: {
    fontSize: 16,
  },
  instructionItem: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 24,
  },
  instructionNumber: {
    width: 28,
    height: 28,
    backgroundColor: "#000",
    color: "#fff",
    borderRadius: 14,
    textAlign: "center",
    lineHeight: 28,
  },
  instructionText: {
    flex: 1,
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },

})

