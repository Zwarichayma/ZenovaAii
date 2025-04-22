/**
 * A simple ID generator that doesn't rely on crypto.getRandomValues()
 * This is less secure than UUID but works in all environments
 */

// Characters to use in the ID
const CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

/**
 * Generate a simple random ID of specified length
 * @param length The length of the ID to generate
 * @returns A random string ID
 */
export function generateSimpleId(length: number = 24): string {
  let id = '';
  
  // Current timestamp for uniqueness
  const timestamp = Date.now().toString(36);
  
  // Add some randomness
  for (let i = 0; i < length - timestamp.length; i++) {
    const randomIndex = Math.floor(Math.random() * CHARS.length);
    id += CHARS[randomIndex];
  }
  
  // Combine timestamp and random string for better uniqueness
  return timestamp + id;
}

/**
 * Generate a simple ID that mimics a UUID format
 * Not a real UUID but follows the same pattern
 * @returns A string in UUID format
 */
export function generateSimpleUuid(): string {
  const segments = [8, 4, 4, 4, 12]; // UUID segment lengths
  const uuid = segments.map(length => {
    let segment = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * CHARS.length);
      segment += CHARS[randomIndex];
    }
    return segment;
  }).join('-');
  
  return uuid;
}
