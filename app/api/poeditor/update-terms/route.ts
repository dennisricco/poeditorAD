import { NextResponse } from 'next/server';
import { cleanTranslationString } from '@/app/utils/stringCleaner';

export async function POST(request: Request) {
  try {
    const { projectId, languageCode, updates } = await request.json();

    if (!projectId || !languageCode || !updates) {
      return NextResponse.json(
        { error: 'Project ID, language code, and updates are required' },
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

    console.log('Updating terms for:', { projectId, languageCode, updateCount: Object.keys(updates).length });

    // POEditor API expects updates in specific format
    // We'll update terms one by one or in batch
    const updateResults = [];
    const errors = [];

    // Batch update using add_terms endpoint
    const termsToUpdate = Object.entries(updates).map(([term, translation]) => ({
      term,
      translation: {
        content: cleanTranslationString(translation as string),
        fuzzy: 0
      }
    }));

    // Update translations using update endpoint
    const formData = new FormData();
    formData.append('api_token', apiToken);
    formData.append('id', projectId.toString());
    formData.append('language', languageCode);
    formData.append('data', JSON.stringify(termsToUpdate));

    const response = await fetch('https://api.poeditor.com/v2/translations/update', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (data.response?.status === 'success') {
      console.log('Update successful:', data.result);
      return NextResponse.json({
        success: true,
        result: data.result,
        message: `Successfully updated ${Object.keys(updates).length} translations`
      });
    } else {
      console.error('Update failed:', data.response?.message);
      return NextResponse.json(
        { error: data.response?.message || 'Update failed' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error updating terms:', error);
    return NextResponse.json(
      { error: 'Failed to update terms', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
