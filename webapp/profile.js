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
            if(response.status === 401) {
                logout();
            }
        }
    } catch (error) {
        console.error('Error fetching profile:', error);
    }
    
    // Initialize UI
    initializeUI();
    initializeTabs();
});

function initializeUI() {
    // Set inputs to readonly initially
    document.getElementById('username').setAttribute('readonly', '');
    document.getElementById('name').setAttribute('readonly', '');

    // Add event listeners
    document.getElementById('edit-username-btn').addEventListener('click', toggleEditUsername);
    document.getElementById('edit-name-btn').addEventListener('click', toggleEditName);
    document.querySelector('.primary-btn[onclick="saveNewPassword()"]')?.addEventListener('click', saveNewPassword);
    document.querySelector('.secondary-btn[onclick="clearPasswordForm()"]')?.addEventListener('click', clearPasswordForm);
    document.querySelector('.danger-btn[onclick="deleteAccount()"]')?.addEventListener('click', deleteAccount);
    document.getElementById('logout-btn').addEventListener('click', () => {
        if (confirm('Weet je zeker dat je uit wilt loggen?')) {
            logout();
        }
    });
}

function initializeTabs() {
    const tabLinks = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');

    // Open the first tab by default
    tabLinks[0]?.classList.add('active');
    tabContents[0]?.classList.add('active');

    tabLinks.forEach(link => {
        link.addEventListener('click', () => {
            const tabName = link.dataset.tab;

            tabLinks.forEach(l => l.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            link.classList.add('active');
            document.getElementById(tabName).classList.add('active');
        });
    });
}

function toggleEditUsername() {
    const usernameInput = document.getElementById('username');
    const editBtn = document.getElementById('edit-username-btn');
    
    if (usernameInput.hasAttribute('readonly')) {
        usernameInput.removeAttribute('readonly');
        editBtn.textContent = 'Opslaan';
        usernameInput.focus();
    } else {
        saveUsername();
    }
}

async function saveUsername() {
    const usernameInput = document.getElementById('username');
    const editBtn = document.getElementById('edit-username-btn');
    const newUsername = usernameInput.value.trim();

    if (newUsername) {
        const token = localStorage.getItem('authToken');
        try {
            const response = await fetch('http://127.0.0.1:5000/api/auth/me', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ username: newUsername })
            });

            if (response.ok) {
                editBtn.textContent = 'Bewerk';
                usernameInput.setAttribute('readonly', '');
                alert('Gebruikersnaam succesvol gewijzigd!');
            } else {
                const error = await response.json();
                alert(`Opslaan van gebruikersnaam mislukt: ${error.message}`);
            }
        } catch (error) {
            console.error('Save username error:', error);
            alert('Er is een fout opgetreden bij het opslaan van de gebruikersnaam.');
        }
    } else {
        alert('Gebruikersnaam mag niet leeg zijn.');
        usernameInput.focus();
    }
}

function toggleEditName() {
    const nameInput = document.getElementById('name');
    const editBtn = document.getElementById('edit-name-btn');

    if (nameInput.hasAttribute('readonly')) {
        nameInput.removeAttribute('readonly');
        editBtn.textContent = 'Opslaan';
        nameInput.focus();
    } else {
        saveName();
    }
}

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

function clearPasswordForm() {
    document.getElementById('current-password-verify').value = '';
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-password').value = '';
    document.getElementById('password-error').classList.add('hidden');
}

async function saveNewPassword() {
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
}

async function deleteAccount() {
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
                    logout();
                } else {
                    const error = await response.json();
                    alert(`Verwijderen van account mislukt: ${error.message}`);
                }
            } catch (error) {
                console.error('Delete account error:', error);
                alert('Er is een fout opgetreden bij het verwijderen van het account.');
            }
        }
    }
}

