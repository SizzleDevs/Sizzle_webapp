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
window.toggleFavorite = function(element, id) {
    const icon = element.querySelector('.material-symbols-rounded');
    if (!icon.classList.contains('favorited')) {
        icon.classList.add('favorited');
        console.log(`Added ${id} to favorites`);
    } else {
        icon.classList.remove('favorited');
        console.log(`Removed ${id} from favorites`);
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
        const response = await fetch('http://127.0.0.1:5000/api/favorieten', {
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
