// Service API pour les données de bien-être
class WellnessService {
  private baseUrl = "https://your-api-url.com/api"

  async getWellnessData(userId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/wellness/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${await this.getAuthToken()}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch wellness data")
      }

      return await response.json()
    } catch (error) {
      console.error("Error fetching wellness data:", error)
      throw error
    }
  }

  async saveWellnessData(userId: string, data: any): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/wellness/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${await this.getAuthToken()}`,
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to save wellness data")
      }
    } catch (error) {
      console.error("Error saving wellness data:", error)
      throw error
    }
  }

  async uploadMedicalReport(userId: string, file: any): Promise<string> {
    try {
      const formData = new FormData()
      formData.append("file", {
        uri: file.uri,
        type: file.mimeType,
        name: file.name,
      } as any)
      formData.append("userId", userId)

      const response = await fetch(`${this.baseUrl}/wellness/upload-medical-report`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${await this.getAuthToken()}`,
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to upload medical report")
      }

      const result = await response.json()
      return result.fileUrl
    } catch (error) {
      console.error("Error uploading medical report:", error)
      throw error
    }
  }

  async calculateBMI(weight: number, height: number): Promise<number> {
    // Calcul de l'IMC : poids (kg) / (taille (m))²
    const heightInMeters = height / 100
    return weight / (heightInMeters * heightInMeters)
  }

  async getHealthRecommendations(wellnessData: any): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/wellness/recommendations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${await this.getAuthToken()}`,
        },
        body: JSON.stringify(wellnessData),
      })

      if (!response.ok) {
        throw new Error("Failed to get recommendations")
      }

      const result = await response.json()
      return result.recommendations
    } catch (error) {
      console.error("Error getting recommendations:", error)
      throw error
    }
  }

  private async getAuthToken(): Promise<string> {
    // Récupérer le token d'authentification
    // Remplacez par votre logique d'authentification
    return localStorage.getItem("authToken") || ""
  }
}

export const wellnessService = new WellnessService()