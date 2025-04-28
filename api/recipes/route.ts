import axios from "axios";

const API_URL = "http://192.168.100.15:1337/api";
const API_KEY = "90e0b995cd84179026cb851de953de05e32a7ad3bb579c26c930057a384892a4fd89aee4f53da73ca3a88fd4c9084360df104e7761d491701fe4214471722b7d17d15d3d55f2d6e7ff6549d9de3d02f13476ae8dbd70315d6df445ec6f536d5949781519d0187235f1ea2826b82a66e1625b2cf96ac7ee0d677a00c0db198a9a";

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
