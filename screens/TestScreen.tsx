"use client"

import { useEffect, useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ImageBackground,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Platform,
} from "react-native"
import type { StackNavigationProp } from "@react-navigation/stack"
import { ArrowLeft } from "lucide-react-native"
import { getTests } from "../api/tests/route"
import { LinearGradient } from "expo-linear-gradient"
import { API_BASE_URL } from "@env"

const { width } = Dimensions.get("window")
const CARD_WIDTH = width * 0.44
const CARD_HEIGHT = 220

type RootStackParamList = {
  Test: { category?: string; testIds?: number[] }
  TestDetail: { testId: string }
}

type TestScreenNavigationProp = StackNavigationProp<RootStackParamList, "Test">

interface TestScreenProps {
  navigation: TestScreenNavigationProp
  route: any
}

type Test = {
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
}

export default function TestScreen({ navigation, route }: TestScreenProps) {
  const [tests, setTests] = useState<Test[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const testIds = route.params?.testIds || []

  useEffect(() => {
    fetchTests()
  }, [])

  const fetchTests = async () => {
    setIsLoading(true)
    try {
      const allTests = await getTests()
      const filteredTests =
        testIds.length > 0 ? allTests.filter((test: Test) => testIds.includes(test.documentId)) : allTests
      setTests(filteredTests)
    } catch (error) {
      console.error("Erreur lors de la récupération des tests:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.loadingText}>Loading tests...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={22} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Tests</Text>
        <View style={styles.headerRight} />
      </View>

      <Text style={styles.subtitle}></Text>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.cardsContainer}>
          {tests.map((test) => (
            <View key={test.id} style={styles.cardWrapper}>
              <TouchableOpacity
                style={styles.card}
                activeOpacity={0.9}
                onPress={() => {
                  navigation.navigate("TestDetail", { testId: test.id.toString() })
                }}
              >
                <ImageBackground
                  source={{
                    uri:
                      test.image && test.image.length > 0
                        ?`${API_BASE_URL}${test.image[0].formats.small.url}`
                        : "https://via.placeholder.com/300x200?text=No+Image",
                  }}
                  style={styles.image}
                  imageStyle={{ borderRadius: 16 }}
                >
                  <LinearGradient
                    colors={["transparent", "rgba(0, 0, 0, 0.14)", "rgba(0, 0, 0, 0.32)"]}
                    style={styles.gradient}
                  >
                    <View style={styles.cardTitleContainer}>
                      <Text style={styles.cardTitle} numberOfLines={2}>
                        {test.title}
                      </Text>
                    </View>
                  </LinearGradient>
                </ImageBackground>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingBottom: 15,
    paddingHorizontal: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "rgb(255, 255, 255)",
  },
  headerRight: {
    width: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#000",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 20,
    paddingHorizontal: 30,
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
    color: "#666",
  },
  cardsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  cardWrapper: {
    width: CARD_WIDTH,
    marginBottom: 16,
  },
  card: {
    borderRadius: 40,
    overflow: "hidden",
    backgroundColor: "#f5f5f5",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  image: {
    width: "100%",
    height: CARD_HEIGHT,
    justifyContent: "flex-end",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "60%",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    justifyContent: "flex-end",
  },
  cardTitleContainer: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 17,
    color: "white",
    fontWeight: "700",
    marginBottom: 4,
    textShadowColor: "rgba(245, 240, 240, 0)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
})

