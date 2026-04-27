/**
 * Utility functions for managing translations in Supabase database
 */

import { supabase } from '@/app/lib/supabase-client';

export interface SavedTranslation {
  languageVersion: number;
  userId: string;
  projectId: string;
  projectName: string | null;
  languageCode: string;
  languageName: string | null;
  exportFormat: string;
  cleaningMode: string | null;
  languagePack: Record<string, any>;
  version: number;
  termsCount: number | null;
  fileSizeBytes: number | null;
  createdBy: string;
  createdTime: string;
  updatedBy: string;
  updatedTime: string;
}

export interface SaveTranslationParams {
  projectId: string;
  projectName?: string;
  languageCode: string;
  languageName?: string;
  exportFormat: string;
  cleaningMode?: string;
  languagePack: Record<string, any>;
  termsCount?: number;
}

/**
 * Save translation to database directly using Supabase client
 */
export async function saveTranslationToDatabase(
  params: SaveTranslationParams
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: 'You must be logged in to save translations',
      };
    }

    // Calculate metadata
    const languagePackString = JSON.stringify(params.languagePack);
    const fileSizeBytes = new Blob([languagePackString]).size;

    // Prepare data for insertion
    const insertData: any = {
      user_id: user.id,
      project_id: params.projectId,
      project_name: params.projectName || null,
      language_code: params.languageCode,
      language_name: params.languageName || null,
      export_format: params.exportFormat,
      cleaning_mode: params.cleaningMode || null,
      language_pack: params.languagePack,
      terms_count: params.termsCount || Object.keys(params.languagePack).length,
      file_size_bytes: fileSizeBytes,
      created_by: user.id,
      updated_by: user.id,
    };

    // Insert into database
    const { data, error } = await supabase
      .from('language_content_data')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return {
        success: false,
        error: error.message || 'Failed to save translation',
      };
    }

    const result: any = data;

    return {
      success: true,
      data: {
        languageVersion: result.language_version,
        version: result.version,
        projectId: result.project_id,
        languageCode: result.language_code,
        createdTime: result.created_time,
      },
    };
  } catch (error) {
    console.error('Error saving translation to database:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get saved translations from database directly using Supabase client
 */
export async function getSavedTranslations(
  projectId?: string,
  languageCode?: string,
  version?: number
): Promise<{ success: boolean; data?: SavedTranslation[]; error?: string }> {
  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: 'You must be logged in to view translations',
      };
    }

    // Build query
    let query = supabase
      .from('language_content_data')
      .select('*')
      .eq('user_id' as any, user.id as any)
      .order('created_time', { ascending: false });

    if (projectId) {
      query = query.eq('project_id' as any, projectId as any);
    }

    if (languageCode) {
      query = query.eq('language_code' as any, languageCode as any);
    }

    if (version) {
      query = query.eq('version' as any, version as any);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch translations',
      };
    }

    // Map snake_case database columns to camelCase TypeScript interface
    const mappedData: SavedTranslation[] = (data || []).map((row: any) => ({
      languageVersion: row.language_version,
      userId: row.user_id,
      projectId: row.project_id,
      projectName: row.project_name,
      languageCode: row.language_code,
      languageName: row.language_name,
      exportFormat: row.export_format,
      cleaningMode: row.cleaning_mode,
      languagePack: row.language_pack,
      version: row.version,
      termsCount: row.terms_count,
      fileSizeBytes: row.file_size_bytes,
      createdBy: row.created_by,
      createdTime: row.created_time,
      updatedBy: row.updated_by,
      updatedTime: row.updated_time,
    }));

    return {
      success: true,
      data: mappedData,
    };
  } catch (error) {
    console.error('Error fetching translations from database:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Delete saved translation from database directly using Supabase client
 */
export async function deleteTranslationFromDatabase(
  languageVersion: number
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: 'You must be logged in to delete translations',
      };
    }

    // Delete from database
    const { error } = await supabase
      .from('language_content_data')
      .delete()
      .eq('language_version' as any, languageVersion as any)
      .eq('user_id' as any, user.id as any);

    if (error) {
      console.error('Database error:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete translation',
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error deleting translation from database:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get latest version number for a project/language combination
 */
export async function getLatestVersion(
  projectId: string,
  languageCode: string
): Promise<number> {
  const result = await getSavedTranslations(projectId, languageCode);
  
  if (result.success && result.data && result.data.length > 0) {
    return Math.max(...result.data.map(t => t.version));
  }
  
  return 0;
}

/**
 * Format file size to human-readable format
 */
export function formatFileSize(bytes: number | null): string {
  if (!bytes) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Compare two translation versions
 */
export function compareTranslations(
  oldTranslation: Record<string, any>,
  newTranslation: Record<string, any>
): {
  added: string[];
  removed: string[];
  modified: string[];
  unchanged: string[];
} {
  const oldKeys = new Set(Object.keys(oldTranslation));
  const newKeys = new Set(Object.keys(newTranslation));

  const added: string[] = [];
  const removed: string[] = [];
  const modified: string[] = [];
  const unchanged: string[] = [];

  // Check for added and modified keys
  for (const key of newKeys) {
    if (!oldKeys.has(key)) {
      added.push(key);
    } else if (oldTranslation[key] !== newTranslation[key]) {
      modified.push(key);
    } else {
      unchanged.push(key);
    }
  }

  // Check for removed keys
  for (const key of oldKeys) {
    if (!newKeys.has(key)) {
      removed.push(key);
    }
  }

  return { added, removed, modified, unchanged };
}
