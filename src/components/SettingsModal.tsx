import React, { useState } from 'react';
import { X, Volume2, Bell, Tag, Plus, Trash2, Check } from 'lucide-react';
import { useAgenda } from '../context/AgendaContext';
import { ReminderOffset } from '../types';

const REMINDER_OPTIONS: { label: string; value: ReminderOffset }[] = [
  { label: 'At event time', value: 0 },
  { label: '5 minutes before', value: 5 },
  { label: '15 minutes before (default)', value: 15 },
  { label: '30 minutes before', value: 30 },
  { label: '1 hour before', value: 60 },
  { label: '1 day before', value: 1440 },
  { label: 'No reminder', value: -1 },
];

const CATEGORY_COLORS = [
  '#3b82f6',
  '#8b5cf6',
  '#10b981',
  '#f43f5e',
  '#f59e0b',
  '#06b6d4',
  '#ec4899',
  '#6366f1',
];

export const SettingsModal: React.FC = () => {
  const {
    isSettingsModalOpen,
    setIsSettingsModalOpen,
    settings,
    updateSettings,
    testNotification,
    categories,
    addCategory,
    deleteCategory,
    browserPermission,
    requestNotificationPermission,
  } = useAgenda();

  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState(CATEGORY_COLORS[0]);

  if (!isSettingsModalOpen) return null;

  const handleAddCat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    addCategory(newCatName.trim(), newCatColor);
    setNewCatName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Agenda & Reminder Settings
          </h2>
          <button
            onClick={() => setIsSettingsModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 dark:text-slate-200">
          {/* Notification & Audio Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5" />
              Notifications & Sound
            </h3>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/70 space-y-3.5">
              {/* Sound Chime Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold block">Audio Chimes</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Play melodic chime synthesizer when reminders trigger
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.soundEnabled}
                    onChange={e => updateSettings({ soundEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {/* Browser Push Notification */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-sm font-semibold block">Browser System Alerts</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Show desktop notifications outside active browser window
                  </span>
                </div>
                {browserPermission !== 'granted' ? (
                  <button
                    onClick={requestNotificationPermission}
                    className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Grant Permission
                  </button>
                ) : (
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.browserNotifications}
                      onChange={e => updateSettings({ browserNotifications: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                )}
              </div>

              {/* Default Offset */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Default Reminder Timing for New Tasks:
                </label>
                <select
                  value={settings.defaultOffset}
                  onChange={e =>
                    updateSettings({ defaultOffset: Number(e.target.value) as ReminderOffset })
                  }
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                >
                  {REMINDER_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Test Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={testNotification}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-lg cursor-pointer transition-colors"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  Test Audio & Reminder Alert Now
                </button>
              </div>
            </div>
          </div>

          {/* Categories Management */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              Manage Categories
            </h3>

            <div className="space-y-2">
              {categories.map(cat => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-sm font-medium">{cat.name}</span>
                  </div>
                  {categories.length > 1 && (
                    <button
                      onClick={() => deleteCategory(cat.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                      title="Delete category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add Category Form */}
            <form onSubmit={handleAddCat} className="flex items-center gap-2 pt-2">
              <input
                type="text"
                placeholder="New Category Name..."
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
              <div className="flex items-center gap-1">
                {CATEGORY_COLORS.slice(0, 5).map(c => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setNewCatColor(c)}
                    className={`w-5 h-5 rounded-full transition-all ${
                      newCatColor === c ? 'ring-2 ring-indigo-500 scale-110' : ''
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <button
                type="submit"
                disabled={!newCatName.trim()}
                className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl disabled:opacity-50 cursor-pointer"
              >
                Add
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={() => setIsSettingsModalOpen(false)}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold rounded-xl text-xs cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
