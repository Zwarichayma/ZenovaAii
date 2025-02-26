"use client"

import { useEffect, useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ImageBackground,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native"
import type { StackNavigationProp } from "@react-navigation/stack"
import { Clock, CheckCircle, Bookmark, CalendarRange, ArrowLeft } from "lucide-react-native"
import { getRecipes } from "../api/recipes/route"

const { width } = Dimensions.get("window")

type RootStackParamList = {
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
  const [isLoading, setIsLoading] = useState(true)
  const [category, setCategory] = useState(route.params?.category || "")
  const recipeIds = route.params?.recipeIds || []

  useEffect(() => {
    fetchRecipes()
  }, [])

  const fetchRecipes = async () => {
    setIsLoading(true)
    try {
      const allRecipes = await getRecipes(category)
      const filteredRecipes =
        recipeIds.length > 0 ? allRecipes.filter((recipe: Recipe) => recipeIds.includes(recipe.documentId)) : allRecipes
      setRecipes(filteredRecipes)
    } catch (error) {
      console.error("Erreur lors de la récupération des recettes:", error)
    } finally {
      setIsLoading(false)
    }
  }
  


  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {recipes.map((recipe) => (
        <TouchableOpacity
          key={recipe.id}
          style={styles.card}
          onPress={() => {
            navigation.navigate("RecipeDetail", { recetteId: recipe.documentId})
          }}
        >
          <ImageBackground
            source={{
              uri:
                recipe.image && recipe.image.length > 0
                  ? `http://192.168.100.24:1337${recipe.image[0].formats.small.url}`
                  : "https://via.placeholder.com/300x200?text=No+Image",
            }}
            style={styles.image}
            imageStyle={{ borderRadius: 20 }}
          >
            <View style={styles.cardTitleContainer}>
              <Text style={styles.cardTitle}>{recipe.title}</Text>
            </View>
          </ImageBackground>

          <View style={styles.cardContent}>
            <View style={styles.info}>
              <View style={styles.time}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Clock size={16} color="black" style={{ marginRight: 8 }} />
                  <Text>{recipe.cooking_time}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.buttons}>
            <TouchableOpacity style={styles.button}>
              <CheckCircle size={20} color="black" style={{ marginRight: 5 }} />
              <Text>Fait</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button}>
              <Bookmark size={20} color="black" style={{ marginRight: 5 }} />
              <Text>Favoris</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button}>
              <CalendarRange size={20} color="black" style={{ marginRight: 5 }} />
              <Text>Planifier</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 29,
    paddingVertical: 20,
  },
  header: {
    backgroundColor: "white",
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 50,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    marginBottom: 30,
    overflow: "visible",
    shadowColor: "#000",
    padding: 10,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
    justifyContent: "flex-end",
    borderRadius: 20,
  },
  cardTitleContainer: {
    padding: 10,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  cardTitle: {
    fontSize: 20,
    color: "white",
    fontWeight: "bold",
  },
  cardContent: {
    padding: 10,
  },
  info: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  time: {
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "flex-start",
    width: 300,
  },
  backButton: {
    position: "absolute",
    top: 10,
    left: 5,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(170, 166, 166, 0.3)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  buttons: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    marginTop: 1,
    padding: 3,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    margin: 10,
  },
})

