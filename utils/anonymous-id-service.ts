import { storageFallback } from "./storage-fallback"

// Key for storing the anonymous ID in local storage
const ANONYMOUS_ID_KEY = "anonymousId"

// In-memory cache to avoid repeated storage reads
let inMemoryAnonymousId: string | null = null

/**
 * Generates a simple unique ID without relying on crypto.getRandomValues()
 */
function generateSimpleUniqueId(length = 24): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  const timestamp = new Date().getTime().toString()
  let result = ""

  // Add timestamp to ensure uniqueness
  result += timestamp

  // Add random characters to complete the desired length
  const remainingLength = length - timestamp.length
  for (let i = 0; i < remainingLength; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length)
    result += chars[randomIndex]
  }

  return result
}

/**
 * Service for managing anonymous IDs with improved persistence
 */
export const anonymousIdService = {
  /**
   * Gets or generates an anonymous ID with guaranteed persistence
   * @returns Promise<string> The anonymous ID
   */
  async getAnonymousId(): Promise<string> {
    // Return cached ID if available
    if (inMemoryAnonymousId) {
      return inMemoryAnonymousId
    }

    try {
      // Try to retrieve ID from storage
      const storedId = await storageFallback.getItem(ANONYMOUS_ID_KEY)

      if (storedId) {
        // Use existing ID if found
        inMemoryAnonymousId = storedId
        console.log("Anonymous ID retrieved from storage:", storedId)
        return storedId
      }

      // Generate a new ID if none exists
      const newId = generateSimpleUniqueId()

      // Save to storage with proper error handling
      try {
        await storageFallback.setItem(ANONYMOUS_ID_KEY, newId)
        console.log("New anonymous ID saved to storage:", newId)
      } catch (storageError) {
        console.error("Failed to save anonymous ID to storage:", storageError)
        // Continue with the new ID even if storage fails
      }

      // Cache the new ID
      inMemoryAnonymousId = newId
      console.log("New anonymous ID generated:", newId)
      return newId
    } catch (error) {
      console.error("Error managing anonymous ID:", error)

      // Generate a fallback ID if everything fails
      // Note: This will not persist across sessions
      const fallbackId = generateSimpleUniqueId()
      console.log("Fallback anonymous ID generated (non-persistent):", fallbackId)
      return fallbackId
    }
  },

  /**
   * Resets the anonymous ID by generating a new one
   * @returns Promise<string> The new anonymous ID
   */
  async resetAnonymousId(): Promise<string> {
    try {
      // Generate a new ID
      const newId = generateSimpleUniqueId()

      // Save to storage
      await storageFallback.setItem(ANONYMOUS_ID_KEY, newId)

      // Update in-memory cache
      inMemoryAnonymousId = newId

      console.log("Anonymous ID reset to:", newId)
      return newId
    } catch (error) {
      console.error("Error resetting anonymous ID:", error)
      throw error
    }
  },

  /**
   * Clears the anonymous ID from storage
   */
  async clearAnonymousId(): Promise<void> {
    try {
      await storageFallback.removeItem(ANONYMOUS_ID_KEY)
      inMemoryAnonymousId = null
      console.log("Anonymous ID cleared from storage")
    } catch (error) {
      console.error("Error clearing anonymous ID:", error)
      throw error
    }
  },
}
