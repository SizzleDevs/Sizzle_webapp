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
        
        // Hash the password
        const hashedPassword = CryptoJS.SHA256(password).toString();
        
        // Prepare login data
        const loginData = {
            username: username,
            password: hashedPassword
        };
        
        console.log('Login data:', loginData);
        
        try {
            // Call the API (placeholder - replace with actual API call)
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData)
            });
            
            if (response.ok) {
                const result = await response.json();
                // Assume result has token
                localStorage.setItem('authToken', result.token);
                localStorage.setItem('username', username);
                // Redirect to home or profile
                window.location.href = 'index.html';
            } else {
                alert('Inloggen mislukt. Controleer je gegevens.');
            }
        } catch (error) {
            console.error('Login error:', error);
            // For now, simulate login success for demo
            alert('Login gesimuleerd - in productie zou dit naar de API gaan.');
            localStorage.setItem('authToken', 'dummy-token');
            localStorage.setItem('username', username);
            window.location.href = 'index.html';
        }
    });
}