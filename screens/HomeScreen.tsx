"use client"

import { useEffect, useState } from "react"
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  ActivityIndicator,
  StatusBar,
  Platform,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"
import { User, Search, Bell, Heart } from "lucide-react-native"
import { useRef } from "react"
import { getCategories } from "../api/recipes/route"
import { getPersonalizedDiets } from "../api/personalized-diets/route"
import { getFitnessPlans } from "../api/fitness-plans/route"
import { getMental } from "../api/mental/route"
import { API_BASE_URL } from "@env"

const { width, height } = Dimensions.get("window")

// For debugging image URLs
const DEBUG_IMAGES = false

type RootStackParamList = {
  Home: undefined
  Profile: undefined
  Recette: { category?: string }
  Nutrition: undefined
  Training: undefined
  "Mental Health": undefined
  Bot: undefined
  Test: undefined
  Music: undefined
  "Mental Exercice": undefined
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
          formats?: {
            small?: {
              url: string
            }
            medium?: {
              url: string
            }
            thumbnail?: {
              url: string
            }
          }
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
  const fadeAnim = useRef(new Animated.Value(0)).current
  const [categories, setCategories] = useState<Category[]>([])
  const [diets, setDiets] = useState<PersonalizedDiet[]>([])
  const [fitnessPlans, setFitnessPlans] = useState<FitnessPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [Mental, setMental] = useState<Mental[]>([])

  useEffect(() => {
    fetchData()
    // Animations
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

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

      // Debug diet data structure
      if (DEBUG_IMAGES && dietsData && dietsData.length > 0) {
        console.log("Diet data structure:", JSON.stringify(dietsData[0], null, 2))
      }
    } catch (error) {
      console.error("Error in fetchData:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleProfilePress = () => {
    navigation.navigate("Profile")
  }

  // Helper function to extract image URL from various data structures
  const getImageUrl = (item: any): string => {
    let imageUrl = ""

    if (!item) return imageUrl

    // For debugging
    if (DEBUG_IMAGES) {
      console.log("Getting image URL for item:", JSON.stringify(item, null, 2))
    }

    // Case 1: Category or PersonalizedDiet with attributes structure
    if ("attributes" in item) {
      const imageData = item.attributes?.image?.data?.attributes

      if (imageData) {
        // Try different format options
        if (imageData.formats?.small?.url) {
          imageUrl = imageData.formats.small.url
        } else if (imageData.formats?.medium?.url) {
          imageUrl = imageData.formats.medium.url
        } else if (imageData.formats?.thumbnail?.url) {
          imageUrl = imageData.formats.thumbnail.url
        } else if (imageData.url) {
          imageUrl = imageData.url
        }
      }
    }
    // Case 2: FitnessPlan or Mental with image array
    else if ("image" in item && Array.isArray(item.image) && item.image.length > 0) {
      const imageItem = item.image[0]

      if (imageItem) {
        if (imageItem.formats?.small?.url) {
          imageUrl = imageItem.formats.small.url
        } else if (imageItem.formats?.medium?.url) {
          imageUrl = imageItem.formats.medium.url
        } else if (imageItem.formats?.thumbnail?.url) {
          imageUrl = imageItem.formats.thumbnail.url
        } else if (imageItem.url) {
          imageUrl = imageItem.url
        }
      }
    }

    // Add base URL if not already included
    if (imageUrl && !imageUrl.startsWith("http")) {
      imageUrl = API_BASE_URL + imageUrl;
    }

    if (DEBUG_IMAGES) {
      console.log("Final image URL:", imageUrl)
    }

    return imageUrl
  }

  const renderCard = (
    item: Category | PersonalizedDiet | FitnessPlan | Mental,
    navigateTo: keyof RootStackParamList,
    showTitle = true,
    size: "small" | "medium" | "large" = "medium",
  ) => {
    if (!item) return null

    let title = ""
    let documentId = ""
    let subtitle = ""

    // Get image URL using helper function
    const imageUrl = getImageUrl(item)

    if ("attributes" in item) {
      title = item.attributes?.title || ""
      documentId = item.id?.toString() || ""
    } else {
      title = (item as any).title || ""
      documentId = (item as any).documentId || ""

      // Add duration or calories as subtitle for fitness/mental
      if ("duration" in item && item.duration) {
        subtitle = `${item.duration} min`
      } else if ("calories_burned" in item && item.calories_burned) {
        subtitle = `${item.calories_burned} cal`
      }
    }

    // Determine card style based on size
    const cardStyle = size === "small" ? styles.cardSmall : size === "large" ? styles.cardLarge : styles.cardMedium

    const imageStyle =
      size === "small" ? styles.cardImageSmall : size === "large" ? styles.cardImageLarge : styles.cardImageMedium

    // Determine the actual navigation destination based on the item title
    // This allows each mental health item to navigate to its specific page
    let actualNavigateTo = navigateTo

    // For Mental items, check the title to determine where to navigate
    if (navigateTo === "Mental Health" && title) {
      if (title.toLowerCase().includes("music")) {
        actualNavigateTo = "Music"
      } else if (title.toLowerCase().includes("exercice") || title.toLowerCase().includes("exercise")) {
        actualNavigateTo = "Quote"
      } else if (title.toLowerCase().includes("test")) {
        actualNavigateTo = "Test"
      }
    }

    return (
      <TouchableOpacity
        style={[styles.card, cardStyle]}
        onPress={() => {
          if (actualNavigateTo === "Recette") {
            navigation.navigate(actualNavigateTo, { category: documentId })
          } else {
            navigation.navigate(actualNavigateTo)
          }
        }}
      >
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={imageStyle}
            onError={(e) => console.error("Image load error:", e.nativeEvent.error)}
          />
        ) : (
          <View style={[imageStyle, styles.placeholderImage]} />
        )}

        <View style={styles.categoryOverlay}>
          <Text style={styles.cardTitle}>{title || "Untitled"}</Text>
          {subtitle ? <Text style={styles.cardSubtitle}>{subtitle}</Text> : null}
        </View>

        <View style={styles.favoriteButton}>
          <Heart size={18} color="#fff" />
        </View>
      </TouchableOpacity>
    )
  }

  const renderFeaturedCard = (diet: PersonalizedDiet) => {
    if (!diet) return null

    const title = diet.attributes?.title

    // Get image URL using helper function
    const imageUrl = getImageUrl(diet)

    return (
      <TouchableOpacity style={styles.featuredCard} onPress={() => navigation.navigate("Bot")}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.featuredCardImage}
            onError={(e) => console.error("Featured image load error:", e.nativeEvent.error)}
          />
        ) : (
          <View style={[styles.featuredCardImage, styles.placeholderImage]} />
        )}

        <View style={styles.featuredOverlay}>
          <View style={styles.featuredContent}>
            <Text style={styles.featuredTitle}>{title}</Text>

            <TouchableOpacity style={styles.featuredButton} onPress={() => navigation.navigate("Bot")}>
              <Text style={styles.featuredButtonText}>Get Started</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  const renderSectionHeader = (title: string, showAll = true) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {showAll && (
        <TouchableOpacity>
          <Text style={styles.seeAllText}>See all</Text>
        </TouchableOpacity>
      )}
    </View>
  )

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logoText}>ZAI</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Search size={22} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Bell size={22} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.profileIcon}
            onPress={handleProfilePress}
            accessible={true}
            accessibilityLabel="Profile"
          >
            <User size={22} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#5271FF" />
          </View>
        ) : (
          <Animated.View style={{ opacity: fadeAnim }}>
            {/* Welcome Section */}
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeText}></Text>
              <Text style={styles.masterTitle}>Welcome to Zenova AI</Text>
              <Text style={styles.welcomeSubtitle}>Your Smart Well-Being Companion</Text>
            </View>

            {/* Featured Diet Card */}
            {diets && diets.length > 0 && <View style={styles.featuredSection}>{renderFeaturedCard(diets[0])}</View>}

            {/* Categories Section */}
            <View style={styles.section}>
              {renderSectionHeader("All Categories")}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                <Animated.View style={[{ flexDirection: "row" }]}>
                  {categories.map((category, index) => (
                    <View key={index} style={styles.cardWrapper}>
                      {renderCard(category, "Recette", true, "small")}
                    </View>
                  ))}
                </Animated.View>
              </ScrollView>
            </View>

            {/* Fitness Plans Section */}
            <View style={styles.section}>
              {renderSectionHeader("Fitness Plans")}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                <Animated.View style={{ flexDirection: "row" }}>
                  {fitnessPlans.slice(0,15).map((plan, index) => (
                    <View key={index} style={styles.cardWrapper}>
                      {renderCard(plan, "Training", true, "small")}
                    </View>
                  ))}
                </Animated.View>
              </ScrollView>
            </View>

            {/* Mental Health Section */}
            <View style={styles.section}>
              {renderSectionHeader("Mental Health")}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                <Animated.View style={{ flexDirection: "row" }}>
                  {Mental.map((mental, index) => (
                    <View key={index} style={styles.cardWrapper}>
                      {renderCard(mental, "Mental Health", true, "small")}
                    </View>
                  ))}
                </Animated.View>
              </ScrollView>
            </View>

            {/* Recommended Section - if you have more diets */}
            {diets && diets.length > 1 && (
              <View style={styles.section}>
                {renderSectionHeader("Recommended For You")}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                  <Animated.View style={{ flexDirection: "row" }}>
                    {diets.slice(1).map((diet, index) => (
                      <View key={index} style={styles.cardWrapper}>
                        {renderCard(diet, "Bot", true, "small")}
                      </View>
                    ))}
                  </Animated.View>
                </ScrollView>
              </View>
            )}
          </Animated.View>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: width * 0.05,
    paddingTop: Platform.OS === "ios" ? 50 : 10,
    paddingBottom: 10,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  logoText: {
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: 1,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    padding: 8,
    marginLeft: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: height * 0.7,
  },
  headerLogo: {
    width: width * 0.13,
    height: height * 0.031,
    resizeMode: "contain",
  },
  profileIcon: {
    padding: 8,
    marginLeft: 5,
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  welcomeSection: {
    paddingHorizontal: width * 0.05,
    paddingTop: 20,
    paddingBottom: 10,
  },
  welcomeText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "400",
    alignItems: "center",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 5,
  },
  featuredSection: {
    paddingHorizontal: width * 0.05,
    marginBottom: 25,
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: width * 0.05,
    marginBottom: 12,
  },
  horizontalScroll: {
    paddingLeft: width * 0.05,
  },
  cardWrapper: {
    marginRight: 15,
    marginBottom: 5,
  },
  card: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#f5f5f5",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardSmall: {
    width: width * 0.4,
    height: 200,
  },
  cardMedium: {
    width: width * 0.45,
    height: 200,
  },
  cardLarge: {
    width: width * 0.65,
    height: 250,
  },
  cardImageSmall: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  cardImageMedium: {
    width: "100%",
    height: 220,
    resizeMode: "cover",
  },
  cardImageLarge: {
    width: "100%",
    height: 250,
    resizeMode: "cover",
  },
  categoryOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    paddingTop: 30,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  cardTitle: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  cardSubtitle: {
    fontSize: 15,
    color: "#eee",
    marginTop: 2,
  },
  favoriteButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  seeAllText: {
    fontSize: 14,
    color: "#000",
    fontWeight: "500",
  },
  masterTitle: {
    fontSize: 25,
    fontWeight: "700",
    color: "#333",
    marginTop: 2,
    alignItems: "center",

    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  placeholderImage: {
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
  },
  featuredCard: {
    width: "100%",
    height: 220,
    borderRadius: 20,
    overflow: "hidden",
    marginTop: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  featuredCardImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  featuredOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "100%",
    justifyContent: "flex-end",
    padding: 20,
    backgroundColor: "rgba(0, 0, 0, 0.14)",
  },
  featuredContent: {
    width: "100%",
  },
  featuredBadge: {
    backgroundColor: "#000",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  featuredBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  featuredTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    marginBottom: 5,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  featuredSubtitle: {
    fontSize: 14,
    color: "#eee",
    marginBottom: 15,
  },
  featuredButton: {
    backgroundColor: "rgba(44, 41, 41, 0.4)",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignSelf: "flex-start",
  },
  featuredButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
})
