'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import CartoonBackground from '../../components/CartoonBackground';
import Button from '../../components/Button';
import ExportFormatSelector from '../../components/ExportFormatSelector';
import DualLanguageExport from '../../components/DualLanguageExport';
import LanguageFlag from '../../components/LanguageFlag';
import LanguageFlagsStack from '../../components/LanguageFlagsStack';
import CleaningPreviewModal from '../../components/CleaningPreviewModal';
import StoredTranslationsPanel from '../../components/StoredTranslationsPanel';
import SavedTranslationsPanel from '../../components/SavedTranslationsPanel';
import { 
  ArrowLeft, 
  Loader2, 
  Globe, 
  Calendar, 
  FileText,
  TrendingUp,
  Lock,
  Unlock
} from 'lucide-react';
import type { POEditorProjectDetail, POEditorLanguage } from '../../types';
import { saveTranslationToStorage, getTranslationFromStorage } from '../../utils/translationStorage';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<POEditorProjectDetail | null>(null);
  const [languages, setLanguages] = useState<POEditorLanguage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingLang, setDownloadingLang] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Trigger untuk refresh SavedTranslationsPanel
  
  // Preview modal state
  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean;
    languageCode: string;
    languageName: string;
    format: string;
    originalData: Record<string, any> | null;
    cleanedData: Record<string, any> | null;
    cleaningMode?: string;
  }>({
    isOpen: false,
    languageCode: '',
    languageName: '',
    format: 'json',
    originalData: null,
    cleanedData: null,
    cleaningMode: undefined,
  });

  useEffect(() => {
    async function fetchProjectData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch project details
        const projectResponse = await fetch(`/api/poeditor/project/${projectId}`);
        if (!projectResponse.ok) {
          throw new Error('Failed to fetch project');
        }
        const projectData = await projectResponse.json();

        if (projectData.response?.status === 'success') {
          setProject(projectData.result.project);
        } else {
          setError(projectData.error || projectData.response?.message || 'Failed to fetch project');
          return;
        }

        // Fetch languages
        const languagesResponse = await fetch('/api/poeditor/languages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ projectId }),
        });

        if (!languagesResponse.ok) {
          throw new Error('Failed to fetch languages');
        }

        const languagesData = await languagesResponse.json();

        if (languagesData.response?.status === 'success') {
          setLanguages(languagesData.result.languages || []);
        }
      } catch (err) {
        setError('Failed to load project data');
        console.error('Error fetching project data:', err);
      } finally {
        setLoading(false);
      }
    }

    if (projectId) {
      fetchProjectData();
    }
  }, [projectId]);

  const formatDate = (dateString: string, languageCode?: string) => {
    const date = new Date(dateString);
    
    // Map language code to locale
    const getLocale = (langCode?: string): string => {
      if (!langCode) return 'en-US';
      
      const localeMap: Record<string, string> = {
        'en': 'en-US',
        'en-us': 'en-US',
        'en-gb': 'en-GB',
        'id': 'id-ID',
        'ms': 'ms-MY',
        'ja': 'ja-JP',
        'ko': 'ko-KR',
        'zh': 'zh-CN',
        'zh-cn': 'zh-CN',
        'zh-tw': 'zh-TW',
        'es': 'es-ES',
        'fr': 'fr-FR',
        'de': 'de-DE',
        'it': 'it-IT',
        'pt': 'pt-PT',
        'pt-br': 'pt-BR',
        'ru': 'ru-RU',
        'ar': 'ar-SA',
        'hi': 'hi-IN',
        'th': 'th-TH',
        'vi': 'vi-VN',
        'nl': 'nl-NL',
        'pl': 'pl-PL',
        'tr': 'tr-TR',
        'sv': 'sv-SE',
        'no': 'no-NO',
        'da': 'da-DK',
        'fi': 'fi-FI',
        'el': 'el-GR',
        'cs': 'cs-CZ',
        'hu': 'hu-HU',
        'ro': 'ro-RO',
        'uk': 'uk-UA',
        'he': 'he-IL',
        'fa': 'fa-IR',
        'bn': 'bn-BD',
        'ur': 'ur-PK',
        'ta': 'ta-IN',
        'te': 'te-IN',
      };
      
      return localeMap[langCode.toLowerCase()] || 'en-US';
    };
    
    const locale = getLocale(languageCode);
    
    return date.toLocaleDateString(locale, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getColorForIndex = (index: number): string => {
    const colors = ['bg-poe-yellow', 'bg-poe-blue', 'bg-poe-pink', 'bg-poe-green'];
    return colors[index % colors.length];
  };

  const handleDownload = async (languageCode: string, format: string = 'json') => {
    try {
      setDownloadingLang(languageCode);

      // Request export from API (API route akan download dari POEditor)
      const response = await fetch('/api/poeditor/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          languageCode,
          type: format,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to export translations');
      }

      const data = await response.json();

      if (data.response?.status === 'success') {
        // Simpan original data ke localStorage jika ada
        if (data.originalData) {
          saveTranslationToStorage(projectId, languageCode, format, data.originalData);
          console.log('Original file saved to localStorage');
        }

        // Check if we have cleaned data and format is JSON
        if (data.cleanedData && data.originalData && format === 'json') {
          // Find language name
          const language = languages.find(l => l.code === languageCode);
          
          // Show preview modal
          setPreviewModal({
            isOpen: true,
            languageCode,
            languageName: language?.name || languageCode,
            format,
            originalData: data.originalData,
            cleanedData: data.cleanedData,
            cleaningMode: data.cleaningMode || 'basic',
          });
        } else if (data.cleanedData && format === 'json') {
          // Direct download for JSON without preview (fallback)
          downloadJsonFile(data.cleanedData, languageCode);
        } else if (data.result?.url) {
          // Download the file from the URL for other formats
          downloadFromUrl(data.result.url, languageCode, format);
        } else {
          throw new Error('No download URL available');
        }
      } else {
        throw new Error(data.error || 'Export failed');
      }
    } catch (err) {
      console.error('Error downloading translations:', err);
      alert('Failed to download translations. Please try again.');
      setDownloadingLang(null);
    }
  };

  const downloadJsonFile = (data: Record<string, any>, languageCode: string) => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project?.name || 'translations'}_${languageCode}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const downloadFromUrl = (downloadUrl: string, languageCode: string, format: string) => {
    // Get file extension based on format
    const extension = format === 'android_strings' ? 'xml' : 
                     format === 'apple_strings' ? 'strings' :
                     format === 'key_value_json' ? 'json' : format;
    
    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${project?.name || 'translations'}_${languageCode}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleConfirmDownload = () => {
    if (previewModal.cleanedData) {
      downloadJsonFile(previewModal.cleanedData, previewModal.languageCode);
      setPreviewModal({
        isOpen: false,
        languageCode: '',
        languageName: '',
        format: 'json',
        originalData: null,
        cleanedData: null,
        cleaningMode: undefined,
      });
      setDownloadingLang(null);
    }
  };

  const handleClosePreview = () => {
    setPreviewModal({
      isOpen: false,
      languageCode: '',
      languageName: '',
      format: 'json',
      originalData: null,
      cleanedData: null,
      cleaningMode: undefined,
    });
    setDownloadingLang(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <CartoonBackground />
        <Navbar />
        <main className="pt-32 pb-16 sm:pb-24">
          <div className="w-full max-w-6xl mx-auto px-6">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-poe-blue border-4 border-poe-black rounded-3xl cartoon-shadow mx-auto flex items-center justify-center animate-bounce">
                  <Loader2 className="w-10 h-10 animate-spin" strokeWidth={3} />
                </div>
                <p className="text-xl font-black">Loading project details...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <CartoonBackground />
        <Navbar />
        <main className="pt-32 pb-16 sm:pb-24">
          <div className="w-full max-w-6xl mx-auto px-6">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="bg-poe-pink border-4 border-poe-black rounded-3xl cartoon-shadow p-8 max-w-md text-center">
                <h3 className="text-2xl font-black mb-3">Oops!</h3>
                <p className="text-lg font-bold mb-4">{error || 'Project not found'}</p>
                <Button variant="blue" size="md" onClick={() => router.push('/dashboard')}>
                  <ArrowLeft className="w-5 h-5" strokeWidth={3} />
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <CartoonBackground />
      <Navbar />
      
      <main className="pt-32 pb-16 sm:pb-24">
        <div className="w-full max-w-6xl mx-auto px-6">
          
          {/* Back Button */}
          <div className="mb-8">
            <Button variant="white" size="md" onClick={() => router.push('/dashboard')}>
              <ArrowLeft className="w-5 h-5" strokeWidth={3} />
              Back to Dashboard
            </Button>
          </div>

          {/* Project Header */}
          <div className="bg-poe-yellow border-4 border-poe-black rounded-3xl cartoon-shadow p-8 sm:p-10 mb-8">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
              <div className="flex-1">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-4">
                  {project.name}
                </h1>
                {project.description && (
                  <p className="text-lg sm:text-xl font-bold text-gray-800 mb-4">
                    {project.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-3">
                  <div className="bg-white border-4 border-poe-black rounded-xl px-4 py-2 text-sm font-black flex items-center gap-2">
                    {project.public === 1 ? (
                      <>
                        <Unlock className="w-4 h-4" strokeWidth={3} />
                        Public
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" strokeWidth={3} />
                        Private
                      </>
                    )}
                  </div>
                  <div className="bg-white border-4 border-poe-black rounded-xl px-4 py-2 text-sm font-black flex items-center gap-2">
                    <FileText className="w-4 h-4" strokeWidth={3} />
                    {project.terms} Terms
                  </div>
                  <div className="bg-white border-4 border-poe-black rounded-xl px-4 py-2 text-sm font-black flex items-center gap-2">
                    <Calendar className="w-4 h-4" strokeWidth={3} />
                    {formatDate(project.created)}
                  </div>
                  
                  {/* Languages Flags Stack */}
                  {languages.length > 0 && (
                    <div className="bg-white border-4 border-poe-black rounded-xl px-4 py-2 flex items-center gap-2">
                      <LanguageFlagsStack 
                        languageCodes={languages.map(l => l.code)} 
                        maxDisplay={4}
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="w-24 h-24 bg-white border-4 border-poe-black rounded-3xl cartoon-shadow flex items-center justify-center shrink-0">
                <Globe className="w-12 h-12" strokeWidth={3} />
              </div>
            </div>
          </div>

          {/* Dual Language Export Section */}
          {languages.length >= 2 && (
            <div className="mb-8">
              <DualLanguageExport 
                languages={languages}
                projectId={projectId}
                projectName={project.name}
                onSaveSuccess={() => {
                  // Trigger refresh SavedTranslationsPanel
                  setRefreshTrigger(prev => prev + 1);
                }}
              />
            </div>
          )}

          {/* Stored Translations Panel */}
          <div className="mb-8">
            <StoredTranslationsPanel 
              projectId={projectId}
              projectName={project.name}
            />
          </div>

          {/* Saved Translations Panel (Database) */}
          <div className="mb-8">
            <SavedTranslationsPanel 
              key={refreshTrigger} // Force re-render when refreshTrigger changes
              projectId={projectId}
              onLoadTranslation={(translation) => {
                // Load translation back to preview
                console.log('Loading translation from database:', translation);
                // You can show a modal or directly download
                if (translation.languagePack) {
                  downloadJsonFile(translation.languagePack, translation.languageCode);
                }
              }}
            />
          </div>

          {/* Languages Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl sm:text-4xl font-black">
                Languages <span className="text-poe-blue">({languages.length})</span>
              </h2>
            </div>

            {languages.length === 0 ? (
              <div className="bg-poe-pink border-4 border-poe-black rounded-3xl cartoon-shadow p-12 text-center">
                <h3 className="text-2xl font-black mb-3">No Languages Yet!</h3>
                <p className="text-lg font-bold">Add languages to start translating</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {languages.map((language, index) => (
                  <div
                    key={language.code}
                    className={`
                      ${getColorForIndex(index)}
                      border-4 border-poe-black rounded-3xl cartoon-shadow 
                      p-6 
                      transition-cartoon 
                      hover:-translate-y-1 hover:shadow-[7px_7px_0px_0px_#000000]
                    `}
                  >
                    {/* Language Header */}
                    <div className="flex items-start gap-3 mb-5">
                      {/* Flag */}
                      <LanguageFlag languageCode={language.code} size="md" />
                      
                      {/* Language Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-2xl font-black leading-tight mb-1">
                          {language.name}
                        </h3>
                        <p className="text-sm font-bold uppercase tracking-wide opacity-80">
                          {language.code}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wide">Progress</span>
                        <span className="text-lg font-black">{language.percentage.toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-7 bg-white border-4 border-poe-black rounded-full overflow-hidden">
                        <div
                          className="h-full bg-poe-black transition-all duration-500 ease-out flex items-center justify-end pr-2"
                          style={{ width: `${language.percentage}%` }}
                        >
                          {language.percentage > 20 && (
                            <TrendingUp className="w-4 h-4 text-white" strokeWidth={3} />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="space-y-2">
                      <div className="bg-white border-4 border-poe-black rounded-xl px-3 py-2 text-sm font-black">
                        {language.translations} / {project.terms} translated
                      </div>
                      <div className="bg-white border-4 border-poe-black rounded-xl px-3 py-2 text-xs font-bold flex items-center gap-2">
                        <Calendar className="w-3 h-3" strokeWidth={3} />
                        Updated: {formatDate(language.updated, language.code)}
                      </div>
                      
                      {/* Download Button with Format Selector */}
                      <ExportFormatSelector
                        languageCode={language.code}
                        languageName={language.name}
                        onDownload={handleDownload}
                        isDownloading={downloadingLang === language.code}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Cleaning Preview Modal */}
      {previewModal.isOpen && previewModal.originalData && previewModal.cleanedData && (
        <CleaningPreviewModal
          isOpen={previewModal.isOpen}
          onClose={handleClosePreview}
          onConfirmDownload={handleConfirmDownload}
          originalData={previewModal.originalData}
          cleanedData={previewModal.cleanedData}
          languageName={previewModal.languageName}
          languageCode={previewModal.languageCode}
          isDownloading={downloadingLang === previewModal.languageCode}
          projectId={projectId}
          projectName={project?.name}
          exportFormat={previewModal.format}
          cleaningMode={previewModal.cleaningMode}
          onSaveSuccess={() => {
            // Trigger refresh SavedTranslationsPanel
            setRefreshTrigger(prev => prev + 1);
          }}
        />
      )}
    </div>
  );
}
