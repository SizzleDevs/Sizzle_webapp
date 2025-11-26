// Dummy tags for user preferences
const availableTags = [
    // Keuken types
    { name: "Italiaans", icon: "+" },
    { name: "Aziatisch", icon: "+" },
    { name: "Mexicaans", icon: "+" },
    { name: "Frans", icon: "+" },
    { name: "Grieks", icon: "+" },
    { name: "Indiaas", icon: "+" },
    { name: "Hollands", icon: "+" },
    
    // Maaltijd types
    { name: "Ontbijt", icon: "+" },
    { name: "Lunch", icon: "+" },
    { name: "Avondeten", icon: "+" },
    { name: "Snacks", icon: "+" },
    { name: "Desserts", icon: "+" },
    
    // Dieet en levensstijl
    { name: "Vegetarisch", icon: "+" },
    { name: "Veganistisch", icon: "+" },
    { name: "Glutenvrij", icon: "+" },
    { name: "Lactosevrij", icon: "+" },
    { name: "Halal", icon: "+" },
    
    // Eigenschappen
    { name: "Snel", icon: "+" },
    { name: "Makkelijk", icon: "+" },
    { name: "Gezond", icon: "+" },
    { name: "Budget", icon: "+" },
    { name: "Comfort food", icon: "+" },
    { name: "Voor kinderen", icon: "+" },
    
    // Ingrediënten focus
    { name: "Pasta", icon: "+" },
    { name: "Kip", icon: "+" },
    { name: "Vis", icon: "+" },
    { name: "Vlees", icon: "+" },
    { name: "Groenten", icon: "+" },
    
    // Bereidingswijze
    { name: "BBQ", icon: "+" },
    { name: "Oven", icon: "+" },
    { name: "Airfryer", icon: "+" },
    { name: "Wok", icon: "+" }
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
    
    toStep2Btn.addEventListener('click', () => {
        // Validate form
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const name = document.getElementById('name').value;
        
        if (!username || !password || !name) {
            alert('Vul alle velden in om door te gaan.');
            return;
        }
        
        if (password.length < 8) {
            alert('Wachtwoord moet minimaal 8 karakters bevatten.');
            return;
        }
        
        // Go to step 2
        step1.classList.remove('active');
        step2.classList.add('active');
    });
    
    finishBtn.addEventListener('click', () => {
        if (selectedTags.length === 0) {
            alert('Selecteer minimaal één interesse om door te gaan.');
            return;
        }
        
        // Collect all data
        const userData = {
            username: document.getElementById('username').value,
            password: CryptoJS.SHA256(document.getElementById('password').value).toString(),
            name: document.getElementById('name').value,
            tags: selectedTags
        };
        
        console.log('User data collected:', userData);
        
        // Here you would normally send the data to the API
        alert(`Account aangemaakt voor ${userData.name}!\n\nGeselecteerde interesses: ${selectedTags.join(', ')}`);
    });
}
