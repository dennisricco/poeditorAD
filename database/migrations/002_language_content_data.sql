-- ============================================
-- LANGUAGE CONTENT DATA TABLE
-- Stores validated translation exports from POEditor/Lockey
-- ============================================

-- Create table for storing language content versions
CREATE TABLE IF NOT EXISTS public.language_content_data (
  -- Primary key with auto-increment
  language_version BIGSERIAL PRIMARY KEY,
  
  -- Foreign key to user who owns this content
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- POEditor project information
  project_id TEXT NOT NULL,
  project_name TEXT,
  
  -- Language information
  language_code TEXT NOT NULL,
  language_name TEXT,
  
  -- Export format (json, json_key_value, android_strings, ios_strings, etc.)
  export_format TEXT NOT NULL DEFAULT 'json',
  
  -- Cleaning mode used (none, basic, aggressive)
  cleaning_mode TEXT,
  
  -- The actual translation data (JSONB for better querying)
  language_pack JSONB NOT NULL,
  
  -- Version tracking
  version INTEGER DEFAULT 1,
  
  -- Metadata
  terms_count INTEGER,
  file_size_bytes INTEGER,
  
  -- Audit fields
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_time TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_by UUID NOT NULL REFERENCES auth.users(id),
  updated_time TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT language_pack_is_json CHECK (jsonb_typeof(language_pack) IS NOT NULL),
  CONSTRAINT valid_export_format CHECK (export_format IN (
    'json', 'json_key_value', 'android_strings', 'ios_strings', 
    'xliff', 'properties', 'key_value_json', 'po', 'pot', 'mo'
  ))
);

-- ============================================
-- INDEXES for better query performance
-- ============================================

-- Index for user queries
CREATE INDEX idx_language_content_user_id 
  ON public.language_content_data(user_id);

-- Index for project queries
CREATE INDEX idx_language_content_project_id 
  ON public.language_content_data(project_id);

-- Composite index for common queries
CREATE INDEX idx_language_content_project_language 
  ON public.language_content_data(project_id, language_code);

-- Index for version queries
CREATE INDEX idx_language_content_version 
  ON public.language_content_data(project_id, language_code, version DESC);

-- Index for timestamp queries
CREATE INDEX idx_language_content_created_time 
  ON public.language_content_data(created_time DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.language_content_data ENABLE ROW LEVEL SECURITY;

-- Users can view their own language content
CREATE POLICY "Users can view own language content"
  ON public.language_content_data
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own language content
CREATE POLICY "Users can insert own language content"
  ON public.language_content_data
  FOR INSERT
  WITH CHECK (auth.uid() = user_id AND auth.uid() = created_by);

-- Users can update their own language content
CREATE POLICY "Users can update own language content"
  ON public.language_content_data
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = updated_by);

-- Users can delete their own language content
CREATE POLICY "Users can delete own language content"
  ON public.language_content_data
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger to update updated_time automatically
CREATE TRIGGER update_language_content_updated_time
  BEFORE UPDATE ON public.language_content_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get latest version for a project/language combination
CREATE OR REPLACE FUNCTION get_latest_language_version(
  p_project_id TEXT,
  p_language_code TEXT,
  p_user_id UUID
)
RETURNS INTEGER AS $$
DECLARE
  latest_version INTEGER;
BEGIN
  SELECT COALESCE(MAX(version), 0)
  INTO latest_version
  FROM public.language_content_data
  WHERE project_id = p_project_id
    AND language_code = p_language_code
    AND user_id = p_user_id;
  
  RETURN latest_version;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to auto-increment version on insert
CREATE OR REPLACE FUNCTION auto_increment_language_version()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-increment version based on existing versions
  NEW.version := get_latest_language_version(
    NEW.project_id,
    NEW.language_code,
    NEW.user_id
  ) + 1;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-increment version
CREATE TRIGGER set_language_version_on_insert
  BEFORE INSERT ON public.language_content_data
  FOR EACH ROW
  EXECUTE FUNCTION auto_increment_language_version();

-- ============================================
-- COMMENTS for documentation
-- ============================================

COMMENT ON TABLE public.language_content_data IS 
  'Stores validated translation exports from POEditor/Lockey with version control';

COMMENT ON COLUMN public.language_content_data.language_version IS 
  'Unique identifier for each language content record (auto-generated)';

COMMENT ON COLUMN public.language_content_data.language_pack IS 
  'The actual translation data in JSONB format for efficient querying';

COMMENT ON COLUMN public.language_content_data.version IS 
  'Version number for the same project/language combination (auto-incremented)';

COMMENT ON COLUMN public.language_content_data.cleaning_mode IS 
  'The string cleaning mode applied: none, basic, or aggressive';
