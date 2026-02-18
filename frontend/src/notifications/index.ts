import { useState, useEffect, useCallback } from 'react';
import { requestPermission } from './permission';
import {
    getLastReadTimestamp, setLastReadTimestamp,
    getNotificationHistory, addToHistory,
    getUnreadNotificationCount, NotificationHistory
} from './history';


type PushNotificationOptions = NotificationOptions & { save?: boolean; time?: number | null };


// Browser-based notification implementation using Web Notification API and localStorage

// In-memory scheduled notification timeouts
const scheduledTimeouts = new Map();



/**
 * Show a browser notification
 */
function showBrowserNotification(key: string, data: { toast: Notification['data']['toast']; }) {
    const { toast } = data;

    if (!toast) return;

    const options: NotificationOptions = {
        body: toast.body || '',
        icon: toast.icon || undefined,
        tag: key,
        requireInteraction: false,
    };

    const notification = new Notification(toast.title || '', options);

    notification.onclick = () => {
        if (toast.action) {
            if (toast.action.startsWith('http')) {
                window.open(toast.action, '_blank');
            } else {
                // Navigate within app
                window.location.hash = toast.action;
            }
        }
        notification.close();
    };

    return notification;
}



/**
 * Push a notification to the queue
 * @param {string} key - Unique key for the notification
 * @param {Object} data - Notification data
 * @param {Object} data.toast - Toast notification data
 * @param {string} [data.toast.title] - Toast title
 * @param {string} [data.toast.body] - Toast body text
 * @param {string} [data.toast.icon] - Path to icon
 * @param {string} [data.toast.action] - Action URL or path
 * @param {Object} [data.banner] - Banner notification data (for history)
 * @param {string} [data.banner.title] - Banner title
 * @param {string} [data.banner.body] - Banner body text
 * @param {string} [data.banner.icon] - Path to icon
 * @param {Object} [options] - Notification options
 * @param {boolean} [options.save=true] - Whether to save to history
 * @param {number} [options.time] - Unix timestamp when to show (null = now)
 * @returns {Promise<void>}
 */
export async function pushNotification(key: string, data: Notification['data'], options: PushNotificationOptions | null = null) {
    const opts = options || {};
    const save = opts.save !== false;

    // Clear any existing scheduled notification with this key
    await clearNotification(key);

    const hasPermission = await requestPermission();
    if (!hasPermission) {
        console.warn('Notification permission not granted');
        if (save) {
            addToHistory(key, data);
        }
        return;
    }

    // Show immediately
    if (!opts.time || opts.time <= Date.now()) {
        showBrowserNotification(key, data);
        if (save) {
            addToHistory(key, data);
        }
    } else {
        // Schedule for later
        const delay = opts.time - Date.now();
        const timeoutId = setTimeout(() => {
            showBrowserNotification(key, data);
            if (save) {
                addToHistory(key, data);
            }
            scheduledTimeouts.delete(key);
        }, delay);

        scheduledTimeouts.set(key, {
            timeoutId,
            key,
            data,
            time: opts.time,
            save
        });
    }
}

/**
 * Clear a notification from the queue
 * @param {string} key - Unique key of the notification to clear
 * @returns {Promise<void>}
 */
export async function clearNotification(key: any) {
    const scheduled = scheduledTimeouts.get(key);
    if (scheduled) {
        clearTimeout(scheduled.timeoutId);
        scheduledTimeouts.delete(key);
    }
}






/**
 * Helper function to create a simple notification immediately
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {string} [action] - Optional action URL or path
 * @returns {Promise<void>}
 */
export async function showSimpleNotification(title: any, body: any, action = null) {
    const key = `notification-${Date.now()}`;
    const data = {
        toast: { title, body, icon: null, action },
        banner: { title, body, icon: null }
    };
    return pushNotification(key, data, { save: true, time: null });
}

/**
 * Helper function to schedule a notification
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {number} delayMs - Delay in milliseconds before showing
 * @param {string | null} [action] - Optional action URL or path
 * @returns {Promise<void>}
 */
export async function scheduleNotification(title: string, body: string, delayMs: number, action: string | null = null): Promise<void> {
    const key = `scheduled-${Date.now()}`;
    const data = {
        toast: { title, body, icon: null, action },
        banner: { title, body, icon: null }
    };
    const options = {
        save: true,
        time: Date.now() + delayMs
    };
    return pushNotification(key, data, options);
}

/**
 * Mark all notifications as read
 * @returns {Promise<void>}
 */
export async function markAllNotificationsAsRead() {
    return setLastReadTimestamp(Date.now());
}

export function useNotifications() {
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
                const data = (n.data as { banner: any })?.banner || {};
                return {
                    ...data,
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
    const push = useCallback(async (key: any, data: any, options = null) => {
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
        show,
        schedule,
        markAsRead,
        refresh
    };
}
