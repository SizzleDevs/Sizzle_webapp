import { apiRequest, isLoggedIn } from './config.js'; // Assuming apiRequest and isLoggedIn are exported or globally available
import { notifyError, notifySuccess } from './notifications.js'; // Assuming notification functions are available

document.addEventListener('DOMContentLoaded', async () => {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }

    // Check if the user is an admin
    const isAdmin = await checkAdminStatus();
    if (!isAdmin) {
        document.getElementById('admin-content').innerHTML = '<p>Access Denied: You do not have administrator privileges.</p>';
        return;
    }

    await loadUsers();
});

async function checkAdminStatus() {
    try {
        const response = await fetch(window.API_BASE_URL + '/api/admin/test-admin', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        return response.ok;
    } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
    }
}

async function loadUsers() {
    const usersTableContainer = document.getElementById('users-table-container');
    usersTableContainer.innerHTML = '<p>Loading users...</p>';

    try {
        const response = await fetch(window.API_BASE_URL + '/api/admin/users', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });

        if (response.ok) {
            const users = await response.json();
            renderUsersTable(users);
        } else {
            const errorData = await response.json();
            usersTableContainer.innerHTML = `<p>Error loading users: ${errorData.message || 'Unknown error'}</p>`;
            notifyError(`Error loading users: ${errorData.message || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error loading users:', error);
        usersTableContainer.innerHTML = '<p>Error loading users.</p>';
        notifyError('Error loading users.');
    }
}

function renderUsersTable(users) {
    const usersTableContainer = document.getElementById('users-table-container');
    
    if (users.length === 0) {
        usersTableContainer.innerHTML = '<p>No users found.</p>';
        return;
    }

    const table = document.createElement('table');
    table.className = 'admin-table'; // Add a class for styling

    // Create table header
    table.innerHTML = `
        <thead>
            <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Name</th>
                <th>Admin</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            ${users.map(user => `
                <tr data-user-id="${user.id}">
                    <td>${user.id}</td>
                    <td>${user.username}</td>
                    <td>${user.name || 'N/A'}</td>
                    <td>${user.is_admin ? 'Yes' : 'No'}</td>
                    <td>
                        <button class="delete-user-btn" ${user.is_admin ? 'disabled' : ''} data-user-id="${user.id}" data-username="${user.username}">Delete</button>
                    </td>
                </tr>
            `).join('')}
        </tbody>
    `;
    usersTableContainer.innerHTML = '';
    usersTableContainer.appendChild(table);

    // Add event listeners for delete buttons
    table.querySelectorAll('.delete-user-btn').forEach(button => {
        button.addEventListener('click', async (event) => {
            const userId = event.target.dataset.userId;
            const username = event.target.dataset.username;
            if (confirm(`Are you sure you want to delete user "${username}" (ID: ${userId})?`)) {
                await deleteUser(userId);
            }
        });
    });
}

async function deleteUser(userId) {
    try {
        const response = await fetch(window.API_BASE_URL + `/api/admin/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });

        if (response.ok) {
            notifySuccess(`User ID ${userId} deleted successfully.`);
            await loadUsers(); // Reload the user list
        } else {
            const errorData = await response.json();
            notifyError(`Error deleting user ID ${userId}: ${errorData.message || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        notifyError('Error deleting user.');
    }
}
