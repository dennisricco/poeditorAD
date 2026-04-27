'use client';

import { useState } from 'react';
import { Loader2, ChevronDown } from 'lucide-react';

interface ExportFormatSelectorProps {
  languageCode: string;
  languageName: string;
  onDownload: (languageCode: string, format: string) => Promise<void>;
  isDownloading: boolean;
}

const EXPORT_FORMATS = [
  { value: 'json', label: 'JSON', icon: '📄' },
  { value: 'po', label: 'PO (Gettext)', icon: '🌐' },
  { value: 'pot', label: 'POT (Template)', icon: '📝' },
  { value: 'mo', label: 'MO (Binary)', icon: '💾' },
  { value: 'xls', label: 'XLS (Excel)', icon: '📊' },
  { value: 'xlsx', label: 'XLSX (Excel)', icon: '📈' },
  { value: 'csv', label: 'CSV', icon: '📋' },
  { value: 'ini', label: 'INI', icon: '⚙️' },
  { value: 'resw', label: 'RESW', icon: '🪟' },
  { value: 'resx', label: 'RESX', icon: '🔷' },
  { value: 'android_strings', label: 'Android Strings', icon: '🤖' },
  { value: 'apple_strings', label: 'Apple Strings', icon: '🍎' },
  { value: 'xliff', label: 'XLIFF', icon: '🔄' },
  { value: 'properties', label: 'Properties', icon: '☕' },
  { value: 'key_value_json', label: 'Key-Value JSON', icon: '🔑' },
];

export default function ExportFormatSelector({
  languageCode,
  languageName,
  onDownload,
  isDownloading,
}: ExportFormatSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('json');

  const handleFormatSelect = (format: string) => {
    setSelectedFormat(format);
    setIsOpen(false);
  };

  const handleDownloadClick = async () => {
    await onDownload(languageCode, selectedFormat);
  };

  const selectedFormatData = EXPORT_FORMATS.find(f => f.value === selectedFormat);

  return (
    <div className="relative">
      {/* Split Button: Download + Format Selector */}
      <div className="flex gap-1">
        {/* Download Button (Left) */}
        <button
          onClick={handleDownloadClick}
          disabled={isDownloading}
          className="flex-1 bg-poe-black text-white border-4 border-poe-black rounded-l-xl px-3 py-3 text-sm font-black flex items-center justify-center gap-2 transition-cartoon hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#000000] active:translate-y-0 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDownloading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" strokeWidth={3} />
              Downloading...
            </>
          ) : (
            <>
              <span>Download</span>
              <span>{selectedFormatData?.icon}</span>
              <span>{selectedFormatData?.label}</span>
            </>
          )}
        </button>

        {/* Format Selector Button (Right) */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isDownloading}
          className="bg-poe-black text-white border-4 border-poe-black rounded-r-xl px-2 py-3 transition-cartoon hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#000000] active:translate-y-0 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronDown 
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
            strokeWidth={3} 
          />
        </button>
      </div>

      {/* Dropdown Menu - Opens UPWARD */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu - positioned above the button */}
          <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border-4 border-poe-black rounded-2xl cartoon-shadow max-h-64 overflow-y-auto z-20">
            <div className="p-2 space-y-1">
              {EXPORT_FORMATS.map((format) => (
                <button
                  key={format.value}
                  onClick={() => handleFormatSelect(format.value)}
                  className={`w-full text-left px-3 py-2 rounded-xl font-bold text-sm transition-colors ${
                    selectedFormat === format.value
                      ? 'bg-poe-yellow'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-2">{format.icon}</span>
                  {format.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
