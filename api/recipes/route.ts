import axios from 'axios';
const API_URL = "http://192.168.1.7:1337/api"
const API_KEY =
  "6578e396c2ba2edb826af0353b08f55cb03bf56dc12a05ebc42dd7aedc6f190134882aa6d3f76174ff8303499414eb21b321b1807b26b0950b00f39c0d45079a3b9f7df6bc6a1d7532bf5511ff899cc94e5e77c23065eba46458acdc418e7fd50ef5c9021fa051a1d65de430fcec4e27ff527f8515115e4e1b649ecc41c4a54f"

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

