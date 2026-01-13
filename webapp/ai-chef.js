document.addEventListener('DOMContentLoaded', () => {
    if (!isLoggedIn()) {
        window.location.href = 'login';
        return;
    }

    const form = document.getElementById('ai-chef-form');
    const generateBtn = document.getElementById('generate-btn');
    const resultContainer = document.getElementById('result-container');
    const saveBtn = document.getElementById('save-recipe-btn');

    let currentRecipe = null;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const dishName = document.getElementById('dish-name').value;
        const ingredients = document.getElementById('ingredients').value;

        if (!ingredients.trim()) {
            notifyError('Voer alstublieft ingrediënten in.');
            return;
        }

        // UI Loading State
        generateBtn.classList.add('loading');
        generateBtn.disabled = true;
        resultContainer.classList.remove('visible');

        try {
            // Updated API call to /ai-recipe
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE_URL}/api/recepten/ai-recipe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    dish_name: dishName,
                    ingredients: ingredients
                })
            });

            if (!response.ok) {
                throw new Error('Generatie mislukt');
            }

            const recipe = await response.json();
            currentRecipe = recipe;
            displayRecipe(recipe);

        } catch (error) {
            console.error('Error:', error);
            notifyError('Er ging iets mis bij het genereren van het recept.');
        } finally {
            generateBtn.classList.remove('loading');
            generateBtn.disabled = false;
        }
    });

    saveBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        if (currentRecipe) {
            await saveAIRecipe(currentRecipe);
        }
    });

    function displayRecipe(recipe) {
        // Add source to recipe for identification
        recipe.source = "ai";
        
        // Set recipe title
        document.getElementById('recipe-title').textContent = recipe.title || 'AI Recept';
        
        const ingredientsList = document.getElementById('recipe-ingredients');
        ingredientsList.innerHTML = '';
        
        if (recipe.ingredients && recipe.ingredients.length > 0) {
            ingredientsList.innerHTML = recipe.ingredients.map(ing => `<li>${ing}</li>`).join('');
        } else {
            ingredientsList.innerHTML = '<li>Geen ingrediënten beschikbaar</li>';
        }

        const stepsList = document.getElementById('recipe-steps');
        stepsList.innerHTML = '';
        
        if (recipe.steps && recipe.steps.length > 0) {
            stepsList.innerHTML = recipe.steps.map((step, index) => `<li>${step}</li>`).join('');
        } else {
            stepsList.innerHTML = '<li>Geen bereidingsstappen beschikbaar</li>';
        }

        // Reset save button state
        saveBtn.classList.remove('saved');
        saveBtn.innerHTML = '<span class="material-symbols-rounded">favorite</span> Opslaan in Favorieten';
        saveBtn.disabled = false;

        resultContainer.classList.add('visible');
        
        // Scroll result into view
        resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
});

async function saveAIRecipe(recipe) {
    if (recipe.source !== "ai") {
        console.error("Only AI recipes can be saved here");
        return;
    }

    try {
        const token = localStorage.getItem('authToken');
        if (!token) {
            notifyError('Je moet ingelogd zijn om recepten op te slaan.');
            return;
        }

        // Add ID if missing (simple timestamp based)
        if (!recipe.id) {
            recipe.id = 'ai_' + Date.now();
        }

        // Prepare recipe data for backend
        const recipeData = {
            id: recipe.id,
            titel: recipe.title,
            beschrijving: recipe.description || 'AI gegenereerd recept',
            ingrediënten: recipe.ingredients || [],
            stappen: recipe.steps || [],
            bereidingstijd: recipe.cooking_time || 'Onbekend',
            moeilijkheidsgraad: recipe.difficulty || 'Gemiddeld',
            tags: recipe.tags || ['ai', 'gegenereerd'],
            afbeelding: recipe.image || '',
            bron: 'ai',
            // Add required fields that might be missing
            auteur: 'AI Chef',
            porties: recipe.servings || 2,
            voorbereidingstijd: recipe.prep_time || '10 minuten'
        };

        let backendSuccess = true;
        
        try {
            // Save to backend
            const response = await fetch(window.API.RECIPES, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(recipeData)
            });

            if (!response.ok) {
                backendSuccess = false;
                console.warn('Backend save failed, falling back to local storage only');
            } else {
                // Add to favorites
                const favoriteResponse = await fetch(window.API.FAVORITE_TOGGLE(recipe.id), {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!favoriteResponse.ok) {
                    backendSuccess = false;
                    console.warn('Favorite add failed, recipe saved to backend but not favorited');
                }
            }
        } catch (backendError) {
            console.error('Backend operation failed:', backendError);
            backendSuccess = false;
        }

        // Also save to localStorage for AI recipes section
        let aiRecipes = getAIRecipes();
        const exists = aiRecipes.some(r => r.id === recipe.id);
        if (!exists) {
            // Add all necessary fields to the stored recipe
            const recipeToStore = {
                ...recipe,
                id: recipe.id,
                titel: recipe.title,
                beschrijving: recipe.description || 'AI gegenereerd recept',
                ingrediënten: recipe.ingredients || [],
                stappen: recipe.steps || [],
                bereidingstijd: recipe.cooking_time || 'Onbekend',
                moeilijkheidsgraad: recipe.difficulty || 'Gemiddeld',
                tags: recipe.tags || ['ai', 'gegenereerd'],
                afbeelding: recipe.image || '',
                bron: 'ai',
                auteur: 'AI Chef',
                porties: recipe.servings || 2,
                voorbereidingstijd: recipe.prep_time || '10 minuten',
                source: 'ai',
                isFavorite: true,
                isAi: true
            };
            aiRecipes.push(recipeToStore);
            localStorage.setItem('aiRecipes', JSON.stringify(aiRecipes));
        }

        // Update UI
        const saveBtn = document.getElementById('save-recipe-btn');
        if (saveBtn) {
            saveBtn.innerHTML = '<span class="material-symbols-rounded">check</span> Opgeslagen';
            saveBtn.classList.add('saved');
            saveBtn.disabled = true;
        }
        
        // Show appropriate notification based on backend success
        if (backendSuccess) {
            notifySuccess('Recept opgeslagen in favorieten!');
        } else {
            notifySuccess('Recept lokaal opgeslagen. Je vindt het in je AI favorieten.');
        }
        
    } catch (e) {
        console.error("Failed to save AI recipe", e);
        notifyError('Kon recept niet opslaan. Probeer het later opnieuw.');
    }
}

function getAIRecipes() {
    try {
        const stored = localStorage.getItem('aiRecipes');
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error("Failed to parsing AI recipes", e);
        return [];
    }
}
