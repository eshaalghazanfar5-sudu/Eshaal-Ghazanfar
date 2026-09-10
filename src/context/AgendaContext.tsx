import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import {
  AgendaItem,
  Category,
  FilterOptions,
  NotificationSettings,
  ViewMode,
} from '../types';
import {
  NotificationManager,
  NotificationPermissionState,
} from '../services/notifications';
import {
  storageService,
  DEFAULT_CATEGORIES,
  DEFAULT_SETTINGS,
  generateInitialSampleItems,
  getTodayDateString,
} from '../services/storage';
import { soundService } from '../services/sound';

interface AgendaContextType {
  tasks: AgendaItem[];
  categories: Category[];
  settings: NotificationSettings;
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;
  filters: FilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  filteredTasks: AgendaItem[];

  // Modal controls
  isTaskModalOpen: boolean;
  editingTask: AgendaItem | null;
  openCreateModal: (prefillDate?: string, prefillTime?: string) => void;
  openEditModal: (task: AgendaItem) => void;
  closeTaskModal: () => void;
  isExportModalOpen: boolean;
  setIsExportModalOpen: (open: boolean) => void;
  isSettingsModalOpen: boolean;
  setIsSettingsModalOpen: (open: boolean) => void;

  // Active reminder alert modal
  activeReminder: AgendaItem | null;
  dismissActiveReminder: () => void;

  // Task Actions
  addTask: (data: Omit<AgendaItem, 'id' | 'createdAt' | 'updatedAt'>) => AgendaItem;
  updateTask: (id: string, updates: Partial<AgendaItem>) => void;
  deleteTask: (id: string) => void;
  toggleComplete: (id: string) => void;
  snoozeTask: (id: string, minutes?: number) => void;
  clearCompleted: () => void;
  resetToDefaults: () => void;

  // Category Actions
  addCategory: (name: string, color: string) => Category;
  deleteCategory: (id: string) => void;

  // Settings & Notifications
  updateSettings: (updates: Partial<NotificationSettings>) => void;
  browserPermission: NotificationPermissionState;
  requestNotificationPermission: () => Promise<void>;
  testNotification: () => void;
  exportJSON: () => string;
  importJSON: (jsonStr: string) => boolean;

  // Stats
  stats: {
    total: number;
    completed: number;
    pendingToday: number;
    overdueToday: number;
    highPriority: number;
  };
}

const AgendaContext = createContext<AgendaContextType | null>(null);

export const AgendaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<AgendaItem[]>(() => storageService.loadTasks());
  const [categories, setCategories] = useState<Category[]>(() => storageService.loadCategories());
  const [settings, setSettings] = useState<NotificationSettings>(() => storageService.loadSettings());
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => storageService.loadTheme());
  const [viewMode, setViewMode] = useState<ViewMode>('today');
  const [browserPermission, setBrowserPermission] = useState<NotificationPermissionState>(() =>
    NotificationManager.getPermissionState()
  );

  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: '',
    categoryId: 'all',
    priority: 'all',
  });

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<AgendaItem | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [activeReminder, setActiveReminder] = useState<AgendaItem | null>(null);

  // Sync theme with HTML root class
  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    storageService.saveTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Persist tasks & categories on change
  useEffect(() => {
    storageService.saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    storageService.saveCategories(categories);
  }, [categories]);

  useEffect(() => {
    storageService.saveSettings(settings);
  }, [settings]);

  // Modal openers
  const openCreateModal = useCallback((prefillDate?: string, prefillTime?: string) => {
    setEditingTask(prefillDate ? ({
      id: '',
      title: '',
      dueDate: prefillDate,
      startTime: prefillTime || '10:00',
      priority: 'medium',
      categoryId: categories[0]?.id || 'cat-work',
      completed: false,
      reminderOffset: settings.defaultOffset,
      createdAt: '',
      updatedAt: '',
    } as AgendaItem) : null);
    setIsTaskModalOpen(true);
  }, [categories, settings.defaultOffset]);

  const openEditModal = useCallback((task: AgendaItem) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  }, []);

  const closeTaskModal = useCallback(() => {
    setIsTaskModalOpen(false);
    setEditingTask(null);
  }, []);

  // CRUD
  const addTask = useCallback((data: Omit<AgendaItem, 'id' | 'createdAt' | 'updatedAt'>): AgendaItem => {
    const now = new Date().toISOString();
    const newTask: AgendaItem = {
      ...data,
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: now,
      updatedAt: now,
      reminderTriggered: false,
    };
    setTasks(prev => [newTask, ...prev]);
    return newTask;
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<AgendaItem>) => {
    setTasks(prev =>
      prev.map(item => {
        if (item.id === id) {
          // If due date or start time changed, reset reminderTriggered
          const timeChanged =
            (updates.dueDate && updates.dueDate !== item.dueDate) ||
            (updates.startTime && updates.startTime !== item.startTime) ||
            (updates.reminderOffset !== undefined && updates.reminderOffset !== item.reminderOffset);

          return {
            ...item,
            ...updates,
            reminderTriggered: timeChanged ? false : item.reminderTriggered,
            updatedAt: new Date().toISOString(),
          };
        }
        return item;
      })
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(item => item.id !== id));
    if (activeReminder?.id === id) {
      setActiveReminder(null);
    }
  }, [activeReminder]);

  const toggleComplete = useCallback((id: string) => {
    setTasks(prev =>
      prev.map(item => {
        if (item.id === id) {
          const nextCompleted = !item.completed;
          if (nextCompleted && settings.soundEnabled) {
            soundService.playTaskComplete();
          }
          return {
            ...item,
            completed: nextCompleted,
            completedAt: nextCompleted ? new Date().toISOString() : undefined,
            updatedAt: new Date().toISOString(),
          };
        }
        return item;
      })
    );
    if (activeReminder?.id === id) {
      setActiveReminder(null);
    }
  }, [activeReminder, settings.soundEnabled]);

  const snoozeTask = useCallback((id: string, minutes: number = 5) => {
    // Postpone the reminder by adjusting startTime or setting temporary offset
    setTasks(prev =>
      prev.map(item => {
        if (item.id === id) {
          const now = new Date();
          now.setMinutes(now.getMinutes() + minutes);
          const hours = String(now.getHours()).padStart(2, '0');
          const mins = String(now.getMinutes()).padStart(2, '0');
          const today = getTodayDateString(0);

          return {
            ...item,
            dueDate: today,
            startTime: `${hours}:${mins}`,
            reminderOffset: 0,
            reminderTriggered: false,
            updatedAt: new Date().toISOString(),
          };
        }
        return item;
      })
    );
    setActiveReminder(null);
  }, []);

  const clearCompleted = useCallback(() => {
    setTasks(prev => prev.filter(t => !t.completed));
  }, []);

  const resetToDefaults = useCallback(() => {
    const samples = generateInitialSampleItems();
    setTasks(samples);
    setCategories(DEFAULT_CATEGORIES);
    setSettings(DEFAULT_SETTINGS);
    storageService.saveTasks(samples);
    storageService.saveCategories(DEFAULT_CATEGORIES);
    storageService.saveSettings(DEFAULT_SETTINGS);
  }, []);

  const addCategory = useCallback((name: string, color: string): Category => {
    const newCat: Category = {
      id: `cat_${Date.now()}`,
      name: name.trim(),
      color,
    };
    setCategories(prev => [...prev, newCat]);
    return newCat;
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    // Reassign items with that category to default
    const fallbackId = categories.find(c => c.id !== id)?.id || 'cat-work';
    setTasks(prev =>
      prev.map(t => (t.categoryId === id ? { ...t, categoryId: fallbackId } : t))
    );
  }, [categories]);

  const updateSettings = useCallback((updates: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const requestNotificationPermission = useCallback(async () => {
    const state = await NotificationManager.requestPermission();
    setBrowserPermission(state);
  }, []);

  const testNotification = useCallback(() => {
    soundService.playReminderChime();
    if (NotificationManager.getPermissionState() === 'granted') {
      new Notification('🔔 Agenda Reminder Test', {
        body: 'Audio and browser notifications are successfully active for your agenda!',
      });
    }
  }, []);

  const dismissActiveReminder = useCallback(() => {
    setActiveReminder(null);
  }, []);

  const exportJSON = useCallback(() => {
    return storageService.exportJSON(tasks, categories, settings);
  }, [tasks, categories, settings]);

  const importJSON = useCallback((jsonStr: string): boolean => {
    try {
      const data = storageService.importJSON(jsonStr);
      setTasks(data.tasks);
      setCategories(data.categories);
      setSettings(data.settings);
      storageService.saveTasks(data.tasks);
      storageService.saveCategories(data.categories);
      storageService.saveSettings(data.settings);
      return true;
    } catch (err) {
      console.error('Import error:', err);
      return false;
    }
  }, []);

  // Smart Reminder Monitor Loop
  useEffect(() => {
    if (!settings.enabled) return;

    const checkReminders = () => {
      const nowMs = Date.now();

      tasks.forEach(item => {
        if (item.completed || item.reminderOffset === -1 || item.reminderTriggered) {
          return;
        }

        const triggerTime = NotificationManager.getReminderTriggerTime(item);
        if (!triggerTime) return;

        // If trigger time reached within the last 15 minutes (or currently due)
        const diffMs = nowMs - triggerTime;
        if (diffMs >= 0 && diffMs < 15 * 60 * 1000) {
          // Trigger reminder!
          NotificationManager.triggerReminder(item, {
            playSound: settings.soundEnabled,
            useBrowserNotification: settings.browserNotifications,
          });

          // Show in-app banner/modal
          setActiveReminder(item);

          // Mark triggered in state
          updateTask(item.id, { reminderTriggered: true });
        }
      });
    };

    // Run initial check
    checkReminders();
    // Periodic check every 10 seconds
    const interval = setInterval(checkReminders, 10000);
    return () => clearInterval(interval);
  }, [tasks, settings, updateTask]);

  // Filtered tasks computation
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (filters.categoryId !== 'all' && task.categoryId !== filters.categoryId) {
        return false;
      }
      if (filters.priority !== 'all' && task.priority !== filters.priority) {
        return false;
      }
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase();
        const matchTitle = task.title.toLowerCase().includes(query);
        const matchDesc = task.description?.toLowerCase().includes(query) || false;
        if (!matchTitle && !matchDesc) return false;
      }
      return true;
    });
  }, [tasks, filters]);

  // Statistics calculation
  const stats = useMemo(() => {
    const todayStr = getTodayDateString(0);
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const todayTasks = tasks.filter(t => t.dueDate === todayStr && !t.completed);
    const pendingToday = todayTasks.length;

    const now = new Date();
    const currentHours = now.getHours();
    const currentMins = now.getMinutes();
    const currentTimeVal = currentHours * 60 + currentMins;

    const overdueToday = todayTasks.filter(t => {
      if (!t.startTime) return false;
      const [h, m] = t.startTime.split(':').map(Number);
      return (h * 60 + m) < currentTimeVal;
    }).length;

    const highPriority = tasks.filter(t => !t.completed && t.priority === 'high').length;

    return {
      total,
      completed,
      pendingToday,
      overdueToday,
      highPriority,
    };
  }, [tasks]);

  return (
    <AgendaContext.Provider
      value={{
        tasks,
        categories,
        settings,
        theme,
        setTheme,
        viewMode,
        setViewMode,
        filters,
        setFilters,
        filteredTasks,
        isTaskModalOpen,
        editingTask,
        openCreateModal,
        openEditModal,
        closeTaskModal,
        isExportModalOpen,
        setIsExportModalOpen,
        isSettingsModalOpen,
        setIsSettingsModalOpen,
        activeReminder,
        dismissActiveReminder,
        addTask,
        updateTask,
        deleteTask,
        toggleComplete,
        snoozeTask,
        clearCompleted,
        resetToDefaults,
        addCategory,
        deleteCategory,
        updateSettings,
        browserPermission,
        requestNotificationPermission,
        testNotification,
        exportJSON,
        importJSON,
        stats,
      }}
    >
      {children}
    </AgendaContext.Provider>
  );
};

export const useAgenda = () => {
  const context = useContext(AgendaContext);
  if (!context) {
    throw new Error('useAgenda must be used within an AgendaProvider');
  }
  return context;
};
