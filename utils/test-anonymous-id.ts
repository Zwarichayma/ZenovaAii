import { anonymousIdService } from "@/api/anonymous/anonymous-service";

/**
 * Utility to test anonymous ID persistence
 */
export async function testAnonymousIdPersistence() {
  try {
    console.log("Testing anonymous ID persistence...")

    // Get the ID (should retrieve from storage if exists)
    const id1 = await anonymousIdService.getAnonymousId()
    console.log("First call:", id1)

    // Get the ID again (should be the same)
    const id2 = await anonymousIdService.getAnonymousId()
    console.log("Second call:", id2)

    // Clear in-memory cache but keep storage
    ;(global as any).inMemoryAnonymousId = null

    // Get the ID again (should retrieve from storage)
    const id3 = await anonymousIdService.getAnonymousId()
    console.log("After clearing memory cache:", id3)

    // Verify all IDs are the same
    const allSame = id1 === id2 && id2 === id3
    console.log("All IDs are the same:", allSame)

    return {
      success: allSame,
      ids: [id1, id2, id3],
    }
  } catch (error) {
    console.error("Test failed:", error)
    return {
      success: false,
      error,
    }
  }
}
