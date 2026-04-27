-- ============================================
-- SQLITE LOCAL DATABASE SETUP
-- Translation Manager - Language Content Storage
-- ============================================

-- To use this file:
-- 1. Install SQLite: https://www.sqlite.org/download.html
-- 2. Create database: sqlite3 translation_manager.db
-- 3. Run this script: .read sqlite.sql

-- ============================================
-- MAIN TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS language_content_data (
  -- Primary key with auto-increment
  language_version INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- User information
  user_id TEXT NOT NULL DEFAULT 'local_user',
  
  -- POEditor project information
  project_id TEXT NOT NULL,
  project_name TEXT,
  
  -- Language information
  language_code TEXT NOT NULL,
  language_name TEXT,
  
  -- Export format
  export_format TEXT NOT NULL DEFAULT 'json',
  
  -- Cleaning mode
  cleaning_mode TEXT,
  
  -- The actual translation data (JSON as TEXT)
  language_pack TEXT NOT NULL,
  
  -- Version tracking
  version INTEGER NOT NULL DEFAULT 1,
  
  -- Metadata
  terms_count INTEGER,
  file_size_bytes INTEGER,
  
  -- Audit fields
  created_by TEXT NOT NULL DEFAULT 'local_user',
  created_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_by TEXT NOT NULL DEFAULT 'local_user',
  updated_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraint to ensure valid JSON
  CHECK(json_valid(language_pack) = 1),
  
  -- Constraint for export format
  CHECK(export_format IN (
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
-- TRIGGERS
-- ============================================

-- Trigger to auto-increment version on insert
DROP TRIGGER IF EXISTS set_language_version_on_insert;

CREATE TRIGGER set_language_version_on_insert
BEFORE INSERT ON language_content_data
FOR EACH ROW
WHEN NEW.version = 1
BEGIN
  SELECT RAISE(IGNORE)
  WHERE EXISTS (
    SELECT 1 FROM language_content_data
    WHERE project_id = NEW.project_id
      AND language_code = NEW.language_code
      AND user_id = NEW.user_id
  );
END;

-- Alternative trigger for version increment
DROP TRIGGER IF EXISTS auto_increment_version;

CREATE TRIGGER auto_increment_version
AFTER INSERT ON language_content_data
FOR EACH ROW
BEGIN
  UPDATE language_content_data
  SET version = (
    SELECT COUNT(*) 
    FROM language_content_data 
    WHERE project_id = NEW.project_id 
      AND language_code = NEW.language_code
      AND user_id = NEW.user_id
      AND language_version <= NEW.language_version
  )
  WHERE language_version = NEW.language_version;
END;

-- Trigger to update updated_time on update
DROP TRIGGER IF EXISTS update_language_content_updated_time;

CREATE TRIGGER update_language_content_updated_time
AFTER UPDATE ON language_content_data
FOR EACH ROW
BEGIN
  UPDATE language_content_data
  SET updated_time = CURRENT_TIMESTAMP
  WHERE language_version = NEW.language_version;
END;

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
  '{"welcome": "Welcome to our app", "login": "Login", "logout": "Logout", "settings": "Settings"}',
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
  '{"welcome": "Selamat datang di aplikasi kami", "login": "Masuk", "logout": "Keluar", "settings": "Pengaturan"}',
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
-- SELECT *
-- FROM language_content_data
-- WHERE project_id = 'your_project_id'
--   AND (language_code, version) IN (
--     SELECT language_code, MAX(version)
--     FROM language_content_data
--     WHERE project_id = 'your_project_id'
--     GROUP BY language_code
--   );

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

-- Search within JSON data (SQLite 3.38.0+)
-- SELECT project_id, language_code, json_extract(language_pack, '$.welcome') as welcome_text
-- FROM language_content_data
-- WHERE json_extract(language_pack, '$.welcome') LIKE '%Welcome%';

-- ============================================
-- MAINTENANCE QUERIES
-- ============================================

-- Delete old versions (keep only last 10 versions per language)
-- DELETE FROM language_content_data
-- WHERE language_version NOT IN (
--   SELECT language_version
--   FROM (
--     SELECT language_version,
--            ROW_NUMBER() OVER (
--              PARTITION BY project_id, language_code 
--              ORDER BY version DESC
--            ) as rn
--     FROM language_content_data
--   )
--   WHERE rn <= 10
-- );

-- Get database size (in pages)
-- PRAGMA page_count;
-- PRAGMA page_size;

-- Vacuum database to reclaim space
-- VACUUM;

-- Analyze database for query optimization
-- ANALYZE;

-- ============================================
-- BACKUP & RESTORE
-- ============================================

-- Backup database:
-- .backup backup_20260422.db

-- Or using command line:
-- sqlite3 translation_manager.db ".backup backup_20260422.db"

-- Restore database:
-- .restore backup_20260422.db

-- Export to SQL:
-- .output backup_20260422.sql
-- .dump

-- ============================================
-- USEFUL SQLITE COMMANDS
-- ============================================

-- Show tables
-- .tables

-- Show schema
-- .schema language_content_data

-- Show indexes
-- .indexes language_content_data

-- Enable column headers
-- .headers on

-- Set output mode to column
-- .mode column

-- Show current settings
-- .show

-- ============================================
-- SETUP COMPLETE
-- ============================================

SELECT 'SQLite database setup completed successfully!' as status;
SELECT 'Table: language_content_data created' as info;
SELECT 'Indexes created for optimal performance' as info;
SELECT 'Triggers configured for auto-versioning' as info;
