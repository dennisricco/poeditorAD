# POE3D - POEditor Translation Manager 🎨

A fun and colorful translation management platform with **3D Cartoon Neobrutalism** design! Manage your POEditor translations with style.

## ✨ Features

### 🔐 Authentication System (NEW!)
- ✅ User registration with Terms & Conditions
- ✅ Email/password authentication
- ✅ Secure login/logout
- ✅ Protected routes
- ✅ Session management
- ✅ User profile in database

### 🌍 Translation Management
- 🔄 POEditor API integration
- 📦 Multiple export formats (JSON, CSV, etc.)
- 🧹 String cleaning utilities
- 🎯 Dual language export
- 🌐 Multi-language support
- 💾 **Save to Database** (NEW!)
- 📊 Version control with auto-increment
- 📥 Load previous versions
- 🗑️ Delete old versions
- 🗄️ **Universal Database Connection** (NEW!)
- 🔌 **Express.js Backend** (NEW!)
- 🎯 **Multi-Database Support** (NEW!)
  - MySQL
  - PostgreSQL
  - SQL Server
  - Oracle (optional)
  - SQLite (optional)
- 📝 SQL Query Editor
- 📤 Import Lockey JSON to Database
- 🔄 **Lockey Sync** (NEW!)
- 📊 Export query results
- 🔽 **Download with SQL Query** (NEW!)
  - Download validated Lockey JSON
  - Auto-generated SQL insert scripts
  - Support for all databases (PostgreSQL, MySQL, Oracle, SQLite)
  - Oracle BLOB/CLOB solutions included

### 🎨 Design System
- 💥 3D Cartoon Neobrutalism style
- 🎨 Bold borders and shadows
- 🌈 Bright color palette (Yellow, Blue, Pink, Green)
- ✨ Playful animations
- 📱 Fully responsive

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account (free)
- POEditor API token
- Database server (MySQL/PostgreSQL/SQL Server) - optional

### 1. Clone & Install
```bash
git clone <repository-url>
cd poe-3d-cartoon-bni
npm install
```

### 2. Setup Backend (Optional - for multi-database support)
```bash
cd backend
npm install --no-optional
npm start
```
Backend akan berjalan di http://localhost:3001

📖 **Backend guide**: [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md)

### 3. Setup Supabase
**⚠️ IMPORTANT: You must setup Supabase first!**

1. Create project at https://supabase.com
2. Get credentials (Settings → API)
3. Run SQL schema (see `supabase-schema.sql`)
4. Enable email authentication

📖 **Detailed guide**: [NEXT_STEPS.md](./NEXT_STEPS.md)

### 4. Configure Environment
Edit `.env.local`:
```env
NEXT_PUBLIC_POEDITOR_API_TOKEN=your-token
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001/api
```

### 5. Run Development Server
```bash
npm run dev
```

Open http://localhost:3000

## 📖 Documentation

### Getting Started
- **[NEXT_STEPS.md](./NEXT_STEPS.md)** - 🚨 START HERE! Setup guide
- **[QUICK_START.md](./QUICK_START.md)** - Quick start guide
- **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** - Detailed Supabase setup
- **[SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md)** - Complete setup checklist
- **[BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md)** - 🔌 Backend integration guide (NEW!)

### Backend Documentation
- **[backend/README.md](./backend/README.md)** - Backend full documentation
- **[backend/INSTALL.md](./backend/INSTALL.md)** - Installation troubleshooting
- **[backend/QUICKSTART.md](./backend/QUICKSTART.md)** - Backend quick start
- **[backend/SUMMARY.md](./backend/SUMMARY.md)** - Backend summary

### Features
- **[AUTH_FLOW.md](./AUTH_FLOW.md)** - Authentication flow explained
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - What's implemented
- **[QUICK_START_SAVE_FEATURE.md](./QUICK_START_SAVE_FEATURE.md)** - ⚡ Save to Database quick start
- **[SAVE_TO_DATABASE_COMPLETE.md](./SAVE_TO_DATABASE_COMPLETE.md)** - Complete Save feature guide
- **[VISUAL_GUIDE_SAVE_BUTTON.md](./VISUAL_GUIDE_SAVE_BUTTON.md)** - Visual reference guide
- **[ORACLE_SETUP.md](./ORACLE_SETUP.md)** - 🗄️ Oracle Database Connection setup
- **[DOWNLOAD_WITH_SQL_GUIDE.md](./DOWNLOAD_WITH_SQL_GUIDE.md)** - 🔽 Download with SQL Query guide
- **[PANDUAN_DOWNLOAD_SQL.md](./PANDUAN_DOWNLOAD_SQL.md)** - 🔽 Panduan Download SQL (Bahasa Indonesia)

### Technical
- **[DATABASE_ARCHITECTURE.md](./DATABASE_ARCHITECTURE.md)** - Database schema details
- **[DATABASE_SAVE_FEATURE.md](./DATABASE_SAVE_FEATURE.md)** - Save feature specification
- **[DEBUG_SAVE_BUTTON.md](./DEBUG_SAVE_BUTTON.md)** - Debugging guide
- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Comprehensive testing guide
- **[FIX_401_UNAUTHORIZED.md](./FIX_401_UNAUTHORIZED.md)** - Auth fix documentation
- **[DUAL_LANGUAGE_COMBINED_SAVE.md](./DUAL_LANGUAGE_COMBINED_SAVE.md)** - Dual language combined save
- **[RINGKASAN_DUAL_LANGUAGE_SAVE.md](./RINGKASAN_DUAL_LANGUAGE_SAVE.md)** - Dual language save (Indonesian)
- **[database/local-setup/oracle-blob-solution.sql](./database/local-setup/oracle-blob-solution.sql)** - 🗄️ Oracle BLOB/CLOB solutions

## 🎯 User Flow

```
Landing Page
    ↓ Click "Get Started"
Register Page
    ↓ Fill form & submit
Terms & Conditions Modal
    ↓ Accept terms
Account Created
    ↓ Auto-redirect
Login Page
    ↓ Enter credentials
Dashboard (Protected)
    ↓ Logout
Back to Landing
```

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js 16.2.3 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **API**: POEditor API
- **Icons**: Lucide React
- **Flags**: flag-icons

### Backend (NEW!)
- **Framework**: Express.js 4.18
- **Language**: JavaScript (Node.js)
- **Database Drivers**:
  - MySQL: mysql2
  - PostgreSQL: pg
  - SQL Server: tedious
  - Oracle: oracledb (optional)
  - SQLite: better-sqlite3 (optional)
- **Security**: Helmet, CORS, Rate Limiting
- **Performance**: Compression, Connection Pooling

## 📁 Project Structure

```
poe-3d-cartoon-bni/
├── app/
│   ├── api/                    # API routes
│   │   ├── poeditor/          # POEditor endpoints
│   │   ├── translations/      # Translation endpoints
│   │   └── database/          # Database endpoints (NEW!)
│   ├── components/            # React components
│   │   ├── Navbar.tsx         # Dashboard navbar
│   │   ├── LandingNavbar.tsx  # Landing navbar
│   │   ├── TermsModal.tsx     # T&C modal
│   │   ├── UniversalConnectionForm.tsx  # DB connection (NEW!)
│   │   ├── LockeySyncButton.tsx         # Lockey sync (NEW!)
│   │   └── ...
│   ├── lib/                   # Utilities
│   │   ├── supabase.ts        # Supabase client
│   │   ├── auth.ts            # Auth functions
│   │   ├── AuthProvider.tsx   # Auth context
│   │   └── backend-api.ts     # Backend API client (NEW!)
│   ├── types/                 # TypeScript types
│   ├── dashboard/             # Dashboard page
│   ├── login/                 # Login page
│   ├── register/              # Register page
│   ├── database-connection/   # Database page (NEW!)
│   ├── learn-more/            # Learn More page
│   └── page.tsx               # Landing page
├── backend/                   # Express.js Backend (NEW!)
│   ├── src/
│   │   ├── config/           # Database config
│   │   ├── middleware/       # Express middleware
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   └── server.js         # Main server
│   ├── .env                  # Backend environment
│   ├── package.json          # Backend dependencies
│   └── README.md             # Backend docs
├── middleware.ts              # Route protection
├── supabase-schema.sql        # Database schema
└── ...
```

## 🔐 Authentication Features

### Registration
- Full name, email, password
- Password confirmation
- Terms & Conditions modal
- Auto-redirect to login

### Login
- Email/password authentication
- Error handling
- Auto-redirect to dashboard

### Dashboard
- Protected route
- User info display
- Logout functionality

### Security
- Row Level Security (RLS)
- Session management
- Route protection middleware
- Secure token storage

## 🎨 Design System

### Colors
- **Yellow**: `#FFDE59` (poe-yellow)
- **Blue**: `#6B9EFF` (poe-blue)
- **Pink**: `#FF6B9E` (poe-pink)
- **Green**: `#6BFF9E` (poe-green)
- **Black**: `#000000` (poe-black)

### Typography
- Font: System fonts (sans-serif)
- Weights: Bold (700), Black (900)
- Style: Italic for emphasis

### Components
- 4px borders
- Cartoon shadows
- Rounded corners (xl, 2xl, 3xl)
- Hover animations
- Press effects

## 🛠️ Development

### Available Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

### Environment Variables
```env
# POEditor
NEXT_PUBLIC_POEDITOR_API_TOKEN=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Backend (NEW!)
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001/api
```

## 📊 Database Schema

### Table: users
```sql
- id (UUID, PK)
- email (TEXT, UNIQUE)
- full_name (TEXT)
- avatar_url (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Table: language_content_data (NEW!)
```sql
- language_version (BIGSERIAL, PK)
- user_id (UUID)
- project_id (VARCHAR)
- project_name (VARCHAR)
- language_code (VARCHAR)
- language_name (VARCHAR)
- export_format (VARCHAR)
- cleaning_mode (VARCHAR)
- language_pack (JSONB)
- version (INTEGER, auto-increment per project/language)
- terms_count (INTEGER)
- file_size_bytes (BIGINT)
- created_by (UUID)
- created_time (TIMESTAMP)
- updated_by (UUID)
- updated_time (TIMESTAMP)
```

### Policies
- Users can view/update own profile
- Users can only access their own translations
- Auto-create profile on signup
- Row Level Security enabled on all tables

## 🔜 Roadmap

### Completed ✅
- [x] User authentication (register, login, logout)
- [x] POEditor API integration
- [x] String cleaning utilities
- [x] Dual language export
- [x] Save to Database feature
- [x] Version control with auto-increment
- [x] Load previous versions
- [x] Delete old versions
- [x] Express.js Backend with multi-database support
- [x] Universal Database Connection page
- [x] SQL Query Editor
- [x] Lockey Sync functionality
- [x] Import Lockey JSON to Database
- [x] Download with SQL Query feature
- [x] Oracle BLOB/CLOB solution documentation

### In Progress 🚧
- [ ] Forgot password functionality
- [ ] Email verification

### Planned 📋
- [ ] Social authentication (Google, GitHub)
- [ ] User profile editing
- [ ] Avatar upload
- [ ] Project CRUD operations
- [ ] Translation comparison view
- [ ] Export history analytics
- [ ] Team collaboration

## 🐛 Troubleshooting

### Common Issues

**"Missing Supabase environment variables"**
- Check `.env.local` exists and is filled
- Restart dev server

**"Invalid API key"**
- Verify credentials in Supabase dashboard
- Check for extra spaces

**Can't register/login**
- Ensure SQL schema is executed
- Check email provider is enabled
- Check browser console for errors

📖 More help: [SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md)

## 🔐 Security & Deployment

### Before Pushing to GitHub:
1. **Check `.gitignore`** - Ensure all sensitive files are ignored
2. **Review `.env.example`** - Template for environment variables
3. **Run security check**:
   - Windows: `.\pre-commit-check.ps1`
   - Mac/Linux: `bash pre-commit-check.sh`
4. **Never commit**:
   - `.env.local`
   - `.env.production`
   - Any files with API keys or passwords

### Deployment:
- See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for complete deployment guide
- See **[SECURITY.md](./SECURITY.md)** for security best practices

### Quick Security Check:

**Windows (PowerShell):**
```powershell
# Run before commit
.\pre-commit-check.ps1

# Check for vulnerabilities
npm audit

# Check TypeScript
npm run lint
```

**Mac/Linux (Bash):**
```bash
# Run before commit
bash pre-commit-check.sh

# Check for vulnerabilities
npm audit

# Check TypeScript
npm run lint
```

## 📝 License

This project is private and proprietary.

## 🤝 Contributing

This is a private project. Contact the maintainer for contribution guidelines.

## 📧 Support

For issues or questions:
1. Check documentation files
2. Review Supabase logs
3. Check browser console
4. Contact project maintainer

## 🎉 Acknowledgments

- Design inspired by Neobrutalism trend
- Built with Next.js and Supabase
- POEditor API integration
- Flag icons from flag-icons library

---

**Version**: 2.0.0  
**Last Updated**: 2026-05-05  
**Status**: ✅ Ready for Production

**🚀 Start here**: [NEXT_STEPS.md](./NEXT_STEPS.md)  
**🔌 Backend setup**: [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md)
