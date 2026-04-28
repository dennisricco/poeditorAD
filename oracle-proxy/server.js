const express = require('express');
const cors = require('cors');
const oracledb = require('oracledb');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Oracle configuration
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.fetchAsString = [oracledb.CLOB];

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Oracle Database Proxy',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Test Oracle connection
app.post('/test-connection', async (req, res) => {
  let connection;
  
  try {
    const { host, port, serviceName, username, password } = req.body;

    // Validate required fields
    if (!host || !port || !serviceName || !username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: host, port, serviceName, username, password'
      });
    }

    // Build connection string
    const connectionString = `${host}:${port}/${serviceName}`;

    console.log(`🔍 Testing Oracle connection to: ${connectionString}`);

    // Create connection
    connection = await oracledb.getConnection({
      user: username,
      password: password,
      connectionString: connectionString,
      connectTimeout: 10 // 10 seconds
    });

    // Test with a simple query
    const result = await connection.execute(
      `SELECT 
        BANNER as version,
        SYS_CONTEXT('USERENV', 'DB_NAME') as db_name,
        SYS_CONTEXT('USERENV', 'CURRENT_SCHEMA') as current_schema
       FROM v$version 
       WHERE ROWNUM = 1`
    );

    await connection.close();

    console.log('✅ Oracle connection successful');

    res.json({
      success: true,
      message: 'Oracle Database connection successful!',
      connectionInfo: {
        host: host,
        port: port,
        serviceName: serviceName,
        username: username,
        type: 'oracle',
        version: result.rows[0]?.VERSION || 'Unknown',
        database: result.rows[0]?.DB_NAME || serviceName,
        schema: result.rows[0]?.CURRENT_SCHEMA || username.toUpperCase()
      }
    });

  } catch (error) {
    console.error('❌ Oracle connection error:', error);

    // Close connection if it was opened
    if (connection) {
      try {
        await connection.close();
      } catch (closeErr) {
        console.error('Error closing connection:', closeErr);
      }
    }

    // Parse Oracle error messages
    let errorMessage = error.message || 'Failed to connect to Oracle database';
    
    if (error.message.includes('ORA-12170')) {
      errorMessage = 'Connection timeout. Please check host and port.';
    } else if (error.message.includes('ORA-12154')) {
      errorMessage = 'Invalid service name. Please check the service name.';
    } else if (error.message.includes('ORA-01017')) {
      errorMessage = 'Invalid username or password.';
    } else if (error.message.includes('ORA-12541')) {
      errorMessage = 'No listener. Please check if Oracle listener is running.';
    }

    res.status(500).json({
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Execute Oracle query
app.post('/execute-query', async (req, res) => {
  let connection;
  const startTime = Date.now();
  
  try {
    const { connectionConfig, query } = req.body;

    // Validate required fields
    if (!connectionConfig || !query) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: connectionConfig, query'
      });
    }

    const { host, port, serviceName, username, password } = connectionConfig;

    if (!host || !port || !serviceName || !username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Missing connection config fields'
      });
    }

    if (!query.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Query cannot be empty'
      });
    }

    // Build connection string
    const connectionString = `${host}:${port}/${serviceName}`;

    console.log(`🔍 Executing Oracle query on: ${connectionString}`);
    console.log(`📝 Query: ${query.substring(0, 100)}...`);

    // Create connection
    connection = await oracledb.getConnection({
      user: username,
      password: password,
      connectionString: connectionString,
      connectTimeout: 10
    });

    // Determine query type
    const queryType = getQueryType(query);
    console.log(`📊 Query type: ${queryType}`);

    // Execute query
    const result = await connection.execute(query, [], {
      maxRows: 1000, // Limit to 1000 rows for safety
      outFormat: oracledb.OUT_FORMAT_OBJECT
    });

    await connection.close();

    const executionTime = Date.now() - startTime;

    // Handle SELECT queries
    if (queryType === 'SELECT' && result.rows && result.rows.length > 0) {
      // Get column names from first row
      const columns = Object.keys(result.rows[0]);
      
      // Convert rows to array format
      const rows = result.rows.map(row => 
        columns.map(col => {
          const value = row[col];
          // Handle Oracle-specific types
          if (value instanceof Date) {
            return value.toISOString();
          }
          if (Buffer.isBuffer(value)) {
            return value.toString('base64');
          }
          return value;
        })
      );

      console.log(`✅ Query executed successfully, rows: ${rows.length}`);

      return res.json({
        success: true,
        result: {
          columns: columns,
          rows: rows,
          rowCount: rows.length,
          executionTime: executionTime
        }
      });
    }

    // Handle SELECT with no results
    if (queryType === 'SELECT') {
      console.log('✅ Query executed successfully, no rows returned');
      
      return res.json({
        success: true,
        result: {
          columns: [],
          rows: [],
          rowCount: 0,
          executionTime: executionTime
        }
      });
    }

    // Handle non-SELECT queries (INSERT, UPDATE, DELETE, etc.)
    console.log(`✅ ${queryType} query executed successfully, rows affected: ${result.rowsAffected || 0}`);

    res.json({
      success: true,
      message: `${queryType} query executed successfully`,
      rowsAffected: result.rowsAffected || 0,
      executionTime: executionTime
    });

  } catch (error) {
    console.error('❌ Oracle query error:', error);

    // Close connection if it was opened
    if (connection) {
      try {
        await connection.close();
      } catch (closeErr) {
        console.error('Error closing connection:', closeErr);
      }
    }

    // Parse Oracle error messages
    let errorMessage = error.message || 'Failed to execute query';
    
    if (error.message.includes('ORA-00942')) {
      errorMessage = 'Table or view does not exist.';
    } else if (error.message.includes('ORA-00904')) {
      errorMessage = 'Invalid column name.';
    } else if (error.message.includes('ORA-00001')) {
      errorMessage = 'Unique constraint violated.';
    } else if (error.message.includes('ORA-01400')) {
      errorMessage = 'Cannot insert NULL into required column.';
    }

    res.status(500).json({
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Helper function to determine query type
function getQueryType(query) {
  const queryUpper = query.trim().toUpperCase();
  if (queryUpper.startsWith('SELECT')) return 'SELECT';
  if (queryUpper.startsWith('INSERT')) return 'INSERT';
  if (queryUpper.startsWith('UPDATE')) return 'UPDATE';
  if (queryUpper.startsWith('DELETE')) return 'DELETE';
  if (queryUpper.startsWith('CREATE')) return 'CREATE';
  if (queryUpper.startsWith('DROP')) return 'DROP';
  if (queryUpper.startsWith('ALTER')) return 'ALTER';
  if (queryUpper.startsWith('TRUNCATE')) return 'TRUNCATE';
  if (queryUpper.startsWith('MERGE')) return 'MERGE';
  return 'OTHER';
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Oracle Database Proxy running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/`);
  console.log(`🔗 Test connection: POST http://localhost:${PORT}/test-connection`);
  console.log(`📊 Execute query: POST http://localhost:${PORT}/execute-query`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await oracledb.getPool().close(0);
  process.exit(0);
});
