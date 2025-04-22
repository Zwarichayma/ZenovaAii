import axios from "axios";

const API_URL = "http://192.168.100.35:1337/api";
const API_KEY = "e1e0b59bcb4c7f2f580793abe51110955231099e159ae3a0357de8f79bafc713303fe2db04d84a826e113a2e0a123c47dd28987b625e4ec584e29b37d484a1530d6189121e6494904455999038d0dc3b7cb8f5dd480f7b58f4b354b326edd1c55c49e9ff63c0ee9d1c1f6943d193aabc7689eaf2f0a447fe9165f7118d6b4cf4";

export const getRecipes = async (categoryDocumentId: string) => {
  try {
    let url = `${API_URL}/recipes?populate=*`;

    if (categoryDocumentId) {
      url += `&filters[categories][documentId][$eq]=${encodeURIComponent(categoryDocumentId)}`;
    }


    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${API_KEY}` },
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
      headers: { Authorization: `Bearer ${API_KEY}` },
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
      headers: { Authorization: `Bearer ${API_KEY}` },
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
