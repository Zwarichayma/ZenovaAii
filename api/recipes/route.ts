import axios from "axios";

const API_URL = "http://192.168.100.24:1337/api";
const TOKEN = "3bf5dd63e926b8274c69d0725cbcb58fff0557c122389deb3b1b05c891c62c9fc18917cfa1b913ea60731cc1687426d8d1b1df629e479c783ade7bdc261e025fb2189a84daf3c0fc38a7acc07aae9c809464955f0a1d68c7fd3d9d17c4855986c632f756cfd3a73c9ac714f84e484db0f547ccdf84613e6bdb9b5d1e36e7b2b9";

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
