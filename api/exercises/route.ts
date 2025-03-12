import axios from "axios";

const API_URL = "http://192.168.100.9:1337/api/exercises?populate=image";
const TOKEN = "48887ddc9babdd10b4141628ae273f8ca303c6f8f24173d649fe9f02310f876153cb98a4fd21efb57cbcf1d2290a2b70a334377e260aa5120146bfb28366aca01eb23f25b446edded92ebd39a16419064d76bc211132b89d785d7152048942489f737164321b0f79bfefab795a9d5adaca30318fcc3e37d121e76106a484f61a";

export interface Exercise {
  id: number;
  attributes: {
    name: string;
    description: string | null;
    image: {
      url?: string;
      formats?: {
        thumbnail?: {
          url: string;
        };
        small?: {
          url: string;
        };
        medium?: {
          url: string;
        };
        large?: {
          url: string;
        };
      };
    };
  };
}

export const getExercises = async (): Promise<Exercise[]> => {
  try {
    const response = await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    });

    return response.data.data.map((item: any) => ({
      id: item.id,
      attributes: {
        ...item.attributes,
        image: item.attributes.image?.data?.attributes || null, // Safely access image data
      },
    }));
  } catch (error) {
    console.error("Error fetching exercises:", error);
    throw error;
  }
};
