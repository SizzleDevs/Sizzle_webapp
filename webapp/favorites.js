import { recipes } from './data.js';

function createRecipeCard(recipe) {
    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.onclick = () => {
        window.location.href = `recipe.html?id=${recipe.id}`;
    };

    const tagsHtml = recipe.tags.map(tag => `<span class="card-tag">${tag}</span>`).join('');
    const heartIcon = recipe.isFavorite ? 'favorite' : 'favorite_border';
    const heartClass = recipe.isFavorite ? 'filled' : '';

    card.innerHTML = `
        <div class="card-header">
            <div class="card-title">${recipe.titel}</div>
            <div class="favorite-icon" onclick="event.stopPropagation(); toggleFavorite(this, '${recipe.id}')">
                <span class="material-symbols-rounded ${heartClass}">${heartIcon}</span>
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
    if (icon.textContent === 'favorite_border') {
        icon.textContent = 'favorite';
        icon.classList.add('filled');
        console.log(`Added ${id} to favorites`);
    } else {
        icon.textContent = 'favorite_border';
        icon.classList.remove('filled');
        console.log(`Removed ${id} from favorites`);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // Check if logged in
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }
    
    // Load favorite recipes
    const favoritesContainer = document.getElementById('favorites-container');
    const favoriteRecipes = recipes.filter(recipe => recipe.isFavorite);

    if (favoriteRecipes.length === 0) {
        favoritesContainer.innerHTML = '<p class="no-favorites">Nog geen favorieten. Voeg recepten toe door op het hartje te klikken!</p>';
    } else {
        favoriteRecipes.forEach(recipe => {
            favoritesContainer.appendChild(createRecipeCard(recipe));
        });
    }
});
