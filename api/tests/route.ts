import axios from "axios"

const API_URL = "http://4301-197-26-47-92.ngrok-free.app/api"
const TOKEN =
  "48887ddc9babdd10b4141628ae273f8ca303c6f8f24173d649fe9f02310f876153cb98a4fd21efb57cbcf1d2290a2b70a334377e260aa5120146bfb28366aca01eb23f25b446edded92ebd39a16419064d76bc211132b89d785d7152048942489f737164321b0f79bfefab795a9d5adaca30318fcc3e37d121e76106a484f61a"

export interface ImageFormat {
  name: string
  hash: string
  ext: string
  mime: string
  path: null | string
  width: number
  height: number
  size: number
  sizeInBytes: number
  url: string
}

export interface ImageData {
  id: number
  documentId: string
  name: string
  alternativeText: null | string
  caption: null | string
  width: number
  height: number
  formats: {
    thumbnail: ImageFormat
    small: ImageFormat
  }
  hash: string
  ext: string
  mime: string
  size: number
  url: string
  previewUrl: null | string
  provider: string
  provider_metadata: null | any
  createdAt: string
  updatedAt: string
  publishedAt: string
}

export interface TestAttributes {
  documentId: string
  title: string
  description: Array<{
    type: string
    children: Array<{
      type: string
      text: string
    }>
  }>
  questions: Array<{
    question: string
    options: Array<{ text: string; score: number }>
  }>
  result_interpretation: {
    excellent_sleep: string
    good_sleep: string
    average_sleep: string
    poor_sleep: string
    very_poor_sleep: string
  }
  createdAt: string
  updatedAt: string
  publishedAt: string
  image: ImageData[]
}

export interface Test {
  id: number
  attributes: TestAttributes
}

export interface ApiResponse<T> {
  data: T
  meta: {
    pagination: {
      page: number
      pageSize: number
      pageCount: number
      total: number
    }
  }
}

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    Authorization: `Bearer ${TOKEN}`,
    "Content-Type": "application/json",
  },
})

export const getTests = async (): Promise<Test[]> => {
  try {
    const response = await axiosInstance.get<ApiResponse<Test[]>>("/testes?populate=*")
    console.log("API Response:", JSON.stringify(response.data, null, 2))
    return response.data.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("API Error:", {
        status: error.response?.status,
        data: error.response?.data,
      })
    }
    throw error
  }
}

export const getTestById = async (id: number): Promise<Test | null> => {
  try {
    console.log(`Fetching test with ID: ${id}`)
    const response = await axiosInstance.get<ApiResponse<Test>>(`/testes/${id}?populate=image`)
    console.log(`API Response for test ${id}:`, JSON.stringify(response.data, null, 2))
    return response.data.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        console.log(`Test with ID ${id} not found`)
        return null
      }
      console.error("API Error:", {
        status: error.response?.status,
        data: error.response?.data,
      })
    } else {
      console.error("Unexpected error:", error)
    }
    throw error
  }
}

// Get all questions
export const getQuestions = async () => {
  try {
    const response = await axiosInstance.get("/questions")
    return response.data.data
  } catch (error) {
    console.error("Error fetching questions:", error)
    throw error
  }
}

// Calculate test score
export const calculateScore = async (testTitle: string, userResponses: Record<string, string>) => {
  try {
    const response = await axiosInstance.post("/teste/calculate-score", {
      testTitle,
      userResponses,
    })
    return response.data.data
  } catch (error) {
    console.error("Error calculating score:", error)
    throw error
  }
}

// Get questions by test ID
export const getQuestionsByTestId = async (testId: string) => {
  try {
    console.log(`Fetching questions for test ID: ${testId}`)

    // Get all questions first
    const response = await axiosInstance.get("/questions")
    console.log(`Got ${response.data.data.length} total questions`)

    // Extract the test prefix from the testId (first 5-8 characters usually identify the test)
    const testPrefix = testId.slice(0, 6)
    console.log(`Using test prefix for filtering: ${testPrefix}`)

    // Filter questions that belong to this test based on documentId prefix
    const filteredQuestions = response.data.data.filter((q: any) => {
      const questionId = q.attributes.documentId
      const isMatch = questionId.startsWith(testPrefix)
      if (isMatch) {
        console.log(`Question match found: ${questionId}`)
      }
      return isMatch
    })

    console.log(`Filtered to ${filteredQuestions.length} questions for test ${testId}`)

    // Transform the data to a simpler format
    return filteredQuestions.map((item: any) => ({
      id: item.id,
      documentId: item.attributes.documentId,
      texte: item.attributes.texte,
    }))
  } catch (error) {
    console.error(`Error fetching questions for test ${testId}:`, error)
    throw error
  }
}

// Get all responses
export const getResponses = async () => {
  try {
    console.log("Fetching all responses")
    const response = await axiosInstance.get("/reponses?pagination[limit]=500")
    console.log(`Fetched ${response.data.data.length} responses`)
    console.log("Sample responses:", JSON.stringify(response.data.data.slice(0, 2), null, 2)) // Log first 2 responses

    // Transform the data to a simpler format
    return response.data.data.map((item: any) => ({
      id: item.id,
      documentId: item.attributes.documentId,
      texte: item.attributes.texte,
      coefficient: item.attributes.coefficient,
    }))
  } catch (error) {
    console.error("Error fetching responses:", error)
    throw error
  }
}

export const getTestWithQuestions = async (testId: string) => {
  try {
    const response = await axiosInstance.get(`/testes?populate[questions][populate]=*`)
    return response.data
  } catch (error) {
    console.error("API Error:", error)
    throw error
  }
}