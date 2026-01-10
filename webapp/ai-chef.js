document.addEventListener('DOMContentLoaded', () => {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
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

    saveBtn.addEventListener('click', () => {
        if (currentRecipe) {
            saveAIRecipe(currentRecipe);
        }
    });

    function displayRecipe(recipe) {
        document.getElementById('recipe-title').textContent = recipe.title;
        document.getElementById('recipe-time').textContent = recipe.cooking_time;
        document.getElementById('recipe-difficulty').textContent = recipe.difficulty;

        const ingredientsList = document.getElementById('recipe-ingredients');
        ingredientsList.innerHTML = recipe.ingredients.map(ing => `<li>${ing}</li>`).join('');

        const stepsList = document.getElementById('recipe-steps');
        stepsList.innerHTML = recipe.steps.map(step => `<li>${step}</li>`).join('');

        // Reset save button state
        saveBtn.classList.remove('saved');
        saveBtn.innerHTML = '<span class="material-symbols-rounded">favorite</span> Opslaan in Favorieten';
        saveBtn.disabled = false;

        resultContainer.classList.add('visible');
        
        // Scroll result into view
        resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
});

function saveAIRecipe(recipe) {
    if (recipe.source !== "ai") {
        console.error("Only AI recipes can be saved here");
        return;
    }

    try {
        let aiRecipes = getAIRecipes();
        
        // Add ID if missing (simple timestamp based)
        if (!recipe.id) {
            recipe.id = 'ai_' + Date.now();
        }

        // Check duplicates (avoid adding same generated result twice)
        // Here we just check simple existence, not content
        const exists = aiRecipes.some(r => r.id === recipe.id);
        if (exists) {
            notifyError('Dit recept is al opgeslagen!');
            return;
        }

        aiRecipes.push(recipe);
        localStorage.setItem('aiRecipes', JSON.stringify(aiRecipes));
        
        // Update UI
        const saveBtn = document.getElementById('save-recipe-btn');
        if (saveBtn) {
            saveBtn.innerHTML = '<span class="material-symbols-rounded">check</span> Opgeslagen';
            saveBtn.classList.add('saved');
            saveBtn.disabled = true;
        }
        
    } catch (e) {
        console.error("Failed to save AI recipe", e);
        notifyError('Kon recept niet lokaal opslaan.');
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
