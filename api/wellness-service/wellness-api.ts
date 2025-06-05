import { authService } from "../auth/auth-service"

// API spécialisée pour les opérations wellness avec votre structure existante
export const wellnessAPI = {
  // Créer un profil wellness
  async createWellnessProfile(wellnessData: any) {
    try {
      const client = await authService.createAuthenticatedClient()
      const userId = await this.getCurrentUserId()

      const response = await client.post("/profile-users", {
        data: {
          ...wellnessData,
          user: userId,
        },
      })

      console.log("Wellness profile created:", response.data)
      return response.data
    } catch (error) {
      console.error("Error creating wellness profile:", error)
      throw error
    }
  },

  // Mettre à jour un profil wellness
  async updateWellnessProfile(profileId: number, wellnessData: any) {
    try {
      const client = await authService.createAuthenticatedClient()

      const response = await client.put(`/profile-users/${profileId}`, {
        data: wellnessData,
      })

      console.log("Wellness profile updated:", response.data)
      return response.data
    } catch (error) {
      console.error("Error updating wellness profile:", error)
      throw error
    }
  },

  // Supprimer un profil wellness
  async deleteWellnessProfile(profileId: number) {
    try {
      const client = await authService.createAuthenticatedClient()

      await client.delete(`/profile-users/${profileId}`)
      console.log("Wellness profile deleted")
      return true
    } catch (error) {
      console.error("Error deleting wellness profile:", error)
      throw error
    }
  },

  // Obtenir tous les profils wellness d'un utilisateur
  async getUserWellnessProfiles(userId?: number) {
    try {
      const client = await authService.createAuthenticatedClient()
      const currentUserId = userId || (await this.getCurrentUserId())

      const response = await client.get(`/profile-users?filters[user][id][$eq]=${currentUserId}&populate=*`)

      return response.data.data || []
    } catch (error) {
      console.error("Error fetching user wellness profiles:", error)
      throw error
    }
  },

  // Fonction utilitaire pour obtenir l'ID utilisateur actuel
  async getCurrentUserId(): Promise<number | null> {
    try {
      const userData = await authService.getUserData()
      return userData?.id || null
    } catch (error) {
      console.error("Error getting current user ID:", error)
      return null
    }
  },

  // Upload de fichier médical avec gestion d'erreurs améliorée
  async uploadMedicalFile(fileUri: string, fileName: string, fileType: string) {
    try {
      const client = await authService.createAuthenticatedClient()

      const formData = new FormData()
      formData.append("files", {
        uri: fileUri,
        name: fileName,
        type: fileType,
      } as any)

      // Ajouter des métadonnées
      formData.append(
        "fileInfo",
        JSON.stringify({
          name: fileName,
          caption: "Medical report",
          alternativeText: "User medical report",
        }),
      )

      const response = await client.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000, // 30 secondes timeout pour les gros fichiers
      })

      return response.data[0]
    } catch (error) {
      console.error("Error uploading medical file:", error)

      if (error.code === "ECONNABORTED") {
        throw new Error("Upload timeout - file too large or slow connection")
      } else if (error.response?.status === 413) {
        throw new Error("File too large - maximum size exceeded")
      } else {
        throw new Error("Failed to upload file")
      }
    }
  },
}
