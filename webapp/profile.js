
window.toggleEditUsername = function() {
    const usernameInput = document.getElementById('username');
    const editBtn = document.getElementById('edit-username-btn');
    
    if (usernameInput.hasAttribute('readonly')) {
        usernameInput.removeAttribute('readonly');
        editBtn.textContent = 'Opslaan';
        editBtn.classList.add('save-mode');
        usernameInput.focus();
    } else {
        // Save the username
        const newUsername = usernameInput.value.trim();
        if (newUsername) {
            console.log('Username updated to:', newUsername);
            editBtn.textContent = 'Bewerk';
            editBtn.classList.remove('save-mode');
            usernameInput.setAttribute('readonly', '');
        } else {
            alert('Gebruikersnaam mag niet leeg zijn.');
            usernameInput.focus();
        }
    }
};

window.togglePasswordChange = function() {
    const form = document.getElementById('password-change-form');
    form.classList.toggle('hidden');
    if (!form.classList.contains('hidden')) {
        document.getElementById('new-password').focus();
    }
};

window.showPassword = function() {
    const passwordInput = document.getElementById('current-password');
    passwordInput.type = 'text';
};

window.hidePassword = function() {
    const passwordInput = document.getElementById('current-password');
    passwordInput.type = 'password';
};

window.clearPasswordForm = function() {
    document.getElementById('current-password-verify').value = '';
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-password').value = '';
    document.getElementById('password-error').classList.add('hidden');
};

window.saveNewPassword = async function() {
    const currentPasswordVerify = document.getElementById('current-password-verify').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const errorElement = document.getElementById('password-error');

    if (!currentPasswordVerify) {
        errorElement.textContent = 'Voer je huidige wachtwoord in.';
        errorElement.classList.remove('hidden');
        return;
    }

    if (!newPassword || !confirmPassword) {
        errorElement.textContent = 'Vul alstublieft beide nieuwe wachtwoordvelden in.';
        errorElement.classList.remove('hidden');
        return;
    }

    if (newPassword !== confirmPassword) {
        errorElement.textContent = 'Wachtwoorden komen niet overeen.';
        errorElement.classList.remove('hidden');
        return;
    }

    if (newPassword.length < 8) {
        errorElement.textContent = 'Wachtwoord moet minimaal 8 karakters lang zijn.';
        errorElement.classList.remove('hidden');
        return;
    }

    const token = localStorage.getItem('authToken');

    try {
        const response = await fetch('http://127.0.0.1:5000/api/auth/me', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ password: newPassword, current_password: currentPasswordVerify })
        });

        if (response.ok) {
            alert('Wachtwoord succesvol gewijzigd!');
            clearPasswordForm();
        } else {
            const error = await response.json();
            alert(`Wijzigen van wachtwoord mislukt: ${error.message}`);
        }
    } catch (error) {
        console.error('Save password error:', error);
        alert('Er is een fout opgetreden bij het wijzigen van het wachtwoord.');
    }
};

window.deleteAccount = async function() {
    if (confirm('Weet je zeker dat je je account wilt verwijderen? Dit kan niet ongedaan worden gemaakt.')) {
        const password = prompt('Voer je wachtwoord in om te bevestigen:');
        if (password) {
            const token = localStorage.getItem('authToken');

            try {
                const response = await fetch('http://127.0.0.1:5000/api/auth/me', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ password: password })
                });

                if (response.ok) {
                    alert('Account succesvol verwijderd.');
                    logout(); // This will redirect to login.html
                } else {
                    const error = await response.json();
                    alert(`Verwijderen van account mislukt: ${error.message}`);
                }
            } catch (error) {
                console.error('Delete account error:', error);
                alert('Er is een fout opgetreden bij het verwijderen van het account. Controleer de console voor meer informatie.');
            }
        }
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    // Check if logged in
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }

    const token = localStorage.getItem('authToken');
    try {
        const response = await fetch('http://127.0.0.1:5000/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const profile = await response.json();
            document.getElementById('username').value = profile.username;
            document.getElementById('name').value = profile.name;
        } else {
            console.error('Failed to fetch profile');
        }
    } catch (error) {
        console.error('Error fetching profile:', error);
    }
    
    // Load user data
    document.getElementById('username').setAttribute('readonly', '');
    document.getElementById('name').setAttribute('readonly', '');

    const logoutBtn = document.getElementById('logout-btn');
    if(logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('Weet je zeker dat je uit wilt loggen?')) {
                logout();
            }
        });
    }
});

window.toggleEditName = function() {
    const nameInput = document.getElementById('name');
    const editBtn = document.getElementById('edit-name-btn');

    if (nameInput.hasAttribute('readonly')) {
        nameInput.removeAttribute('readonly');
        editBtn.textContent = 'Opslaan';
        editBtn.classList.add('save-mode');
        nameInput.focus();
    } else {
        saveName();
    }
};

async function saveName() {
    const nameInput = document.getElementById('name');
    const editBtn = document.getElementById('edit-name-btn');
    const newName = nameInput.value.trim();

    if (newName) {
        const token = localStorage.getItem('authToken');
        try {
            const response = await fetch('http://127.0.0.1:5000/api/auth/me', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name: newName })
            });

            if (response.ok) {
                editBtn.textContent = 'Bewerk';
                editBtn.classList.remove('save-mode');
                nameInput.setAttribute('readonly', '');
                alert('Naam succesvol gewijzigd!');
            } else {
                const error = await response.json();
                alert(`Opslaan van naam mislukt: ${error.message}`);
            }
        } catch (error) {
            console.error('Save name error:', error);
            alert('Er is een fout opgetreden bij het opslaan van de naam.');
        }
    } else {
        alert('Naam mag niet leeg zijn.');
        nameInput.focus();
    }
}

