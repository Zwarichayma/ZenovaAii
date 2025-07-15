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

export const getFitnessPlanById = async (id: number) => {
  try {
    const response = await axiosInstance.get(`/fitness-plans/${id}?populate[sub_categories][populate][exercises]=*`)
    return response.data.data
  } catch (error) {
    console.error("Error fetching fitness plan:", error)
    throw error
  }
}
console.log(API_URL); 
console.log(API_KEY);
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
