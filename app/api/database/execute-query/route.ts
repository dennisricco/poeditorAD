import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import mysql from 'mysql2/promise';
import { Connection as TediousConnection, Request as TediousRequest, TYPES } from 'tedious';
import { MongoClient } from 'mongodb';

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

    // Route to appropriate database handler
    switch (type) {
      case 'postgresql':
        return await executePostgreSQLQuery(connectionConfig, query);
      case 'mysql':
        return await executeMySQLQuery(connectionConfig, query);
      case 'sqlserver':
        return await executeSQLServerQuery(connectionConfig, query);
      case 'mongodb':
        return await executeMongoDBQuery(connectionConfig, query);
      case 'oracle':
        return await executeOracleQuery(connectionConfig, query);
      case 'sqlite':
        return NextResponse.json(
          { 
            success: false, 
            error: 'SQLite is not supported in serverless environments.' 
          },
          { status: 400 }
        );
      default:
        return NextResponse.json(
          { 
            success: false, 
            error: `Database type '${type}' is not supported` 
          },
          { status: 400 }
        );
    }

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
  if (queryUpper.startsWith('SHOW')) return 'SELECT';
  if (queryUpper.startsWith('DESCRIBE') || queryUpper.startsWith('DESC')) return 'SELECT';
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
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || `https://${config.host}`;
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
    console.log('🔍 Executing PostgreSQL query type:', queryType);

    // For SELECT queries, try direct table query first
    if (queryType === 'SELECT') {
      const tableMatch = query.match(/FROM\s+(?:([a-zA-Z_][a-zA-Z0-9_]*)\.)?\s*([a-zA-Z_][a-zA-Z0-9_]*)/i);
      
      if (tableMatch) {
        const tableName = tableMatch[2];
        
        try {
          const { data: tableData, error: tableError } = await supabase
            .from(tableName)
            .select('*');

          if (!tableError && tableData) {
            if (tableData.length > 0) {
              const columns = Object.keys(tableData[0]);
              const rows = tableData.map(row => columns.map(col => row[col]));
              
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
        } catch (tableErr) {
          console.log('⚠️ Direct table query failed, trying RPC');
        }
      }
    }

    // Fallback or non-SELECT: use RPC
    const { data: rpcData, error: rpcError } = await supabase.rpc('execute_sql', {
      sql_query: query
    });

    if (rpcError) {
      if (rpcError.code === '42883') {
        return NextResponse.json(
          { 
            success: false, 
            error: 'SQL execution function not found. Please create the execute_sql function in Supabase (see supabase-setup-function.sql).' 
          },
          { status: 400 }
        );
      }
      throw rpcError;
    }

    if (queryType === 'SELECT' && Array.isArray(rpcData)) {
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

    return NextResponse.json({
      success: true,
      message: `${queryType} query executed successfully`,
      rowsAffected: rpcData?.affected_rows || 0,
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

// MySQL Query Execution
async function executeMySQLQuery(config: any, query: string) {
  const startTime = Date.now();
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

    console.log('🔍 Executing MySQL query');

    connection = await mysql.createConnection(connectionConfig);

    const queryType = getQueryType(query);
    const [results, fields] = await connection.query(query);

    await connection.end();

    // Handle SELECT queries
    if (queryType === 'SELECT' && Array.isArray(results)) {
      if (results.length > 0) {
        const columns = Object.keys(results[0]);
        const rows = results.map((row: any) => columns.map(col => row[col]));

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

    // Handle non-SELECT queries
    const result: any = results;
    return NextResponse.json({
      success: true,
      message: `${queryType} query executed successfully`,
      rowsAffected: result.affectedRows || 0,
      executionTime: Date.now() - startTime,
    });

  } catch (error: any) {
    console.error('MySQL query error:', error);
    
    if (connection) {
      try {
        await connection.end();
      } catch (e) {
        // Ignore
      }
    }

    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to execute MySQL query' 
      },
      { status: 500 }
    );
  }
}

// SQL Server Query Execution
async function executeSQLServerQuery(config: any, query: string): Promise<NextResponse> {
  const startTime = Date.now();

  return new Promise<NextResponse>((resolve) => {
    const connectionConfig = {
      server: config.host,
      authentication: {
        type: 'default' as const,
        options: {
          userName: config.username,
          password: config.password,
        }
      },
      options: {
        port: parseInt(config.port) || 1433,
        database: config.database,
        encrypt: config.encrypt !== false,
        trustServerCertificate: true,
        connectTimeout: 10000,
        requestTimeout: 30000,
        instanceName: config.instance || undefined
      }
    };

    console.log('🔍 Executing SQL Server query');

    const connection = new TediousConnection(connectionConfig);

    connection.on('connect', (err) => {
      if (err) {
        console.error('SQL Server connection error:', err);
        resolve(NextResponse.json(
          { 
            success: false, 
            error: err.message || 'Failed to connect to SQL Server' 
          },
          { status: 500 }
        ));
        return;
      }

      const queryType = getQueryType(query);
      const columns: string[] = [];
      const rows: any[][] = [];

      const request = new TediousRequest(query, (err, rowCount) => {
        connection.close();

        if (err) {
          console.error('SQL Server query error:', err);
          resolve(NextResponse.json(
            { 
              success: false, 
              error: err.message || 'Failed to execute SQL Server query' 
            },
            { status: 500 }
          ));
          return;
        }

        if (queryType === 'SELECT') {
          resolve(NextResponse.json({
            success: true,
            result: {
              columns,
              rows,
              rowCount: rows.length,
              executionTime: Date.now() - startTime,
            },
          }));
        } else {
          resolve(NextResponse.json({
            success: true,
            message: `${queryType} query executed successfully`,
            rowsAffected: rowCount || 0,
            executionTime: Date.now() - startTime,
          }));
        }
      });

      // Capture column metadata
      request.on('columnMetadata', (columnsMetadata: any) => {
        if (Array.isArray(columnsMetadata)) {
          columnsMetadata.forEach((column: any) => {
            columns.push(column.colName);
          });
        }
      });

      // Capture row data
      request.on('row', (rowColumns: any) => {
        const row: any[] = [];
        if (Array.isArray(rowColumns)) {
          rowColumns.forEach((column: any) => {
            row.push(column.value);
          });
        }
        rows.push(row);
      });

      connection.execSql(request);
    });

    connection.connect();

    // Timeout
    setTimeout(() => {
      connection.close();
      resolve(NextResponse.json(
        { 
          success: false, 
          error: 'Query execution timeout' 
        },
        { status: 500 }
      ));
    }, 35000);
  });
}

// MongoDB Query Execution
async function executeMongoDBQuery(config: any, query: string) {
  const startTime = Date.now();
  let client;

  try {
    // Build connection string
    let connectionString;
    
    if (config.username && config.password) {
      const authDb = config.authDatabase || 'admin';
      connectionString = `mongodb://${encodeURIComponent(config.username)}:${encodeURIComponent(config.password)}@${config.host}:${config.port}/${config.database}?authSource=${authDb}`;
    } else {
      connectionString = `mongodb://${config.host}:${config.port}/${config.database}`;
    }

    if (config.ssl) {
      connectionString += connectionString.includes('?') ? '&ssl=true' : '?ssl=true';
    }

    console.log('🔍 Executing MongoDB query');

    client = new MongoClient(connectionString, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });

    await client.connect();

    const db = client.db(config.database);

    // Parse MongoDB query (expecting JSON format)
    let parsedQuery;
    try {
      parsedQuery = JSON.parse(query);
    } catch (e) {
      throw new Error('MongoDB query must be valid JSON. Example: {"collection": "users", "operation": "find", "query": {}}');
    }

    const { collection, operation, query: mongoQuery, update, options } = parsedQuery;

    if (!collection || !operation) {
      throw new Error('MongoDB query must include "collection" and "operation" fields');
    }

    const coll = db.collection(collection);
    let results;

    switch (operation.toLowerCase()) {
      case 'find':
        results = await coll.find(mongoQuery || {}, options || {}).toArray();
        await client.close();

        if (results.length > 0) {
          const columns = Object.keys(results[0]);
          const rows = results.map(doc => columns.map(col => doc[col]));

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

      case 'insertone':
        results = await coll.insertOne(mongoQuery);
        await client.close();
        return NextResponse.json({
          success: true,
          message: 'Document inserted successfully',
          insertedId: results.insertedId,
          executionTime: Date.now() - startTime,
        });

      case 'insertmany':
        results = await coll.insertMany(mongoQuery);
        await client.close();
        return NextResponse.json({
          success: true,
          message: `${results.insertedCount} documents inserted successfully`,
          insertedCount: results.insertedCount,
          executionTime: Date.now() - startTime,
        });

      case 'updateone':
        results = await coll.updateOne(mongoQuery, update);
        await client.close();
        return NextResponse.json({
          success: true,
          message: 'Document updated successfully',
          modifiedCount: results.modifiedCount,
          executionTime: Date.now() - startTime,
        });

      case 'updatemany':
        results = await coll.updateMany(mongoQuery, update);
        await client.close();
        return NextResponse.json({
          success: true,
          message: `${results.modifiedCount} documents updated successfully`,
          modifiedCount: results.modifiedCount,
          executionTime: Date.now() - startTime,
        });

      case 'deleteone':
        results = await coll.deleteOne(mongoQuery);
        await client.close();
        return NextResponse.json({
          success: true,
          message: 'Document deleted successfully',
          deletedCount: results.deletedCount,
          executionTime: Date.now() - startTime,
        });

      case 'deletemany':
        results = await coll.deleteMany(mongoQuery);
        await client.close();
        return NextResponse.json({
          success: true,
          message: `${results.deletedCount} documents deleted successfully`,
          deletedCount: results.deletedCount,
          executionTime: Date.now() - startTime,
        });

      default:
        throw new Error(`Unsupported MongoDB operation: ${operation}`);
    }

  } catch (error: any) {
    console.error('MongoDB query error:', error);
    
    if (client) {
      try {
        await client.close();
      } catch (e) {
        // Ignore
      }
    }

    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to execute MongoDB query' 
      },
      { status: 500 }
    );
  }
}

// Oracle Query Execution via Proxy
async function executeOracleQuery(config: any, query: string) {
  try {
    const proxyUrl = process.env.ORACLE_PROXY_URL;

    if (!proxyUrl) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Oracle proxy not configured. Please set ORACLE_PROXY_URL environment variable.' 
        },
        { status: 400 }
      );
    }

    console.log('🔍 Executing Oracle query via proxy');

    // Forward request to Oracle proxy
    const response = await fetch(`${proxyUrl}/execute-query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        connectionConfig: {
          host: config.host,
          port: config.port,
          serviceName: config.serviceName,
          username: config.username,
          password: config.password,
        },
        query: query,
      }),
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    const data = await response.json();

    if (response.ok && data.success) {
      return NextResponse.json(data);
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: data.error || 'Failed to execute Oracle query via proxy' 
        },
        { status: response.status }
      );
    }

  } catch (error: any) {
    console.error('Oracle proxy query error:', error);

    let errorMessage = 'Failed to execute query via Oracle proxy';
    
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      errorMessage = 'Query execution timeout. The query may be too complex or the database is slow to respond.';
    } else if (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED')) {
      errorMessage = 'Cannot reach Oracle proxy service. Please verify the proxy is running.';
    }

    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
