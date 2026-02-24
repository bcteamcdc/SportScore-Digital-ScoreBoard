/**
 * SportMeet 2026 - PWA Next Level Features
 * This script implements advanced PWA capabilities for deeper OS integration.
 */

class PWANextLevel {
    constructor() {
        this.init();
    }

    async init() {
        this.registerPeriodicSync();
        this.handleWindowControls();
        this.setupBadging();
        this.setupAppShortcuts();
    }

    /**
     * Periodic Background Sync for scores
     */
    async registerPeriodicSync() {
        if (!('serviceWorker' in navigator)) return;
        
        try {
            const registration = await navigator.serviceWorker.ready;
            
            if (!registration || !('periodicSync' in registration)) {
                return;
            }
            
            const status = await navigator.permissions.query({
                name: 'periodic-background-sync',
            });

            if (status.state === 'granted') {
                await registration.periodicSync.register('sync-scores', {
                    minInterval: 24 * 60 * 60 * 1000,
                });
                console.log('Periodic Sync registered');
            }
        } catch (error) {
            console.log('Periodic Sync could not be registered:', error);
        }
    }

    /**
     * Handle Window Controls Overlay (for custom title bars)
     */
    handleWindowControls() {
        if ('windowControlsOverlay' in navigator) {
            navigator.windowControlsOverlay.addEventListener('geometrychange', (event) => {
                if (event.visible) {
                    document.body.classList.add('wco-active');
                    // Adjust your header padding/margin if needed
                } else {
                    document.body.classList.remove('wco-active');
                }
            });
        }
    }

    /**
     * App Badging API (Shows count on app icon)
     */
    async setupBadging() {
        if ('setAppBadge' in navigator) {
            // Check for new updates every time the app logic refreshes data
            window.addEventListener('data-updated', (event) => {
                const updateCount = event.detail.count || 1;
                navigator.setAppBadge(updateCount).catch((error) => {
                    console.error('Error setting badge:', error);
                });
            });

            // Clear badge when app is opened or focused
            window.addEventListener('focus', () => {
                navigator.clearAppBadge().catch((error) => {
                    console.error('Error clearing badge:', error);
                });
            });
        }
    }

    /**
     * App Shortcuts (Dynamic updates if needed)
     */
    setupAppShortcuts() {
        // You can dynamically update shortcuts here if the API becomes fully supported
        // and you have user-specific needs.
    }

    /**
     * Web Share API Integration
     */
    static async shareContent(title, text, url) {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: title,
                    text: text,
                    url: url,
                });
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            // Fallback to copy link
            navigator.clipboard.writeText(url).then(() => {
                alert('Link copied to clipboard!');
            });
        }
    }
}

// Initialize once document is ready
document.addEventListener('DOMContentLoaded', () => {
    window.pwaNextLevel = new PWANextLevel();
});
