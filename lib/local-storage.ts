"use client";

// We don't need the currentUser import on the client side
// because we're using a session ID instead

// Prefix for all storage keys to avoid collisions
const STORAGE_PREFIX = "postora_";

// Keys for different types of data
export const STORAGE_KEYS = {
  BULLET_POINTS: "bulletPoints",
  STYLE: "style",
  PRIMARY_COLOR: "primaryColor",
  BACKGROUND_COLOR: "backgroundColor",
  TEXT_COLOR: "textColor",
  OUTPUT_FORMAT: "outputFormat",
  LOGO: "logo",
  FONT_FAMILY: "fontFamily",
};

/**
 * Get a synchronous user-specific key for localStorage
 * This creates a key with a session ID that will be unique to this browser session
 */
export function getSessionKey(key: string): string {
  // Get or create a session ID for this browser session
  let sessionId = localStorage.getItem(`${STORAGE_PREFIX}sessionId`);
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(`${STORAGE_PREFIX}sessionId`, sessionId);
  }
  
  return `${STORAGE_PREFIX}${sessionId}_${key}`;
}

/**
 * Store data in localStorage with user isolation
 */
export function storeData(key: string, data: any): void {
  const sessionKey = getSessionKey(key);
  try {
    localStorage.setItem(sessionKey, JSON.stringify(data));
  } catch (error) {
    console.error(`Error storing data for key ${key}:`, error);
  }
}

/**
 * Get data from localStorage with user isolation
 */
export function getData(key: string, defaultValue: any = null): any {
  const sessionKey = getSessionKey(key);
  try {
    const storedData = localStorage.getItem(sessionKey);
    if (storedData) {
      return JSON.parse(storedData);
    }
  } catch (error) {
    console.error(`Error getting data for key ${key}:`, error);
  }
  return defaultValue;
}

/**
 * Remove data from localStorage with user isolation
 */
export function removeData(key: string): void {
  const sessionKey = getSessionKey(key);
  try {
    localStorage.removeItem(sessionKey);
  } catch (error) {
    console.error(`Error removing data for key ${key}:`, error);
  }
}

/**
 * Clear all user data from localStorage
 */
export function clearUserData(): void {
  try {
    // Get the session ID
    const sessionId = localStorage.getItem(`${STORAGE_PREFIX}sessionId`);
    
    if (sessionId) {
      // Clear all keys that start with this session ID
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(`${STORAGE_PREFIX}${sessionId}_`)) {
          localStorage.removeItem(key);
        }
      });
      
      // Also remove the session ID itself
      localStorage.removeItem(`${STORAGE_PREFIX}sessionId`);
    }
  } catch (error) {
    console.error("Error clearing user data:", error);
  }
} 