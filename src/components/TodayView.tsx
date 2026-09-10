import React, { useMemo } from 'react';
import {
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
  Flame,
  Filter,
} from 'lucide-react';
import { useAgenda } from '../context/AgendaContext';
import { TaskCard } from './TaskCard';
import { getTodayDateString } from '../services/storage';

export const TodayView: React.FC = () => {
  const {
    filteredTasks,
    categories,
    openCreateModal,
    filters,
    setFilters,
    stats,
  } = useAgenda();

  const todayStr = getTodayDateString(0);

  // Filter tasks for today
  const todayTasks = useMemo(() => {
    return filteredTasks
      .filter(t => t.dueDate === todayStr)
      .sort((a, b) => {
        // Uncompleted first, then by time
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }
        const timeA = a.startTime || '99:99';
        const timeB = b.startTime || '99:99';
        return timeA.localeCompare(timeB);
      });
  }, [filteredTasks, todayStr]);

  const pendingCount = todayTasks.filter(t => !t.completed).length;
  const completedCount = todayTasks.filter(t => t.completed).length;
  const totalCount = todayTasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const todayDateFormatted = useMemo(() => {
    return new Date().toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner / Today's Summary Card */}
      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white rounded-2xl p-6 sm:p-7 shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5" />
                {todayDateFormatted}
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mt-1">
                Today's Agenda
              </h2>
            </div>

            <button
              id="today-add-task-btn"
              onClick={() => openCreateModal(todayStr)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-sm transition-all shadow-md cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Add Today's Item
            </button>
          </div>

          {/* Progress and Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
              <span className="text-xs text-slate-300">Remaining</span>
              <p className="text-xl font-bold text-white mt-0.5">{pendingCount}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
              <span className="text-xs text-slate-300">Completed</span>
              <p className="text-xl font-bold text-emerald-300 mt-0.5">{completedCount}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
              <span className="text-xs text-slate-300">Overdue Alerts</span>
              <p className="text-xl font-bold text-rose-300 mt-0.5">{stats.overdueToday}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
              <span className="text-xs text-slate-300">Day Progress</span>
              <p className="text-xl font-bold text-indigo-200 mt-0.5">{progressPercent}%</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 w-full bg-white/15 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-400 h-full transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter / Category Pills Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-1 border-b border-slate-200 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto py-1">
          <button
            id="filter-cat-all"
            onClick={() => setFilters(prev => ({ ...prev, categoryId: 'all' }))}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              filters.categoryId === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All Categories
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              id={`filter-cat-${cat.id}`}
              onClick={() => setFilters(prev => ({ ...prev, categoryId: cat.id }))}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                filters.categoryId === cat.id
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
              {cat.name}
            </button>
          ))}
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-1 text-xs">
          <span className="text-slate-500 text-xs font-medium mr-1">Priority:</span>
          {(['all', 'high', 'medium', 'low'] as const).map(p => (
            <button
              key={p}
              id={`filter-priority-${p}`}
              onClick={() => setFilters(prev => ({ ...prev, priority: p }))}
              className={`px-2.5 py-1 rounded-md capitalize font-medium transition-colors cursor-pointer ${
                filters.priority === p
                  ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      {todayTasks.length === 0 ? (
        <div className="text-center py-14 px-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {filters.searchQuery || filters.categoryId !== 'all' || filters.priority !== 'all'
              ? 'No matching agenda items found'
              : 'Your agenda for today is clear!'}
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {filters.searchQuery || filters.categoryId !== 'all' || filters.priority !== 'all'
              ? 'Try resetting your filters or search keywords.'
              : 'Add upcoming tasks, meetings, or reminders to stay on top of your day.'}
          </p>
          <button
            id="today-empty-add-btn"
            onClick={() => openCreateModal(todayStr)}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Agenda Item
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {todayTasks.map(task => (
            <TaskCard key={task.id} task={task} showDate={false} />
          ))}
        </div>
      )}
    </div>
  );
};
