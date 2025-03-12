"use client"

import type React from "react"
import { useEffect, useState, useRef } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView, Dimensions } from "react-native"
import type { RouteProp } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"
import { getTestWithQuestions, calculateScore } from "../api/tests/route"

const { width, height } = Dimensions.get("window")
const CARD_WIDTH = width * 0.9
const CARD_PADDING = 24
const CARD_BORDER_RADIUS = 60

type RootStackParamList = {
  TestList: undefined
  TestDetail: { testId: string }
}

type TestDetailScreenRouteProp = RouteProp<RootStackParamList, "TestDetail">
type TestDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, "TestDetail">

type Props = {
  route: TestDetailScreenRouteProp
  navigation: TestDetailScreenNavigationProp
}

interface Response {
  id: number
  documentId: string
  texte: string
  coefficient: number
}

interface Question {
  id: number
  documentId: string
  texte: string
  reponses: Response[]
}

interface Test {
  id: number
  documentId: string
  title: string
  description: string
  questions: Question[]
}

interface Result {
  totalScore: number
  interpretation: string
}

const TestDetailScreen: React.FC<Props> = ({ route }) => {
  const { testId } = route.params
  const [test, setTest] = useState<Test | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [userResponses, setUserResponses] = useState<Record<string, string>>({})
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [cardHeight, setCardHeight] = useState(0)
  const questionCardRef = useRef<View>(null)

  useEffect(() => {
    fetchTestDetails()
  }, [testId])

  const fetchTestDetails = async () => {
    setIsLoading(true)
    setError(null)
    try {
      console.log("Fetching test details for ID:", testId)
      const response = await getTestWithQuestions(testId)
      console.log("API response:", response)
      const testData = response.data.find((test: any) => test.id.toString() === testId)
      if (!testData) {
        throw new Error(`Test with ID ${testId} not found`)
      }
      setTest({
        id: testData.id,
        documentId: testData.documentId,
        title: testData.title,
        description: testData.description,
        questions: testData.questions.map((q: any) => ({
          id: q.id,
          documentId: q.documentId,
          texte: q.texte,
          reponses: q.reponses.map((r: any) => ({
            id: r.id,
            documentId: r.documentId,
            texte: r.texte,
            coefficient: r.coefficient,
          })),
        })),
      })
    } catch (error) {
      console.error("Error fetching test details:", error)
      setError("Failed to load test details. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnswer = (questionId: string, responseId: string) => {
    setUserResponses((prev) => ({ ...prev, [questionId]: responseId }))

    // Move to next question if available
    if (test && currentQuestionIndex < test.questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
      }, 300)
    }
  }

  const formatUserResponses = (userResponses: Record<string, string>) => {
    // The API expects a format where keys are question documentIds and values are response documentIds
    if (!test) return {}

    const formattedResponses: Record<string, string> = {}

    // Convert the numeric IDs to documentIds
    Object.entries(userResponses).forEach(([questionId, responseId]) => {
      // Find the question by its numeric ID
      const question = test.questions.find((q) => q.id.toString() === questionId)
      if (!question) return

      // Find the response by its numeric ID
      const response = question.reponses.find((r) => r.id.toString() === responseId)
      if (!response) return

      // Use documentIds for both question and response
      formattedResponses[question.documentId] = response.documentId
    })

    return formattedResponses
  }

  const handleSubmit = async () => {
    try {
      if (!test) {
        throw new Error("Test data is not available")
      }

      // Format the responses exactly as needed by the API
      const formattedResponses = formatUserResponses(userResponses)

      console.log("Submitting responses:", {
        testTitle: test.title,
        userResponses: formattedResponses,
      })

      const result = await calculateScore(test.title, formattedResponses)
      console.log("Score calculation result:", result)

      setResult({
        totalScore: result.totalScore,
        interpretation: result.interpretation.description,
      })
    } catch (error) {
      console.error("Error calculating score:", error)
      setError("Failed to calculate score. Please try again.")
    }
  }

  // Measure the height of the question card to use for the result card
  const onQuestionCardLayout = () => {
    if (questionCardRef.current && !cardHeight) {
      questionCardRef.current.measure((x, y, width, height) => {
        setCardHeight(height)
      })
    }
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2f4f4f" />
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    )
  }

  if (!test) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No test details found</Text>
      </View>
    )
  }

  const currentQuestion = test.questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === test.questions.length - 1
  const allQuestionsAnswered = Object.keys(userResponses).length === test.questions.length

  return (
    <SafeAreaView style={styles.container}>
      {!result ? (
        <View style={styles.contentContainer}>
          <View style={styles.progressContainer}>
            <View
              style={[styles.progressBar, { width: `${((currentQuestionIndex + 1) / test.questions.length) * 100}%` }]}
            />
          </View>

          <View ref={questionCardRef} style={styles.card} onLayout={onQuestionCardLayout}>
            <Text style={styles.questionText}>{currentQuestion.texte}</Text>

            <View style={styles.responsesContainer}>
              {currentQuestion.reponses.map((response, index) => (
                <TouchableOpacity
                  key={response.id}
                  style={[
                    styles.responseButton,
                    userResponses[currentQuestion.id.toString()] === response.id.toString() && styles.selectedResponse,
                  ]}
                  onPress={() => handleAnswer(currentQuestion.id.toString(), response.id.toString())}
                >
                  <Text
                    style={[
                      styles.responseText,
                      userResponses[currentQuestion.id.toString()] === response.id.toString() &&
                        styles.selectedResponseText,
                    ]}
                  >
                    {response.texte}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {isLastQuestion && allQuestionsAnswered && (
              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>Submit</Text>
              </TouchableOpacity>
            )}

            <View style={styles.pagination}>
              {test.questions.map((_, index) => (
                <View key={index} style={[styles.paginationDot, currentQuestionIndex === index && styles.activeDot]} />
              ))}
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.resultContainer}>
          <View style={[styles.card, styles.resultCard, cardHeight ? { minHeight: cardHeight } : {}]}>
            <Text style={styles.resultTitle}>Your Results</Text>
            <Text style={styles.resultScore}>Score: {result.totalScore}</Text>
            <Text style={styles.interpretationText}>{result.interpretation}</Text>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                setResult(null)
                setUserResponses({})
                setCurrentQuestionIndex(0)
              }}
            >
              <Text style={styles.backButtonText}>Take Another Test</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  progressContainer: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 4,
    marginBottom: 20,
    marginTop: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
  },
  // Common card style for both question and result cards
  card: {
    backgroundColor: "#e9ecef",
    borderRadius: CARD_BORDER_RADIUS,
    padding: CARD_PADDING,
    width: CARD_WIDTH,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  questionText: {
    fontSize: 20,
    fontWeight: "600",
    fontFamily: "fantasy",
    color: "#000",
    marginBottom: 19,
    textAlign: "center",
  },
  responsesContainer: {
    marginBottom: 20,
  },
  responseButton: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 35,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedResponse: {
    backgroundColor: "#000",
  },
  responseText: {
    fontSize: 16,
    color: "#333333",
    flex: 1,
  },
  selectedResponseText: {
    color: "#FFFFFF",
    fontWeight: "500",
  },
  submitButton: {
    backgroundColor: "#000",
    padding: 15,
    borderRadius: 35,
    alignItems: "center",
    marginTop: 2,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#000",
  },
  resultContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  resultCard: {
    alignItems: "center",
    justifyContent: "center",
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
    marginBottom: 24,
    textAlign: "center",
  },
  resultScore: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 16,
    textAlign: "center",
  },
  interpretationText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  backButton: {
    backgroundColor: "#000",
    paddingVertical: 15,
    paddingHorizontal: 26,
    borderRadius: 22,
    width: "70%",
    marginTop: 8,
    alignItems: "center",
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  errorText: {
    color: "#FFFFFF",
    fontSize: 16,
    textAlign: "center",
    backgroundColor: "rgba(255, 0, 0, 0.2)",
    padding: 16,
    borderRadius: 8,
  },
})

export default TestDetailScreen

