import axios from "axios";

const API_URL = "http://192.168.100.24:1337/api/personalized-diets?populate=image";
const TOKEN = "3bf5dd63e926b8274c69d0725cbcb58fff0557c122389deb3b1b05c891c62c9fc18917cfa1b913ea60731cc1687426d8d1b1df629e479c783ade7bdc261e025fb2189a84daf3c0fc38a7acc07aae9c809464955f0a1d68c7fd3d9d17c4855986c632f756cfd3a73c9ac714f84e484db0f547ccdf84613e6bdb9b5d1e36e7b2b9";

export const getPersonalizedDiets = async () => {
  try {
    const response = await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    });

    return response.data.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des régimes personnalisés :", error);
    throw error;
  }
};
