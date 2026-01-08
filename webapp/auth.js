// Authentication utilities
window.isLoggedIn = function() {
    const token = localStorage.getItem('authToken');
    console.log('isLoggedIn check, token:', token);
    return token !== null;
}

window.getUsername = function() {
    return localStorage.getItem('username');
}

window.getFullname = function() {
    return localStorage.getItem('fullname');
}

window.storeUserData = async function(token, username, name = null) {
    if (!token) {
        console.error('storeUserData called without token');
        return;
    }

    localStorage.setItem('authToken', token);
    if (username) localStorage.setItem('username', username);
    if (name) {
        localStorage.setItem('fullname', name);
    }

    console.log('storeUserData saved', { username: localStorage.getItem('username'), fullname: localStorage.getItem('fullname') });

    try {
        const response = await fetch(window.API.ME, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (response.ok) {
            const userData = await response.json();
            if (userData.name) {
                localStorage.setItem('fullname', userData.name);
                console.log('Updated fullname from /me:', userData.name);
            } else if (!name) {
                // Only remove if we didn't initially have a name and the API also didn't return one
                localStorage.removeItem('fullname');
            }
        } else {
            console.error('Failed to fetch user profile after login:', response.statusText);
            if (!name) localStorage.removeItem('fullname');
        }
    } catch (error) {
        console.error('Error fetching user profile after login:', error);
        if (!name) localStorage.removeItem('fullname');
    }
} 

// Return a sensible display name: fullname if available, else username or empty string
window.getFullname = function() {
    return localStorage.getItem('fullname') || localStorage.getItem('username') || '';
}

window.logout = function() {
    console.log('logout function called');
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    localStorage.removeItem('fullname');
    console.log('User data removed from localStorage');
    window.location.href = 'login.html';
}

window.redirectIfNotLoggedIn = function() {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
    }
}

window.redirectToProfileIfLoggedIn = function() {
    if (isLoggedIn()) {
        window.location.href = 'profile.html';
    } else {
        window.location.href = 'login.html';
    }
}

// Password Visibility Toggle
document.addEventListener('DOMContentLoaded', () => {
    const toggleIcons = document.querySelectorAll('.password-toggle-icon');

    toggleIcons.forEach(icon => {
        // Find sibling input
        const wrapper = icon.parentElement;
        const input = wrapper.querySelector('input');

        if (!input) return;

        const showPassword = () => {
            input.type = 'text';
            icon.textContent = 'visibility_off';
            icon.style.opacity = '1';
        };

        const hidePassword = () => {
            input.type = 'password';
            icon.textContent = 'visibility';
            icon.style.opacity = '';
        };

        // Mouse events
        icon.addEventListener('mousedown', (e) => {
            e.preventDefault();
            showPassword();
        });

        icon.addEventListener('mouseup', hidePassword);
        icon.addEventListener('mouseleave', hidePassword);

        // Touch events for mobile
        icon.addEventListener('touchstart', (e) => {
            e.preventDefault();
            showPassword();
        });

        icon.addEventListener('touchend', (e) => {
            e.preventDefault();
            hidePassword();
        });
    });
});