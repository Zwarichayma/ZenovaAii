"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  StatusBar,
  ImageBackground,
  Platform,
  RefreshControl,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { ChevronRight, Search } from "lucide-react-native"
import { getMental } from "@/api/mental/route"
import { getImageUrl } from "@/api/categories/route"
import { getMusic } from "@/api/music/route"
import { getTests } from "@/api/tests/route"
import { getQuotes } from "@/api/music/route"
import { QuoteIcon } from "lucide-react-native"
import { AnimatedQuoteCarousel } from "@/components/animated-quote-carousel"

const { width, height } = Dimensions.get("window")

// Colors for skeleton
const SKELETON_COLORS = {
  background: "#E8E8E8",
  highlight: "#F5F5F5",
}

// Define card props interface
interface CardProps {
  image: any
  title: string
  subtitle?: string
  onPress?: () => void
  size?: "large" | "medium" | "small"
  style?: any
}

// Define content item interface
interface ContentItem {
  id: number
  attributes?: {
    title: string
    subtitle?: string
    type?: string
    image?: {
      data?: {
        attributes?: {
          url?: string
          formats?: {
            thumbnail?: { url?: string }
            small?: { url?: string }
            medium?: { url?: string }
          }
        }
      }
    }
  }
  title?: string
  type?: string
  image?: any[]
}

// Mock quotes data
const MOCK_QUOTES = [
  { id: 1, text: "The only way to do great work is to love what you do.", category: "Inspiration" },
  { id: 2, text: "Believe you can and you're halfway there.", category: "Motivation" },
  { id: 3, text: "The future belongs to those who believe in the beauty of their dreams.", category: "Dreams" },
  { id: 4, text: "Strive not to be a success, but rather to be of value.", category: "Value" },
  {
    id: 5,
    text: "The best and most beautiful things in the world cannot be seen or even touched - they must be felt with the heart.",
    category: "Heart",
  },
]

// Skeleton Components
const SkeletonFeaturedCard = () => (
  <View style={[styles.featuredCard, styles.skeletonCard]}>
    <View style={styles.featuredGradient}>
      {/* Skeleton tag */}
      <View style={[styles.tagContainer, { backgroundColor: SKELETON_COLORS.highlight }]}>
        <View style={[styles.skeletonText, { width: 60, height: 12 }]} />
      </View>
      {/* Skeleton title */}
      <View style={[styles.skeletonText, { width: "70%", height: 28, backgroundColor: SKELETON_COLORS.highlight }]} />
    </View>
  </View>
)

const SkeletonCard = ({ size = "medium" }: { size?: "large" | "medium" | "small" }) => (
  <View style={[styles.card, styles[`${size}Card`], styles.skeletonCard, styles.cardShadow]}>
    <View style={styles.cardGradient}>
      {/* Skeleton mini tag */}
      <View style={[styles.miniTagContainer, { backgroundColor: SKELETON_COLORS.highlight }]}>
        <View style={[styles.skeletonText, { width: 40, height: 10 }]} />
      </View>
      {/* Skeleton title */}
      <View
        style={[
          styles.skeletonText,
          { width: "80%", height: 17, backgroundColor: SKELETON_COLORS.highlight, alignSelf: "center" },
        ]}
      />
    </View>
  </View>
)

const SkeletonQuoteCarousel = () => (
  <View style={styles.quoteCarouselSection}>
    <View style={styles.quoteCarouselHeader}>
      <View style={[styles.skeletonIcon, { width: 18, height: 18, borderRadius: 9 }]} />
      <View style={[styles.skeletonText, { width: 120, height: 18, marginLeft: 8 }]} />
    </View>
    <View style={{ height: 100, justifyContent: "center", paddingHorizontal: 20 }}>
      <View style={[styles.skeletonText, { width: "90%", height: 14, marginBottom: 8 }]} />
      <View style={[styles.skeletonText, { width: "80%", height: 14, marginBottom: 8 }]} />
      <View style={[styles.skeletonText, { width: "60%", height: 14 }]} />
    </View>
  </View>
)

const SkeletonSectionHeader = () => (
  <View style={styles.sectionHeader}>
    <View style={[styles.skeletonText, { width: 150, height: 18 }]} />
    <View style={[styles.seeAllButton, { backgroundColor: SKELETON_COLORS.background }]}>
      <View style={[styles.skeletonText, { width: 40, height: 14 }]} />
      <View
        style={{ width: 16, height: 16, backgroundColor: SKELETON_COLORS.highlight, borderRadius: 8, marginLeft: 4 }}
      />
    </View>
  </View>
)

// Skeleton UI Component
const SkeletonUI = () => (
  <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <Text style={styles.dateText}>
      {new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })}
    </Text>

    <View>
      <Text style={styles.welcomeTitle}>Start Your</Text>
      <Text style={styles.welcomeSubtitle}>Mindfulness Journey</Text>
    </View>

    {/* Skeleton Featured Section */}
    <View style={styles.featuredSection}>
      <SkeletonFeaturedCard />
    </View>

    {/* Skeleton Quote Carousel */}
    <SkeletonQuoteCarousel />

    {/* Skeleton Tests Section */}
    <View style={styles.section}>
      <SkeletonSectionHeader />
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: "row" }}>
          {[1, 2, 3].map((_, index) => (
            <SkeletonCard key={`skeleton-test-${index}`} size="medium" />
          ))}
        </View>
      </ScrollView>
    </View>

    {/* Skeleton Music Section */}
    <View style={styles.section}>
      <SkeletonSectionHeader />
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: "row" }}>
          {[1, 2, 3].map((_, index) => (
            <SkeletonCard key={`skeleton-music-${index}`} size="medium" />
          ))}
        </View>
      </ScrollView>
    </View>

    {/* Skeleton Quotes Section */}
    <View style={styles.section}>
      <SkeletonSectionHeader />
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: "row" }}>
          {[1, 2, 3].map((_, index) => (
            <SkeletonCard key={`skeleton-quote-${index}`} size="medium" />
          ))}
        </View>
      </ScrollView>
    </View>
  </ScrollView>
)

// Enhanced featured card with shadow and better gradient
const FeaturedCard = ({ image, title, subtitle, onPress, style }: CardProps) => {
  // Default image for fallback
  const defaultImage = require("../assets/images/yooga.jpg")

  // Check if image is valid
  const imageSource =
    image && typeof image === "string" && image.length > 0
      ? { uri: image }
      : typeof image === "number"
        ? image
        : defaultImage

  return (
    <TouchableOpacity style={[styles.featuredCard, style]} onPress={onPress} activeOpacity={0.9}>
      <ImageBackground
        source={imageSource}
        style={styles.featuredImage}
        imageStyle={{ borderRadius: 20 }}
        defaultSource={defaultImage}
      >
        <LinearGradient colors={["transparent", "rgba(0,0,0,0.3)", "rgba(0,0,0,0.75)"]} style={styles.featuredGradient}>
          {subtitle && (
            <View style={styles.tagContainer}>
              <Text style={styles.tagText}>{subtitle}</Text>
            </View>
          )}
          <Text style={styles.featuredTitle}>{title}</Text>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  )
}

// Enhanced card with shadow and better gradient
const Card = ({ image, title, subtitle, onPress, size = "medium", style }: CardProps) => {
  // Default image for fallback
  const defaultImage = require("../assets/images/yooga.jpg")

  // Check if image is valid
  const imageSource =
    image && typeof image === "string" && image.length > 0
      ? { uri: image }
      : typeof image === "number"
        ? image
        : defaultImage

  return (
    <TouchableOpacity style={[styles.card, styles[`${size}Card`], style]} onPress={onPress} activeOpacity={0.9}>
      <ImageBackground
        source={imageSource}
        style={styles.cardImage}
        imageStyle={{ borderRadius: 16 }}
        defaultSource={defaultImage}
      >
        <LinearGradient colors={["transparent", "rgba(0,0,0,0.3)", "rgba(0,0,0,0.75)"]} style={styles.cardGradient}>
          {subtitle && (
            <View style={styles.miniTagContainer}>
              <Text style={styles.miniTagText}>{subtitle}</Text>
            </View>
          )}
          <Text style={styles.cardTitle}>{title}</Text>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  )
}

// Section header with "See all" button
const SectionHeader = ({ title, onSeeAll }: { title: string; onSeeAll: () => void }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <TouchableOpacity style={styles.seeAllButton} onPress={onSeeAll}>
      <Text style={styles.seeAllText}>See all</Text>
      <ChevronRight size={16} color="#2f4f4f" />
    </TouchableOpacity>
  </View>
)

export default function HomeScreen({ navigation }: any) {
  // State for storing content data
  const [mentalData, setMentalData] = useState<ContentItem[]>([])
  const [musicData, setMusicData] = useState<ContentItem[]>([])
  const [testData, setTestData] = useState<ContentItem[]>([])
  const [quoteData, setQuoteData] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize animation values safely
  const fadeAnim = useRef(new Animated.Value(0))
  const translateY = useRef(new Animated.Value(20))
  const translateX = useRef(new Animated.Value(100))

  // Get current date
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })

  // Enhanced image URL getter with better error handling
  const getSafeImageUrl = useCallback((item: ContentItem): string | null => {
    try {
      const url = getImageUrl(item)
      return url && url.length > 0 ? url : null
    } catch (error) {
      console.warn("Error getting image URL:", error)
      return null
    }
  }, [])

  // Fetch data function with improved error handling
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch all data in parallel with error handling
      const [mental, music, tests, quotes] = await Promise.all([
        getMental().catch((err) => {
          console.error("Error fetching mental data:", err)
          return []
        }),
        getMusic().catch((err) => {
          console.error("Error fetching music data:", err)
          return []
        }),
        getTests().catch((err) => {
          console.error("Error fetching test data:", err)
          return []
        }),
        getQuotes().catch((err) => {
          console.error("Error fetching quote data:", err)
          return []
        }),
      ])

      console.log("Mental data count:", mental?.length || 0)
      console.log("Music data count:", music?.length || 0)
      console.log("Test data count:", tests?.length || 0)
      console.log("Quote data count:", quotes?.length || 0)

      setMentalData(mental || [])
      setMusicData(music || [])
      setTestData(tests || [])
      setQuoteData(quotes || [])
    } catch (error) {
      console.error("Error fetching data:", error)
      setError("Failed to load content. Please try again.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  // Initial data fetch and animations
  useEffect(() => {
    fetchAllData()

    // Safely run animations only if refs are defined
    const fade = fadeAnim.current
    const transY = translateY.current
    const transX = translateX.current

    if (fade && transY && transX) {
      // Animate welcome text
      Animated.parallel([
        Animated.timing(fade, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(transY, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start()

      // Animate cards
      Animated.timing(transX, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }).start()
    }
  }, [fetchAllData])

  // Pull to refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true)
    fetchAllData()
  }, [fetchAllData])

  // Navigate to the appropriate screen based on content type with error handling
  const navigateToContent = useCallback(
    (type: string, id: number) => {
      try {
        const lowerType = type.toLowerCase()

        if (lowerType === "test") {
          navigation.navigate("TestDetail", { testId: id.toString() }) // Change to testId to match the parameter in TestDetailScreen
        } else if (lowerType === "music" || lowerType === "sound") {
          navigation.navigate("MusicDetail", { id })
        } else if (lowerType === "quote") {
          navigation.navigate("Quote", { id })
        } else if (lowerType === "mental") {
          navigation.navigate("Test", { id })
        } else {
          console.warn(`Unknown content type: ${type}`)
        }
      } catch (error) {
        console.error("Navigation error:", error)
      }
    },
    [navigation],
  )

  // Handle quote press from the carousel
  const handleQuotePress = useCallback(
    (id: number) => {
      navigation.navigate("QuoteDetail", { id })
    },
    [navigation],
  )

  // Get featured item (first mental item or first test item)
  const getFeaturedItem = useCallback((): ContentItem | null => {
    if (mentalData && mentalData.length > 0) {
      return mentalData[0]
    }

    if (testData && testData.length > 0) {
      return testData[0]
    }

    return null
  }, [mentalData, testData])

  // Get title from item based on its structure
  const getTitle = useCallback((item: ContentItem): string => {
    if (item?.attributes?.title) {
      return item.attributes.title
    }
    if (item?.title) {
      return item.title
    }
    return "Untitled"
  }, [])

  // Get subtitle or type from item
  const getSubtitle = useCallback((item: ContentItem, defaultSubtitle: string): string => {
    if (item?.attributes?.subtitle) {
      return item.attributes.subtitle
    }
    if (item?.attributes?.type) {
      return item.attributes.type
    }
    if (item?.type) {
      return item.type
    }
    return defaultSubtitle
  }, [])

  // Get featured item
  const featuredItem = getFeaturedItem()

  // Render error state
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchAllData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    )
  }

  // Safely get animation values
  const fadeValue = fadeAnim.current || new Animated.Value(0)
  const translateYValue = translateY.current || new Animated.Value(0)
  const translateXValue = translateX.current || new Animated.Value(0)

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Enhanced header with search button */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.logoText}></Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => {
              try {
                navigation.navigate("Search")
              } catch (error) {
                console.error("Navigation error:", error)
              }
            }}
          >
            <Search size={20} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <SkeletonUI />
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2f4f4f" colors={["#2f4f4f"]} />
          }
        >
          <Text style={styles.dateText}>{currentDate}</Text>

          <Animated.View
            style={{
              opacity: fadeValue,
              transform: [{ translateY: translateYValue }],
            }}
          >
            <Text style={styles.welcomeTitle}>Start Your</Text>
            <Text style={styles.welcomeSubtitle}>Mindfulness Journey</Text>
          </Animated.View>

          {/* Featured Section */}
          <View style={styles.featuredSection}>
            {featuredItem ? (
              <FeaturedCard
                image={getSafeImageUrl(featuredItem) || require("../assets/images/yooga.jpg")}
                title={getTitle(featuredItem)}
                subtitle={getSubtitle(featuredItem, "Featured")}
                onPress={() =>
                  navigateToContent(featuredItem.attributes?.type || featuredItem.type || "mental", featuredItem.id)
                }
                style={styles.featuredCardShadow}
              />
            ) : (
              <FeaturedCard
                image={require("../assets/images/yooga.jpg")}
                title="Mindfulness Meditation"
                subtitle="Featured"
                onPress={() => {
                  try {
                    navigation.navigate("Mental")
                  } catch (error) {
                    console.error("Navigation error:", error)
                  }
                }}
                style={styles.featuredCardShadow}
              />
            )}
          </View>

          {/* Quote Carousel Section */}
          <View style={styles.quoteCarouselSection}>
            <View style={styles.quoteCarouselHeader}>
              <QuoteIcon size={18} color="#2f4f4f" />
              <Text style={styles.quoteCarouselTitle}>Daily Inspiration</Text>
            </View>
            <AnimatedQuoteCarousel
              quotes={MOCK_QUOTES}
              duration={5000}
              onQuotePress={(id) => navigateToContent("quote", id)}
            />
          </View>

          {/* Tests Section */}
          <View style={styles.section}>
            <SectionHeader
              title="Self-Discovery Tests"
              onSeeAll={() => {
                try {
                  navigation.navigate("Test")
                } catch (error) {
                  console.error("Navigation error:", error)
                }
              }}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <Animated.View
                style={{
                  flexDirection: "row",
                  transform: [{ translateX: translateXValue }],
                }}
              >
                {testData.length > 0 ? (
                  testData.map((item) => (
                    <Card
                      key={item.id}
                      image={getSafeImageUrl(item)}
                      title={getTitle(item)}
                      onPress={() => navigateToContent("test", item.id)}
                      style={styles.cardShadow}
                    />
                  ))
                ) : (
                  <View style={styles.emptyStateContainer}>
                    <Text style={styles.emptyStateText}>No tests available</Text>
                  </View>
                )}
              </Animated.View>
            </ScrollView>
          </View>

          {/* Music Section */}
          <View style={styles.section}>
            <SectionHeader
              title="Music for Meditation"
              onSeeAll={() => {
                try {
                  navigation.navigate("Music")
                } catch (error) {
                  console.error("Navigation error:", error)
                }
              }}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <Animated.View
                style={{
                  flexDirection: "row",
                  transform: [{ translateX: translateXValue }],
                }}
              >
                {musicData.length > 0 ? (
                  musicData.map((item) => {
                    const imageUrl = getSafeImageUrl(item)
                    return (
                      <Card
                        key={item.id}
                        image={imageUrl}
                        title={getTitle(item)}
                        onPress={() => navigateToContent("music", item.id)}
                        style={styles.cardShadow}
                      />
                    )
                  })
                ) : (
                  <View style={styles.emptyStateContainer}>
                    <Text style={styles.emptyStateText}>No music available</Text>
                  </View>
                )}
              </Animated.View>
            </ScrollView>
          </View>

          {/* Quotes Section */}
          <View style={styles.section}>
            <SectionHeader
              title="All Quotes"
              onSeeAll={() => {
                try {
                  navigation.navigate("Quote")
                } catch (error) {
                  console.error("Navigation error:", error)
                }
              }}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <Animated.View
                style={{
                  flexDirection: "row",
                  transform: [{ translateX: translateXValue }],
                }}
              >
                {quoteData.length > 0
                  ? quoteData.map((item) => (
                      <Card
                        key={item.id}
                        image={getSafeImageUrl(item)}
                        onPress={() => navigateToContent("quote", item.id)}
                        style={styles.cardShadow}
                      />
                    ))
                  : // If no API data, use mock quotes
                    MOCK_QUOTES.map((item) => (
                      <Card
                        key={item.id}
                        image={null}
                        onPress={() => handleQuotePress(item.id)}
                        style={styles.cardShadow}
                      />
                    ))}
              </Animated.View>
            </ScrollView>
          </View>
        </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#000",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    fontWeight: "500",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#ff3b30",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#2f4f4f",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: width * 0.04,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 0,
    marginBottom: 0,
  },
  logoText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2f4f4f",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
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
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#2f4f4f",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 3,
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  profileInitial: {
    width: "100%",
    height: "100%",
    backgroundColor: "#2f4f4f",
    justifyContent: "center",
    alignItems: "center",
  },
  initialText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: width * 0.05,
    paddingBottom: 40,
  },
  dateText: {
    fontSize: 15,
    color: "#2f4f4f",
    marginBottom: 10,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontWeight: "600",
    textAlign: "center",
    opacity: 0.6,
  },
  welcomeTitle: {
    fontSize: 34,
    fontWeight: "800",
    color: "#2f4f4f",
    textAlign: "center",
    marginBottom: 0,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    letterSpacing: -0.8,
  },
  welcomeSubtitle: {
    fontSize: 34,
    fontWeight: "800",
    color: "#2f4f4f",
    marginBottom: 28,
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    letterSpacing: -0.8,
    opacity: 0.9,
  },
  featuredSection: {
    marginBottom: 30,
  },
  featuredCard: {
    width: "100%",
    height: 240,
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: "#f5f5f5",
  },
  featuredCardShadow: {
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  featuredImage: {
    width: "100%",
    height: "100%",
    justifyContent: "flex-end",
  },
  featuredGradient: {
    height: "100%",
    width: "100%",
    justifyContent: "flex-end",
    padding: 24,
    borderRadius: 28,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  featuredTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
    textShadowColor: "rgba(0, 0, 0, 0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  tagContainer: {
    backgroundColor: "rgba(255,255,255,0.35)",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 24,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  tagText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  miniTagContainer: {
    backgroundColor: "rgba(255,255,255,0.35)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  miniTagText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    textShadowColor: "rgba(0, 0, 0, 0.05)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
    paddingBottom: 10,
    borderBottomWidth: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(97, 97, 97, 0.08)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  seeAllText: {
    fontSize: 14,
    color: "#000",
    fontWeight: "600",
    marginRight: 4,
  },
  card: {
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#f5f5f5",
    marginRight: 18,
  },
  cardShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  mediumCard: {
    width: width * 0.44,
    height: 200,
  },
  smallCard: {
    width: width * 0.38,
    height: 170,
  },
  largeCard: {
    width: width * 0.62,
    height: 210,
  },
  cardImage: {
    width: "100%",
    height: "100%",
    justifyContent: "flex-end",
  },
  cardGradient: {
    height: "100%",
    width: "100%",
    justifyContent: "flex-end",
    padding: 18,
    borderRadius: 20,
  },
  cardTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    textShadowColor: "rgba(0, 0, 0, 0)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  emptyStateContainer: {
    width: width * 0.44,
    height: 200,
    backgroundColor: "#f7f7f7",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 18,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  emptyStateText: {
    color: "#888",
    fontSize: 15,
    fontWeight: "500",
    textAlign: "center",
    padding: 12,
  },
  headerLogo: {
    width: 40,
    height: 50,
    marginLeft: 5,
  },
  quoteCarouselSection: {
    marginBottom: 20,
    backgroundColor: "rgba(218, 218, 218, 0.05)",
    borderRadius: 16,
    padding: 16,
  },
  quoteCarouselHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  quoteCarouselTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginLeft: 8,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },

  // Skeleton styles
  skeletonCard: {
    backgroundColor: SKELETON_COLORS.background,
  },
  skeletonText: {
    backgroundColor: SKELETON_COLORS.highlight,
    borderRadius: 4,
  },
  skeletonIcon: {
    backgroundColor: SKELETON_COLORS.highlight,
  },
  headerLeft: {
    flex: 1,
    justifyContent: "center",
  },
})
