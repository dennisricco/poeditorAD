/**
 * Backend API Client
 * Centralized API calls ke Express.js backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001/api';

interface DatabaseConfig {
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
  serviceName?: string; // For Oracle
  path?: string; // For SQLite
}

interface LockeyTranslation {
  languageCode: string;
  key: string;
  value: string;
  category?: string;
}

interface LockeyData {
  translations: LockeyTranslation[];
  metadata?: {
    syncDate?: string;
    source?: string;
    [key: string]: any;
  };
}

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

class BackendApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Generic fetch wrapper dengan error handling
   */
  private async fetchApi<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<ApiResponse> {
    return this.fetchApi('/health');
  }

  /**
   * Get supported database types
   */
  async getSupportedDatabases(): Promise<ApiResponse> {
    return this.fetchApi('/database/supported-types');
  }

  /**
   * Test database connection
   */
  async testConnection(
    type: string,
    config: DatabaseConfig
  ): Promise<ApiResponse> {
    return this.fetchApi('/database/test-connection', {
      method: 'POST',
      body: JSON.stringify({ type, config }),
    });
  }

  /**
   * Execute database query
   */
  async executeQuery(
    type: string,
    config: DatabaseConfig,
    query: string,
    params: any[] = []
  ): Promise<ApiResponse> {
    return this.fetchApi('/database/execute-query', {
      method: 'POST',
      body: JSON.stringify({ type, config, query, params }),
    });
  }

  /**
   * Validate Lockey data structure
   */
  async validateLockeyData(lockeyData: LockeyData): Promise<ApiResponse> {
    return this.fetchApi('/lockey/validate', {
      method: 'POST',
      body: JSON.stringify({ lockeyData }),
    });
  }

  /**
   * Preview Lockey sync queries
   */
  async previewLockeySync(
    lockeyData: LockeyData,
    databaseType: string
  ): Promise<ApiResponse> {
    return this.fetchApi('/lockey/preview', {
      method: 'POST',
      body: JSON.stringify({ lockeyData, databaseType }),
    });
  }

  /**
   * Sync Lockey data to database
   */
  async syncLockeyToDatabase(
    lockeyData: LockeyData,
    databaseType: string,
    databaseConfig: DatabaseConfig
  ): Promise<ApiResponse> {
    return this.fetchApi('/lockey/sync', {
      method: 'POST',
      body: JSON.stringify({ lockeyData, databaseType, databaseConfig }),
    });
  }
}

// Export singleton instance
export const backendApi = new BackendApiClient();

// Export types
export type {
  DatabaseConfig,
  LockeyTranslation,
  LockeyData,
  ApiResponse,
};
