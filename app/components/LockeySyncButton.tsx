'use client';

import { useState, useEffect } from 'react';
import { Loader2, Database, CheckCircle, AlertCircle, RefreshCw, ChevronDown } from 'lucide-react';
import Button from './Button';
import LanguageFlag from './LanguageFlag';
import type { DatabaseConnectionConfig } from '../types/database-connection';
import type { POEditorLanguage } from '../types';

interface LockeySyncButtonProps {
  connectionConfig: DatabaseConnectionConfig;
  projectId?: string;
  projectName?: string;
}

interface POEditorProject {
  id: string;
  name: string;
  public: number;
  open: number;
  created: string;
}

export default function LockeySyncButton({ 
  connectionConfig,
  projectId,
  projectName 
}: LockeySyncButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isLoadingLanguages, setIsLoadingLanguages] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; details?: any } | null>(null);
  
  // Projects list
  const [projects, setProjects] = useState<POEditorProject[]>([]);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  
  // Languages list
  const [languages, setLanguages] = useState<POEditorLanguage[]>([]);
  const [showLang1Dropdown, setShowLang1Dropdown] = useState(false);
  const [showLang2Dropdown, setShowLang2Dropdown] = useState(false);
  
  // Form state
  const [selectedProjectId, setSelectedProjectId] = useState(projectId || '');
  const [selectedProjectName, setSelectedProjectName] = useState(projectName || '');
  const [language1, setLanguage1] = useState<POEditorLanguage | null>(null);
  const [language2, setLanguage2] = useState<POEditorLanguage | null>(null);
  const [cleaningMode, setCleaningMode] = useState<'none' | 'basic' | 'aggressive'>('basic');

  // Fetch projects when component opens (if no projectId provided)
  useEffect(() => {
    if (isOpen && !projectId && projects.length === 0) {
      fetchProjects();
    }
  }, [isOpen, projectId]);

  // Fetch languages when project is selected
  useEffect(() => {
    if (selectedProjectId && isOpen) {
      fetchLanguages(selectedProjectId);
    }
  }, [selectedProjectId, isOpen]);

  const fetchProjects = async () => {
    try {
      setIsLoadingProjects(true);
      console.log('🔍 Fetching POEditor projects...');
      
      const response = await fetch('/api/poeditor/projects');
      const data = await response.json();
      
      console.log('📦 Projects response:', data);
      
      // Check if API returned an error
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Check POEditor response status
      if (data.response?.status === 'success') {
        // POEditor returns projects in result.projects, not response.list
        const projectsList = data.result?.projects || data.response?.list || [];
        setProjects(projectsList);
        console.log('✅ Loaded', projectsList.length, 'projects');
      } else if (data.response?.status === 'fail') {
        const errorMsg = data.response?.message || data.response?.code || 'POEditor API error';
        throw new Error(errorMsg);
      } else {
        console.error('Unexpected response structure:', data);
        throw new Error('Invalid response format from POEditor');
      }
    } catch (err) {
      console.error('❌ Error fetching projects:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setResult({
        success: false,
        message: `Failed to load POEditor projects: ${errorMessage}. Please check your API token in .env.local`
      });
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const fetchLanguages = async (projId: string) => {
    try {
      setIsLoadingLanguages(true);
      console.log('🔍 Fetching languages for project:', projId);
      
      const response = await fetch('/api/poeditor/languages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectId: projId }),
      });

      const data = await response.json();
      console.log('🌍 Languages response:', data);
      
      // Check if API returned an error
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Check POEditor response status
      if (data.response?.status === 'success' && data.result?.languages) {
        setLanguages(data.result.languages);
        console.log('✅ Loaded', data.result.languages.length, 'languages');
      } else if (data.response?.status === 'fail') {
        throw new Error(data.response?.message || 'POEditor API error');
      } else {
        throw new Error('Invalid response format from POEditor');
      }
    } catch (err) {
      console.error('❌ Error fetching languages:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setResult({
        success: false,
        message: `Failed to load project languages: ${errorMessage}`
      });
    } finally {
      setIsLoadingLanguages(false);
    }
  };

  const selectProject = (project: POEditorProject) => {
    setSelectedProjectId(project.id);
    setSelectedProjectName(project.name);
    setShowProjectDropdown(false);
    // Reset languages when project changes
    setLanguage1(null);
    setLanguage2(null);
    setLanguages([]);
  };

  const selectLanguage1 = (lang: POEditorLanguage) => {
    setLanguage1(lang);
    setShowLang1Dropdown(false);
  };

  const selectLanguage2 = (lang: POEditorLanguage) => {
    setLanguage2(lang);
    setShowLang2Dropdown(false);
  };

  const handleSync = async () => {
    if (!selectedProjectId || !language1 || !language2) {
      setResult({
        success: false,
        message: 'Please fill in all required fields'
      });
      return;
    }

    if (language1.code === language2.code) {
      setResult({
        success: false,
        message: 'Please select two different languages'
      });
      return;
    }

    try {
      setIsSyncing(true);
      setResult(null);

      console.log('🚀 Starting Lockey sync...');
      console.log('📦 Project:', selectedProjectId, selectedProjectName);
      console.log('🌍 Languages:', language1.code, language2.code);
      console.log('🧹 Cleaning mode:', cleaningMode);
      console.log('🔧 Database:', connectionConfig.type);

      // Call API to sync Lockey
      const response = await fetch('/api/database/sync-lockey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          connectionConfig: {
            ...connectionConfig,
            projectName: selectedProjectName,
          },
          projectId: selectedProjectId,
          language1: language1.code,
          language2: language2.code,
          cleaningMode,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('✅ Sync successful:', data);
        setResult({
          success: true,
          message: data.message || 'Lockey synced successfully!',
          details: data.details
        });
      } else {
        console.error('❌ Sync failed:', data);
        setResult({
          success: false,
          message: data.error || 'Failed to sync Lockey'
        });
      }
    } catch (err) {
      console.error('Sync error:', err);
      setResult({
        success: false,
        message: err instanceof Error ? err.message : 'Network error occurred'
      });
    } finally {
      setIsSyncing(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        variant="blue"
        size="md"
        onClick={() => setIsOpen(true)}
      >
        <RefreshCw className="w-5 h-5" strokeWidth={3} />
        Sync Lockey to DB
      </Button>
    );
  }

  return (
    <div className="bg-poe-blue border-4 border-poe-black rounded-3xl cartoon-shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white border-4 border-poe-black rounded-xl flex items-center justify-center">
            <Database className="w-5 h-5" strokeWidth={3} />
          </div>
          <h3 className="text-2xl font-black text-white">Sync Lockey to Database</h3>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="w-8 h-8 bg-white border-4 border-poe-black rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors"
        >
          <span className="text-xl font-black">×</span>
        </button>
      </div>

      <p className="text-white font-bold mb-6">
        Download Lockey from POEditor (dual language + cleaning) and automatically insert into your database.
      </p>

      {/* Form */}
      <div className="space-y-4">
        {/* Project Selector */}
        {!projectId && (
          <div>
            <label className="block text-sm font-black text-white mb-2">
              POEditor Project *
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowProjectDropdown(!showProjectDropdown)}
                disabled={isLoadingProjects}
                className="w-full px-4 py-3 border-4 border-poe-black rounded-xl font-bold text-base bg-white text-left flex items-center justify-between hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <span className={selectedProjectName ? 'text-black' : 'text-gray-400'}>
                  {isLoadingProjects ? 'Loading projects...' : (selectedProjectName || 'Select a project')}
                </span>
                <ChevronDown className={`w-5 h-5 transition-transform ${showProjectDropdown ? 'rotate-180' : ''}`} strokeWidth={3} />
              </button>

              {showProjectDropdown && projects.length > 0 && (
                <div className="absolute z-10 w-full mt-2 bg-white border-4 border-poe-black rounded-xl cartoon-shadow max-h-60 overflow-y-auto">
                  {projects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => selectProject(project)}
                      className="w-full px-4 py-3 text-left font-bold hover:bg-poe-yellow transition-colors border-b-2 border-gray-200 last:border-b-0"
                    >
                      <div className="font-black">{project.name}</div>
                      <div className="text-xs text-gray-600">ID: {project.id}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {projects.length === 0 && !isLoadingProjects && (
              <p className="mt-2 text-sm font-bold text-white opacity-75">
                No projects found. Please check your POEditor API token in .env.local
              </p>
            )}
          </div>
        )}

        {/* Project ID (if passed as prop or selected) */}
        {(projectId || selectedProjectId) && (
          <div>
            <label className="block text-sm font-black text-white mb-2">
              Selected Project
            </label>
            <div className="px-4 py-3 border-4 border-poe-black rounded-xl font-bold text-base bg-white bg-opacity-90">
              <div className="font-black">{selectedProjectName || projectName}</div>
              <div className="text-xs text-gray-600">ID: {selectedProjectId || projectId}</div>
            </div>
          </div>
        )}

        {/* Language 1 Selector */}
        {(selectedProjectId || projectId) && (
          <div>
            <label className="block text-sm font-black text-white mb-2">
              Language 1 *
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowLang1Dropdown(!showLang1Dropdown)}
                disabled={isLoadingLanguages || languages.length === 0}
                className="w-full px-4 py-3 border-4 border-poe-black rounded-xl font-bold text-base bg-white text-left flex items-center justify-between hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {language1 ? (
                  <div className="flex items-center gap-2">
                    <LanguageFlag languageCode={language1.code} size="sm" />
                    <span>{language1.name}</span>
                    <span className="text-xs text-gray-600">({language1.code})</span>
                  </div>
                ) : (
                  <span className="text-gray-400">
                    {isLoadingLanguages ? 'Loading languages...' : 'Select first language'}
                  </span>
                )}
                <ChevronDown className={`w-5 h-5 transition-transform ${showLang1Dropdown ? 'rotate-180' : ''}`} strokeWidth={3} />
              </button>

              {showLang1Dropdown && languages.length > 0 && (
                <div className="absolute z-10 w-full mt-2 bg-white border-4 border-poe-black rounded-xl cartoon-shadow max-h-60 overflow-y-auto">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => selectLanguage1(lang)}
                      disabled={language2?.code === lang.code}
                      className="w-full px-4 py-3 text-left font-bold hover:bg-poe-yellow transition-colors border-b-2 border-gray-200 last:border-b-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <LanguageFlag languageCode={lang.code} size="sm" />
                      <span>{lang.name}</span>
                      <span className="text-xs text-gray-600">({lang.code})</span>
                      {language2?.code === lang.code && (
                        <span className="ml-auto text-xs text-red-600 font-black">Already selected</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Language 2 Selector */}
        {(selectedProjectId || projectId) && (
          <div>
            <label className="block text-sm font-black text-white mb-2">
              Language 2 *
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowLang2Dropdown(!showLang2Dropdown)}
                disabled={isLoadingLanguages || languages.length === 0}
                className="w-full px-4 py-3 border-4 border-poe-black rounded-xl font-bold text-base bg-white text-left flex items-center justify-between hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {language2 ? (
                  <div className="flex items-center gap-2">
                    <LanguageFlag languageCode={language2.code} size="sm" />
                    <span>{language2.name}</span>
                    <span className="text-xs text-gray-600">({language2.code})</span>
                  </div>
                ) : (
                  <span className="text-gray-400">
                    {isLoadingLanguages ? 'Loading languages...' : 'Select second language'}
                  </span>
                )}
                <ChevronDown className={`w-5 h-5 transition-transform ${showLang2Dropdown ? 'rotate-180' : ''}`} strokeWidth={3} />
              </button>

              {showLang2Dropdown && languages.length > 0 && (
                <div className="absolute z-10 w-full mt-2 bg-white border-4 border-poe-black rounded-xl cartoon-shadow max-h-60 overflow-y-auto">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => selectLanguage2(lang)}
                      disabled={language1?.code === lang.code}
                      className="w-full px-4 py-3 text-left font-bold hover:bg-poe-yellow transition-colors border-b-2 border-gray-200 last:border-b-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <LanguageFlag languageCode={lang.code} size="sm" />
                      <span>{lang.name}</span>
                      <span className="text-xs text-gray-600">({lang.code})</span>
                      {language1?.code === lang.code && (
                        <span className="ml-auto text-xs text-red-600 font-black">Already selected</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cleaning Mode Selector */}
        {(selectedProjectId || projectId) && (
          <div>
            <label className="block text-sm font-black text-white mb-2">
              String Cleaning Mode
            </label>
            <div className="space-y-2">
              {/* None Option */}
              <button
                type="button"
                onClick={() => setCleaningMode('none')}
                className={`w-full border-4 border-poe-black rounded-xl px-4 py-3 text-sm font-bold flex items-center gap-3 transition-colors ${
                  cleaningMode === 'none' 
                    ? 'bg-poe-blue text-white' 
                    : 'bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex-1 text-left">
                  <div className="font-black">No Cleaning</div>
                  <div className="text-xs opacity-80">Keep original strings as-is</div>
                </div>
                {cleaningMode === 'none' && <span className="text-lg">✓</span>}
              </button>

              {/* Basic Option */}
              <button
                type="button"
                onClick={() => setCleaningMode('basic')}
                className={`w-full border-4 border-poe-black rounded-xl px-4 py-3 text-sm font-bold flex items-center gap-3 transition-colors ${
                  cleaningMode === 'basic' 
                    ? 'bg-poe-green text-white' 
                    : 'bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex-1 text-left">
                  <div className="font-black">Basic Cleaning</div>
                  <div className="text-xs opacity-80">Remove \\n, \\", multiple spaces</div>
                </div>
                {cleaningMode === 'basic' && <span className="text-lg">✓</span>}
              </button>

              {/* Aggressive Option */}
              <button
                type="button"
                onClick={() => setCleaningMode('aggressive')}
                className={`w-full border-4 border-poe-black rounded-xl px-4 py-3 text-sm font-bold flex items-center gap-3 transition-colors ${
                  cleaningMode === 'aggressive' 
                    ? 'bg-poe-pink text-white' 
                    : 'bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex-1 text-left">
                  <div className="font-black">Aggressive Cleaning</div>
                  <div className="text-xs opacity-80">Remove all HTML tags + basic cleaning</div>
                </div>
                {cleaningMode === 'aggressive' && <span className="text-lg">✓</span>}
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="green"
            size="md"
            onClick={handleSync}
            disabled={isSyncing || !selectedProjectId || !language1 || !language2}
            className="flex-1"
          >
            {isSyncing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" strokeWidth={3} />
                <span>Syncing...</span>
              </>
            ) : (
              <>
                <Database className="w-5 h-5" strokeWidth={3} />
                <span>Sync to Database</span>
              </>
            )}
          </Button>
          <Button
            variant="white"
            size="md"
            onClick={() => setIsOpen(false)}
            disabled={isSyncing}
          >
            Cancel
          </Button>
        </div>
      </div>

      {/* Result Message */}
      {result && (
        <div className={`mt-4 p-4 border-4 border-poe-black rounded-2xl ${
          result.success ? 'bg-poe-green' : 'bg-poe-pink'
        }`}>
          <div className="flex items-start gap-3">
            {result.success ? (
              <CheckCircle className="w-6 h-6 shrink-0 mt-0.5" strokeWidth={3} />
            ) : (
              <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" strokeWidth={3} />
            )}
            <div className="flex-1">
              <p className="font-bold text-base">{result.message}</p>
              {result.details && (
                <div className="mt-2 text-sm font-bold opacity-90 space-y-1">
                  <p>📦 Language Version: {result.details.languageVersion}</p>
                  <p>📊 Terms Count: {result.details.termsCount}</p>
                  <p>💾 File Size: {(result.details.fileSize / 1024).toFixed(2)} KB</p>
                  <p>🌍 Languages: {result.details.languages}</p>
                  {result.details.structure && (
                    <p className="text-xs mt-2 bg-white bg-opacity-20 px-2 py-1 rounded">
                      ✨ {result.details.structure}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-4 bg-white bg-opacity-20 border-4 border-poe-black rounded-2xl p-4">
        <p className="text-sm font-bold text-white mb-2">
          <span className="font-black">💡 How it works:</span>
        </p>
        <ol className="text-sm font-bold text-white space-y-1 list-decimal list-inside">
          <li>Download translations from POEditor</li>
          <li>Apply string cleaning</li>
          <li>Save to database with auto-increment version</li>
        </ol>
      </div>
    </div>
  );
}
