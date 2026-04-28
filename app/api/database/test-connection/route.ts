import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { DatabaseConnectionConfig } from '@/app/types/database-connection';

export async function POST(request: NextRequest) {
  try {
    const body: DatabaseConnectionConfig = await request.json();
    const { type } = body;

    // Validate database type
    if (!type) {
      return NextResponse.json(
        { success: false, error: 'Database type is required' },
        { status: 400 }
      );
    }

    // For Vercel deployment, we only support PostgreSQL via Supabase
    if (type === 'postgresql') {
      return await testPostgreSQLConnection(body);
    }

    // For other database types, return not supported in serverless
    return NextResponse.json(
      { 
        success: false, 
        error: `${type} is not supported in serverless environment. Please use PostgreSQL via Supabase.` 
      },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('Database connection test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to test database connection' 
      },
      { status: 500 }
    );
  }
}

// PostgreSQL Connection Test using Supabase
async function testPostgreSQLConnection(config: any) {
  try {
    // Get Supabase credentials from environment or request
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || config.host;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || config.password;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Supabase credentials not found. Please check your configuration.' 
        },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test connection with a simple query
    const { data, error } = await supabase
      .from('language_content_data')
      .select('language_version')
      .limit(1);

    if (error && error.code !== '42P01') {
      // 42P01 = table doesn't exist (but connection is valid)
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'PostgreSQL (Supabase) connection successful!',
      connectionInfo: {
        host: supabaseUrl.replace('https://', ''),
        port: config.port || '5432',
        database: config.database || 'postgres',
        username: config.username || 'postgres',
        type: 'postgresql'
      },
    });

  } catch (error: any) {
    console.error('PostgreSQL connection error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to connect to PostgreSQL database' 
      },
      { status: 500 }
    );
  }
}
