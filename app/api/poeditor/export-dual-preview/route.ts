import { NextResponse } from 'next/server';
import { cleanTranslationsObject } from '@/app/utils/stringCleaner';

export async function POST(request: Request) {
  try {
    const { projectId, language1, language2, format } = await request.json();

    if (!projectId || !language1 || !language2) {
      return NextResponse.json(
        { error: 'Project ID and two language codes are required' },
        { status: 400 }
      );
    }

    if (language1 === language2) {
      return NextResponse.json(
        { error: 'Please select two different languages' },
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

    // Export both languages
    const exportLanguage = async (languageCode: string) => {
      const formData = new FormData();
      formData.append('api_token', apiToken);
      formData.append('id', projectId.toString());
      formData.append('language', languageCode);
      formData.append('type', 'key_value_json'); // Always use key-value JSON for merging

      const response = await fetch('https://api.poeditor.com/v2/projects/export', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.response?.status === 'success' && data.result?.url) {
        // Fetch the actual translation data
        const translationResponse = await fetch(data.result.url);
        return await translationResponse.json();
      } else {
        throw new Error(`Failed to export ${languageCode}`);
      }
    };

    console.log('Exporting languages for preview:', { language1, language2, format });

    // Fetch both language translations
    const [translations1Raw, translations2Raw] = await Promise.all([
      exportLanguage(language1),
      exportLanguage(language2),
    ]);

    // Store original data before cleaning
    const originalData1 = { ...translations1Raw };
    const originalData2 = { ...translations2Raw };

    // Clean the translations
    const translations1 = cleanTranslationsObject(translations1Raw);
    const translations2 = cleanTranslationsObject(translations2Raw);

    // Return preview data (not the actual file)
    return NextResponse.json({
      response: { status: 'success' },
      originalData1,
      originalData2,
      cleanedData1: translations1,
      cleanedData2: translations2,
      format,
    });
  } catch (error) {
    console.error('Error exporting dual languages for preview:', error);
    return NextResponse.json(
      { error: 'Failed to export translations', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
