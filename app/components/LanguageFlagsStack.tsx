import LanguageFlag from './LanguageFlag';

interface LanguageFlagsStackProps {
  languageCodes: string[];
  maxDisplay?: number;
}

export default function LanguageFlagsStack({ 
  languageCodes, 
  maxDisplay = 5 
}: LanguageFlagsStackProps) {
  const displayCodes = languageCodes.slice(0, maxDisplay);
  const remainingCount = languageCodes.length - maxDisplay;

  return (
    <div className="flex items-center gap-2">
      {/* Stacked Flags */}
      <div className="flex -space-x-3">
        {displayCodes.map((code, index) => (
          <div
            key={code}
            className="relative"
            style={{ zIndex: displayCodes.length - index }}
          >
            <LanguageFlag languageCode={code} size="sm" />
          </div>
        ))}
      </div>

      {/* Remaining Count */}
      {remainingCount > 0 && (
        <div className="w-10 h-10 bg-poe-black text-white border-4 border-poe-black rounded-2xl cartoon-shadow flex items-center justify-center shrink-0">
          <span className="text-xs font-black">+{remainingCount}</span>
        </div>
      )}
    </div>
  );
}
