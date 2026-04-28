// Simple Supabase implementation for query execution
// Rename this file to route.ts to use in production

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { connectionConfig, query } = body;

    if (!connectionConfig || !query) {
      return NextResponse.json(
        { success: false, error: 'Connection config and query are required' },
        { status: 400 }
      );
    }

    if (!query.trim()) {
      return NextResponse.json(
        { success: false, error: 'Query cannot be empty' },
        { status: 400 }
      );
    }

    const { type } = connectionConfig;

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

    return await executePostgreSQLQuery(connectionConfig, query);

  } catch (error: any) {
    console.error('Query execution error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to execute query' 
      },
      { status: 500 }
    );
  }
}

async function executePostgreSQLQuery(config: any, query: string) {
  const startTime = Date.now();

  try {
    // Get Supabase credentials
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || config.host;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || config.password;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Supabase credentials not found' 
        },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Execute raw SQL query using Supabase RPC
    // Note: You need to create a PostgreSQL function in Supabase for this
    const { data, error } = await supabase.rpc('execute_sql', {
      sql_query: query
    });

    if (error) {
      // If RPC function doesn't exist, provide helpful error
      if (error.code === '42883') {
        return NextResponse.json(
          { 
            success: false, 
            error: 'SQL execution function not found. Please create the execute_sql function in Supabase. See documentation for setup instructions.' 
          },
          { status: 400 }
        );
      }
      throw error;
    }

    const executionTime = Date.now() - startTime;

    // Parse result based on query type
    const queryType = getQueryType(query);

    if (queryType === 'SELECT' && Array.isArray(data)) {
      // Convert array of objects to columns and rows format
      if (data.length > 0) {
        const columns = Object.keys(data[0]);
        const rows = data.map(row => columns.map(col => row[col]));
        
        return NextResponse.json({
          success: true,
          result: {
            columns,
            rows,
            rowCount: rows.length,
            executionTime,
          },
        });
      } else {
        return NextResponse.json({
          success: true,
          result: {
            columns: [],
            rows: [],
            rowCount: 0,
            executionTime,
          },
        });
      }
    }

    // For non-SELECT queries
    return NextResponse.json({
      success: true,
      message: `${queryType} query executed successfully`,
      rowsAffected: data?.affected_rows || 0,
      executionTime,
    });

  } catch (error: any) {
    console.error('PostgreSQL query error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to execute query' 
      },
      { status: 500 }
    );
  }
}

function getQueryType(query: string): string {
  const queryUpper = query.trim().toUpperCase();
  if (queryUpper.startsWith('SELECT')) return 'SELECT';
  if (queryUpper.startsWith('INSERT')) return 'INSERT';
  if (queryUpper.startsWith('UPDATE')) return 'UPDATE';
  if (queryUpper.startsWith('DELETE')) return 'DELETE';
  if (queryUpper.startsWith('CREATE')) return 'CREATE';
  if (queryUpper.startsWith('DROP')) return 'DROP';
  if (queryUpper.startsWith('ALTER')) return 'ALTER';
  if (queryUpper.startsWith('TRUNCATE')) return 'TRUNCATE';
  return 'OTHER';
}
