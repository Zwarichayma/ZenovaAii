import AsyncStorage from '@react-native-async-storage/async-storage';

// Utilitaire de stockage avec fallback en mémoire
export const storageFallback = {
  // Cache en mémoire pour les valeurs
  memoryCache: new Map<string, string>(),

  // Obtenir un élément du stockage avec fallback en mémoire
  getItem: async (key: string): Promise<string | null> => {
    try {
      // Essayer d'abord AsyncStorage
      const value = await AsyncStorage.getItem(key);
      
      if (value !== null) {
        // Mettre en cache la valeur récupérée
        storageFallback.memoryCache.set(key, value);
        return value;
      }
      
      // Si pas dans AsyncStorage, vérifier le cache en mémoire
      if (storageFallback.memoryCache.has(key)) {
        return storageFallback.memoryCache.get(key) || null;
      }
      
      return null;
    } catch (error) {
      console.error(`Error getting item ${key} from storage:`, error);
      
      // Fallback sur le cache en mémoire
      if (storageFallback.memoryCache.has(key)) {
        return storageFallback.memoryCache.get(key) || null;
      }
      
      return null;
    }
  },

  // Définir un élément dans le stockage avec fallback en mémoire
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      // Stocker dans AsyncStorage
      await AsyncStorage.setItem(key, value);
      
      // Mettre à jour le cache en mémoire
      storageFallback.memoryCache.set(key, value);
    } catch (error) {
      console.error(`Error setting item ${key} in storage:`, error);
      
      // Fallback sur le cache en mémoire
      storageFallback.memoryCache.set(key, value);
      
      // Réessayer plus tard (optionnel)
      setTimeout(async () => {
        try {
          await AsyncStorage.setItem(key, value);
        } catch (retryError) {
          console.error(`Retry failed for setting item ${key}:`, retryError);
        }
      }, 5000);
    }
  },

  // Supprimer un élément du stockage
  removeItem: async (key: string): Promise<void> => {
    try {
      // Supprimer de AsyncStorage
      await AsyncStorage.removeItem(key);
      
      // Supprimer du cache en mémoire
      storageFallback.memoryCache.delete(key);
    } catch (error) {
      console.error(`Error removing item ${key} from storage:`, error);
      
      // Supprimer du cache en mémoire même en cas d'erreur
      storageFallback.memoryCache.delete(key);
    }
  },

  // Effacer tout le stockage
  clear: async (): Promise<void> => {
    try {
      // Effacer AsyncStorage
      await AsyncStorage.clear();
      
      // Effacer le cache en mémoire
      storageFallback.memoryCache.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      
      // Effacer le cache en mémoire même en cas d'erreur
      storageFallback.memoryCache.clear();
    }
  }
};