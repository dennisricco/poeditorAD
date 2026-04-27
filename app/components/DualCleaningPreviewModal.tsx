'use client';

import { X, Download, AlertCircle, Trash2, Globe } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Button from './Button';
import LanguageFlag from './LanguageFlag';

interface DualCleaningStats {
  language1: {
    totalStrings: number;
    stringsToClean: number;
    cleanedKeys: string[];
  };
  language2: {
    totalStrings: number;
    stringsToClean: number;
    cleanedKeys: string[];
  };
  combined: {
    totalStrings: number;
    totalCleaned: number;
  };
}

interface DualCleaningPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDownload: () => void;
  language1Code: string;
  language1Name: string;
  language2Code: string;
  language2Name: string;
  originalData1: Record<string, any>;
  cleanedData1: Record<string, any>;
  originalData2: Record<string, any>;
  cleanedData2: Record<string, any>;
  format: string;
  isDownloading?: boolean;
}

export default function DualCleaningPreviewModal({
  isOpen,
  onClose,
  onConfirmDownload,
  language1Code,
  language1Name,
  language2Code,
  language2Name,
  originalData1,
  cleanedData1,
  originalData2,
  cleanedData2,
  format,
  isDownloading = false,
}: DualCleaningPreviewModalProps) {
  const [stats, setStats] = useState<DualCleaningStats>({
    language1: { totalStrings: 0, stringsToClean: 0, cleanedKeys: [] },
    language2: { totalStrings: 0, stringsToClean: 0, cleanedKeys: [] },
    combined: { totalStrings: 0, totalCleaned: 0 },
  });
  const [activeTab, setActiveTab] = useState<'lang1' | 'lang2' | 'combined'>('combined');

  // Helper function to get emoji for language
  const getLanguageEmoji = (langCode: string): string => {
    const emojiMap: Record<string, string> = {
      'en': '🇬🇧', 'en-us': '🇺🇸', 'en-gb': '🇬🇧',
      'id': '🇮🇩', 'ms': '🇲🇾', 'ja': '🇯🇵',
      'ko': '🇰🇷', 'zh': '🇨🇳', 'zh-cn': '🇨🇳',
      'es': '🇪🇸', 'fr': '🇫🇷', 'de': '🇩🇪',
      'it': '🇮🇹', 'pt': '🇵🇹', 'pt-br': '🇧🇷',
      'ru': '🇷🇺', 'ar': '🇸🇦', 'hi': '🇮🇳',
      'th': '🇹🇭', 'vi': '🇻🇳', 'nl': '🇳🇱',
      'pl': '🇵🇱', 'tr': '🇹🇷', 'sv': '🇸🇪',
    };
    return emojiMap[langCode.toLowerCase()] || '🌐';
  };

  useEffect(() => {
    if (isOpen) {
      calculateStats();
    }
  }, [isOpen, originalData1, cleanedData1, originalData2, cleanedData2]);

  const calculateStats = () => {
    const analyzeLanguage = (original: any, cleaned: any) => {
      const cleanedKeys: string[] = [];
      let totalStrings = 0;

      const compareObjects = (orig: any, clean: any, prefix = '') => {
        for (const key in orig) {
          const fullKey = prefix ? `${prefix}.${key}` : key;
          
          if (typeof orig[key] === 'string') {
            totalStrings++;
            if (orig[key] !== clean[key]) {
              cleanedKeys.push(fullKey);
            }
          } else if (typeof orig[key] === 'object' && orig[key] !== null) {
            compareObjects(orig[key], clean[key], fullKey);
          }
        }
      };

      compareObjects(original, cleaned);

      return {
        totalStrings,
        stringsToClean: cleanedKeys.length,
        cleanedKeys,
      };
    };

    const lang1Stats = analyzeLanguage(originalData1, cleanedData1);
    const lang2Stats = analyzeLanguage(originalData2, cleanedData2);

    setStats({
      language1: lang1Stats,
      language2: lang2Stats,
      combined: {
        totalStrings: lang1Stats.totalStrings + lang2Stats.totalStrings,
        totalCleaned: lang1Stats.stringsToClean + lang2Stats.stringsToClean,
      },
    });
  };

  const getFormatLabel = (fmt: string) => {
    const labels: Record<string, string> = {
      json: 'JSON',
      csv: 'CSV',
      xlsx: 'XLSX',
      key_value_json: 'Key-Value JSON',
    };
    return labels[fmt] || fmt.toUpperCase();
  };

  const renderCombinedPreview = () => {
    // Helper to convert language code to locale format
    const toLocaleFormat = (langCode: string): string => {
      const normalized = langCode.toLowerCase();
      const localeMap: Record<string, string> = {
        'en': 'en-ID', 'en-us': 'en-ID', 'en-gb': 'en-ID',
        'id': 'id-ID', 'ms': 'ms-ID', 'ja': 'ja-ID',
        'ko': 'ko-ID', 'zh': 'zh-ID', 'zh-cn': 'zh-ID',
      };
      return localeMap[normalized] || `${normalized.split('-')[0]}-ID`;
    };

    const locale1 = toLocaleFormat(language1Code);
    const locale2 = toLocaleFormat(language2Code);

    if (format === 'json') {
      const originalCombined = {
        [locale1]: originalData1,
        [locale2]: originalData2,
      };
      const cleanedCombined = {
        [locale1]: cleanedData1,
        [locale2]: cleanedData2,
      };
      return { original: originalCombined, cleaned: cleanedCombined };
    } else if (format === 'key_value_json') {
      const originalCombined: Record<string, string> = {};
      const cleanedCombined: Record<string, string> = {};
      
      Object.entries(originalData1).forEach(([key, value]) => {
        originalCombined[`${locale1}.${key}`] = value as string;
      });
      Object.entries(originalData2).forEach(([key, value]) => {
        originalCombined[`${locale2}.${key}`] = value as string;
      });
      
      Object.entries(cleanedData1).forEach(([key, value]) => {
        cleanedCombined[`${locale1}.${key}`] = value as string;
      });
      Object.entries(cleanedData2).forEach(([key, value]) => {
        cleanedCombined[`${locale2}.${key}`] = value as string;
      });
      
      return { original: originalCombined, cleaned: cleanedCombined };
    }
    
    return { original: {}, cleaned: {} };
  };

  if (!isOpen) return null;

  const combinedPreview = renderCombinedPreview();

  const modalContent = (
    <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" style={{ zIndex: 9999 }}>
      <div className="bg-white border-4 border-poe-black rounded-3xl cartoon-shadow max-w-6xl w-full flex flex-col" style={{ maxHeight: '90vh' }}>
        
        {/* Header */}
        <div className="bg-poe-green border-b-4 border-poe-black p-4 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-2xl font-black">Preview Dual Language Cleaning</h2>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white border-4 border-poe-black rounded-xl cartoon-shadow hover:-translate-y-1 transition-cartoon flex items-center justify-center"
              disabled={isDownloading}
            >
              <X className="w-5 h-5" strokeWidth={3} />
            </button>
          </div>
          
          {/* Language Info */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-white border-4 border-poe-black rounded-xl px-3 py-1.5">
              <LanguageFlag languageCode={language1Code} size="sm" />
              <span className="font-bold text-sm">{language1Name}</span>
            </div>
            <span className="text-xl font-black">+</span>
            <div className="flex items-center gap-2 bg-white border-4 border-poe-black rounded-xl px-3 py-1.5">
              <LanguageFlag languageCode={language2Code} size="sm" />
              <span className="font-bold text-sm">{language2Name}</span>
            </div>
            <div className="ml-auto bg-poe-yellow border-4 border-poe-black rounded-xl px-3 py-1.5">
              <span className="font-black text-sm">Format: {getFormatLabel(format)}</span>
            </div>
          </div>
        </div>

        {/* Combined Stats - Simplified */}
        <div className="p-4 border-b-4 border-poe-black bg-poe-blue/10 shrink-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            
            {/* Total Strings */}
            <div className="bg-white border-4 border-poe-black rounded-xl p-3 cartoon-shadow">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-poe-blue border-4 border-poe-black rounded-lg flex items-center justify-center shrink-0">
                  <Globe className="w-5 h-5" strokeWidth={3} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-600">Total</p>
                  <p className="text-xl font-black">{stats.combined.totalStrings}</p>
                </div>
              </div>
            </div>

            {/* Language 1 Stats */}
            <div className="bg-white border-4 border-poe-black rounded-xl p-3 cartoon-shadow">
              <div className="flex items-center gap-2">
                <LanguageFlag languageCode={language1Code} size="sm" />
                <div>
                  <p className="text-xs font-bold text-gray-600">{language1Name}</p>
                  <p className="text-lg font-black">
                    {stats.language1.stringsToClean}/{stats.language1.totalStrings}
                  </p>
                </div>
              </div>
            </div>

            {/* Language 2 Stats */}
            <div className="bg-white border-4 border-poe-black rounded-xl p-3 cartoon-shadow">
              <div className="flex items-center gap-2">
                <LanguageFlag languageCode={language2Code} size="sm" />
                <div>
                  <p className="text-xs font-bold text-gray-600">{language2Name}</p>
                  <p className="text-lg font-black">
                    {stats.language2.stringsToClean}/{stats.language2.totalStrings}
                  </p>
                </div>
              </div>
            </div>

            {/* Total to Clean */}
            <div className="bg-white border-4 border-poe-black rounded-xl p-3 cartoon-shadow">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-poe-pink border-4 border-poe-black rounded-lg flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5" strokeWidth={3} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-600">Clean</p>
                  <p className="text-xl font-black">{stats.combined.totalCleaned}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Info Message - Simplified */}
          {stats.combined.totalCleaned > 0 && (
            <div className="mt-3 bg-poe-yellow border-4 border-poe-black rounded-xl p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" strokeWidth={3} />
              <p className="font-bold text-sm">
                {stats.combined.totalCleaned} string akan dibersihkan dari karakter seperti \\n, \u2028, dan whitespace berlebih.
              </p>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="border-b-4 border-poe-black bg-gray-50 px-4 flex gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('combined')}
            className={`px-4 py-2 font-black text-sm border-4 border-poe-black rounded-t-xl transition-colors ${
              activeTab === 'combined' 
                ? 'bg-white -mb-1' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            <Globe className="w-4 h-4 inline mr-2" strokeWidth={3} />
            Combined
          </button>
          <button
            onClick={() => setActiveTab('lang1')}
            className={`px-4 py-2 font-black text-sm border-4 border-poe-black rounded-t-xl transition-colors flex items-center gap-2 ${
              activeTab === 'lang1' 
                ? 'bg-white -mb-1' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            <span className="text-lg">{getLanguageEmoji(language1Code)}</span>
            {language1Name}
          </button>
          <button
            onClick={() => setActiveTab('lang2')}
            className={`px-4 py-2 font-black text-sm border-4 border-poe-black rounded-t-xl transition-colors flex items-center gap-2 ${
              activeTab === 'lang2' 
                ? 'bg-white -mb-1' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            <span className="text-lg">{getLanguageEmoji(language2Code)}</span>
            {language2Name}
          </button>
        </div>

        {/* Preview Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 min-h-0">
          {activeTab === 'combined' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Before Cleaning */}
              <div>
                <h3 className="text-lg font-black mb-2 flex items-center gap-2">
                  <span className="w-7 h-7 bg-poe-pink border-4 border-poe-black rounded-lg flex items-center justify-center text-sm">
                    1
                  </span>
                  Sebelum Cleaning
                </h3>
                <div className="bg-gray-900 border-4 border-poe-black rounded-xl p-3 overflow-auto max-h-[500px]">
                  <pre className="text-xs text-green-400 font-mono">
                    {JSON.stringify(combinedPreview.original, null, 2)}
                  </pre>
                </div>
              </div>

              {/* After Cleaning */}
              <div>
                <h3 className="text-lg font-black mb-2 flex items-center gap-2">
                  <span className="w-7 h-7 bg-poe-green border-4 border-poe-black rounded-lg flex items-center justify-center text-sm">
                    2
                  </span>
                  Sesudah Cleaning
                </h3>
                <div className="bg-gray-900 border-4 border-poe-black rounded-xl p-3 overflow-auto max-h-[500px]">
                  <pre className="text-xs text-green-400 font-mono">
                    {JSON.stringify(combinedPreview.cleaned, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'lang1' && (
            <div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                {/* Before */}
                <div>
                  <h3 className="text-lg font-black mb-2">Sebelum Cleaning</h3>
                  <div className="bg-gray-900 border-4 border-poe-black rounded-xl p-3 overflow-auto max-h-[400px]">
                    <pre className="text-xs text-green-400 font-mono">
                      {JSON.stringify(originalData1, null, 2)}
                    </pre>
                  </div>
                </div>

                {/* After */}
                <div>
                  <h3 className="text-lg font-black mb-2">Sesudah Cleaning</h3>
                  <div className="bg-gray-900 border-4 border-poe-black rounded-xl p-3 overflow-auto max-h-[400px]">
                    <pre className="text-xs text-green-400 font-mono">
                      {JSON.stringify(cleanedData1, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Cleaned Keys List */}
              {stats.language1.stringsToClean > 0 && (
                <div>
                  <h3 className="text-lg font-black mb-2">String yang Akan Dibersihkan</h3>
                  <div className="bg-poe-pink/20 border-4 border-poe-black rounded-xl p-3 max-h-[200px] overflow-auto">
                    <ul className="space-y-1.5">
                      {stats.language1.cleanedKeys.map((key, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="w-6 h-6 bg-poe-pink border-2 border-poe-black rounded-lg flex items-center justify-center text-xs font-black shrink-0">
                            {index + 1}
                          </span>
                          <code className="font-mono text-xs font-bold break-all">{key}</code>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'lang2' && (
            <div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                {/* Before */}
                <div>
                  <h3 className="text-lg font-black mb-2">Sebelum Cleaning</h3>
                  <div className="bg-gray-900 border-4 border-poe-black rounded-xl p-3 overflow-auto max-h-[400px]">
                    <pre className="text-xs text-green-400 font-mono">
                      {JSON.stringify(originalData2, null, 2)}
                    </pre>
                  </div>
                </div>

                {/* After */}
                <div>
                  <h3 className="text-lg font-black mb-2">Sesudah Cleaning</h3>
                  <div className="bg-gray-900 border-4 border-poe-black rounded-xl p-3 overflow-auto max-h-[400px]">
                    <pre className="text-xs text-green-400 font-mono">
                      {JSON.stringify(cleanedData2, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Cleaned Keys List */}
              {stats.language2.stringsToClean > 0 && (
                <div>
                  <h3 className="text-lg font-black mb-2">String yang Akan Dibersihkan</h3>
                  <div className="bg-poe-pink/20 border-4 border-poe-black rounded-xl p-3 max-h-[200px] overflow-auto">
                    <ul className="space-y-1.5">
                      {stats.language2.cleanedKeys.map((key, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="w-6 h-6 bg-poe-pink border-2 border-poe-black rounded-lg flex items-center justify-center text-xs font-black shrink-0">
                            {index + 1}
                          </span>
                          <code className="font-mono text-xs font-bold break-all">{key}</code>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions - Simplified */}
        <div className="border-t-4 border-poe-black p-4 bg-gray-50 shrink-0">
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Button
              variant="white"
              size="md"
              onClick={onClose}
              disabled={isDownloading}
            >
              Batal
            </Button>
            <Button
              variant="green"
              size="md"
              onClick={onConfirmDownload}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <>
                  <div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" strokeWidth={3} />
                  Download File
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof window !== 'undefined' ? createPortal(modalContent, document.body) : null;
}
