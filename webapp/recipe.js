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

    // Context elements (for selection feature)

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

        // Check if there's context from selection
        const contextBoxInput = document.getElementById('ai-context-box-input');
        const contextBoxText = document.getElementById('ai-context-box-text');
        const hasContext = contextBoxInput && !contextBoxInput.classList.contains('hidden');

        // User message (plain text, dimmed)
        const userMsg = document.createElement('p');
        userMsg.classList.add('message', 'user');
        userMsg.style.marginTop = '10px';
        userMsg.textContent = text;
        messages.appendChild(userMsg);

        // If there's context, append it inline next to the user message (small, italic, low opacity)
        if (hasContext && contextBoxText) {
            const contextSpan = document.createElement('span');
            contextSpan.classList.add('ai-message-context');
            contextSpan.innerHTML = `
                <em>${escapeHtml(contextBoxText.textContent)}</em>
            `;
            userMsg.appendChild(contextSpan);

            // Clear the context box above input
            contextBoxInput.classList.add('hidden');
        }
        input.value = '';
        
        // Reset placeholder after sending
        input.placeholder = 'Stel een vraag...';

        // AI Response (Mock) — plain text, full opacity
        setTimeout(() => {
            const aiMsg = document.createElement('p');
            aiMsg.classList.add('message', 'ai');
            aiMsg.style.marginTop = '10px';
            
            // Check if there was context
            if (hasContext) {
                aiMsg.textContent = 'Ik heb de geselecteerde tekst bekeken. Dat is een goede vraag! Je kunt dit ingrediënt vervangen door iets anders als je dat wilt.';
            } else {
                aiMsg.textContent = 'Dat is een goede vraag! Je kunt dit ingrediënt vervangen door iets anders als je dat wilt.';
            }
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

    // AI Text Selection Feature
    const aiSelectionBtn = document.getElementById('ai-selection-btn');
    const aiContextBoxInput = document.getElementById('ai-context-box-input');
    const aiContextBoxText = document.getElementById('ai-context-box-text');
    const aiContextBoxClose = document.getElementById('ai-context-box-close');
    let selectedText = '';
    let currentContextText = ''; // Track the current context for AI questions
    let isButtonClicked = false; // Prevent hiding during click

    // Function to show the button at selection position
    function showButtonAtSelection(text, selection) {
        selectedText = text;
        
        try {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            
            // Position the button above the selection, centered
            const btnWidth = 100; // approximate button width
            let left = rect.left + window.scrollX + (rect.width / 2) - (btnWidth / 2);
            let top = rect.top + window.scrollY - 45;
            
            // Keep button within viewport horizontally
            if (left < 10) left = 10;
            if (left + btnWidth > window.innerWidth - 10) left = window.innerWidth - btnWidth - 10;
            
            aiSelectionBtn.style.left = `${left}px`;
            aiSelectionBtn.style.top = `${top}px`;
            aiSelectionBtn.classList.remove('hidden');
        } catch (e) {
            // Selection might be invalid
            aiSelectionBtn.classList.add('hidden');
        }
    }

    // Function to check selection and show/hide button
    function checkSelection() {
        // Don't hide if button was just clicked
        if (isButtonClicked) return;
        
        const selection = window.getSelection();
        const text = selection.toString().trim();
        
        if (text && text.length > 0) {
            // Check if selection is within recipe content (ingredients or steps)
            const recipeContent = document.querySelector('.recipe-content');
            if (recipeContent && selection.anchorNode && recipeContent.contains(selection.anchorNode)) {
                showButtonAtSelection(text, selection);
                return;
            }
        }
        
        // Hide button if no valid selection
        aiSelectionBtn.classList.add('hidden');
    }

    // Show button when mouse is released after selecting
    document.addEventListener('mouseup', (e) => {
        // Don't process if clicking on the button itself
        if (e.target.closest('#ai-selection-btn')) return;
        
        // Small delay to ensure selection is finalized
        setTimeout(checkSelection, 50);
    });

    // Ensure pressed state is cleared on mouseup/touchend anywhere
    document.addEventListener('mouseup', () => {
        isButtonClicked = false;
        unmarkButtonPressed();
    });
    document.addEventListener('touchend', () => {
        isButtonClicked = false;
        unmarkButtonPressed();
    });

    // Handle "Vraag AI" button - use mousedown/touchstart for immediate response and visual pressed state
    function markButtonPressed() {
        aiSelectionBtn.classList.add('pressed');
    }
    function unmarkButtonPressed() {
        aiSelectionBtn.classList.remove('pressed');
    }

    aiSelectionBtn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        isButtonClicked = true;
        markButtonPressed();
    });
    aiSelectionBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        e.stopPropagation();
        isButtonClicked = true;
        markButtonPressed();
    });

    // Handle "Vraag AI" button click
    aiSelectionBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!selectedText) {
            isButtonClicked = false;
            return;
        }

        // Store the context for AI questions
        currentContextText = selectedText;

        // Show context box with truncated text (one line)
        const displayText = selectedText.length > 50 
            ? `"${selectedText.substring(0, 50)}..."` 
            : `"${selectedText}"`;
        aiContextBoxText.textContent = displayText;
        aiContextBoxInput.classList.remove('hidden');
        
        // Focus on the input field
        input.focus();

        // Hide the selection button
        aiSelectionBtn.classList.add('hidden');
        
        // Clear the text selection
        window.getSelection().removeAllRanges();
        
        // Reset flag after a delay and clear pressed state
        setTimeout(() => {
            isButtonClicked = false;
            unmarkButtonPressed();
        }, 100);
    });

    // Handle context box close button
    aiContextBoxClose.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Clear context
        currentContextText = '';
        aiContextBoxInput.classList.add('hidden');
    });

    // Helper function to escape HTML
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
});
