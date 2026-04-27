import { NextResponse } from 'next/server';
import { cleanTranslationsObject } from '@/app/utils/stringCleaner';

export async function POST(request: Request) {
  try {
    const { projectId, languageCode, type } = await request.json();

    if (!projectId || !languageCode) {
      return NextResponse.json(
        { error: 'Project ID and language code are required' },
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

    // Step 1: Request export
    const formData = new FormData();
    formData.append('api_token', apiToken);
    formData.append('id', projectId.toString());
    formData.append('language', languageCode);
    formData.append('type', type || 'json'); // Default to JSON format

    console.log('Requesting export for:', { projectId, languageCode, type });

    const response = await fetch('https://api.poeditor.com/v2/projects/export', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (data.response?.status === 'success') {
      console.log('Export URL received:', data.result?.url);
      
      // Fetch the translation file and clean it
      if (data.result?.url) {
        try {
          const translationResponse = await fetch(data.result.url);
          const translationData = await translationResponse.json();
          
          // Clean the translations
          const cleanedData = cleanTranslationsObject(translationData);
          
          // Return both original and cleaned data for preview
          return NextResponse.json({
            response: data.response,
            result: {
              url: data.result.url,
              cleaned: true
            },
            originalData: translationData,
            cleanedData: cleanedData
          });
        } catch (cleanError) {
          console.error('Error cleaning translations:', cleanError);
          // If cleaning fails, return original data
          return NextResponse.json(data);
        }
      }
      
      return NextResponse.json(data);
    } else {
      console.error('Export failed:', data.response?.message);
      return NextResponse.json(
        { error: data.response?.message || 'Export failed' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error exporting project:', error);
    return NextResponse.json(
      { error: 'Failed to export project', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
