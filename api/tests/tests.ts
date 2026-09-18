import axios from "axios"
const API_URL = "http://192.168.1.7:1337/api"
const API_KEY =
  "6578e396c2ba2edb826af0353b08f55cb03bf56dc12a05ebc42dd7aedc6f190134882aa6d3f76174ff8303499414eb21b321b1807b26b0950b00f39c0d45079a3b9f7df6bc6a1d7532bf5511ff899cc94e5e77c23065eba46458acdc418e7fd50ef5c9021fa051a1d65de430fcec4e27ff527f8515115e4e1b649ecc41c4a54f"

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
  },
})
console.log(API_URL); 
console.log(API_KEY);
export interface Question {
  id: number
  documentId: string
  texte: string
  point: number | null
  createdAt: string
  updatedAt: string
  publishedAt: string
  title: string
}

export interface Response {
  id: number
  documentId: string
  texte: string
  coefficient: number
  createdAt: string
  updatedAt: string
  publishedAt: string
}

export interface TestResult {
  resultId: number
  testTitle: string
  totalScore: number
  maxPossibleScore: number
  interpretation: {
    niveau: string
    description: string
  }
}

export const getQuestions = async (): Promise<Question[]> => {
  try {
    const response = await axiosInstance.get("/questions")
    return response.data.data
  } catch (error) {
    console.error("Error fetching questions:", error)
    throw error
  }
}

export const getResponses = async (): Promise<Response[]> => {
  try {
    const response = await axiosInstance.get("/reponses")
    return response.data.data
  } catch (error) {
    console.error("Error fetching responses:", error)
    throw error
  }
}

export const calculateScore = async (testTitle: string, userResponses: Record<string, string>): Promise<TestResult> => {
  try {
    console.log("Sending score calculation request:", {
      testTitle,
      userResponses,
    })

    const response = await axiosInstance.post("/teste/calculate-score", {
      testTitle,
      userResponses,
    })

    console.log("Score calculation response:", response.data)

    if (!response.data.success) {
      throw new Error("Score calculation failed")
    }

    return {
      resultId: response.data.data.resultId,
      testTitle: response.data.data.testTitle,
      totalScore: response.data.data.totalScore,
      maxPossibleScore: response.data.data.maxPossibleScore,
      interpretation: {
        niveau: response.data.data.interpretation.niveau,
        description: response.data.data.interpretation.description,
      },
    }
  } catch (error) {
    console.error("Error calculating score:", error)
    throw error
  }
}

export const getTestWithQuestions = async (id: string) => {
  try {
    const response = await axiosInstance.get(`/testes/${id}?populate[questions][populate]=*`)
    return response.data
  } catch (error) {
    console.error("Error fetching test with questions:", error)
    throw error
  }
}

export const getTestById = async (id: number) => {
  try {
    const response = await axiosInstance.get(`/testes/${id}?populate=*`)
    return response.data.data
  } catch (error) {
    console.error("Error fetching test:", error)
    throw error
  }
}

// Update the handleSubmit function in TestDetailScreen to format responses correctly
export const formatUserResponses = (responses: Record<string, string>) => {
  // Convert the responses to the exact format needed by the API
  const formattedResponses: Record<string, string> = {}
  Object.entries(responses).forEach(([questionId, responseId]) => {
    formattedResponses[questionId] = responseId
  })
  return formattedResponses
}

