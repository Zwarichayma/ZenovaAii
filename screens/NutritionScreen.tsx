"use client"

import { useEffect, useState, useRef } from "react"
import { View, Text, ScrollView, Image, StyleSheet, TouchableOpacity, Dimensions, Animated, ActivityIndicator } from "react-native"
import { useNavigation } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"
import { User } from "lucide-react-native"
import { getCategories } from "../api/recipes/route"

const { width, height } = Dimensions.get("window")

type RootStackParamList = {
  Home: undefined
  Profile: undefined
  Recette: { category?: string }
  Nutrition: undefined
  Training: undefined
  "Mental Health": undefined
  Bot: undefined
  Test: undefined
  RecipeDetail: { recipeId: string }
}

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, "Home">

type Category = {
  id: number
  attributes: {
    title: string
    image: {
      data: {
        attributes: {
          formats: {
            small: {
              url: string
            }
          }
        }
      }
    }
  }
}

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

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>()
  const translateX = useRef(new Animated.Value(100)).current
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [recipes, setRecipes] = useState<Recipe[]>([])

  useEffect(() => {
    fetchData()
    Animated.timing(translateX, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start()
  }, [translateX])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const categoriesData = await getCategories().catch((error) => {
        console.error("Error fetching categories:", error.response?.data || error.message)
        return []
      })
      setCategories(categoriesData || [])
      setRecipes([]) 
    } catch (error) {
      console.error("Error in fetchData:", error)
    } finally {
      setIsLoading(false)
    }
  }

  

  const renderCard = (
    item: Category | Recipe,
    navigateTo: keyof RootStackParamList,
  ) => {
    if (!item) return null
  
    let imageUrl = ""
    let title = ""
    let documentId = ""
  
    if ("attributes" in item) {
      title = item.attributes.title
      documentId = item.id.toString() // Convertir en string si nécessaire
      if (item.attributes.image?.data?.attributes?.formats?.small?.url) {
        imageUrl = "http://192.168.100.24:1337" + item.attributes.image.data.attributes.formats.small.url
      }
    } else if ("image" in item && Array.isArray(item.image) && item.image.length > 0) {
      if ("formats" in item.image[0]) {
        imageUrl = "http://192.168.100.24:1337" + (item.image[0].formats?.small?.url || item.image[0].url)
      }
      title = item.title
      documentId = item.documentId
    }
  
    return (
      <TouchableOpacity
        style={styles.card1}
        onPress={() => {
          if (navigateTo === "Recette") {
            navigation.navigate(navigateTo, { category: documentId }) // Utiliser documentId ici
          } else if (navigateTo === "RecipeDetail") {
            navigation.navigate(navigateTo, { recipeId: documentId })  // Passez le bon paramètre
          } else {
            navigation.navigate(navigateTo)
          }
        }}
      >
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.cardImage1} />
        ) : (
          <View style={[styles.cardImage1, styles.placeholderImage]} />
        )}
        <View style={styles.categoryOverlay}>
          <Text style={styles.ratingText}>{title || "Untitled"}</Text>
        </View>
      </TouchableOpacity>
    )
  }
  

  return (
    <View style={styles.container}>
      

      <ScrollView contentContainerStyle={styles.content}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#000" />
          </View>
        ) : (
          <>
            {/* Section des catégories */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recommandation</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <Animated.View style={{ flexDirection: "row" }}>
                  <TouchableOpacity style={styles.card}>
                    <Image source={require("../assets/images/diet menu (2).jpg")} style={styles.cardImage} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.card}>
                    <Image source={require("../assets/images/juce.jpg")} style={styles.cardImage} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.card}>
                    <Image source={require("../assets/images/Valentine's Day Grain-Free Sugar Cookies - Eat Yourself Skinny.jpg")} style={styles.cardImage} />
                  </TouchableOpacity>
                </Animated.View>
              </ScrollView>
            </View>

            {/* Section des catégories */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>All categories</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <Animated.View style={{ flexDirection: "row" }}>
                  {categories.map((category, index) => (
                    <View key={index}>{renderCard(category, "Recette")}</View>
                  ))}
                </Animated.View>
              </ScrollView>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 0,
    paddingVertical: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: width * 0.04,
    paddingTop: 10,
    backgroundColor: "white",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerLogo: {
    width: width * 0.13,
    height: height * 0.031,
    resizeMode: "contain",
  },
  profileIcon: {
    padding: 8,
  },
  content: {
    flexGrow: 1,
    padding: width * 0.05,
    paddingTop: height * 0.1,
  },
  section: {
    marginBottom: height * 0.04,
  },
  sectionTitle: {
    fontSize: height * 0.019,
    fontWeight: "500",
    marginBottom: height * 0.02,
  },
  card1: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    width: width * 0.4,
    marginRight: width * 0.04,
    alignItems: "center",
  },
  cardImage1: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
    borderRadius: 12,
  },
  card: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    overflow: "hidden",
    width: width * 0.4,
    marginRight: width * 0.03,
    alignItems: "center",
  },
  cardImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  categoryOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  ratingText: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
  },
  placeholderImage: {
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
  },
})
