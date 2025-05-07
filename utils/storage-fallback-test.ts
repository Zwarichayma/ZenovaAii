import { anonymousIdService } from "../api/anonymous/anonymous-service"
import { storageFallback } from "./storage-fallback"

/**
 * Tests the storage fallback and anonymous ID persistence
 */
export async function testStoragePersistence() {
  console.log("Testing storage persistence...")

  // Test basic storage operations
  try {
    // Set a test value
    await storageFallback.setItem("test_key", "test_value")
    console.log("Set test value successfully")

    // Get the test value
    const value = await storageFallback.getItem("test_key")
    console.log("Retrieved test value:", value)

    // Verify the value
    if (value === "test_value") {
      console.log("✅ Storage test passed")
    } else {
      console.log("❌ Storage test failed: value mismatch")
    }

    // Clean up
    await storageFallback.removeItem("test_key")
  } catch (error) {
    console.error("❌ Storage test failed with error:", error)
  }

  // Test anonymous ID persistence
  try {
    // Get the anonymous ID
    const id1 = await anonymousIdService.getAnonymousId()
    console.log("Anonymous ID:", id1)

    // Clear the in-memory cache
    // @ts-ignore - Accessing private variable for testing
    global.inMemoryAnonymousId = null

    // Get the ID again (should load from storage)
    const id2 = await anonymousIdService.getAnonymousId()
    console.log("Anonymous ID after cache clear:", id2)

    // Verify the IDs match
    if (id1 === id2) {
      console.log("✅ Anonymous ID persistence test passed")
    } else {
      console.log("❌ Anonymous ID persistence test failed: ID mismatch")
    }
  } catch (error) {
    console.error("❌ Anonymous ID test failed with error:", error)
  }
}
