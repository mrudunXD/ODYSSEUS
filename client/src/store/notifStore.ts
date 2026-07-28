import { create } from 'zustand';
import { NotificationItem } from '../types';

interface NotifState {
  notifications: NotificationItem[];
  unreadCount: number;
  markAllAsRead: () => void;
  markAsRead: (id: string) => void;
  addNotification: (notif: Omit<NotificationItem, 'id' | 'createdAt' | 'isRead'>) => void;
}

const initialNotifications: NotificationItem[] = [
  {
    id: 'NOTIF-01',
    userId: 'USR-ADMIN-01',
    title: 'Cheque Realized',
    message: 'HDFC Cheque CHQ-778901 (₹12,500.00) cleared successfully.',
    type: 'PAYMENT_RECEIVED',
    isRead: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'NOTIF-02',
    userId: 'USR-ADMIN-01',
    title: 'Automated Late Fee Applied',
    message: '₹50/day penalty added to 5 overdue Grade 10 student accounts.',
    type: 'INVOICE_OVERDUE',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'NOTIF-03',
    userId: 'USR-ADMIN-01',
    title: 'Merit Scholarship Approved',
    message: 'Waiver of ₹2,500 approved for Sofia Martinez (Grade 12).',
    type: 'WAIVER_APPROVED',
    isRead: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

export const useNotifStore = create<NotifState>((set) => ({
  notifications: initialNotifications,
  unreadCount: initialNotifications.filter((n) => !n.isRead).length,
  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    })),
  markAsRead: (id) =>
    set((state) => {
      const updated = state.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n));
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.isRead).length,
      };
    }),
  addNotification: (notifData) =>
    set((state) => {
      const newNotif: NotificationItem = {
        ...notifData,
        id: `NOTIF-${Math.floor(100 + Math.random() * 900)}`,
        createdAt: new Date().toISOString(),
        isRead: false,
      };
      const updated = [newNotif, ...state.notifications];
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.isRead).length,
      };
    }),
}));
