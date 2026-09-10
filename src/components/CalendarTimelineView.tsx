import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { useAgenda } from '../context/AgendaContext';
import { getTodayDateString } from '../services/storage';
import { AgendaItem } from '../types';

const HOURS = Array.from({ length: 16 }, (_, i) => i + 7); // 7:00 AM to 10:00 PM (22:00)

export const CalendarTimelineView: React.FC = () => {
  const { filteredTasks, categories, openCreateModal, toggleComplete, openEditModal } = useAgenda();
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString(0));

  const todayStr = getTodayDateString(0);

  // Navigate date
  const changeDay = (offset: number) => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + offset);
    const nextY = date.getFullYear();
    const nextM = String(date.getMonth() + 1).padStart(2, '0');
    const nextD = String(date.getDate()).padStart(2, '0');
    setSelectedDate(`${nextY}-${nextM}-${nextD}`);
  };

  // Format date display
  const formattedSelectedDate = useMemo(() => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }, [selectedDate]);

  // Tasks for selected day
  const dayTasks = useMemo(() => {
    return filteredTasks.filter(t => t.dueDate === selectedDate);
  }, [filteredTasks, selectedDate]);

  // Map tasks by hour
  const tasksByHour = useMemo(() => {
    const map: { [hour: number]: AgendaItem[] } = {};
    dayTasks.forEach(task => {
      const hour = task.startTime ? parseInt(task.startTime.split(':')[0], 10) : 9;
      if (!map[hour]) map[hour] = [];
      map[hour].push(task);
    });
    return map;
  }, [dayTasks]);

  // Untimed tasks
  const untimedTasks = useMemo(() => {
    return dayTasks.filter(t => !t.startTime);
  }, [dayTasks]);

  return (
    <div className="space-y-6">
      {/* Calendar Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => changeDay(-1)}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            title="Previous Day"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setSelectedDate(todayStr)}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Today
          </button>
          <button
            onClick={() => changeDay(1)}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            title="Next Day"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="ml-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {formattedSelectedDate}
            </h3>
            {selectedDate === todayStr && (
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                • Current Day
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
          />
          <button
            id="calendar-add-btn"
            onClick={() => openCreateModal(selectedDate)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Slot
          </button>
        </div>
      </div>

      {/* Untimed tasks section */}
      {untimedTasks.length > 0 && (
        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
            All-Day / Anytime Tasks ({untimedTasks.length})
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {untimedTasks.map(t => {
              const cat = categories.find(c => c.id === t.categoryId);
              return (
                <div
                  key={t.id}
                  onClick={() => openEditModal(t)}
                  className="p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between cursor-pointer hover:border-indigo-400"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        toggleComplete(t.id);
                      }}
                      className={`w-4 h-4 rounded flex items-center justify-center border text-white ${
                        t.completed ? 'bg-emerald-600 border-emerald-600' : 'border-slate-300'
                      }`}
                    >
                      {t.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                    <span
                      className={`text-xs font-medium truncate ${
                        t.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {t.title}
                    </span>
                  </div>
                  {cat && (
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 24-Hour Time Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {HOURS.map(hour => {
            const timeLabel = `${String(hour).padStart(2, '0')}:00`;
            const tasksAtHour = tasksByHour[hour] || [];

            return (
              <div
                key={hour}
                className="group relative flex items-start hover:bg-slate-50/50 dark:hover:bg-slate-850/40 transition-colors min-h-[68px]"
              >
                {/* Time Column */}
                <div className="w-18 flex-shrink-0 py-3 pr-3 text-right text-xs font-medium text-slate-400 dark:text-slate-500 select-none border-r border-slate-100 dark:border-slate-800/60">
                  {timeLabel}
                </div>

                {/* Content Area */}
                <div className="flex-1 p-2 relative">
                  {tasksAtHour.length === 0 ? (
                    <button
                      onClick={() => openCreateModal(selectedDate, timeLabel)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity w-full h-full py-2.5 text-xs text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center justify-center gap-1 border border-dashed border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add item at {timeLabel}
                    </button>
                  ) : (
                    <div className="space-y-2">
                      {tasksAtHour.map(task => {
                        const cat = categories.find(c => c.id === task.categoryId);
                        return (
                          <div
                            key={task.id}
                            onClick={() => openEditModal(task)}
                            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                              task.completed
                                ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 opacity-60'
                                : 'bg-indigo-50/60 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800/60 hover:shadow-md'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  toggleComplete(task.id);
                                }}
                                className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                                  task.completed
                                    ? 'bg-emerald-600 border-emerald-600 text-white'
                                    : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                                }`}
                              >
                                {task.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                              </button>

                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  {cat && (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                                      <span
                                        className="w-1.5 h-1.5 rounded-full"
                                        style={{ backgroundColor: cat.color }}
                                      />
                                      {cat.name}
                                    </span>
                                  )}
                                  <span className="text-[11px] text-indigo-700 dark:text-indigo-300 font-medium">
                                    {task.startTime} {task.endTime ? `- ${task.endTime}` : ''}
                                  </span>
                                </div>
                                <h4
                                  className={`text-sm font-semibold truncate ${
                                    task.completed
                                      ? 'line-through text-slate-400'
                                      : 'text-slate-900 dark:text-slate-100'
                                  }`}
                                >
                                  {task.title}
                                </h4>
                              </div>
                            </div>

                            <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              {task.priority}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
