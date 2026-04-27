'use client';

import { useState } from 'react';
import { Loader2, Download, Database, Info } from 'lucide-react';
import type { POEditorLanguage } from '../types';

interface CleaningModeSelectorProps {
  language: POEditorLanguage;
  projectId: string;
  projectName: string;
}

type CleaningMode = 'download' | 'update';

export default function CleaningModeSelector({
  language,
  projectId,
  projectName,
}: CleaningModeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<CleaningMode>('download');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleClean = async () => {
    try {
      setIsProcessing(true);
      setResult(null);

      // Step 1: Export current translations
      const exportResponse = await fetch('/api/poeditor/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          languageCode: language.code,
          type: 'key_value_json',
        }),
      });

      if (!exportResponse.ok) {
        throw new Error('Failed to export translations');
      }

      const exportData = await exportResponse.json();

      if (!exportData.cleanedData) {
        throw new Error('No cleaned data available');
      }

      const cleanedTranslations = exportData.cleanedData;

      if (mode === 'download') {
        // Download mode: Download cleaned JSON
        const jsonString = JSON.stringify(cleanedTranslations, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `${projectName}_${language.code}_cleaned.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        setResult({
          success: true,
          message: `Downloaded cleaned translations for ${language.name}`
        });
      } else {
        // Update mode: Push cleaned data back to POEditor
        const updateResponse = await fetch('/api/poeditor/update-terms', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            projectId,
            languageCode: language.code,
            updates: cleanedTranslations,
          }),
        });

        if (!updateResponse.ok) {
          throw new Error('Failed to update translations');
        }

        const updateData = await updateResponse.json();

        if (updateData.success) {
          setResult({
            success: true,
            message: `Successfully updated ${Object.keys(cleanedTranslations).length} translations in POEditor`
          });
        } else {
          throw new Error(updateData.error || 'Update failed');
        }
      }
    } catch (err) {
      console.error('Error cleaning translations:', err);
      setResult({
        success: false,
        message: err instanceof Error ? err.message : 'Failed to process translations'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="mt-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-poe-green border-4 border-poe-black rounded-xl px-3 py-2 text-sm font-black flex items-center justify-between transition-cartoon hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#000000]"
      >
        <span>🧹 Clean Strings</span>
        <span className="text-xs">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="mt-2 bg-white border-4 border-poe-black rounded-xl p-4 space-y-3">
          {/* Info */}
          <div className="flex items-start gap-2 bg-poe-yellow/20 border-2 border-poe-black rounded-lg p-2">
            <Info className="w-4 h-4 mt-0.5 shrink-0" strokeWidth={3} />
            <p className="text-xs font-bold">
              Clean problematic characters: \\n, \n", \u2028, multiple spaces
            </p>
          </div>

          {/* Mode Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wide">
              Choose Action
            </label>
            
            <div className="space-y-2">
              {/* Download Option */}
              <button
                onClick={() => setMode('download')}
                className={`w-full border-4 border-poe-black rounded-xl px-3 py-3 text-sm font-bold flex items-center gap-3 transition-colors ${
                  mode === 'download' 
                    ? 'bg-poe-blue text-white' 
                    : 'bg-white hover:bg-gray-50'
                }`}
              >
                <Download className="w-5 h-5" strokeWidth={3} />
                <div className="flex-1 text-left">
                  <div className="font-black">Download Cleaned File</div>
                  <div className="text-xs opacity-80">Save cleaned JSON to your device</div>
                </div>
                {mode === 'download' && <span className="text-lg">✓</span>}
              </button>

              {/* Update Option */}
              <button
                onClick={() => setMode('update')}
                className={`w-full border-4 border-poe-black rounded-xl px-3 py-3 text-sm font-bold flex items-center gap-3 transition-colors ${
                  mode === 'update' 
                    ? 'bg-poe-pink text-white' 
                    : 'bg-white hover:bg-gray-50'
                }`}
              >
                <Database className="w-5 h-5" strokeWidth={3} />
                <div className="flex-1 text-left">
                  <div className="font-black">Update POEditor Database</div>
                  <div className="text-xs opacity-80">Apply cleaned strings directly to POEditor</div>
                </div>
                {mode === 'update' && <span className="text-lg">✓</span>}
              </button>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleClean}
            disabled={isProcessing}
            className="w-full bg-poe-black text-white border-4 border-poe-black rounded-xl px-4 py-3 text-sm font-black flex items-center justify-center gap-2 transition-cartoon hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#000000] active:translate-y-0 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" strokeWidth={3} />
                Processing...
              </>
            ) : (
              <>
                {mode === 'download' ? (
                  <>
                    <Download className="w-4 h-4" strokeWidth={3} />
                    Download Cleaned
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4" strokeWidth={3} />
                    Update Database
                  </>
                )}
              </>
            )}
          </button>

          {/* Result Message */}
          {result && (
            <div className={`border-4 border-poe-black rounded-xl px-3 py-2 text-sm font-bold ${
              result.success 
                ? 'bg-poe-green text-white' 
                : 'bg-poe-pink text-white'
            }`}>
              {result.success ? '✓' : '✗'} {result.message}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
