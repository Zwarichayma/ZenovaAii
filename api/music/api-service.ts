import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

// Clés pour le stockage
const AUTH_TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';
const DEVICE_UUID_KEY = 'device_uuid';
const ANONYMOUS_ID_KEY = 'anonymous_id';

// Configuration de l'API Strapi
const STRAPI_URL = 'http://localhost:1337'; // Remplacez par votre URL Strapi
const API = axios.create({
  baseURL: STRAPI_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Fonction pour définir le token d'authentification pour les requêtes API
const setAuthToken = (token: string | null) => {
  if (token) {
    API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete API.defaults.headers.common['Authorization'];
  }
};

// Service d'authentification
export const authService = {
  // Obtenir ou créer un UUID unique pour l'appareil
  async getDeviceUUID(): Promise<string> {
    try {
      let uuid = await AsyncStorage.getItem(DEVICE_UUID_KEY);
      
      if (!uuid) {
        uuid = uuidv4();
        await AsyncStorage.setItem(DEVICE_UUID_KEY, uuid);
        console.log('Nouveau UUID créé:', uuid);
      } else {
        console.log('UUID existant récupéré:', uuid);
      }
      
      return uuid;
    } catch (error) {
      console.error('Error getting device UUID:', error);
      throw error;
    }
  },

  // Obtenir ou créer un ID anonyme
  async getAnonymousId(): Promise<string> {
    try {
      let id = await AsyncStorage.getItem(ANONYMOUS_ID_KEY);
      
      if (!id) {
        id = uuidv4();
        await AsyncStorage.setItem(ANONYMOUS_ID_KEY, id);
      }
      
      return id;
    } catch (error) {
      console.error('Error getting anonymous ID:', error);
      throw error;
    }
  },

  // Réinitialiser l'ID anonyme
  async resetAnonymousId(): Promise<string> {
    try {
      const newId = uuidv4();
      await AsyncStorage.setItem(ANONYMOUS_ID_KEY, newId);
      return newId;
    } catch (error) {
      console.error('Error resetting anonymous ID:', error);
      throw error;
    }
  },

  // Vérifier si l'utilisateur est authentifié par token JWT
  async isAuthenticatedByToken(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      
      if (!token) {
        return false;
      }
      
      // Définir le token pour la requête
      setAuthToken(token);
      
      // Vérifier si le token est valide
      const response = await API.get('/api/users/me');
      
      return response.status === 200;
    } catch (error) {
      console.error('Error checking token authentication:', error);
      return false;
    }
  },

  // Vérifier si l'utilisateur est authentifié par UUID
  async isAuthenticatedByUUID(): Promise<boolean> {
    try {
      const deviceUUID = await this.getDeviceUUID();
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      
      if (!userData) {
        return false;
      }
      
      const user = JSON.parse(userData);
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      
      if (!token) {
        return false;
      }
      
      // Définir le token pour la requête
      setAuthToken(token);
      
      // Vérifier si cet UUID est associé à l'utilisateur dans Strapi
      const response = await API.get(`/api/device-sessions?filters[deviceUuid][$eq]=${deviceUUID}&filters[user][id][$eq]=${user.id}`);
      
      if (response.data && response.data.data && response.data.data.length > 0) {
        // Mettre à jour la date de dernière activité
        const sessionId = response.data.data[0].id;
        await API.put(`/api/device-sessions/${sessionId}`, {
          data: {
            lastActive: new Date().toISOString()
          }
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking UUID authentication:', error);
      return false;
    }
  },

  // Obtenir les sessions d'appareil pour un utilisateur
  async getDeviceSessions(userId: number): Promise<any[]> {
    try {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      
      if (!token) {
        return [];
      }
      
      // Définir le token pour la requête
      setAuthToken(token);
      
      // Récupérer toutes les sessions d'appareil pour cet utilisateur
      const response = await API.get(`/api/device-sessions?filters[user][id][$eq]=${userId}&sort=lastActive:desc`);
      
      if (response.data && response.data.data) {
        return response.data.data;
      }
      
      return [];
    } catch (error) {
      console.error('Error getting device sessions:', error);
      throw error;
    }
  },

  // Supprimer une session d'appareil
  async removeDeviceSession(sessionId: string): Promise<void> {
    try {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Définir le token pour la requête
      setAuthToken(token);
      
      // Supprimer la session
      await API.delete(`/api/device-sessions/${sessionId}`);
    } catch (error) {
      console.error('Error removing device session:', error);
      throw error;
    }
  },

  // Connexion
  async login(identifier: string, password: string): Promise<any> {
    try {
      // Connexion avec Strapi
      const response = await API.post('/api/auth/local', {
        identifier,
        password
      });
      
      const { jwt, user } = response.data;
      
      // Stocker le token et les données utilisateur
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, jwt);
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
      
      // Définir le token pour les futures requêtes
      setAuthToken(jwt);
      
      // Associer l'UUID de l'appareil à cette session
      const deviceUUID = await this.getDeviceUUID();
      
      // Vérifier si une session existe déjà pour cet appareil et cet utilisateur
      const existingSessionResponse = await API.get(`/api/device-sessions?filters[deviceUuid][$eq]=${deviceUUID}&filters[user][id][$eq]=${user.id}`);
      
      if (existingSessionResponse.data && existingSessionResponse.data.data && existingSessionResponse.data.data.length > 0) {
        // Mettre à jour la session existante
        const sessionId = existingSessionResponse.data.data[0].id;
        await API.put(`/api/device-sessions/${sessionId}`, {
          data: {
            lastActive: new Date().toISOString()
          }
        });
      } else {
        // Créer une nouvelle session
        await API.post('/api/device-sessions', {
          data: {
            deviceUuid: deviceUUID,
            deviceName: 'Mobile Device', // Vous pourriez récupérer le nom réel de l'appareil
            user: user.id,
            lastActive: new Date().toISOString()
          }
        });
      }
      
      return { user };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Inscription
  async register(email: string, username: string, password: string): Promise<any> {
    try {
      // Inscription avec Strapi
      const response = await API.post('/api/auth/local/register', {
        username,
        email,
        password
      });
      
      const { jwt, user } = response.data;
      
      // Stocker le token et les données utilisateur
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, jwt);
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
      
      // Définir le token pour les futures requêtes
      setAuthToken(jwt);
      
      // Associer l'UUID de l'appareil à cette session
      const deviceUUID = await this.getDeviceUUID();
      
      // Créer une nouvelle session
      await API.post('/api/device-sessions', {
        data: {
          deviceUuid: deviceUUID,
          deviceName: 'Mobile Device', // Vous pourriez récupérer le nom réel de l'appareil
          user: user.id,
          lastActive: new Date().toISOString()
        }
      });
      
      // Récupérer l'ID anonyme pour la migration des données
      const anonymousId = await this.getAnonymousId();
      
      // Vous pourriez ajouter ici une logique pour migrer les données anonymes vers l'utilisateur
      
      return { user };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // Authentification Google
  async googleAuth(idToken: string): Promise<any> {
    try {
      // Authentification Google avec Strapi
      const response = await API.post('/api/auth/google/callback', {
        id_token: idToken
      });
      
      const { jwt, user } = response.data;
      
      // Stocker le token et les données utilisateur
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, jwt);
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
      
      // Définir le token pour les futures requêtes
      setAuthToken(jwt);
      
      // Associer l'UUID de l'appareil à cette session
      const deviceUUID = await this.getDeviceUUID();
      
      // Vérifier si une session existe déjà pour cet appareil et cet utilisateur
      const existingSessionResponse = await API.get(`/api/device-sessions?filters[deviceUuid][$eq]=${deviceUUID}&filters[user][id][$eq]=${user.id}`);
      
      if (existingSessionResponse.data && existingSessionResponse.data.data && existingSessionResponse.data.data.length > 0) {
        // Mettre à jour la session existante
        const sessionId = existingSessionResponse.data.data[0].id;
        await API.put(`/api/device-sessions/${sessionId}`, {
          data: {
            lastActive: new Date().toISOString()
          }
        });
      } else {
        // Créer une nouvelle session
        await API.post('/api/device-sessions', {
          data: {
            deviceUuid: deviceUUID,
            deviceName: 'Mobile Device', // Vous pourriez récupérer le nom réel de l'appareil
            user: user.id,
            lastActive: new Date().toISOString()
          }
        });
      }
      
      return { user };
    } catch (error) {
      console.error('Google auth error:', error);
      throw error;
    }
  },

  // Obtenir les données utilisateur
  async getUserData(): Promise<any> {
    try {
      const userDataString = await AsyncStorage.getItem(USER_DATA_KEY);
      
      if (!userDataString) {
        throw new Error('No user data found');
      }
      
      return JSON.parse(userDataString);
    } catch (error) {
      console.error('Error getting user data:', error);
      throw error;
    }
  },

  // Déconnexion
  async clearAuthData(): Promise<void> {
    try {
      const deviceUUID = await this.getDeviceUUID();
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      
      if (userData && token) {
        const user = JSON.parse(userData);
        
        // Définir le token pour la requête
        setAuthToken(token);
        
        // Supprimer la session de l'appareil (optionnel)
        try {
          const sessionResponse = await API.get(`/api/device-sessions?filters[deviceUuid][$eq]=${deviceUUID}&filters[user][id][$eq]=${user.id}`);
          
          if (sessionResponse.data && sessionResponse.data.data && sessionResponse.data.data.length > 0) {
            const sessionId = sessionResponse.data.data[0].id;
            await API.delete(`/api/device-sessions/${sessionId}`);
          }
        } catch (sessionError) {
          console.error('Error deleting device session:', sessionError);
          // Continuer malgré l'erreur
        }
      }
      
      // Supprimer les informations d'authentification du stockage
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      await AsyncStorage.removeItem(USER_DATA_KEY);
      // Ne pas supprimer l'UUID de l'appareil ni l'ID anonyme
      
      // Supprimer le token des en-têtes de requête
      setAuthToken(null);
    } catch (error) {
      console.error('Error clearing auth data:', error);
      throw error;
    }
  }
};