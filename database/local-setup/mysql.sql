-- ============================================
-- MYSQL/MARIADB LOCAL DATABASE SETUP
-- Translation Manager - Language Content Storage
-- ============================================

-- Create database (run this first)
-- CREATE DATABASE translation_manager CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE translation_manager;

-- ============================================
-- MAIN TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS language_content_data (
  -- Primary key with auto-increment
  language_version BIGINT AUTO_INCREMENT PRIMARY KEY,
  
  -- User information
  user_id VARCHAR(255) NOT NULL DEFAULT 'local_user',
  
  -- POEditor project information
  project_id VARCHAR(500) NOT NULL,
  project_name VARCHAR(500),
  
  -- Language information
  language_code VARCHAR(50) NOT NULL,
  language_name VARCHAR(255),
  
  -- Export format
  export_format VARCHAR(50) NOT NULL DEFAULT 'json',
  
  -- Cleaning mode
  cleaning_mode VARCHAR(50),
  
  -- The actual translation data (JSON)
  language_pack JSON NOT NULL,
  
  -- Version tracking
  version INT NOT NULL DEFAULT 1,
  
  -- Metadata
  terms_count INT,
  file_size_bytes INT,
  
  -- Audit fields
  created_by VARCHAR(255) NOT NULL DEFAULT 'local_user',
  created_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_by VARCHAR(255) NOT NULL DEFAULT 'local_user',
  updated_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes
  INDEX idx_user_id (user_id),
  INDEX idx_project_id (project_id(255)),
  INDEX idx_project_language (project_id(255), language_code),
  INDEX idx_version (project_id(255), language_code, version DESC),
  INDEX idx_created_time (created_time DESC),
  
  -- Constraints
  CONSTRAINT chk_export_format CHECK (export_format IN (
    'json', 'json_key_value', 'android_strings', 'ios_strings',
    'xliff', 'properties', 'key_value_json', 'po', 'pot', 'mo'
  ))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger to auto-increment version on insert
DELIMITER $$

DROP TRIGGER IF EXISTS set_language_version_on_insert$$

CREATE TRIGGER set_language_version_on_insert
BEFORE INSERT ON language_content_data
FOR EACH ROW
BEGIN
  DECLARE latest_version INT;
  
  -- Get the latest version for this project/language combination
  SELECT COALESCE(MAX(version), 0)
  INTO latest_version
  FROM language_content_data
  WHERE project_id = NEW.project_id
    AND language_code = NEW.language_code
    AND user_id = NEW.user_id;
  
  -- Set the new version
  SET NEW.version = latest_version + 1;
END$$

DELIMITER ;

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
-- SELECT t1.*
-- FROM language_content_data t1
-- INNER JOIN (
--   SELECT project_id, language_code, MAX(version) as max_version
--   FROM language_content_data
--   WHERE project_id = 'your_project_id'
--   GROUP BY project_id, language_code
-- ) t2 ON t1.project_id = t2.project_id 
--     AND t1.language_code = t2.language_code 
--     AND t1.version = t2.max_version;

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
-- DELETE t1 FROM language_content_data t1
-- INNER JOIN (
--   SELECT language_version,
--          ROW_NUMBER() OVER (
--            PARTITION BY project_id, language_code 
--            ORDER BY version DESC
--          ) as rn
--   FROM language_content_data
-- ) t2 ON t1.language_version = t2.language_version
-- WHERE t2.rn > 10;

-- Get database size
-- SELECT 
--   table_schema AS 'Database',
--   ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
-- FROM information_schema.tables
-- WHERE table_schema = 'translation_manager'
-- GROUP BY table_schema;

-- Get table size
-- SELECT 
--   table_name AS 'Table',
--   ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
-- FROM information_schema.tables
-- WHERE table_schema = 'translation_manager'
--   AND table_name = 'language_content_data';

-- ============================================
-- BACKUP & RESTORE
-- ============================================

-- Backup database:
-- mysqldump -u root -p translation_manager > backup_$(date +%Y%m%d).sql

-- Restore database:
-- mysql -u root -p translation_manager < backup_20260422.sql

-- ============================================
-- SETUP COMPLETE
-- ============================================

SELECT 'MySQL database setup completed successfully!' as status;
SELECT 'Table: language_content_data created' as info;
SELECT 'Indexes created for optimal performance' as info;
SELECT 'Triggers configured for auto-versioning' as info;
