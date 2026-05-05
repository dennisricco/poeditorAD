'use client';

import { X, Download, AlertCircle, Trash2, Globe } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import JSZip from 'jszip';
import Button from './Button';
import LanguageFlag from './LanguageFlag';

interface DualCleaningStats {
  language1: {
    totalStrings: number;
    stringsToClean: number;
    cleanedKeys: string[];
  };
  language2: {
    totalStrings: number;
    stringsToClean: number;
    cleanedKeys: string[];
  };
  combined: {
    totalStrings: number;
    totalCleaned: number;
  };
}

interface DualCleaningPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDownload: () => void;
  language1Code: string;
  language1Name: string;
  language2Code: string;
  language2Name: string;
  originalData1: Record<string, any>;
  cleanedData1: Record<string, any>;
  originalData2: Record<string, any>;
  cleanedData2: Record<string, any>;
  format: string;
  isDownloading?: boolean;
}

export default function DualCleaningPreviewModal({
  isOpen,
  onClose,
  onConfirmDownload,
  language1Code,
  language1Name,
  language2Code,
  language2Name,
  originalData1,
  cleanedData1,
  originalData2,
  cleanedData2,
  format,
  isDownloading = false,
}: DualCleaningPreviewModalProps) {
  const [stats, setStats] = useState<DualCleaningStats>({
    language1: { totalStrings: 0, stringsToClean: 0, cleanedKeys: [] },
    language2: { totalStrings: 0, stringsToClean: 0, cleanedKeys: [] },
    combined: { totalStrings: 0, totalCleaned: 0 },
  });
  const [activeTab, setActiveTab] = useState<'lang1' | 'lang2' | 'combined'>('combined');

  // Handler for download with SQL (ZIP version)
  const handleDownloadWithSQL = async () => {
    try {
      // Helper to convert language code to locale format
      const toLocaleFormat = (langCode: string): string => {
        const normalized = langCode.toLowerCase();
        const baseLang = normalized.split('-')[0];
        return `${baseLang}-ID`;
      };

      const locale1 = toLocaleFormat(language1Code);
      const locale2 = toLocaleFormat(language2Code);

      // Prepare cleaned Lockey JSON
      let lockeyData: Record<string, any>;

      if (format === 'json') {
        lockeyData = {
          [locale1]: cleanedData1,
          [locale2]: cleanedData2,
        };
      } else if (format === 'key_value_json') {
        lockeyData = {
          [locale1]: cleanedData1,
          [locale2]: cleanedData2,
        };
      } else {
        alert('SQL download only supports JSON formats');
        return;
      }

      const jsonString = JSON.stringify(lockeyData, null, 2);
      const termsCount = Object.keys(cleanedData1).length + Object.keys(cleanedData2).length;
      const fileSize = new Blob([jsonString]).size;

      // Create ZIP file
      const zip = new JSZip();

      // Add Lockey JSON file
      zip.file(`lockey_${locale1}_${locale2}.json`, jsonString);

      // Generate and add SQL files
      const oracleSQL = generateOracleSQL(jsonString, locale1, locale2, termsCount, fileSize);
      const postgresSQL = generatePostgresSQL(jsonString, locale1, locale2, termsCount, fileSize);
      const mysqlSQL = generateMySQLSQL(jsonString, locale1, locale2, termsCount, fileSize);
      const sqliteSQL = generateSQLiteSQL(jsonString, locale1, locale2, termsCount, fileSize);
      const allDatabasesSQL = generateAllDatabasesSQL(oracleSQL, postgresSQL, mysqlSQL, sqliteSQL);

      // Add SQL files to ZIP
      zip.file('oracle_insert.sql', oracleSQL);
      zip.file('postgresql_insert.sql', postgresSQL);
      zip.file('mysql_insert.sql', mysqlSQL);
      zip.file('sqlite_insert.sql', sqliteSQL);
      zip.file('all_databases_insert.sql', allDatabasesSQL);
      
      // Add README
      const readme = generateReadme(locale1, locale2, termsCount, fileSize);
      zip.file('README.txt', readme);

      // Generate ZIP and download
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipUrl = window.URL.createObjectURL(zipBlob);

      const link = document.createElement('a');
      link.href = zipUrl;
      link.download = `lockey_${locale1}_${locale2}_with_sql.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(zipUrl);

      alert(`✅ Downloaded ZIP file containing:\n\n` +
            `📄 lockey_${locale1}_${locale2}.json\n` +
            `📄 oracle_insert.sql ⭐ RECOMMENDED\n` +
            `📄 postgresql_insert.sql\n` +
            `📄 mysql_insert.sql\n` +
            `📄 sqlite_insert.sql\n` +
            `📄 all_databases_insert.sql\n` +
            `📄 README.txt\n\n` +
            `For Oracle users: Use oracle_insert.sql with CLOB solution!`);
    } catch (error) {
      console.error('Error creating ZIP:', error);
      alert('❌ Failed to create ZIP file. Please try again.');
    }
  };

  // Generate Oracle-specific SQL (CLOB solution - RECOMMENDED)
  const generateOracleSQL = (jsonString: string, locale1: string, locale2: string, termsCount: number, fileSize: number): string => {
    const escapedJson = jsonString.replace(/'/g, "''");
    const timestamp = new Date().toISOString();
    
    return `-- ============================================
-- ORACLE DATABASE - LOCKEY INSERT SCRIPT
-- ============================================
-- Generated: ${timestamp}
-- Languages: ${locale1}, ${locale2}
-- Terms Count: ${termsCount}
-- File Size: ${fileSize} bytes
-- Format: Multi-language structured JSON
-- 
-- RECOMMENDED SOLUTION: Use CLOB (Option 1)
-- ============================================

-- ============================================
-- OPTION 1: CLOB SOLUTION (RECOMMENDED) ✅
-- ============================================
-- This is the EASIEST and RECOMMENDED way!
-- No manual copy-paste needed!

-- STEP 1: Change column type from BLOB to CLOB (ONE TIME ONLY)
-- Run this ONCE if your column is currently BLOB:

ALTER TABLE MAV_CONTENT.LANGUAGE_CONTENT_DATA 
MODIFY LANGUAGE_PACK CLOB;

-- STEP 2: Direct insert with CLOB (NO COPY-PASTE!)

DECLARE
  v_json CLOB := '${escapedJson}';
  v_version NUMBER;
BEGIN
  -- Get next version number
  SELECT NVL(MAX(LANGUAGE_VERSION), 0) + 1 
  INTO v_version
  FROM MAV_CONTENT.LANGUAGE_CONTENT_DATA;
  
  -- Insert directly with CLOB
  INSERT INTO MAV_CONTENT.LANGUAGE_CONTENT_DATA (
    LANGUAGE_VERSION,
    LANGUAGE_PACK,
    VERSION,
    UPDATED_BY,
    UPDATED_TIME,
    CREATED_BY,
    CREATED_TIME
  ) VALUES (
    v_version,
    v_json,  -- Direct CLOB insert - NO EMPTY_BLOB() needed!
    1,
    'SYSTEM',
    SYSDATE,
    'SYSTEM',
    SYSDATE
  );
  
  -- Update application version
  UPDATE MAV_CONTENT.APPLICATION_DATA 
  SET LANGUAGE_PACK_VERSION = v_version;
  
  COMMIT;
  
  DBMS_OUTPUT.PUT_LINE('✅ SUCCESS! Inserted version: ' || v_version);
  DBMS_OUTPUT.PUT_LINE('Languages: ${locale1}, ${locale2}');
  DBMS_OUTPUT.PUT_LINE('Terms count: ${termsCount}');
END;
/

-- ============================================
-- OPTION 2: BLOB SOLUTION (If you must use BLOB)
-- ============================================
-- Only use this if you CANNOT change to CLOB
-- Requires creating a stored procedure first

-- STEP 1: Create the procedure (ONE TIME ONLY)

CREATE OR REPLACE PROCEDURE INSERT_LANGUAGE_PACK(
  p_json_string IN CLOB,
  p_version OUT NUMBER
) AS
  v_blob BLOB;
  v_dest_offset INTEGER := 1;
  v_src_offset INTEGER := 1;
  v_lang_ctx INTEGER := DBMS_LOB.DEFAULT_LANG_CTX;
  v_warning INTEGER;
BEGIN
  -- Get next version
  SELECT NVL(MAX(LANGUAGE_VERSION), 0) + 1 
  INTO p_version
  FROM MAV_CONTENT.LANGUAGE_CONTENT_DATA;
  
  -- Insert with empty BLOB first
  INSERT INTO MAV_CONTENT.LANGUAGE_CONTENT_DATA (
    LANGUAGE_VERSION,
    LANGUAGE_PACK,
    VERSION,
    UPDATED_BY,
    UPDATED_TIME,
    CREATED_BY,
    CREATED_TIME
  ) VALUES (
    p_version,
    EMPTY_BLOB(),
    1,
    'SYSTEM',
    SYSDATE,
    'SYSTEM',
    SYSDATE
  ) RETURNING LANGUAGE_PACK INTO v_blob;
  
  -- Convert CLOB to BLOB and write
  DBMS_LOB.CONVERTTOBLOB(
    dest_lob => v_blob,
    src_clob => p_json_string,
    amount => DBMS_LOB.LOBMAXSIZE,
    dest_offset => v_dest_offset,
    src_offset => v_src_offset,
    blob_csid => DBMS_LOB.DEFAULT_CSID,
    lang_context => v_lang_ctx,
    warning => v_warning
  );
  
  -- Update application version
  UPDATE MAV_CONTENT.APPLICATION_DATA 
  SET LANGUAGE_PACK_VERSION = p_version;
  
  COMMIT;
  
  DBMS_OUTPUT.PUT_LINE('✅ SUCCESS! Inserted version: ' || p_version);
  
EXCEPTION
  WHEN OTHERS THEN
    ROLLBACK;
    DBMS_OUTPUT.PUT_LINE('❌ ERROR: ' || SQLERRM);
    RAISE;
END INSERT_LANGUAGE_PACK;
/

-- STEP 2: Call the procedure

DECLARE
  v_json CLOB := '${escapedJson}';
  v_version NUMBER;
BEGIN
  INSERT_LANGUAGE_PACK(v_json, v_version);
  DBMS_OUTPUT.PUT_LINE('Inserted version: ' || v_version);
  DBMS_OUTPUT.PUT_LINE('Languages: ${locale1}, ${locale2}');
  DBMS_OUTPUT.PUT_LINE('Terms count: ${termsCount}');
END;
/

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if insert was successful
SELECT 
  LANGUAGE_VERSION,
  VERSION,
  CREATED_TIME,
  UPDATED_TIME,
  CREATED_BY,
  DBMS_LOB.GETLENGTH(LANGUAGE_PACK) as PACK_SIZE_BYTES
FROM MAV_CONTENT.LANGUAGE_CONTENT_DATA
WHERE LANGUAGE_VERSION = (
  SELECT MAX(LANGUAGE_VERSION) 
  FROM MAV_CONTENT.LANGUAGE_CONTENT_DATA
);

-- Check application version
SELECT LANGUAGE_PACK_VERSION
FROM MAV_CONTENT.APPLICATION_DATA;

-- View JSON content (first 1000 characters)
SELECT 
  LANGUAGE_VERSION,
  SUBSTR(LANGUAGE_PACK, 1, 1000) as JSON_PREVIEW
FROM MAV_CONTENT.LANGUAGE_CONTENT_DATA
WHERE LANGUAGE_VERSION = (
  SELECT MAX(LANGUAGE_VERSION) 
  FROM MAV_CONTENT.LANGUAGE_CONTENT_DATA
);

-- ============================================
-- TROUBLESHOOTING
-- ============================================

-- Error: ORA-01461 (can bind a LONG value only for insert into a LONG column)
-- Solution: Use CLOB instead of VARCHAR2, or use the stored procedure

-- Error: ORA-22835 (Buffer too small for CLOB to CHAR conversion)
-- Solution: Use DBMS_LOB functions instead of direct conversion

-- Check current column type
SELECT 
  COLUMN_NAME,
  DATA_TYPE,
  DATA_LENGTH
FROM USER_TAB_COLUMNS
WHERE TABLE_NAME = 'LANGUAGE_CONTENT_DATA'
  AND COLUMN_NAME = 'LANGUAGE_PACK';

-- ============================================
-- NOTES
-- ============================================
-- 1. CLOB (Option 1) is STRONGLY RECOMMENDED
-- 2. CLOB allows direct JSON queries (Oracle 12c+)
-- 3. CLOB is easier to maintain and debug
-- 4. BLOB requires complex conversion procedures
-- 5. Always backup before running ALTER TABLE
-- 6. Test in development environment first
-- ============================================
`;
  };

  // Generate PostgreSQL SQL
  const generatePostgresSQL = (jsonString: string, locale1: string, locale2: string, termsCount: number, fileSize: number): string => {
    const escapedJson = jsonString.replace(/'/g, "''");
    const timestamp = new Date().toISOString();
    
    return `-- ============================================
-- POSTGRESQL / SUPABASE - LOCKEY INSERT
-- ============================================
-- Generated: ${timestamp}
-- Languages: ${locale1}, ${locale2}
-- Terms Count: ${termsCount}
-- File Size: ${fileSize} bytes
-- ============================================

INSERT INTO language_content_data (
  user_id,
  project_id,
  project_name,
  language_code,
  language_name,
  export_format,
  cleaning_mode,
  language_pack,
  version,
  terms_count,
  file_size_bytes,
  created_by,
  updated_by,
  created_time,
  updated_time
) VALUES (
  'YOUR_USER_ID',  -- Replace with actual user ID
  'YOUR_PROJECT_ID',  -- Replace with actual project ID
  'YOUR_PROJECT_NAME',  -- Replace with project name
  '${locale1}_${locale2}',
  '${locale1.toUpperCase()} + ${locale2.toUpperCase()}',
  'key_value_json',
  'basic',
  '${escapedJson}'::jsonb,  -- Cast to JSONB for better performance
  1,
  ${termsCount},
  ${fileSize},
  'SYSTEM',
  'SYSTEM',
  NOW(),
  NOW()
);

-- Verification query
SELECT 
  language_version,
  language_code,
  language_name,
  terms_count,
  created_time
FROM language_content_data
ORDER BY language_version DESC
LIMIT 1;
`;
  };

  // Generate MySQL SQL
  const generateMySQLSQL = (jsonString: string, locale1: string, locale2: string, termsCount: number, fileSize: number): string => {
    const escapedJson = jsonString.replace(/'/g, "''");
    const timestamp = new Date().toISOString();
    
    return `-- ============================================
-- MYSQL - LOCKEY INSERT
-- ============================================
-- Generated: ${timestamp}
-- Languages: ${locale1}, ${locale2}
-- Terms Count: ${termsCount}
-- File Size: ${fileSize} bytes
-- ============================================

INSERT INTO language_content_data (
  user_id,
  project_id,
  project_name,
  language_code,
  language_name,
  export_format,
  cleaning_mode,
  language_pack,
  version,
  terms_count,
  file_size_bytes,
  created_by,
  updated_by,
  created_time,
  updated_time
) VALUES (
  'YOUR_USER_ID',  -- Replace with actual user ID
  'YOUR_PROJECT_ID',  -- Replace with actual project ID
  'YOUR_PROJECT_NAME',  -- Replace with project name
  '${locale1}_${locale2}',
  '${locale1.toUpperCase()} + ${locale2.toUpperCase()}',
  'key_value_json',
  'basic',
  '${escapedJson}',  -- Direct JSON string
  1,
  ${termsCount},
  ${fileSize},
  'SYSTEM',
  'SYSTEM',
  NOW(),
  NOW()
);

-- Verification query
SELECT 
  language_version,
  language_code,
  language_name,
  terms_count,
  created_time
FROM language_content_data
ORDER BY language_version DESC
LIMIT 1;
`;
  };

  // Generate SQLite SQL
  const generateSQLiteSQL = (jsonString: string, locale1: string, locale2: string, termsCount: number, fileSize: number): string => {
    const escapedJson = jsonString.replace(/'/g, "''");
    const timestamp = new Date().toISOString();
    
    return `-- ============================================
-- SQLITE - LOCKEY INSERT
-- ============================================
-- Generated: ${timestamp}
-- Languages: ${locale1}, ${locale2}
-- Terms Count: ${termsCount}
-- File Size: ${fileSize} bytes
-- ============================================

INSERT INTO language_content_data (
  user_id,
  project_id,
  project_name,
  language_code,
  language_name,
  export_format,
  cleaning_mode,
  language_pack,
  version,
  terms_count,
  file_size_bytes,
  created_by,
  updated_by,
  created_time,
  updated_time
) VALUES (
  'YOUR_USER_ID',
  'YOUR_PROJECT_ID',
  'YOUR_PROJECT_NAME',
  '${locale1}_${locale2}',
  '${locale1.toUpperCase()} + ${locale2.toUpperCase()}',
  'key_value_json',
  'basic',
  '${escapedJson}',
  1,
  ${termsCount},
  ${fileSize},
  'SYSTEM',
  'SYSTEM',
  datetime('now'),
  datetime('now')
);

-- Verification query
SELECT 
  language_version,
  language_code,
  language_name,
  terms_count,
  created_time
FROM language_content_data
ORDER BY language_version DESC
LIMIT 1;
`;
  };

  // Generate combined SQL for all databases
  const generateAllDatabasesSQL = (oracleSQL: string, postgresSQL: string, mysqlSQL: string, sqliteSQL: string): string => {
    return `-- ============================================
-- ALL DATABASES - LOCKEY INSERT SCRIPT
-- ============================================
-- Generated: ${new Date().toISOString()}
-- 
-- This file contains SQL for all supported databases.
-- For Oracle users: We recommend using oracle_insert.sql
-- which has detailed CLOB/BLOB solutions.
-- ============================================

${oracleSQL}

${postgresSQL}

${mysqlSQL}

${sqliteSQL}
`;
  };

  // Generate README file
  const generateReadme = (locale1: string, locale2: string, termsCount: number, fileSize: number): string => {
    return `============================================
LOCKEY LANGUAGE PACK - DOWNLOAD PACKAGE
============================================

Generated: ${new Date().toISOString()}
Languages: ${locale1}, ${locale2}
Terms Count: ${termsCount}
File Size: ${fileSize} bytes

============================================
PACKAGE CONTENTS
============================================

1. lockey_${locale1}_${locale2}.json
   - Validated and cleaned Lockey JSON file
   - Multi-language structured format
   - Ready to use

2. oracle_insert.sql ⭐ RECOMMENDED FOR ORACLE USERS
   - Oracle-specific SQL with CLOB solution
   - Two options: CLOB (recommended) and BLOB
   - Detailed instructions and troubleshooting
   - No manual copy-paste needed!

3. postgresql_insert.sql
   - PostgreSQL / Supabase compatible
   - Uses JSONB for better performance

4. mysql_insert.sql
   - MySQL compatible
   - Direct JSON string insert

5. sqlite_insert.sql
   - SQLite compatible
   - Lightweight solution

6. all_databases_insert.sql
   - Combined SQL for all databases
   - Choose your database section

7. README.txt (this file)
   - Package information and instructions

============================================
QUICK START - ORACLE USERS
============================================

STEP 1: Change BLOB to CLOB (ONE TIME ONLY)
   Run this in SQL Developer or sqlplus:
   
   ALTER TABLE MAV_CONTENT.LANGUAGE_CONTENT_DATA 
   MODIFY LANGUAGE_PACK CLOB;

STEP 2: Insert data
   Open oracle_insert.sql
   Copy the CLOB solution (Option 1)
   Execute in your database
   Done! ✅

WHY CLOB?
✅ Direct insert - no copy-paste
✅ Easier to use
✅ Better for JSON data
✅ Can query JSON directly (Oracle 12c+)

============================================
QUICK START - OTHER DATABASES
============================================

PostgreSQL / Supabase:
1. Open postgresql_insert.sql
2. Replace placeholders (YOUR_USER_ID, etc.)
3. Execute in Supabase SQL Editor
4. Done! ✅

MySQL:
1. Open mysql_insert.sql
2. Replace placeholders
3. Execute in MySQL Workbench
4. Done! ✅

SQLite:
1. Open sqlite_insert.sql
2. Replace placeholders
3. Execute in SQLite CLI
4. Done! ✅

============================================
PLACEHOLDERS TO REPLACE
============================================

YOUR_USER_ID       → Your user ID
YOUR_PROJECT_ID    → POEditor project ID
YOUR_PROJECT_NAME  → Project name

Example:
  'YOUR_USER_ID'     → 'user_12345'
  'YOUR_PROJECT_ID'  → 'project_001'
  'YOUR_PROJECT_NAME'→ 'Mobile App'

============================================
VERIFICATION
============================================

After inserting, verify with:

Oracle:
SELECT LANGUAGE_VERSION, CREATED_TIME
FROM MAV_CONTENT.LANGUAGE_CONTENT_DATA
WHERE LANGUAGE_VERSION = (
  SELECT MAX(LANGUAGE_VERSION) 
  FROM MAV_CONTENT.LANGUAGE_CONTENT_DATA
);

PostgreSQL/MySQL/SQLite:
SELECT language_version, created_time
FROM language_content_data
ORDER BY language_version DESC
LIMIT 1;

============================================
TROUBLESHOOTING
============================================

Problem: "JSON too large"
Solution: Use CLOB instead of BLOB (Oracle)

Problem: "Invalid JSON"
Solution: Re-download from application

Problem: "Permission denied"
Solution: Check user permissions in database

Problem: "Duplicate key"
Solution: Check auto-increment version

============================================
BEST PRACTICES
============================================

1. ✅ Backup database before running
2. ✅ Test in development first
3. ✅ Use CLOB for Oracle (easier!)
4. ✅ Verify results after insert
5. ✅ Keep this ZIP for documentation

============================================
SUPPORT
============================================

For more information:
- Check SQL file comments
- Review database documentation
- Contact system administrator

============================================
SUMMARY
============================================

This package provides everything you need to:
✅ Insert Lockey JSON into your database
✅ Support all major databases
✅ Oracle CLOB solution (no copy-paste!)
✅ Validated and cleaned data
✅ Ready-to-use SQL scripts

For Oracle users: Use oracle_insert.sql with 
CLOB solution for best results!

============================================
Generated by POE3D Translation Manager
Version: 1.0.0
============================================
`;
  };

  // Helper function to get emoji for language
  const getLanguageEmoji = (langCode: string): string => {
    const emojiMap: Record<string, string> = {
      'en': '🇬🇧', 'en-us': '🇺🇸', 'en-gb': '🇬🇧',
      'id': '🇮🇩', 'ms': '🇲🇾', 'ja': '🇯🇵',
      'ko': '🇰🇷', 'zh': '🇨🇳', 'zh-cn': '🇨🇳',
      'es': '🇪🇸', 'fr': '🇫🇷', 'de': '🇩🇪',
      'it': '🇮🇹', 'pt': '🇵🇹', 'pt-br': '🇧🇷',
      'ru': '🇷🇺', 'ar': '🇸🇦', 'hi': '🇮🇳',
      'th': '🇹🇭', 'vi': '🇻🇳', 'nl': '🇳🇱',
      'pl': '🇵🇱', 'tr': '🇹🇷', 'sv': '🇸🇪',
    };
    return emojiMap[langCode.toLowerCase()] || '🌐';
  };

  useEffect(() => {
    if (isOpen) {
      calculateStats();
    }
  }, [isOpen, originalData1, cleanedData1, originalData2, cleanedData2]);

  const calculateStats = () => {
    const analyzeLanguage = (original: any, cleaned: any) => {
      const cleanedKeys: string[] = [];
      let totalStrings = 0;

      const compareObjects = (orig: any, clean: any, prefix = '') => {
        for (const key in orig) {
          const fullKey = prefix ? `${prefix}.${key}` : key;
          
          if (typeof orig[key] === 'string') {
            totalStrings++;
            if (orig[key] !== clean[key]) {
              cleanedKeys.push(fullKey);
            }
          } else if (typeof orig[key] === 'object' && orig[key] !== null) {
            compareObjects(orig[key], clean[key], fullKey);
          }
        }
      };

      compareObjects(original, cleaned);

      return {
        totalStrings,
        stringsToClean: cleanedKeys.length,
        cleanedKeys,
      };
    };

    const lang1Stats = analyzeLanguage(originalData1, cleanedData1);
    const lang2Stats = analyzeLanguage(originalData2, cleanedData2);

    setStats({
      language1: lang1Stats,
      language2: lang2Stats,
      combined: {
        totalStrings: lang1Stats.totalStrings + lang2Stats.totalStrings,
        totalCleaned: lang1Stats.stringsToClean + lang2Stats.stringsToClean,
      },
    });
  };

  const getFormatLabel = (fmt: string) => {
    const labels: Record<string, string> = {
      json: 'JSON',
      csv: 'CSV',
      xlsx: 'XLSX',
      key_value_json: 'Key-Value JSON',
    };
    return labels[fmt] || fmt.toUpperCase();
  };

  const renderCombinedPreview = () => {
    // Helper to convert language code to locale format
    const toLocaleFormat = (langCode: string): string => {
      const normalized = langCode.toLowerCase();
      const localeMap: Record<string, string> = {
        'en': 'en-ID', 'en-us': 'en-ID', 'en-gb': 'en-ID',
        'id': 'id-ID', 'ms': 'ms-ID', 'ja': 'ja-ID',
        'ko': 'ko-ID', 'zh': 'zh-ID', 'zh-cn': 'zh-ID',
      };
      return localeMap[normalized] || `${normalized.split('-')[0]}-ID`;
    };

    const locale1 = toLocaleFormat(language1Code);
    const locale2 = toLocaleFormat(language2Code);

    if (format === 'json') {
      const originalCombined = {
        [locale1]: originalData1,
        [locale2]: originalData2,
      };
      const cleanedCombined = {
        [locale1]: cleanedData1,
        [locale2]: cleanedData2,
      };
      return { original: originalCombined, cleaned: cleanedCombined };
    } else if (format === 'key_value_json') {
      const originalCombined: Record<string, string> = {};
      const cleanedCombined: Record<string, string> = {};
      
      Object.entries(originalData1).forEach(([key, value]) => {
        originalCombined[`${locale1}.${key}`] = value as string;
      });
      Object.entries(originalData2).forEach(([key, value]) => {
        originalCombined[`${locale2}.${key}`] = value as string;
      });
      
      Object.entries(cleanedData1).forEach(([key, value]) => {
        cleanedCombined[`${locale1}.${key}`] = value as string;
      });
      Object.entries(cleanedData2).forEach(([key, value]) => {
        cleanedCombined[`${locale2}.${key}`] = value as string;
      });
      
      return { original: originalCombined, cleaned: cleanedCombined };
    }
    
    return { original: {}, cleaned: {} };
  };

  if (!isOpen) return null;

  const combinedPreview = renderCombinedPreview();

  const modalContent = (
    <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" style={{ zIndex: 9999 }}>
      <div className="bg-white border-4 border-poe-black rounded-3xl cartoon-shadow max-w-6xl w-full flex flex-col" style={{ maxHeight: '90vh' }}>
        
        {/* Header */}
        <div className="bg-poe-green border-b-4 border-poe-black p-4 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-2xl font-black">Preview Dual Language Cleaning</h2>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white border-4 border-poe-black rounded-xl cartoon-shadow hover:-translate-y-1 transition-cartoon flex items-center justify-center"
              disabled={isDownloading}
            >
              <X className="w-5 h-5" strokeWidth={3} />
            </button>
          </div>
          
          {/* Language Info */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-white border-4 border-poe-black rounded-xl px-3 py-1.5">
              <LanguageFlag languageCode={language1Code} size="sm" />
              <span className="font-bold text-sm">{language1Name}</span>
            </div>
            <span className="text-xl font-black">+</span>
            <div className="flex items-center gap-2 bg-white border-4 border-poe-black rounded-xl px-3 py-1.5">
              <LanguageFlag languageCode={language2Code} size="sm" />
              <span className="font-bold text-sm">{language2Name}</span>
            </div>
            <div className="ml-auto bg-poe-yellow border-4 border-poe-black rounded-xl px-3 py-1.5">
              <span className="font-black text-sm">Format: {getFormatLabel(format)}</span>
            </div>
          </div>
        </div>

        {/* Combined Stats - Simplified */}
        <div className="p-4 border-b-4 border-poe-black bg-poe-blue/10 shrink-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            
            {/* Total Strings */}
            <div className="bg-white border-4 border-poe-black rounded-xl p-3 cartoon-shadow">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-poe-blue border-4 border-poe-black rounded-lg flex items-center justify-center shrink-0">
                  <Globe className="w-5 h-5" strokeWidth={3} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-600">Total</p>
                  <p className="text-xl font-black">{stats.combined.totalStrings}</p>
                </div>
              </div>
            </div>

            {/* Language 1 Stats */}
            <div className="bg-white border-4 border-poe-black rounded-xl p-3 cartoon-shadow">
              <div className="flex items-center gap-2">
                <LanguageFlag languageCode={language1Code} size="sm" />
                <div>
                  <p className="text-xs font-bold text-gray-600">{language1Name}</p>
                  <p className="text-lg font-black">
                    {stats.language1.stringsToClean}/{stats.language1.totalStrings}
                  </p>
                </div>
              </div>
            </div>

            {/* Language 2 Stats */}
            <div className="bg-white border-4 border-poe-black rounded-xl p-3 cartoon-shadow">
              <div className="flex items-center gap-2">
                <LanguageFlag languageCode={language2Code} size="sm" />
                <div>
                  <p className="text-xs font-bold text-gray-600">{language2Name}</p>
                  <p className="text-lg font-black">
                    {stats.language2.stringsToClean}/{stats.language2.totalStrings}
                  </p>
                </div>
              </div>
            </div>

            {/* Total to Clean */}
            <div className="bg-white border-4 border-poe-black rounded-xl p-3 cartoon-shadow">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-poe-pink border-4 border-poe-black rounded-lg flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5" strokeWidth={3} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-600">Clean</p>
                  <p className="text-xl font-black">{stats.combined.totalCleaned}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Info Message - Simplified */}
          {stats.combined.totalCleaned > 0 && (
            <div className="mt-3 bg-poe-yellow border-4 border-poe-black rounded-xl p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" strokeWidth={3} />
              <p className="font-bold text-sm">
                {stats.combined.totalCleaned} string akan dibersihkan dari karakter seperti \\n, \u2028, dan whitespace berlebih.
              </p>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="border-b-4 border-poe-black bg-gray-50 px-4 flex gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('combined')}
            className={`px-4 py-2 font-black text-sm border-4 border-poe-black rounded-t-xl transition-colors ${
              activeTab === 'combined' 
                ? 'bg-white -mb-1' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            <Globe className="w-4 h-4 inline mr-2" strokeWidth={3} />
            Combined
          </button>
          <button
            onClick={() => setActiveTab('lang1')}
            className={`px-4 py-2 font-black text-sm border-4 border-poe-black rounded-t-xl transition-colors flex items-center gap-2 ${
              activeTab === 'lang1' 
                ? 'bg-white -mb-1' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            <span className="text-lg">{getLanguageEmoji(language1Code)}</span>
            {language1Name}
          </button>
          <button
            onClick={() => setActiveTab('lang2')}
            className={`px-4 py-2 font-black text-sm border-4 border-poe-black rounded-t-xl transition-colors flex items-center gap-2 ${
              activeTab === 'lang2' 
                ? 'bg-white -mb-1' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            <span className="text-lg">{getLanguageEmoji(language2Code)}</span>
            {language2Name}
          </button>
        </div>

        {/* Preview Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 min-h-0">
          {activeTab === 'combined' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Before Cleaning */}
              <div>
                <h3 className="text-lg font-black mb-2 flex items-center gap-2">
                  <span className="w-7 h-7 bg-poe-pink border-4 border-poe-black rounded-lg flex items-center justify-center text-sm">
                    1
                  </span>
                  Sebelum Cleaning
                </h3>
                <div className="bg-gray-900 border-4 border-poe-black rounded-xl p-3 overflow-auto max-h-[500px]">
                  <pre className="text-xs text-green-400 font-mono">
                    {JSON.stringify(combinedPreview.original, null, 2)}
                  </pre>
                </div>
              </div>

              {/* After Cleaning */}
              <div>
                <h3 className="text-lg font-black mb-2 flex items-center gap-2">
                  <span className="w-7 h-7 bg-poe-green border-4 border-poe-black rounded-lg flex items-center justify-center text-sm">
                    2
                  </span>
                  Sesudah Cleaning
                </h3>
                <div className="bg-gray-900 border-4 border-poe-black rounded-xl p-3 overflow-auto max-h-[500px]">
                  <pre className="text-xs text-green-400 font-mono">
                    {JSON.stringify(combinedPreview.cleaned, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'lang1' && (
            <div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                {/* Before */}
                <div>
                  <h3 className="text-lg font-black mb-2">Sebelum Cleaning</h3>
                  <div className="bg-gray-900 border-4 border-poe-black rounded-xl p-3 overflow-auto max-h-[400px]">
                    <pre className="text-xs text-green-400 font-mono">
                      {JSON.stringify(originalData1, null, 2)}
                    </pre>
                  </div>
                </div>

                {/* After */}
                <div>
                  <h3 className="text-lg font-black mb-2">Sesudah Cleaning</h3>
                  <div className="bg-gray-900 border-4 border-poe-black rounded-xl p-3 overflow-auto max-h-[400px]">
                    <pre className="text-xs text-green-400 font-mono">
                      {JSON.stringify(cleanedData1, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Cleaned Keys List */}
              {stats.language1.stringsToClean > 0 && (
                <div>
                  <h3 className="text-lg font-black mb-2">String yang Akan Dibersihkan</h3>
                  <div className="bg-poe-pink/20 border-4 border-poe-black rounded-xl p-3 max-h-[200px] overflow-auto">
                    <ul className="space-y-1.5">
                      {stats.language1.cleanedKeys.map((key, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="w-6 h-6 bg-poe-pink border-2 border-poe-black rounded-lg flex items-center justify-center text-xs font-black shrink-0">
                            {index + 1}
                          </span>
                          <code className="font-mono text-xs font-bold break-all">{key}</code>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'lang2' && (
            <div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                {/* Before */}
                <div>
                  <h3 className="text-lg font-black mb-2">Sebelum Cleaning</h3>
                  <div className="bg-gray-900 border-4 border-poe-black rounded-xl p-3 overflow-auto max-h-[400px]">
                    <pre className="text-xs text-green-400 font-mono">
                      {JSON.stringify(originalData2, null, 2)}
                    </pre>
                  </div>
                </div>

                {/* After */}
                <div>
                  <h3 className="text-lg font-black mb-2">Sesudah Cleaning</h3>
                  <div className="bg-gray-900 border-4 border-poe-black rounded-xl p-3 overflow-auto max-h-[400px]">
                    <pre className="text-xs text-green-400 font-mono">
                      {JSON.stringify(cleanedData2, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Cleaned Keys List */}
              {stats.language2.stringsToClean > 0 && (
                <div>
                  <h3 className="text-lg font-black mb-2">String yang Akan Dibersihkan</h3>
                  <div className="bg-poe-pink/20 border-4 border-poe-black rounded-xl p-3 max-h-[200px] overflow-auto">
                    <ul className="space-y-1.5">
                      {stats.language2.cleanedKeys.map((key, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="w-6 h-6 bg-poe-pink border-2 border-poe-black rounded-lg flex items-center justify-center text-xs font-black shrink-0">
                            {index + 1}
                          </span>
                          <code className="font-mono text-xs font-bold break-all">{key}</code>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions - Simplified */}
        <div className="border-t-4 border-poe-black p-4 bg-gray-50 shrink-0">
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Button
              variant="white"
              size="md"
              onClick={onClose}
              disabled={isDownloading}
            >
              Batal
            </Button>
            <Button
              variant="blue"
              size="md"
              onClick={handleDownloadWithSQL}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <>
                  <div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" strokeWidth={3} />
                  Download with SQL
                </>
              )}
            </Button>
            <Button
              variant="green"
              size="md"
              onClick={onConfirmDownload}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <>
                  <div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" strokeWidth={3} />
                  Download File
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof window !== 'undefined' ? createPortal(modalContent, document.body) : null;
}
