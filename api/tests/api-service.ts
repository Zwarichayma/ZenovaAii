// API base URL
const API_BASE_URL = "http://192.168.100.15:1337/api"
const TOKEN = "f441809cb88567ac4e4b13bce7ca649f71163eb0d3f66b1c6b4489f6f02262983343eb079ece4f249222304aff0f5a8cdb3b465376e35c5404a419999c654806ae1accced63bccec4706719fe4e5800d8da56feca0b7aaf76f7579baa83cb6be07b51f31ece47d295ab138db41dd99ff71f5849eb28b1e91154f4c3644102225"

// Types for API responses
export type QuoteType = {
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
      thumbnail?: { url: string }
      medium?: { url: string }
      small?: { url: string }
    }
    url: string
  }[]
}

export type MusicType = {
  id: number
  documentId: string
  title: string
  description: string | null
  category: string
  createdAt: string
  updatedAt: string
  publishedAt: string
  audio: {
    id: number
    name: string
    url: string
  }[]
  image: {
    id: number
    name: string
    formats: {
      thumbnail?: { url: string }
      medium?: { url: string }
      small?: { url: string }
    }
    url: string
  }[]
}

export type TestType = {
  id: number
  attributes: {
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
    createdAt: string
    updatedAt: string
    publishedAt: string
    image: any[]
  }
}

// Helper function to get image URL
export const getImageUrl = (item: any): string => {
  if (!item || !item.image || !Array.isArray(item.image) || item.image.length === 0) {
    return ""
  }

  const imageData = item.image[0]
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
    imageUrl = API_BASE_URL.replace("/api", "") + imageUrl
  }

  return imageUrl
}

// Get audio URL
export const getAudioUrl = (music: MusicType): string => {
  if (!music || !music.audio || !Array.isArray(music.audio) || music.audio.length === 0) {
    return ""
  }

  let audioUrl = music.audio[0].url

  // Add base URL if not already included
  if (audioUrl && !audioUrl.startsWith("http")) {
    audioUrl = API_BASE_URL.replace("/api", "") + audioUrl
  }

  return audioUrl
}

// Create axios instance with authorization header
const createHeaders = () => {
  return {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    }
  }
}

// Fetch quotes from API
export const fetchQuotes = async (): Promise<QuoteType[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/quotes?populate=image`, createHeaders())

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()

    if (data && data.data && Array.isArray(data.data)) {
      return data.data
    } else {
      throw new Error("Invalid data format received from API")
    }
  } catch (err) {
    console.error("Error fetching quotes:", err)
    return [] // Return empty array instead of throwing
  }
}

// Fetch music from API
export const fetchMusic = async (): Promise<MusicType[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/musics?populate=*`, createHeaders())

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()

    if (data && data.data && Array.isArray(data.data)) {
      return data.data
    } else {
      throw new Error("Invalid data format received from API")
    }
  } catch (err) {
    console.error("Error fetching music:", err)
    return [] // Return empty array instead of throwing
  }
}

// Fetch tests from API
export const fetchTests = async (): Promise<TestType[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/testes?populate=*`, createHeaders())

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()

    if (data && data.data && Array.isArray(data.data)) {
      return data.data
    } else {
      throw new Error("Invalid data format received from API")
    }
  } catch (err) {
    console.error("Error fetching tests:", err)
    return [] // Return empty array instead of throwing
  }
}

// Get test by ID
export const getTestById = async (id: number): Promise<TestType | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/testes/${id}?populate=*`, createHeaders())

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()

    if (data && data.data) {
      return data.data
    } else {
      throw new Error("Invalid data format received from API")
    }
  } catch (err) {
    console.error(`Error fetching test with ID ${id}:`, err)
    return null
  }
}

// Get questions by test ID
export const getQuestionsByTestId = async (testId: string) => {
  try {
    // Get all questions first
    const response = await fetch(`${API_BASE_URL}/questions`, createHeaders())
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (!data || !data.data || !Array.isArray(data.data)) {
      throw new Error("Invalid data format received from API")
    }
    
    // Extract the test prefix from the testId (first 5-8 characters usually identify the test)
    const testPrefix = testId.slice(0, 6)
    
    // Filter questions that belong to this test based on documentId prefix
    return data.data.filter((q: any) => {
      const questionId = q.attributes.documentId
      return questionId.startsWith(testPrefix)
    }).map((item: any) => ({
      id: item.id,
      documentId: item.attributes.documentId,
      text: item.attributes.texte,
      options: item.attributes.options || []
    }))
  } catch (err) {
    console.error(`Error fetching questions for test ${testId}:`, err)
    return []
  }
}

// Calculate test score
export const calculateTestScore = async (testId: string, answers: Record<string, number>) => {
  try {
    const response = await fetch(`${API_BASE_URL}/teste/calculate-score`, {
      method: 'POST',
      ...createHeaders(),
      body: JSON.stringify({
        testId,
        answers
      })
    })
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }
    
    return await response.json()
  } catch (err) {
    console.error("Error calculating test score:", err)
    // Return a default score object
    return {
      score: 0,
      interpretation: "Could not calculate score. Please try again."
    }
  }
}
