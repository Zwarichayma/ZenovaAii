"use client"

import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Platform,
  StatusBar,
  Animated,
  Alert,
  Share,
  Clipboard,
} from "react-native"
import { ArrowLeft, Heart, Copy, Share as ShareIcon, User } from "lucide-react-native"
import { getQuoteById } from "@/api/music/route"

const { width, height } = Dimensions.get("window")

// Mock quotes data for offline use
const MOCK_QUOTES = [
  {
    id: 1,
    text: "The journey of a thousand miles begins with a single step.",
    author: "Lao Tzu",
    category: "Wisdom",
  },
  {
    id: 2,
    text: "Happiness is not something ready-made. It comes from your own actions.",
    author: "Dalai Lama",
    category: "Happiness",
  },
  {
    id: 3,
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
    category: "Motivation",
  },
  {
    id: 4,
    text: "In the midst of winter, I found there was, within me, an invincible summer.",
    author: "Albert Camus",
    category: "Resilience",
  },
  {
    id: 5,
    text: "Peace comes from within. Do not seek it without.",
    author: "Buddha",
    category: "Mindfulness",
  },
]

interface QuoteDetailScreenProps {
  route: {
    params: {
      id: number
    }
  }
  navigation: any
}

export default function QuoteDetailScreen({ route, navigation }: QuoteDetailScreenProps) {
  const { id = 1 } = route.params || {} // Default to first quote if no ID provided
  const [quote, setQuote] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [copied, setCopied] = useState(false)

  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current
  const fadeAnim = useRef(new Animated.Value(0)).current

  const imageScale = scrollY.interpolate({
    inputRange: [-100, 0, 100],
    outputRange: [1.2, 1, 0.8],
    extrapolate: "clamp",
  })

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 90, 120],
    outputRange: [0, 0.5, 1],
    extrapolate: "clamp",
  })

  // Load quote data
  useEffect(() => {
    const fetchQuote = async () => {
      try {
        setLoading(true)

        // Try to fetch from API first
        try {
          const apiQuote = await getQuoteById(id)
          if (apiQuote) {
            // Format the quote data from API
            const formattedQuote = {
              id: apiQuote.id,
              text: apiQuote.attributes.content || "No content available",
              author: apiQuote.attributes.author || "Unknown",
              category: "Inspiration",
            }
            setQuote(formattedQuote)
            setLoading(false)

            // Animate fade in
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }).start()

            return
          }
        } catch (apiError) {
          console.log("API fetch failed, using mock data", apiError)
        }

        // Fallback to mock data
        const mockQuote = MOCK_QUOTES.find((q) => q.id === id) || MOCK_QUOTES[0]

        // Simulate network delay
        setTimeout(() => {
          setQuote(mockQuote)

          // Animate fade in
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }).start()

          setLoading(false)
        }, 800)
      } catch (err) {
        console.error("Error fetching quote:", err)
        setError("Unable to load the quote. Please try again.")
        setLoading(false)
      }
    }

    fetchQuote()
  }, [id, fadeAnim])

  // Toggle favorite
  const toggleFavorite = () => {
    setIsFavorite(!isFavorite)
    // Here you would also update your favorites storage
  }

  // Share quote
  const shareQuote = async () => {
    if (!quote) return

    try {
      const result = await Share.share({
        message: `"${quote.text}" - ${quote.author}`,
        title: "Share this quote",
      })

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
          console.log("Shared with activity type:", result.activityType)
        } else {
          // shared
          console.log("Shared successfully")
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
        console.log("Share dismissed")
      }
    } catch (error) {
      console.error("Error sharing quote:", error)
      Alert.alert("Share", `Would share: "${quote.text}" - ${quote.author}`, [
        { text: "OK", onPress: () => console.log("OK Pressed") },
      ])
    }
  }

  // Copy quote to clipboard
  const copyToClipboard = () => {
    if (!quote) return

    try {
      const textToCopy = `"${quote.text}" - ${quote.author}`

      // Use Clipboard API
      Clipboard.setString(textToCopy)

      // Update UI to show copied state
      setCopied(true)

      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000)

      // Show success message
      Alert.alert("Copied!", `"${quote.text}" - ${quote.author} has been copied to clipboard.`, [
        { text: "OK", onPress: () => console.log("OK Pressed") },
      ])
    } catch (error) {
      console.error("Error copying to clipboard:", error)
      Alert.alert("Error", "Failed to copy to clipboard", [{ text: "OK", onPress: () => console.log("OK Pressed") }])
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2f4f4f" />
        <Text style={styles.loadingText}>Loading quote...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.retryButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

    
      {/* Back button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <ArrowLeft size={24} color="#000" />
      </TouchableOpacity>

      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
      >
        {/* Content */}
        <View style={styles.contentContainer}>
          {/* Category tag */}
          <View style={styles.categoryContainer}>
            <View style={styles.categoryTag}>
              <Text style={styles.categoryText}>{quote?.category || "Inspiration"}</Text>
            </View>
          </View>

          {/* Quote */}
          <Animated.View style={[styles.quoteContainer, { opacity: fadeAnim }]}>
            <Text style={styles.quoteSymbol}>"</Text>
            <Text style={styles.quoteText}>{quote?.text}</Text>
            <Text style={styles.quoteSymbol}>"</Text>

            <View style={styles.authorContainer}>
              <User size={16} color="#333" />
              <Text style={styles.authorText}>{quote?.author}</Text>
            </View>
          </Animated.View>

          {/* Action buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={toggleFavorite}>
              <Heart size={24} color={isFavorite ? "#ff4757" : "#000"} fill={isFavorite ? "#ff4757" : "transparent"} />
              <Text style={styles.actionButtonText}>{isFavorite ? "Favorite" : "Add"}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={shareQuote}>
              <ShareIcon size={24} color="#000" />
              <Text style={styles.actionButtonText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={copyToClipboard}>
              <Copy size={24} color="#000" />
              <Text style={styles.actionButtonText}>{copied ? "Copied!" : "Copy"}</Text>
            </TouchableOpacity>
          </View>

          {/* Related quotes */}
          <View style={styles.relatedContainer}>
            <Text style={styles.relatedTitle}>Similar Quotes</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {MOCK_QUOTES.filter((q) => q.id !== id).map((relatedQuote) => (
                <TouchableOpacity
                  key={relatedQuote.id}
                  style={styles.relatedQuoteCard}
                  onPress={() => {
                    // Navigate to the same screen with different ID
                    navigation.push("QuoteDetail", { id: relatedQuote.id })
                  }}
                >
                  <Text style={styles.relatedQuoteText} numberOfLines={2}>
                    "{relatedQuote.text}"
                  </Text>
                  <Text style={styles.relatedQuoteAuthor}>- {relatedQuote.author}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Additional information */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionTitle}>Context</Text>
            <Text style={styles.descriptionText}>
              Inspirational quotes can help us find motivation, clarity, and inner peace. Take a moment to reflect on
              this quote and how it might apply to your life.
            </Text>
          </View>
        </View>
      </Animated.ScrollView>
    </View>
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
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#000",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#000",
    textAlign: "center",
    marginBottom: 20,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#2f4f4f",
    borderRadius: 20,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  animatedHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === "ios" ? 90 : 70,
    backgroundColor: "#fff",
    zIndex: 100,
    justifyContent: "flex-end",
    paddingBottom: 10,
    paddingHorizontal: 60,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  headerTitle: {
    color: "#000",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  backButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 30,
    left: 15,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 101,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: Platform.OS === "ios" ? 90 : 70,
  },
  imageContainer: {
    height: height * 0.4,
    width: width,
  },
  heroImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "100%",
  },
  contentContainer: {
    backgroundColor: "#fff",
    paddingTop: 30,
    paddingHorizontal: 20,
    paddingBottom: 50,
  },
  categoryContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  categoryTag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "rgba(47, 79, 79, 0.3)",
    borderRadius: 20,
  },
  categoryText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "500",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  quoteContainer: {
    alignItems: "center",
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  quoteSymbol: {
    fontSize: 60,
    color: "rgba(0,0,0,0.1)",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    marginVertical: -10,
  },
  quoteText: {
    fontSize: 24,
    lineHeight: 36,
    color: "#000",
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontStyle: "italic",
    marginVertical: 20,
  },
  authorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  authorText: {
    fontSize: 16,
    color: "#000",
    marginLeft: 8,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 30,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  actionButton: {
    alignItems: "center",
  },
  actionButtonText: {
    color: "#333",
    fontSize: 12,
    marginTop: 8,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  relatedContainer: {
    marginBottom: 30,
  },
  relatedTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginBottom: 15,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  relatedQuoteCard: {
    width: width * 0.7,
    backgroundColor: "rgba(0,0,0,0.03)",
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  relatedQuoteText: {
    color: "#000",
    fontSize: 16,
    fontStyle: "italic",
    marginBottom: 8,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  relatedQuoteAuthor: {
    color: "#333",
    fontSize: 14,
    textAlign: "right",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  descriptionContainer: {
    marginBottom: 30,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginBottom: 10,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
})
