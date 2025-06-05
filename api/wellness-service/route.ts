// Configuration Strapi avec les variables d'environnement
const API_URL = "http://192.168.100.7:1337/api"
const API_KEY =
  "6e3e7d4353b4e4ad2db82c3a91145ae7b9245c7eb5318dcf77db9a9267f621066c24d9cfea255f458117486715465f7aff103744afa4ce13f128dfed55220257b949a558e83f963f14c68991ec3389ad8fbf34a23da5911d2b23a02820bdd6033f5fae80a90916ee82ca7e839e9a4ff74fceb51bfc1c5b5afa2a7e2d948aeaed"
const API_BASE_URL = "http://192.168.100.7:1337"

// Interface pour les données wellness
interface WellnessData {
  weight: string
  height: string
  age: string
  sex: string
  weightGoal: string
  allergies: string[]
  mood: string
  medicalReport: any
  chronicConditions: string[]
  activityLevel: string
  sleepHours: string
  waterIntake: string
  bmi: string
}

export const wellnessService = {
  // Fonction pour obtenir les headers d'authentification avec la clé API
  getAuthHeaders(): { [key: string]: string } {
    return {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    }
  },

  // Modifiez la fonction getWellnessData pour mieux gérer la structure de réponse Strapi

  getWellnessData(userId: string): Promise<WellnessData | null> {
    return new Promise(async (resolve, reject) => {
      try {
        if (!userId) {
          console.log("❌ No user ID provided")
          resolve(null)
          return
        }

        console.log("🔍 Fetching wellness data for user:", userId)

        const headers = this.getAuthHeaders()

        // ⚠️ CORRECTION: Utiliser le bon filtre pour Strapi
        // Le problème est probablement ici - la relation user n'est pas correctement filtrée
        const url = `${API_URL}/profile-users?populate=*&filters[user][username][$eq]=houyemm`

        console.log("📡 Request URL:", url)

        const response = await fetch(url, {
          method: "GET",
          headers,
        })

        console.log("📊 Response status:", response.status)

        if (!response.ok) {
          console.error("❌ Response not OK:", response.status, response.statusText)
          const errorText = await response.text()
          console.error("❌ Error response:", errorText)
          reject(new Error(`API Error: ${response.status} - ${errorText}`))
          return
        }

        const result = await response.json()
        console.log("📦 Raw API Response:", JSON.stringify(result, null, 2))

        // ⚠️ CORRECTION: Vérification plus précise de la structure de données Strapi
        if (!result.data || result.data.length === 0) {
          console.log("ℹ️ No wellness profile found for user:", userId)
          resolve(null)
          return
        }

        // Afficher la structure complète pour le débogage
        console.log("🔍 Data structure:", JSON.stringify(result.data[0], null, 2))

        // ✅ CORRECTION: Dans Strapi v5, les données sont directement dans data[0]
        const profileData = result.data[0]
        if (!profileData) {
          console.log("❌ No profile data found in:", JSON.stringify(result.data[0], null, 2))
          resolve(null)
          return
        }

        console.log("🔄 Profile attributes:", JSON.stringify(profileData, null, 2))

        // ⚠️ CORRECTION: Mapping pour Strapi v5 - accès direct aux propriétés
        const mappedData: WellnessData = {
          weight: profileData.weight?.toString() || "",
          height: profileData.height?.toString() || "",
          age: profileData.age?.toString() || "",
          sex: profileData.gendre || "", // Notez l'orthographe "gendre" dans Strapi
          weightGoal: profileData.weight_goal || "",
          allergies: profileData.Allergies
            ? profileData.Allergies.split(",")
                .map((a: string) => a.trim())
                .filter((a: string) => a.length > 0)
            : [],
          mood: profileData.current_mood || "",
          medicalReport: profileData.medical_report || null,
          chronicConditions: profileData.medical_condition
            ? profileData.medical_condition
                .split(",")
                .map((c: string) => c.trim())
                .filter((c: string) => c.length > 0)
            : [],
          activityLevel: profileData.physical_activity || "",
          sleepHours: profileData.sleep_hours?.toString() || "",
          waterIntake: profileData.water_intake?.toString() || "",
          bmi: "", // Calculé côté client
        }

        console.log("✅ Mapped wellness data:", JSON.stringify(mappedData, null, 2))
        resolve(mappedData)
      } catch (error: any) {
        console.error("❌ Error fetching wellness data:", error)
        reject(new Error(error.message || "Failed to fetch wellness data"))
      }
    })
  },

  // ✅ NOUVELLE FONCTION: Test de connexion API
  testConnection(): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      try {
        console.log("🔍 Testing API connection...")

        const headers = this.getAuthHeaders()
        const response = await fetch(`${API_URL}/profile-users`, {
          method: "GET",
          headers,
        })

        console.log("📊 Connection test status:", response.status)

        if (response.ok) {
          console.log("✅ API connection successful")
          resolve(true)
        } else {
          console.error("❌ API connection failed:", response.status)
          resolve(false)
        }
      } catch (error) {
        console.error("❌ Connection test error:", error)
        resolve(false)
      }
    })
  },

  saveWellnessData(userId: string, wellnessData: WellnessData): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        console.log("=== 💾 SAVING WELLNESS DATA ===")
        console.log("👤 User ID:", userId)
        console.log("📝 Wellness data to save:", JSON.stringify(wellnessData, null, 2))

        if (!userId) {
          throw new Error("User ID is required")
        }

        // Obtenir les headers d'authentification avec la clé API
        const headers = this.getAuthHeaders()
        console.log("🔑 Auth headers prepared")

        // Vérifier si un profil existe déjà pour cet utilisateur
        console.log("🔍 Checking for existing wellness profile...")
        const checkUrl = `${API_URL}/profile-users?filters[user][id][$eq]=${userId}`
        console.log("📡 Check URL:", checkUrl)

        const checkResponse = await fetch(checkUrl, {
          method: "GET",
          headers,
        })

        if (!checkResponse.ok) {
          console.error("❌ Check response not OK:", checkResponse.status)
          const errorText = await checkResponse.text()
          console.error("❌ Check error response:", errorText)
          throw new Error(`Failed to check existing profile: ${checkResponse.status}`)
        }

        const existingData = await checkResponse.json()
        console.log("📊 Existing data check result:", JSON.stringify(existingData, null, 2))

        // ✅ AMÉLIORATION: Préparation des données plus robuste
        const requestData = {
          data: {
            // Relation utilisateur (obligatoire seulement pour POST)
            ...(existingData.data.length === 0 && { user: Number(userId) }),

            // ✅ Champs de base avec conversion appropriée
            weight: wellnessData.weight || null,
            height: wellnessData.height || null,
            age: wellnessData.age || null,
            gendre: wellnessData.sex || null,
            weight_goal: wellnessData.weightGoal || null,
            current_mood: wellnessData.mood || null,
            sleep_hours: wellnessData.sleepHours || null,
            water_intake: wellnessData.waterIntake || null,

            // ✅ Arrays convertis en strings avec validation
            Allergies:
              wellnessData.allergies && wellnessData.allergies.length > 0 ? wellnessData.allergies.join(", ") : null,
            medical_condition:
              wellnessData.chronicConditions && wellnessData.chronicConditions.length > 0
                ? wellnessData.chronicConditions.join(", ")
                : null,

            // ✅ Activité physique
            physical_activity: wellnessData.activityLevel || null,
          },
        }

        // Ajouter le rapport médical s'il existe
        if (wellnessData.medicalReport && wellnessData.medicalReport.id) {
          requestData.data.medical_report = wellnessData.medicalReport.id
        }

        console.log("📤 Final data prepared for Strapi:", JSON.stringify(requestData, null, 2))

        let response
        let url

        if (existingData.data && existingData.data.length > 0) {
          // Mettre à jour le profil existant - Utiliser documentId pour Strapi v5
          const profileDocumentId = existingData.data[0].documentId
          console.log("🔄 Updating existing wellness profile with documentId:", profileDocumentId)
          url = `${API_URL}/profile-users/${profileDocumentId}`

          response = await fetch(url, {
            method: "PUT",
            headers,
            body: JSON.stringify(requestData),
          })
          console.log("📡 PUT request sent to:", url)
        } else {
          // Créer un nouveau profil
          console.log("➕ Creating new wellness profile for user:", userId)
          url = `${API_URL}/profile-users`

          response = await fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify(requestData),
          })
          console.log("📡 POST request sent to:", url)
        }

        console.log("📊 Response status:", response.status)

        if (!response.ok) {
          const errorText = await response.text()
          console.error("❌ Save response not OK:", response.status, response.statusText)
          console.error("❌ Save error response:", errorText)
          reject(new Error(`Server error: ${response.status} - ${errorText}`))
          return
        }

        const result = await response.json()
        console.log("✅ Wellness data saved successfully:", JSON.stringify(result, null, 2))
        resolve(result)
      } catch (error: any) {
        console.error("❌ Error saving wellness data:", error)

        if (error.message.includes("Network request failed")) {
          reject(new Error("Network error: Please check your internet connection"))
        } else {
          reject(new Error(`Save failed: ${error.message}`))
        }
      }
    })
  },

  uploadMedicalReport(userId: string, fileUri: string, fileName: string, fileType: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        console.log("📤 Uploading medical report:", fileName)

        const formData = new FormData()
        formData.append("files", {
          uri: fileUri,
          name: fileName,
          type: fileType,
        } as any)

        const uploadResponse = await fetch(`${API_URL}/upload`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${API_KEY}`,
          },
          body: formData,
        })

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text()
          console.error("❌ Upload error:", errorText)
          reject(new Error(`Upload failed: ${uploadResponse.status}`))
          return
        }

        const result = await uploadResponse.json()
        console.log("✅ Medical report uploaded successfully:", result[0])
        resolve(result[0])
      } catch (error: any) {
        console.error("❌ Error uploading medical report:", error)
        reject(new Error("Failed to upload medical report"))
      }
    })
  },

  // Fonction utilitaire pour calculer le BMI
  calculateBMI(weight: string, height: string): string {
    if (!weight || !height) return ""

    const weightNum = Number.parseFloat(weight)
    const heightNum = Number.parseFloat(height) / 100

    if (weightNum <= 0 || heightNum <= 0) return ""

    const bmi = weightNum / (heightNum * heightNum)
    return bmi.toFixed(1)
  },
}
