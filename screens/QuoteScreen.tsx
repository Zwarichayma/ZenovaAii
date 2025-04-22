"use client"

import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform,
  Image,
  Share,
  ActivityIndicator,
  Animated,
  Modal,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import { ArrowLeft, Heart, Share2, RefreshCw, X } from "lucide-react-native"
// Import directly from a config file instead of @env
import { API_BASE_URL } from "../config"

const { width, height } = Dimensions.get("window")

// Define the full API URL properly
const QUOTES_API = `${API_BASE_URL}/api/quotes?populate=image`

// Updated type to match the actual API response
type QuoteType = {
  id: number
  documentId: string
  title: string | null
  createdAt: string
  updatedAt: string
  publishedAt: string
  image: {
    id: number
    documentId: string
    name: string
    alternativeText: string | null
    caption: string | null
    width: number
    height: number
    formats: {
      thumbnail?: {
        url: string
      }
      medium?: {
        url: string
      }
      small?: {
        url: string
      }
    }
    url: string
  }[]
}

// Card colors for quotes without images
const CARD_COLORS = [
  "#FFD1DC", // Light pink
  "#E0BBE4", // Lavender
  "#957DAD", // Purple
  "#D291BC", // Pink
  "#FEC8D8", // Light pink
  "#FFDFD3", // Peach
  "#F0EAD6", // Beige
  "#DCE8F7", // Light blue
]

export default function QuoteScreen() {
  const navigation = useNavigation()
  const [quotes, setQuotes] = useState<QuoteType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [favoriteIds, setFavoriteIds] = useState<number[]>([])

  // State for modal
  const [selectedQuote, setSelectedQuote] = useState<QuoteType | null>(null)
  const [modalVisible, setModalVisible] = useState(false)

  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current

  useEffect(() => {
    fetchQuotes()
  }, [])

  const fetchQuotes = async () => {
    setIsLoading(true)
    setError(null)

    try {
      console.log("Fetching quotes from:", QUOTES_API) // Debug log
      const response = await fetch(QUOTES_API)

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      console.log("API response:", JSON.stringify(data).substring(0, 200) + "...") // Debug log

      if (data && data.data && Array.isArray(data.data)) {
        setQuotes(data.data)
      } else {
        throw new Error("Invalid data format received from API")
      }
    } catch (err) {
      console.error("Error fetching quotes:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch quotes")
    } finally {
      setIsLoading(false)
    }
  }

  const handleShare = async (quote: QuoteType) => {
    try {
      await Share.share({
        message: `"${quote.title || "Inspirational Quote"}" - Zenova AI`,
      })
    } catch (error) {
      console.error("Error sharing quote:", error)
    }
  }

  const toggleFavorite = (id: number) => {
    setFavoriteIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((itemId) => itemId !== id)
      } else {
        return [...prev, id]
      }
    })
  }

  // Open modal with selected quote
  const openQuoteDetail = (quote: QuoteType) => {
    setSelectedQuote(quote)
    setModalVisible(true)
  }

  // Close modal
  const closeQuoteDetail = () => {
    setModalVisible(false)
    // Wait for animation to complete before clearing the selected quote
    setTimeout(() => {
      setSelectedQuote(null)
    }, 300)
  }

  // Helper function to get image URL
  const getImageUrl = (quote: QuoteType): string => {
    if (!quote || !quote.image || !Array.isArray(quote.image) || quote.image.length === 0) {
      return ""
    }

    const imageData = quote.image[0]
    let imageUrl = ""

    // Try different format options
    if (imageData.formats?.medium?.url) {
      imageUrl = imageData.formats.medium.url
    } else if (imageData.formats?.small?.url) {
      imageUrl = imageData.formats.small.url
    } else if (imageData.formats?.thumbnail?.url) {
      imageUrl = imageData.formats.thumbnail.url
    } else if (imageData.url) {
      imageUrl = imageData.url
    }

    // Add base URL if not already included
    if (imageUrl && !imageUrl.startsWith("http")) {
      imageUrl = API_BASE_URL + imageUrl
    }

    return imageUrl
  }

  // Get a random color for cards without images
  const getCardColor = (index: number) => {
    return CARD_COLORS[index % CARD_COLORS.length]
  }

  // Get card height based on index for masonry layout
  const getCardHeight = (index: number): number => {
    // Alternate between different heights for visual interest
    if (index % 3 === 0) {
      return 240 // Taller card
    } else if (index % 4 === 0) {
      return 280 // Tallest card
    } else {
      return 200 // Standard card
    }
  }

  // Create header animation
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0.9],
    extrapolate: "clamp",
  })

  // Split quotes into two columns for the grid layout
  const leftColumnQuotes = quotes.filter((_, i) => i % 2 === 0)
  const rightColumnQuotes = quotes.filter((_, i) => i % 2 === 1)

  const renderQuoteCard = (quote: QuoteType, index: number) => {
    const isFavorite = favoriteIds.includes(quote.id)
    const imageUrl = getImageUrl(quote)
    const cardHeight = getCardHeight(index)

    return (
      <TouchableOpacity
        key={quote.id}
        activeOpacity={0.9}
        onPress={() => openQuoteDetail(quote)}
        style={styles.quoteCardWrapper}
      >
        <View
          style={[
            styles.quoteCard,
            {
              height: cardHeight,
            },
          ]}
        >
          <View style={[styles.quoteCardInner, !imageUrl && { backgroundColor: getCardColor(index) }]}>
            {imageUrl ? (
              <Image
                source={{ uri: imageUrl }}
                style={styles.quoteImage}
                onError={(e) => console.error("Image load error:", e.nativeEvent.error)}
              />
            ) : (
              <View style={styles.quoteTextContainer}>
                <Text style={styles.quoteText} numberOfLines={5} ellipsizeMode="tail">
                  {quote.title || "Inspirational Quote"}
                </Text>
              </View>
            )}

            <View style={styles.actionIcons}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={(e) => {
                  e.stopPropagation()
                  toggleFavorite(quote.id)
                }}
              >
                <Heart
                  size={16}
                  color={isFavorite ? "#ff4d6d" : "#666"}
                  fill={isFavorite ? "#ff4d6d" : "transparent"}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.iconButton}
                onPress={(e) => {
                  e.stopPropagation()
                  handleShare(quote)
                }}
              >
                <Share2 size={16} color="#666" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  // Render the quote detail modal
  const renderQuoteDetailModal = () => {
    if (!selectedQuote) return null

    const imageUrl = getImageUrl(selectedQuote)
    const isFavorite = favoriteIds.includes(selectedQuote.id)
    const cardColor = getCardColor(selectedQuote.id % CARD_COLORS.length)

    return (
      <Modal visible={modalVisible} transparent={true} animationType="fade" onRequestClose={closeQuoteDetail}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Quote</Text>
              <TouchableOpacity onPress={closeQuoteDetail} style={styles.closeButton}>
                <X size={20} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {imageUrl ? <Image source={{ uri: imageUrl }} style={styles.modalImage} resizeMode="cover" /> : null}

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalActionButton} onPress={() => toggleFavorite(selectedQuote.id)}>
                  <Heart
                    size={24}
                    color={isFavorite ? "#ff4d6d" : "#666"}
                    fill={isFavorite ? "#ff4d6d" : "transparent"}
                  />
                </TouchableOpacity>

                <TouchableOpacity style={styles.modalActionButton} onPress={() => handleShare(selectedQuote)}>
                  <Share2 size={20} color="#666" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Daily Quotes</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchQuotes}>
          <RefreshCw size={20} color="#333" />
        </TouchableOpacity>
      </Animated.View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchQuotes}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Loading quotes...</Text>
        </View>
      ) : (
        <Animated.ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
          scrollEventThrottle={16}
        >
          {quotes.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No quotes available</Text>
              <TouchableOpacity style={styles.retryButton} onPress={fetchQuotes}>
                <Text style={styles.retryButtonText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.gridContainer}>
              {/* Left Column */}
              <View style={styles.gridColumn}>
                {leftColumnQuotes.map((quote, index) => renderQuoteCard(quote, index * 2))}
              </View>

              {/* Right Column */}
              <View style={styles.gridColumn}>
                {rightColumnQuotes.map((quote, index) => renderQuoteCard(quote, index * 2 + 1))}
              </View>
            </View>
          )}

          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>Benefits of Daily Quotes</Text>
            <Text style={styles.infoText}>
              Reading inspirational quotes daily can help improve your mental well-being, boost motivation, and provide
              perspective during challenging times. Make it a habit to reflect on a new quote each day.
            </Text>
          </View>
        </Animated.ScrollView>
      )}

      {/* Quote Detail Modal */}
      {renderQuoteDetailModal()}
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
    zIndex: 10,
  },
  backButton: {
    padding: 8,
  },
  refreshButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  content: {
    padding: width * 0.03,
    paddingBottom: 30,
  },
  gridContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  gridColumn: {
    width: "48.5%", // Slightly less than 50% to allow for gap
  },
  quoteCardWrapper: {
    marginBottom: 12,
  },
  quoteCard: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
  },
  quoteCardInner: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  quoteImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  quoteTextContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  quoteText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  actionIcons: {
    position: "absolute",
    top: 10,
    right: 10,
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "#d32f2f",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  emptyContainer: {
    alignItems: "center",
    padding: 20,
    marginTop: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#000",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  infoSection: {
    marginTop: 10,
    marginBottom: 30,
    padding: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    marginHorizontal: width * 0.02,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: "#333",
  },
  infoText: {
    fontSize: 15,
    lineHeight: 24,
    color: "#666",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: width * 0.7,
    maxHeight: height * 1,
    backgroundColor: "white",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 16,
  },
  modalImage: {
    width: "100%",
    height: 300,
    borderRadius: 12,
    marginBottom: 16,
  },
  modalQuoteContainer: {
    padding: 30,
    borderRadius: 12,
    marginBottom: 16,
  },
  modalQuoteText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    lineHeight: 32,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 1,
  },
  modalActionButton: {
    alignItems: "center",
    padding: 5,
  },
})
