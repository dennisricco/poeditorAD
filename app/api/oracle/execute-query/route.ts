import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { host, port, serviceName, username, password, query } = body;

    // Validate required fields
    if (!host || !port || !serviceName || !username || !password || !query) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Validate query is not empty
    if (!query.trim()) {
      return NextResponse.json(
        { success: false, error: 'Query cannot be empty' },
        { status: 400 }
      );
    }

    // Get Oracle Proxy URL from environment
    const oracleProxyUrl = process.env.ORACLE_PROXY_URL;

    if (!oracleProxyUrl) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Oracle Proxy not configured. Please set ORACLE_PROXY_URL in environment variables.' 
        },
        { status: 500 }
      );
    }

    console.log('🔗 Executing query via Oracle Proxy:', oracleProxyUrl);
    console.log('📝 Query:', query.substring(0, 100) + '...');

    // Forward request to Oracle Proxy
    const proxyResponse = await fetch(`${oracleProxyUrl}/execute-query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        connectionConfig: {
          host,
          port,
          serviceName,
          username,
          password,
        },
        query,
      }),
    });

    const proxyData = await proxyResponse.json();

    if (!proxyResponse.ok) {
      console.error('❌ Oracle Proxy error:', proxyData);
      return NextResponse.json(
        { 
          success: false, 
          error: proxyData.error || 'Failed to execute query' 
        },
        { status: proxyResponse.status }
      );
    }

    console.log('✅ Query executed successfully via proxy');

    return NextResponse.json(proxyData);

  } catch (error: any) {
    console.error('Oracle query execution error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to execute query' 
      },
      { status: 500 }
    );
  }
}
