import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    
    console.log('Project ID received:', projectId);

    if (!projectId) {
      console.error('Project ID is missing');
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const apiToken = process.env.NEXT_PUBLIC_POEDITOR_API_TOKEN;

    if (!apiToken) {
      console.error('API token not configured');
      return NextResponse.json(
        { error: 'API token not configured' },
        { status: 500 }
      );
    }

    const formData = new FormData();
    formData.append('api_token', apiToken);
    formData.append('id', projectId);

    console.log('Fetching project from POEditor API...');
    const response = await fetch('https://api.poeditor.com/v2/projects/view', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    console.log('POEditor API response:', data.response?.status);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching POEditor project:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
