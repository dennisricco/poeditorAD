/**
 * Utility functions for managing translation files in localStorage
 */

export interface StoredTranslation {
  projectId: string;
  languageCode: string;
  format: string;
  timestamp: string;
  data: Record<string, any>;
}

const STORAGE_PREFIX = 'poeditor_original_';

/**
 * Save translation data to localStorage
 */
export function saveTranslationToStorage(
  projectId: string,
  languageCode: string,
  format: string,
  data: Record<string, any>
): void {
  const storageKey = `${STORAGE_PREFIX}${projectId}_${languageCode}_${format}`;
  const storageData: StoredTranslation = {
    projectId,
    languageCode,
    format,
    timestamp: new Date().toISOString(),
    data,
  };
  
  try {
    localStorage.setItem(storageKey, JSON.stringify(storageData));
    console.log('Translation saved to localStorage:', storageKey);
  } catch (error) {
    console.error('Failed to save translation to localStorage:', error);
    throw new Error('Storage quota exceeded or localStorage unavailable');
  }
}

/**
 * Get translation data from localStorage
 */
export function getTranslationFromStorage(
  projectId: string,
  languageCode: string,
  format: string
): StoredTranslation | null {
  const storageKey = `${STORAGE_PREFIX}${projectId}_${languageCode}_${format}`;
  
  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return null;
    
    return JSON.parse(stored) as StoredTranslation;
  } catch (error) {
    console.error('Failed to retrieve translation from localStorage:', error);
    return null;
  }
}

/**
 * Get all stored translations for a project
 */
export function getAllStoredTranslations(projectId: string): StoredTranslation[] {
  const translations: StoredTranslation[] = [];
  
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`${STORAGE_PREFIX}${projectId}_`)) {
        const stored = localStorage.getItem(key);
        if (stored) {
          translations.push(JSON.parse(stored));
        }
      }
    }
  } catch (error) {
    console.error('Failed to retrieve translations from localStorage:', error);
  }
  
  return translations.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

/**
 * Delete translation from localStorage
 */
export function deleteTranslationFromStorage(
  projectId: string,
  languageCode: string,
  format: string
): void {
  const storageKey = `${STORAGE_PREFIX}${projectId}_${languageCode}_${format}`;
  
  try {
    localStorage.removeItem(storageKey);
    console.log('Translation removed from localStorage:', storageKey);
  } catch (error) {
    console.error('Failed to delete translation from localStorage:', error);
  }
}

/**
 * Clear all stored translations for a project
 */
export function clearProjectTranslations(projectId: string): void {
  try {
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`${STORAGE_PREFIX}${projectId}_`)) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log(`Cleared ${keysToRemove.length} translations for project ${projectId}`);
  } catch (error) {
    console.error('Failed to clear project translations:', error);
  }
}

/**
 * Get storage size for a project (in bytes)
 */
export function getProjectStorageSize(projectId: string): number {
  let totalSize = 0;
  
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`${STORAGE_PREFIX}${projectId}_`)) {
        const value = localStorage.getItem(key);
        if (value) {
          totalSize += key.length + value.length;
        }
      }
    }
  } catch (error) {
    console.error('Failed to calculate storage size:', error);
  }
  
  return totalSize;
}

/**
 * Format storage size to human-readable format
 */
export function formatStorageSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
