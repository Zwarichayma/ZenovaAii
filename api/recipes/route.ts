import axios from 'axios';
const API_URL = "http://172.20.10.13:1337/api"
const API_KEY =
  "6e3e7d4353b4e4ad2db82c3a91145ae7b9245c7eb5318dcf77db9a9267f621066c24d9cfea255f458117486715465f7aff103744afa4ce13f128dfed55220257b949a558e83f963f14c68991ec3389ad8fbf34a23da5911d2b23a02820bdd6033f5fae80a90916ee82ca7e839e9a4ff74fceb51bfc1c5b5afa2a7e2d948aeaed"

console.log(API_URL); 
console.log(API_KEY);
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

console.log(API_URL); 
console.log(API_KEY);
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

