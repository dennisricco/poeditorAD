/**
 * Tests for string cleaning utilities
 * Run with: npm test stringCleaner.test.ts
 */

import { 
  cleanTranslationString, 
  cleanTranslationsObject, 
  cleanForCSV 
} from '../stringCleaner';

describe('cleanTranslationString', () => {
  test('should replace \\n with space', () => {
    const input = 'Hello\\nWorld';
    const expected = 'Hello World';
    expect(cleanTranslationString(input)).toBe(expected);
  });

  test('should replace \\n" with double quote', () => {
    const input = 'Click\n"here"';
    const expected = 'Click "here"';
    expect(cleanTranslationString(input)).toBe(expected);
  });

  test('should replace \\u2028 with space', () => {
    const input = 'Line\u2028separator';
    const expected = 'Line separator';
    expect(cleanTranslationString(input)).toBe(expected);
  });

  test('should replace \\u2029 with space', () => {
    const input = 'Para\u2029graph';
    const expected = 'Para graph';
    expect(cleanTranslationString(input)).toBe(expected);
  });

  test('should normalize multiple spaces', () => {
    const input = 'Hello    World';
    const expected = 'Hello World';
    expect(cleanTranslationString(input)).toBe(expected);
  });

  test('should trim whitespace', () => {
    const input = '  Hello World  ';
    const expected = 'Hello World';
    expect(cleanTranslationString(input)).toBe(expected);
  });

  test('should handle multiple issues at once', () => {
    const input = 'Hello\\nWorld\n"test"\u2028here   now';
    const expected = 'Hello World "test" here now';
    expect(cleanTranslationString(input)).toBe(expected);
  });

  test('should handle empty string', () => {
    const input = '';
    const expected = '';
    expect(cleanTranslationString(input)).toBe(expected);
  });

  test('should handle only whitespace', () => {
    const input = '   \\n   ';
    const expected = '';
    expect(cleanTranslationString(input)).toBe(expected);
  });

  test('should not modify clean strings', () => {
    const input = 'Hello World';
    const expected = 'Hello World';
    expect(cleanTranslationString(input)).toBe(expected);
  });
});

describe('cleanTranslationsObject', () => {
  test('should clean all string values', () => {
    const input = {
      key1: 'Hello\\nWorld',
      key2: 'Test\u2028here',
    };
    const expected = {
      key1: 'Hello World',
      key2: 'Test here',
    };
    expect(cleanTranslationsObject(input)).toEqual(expected);
  });

  test('should handle nested objects', () => {
    const input = {
      key1: 'Hello\\nWorld',
      nested: {
        key2: 'Test\u2028here',
        deep: {
          key3: 'Deep\n"value"',
        },
      },
    };
    const expected = {
      key1: 'Hello World',
      nested: {
        key2: 'Test here',
        deep: {
          key3: 'Deep "value"',
        },
      },
    };
    expect(cleanTranslationsObject(input)).toEqual(expected);
  });

  test('should preserve non-string values', () => {
    const input = {
      string: 'Hello\\nWorld',
      number: 123,
      boolean: true,
      null: null,
    };
    const expected = {
      string: 'Hello World',
      number: 123,
      boolean: true,
      null: null,
    };
    expect(cleanTranslationsObject(input)).toEqual(expected);
  });

  test('should handle empty object', () => {
    const input = {};
    const expected = {};
    expect(cleanTranslationsObject(input)).toEqual(expected);
  });
});

describe('cleanForCSV', () => {
  test('should clean and escape commas', () => {
    const input = 'Hello\\nWorld, test';
    const expected = '"Hello World, test"';
    expect(cleanForCSV(input)).toBe(expected);
  });

  test('should clean and escape quotes', () => {
    const input = 'Hello "World"';
    const expected = '"Hello ""World"""';
    expect(cleanForCSV(input)).toBe(expected);
  });

  test('should clean without escaping if not needed', () => {
    const input = 'Hello\\nWorld';
    const expected = 'Hello World';
    expect(cleanForCSV(input)).toBe(expected);
  });

  test('should handle complex CSV values', () => {
    const input = 'Hello\\nWorld, "test"\u2028here';
    const expected = '"Hello World, ""test"" here"';
    expect(cleanForCSV(input)).toBe(expected);
  });
});

describe('Real-world examples', () => {
  test('should clean POEditor export data', () => {
    const input = {
      'welcome.message': 'Welcome\\nto our app',
      'error.notFound': 'Page\n"not found"',
      'info.separator': 'Line\u2028break here',
      'nested.value': 'Multiple   spaces',
    };
    const expected = {
      'welcome.message': 'Welcome to our app',
      'error.notFound': 'Page "not found"',
      'info.separator': 'Line break here',
      'nested.value': 'Multiple spaces',
    };
    expect(cleanTranslationsObject(input)).toEqual(expected);
  });

  test('should handle dual language export', () => {
    const input = {
      'en-ID': {
        welcome: 'Hello\\nWorld',
        goodbye: 'See\u2028you',
      },
      'id-ID': {
        welcome: 'Halo\\nDunia',
        goodbye: 'Sampai\u2028jumpa',
      },
    };
    const expected = {
      'en-ID': {
        welcome: 'Hello World',
        goodbye: 'See you',
      },
      'id-ID': {
        welcome: 'Halo Dunia',
        goodbye: 'Sampai jumpa',
      },
    };
    expect(cleanTranslationsObject(input)).toEqual(expected);
  });
});
