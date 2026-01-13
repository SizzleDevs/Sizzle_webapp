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

window.isAdmin = async function() {
    if (!isLoggedIn()) {
        return false;
    }

    const cachedAdminStatus = sessionStorage.getItem('isAdmin');
    if (cachedAdminStatus) {
        return JSON.parse(cachedAdminStatus);
    }

    try {
        const response = await fetch(window.API.ME, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        if (response.ok) {
            const userData = await response.json();
            const isAdmin = userData.is_admin || false;
            sessionStorage.setItem('isAdmin', JSON.stringify(isAdmin));
            return isAdmin;
        }
    } catch (error) {
        console.error('Error checking admin status:', error);
    }
    return false;
}

window.storeUserData = async function(token, username, name = null) {
    localStorage.setItem('authToken', token);
    localStorage.setItem('username', username);
    if (name) {
        localStorage.setItem('fullname', name);
    }

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
            } else if (!name) {
                localStorage.removeItem('fullname');
            }
            if (userData.is_admin) {
                sessionStorage.setItem('isAdmin', JSON.stringify(userData.is_admin));
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

window.logout = function() {
    console.log('logout function called');
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    localStorage.removeItem('fullname');
    sessionStorage.removeItem('isAdmin'); // Clear admin status
    console.log('User data removed from localStorage');
    try{
        if (typeof notifySuccess === 'function') {
            notifySuccess('Je bent uitgelogd');
            setTimeout(() => { window.location.href = 'login'; }, 350);
            return;
        }
    } catch(e){}
    window.location.href = 'login';
}

window.redirectIfNotLoggedIn = function() {
    if (!isLoggedIn()) {
        window.location.href = 'login';
    }
}

window.redirectToProfileIfLoggedIn = function() {
    if (isLoggedIn()) {
        window.location.href = 'profile';
    } else {
        window.location.href = 'login';
    }
}

// Password Visibility Toggle
document.addEventListener('DOMContentLoaded', () => {
    const toggleIcons = document.querySelectorAll('.password-toggle-icon');

    toggleIcons.forEach(icon => {
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

        icon.addEventListener('mousedown', (e) => {
            e.preventDefault();
            showPassword();
        });

        icon.addEventListener('mouseup', hidePassword);
        icon.addEventListener('mouseleave', hidePassword);

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
