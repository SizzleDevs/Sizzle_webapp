let favoriteRecipeIds = new Set();

function createRecipeCard(recipe) {
    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.onclick = () => {
        window.location.href = `recipe.html?id=${recipe.id}`;
    };

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

function renderSection(title, recipesList, highlightWord = '') {
    const section = document.createElement('section');
    section.className = 'recipe-section';
    
    let titleHtml = title;
    if (highlightWord) {
        titleHtml = title.replace(highlightWord, `<span class="highlight">${highlightWord}</span>`);
    }

    section.innerHTML = `<h2 class="section-title">${titleHtml}</h2>`;
    
    const grid = document.createElement('div');
    grid.className = 'recipe-scroll-container';
    
    recipesList.forEach(recipe => {
        grid.appendChild(createRecipeCard(recipe));
    });

    section.appendChild(grid);
    return section;
}

function getTimeBasedGreetingAndPrompt(hour) {
    // Returns appropriate Dutch greeting and question based on local hour
    if (hour >= 5 && hour < 12) {
        return { greeting: 'Goedemorgen', prompt: 'Wat wordt het vandaag' };
    } else if (hour >= 12 && hour < 18) {
        return { greeting: 'Goedemiddag', prompt: 'Wat wordt het vanavond' };
    } else {
        return { greeting: 'Goedenavond', prompt: 'Wat wordt het vanavond' };
    }
}

function updateHeroGreeting(name) {
    const hero = document.getElementById('hero-heading');
    if (!hero) return;
    const hour = new Date().getHours();
    const { greeting, prompt } = getTimeBasedGreetingAndPrompt(hour);
    const includeName = window.isLoggedIn() && name;
    if (includeName) {
        hero.innerHTML = `${greeting}, <span id="user-display-name" class="highlight">${name}</span><br>${prompt}?`;
    } else {
        hero.innerHTML = `${greeting}<br>${prompt}?`;
    }
}

async function loadData() {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = '';

    if (window.isLoggedIn()) {
        try {
            const favoritesResponse = await window.apiRequest(window.API.FAVORITES);
            if (favoritesResponse.ok) {
                const favoriteRecipes = await favoritesResponse.json();
                favoriteRecipeIds = new Set(favoriteRecipes.map(r => r.id));
            }
        } catch (error) {
            console.error('Error fetching favorites:', error);
        }

        // If fullname isn't already stored, fetch it from /me so UI can show the proper name
        if (!localStorage.getItem('fullname')) {
            try {
                const meResp = await window.apiRequest(window.API.ME);
                if (meResp.ok) {
                    const me = await meResp.json();
                    if (me.name) {
                        localStorage.setItem('fullname', me.name);
                    }
                }
            } catch (err) {
                console.error('Error fetching profile on home load:', err);
            }
        }
    }

    try {
        const response = await window.apiRequest(window.API.RECOMMENDATIONS);
        if (response.ok) {
            const recommendations = await response.json();
            contentArea.appendChild(renderSection('Voor jou', recommendations.voorkeur, 'jou'));
            contentArea.appendChild(renderSection('Als avondeten', recommendations.avondeten, 'avondeten'));
            contentArea.appendChild(renderSection('Trending nu', recommendations.trending, 'Trending'));
        } else {
            contentArea.innerHTML = '<p>Kon de aanbevelingen niet laden.</p>';
        }
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        contentArea.innerHTML = '<p>Kon de aanbevelingen niet laden.</p>';
    }

    // Update greeting
    let displayName = '';
    if (window.isLoggedIn()) {
        const fullname = window.getFullname();
        if (fullname) displayName = fullname;
    }
    const userDisplayNameElement = document.getElementById('user-display-name');
    if (userDisplayNameElement) {
        userDisplayNameElement.textContent = displayName || 'Gebruiker';
    }
    updateHeroGreeting(displayName);
}

// Initialize immediately if module, checking for readiness
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadData);
} else {
    loadData();
}

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        loadData();
    }
});

    window.addEventListener('pageshow', (event) => {
        if (event.persisted) {
            loadData();
        }
    });

    // Search bar functionality
    const searchInput = document.querySelector('.search-input-wrapper input');
    const searchButton = document.querySelector('.search-button');
    
    function handleSearch() {
        const searchTerm = searchInput.value.trim();
        if (searchTerm) {
            // Navigate to alle-recepten page with search query
            window.location.href = `alle-recepten.html?search=${encodeURIComponent(searchTerm)}`;
        }
    }
    
    searchButton.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });

    // Filter tags functionality
    const filterTags = document.querySelectorAll('.filters .filter-tag');
    filterTags.forEach(tag => {
        tag.addEventListener('click', (e) => {
            const filterName = tag.textContent.trim();
            if (filterName !== 'Meer filters...') {
                // Navigate to alle-recepten page with filter query
                // Preserve optional current search input
                const searchTerm = searchInput.value.trim();
                let url = `alle-recepten.html?filter=${encodeURIComponent(filterName)}`;
                if (searchTerm) {
                    url += `&search=${encodeURIComponent(searchTerm)}`;
                }
                window.location.href = url;
            }
        });
    });
});
