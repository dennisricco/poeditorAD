'use client';

import { useState, useEffect } from 'react';
import {
  getSavedTranslations,
  deleteTranslationFromDatabase,
  formatFileSize,
  SavedTranslation,
} from '@/app/utils/translationDatabase';

interface SavedTranslationsPanelProps {
  projectId: string;
  onLoadTranslation?: (translation: SavedTranslation) => void;
}

export default function SavedTranslationsPanel({
  projectId,
  onLoadTranslation,
}: SavedTranslationsPanelProps) {
  const [translations, setTranslations] = useState<SavedTranslation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    loadTranslations();
  }, [projectId]);

  const loadTranslations = async () => {
    setIsLoading(true);
    setError(null);

    const result = await getSavedTranslations(projectId);

    if (result.success && result.data) {
      setTranslations(result.data);
    } else {
      setError(result.error || 'Failed to load translations');
    }

    setIsLoading(false);
  };

  const handleDelete = async (languageVersion: number) => {
    if (!confirm('Are you sure you want to delete this saved translation?')) {
      return;
    }

    setDeletingId(languageVersion);

    const result = await deleteTranslationFromDatabase(languageVersion);

    if (result.success) {
      setTranslations(prev => 
        prev.filter(t => t.languageVersion !== languageVersion)
      );
    } else {
      alert(`Failed to delete: ${result.error}`);
    }

    setDeletingId(null);
  };

  const handleLoad = (translation: SavedTranslation) => {
    onLoadTranslation?.(translation);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Helper to check if it's a dual language entry
  const isDualLanguage = (languageCode: string) => {
    return languageCode?.includes('+');
  };

  // Helper to format language code display
  const formatLanguageCode = (languageCode: string) => {
    if (!languageCode) return 'N/A';
    
    // For dual language (e.g., "en+id"), show as "EN+ID"
    if (isDualLanguage(languageCode)) {
      return languageCode.toUpperCase();
    }
    
    // For single language, show as "EN"
    return languageCode.toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-white border-4 border-poe-black rounded-3xl cartoon-shadow">
        <div className="flex items-center justify-center py-8">
          <div className="w-12 h-12 bg-poe-blue border-4 border-poe-black rounded-xl flex items-center justify-center animate-bounce">
            <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <span className="ml-3 text-lg font-bold text-gray-700">Loading saved translations...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-poe-pink border-4 border-poe-black rounded-3xl cartoon-shadow">
        <div className="text-center">
          <p className="text-2xl font-black mb-2">⚠️ Error loading translations</p>
          <p className="text-lg font-bold mb-4">{error}</p>
          <button
            onClick={loadTranslations}
            className="px-6 py-3 bg-poe-black text-white border-4 border-poe-black rounded-xl font-black transition-cartoon hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#000000]"
          >
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  if (translations.length === 0) {
    return (
      <div className="p-6 bg-white border-4 border-poe-black rounded-3xl cartoon-shadow">
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-poe-yellow border-4 border-poe-black rounded-3xl mx-auto flex items-center justify-center mb-4">
            <svg
              className="w-12 h-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
          </div>
          <p className="text-2xl font-black mb-2">No saved translations yet</p>
          <p className="text-lg font-bold text-gray-600">
            Export and save translations to see them here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white border-4 border-poe-black rounded-3xl cartoon-shadow">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-black">
          💾 Saved Translations ({translations.length})
        </h3>
        <button
          onClick={loadTranslations}
          className="px-4 py-2 bg-poe-blue text-white border-4 border-poe-black rounded-xl font-black transition-cartoon hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#000000]"
        >
          🔄 Refresh
        </button>
      </div>

      <div className="space-y-4">
        {translations.map((translation) => {
          const isDual = isDualLanguage(translation.languageCode);
          const uniqueKey = `${translation.languageVersion}-${translation.projectId}-${translation.languageCode}`;
          
          return (
            <div
              key={uniqueKey}
              className={`p-5 border-4 border-poe-black rounded-2xl cartoon-shadow transition-cartoon hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#000000] ${
                isDual ? 'bg-purple-50' : 'bg-white'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    {isDual && (
                      <span className="px-3 py-1 text-xs font-black bg-purple-500 text-white border-2 border-poe-black rounded-lg">
                        DUAL
                      </span>
                    )}
                    <span className="text-xl font-black">
                      {formatLanguageCode(translation.languageCode)}
                    </span>
                    {translation.languageName && (
                      <span className="text-sm font-bold text-gray-600">
                        ({translation.languageName})
                      </span>
                    )}
                    <span className="px-3 py-1 text-xs font-black bg-poe-blue text-white border-2 border-poe-black rounded-lg">
                      v{translation.version}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm font-bold">
                    <div className="bg-white border-2 border-poe-black rounded-xl px-3 py-2">
                      <span className="text-gray-600">Format:</span>{' '}
                      <span className="text-gray-900">{translation.exportFormat}</span>
                    </div>
                    <div className="bg-white border-2 border-poe-black rounded-xl px-3 py-2">
                      <span className="text-gray-600">Terms:</span>{' '}
                      <span className="text-gray-900">{translation.termsCount || 0}</span>
                      {isDual && <span className="text-xs ml-1 text-purple-600">(combined)</span>}
                    </div>
                    {translation.cleaningMode && (
                      <div className="bg-white border-2 border-poe-black rounded-xl px-3 py-2">
                        <span className="text-gray-600">Cleaning:</span>{' '}
                        <span className="text-gray-900">{translation.cleaningMode}</span>
                      </div>
                    )}
                    <div className="bg-white border-2 border-poe-black rounded-xl px-3 py-2">
                      <span className="text-gray-600">Size:</span>{' '}
                      <span className="text-gray-900">{formatFileSize(translation.fileSizeBytes)}</span>
                    </div>
                  </div>

                  <div className="mt-3 text-xs font-bold text-gray-500">
                    📅 Saved: {formatDate(translation.createdTime)}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleLoad(translation)}
                    className="px-4 py-2 text-sm bg-poe-green text-white border-4 border-poe-black rounded-xl font-black transition-cartoon hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#000000] whitespace-nowrap"
                  >
                    📥 Load
                  </button>
                  <button
                    onClick={() => handleDelete(translation.languageVersion)}
                    disabled={deletingId === translation.languageVersion}
                    className="px-4 py-2 text-sm bg-poe-pink text-white border-4 border-poe-black rounded-xl font-black transition-cartoon hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#000000] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {deletingId === translation.languageVersion ? '⏳' : '🗑️ Delete'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
