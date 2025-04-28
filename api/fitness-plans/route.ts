import axios from "axios"
const token = '90e0b995cd84179026cb851de953de05e32a7ad3bb579c26c930057a384892a4fd89aee4f53da73ca3a88fd4c9084360df104e7761d491701fe4214471722b7d17d15d3d55f2d6e7ff6549d9de3d02f13476ae8dbd70315d6df445ec6f536d5949781519d0187235f1ea2826b82a66e1625b2cf96ac7ee0d677a00c0db198a9a';

// Créez une instance axios avec le token dans les headers
const fitnessApi = axios.create({
  baseURL: "http://192.168.100.15:1337",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`, // Ajouter le token ici
  },
});

// Interface for the image format
interface ImageFormat {
  name: string
  hash: string
  ext: string
  mime: string
  path: string | null
  width: number
  height: number
  size: number
  sizeInBytes: number
  url: string
}

// Interface for the image object
interface ImageObject {
  id: number
  documentId: string
  name: string
  alternativeText: string | null
  caption: string | null
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
  size: number
  url: string
  previewUrl: string | null
  provider: string
  provider_metadata: any | null
  createdAt: string
  updatedAt: string
  publishedAt: string
}

// Interface for the description item
interface DescriptionItem {
  type: string
  children: {
    type: string
    text: string
  }[]
}

// Interface for the exercise
export interface Exercise {
  id: number
  documentId: string
  name: string
  video_url: string
  duration: string
  sets: number | null
  rep: string | null
  calories_burned: string
  createdAt: string
  updatedAt: string
  publishedAt: string
}

// Interface for the sub-category
export interface SubCategory {
  id: number
  documentId: string
  name: string
  createdAt: string
  updatedAt: string
  publishedAt: string
  fitness_plan: FitnessPlan
  exercises: Exercise[]
  image: ImageObject[]
  // Add these missing properties based on the error messages
  description?: DescriptionItem[]
  title?: string
  difficulty?: string
  duration?: number
  calories_burned?: number
}

// Interface for the fitness plan
export interface FitnessPlan {
  id: number
  documentId: string
  title: string
  description: DescriptionItem[]
  type: string
  duration: number
  calories_burned: number
  createdAt: string
  updatedAt: string
  publishedAt: string
  image?: ImageObject[]
  sub_categories?: SubCategory[]
}

// Interface for the API response
interface FitnessPlansResponse {
  data: FitnessPlan[]
}

// Function to get all fitness plans
export const getFitnessPlans = async (): Promise<FitnessPlan[]> => {
  try {
    const response = await fitnessApi.get<FitnessPlansResponse>("/api/fitness-plans?populate=image")
    return response.data.data
  } catch (error) {
    console.error("Error fetching fitness plans:", error)
    throw error
  }
}

// Function to get a fitness plan by type
export const getFitnessPlanByType = async (type: string): Promise<FitnessPlan[]> => {
  try {
    const response = await fitnessApi.get<FitnessPlansResponse>(
      `/api/fitness-plans?filters[type][$eq]=${type}&populate=image`,
    )
    

    return response.data.data
  } catch (error) {
    console.error(`Error fetching fitness plan for type ${type}:`, error)
    throw error
  }
}
export async function getFitnessPlanWithSubCategories(category: string) {
  if (!category || typeof category !== "string") {
    throw new Error("Category is undefined or not a valid string");
  }

  // Définir un token d'authentification (exemple, remplacez par votre vrai token)
  const token = '90e0b995cd84179026cb851de953de05e32a7ad3bb579c26c930057a384892a4fd89aee4f53da73ca3a88fd4c9084360df104e7761d491701fe4214471722b7d17d15d3d55f2d6e7ff6549d9de3d02f13476ae8dbd70315d6df445ec6f536d5949781519d0187235f1ea2826b82a66e1625b2cf96ac7ee0d677a00c0db198a9a';

  // Ajoutez le token dans les headers de la requête fetch
  const response = await fetch(`http://192.168.100.15:1337/api/fitness-plans?populate[sub_categories][populate]=image`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`, // Ajoutez le token ici
    },
  });

  const data = await response.json();
  console.log("Données reçues de l'API:", data);

  const plans = data.data.map((item: any) => ({
    id: item.id,
    ...item.attributes, 
  }));

  const filteredPlans = plans.filter((plan: { type: string }) => plan.type && plan.type.toLowerCase() === category.toLowerCase());
  console.log("Plans filtrés:", filteredPlans);

  return filteredPlans;
}



// Helper function to get the full image URL
export const getImageUrl = (imageUrl: string): string => {
  if (!imageUrl) return ""
  // If the URL already starts with http, return it as is
  if (imageUrl.startsWith("http")) return imageUrl
  // Otherwise, prepend the base URL
  return `http://192.168.100.15:1337${imageUrl}`
}

// Helper function to extract plain text from description
export const getPlainTextDescription = (description?: DescriptionItem[]): string => {
  if (!description || !description.length) return ""

  return description.map((item) => item.children.map((child) => child.text).join("")).join("\n")
}
