import axios from "axios"
const API_URL = "http://192.168.100.35:1337/api";
const API_KEY = "e1e0b59bcb4c7f2f580793abe51110955231099e159ae3a0357de8f79bafc713303fe2db04d84a826e113a2e0a123c47dd28987b625e4ec584e29b37d484a1530d6189121e6494904455999038d0dc3b7cb8f5dd480f7b58f4b354b326edd1c55c49e9ff63c0ee9d1c1f6943d193aabc7689eaf2f0a447fe9165f7118d6b4cf4";

// ⚠️ Créer un axiosInstance avec baseURL propre
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
