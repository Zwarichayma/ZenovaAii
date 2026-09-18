"use client"

import { useEffect, useState, useCallback } from "react"
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform,
  SafeAreaView,
} from "react-native"
import { useNavigation, CommonActions } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"
import { User, Search, Bell, Heart, Activity, Flame, Clock, ChevronRight, RefreshCw, Dumbbell, ChefHat, Brain, Zap } from "lucide-react-native"
import { getCategories } from "../api/recipes/route"
import { getPersonalizedDiets } from "../api/personalized-diets/route"
import { getFitnessPlans } from "../api/fitness-plans/route"
import { getMental } from "../api/mental/route"
import type { RootStackParamList } from "./navigation"
import { API_BASE_URL } from "@/config"
import { healthConnectService } from "../api/health-connect-service/route"
import { getQuotes } from "../api/music/route"

const { width, height } = Dimensions.get("window")

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
  skeletonBackground: "#E8E8E8", // Changed to light gray
  skeletonHighlight: "#F5F5F5", // Changed to lighter gray
}

// For debugging image URLs
const DEBUG_IMAGES = false

type TabParamList = {
  Home: undefined
  Profile: undefined
}

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>

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

// Skeleton Card Component - Animation Removed
const SkeletonCard = ({ size = "small" }: { size?: "small" | "medium" | "large" }) => {
  // Determine card style based on size
  const cardStyle = size === "small" ? styles.cardSmall : size === "large" ? styles.cardLarge : styles.cardMedium

  return (
    <View style={[styles.card, cardStyle, styles.skeletonCard]}>
      <View style={styles.skeletonTitleContainer}>
        <View style={styles.skeletonTitle} />
      </View>
    </View>
  )
}

// Skeleton Featured Card Component - Animation Removed
const SkeletonFeaturedCard = () => {
  return (
    <View style={[styles.featuredCard, styles.skeletonFeaturedCard]}>
      <View style={styles.skeletonFeaturedContent}>
        <View style={styles.skeletonFeaturedTitle} />
        <View style={styles.skeletonFeaturedButton} />
      </View>
    </View>
  )
}

// Skeleton Section Component
const SkeletonSection = ({ title, count = 3 }: { title: string; count?: number }) => {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.seeAllText}>See all</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
        <View style={{ flexDirection: "row" }}>
          {Array(count)
            .fill(0)
            .map((_, index) => (
              <View key={index} style={styles.cardWrapper}>
                <SkeletonCard size="small" />
              </View>
            ))}
        </View>
      </ScrollView>
    </View>
  )
}

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>()
  const [categories, setCategories] = useState<Category[]>([])
  const [diets, setDiets] = useState<PersonalizedDiet[]>([])
  const [fitnessPlans, setFitnessPlans] = useState<FitnessPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [Mental, setMental] = useState<Mental[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [healthData, setHealthData] = useState<{ steps: number; calories: number; distance: number } | null>(null)
  const [quoteOfDay, setQuoteOfDay] = useState<{ text: string; author?: string } | null>(null)
  const [userName, setUserName] = useState<string>("")

  // Définir toutes les fonctions de navigation en dehors des conditions
  const handleProfilePress = useCallback(() => {
    navigation.navigate("Profile")
  }, [navigation])

  const handleSearchPress = useCallback(() => {
    navigation.dispatch(
      CommonActions.navigate({
        name: "AllCategories",
      }),
    )
  }, [navigation])

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      if (prev.includes(id)) {
        return prev.filter((itemId) => itemId !== id)
      } else {
        return [...prev, id]
      }
    })
  }, [])

  const fetchData = useCallback(async () => {
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

      // Fetch health data and quote in parallel
      const today = new Date()
      const [healthResult, quotesData] = await Promise.all([
        healthConnectService.getHealthConnectData(today).catch(() => null),
        getQuotes().catch(() => []),
      ])

      if (healthResult) {
        setHealthData({
          steps: healthResult.steps,
          calories: healthResult.total_calories_burned,
          distance: healthResult.distance,
        })
      }

      if (quotesData && quotesData.length > 0) {
        const randomIndex = Math.floor(Math.random() * quotesData.length)
        const quoteItem = quotesData[randomIndex]
        const quoteText =
          quoteItem.text || quoteItem.quote || (quoteItem.attributes?.text) || (quoteItem.attributes?.quote) || ""
        const quoteAuthor =
          quoteItem.author || (quoteItem.attributes?.author) || ""
        setQuoteOfDay({ text: quoteText, author: quoteAuthor })
      }

      // Debug diet data structure
      if (DEBUG_IMAGES && dietsData && dietsData.length > 0) {
        console.log("Diet data structure:", JSON.stringify(dietsData[0], null, 2))
      }
    } catch (error) {
      console.error("Error in fetchData:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Helper function to extract image URL from various data structures
  const getImageUrl = useCallback((item: any): string => {
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
      imageUrl = API_BASE_URL + imageUrl
    }

    if (DEBUG_IMAGES) {
      console.log("Final image URL:", imageUrl)
    }

    return imageUrl
  }, [])

  // Dans la fonction renderCard, mettre à jour la navigation vers FitnessPlanDetail
  const renderCard = useCallback(
    (
      item: Category | PersonalizedDiet | FitnessPlan | Mental,
      navigateTo: keyof RootStackParamList | keyof TabParamList,
      showTitle = true,
      size: "small" | "medium" | "large" = "medium",
    ) => {
      if (!item) return null

      let title = ""
      let documentId = ""
      let subtitle = ""
      let id = ""

      // Get image URL using helper function
      const imageUrl = getImageUrl(item)

      if ("attributes" in item) {
        title = item.attributes?.title || ""
        documentId = item.id?.toString() || ""
        id = item.id?.toString() || ""
      } else {
        title = (item as any).title || ""
        documentId = (item as any).documentId || ""
        id = (item as any).id?.toString() || ""

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

      if (navigateTo === "Mental Health" && title) {
        const lowerTitle = title.toLowerCase()

        if (lowerTitle.includes("music")) {
          actualNavigateTo = "Music"
        } else if (lowerTitle.includes("exercice") || lowerTitle.includes("exercise")) {
          actualNavigateTo = "Mental Exercice"
        } else if (lowerTitle.includes("test")) {
          actualNavigateTo = "Test"
        } else {
          actualNavigateTo = "Quote"
        }
      }

      const isFavorite = favorites.includes(id)

      return (
        <TouchableOpacity
          style={[styles.card, cardStyle]}
          onPress={() => {
            if (actualNavigateTo === "Recette") {
              navigation.navigate(actualNavigateTo as any, { category: documentId })
            } else if (actualNavigateTo === "Training" && id) {
              // Convert string ID to number if needed
              const numericId = Number.parseInt(id, 10)
              // Utiliser la navigation vers le navigateur Stack parent
              navigation.navigate("FitnessPlanDetail" as any, { planId: numericId })
            } else {
              navigation.navigate(actualNavigateTo as any)
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

          <TouchableOpacity
            style={[styles.favoriteButton, isFavorite && styles.favoriteButtonActive]}
            onPress={(e) => {
              e.stopPropagation()
              toggleFavorite(id)
            }}
          >
            <Heart size={18} color={isFavorite ? "#FF3B30" : COLORS.textLight} fill={isFavorite ? "#FF3B30" : "none"} />
          </TouchableOpacity>
        </TouchableOpacity>
      )
    },
    [getImageUrl, favorites, toggleFavorite, navigation],
  )

  const renderFeaturedCard = useCallback(
    (diet: PersonalizedDiet) => {
      if (!diet) return null
      const title = diet.attributes?.title
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
    },
    [getImageUrl, navigation],
  )

  const renderSectionHeader = useCallback(
    (title: string, showAll = true, onSeeAllPress?: () => void) => (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {showAll && (
          <TouchableOpacity onPress={onSeeAllPress}>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        )}
      </View>
    ),
    [],
  )

  // Render skeleton loading UI
  const renderSkeletonUI = () => {
    return (
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.welcomeSection}>
          <View style={styles.skeletonMasterTitle} />
          <View style={styles.skeletonSubtitle} />
        </View>

        <View style={styles.featuredSection}>
          <SkeletonFeaturedCard />
        </View>

        <SkeletonSection title="All Categories" count={4} />
        <SkeletonSection title="Fitness Plans" count={4} />
        <SkeletonSection title="Mental Health" count={4} />
        <SkeletonSection title="Recommended For You" count={4} />
      </ScrollView>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} translucent={false} />

        {/* Header */}
        <View style={styles.header}>
          <Image source={require("../assets/images/33.png")} style={styles.headerLogo} />
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconButton} onPress={handleSearchPress}>
              <Search size={22} color={COLORS.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Bell size={22} color={COLORS.text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.profileIcon}
              onPress={handleProfilePress}
              accessible={true}
              accessibilityLabel="Profile"
            >
              <User size={22} color={COLORS.text} />
            </TouchableOpacity>
          </View>
        </View>

        {isLoading ? (
          renderSkeletonUI()
        ) : (
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View>
              {/* Welcome Section */}
              <View style={styles.welcomeSection}>
                <Text style={styles.welcomeText}></Text>
                <Text style={styles.masterTitle}>Welcome to Zenova AI</Text>
                <Text style={styles.welcomeSubtitle}>Your Smart Well-Being Companion</Text>
              </View>

              {/* Health Stats Banner */}
              {healthData && (
                <View style={styles.healthStatsContainer}>
                  <View style={styles.healthStatCard}>
                    <View style={[styles.healthStatIcon, { backgroundColor: "#E8F5E9" }]}>
                      <Activity size={20} color="#2E7D32" />
                    </View>
                    <Text style={styles.healthStatValue}>{healthData.steps.toLocaleString()}</Text>
                    <Text style={styles.healthStatLabel}>Steps</Text>
                  </View>
                  <View style={styles.healthStatDivider} />
                  <View style={styles.healthStatCard}>
                    <View style={[styles.healthStatIcon, { backgroundColor: "#FFF3E0" }]}>
                      <Flame size={20} color="#E65100" />
                    </View>
                    <Text style={styles.healthStatValue}>{healthData.calories}</Text>
                    <Text style={styles.healthStatLabel}>Calories</Text>
                  </View>
                  <View style={styles.healthStatDivider} />
                  <View style={styles.healthStatCard}>
                    <View style={[styles.healthStatIcon, { backgroundColor: "#E3F2FD" }]}>
                      <Activity size={20} color="#1565C0" />
                    </View>
                    <Text style={styles.healthStatValue}>{healthData.distance.toFixed(1)}</Text>
                    <Text style={styles.healthStatLabel}>KM</Text>
                  </View>
                </View>
              )}

              {/* Daily Quote */}
              {quoteOfDay && quoteOfDay.text ? (
                <View style={styles.quoteContainer}>
                  <View style={styles.quoteIconWrapper}>
                    <Text style={styles.quoteIconText}>"</Text>
                  </View>
                  <View style={styles.quoteContent}>
                    <Text style={styles.quoteText} numberOfLines={2}>
                      {quoteOfDay.text}
                    </Text>
                    {quoteOfDay.author ? (
                      <Text style={styles.quoteAuthor}>— {quoteOfDay.author}</Text>
                    ) : null}
                  </View>
                </View>
              ) : null}

              {/* Quick Actions */}
              <View style={styles.quickActionsContainer}>
                <View style={styles.quickActionsGrid}>
                  <TouchableOpacity style={styles.quickActionCard} onPress={() => navigation.navigate("Fitness")}>
                    <View style={[styles.quickActionIcon, { backgroundColor: "#E8F5E9" }]}>
                      <Dumbbell size={24} color="#2E7D32" />
                    </View>
                    <Text style={styles.quickActionLabel}>Fitness</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.quickActionCard} onPress={() => navigation.navigate("Nutrition")}>
                    <View style={[styles.quickActionIcon, { backgroundColor: "#FFF3E0" }]}>
                      <ChefHat size={24} color="#E65100" />
                    </View>
                    <Text style={styles.quickActionLabel}>Nutrition</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.quickActionCard} onPress={() => navigation.navigate("Mental Health" as any)}>
                    <View style={[styles.quickActionIcon, { backgroundColor: "#F3E5F5" }]}>
                      <Brain size={24} color="#6A1B9A" />
                    </View>
                    <Text style={styles.quickActionLabel}>Mental</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.quickActionCard} onPress={() => navigation.navigate("Quote")}>
                    <View style={[styles.quickActionIcon, { backgroundColor: "#E3F2FD" }]}>
                      <Zap size={24} color="#1565C0" />
                    </View>
                    <Text style={styles.quickActionLabel}>Quotes</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Today's Workout */}
              {fitnessPlans && fitnessPlans.length > 0 && (
                <View style={styles.todayWorkoutSection}>
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionTitleWrapper}>
                      <Activity size={18} color={COLORS.text} />
                      <Text style={[styles.sectionTitle, { marginLeft: 8 }]}>Today's Workout</Text>
                    </View>
                    <TouchableOpacity onPress={() => navigation.navigate("AllCategories")}>
                      <Text style={styles.seeAllText}>View all</Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    style={styles.todayWorkoutCard}
                    onPress={() => navigation.navigate("FitnessPlanDetail" as any, { planId: Number.parseInt(fitnessPlans[0].id.toString(), 10) })}
                  >
                    <Image
                      source={{ uri: getImageUrl(fitnessPlans[0]) }}
                      style={styles.todayWorkoutImage}
                      defaultSource={require("../assets/images/cardio.jpg")}
                    />
                    <View style={styles.todayWorkoutOverlay}>
                      <Text style={styles.todayWorkoutTitle}>{fitnessPlans[0].title}</Text>
                      <View style={styles.todayWorkoutMeta}>
                        <View style={styles.todayWorkoutMetaItem}>
                          <Clock size={14} color="#fff" />
                          <Text style={styles.todayWorkoutMetaText}> {fitnessPlans[0].duration} min</Text>
                        </View>
                        <View style={styles.todayWorkoutMetaItem}>
                          <Flame size={14} color="#fff" />
                          <Text style={styles.todayWorkoutMetaText}> {fitnessPlans[0].calories_burned} cal</Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
              )}

              {/* Featured Diet */}
              {diets && diets.length > 0 && <View style={styles.featuredSection}>{renderFeaturedCard(diets[0])}</View>}

              {/* Recommendations */}
              {diets && diets.length > 1 && (
                <View style={styles.section}>
                  {renderSectionHeader("Recommended For You")}
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                    <View style={{ flexDirection: "row" }}>
                      {diets.slice(1).map((diet, index) => (
                        <View key={index} style={styles.cardWrapper}>
                          {renderCard(diet, "Bot", true, "small")}
                        </View>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              )}

              {/* Categories Section */}
              <View style={styles.section}>
                {renderSectionHeader("All Categories", true, () => navigation.navigate("AllRecipesScreen"))}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                  <View style={{ flexDirection: "row" }}>
                    {categories.map((category, index) => (
                      <View key={index} style={styles.cardWrapper}>
                        {renderCard(category, "Recette", true, "small")}
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Fitness Plans Section */}
              <View style={styles.section}>
                {renderSectionHeader("Fitness Plans", true, () => navigation.navigate("AllCategories"))}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                  <View style={{ flexDirection: "row" }}>
                    {fitnessPlans.slice(0, 15).map((plan, index) => (
                      <View key={index} style={styles.cardWrapper}>
                        {renderCard(plan, "Training", true, "small")}
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Mental Health Section */}
              <View style={styles.section}>
                {renderSectionHeader("Mental Health")}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                  <View style={{ flexDirection: "row" }}>
                    {Mental.map((mental, index) => (
                      <View key={index} style={styles.cardWrapper}>
                        {renderCard(mental, "Mental Health", true, "small")}
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>

            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: width * 0.05,
    paddingTop: Platform.OS === "ios" ? 50 : 10,
    paddingBottom: 10,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    elevation: 2,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  logoText: {
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: 1,
    color: COLORS.text,
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
    width: width * 0.12,
    height: height * 0.05,
    resizeMode: "contain",
  },
  profileIcon: {
    padding: 8,
    marginLeft: 5,
    backgroundColor: COLORS.backgroundAlt,
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
    color: COLORS.textSecondary,
    fontWeight: "400",
    alignItems: "center",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
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
    backgroundColor: COLORS.backgroundAlt,
    elevation: 3,
    shadowColor: COLORS.primary,
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
    color: COLORS.textLight,
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
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  favoriteButtonActive: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  seeAllText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: "500",
  },
  masterTitle: {
    fontSize: 25,
    fontWeight: "700",
    color: COLORS.text,
    marginTop: 2,
    alignItems: "center",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  placeholderImage: {
    backgroundColor: COLORS.backgroundAlt,
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
    shadowColor: COLORS.primary,
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
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  featuredBadgeText: {
    color: COLORS.textLight,
    fontSize: 12,
    fontWeight: "600",
  },
  featuredTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.textLight,
    marginBottom: 5,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  featuredSubtitle: {
    fontSize: 14,
    color: "#eee",
    marginBottom: 15,
  },
  featuredButton: {
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignSelf: "flex-start",
  },
  featuredButtonText: {
    color: COLORS.textLight,
    fontWeight: "600",
    fontSize: 14,
  },

  // Skeleton styles - Updated to white/gray
  skeletonCard: {
    backgroundColor: COLORS.skeletonBackground,
    justifyContent: "flex-end",
  },
  skeletonTitleContainer: {
    padding: 12,
    paddingTop: 30,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  skeletonTitle: {
    height: 18,
    width: "70%",
    backgroundColor: COLORS.skeletonHighlight,
    borderRadius: 4,
  },
  skeletonFeaturedCard: {
    backgroundColor: COLORS.skeletonBackground,
    justifyContent: "flex-end",
  },
  skeletonFeaturedContent: {
    padding: 20,
    width: "100%",
  },
  skeletonFeaturedTitle: {
    height: 22,
    width: "60%",
    backgroundColor: COLORS.skeletonHighlight,
    borderRadius: 4,
    marginBottom: 15,
  },
  skeletonFeaturedButton: {
    height: 36,
    width: 120,
    backgroundColor: COLORS.skeletonHighlight,
    borderRadius: 25,
  },
  skeletonMasterTitle: {
    height: 25,
    width: "80%",
    backgroundColor: COLORS.skeletonBackground,
    borderRadius: 4,
    marginBottom: 10,
  },
  skeletonSubtitle: {
    height: 16,
    width: "60%",
    backgroundColor: COLORS.skeletonBackground,
    borderRadius: 4,
    marginTop: 5,
  },

  // Health Stats
  healthStatsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: width * 0.05,
    marginTop: 10,
    marginBottom: 20,
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  healthStatCard: {
    flex: 1,
    alignItems: "center",
  },
  healthStatIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  healthStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.border,
    marginHorizontal: 8,
  },
  healthStatValue: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },
  healthStatLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // Quote
  quoteContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: width * 0.05,
    marginBottom: 20,
    backgroundColor: COLORS.backgroundAlt,
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  quoteIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  quoteIconText: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.primary,
    lineHeight: 28,
  },
  quoteContent: {
    flex: 1,
  },
  quoteText: {
    fontSize: 14,
    fontStyle: "italic",
    color: COLORS.text,
    lineHeight: 20,
  },
  quoteAuthor: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: "right",
  },

  // Quick Actions
  quickActionsContainer: {
    marginHorizontal: width * 0.05,
    marginBottom: 20,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  quickActionCard: {
    width: (width - 60) / 4,
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  quickActionLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.text,
    textAlign: "center",
  },

  // Today's Workout
  todayWorkoutSection: {
    marginBottom: 25,
  },
  sectionTitleWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  todayWorkoutCard: {
    marginHorizontal: width * 0.05,
    height: 180,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  todayWorkoutImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  todayWorkoutOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  todayWorkoutTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.textLight,
    marginBottom: 8,
  },
  todayWorkoutMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  todayWorkoutMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  todayWorkoutMetaText: {
    fontSize: 13,
    color: "#eee",
    fontWeight: "500",
  },
})
