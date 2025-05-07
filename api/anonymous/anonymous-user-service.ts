import { anonymousIdService } from "./anonymous-service"

/**
 * Service for handling anonymous user data
 */
export const anonymousUserService = {
  /**
   * Tracks an anonymous user action
   * @param action The action to track
   * @param data Additional data for the action
   */
  async trackAction(action: string, data: any = {}): Promise<void> {
    try {
      const anonymousId = await anonymousIdService.getAnonymousId()

      console.log(`Tracking action "${action}" for anonymous user ${anonymousId}`, data)

      // Since we can't modify the backend, we'll just log the action
      // In a real implementation, you would send this to your API
      // Example:
      // await fetch('/api/anonymous/track', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     anonymousId,
      //     action,
      //     data,
      //     timestamp: new Date().toISOString(),
      //     // Add a unique request ID to help prevent duplicates
      //     requestId: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
      //   })
      // })
    } catch (error) {
      console.error("Error tracking anonymous action:", error)
    }
  },

  /**
   * Converts anonymous user data to a registered user
   * @param anonymousId The anonymous ID to convert
   * @param userId Optional user ID to convert to
   */
  async convertToUser(anonymousId: string, userId?: string): Promise<void> {
    try {
      console.log(`Converting anonymous user ${anonymousId} to registered user${userId ? ` ${userId}` : ""}`)

      // Since we can't modify the backend, we'll just log the conversion
      // In a real implementation, you would send this to your API
      // Example:
      // await fetch('/api/anonymous/convert', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     anonymousId,
      //     userId,
      //     timestamp: new Date().toISOString(),
      //     // Add a unique request ID to help prevent duplicates
      //     requestId: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
      //   })
      // })

      // Clear the anonymous ID after successful conversion
      await anonymousIdService.clearAnonymousId()
    } catch (error) {
      console.error("Error converting anonymous user:", error)
      throw error
    }
  },

  /**
   * Gets data for the current anonymous user
   */
  async getUserData(): Promise<any> {
    try {
      const anonymousId = await anonymousIdService.getAnonymousId()

      // Since we can't modify the backend, we'll just return mock data
      // In a real implementation, you would fetch this from your API
      // Example:
      // const response = await fetch(`/api/anonymous/user/${anonymousId}`)
      // return await response.json()

      return {
        id: anonymousId,
        lastActivity: new Date().toISOString(),
        convertedToUser: false,
      }
    } catch (error) {
      console.error("Error getting anonymous user data:", error)
      return null
    }
  },
}
