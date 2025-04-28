"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StatusBar,
  Dimensions,
} from "react-native"
import { ChevronLeft, Clock, Flame, ArrowRight, Dumbbell } from "lucide-react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import type { RouteProp } from "@react-navigation/native"
import axios from "axios"

const { width } = Dimensions.get("window")

// Types pour les données de l'API
interface ImageFormat {
  url: string
}

interface ImageObject {
  formats: {
    thumbnail: ImageFormat
    small: ImageFormat
  }
  url: string
}

interface Exercise {
  id: number
  documentId: string
  name: string
  video_url: string
  duration: string
  sets: number | null
  rep: string | null
  calories_burned: string
  createdAt: string
  updatedAt: string
  publishedAt: string
}

interface SubCategory {
  id: number
  documentId: string
  name: string
  createdAt: string
  updatedAt: string
  publishedAt: string
  exercises: Exercise[]
  image: ImageObject[]
}

interface FitnessPlan {
  id: number
  documentId: string
  title: string
  type: string
  duration: number
  calories_burned: number
  sub_categories: SubCategory[]
}

interface ApiResponse {
  data: FitnessPlan[]
}

type RootStackParamList = {
  SubCategories: { fitnessId?: number; fitnessType?: string }
  ExerciseList: { subCategory: SubCategory }
}

type SubCategoriesScreenRouteProp = RouteProp<RootStackParamList, "SubCategories">

export default function SubCategoriesScreen() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [subCategories, setSubCategories] = useState<SubCategory[]>([])
  const [fitnessTitle, setFitnessTitle] = useState<string>("")

  const navigation = useNavigation()
  const route = useRoute<SubCategoriesScreenRouteProp>()
  const { fitnessId, fitnessType } = route.params || {}

  useEffect(() => {
    const fetchSubCategories = async () => {
      try {
        setLoading(true)

        // Construire l'URL de l'API avec les paramètres nécessaires
        let apiUrl = "http://192.168.100.15:1337/api/fitness-plans?populate[sub_categories][populate]=*"

        // Si un ID ou un type est fourni, filtrer les résultats
        if (fitnessId) {
          apiUrl += `&filters[id][$eq]=${fitnessId}`
        } else if (fitnessType) {
          apiUrl += `&filters[type][$eq]=${fitnessType}`
        }

        const response = await axios.get<ApiResponse>(apiUrl)

        if (response.data.data && response.data.data.length > 0) {
          const fitnessPlan = response.data.data[0]
          setFitnessTitle(fitnessPlan.title)

          if (fitnessPlan.sub_categories && fitnessPlan.sub_categories.length > 0) {
            setSubCategories(fitnessPlan.sub_categories)
          } else {
            setError("Aucune sous-catégorie trouvée pour ce plan de fitness.")
          }
        } else {
          setError("Aucun plan de fitness trouvé.")
        }
      } catch (err) {
        console.error("Erreur lors du chargement des sous-catégories:", err)
        setError("Impossible de charger les sous-catégories. Veuillez réessayer plus tard.")
      } finally {
        setLoading(false)
      }
    }

    fetchSubCategories()
  }, [fitnessId, fitnessType])

 

  // Fonction pour obtenir l'URL complète de l'image
  const getImageUrl = (imageUrl: string): string => {
    if (!imageUrl) return ""
    // Si l'URL commence déjà par http, la retourner telle quelle
    if (imageUrl.startsWith("http")) return imageUrl
    // Sinon, ajouter le préfixe de l'API
    return `http://192.168.100.15:1337${imageUrl}`
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <ActivityIndicator size="large" color="#5E72E4" />
        <Text style={styles.loadingText}>Chargement des sous-catégories...</Text>
      </View>
    )
  }

  if (error || subCategories.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ChevronLeft stroke="#000" width={24} height={24} />
        </TouchableOpacity>
        <View style={styles.errorContent}>
          <Dumbbell size={60} color="#ccc" />
          <Text style={styles.errorTitle}>Aucun résultat</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
            <Text style={styles.retryButtonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ChevronLeft stroke="#000" width={24} height={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{fitnessTitle || "Sous-catégories"}</Text>
        <View style={styles.placeholder} />
      </View>

      <FlatList
        data={subCategories}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => {
          const imageUrl =
            item.image && item.image.length > 0
              ? getImageUrl(item.image[0].url)
              : "https://via.placeholder.com/300x200?text=Workout"

            function handleSubCategoryPress(item: SubCategory): void {
                throw new Error("Function not implemented.")
            }

          return (
            <TouchableOpacity
              style={styles.subCategoryCard}
              onPress={() => handleSubCategoryPress(item)}
              activeOpacity={0.9}
            >
              <Image
                source={{ uri: imageUrl }}
                style={styles.subCategoryImage}
                defaultSource={require("../assets/images/cardio.jpg")} // Fallback image
              />
              <View style={styles.subCategoryContent}>
                <Text style={styles.subCategoryTitle}>{item.name}</Text>
                <View style={styles.subCategoryStats}>
                  <View style={styles.statItem}>
                    <Clock size={16} color="#5E72E4" />
                    <Text style={styles.statText}>
                      {item.exercises.length} exercice{item.exercises.length > 1 ? "s" : ""}
                    </Text>
                  </View>
                  {item.exercises.length > 0 && (
                    <View style={styles.statItem}>
                      <Flame size={16} color="#FB6340" />
                      <Text style={styles.statText}>
                        {item.exercises.reduce((total, ex) => total + (Number.parseInt(ex.calories_burned) || 0), 0)}{" "}
                        cal
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              <View style={styles.arrowContainer}>
                <ArrowRight size={20} color="#5E72E4" />
              </View>
            </TouchableOpacity>
          )
        }}
        ListHeaderComponent={
          <Text style={styles.sectionTitle}>Choisissez votre entraînement ({subCategories.length})</Text>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#5E72E4",
    fontWeight: "500",
  },
  errorContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  errorContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 8,
    color: "#333",
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    maxWidth: "80%",
  },
  retryButton: {
    backgroundColor: "#5E72E4",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 30,
    shadowColor: "#5E72E4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  listContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
    color: "#333",
  },
  subCategoryCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: "hidden",
  },
  subCategoryImage: {
    width: 100,
    height: 100,
    resizeMode: "cover",
  },
  subCategoryContent: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
  },
  subCategoryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  subCategoryStats: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  statText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  arrowContainer: {
    justifyContent: "center",
    paddingRight: 12,
  },
})
