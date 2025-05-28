import axios from "axios";

import { API_URL, API_KEY } from '@env';


export const getMental = async () => {
  try {
    const response = await axios.get(API_URL +"/mentals?populate=image", {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });
    console.log(API_URL); 
    console.log(API_KEY); 

    return response.data.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des plans de fitness :", error);
    throw error;
  }
};
