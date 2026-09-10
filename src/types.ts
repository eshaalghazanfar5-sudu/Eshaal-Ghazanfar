export type Priority = 'high' | 'medium' | 'low';

export type ReminderOffset = -1 | 0 | 5 | 15 | 30 | 60 | 1440;

export interface Category {
  id: string;
  name: string;
  color: string; // Tailwind color class or hex
}

export interface AgendaItem {
  id: string;
  title: string;
  description?: string;
  dueDate: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  priority: Priority;
  categoryId: string;
  completed: boolean;
  completedAt?: string;
  reminderOffset: ReminderOffset; // -1 for disabled, 0 for on-time, 5 for 5m before, etc.
  reminderTriggered?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationSettings {
  enabled: boolean;
  soundEnabled: boolean;
  browserNotifications: boolean;
  defaultOffset: ReminderOffset;
}

export type ViewMode = 'today' | 'upcoming' | 'completed' | 'calendar';

export interface FilterOptions {
  searchQuery: string;
  categoryId: string | 'all';
  priority: Priority | 'all';
}

export interface ReminderTriggerEvent {
  item: AgendaItem;
  triggeredAt: string;
  offsetMinutes: number;
}
