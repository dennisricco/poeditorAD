import { NextResponse } from 'next/server';
import { cleanTranslationsObject, cleanForCSV } from '@/app/utils/stringCleaner';

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

    console.log('Exporting languages:', { language1, language2, format });

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

    // Helper function to convert language code to locale format
    const toLocaleFormat = (langCode: string): string => {
      // Normalize to lowercase for consistent mapping
      const normalized = langCode.toLowerCase();
      
      // Map language codes to locale format (all using -ID suffix for Indonesia context)
      const localeMap: Record<string, string> = {
        'en': 'en-ID',
        'en-us': 'en-ID',
        'en-gb': 'en-ID',
        'id': 'id-ID',
        'ms': 'ms-ID',
        'ja': 'ja-ID',
        'ko': 'ko-ID',
        'zh': 'zh-ID',
        'zh-cn': 'zh-ID',
        'zh-tw': 'zh-ID',
        'es': 'es-ID',
        'fr': 'fr-ID',
        'de': 'de-ID',
        'it': 'it-ID',
        'pt': 'pt-ID',
        'pt-br': 'pt-ID',
        'ru': 'ru-ID',
        'ar': 'ar-ID',
        'hi': 'hi-ID',
        'th': 'th-ID',
        'vi': 'vi-ID',
        'nl': 'nl-ID',
        'pl': 'pl-ID',
        'tr': 'tr-ID',
        'sv': 'sv-ID',
        'no': 'no-ID',
        'da': 'da-ID',
        'fi': 'fi-ID',
        'el': 'el-ID',
        'cs': 'cs-ID',
        'hu': 'hu-ID',
        'ro': 'ro-ID',
        'uk': 'uk-ID',
        'he': 'he-ID',
        'fa': 'fa-ID',
        'bn': 'bn-ID',
        'ur': 'ur-ID',
        'ta': 'ta-ID',
        'te': 'te-ID',
      };
      
      // Check if we have a direct mapping
      if (localeMap[normalized]) {
        return localeMap[normalized];
      }
      
      // Extract base language code (before hyphen) and map it
      const baseCode = normalized.split('-')[0];
      if (localeMap[baseCode]) {
        return localeMap[baseCode];
      }
      
      // Default: use base code with -ID suffix
      return `${baseCode}-ID`;
    };

    // Combine translations based on format
    let output: string;
    let contentType: string;

    switch (format) {
      case 'json': {
        // JSON format: nested object with locale format
        const locale1 = toLocaleFormat(language1);
        const locale2 = toLocaleFormat(language2);
        
        const combined = {
          [locale1]: translations1,
          [locale2]: translations2,
        };
        output = JSON.stringify(combined, null, 2);
        contentType = 'application/json';
        break;
      }

      case 'csv': {
        // CSV format: key, lang1, lang2 with locale format
        const locale1 = toLocaleFormat(language1);
        const locale2 = toLocaleFormat(language2);
        
        const keys = new Set([
          ...Object.keys(translations1),
          ...Object.keys(translations2),
        ]);
        
        const rows = [
          ['Key', locale1, locale2].join(','),
          ...Array.from(keys).map(key => {
            const val1 = translations1[key] || '';
            const val2 = translations2[key] || '';
            // Clean and escape CSV values
            return [cleanForCSV(key), cleanForCSV(val1), cleanForCSV(val2)].join(',');
          }),
        ];
        
        output = rows.join('\n');
        contentType = 'text/csv';
        break;
      }

      case 'xlsx': {
        // For XLSX, we'll return as tab-separated with locale format
        const locale1 = toLocaleFormat(language1);
        const locale2 = toLocaleFormat(language2);
        
        const keys = new Set([
          ...Object.keys(translations1),
          ...Object.keys(translations2),
        ]);
        
        const rows = [
          ['Key', locale1, locale2].join('\t'),
          ...Array.from(keys).map(key => {
            const val1 = translations1[key] || '';
            const val2 = translations2[key] || '';
            return [key, val1, val2].join('\t');
          }),
        ];
        
        output = rows.join('\n');
        contentType = 'application/vnd.ms-excel';
        break;
      }

      case 'key_value_json':
      default: {
        // Key-value JSON: flat structure with locale-prefixed keys
        const locale1 = toLocaleFormat(language1);
        const locale2 = toLocaleFormat(language2);
        
        const combined: Record<string, string> = {};
        
        Object.entries(translations1).forEach(([key, value]) => {
          combined[`${locale1}.${key}`] = value as string;
        });
        
        Object.entries(translations2).forEach(([key, value]) => {
          combined[`${locale2}.${key}`] = value as string;
        });
        
        output = JSON.stringify(combined, null, 2);
        contentType = 'application/json';
        break;
      }
    }

    // Return the combined file
    return new NextResponse(output, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="translations_${language1}_${language2}.${format === 'xlsx' ? 'xls' : format}"`,
      },
    });
  } catch (error) {
    console.error('Error exporting dual languages:', error);
    return NextResponse.json(
      { error: 'Failed to export translations', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
