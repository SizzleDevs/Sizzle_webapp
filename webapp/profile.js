import { currentUser } from './data.js';

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

window.saveNewPassword = function() {
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

    if (newPassword.length < 6) {
        errorElement.textContent = 'Wachtwoord moet minimaal 6 karakters lang zijn.';
        errorElement.classList.remove('hidden');
        return;
    }

    // Here you would normally call an API to verify the current password and update
    console.log('Password verified and updated');
    alert('Wachtwoord succesvol gewijzigd!');
    clearPasswordForm();
};

window.logout = function() {
    if (confirm('Weet je zeker dat je uit wilt loggen?')) {
        // Clear session/token
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        window.location.href = 'index.html';
    }
};

window.deleteAccount = function() {
    if (confirm('Weet je zeker dat je je account wilt verwijderen? Dit kan niet ongedaan worden gemaakt.')) {
        if (confirm('Dit is je laatste waarschuwing. Je account en al je data zullen permanent verwijderd worden.')) {
            // Call API to delete account
            console.log('Account deleted');
            alert('Account succesvol verwijderd.');
            window.location.href = 'index.html';
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // Load user data
    document.getElementById('username').value = currentUser.username;
    document.getElementById('username').setAttribute('readonly', '');
    document.getElementById('current-password').value = '••••••••';
    document.getElementById('current-password').setAttribute('readonly', '');
});
