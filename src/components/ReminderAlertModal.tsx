import React from 'react';
import { Bell, CheckCircle2, RotateCcw, X, Clock, AlertTriangle } from 'lucide-react';
import { useAgenda } from '../context/AgendaContext';

export const ReminderAlertModal: React.FC = () => {
  const {
    activeReminder,
    dismissActiveReminder,
    toggleComplete,
    snoozeTask,
    categories,
  } = useAgenda();

  if (!activeReminder) return null;

  const category = categories.find(c => c.id === activeReminder.categoryId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
      <div
        id="reminder-alert-modal"
        className="w-full max-w-md bg-white dark:bg-slate-900 border-2 border-indigo-500/80 rounded-2xl shadow-2xl overflow-hidden p-6 relative"
      >
        <button
          onClick={dismissActiveReminder}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center animate-bounce shadow-inner">
            <Bell className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Agenda Reminder Alert
            </span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">
              Time for your task!
            </h3>
          </div>
        </div>

        {/* Task Details Card */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 mb-5">
          <div className="flex items-center gap-2 mb-2">
            {category && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: category.color }} />
                {category.name}
              </span>
            )}
            <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
              {activeReminder.priority} Priority
            </span>
          </div>

          <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {activeReminder.title}
          </h4>

          {activeReminder.description && (
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              {activeReminder.description}
            </p>
          )}

          <div className="mt-3 flex items-center gap-2 text-xs font-medium text-indigo-700 dark:text-indigo-300">
            <Clock className="w-3.5 h-3.5" />
            <span>Scheduled for {activeReminder.startTime || 'today'}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            id="reminder-complete-btn"
            onClick={() => {
              toggleComplete(activeReminder.id);
            }}
            className="py-2.5 px-4 rounded-xl font-semibold text-sm bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            Mark Done
          </button>

          <button
            id="reminder-snooze-btn"
            onClick={() => snoozeTask(activeReminder.id, 5)}
            className="py-2.5 px-4 rounded-xl font-semibold text-sm bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Snooze 5m
          </button>
        </div>

        <button
          onClick={dismissActiveReminder}
          className="w-full mt-2 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium text-center"
        >
          Dismiss reminder
        </button>
      </div>
    </div>
  );
};
