import { AgendaItem, ReminderOffset } from '../types';
import { soundService } from './sound';

export type NotificationPermissionState = 'granted' | 'denied' | 'default' | 'unsupported';

export class NotificationManager {
  public static isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  public static getPermissionState(): NotificationPermissionState {
    if (!this.isSupported()) return 'unsupported';
    return Notification.permission as NotificationPermissionState;
  }

  public static async requestPermission(): Promise<NotificationPermissionState> {
    if (!this.isSupported()) return 'unsupported';
    try {
      const permission = await Notification.requestPermission();
      return permission as NotificationPermissionState;
    } catch {
      return 'denied';
    }
  }

  /**
   * Calculates the Unix timestamp (milliseconds) when a reminder should fire.
   * If no time is set, defaults to 09:00 AM on that date.
   */
  public static getReminderTriggerTime(item: AgendaItem): number | null {
    if (item.reminderOffset === -1 || item.completed) {
      return null;
    }

    const timeStr = item.startTime || '09:00';
    const [hours, minutes] = timeStr.split(':').map(Number);

    // Create date from YYYY-MM-DD
    const [year, month, day] = item.dueDate.split('-').map(Number);
    if (!year || !month || !day) return null;

    const eventDate = new Date(year, month - 1, day, hours || 0, minutes || 0, 0, 0);
    const eventTimeMs = eventDate.getTime();

    // Subtract reminderOffset minutes
    const offsetMs = item.reminderOffset * 60 * 1000;
    return eventTimeMs - offsetMs;
  }

  /**
   * Triggers a reminder with optional browser notification and audio chime
   */
  public static triggerReminder(
    item: AgendaItem,
    options: { playSound?: boolean; useBrowserNotification?: boolean } = {}
  ): void {
    const { playSound = true, useBrowserNotification = true } = options;

    if (playSound) {
      soundService.playReminderChime();
    }

    if (useBrowserNotification && this.getPermissionState() === 'granted') {
      try {
        const offsetText = this.getOffsetLabel(item.reminderOffset);
        const title = `Reminder: ${item.title}`;
        const timeDetail = item.startTime ? `Scheduled for ${item.startTime}` : `Due today`;
        const body = `${timeDetail} (${offsetText})\n${item.description || 'Tap to view your agenda.'}`;

        const notification = new Notification(title, {
          body,
          icon: '/favicon.ico',
          tag: `agenda-reminder-${item.id}`,
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      } catch (err) {
        console.warn('Could not display system notification:', err);
      }
    }
  }

  public static getOffsetLabel(offset: ReminderOffset): string {
    switch (offset) {
      case -1:
        return 'No reminder';
      case 0:
        return 'At event time';
      case 5:
        return '5 minutes before';
      case 15:
        return '15 minutes before';
      case 30:
        return '30 minutes before';
      case 60:
        return '1 hour before';
      case 1440:
        return '1 day before';
      default:
        return `${offset}m before`;
    }
  }
}
