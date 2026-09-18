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
