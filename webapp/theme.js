
(function() {
    const pref = localStorage.getItem('theme') || 'light';


    const applyPref = (p) => {
        if (p === 'system' && window.matchMedia) {
            const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        } else if (p === 'system') {

            document.documentElement.setAttribute('data-theme', 'light');
        } else {
            document.documentElement.setAttribute('data-theme', p);
        }
    };

    applyPref(pref);


    if (pref === 'system' && window.matchMedia) {
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        mq.addEventListener('change', () => applyPref('system'));
    }


    window.setPreferredTheme = (p) => {
        localStorage.setItem('theme', p);
        applyPref(p);


        if (p === 'system' && window.matchMedia) {
            const mq2 = window.matchMedia('(prefers-color-scheme: dark)');
            mq2.addEventListener('change', () => applyPref('system'));
        }
    };

    window.getPreferredTheme = () => localStorage.getItem('theme') || 'light';
})();

// Create loading overlay
function createLoadingOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.innerHTML = `
        <div class="loading-content">
            <div class="loading-spinner"></div>
            <p class="loading-text">Laden...</p>
        </div>
    `;
    document.body.appendChild(overlay);
    return overlay;
}

// Show loading screen
function showLoading() {
    let overlay = document.querySelector('.loading-overlay');
    if (!overlay) {
        overlay = createLoadingOverlay();
    }
    overlay.classList.add('show');
}

// Hide loading screen
function hideLoading() {
    const overlay = document.querySelector('.loading-overlay');
    if (overlay) {
        overlay.classList.remove('show');
    }
}

// Export functions for use in other scripts
window.showLoading = showLoading;
window.hideLoading = hideLoading;

// Add loading screen to all button clicks
document.addEventListener('DOMContentLoaded', function() {
    // Create the loading overlay
    createLoadingOverlay();
    
    // Add click listeners to all buttons
    document.addEventListener('click', function(event) {
        const target = event.target;
        
        // Check if clicked element is a button or has button-like behavior
        if (target.tagName === 'BUTTON' || 
            target.closest('button') || 
            target.classList.contains('filter-tag') ||
            target.classList.contains('primary-btn') ||
            target.classList.contains('secondary-btn') ||
            target.classList.contains('discover-btn') ||
            target.classList.contains('ai-send-btn') ||
            target.classList.contains('search-button') ||
            target.closest('.tag') ||
            target.getAttribute('onclick')) {
            
            showLoading();
            
            // Hide loading after a short delay (you can adjust this based on your needs)
            setTimeout(() => {
                hideLoading();
            }, 1000);
        }
    });
});

// Network connectivity detection
window.addEventListener('offline', function() {
    // Redirect to 404.html when user goes offline
    window.location.href = '404.html';
});

// Handle navigation errors (404 pages)
window.addEventListener('error', function(event) {
    // Check if it's a resource loading error (like a missing script, image, etc.)
    if (event.target && (event.target.tagName === 'SCRIPT' || event.target.tagName === 'LINK' || event.target.tagName === 'IMG')) {
        // Don't redirect for missing resources, just log
        console.warn('Resource failed to load:', event.target.src || event.target.href);
        return;
    }
});

// Handle unhandled promise rejections that might indicate 404 errors
window.addEventListener('unhandledrejection', function(event) {
    // Check if the rejection is due to a 404
    if (event.reason && event.reason.message && event.reason.message.includes('404')) {
        window.location.href = '404.html';
    }
});


