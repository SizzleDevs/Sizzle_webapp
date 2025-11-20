// --- Recepten Database ---
const recipes = [
    {
        title: "Pasta Bolognese",
        tags: ["snel"],
        ingredients: [
            "300g pasta",
            "300g gehakt",
            "1 ui",
            "1 blik tomatenblokjes"
        ],
        steps: [
            "Kook de pasta.",
            "Bak het gehakt.",
            "Voeg ui toe en bak glazig.",
            "Tomatenblokjes erbij en 10 min sudderen."
        ]
    },
    {
        title: "Vegetarische Ovenschotel",
        tags: ["oven", "vegetarisch"],
        ingredients: [
            "Aardappelen",
            "Groentenmix",
            "Kaas"
        ],
        steps: [
            "Verwarm de oven voor op 200°C.",
            "Snijd aardappelen en groenten.",
            "Alles in schaal, kaas erbovenop.",
            "30 minuten in de oven."
        ]
    },
    {
        title: "Snelle Wraps",
        tags: ["snel", "vegetarisch"],
        ingredients: [
            "Tortilla wraps",
            "Hummus",
            "Komkommer",
            "Paprika"
        ],
        steps: [
            "Snijd de groenten.",
            "Smeer hummus op de wrap.",
            "Groenten erop en oprollen."
        ]
    }
];


// --- Favorieten opslaan ---
let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");


// --- DOM Elements ---
const recipeList = document.getElementById("recipeList");
const searchInput = document.getElementById("searchInput");
const tagFilter = document.getElementById("tagFilter");

const popup = document.getElementById("recipePopup");
const closePopup = document.getElementById("closePopup");
const popupTitle = document.getElementById("popupTitle");
const popupTags = document.getElementById("popupTags");
const popupIngredients = document.getElementById("popupIngredients");
const popupSteps = document.getElementById("popupSteps");
const popupTime = document.getElementById("popupTime");
const favButton = document.getElementById("favButton");


// --- Render recepten ---
function renderRecipes() {
    const text = searchInput.value.toLowerCase();
    const tag = tagFilter.value;

    recipeList.innerHTML = "";

    recipes
        .filter(r =>
            r.title.toLowerCase().includes(text) &&
            (tag === "" || r.tags.includes(tag))
        )
        .forEach(r => {
            const card = document.createElement("div");
            card.className = "recipe-card";
            card.innerHTML = `<h3>${r.title}</h3><p>${r.tags.join(", ")}</p>`;
            card.onclick = () => openRecipe(r);
            recipeList.appendChild(card);
        });
}

renderRecipes();

searchInput.addEventListener("input", renderRecipes);
tagFilter.addEventListener("change", renderRecipes);


// --- Pop-up openen ---
function openRecipe(recipe) {
    popup.classList.remove("hidden");

    popupTitle.innerText = recipe.title;
    popupTags.innerText = recipe.tags.join(", ");

    popupIngredients.innerHTML = recipe.ingredients
        .map(i => `<li>${i}</li>`)
        .join("");

    popupSteps.innerHTML = recipe.steps
        .map(s => `<li>${s}</li>`)
        .join("");

    // AI-achtige tijdschatting (super basic)
    const estimatedTime = recipe.steps.length * 5;
    popupTime.innerText = `Geschatte tijd: ~${estimatedTime} min`;

    // Favorieten knop
    favButton.onclick = () => addToFavorites(recipe.title);
}

closePopup.onclick = () => popup.classList.add("hidden");


// --- Favorieten opslaan ---
function addToFavorites(title) {
    if (!favorites.includes(title)) favorites.push(title);
    localStorage.setItem("favorites", JSON.stringify(favorites));
    alert("Toegevoegd aan favorieten!");
}
