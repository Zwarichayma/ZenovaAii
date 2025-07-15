import axios from "axios"
const API_URL = "http://172.20.10.13:1337/api"
const API_KEY =
  "6e3e7d4353b4e4ad2db82c3a91145ae7b9245c7eb5318dcf77db9a9267f621066c24d9cfea255f458117486715465f7aff103744afa4ce13f128dfed55220257b949a558e83f963f14c68991ec3389ad8fbf34a23da5911d2b23a02820bdd6033f5fae80a90916ee82ca7e839e9a4ff74fceb51bfc1c5b5afa2a7e2d948aeaed"

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
