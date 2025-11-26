// Mock data based on API documentation

export const currentUser = {
    id: "user_456",
    username: "niek",
    naam: "Niek",
    voorkeurTags: {
        snel: 0.25,
        vegetarisch: 0.40,
        gezond: 0.35
    }
};

export const recipes = [
    {
        id: "1",
        titel: "Pasta Bolognese",
        tags: ["Avondeten", "Snel", "Italiaans", "Simpel"],
        bereidingstijd: 20,
        moeilijkheid: "makkelijk",
        image: "pasta.jpg", // Placeholder
        isFavorite: true
    },
    {
        id: "2",
        titel: "Rattatouile",
        tags: ["Avondeten", "Snel", "Italiaans", "Simpel"],
        bereidingstijd: 30,
        moeilijkheid: "gemiddeld",
        image: "ratatouille.jpg",
        isFavorite: true
    },
    {
        id: "3",
        titel: "Caesar salade",
        tags: ["Avondeten", "Snel", "Italiaans", "Simpel"],
        bereidingstijd: 15,
        moeilijkheid: "makkelijk",
        image: "salad.jpg",
        isFavorite: false
    },
    {
        id: "4",
        titel: "Willekeurig gerecht",
        tags: ["Avondeten", "Snel", "Italiaans", "Simpel"],
        bereidingstijd: 45,
        moeilijkheid: "moeilijk",
        image: "random.jpg",
        isFavorite: false
    },
    {
        id: "5",
        titel: "Lasagna",
        tags: ["Avondeten", "Snel", "Italiaans", "Simpel"],
        bereidingstijd: 60,
        moeilijkheid: "gemiddeld",
        image: "lasagna.jpg",
        isFavorite: false
    },
    {
        id: "6",
        titel: "Nog een gerecht",
        tags: ["Avondeten", "Snel", "Italiaans", "Simpel"],
        bereidingstijd: 25,
        moeilijkheid: "makkelijk",
        image: "dish.jpg",
        isFavorite: false
    },
    {
        id: "7",
        titel: "Een trending gerecht",
        tags: ["Avondeten", "Snel", "Italiaans", "Simpel"],
        bereidingstijd: 35,
        moeilijkheid: "gemiddeld",
        image: "trending.jpg",
        isFavorite: false
    },
    {
        id: "8",
        titel: "Ik kan niks bedenken",
        tags: ["Avondeten", "Snel", "Italiaans", "Simpel"],
        bereidingstijd: 10,
        moeilijkheid: "makkelijk",
        image: "empty.jpg",
        isFavorite: false
    },
    {
        id: "9",
        titel: "Curry Madras",
        tags: ["Avondeten", "Pittig", "Indiaas"],
        bereidingstijd: 40,
        moeilijkheid: "gemiddeld",
        image: "curry.jpg",
        isFavorite: true
    },
    {
        id: "10",
        titel: "Boerenkool Stamppot",
        tags: ["Avondeten", "Hollands", "Winter"],
        bereidingstijd: 30,
        moeilijkheid: "makkelijk",
        image: "stamppot.jpg",
        isFavorite: false
    },
    {
        id: "11",
        titel: "Sushi Bowl",
        tags: ["Lunch", "Japans", "Vers"],
        bereidingstijd: 25,
        moeilijkheid: "gemiddeld",
        image: "sushi.jpg",
        isFavorite: true
    },
    {
        id: "12",
        titel: "Pannenkoeken",
        tags: ["Ontbijt", "Zoet", "Hollands"],
        bereidingstijd: 20,
        moeilijkheid: "makkelijk",
        image: "pancakes.jpg",
        isFavorite: false
    },
    {
        id: "13",
        titel: "Tacos",
        tags: ["Avondeten", "Mexicaans", "Feest"],
        bereidingstijd: 35,
        moeilijkheid: "gemiddeld",
        image: "tacos.jpg",
        isFavorite: true
    },
    {
        id: "14",
        titel: "Groentesoep",
        tags: ["Lunch", "Gezond", "Soep"],
        bereidingstijd: 45,
        moeilijkheid: "makkelijk",
        image: "soup.jpg",
        isFavorite: false
    },
    {
        id: "15",
        titel: "Hamburger",
        tags: ["Avondeten", "Amerikaans", "Cheatday"],
        bereidingstijd: 20,
        moeilijkheid: "makkelijk",
        image: "burger.jpg",
        isFavorite: false
    }
];

export const recipeDetails = {
    "1": {
        id: "1",
        titel: "Pasta Bolognese",
        tags: ["Avondeten", "Snel", "Italiaans", "Simpel"],
        bereidingstijd: 20,
        moeilijkheid: "makkelijk",
        ingrediënten: [
            { naam: "Pasta", hoeveelheid: "1 Kilo" },
            { naam: "Bolognese", hoeveelheid: "0.5 Kilo" },
            { naam: "Duh natuurlijk", hoeveelheid: "1 Stuk" },
            { naam: "En kaas", hoeveelheid: "3 Kilo" },
            { naam: "Altijd kaas", hoeveelheid: "30 Gram" }
        ],
        stappen: [
            { stapNummer: 1, beschrijving: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam dictum, odio non pulvinar sodales, turpis nisi vehicula risus, ut commodo est lacus sed felis. Vivamus a augue facilisis, dignissim quam.", duur: 5 },
            { stapNummer: 2, beschrijving: "Voeg de gehakte ui en knoflook toe aan de pan en bak tot ze glazig zijn.", duur: 7 },
            { stapNummer: 3, beschrijving: "Roer het gehakt erdoor en bak tot het gaar en bruin is.", duur: 8 },
            { stapNummer: 4, beschrijving: "Voeg de tomaten, kruiden en een scheutje water toe. Laat het geheel 10 minuten zachtjes sudderen.", duur: 10 },
            { stapNummer: 5, beschrijving: "Kook ondertussen de pasta volgens de aanwijzingen op de verpakking.", duur: 12 },
            { stapNummer: 6, beschrijving: "Meng de pasta met de saus, breng op smaak en serveer met geraspte kaas.", duur: 3 }
        ]
    }
};

export const recommendations = {
    voorkeur: recipes.slice(0, 6),
    avondeten: recipes.slice(4, 10), 
    trending: recipes.slice(8, 15)
};
