import axios from "axios";
const API_URL = "http://192.168.1.110:1337/api";
const API_KEY = "f441809cb88567ac4e4b13bce7ca649f71163eb0d3f66b1c6b4489f6f02262983343eb079ece4f249222304aff0f5a8cdb3b465376e35c5404a419999c654806ae1accced63bccec4706719fe4e5800d8da56feca0b7aaf76f7579baa83cb6be07b51f31ece47d295ab138db41dd99ff71f5849eb28b1e91154f4c3644102225";

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
