import axios from "axios";

const API_URL = "http://4301-197-26-47-92.ngrok-free.app/api/categories?populate=image";
const TOKEN = "48887ddc9babdd10b4141628ae273f8ca303c6f8f24173d649fe9f02310f876153cb98a4fd21efb57cbcf1d2290a2b70a334377e260aa5120146bfb28366aca01eb23f25b446edded92ebd39a16419064d76bc211132b89d785d7152048942489f737164321b0f79bfefab795a9d5adaca30318fcc3e37d121e76106a484f61a";

export const getRecipes = async () => {
  try {
    const response = await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    });

    return response.data.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des plans de fitness :", error);
    throw error;
  }
};
