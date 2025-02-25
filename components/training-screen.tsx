"use client"

import { useRef, useState } from "react"
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Animated,
  ScrollView,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from "react-native"
import { ChevronRight, Flame, Activity, Clock } from "lucide-react-native"

// Add these imports at the top of the file
import { useNavigation } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"

const { width, height } = Dimensions.get("window")

// Add this type definition after the imports
type RootStackParamList = {
  Fitness: { category: string }
}

type NavigationProp = StackNavigationProp<RootStackParamList, "Fitness">

export default function TrainingScreen() {
  const scrollY = useRef(new Animated.Value(0)).current
  const [isSearchBarVisible, setIsSearchBarVisible] = useState(true)
  const searchBarHeight = 50 // Ajustez cette valeur en fonction de la hauteur réelle de votre barre de recherche
  const searchBarTranslateY = scrollY.interpolate({
    inputRange: [0, searchBarHeight],
    outputRange: [0, -searchBarHeight],
    extrapolate: "clamp",
  })

  const handleScroll = Animated.event<NativeScrollEvent>([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
    useNativeDriver: true,
    listener: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const currentOffset = event.nativeEvent.contentOffset.y
    },
  })

  // Modify the renderCard function inside the TrainingScreen component
  const navigation = useNavigation<NavigationProp>()

  const renderCard = (imageSource: any, text: string) => (
    <View>
      <TouchableOpacity style={styles.card1} onPress={() => navigation.navigate("Fitness", { category: text })}>
        <Image source={imageSource} style={styles.cardImage1} />
      </TouchableOpacity>
      <View style={styles.categoryOverlay}>
        <Text style={styles.ratingText}>{text}</Text>
      </View>
    </View>
  )

  const workoutPlans = [
    { id: 1, title: "Chest & Triceps", variant: "B Variant", image: require("../assets/images/cardio.jpg") },
    { id: 2, title: "Back & Biceps", variant: "B Variant", image: require("../assets/images/runn.jpg") },
  ]

  const categories = [
    {
      id: 1,
      title: "Cardio",
      rating: 4.5,
      description: "High intensity training",
      image: require("../assets/images/cardio.jpg"),
    },
    { id: 2, title: "Strength", rating: 4.7, description: "Build muscle", image: require("../assets/images/runn.jpg") },
    {
      id: 3,
      title: "Yoga",
      rating: 4.6,
      description: "Flexibility and balance",
      image: require("../assets/images/yooga.jpg"),
    },
    {
      id: 4,
      title: "Pilates",
      rating: 4.5,
      description: "Core strength",
      image: require("../assets/images/pilate.jpg"),
    },
  ]

  const renderWorkoutPlanCard = (plan: any) => (
    <TouchableOpacity style={styles.planCard} key={plan.id}>
      <Image source={plan.image} style={styles.planImage} />
      <View style={styles.planOverlay}>
        <Text style={styles.variantText}>{plan.variant}</Text>
        <View style={styles.planTitleContainer}>
          <Text style={styles.planTitle}>{plan.title}</Text>
          <ChevronRight size={20} color="#fff" />
        </View>
      </View>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={require("../assets/images/33.png")} style={styles.headerLogo} resizeMode="contain" />
      </View>

      <TextInput style={styles.searchBar} placeholder="Search Your Plan" />
      <Animated.ScrollView contentContainerStyle={styles.content} onScroll={handleScroll} scrollEventThrottle={16}>
        <View style={styles.statsContainer}>
          <View style={styles.statsCard}>
            <Flame size={24} color="#FF4B4B" />
            <Text style={styles.statsValue}>2503</Text>
            <Text style={styles.statsTitle}>Cal</Text>
          </View>
          <View style={styles.statsCard}>
            <Clock size={24} color="#4CAF50" />
            <Text style={styles.statsValue}>24h</Text>
            <Text style={styles.statsTitle}>34m</Text>
          </View>
          <View style={styles.statsCard}>
            <Activity size={24} color="#2196F3" />
            <Text style={styles.statsValue}>1450</Text>
            <Text style={styles.statsTitle}>Kg</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Animated.View style={{ flexDirection: "row" }}>
              {[
                { image: require("../assets/images/Fitbox.jpg"), text: "Fit Box" },
                { image: require("../assets/images/cardio.jpg"), text: "Cardio" },
                { image: require("../assets/images/tunif.jpg"), text: " Warrior" },
                { image: require("../assets/images/runn.jpg"), text: "Running" },
                { image: require("../assets/images/runn.jpg"), text: "Fitness" }, // Add this line
              ].map((item, index) => (
                <View key={index}>{renderCard(item.image, item.text)}</View>
              ))}
            </Animated.View>
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recommondation</Text>
            <TouchableOpacity>
              <Text style={styles.seeDetails}>See Details</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.plansContainer}>{workoutPlans.map(renderWorkoutPlanCard)}</View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>For you</Text>
            <TouchableOpacity>
              <Text style={styles.seeDetails}>See Details</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.plansContainer}>{categories.map(renderWorkoutPlanCard)}</View>
        </View>
      </Animated.ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // Prend toute la hauteur disponible
    backgroundColor: "#FFFFFF", // Fond blanc pour la lisibilité
    paddingHorizontal: 0, // Espacement horizontal standard
    paddingVertical: 10, // Espacement vertical
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
  headerLogo: {
    width: width * 0.13,
    height: height * 0.031,
    resizeMode: "contain",
  },

  searchBar: {
    marginTop: height * 0.05,
    marginHorizontal: width * 0.05,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    fontSize: 15,
  },
  content: {
    flexGrow: 1,
    padding: width * 0.05,
    paddingTop: 40, // Ajustez cette valeur pour tenir compte de la hauteur du logo et de la barre de recherche
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statsCard: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    alignItems: "center",
    padding: 20,
    marginHorizontal: 10,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  statsValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  section: {
    marginBottom: height * 0.04,
  },
  sectionTitle: {
    fontSize: height * 0.019,
    fontWeight: "500",
    marginBottom: height * 0.01,
  },
  card1: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    width: width * 0.4,
    marginRight: width * 0.04,
    alignItems: "center",
  },
  ratingText: {
    fontSize: 25,
    color: "#fff",
    textTransform: "uppercase",
    fontWeight: "bold",
  },
  cardImage1: {
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
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  seeDetails: {
    color: "#666",
    fontSize: 14,
  },
  plansContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12,
  },
  planCard: {
    width: (width - (width * 0.1 + 12)) / 2,
    height: (width - (width * 0.1 + 12)) / 2,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
  },
  planImage: {
    width: "100%",
    height: "100%",
  },
  planOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  variantText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    marginBottom: 4,
  },
  planTitleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  planTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
})

