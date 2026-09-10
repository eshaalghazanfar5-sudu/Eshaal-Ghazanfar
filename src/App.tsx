import React, { useEffect } from 'react';
import { AgendaProvider, useAgenda } from './context/AgendaContext';
import { Header } from './components/Header';
import { NotificationBanner } from './components/NotificationBanner';
import { TodayView } from './components/TodayView';
import { UpcomingView } from './components/UpcomingView';
import { CompletedView } from './components/CompletedView';
import { CalendarTimelineView } from './components/CalendarTimelineView';
import { TaskInputModal } from './components/TaskInputModal';
import { ReminderAlertModal } from './components/ReminderAlertModal';
import { ImportExportModal } from './components/ImportExportModal';
import { SettingsModal } from './components/SettingsModal';

const AgendaMainContent: React.FC = () => {
  const { viewMode, openCreateModal } = useAgenda();

  // Global hotkey 'n' to open new item dialog
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === 'n' || e.key === 'N') &&
        !e.metaKey &&
        !e.ctrlKey &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        openCreateModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openCreateModal]);

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      {/* Top Header & Navigation */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Permission & Status Banner */}
        <NotificationBanner />

        {/* Dynamic View */}
        {viewMode === 'today' && <TodayView />}
        {viewMode === 'upcoming' && <UpcomingView />}
        {viewMode === 'calendar' && <CalendarTimelineView />}
        {viewMode === 'completed' && <CompletedView />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-6xl mx-auto px-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Smart Reminder Engine Active</span>
          </div>

          <div className="flex items-center gap-3">
            <span>
              Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[11px]">N</kbd> for new item,{' '}
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[11px]">/</kbd> to search
            </span>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <TaskInputModal />
      <ReminderAlertModal />
      <ImportExportModal />
      <SettingsModal />
    </div>
  );
};

export default function App() {
  return (
    <AgendaProvider>
      <AgendaMainContent />
    </AgendaProvider>
  );
}
