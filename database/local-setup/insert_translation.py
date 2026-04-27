#!/usr/bin/env python3
"""
Translation Importer Script
Automatically insert downloaded translation JSON files into local database

Supports: PostgreSQL, MySQL, SQLite

Usage:
    python insert_translation.py --db postgres --file translation_en.json --project-id 12345
    python insert_translation.py --db mysql --file translation_id.json --project-id 12345
    python insert_translation.py --db sqlite --file translation_fr.json --project-id 12345
"""

import json
import argparse
import os
import sys
from datetime import datetime
from pathlib import Path

# Database connection libraries (install as needed)
try:
    import psycopg2
    POSTGRES_AVAILABLE = True
except ImportError:
    POSTGRES_AVAILABLE = False

try:
    import mysql.connector
    MYSQL_AVAILABLE = True
except ImportError:
    MYSQL_AVAILABLE = False

try:
    import sqlite3
    SQLITE_AVAILABLE = True
except ImportError:
    SQLITE_AVAILABLE = False


class TranslationImporter:
    def __init__(self, db_type, db_config=None):
        self.db_type = db_type
        self.db_config = db_config or {}
        self.conn = None
        self.cursor = None
    
    def connect(self):
        """Connect to database"""
        if self.db_type == 'postgres':
            if not POSTGRES_AVAILABLE:
                raise ImportError("psycopg2 not installed. Run: pip install psycopg2-binary")
            
            self.conn = psycopg2.connect(
                dbname=self.db_config.get('database', 'translation_manager'),
                user=self.db_config.get('user', 'postgres'),
                password=self.db_config.get('password', ''),
                host=self.db_config.get('host', 'localhost'),
                port=self.db_config.get('port', 5432)
            )
            self.cursor = self.conn.cursor()
            print(f"✅ Connected to PostgreSQL database: {self.db_config.get('database')}")
        
        elif self.db_type == 'mysql':
            if not MYSQL_AVAILABLE:
                raise ImportError("mysql-connector-python not installed. Run: pip install mysql-connector-python")
            
            self.conn = mysql.connector.connect(
                database=self.db_config.get('database', 'translation_manager'),
                user=self.db_config.get('user', 'root'),
                password=self.db_config.get('password', ''),
                host=self.db_config.get('host', 'localhost'),
                port=self.db_config.get('port', 3306)
            )
            self.cursor = self.conn.cursor()
            print(f"✅ Connected to MySQL database: {self.db_config.get('database')}")
        
        elif self.db_type == 'sqlite':
            if not SQLITE_AVAILABLE:
                raise ImportError("sqlite3 not available")
            
            db_file = self.db_config.get('database', 'translation_manager.db')
            self.conn = sqlite3.connect(db_file)
            self.cursor = self.conn.cursor()
            print(f"✅ Connected to SQLite database: {db_file}")
        
        else:
            raise ValueError(f"Unsupported database type: {self.db_type}")
    
    def disconnect(self):
        """Disconnect from database"""
        if self.cursor:
            self.cursor.close()
        if self.conn:
            self.conn.close()
        print("✅ Database connection closed")
    
    def import_translation(self, json_file, project_id, project_name=None, 
                          language_code=None, language_name=None, 
                          export_format='json', cleaning_mode=None):
        """Import translation from JSON file"""
        
        # Read JSON file
        print(f"📖 Reading file: {json_file}")
        with open(json_file, 'r', encoding='utf-8') as f:
            translation_data = json.load(f)
        
        # Auto-detect language code from filename if not provided
        if not language_code:
            filename = Path(json_file).stem
            # Try to extract language code (e.g., translation_en.json -> en)
            parts = filename.split('_')
            if len(parts) > 1:
                language_code = parts[-1]
            else:
                language_code = 'unknown'
        
        # Calculate metadata
        terms_count = len(translation_data) if isinstance(translation_data, dict) else 0
        json_string = json.dumps(translation_data, ensure_ascii=False)
        file_size_bytes = len(json_string.encode('utf-8'))
        
        print(f"📊 Translation info:")
        print(f"   - Project ID: {project_id}")
        print(f"   - Language: {language_code}")
        print(f"   - Terms count: {terms_count}")
        print(f"   - File size: {file_size_bytes} bytes ({file_size_bytes/1024:.2f} KB)")
        
        # Prepare SQL based on database type
        if self.db_type == 'postgres':
            sql = """
                INSERT INTO language_content_data (
                    project_id, project_name, language_code, language_name,
                    export_format, cleaning_mode, language_pack, 
                    terms_count, file_size_bytes
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING language_version, version, created_time
            """
            params = (
                project_id, project_name, language_code, language_name,
                export_format, cleaning_mode, json_string,
                terms_count, file_size_bytes
            )
        
        elif self.db_type == 'mysql':
            sql = """
                INSERT INTO language_content_data (
                    project_id, project_name, language_code, language_name,
                    export_format, cleaning_mode, language_pack, 
                    terms_count, file_size_bytes
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            params = (
                project_id, project_name, language_code, language_name,
                export_format, cleaning_mode, json_string,
                terms_count, file_size_bytes
            )
        
        elif self.db_type == 'sqlite':
            sql = """
                INSERT INTO language_content_data (
                    project_id, project_name, language_code, language_name,
                    export_format, cleaning_mode, language_pack, 
                    terms_count, file_size_bytes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """
            params = (
                project_id, project_name, language_code, language_name,
                export_format, cleaning_mode, json_string,
                terms_count, file_size_bytes
            )
        
        # Execute insert
        print(f"💾 Inserting into database...")
        self.cursor.execute(sql, params)
        self.conn.commit()
        
        # Get result
        if self.db_type == 'postgres':
            result = self.cursor.fetchone()
            language_version, version, created_time = result
        else:
            language_version = self.cursor.lastrowid
            # Get version
            if self.db_type == 'mysql':
                self.cursor.execute(
                    "SELECT version, created_time FROM language_content_data WHERE language_version = %s",
                    (language_version,)
                )
            else:
                self.cursor.execute(
                    "SELECT version, created_time FROM language_content_data WHERE language_version = ?",
                    (language_version,)
                )
            result = self.cursor.fetchone()
            version, created_time = result if result else (None, None)
        
        print(f"✅ Translation saved successfully!")
        print(f"   - Language Version ID: {language_version}")
        print(f"   - Version Number: {version}")
        print(f"   - Created Time: {created_time}")
        
        return {
            'language_version': language_version,
            'version': version,
            'created_time': created_time
        }


def main():
    parser = argparse.ArgumentParser(
        description='Import translation JSON files into local database'
    )
    
    # Required arguments
    parser.add_argument('--db', required=True, choices=['postgres', 'mysql', 'sqlite'],
                       help='Database type')
    parser.add_argument('--file', required=True, help='Path to JSON file')
    parser.add_argument('--project-id', required=True, help='Project ID')
    
    # Optional arguments
    parser.add_argument('--project-name', help='Project name')
    parser.add_argument('--language-code', help='Language code (e.g., en, id, fr)')
    parser.add_argument('--language-name', help='Language name (e.g., English, Indonesian)')
    parser.add_argument('--export-format', default='json', help='Export format (default: json)')
    parser.add_argument('--cleaning-mode', help='Cleaning mode (none, basic, aggressive)')
    
    # Database connection arguments
    parser.add_argument('--db-host', default='localhost', help='Database host')
    parser.add_argument('--db-port', type=int, help='Database port')
    parser.add_argument('--db-user', help='Database user')
    parser.add_argument('--db-password', help='Database password')
    parser.add_argument('--db-name', help='Database name')
    
    args = parser.parse_args()
    
    # Check if file exists
    if not os.path.exists(args.file):
        print(f"❌ Error: File not found: {args.file}")
        sys.exit(1)
    
    # Prepare database config
    db_config = {
        'host': args.db_host,
        'user': args.db_user,
        'password': args.db_password,
    }
    
    if args.db_port:
        db_config['port'] = args.db_port
    
    if args.db_name:
        db_config['database'] = args.db_name
    elif args.db == 'sqlite':
        db_config['database'] = 'translation_manager.db'
    else:
        db_config['database'] = 'translation_manager'
    
    # Import translation
    try:
        importer = TranslationImporter(args.db, db_config)
        importer.connect()
        
        result = importer.import_translation(
            json_file=args.file,
            project_id=args.project_id,
            project_name=args.project_name,
            language_code=args.language_code,
            language_name=args.language_name,
            export_format=args.export_format,
            cleaning_mode=args.cleaning_mode
        )
        
        importer.disconnect()
        
        print("\n🎉 Import completed successfully!")
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()
