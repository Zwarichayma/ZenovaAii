import axios from "axios";

const API_URL = "http://192.168.100.35:1337/api";
const API_KEY = "e1e0b59bcb4c7f2f580793abe51110955231099e159ae3a0357de8f79bafc713303fe2db04d84a826e113a2e0a123c47dd28987b625e4ec584e29b37d484a1530d6189121e6494904455999038d0dc3b7cb8f5dd480f7b58f4b354b326edd1c55c49e9ff63c0ee9d1c1f6943d193aabc7689eaf2f0a447fe9165f7118d6b4cf4";

export const getMental = async () => {
  try {
    const response = await axios.get(API_URL +"/mentals?populate=image", {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });

    return response.data.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des plans de fitness :", error);
    throw error;
  }
};
