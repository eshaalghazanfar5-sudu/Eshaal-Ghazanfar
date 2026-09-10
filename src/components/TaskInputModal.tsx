import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  Bell,
  Tag,
  AlertTriangle,
  Plus,
  Check,
} from 'lucide-react';
import { Priority, ReminderOffset, AgendaItem } from '../types';
import { useAgenda } from '../context/AgendaContext';
import { getTodayDateString } from '../services/storage';

const REMINDER_OPTIONS: { label: string; value: ReminderOffset }[] = [
  { label: 'At event time', value: 0 },
  { label: '5 minutes before', value: 5 },
  { label: '15 minutes before (recommended)', value: 15 },
  { label: '30 minutes before', value: 30 },
  { label: '1 hour before', value: 60 },
  { label: '1 day before', value: 1440 },
  { label: 'No reminder', value: -1 },
];

const CATEGORY_COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#10b981', // emerald
  '#f43f5e', // rose
  '#f59e0b', // amber
  '#06b6d4', // cyan
  '#6366f1', // indigo
];

export const TaskInputModal: React.FC = () => {
  const {
    isTaskModalOpen,
    closeTaskModal,
    editingTask,
    addTask,
    updateTask,
    categories,
    addCategory,
    settings,
  } = useAgenda();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(getTodayDateString(0));
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [priority, setPriority] = useState<Priority>('medium');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'cat-work');
  const [reminderOffset, setReminderOffset] = useState<ReminderOffset>(settings.defaultOffset);

  // New Category inline creation
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState(CATEGORY_COLORS[0]);

  // Sync state when editingTask or modal opens
  useEffect(() => {
    if (editingTask && editingTask.id) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || '');
      setDueDate(editingTask.dueDate);
      setStartTime(editingTask.startTime || '10:00');
      setEndTime(editingTask.endTime || '');
      setPriority(editingTask.priority);
      setCategoryId(editingTask.categoryId);
      setReminderOffset(editingTask.reminderOffset);
    } else if (editingTask && !editingTask.id) {
      // prefilled create
      setTitle('');
      setDescription('');
      setDueDate(editingTask.dueDate || getTodayDateString(0));
      setStartTime(editingTask.startTime || '10:00');
      setEndTime('');
      setPriority('medium');
      setCategoryId(categories[0]?.id || 'cat-work');
      setReminderOffset(settings.defaultOffset);
    } else {
      // blank create
      setTitle('');
      setDescription('');
      setDueDate(getTodayDateString(0));
      setStartTime('10:00');
      setEndTime('');
      setPriority('medium');
      setCategoryId(categories[0]?.id || 'cat-work');
      setReminderOffset(settings.defaultOffset);
    }
  }, [editingTask, isTaskModalOpen, categories, settings.defaultOffset]);

  if (!isTaskModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingTask && editingTask.id) {
      updateTask(editingTask.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate,
        startTime: startTime || undefined,
        endTime: endTime || undefined,
        priority,
        categoryId,
        reminderOffset,
      });
    } else {
      addTask({
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate,
        startTime: startTime || undefined,
        endTime: endTime || undefined,
        priority,
        categoryId,
        completed: false,
        reminderOffset,
      });
    }
    closeTaskModal();
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const cat = addCategory(newCatName.trim(), newCatColor);
    setCategoryId(cat.id);
    setNewCatName('');
    setIsCreatingCategory(false);
  };

  const setDateOffset = (offsetDays: number) => {
    setDueDate(getTodayDateString(offsetDays));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        id="task-input-modal"
        className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {editingTask && editingTask.id ? 'Edit Agenda Item' : 'New Agenda Item'}
          </h2>
          <button
            id="close-task-modal-btn"
            onClick={closeTaskModal}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Task / Agenda Title *
            </label>
            <input
              id="task-title-input"
              type="text"
              required
              autoFocus
              placeholder="e.g., Team Sync, Doctor Appointment, Workout"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Description & Notes
            </label>
            <textarea
              id="task-desc-input"
              rows={2}
              placeholder="Add details, agenda points, or checklist..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          {/* Date & Quick Buttons */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                Due Date
              </label>
              <div className="flex items-center gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => setDateOffset(0)}
                  className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 cursor-pointer"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setDateOffset(1)}
                  className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 cursor-pointer"
                >
                  Tomorrow
                </button>
                <button
                  type="button"
                  onClick={() => setDateOffset(7)}
                  className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 cursor-pointer"
                >
                  +1 Week
                </button>
              </div>
            </div>
            <input
              id="task-date-input"
              type="date"
              required
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          {/* Time: Start & End */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                Start Time
              </label>
              <input
                id="task-start-time-input"
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                End Time (Optional)
              </label>
              <input
                id="task-end-time-input"
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
          </div>

          {/* Priority Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              Priority Level
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {(['low', 'medium', 'high'] as Priority[]).map(p => {
                const isSelected = priority === p;
                const colors = {
                  low: isSelected
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400',
                  medium: isSelected
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-400',
                  high: isSelected
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-rose-400',
                };
                return (
                  <button
                    key={p}
                    type="button"
                    id={`priority-btn-${p}`}
                    onClick={() => setPriority(p)}
                    className={`py-2 px-3 rounded-xl border text-sm font-semibold capitalize transition-all cursor-pointer flex items-center justify-center gap-1.5 ${colors[p]}`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category Selector with Inline Creator */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-indigo-500" />
                Category / Project
              </label>
              <button
                type="button"
                onClick={() => setIsCreatingCategory(!isCreatingCategory)}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                {isCreatingCategory ? 'Cancel' : 'New Category'}
              </button>
            </div>

            {isCreatingCategory ? (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3 mb-2">
                <input
                  type="text"
                  placeholder="Category Name..."
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {CATEGORY_COLORS.map(c => (
                      <button
                        type="button"
                        key={c}
                        onClick={() => setNewCatColor(c)}
                        className={`w-6 h-6 rounded-full transition-transform ${
                          newCatColor === c ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : ''
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleCreateCategory}
                    disabled={!newCatName.trim()}
                    className="px-3 py-1 text-xs font-semibold bg-indigo-600 text-white rounded-lg disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
              </div>
            ) : (
              <select
                id="task-category-select"
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Smart Reminder Offset */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-indigo-500" />
              Smart Reminder Timing
            </label>
            <select
              id="task-reminder-select"
              value={reminderOffset}
              onChange={e => setReminderOffset(Number(e.target.value) as ReminderOffset)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            >
              {REMINDER_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Triggers an audio chime and notification banner in advance of your scheduled start time.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              id="cancel-task-btn"
              onClick={closeTaskModal}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="save-task-btn"
              className="px-5 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
            >
              {editingTask && editingTask.id ? 'Save Changes' : 'Create Agenda Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
