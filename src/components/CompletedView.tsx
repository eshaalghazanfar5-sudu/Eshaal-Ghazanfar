import React, { useState } from 'react';
import { CheckCircle2, Trash2, RotateCcw, Calendar, Check } from 'lucide-react';
import { useAgenda } from '../context/AgendaContext';

export const CompletedView: React.FC = () => {
  const { filteredTasks, toggleComplete, deleteTask, clearCompleted, categories } = useAgenda();
  const [confirmClear, setConfirmClear] = useState(false);

  const completedTasks = filteredTasks.filter(t => t.completed);

  const handleClear = () => {
    clearCompleted();
    setConfirmClear(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Completed Tasks Archive
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
              {completedTasks.length} Done
            </span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            History of your accomplished tasks, finished meetings, and closed agenda items.
          </p>
        </div>

        {completedTasks.length > 0 && (
          <div>
            {confirmClear ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                  Clear all completed items?
                </span>
                <button
                  id="confirm-clear-yes"
                  onClick={handleClear}
                  className="px-3 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors cursor-pointer"
                >
                  Yes, Clear All
                </button>
                <button
                  onClick={() => setConfirmClear(false)}
                  className="px-3 py-1.5 text-xs font-medium bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                id="clear-completed-btn"
                onClick={() => setConfirmClear(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear Completed History
              </button>
            )}
          </div>
        )}
      </div>

      {completedTasks.length === 0 ? (
        <div className="text-center py-16 px-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            No completed tasks yet
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Once you check off agenda items in Today or Upcoming views, they will be archived here for tracking.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {completedTasks.map(task => {
            const category = categories.find(c => c.id === task.categoryId);
            return (
              <div
                key={task.id}
                id={`completed-task-${task.id}`}
                className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => toggleComplete(task.id)}
                    className="w-5 h-5 rounded-md bg-emerald-600 border border-emerald-600 text-white flex items-center justify-center cursor-pointer hover:bg-emerald-700 transition-colors flex-shrink-0"
                    title="Click to restore to active agenda"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      {category && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: category.color }} />
                          {category.name}
                        </span>
                      )}
                      <span className="text-xs text-slate-400">
                        Due: {task.dueDate} {task.startTime ? `@ ${task.startTime}` : ''}
                      </span>
                    </div>
                    <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 line-through truncate">
                      {task.title}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleComplete(task.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 cursor-pointer transition-colors"
                    title="Restore task to active agenda"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Restore
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg cursor-pointer transition-colors"
                    title="Delete permanently"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
