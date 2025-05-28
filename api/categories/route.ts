import axios from "axios"
import { API_URL, API_KEY } from '@env';
console.log(API_URL); 
console.log(API_KEY);
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
  },
})

export const getFitnessPlanById = async (id: number) => {
  try {
    const response = await axiosInstance.get(`/fitness-plans/${id}?populate[sub_categories][populate][exercises]=*`)
    return response.data.data
  } catch (error) {
    console.error("Error fetching fitness plan:", error)
    throw error
  }
}

// Helper function to get image URL
export const getImageUrl = (item: any): string => {
  // Case 1: If item is null or undefined
  if (!item) return ""

  // Case 2: If item has image as a direct object (music items)
  if (item.image && !Array.isArray(item.image) && item.image.formats) {
    const imageData = item.image
    const url =
      imageData.formats?.small?.url ||
      imageData.formats?.medium?.url ||
      imageData.formats?.thumbnail?.url ||
      imageData.url ||
      ""

    if (url && !url.startsWith("http")) {
      return `${API_URL.replace("/api", "")}${url}`
    }
    return url
  }

  // Case 3: If item has image array (fitness plans, mental)
  if (item.image && Array.isArray(item.image) && item.image.length > 0) {
    const imageData = item.image[0]
    if (imageData) {
      const url =
        imageData.formats?.small?.url ||
        imageData.formats?.medium?.url ||
        imageData.formats?.thumbnail?.url ||
        imageData.url ||
        ""

      if (url && !url.startsWith("http")) {
        return `${API_URL.replace("/api", "")}${url}`
      }
      return url
    }
  }

  // Case 4: If item has attributes.image structure (categories)
  if (item.attributes?.image?.data?.attributes) {
    const imageData = item.attributes.image.data.attributes
    const url =
      imageData.formats?.small?.url ||
      imageData.formats?.medium?.url ||
      imageData.formats?.thumbnail?.url ||
      imageData.url ||
      ""

    if (url && !url.startsWith("http")) {
      return `${API_URL.replace("/api", "")}${url}`
    }
    return url
  }

  return ""
}
