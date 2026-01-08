let recipes = [];
let filteredRecipes = [];
let selectedFilters = new Set();
let favoriteRecipeIds = new Set();

function createRecipeCard(recipe) {
    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.setAttribute('onclick', `window.location.href = 'recipe.html?id=${recipe.id}'`);

    const tagsHtml = recipe.tags.map(tag => `<span class="card-tag">${tag}</span>`).join('');
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
            alert('Er is een fout opgetreden bij het bijwerken van je favorieten.');
        }
    } catch (error) {
        console.error('Error updating favorites:', error);
        alert('Er is een fout opgetreden bij het bijwerken van je favorieten.');
    }
};

function getAllUniqueTags() {
    const tags = new Set();
    recipes.forEach(recipe => {
        recipe.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
}

function renderFilters() {
    const filtersContainer = document.getElementById('filters-container');
    filtersContainer.innerHTML = '';
    
    const allTags = getAllUniqueTags();
    allTags.forEach(tag => {
        const button = document.createElement('button');
        button.className = 'filter-tag';
        if (selectedFilters.has(tag)) {
            button.classList.add('active');
        }
        button.textContent = tag;
        button.onclick = (e) => {
            e.preventDefault();
            toggleFilter(tag, button);
        };
        filtersContainer.appendChild(button);
    });
}

function toggleFilter(tag, button) {
    if (selectedFilters.has(tag)) {
        selectedFilters.delete(tag);
        if (button) button.classList.remove('active');
    } else {
        selectedFilters.add(tag);
        if (button) button.classList.add('active');
    }
    applyFilters();
    updateURLParams();
}

function applyFilters() {
    const searchInput = document.getElementById('search-input').value.toLowerCase();
    
    filteredRecipes = recipes.filter(recipe => {
        // Search filter
        const matchesSearch = recipe.titel.toLowerCase().includes(searchInput) ||
                            recipe.tags.some(tag => tag.toLowerCase().includes(searchInput));
        
        // Tags filter - when filters are selected, recipe must contain ALL selected tags
        const matchesTags = selectedFilters.size === 0 || 
                           Array.from(selectedFilters).every(filter => recipe.tags.map(t => t.toLowerCase()).includes(filter.toLowerCase()));
        
        return matchesSearch && matchesTags;
    });
    
    renderRecipes();
}

function updateURLParams() {
    const params = new URLSearchParams();
    if (selectedFilters.size > 0) {
        // Encode filter values so special characters are safe in the URL
        params.set('filter', Array.from(selectedFilters).map(encodeURIComponent).join(','));
    }
    const searchVal = document.getElementById('search-input').value.trim();
    if (searchVal) params.set('search', searchVal);
    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    history.replaceState({}, '', newUrl);
}

function findFilterButton(tag) {
    const buttons = document.querySelectorAll('#filters-container .filter-tag');
    for (const btn of buttons) {
        if (btn.textContent.trim() === tag) return btn;
    }
    return null;
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

    // Make card tags clickable to toggle filters
    document.querySelectorAll('.card-tag').forEach(el => {
        el.style.cursor = 'pointer';
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            const tag = el.textContent.trim();
            const btn = findFilterButton(tag);
            toggleFilter(tag, btn);
        });
    });
}

function getURLParameters() {
    const params = new URLSearchParams(window.location.search);
    // Support comma-separated filters so multiple tags can be pre-selected
    const filterParam = params.get('filter') || '';
    // Decode each value in case the filter names were URL-encoded when set
    const filters = filterParam ? filterParam.split(',').map(f => decodeURIComponent(f).trim()).filter(Boolean) : [];
    return {
        search: params.get('search') || '',
        filters
    };
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const recipesResponse = await fetch(window.API.RECIPES);
        recipes = await recipesResponse.json();

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
        const { search, filters } = getURLParameters();
        
        // Initial render of filters
        renderFilters();
        
        // Apply search parameter if provided
        if (search) {
            document.getElementById('search-input').value = search;
        }
        
        // Apply filter parameters (support multiple)
        // Match incoming filters to available tags case-insensitively so the correct
        // filter buttons get the `.active` class applied using the canonical tag
        if (filters && filters.length) {
            const allTags = getAllUniqueTags();
            filters.forEach(f => {
                const match = allTags.find(t => t.toLowerCase() === f.toLowerCase());
                if (match) selectedFilters.add(match);
                else selectedFilters.add(f);
            });
            renderFilters();
        }
        
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
