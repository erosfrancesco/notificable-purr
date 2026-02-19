// Browser-based notification implementation using Web Notification API and localStorage

import { useState, useEffect, useCallback } from 'react';
import {
    getLastReadTimestamp, setLastReadTimestamp as historySetLastReadTimestamp,
    getNotificationHistory,
    getUnreadNotificationCount, NotificationHistory
} from './history';
import { clearNotification, pushNotification, PushNotificationOptions, scheduleNotification } from './notifications';

export * from './notifications';
export type { NotificationHistory } from './history';


/**
 * Mark all notifications as read
 * @returns {Promise<void>}
 */
export async function markAllNotificationsAsRead(): Promise<void> {
    return historySetLastReadTimestamp(Date.now());
}


export function useNotifications(): {
    history: NotificationHistory[];
    newNotifications: NotificationHistory[];
    oldNotifications: NotificationHistory[];
    unreadCount: number;
    isLoading: boolean;
    lastReadTimestamp: number;

    push: (key: string, data: Notification['data'], options?: PushNotificationOptions | null) => Promise<void>;
    clear: (key: string) => Promise<void>;
    // show: (title: string, body: any, action?: any) => Promise<void>;
    schedule: (title: string, body: string, delayMs: number, action?: any) => Promise<void>;
    markAsRead: () => Promise<void>;
    refresh: () => Promise<void>;
} {
    const [history, setHistory] = useState<NotificationHistory[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [lastReadTimestamp, setLastReadTimestamp] = useState(0);
    const [rangeTimestamp] = useState(new Date().setDate(new Date().getDate() - 7)); // Last 7 days, computed only at mount

    // Refresh history and unread count
    const refresh = useCallback(async () => {
        try {
            const [historyData, count, lastRead] = await Promise.all([
                getNotificationHistory(rangeTimestamp),
                getUnreadNotificationCount(),
                getLastReadTimestamp()
            ]);

            setHistory(historyData.map((n) => {
                return {
                    ...n,
                    time: n?.time
                };
            }));

            setUnreadCount(count);
            setLastReadTimestamp(lastRead);
        } catch (error) {
            console.error('Failed to refresh notifications:', error);
        }
    }, [rangeTimestamp]);

    // Mark all as read
    const markAsRead = useCallback(async () => {
        try {
            await markAllNotificationsAsRead();
            setUnreadCount(0);
            await refresh(); // Refresh to update lastReadTimestamp
        } catch (error) {
            console.error('Failed to mark notifications as read:', error);
        }
    }, [refresh]);

    // Push a new notification
    const push = useCallback(async (key: string, data: Notification['data'], options: PushNotificationOptions | null = null) => {
        try {
            await pushNotification(key, data, options);
            await refresh();
        } catch (error) {
            console.error('Failed to push notification:', error);
        }
    }, [refresh]);

    // Clear a notification
    const clear = useCallback(async (key: any) => {
        try {
            await clearNotification(key);
            await refresh();
        } catch (error) {
            console.error('Failed to clear notification:', error);
        }
    }, [refresh]);

    /*
    // Show a simple notification
    const show = useCallback(async (title: any, body: any, action = null) => {
        try {
            // TODO: -
            // await showNotification(title, body, action);
            await refresh();
        } catch (error) {
            console.error('Failed to show notification:', error);
        }
    }, [refresh]);
    /** */

    // Schedule a notification
    const schedule = useCallback(async (title: string, body: string, delayMs: number, action = null) => {
        try {
            await scheduleNotification(title, body, delayMs, action);
            await refresh();
        } catch (error) {
            console.error('Failed to schedule notification:', error);
        }
    }, [refresh]);

    // Subscribe to notification events
    useEffect(() => {
        // Initial load
        refresh().finally(() => setIsLoading(false));
    }, [refresh]);

    // Split history into new and old notifications
    const newNotifications = history.filter(n => n.time > lastReadTimestamp);
    const oldNotifications = history.filter(n => n.time <= lastReadTimestamp);

    return {
        // State
        history,
        newNotifications,
        oldNotifications,
        unreadCount,
        isLoading,
        lastReadTimestamp,

        // Methods
        push,
        clear,
        // show,
        schedule,
        markAsRead,
        refresh
    };
}
