import axios from "axios"
const API_URL = "http://192.168.1.7:1337/api"
const API_KEY =
  "6578e396c2ba2edb826af0353b08f55cb03bf56dc12a05ebc42dd7aedc6f190134882aa6d3f76174ff8303499414eb21b321b1807b26b0950b00f39c0d45079a3b9f7df6bc6a1d7532bf5511ff899cc94e5e77c23065eba46458acdc418e7fd50ef5c9021fa051a1d65de430fcec4e27ff527f8515115e4e1b649ecc41c4a54f"

console.log(API_URL); 
console.log(API_KEY);

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
  },
})

// Fonction pour construire l'URL complète de l'image
const buildFullImageUrl = (relativeUrl: string | undefined): string => {
  if (!relativeUrl) return ""

  // Si l'URL est déjà complète, la retourner telle quelle
  if (relativeUrl.startsWith("http")) return relativeUrl

  // Extraire la base URL sans le chemin /api
  let baseUrl = API_URL || ""
  if (baseUrl.endsWith("/api")) {
    baseUrl = baseUrl.substring(0, baseUrl.length - 4) // Enlever "/api"
  } else if (baseUrl.includes("/api/")) {
    baseUrl = baseUrl.split("/api/")[0] // Prendre la partie avant "/api/"
  }
console.log(API_URL); 
console.log(API_KEY);
  // S'assurer que l'URL relative commence par un slash
  const formattedRelativeUrl = relativeUrl.startsWith("/") ? relativeUrl : `/${relativeUrl}`

  return `${baseUrl}${formattedRelativeUrl}`
}

// 🍽️ Fonction pour récupérer les régimes personnalisés avec images
export const getPersonalizedDiets = async () => {
  try {

    const response = await axiosInstance.get("/personalized-diets?populate=image")

    // Vérifier si la réponse contient des données
    if (!response.data || !response.data.data || !Array.isArray(response.data.data)) {
      console.error("Format de réponse inattendu:", response.data)
      return []
    }

    // 🔧 Traitement des URLs d'image
    const diets = response.data.data.map((item: any) => {
      // Extraire l'URL de l'image depuis la structure de données
      const imageData = item.attributes?.image?.data?.attributes
      let imageUrl = ""

      if (imageData) {
        // Essayer différentes options de format
        if (imageData.formats?.small?.url) {
          imageUrl = imageData.formats.small.url
        } else if (imageData.formats?.medium?.url) {
          imageUrl = imageData.formats.medium.url
        } else if (imageData.formats?.thumbnail?.url) {
          imageUrl = imageData.formats.thumbnail.url
        } else if (imageData.url) {
          imageUrl = imageData.url
        }
      }

      // Construire l'URL complète
      const fullImageUrl = buildFullImageUrl(imageUrl)

      return {
        ...item,
        fullImageUrl,
        // Ajouter ces propriétés pour faciliter l'accès dans le composant
        imageUrl: fullImageUrl,
        title: item.attributes?.title || "Sans titre",
      }
    })

    return diets
  } catch (error) {
    console.error("Erreur lors de la récupération des régimes personnalisés:", error)
    if (axios.isAxiosError(error)) {
      console.error("Détails de l'erreur Axios:", error.response?.data)
      console.error("Status de l'erreur Axios:", error.response?.status)
    }
    throw error
  }
}
