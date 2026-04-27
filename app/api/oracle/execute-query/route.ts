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

    const startTime = Date.now();

    // TODO: Implement actual Oracle query execution
    // For now, we'll simulate query execution
    // In production, you would use oracledb package:
    // const oracledb = require('oracledb');
    // const connection = await oracledb.getConnection({
    //   user: username,
    //   password: password,
    //   connectString: `${host}:${port}/${serviceName}`
    // });
    // const result = await connection.execute(query);
    // await connection.close();

    // Simulate query execution delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const executionTime = Date.now() - startTime;

    // Determine query type
    const queryUpper = query.trim().toUpperCase();
    const isSelect = queryUpper.startsWith('SELECT');
    const isInsert = queryUpper.startsWith('INSERT');
    const isUpdate = queryUpper.startsWith('UPDATE');
    const isDelete = queryUpper.startsWith('DELETE');
    const isCreate = queryUpper.startsWith('CREATE');
    const isDrop = queryUpper.startsWith('DROP');

    // For SELECT queries, return mock data
    if (isSelect) {
      // Mock result for demonstration
      const mockResult = {
        columns: ['ID', 'PROJECT_ID', 'LANGUAGE_CODE', 'TRANSLATION_KEY', 'TRANSLATION_VALUE', 'CREATED_AT'],
        rows: [
          [1, 'proj_123', 'en', 'welcome.message', 'Welcome to our app', '2024-01-15 10:30:00'],
          [2, 'proj_123', 'en', 'login.button', 'Login', '2024-01-15 10:30:00'],
          [3, 'proj_123', 'id', 'welcome.message', 'Selamat datang di aplikasi kami', '2024-01-15 10:31:00'],
        ],
        rowCount: 3,
        executionTime,
      };

      return NextResponse.json({
        success: true,
        result: mockResult,
      });
    }

    // For INSERT, UPDATE, DELETE, CREATE, DROP queries
    if (isInsert || isUpdate || isDelete || isCreate || isDrop) {
      let message = 'Query executed successfully';
      let rowsAffected = 0;

      if (isInsert) {
        message = 'Record(s) inserted successfully';
        rowsAffected = 1;
      } else if (isUpdate) {
        message = 'Record(s) updated successfully';
        rowsAffected = 1;
      } else if (isDelete) {
        message = 'Record(s) deleted successfully';
        rowsAffected = 1;
      } else if (isCreate) {
        message = 'Table created successfully';
      } else if (isDrop) {
        message = 'Table dropped successfully';
      }

      return NextResponse.json({
        success: true,
        message,
        rowsAffected,
        executionTime,
      });
    }

    // For other queries
    return NextResponse.json({
      success: true,
      message: 'Query executed successfully',
      executionTime,
    });

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
