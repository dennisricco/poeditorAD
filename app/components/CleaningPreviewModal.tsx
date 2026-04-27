'use client';

import { X, Download, AlertCircle, CheckCircle2, Trash2, Database } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Button from './Button';
import SaveToDbButton from './SaveToDbButton';

interface CleaningStats {
  totalStrings: number;
  stringsToClean: number;
  cleanedKeys: string[];
}

interface CleaningPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDownload: () => void;
  originalData: Record<string, any>;
  cleanedData: Record<string, any>;
  languageName: string;
  languageCode: string;
  isDownloading?: boolean;
  projectId?: string;
  projectName?: string;
  exportFormat?: string;
  cleaningMode?: string;
  onSaveSuccess?: () => void; // Callback to refresh SavedTranslationsPanel
}

export default function CleaningPreviewModal({
  isOpen,
  onClose,
  onConfirmDownload,
  originalData,
  cleanedData,
  languageName,
  languageCode,
  isDownloading = false,
  projectId,
  projectName,
  exportFormat = 'json',
  cleaningMode,
  onSaveSuccess,
}: CleaningPreviewModalProps) {
  const [stats, setStats] = useState<CleaningStats>({
    totalStrings: 0,
    stringsToClean: 0,
    cleanedKeys: [],
  });

  useEffect(() => {
    if (isOpen) {
      calculateStats();
    }
  }, [isOpen, originalData, cleanedData]);

  const calculateStats = () => {
    const cleanedKeys: string[] = [];
    let totalStrings = 0;

    const compareObjects = (original: any, cleaned: any, prefix = '') => {
      for (const key in original) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        
        if (typeof original[key] === 'string') {
          totalStrings++;
          if (original[key] !== cleaned[key]) {
            cleanedKeys.push(fullKey);
          }
        } else if (typeof original[key] === 'object' && original[key] !== null) {
          compareObjects(original[key], cleaned[key], fullKey);
        }
      }
    };

    compareObjects(originalData, cleanedData);

    setStats({
      totalStrings,
      stringsToClean: cleanedKeys.length,
      cleanedKeys,
    });
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" style={{ zIndex: 9999 }}>
      <div className="bg-white border-4 border-poe-black rounded-3xl cartoon-shadow max-w-6xl w-full my-8 flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="bg-poe-yellow border-b-4 border-poe-black p-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black mb-1">Preview Cleaning</h2>
            <p className="text-lg font-bold text-gray-700">
              {languageName} ({languageCode})
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-12 h-12 bg-white border-4 border-poe-black rounded-xl cartoon-shadow hover:-translate-y-1 transition-cartoon flex items-center justify-center"
            disabled={isDownloading}
          >
            <X className="w-6 h-6" strokeWidth={3} />
          </button>
        </div>

        {/* Stats Section */}
        <div className="p-6 border-b-4 border-poe-black bg-poe-blue/10">
          {/* Info: Data dari localStorage */}
          <div className="mb-4 bg-poe-green border-4 border-poe-black rounded-2xl p-4 flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 shrink-0 mt-0.5" strokeWidth={3} />
            <div>
              <p className="font-black text-lg mb-1">File Original dari POEditor</p>
              <p className="font-bold text-sm">
                Data ini adalah file asli yang didownload dari POEditor API dan disimpan di local storage sebelum proses cleaning.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Total Strings */}
            <div className="bg-white border-4 border-poe-black rounded-2xl p-4 cartoon-shadow">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-poe-blue border-4 border-poe-black rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" strokeWidth={3} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-600 uppercase">Total Strings</p>
                  <p className="text-3xl font-black">{stats.totalStrings}</p>
                </div>
              </div>
            </div>

            {/* Strings to Clean */}
            <div className="bg-white border-4 border-poe-black rounded-2xl p-4 cartoon-shadow">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-poe-pink border-4 border-poe-black rounded-xl flex items-center justify-center">
                  <Trash2 className="w-6 h-6" strokeWidth={3} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-600 uppercase">Will Be Cleaned</p>
                  <p className="text-3xl font-black">{stats.stringsToClean}</p>
                </div>
              </div>
            </div>

            {/* Clean Strings */}
            <div className="bg-white border-4 border-poe-black rounded-2xl p-4 cartoon-shadow">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-poe-green border-4 border-poe-black rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" strokeWidth={3} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-600 uppercase">Already Clean</p>
                  <p className="text-3xl font-black">{stats.totalStrings - stats.stringsToClean}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Info Message */}
          {stats.stringsToClean > 0 && (
            <div className="mt-4 bg-poe-yellow border-4 border-poe-black rounded-2xl p-4 flex items-start gap-3">
              <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" strokeWidth={3} />
              <div>
                <p className="font-black text-lg mb-1">Cleaning akan dilakukan</p>
                <p className="font-bold text-sm">
                  {stats.stringsToClean} string akan dibersihkan dari karakter seperti \\n, \u2028, dan whitespace berlebih.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Before Cleaning */}
            <div>
              <h3 className="text-xl font-black mb-3 flex items-center gap-2">
                <span className="w-8 h-8 bg-poe-pink border-4 border-poe-black rounded-lg flex items-center justify-center text-sm">
                  1
                </span>
                Sebelum Cleaning
              </h3>
              <div className="bg-gray-900 border-4 border-poe-black rounded-2xl p-4 overflow-auto" style={{ maxHeight: '60vh' }}>
                <pre className="text-xs text-green-400 font-mono">
                  {JSON.stringify(originalData, null, 2)}
                </pre>
              </div>
            </div>

            {/* After Cleaning */}
            <div>
              <h3 className="text-xl font-black mb-3 flex items-center gap-2">
                <span className="w-8 h-8 bg-poe-green border-4 border-poe-black rounded-lg flex items-center justify-center text-sm">
                  2
                </span>
                Sesudah Cleaning
              </h3>
              <div className="bg-gray-900 border-4 border-poe-black rounded-2xl p-4 overflow-auto" style={{ maxHeight: '60vh' }}>
                <pre className="text-xs text-green-400 font-mono">
                  {JSON.stringify(cleanedData, null, 2)}
                </pre>
              </div>
            </div>
          </div>

          {/* List of Cleaned Keys */}
          {stats.stringsToClean > 0 && (
            <div className="mt-6">
              <h3 className="text-xl font-black mb-3">String yang Akan Dibersihkan</h3>
              <div className="bg-poe-pink/20 border-4 border-poe-black rounded-2xl p-4 max-h-[200px] overflow-auto">
                <ul className="space-y-2">
                  {stats.cleanedKeys.map((key, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="w-6 h-6 bg-poe-pink border-2 border-poe-black rounded-lg flex items-center justify-center text-xs font-black shrink-0">
                        {index + 1}
                      </span>
                      <code className="font-mono text-sm font-bold break-all">{key}</code>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t-4 border-poe-black p-6 bg-gray-50 flex flex-col sm:flex-row gap-3 justify-end">
          <Button
            variant="white"
            size="md"
            onClick={onClose}
            disabled={isDownloading}
          >
            Batal
          </Button>
          
          {/* Save to Database Button */}
          {projectId ? (
            <SaveToDbButton
              projectId={projectId}
              projectName={projectName}
              languageCode={languageCode}
              languageName={languageName}
              exportFormat={exportFormat}
              cleaningMode={cleaningMode}
              languagePack={cleanedData}
              disabled={isDownloading}
              onSaveSuccess={(data) => {
                console.log('Translation saved to database:', data);
                alert(`✅ Saved successfully! Version: ${data.version}`);
                // Trigger refresh callback
                if (onSaveSuccess) {
                  onSaveSuccess();
                }
              }}
              onSaveError={(error) => {
                console.error('Failed to save translation:', error);
                alert(`❌ Failed to save to database: ${error}`);
              }}
            />
          ) : (
            <Button
              variant="blue"
              size="md"
              onClick={() => alert('Project ID not available. Please refresh the page.')}
              disabled={isDownloading}
            >
              <Database className="w-5 h-5" strokeWidth={3} />
              💾 Save to Database
            </Button>
          )}
          
          <Button
            variant="green"
            size="md"
            onClick={onConfirmDownload}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <>
                <div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin" />
                Downloading...
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
  );

  return typeof window !== 'undefined' ? createPortal(modalContent, document.body) : null;
}
