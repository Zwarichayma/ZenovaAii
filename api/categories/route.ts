import axios from "axios";

const API_URL = "http://192.168.100.26:1337/api/categories?populate=image";
const TOKEN = "5b1dff440bf75ea7ad008f9ce2198754bb6804270f844bca29502cb42a9fd083a4e70e49bf84efa2e1a765bbb97ef7c5f193ab568c1bc809497297b20d792cda1478890312768df16b3be3a8dad5c9c609270eb38a722dc6c220b7991eaf76f7a7ac8a3cb4fa678748323358a8b33fc4ab9fa8e6a133415a4dd5f20afc50ed1b";

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
