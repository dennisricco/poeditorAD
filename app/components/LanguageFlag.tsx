interface LanguageFlagProps {
  languageCode: string;
  size?: 'sm' | 'md' | 'lg';
}

// Mapping language codes to country codes (ISO 3166-1 alpha-2)
const LANGUAGE_TO_COUNTRY: Record<string, string> = {
  // Major languages
  'en': 'gb', // English
  'en-us': 'us', // English (US)
  'en-gb': 'gb', // English (UK)
  'en-au': 'au', // English (Australia)
  'en-ca': 'ca', // English (Canada)
  'es': 'es', // Spanish
  'es-mx': 'mx', // Spanish (Mexico)
  'es-ar': 'ar', // Spanish (Argentina)
  'fr': 'fr', // French
  'fr-ca': 'ca', // French (Canada)
  'de': 'de', // German
  'de-at': 'at', // German (Austria)
  'de-ch': 'ch', // German (Switzerland)
  'it': 'it', // Italian
  'pt': 'pt', // Portuguese
  'pt-br': 'br', // Portuguese (Brazil)
  'ru': 'ru', // Russian
  'ja': 'jp', // Japanese
  'ko': 'kr', // Korean
  'zh': 'cn', // Chinese
  'zh-cn': 'cn', // Chinese (Simplified)
  'zh-tw': 'tw', // Chinese (Traditional)
  'zh-hk': 'hk', // Chinese (Hong Kong)
  'ar': 'sa', // Arabic
  'ar-ae': 'ae', // Arabic (UAE)
  'ar-eg': 'eg', // Arabic (Egypt)
  'hi': 'in', // Hindi
  'id': 'id', // Indonesian
  'ms': 'my', // Malay
  'th': 'th', // Thai
  'vi': 'vn', // Vietnamese
  'nl': 'nl', // Dutch
  'nl-be': 'be', // Dutch (Belgium)
  'pl': 'pl', // Polish
  'tr': 'tr', // Turkish
  'sv': 'se', // Swedish
  'no': 'no', // Norwegian
  'nb': 'no', // Norwegian Bokmål
  'nn': 'no', // Norwegian Nynorsk
  'da': 'dk', // Danish
  'fi': 'fi', // Finnish
  'el': 'gr', // Greek
  'cs': 'cz', // Czech
  'hu': 'hu', // Hungarian
  'ro': 'ro', // Romanian
  'uk': 'ua', // Ukrainian
  'he': 'il', // Hebrew
  'fa': 'ir', // Persian
  'bn': 'bd', // Bengali
  'ur': 'pk', // Urdu
  'ta': 'in', // Tamil
  'te': 'in', // Telugu
  'mr': 'in', // Marathi
  'gu': 'in', // Gujarati
  'kn': 'in', // Kannada
  'ml': 'in', // Malayalam
  'pa': 'in', // Punjabi
  'si': 'lk', // Sinhala
  'my': 'mm', // Burmese
  'km': 'kh', // Khmer
  'lo': 'la', // Lao
  'ka': 'ge', // Georgian
  'am': 'et', // Amharic
  'sw': 'ke', // Swahili
  'zu': 'za', // Zulu
  'af': 'za', // Afrikaans
  'sq': 'al', // Albanian
  'hy': 'am', // Armenian
  'az': 'az', // Azerbaijani
  'eu': 'es', // Basque
  'be': 'by', // Belarusian
  'bs': 'ba', // Bosnian
  'bg': 'bg', // Bulgarian
  'ca': 'es', // Catalan (use Catalonia flag if available, else Spain)
  'hr': 'hr', // Croatian
  'et': 'ee', // Estonian
  'tl': 'ph', // Filipino
  'gl': 'es', // Galician
  'is': 'is', // Icelandic
  'ga': 'ie', // Irish
  'lv': 'lv', // Latvian
  'lt': 'lt', // Lithuanian
  'mk': 'mk', // Macedonian
  'mt': 'mt', // Maltese
  'mn': 'mn', // Mongolian
  'ne': 'np', // Nepali
  'sr': 'rs', // Serbian
  'sk': 'sk', // Slovak
  'sl': 'si', // Slovenian
  'cy': 'gb', // Welsh (use Wales flag if available)
  'gd': 'gb', // Scottish Gaelic
  'lb': 'lu', // Luxembourgish
  'fo': 'fo', // Faroese
  'kk': 'kz', // Kazakh
  'ky': 'kg', // Kyrgyz
  'tg': 'tj', // Tajik
  'tk': 'tm', // Turkmen
  'uz': 'uz', // Uzbek
  'ps': 'af', // Pashto
  'sd': 'pk', // Sindhi
  'dv': 'mv', // Dhivehi
  'so': 'so', // Somali
  'ti': 'er', // Tigrinya
  'yo': 'ng', // Yoruba
  'ig': 'ng', // Igbo
  'ha': 'ng', // Hausa
  'rw': 'rw', // Kinyarwanda
  'sn': 'zw', // Shona
  'st': 'ls', // Sesotho
  'xh': 'za', // Xhosa
  'ny': 'mw', // Chichewa
  'mg': 'mg', // Malagasy
  'jv': 'id', // Javanese
  'su': 'id', // Sundanese
  'ceb': 'ph', // Cebuano
  'haw': 'us', // Hawaiian
  'sm': 'ws', // Samoan
  'mi': 'nz', // Maori
  'co': 'fr', // Corsican
  'fy': 'nl', // Frisian
};

export default function LanguageFlag({ languageCode, size = 'md' }: LanguageFlagProps) {
  // Get country code from language code
  const countryCode = LANGUAGE_TO_COUNTRY[languageCode.toLowerCase()] || languageCode.toLowerCase().split('-')[0];
  
  // Size classes for the container
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };

  // Actual pixel sizes for the flag (aspect ratio 4:3)
  const flagSizes = {
    sm: { width: '32px', height: '24px' },
    md: { width: '48px', height: '36px' },
    lg: { width: '64px', height: '48px' },
  };

  return (
    <div
      className={`
        ${sizeClasses[size]}
        bg-white 
        border-4 border-poe-black 
        rounded-2xl 
        cartoon-shadow 
        flex items-center justify-center 
        shrink-0
        transform rotate-3
        transition-cartoon
        hover:rotate-6 hover:-translate-y-1
        overflow-hidden
      `}
    >
      <span 
        className={`fi fi-${countryCode} rounded-sm`}
        style={{ 
          width: flagSizes[size].width,
          height: flagSizes[size].height,
          display: 'inline-block',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
    </div>
  );
}
