function createRecipeCard(recipe) {
    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.onclick = () => {
        window.location.href = `recipe.html?id=${recipe.id}`;
    };

    const tagsHtml = recipe.tags.map(tag => `<span class="card-tag">${tag}</span>`).join('');
    const heartClass = recipe.isFavorite ? 'favorited' : '';

    card.innerHTML = `
        <div class="card-header">
            <div class="card-title">${recipe.titel}</div>
            <div class="favorite-icon" onclick="event.stopPropagation(); toggleFavorite(this, '${recipe.id}')">
                <span class="material-symbols-rounded ${heartClass}">favorite</span>
            </div>
        </div>
        <div class="card-tags">
            ${tagsHtml}
        </div>
    `;
    return card;
}

// Global function for favorite toggle
window.toggleFavorite = async function(element, id) {
    const icon = element.querySelector('.material-symbols-rounded');
    const isCurrentlyFavorite = icon.classList.contains('favorited');
    const method = isCurrentlyFavorite ? 'DELETE' : 'POST';
    const token = localStorage.getItem('authToken');

    try {
        const response = await fetch(window.API.FAVORITE_TOGGLE(id), {
            method: method,
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            icon.classList.toggle('favorited');
            // If removed from favorites on favorites page, remove card from view
            if (isCurrentlyFavorite && window.location.pathname.includes('favorites.html')) {
                const card = element.closest('.recipe-card');
                if (card) {
                    card.remove();
                    // Check if no favorites left
                    const favoritesContainer = document.getElementById('favorites-container');
                    if (favoritesContainer && favoritesContainer.children.length === 0) {
                        favoritesContainer.innerHTML = '<p class="no-favorites">Nog geen favorieten. Voeg recepten toe door op het hartje te klikken!</p>';
                    }
                }
            }
        } else {
            alert('Er is een fout opgetreden bij het bijwerken van je favorieten.');
        }
    } catch (error) {
        console.error('Error updating favorites:', error);
        alert('Er is een fout opgetreden bij het bijwerken van je favorieten.');
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    // Check if logged in
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }
    
    const favoritesContainer = document.getElementById('favorites-container');
    const token = localStorage.getItem('authToken');

    try {
        const response = await fetch(window.API.FAVORITES, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const favoriteRecipes = await response.json();
            if (favoriteRecipes.length === 0) {
                favoritesContainer.innerHTML = '<p class="no-favorites">Nog geen favorieten. Voeg recepten toe door op het hartje te klikken!</p>';
            } else {
                favoriteRecipes.forEach(recipe => {
                    recipe.isFavorite = true;
                    favoritesContainer.appendChild(createRecipeCard(recipe));
                });
            }
        } else {
            favoritesContainer.innerHTML = '<p class="no-favorites">Kon je favorieten niet laden. Probeer het later opnieuw.</p>';
        }
    } catch (error) {
        console.error('Error fetching favorites:', error);
        favoritesContainer.innerHTML = '<p class="no-favorites">Kon je favorieten niet laden. Probeer het later opnieuw.</p>';
    }
});
