import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import mysql from 'mysql2/promise';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { connectionConfig, projectId, language1, language2, cleaningMode } = body;

    // Validate required fields
    if (!connectionConfig || !projectId || !language1 || !language2) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { type } = connectionConfig;

    console.log('🚀 Starting Lockey sync...');
    console.log('📦 Project:', projectId);
    console.log('🌍 Languages:', language1, language2);
    console.log('🔧 Database:', type);

    // Step 1: Download and merge translations from POEditor
    console.log('📥 Step 1: Downloading translations from POEditor...');
    const lockeyData = await downloadAndMergeLockey(projectId, language1, language2, cleaningMode);

    if (!lockeyData.success) {
      return NextResponse.json(
        { success: false, error: lockeyData.error },
        { status: 500 }
      );
    }

    console.log('✅ Downloaded and merged Lockey file');
    console.log('📊 Terms count:', lockeyData.termsCount);
    console.log('📦 File size:', lockeyData.fileSize, 'bytes');

    // Step 2: Insert into database based on type
    console.log('💾 Step 2: Inserting into database...');
    
    switch (type) {
      case 'postgresql':
        return await syncToPostgreSQL(connectionConfig, lockeyData, projectId, language1, language2, cleaningMode, request);
      case 'mysql':
        return await syncToMySQL(connectionConfig, lockeyData, projectId, language1, language2, cleaningMode);
      case 'oracle':
        return await syncToOracle(connectionConfig, lockeyData, projectId, language1, language2, cleaningMode);
      default:
        return NextResponse.json(
          { success: false, error: `Database type '${type}' not supported for Lockey sync` },
          { status: 400 }
        );
    }

  } catch (error: any) {
    console.error('❌ Lockey sync error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to sync Lockey' },
      { status: 500 }
    );
  }
}

// Download and merge translations from POEditor
async function downloadAndMergeLockey(
  projectId: string,
  language1: string,
  language2: string,
  cleaningMode: string
) {
  try {
    // Call the existing export-dual-preview API
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/poeditor/export-dual-preview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectId,
        language1,
        language2,
        format: 'key_value_json',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to download translations from POEditor');
    }

    const data = await response.json();

    if (data.response?.status !== 'success') {
      throw new Error(data.response?.message || 'POEditor API error');
    }

    // NEW STRUCTURE: Store all languages separately in one object
    let lang1Data: Record<string, any> = {};
    let lang2Data: Record<string, any> = {};
    
    if (cleaningMode === 'none') {
      // Use original data
      lang1Data = data.originalData1 || {};
      lang2Data = data.originalData2 || {};
    } else {
      // Use cleaned data
      lang1Data = data.cleanedData1 || {};
      lang2Data = data.cleanedData2 || {};
    }

    // Normalize language codes: remove region variants (e.g., "en-us" -> "en")
    // Then add "-ID" suffix for Indonesia region
    const normalizeLanguageCode = (code: string): string => {
      // Split by hyphen and take only the first part (language code)
      const baseLang = code.toLowerCase().split('-')[0];
      return `${baseLang}-ID`;
    };
    
    const locale1 = normalizeLanguageCode(language1);  // "en-us" -> "en-ID", "en" -> "en-ID"
    const locale2 = normalizeLanguageCode(language2);  // "id" -> "id-ID"
    
    // Create structured Lockey format with locale codes
    // IMPORTANT: Maintain order - Language 1 first, Language 2 second
    const lockeyStructured = {
      [locale1]: lang1Data,
      [locale2]: lang2Data,
    };

    const jsonString = JSON.stringify(lockeyStructured, null, 2);
    const termsCount = Object.keys(lang1Data).length + Object.keys(lang2Data).length;
    const fileSize = Buffer.byteLength(jsonString, 'utf8');

    return {
      success: true,
      data: lockeyStructured, // Structured format: { "en-ID": {...}, "id-ID": {...} }
      jsonString,
      termsCount,
      fileSize,
      languages: [locale1, locale2],
    };

  } catch (error: any) {
    console.error('Download error:', error);
    return {
      success: false,
      error: error.message || 'Failed to download translations',
    };
  }
}

// Sync to PostgreSQL (Supabase)
async function syncToPostgreSQL(
  config: any,
  lockeyData: any,
  projectId: string,
  language1: string,
  language2: string,
  cleaningMode: string,
  request: NextRequest
) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || `https://${config.host}`;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || config.password;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { success: false, error: 'Supabase credentials not found' },
        { status: 400 }
      );
    }

    // Create Supabase client with service role (bypasses RLS)
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Try to get authenticated user from cookies
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('sb-access-token')?.value || 
                       cookieStore.get('supabase-auth-token')?.value;
    
    let userId: string | null = null;

    if (accessToken) {
      // Get user from access token
      const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
      if (user && !authError) {
        userId = user.id;
        console.log('✅ Using authenticated user:', userId);
      }
    }

    // If no authenticated user, get any user from database (for testing)
    if (!userId) {
      console.log('⚠️ No authenticated user, looking for any user...');
      
      const { data: users, error: usersError } = await supabaseAdmin
        .rpc('get_first_user_id');
      
      if (usersError) {
        // Fallback: try direct query
        const { data: authUsers, error: authError } = await supabaseAdmin
          .from('auth.users')
          .select('id')
          .limit(1)
          .single();
        
        if (authError || !authUsers) {
          return NextResponse.json(
            { success: false, error: 'No user found in database. Please register or login first.' },
            { status: 401 }
          );
        }
        
        userId = authUsers.id;
      } else {
        userId = users;
      }
      
      console.log('⚠️ Using fallback user:', userId);
    }

    // Insert into language_content_data (service role bypasses RLS)
    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('language_content_data')
      .insert({
        user_id: userId,
        project_id: projectId,
        project_name: config.projectName || projectId,
        language_code: `${language1}_${language2}`,
        language_name: `${language1.toUpperCase()} + ${language2.toUpperCase()}`,
        export_format: 'key_value_json',
        cleaning_mode: cleaningMode,
        language_pack: lockeyData.data,
        version: 1,
        terms_count: lockeyData.termsCount,
        file_size_bytes: lockeyData.fileSize,
        created_by: userId,
        updated_by: userId,
      })
      .select('language_version')
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      throw insertError;
    }

    console.log('✅ Inserted into language_content_data, version:', insertData.language_version);

    return NextResponse.json({
      success: true,
      message: 'Lockey synced successfully to PostgreSQL!',
      details: {
        languageVersion: insertData.language_version,
        termsCount: lockeyData.termsCount,
        fileSize: lockeyData.fileSize,
        languages: `${language1} + ${language2}`,
        languagesList: lockeyData.languages || [language1, language2],
        cleaningMode: cleaningMode,
        structure: 'Multi-language structured format',
      },
    });

  } catch (error: any) {
    console.error('PostgreSQL sync error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to sync to PostgreSQL' },
      { status: 500 }
    );
  }
}

// Sync to MySQL
async function syncToMySQL(
  config: any,
  lockeyData: any,
  projectId: string,
  language1: string,
  language2: string,
  cleaningMode: string
) {
  let connection;

  try {
    const connectionConfig = {
      host: config.host,
      port: parseInt(config.port) || 3306,
      user: config.username,
      password: config.password,
      database: config.database,
      connectTimeout: 10000,
      ssl: config.ssl ? { rejectUnauthorized: false } : undefined
    };

    connection = await mysql.createConnection(connectionConfig);

    const userId = config.userId || 'SYSTEM';

    // Insert into language_content_data (assuming similar table structure)
    const insertQuery = `
      INSERT INTO language_content_data (
        user_id, project_id, project_name, language_code, language_name,
        export_format, cleaning_mode, language_pack, version,
        terms_count, file_size_bytes, created_by, updated_by,
        created_time, updated_time
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, NOW(), NOW())
    `;

    const [result] = await connection.execute(insertQuery, [
      userId,
      projectId,
      config.projectName || projectId,
      `${language1}_${language2}`,
      `${language1.toUpperCase()} + ${language2.toUpperCase()}`,
      'key_value_json',
      cleaningMode,
      lockeyData.jsonString, // Store as TEXT/JSON
      lockeyData.termsCount,
      lockeyData.fileSize,
      userId,
      userId,
    ]);

    await connection.end();

    const insertResult: any = result;

    return NextResponse.json({
      success: true,
      message: 'Lockey synced successfully to MySQL!',
      details: {
        languageVersion: insertResult.insertId,
        termsCount: lockeyData.termsCount,
        fileSize: lockeyData.fileSize,
        languages: `${language1} + ${language2}`,
        languagesList: lockeyData.languages || [language1, language2],
        cleaningMode: cleaningMode,
        structure: 'Multi-language structured format',
      },
    });

  } catch (error: any) {
    console.error('MySQL sync error:', error);
    
    if (connection) {
      try {
        await connection.end();
      } catch (e) {
        // Ignore
      }
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to sync to MySQL' },
      { status: 500 }
    );
  }
}

// Sync to Oracle (via proxy)
async function syncToOracle(
  config: any,
  lockeyData: any,
  projectId: string,
  language1: string,
  language2: string,
  cleaningMode: string
) {
  try {
    const proxyUrl = process.env.ORACLE_PROXY_URL;

    if (!proxyUrl) {
      return NextResponse.json(
        { success: false, error: 'Oracle proxy not configured' },
        { status: 400 }
      );
    }

    // For Oracle, we need to:
    // 1. INSERT with EMPTY_BLOB()
    // 2. Get the ROWID
    // 3. UPDATE the BLOB with actual data
    // This is complex and requires special handling in the proxy

    // For now, return a message that Oracle sync needs special implementation
    return NextResponse.json(
      { 
        success: false, 
        error: 'Oracle BLOB sync requires special implementation. Please use PostgreSQL or MySQL for testing.' 
      },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('Oracle sync error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to sync to Oracle' },
      { status: 500 }
    );
  }
}
