import axios from "axios"
const API_URL = "http://172.20.10.13:1337/api"
const API_KEY =
  "6e3e7d4353b4e4ad2db82c3a91145ae7b9245c7eb5318dcf77db9a9267f621066c24d9cfea255f458117486715465f7aff103744afa4ce13f128dfed55220257b949a558e83f963f14c68991ec3389ad8fbf34a23da5911d2b23a02820bdd6033f5fae80a90916ee82ca7e839e9a4ff74fceb51bfc1c5b5afa2a7e2d948aeaed"

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

