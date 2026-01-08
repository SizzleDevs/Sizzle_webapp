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
            const response = await fetch(window.API.LOGIN, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData)
            });
            
            if (response.ok) {
                const result = await response.json();

                // Normalize possible response shapes
                const token = result.token || result.accessToken || result.data?.token || result.user?.token;
                const usernameFromResponse = result.username || result.user?.username || result.data?.username || result.username || username;
                const nameFromResponse = result.name || result.fullname || result.user?.name || result.user?.fullname || result.data?.name || null;

                if (!token) {
                    console.error('Login response missing token:', result);
                    alert('Inloggen mislukt: geen autorisatietoken ontvangen.');
                    return;
                }

                await window.storeUserData(token, usernameFromResponse || username, nameFromResponse);
                window.location.href = 'index.html';
            } else {
                const error = await response.json();
                alert(`Inloggen mislukt: ${error.message || 'Ongeldige gebruikersnaam of wachtwoord'}`);
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Er is een fout opgetreden bij het inloggen. Controleer je internetverbinding en probeer het opnieuw.');
        }
    });
}