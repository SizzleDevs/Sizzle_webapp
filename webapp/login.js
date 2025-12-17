// Login functionality
document.addEventListener('DOMContentLoaded', () => {
    setupLogin();
});

function setupLogin() {
    const loginBtn = document.getElementById('login-btn');
    const loginForm = document.getElementById('login-form');
    
    loginBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if (!username || !password) {
            alert('Vul alle velden in om in te loggen.');
            return;
        }
        
        const loginData = {
            username: username,
            password: password
        };
        
        console.log('Login data:', loginData);
        
        try {
            const response = await fetch('http://127.0.0.1:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData)
            });
            
            if (response.ok) {
                const result = await response.json();
                // Assume result has token
                await window.storeUserData(result.token, result.username);
                // Redirect to home or profile
                window.location.href = 'index.html';
            } else {
                const error = await response.json();
                alert(`Inloggen mislukt: ${error.message}`);
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Er is een fout opgetreden bij het inloggen. Controleer de console voor meer informatie.');
        }
    });
}