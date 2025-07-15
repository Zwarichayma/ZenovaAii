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

// ✅ INTERFACES CORRIGÉES
export interface ImageFormat {
  url: string
  width: number
  height: number
}

// ✅ INTERFACE CORRIGÉE selon la vraie structure des données
export interface Music {
  id: number
  documentId: string
  title: string
  artist?: string
  category?: string
  duration?: string
  description?: string
  // ✅ CORRECTION: Les vrais noms des champs
  url_youtube?: string
  url_spotify?: string
  createdAt: string
  updatedAt: string
  publishedAt: string
  // ✅ CORRECTION: Image directement accessible, pas dans attributes
  image?: {
    id: number
    documentId: string
    url: string
    alternativeText?: string
    caption?: string
    width: number
    height: number
    formats: {
      thumbnail: ImageFormat
      small: ImageFormat
      medium?: ImageFormat
      large?: ImageFormat
    }
    hash: string
    ext: string
    mime: string
    name: string
    size: number
  }
}

export interface Quote {
  id: number
  text?: string
  author?: string
  category?: string
  createdAt: string
  updatedAt: string
  publishedAt: string
  image?: any
}

export interface Test {
  id: number
  title?: string
  description?: string
  duration?: string
  category?: string
  createdAt: string
  updatedAt: string
  publishedAt: string
  image?: any
}

// ✅ FONCTION CORRIGÉE: Récupérer toutes les musiques avec logs détaillés
export const getMusic = async (): Promise<any[]> => {
  try {
    console.log("🎵 === FETCHING MUSIC FROM API ===")
    console.log("🎵 API_KEY:", API_KEY ? "✅ Present" : "❌ Missing")

    const response = await axiosInstance.get("/musics?populate=*")

    console.log("🎵 API Response Status:", response.status)

    // ✅ CORRECTION: Récupérer les données directement
    const musicData = response.data.data || []
    console.log("🎵 Number of music items:", musicData.length)

    // ✅ CORRECTION: Retourner les données brutes
    return musicData
  } catch (error) {
    console.error("❌ ERREUR lors de la récupération de la musique:")
    if (axios.isAxiosError(error)) {
      console.error("❌ Status:", error.response?.status)
      console.error("❌ Data:", error.response?.data)
      console.error("❌ Headers:", error.response?.headers)
    } else {
      console.error("❌ Error:", error)
    }
    return []
  }
}

// ✅ NOUVELLE FONCTION: Récupérer une musique par ID
export const getMusicById = async (id: number): Promise<any | null> => {
  try {
    console.log("🎵 === FETCHING MUSIC BY ID ===")
    console.log("🎵 Requested ID:", id)

    const response = await axiosInstance.get(`/musics/${id}?populate=*`)

    console.log("🎵 Music by ID Response Status:", response.status)

    // ✅ CORRECTION: Récupérer les données directement
    const musicItem = response.data.data
    if (musicItem) {
      console.log("🎵 Found music by ID:", musicItem.id)
    } else {
      console.log("❌ No music found with ID:", id)
    }

    return musicItem || null
  } catch (error) {
    console.error("❌ ERREUR lors de la récupération de la musique par ID:")
    if (axios.isAxiosError(error)) {
      console.error("❌ Status:", error.response?.status)
      console.error("❌ Data:", error.response?.data)
    } else {
      console.error("❌ Error:", error)
    }
    return null
  }
}

export const getQuotes = async (): Promise<any[]> => {
  try {
    const response = await axiosInstance.get("/quotes?populate=*")
    return response.data.data || []
  } catch (error) {
    console.error("Erreur lors de la récupération des citations:", error)
    return []
  }
}

export const getTests = async (): Promise<any[]> => {
  try {
    const response = await axiosInstance.get("/testes?populate=*")
    return response.data.data || []
  } catch (error) {
    console.error("Erreur lors de la récupération des tests:", error)
    return []
  }
}

// ✅ FONCTION CORRIGÉE pour la vraie structure des données
export const getFullImageUrl = (imageData: any): string => {
  console.log("🖼️ === PROCESSING IMAGE URL (CORRECTED) ===")
  console.log("🖼️ Input imageData:", JSON.stringify(imageData, null, 2))

  if (!imageData) {
    console.log("❌ No image data provided")
    return ""
  }

  let imageUrl = ""

  // ✅ CORRECTION: Gérer la structure réelle des données
  if (imageData.url) {
    // Image directement accessible
    imageUrl = imageData.url
    console.log("✅ Found image URL (direct access):", imageUrl)
  } else if (imageData.data && imageData.data.attributes && imageData.data.attributes.url) {
    // Format Strapi standard (fallback)
    imageUrl = imageData.data.attributes.url
    console.log("✅ Found image URL (standard format):", imageUrl)
  } else if (typeof imageData === "string") {
    // URL directe
    imageUrl = imageData
    console.log("✅ Found image URL (direct string):", imageUrl)
  } else {
    console.log("❌ Invalid image data structure")
    return ""
  }

  // Construire l'URL complète
  const baseUrl = API_URL.replace("/api", "")
  const fullUrl = imageUrl.startsWith("http") ? imageUrl : `${baseUrl}${imageUrl}`

  console.log("🖼️ Base URL:", baseUrl)
  console.log("🖼️ Image URL:", imageUrl)
  console.log("🖼️ Full URL:", fullUrl)

  return fullUrl
}

// ✅ NOUVELLE FONCTION: Vérifier si une URL est valide
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// ✅ NOUVELLE FONCTION: Obtenir le texte de description
export const getPlainTextDescription = (description: any): string => {
  if (!description) return ""

  if (typeof description === "string") {
    return description
  }

  if (Array.isArray(description)) {
    return description
      .map((block: any) => {
        if (block.children && Array.isArray(block.children)) {
          return block.children.map((child: any) => child.text || "").join("")
        }
        return ""
      })
      .join(" ")
  }

  return ""
}
