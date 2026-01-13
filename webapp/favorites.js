function createRecipeCard(recipe) {
    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.onclick = () => {
        window.location.href = `recipe?id=${recipe.id}`;
    };

    // Normalize tags to avoid runtime errors if tags is not an array
    const safeTags = Array.isArray(recipe.tags) ? recipe.tags : (typeof recipe.tags === 'string' ? recipe.tags.split(',').map(t => t.trim()).filter(Boolean) : []);
    const tagsHtml = safeTags.map(tag => `<span class="card-tag">${tag}</span>`).join('');
    const heartClass = recipe.isFavorite ? 'favorited' : '';

    // Use a tolerant title fallback (AI recipes may have `title` instead of `titel`)
    const titleText = recipe.titel || recipe.title || 'Onbekend';

    card.innerHTML = `
        <div class="card-header">
            <div class="card-title">${titleText}</div>
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
            if (isCurrentlyFavorite && window.location.pathname.includes('favorites')) {
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
            notifyError('Er is een fout opgetreden bij het bijwerken van je favorieten.');
        }
    } catch (error) {
        console.error('Error updating favorites:', error);
        notifyError('Er is een fout opgetreden bij het bijwerken van je favorieten.');
    }
};

// Helper to get AI recipes from localStorage
function getAIRecipes() {
    try {
        const stored = localStorage.getItem('aiRecipes');
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error("Failed to parsing AI recipes", e);
        return [];
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    // Check if logged in
    if (!isLoggedIn()) {
        window.location.href = 'login';
        return;
    }
    
    // --- Load Standard Favorites ---
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

    // --- Load AI Favorites ---
    const aiContainer = document.getElementById('ai-favorites-container');
    const aiSection = document.getElementById('ai-section');
    const rawAiRecipes = getAIRecipes();

    // Normalize AI recipes to avoid rendering issues (missing title/tags etc.)
    const aiRecipes = rawAiRecipes.map(r => ({
        ...r,
        titel: r.titel || r.title || 'AI Recept',
        tags: Array.isArray(r.tags) ? r.tags : (typeof r.tags === 'string' ? r.tags.split(',').map(t => t.trim()).filter(Boolean) : (r.tags ? [String(r.tags)] : [])),
        isAi: true,
        isFavorite: true
    }));

    if (aiRecipes.length > 0 && aiContainer && aiSection) {
        aiSection.style.display = 'block';
        aiRecipes.forEach(recipe => {
            const card = createRecipeCard(recipe);
            
            // Override onclick for AI recipes to point to custom detail view
            card.onclick = () => {
                window.location.href = `ai-recept.html?id=${recipe.id}`;
            };
            
            // Override heart behavior for AI recipes (local delete)
            const heartDiv = card.querySelector('.favorite-icon');
            if (heartDiv) {
                // Remove existing listeners by cloning
                const newHeart = heartDiv.cloneNode(true);
                heartDiv.parentNode.replaceChild(newHeart, heartDiv);
                
                // Force filled heart
                const icon = newHeart.querySelector('.material-symbols-rounded');
                icon.classList.add('favorited');
                
                newHeart.onclick = (e) => {
                    e.stopPropagation();
                    if (confirm('Wil je dit AI recept verwijderen?')) {
                        removeAIRecipe(recipe.id);
                        card.remove();
                        if (getAIRecipes().length === 0) {
                            aiSection.style.display = 'none';
                        }
                    }
                };
            }

            aiContainer.appendChild(card);
        });
    }
});

function removeAIRecipe(id) {
    let recipes = getAIRecipes();
    recipes = recipes.filter(r => r.id !== id);
    localStorage.setItem('aiRecipes', JSON.stringify(recipes));
}

