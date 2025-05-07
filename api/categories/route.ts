import axios from "axios";

const API_URL = "http://192.168.1.110:1337/api/categories?populate=image";
const API_KEY = "90e0b995cd84179026cb851de953de05e32a7ad3bb579c26c930057a384892a4fd89aee4f53da73ca3a88fd4c9084360df104e7761d491701fe4214471722b7d17d15d3d55f2d6e7ff6549d9de3d02f13476ae8dbd70315d6df445ec6f536d5949781519d0187235f1ea2826b82a66e1625b2cf96ac7ee0d677a00c0db198a9a";


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
      return `http://192.168.1.110:1337${url}`
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
        return `http://192.168.1.110:1337${url}`
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
      return `http://192.168.1.110:1337${url}`
    }
    return url
  }

  return ""
}
