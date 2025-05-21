import axios from "axios";
import { API_URL, API_KEY } from '@env';
import { API_BASE_URL } from "@/config";

const fitnessApi = axios.create({
  baseURL: API_URL, 
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${API_KEY}`, 
  },
});



// Interface for the image format
interface ImageFormat {
  name: string;
  hash: string;
  ext: string;
  mime: string;
  path: string | null;
  width: number;
  height: number;
  size: number;
  sizeInBytes: number;
  url: string;
}

// Interface for the image object
interface ImageObject {
  id: number;
  documentId: string;
  name: string;
  alternativeText: string | null;
  caption: string | null;
  width: number;
  height: number;
  formats: {
    thumbnail: ImageFormat;
    small: ImageFormat;
    medium?: ImageFormat;
    large?: ImageFormat;
  };
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl: string | null;
  provider: string;
  provider_metadata: any | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

// Interface for the description item
interface DescriptionItem {
  type: string;
  children: {
    type: string;
    text: string;
  }[];
}

// Interface for the exercise
export interface Exercise {
  id: number;
  documentId: string;
  name: string;
  video_url: string;
  duration: string;
  sets: number | null;
  rep: string | null;
  calories_burned: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

// Interface for the sub-category
export interface SubCategory {
  id: number;
  documentId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  fitness_plan: FitnessPlan;
  exercises: Exercise[];
  image: ImageObject[];
  description?: DescriptionItem[];
  title?: string;
  difficulty?: string;
  duration?: number;
  calories_burned?: number;
}

export interface FitnessPlan {
  documentId: string;
  id: number;
  type: string;
  duration: number;
  calories_burned: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  sub_categories: Array<{
    id: number;
    name: string;
    image: Array<{
      url: string;
    }>;
  }>;
}

// Interface for the API response
interface FitnessPlansResponse {
  data: FitnessPlan[];
}

// Function to get all fitness plans
export const getFitnessPlans = async (): Promise<FitnessPlan[]> => {
  try {
    const response = await fitnessApi.get<FitnessPlansResponse>("/fitness-plans?populate=image");
    return response.data.data;
  } catch (error) {
    console.error("Error fetching fitness plans:", error);
    throw error;
  }
};

// Function to get a fitness plan by type
export const getFitnessPlanByType = async (type: string): Promise<FitnessPlan[]> => {
  try {
    const response = await fitnessApi.get<FitnessPlansResponse>(
      `/fitness-plans?filters[type][$eq]=${type}&populate=image`
    );
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching fitness plan for type ${type}:`, error);
    throw error;
  }
};

export async function getFitnessPlanWithSubCategories(identifier: string) {
  if (!identifier || typeof identifier !== "string") {
    throw new Error("L'identifiant de la catégorie ou du plan est invalide.");
  }

  try {
    const response = await fetch(`${API_URL}/fitness-plans?populate[sub_categories][populate]=*`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
    });

    const data = await response.json();
    console.log("Données reçues de l'API:", data);

    // Vérification si 'data' et 'data.data' existent
    if (!data || !data.data) {
      throw new Error("Les données de l'API sont mal formatées.");
    }

    // Typage explicite de 'item' en FitnessPlan
    const plans = data.data.map((item: any) => {
      const attributes = item.attributes || {}; // Si 'attributes' est undefined, initialiser à un objet vide

      return {
        id: item.id,
        documentId: item.documentId,  // Assurez-vous d'ajouter 'documentId' si nécessaire
        ...attributes,
        sub_categories: attributes.sub_categories || [],
      };
    });

    console.log("Plans récupérés avec sous-catégories:", plans);

    // Filtrage des plans avec sous-catégories non vides
    const plansWithSubCategories = plans.filter((plan: FitnessPlan) =>
      (plan.sub_categories && plan.sub_categories.length > 0) || !plan.sub_categories
    );
    console.log("Plans avec sous-catégories non vides ou sans sous-catégories:", plansWithSubCategories);

    // Recherche d'un plan par 'id' ou 'documentId'
    const filteredPlans = plansWithSubCategories.filter((plan: FitnessPlan) =>
      plan.id === parseInt(identifier) || plan.documentId === identifier
    );

    console.log("Plans filtrés par id ou documentId:", filteredPlans);

    return filteredPlans;
  } catch (error) {
    console.error("Erreur lors de la récupération des plans de fitness avec sous-catégories:", error);
    throw error;
  }
}

// Helper function to get the full image URL
export const getImageUrl = (imageUrl: string): string => {
  if (!imageUrl) return "";
  if (imageUrl.startsWith("http")) return imageUrl;
  return `${API_BASE_URL}${imageUrl}`;  // Use the API_URL from .env
};

// Helper function to extract plain text from description
export const getPlainTextDescription = (description?: DescriptionItem[]): string => {
  if (!description || !description.length) return "";
  return description.map((item) => item.children.map((child) => child.text).join("")).join("\n");
};

// Function to get mental plans (fitness mental)
export const getMental = async () => {
  try {
    const response = await axios.get(`${API_URL}/mentals?populate=image`, {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });
    return response.data.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des plans mentaux :", error);
    throw error;
  }
};
