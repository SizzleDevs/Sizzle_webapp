document.addEventListener('DOMContentLoaded', async () => {
    if (!isLoggedIn()) {
        window.location.href = 'login';
        return;
    }

    initializeUI();
    initializeTabs();
    
    // Populate data
    await loadProfileData();
});

async function loadProfileData() {
    // 1. Load from local storage immediately for speed
    const usernameInput = document.getElementById('username');
    const nameInput = document.getElementById('name');
    
    const storedUsername = localStorage.getItem('username');
    const storedName = localStorage.getItem('fullname');

    if (storedUsername) usernameInput.value = storedUsername;
    if (storedName) nameInput.value = storedName;

    // 2. Fetch fresh data from API
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(window.API.ME, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const profile = await response.json();
            
            // Update fields if distinct
            if (profile.username) {
                usernameInput.value = profile.username;
                localStorage.setItem('username', profile.username);
            }
            if (profile.name) {
                nameInput.value = profile.name;
                localStorage.setItem('fullname', profile.name);
            }
        } else if (response.status === 401) {
            logout();
        }
    } catch (error) {
        console.error('Error fetching profile:', error);
    }
}

function initializeUI() {
    // Set fields to readonly initially
    document.getElementById('username').setAttribute('readonly', '');
    document.getElementById('name').setAttribute('readonly', '');

    // Setup Edit Buttons
    // Note: profile.html uses onclick="toggleEditUsername()" which we need to define globally
    // or attach here. We attach here for cleaner code, overriding inline if necessary.
    
    const editUsernameBtn = document.getElementById('edit-username-btn');
    if (editUsernameBtn) {
        // Ensure it is visible
        editUsernameBtn.style.display = 'block';
        editUsernameBtn.onclick = toggleEditUsername; // Assign function directly
    }

    const editNameBtn = document.getElementById('edit-name-btn');
    if (editNameBtn) {
        editNameBtn.onclick = toggleEditName;
    }

    // Other listeners
    const savePasswordBtn = document.querySelector('.primary-btn[onclick="saveNewPassword()"]');
    if (savePasswordBtn) savePasswordBtn.onclick = saveNewPassword;

    const clearPasswordBtn = document.querySelector('.secondary-btn[onclick="clearPasswordForm()"]');
    if (clearPasswordBtn) clearPasswordBtn.onclick = clearPasswordForm;

    const deleteBtn = document.getElementById('delete-account-btn');
    if (deleteBtn) deleteBtn.addEventListener('click', deleteAccount);

    document.getElementById('logout-btn').addEventListener('click', () => {
        if (confirm('Weet je zeker dat je uit wilt loggen?')) {
            logout();
        }
    });

    initializeThemeControls();
}

// Make these functions available globally for HTML onclick attributes if needed
window.toggleEditUsername = async function() {
    const input = document.getElementById('username');
    const btn = document.getElementById('edit-username-btn');
    
    if (input.hasAttribute('readonly')) {
        input.removeAttribute('readonly');
        input.focus();
        btn.textContent = 'Opslaan';
        btn.classList.add('editing');
    } else {
        const newUsername = input.value.trim();
        if (!newUsername) {
            notifyError('Gebruikersnaam mag niet leeg zijn.');
            input.focus();
            return;
        }

        const token = localStorage.getItem('authToken');
        try {
            const response = await fetch(window.API.ME, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ username: newUsername })
            });

            if (response.ok) {
                input.setAttribute('readonly', '');
                btn.textContent = 'Bewerk';
                btn.classList.remove('editing');
                
                notifySuccess('Gebruikersnaam succesvol gewijzigd! Je wordt nu uitgelogd.');
                
                // Wacht even zodat de gebruiker de melding kan lezen
                setTimeout(() => {
                    logout();
                }, 2000);

            } else {
                const error = await response.json();
                notifyError(`Opslaan van gebruikersnaam mislukt: ${error.message || 'Onbekende fout'}`);
            }
        } catch (error) {
            console.error('Save username error:', error);
            notifyError('Er is een fout opgetreden bij het opslaan van de gebruikersnaam.');
        }
    }
};

window.toggleEditName = async function() {
    const input = document.getElementById('name');
    const btn = document.getElementById('edit-name-btn');

    if (input.hasAttribute('readonly')) {
        input.removeAttribute('readonly');
        input.focus();
        btn.textContent = 'Opslaan';
        btn.classList.add('editing');
    } else {
        const newName = input.value.trim();
        if (!newName) {
            notifyError('Naam mag niet leeg zijn.');
            input.focus();
            return;
        }

        const token = localStorage.getItem('authToken');
        try {
            const response = await fetch(window.API.ME, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name: newName })
            });

                if (response.ok) {
                input.setAttribute('readonly', '');
                btn.textContent = 'Bewerk';
                btn.classList.remove('editing');
                
                localStorage.setItem('fullname', newName);
                    notifySuccess('Naam succesvol gewijzigd!');
                
                // Update header immediately if possible (though redundant as home refreshes)
            } else {
                const error = await response.json();
                notifyError(`Opslaan van naam mislukt: ${error.message || 'Onbekende fout'}`);
            }
        } catch (error) {
            console.error('Save name error:', error);
            notifyError('Er is een fout opgetreden bij het opslaan van de naam.');
        }
    }
};

function initializeThemeControls() {
    const btns = document.querySelectorAll('.theme-toggle-btn');
    if (!btns.length) return;

    const setActive = (pref) => {
        btns.forEach(b => b.classList.toggle('active', b.dataset.theme === pref));
    };

    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            const pref = btn.dataset.theme;
            if (window.setPreferredTheme) {
                window.setPreferredTheme(pref);
            } else {

                localStorage.setItem('theme', pref);
                if (pref === 'system' && window.matchMedia) {
                    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
                } else {
                    document.documentElement.setAttribute('data-theme', pref);
                }
            }
            setActive(pref);
        });
    });

    const pref = localStorage.getItem('theme') || 'light';
    setActive(pref);
}

function initializeTabs() {
    const tabLinks = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');

    tabLinks.forEach(l => l.classList.remove('active'));
    tabContents.forEach(c => c.classList.add('active'));
} 

// Note: toggleEditName is redundant if window.toggleEditName covers it,
// but we keep the event listener attachment in initializeUI.
// The previous implementation of toggleEditName is below, we replace/remove duplicate if necessary.
// Since we defined window.toggleEditName above (in the new code block), we should remove or update this one to avoid conflict 
// if it defines a local function with the same name.
// However, the `oldString` below targets the old function definition to remove it cleanly.

/* Removed old toggleEditName function as it is replaced by window.toggleEditName */

function clearPasswordForm() {
    const currentPwField = document.getElementById('current-password-verify');
    if (currentPwField) currentPwField.value = '';
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-password').value = '';
    document.getElementById('password-error').classList.add('hidden');
}

async function saveNewPassword() {
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const errorElement = document.getElementById('password-error');

    if (!newPassword || !confirmPassword) {
        errorElement.textContent = 'Vul alstublieft beide wachtwoordvelden in.';
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
        const response = await fetch(window.API.ME, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ password: newPassword })
        });

        if (response.ok) {
            notifySuccess('Wachtwoord succesvol gewijzigd!');
            clearPasswordForm();
        } else {
            const error = await response.json();
            notifyError(`Wijzigen van wachtwoord mislukt: ${error.message || 'Onbekende fout'}`);
        }
    } catch (error) {
        console.error('Save password error:', error);
        notifyError('Er is een fout opgetreden bij het wijzigen van het wachtwoord.');
    }
}

async function deleteAccount() {
    if (confirm('Weet je zeker dat je je account wilt verwijderen? Dit kan niet ongedaan worden gemaakt.')) {
        const password = prompt('Voer je wachtwoord in om te bevestigen:');
        if (password) {
            const token = localStorage.getItem('authToken');

            try {
                const response = await fetch(window.API.ME, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ password: password })
                });

                if (response.ok) {
                    notifySuccess('Account succesvol verwijderd.');
                    logout();
                } else {
                    const error = await response.json();
                    notifyError(`Verwijderen van account mislukt: ${error.message}`);
                }
            } catch (error) {
                console.error('Delete account error:', error);
                notifyError('Er is een fout opgetreden bij het verwijderen van het account.');
            }
        }
    }
}

