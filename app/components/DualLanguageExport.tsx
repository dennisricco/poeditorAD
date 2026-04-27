'use client';

import { useState } from 'react';
import { Loader2, ChevronDown, X, Download, Database } from 'lucide-react';
import LanguageFlag from './LanguageFlag';
import DualCleaningPreviewModal from './DualCleaningPreviewModal';
import type { POEditorLanguage } from '../types';
import { saveTranslationToStorage } from '../utils/translationStorage';

interface DualLanguageExportProps {
  languages: POEditorLanguage[];
  projectId: string;
  projectName: string;
  onSaveSuccess?: () => void; // Callback to refresh SavedTranslationsPanel
}

const EXPORT_FORMATS = [
  { value: 'json', label: 'JSON', icon: '📄' },
  { value: 'csv', label: 'CSV', icon: '📋' },
  { value: 'xlsx', label: 'XLSX (Excel)', icon: '📈' },
  { value: 'key_value_json', label: 'Key-Value JSON', icon: '🔑' },
];

type ActionMode = 'download' | 'database';

export default function DualLanguageExport({
  languages,
  projectId,
  projectName,
  onSaveSuccess,
}: DualLanguageExportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [language1, setLanguage1] = useState<string>('');
  const [language2, setLanguage2] = useState<string>('');
  const [selectedFormat, setSelectedFormat] = useState('json');
  const [actionMode, setActionMode] = useState<ActionMode>('download');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showFormatDropdown, setShowFormatDropdown] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  
  // Preview modal state
  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean;
    originalData1: Record<string, any> | null;
    cleanedData1: Record<string, any> | null;
    originalData2: Record<string, any> | null;
    cleanedData2: Record<string, any> | null;
  }>({
    isOpen: false,
    originalData1: null,
    cleanedData1: null,
    originalData2: null,
    cleanedData2: null,
  });

  const handleProcess = async () => {
    if (!language1 || !language2) {
      alert('Please select two languages');
      return;
    }

    if (language1 === language2) {
      alert('Please select two different languages');
      return;
    }

    try {
      setIsProcessing(true);
      setResult(null);

      // If action mode is "database", save directly without modal
      if (actionMode === 'database') {
        await executeSaveToDatabase();
        return;
      }

      // For download mode, fetch preview data untuk JSON formats
      // API route akan download dari POEditor dan return original + cleaned data
      if (selectedFormat === 'json' || selectedFormat === 'key_value_json') {
        const previewResponse = await fetch('/api/poeditor/export-dual-preview', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            projectId,
            language1,
            language2,
            format: selectedFormat,
          }),
        });

        if (!previewResponse.ok) {
          throw new Error('Failed to fetch preview');
        }

        const previewData = await previewResponse.json();

        if (previewData.response?.status === 'success') {
          // Simpan original data ke localStorage
          if (previewData.originalData1) {
            saveTranslationToStorage(projectId, language1, 'key_value_json', previewData.originalData1);
          }
          if (previewData.originalData2) {
            saveTranslationToStorage(projectId, language2, 'key_value_json', previewData.originalData2);
          }
          console.log('Both original files saved to localStorage');

          // Show preview modal
          setPreviewModal({
            isOpen: true,
            originalData1: previewData.originalData1,
            cleanedData1: previewData.cleanedData1,
            originalData2: previewData.originalData2,
            cleanedData2: previewData.cleanedData2,
          });
          setIsProcessing(false);
          return;
        }
      }

      // For non-JSON formats or if preview fails, proceed directly
      await executeDownload();
    } catch (err) {
      console.error('Error processing translations:', err);
      setResult({
        success: false,
        message: err instanceof Error ? err.message : 'Failed to process translations'
      });
      setIsProcessing(false);
    }
  };

  const executeDownload = async () => {
    try {
      const response = await fetch('/api/poeditor/export-dual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          language1,
          language2,
          format: selectedFormat,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to export translations');
      }

      // Download mode: Save file to device
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const extension = selectedFormat === 'xlsx' ? 'xlsx' : 
                       selectedFormat === 'csv' ? 'csv' : 'json';
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${projectName}_${language1}_${language2}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setResult({
        success: true,
        message: `Downloaded ${selectedFormat.toUpperCase()} file successfully`
      });
    } catch (err) {
      console.error('Error downloading translations:', err);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const executeSaveToDatabase = async () => {
    try {
      // Import save function
      const { saveTranslationToDatabase } = await import('../utils/translationDatabase');

      // Fetch preview data to get cleaned data
      const previewResponse = await fetch('/api/poeditor/export-dual-preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          language1,
          language2,
          format: selectedFormat,
        }),
      });

      if (!previewResponse.ok) {
        throw new Error('Failed to fetch data from POEditor');
      }

      const previewData = await previewResponse.json();

      if (previewData.response?.status !== 'success') {
        throw new Error('Failed to export from POEditor');
      }

      // Prepare combined data
      const toLocaleFormat = (langCode: string): string => {
        const normalized = langCode.toLowerCase();
        const localeMap: Record<string, string> = {
          'en': 'en-ID', 'en-us': 'en-ID', 'en-gb': 'en-ID',
          'id': 'id-ID', 'ms': 'ms-ID', 'ja': 'ja-ID',
          'ko': 'ko-ID', 'zh': 'zh-ID', 'zh-cn': 'zh-ID',
        };
        return localeMap[normalized] || `${normalized.split('-')[0]}-ID`;
      };

      const locale1 = toLocaleFormat(language1);
      const locale2 = toLocaleFormat(language2);

      let combinedData: Record<string, any>;

      if (selectedFormat === 'json') {
        combinedData = {
          [locale1]: previewData.cleanedData1,
          [locale2]: previewData.cleanedData2,
        };
      } else if (selectedFormat === 'key_value_json') {
        combinedData = {};
        Object.entries(previewData.cleanedData1).forEach(([key, value]) => {
          combinedData[`${locale1}.${key}`] = value as string;
        });
        Object.entries(previewData.cleanedData2).forEach(([key, value]) => {
          combinedData[`${locale2}.${key}`] = value as string;
        });
      } else {
        throw new Error('Only JSON formats are supported for database save');
      }

      // Get language names
      const lang1Name = languages.find(l => l.code === language1)?.name || language1;
      const lang2Name = languages.find(l => l.code === language2)?.name || language2;

      // Calculate total terms
      const totalTerms = Object.keys(previewData.cleanedData1).length + 
                        Object.keys(previewData.cleanedData2).length;

      // Save to database
      const result = await saveTranslationToDatabase({
        projectId,
        projectName,
        languageCode: `${language1}+${language2}`,
        languageName: `${lang1Name} + ${lang2Name}`,
        exportFormat: selectedFormat,
        cleaningMode: 'basic',
        languagePack: combinedData,
        termsCount: totalTerms,
      });

      if (result.success) {
        setResult({
          success: true,
          message: `✅ Saved successfully!\n\nLanguage: ${lang1Name} + ${lang2Name}\nVersion: ${result.data?.version || 'N/A'}\nTerms: ${totalTerms}\n\nYou can view this in "Saved Translations" panel.`
        });
        
        // Show alert
        alert(`✅ Translation saved successfully!\n\nLanguage: ${lang1Name} + ${lang2Name}\nVersion: ${result.data?.version || 'N/A'}\nTerms: ${totalTerms}\n\nYou can view this translation in the "Saved Translations" panel below.`);
        
        // Trigger refresh callback
        if (onSaveSuccess) {
          onSaveSuccess();
        }
      } else {
        throw new Error(result.error || 'Failed to save to database');
      }
    } catch (err) {
      console.error('Error saving to database:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setResult({
        success: false,
        message: `❌ Failed to save: ${errorMessage}`
      });
      alert(`❌ Failed to save to database\n\nError: ${errorMessage}\n\nPlease try again or contact support if the problem persists.`);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmDownload = async () => {
    try {
      await executeDownload();
      setPreviewModal({
        isOpen: false,
        originalData1: null,
        cleanedData1: null,
        originalData2: null,
        cleanedData2: null,
      });
    } catch (err) {
      setResult({
        success: false,
        message: err instanceof Error ? err.message : 'Failed to download'
      });
    }
  };

  const handleClosePreview = () => {
    setPreviewModal({
      isOpen: false,
      originalData1: null,
      cleanedData1: null,
      originalData2: null,
      cleanedData2: null,
    });
    setIsProcessing(false);
  };

  const selectedLang1 = languages.find(l => l.code === language1);
  const selectedLang2 = languages.find(l => l.code === language2);
  const selectedFormatData = EXPORT_FORMATS.find(f => f.value === selectedFormat);

  return (
    <div className="bg-poe-green border-4 border-poe-black rounded-3xl cartoon-shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-black">Download Two Languages</h3>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-poe-black text-white border-4 border-poe-black rounded-xl px-4 py-2 text-sm font-black transition-cartoon hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#000000]"
        >
          {isOpen ? 'Close' : 'Open'}
        </button>
      </div>

      {isOpen && (
        <div className="space-y-4">
          {/* Language 1 Selector */}
          <div>
            <label className="block text-sm font-bold mb-2">First Language</label>
            <div className="relative">
              <select
                value={language1}
                onChange={(e) => setLanguage1(e.target.value)}
                className="w-full bg-white border-4 border-poe-black rounded-xl px-4 py-3 font-bold appearance-none cursor-pointer"
              >
                <option value="">Select language...</option>
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name} ({lang.code})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" strokeWidth={3} />
            </div>
            {selectedLang1 && (
              <div className="mt-2 flex items-center gap-2 bg-white border-4 border-poe-black rounded-xl px-3 py-2">
                <LanguageFlag languageCode={selectedLang1.code} size="sm" />
                <span className="font-bold">{selectedLang1.name}</span>
                <button
                  onClick={() => setLanguage1('')}
                  className="ml-auto hover:bg-gray-100 rounded-lg p-1"
                >
                  <X className="w-4 h-4" strokeWidth={3} />
                </button>
              </div>
            )}
          </div>

          {/* Language 2 Selector */}
          <div>
            <label className="block text-sm font-bold mb-2">Second Language</label>
            <div className="relative">
              <select
                value={language2}
                onChange={(e) => setLanguage2(e.target.value)}
                className="w-full bg-white border-4 border-poe-black rounded-xl px-4 py-3 font-bold appearance-none cursor-pointer"
              >
                <option value="">Select language...</option>
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code} disabled={lang.code === language1}>
                    {lang.name} ({lang.code})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" strokeWidth={3} />
            </div>
            {selectedLang2 && (
              <div className="mt-2 flex items-center gap-2 bg-white border-4 border-poe-black rounded-xl px-3 py-2">
                <LanguageFlag languageCode={selectedLang2.code} size="sm" />
                <span className="font-bold">{selectedLang2.name}</span>
                <button
                  onClick={() => setLanguage2('')}
                  className="ml-auto hover:bg-gray-100 rounded-lg p-1"
                >
                  <X className="w-4 h-4" strokeWidth={3} />
                </button>
              </div>
            )}
          </div>

          {/* Format Selector */}
          <div>
            <label className="block text-sm font-bold mb-2">Export Format</label>
            <div className="relative">
              <button
                onClick={() => setShowFormatDropdown(!showFormatDropdown)}
                className="w-full bg-white border-4 border-poe-black rounded-xl px-4 py-3 font-bold text-left flex items-center justify-between"
              >
                <span>
                  {selectedFormatData?.icon} {selectedFormatData?.label}
                </span>
                <ChevronDown 
                  className={`w-5 h-5 transition-transform ${showFormatDropdown ? 'rotate-180' : ''}`} 
                  strokeWidth={3} 
                />
              </button>

              {showFormatDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowFormatDropdown(false)}
                  />
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border-4 border-poe-black rounded-2xl cartoon-shadow z-20">
                    <div className="p-2 space-y-1">
                      {EXPORT_FORMATS.map((format) => (
                        <button
                          key={format.value}
                          onClick={() => {
                            setSelectedFormat(format.value);
                            setShowFormatDropdown(false);
                          }}
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
          </div>

          {/* Action Mode Selector */}
          <div>
            <label className="block text-sm font-bold mb-2">Choose Action</label>
            <div className="space-y-2">
              {/* Download Option */}
              <button
                onClick={() => setActionMode('download')}
                className={`w-full border-4 border-poe-black rounded-xl px-4 py-3 text-sm font-bold flex items-center gap-3 transition-colors ${
                  actionMode === 'download' 
                    ? 'bg-poe-blue text-white' 
                    : 'bg-white hover:bg-gray-50'
                }`}
              >
                <Download className="w-5 h-5" strokeWidth={3} />
                <div className="flex-1 text-left">
                  <div className="font-black">Download File</div>
                  <div className="text-xs opacity-80">Save combined file to your device</div>
                </div>
                {actionMode === 'download' && <span className="text-lg">✓</span>}
              </button>

              {/* Database Option */}
              <button
                onClick={() => setActionMode('database')}
                className={`w-full border-4 border-poe-black rounded-xl px-4 py-3 text-sm font-bold flex items-center gap-3 transition-colors ${
                  actionMode === 'database' 
                    ? 'bg-poe-pink text-white' 
                    : 'bg-white hover:bg-gray-50'
                }`}
              >
                <Database className="w-5 h-5" strokeWidth={3} />
                <div className="flex-1 text-left">
                  <div className="font-black">Save to My Database</div>
                  <div className="text-xs opacity-80">Store in your own database</div>
                </div>
                {actionMode === 'database' && <span className="text-lg">✓</span>}
              </button>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleProcess}
            disabled={!language1 || !language2 || isProcessing}
            className="w-full bg-poe-black text-white border-4 border-poe-black rounded-xl px-4 py-4 text-lg font-black flex items-center justify-center gap-2 transition-cartoon hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#000000] active:translate-y-0 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" strokeWidth={3} />
                Processing...
              </>
            ) : (
              <>
                {actionMode === 'download' ? (
                  <>
                    <Download className="w-5 h-5" strokeWidth={3} />
                    <span>Download Combined File</span>
                  </>
                ) : (
                  <>
                    <Database className="w-5 h-5" strokeWidth={3} />
                    <span>Save to Database</span>
                  </>
                )}
              </>
            )}
          </button>

          {/* Result Message */}
          {result && (
            <div className={`border-4 border-poe-black rounded-xl px-4 py-3 text-sm font-bold ${
              result.success 
                ? 'bg-poe-yellow' 
                : 'bg-poe-pink text-white'
            }`}>
              {result.success ? '✓' : '✗'} {result.message}
            </div>
          )}
        </div>
      )}

      {/* Dual Cleaning Preview Modal */}
      {previewModal.isOpen && 
       previewModal.originalData1 && 
       previewModal.cleanedData1 && 
       previewModal.originalData2 && 
       previewModal.cleanedData2 && (
        <DualCleaningPreviewModal
          isOpen={previewModal.isOpen}
          onClose={handleClosePreview}
          onConfirmDownload={handleConfirmDownload}
          language1Code={language1}
          language1Name={languages.find(l => l.code === language1)?.name || language1}
          language2Code={language2}
          language2Name={languages.find(l => l.code === language2)?.name || language2}
          originalData1={previewModal.originalData1}
          cleanedData1={previewModal.cleanedData1}
          originalData2={previewModal.originalData2}
          cleanedData2={previewModal.cleanedData2}
          format={selectedFormat}
          isDownloading={isProcessing}
        />
      )}
    </div>
  );
}
