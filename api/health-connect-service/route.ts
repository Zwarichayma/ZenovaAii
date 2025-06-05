"use client"

import AsyncStorage from "@react-native-async-storage/async-storage"

// Configuration Strapi
const API_URL = "http://192.168.100.7:1337/api"
const API_KEY =
  "6e3e7d4353b4e4ad2db82c3a91145ae7b9245c7eb5318dcf77db9a9267f621066c24d9cfea255f458117486715465f7aff103744afa4ce13f128dfed55220257b949a558e83f963f14c68991ec3389ad8fbf34a23da5911d2b23a02820bdd6033f5fae80a90916ee82ca7e839e9a4ff74fceb51bfc1c5b5afa2a7e2d948aeaed"

// Interface pour les données Health Connect
interface HealthConnectData {
  // Données de base
  steps: number
  distance: number
  total_calories_burned: number
  active_calories_burned: number

  // Données corporelles
  weight?: number
  body_fat?: number
  body_water_mass?: number
  body_temperature?: number
  bone_mass?: number

  // Données cardiovasculaires
  resting_heart_rate?: number
  blood_pressure?: string
  blood_glucose?: number

  // Données d'activité
  exercise?: string
  elevation_gained?: number
  speed?: number
  power?: number
  vo2_max?: number

  // Données de sommeil et repos
  sleep?: number
  basal_metabolic_rate?: number
  basal_body_temperature?: number

  // Données spécialisées
  respiratory_rate?: number
  sexual_activity?: string
  spotting?: string
  cervical_mucus?: string
  wheelchair_pushes?: number

  // Métadonnées
  userId: string
}

export const healthConnectService = {
  // Fonction pour obtenir les headers d'authentification
  getAuthHeaders(): { [key: string]: string } {
    return {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    }
  },

  // Fonction pour obtenir l'ID utilisateur depuis le stockage local
  async getUserId(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem("userUuid")
    } catch (error) {
      console.error("Error getting user ID:", error)
      return null
    }
  },

  // 🎯 FONCTION: Sauvegarder avec les VRAIS noms de champs de Strapi
  async saveHealthConnectData(healthData: Partial<HealthConnectData>, selectedDate?: Date): Promise<any> {
    try {
      console.log("=== SAVING HEALTH CONNECT DATA WITH CORRECT FIELD NAMES ===")

      const userId = await this.getUserId()
      if (!userId) {
        throw new Error("User not authenticated")
      }

      const headers = this.getAuthHeaders()

      console.log("Saving health data for user:", userId)
      console.log("Health data:", healthData)

      // 📅 Préparer la date
      const dateString = selectedDate
        ? selectedDate.toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0]

      // 🎯 UTILISER LES VRAIS NOMS DE CHAMPS DE STRAPI
      const requestData = {
        data: {
          // Relation utilisateur
          user: Number(userId),

          // 📅 Date (maintenant disponible)
          Date: dateString,

          // 🏃‍♂️ Données de base avec les VRAIS noms de champs
          Steps: healthData.steps?.toString() || "0",
          Distance: healthData.distance?.toString() || "0",
          Total_calories_burned: healthData.total_calories_burned?.toString() || "0",
          active_calories_burned: healthData.active_calories_burned?.toString() || "0",

          // 💪 Données corporelles
          Weight: healthData.weight?.toString() || null,
          Body_fat: healthData.body_fat?.toString() || null,
          Body_water_mass: healthData.body_water_mass?.toString() || null,
          Body_temperature: healthData.body_temperature?.toString() || null,
          Bone_mass: healthData.bone_mass?.toString() || null,

          // ❤️ Données cardiovasculaires
          Resting_heart_rate: healthData.resting_heart_rate?.toString() || null,
          Blood_pressure: healthData.blood_pressure || null,
          Blood_glucose: healthData.blood_glucose?.toString() || null,

          // 🏋️ Données d'activité
          Exercise: healthData.exercise || null,
          elevation_gained: healthData.elevation_gained?.toString() || null,
          Speed: healthData.speed?.toString() || null,
          Power: healthData.power?.toString() || null,
          VO2_max: healthData.vo2_max?.toString() || null,

          // 😴 Données de sommeil et repos
          Sleep: healthData.sleep?.toString() || null,
          Basal_metabolic_rate: healthData.basal_metabolic_rate?.toString() || null,
          Basal_body_temperature: healthData.basal_body_temperature?.toString() || null,

          // 🩺 Données spécialisées
          Respiratory_rate: healthData.respiratory_rate?.toString() || null,
          Sexual_activity: healthData.sexual_activity || null,
          Spotting: healthData.spotting || null,
          Cervical_mucus: healthData.cervical_mucus || null,
          Wheelchair_pushes: healthData.wheelchair_pushes?.toString() || null,
        },
      }

      console.log("✅ Data prepared with CORRECT Strapi field names:")
      console.log(JSON.stringify(requestData, null, 2))

      // 🚀 Envoyer la requête
      const url = `${API_URL}/health-connects`
      console.log("Creating health record with correct field names...")

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(requestData),
      })

      console.log("Response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Save response not OK:", response.status)
        console.error("Save error response:", errorText)
        throw new Error(`Server error: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      console.log("=== HEALTH CONNECT DATA SAVED SUCCESSFULLY ===")
      console.log("Result:", result)
      return result
    } catch (error: any) {
      console.error("=== HEALTH CONNECT SAVE ERROR ===")
      console.error("Error saving health connect data:", error)
      throw new Error(`Failed to save health data: ${error.message}`)
    }
  },

  // Récupérer les données Health Connect avec les vrais noms de champs
  async getHealthConnectData(selectedDate: Date): Promise<HealthConnectData | null> {
    try {
      const userId = await this.getUserId()
      if (!userId) {
        console.log("No user ID available")
        return null
      }

      const headers = this.getAuthHeaders()
      const dateString = selectedDate.toISOString().split("T")[0]

      const url = `${API_URL}/health-connects?filters[user][id][$eq]=${userId}&filters[Date][$eq]=${dateString}&populate=*`
      console.log("Fetching health data from:", url)

      const response = await fetch(url, {
        method: "GET",
        headers,
      })

      if (!response.ok) {
        console.error("Get response not OK:", response.status)
        return null
      }

      const result = await response.json()
      console.log("Health connect data retrieved:", result)

      if (!result.data || result.data.length === 0) {
        console.log("No health data found for date:", dateString)
        return null
      }

      // Mapper les données Strapi vers le format frontend avec les vrais noms
      const healthRecord = result.data[0].attributes
      return {
        steps: this.parseNumber(healthRecord.Steps, 0),
        distance: this.parseNumber(healthRecord.Distance, 0),
        total_calories_burned: this.parseNumber(healthRecord.Total_calories_burned, 0),
        active_calories_burned: this.parseNumber(healthRecord.active_calories_burned, 0),

        weight: healthRecord.Weight ? this.parseNumber(healthRecord.Weight, 0) : undefined,
        body_fat: healthRecord.Body_fat ? this.parseNumber(healthRecord.Body_fat, 0) : undefined,
        body_water_mass: healthRecord.Body_water_mass ? this.parseNumber(healthRecord.Body_water_mass, 0) : undefined,
        body_temperature: healthRecord.Body_temperature
          ? this.parseNumber(healthRecord.Body_temperature, 0)
          : undefined,
        bone_mass: healthRecord.Bone_mass ? this.parseNumber(healthRecord.Bone_mass, 0) : undefined,

        resting_heart_rate: healthRecord.Resting_heart_rate
          ? this.parseNumber(healthRecord.Resting_heart_rate, 0)
          : undefined,
        blood_pressure: healthRecord.Blood_pressure || undefined,
        blood_glucose: healthRecord.Blood_glucose ? this.parseNumber(healthRecord.Blood_glucose, 0) : undefined,

        exercise: healthRecord.Exercise || undefined,
        elevation_gained: healthRecord.elevation_gained
          ? this.parseNumber(healthRecord.elevation_gained, 0)
          : undefined,
        speed: healthRecord.Speed ? this.parseNumber(healthRecord.Speed, 0) : undefined,
        power: healthRecord.Power ? this.parseNumber(healthRecord.Power, 0) : undefined,
        vo2_max: healthRecord.VO2_max ? this.parseNumber(healthRecord.VO2_max, 0) : undefined,

        sleep: healthRecord.Sleep ? this.parseNumber(healthRecord.Sleep, 0) : undefined,
        basal_metabolic_rate: healthRecord.Basal_metabolic_rate
          ? this.parseNumber(healthRecord.Basal_metabolic_rate, 0)
          : undefined,
        basal_body_temperature: healthRecord.Basal_body_temperature
          ? this.parseNumber(healthRecord.Basal_body_temperature, 0)
          : undefined,

        respiratory_rate: healthRecord.Respiratory_rate
          ? this.parseNumber(healthRecord.Respiratory_rate, 0)
          : undefined,
        sexual_activity: healthRecord.Sexual_activity || undefined,
        spotting: healthRecord.Spotting || undefined,
        cervical_mucus: healthRecord.Cervical_mucus || undefined,
        wheelchair_pushes: healthRecord.Wheelchair_pushes
          ? this.parseNumber(healthRecord.Wheelchair_pushes, 0)
          : undefined,

        userId: userId,
      }
    } catch (error) {
      console.error("Error fetching health connect data:", error)
      return null
    }
  },

  // Récupérer les données Health Connect récentes pour un utilisateur
  async getRecentHealthConnectData(): Promise<HealthConnectData[]> {
    try {
      const userId = await this.getUserId()
      if (!userId) {
        console.log("No user ID available")
        return []
      }

      const headers = this.getAuthHeaders()

      const url = `${API_URL}/health-connects?filters[user][id][$eq]=${userId}&populate=*&sort=createdAt:desc&pagination[limit]=10`
      console.log("Fetching recent health data from:", url)

      const response = await fetch(url, {
        method: "GET",
        headers,
      })

      if (!response.ok) {
        console.error("Get response not OK:", response.status)
        return []
      }

      const result = await response.json()
      console.log("Recent health connect data retrieved:", result.data.length, "records")

      return result.data.map((record: any) => {
        const attrs = record.attributes
        return {
          steps: this.parseNumber(attrs.Steps, 0),
          distance: this.parseNumber(attrs.Distance, 0),
          total_calories_burned: this.parseNumber(attrs.Total_calories_burned, 0),
          active_calories_burned: this.parseNumber(attrs.active_calories_burned, 0),
          userId: userId,
        }
      })
    } catch (error) {
      console.error("Error fetching recent health connect data:", error)
      return []
    }
  },

  // Fonction utilitaire pour parser les nombres
  parseNumber(value: any, defaultValue: number): number {
    if (value === null || value === undefined) return defaultValue
    const parsed = typeof value === "string" ? Number.parseFloat(value) : Number(value)
    return Number.isNaN(parsed) ? defaultValue : parsed
  },

  // Récupérer toutes les données Health Connect pour un utilisateur
  async getAllHealthConnectData(): Promise<HealthConnectData[]> {
    try {
      const userId = await this.getUserId()
      if (!userId) {
        return []
      }

      const headers = this.getAuthHeaders()

      const url = `${API_URL}/health-connects?filters[user][id][$eq]=${userId}&populate=*&sort=createdAt:desc`
      console.log("Fetching all health data from:", url)

      const response = await fetch(url, {
        method: "GET",
        headers,
      })

      if (!response.ok) {
        console.error("Get all response not OK:", response.status)
        return []
      }

      const result = await response.json()
      console.log("All health connect data retrieved:", result.data.length, "records")

      return result.data.map((record: any) => {
        const attrs = record.attributes
        return {
          steps: this.parseNumber(attrs.Steps, 0),
          distance: this.parseNumber(attrs.Distance, 0),
          total_calories_burned: this.parseNumber(attrs.Total_calories_burned, 0),
          active_calories_burned: this.parseNumber(attrs.active_calories_burned, 0),
          userId: userId,
        }
      })
    } catch (error) {
      console.error("Error fetching all health connect data:", error)
      return []
    }
  },

  // Supprimer un enregistrement Health Connect
  async deleteHealthConnectRecord(recordId: string): Promise<boolean> {
    try {
      const headers = this.getAuthHeaders()
      const deleteUrl = `${API_URL}/health-connects/${recordId}`

      const deleteResponse = await fetch(deleteUrl, {
        method: "DELETE",
        headers,
      })

      if (!deleteResponse.ok) {
        throw new Error("Failed to delete health data")
      }

      console.log("Health data deleted successfully, record ID:", recordId)
      return true
    } catch (error) {
      console.error("Error deleting health connect data:", error)
      return false
    }
  },

  // 🆕 FONCTION: Sauvegarde automatique avec gestion des erreurs
  async autoSaveHealthData(healthData: Partial<HealthConnectData>): Promise<boolean> {
    try {
      console.log("🔄 Auto-saving health data...")
      await this.saveHealthConnectData(healthData)
      console.log("✅ Auto-save successful")
      return true
    } catch (error) {
      console.error("❌ Auto-save failed:", error)
      return false
    }
  },

  // 🆕 FONCTION: Vérifier si l'utilisateur est connecté
  async isUserAuthenticated(): Promise<boolean> {
    const userId = await this.getUserId()
    return userId !== null
  },

  // 🆕 FONCTION: Tester la connexion à l'API
  async testConnection(): Promise<boolean> {
    try {
      const headers = this.getAuthHeaders()
      const response = await fetch(`${API_URL}/health-connects?pagination[limit]=1`, {
        method: "GET",
        headers,
      })
      return response.ok
    } catch (error) {
      console.error("Connection test failed:", error)
      return false
    }
  },
}
