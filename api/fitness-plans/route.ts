import axios from "axios"

// Create an axios instance for the fitness API
const fitnessApi = axios.create({
  baseURL: "http://192.168.100.35:1337",
  headers: {
    "Content-Type": "application/json",
  },
})

// Interface for the image format
interface ImageFormat {
  name: string
  hash: string
  ext: string
  mime: string
  path: string | null
  width: number
  height: number
  size: number
  sizeInBytes: number
  url: string
}

// Interface for the image object
interface ImageObject {
  id: number
  documentId: string
  name: string
  alternativeText: string | null
  caption: string | null
  width: number
  height: number
  formats: {
    thumbnail: ImageFormat
    small: ImageFormat
    medium: ImageFormat
    large: ImageFormat
  }
  hash: string
  ext: string
  mime: string
  size: number
  url: string
  previewUrl: string | null
  provider: string
  provider_metadata: any | null
  createdAt: string
  updatedAt: string
  publishedAt: string
}

// Interface for the description item
interface DescriptionItem {
  type: string
  children: {
    type: string
    text: string
  }[]
}

// Interface for the fitness plan
export interface FitnessPlan {
  id: number
  documentId: string
  title: string
  description: DescriptionItem[]
  type: string
  duration: number
  calories_burned: number
  createdAt: string
  updatedAt: string
  publishedAt: string
  image: ImageObject[]
}

// Interface for the API response
interface FitnessPlansResponse {
  data: FitnessPlan[]
}

// Function to get all fitness plans
export const getFitnessPlans = async (): Promise<FitnessPlan[]> => {
  try {
    const response = await fitnessApi.get<FitnessPlansResponse>("/api/fitness-plans?populate=image")
    return response.data.data
  } catch (error) {
    console.error("Error fetching fitness plans:", error)
    throw error
  }
}

// Function to get a fitness plan by type
export const getFitnessPlanByType = async (type: string): Promise<FitnessPlan[]> => {
  try {
    const response = await fitnessApi.get<FitnessPlansResponse>(
      `/api/fitness-plans?filters[type][$eq]=${type}&populate=image`,
    )
    return response.data.data
  } catch (error) {
    console.error(`Error fetching fitness plan for type ${type}:`, error)
    throw error
  }
}

// Helper function to get the full image URL
export const getImageUrl = (imageUrl: string): string => {
  if (!imageUrl) return ""
  // If the URL already starts with http, return it as is
  if (imageUrl.startsWith("http")) return imageUrl
  // Otherwise, prepend the base URL
  return `http://192.168.100.35:1337${imageUrl}`
}

// Helper function to extract plain text from description
export const getPlainTextDescription = (description: DescriptionItem[]): string => {
  if (!description || !description.length) return ""

  return description.map((item) => item.children.map((child) => child.text).join("")).join("\n")
}
