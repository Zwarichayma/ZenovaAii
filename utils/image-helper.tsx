import { API_URL } from "@env"

// Helper function to get the full image URL from Strapi
export const getFullImageUrl = (imageData: any): string => {
  if (!imageData || !imageData.data || !imageData.data.attributes) {
    return "https://via.placeholder.com/400"
  }

  const baseUrl = API_URL.replace("/api", "")
  const imageUrl = imageData.data.attributes.url
  return `${baseUrl}${imageUrl}`
}

// Helper function to get the image for a music track
export const getImageForMusic = (track: any) => {
  if (track && track.image && track.image.data) {
    return { uri: getFullImageUrl(track.image) }
  }
  // Return a placeholder image when no image is available
  return { uri: "https://via.placeholder.com/400" }
}
