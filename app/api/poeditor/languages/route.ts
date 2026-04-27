import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { projectId } = await request.json();

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const apiToken = process.env.NEXT_PUBLIC_POEDITOR_API_TOKEN;

    if (!apiToken) {
      return NextResponse.json(
        { error: 'API token not configured' },
        { status: 500 }
      );
    }

    const formData = new FormData();
    formData.append('api_token', apiToken);
    formData.append('id', projectId.toString());

    const response = await fetch('https://api.poeditor.com/v2/languages/list', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching POEditor languages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch languages' },
      { status: 500 }
    );
  }
}
