import { storageFallback } from "./storage-fallback"

/**
 * Utility to debug storage issues
 */
export const storageDebug = {
  /**
   * Test if storage is working properly
   */
  testStorage: async (): Promise<{ success: boolean; error?: any }> => {
    const testKey = "storage_test_key"
    const testValue = "storage_test_value_" + Date.now()

    try {
      // Test setting a value
      await storageFallback.setItem(testKey, testValue)
      console.log("Storage test: Set value successfully")

      // Test getting the value
      const retrievedValue = await storageFallback.getItem(testKey)
      console.log("Storage test: Retrieved value:", retrievedValue)

      // Test removing the value
      await storageFallback.removeItem(testKey)
      console.log("Storage test: Removed value successfully")

      // Verify the value was removed
      const afterRemoval = await storageFallback.getItem(testKey)
      console.log("Storage test: After removal:", afterRemoval)

      // Check if everything worked as expected
      const success = retrievedValue === testValue && afterRemoval === null

      return {
        success,
        details: {
          testValue,
          retrievedValue,
          afterRemoval,
          match: retrievedValue === testValue,
        },
      }
    } catch (error) {
      console.error("Storage test failed:", error)
      return { success: false, error }
    }
  },

  /**
   * List all keys in storage
   */
  listAllKeys: async (): Promise<string[]> => {
    try {
      // This assumes your storageFallback has an getAllKeys method
      // If it doesn't, you'll need to implement this differently
      if (typeof storageFallback.getAllKeys === "function") {
        return await storageFallback.getAllKeys()
      } else {
        console.warn("storageFallback.getAllKeys is not available")
        return []
      }
    } catch (error) {
      console.error("Failed to list storage keys:", error)
      return []
    }
  },

  /**
   * Get the value for a specific key
   */
  getValueForKey: async (key: string): Promise<any> => {
    try {
      const value = await storageFallback.getItem(key)
      return value
    } catch (error) {
      console.error(`Failed to get value for key ${key}:`, error)
      return null
    }
  },

  /**
   * Clear all storage (use with caution!)
   */
  clearAllStorage: async (): Promise<boolean> => {
    try {
      // This assumes your storageFallback has a clear method
      // If it doesn't, you'll need to implement this differently
      if (typeof storageFallback.clear === "function") {
        await storageFallback.clear()
        return true
      } else {
        console.warn("storageFallback.clear is not available")
        return false
      }
    } catch (error) {
      console.error("Failed to clear storage:", error)
      return false
    }
  },
}
