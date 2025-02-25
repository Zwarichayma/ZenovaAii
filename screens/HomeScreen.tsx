"use client"

import { useEffect, useState } from "react"
import { View, Text, ScrollView, Image, StyleSheet, TouchableOpacity, Dimensions, Animated, ActivityIndicator } from "react-native"
import { useNavigation } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"
import { User } from "lucide-react-native"
import { useRef } from "react"
import { getCategories } from "../api/recipes/route"
import { getPersonalizedDiets } from "../api/personalized-diets/route"
import { getFitnessPlans } from "../api/fitness-plans/route"
import { getMental } from "../api/mental/route"

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

type PersonalizedDiet = {
  id: string
  attributes: {
    title: string
    image: {
      data: {
        attributes: {
          url: string
        }
      }
    }
  }
}

type FitnessPlan = {
  id: number
  documentId: string
  title: string
  description: { type: string; children: { type: string; text: string }[] }[]
  type: string
  duration: number
  calories_burned: number
  image: {
    id: number
    url: string
    formats?: {
      thumbnail: { url: string }
      small: { url: string }
      medium: { url: string }
      large: { url: string }
    }
  }[]
}

type Mental = {
  id: number
  documentId: string
  title: string
  description: { type: string; children: { type: string; text: string }[] }[]
  type: string
  duration: number
  calories_burned: number
  image: {
    id: number
    url: string
    formats?: {
      thumbnail: { url: string }
      small: { url: string }
      medium: { url: string }
      large: { url: string }
    }
  }[]
}

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>()
  const translateX = useRef(new Animated.Value(100)).current
  const [categories, setCategories] = useState<Category[]>([])
  const [diets, setDiets] = useState<PersonalizedDiet[]>([])
  const [fitnessPlans, setFitnessPlans] = useState<FitnessPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [Mental, setMental] = useState<Mental[]>([])

  useEffect(() => {
    fetchData()
    // Animation de base
    Animated.timing(translateX, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start()
  }, [translateX])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [categoriesData, dietsData, fitnessData, mentalData] = await Promise.all([
        getCategories().catch((error) => {
          console.error("Error fetching categories:", error.response?.data || error.message)
          return []
        }),
        getPersonalizedDiets().catch((error) => {
          console.error("Error fetching diets:", error.response?.data || error.message)
          return []
        }),
        getFitnessPlans().catch((error) => {
          console.error("Error fetching fitness plans:", error.response?.data || error.message)
          return []
        }),
        getMental().catch((error) => {
          console.error("Error fetching Mental:", error.response?.data || error.message)
          return []
        }),
      ])
      setCategories(categoriesData || [])
      setDiets(dietsData || [])
      setFitnessPlans(fitnessData || [])
      setMental(mentalData || [])
    } catch (error) {
      console.error("Error in fetchData:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleProfilePress = () => {
    navigation.navigate("Profile")
  }

  const renderCard = (
    item: Category | PersonalizedDiet | FitnessPlan | Mental,
    navigateTo: keyof RootStackParamList,
  ) => {
    if (!item) return null;
  
    let imageUrl = "";
    let title = "";
    let documentId = "";
  
    if ("attributes" in item) {
      title = item.attributes.title;
      documentId = item.id.toString(); // Convertir en string si nécessaire
      if (item.attributes.image?.data?.attributes?.formats?.small?.url) {
        imageUrl = "http://192.168.100.24:1337" + item.attributes.image.data.attributes.formats.small.url;
      }
    } else if ("image" in item && Array.isArray(item.image) && item.image.length > 0) {
      if ("formats" in item.image[0]) {
        imageUrl = "http://192.168.100.24:1337" + (item.image[0].formats?.small?.url || item.image[0].url);
      }
      title = item.title;
      documentId = item.documentId;
    }
  
    return (
      <TouchableOpacity
        style={styles.card1}
        onPress={() => {
          if (navigateTo === "Recette") {
            navigation.navigate(navigateTo, { category: documentId }); // Utiliser documentId ici
          } else {
            navigation.navigate(navigateTo);
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
    );
  };
  
  

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={require("../assets/images/33.png")} style={styles.headerLogo} resizeMode="contain" />
        <TouchableOpacity
          style={styles.profileIcon}
          onPress={handleProfilePress}
          accessible={true}
          accessibilityLabel="Profile"
        >
          <User size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : (
          <>
            <View style={styles.section}>
              <Text style={styles.masterTitle}>Welcome to Zenova AI</Text>
              <Text style={styles.sectionTitle}>Your Smart Well-Being Companion</Text>
              
              
            </View>

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

            {/* Fitness Plans Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Fitness Plans</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <Animated.View style={{ flexDirection: "row" }}>
                  {fitnessPlans.slice(0, 5).map((plan, index) => (
                    <View key={index}>{renderCard(plan, "Fitness")}</View>
                  ))}
                </Animated.View>
              </ScrollView>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Mental </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <Animated.View style={{ flexDirection: "row" }}>
                  {Mental.slice(0, 1).map((mental, index) => (
                    <View key={index}>{renderCard(mental, "Test")}</View>
                  ))}
                  {Mental.slice(1, 2).map((mental, index) => (
                    <View key={index}>{renderCard(mental, "Test")}</View>
                  ))}
                   {Mental.slice(2, 3).map((mental, index) => (
                    <View key={index}>{renderCard(mental, "Music")}</View>
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
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
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
  card3: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 0,
    alignItems: "center",
  },
  cardImage3: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
    borderRadius: 12,
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
  masterTitle: {
    fontSize: 20,
    fontFamily: "EuphemiaUCAS-Bold",
    fontWeight: "600",
    marginBottom: 12,
  },
  placeholderImage: {
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
  },
})

