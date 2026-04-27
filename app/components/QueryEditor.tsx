'use client';

import { useState } from 'react';
import Button from './Button';
import { 
  Play, 
  Loader2, 
  Download, 
  Upload, 
  Trash2, 
  Database,
  FileJson,
  AlertCircle,
  CheckCircle,
  LogOut,
  Table,
  FileText,
  Clock,
  Filter,
  RefreshCw
} from 'lucide-react';
import type { OracleConnectionConfig } from './OracleConnectionForm';

interface QueryEditorProps {
  connectionConfig: OracleConnectionConfig;
  onDisconnect: () => void;
}

interface QueryResult {
  columns: string[];
  rows: any[][];
  rowCount: number;
  executionTime: number;
}

export default function QueryEditor({ connectionConfig, onDisconnect }: QueryEditorProps) {
  const [query, setQuery] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [queryHistory, setQueryHistory] = useState<Array<{query: string, timestamp: Date, status: 'success' | 'error'}>>([]);

  // Sample queries for quick access
  const sampleQueries = {
    createTable: `CREATE TABLE lockey_translations (
  id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  project_id VARCHAR2(100) NOT NULL,
  project_name VARCHAR2(255),
  language_code VARCHAR2(10) NOT NULL,
  language_name VARCHAR2(100),
  translation_key VARCHAR2(500) NOT NULL,
  translation_value CLOB,
  export_format VARCHAR2(50),
  cleaning_mode VARCHAR2(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`,
    selectAll: 'SELECT * FROM lockey_translations ORDER BY created_at DESC',
    selectByProject: "SELECT * FROM lockey_translations WHERE project_id = 'YOUR_PROJECT_ID'",
    selectByLanguage: "SELECT * FROM lockey_translations WHERE language_code = 'en'",
    deleteByProject: "DELETE FROM lockey_translations WHERE project_id = 'YOUR_PROJECT_ID'",
    insertLanguageContent: `INSERT INTO MAV_CONTENT.LANGUAGE_CONTENT_DATA (LANGUAGE_VERSION,LANGUAGE_PACK,VERSION,UPDATED_BY,UPDATED_TIME,CREATED_BY,CREATED_TIME) VALUES ((SELECT NVL(MAX(LANGUAGE_VERSION), 0) + 1 FROM MAV_CONTENT.LANGUAGE_CONTENT_DATA),EMPTY_BLOB(),1,'SYSTEM',SYSDATE,'SYSTEM',SYSDATE)`,
    updateAppData: `UPDATE MAV_CONTENT.APPLICATION_DATA SET LANGUAGE_PACK_VERSION = (SELECT NVL(MAX(LANGUAGE_VERSION ), 0) FROM MAV_CONTENT.LANGUAGE_CONTENT_DATA)`,
  };

  const handleExecuteQuery = async () => {
    if (!query.trim()) {
      setError('Please enter a query');
      return;
    }

    setIsExecuting(true);
    setError(null);
    setSuccessMessage(null);
    setQueryResult(null);

    try {
      const response = await fetch('/api/oracle/execute-query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...connectionConfig,
          query: query.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        if (data.result) {
          setQueryResult(data.result);
          setSuccessMessage(`Query executed successfully in ${data.result.executionTime}ms`);
          
          // Add to history
          setQueryHistory(prev => [{
            query: query.trim(),
            timestamp: new Date(),
            status: 'success'
          }, ...prev.slice(0, 9)]); // Keep last 10
        } else {
          setSuccessMessage(data.message || 'Query executed successfully');
          
          // Add to history
          setQueryHistory(prev => [{
            query: query.trim(),
            timestamp: new Date(),
            status: 'success'
          }, ...prev.slice(0, 9)]);
        }
      } else {
        setError(data.error || 'Failed to execute query');
        
        // Add to history
        setQueryHistory(prev => [{
          query: query.trim(),
          timestamp: new Date(),
          status: 'error'
        }, ...prev.slice(0, 9)]);
      }
    } catch (err) {
      console.error('Query execution error:', err);
      setError('Network error. Please check your connection and try again.');
      
      // Add to history
      setQueryHistory(prev => [{
        query: query.trim(),
        timestamp: new Date(),
        status: 'error'
      }, ...prev.slice(0, 9)]);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        setSelectedFile(file);
        setError(null);
      } else {
        setError('Please select a valid JSON file');
        e.target.value = '';
      }
    }
  };

  const handleImportJson = async () => {
    if (!selectedFile) {
      setError('Please select a JSON file first');
      return;
    }

    setIsExecuting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Read file content
      const fileContent = await selectedFile.text();
      const jsonData = JSON.parse(fileContent);

      // Send to API for import
      const response = await fetch('/api/oracle/import-json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...connectionConfig,
          jsonData,
          fileName: selectedFile.name,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccessMessage(`Successfully imported ${data.recordsInserted} records from ${selectedFile.name}`);
        setSelectedFile(null);
        // Clear file input
        const fileInput = document.getElementById('json-file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        setError(data.error || 'Failed to import JSON file');
      }
    } catch (err) {
      console.error('Import error:', err);
      setError('Failed to parse or import JSON file. Please check the file format.');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleExportResults = () => {
    if (!queryResult || queryResult.rows.length === 0) {
      setError('No results to export');
      return;
    }

    // Convert results to JSON
    const exportData = queryResult.rows.map(row => {
      const obj: any = {};
      queryResult.columns.forEach((col, idx) => {
        obj[col] = row[idx];
      });
      return obj;
    });

    // Create and download file
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `query_results_${new Date().getTime()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    setSuccessMessage('Results exported successfully');
  };

  const insertSampleQuery = (queryType: keyof typeof sampleQueries) => {
    setQuery(sampleQueries[queryType]);
  };

  return (
    <div className="space-y-6">
      {/* Connection Info & Actions */}
      <div className="bg-white border-4 border-poe-black rounded-3xl cartoon-shadow p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-black mb-2">Connected to Oracle Database</h3>
            <div className="space-y-1 text-sm font-bold">
              <p><span className="font-black">Host:</span> {connectionConfig.host}:{connectionConfig.port}</p>
              <p><span className="font-black">Service:</span> {connectionConfig.serviceName}</p>
              <p><span className="font-black">User:</span> {connectionConfig.username}</p>
            </div>
          </div>
          <Button variant="pink" size="md" onClick={onDisconnect}>
            <LogOut className="w-5 h-5" strokeWidth={3} />
            Disconnect
          </Button>
        </div>
      </div>

      {/* Sample Queries */}
      <div className="bg-poe-yellow border-4 border-poe-black rounded-3xl cartoon-shadow p-6">
        <h3 className="text-xl font-black mb-4">Quick Queries</h3>
        <div className="flex flex-wrap gap-2">
          <Button variant="white" size="sm" onClick={() => insertSampleQuery('createTable')}>
            Create Table
          </Button>
          <Button variant="white" size="sm" onClick={() => insertSampleQuery('selectAll')}>
            Select All
          </Button>
          <Button variant="white" size="sm" onClick={() => insertSampleQuery('selectByProject')}>
            By Project
          </Button>
          <Button variant="white" size="sm" onClick={() => insertSampleQuery('selectByLanguage')}>
            By Language
          </Button>
          <Button variant="white" size="sm" onClick={() => insertSampleQuery('deleteByProject')}>
            Delete Project
          </Button>
          <Button variant="blue" size="sm" onClick={() => insertSampleQuery('insertLanguageContent')}>
            Insert Language Content
          </Button>
          <Button variant="green" size="sm" onClick={() => insertSampleQuery('updateAppData')}>
            Update App Data
          </Button>
        </div>
      </div>

      {/* Query Editor */}
      <div className="bg-white border-4 border-poe-black rounded-3xl cartoon-shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-black">SQL Query Editor</h3>
          <div className="flex gap-2">
            <Button
              variant="green"
              size="md"
              onClick={handleExecuteQuery}
              disabled={isExecuting || !query.trim()}
            >
              {isExecuting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" strokeWidth={3} />
                  <span>Executing...</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" strokeWidth={3} />
                  <span>Execute</span>
                </>
              )}
            </Button>
            <Button
              variant="white"
              size="md"
              onClick={() => {
                setQuery('');
                setQueryResult(null);
                setError(null);
                setSuccessMessage(null);
              }}
            >
              <Trash2 className="w-5 h-5" strokeWidth={3} />
              Clear
            </Button>
          </div>
        </div>

        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter your SQL query here...&#10;&#10;Example:&#10;SELECT * FROM lockey_translations WHERE language_code = 'en'"
          className="w-full h-64 px-4 py-3 border-4 border-poe-black rounded-xl font-mono text-sm focus:outline-none focus:ring-4 focus:ring-poe-blue focus:ring-opacity-50 transition-all resize-none"
        />

        {/* Status Messages */}
        {error && (
          <div className="mt-4 bg-poe-pink border-4 border-poe-black rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" strokeWidth={3} />
            <p className="font-bold text-base">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="mt-4 bg-poe-green border-4 border-poe-black rounded-2xl p-4 flex items-start gap-3">
            <CheckCircle className="w-6 h-6 shrink-0 mt-0.5" strokeWidth={3} />
            <p className="font-bold text-base">{successMessage}</p>
          </div>
        )}

        {/* Query History */}
        {queryHistory.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-black uppercase tracking-wide mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" strokeWidth={3} />
              Recent Queries
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {queryHistory.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setQuery(item.query)}
                  className={`
                    w-full text-left px-3 py-2 rounded-lg border-2 border-poe-black
                    text-xs font-mono hover:bg-gray-50 transition-colors
                    ${item.status === 'success' ? 'bg-green-50' : 'bg-red-50'}
                  `}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-bold ${item.status === 'success' ? 'text-green-700' : 'text-red-700'}`}>
                      {item.status === 'success' ? '✓' : '✗'} {item.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="truncate text-gray-700">
                    {item.query}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Query Results Section - Separate */}
      {queryResult && queryResult.rows.length > 0 && (
        <div className="bg-white border-4 border-poe-black rounded-3xl cartoon-shadow p-6">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-2xl font-black flex items-center gap-2">
                <Table className="w-7 h-7" strokeWidth={3} />
                Query Results
              </h3>
              <div className="flex items-center gap-4 mt-2 text-sm font-bold text-gray-600">
                <span className="flex items-center gap-1">
                  <Database className="w-4 h-4" strokeWidth={3} />
                  {queryResult.rowCount} row{queryResult.rowCount !== 1 ? 's' : ''}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" strokeWidth={3} />
                  {queryResult.executionTime}ms
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="w-4 h-4" strokeWidth={3} />
                  {queryResult.columns.length} column{queryResult.columns.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="white" 
                size="md" 
                onClick={() => {
                  setQueryResult(null);
                  setSearchFilter('');
                }}
              >
                <Trash2 className="w-5 h-5" strokeWidth={3} />
                Clear Results
              </Button>
              <Button variant="green" size="md" onClick={handleExportResults}>
                <Download className="w-5 h-5" strokeWidth={3} />
                Export JSON
              </Button>
            </div>
          </div>

          {/* Search Filter */}
          <div className="mb-4">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" strokeWidth={3} />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filter results..."
                className="w-full pl-12 pr-4 py-3 border-4 border-poe-black rounded-xl font-bold text-base focus:outline-none focus:ring-4 focus:ring-poe-blue focus:ring-opacity-50 transition-all"
              />
              {searchFilter && (
                <button
                  onClick={() => setSearchFilter('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <Trash2 className="w-5 h-5" strokeWidth={3} />
                </button>
              )}
            </div>
          </div>

          {/* Results Table */}
          <div className="overflow-x-auto border-4 border-poe-black rounded-xl">
            <table className="w-full">
              <thead>
                <tr className="bg-poe-blue text-white">
                  <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wide border-r-4 border-poe-black">
                    #
                  </th>
                  {queryResult.columns.map((col, idx) => (
                    <th
                      key={idx}
                      className="px-4 py-3 text-left text-xs font-black uppercase tracking-wide border-r-4 border-poe-black last:border-r-0"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {queryResult.rows
                  .filter(row => {
                    if (!searchFilter) return true;
                    return row.some(cell => 
                      String(cell).toLowerCase().includes(searchFilter.toLowerCase())
                    );
                  })
                  .map((row, rowIdx) => (
                    <tr
                      key={rowIdx}
                      className={`border-t-4 border-poe-black ${
                        rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      } hover:bg-blue-50 transition-colors`}
                    >
                      <td className="px-4 py-3 text-sm font-black text-gray-500 border-r-4 border-poe-black">
                        {rowIdx + 1}
                      </td>
                      {row.map((cell, cellIdx) => (
                        <td
                          key={cellIdx}
                          className="px-4 py-3 text-sm font-bold border-r-4 border-poe-black last:border-r-0"
                        >
                          {cell === null ? (
                            <span className="text-gray-400 italic">NULL</span>
                          ) : typeof cell === 'object' ? (
                            <pre className="text-xs overflow-x-auto max-w-md">
                              {JSON.stringify(cell, null, 2)}
                            </pre>
                          ) : (
                            <span className={searchFilter && String(cell).toLowerCase().includes(searchFilter.toLowerCase()) ? 'bg-yellow-200' : ''}>
                              {String(cell)}
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Filtered Results Info */}
          {searchFilter && (
            <div className="mt-4 text-sm font-bold text-gray-600">
              Showing {queryResult.rows.filter(row => 
                row.some(cell => String(cell).toLowerCase().includes(searchFilter.toLowerCase()))
              ).length} of {queryResult.rowCount} rows
            </div>
          )}
        </div>
      )}

      {/* Import JSON Section */}
      <div className="bg-poe-pink border-4 border-poe-black rounded-3xl cartoon-shadow p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-white border-4 border-poe-black rounded-xl flex items-center justify-center">
            <FileJson className="w-5 h-5" strokeWidth={3} />
          </div>
          <h3 className="text-2xl font-black">Import Lockey JSON</h3>
        </div>

        <p className="text-sm font-bold mb-4">
          Upload a validated Lockey JSON file from POEditor to import translations into your database.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              type="file"
              id="json-file-input"
              accept=".json,application/json"
              onChange={handleFileSelect}
              className="hidden"
            />
            <label
              htmlFor="json-file-input"
              className="w-full inline-flex items-center justify-center px-6 py-3 gap-2 bg-white border-4 border-poe-black rounded-2xl cartoon-shadow font-black transition-cartoon btn-press hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#000000] cursor-pointer"
            >
              <Upload className="w-5 h-5" strokeWidth={3} />
              <span>{selectedFile ? selectedFile.name : 'Choose JSON File'}</span>
            </label>
          </div>
          <Button
            variant="blue"
            size="md"
            onClick={handleImportJson}
            disabled={!selectedFile || isExecuting}
          >
            {isExecuting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" strokeWidth={3} />
                <span>Importing...</span>
              </>
            ) : (
              <>
                <Database className="w-5 h-5" strokeWidth={3} />
                <span>Import to DB</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
