import { API_KEY, API_URL } from "@env";
import axios from "axios";

// Configuration de l'instance axios
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
  },
});

// Interfaces pour les images
export interface ImageFormat {
  url: string;
  width: number;
  height: number;
}

export interface ImageData {
  data: {
    id: number;
    attributes: {
      url: string;
      formats: {
        thumbnail: ImageFormat;
        small: ImageFormat;
        medium?: ImageFormat;
      };
    };
  };
}

export interface Quote {
  id: number;
  attributes: {
    text: string;
    author: string;
    category: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    image: ImageData;
  };
}

export interface Music {
  id: number;
  attributes: {
    title: string;
    artist: string;
    category: string;
    duration: string;
    audioUrl: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    image: ImageData;
  };
}

export interface Test {
  id: number;
  attributes: {
    title: string;
    description: string;
    duration: string;
    category: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    image: ImageData;
  };
}

// Fonctions API
export const getQuotes = async (): Promise<Quote[]> => {
  try {
    const response = await axiosInstance.get("/quotes?populate=image");
    return response.data.data || [];
  } catch (error) {
    console.error("Erreur lors de la récupération des citations:", error);
    return [];
  }
};

export const getMusic = async (): Promise<Music[]> => {
  try {
    const response = await axiosInstance.get("/musics?populate=image");
    return response.data.data || [];
  } catch (error) {
    console.error("Erreur lors de la récupération de la musique:", error);
    return [];
  }
};

export const getTests = async (): Promise<Test[]> => {
  try {
    const response = await axiosInstance.get("/testes?populate=image");
    return response.data.data || [];
  } catch (error) {
    console.error("Erreur lors de la récupération des tests:", error);
    return [];
  }
};

// Fonction utilitaire pour générer une URL d'image complète
export const getFullImageUrl = (imageData: any): string => {
  if (!imageData || !imageData.data || !imageData.data.attributes) {
    return "";
  }

  const baseUrl = API_URL.replace("/api", "");
  const imageUrl = imageData.data.attributes.url;
  return `${baseUrl}${imageUrl}`;
};
