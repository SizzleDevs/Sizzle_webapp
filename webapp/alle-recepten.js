let recipes = [];
let filteredRecipes = [];
let selectedFilters = new Set();
let favoriteRecipeIds = new Set();

function createRecipeCard(recipe) {
    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.setAttribute('onclick', `window.location.href = 'recipe.html?id=${recipe.id}'`);

    // Deduplicate tags case-insensitively and preserve first-seen display form
    const rawTags = Array.isArray(recipe.tags) ? recipe.tags : [];
    const displayMap = new Map();
    rawTags.forEach(t => {
        const normalized = normalizeTag(t);
        const display = (t || '').toString().trim();
        if (normalized && !displayMap.has(normalized)) {
            displayMap.set(normalized, display);
        }
    });
    const uniqueTags = Array.from(displayMap.values());
    const tagsHtml = uniqueTags.map(tag => `<span class="card-tag">${tag}</span>`).join('');
    const isFavorite = favoriteRecipeIds.has(recipe.id);
    const heartClass = isFavorite ? 'favorited' : '';

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
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }

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
            if (isCurrentlyFavorite) {
                favoriteRecipeIds.delete(id);
            } else {
                favoriteRecipeIds.add(id);
            }
        } else {
            notifyError('Er is een fout opgetreden bij het bijwerken van je favorieten.');
        }
    } catch (error) {
        console.error('Error updating favorites:', error);
        notifyError('Er is een fout opgetreden bij het bijwerken van je favorieten.');
    }
};

function normalizeTag(tag) {
    return (tag || '').toString().trim().toLowerCase();
}

function getAllUniqueTags() {
    // Use a Map to deduplicate tags case-insensitively and by trimming
    const map = new Map();
    recipes.forEach(recipe => {
        (Array.isArray(recipe.tags) ? recipe.tags : []).forEach(tag => {
            const normalized = normalizeTag(tag);
            if (normalized && !map.has(normalized)) {
                map.set(normalized, tag.toString().trim());
            }
        });
    });
    // Preserve first-seen casing for display, sort locale-aware
    return Array.from(map.values()).sort((a, b) => a.localeCompare(b, 'nl', { sensitivity: 'base' }));
}

function renderFilters() {
    const filtersContainer = document.getElementById('filters-container');
    filtersContainer.innerHTML = '';
    
    const allTags = getAllUniqueTags();
    
    allTags.forEach(tag => {
        const button = document.createElement('button');
        button.className = 'filter-tag';
        const normalized = normalizeTag(tag);
        button.dataset.normalized = normalized;
        if (selectedFilters.has(normalized)) {
            button.classList.add('active');
        }
        button.textContent = tag;
        button.onclick = (e) => {
            e.preventDefault();
            toggleFilter(normalized, button);
        };
        filtersContainer.appendChild(button);
    });
}

function toggleFilter(normalizedTag, button) {
    if (selectedFilters.has(normalizedTag)) {
        selectedFilters.delete(normalizedTag);
        if (button) button.classList.remove('active');
    } else {
        selectedFilters.add(normalizedTag);
        if (button) button.classList.add('active');
    }
    applyFilters();
}

function applyFilters() {
    const searchInput = document.getElementById('search-input').value.toLowerCase();
    
    filteredRecipes = recipes.filter(recipe => {
        // Search filter
        const matchesSearch = recipe.titel.toLowerCase().includes(searchInput) ||
                            (Array.isArray(recipe.tags) && recipe.tags.some(tag => normalizeTag(tag).includes(searchInput)));
        
        // Tags filter: ensure every selected filter is present in the recipe's normalized tags (AND behavior)
        const recipeTags = Array.isArray(recipe.normalizedTags) ? recipe.normalizedTags : (Array.isArray(recipe.tags) ? recipe.tags.map(normalizeTag) : []);
        const matchesTags = selectedFilters.size === 0 ||
            Array.from(selectedFilters).every(filter => recipeTags.includes(filter));
        
        return matchesSearch && matchesTags;
    });
    
    renderRecipes();
}

function renderRecipes() {
    const grid = document.getElementById('recipes-grid');
    grid.innerHTML = '';
    
    if (filteredRecipes.length === 0) {
        grid.innerHTML = '<p class="no-results">Geen recepten gevonden. Probeer andere filters.</p>';
        return;
    }
    
    filteredRecipes.forEach(recipe => {
        grid.appendChild(createRecipeCard(recipe));
    });
}

function getURLParameters() {
    const params = new URLSearchParams(window.location.search);
    return {
        search: params.get('search') || '',
        filter: params.get('filter') || ''
    };
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const recipesResponse = await fetch(window.API.RECIPES);
        let data = await recipesResponse.json();

        // Handle case where API returns a stringified JSON
        if (typeof data === 'string') {
            try {
                data = JSON.parse(data);
            } catch (e) {
                console.error('Error parsing JSON string from API:', e);
            }
        }

        if (Array.isArray(data)) {
            recipes = data;
            // Precompute normalized tags for each recipe to make filtering robust and efficient
            recipes.forEach(r => {
                const raw = Array.isArray(r.tags) ? r.tags : [];
                r.normalizedTags = Array.from(new Set(raw.map(normalizeTag).filter(Boolean)));
            });
        } else {
            console.error('API response is not an array:', data);
            recipes = [];
        }

        if (isLoggedIn()) {
            const token = localStorage.getItem('authToken');
            const favoritesResponse = await fetch(window.API.FAVORITES, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (favoritesResponse.ok) {
                const favoriteRecipes = await favoritesResponse.json();
                favoriteRecipeIds = new Set(favoriteRecipes.map(r => r.id));
            }
        }
        
        // Get URL parameters
        const { search, filter } = getURLParameters();
        
        // Apply search parameter if provided
        if (search) {
            document.getElementById('search-input').value = search;
        }
        
        // Apply filter parameter if provided (support comma-separated list)
        if (filter) {
            const parts = filter.split(',').map(s => s.trim()).filter(Boolean);
            parts.forEach(p => selectedFilters.add(normalizeTag(p)));
        }
        
        // Initial render (after setting selected filters)
        renderFilters();
        
        // Apply filters and render recipes
        applyFilters();
        
        // Search input listener
        document.getElementById('search-input').addEventListener('input', applyFilters);
        
        // Search button listener
        document.getElementById('search-btn').addEventListener('click', (e) => {
            e.preventDefault();
            applyFilters();
        });
    } catch (error) {
        console.error('Error fetching data:', error);
        const grid = document.getElementById('recipes-grid');
        grid.innerHTML = '<p class="no-results">Kon de recepten niet laden. Probeer het later opnieuw.</p>';
    }
});
