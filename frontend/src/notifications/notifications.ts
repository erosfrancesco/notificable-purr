import { requestPermission } from './permission';
import { addToHistory } from './history';


export type PushNotificationOptions = NotificationOptions & { save?: boolean; time?: number | null };
type BrowserNotification = Pick<Notification['data'], 'toast'>;


// In-memory scheduled notification timeouts
const scheduledTimeouts = new Map();


/**
 * Show a browser notification
 * @param {string} key - Unique key for the notification
 * @param {BrowserNotification} data - Notification data
 * @returns {Notification | undefined} The created Notification object, or undefined if not shown
 */
export function showBrowserNotification(key: string, data: BrowserNotification): Notification | undefined {
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
export async function pushNotification(key: string, data: Notification['data'], options: PushNotificationOptions | null = null): Promise<void> {
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
export async function clearNotification(key: any): Promise<void> {
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
 * @param {string | null} [action] - Optional action URL or path
 * @returns {Promise<void>}
 */
export async function showSimpleNotification(title: any, body: any, action: string | null = null): Promise<void> {
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
