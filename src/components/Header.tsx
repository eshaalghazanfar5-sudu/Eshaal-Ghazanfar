import React, { useState, useEffect, useRef } from 'react';
import {
  CalendarClock,
  Search,
  Plus,
  Moon,
  Sun,
  Settings,
  Database,
  Calendar,
  ListTodo,
  CheckCircle2,
  Clock,
  X,
} from 'lucide-react';
import { useAgenda } from '../context/AgendaContext';
import { ViewMode } from '../types';
import { getTodayDateString } from '../services/storage';

export const Header: React.FC = () => {
  const {
    viewMode,
    setViewMode,
    filters,
    setFilters,
    theme,
    setTheme,
    openCreateModal,
    setIsExportModalOpen,
    setIsSettingsModalOpen,
    tasks,
    stats,
  } = useAgenda();

  const [currentTime, setCurrentTime] = useState<string>('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Live digital clock in header
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Keyboard shortcut '/' to search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const todayStr = getTodayDateString(0);
  const upcomingCount = tasks.filter(t => !t.completed && t.dueDate > todayStr).length;

  const views: { id: ViewMode; label: string; icon: React.ComponentType<{ className?: string }>; count?: number }[] = [
    { id: 'today', label: 'Today', icon: ListTodo, count: stats.pendingToday },
    { id: 'upcoming', label: 'Upcoming', icon: Calendar, count: upcomingCount },
    { id: 'calendar', label: 'Day Planner', icon: Clock },
    { id: 'completed', label: 'Completed', icon: CheckCircle2, count: stats.completed },
  ];

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-xs transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Top Navbar Row */}
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <CalendarClock className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
                Agenda & Reminders
              </h1>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-mono font-medium text-indigo-600 dark:text-indigo-400">
                  {currentTime}
                </span>
                <span>•</span>
                <span>Smart Scheduling</span>
              </div>
            </div>
          </div>

          {/* Quick Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xs relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              ref={searchInputRef}
              id="header-search-input"
              type="text"
              placeholder="Search agenda (Press '/')"
              value={filters.searchQuery}
              onChange={e => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
              className="w-full pl-9 pr-8 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {filters.searchQuery && (
              <button
                onClick={() => setFilters(prev => ({ ...prev, searchQuery: '' }))}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Actions: + New Item, Theme, Export, Settings */}
          <div className="flex items-center gap-2">
            <button
              id="header-new-task-btn"
              onClick={() => openCreateModal()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">New Item</span>
            </button>

            {/* Backup / Export */}
            <button
              id="header-backup-btn"
              onClick={() => setIsExportModalOpen(true)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title="Backup & Restore Data (JSON)"
            >
              <Database className="w-4 h-4" />
            </button>

            {/* Settings */}
            <button
              id="header-settings-btn"
              onClick={() => setIsSettingsModalOpen(true)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title="Settings & Notifications"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Theme Toggle */}
            <button
              id="header-theme-toggle"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light mode' : 'Switch to Dark mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar (if screen is small) */}
        <div className="md:hidden pb-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search agenda..."
              value={filters.searchQuery}
              onChange={e => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
              className="w-full pl-9 pr-8 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {filters.searchQuery && (
              <button
                onClick={() => setFilters(prev => ({ ...prev, searchQuery: '' }))}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs Row */}
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-1 scrollbar-none">
          {views.map(v => {
            const Icon = v.icon;
            const isActive = viewMode === v.id;
            return (
              <button
                key={v.id}
                id={`nav-view-${v.id}`}
                onClick={() => setViewMode(v.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-b-2 border-indigo-600 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{v.label}</span>
                {v.count !== undefined && (
                  <span
                    className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {v.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
