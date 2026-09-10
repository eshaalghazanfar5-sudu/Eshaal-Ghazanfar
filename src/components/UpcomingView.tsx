import React, { useMemo } from 'react';
import { Calendar, Plus, ChevronRight } from 'lucide-react';
import { useAgenda } from '../context/AgendaContext';
import { TaskCard } from './TaskCard';
import { getTodayDateString } from '../services/storage';
import { AgendaItem } from '../types';

export const UpcomingView: React.FC = () => {
  const { filteredTasks, openCreateModal } = useAgenda();

  const todayStr = getTodayDateString(0);
  const tomorrowStr = getTodayDateString(1);

  // Group tasks into Tomorrow, Next 7 days, and Later
  const groupedTasks = useMemo(() => {
    const tomorrowItems: AgendaItem[] = [];
    const thisWeekItems: { [date: string]: AgendaItem[] } = {};
    const laterItems: { [date: string]: AgendaItem[] } = {};

    const d = new Date();
    const weekFromNow = new Date();
    weekFromNow.setDate(d.getDate() + 7);
    const weekFromNowStr = weekFromNow.toISOString().split('T')[0];

    filteredTasks
      .filter(t => !t.completed && t.dueDate > todayStr)
      .sort((a, b) => {
        if (a.dueDate !== b.dueDate) return a.dueDate.localeCompare(b.dueDate);
        return (a.startTime || '99:99').localeCompare(b.startTime || '99:99');
      })
      .forEach(task => {
        if (task.dueDate === tomorrowStr) {
          tomorrowItems.push(task);
        } else if (task.dueDate <= weekFromNowStr) {
          if (!thisWeekItems[task.dueDate]) thisWeekItems[task.dueDate] = [];
          thisWeekItems[task.dueDate].push(task);
        } else {
          if (!laterItems[task.dueDate]) laterItems[task.dueDate] = [];
          laterItems[task.dueDate].push(task);
        }
      });

    return {
      tomorrowItems,
      thisWeekItems,
      laterItems,
    };
  }, [filteredTasks, todayStr, tomorrowStr]);

  const hasAnyUpcoming =
    groupedTasks.tomorrowItems.length > 0 ||
    Object.keys(groupedTasks.thisWeekItems).length > 0 ||
    Object.keys(groupedTasks.laterItems).length > 0;

  const formatDateHeader = (dateStr: string) => {
    const [y, m, day] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, day);
    return date.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Upcoming Agenda & Timeline
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Your scheduled agenda items, deadlines, and future reminders.
          </p>
        </div>
        <button
          id="upcoming-add-btn"
          onClick={() => openCreateModal(tomorrowStr)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Schedule Item
        </button>
      </div>

      {!hasAnyUpcoming ? (
        <div className="text-center py-16 px-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            No upcoming tasks scheduled
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Plan ahead by scheduling tasks for tomorrow or later in the week with custom reminders.
          </p>
          <button
            onClick={() => openCreateModal(tomorrowStr)}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Schedule for Tomorrow
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Tomorrow Section */}
          {groupedTasks.tomorrowItems.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  Tomorrow
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                    {groupedTasks.tomorrowItems.length}
                  </span>
                </h3>
                <button
                  onClick={() => openCreateModal(tomorrowStr)}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add item
                </button>
              </div>
              <div className="space-y-3">
                {groupedTasks.tomorrowItems.map(task => (
                  <TaskCard key={task.id} task={task} showDate={false} />
                ))}
              </div>
            </div>
          )}

          {/* This Week Grouped by Day */}
          {Object.keys(groupedTasks.thisWeekItems).map(dateStr => (
            <div key={dateStr} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                  {formatDateHeader(dateStr)}
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {groupedTasks.thisWeekItems[dateStr].length}
                  </span>
                </h3>
                <button
                  onClick={() => openCreateModal(dateStr)}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add item
                </button>
              </div>
              <div className="space-y-3">
                {groupedTasks.thisWeekItems[dateStr].map(task => (
                  <TaskCard key={task.id} task={task} showDate={false} />
                ))}
              </div>
            </div>
          ))}

          {/* Later / Future Group */}
          {Object.keys(groupedTasks.laterItems).length > 0 && (
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Later & Next Month
              </h3>
              {Object.keys(groupedTasks.laterItems).map(dateStr => (
                <div key={dateStr} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                      {formatDateHeader(dateStr)}
                    </h4>
                  </div>
                  <div className="space-y-3">
                    {groupedTasks.laterItems[dateStr].map(task => (
                      <TaskCard key={task.id} task={task} showDate={true} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
