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
} from "react-native"
import type { StackNavigationProp } from "@react-navigation/stack"
import { Clock, CheckCircle, Bookmark, CalendarRange, ArrowLeft } from "lucide-react-native"
import { getTests } from "../api/tests/route"

const { width } = Dimensions.get("window")

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
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Test</Text>
      </View>

      {/* Cards container */}
      <View style={styles.cardsContainer}>
        {tests.map((test) => (
          <TouchableOpacity
            key={test.id}
            style={styles.card}
            onPress={() => {
              navigation.navigate("TestDetail", { testId: test.documentId })  // Passing testId to TestDetailScreen
            }}
          >
            <ImageBackground
              source={{
                uri: test.image && test.image.length > 0
                  ? `http://192.168.100.24:1337${test.image[0].formats.small.url}`
                  : "https://via.placeholder.com/300x200?text=No+Image",
              }}
              style={styles.image}
              imageStyle={{ borderRadius: 20 }}
            >
              <View style={styles.cardTitleContainer}>
                <Text style={styles.cardTitle}>{test.title}</Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 29,
    paddingVertical: 20,
  },
  header: {
    backgroundColor: "white",
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 50,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 2,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
    width: "45%",  // Set each card width to 48% to fit 2 per row
    marginBottom: 30,
    marginRight: "4%",  // Add margin on the right for spacing between cards
    alignItems: "center",
    shadowColor: "#000",
    padding: 0,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
    justifyContent: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
    justifyContent: "flex-end",
    borderRadius: 20,
  },
  cardTitleContainer: {
    padding: 10,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  cardTitle: {
    fontSize: 20,
    color: "white",
    fontWeight: "bold",

  },
  cardsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",  // Allows cards to wrap into multiple rows
    justifyContent: "space-between",
  },
  backButton: {
    position: "absolute",
    top: 10,
    left: 5,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(170, 166, 166, 0.3)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
})
