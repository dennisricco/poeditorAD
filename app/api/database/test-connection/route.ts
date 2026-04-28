import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import mysql from 'mysql2/promise';
import { Connection as TediousConnection, Request as TediousRequest } from 'tedious';
import { MongoClient } from 'mongodb';
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

    // Route to appropriate database handler
    switch (type) {
      case 'postgresql':
        return await testPostgreSQLConnection(body);
      case 'mysql':
        return await testMySQLConnection(body);
      case 'sqlserver':
        return await testSQLServerConnection(body);
      case 'mongodb':
        return await testMongoDBConnection(body);
      case 'oracle':
        return await testOracleConnection(body);
      case 'sqlite':
        return NextResponse.json(
          { 
            success: false, 
            error: 'SQLite is file-based and not supported in serverless environments. Please use PostgreSQL, MySQL, SQL Server, or MongoDB instead.' 
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
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || `https://${config.host}`;
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
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    // Test connection with a simple query
    const { error } = await supabase
      .from('language_content_data')
      .select('language_version')
      .limit(1);

    if (error && error.code !== '42P01' && error.code !== 'PGRST116') {
      // 42P01 = table doesn't exist (but connection is valid)
      // PGRST116 = table not found in schema
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'PostgreSQL connection successful!',
      connectionInfo: {
        host: config.host,
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

// MySQL Connection Test
async function testMySQLConnection(config: any) {
  let connection;
  
  try {
    const connectionConfig = {
      host: config.host,
      port: parseInt(config.port) || 3306,
      user: config.username,
      password: config.password,
      database: config.database,
      connectTimeout: 10000, // 10 seconds
      ssl: config.ssl ? { rejectUnauthorized: false } : undefined
    };

    console.log('🔍 Testing MySQL connection to:', config.host);

    // Create connection
    connection = await mysql.createConnection(connectionConfig);

    // Test with a simple query
    const [rows] = await connection.query('SELECT VERSION() as version, DATABASE() as current_db');
    const result: any = Array.isArray(rows) ? rows[0] : rows;

    await connection.end();

    return NextResponse.json({
      success: true,
      message: 'MySQL connection successful!',
      connectionInfo: {
        host: config.host,
        port: config.port || '3306',
        database: config.database,
        username: config.username,
        type: 'mysql',
        version: result?.version,
        currentDatabase: result?.current_db
      },
    });

  } catch (error: any) {
    console.error('MySQL connection error:', error);
    
    // Close connection if it was opened
    if (connection) {
      try {
        await connection.end();
      } catch (e) {
        // Ignore close errors
      }
    }

    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to connect to MySQL database' 
      },
      { status: 500 }
    );
  }
}

// SQL Server Connection Test
async function testSQLServerConnection(config: any): Promise<NextResponse> {
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
        encrypt: config.encrypt !== false, // Default to true for security
        trustServerCertificate: true, // For self-signed certificates
        connectTimeout: 10000, // 10 seconds
        requestTimeout: 10000,
        instanceName: config.instance || undefined
      }
    };

    console.log('🔍 Testing SQL Server connection to:', config.host);

    const connection = new TediousConnection(connectionConfig);

    connection.on('connect', (err) => {
      if (err) {
        console.error('SQL Server connection error:', err);
        resolve(NextResponse.json(
          { 
            success: false, 
            error: err.message || 'Failed to connect to SQL Server database' 
          },
          { status: 500 }
        ));
        return;
      }

      // Test with a simple query
      const request = new TediousRequest(
        'SELECT @@VERSION as version, DB_NAME() as current_db',
        (err, rowCount) => {
          connection.close();
          
          if (err) {
            console.error('SQL Server query error:', err);
            resolve(NextResponse.json(
              { 
                success: false, 
                error: err.message || 'Failed to query SQL Server database' 
              },
              { status: 500 }
            ));
            return;
          }

          resolve(NextResponse.json({
            success: true,
            message: 'SQL Server connection successful!',
            connectionInfo: {
              host: config.host,
              port: config.port || '1433',
              database: config.database,
              username: config.username,
              type: 'sqlserver',
              instance: config.instance || 'default'
            },
          }));
        }
      );

      connection.execSql(request);
    });

    connection.connect();

    // Timeout fallback
    setTimeout(() => {
      connection.close();
      resolve(NextResponse.json(
        { 
          success: false, 
          error: 'Connection timeout. Please check your server address and firewall settings.' 
        },
        { status: 500 }
      ));
    }, 15000); // 15 seconds total timeout
  });
}

// MongoDB Connection Test
async function testMongoDBConnection(config: any) {
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

    console.log('🔍 Testing MongoDB connection to:', config.host);

    // Create client
    client = new MongoClient(connectionString, {
      serverSelectionTimeoutMS: 10000, // 10 seconds
      connectTimeoutMS: 10000,
    });

    // Connect
    await client.connect();

    // Test with a simple command
    const adminDb = client.db(config.database);
    const result = await adminDb.command({ ping: 1 });

    await client.close();

    if (result.ok === 1) {
      return NextResponse.json({
        success: true,
        message: 'MongoDB connection successful!',
        connectionInfo: {
          host: config.host,
          port: config.port || '27017',
          database: config.database,
          username: config.username || 'none',
          type: 'mongodb'
        },
      });
    } else {
      throw new Error('MongoDB ping failed');
    }

  } catch (error: any) {
    console.error('MongoDB connection error:', error);
    
    // Close connection if it was opened
    if (client) {
      try {
        await client.close();
      } catch (e) {
        // Ignore close errors
      }
    }

    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to connect to MongoDB database' 
      },
      { status: 500 }
    );
  }
}

// Oracle Connection Test via Proxy
async function testOracleConnection(config: any) {
  try {
    const proxyUrl = process.env.ORACLE_PROXY_URL;

    if (!proxyUrl) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Oracle proxy not configured. Please set ORACLE_PROXY_URL environment variable or deploy the Oracle proxy service. See oracle-proxy/README.md for instructions.' 
        },
        { status: 400 }
      );
    }

    console.log('🔍 Testing Oracle connection via proxy:', proxyUrl);

    // Forward request to Oracle proxy
    const response = await fetch(`${proxyUrl}/test-connection`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        host: config.host,
        port: config.port,
        serviceName: config.serviceName,
        username: config.username,
        password: config.password,
      }),
      signal: AbortSignal.timeout(15000), // 15 second timeout
    });

    const data = await response.json();

    if (response.ok && data.success) {
      return NextResponse.json(data);
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: data.error || 'Failed to connect to Oracle database via proxy' 
        },
        { status: response.status }
      );
    }

  } catch (error: any) {
    console.error('Oracle proxy connection error:', error);

    let errorMessage = 'Failed to connect to Oracle proxy';
    
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      errorMessage = 'Oracle proxy connection timeout. Please check if the proxy service is running.';
    } else if (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED')) {
      errorMessage = 'Cannot reach Oracle proxy service. Please verify ORACLE_PROXY_URL is correct and the service is running.';
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
