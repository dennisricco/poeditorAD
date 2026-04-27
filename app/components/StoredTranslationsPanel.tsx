'use client';

import { useEffect, useState } from 'react';
import { Database, Trash2, Download, Clock, FileJson } from 'lucide-react';
import Button from './Button';
import LanguageFlag from './LanguageFlag';
import { 
  getAllStoredTranslations, 
  deleteTranslationFromStorage,
  clearProjectTranslations,
  getProjectStorageSize,
  formatStorageSize,
  type StoredTranslation 
} from '../utils/translationStorage';

interface StoredTranslationsPanelProps {
  projectId: string;
  projectName: string;
  onLoadTranslation?: (translation: StoredTranslation) => void;
}

export default function StoredTranslationsPanel({
  projectId,
  projectName,
  onLoadTranslation,
}: StoredTranslationsPanelProps) {
  const [translations, setTranslations] = useState<StoredTranslation[]>([]);
  const [storageSize, setStorageSize] = useState<number>(0);

  useEffect(() => {
    loadTranslations();
  }, [projectId]);

  const loadTranslations = () => {
    const stored = getAllStoredTranslations(projectId);
    setTranslations(stored);
    setStorageSize(getProjectStorageSize(projectId));
  };

  const handleDelete = (languageCode: string, format: string) => {
    if (confirm(`Hapus file ${languageCode} (${format}) dari storage?`)) {
      deleteTranslationFromStorage(projectId, languageCode, format);
      loadTranslations();
    }
  };

  const handleClearAll = () => {
    if (confirm(`Hapus semua file tersimpan untuk project ${projectName}?`)) {
      clearProjectTranslations(projectId);
      loadTranslations();
    }
  };

  const handleDownloadOriginal = (translation: StoredTranslation) => {
    const jsonString = JSON.stringify(translation.data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${projectName}_${translation.languageCode}_original.${translation.format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (translations.length === 0) {
    return (
      <div className="bg-poe-blue/10 border-4 border-poe-black rounded-3xl cartoon-shadow p-8 text-center">
        <div className="w-20 h-20 bg-poe-blue border-4 border-poe-black rounded-3xl mx-auto mb-4 flex items-center justify-center">
          <Database className="w-10 h-10" strokeWidth={3} />
        </div>
        <h3 className="text-2xl font-black mb-2">Belum Ada File Tersimpan</h3>
        <p className="text-lg font-bold text-gray-700">
          Download file untuk menyimpannya di local storage
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border-4 border-poe-black rounded-3xl cartoon-shadow overflow-hidden">
      {/* Header */}
      <div className="bg-poe-blue border-b-4 border-poe-black p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white border-4 border-poe-black rounded-xl flex items-center justify-center">
              <Database className="w-6 h-6" strokeWidth={3} />
            </div>
            <div>
              <h3 className="text-2xl font-black">File Tersimpan</h3>
              <p className="text-sm font-bold text-gray-700">
                {translations.length} file • {formatStorageSize(storageSize)}
              </p>
            </div>
          </div>
          {translations.length > 0 && (
            <Button
              variant="pink"
              size="sm"
              onClick={handleClearAll}
            >
              <Trash2 className="w-4 h-4" strokeWidth={3} />
              Hapus Semua
            </Button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="p-6 space-y-4">
        {translations.map((translation, index) => (
          <div
            key={`${translation.languageCode}_${translation.format}_${index}`}
            className="bg-poe-yellow/20 border-4 border-poe-black rounded-2xl p-4 hover:bg-poe-yellow/30 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              {/* Info */}
              <div className="flex items-start gap-3 flex-1">
                <LanguageFlag languageCode={translation.languageCode} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-xl font-black">{translation.languageCode}</h4>
                    <span className="bg-poe-black text-white px-2 py-1 rounded-lg text-xs font-bold uppercase">
                      {translation.format}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                    <Clock className="w-4 h-4" strokeWidth={3} />
                    {formatDate(translation.timestamp)}
                  </div>
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-600 mt-1">
                    <FileJson className="w-4 h-4" strokeWidth={3} />
                    {Object.keys(translation.data).length} keys
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleDownloadOriginal(translation)}
                  className="w-10 h-10 bg-poe-green border-4 border-poe-black rounded-xl cartoon-shadow hover:-translate-y-1 transition-cartoon flex items-center justify-center"
                  title="Download file original"
                >
                  <Download className="w-5 h-5" strokeWidth={3} />
                </button>
                <button
                  onClick={() => handleDelete(translation.languageCode, translation.format)}
                  className="w-10 h-10 bg-poe-pink border-4 border-poe-black rounded-xl cartoon-shadow hover:-translate-y-1 transition-cartoon flex items-center justify-center"
                  title="Hapus dari storage"
                >
                  <Trash2 className="w-5 h-5" strokeWidth={3} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
