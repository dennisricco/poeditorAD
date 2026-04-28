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

// Helper function to determine query type
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

// PostgreSQL Query Execution using Supabase
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

    // Create Supabase client with service role key (bypasses RLS)
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const queryType = getQueryType(query);
    console.log('🔍 Executing query type:', queryType);
    console.log('📝 Query:', query);

    // For SELECT queries, try direct table query first (simpler and more reliable)
    if (queryType === 'SELECT') {
      // Try to parse table name from query (handle schema.table format)
      const tableMatch = query.match(/FROM\s+(?:([a-zA-Z_][a-zA-Z0-9_]*)\.)?\s*([a-zA-Z_][a-zA-Z0-9_]*)/i);
      
      if (tableMatch) {
        const schema = tableMatch[1] || 'public';
        const tableName = tableMatch[2];
        const fullTableName = schema === 'public' ? tableName : `${schema}.${tableName}`;
        console.log('📋 Detected table:', fullTableName);
        
        try {
          // Simple SELECT * FROM table query
          const { data: tableData, error: tableError } = await supabase
            .from(tableName)
            .select('*');

          if (!tableError && tableData) {
            console.log('✅ Direct table query successful, rows:', tableData.length);
            console.log('📊 Sample data (first row):', tableData[0]);
            
            if (tableData.length > 0) {
              // Get ALL columns from the first row
              const columns = Object.keys(tableData[0]);
              console.log('📋 Columns found:', columns);
              
              // Map each row to array format, preserving ALL columns
              const rows = tableData.map(row => {
                return columns.map(col => {
                  const value = row[col];
                  // Handle different data types properly
                  if (value === null || value === undefined) {
                    return null;
                  }
                  // Keep objects as-is (will be stringified by JSON.stringify)
                  if (typeof value === 'object') {
                    return value;
                  }
                  return value;
                });
              });
              
              console.log('✅ Mapped rows:', rows.length);
              console.log('📊 Sample row data:', rows[0]);
              
              return NextResponse.json({
                success: true,
                result: {
                  columns,
                  rows,
                  rowCount: rows.length,
                  executionTime: Date.now() - startTime,
                },
              });
            } else {
              return NextResponse.json({
                success: true,
                result: {
                  columns: [],
                  rows: [],
                  rowCount: 0,
                  executionTime: Date.now() - startTime,
                },
              });
            }
          } else {
            console.log('⚠️ Direct table query error:', tableError);
          }
        } catch (tableErr) {
          console.log('⚠️ Direct table query failed:', tableErr);
        }
      }

      // Fallback: Try RPC execute_sql
      console.log('🔄 Trying RPC execute_sql...');
      try {
        const { data: rpcData, error: rpcError } = await supabase.rpc('execute_sql', {
          sql_query: query
        });

        if (!rpcError && rpcData) {
          console.log('✅ RPC execution successful');
          
          if (Array.isArray(rpcData)) {
            if (rpcData.length > 0) {
              const columns = Object.keys(rpcData[0]);
              const rows = rpcData.map(row => columns.map(col => row[col]));
              
              return NextResponse.json({
                success: true,
                result: {
                  columns,
                  rows,
                  rowCount: rows.length,
                  executionTime: Date.now() - startTime,
                },
              });
            } else {
              return NextResponse.json({
                success: true,
                result: {
                  columns: [],
                  rows: [],
                  rowCount: 0,
                  executionTime: Date.now() - startTime,
                },
              });
            }
          }
        } else {
          console.log('⚠️ RPC error:', rpcError);
          
          // If RPC function doesn't exist
          if (rpcError && rpcError.code === '42883') {
            return NextResponse.json(
              { 
                success: false, 
                error: 'SQL execution function not found. Please use simple SELECT * FROM table_name queries, or create the execute_sql function in Supabase (see supabase-setup-function.sql).' 
              },
              { status: 400 }
            );
          }
        }
      } catch (rpcErr: any) {
        console.log('⚠️ RPC exception:', rpcErr);
      }

      // If all methods fail
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unable to execute SELECT query. Please use simple SELECT * FROM table_name format.' 
        },
        { status: 400 }
      );
    }

    // For non-SELECT queries, must use RPC
    const { data, error } = await supabase.rpc('execute_sql', {
      sql_query: query
    });

    if (error) {
      if (error.code === '42883') {
        return NextResponse.json(
          { 
            success: false, 
            error: 'SQL execution function not found. For INSERT/UPDATE/DELETE/CREATE queries, please create the execute_sql function in Supabase. See supabase-setup-function.sql for instructions.' 
          },
          { status: 400 }
        );
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: `${queryType} query executed successfully`,
      rowsAffected: data?.affected_rows || 0,
      executionTime: Date.now() - startTime,
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
