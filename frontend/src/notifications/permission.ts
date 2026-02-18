/**
 * Request notification permission if not already granted
 */
export async function requestPermission() {
    if (!('Notification' in window)) {
        console.warn('This browser does not support notifications');
        return false;
    }

    if (Notification.permission === 'granted') {
        return true;
    }

    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }

    return false;
}



// Initialize: request permission on load
if ('Notification' in window && Notification.permission === 'default') {
    // Don't auto-request, wait for user interaction
    console.log('Notification permission not yet granted. Will request on first notification.');
}
