-- ============================================
-- POSTGRESQL LOCAL DATABASE SETUP
-- Translation Manager - Language Content Storage
-- ============================================

-- Create database (run this first as superuser)
-- CREATE DATABASE translation_manager;
-- \c translation_manager

-- ============================================
-- MAIN TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS language_content_data (
  -- Primary key with auto-increment
  language_version BIGSERIAL PRIMARY KEY,
  
  -- User information (for local use, default to 'local_user')
  user_id VARCHAR(255) DEFAULT 'local_user' NOT NULL,
  
  -- POEditor project information
  project_id TEXT NOT NULL,
  project_name TEXT,
  
  -- Language information
  language_code TEXT NOT NULL,
  language_name TEXT,
  
  -- Export format (json, android_strings, ios_strings, etc.)
  export_format TEXT NOT NULL DEFAULT 'json',
  
  -- Cleaning mode used (none, basic, aggressive)
  cleaning_mode TEXT,
  
  -- The actual translation data (JSONB for better querying)
  language_pack JSONB NOT NULL,
  
  -- Version tracking (auto-incremented per project/language)
  version INTEGER DEFAULT 1,
  
  -- Metadata
  terms_count INTEGER,
  file_size_bytes INTEGER,
  
  -- Audit fields
  created_by VARCHAR(255) DEFAULT 'local_user' NOT NULL,
  created_time TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_by VARCHAR(255) DEFAULT 'local_user' NOT NULL,
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

CREATE INDEX IF NOT EXISTS idx_language_content_user_id 
  ON language_content_data(user_id);

CREATE INDEX IF NOT EXISTS idx_language_content_project_id 
  ON language_content_data(project_id);

CREATE INDEX IF NOT EXISTS idx_language_content_project_language 
  ON language_content_data(project_id, language_code);

CREATE INDEX IF NOT EXISTS idx_language_content_version 
  ON language_content_data(project_id, language_code, version DESC);

CREATE INDEX IF NOT EXISTS idx_language_content_created_time 
  ON language_content_data(created_time DESC);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to auto-increment version on insert
CREATE OR REPLACE FUNCTION auto_increment_language_version()
RETURNS TRIGGER AS $$
DECLARE
  latest_version INTEGER;
BEGIN
  -- Get the latest version for this project/language combination
  SELECT COALESCE(MAX(version), 0)
  INTO latest_version
  FROM language_content_data
  WHERE project_id = NEW.project_id
    AND language_code = NEW.language_code
    AND user_id = NEW.user_id;
  
  -- Set the new version
  NEW.version := latest_version + 1;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_time on update
CREATE OR REPLACE FUNCTION update_updated_time()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_time = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger to auto-increment version on insert
DROP TRIGGER IF EXISTS set_language_version_on_insert ON language_content_data;
CREATE TRIGGER set_language_version_on_insert
  BEFORE INSERT ON language_content_data
  FOR EACH ROW
  EXECUTE FUNCTION auto_increment_language_version();

-- Trigger to update updated_time on update
DROP TRIGGER IF EXISTS update_language_content_updated_time ON language_content_data;
CREATE TRIGGER update_language_content_updated_time
  BEFORE UPDATE ON language_content_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_time();

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Uncomment to insert sample data
/*
INSERT INTO language_content_data (
  project_id,
  project_name,
  language_code,
  language_name,
  export_format,
  cleaning_mode,
  language_pack,
  terms_count,
  file_size_bytes
) VALUES 
(
  'sample_project_001',
  'Sample Mobile App',
  'en',
  'English',
  'json',
  'basic',
  '{"welcome": "Welcome to our app", "login": "Login", "logout": "Logout", "settings": "Settings"}'::jsonb,
  4,
  512
),
(
  'sample_project_001',
  'Sample Mobile App',
  'id',
  'Indonesian',
  'json',
  'basic',
  '{"welcome": "Selamat datang di aplikasi kami", "login": "Masuk", "logout": "Keluar", "settings": "Pengaturan"}'::jsonb,
  4,
  612
);
*/

-- ============================================
-- USEFUL QUERIES
-- ============================================

-- View all translations
-- SELECT * FROM language_content_data ORDER BY created_time DESC;

-- Get latest version for each language in a project
-- SELECT DISTINCT ON (language_code) *
-- FROM language_content_data
-- WHERE project_id = 'your_project_id'
-- ORDER BY language_code, version DESC;

-- Get version history for a specific language
-- SELECT language_version, version, created_time, terms_count, file_size_bytes
-- FROM language_content_data
-- WHERE project_id = 'your_project_id' AND language_code = 'en'
-- ORDER BY version DESC;

-- Get translation count by project
-- SELECT project_id, project_name, COUNT(*) as total_versions
-- FROM language_content_data
-- GROUP BY project_id, project_name
-- ORDER BY total_versions DESC;

-- ============================================
-- MAINTENANCE QUERIES
-- ============================================

-- Delete old versions (keep only last 10 versions per language)
-- WITH ranked_versions AS (
--   SELECT language_version,
--          ROW_NUMBER() OVER (
--            PARTITION BY project_id, language_code 
--            ORDER BY version DESC
--          ) as rn
--   FROM language_content_data
-- )
-- DELETE FROM language_content_data
-- WHERE language_version IN (
--   SELECT language_version FROM ranked_versions WHERE rn > 10
-- );

-- Get database size
-- SELECT pg_size_pretty(pg_database_size('translation_manager'));

-- Get table size
-- SELECT pg_size_pretty(pg_total_relation_size('language_content_data'));

-- ============================================
-- BACKUP & RESTORE
-- ============================================

-- Backup database:
-- pg_dump -U postgres translation_manager > backup_$(date +%Y%m%d).sql

-- Restore database:
-- psql -U postgres translation_manager < backup_20260422.sql

-- ============================================
-- SETUP COMPLETE
-- ============================================

SELECT 'PostgreSQL database setup completed successfully!' as status;
SELECT 'Table: language_content_data created' as info;
SELECT 'Indexes created for optimal performance' as info;
SELECT 'Triggers configured for auto-versioning' as info;
