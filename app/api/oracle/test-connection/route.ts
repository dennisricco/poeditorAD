import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { host, port, serviceName, username, password } = body;

    // Validate required fields
    if (!host || !port || !serviceName || !username || !password) {
      return NextResponse.json(
        { success: false, error: 'Missing required connection parameters' },
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

    console.log('🔗 Connecting to Oracle Proxy:', oracleProxyUrl);

    // Forward request to Oracle Proxy
    const proxyResponse = await fetch(`${oracleProxyUrl}/test-connection`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        host,
        port,
        serviceName,
        username,
        password,
      }),
    });

    const proxyData = await proxyResponse.json();

    if (!proxyResponse.ok) {
      console.error('❌ Oracle Proxy error:', proxyData);
      return NextResponse.json(
        { 
          success: false, 
          error: proxyData.error || 'Failed to connect to Oracle database' 
        },
        { status: proxyResponse.status }
      );
    }

    console.log('✅ Oracle connection successful via proxy');

    return NextResponse.json(proxyData);

  } catch (error: any) {
    console.error('Oracle connection test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to connect to Oracle database' 
      },
      { status: 500 }
    );
  }
}
