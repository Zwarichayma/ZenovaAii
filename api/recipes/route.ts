import axios from "axios";

const API_URL = "http://4301-197-26-47-92.ngrok-free.app/api";
const TOKEN = "48887ddc9babdd10b4141628ae273f8ca303c6f8f24173d649fe9f02310f876153cb98a4fd21efb57cbcf1d2290a2b70a334377e260aa5120146bfb28366aca01eb23f25b446edded92ebd39a16419064d76bc211132b89d785d7152048942489f737164321b0f79bfefab795a9d5adaca30318fcc3e37d121e76106a484f61a";

export const getRecipes = async (categoryDocumentId: string) => {
  try {
    let url = `${API_URL}/recipes?populate=*`;

    if (categoryDocumentId) {
      url += `&filters[categories][documentId][$eq]=${encodeURIComponent(categoryDocumentId)}`;
    }


    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    });


    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error details:", error.response?.data);
      console.error("Axios error status:", error.response?.status);
      console.error("Axios error headers:", error.response?.headers);
    }
    console.error("Erreur lors de la récupération des recettes :", error);
    throw error;
  }
};

export const getCategories = async () => {
  try {
    const url = `${API_URL}/categories?populate=*`;

    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    });

    // Vérification si les données sont valides
    if (response.data && response.data.data) {
      return response.data.data;
    } else {
      throw new Error("Aucune catégorie trouvée dans la réponse de l'API");
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error details:", error.response?.data);
      console.error("Axios error status:", error.response?.status);
      console.error("Axios error headers:", error.response?.headers);
    }
    console.error("Erreur lors de la récupération des catégories :", error);
    throw error;
  }
};

export const getRecipe = async (documentId: string) => {
  try {
    const url = `${API_URL}/recipes/${documentId}?populate=image`;
    console.log("Requesting Recipe URL:", url);

    const {data} = await axios.get(url, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    });
    // Vérification de la validité des données
    if (data) {
      return data.data;
    } else {
      throw new Error("Aucune recette trouvée dans la réponse de l'API");
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error details:", error.response?.data);
      console.error("Axios error status:", error.response?.status);
      console.error("Axios error headers:", error.response?.headers);
    }
    console.error("Erreur lors de la récupération de la recette :", error);
    throw error;
  }
};
