# **Projectplan — Sizzle (Frontend + Backend)**

## **1. Overzicht van de Architectuur**

De app bestaat uit twee losse delen:

1. **Frontend (React of iets vergelijkbaars)**

   * Draait in de browser.
   * Vraagt data via API-calls aan de backend.
   * Laat recepten zien, UI-flows, minimalistische interactie.
   * Gebruikt fetch/axios om met backend te praten.
2. **Backend (bijv. Node.js + Express, of Python/FastAPI)**

   * Draait op Render.
   * API-routes voor recepten, gebruikers, tags, AI-functies.
   * Houdt data in een database (bijv. PostgreSQL op Render).
   * Verwerkt AI-calls op basis van jullie eigen regels.

Ze zijn volledig gescheiden. De frontend “weet” niets over hoe de backend werkt, behalve via API-documentatie.

---

# **2. Backend — Wat moet het doen?**

### **2.1 API Endpoints**

Maak ze simpel en voorspelbaar. Bijvoorbeeld:

### **Recepten**

* `GET /recipes` — lijst met recepten (+ filters)
* `GET /recipes/:id` — één recept
* `POST /recipes` — nieuw recept opslaan
* `PUT /recipes/:id` — recept updaten
* `DELETE /recipes/:id` — verwijderen

### **AI functionaliteit**

* `POST /ai/analyze-step` — krijgt een stap en retour: tijd, moeilijkheid, mogelijke vervangingen
* `POST /ai/recipequestion` — vraag + recept-id → antwoord
* `POST /ai/question` - vraag → antwoord or aanbelvolen recept door AI

### **Gebruikers**

* `POST /auth/signup`
* `POST /auth/login`
* `GET /user/saved-recipes`
* `POST /user/save-recipe/:id`

*Let op:* jullie moeten beslissen of auth via JWT of sessions gaat. JWT is eenvoudiger voor Render.

---

## **2.2 Database Model (simpel gehouden)**

### **Recipe**

* id
* title
* description
* steps (array)
* ingredients (array)
* tags (array)
* author
* created_at

### **User**

* id
* username
* hashed_password
* saved_recipes (array van recipe_ids)

### **AI Metadata (optioneel)**

* recipe_id
* per_step_analysis (JSON)
  Kan later automatisch gevuld worden.

---

## **2.3 Belangrijke Backend-afspraken die jullie moeten vastleggen**

### **1. JSON-structuur**

Frontend en backend moeten **exact dezelfde velden** gebruiken.

Voorbeeld recept:

```json
{
  "id": 12,
  "title": "Pasta",
  "ingredients": ["pasta", "kaas"],
  "steps": ["Kook water", "Doe pasta erin"],
  "tags": ["makkelijk", "italiaans"]
}
```

Zodra dit verandert, moet frontend worden geüpdatet. Maak hier dus een vaste schema-definitie voor.

### **2. Filtering**

Bijvoorbeeld:
`GET /recipes?tags=vlees,30min&difficulty=easy`

Alias-namen voor filters moeten vaststaan.

### **3. AI API**

Frontend stuurt simpelweg:

```json
{
  "step": "Snij de ui",
  "recipeId": 5
}
```

Backend beslist hoe het AI-model eraan komt, frontend hoeft dat niet te weten.

### **4. Fouten**

Backend moet consistente error-vorm hebben, bv:

```json
{
  "error": true,
  "message": "Recipe not found"
}
```

Zonder vaste foutvorm wordt frontend debugging een drama.

---

# **3. Frontend — Hoe werkt het?**

### **Framework**

React is meest logisch. Je houdt state bij voor:

* receptenlijst
* geselecteerd recept
* opgeslagen recepten
* AI-antwoorden tijdens het koken

### **Belangrijk voor frontend-backend koppeling**

1. **Elke request stuurt JWT mee (als jullie dat gebruiken).**
2. **UI toont loading + error states** — anders lijkt je app kapot.
3. **Geen businesslogic in de frontend**
   – Stap-analyse → backend
   – Filterlogica → backend
   – Recept-validatie → backend
   De frontend moet alleen UI en routing doen.

---

# **4. Communicatie tussen Frontend en Backend**

Dit is de kern: alles valt of staat met **duidelijke API-contracten**.

### **Deze afspraken moeten jullie expliciet vastleggen:**

* Welke endpoints bestaan er?
* Welke request-bodies worden verwacht?
* Welke response-vormen zijn gegarandeerd?
* Welke errors kan elke route teruggeven?
* Welke authenticatie-methode? (JWT aanbevolen)
* Hoe werkt CORS? (op Render moet je dit goed configureren)
* Hoe werkt versiebeheer van de API? (simpel: `/v1/...`)

Zonder dit zit je continu bugs te fixen die niets met code te maken hebben.

---

# **5. Hosting op Render — Simpele, maar belangrijke keuzes**

### **Backend**

* Node + Express of Python FastAPI
* Render Web Service → automatisch deployen via GitHub
* Environment variables:

  * DATABASE_URL
  * JWT_SECRET
  * OPENAI_KEY (of vergelijkbaar)

### **Frontend**

* Static site (React build folder)
* Environment variables voor API-url:

  * `REACT_APP_API_URL="https://your-backend.onrender.com"`

### **Database**

* PostgreSQL instance op Render
* Let op: cold starts en sleep-modes kunnen vertraging geven

---

# **6. Integratie met AI (jullie eigen AI-functie)**

**Belangrijke realiteit-checks:**

* Laat AI nooit direct in frontend draaien.
* Backend moet een wrapper zijn:

  * validatie
  * rate limiting
  * context meegeven (stap-tekst, ingrediënten, moeilijkheid)

Zo houd je controle en beveiliging.

---

# **7. Valkuilen waar je op moet letten**

Als je dit niet checkt, krijg je chaos:

### **1. Verschillende JSON-vormen tussen frontend en backend**

– Meest voorkomende fout.

### **2. Geen duidelijke foutmeldingen**

– Debugging duurt 10× langer.

### **3. AI te diep in frontend gebouwd**

– Breekt zodra backend verandert.

### **4. Onnodige complexiteit**

– Houd functies minimaal; voorkom 20 endpoints waar 5 genoeg zijn.

---

# **8. Aanbevolen workflow als team**

### **Backend-team:**

1. Basis API maken met dummy-data.
2. OpenAPI/Swagger documentatie genereren.
3. Recept- en gebruikers-database maken.
4. AI endpoints koppelen.

### **Frontend-team:**

1. UI met mock-data maken.
2. Zodra backend klaar is → mock-data vervangen door echte API-calls.
3. Auth, filters, view-cook-mode bouwen.
4. AI-vragen en stap-analyse integreren.

### **Gezamenlijk:**

Iedere keer dat een endpoint wijzigt → documentatie bijwerken.
Zonder dat loopt samenwerking gegarandeerd vast.
