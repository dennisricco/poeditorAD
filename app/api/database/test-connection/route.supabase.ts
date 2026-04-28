// Simple Supabase implementation for Vercel
// This uses your existing Supabase setup
// Rename this file to route.ts to use in production

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type } = body;

    // Only support PostgreSQL (Supabase) in serverless
    if (type !== 'postgresql') {
      return NextResponse.json(
        { 
          success: false, 
          error: `${type} is not supported in Vercel serverless. Use PostgreSQL (Supabase).` 
        },
        { status: 400 }
      );
    }

    // Get Supabase credentials from environment or request
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || body.host;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || body.password;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Supabase credentials not found. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in environment variables.' 
        },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test connection with a simple query
    const { error } = await supabase
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
        host: supabaseUrl,
        database: body.database || 'postgres',
        type: 'postgresql'
      },
    });

  } catch (error: any) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to connect to database' 
      },
      { status: 500 }
    );
  }
}
