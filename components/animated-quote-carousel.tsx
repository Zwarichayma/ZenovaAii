"use client"

import { useState, useEffect, useRef } from "react"
import { View, Text, StyleSheet, Animated, Dimensions, TouchableOpacity, Platform } from "react-native"
import { User, ChevronRight } from "lucide-react-native"

const { width } = Dimensions.get("window")

// Mock quotes data
const QUOTES = [
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

interface AnimatedQuoteCarouselProps {
  quotes: {
    id: number
    text: string
    author: string
    category: string
  }[]
  duration?: number
  onQuotePress?: (id: number) => void
}

export const AnimatedQuoteCarousel = ({ quotes, duration = 5000, onQuotePress }: AnimatedQuoteCarouselProps) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [previousIndex, setPreviousIndex] = useState(0)
  const fadeAnim = useRef(new Animated.Value(1)).current
  const slideAnim = useRef(new Animated.Value(0)).current
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Function to animate to the next quote
  const animateToNextQuote = () => {
    // Save current index as previous
    setPreviousIndex(activeIndex)

    // Animate current quote out
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -50,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Update to next quote
      setActiveIndex((prevIndex) => (prevIndex + 1) % quotes.length)

      // Reset animations
      slideAnim.setValue(50)

      // Animate new quote in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start()
    })
  }

  // Set up timer for quote rotation
  useEffect(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    // Set new timer
    timerRef.current = setTimeout(animateToNextQuote, duration)

    // Clean up timer on unmount
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [activeIndex, duration, quotes])

  // Handle quote press
  const handleQuotePress = () => {
    if (onQuotePress) {
      onQuotePress(quotes[activeIndex].id)
    }
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.quoteContainer} activeOpacity={0.8} onPress={handleQuotePress}>
        <Animated.View
          style={[
            styles.quoteContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.quoteSymbol}>"</Text>
          <Text style={styles.quoteText} numberOfLines={2}>
            {quotes[activeIndex].text}
          </Text>
          <View style={styles.authorContainer}>
            <User size={14} color="#666" />
            <Text style={styles.authorText}>{quotes[activeIndex].author}</Text>
          </View>
        </Animated.View>

        <View style={styles.dotsContainer}>
          {quotes.map((_, index) => (
            <View key={index} style={[styles.dot, index === activeIndex && styles.activeDot]} />
          ))}
        </View>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(47, 79, 79, 0.08)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  seeAllText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
    marginRight: 4,
  },
  quoteContainer: {
    backgroundColor: "#f7f7f7",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    minHeight: 150,
    justifyContent: "space-between",
  },
  quoteContent: {
    flex: 1,
  },
  quoteSymbol: {
    fontSize: 40,
    color: "rgba(129, 129, 129, 0.27)",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    position: "absolute",
    top: -20,
    left: 0,
  },
  quoteText: {
    fontSize: 18,
    lineHeight: 26,
    color: "#333",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontStyle: "italic",
    marginTop: 10,
    marginBottom: 16,
  },
  authorContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  authorText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 6,
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    fontWeight: "500",
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(81, 82, 82, 0.2)",
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#000",
    width: 16,
  },
})
