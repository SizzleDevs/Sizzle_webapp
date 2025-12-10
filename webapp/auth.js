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

window.storeUserData = async function(token, username) {
    localStorage.setItem('authToken', token);
    localStorage.setItem('username', username);

    try {
        const response = await fetch('http://127.0.0.1:5000/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (response.ok) {
            const userData = await response.json();
            if (userData.name) {
                localStorage.setItem('fullname', userData.name);
            } else {
                localStorage.removeItem('fullname');
            }
        } else {
            console.error('Failed to fetch user profile after login:', response.statusText);
            localStorage.removeItem('fullname');
        }
    } catch (error) {
        console.error('Error fetching user profile after login:', error);
        localStorage.removeItem('fullname');
    }
}

window.logout = function() {
    console.log('logout function called');
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    console.log('authToken and username removed from localStorage');
    window.location.href = 'login.php';
}

window.redirectIfNotLoggedIn = function() {
    if (!isLoggedIn()) {
        window.location.href = 'login.php';
    }
}

window.redirectToProfileIfLoggedIn = function() {
    if (isLoggedIn()) {
        window.location.href = 'profile.php';
    } else {
        window.location.href = 'login.php';
    }
}