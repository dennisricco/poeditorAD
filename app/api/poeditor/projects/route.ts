import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiToken = process.env.NEXT_PUBLIC_POEDITOR_API_TOKEN;

    if (!apiToken) {
      return NextResponse.json(
        { error: 'API token not configured' },
        { status: 500 }
      );
    }

    const formData = new FormData();
    formData.append('api_token', apiToken);

    const response = await fetch('https://api.poeditor.com/v2/projects/list', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching POEditor projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}
