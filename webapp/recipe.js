import { recipeDetails } from './data.js';

function getRecipeId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id') || "1"; // Default to 1 if not found
}

function renderRecipe(recipe) {
    document.getElementById('recipe-title').textContent = recipe.titel;
    
    const tagsContainer = document.getElementById('recipe-tags');
    tagsContainer.innerHTML = recipe.tags.map(tag => `<span class="card-tag">${tag}</span>`).join('');

    // Ingredients
    const ingredientList = document.getElementById('ingredient-list');
    ingredientList.innerHTML = '';
    recipe.ingrediënten.forEach((ing, index) => {
        const li = document.createElement('li');
        li.className = 'ingredient-item';
        
        li.innerHTML = `
            <div class="checkbox-wrapper" onclick="toggleCheckbox(this)">
                <div class="custom-checkbox unchecked"><span class="material-symbols-rounded">check</span></div>
                <span>${ing.naam}</span>
            </div>
            <span class="amount" data-base="${ing.hoeveelheid}">${ing.hoeveelheid}</span>
        `;
        ingredientList.appendChild(li);
    });

    // Steps
    const stepsList = document.getElementById('steps-list');
    stepsList.innerHTML = '';
    recipe.stappen.forEach((step, index) => {
        const stepDiv = document.createElement('div');
        stepDiv.className = 'step-card';
        
        stepDiv.innerHTML = `
            <div class="step-header">
                <div class="checkbox-wrapper" onclick="toggleCheckbox(this)">
                    <div class="custom-checkbox unchecked"><span class="material-symbols-rounded">check</span></div>
                    <span>Stap ${step.stapNummer}</span>
                </div>
                <span class="step-time">${step.duur} min <span class="material-symbols-rounded" style="font-size: 1rem; vertical-align: text-bottom;">timer</span></span>
            </div>
            <p>${step.beschrijving}</p>
        `;
        stepsList.appendChild(stepDiv);
    });
}

// Servings control logic
let baseServings = 4; // default assumed base servings
let currentServings = baseServings;
let servingsIntervalId = null;
let servingsDirection = 0; // 1 for increase, -1 for decrease, 0 for none

function parseNumberFromString(text) {
    if (!text) return null;
    const trimmed = text.trim();
    // Match numbers like 1, 1.5, 1,5 or fractions like 1/2
    const match = trimmed.match(/^([0-9]+(?:[.,][0-9]+)?|[0-9]+\/[0-9]+)\s*(.*)$/);
    if (!match) return { num: null, unit: trimmed };
    let numStr = match[1];
    let unit = match[2] ? match[2].trim() : '';
    let num = null;
    if (numStr.includes('/')) {
        const parts = numStr.split('/').map(s => parseFloat(s));
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1]) && parts[1] !== 0) {
            num = parts[0] / parts[1];
        }
    } else {
        num = parseFloat(numStr.replace(',', '.'));
    }
    if (isNaN(num)) num = null;
    return { num, unit };
}

function formatNumber(n) {
    if (n == null) return '';
    if (Math.abs(n - Math.round(n)) < 1e-6) return String(Math.round(n));
    // Show up to 2 decimals, trim trailing zeros
    return parseFloat(n.toFixed(2)).toString();
}

function convertUnit(num, unit) {
    // If number is 1 or bigger, keep original unit
    if (num >= 1) {
        return { num, unit };
    }
    
    // If number is less than 1, convert to smaller unit
    const lowerUnit = unit.toLowerCase().trim();
    
    if (lowerUnit === 'kilo' || lowerUnit === 'kilo\'s') {
        return { num: num * 1000, unit: 'gram' };
    }
    if (lowerUnit === 'liter' || lowerUnit === 'liters') {
        return { num: num * 1000, unit: 'mL' };
    }
    
    // Return as-is if no conversion needed
    return { num, unit };
}

function updateIngredientAmounts() {
    const items = document.querySelectorAll('#ingredient-list .ingredient-item');
    items.forEach(li => {
        const span = li.querySelector('.amount');
        const base = span.dataset.base || span.textContent;
        const parsed = parseNumberFromString(base);
        if (parsed.num == null) {
            // Can't parse number, leave as-is
            span.textContent = base;
            return;
        }
        const factor = currentServings / baseServings;
        const newNum = parsed.num * factor;
        
        // Convert units if needed
        const converted = convertUnit(newNum, parsed.unit);
        
        span.textContent = `${formatNumber(converted.num)}${converted.unit ? ' ' + converted.unit : ''}`;
    });
}

function setServings(n) {
    if (n < 1) n = 1;
    currentServings = n;
    const sc = document.getElementById('servings-count');
    if (sc) sc.textContent = `${currentServings} Personen`;
    updateIngredientAmounts();
}

// Expose for testing if needed
window.setServings = setServings;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize servings control buttons
    const decreaseBtn = document.getElementById('decrease-servings');
    const increaseBtn = document.getElementById('increase-servings');
    const sc = document.getElementById('servings-count');
    // Try to read initial servings from DOM (e.g., "4 Personen")
    if (sc) {
        const match = sc.textContent.trim().match(/(\d+)/);
        if (match) {
            baseServings = parseInt(match[1], 10) || baseServings;
            currentServings = baseServings;
        }
    }

    // Decrease button events
    if (decreaseBtn) {
        decreaseBtn.addEventListener('mousedown', () => {
            servingsDirection = -1;
            startServingsInterval();
        });
        decreaseBtn.addEventListener('touchstart', () => {
            servingsDirection = -1;
            startServingsInterval();
        });
        decreaseBtn.addEventListener('click', () => setServings(currentServings - 1));
    }

    // Increase button events
    if (increaseBtn) {
        increaseBtn.addEventListener('mousedown', () => {
            servingsDirection = 1;
            startServingsInterval();
        });
        increaseBtn.addEventListener('touchstart', () => {
            servingsDirection = 1;
            startServingsInterval();
        });
        increaseBtn.addEventListener('click', () => setServings(currentServings + 1));
    }

    // Stop interval on mouse/touch up
    document.addEventListener('mouseup', stopServingsInterval);
    document.addEventListener('touchend', stopServingsInterval);
});

function startServingsInterval() {
    if (servingsIntervalId) return;
    servingsIntervalId = setInterval(() => {
        if (servingsDirection !== 0) {
            setServings(currentServings + servingsDirection);
        }
    }, 250); // 4 times per second
}

function stopServingsInterval() {
    if (servingsIntervalId) {
        clearInterval(servingsIntervalId);
        servingsIntervalId = null;
    }
    servingsDirection = 0;
}

// Global function for onclick handlers (since module scope is not global)
window.toggleCheckbox = function(element) {
    const checkbox = element.querySelector('.custom-checkbox');
    if (checkbox.classList.contains('unchecked')) {
        checkbox.classList.remove('unchecked');
        // Add checked style if needed, currently CSS handles unchecked state transparency
    } else {
        checkbox.classList.add('unchecked');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const id = getRecipeId();
    const recipe = recipeDetails[id] || recipeDetails["1"];
    
    if (recipe) {
        renderRecipe(recipe);
        // Apply unit conversion immediately after rendering
        updateIngredientAmounts();
    } else {
        document.getElementById('recipe-title').textContent = "Recept niet gevonden";
    }

    /*
       Implementation according to API documentation:
       
       // Fetch recipe details
       fetch(`/api/recepten/${id}`)
           .then(res => res.json())
           .then(data => renderRecipe(data));
    */

    // AI Chat Mock
    const sendBtn = document.getElementById('ai-send');
    const input = document.getElementById('ai-input');
    const messages = document.getElementById('ai-messages');
    const aiRobotWrapper = document.querySelector('.ai-robot-wrapper');

    // If there are already messages, hide the robot helper wrapper
    if (aiRobotWrapper && messages && messages.children.length > 0) {
        aiRobotWrapper.classList.add('hidden');
    }

    sendBtn.addEventListener('click', () => {
        const text = input.value;
        if (!text) return;

        // hide robot helper wrapper on first user interaction
        if (aiRobotWrapper && !aiRobotWrapper.classList.contains('hidden')) {
            aiRobotWrapper.classList.add('hidden');
        }

        // User message (plain text, dimmed)
        const userMsg = document.createElement('p');
        userMsg.classList.add('message', 'user');
        userMsg.style.marginTop = '10px';
        userMsg.textContent = text;
        messages.appendChild(userMsg);
        input.value = '';

        // AI Response (Mock) — plain text, full opacity
        setTimeout(() => {
            const aiMsg = document.createElement('p');
            aiMsg.classList.add('message', 'ai');
            aiMsg.style.marginTop = '10px';
            aiMsg.textContent = 'Dat is een goede vraag! Je kunt dit ingrediënt vervangen door iets anders als je dat wilt.';
            messages.appendChild(aiMsg);
            messages.scrollTop = messages.scrollHeight;
        }, 1000);

        /*
           API Implementation:
           
           fetch(`/api/recepten/${id}/vraag`, {
               method: 'POST',
               headers: {
                   'Content-Type': 'application/json',
                   'Authorization': 'Bearer ' + localStorage.getItem('token')
               },
               body: JSON.stringify({ vraag: text })
           })
           .then(res => res.json())
           .then(data => {
               // Show data.antwoord
           });
        */
    });

        // Allow pressing Enter in the input to send the message
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendBtn.click();
            }
        });
});
