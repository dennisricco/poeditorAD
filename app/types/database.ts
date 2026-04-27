export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      language_content_data: {
        Row: {
          language_version: number;
          user_id: string;
          project_id: string;
          project_name: string | null;
          language_code: string;
          language_name: string | null;
          export_format: string;
          cleaning_mode: string | null;
          language_pack: Record<string, any>;
          version: number;
          terms_count: number | null;
          file_size_bytes: number | null;
          created_by: string;
          created_time: string;
          updated_by: string;
          updated_time: string;
        };
        Insert: {
          language_version?: number;
          user_id: string;
          project_id: string;
          project_name?: string | null;
          language_code: string;
          language_name?: string | null;
          export_format?: string;
          cleaning_mode?: string | null;
          language_pack: Record<string, any>;
          version?: number;
          terms_count?: number | null;
          file_size_bytes?: number | null;
          created_by: string;
          created_time?: string;
          updated_by: string;
          updated_time?: string;
        };
        Update: {
          language_version?: number;
          user_id?: string;
          project_id?: string;
          project_name?: string | null;
          language_code?: string;
          language_name?: string | null;
          export_format?: string;
          cleaning_mode?: string | null;
          language_pack?: Record<string, any>;
          version?: number;
          terms_count?: number | null;
          file_size_bytes?: number | null;
          created_by?: string;
          created_time?: string;
          updated_by?: string;
          updated_time?: string;
        };
      };
    };
  };
}
