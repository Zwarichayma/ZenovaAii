import axios from "axios";

const API_URL = "http://192.168.100.9:1337/api/exercises?populate=image";
const TOKEN = "3bf5dd63e926b8274c69d0725cbcb58fff0557c122389deb3b1b05c891c62c9fc18917cfa1b913ea60731cc1687426d8d1b1df629e479c783ade7bdc261e025fb2189a84daf3c0fc38a7acc07aae9c809464955f0a1d68c7fd3d9d17c4855986c632f756cfd3a73c9ac714f84e484db0f547ccdf84613e6bdb9b5d1e36e7b2b9";

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
