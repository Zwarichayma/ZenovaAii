import axios from "axios";
import { API_URL, API_KEY } from "@env";
console.log(API_URL); 
console.log(API_KEY);
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
 

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
  },
});

export const getExercises = async (): Promise<Exercise[]> => {
  try {
    const response = await axiosInstance.get("/exercises?populate=image");

    return response.data.data.map((item: any) => ({
      id: item.id,
      attributes: {
        ...item.attributes,
        image: item.attributes.image?.data?.attributes || null,
      },
    }));
  } catch (error) {
    console.error("Error fetching exercises:", error);
    throw error;
  }
};
