export type NotificationHistory = {
    key: string;
    data: Notification | { banner: Notification['data']["banner"]; };
    time: number;
}


const STORAGE_KEY_HISTORY = 'notification_history';
const STORAGE_KEY_LAST_READ = 'notification_last_read';
const MAX_HISTORY_SIZE = 64;



/**
 * Get history from localStorage
 * @returns {NotificationHistory[]} Notification history
 */
function getStoredHistory(): NotificationHistory[] {
    try {
        const stored = localStorage.getItem(STORAGE_KEY_HISTORY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error('Failed to load notification history:', e);
        return [];
    }
}

/**
 * Save history to localStorage
 * @param {NotificationHistory[]} history - Array of notification history items
 */
function saveHistory(history: NotificationHistory[]) {
    try {
        // Cap history size
        if (history.length > MAX_HISTORY_SIZE) {
            history.sort((a: { time: number; }, b: { time: number; }) => a.time - b.time);
            history = history.slice(history.length - MAX_HISTORY_SIZE);
        }
        localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
    } catch (e) {
        console.error('Failed to save notification history:', e);
    }
}

/**
 * Add to history
 * @param {string} key - Unique key for the notification
 * @param {Object} data - Notification data containing banner info
 * @param {Object} data.banner - Banner notification data (for history)
 * @param {string} [data.banner.title] - Banner title
 * @param {string} [data.banner.body] - Banner body text
 * @param {string} [data.banner.icon] - Path to icon
 */
export function addToHistory(key: string, data: { banner: Notification['data']["banner"]; }) {
    if (!data.banner) return;

    const history = getStoredHistory();

    history.push({
        key,
        data,
        time: Date.now()
    });
    saveHistory(history);
}



/**
 * Get notification history
 * @param {number | null} [fromTime] - Unix timestamp to filter notifications from (null = all)
 * @returns {Promise<NotificationHistory[]>} Array of notification containers with {key, data, time}
 */
export async function getNotificationHistory(fromTime: number | null = null): Promise<NotificationHistory[]> {
    let history = getStoredHistory();

    // Sort by time descending
    history.sort((a: { time: number; }, b: { time: number; }) => b.time - a.time);

    // Filter by time if provided
    if (fromTime !== null && typeof fromTime === 'number') {
        history = history.filter((n: { time: number; }) => n.time >= fromTime);
    }

    return history;
}

/**
 * Get the count of unread notifications
 * @returns {Promise<number>} Number of unread notifications
 */
export async function getUnreadNotificationCount(): Promise<number> {
    const lastRead = await getLastReadTimestamp();
    const history = await getNotificationHistory();
    return history.filter((n: { time: number; }) => n.time > lastRead).length;
}



/**
 * Set the last read timestamp for notifications
 * @param {number} timestamp - Unix timestamp of when notifications were last read
 * @returns {Promise<void>}
 */
export async function setLastReadTimestamp(timestamp: number): Promise<void> {
    try {
        localStorage.setItem(STORAGE_KEY_LAST_READ, timestamp.toString());
        // Emit custom event for badge updates
        window.dispatchEvent(new CustomEvent('notification-badge-update', {
            detail: { count: await getUnreadNotificationCount() }
        }));
    } catch (e) {
        console.error('Failed to set last read timestamp:', e);
    }
}

/**
 * Get the last read timestamp for notifications
 * @returns {Promise<number>} Unix timestamp of when notifications were last read
 */
export async function getLastReadTimestamp(): Promise<number> {
    try {
        const timestamp = localStorage.getItem(STORAGE_KEY_LAST_READ);
        return timestamp ? parseInt(timestamp, 10) : 0;
    } catch (e) {
        console.error('Failed to get last read timestamp:', e);
        return 0;
    }
}