// PWA Installation - Native Browser Prompt Only
// Shows install button only when browser supports native installation

(function() {
    'use strict';

    let deferredPrompt;
    
    // Check if running as PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    
    const getElements = () => {
        return {
            section: document.getElementById('pwa-install-section'),
            btn: document.getElementById('pwa-install-btn-trigger'),
            title: document.querySelector('#pwa-install-section .install-title'),
            text: document.querySelector('#pwa-install-section .install-text'),
            icon: document.querySelector('#pwa-install-section .install-icon-wrapper i'),
            btnText: document.querySelector('#pwa-install-btn-trigger span')
        };
    };

    // Platform detection
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    
    // Get detailed device info
    const getDeviceInfo = () => {
        const uaLower = ua.toLowerCase();
        
        // Mobile devices - specific models
        if (/iphone/.test(uaLower)) {
            return { name: 'iPhone', icon: 'fab fa-apple', type: 'mobile' };
        }
        if (/ipad/.test(uaLower)) {
            return { name: 'iPad', icon: 'fab fa-apple', type: 'tablet' };
        }
        if (/samsung/.test(uaLower)) {
            return { name: 'Samsung', icon: 'fab fa-android', type: 'mobile' };
        }
        if (/xiaomi|redmi|poco/.test(uaLower)) {
            return { name: 'Xiaomi', icon: 'fab fa-android', type: 'mobile' };
        }
        if (/huawei|honor/.test(uaLower)) {
            return { name: 'Huawei', icon: 'fab fa-android', type: 'mobile' };
        }
        if (/oppo/.test(uaLower)) {
            return { name: 'OPPO', icon: 'fab fa-android', type: 'mobile' };
        }
        if (/vivo/.test(uaLower)) {
            return { name: 'Vivo', icon: 'fab fa-android', type: 'mobile' };
        }
        if (/oneplus/.test(uaLower)) {
            return { name: 'OnePlus', icon: 'fab fa-android', type: 'mobile' };
        }
        if (/realme/.test(uaLower)) {
            return { name: 'Realme', icon: 'fab fa-android', type: 'mobile' };
        }
        if (/pixel/.test(uaLower)) {
            return { name: 'Google Pixel', icon: 'fab fa-android', type: 'mobile' };
        }
        if (/nokia/.test(uaLower)) {
            return { name: 'Nokia', icon: 'fab fa-android', type: 'mobile' };
        }
        if (/lg/.test(uaLower)) {
            return { name: 'LG', icon: 'fab fa-android', type: 'mobile' };
        }
        if (/sony/.test(uaLower)) {
            return { name: 'Sony', icon: 'fab fa-android', type: 'mobile' };
        }
        if (/motorola|moto/.test(uaLower)) {
            return { name: 'Motorola', icon: 'fab fa-android', type: 'mobile' };
        }
        if (/htc/.test(uaLower)) {
            return { name: 'HTC', icon: 'fab fa-android', type: 'mobile' };
        }
        if (/asus/.test(uaLower)) {
            return { name: 'ASUS', icon: 'fab fa-android', type: 'mobile' };
        }
        if (/lenovo/.test(uaLower)) {
            return { name: 'Lenovo', icon: 'fab fa-android', type: 'mobile' };
        }
        if (/infinix/.test(uaLower)) {
            return { name: 'Infinix', icon: 'fab fa-android', type: 'mobile' };
        }
        if (/tecno/.test(uaLower)) {
            return { name: 'Tecno', icon: 'fab fa-android', type: 'mobile' };
        }
        if (/itel/.test(uaLower)) {
            return { name: 'iTel', icon: 'fab fa-android', type: 'mobile' };
        }
        
        // Generic Android detection
        if (/android/.test(uaLower)) {
            if (/tablet|tab/.test(uaLower)) {
                return { name: 'Android Tablet', icon: 'fab fa-android', type: 'tablet' };
            }
            if (/mobile/.test(uaLower)) {
                return { name: 'Android Phone', icon: 'fab fa-android', type: 'mobile' };
            }
            return { name: 'Android Device', icon: 'fab fa-android', type: 'mobile' };
        }
        
        // Desktop detection
        if (/macintosh|mac os x/.test(uaLower)) {
            return { name: 'Mac', icon: 'fab fa-apple', type: 'desktop' };
        }
        if (/windows/.test(uaLower)) {
            return { name: 'Windows PC', icon: 'fab fa-windows', type: 'desktop' };
        }
        if (/linux/.test(uaLower)) {
            if (/chromebook/.test(uaLower)) {
                return { name: 'Chromebook', icon: 'fab fa-chrome', type: 'desktop' };
            }
            return { name: 'Linux', icon: 'fab fa-linux', type: 'desktop' };
        }
        if (/cros/.test(uaLower)) {
            return { name: 'Chromebook', icon: 'fab fa-chrome', type: 'desktop' };
        }
        
        return { name: 'Your Device', icon: 'fas fa-mobile-alt', type: 'unknown' };
    };

    // Capture beforeinstallprompt - The install button will ONLY show if this event fires
    window.addEventListener('beforeinstallprompt', (e) => {
        console.log('beforeinstallprompt event fired - Install button will now appear');
        e.preventDefault();
        deferredPrompt = e;
        
        // Show the install section ONLY when native prompt is available
        const els = getElements();
        if (els.section && !isStandalone) {
            els.section.style.display = 'flex';
            els.section.style.visibility = 'visible';
            els.section.style.opacity = '1';

            // Get real device info and customize UI
            const deviceInfo = getDeviceInfo();
            if (els.title) els.title.innerHTML = `Install on <span>${deviceInfo.name}</span>`;
            if (els.icon) els.icon.className = deviceInfo.icon;
        }
    });

    // Handle Install Now button click - Trigger native browser prompt
    document.addEventListener('click', async (e) => {
        const trigger = e.target.closest('#pwa-install-btn-trigger');
        if (!trigger) return;

        // Only works if beforeinstallprompt has fired
        if (deferredPrompt) {
            console.log('Showing native browser install dialog...');
            
            // Trigger the native browser installation prompt
            deferredPrompt.prompt();
            
            // Wait for user's choice
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`User choice: ${outcome}`);
            
            if (outcome === 'accepted') {
                console.log('User accepted the install');
                const els = getElements();
                if (els.section) els.section.style.display = 'none';
            } else {
                console.log('User dismissed the install');
            }
            
            // Clear the deferred prompt
            deferredPrompt = null;
        } else {
            console.log('Native install prompt not available');
        }
    });

    // Hide install section after successful installation
    window.addEventListener('appinstalled', () => {
        console.log('PWA successfully installed!');
        const els = getElements();
        if (els.section) els.section.style.display = 'none';
        deferredPrompt = null;
    });

    // Initial check - Hide if already installed
    if (isStandalone) {
        const els = getElements();
        if (els.section) els.section.style.display = 'none';
    }

})();
