"use client"

import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Dimensions } from "react-native"
import { Clock } from "lucide-react-native"
import { type FitnessPlan, getImageUrl } from "@/api/fitness-plans/route"
import { useNavigation } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"

const { width } = Dimensions.get("window")

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
}

type RootStackParamList = {
  FitnessPlanDetail: { planId: string }
}

type NavigationProp = StackNavigationProp<RootStackParamList>

type SearchResultsProps = {
  results: FitnessPlan[]
  searchQuery: string
}

export default function SearchResults({ results, searchQuery }: SearchResultsProps) {
  const navigation = useNavigation<NavigationProp>()

  const renderResultItem = ({ item }: { item: FitnessPlan }) => {
    const imageUrl =
      item.image && item.image.length > 0 ? getImageUrl(item.image[0].url) : require("../assets/images/cardio.jpg")

    // Check if title is same as type (case insensitive)
    const isTitleSameAsType = item.title.toLowerCase() === item.type.toLowerCase()

    // Highlight matching text in title
    const highlightTitle = () => {
      if (!searchQuery) return <Text style={styles.itemTitle}>{item.title}</Text>

      const regex = new RegExp(`(${searchQuery})`, "gi")
      const parts = item.title.split(regex)

      return (
        <Text style={styles.itemTitle}>
          {parts.map((part, i) =>
            part.toLowerCase() === searchQuery.toLowerCase() ? (
              <Text key={i} style={styles.highlightedText}>
                {part}
              </Text>
            ) : (
              part
            ),
          )}
        </Text>
      )
    }

    return (
      <TouchableOpacity
        style={styles.resultItem}
        activeOpacity={0.8}
        onPress={() => navigation.navigate("FitnessPlanDetail", { planId: item.id })}
      >
        <View style={styles.itemImageContainer}>
          <Image source={{ uri: imageUrl }} style={styles.itemImage} resizeMode="cover" />
          {!isTitleSameAsType && (
            <View style={styles.itemBadge}>
              <Text style={styles.itemBadgeText}>{item.type.toUpperCase()}</Text>
            </View>
          )}
        </View>
        <View style={styles.itemContent}>
          {highlightTitle()}
          <View style={styles.itemMeta}>
            <Clock size={12} color={COLORS.textSecondary} style={styles.itemMetaIcon} />
            <Text style={styles.itemMetaText}>{item.duration} min</Text>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <FlatList
      data={results}
      renderItem={renderResultItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No results found for "{searchQuery}"</Text>
        </View>
      }
    />
  )
}

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  resultItem: {
    flexDirection: "row",
    backgroundColor: COLORS.backgroundAlt,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  itemImageContainer: {
    width: 80,
    height: 80,
    position: "relative",
  },
  itemImage: {
    width: "100%",
    height: "100%",
  },
  itemBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 4,
  },
  itemBadgeText: {
    color: COLORS.textLight,
    fontSize: 8,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  itemContent: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  highlightedText: {
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    fontWeight: "700",
  },
  itemMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemMetaIcon: {
    marginRight: 4,
  },
  itemMetaText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
})
