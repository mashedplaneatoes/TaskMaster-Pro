// Utility functions for the application

// Format date to display
function formatDate(date) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
}

// Format time to display
function formatTime(date) {
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

// Format duration in seconds to MM:SS or HH:MM:SS
function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
        return `${padZero(hours)}:${padZero(minutes)}:${padZero(secs)}`;
    }
    return `${padZero(minutes)}:${padZero(secs)}`;
}
// Format duration for stats (e.g., "2h 30m")
function formatDurationForStats(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
}

// Pad a number with leading zero if needed
function padZero(num) {
    return num.toString().padStart(2, '0');
}

// Generate a unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// Save data to localStorage
function saveToLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// Load data from localStorage
function loadFromLocalStorage(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}

// Show a notification
function showNotification(title, message) {
    const settings = loadFromLocalStorage('settings') || {};
    
    if (settings.enableNotifications) {
        if (Notification.permission === 'granted') {
            const notification = new Notification(title, {
                body: message,
                icon: '/assets/icons/logo.png'
            });
            
            if (settings.soundNotifications) {
                playNotificationSound();
            }
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    showNotification(title, message);
                }
            });
        }
    }
}

// Play notification sound
function playNotificationSound() {
    const audio = new Audio('/assets/sounds/notification.mp3');
    audio.play();
}

// Format date for input fields (YYYY-MM-DD)
function formatDateForInput(date) {
    const d = new Date(date);
    return `${d.getFullYear()}-${padZero(d.getMonth() + 1)}-${padZero(d.getDate())}`;
}

// Format time for input fields (HH:MM)
function formatTimeForInput(date) {
    const d = new Date(date);
    return `${padZero(d.getHours())}:${padZero(d.getMinutes())}`;
}

// Debounce function to limit how often a function can be called
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

// Export functions
window.utils = {
    formatDate,
    formatTime,
    formatDuration,
    formatDurationForStats,
    padZero,
    generateId,
    saveToLocalStorage,
    loadFromLocalStorage,
    showNotification,
    formatDateForInput,
    formatTimeForInput,
    debounce
};



