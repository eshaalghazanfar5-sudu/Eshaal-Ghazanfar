import { AgendaItem, Category, NotificationSettings } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-work', name: 'Work & Projects', color: '#3b82f6' },
  { id: 'cat-meeting', name: 'Meetings', color: '#8b5cf6' },
  { id: 'cat-personal', name: 'Personal & Errand', color: '#10b981' },
  { id: 'cat-health', name: 'Health & Fitness', color: '#f43f5e' },
  { id: 'cat-study', name: 'Study & Learning', color: '#f59e0b' },
];

export const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  soundEnabled: true,
  browserNotifications: true,
  defaultOffset: 15,
};

export function getTodayDateString(offsetDays = 0): string {
  const d = new Date();
  if (offsetDays !== 0) {
    d.setDate(d.getDate() + offsetDays);
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function generateInitialSampleItems(): AgendaItem[] {
  const today = getTodayDateString(0);
  const tomorrow = getTodayDateString(1);
  const now = new Date();
  const nextHour = String((now.getHours() + 1) % 24).padStart(2, '0');
  const laterHour = String((now.getHours() + 3) % 24).padStart(2, '0');

  return [
    {
      id: 'sample-1',
      title: 'Review Sprint Objectives & Daily Standup',
      description: 'Align with engineering team on backlog and deploy milestone',
      dueDate: today,
      startTime: `${nextHour}:00`,
      endTime: `${nextHour}:30`,
      priority: 'high',
      categoryId: 'cat-meeting',
      completed: false,
      reminderOffset: 15,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'sample-2',
      title: 'Finalize Project Proposal & Architecture',
      description: 'Complete system diagrams and review with stakeholders',
      dueDate: today,
      startTime: `${laterHour}:00`,
      endTime: `${laterHour}:45`,
      priority: 'high',
      categoryId: 'cat-work',
      completed: false,
      reminderOffset: 30,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'sample-3',
      title: 'Cardio & Strength Training Session',
      description: '45 mins HIIT workout at community fitness club',
      dueDate: today,
      startTime: '18:00',
      endTime: '19:00',
      priority: 'medium',
      categoryId: 'cat-health',
      completed: false,
      reminderOffset: 15,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'sample-4',
      title: 'Read 2 Chapters on Cloud Native Architecture',
      description: 'Deep dive into distributed queue patterns',
      dueDate: tomorrow,
      startTime: '10:00',
      endTime: '11:00',
      priority: 'low',
      categoryId: 'cat-study',
      completed: false,
      reminderOffset: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'sample-5',
      title: 'Grocery Run & Home Essentials',
      description: 'Fresh fruits, vegetables, almond milk, and coffee beans',
      dueDate: today,
      startTime: '08:00',
      priority: 'low',
      categoryId: 'cat-personal',
      completed: true,
      completedAt: new Date(Date.now() - 3600000).toISOString(),
      reminderOffset: -1,
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      updatedAt: new Date(Date.now() - 3600000).toISOString(),
    },
  ];
}

const STORAGE_KEYS = {
  TASKS: 'agenda_tasks_v1',
  CATEGORIES: 'agenda_categories_v1',
  SETTINGS: 'agenda_settings_v1',
  THEME: 'agenda_theme_v1',
};

export const storageService = {
  loadTasks(): AgendaItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (!data) {
        const samples = generateInitialSampleItems();
        this.saveTasks(samples);
        return samples;
      }
      return JSON.parse(data);
    } catch {
      return generateInitialSampleItems();
    }
  },

  saveTasks(tasks: AgendaItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    } catch (e) {
      console.error('Failed to save tasks to LocalStorage', e);
    }
  },

  loadCategories(): Category[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (!data) {
        this.saveCategories(DEFAULT_CATEGORIES);
        return DEFAULT_CATEGORIES;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_CATEGORIES;
    }
  },

  saveCategories(categories: Category[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      console.error('Failed to save categories', e);
    }
  },

  loadSettings(): NotificationSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) return DEFAULT_SETTINGS;
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: NotificationSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  },

  loadTheme(): 'light' | 'dark' {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME);
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  },

  saveTheme(theme: 'light' | 'dark'): void {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch (e) {
      console.error('Failed to save theme', e);
    }
  },

  exportJSON(tasks: AgendaItem[], categories: Category[], settings: NotificationSettings): string {
    return JSON.stringify(
      {
        version: 1,
        exportedAt: new Date().toISOString(),
        tasks,
        categories,
        settings,
      },
      null,
      2
    );
  },

  importJSON(jsonString: string): { tasks: AgendaItem[]; categories: Category[]; settings: NotificationSettings } {
    const parsed = JSON.parse(jsonString);
    if (!Array.isArray(parsed.tasks)) {
      throw new Error('Invalid JSON format: missing tasks array');
    }
    return {
      tasks: parsed.tasks,
      categories: Array.isArray(parsed.categories) ? parsed.categories : DEFAULT_CATEGORIES,
      settings: parsed.settings ? { ...DEFAULT_SETTINGS, ...parsed.settings } : DEFAULT_SETTINGS,
    };
  },
};
