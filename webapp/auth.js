// Authentication utilities
window.isLoggedIn = function() {
    const token = localStorage.getItem('authToken');
    console.log('isLoggedIn check, token:', token);
    return token !== null;
}

window.getUsername = function() {
    return localStorage.getItem('username');
}

window.logout = function() {
    console.log('logout function called');
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    console.log('authToken and username removed from localStorage');
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