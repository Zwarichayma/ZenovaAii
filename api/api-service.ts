import axios from "axios"
import { API_URL, API_KEY } from "@env"
import AsyncStorage from "@react-native-async-storage/async-storage"

// Create a singleton axios instance for reuse
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
  },
})

// Cache configuration
const CACHE_DURATION = 15 * 60 * 1000 // 15 minutes in milliseconds
const CACHE_PREFIX = "api_cache_"

// Cache helper functions
const getCacheKey = (endpoint: string) => `${CACHE_PREFIX}${endpoint}`

const getFromCache = async (endpoint: string) => {
  try {
    const cacheKey = getCacheKey(endpoint)
    const cachedData = await AsyncStorage.getItem(cacheKey)

    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData)
      const isExpired = Date.now() - timestamp > CACHE_DURATION

      if (!isExpired) {
        console.log(`✅ Using cached data for: ${endpoint}`)
        return data
      }
      console.log(`⏰ Cache expired for: ${endpoint}`)
    }
    return null
  } catch (error) {
    console.warn("Cache read error:", error)
    return null
  }
}

const saveToCache = async (endpoint: string, data: any) => {
  try {
    const cacheKey = getCacheKey(endpoint)
    const cacheData = {
      data,
      timestamp: Date.now(),
    }
    await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData))
    console.log(`💾 Saved to cache: ${endpoint}`)
  } catch (error) {
    console.warn("Cache write error:", error)
  }
}

// Generic fetch function with caching
const fetchWithCache = async (endpoint: string, forceRefresh = false) => {
  if (!forceRefresh) {
    const cachedData = await getFromCache(endpoint)
    if (cachedData) return cachedData
  }

  console.log(`🔄 Fetching from API: ${endpoint}`)
  try {
    const response = await apiClient.get(endpoint)
    const data = response.data.data || []
    await saveToCache(endpoint, data)
    return data
  } catch (error) {
    console.error(`❌ API Error (${endpoint}):`, error)
    if (axios.isAxiosError(error)) {
      console.error("Status:", error.response?.status)
      console.error("Data:", error.response?.data)
    }
    throw error
  }
}

// API functions with caching
export const getCategories = async (forceRefresh = false) => {
  return fetchWithCache("/categories?populate=*", forceRefresh)
}

export const getRecipes = async (categoryDocumentId?: string, forceRefresh = false) => {
  let endpoint = "/recipes?populate=*"

  if (categoryDocumentId) {
    endpoint += `&filters[categories][documentId][$eq]=${encodeURIComponent(categoryDocumentId)}`
  }

  return fetchWithCache(endpoint, forceRefresh)
}

export const getRecipe = async (documentId: string, forceRefresh = false) => {
  return fetchWithCache(`/recipes/${documentId}?populate=image`, forceRefresh)
}

export const getPersonalizedDiets = async (forceRefresh = false) => {
  return fetchWithCache("/personalized-diets?populate=image", forceRefresh)
}

export const getFitnessPlans = async (forceRefresh = false) => {
  return fetchWithCache("/fitness-plans?populate=image", forceRefresh)
}

export const getMental = async (forceRefresh = false) => {
  return fetchWithCache("/mentals?populate=image", forceRefresh)
}

export const getMusic = async (forceRefresh = false) => {
  return fetchWithCache("/musics?populate=*", forceRefresh)
}

// Helper function to get image URL
export const getImageUrl = (item: any): string => {
  try {
    if (!item) return ""

    // Case 1: Category or PersonalizedDiet with attributes structure
    if ("attributes" in item) {
      const imageData = item.attributes?.image?.data?.attributes

      if (imageData) {
        // Try different format options
        if (imageData.formats?.small?.url) {
          return buildFullImageUrl(imageData.formats.small.url)
        } else if (imageData.formats?.medium?.url) {
          return buildFullImageUrl(imageData.formats.medium.url)
        } else if (imageData.formats?.thumbnail?.url) {
          return buildFullImageUrl(imageData.formats.thumbnail.url)
        } else if (imageData.url) {
          return buildFullImageUrl(imageData.url)
        }
      }
    }
    // Case 2: FitnessPlan or Mental with image array
    else if ("image" in item && Array.isArray(item.image) && item.image.length > 0) {
      const imageItem = item.image[0]

      if (imageItem) {
        if (imageItem.formats?.small?.url) {
          return buildFullImageUrl(imageItem.formats.small.url)
        } else if (imageItem.formats?.medium?.url) {
          return buildFullImageUrl(imageItem.formats.medium.url)
        } else if (imageItem.formats?.thumbnail?.url) {
          return buildFullImageUrl(imageItem.formats.thumbnail.url)
        } else if (imageItem.url) {
          return buildFullImageUrl(imageItem.url)
        }
      }
    }

    return ""
  } catch (error) {
    console.warn("Error getting image URL:", error)
    return ""
  }
}

// Helper function to build full image URL
const buildFullImageUrl = (relativeUrl: string): string => {
  if (!relativeUrl) return ""

  // If the URL is already complete, return it as is
  if (relativeUrl.startsWith("http")) return relativeUrl

  // Extract the base URL without the path /api
  let baseUrl = API_URL || ""
  if (baseUrl.endsWith("/api")) {
    baseUrl = baseUrl.substring(0, baseUrl.length - 4) // Remove "/api"
  } else if (baseUrl.includes("/api/")) {
    baseUrl = baseUrl.split("/api/")[0] // Take the part before "/api/"
  }

  // Make sure the URL relative starts with a slash
  const formattedRelativeUrl = relativeUrl.startsWith("/") ? relativeUrl : `/${relativeUrl}`

  return `${baseUrl}${formattedRelativeUrl}`
}

// Function to clear all API cache
export const clearApiCache = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys()
    const cacheKeys = keys.filter((key) => key.startsWith(CACHE_PREFIX))
    if (cacheKeys.length > 0) {
      await AsyncStorage.multiRemove(cacheKeys)
      console.log(`🧹 Cleared ${cacheKeys.length} API cache items`)
    }
    return true
  } catch (error) {
    console.error("Error clearing API cache:", error)
    return false
  }
}
