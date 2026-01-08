// Available tags matching API documentation
const availableTags = [
    // Cuisine types
    { name: "Aziatisch", icon: "+" },
    { name: "Mediterraans", icon: "+" },
    { name: "Midden-Oosters", icon: "+" },
    { name: "Latijns-Amerikaans", icon: "+" },
    { name: "Europees", icon: "+" },
    { name: "Fusion", icon: "+" },
    { name: "Comfort food", icon: "+" },
    
    // Dietary
    { name: "Vegetarisch", icon: "+" },
    { name: "Veganistisch", icon: "+" },
    { name: "Glutenvrij", icon: "+" },
    { name: "Lactosevrij", icon: "+" },
    { name: "Koolhydraatarm", icon: "+" },
    { name: "Suikervrij", icon: "+" },
    { name: "Eiwitrijk", icon: "+" },
    { name: "Caloriearm", icon: "+" },
    
    // Cooking method
    { name: "Pittig", icon: "+" },
    { name: "Oven", icon: "+" },
    { name: "Airfryer", icon: "+" },
    { name: "BBQ", icon: "+" },
    { name: "Stomen", icon: "+" },
    { name: "Wokken", icon: "+" },
    { name: "Slowcooker", icon: "+" },
    { name: "Eenpansgerecht", icon: "+" },
    
    // Meal prep & time
    { name: "Meal prep", icon: "+" },
    { name: "Snelle bereiding", icon: "+" },
    { name: "Geen koken nodig", icon: "+" },
    { name: "< 15 minuten", icon: "+" },
    { name: "< 30 minuten", icon: "+" },
    
    // Difficulty
    { name: "Makkelijk", icon: "+" },
    { name: "Gemiddeld", icon: "+" },
    { name: "Uitdagend", icon: "+" },
    
    // Audience & occasion
    { name: "Kindvriendelijk", icon: "+" },
    { name: "Feestelijk koken", icon: "+" },
    { name: "Budgetvriendelijk", icon: "+" }
];

// Selected tags storage
let selectedTags = [];

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    renderTags();
    setupNavigation();
});

// Render all tags
function renderTags() {
    const container = document.getElementById('tags-container');
    
    availableTags.forEach(tag => {
        const tagElement = document.createElement('div');
        tagElement.className = 'tag';
        // render with no icon; the icon will be shown only when selected
        tagElement.innerHTML = `
            <span class="tag-name">${tag.name}</span>
            <span class="tag-icon"></span>
        `;
        
        tagElement.addEventListener('click', () => toggleTag(tagElement, tag.name));
        container.appendChild(tagElement);
    });
}

// Toggle tag selection
function toggleTag(element, tagName) {
    element.classList.toggle('selected');
    
    if (element.classList.contains('selected')) {
        selectedTags.push(tagName);
        element.querySelector('.tag-icon').textContent = '×';
    } else {
        selectedTags = selectedTags.filter(t => t !== tagName);
        element.querySelector('.tag-icon').textContent = '';
    }
}

// Setup navigation between steps
function setupNavigation() {
    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');
    const toStep2Btn = document.getElementById('to-step-2');
    const finishBtn = document.getElementById('finish-btn');
    const passwordInput = document.getElementById('password');
    const passwordWrapper = passwordInput.parentElement;
    
    // Real-time password validation
    passwordInput.addEventListener('input', () => {
        if (passwordInput.value.length < 8 && passwordInput.value.length > 0) {
            passwordWrapper.classList.add('invalid');
        } else {
            passwordWrapper.classList.remove('invalid');
        }
    });
    
    toStep2Btn.addEventListener('click', () => {
        // Validate form
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const name = document.getElementById('name').value;
        const passwordWrapper = document.getElementById('password').parentElement;
        
        // Reset validation state
        passwordWrapper.classList.remove('invalid');
        
        if (!username || !password || !name) {
            alert('Vul alle velden in om door te gaan.');
            return;
        }
        
        if (password.length < 8) {
            passwordWrapper.classList.add('invalid');
            alert('Wachtwoord moet minimaal 8 karakters bevatten.');
            return;
        }
        
        // Go to step 2
        step1.classList.remove('active');
        step2.classList.add('active');
    });
    
    finishBtn.addEventListener('click', async () => {
        if (selectedTags.length === 0) {
            alert('Selecteer minimaal één interesse om door te gaan.');
            return;
        }
        
        // Collect all data
        const userData = {
            username: document.getElementById('username').value,
            password: document.getElementById('password').value,
            name: document.getElementById('name').value,
            tags: selectedTags
        };
        
        console.log('User data collected:', userData);
        
        try {
            const response = await fetch(window.API.REGISTER, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            if (response.ok) {
                const result = await response.json();
                await window.storeUserData(result.token, result.username);
                window.location.href = 'index.html';
            } else {
                const error = await response.json();
                alert(`Registratie mislukt: ${error.message}`);
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert('Er is een fout opgetreden bij de registratie. Controleer de console voor meer informatie.');
        }
    });
}
