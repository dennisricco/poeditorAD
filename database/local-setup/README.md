# 🗄️ Local Database Setup

Folder ini berisi semua yang Anda butuhkan untuk setup database lokal di laptop Anda untuk menyimpan hasil download translation dari POEditor/Lockey.

## 📁 Files

- `postgresql.sql` - Setup script untuk PostgreSQL
- `mysql.sql` - Setup script untuk MySQL/MariaDB
- `sqlite.sql` - Setup script untuk SQLite
- `insert_translation.py` - Python script untuk auto-import JSON files
- `README.md` - Dokumentasi ini

## 🚀 Quick Start

### Option 1: PostgreSQL

```bash
# 1. Install PostgreSQL
# Windows: https://www.postgresql.org/download/windows/
# Mac: brew install postgresql
# Linux: sudo apt-get install postgresql

# 2. Create database
createdb translation_manager

# 3. Run setup script
psql -d translation_manager -f postgresql.sql

# 4. Done! ✅
```

### Option 2: MySQL

```bash
# 1. Install MySQL
# Windows: https://dev.mysql.com/downloads/installer/
# Mac: brew install mysql
# Linux: sudo apt-get install mysql-server

# 2. Create database
mysql -u root -p -e "CREATE DATABASE translation_manager"

# 3. Run setup script
mysql -u root -p translation_manager < mysql.sql

# 4. Done! ✅
```

### Option 3: SQLite (Paling Mudah!)

```bash
# 1. Install SQLite (biasanya sudah terinstall)
# Windows: choco install sqlite
# Mac/Linux: biasanya sudah ada

# 2. Create database dan run setup
sqlite3 translation_manager.db < sqlite.sql

# 3. Done! ✅
```

## 💾 How to Insert Translation Data

### Method 1: Using Python Script (Recommended)

```bash
# Install dependencies
pip install psycopg2-binary  # for PostgreSQL
# OR
pip install mysql-connector-python  # for MySQL
# SQLite tidak perlu install (built-in)

# Import translation file
python insert_translation.py \
  --db postgres \
  --file /path/to/translation_en.json \
  --project-id 12345 \
  --project-name "My Mobile App" \
  --language-code en \
  --language-name English \
  --cleaning-mode basic

# For SQLite (simplest)
python insert_translation.py \
  --db sqlite \
  --file translation_en.json \
  --project-id 12345
```

### Method 2: Manual SQL Insert

**PostgreSQL:**
```sql
INSERT INTO language_content_data (
  project_id, project_name, language_code, language_name,
  export_format, cleaning_mode, language_pack, terms_count, file_size_bytes
) VALUES (
  '12345',
  'My Mobile App',
  'en',
  'English',
  'json',
  'basic',
  '{"welcome": "Welcome", "login": "Login"}'::jsonb,
  2,
  512
);
```

**MySQL:**
```sql
INSERT INTO language_content_data (
  project_id, project_name, language_code, language_name,
  export_format, cleaning_mode, language_pack, terms_count, file_size_bytes
) VALUES (
  '12345',
  'My Mobile App',
  'en',
  'English',
  'json',
  'basic',
  '{"welcome": "Welcome", "login": "Login"}',
  2,
  512
);
```

**SQLite:**
```sql
INSERT INTO language_content_data (
  project_id, project_name, language_code, language_name,
  export_format, cleaning_mode, language_pack, terms_count, file_size_bytes
) VALUES (
  '12345',
  'My Mobile App',
  'en',
  'English',
  'json',
  'basic',
  '{"welcome": "Welcome", "login": "Login"}',
  2,
  512
);
```

## 🔍 Useful Queries

### View All Translations
```sql
SELECT * FROM language_content_data 
ORDER BY created_time DESC;
```

### Get Latest Version for Each Language
```sql
-- PostgreSQL
SELECT DISTINCT ON (language_code) *
FROM language_content_data
WHERE project_id = '12345'
ORDER BY language_code, version DESC;

-- MySQL
SELECT t1.*
FROM language_content_data t1
INNER JOIN (
  SELECT language_code, MAX(version) as max_version
  FROM language_content_data
  WHERE project_id = '12345'
  GROUP BY language_code
) t2 ON t1.language_code = t2.language_code 
    AND t1.version = t2.max_version;

-- SQLite
SELECT *
FROM language_content_data
WHERE project_id = '12345'
  AND (language_code, version) IN (
    SELECT language_code, MAX(version)
    FROM language_content_data
    WHERE project_id = '12345'
    GROUP BY language_code
  );
```

### Get Version History
```sql
SELECT language_version, version, language_code, created_time, terms_count
FROM language_content_data
WHERE project_id = '12345'
ORDER BY language_code, version DESC;
```

### Search in Translation Data
```sql
-- PostgreSQL
SELECT project_id, language_code, language_pack->>'welcome' as welcome_text
FROM language_content_data
WHERE language_pack->>'welcome' LIKE '%Welcome%';

-- MySQL
SELECT project_id, language_code, JSON_EXTRACT(language_pack, '$.welcome') as welcome_text
FROM language_content_data
WHERE JSON_EXTRACT(language_pack, '$.welcome') LIKE '%Welcome%';

-- SQLite
SELECT project_id, language_code, json_extract(language_pack, '$.welcome') as welcome_text
FROM language_content_data
WHERE json_extract(language_pack, '$.welcome') LIKE '%Welcome%';
```

## 🔧 Database Management

### Backup Database

**PostgreSQL:**
```bash
pg_dump -U postgres translation_manager > backup_$(date +%Y%m%d).sql
```

**MySQL:**
```bash
mysqldump -u root -p translation_manager > backup_$(date +%Y%m%d).sql
```

**SQLite:**
```bash
sqlite3 translation_manager.db ".backup backup_$(date +%Y%m%d).db"
```

### Restore Database

**PostgreSQL:**
```bash
psql -U postgres translation_manager < backup_20260422.sql
```

**MySQL:**
```bash
mysql -u root -p translation_manager < backup_20260422.sql
```

**SQLite:**
```bash
sqlite3 translation_manager.db ".restore backup_20260422.db"
```

### Clean Old Versions (Keep Last 10)

```sql
-- PostgreSQL
WITH ranked_versions AS (
  SELECT language_version,
         ROW_NUMBER() OVER (
           PARTITION BY project_id, language_code 
           ORDER BY version DESC
         ) as rn
  FROM language_content_data
)
DELETE FROM language_content_data
WHERE language_version IN (
  SELECT language_version FROM ranked_versions WHERE rn > 10
);

-- MySQL
DELETE t1 FROM language_content_data t1
INNER JOIN (
  SELECT language_version,
         ROW_NUMBER() OVER (
           PARTITION BY project_id, language_code 
           ORDER BY version DESC
         ) as rn
  FROM language_content_data
) t2 ON t1.language_version = t2.language_version
WHERE t2.rn > 10;

-- SQLite
DELETE FROM language_content_data
WHERE language_version NOT IN (
  SELECT language_version
  FROM (
    SELECT language_version,
           ROW_NUMBER() OVER (
             PARTITION BY project_id, language_code 
             ORDER BY version DESC
           ) as rn
    FROM language_content_data
  )
  WHERE rn <= 10
);
```

## 📊 Database Schema

```
language_content_data
├── language_version (PK, auto-increment)
├── user_id (default: 'local_user')
├── project_id
├── project_name
├── language_code
├── language_name
├── export_format
├── cleaning_mode
├── language_pack (JSON)
├── version (auto-increment per project/language)
├── terms_count
├── file_size_bytes
├── created_by
├── created_time
├── updated_by
└── updated_time
```

## 🎯 Workflow Example

1. **Download** translation dari POEditor Manager web app
2. **Validate** dengan Lockey (string cleaning)
3. **Save** JSON file ke folder lokal (e.g., `downloads/translation_en.json`)
4. **Import** ke database:
   ```bash
   python insert_translation.py \
     --db sqlite \
     --file downloads/translation_en.json \
     --project-id 12345 \
     --project-name "My App"
   ```
5. **Query** database untuk melihat history:
   ```sql
   SELECT * FROM language_content_data 
   WHERE project_id = '12345' 
   ORDER BY version DESC;
   ```

## ❓ FAQ

**Q: Database mana yang paling mudah?**
A: SQLite - tidak perlu install server, cukup satu file .db

**Q: Apakah data saya aman?**
A: Ya, data tersimpan di laptop Anda sendiri, tidak ada yang bisa akses

**Q: Bagaimana cara backup?**
A: Lihat section "Backup Database" di atas

**Q: Apakah bisa pindah dari SQLite ke PostgreSQL?**
A: Ya, export data dari SQLite dan import ke PostgreSQL

**Q: Berapa banyak data yang bisa disimpan?**
A: SQLite: ~140 TB, PostgreSQL/MySQL: praktis unlimited

## 🆘 Troubleshooting

**Error: "psycopg2 not installed"**
```bash
pip install psycopg2-binary
```

**Error: "mysql-connector not installed"**
```bash
pip install mysql-connector-python
```

**Error: "database does not exist"**
```bash
# PostgreSQL
createdb translation_manager

# MySQL
mysql -u root -p -e "CREATE DATABASE translation_manager"
```

**Error: "permission denied"**
```bash
# PostgreSQL
sudo -u postgres psql

# MySQL
mysql -u root -p
```

## 📚 Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [Python psycopg2](https://www.psycopg.org/docs/)
- [Python mysql-connector](https://dev.mysql.com/doc/connector-python/en/)

## 💡 Tips

1. **Use SQLite** untuk development/testing (paling simple)
2. **Use PostgreSQL** untuk production (paling powerful)
3. **Backup regularly** - setup cron job untuk auto backup
4. **Clean old versions** - jangan biarkan database terlalu besar
5. **Index properly** - sudah di-setup di script, jangan hapus indexes

## 📞 Support

Jika ada pertanyaan atau masalah, silakan hubungi tim development atau buka issue di repository.
