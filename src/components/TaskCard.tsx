import React, { useMemo } from 'react';
import {
  Clock,
  Bell,
  Check,
  Trash2,
  Edit3,
  AlertCircle,
  Calendar,
  RotateCcw,
} from 'lucide-react';
import { AgendaItem, Priority } from '../types';
import { useAgenda } from '../context/AgendaContext';
import { NotificationManager } from '../services/notifications';
import { getTodayDateString } from '../services/storage';

interface TaskCardProps {
  task: AgendaItem;
  showDate?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, showDate = false }) => {
  const {
    categories,
    toggleComplete,
    deleteTask,
    openEditModal,
    snoozeTask,
  } = useAgenda();

  const category = useMemo(() => {
    return categories.find(c => c.id === task.categoryId) || {
      id: 'default',
      name: 'General',
      color: '#64748b',
    };
  }, [categories, task.categoryId]);

  // Compute timing status (relative time, overdue, upcoming)
  const timingStatus = useMemo(() => {
    if (task.completed) {
      return {
        label: task.completedAt
          ? `Done at ${new Date(task.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
          : 'Completed',
        isOverdue: false,
        isUpcomingSoon: false,
      };
    }

    if (!task.dueDate) return { label: '', isOverdue: false, isUpcomingSoon: false };

    const todayStr = getTodayDateString(0);
    const isToday = task.dueDate === todayStr;
    const isPastDate = task.dueDate < todayStr;

    if (isPastDate) {
      return { label: 'Overdue date', isOverdue: true, isUpcomingSoon: false };
    }

    if (!task.startTime) {
      return {
        label: isToday ? 'Today' : task.dueDate,
        isOverdue: false,
        isUpcomingSoon: false,
      };
    }

    const [hours, minutes] = task.startTime.split(':').map(Number);
    const now = new Date();
    const taskTime = new Date();
    taskTime.setHours(hours, minutes, 0, 0);

    const diffMinutes = Math.round((taskTime.getTime() - now.getTime()) / 60000);

    if (isToday) {
      if (diffMinutes < -1) {
        const overdueMins = Math.abs(diffMinutes);
        return {
          label: overdueMins >= 60 ? `Overdue by ${Math.floor(overdueMins / 60)}h ${overdueMins % 60}m` : `Overdue by ${overdueMins}m`,
          isOverdue: true,
          isUpcomingSoon: false,
        };
      } else if (diffMinutes >= -1 && diffMinutes <= 5) {
        return { label: 'Starting now', isOverdue: false, isUpcomingSoon: true };
      } else if (diffMinutes > 5 && diffMinutes <= 60) {
        return { label: `In ${diffMinutes} mins`, isOverdue: false, isUpcomingSoon: true };
      } else if (diffMinutes > 60 && diffMinutes <= 240) {
        const h = Math.floor(diffMinutes / 60);
        const m = diffMinutes % 60;
        return { label: `In ${h}h ${m > 0 ? `${m}m` : ''}`, isOverdue: false, isUpcomingSoon: false };
      } else {
        return { label: `Today at ${task.startTime}`, isOverdue: false, isUpcomingSoon: false };
      }
    }

    return { label: `${task.dueDate} at ${task.startTime}`, isOverdue: false, isUpcomingSoon: false };
  }, [task]);

  const priorityStyles: Record<Priority, { badge: string; text: string; dot: string }> = {
    high: {
      badge: 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60',
      text: 'High Priority',
      dot: 'bg-rose-500',
    },
    medium: {
      badge: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
      text: 'Medium',
      dot: 'bg-amber-500',
    },
    low: {
      badge: 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60',
      text: 'Low',
      dot: 'bg-blue-500',
    },
  };

  const priorityConfig = priorityStyles[task.priority];

  return (
    <div
      id={`task-card-${task.id}`}
      className={`group relative rounded-xl border transition-all duration-200 ${
        task.completed
          ? 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 opacity-75'
          : timingStatus.isOverdue
          ? 'bg-white dark:bg-slate-900 border-rose-200 dark:border-rose-900/60 shadow-sm hover:shadow-md'
          : timingStatus.isUpcomingSoon
          ? 'bg-indigo-50/30 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800/80 shadow-sm hover:shadow-md'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md'
      }`}
    >
      <div className="p-4 flex items-start gap-3.5">
        {/* Checkbox */}
        <button
          id={`toggle-task-${task.id}`}
          onClick={() => toggleComplete(task.id)}
          aria-label={task.completed ? 'Mark uncompleted' : 'Mark completed'}
          className={`mt-1 flex-shrink-0 w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer ${
            task.completed
              ? 'bg-emerald-600 border-emerald-600 text-white'
              : 'border-slate-300 dark:border-slate-600 hover:border-emerald-500 bg-white dark:bg-slate-800'
          }`}
        >
          {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </button>

        {/* Content Details */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            {/* Category tag */}
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              {category.name}
            </span>

            {/* Priority tag */}
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border ${priorityConfig.badge}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${priorityConfig.dot}`} />
              {priorityConfig.text}
            </span>

            {/* Timing / Countdown Badge */}
            {timingStatus.label && (
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${
                  timingStatus.isOverdue
                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 font-semibold'
                    : timingStatus.isUpcomingSoon
                    ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300 animate-pulse font-semibold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {timingStatus.isOverdue ? (
                  <AlertCircle className="w-3 h-3 text-rose-600" />
                ) : (
                  <Clock className="w-3 h-3" />
                )}
                {timingStatus.label}
              </span>
            )}
          </div>

          {/* Title */}
          <h3
            className={`text-base font-medium leading-snug break-words ${
              task.completed
                ? 'line-through text-slate-400 dark:text-slate-500'
                : 'text-slate-900 dark:text-slate-100'
            }`}
          >
            {task.title}
          </h3>

          {/* Description */}
          {task.description && (
            <p
              className={`mt-1 text-sm line-clamp-2 ${
                task.completed
                  ? 'text-slate-400 dark:text-slate-600'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {task.description}
            </p>
          )}

          {/* Meta footer */}
          <div className="mt-3 flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-slate-500 dark:text-slate-400">
            {/* Scheduled Time */}
            {task.startTime && (
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {task.startTime}
                  {task.endTime ? ` – ${task.endTime}` : ''}
                </span>
              </div>
            )}

            {/* Date if requested */}
            {showDate && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{task.dueDate}</span>
              </div>
            )}

            {/* Reminder Offset indicator */}
            {task.reminderOffset !== -1 && (
              <div
                className={`flex items-center gap-1 ${
                  task.reminderTriggered
                    ? 'text-slate-400'
                    : 'text-indigo-600 dark:text-indigo-400 font-medium'
                }`}
                title={`Reminder set: ${NotificationManager.getOffsetLabel(task.reminderOffset)}`}
              >
                <Bell className="w-3.5 h-3.5" />
                <span>{NotificationManager.getOffsetLabel(task.reminderOffset)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-1 self-start opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
          {!task.completed && (
            <button
              id={`snooze-task-${task.id}`}
              onClick={() => snoozeTask(task.id, 15)}
              className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Snooze reminder by 15 minutes"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          <button
            id={`edit-task-${task.id}`}
            onClick={() => openEditModal(task)}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Edit item"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <button
            id={`delete-task-${task.id}`}
            onClick={() => deleteTask(task.id)}
            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
            title="Delete item"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
