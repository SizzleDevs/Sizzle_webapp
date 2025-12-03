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

    // Store steps and ingredients globally for cookmode
    window._sizzleRecipeSteps = recipe.stappen;
    window._sizzleRecipeIngredients = recipe.ingrediënten;
}

// --- Cookmode Step-by-Step Overlay ---
let cookmodeStepIdx = 0;
let cookmodeSlideDirection = 'right'; // 'left' when going back, 'right' when going forward

function cookmodeRenderStep(idx) {
    const steps = window._sizzleRecipeSteps;
    const ingredients = window._sizzleRecipeIngredients;
    if (!steps || !steps.length) return;
    // In cookmode we present ingredients as the first step (index 0),
    // followed by the real steps. So total steps in cookmode is steps.length + 1
    const totalSteps = steps.length + 1;
    const isIngredientStep = idx === 0;
    const step = isIngredientStep ? null : steps[idx - 1];
    const anim = document.getElementById('cookmode-step-anim');
    const ingredientsContainer = document.getElementById('cookmode-ingredients');
    if (!anim) return;
    
    // Animate out old content with slide
    const slideOutClass = cookmodeSlideDirection === 'right' ? 'slide-out-left' : 'slide-out-right';
    const slideInClass = cookmodeSlideDirection === 'right' ? 'slide-in-right' : 'slide-in-left';
    
    // Remove any existing animation classes and reset state
    anim.classList.remove('slide-in-left', 'slide-in-right', 'slide-out-left', 'slide-out-right');
    
    // Force a reflow to ensure the starting state is applied
    void anim.offsetWidth;
    
    // Add slide-out class to animate the current content out
    anim.classList.add(slideOutClass);
    
    // Wait for the slide-out transition to complete (matches CSS transition duration)
    setTimeout(() => {
        // Remove slideOutClass and hide element briefly while swapping content
        anim.classList.remove(slideOutClass);
        anim.style.opacity = '0';
        // If this is the ingredient step, show ingredients in the center (no yellow label)
        if (isIngredientStep) {
            anim.innerHTML = `
                <div class="cookmode-step-main">
                    <div class="cookmode-ingredients-inner">
                        <div class="cookmode-ingredients-header">
                            <h3>Ingrediënten</h3>
                            <div class="cookmode-servings-control">
                                <button id="cookmode-decrease-servings"><span class="material-symbols-rounded" style="font-size: 1rem;">remove</span></button>
                                <span id="cookmode-servings-count">${window._cookmodeServings || 4} Personen</span>
                                <button id="cookmode-increase-servings"><span class="material-symbols-rounded" style="font-size: 1rem;">add</span></button>
                            </div>
                        </div>
                        <ul class="cookmode-ingredients-list" id="cookmode-ingredients-list">
                            ${ingredients.map(ing => `
                                <li class="ingredient-item" data-base="${ing.hoeveelheid}">
                                    <div class="checkbox-wrapper" onclick="toggleCheckbox(this)">
                                        <div class="custom-checkbox unchecked"><span class="material-symbols-rounded">check</span></div>
                                        <span>${ing.naam}</span>
                                    </div>
                                    <span class="ing-amount" data-base="${ing.hoeveelheid}">${ing.hoeveelheid}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
            `;
        } else {
            // Render the actual step.
            const sanitizedDesc = sanitizeStepDescription(step.beschrijving, ingredients);
            const stepNumberLabel = `Stap ${step.stapNummer} van ${steps.length}`;
            anim.innerHTML = `
                <div class="cookmode-step-label">${stepNumberLabel}</div>
                <div class="cookmode-step-main">
                    <div class="cookmode-step-time"><span class="material-symbols-rounded">timer</span> ${step.duur} min</div>
                    <div class="cookmode-step-desc">${sanitizedDesc}</div>
                </div>
            `;
        }
        
        // Setup servings control and update amounts after content is rendered
        if (isIngredientStep) {
            setTimeout(() => {
                setupCookmodeServingsControl();
                updateCookmodeIngredientAmounts();
            }, 20);
        }
        
        // Reset opacity and trigger slide-in animation
        anim.style.opacity = '';
        requestAnimationFrame(() => {
            anim.classList.add(slideInClass);
        });
    }, 250); // Wait for slide-out transition (0.22s = 220ms, add buffer)
    
    // Manage the side ingredients column: hide it when ingredients are shown in the center,
    // otherwise clear/hide to avoid the vertical divider showing duplicated content.
    if (ingredientsContainer) {
        if (isIngredientStep) {
            // Hide side column (CSS .hidden exists in page) so content appears centered
            ingredientsContainer.classList.add('hidden');
        } else {
            ingredientsContainer.classList.remove('hidden');
            // Clear any previous content to avoid duplication
            ingredientsContainer.innerHTML = '';
        }
    }
    
    // Nav buttons - use invisible class instead of display:none for consistent layout
    const prevBtn = document.getElementById('cookmode-prev');
    const nextBtn = document.getElementById('cookmode-next');
    if (prevBtn) {
        if (idx > 0) {
            prevBtn.classList.remove('invisible');
        } else {
            prevBtn.classList.add('invisible');
        }
    }
    if (nextBtn) {
        if (idx < totalSteps - 1) {
            nextBtn.innerHTML = 'Volgende stap <span class="material-symbols-rounded">arrow_forward</span>';
            nextBtn.disabled = false;
        } else {
            nextBtn.innerHTML = 'Klaar!';
            nextBtn.disabled = false;
        }
    }
}

// Helper: escape regex special chars for ingredient names
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Remove ingredient names from step descriptions to avoid duplication in cookmode
function sanitizeStepDescription(description, ingredients) {
    if (!description) return '';
    let out = description;
    if (ingredients && Array.isArray(ingredients)) {
        ingredients.forEach(ing => {
            if (!ing || !ing.naam) return;
            const name = ing.naam.trim();
            if (!name) return;
            const re = new RegExp('\\b' + escapeRegExp(name) + '\\b', 'gi');
            out = out.replace(re, '');
        });
    }
    // Collapse multiple spaces and clean up stray punctuation
    out = out.replace(/\s{2,}/g, ' ').trim();
    out = out.replace(/\s([,.;:!])/g, '$1');
    return out;
}

function openCookmode() {
    const overlay = document.getElementById('cookmode-overlay');
    if (!overlay) return;
    // Initialize cookmode servings from main servings
    window._cookmodeServings = currentServings;
    window._cookmodeBaseServings = baseServings;
    overlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    cookmodeStepIdx = 0;
    cookmodeRenderStep(cookmodeStepIdx);
}

function closeCookmode() {
    const overlay = document.getElementById('cookmode-overlay');
    if (!overlay) return;
    overlay.classList.add('hidden');
    document.body.style.overflow = '';
}

// Cookmode servings control
function updateCookmodeIngredientAmounts() {
    const items = document.querySelectorAll('#cookmode-ingredients-list li');
    const servings = window._cookmodeServings || 4;
    const base = window._cookmodeBaseServings || 4;
    items.forEach(li => {
        const baseAmount = li.dataset.base;
        const amountSpan = li.querySelector('.ing-amount');
        if (!amountSpan || !baseAmount) return;
        const parsed = parseNumberFromString(baseAmount);
        if (parsed.num == null) {
            amountSpan.textContent = baseAmount;
            return;
        }
        const factor = servings / base;
        const newNum = parsed.num * factor;
        const converted = convertUnit(newNum, parsed.unit);
        amountSpan.textContent = `${formatNumber(converted.num)}${converted.unit ? ' ' + converted.unit : ''}`;
    });
}

function setCookmodeServings(n) {
    if (n < 1) n = 1;
    window._cookmodeServings = n;
    const sc = document.getElementById('cookmode-servings-count');
    if (sc) sc.textContent = `${n} Personen`;
    updateCookmodeIngredientAmounts();
}

function setupCookmodeServingsControl() {
    const decreaseBtn = document.getElementById('cookmode-decrease-servings');
    const increaseBtn = document.getElementById('cookmode-increase-servings');
    if (decreaseBtn) {
        decreaseBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            setCookmodeServings((window._cookmodeServings || 4) - 1);
        };
    }
    if (increaseBtn) {
        increaseBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            setCookmodeServings((window._cookmodeServings || 4) + 1);
        };
    }
}

function cookmodeNext() {
    const steps = window._sizzleRecipeSteps;
    if (!steps) return;
    const totalSteps = steps.length + 1; // include ingredients as first step
    if (cookmodeStepIdx < totalSteps - 1) {
        cookmodeSlideDirection = 'right';
        cookmodeStepIdx++;
        cookmodeRenderStep(cookmodeStepIdx);
    } else {
        // Last step - close cookmode
        closeCookmode();
    }
}

function cookmodePrev() {
    if (cookmodeStepIdx > 0) {
        cookmodeSlideDirection = 'left';
        cookmodeStepIdx--;
        cookmodeRenderStep(cookmodeStepIdx);
    }
}

function setupCookmode() {
    const overlay = document.getElementById('cookmode-overlay');
    const openBtn = document.getElementById('cookmode-btn');
    const closeBtn = document.getElementById('cookmode-exit');
    const prevBtn = document.getElementById('cookmode-prev');
    const nextBtn = document.getElementById('cookmode-next');
    
    if (openBtn) {
        openBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            openCookmode();
        });
    }
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeCookmode();
        });
    }
    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            cookmodePrev();
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            cookmodeNext();
        });
    }
    
    // ESC closes
    document.addEventListener('keydown', (e) => {
        if (overlay && !overlay.classList.contains('hidden') && e.key === 'Escape') {
            closeCookmode();
        }
    });
    
    // Click outside to close
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeCookmode();
            }
        });
    }
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

// Favorite button functionality
function setupFavoriteButton(recipeId) {
    const favoriteBtn = document.getElementById('favorite-btn');
    const favoriteIcon = document.getElementById('favorite-icon');
    
    if (!favoriteBtn || !favoriteIcon) return;
    
    // Check if recipe is already favorited (from localStorage)
    const favorites = JSON.parse(localStorage.getItem('sizzle_favorites') || '[]');
    const isFavorite = favorites.includes(recipeId);
    
    // Set initial state
    if (isFavorite) {
        favoriteIcon.textContent = 'favorite';
        favoriteIcon.classList.add('filled');
    } else {
        favoriteIcon.textContent = 'favorite_border';
        favoriteIcon.classList.remove('filled');
    }
    
    // Handle click
    favoriteBtn.addEventListener('click', () => {
        const currentFavorites = JSON.parse(localStorage.getItem('sizzle_favorites') || '[]');
        const isCurrentlyFavorite = currentFavorites.includes(recipeId);
        
        if (isCurrentlyFavorite) {
            // Remove from favorites
            const newFavorites = currentFavorites.filter(id => id !== recipeId);
            localStorage.setItem('sizzle_favorites', JSON.stringify(newFavorites));
            favoriteIcon.textContent = 'favorite_border';
            favoriteIcon.classList.remove('filled');
            console.log(`Removed ${recipeId} from favorites`);
        } else {
            // Add to favorites
            currentFavorites.push(recipeId);
            localStorage.setItem('sizzle_favorites', JSON.stringify(currentFavorites));
            favoriteIcon.textContent = 'favorite';
            favoriteIcon.classList.add('filled');
            console.log(`Added ${recipeId} to favorites`);
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const id = getRecipeId();
    const recipe = recipeDetails[id] || recipeDetails["1"];
    
    if (recipe) {
        renderRecipe(recipe);
        // Apply unit conversion immediately after rendering
        updateIngredientAmounts();
        // Initialize cookmode after recipe is rendered
        setupCookmode();
        // Initialize favorite button
        setupFavoriteButton(id);
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
