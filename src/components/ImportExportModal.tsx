import React, { useState } from 'react';
import { X, Download, Upload, Copy, Check, RefreshCw, AlertCircle } from 'lucide-react';
import { useAgenda } from '../context/AgendaContext';

export const ImportExportModal: React.FC = () => {
  const { isExportModalOpen, setIsExportModalOpen, exportJSON, importJSON, resetToDefaults } = useAgenda();
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [copied, setCopied] = useState(false);
  const [importText, setImportText] = useState('');
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isExportModalOpen) return null;

  const jsonContent = exportJSON();

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agenda-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      setImportText(content);
    };
    reader.readAsText(file);
  };

  const handleApplyImport = () => {
    try {
      setImportStatus('idle');
      setErrorMessage('');
      const success = importJSON(importText);
      if (success) {
        setImportStatus('success');
        setTimeout(() => {
          setIsExportModalOpen(false);
        }, 1200);
      } else {
        setImportStatus('error');
        setErrorMessage('Failed to parse backup format. Ensure valid JSON schema.');
      }
    } catch (err: unknown) {
      setImportStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Invalid JSON format');
    }
  };

  const handleResetSample = () => {
    if (window.confirm('Reset all tasks to the initial sample agenda items?')) {
      resetToDefaults();
      setIsExportModalOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Backup, Export & Restore
            </h2>
          </div>
          <button
            onClick={() => setIsExportModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 pt-2 bg-slate-50/50 dark:bg-slate-850/50">
          <button
            onClick={() => setActiveTab('export')}
            className={`pb-2.5 px-4 text-sm font-semibold border-b-2 cursor-pointer transition-colors ${
              activeTab === 'export'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Export JSON Backup
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`pb-2.5 px-4 text-sm font-semibold border-b-2 cursor-pointer transition-colors ${
              activeTab === 'import'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Import & Restore
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'export' ? (
            <>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Download your complete agenda, categories, priority tags, and reminder settings as an offline JSON backup.
              </p>

              <div className="relative">
                <textarea
                  readOnly
                  value={jsonContent}
                  rows={8}
                  className="w-full font-mono text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 resize-none select-all"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Download .json File
                </button>
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-sm font-semibold transition-all cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied to Clipboard!' : 'Copy to Clipboard'}
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Restore your agenda data from a saved JSON file or paste the JSON text below:
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Upload Backup File:
                </label>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Or Paste JSON String:
                </label>
                <textarea
                  placeholder="Paste backup JSON content here..."
                  value={importText}
                  onChange={e => setImportText(e.target.value)}
                  rows={6}
                  className="w-full font-mono text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 resize-none focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {importStatus === 'error' && (
                <div className="flex items-center gap-2 p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 rounded-xl text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage || 'Invalid backup structure. Check JSON formatting.'}</span>
                </div>
              )}

              {importStatus === 'success' && (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-medium">
                  <Check className="w-4 h-4 flex-shrink-0" />
                  <span>Agenda successfully restored!</span>
                </div>
              )}

              <button
                onClick={handleApplyImport}
                disabled={!importText.trim()}
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold disabled:opacity-50 transition-all cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                Restore Agenda
              </button>
            </>
          )}

          {/* Reset Demo Data */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500">Need sample data?</span>
            <button
              type="button"
              onClick={handleResetSample}
              className="inline-flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset to Sample Agenda Items
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
