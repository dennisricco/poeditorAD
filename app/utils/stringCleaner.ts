export function cleanTranslationString(str: string): string {
  if (typeof str !== 'string') {
    return str;
  }

  let cleaned = str;

  cleaned = cleaned.replace(/\n"/g, '"');
  cleaned = cleaned.replace(/\\n/g, ' ');
  cleaned = cleaned.replace(/\u2028/g, ' ');
  cleaned = cleaned.replace(/\u2029/g, ' ');
  cleaned = cleaned.replace(/\s+/g, ' ');
  cleaned = cleaned.trim();

  return cleaned;
}

export function cleanTranslationsObject(translations: Record<string, any>): Record<string, any> {
  const cleaned: Record<string, any> = {};

  for (const [key, value] of Object.entries(translations)) {
    if (typeof value === 'string') {
      cleaned[key] = cleanTranslationString(value);
    } else if (typeof value === 'object' && value !== null) {
      cleaned[key] = cleanTranslationsObject(value);
    } else {
      cleaned[key] = value;
    }
  }

  return cleaned;
}

export function cleanForCSV(str: string): string {
  let cleaned = cleanTranslationString(str);

  if (cleaned.includes(',') || cleaned.includes('"') || cleaned.includes('\n')) {
    cleaned = cleaned.replace(/"/g, '""');
    cleaned = `"${cleaned}"`;
  }

  return cleaned;
}

export const testCases = {
  input1: 'Hello\\nWorld',
  expected1: 'Hello World',

  input2: 'Click\n"here"',
  expected2: 'Click "here"',

  input3: 'Line\u2028separator',
  expected3: 'Line separator',

  input4: 'Multiple\\n\\nspaces   here',
  expected4: 'Multiple spaces here',
};
