// Authentication utilities
function isLoggedIn() {
    return localStorage.getItem('authToken') !== null;
}

function getUsername() {
    return localStorage.getItem('username');
}

function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    window.location.href = 'login.html';
}

function redirectIfNotLoggedIn() {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
    }
}

function redirectToProfileIfLoggedIn() {
    if (isLoggedIn()) {
        window.location.href = 'profile.html';
    } else {
        window.location.href = 'login.html';
    }
}

// Export for modules if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { isLoggedIn, getUsername, logout, redirectIfNotLoggedIn, redirectToProfileIfLoggedIn };
}