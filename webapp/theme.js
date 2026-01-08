
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

// Button loading functionality
function showButtonLoading(button) {
    if (button) {
        button.classList.add('loading');
    }
}

function hideButtonLoading(button) {
    if (button) {
        button.classList.remove('loading');
    }
}

// Add loading state to buttons on click
document.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('click', function(event) {
        const target = event.target;
        let button = null;

        // Find the button element that was clicked
        if (target.tagName === 'BUTTON') {
            button = target;
        } else if (target.closest('button')) {
            button = target.closest('button');
        } else if (target.classList.contains('filter-tag') ||
                   target.classList.contains('primary-btn') ||
                   target.classList.contains('secondary-btn') ||
                   target.classList.contains('discover-btn') ||
                   target.classList.contains('ai-send-btn') ||
                   target.classList.contains('search-button')) {
            button = target;
        } else if (target.closest('.tag')) {
            button = target.closest('.tag');
        }

        // Add loading state to the button
        if (button) {
            showButtonLoading(button);

            // Remove loading state after 2 seconds (adjust as needed)
            setTimeout(() => {
                hideButtonLoading(button);
            }, 2000);
        }
    });
});

// Export functions for manual control
window.showButtonLoading = showButtonLoading;
window.hideButtonLoading = hideButtonLoading;

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


