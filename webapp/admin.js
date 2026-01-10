document.addEventListener('DOMContentLoaded', async () => {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }

    const isAdmin = await checkAdminStatus();
    if (!isAdmin) {
        window.location.href = 'index.html';
        return;
    }

    await loadStats();
    await loadUsers();
    await loadRecipes();

    const createRecipeForm = document.getElementById('create-recipe-form');
    createRecipeForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        await createRecipe(createRecipeForm);
    });
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

async function loadStats() {
    const statsContainer = document.getElementById('stats-container');
    statsContainer.innerHTML = '<p>Loading stats...</p>';

    try {
        const response = await fetch(window.API_BASE_URL + '/api/admin/stats', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });

        if (response.ok) {
            const stats = await response.json();
            renderStats(stats);
        } else {
            statsContainer.innerHTML = '<p>Error loading stats.</p>';
        }
    } catch (error) {
        console.error('Error loading stats:', error);
        statsContainer.innerHTML = '<p>Error loading stats.</p>';
    }
}

function renderStats(stats) {
    const statsContainer = document.getElementById('stats-container');
    statsContainer.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <h3>Total Users</h3>
                <p>${stats.total_users}</p>
            </div>
            <div class="stat-card">
                <h3>Admin Users</h3>
                <p>${stats.admin_users}</p>
            </div>
            <div class="stat-card">
                <h3>Total Recipes</h3>
                <p>${stats.total_recipes}</p>
            </div>
        </div>
    `;
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
            const errorData = await response.json().catch(() => ({}));
            usersTableContainer.innerHTML = `<p>Error loading users: ${errorData.message || 'Unknown error'}</p>`;
        }
    } catch (error) {
        console.error('Error loading users:', error);
        usersTableContainer.innerHTML = '<p>Error loading users.</p>';
    }
}

function renderUsersTable(users) {
    const usersTableContainer = document.getElementById('users-table-container');
    
    if (users.length === 0) {
        usersTableContainer.innerHTML = '<p>No users found.</p>';
        return;
    }

    const table = document.createElement('table');
    table.className = 'admin-table';

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
            if (typeof notifySuccess === 'function') {
                notifySuccess(`User ID ${userId} deleted successfully.`);
            }
            await loadUsers();
        } else {
            const errorData = await response.json();
            if (typeof notifyError === 'function') {
                notifyError(`Error deleting user ID ${userId}: ${errorData.message || 'Unknown error'}`);
            }
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        if (typeof notifyError === 'function') {
            notifyError('Error deleting user.');
        }
    }
}

async function loadRecipes() {
    const recipesTableContainer = document.getElementById('recipes-table-container');
    recipesTableContainer.innerHTML = '<p>Loading recipes...</p>';

    try {
        const response = await fetch(window.API_BASE_URL + '/api/admin/recipes', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });

        if (response.ok) {
            const recipes = await response.json();
            renderRecipesTable(recipes);
        } else {
            const errorData = await response.json().catch(() => ({}));
            recipesTableContainer.innerHTML = `<p>Error loading recipes: ${errorData.message || 'Unknown error'}</p>`;
        }
    } catch (error) {
        console.error('Error loading recipes:', error);
        recipesTableContainer.innerHTML = '<p>Error loading recipes.</p>';
    }
}

function renderRecipesTable(recipes) {
    const recipesTableContainer = document.getElementById('recipes-table-container');
    
    if (recipes.length === 0) {
        recipesTableContainer.innerHTML = '<p>No recipes found.</p>';
        return;
    }

    const table = document.createElement('table');
    table.className = 'admin-table';

    table.innerHTML = `
        <thead>
            <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Tags</th>
                <th>Difficulty</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            ${recipes.map(recipe => `
                <tr data-recipe-id="${recipe.id}">
                    <td>${recipe.id}</td>
                    <td>${recipe.titel}</td>
                    <td>${recipe.tags.join(', ')}</td>
                    <td>${recipe.moeilijkheid}</td>
                    <td>
                        <button class="delete-recipe-btn" data-recipe-id="${recipe.id}" data-recipe-title="${recipe.titel}">Delete</button>
                    </td>
                </tr>
            `).join('')}
        </tbody>
    `;
    recipesTableContainer.innerHTML = '';
    recipesTableContainer.appendChild(table);

    table.querySelectorAll('.delete-recipe-btn').forEach(button => {
        button.addEventListener('click', async (event) => {
            const recipeId = event.target.dataset.recipeId;
            const recipeTitle = event.target.dataset.recipeTitle;
            if (confirm(`Are you sure you want to delete recipe "${recipeTitle}" (ID: ${recipeId})?`)) {
                await deleteRecipe(recipeId);
            }
        });
    });
}

async function createRecipe(form) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
        const recipeData = {
            titel: data.titel,
            bereidingstijd: parseInt(data.bereidingstijd),
            moeilijkheid: data.moeilijkheid,
            tags: data.tags.split(',').map(tag => tag.trim()),
            ingredienten: JSON.parse(data.ingredienten),
            stappen: JSON.parse(data.stappen)
        };

        const response = await fetch(window.API_BASE_URL + '/api/admin/recipes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify(recipeData)
        });

        if (response.ok) {
            if (typeof notifySuccess === 'function') {
                notifySuccess('Recipe created successfully.');
            }
            form.reset();
            await loadRecipes();
            await loadStats();
        } else {
            const errorData = await response.json();
            if (typeof notifyError === 'function') {
                notifyError(`Error creating recipe: ${errorData.message || 'Unknown error'}`);
            }
        }
    } catch (error) {
        console.error('Error creating recipe:', error);
        if (typeof notifyError === 'function') {
            notifyError('Error creating recipe. Please check the console for details.');
        }
    }
}

async function deleteRecipe(recipeId) {
    try {
        const response = await fetch(window.API_BASE_URL + `/api/admin/recipes/${recipeId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });

        if (response.ok) {
            if (typeof notifySuccess === 'function') {
                notifySuccess(`Recipe ID ${recipeId} deleted successfully.`);
            }
            await loadRecipes();
            await loadStats();
        } else {
            const errorData = await response.json();
            if (typeof notifyError === 'function') {
                notifyError(`Error deleting recipe ID ${recipeId}: ${errorData.message || 'Unknown error'}`);
            }
        }
    } catch (error) {
        console.error('Error deleting recipe:', error);
        if (typeof notifyError === 'function') {
            notifyError('Error deleting recipe.');
        }
    }
}