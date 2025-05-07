import axios from "axios"
const API_URL = "http://192.168.1.110:1337/api";
const API_KEY = "f441809cb88567ac4e4b13bce7ca649f71163eb0d3f66b1c6b4489f6f02262983343eb079ece4f249222304aff0f5a8cdb3b465376e35c5404a419999c654806ae1accced63bccec4706719fe4e5800d8da56feca0b7aaf76f7579baa83cb6be07b51f31ece47d295ab138db41dd99ff71f5849eb28b1e91154f4c3644102225";

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
