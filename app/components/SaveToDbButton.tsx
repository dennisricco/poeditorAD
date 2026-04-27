'use client';

import { useState } from 'react';
import { Database, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { saveTranslationToDatabase } from '@/app/utils/translationDatabase';

interface SaveToDbButtonProps {
  projectId: string;
  projectName?: string;
  languageCode: string;
  languageName?: string;
  exportFormat: string;
  cleaningMode?: string;
  languagePack: Record<string, any>;
  disabled?: boolean;
  onSaveSuccess?: (data: any) => void;
  onSaveError?: (error: string) => void;
}

export default function SaveToDbButton({
  projectId,
  projectName,
  languageCode,
  languageName,
  exportFormat,
  cleaningMode,
  languagePack,
  disabled = false,
  onSaveSuccess,
  onSaveError,
}: SaveToDbButtonProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');

    try {
      const result = await saveTranslationToDatabase({
        projectId,
        projectName,
        languageCode,
        languageName,
        exportFormat,
        cleaningMode,
        languagePack,
        termsCount: Object.keys(languagePack).length,
      });

      if (result.success) {
        setSaveStatus('success');
        
        // Show success alert
        alert(`✅ Translation saved successfully!\n\n` +
              `Language: ${languageName || languageCode}\n` +
              `Version: ${result.data?.version || 'N/A'}\n` +
              `Terms: ${Object.keys(languagePack).length}\n\n` +
              `You can view this translation in the "Saved Translations" panel below.`);
        
        onSaveSuccess?.(result.data);
        
        // Reset status after 3 seconds
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
        
        // Show error alert
        alert(`❌ Failed to save translation\n\n` +
              `Error: ${result.error || 'Unknown error'}\n\n` +
              `Please try again or contact support if the problem persists.`);
        
        onSaveError?.(result.error || 'Failed to save');
        
        // Reset status after 5 seconds
        setTimeout(() => setSaveStatus('idle'), 5000);
      }
    } catch (error) {
      setSaveStatus('error');
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Show error alert
      alert(`❌ Failed to save translation\n\n` +
            `Error: ${errorMessage}\n\n` +
            `Please try again or contact support if the problem persists.`);
      
      onSaveError?.(errorMessage);
      
      setTimeout(() => setSaveStatus('idle'), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const getButtonContent = () => {
    if (isSaving) {
      return (
        <>
          <Loader2 className="w-5 h-5 animate-spin" strokeWidth={3} />
          <span>Saving...</span>
        </>
      );
    }
    
    if (saveStatus === 'success') {
      return (
        <>
          <CheckCircle2 className="w-5 h-5" strokeWidth={3} />
          <span>Saved Successfully!</span>
        </>
      );
    }
    
    if (saveStatus === 'error') {
      return (
        <>
          <XCircle className="w-5 h-5" strokeWidth={3} />
          <span>Save Failed</span>
        </>
      );
    }
    
    return (
      <>
        <Database className="w-5 h-5" strokeWidth={3} />
        <span>Save to Database</span>
      </>
    );
  };

  const getButtonClass = () => {
    const baseClass = 'w-full border-4 border-poe-black rounded-xl px-4 py-4 text-lg font-black flex items-center justify-center gap-2 transition-cartoon hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#000000] active:translate-y-0 active:shadow-none ';
    
    if (disabled || isSaving) {
      return baseClass + 'bg-gray-400 text-gray-700 cursor-not-allowed opacity-50';
    }
    
    if (saveStatus === 'success') {
      return baseClass + 'bg-poe-green text-poe-black';
    }
    
    if (saveStatus === 'error') {
      return baseClass + 'bg-poe-pink text-poe-black';
    }
    
    return baseClass + 'bg-poe-black text-white';
  };

  return (
    <button
      onClick={handleSave}
      disabled={disabled || isSaving}
      className={getButtonClass()}
      title="Save validated translation to database"
    >
      {getButtonContent()}
    </button>
  );
}
