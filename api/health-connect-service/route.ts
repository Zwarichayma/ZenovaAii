"use client"

import AsyncStorage from "@react-native-async-storage/async-storage"
const API_URL = "http://172.20.10.13:1337/api"
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

  // 🎯 FONCTION AMÉLIORÉE: Obtenir l'ID utilisateur avec vérification
  async getUserId(): Promise<string | null> {
    try {
      const userId = await AsyncStorage.getItem("userUuid")
      console.log("🔍 Retrieved user ID from storage:", userId)
      
      if (!userId) {
        console.error("❌ No user ID found in AsyncStorage")
        return null
      }
      
      // Vérifier que l'utilisateur existe dans Strapi
      const userExists = await this.verifyUserExists(userId)
      if (!userExists) {
        console.error("❌ User does not exist in Strapi database")
        return null
      }
      
      return userId
    } catch (error) {
      console.error("❌ Error getting user ID:", error)
      return null
    }
  },

  // 🆕 FONCTION: Vérifier que l'utilisateur existe dans Strapi
  async verifyUserExists(userId: string): Promise<boolean> {
    try {
      const headers = this.getAuthHeaders()
      const url = `${API_URL}/users/${userId}`
      
      console.log("🔍 Verifying user exists:", url)
      
      const response = await fetch(url, {
        method: "GET",
        headers,
      })

      if (response.ok) {
        const user = await response.json()
        console.log("✅ User verified:", user.username || user.email)
        return true
      } else {
        console.error("❌ User verification failed:", response.status)
        return false
      }
    } catch (error) {
      console.error("❌ Error verifying user:", error)
      return false
    }
  },

  // 🎯 FONCTION CORRIGÉE: Sauvegarder avec relation utilisateur correcte
  async saveHealthConnectData(healthData: Partial<HealthConnectData>, selectedDate?: Date): Promise<any> {
    try {
      console.log("=== SAVING HEALTH DATA WITH USER RELATION ===")

      const userId = await this.getUserId()
      if (!userId) {
        throw new Error("❌ User not authenticated or does not exist")
      }

      const headers = this.getAuthHeaders()

      console.log("💾 Saving health data for user ID:", userId)
      console.log("📊 Health data to save:", healthData)

      // 📅 Préparer la date
      const dateString = selectedDate
        ? selectedDate.toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0]

      // 🎯 DONNÉES AVEC RELATION UTILISATEUR CORRECTE
      const requestData = {
        data: {
          // ✅ RELATION UTILISATEUR - Utiliser le bon format
          users_permissions_user: {
            connect: [Number(userId)]
          },

          // 📅 Date
          Date: dateString,

          // 🏃‍♂️ Données de santé
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

      console.log("✅ Request data with user relation:")
      console.log(JSON.stringify(requestData, null, 2))

      // 🚀 Envoyer la requête
      const url = `${API_URL}/health-connects`
      console.log("📡 Sending request to:", url)

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(requestData),
      })

      console.log("📡 Response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Save response not OK:", response.status)
        console.error("❌ Error details:", errorText)
        throw new Error(`Server error: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      console.log("✅ HEALTH DATA SAVED SUCCESSFULLY")
      console.log("📊 Result:", result)
      return result
    } catch (error: any) {
      console.error("❌ SAVE ERROR:", error)
      throw new Error(`Failed to save health data: ${error.message}`)
    }
  },

  // 🎯 FONCTION CORRIGÉE: Récupérer les données avec relation utilisateur
  async getHealthConnectData(selectedDate: Date): Promise<HealthConnectData | null> {
    try {
      const userId = await this.getUserId()
      if (!userId) {
        console.log("❌ No user ID available")
        return null
      }

      const headers = this.getAuthHeaders()
      const dateString = selectedDate.toISOString().split("T")[0]

      // ✅ REQUÊTE AVEC POPULATION DE LA RELATION UTILISATEUR
      const url = `${API_URL}/health-connects?filters[users_permissions_user][id][$eq]=${userId}&filters[Date][$eq]=${dateString}&populate[users_permissions_user]=*`
      
      console.log("🔍 Fetching health data from:", url)

      const response = await fetch(url, {
        method: "GET",
        headers,
      })

      if (!response.ok) {
        console.error("❌ Get response not OK:", response.status)
        const errorText = await response.text()
        console.error("❌ Error details:", errorText)
        return null
      }

      const result = await response.json()
      console.log("📊 Health data retrieved:", result)

      if (!result.data || result.data.length === 0) {
        console.log("📭 No health data found for date:", dateString)
        return null
      }

      // Vérifier que les données appartiennent bien à l'utilisateur connecté
      const healthRecord = result.data[0]
      const recordUserId = healthRecord.attributes.users_permissions_user?.data?.id
      
      if (recordUserId && recordUserId.toString() !== userId) {
        console.error("❌ Data does not belong to current user")
        return null
      }

      console.log("✅ Data belongs to current user:", userId)

      // Mapper les données
      const attrs = healthRecord.attributes
      return {
        steps: this.parseNumber(attrs.Steps, 0),
        distance: this.parseNumber(attrs.Distance, 0),
        total_calories_burned: this.parseNumber(attrs.Total_calories_burned, 0),
        active_calories_burned: this.parseNumber(attrs.active_calories_burned, 0),

        weight: attrs.Weight ? this.parseNumber(attrs.Weight, 0) : undefined,
        body_fat: attrs.Body_fat ? this.parseNumber(attrs.Body_fat, 0) : undefined,
        body_water_mass: attrs.Body_water_mass ? this.parseNumber(attrs.Body_water_mass, 0) : undefined,
        body_temperature: attrs.Body_temperature ? this.parseNumber(attrs.Body_temperature, 0) : undefined,
        bone_mass: attrs.Bone_mass ? this.parseNumber(attrs.Bone_mass, 0) : undefined,

        resting_heart_rate: attrs.Resting_heart_rate ? this.parseNumber(attrs.Resting_heart_rate, 0) : undefined,
        blood_pressure: attrs.Blood_pressure || undefined,
        blood_glucose: attrs.Blood_glucose ? this.parseNumber(attrs.Blood_glucose, 0) : undefined,

        exercise: attrs.Exercise || undefined,
        elevation_gained: attrs.elevation_gained ? this.parseNumber(attrs.elevation_gained, 0) : undefined,
        speed: attrs.Speed ? this.parseNumber(attrs.Speed, 0) : undefined,
        power: attrs.Power ? this.parseNumber(attrs.Power, 0) : undefined,
        vo2_max: attrs.VO2_max ? this.parseNumber(attrs.VO2_max, 0) : undefined,

        sleep: attrs.Sleep ? this.parseNumber(attrs.Sleep, 0) : undefined,
        basal_metabolic_rate: attrs.Basal_metabolic_rate ? this.parseNumber(attrs.Basal_metabolic_rate, 0) : undefined,
        basal_body_temperature: attrs.Basal_body_temperature ? this.parseNumber(attrs.Basal_body_temperature, 0) : undefined,

        respiratory_rate: attrs.Respiratory_rate ? this.parseNumber(attrs.Respiratory_rate, 0) : undefined,
        sexual_activity: attrs.Sexual_activity || undefined,
        spotting: attrs.Spotting || undefined,
        cervical_mucus: attrs.Cervical_mucus || undefined,
        wheelchair_pushes: attrs.Wheelchair_pushes ? this.parseNumber(attrs.Wheelchair_pushes, 0) : undefined,

        userId: userId,
      }
    } catch (error) {
      console.error("❌ Error fetching health data:", error)
      return null
    }
  },

  // 🎯 FONCTION CORRIGÉE: Récupérer les données récentes de l'utilisateur connecté
  async getRecentHealthConnectData(): Promise<HealthConnectData[]> {
    try {
      const userId = await this.getUserId()
      if (!userId) {
        console.log("❌ No user ID available")
        return []
      }

      const headers = this.getAuthHeaders()

      // ✅ REQUÊTE AVEC POPULATION ET FILTRAGE PAR UTILISATEUR
      const url = `${API_URL}/health-connects?filters[users_permissions_user][id][$eq]=${userId}&populate[users_permissions_user]=*&sort=createdAt:desc&pagination[limit]=10`
      
      console.log("🔍 Fetching recent health data from:", url)

      const response = await fetch(url, {
        method: "GET",
        headers,
      })

      if (!response.ok) {
        console.error("❌ Get response not OK:", response.status)
        return []
      }

      const result = await response.json()
      console.log("📊 Recent health data retrieved:", result.data.length, "records")

      // Filtrer et mapper les données de l'utilisateur connecté uniquement
      return result.data
        .filter((record: any) => {
          const recordUserId = record.attributes.users_permissions_user?.data?.id
          return recordUserId && recordUserId.toString() === userId
        })
        .map((record: any) => {
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
      console.error("❌ Error fetching recent health data:", error)
      return []
    }
  },

  // 🆕 FONCTION: Obtenir les informations de l'utilisateur connecté
  async getCurrentUserInfo(): Promise<any> {
    try {
      const userId = await this.getUserId()
      if (!userId) {
        return null
      }

      const headers = this.getAuthHeaders()
      const url = `${API_URL}/users/${userId}`

      const response = await fetch(url, {
        method: "GET",
        headers,
      })

      if (!response.ok) {
        console.error("❌ Failed to get user info:", response.status)
        return null
      }

      const userInfo = await response.json()
      console.log("👤 Current user info:", userInfo)
      return userInfo
    } catch (error) {
      console.error("❌ Error getting user info:", error)
      return null
    }
  },

  // Fonction utilitaire pour parser les nombres
  parseNumber(value: any, defaultValue: number): number {
    if (value === null || value === undefined) return defaultValue
    const parsed = typeof value === "string" ? Number.parseFloat(value) : Number(value)
    return Number.isNaN(parsed) ? defaultValue : parsed
  },

  // 🎯 FONCTION CORRIGÉE: Récupérer toutes les données de l'utilisateur connecté
  async getAllHealthConnectData(): Promise<HealthConnectData[]> {
    try {
      const userId = await this.getUserId()
      if (!userId) {
        return []
      }

      const headers = this.getAuthHeaders()

      // ✅ REQUÊTE AVEC POPULATION ET FILTRAGE STRICT PAR UTILISATEUR
      const url = `${API_URL}/health-connects?filters[users_permissions_user][id][$eq]=${userId}&populate[users_permissions_user]=*&sort=createdAt:desc`
      
      console.log("🔍 Fetching all health data from:", url)

      const response = await fetch(url, {
        method: "GET",
        headers,
      })

      if (!response.ok) {
        console.error("❌ Get all response not OK:", response.status)
        return []
      }

      const result = await response.json()
      console.log("📊 All health data retrieved:", result.data.length, "records")

      // Filtrer strictement par utilisateur connecté
      return result.data
        .filter((record: any) => {
          const recordUserId = record.attributes.users_permissions_user?.data?.id
          const belongsToUser = recordUserId && recordUserId.toString() === userId
          if (!belongsToUser) {
            console.log("⚠️ Filtering out record that doesn't belong to current user")
          }
          return belongsToUser
        })
        .map((record: any) => {
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
      console.error("❌ Error fetching all health data:", error)
      return []
    }
  },

  // Supprimer un enregistrement Health Connect (avec vérification utilisateur)
  async deleteHealthConnectRecord(recordId: string): Promise<boolean> {
    try {
      const userId = await this.getUserId()
      if (!userId) {
        throw new Error("User not authenticated")
      }

      // Vérifier que l'enregistrement appartient à l'utilisateur connecté
      const headers = this.getAuthHeaders()
      const getUrl = `${API_URL}/health-connects/${recordId}?populate[users_permissions_user]=*`
      
      const getResponse = await fetch(getUrl, {
        method: "GET",
        headers,
      })

      if (!getResponse.ok) {
        throw new Error("Record not found")
      }

      const record = await getResponse.json()
      const recordUserId = record.data.attributes.users_permissions_user?.data?.id

      if (!recordUserId || recordUserId.toString() !== userId) {
        throw new Error("❌ Cannot delete record that doesn't belong to current user")
      }

      // Supprimer l'enregistrement
      const deleteUrl = `${API_URL}/health-connects/${recordId}`
      const deleteResponse = await fetch(deleteUrl, {
        method: "DELETE",
        headers,
      })

      if (!deleteResponse.ok) {
        throw new Error("Failed to delete health data")
      }

      console.log("✅ Health data deleted successfully, record ID:", recordId)
      return true
    } catch (error) {
      console.error("❌ Error deleting health data:", error)
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
      console.error("❌ Connection test failed:", error)
      return false
    }
  },
}
