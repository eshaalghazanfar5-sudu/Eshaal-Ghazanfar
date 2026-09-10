import React, { useState } from 'react';
import { Bell, BellOff, Volume2, X, CheckCircle2 } from 'lucide-react';
import { useAgenda } from '../context/AgendaContext';

export const NotificationBanner: React.FC = () => {
  const {
    browserPermission,
    requestNotificationPermission,
    testNotification,
    settings,
    updateSettings,
  } = useAgenda();

  const [isDismissed, setIsDismissed] = useState(false);
  const [tested, setTested] = useState(false);

  if (isDismissed) return null;

  const handleTest = () => {
    testNotification();
    setTested(true);
    setTimeout(() => setTested(false), 3000);
  };

  // If permission already granted
  if (browserPermission === 'granted') {
    return (
      <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-sm text-emerald-900 dark:text-emerald-200">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 rounded-lg">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold">Smart Reminders Active:</span> Audio chimes & system notifications are enabled.
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            id="test-chime-btn"
            onClick={handleTest}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors cursor-pointer"
          >
            <Volume2 className="w-3.5 h-3.5" />
            {tested ? 'Chime Played!' : 'Test Sound & Alert'}
          </button>
          <button
            id="dismiss-banner-btn"
            onClick={() => setIsDismissed(true)}
            className="p-1 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-md transition-colors"
            title="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Permission not granted or default
  return (
    <div className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-sm text-indigo-950 dark:text-indigo-200">
      <div className="flex items-center gap-2.5">
        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 rounded-lg">
          <Bell className="w-4 h-4" />
        </div>
        <div>
          <span className="font-semibold">Never miss an agenda item:</span> Turn on browser notifications to get timely alerts even when this tab is in the background.
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          id="request-permission-btn"
          onClick={requestNotificationPermission}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors cursor-pointer shadow-sm"
        >
          <Bell className="w-3.5 h-3.5" />
          Enable Notifications
        </button>
        <button
          id="test-chime-quick-btn"
          onClick={handleTest}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded-lg transition-colors cursor-pointer"
        >
          <Volume2 className="w-3.5 h-3.5" />
          {tested ? 'Chimed!' : 'Test Sound'}
        </button>
        <button
          id="dismiss-notif-banner-btn"
          onClick={() => setIsDismissed(true)}
          className="p-1 text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300 rounded-md"
          title="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
