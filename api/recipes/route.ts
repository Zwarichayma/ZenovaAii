import { API_KEY, API_URL } from '@env';
import axios from 'axios';

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
      console.error('Axios error details:', error.response?.data);
      console.error('Axios error status:', error.response?.status);
      console.error('Axios error headers:', error.response?.headers);
    }
    console.error('Erreur lors de la récupération des recettes :', error);
    throw error;
  }
};
export const getRecipe = async (documentId: string) => {
  try {
    // Make sure you're using the correct endpoint format
    const url = `${API_URL}/recipes/${documentId}?populate=image`
    console.log("Requesting Recipe URL:", url)

    const { data } = await axios.get(url, {
      headers: { Authorization: `Bearer ${API_KEY}` },
    })

    // Vérification de la validité des données
    if (data) {
      return data.data
    } else {
      throw new Error("Aucune recette trouvée dans la réponse de l'API")
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error details:", error.response?.data)
      console.error("Axios error status:", error.response?.status)
      console.error("Axios error headers:", error.response?.headers)
    }
    console.error("Erreur lors de la récupération de la recette :", error)
    throw error
  }
}

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
      throw new Error('Aucune catégorie trouvée dans la réponse de l\'API');
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', error.response?.data);
      console.error('Axios error status:', error.response?.status);
      console.error('Axios error headers:', error.response?.headers);
    }
    console.error('Erreur lors de la récupération des catégories :', error);
    throw error;
  }
};

