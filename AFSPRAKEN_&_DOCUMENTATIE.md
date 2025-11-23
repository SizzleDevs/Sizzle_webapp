# Sizzle API Documentatie

**Architectuurkeuze:** De app heeft **gebruikersprofielen**, **login**, **server-opgeslagen voorkeuren**, en **favorieten op de server**.
Alle voorkeur-tags en gedrag worden **op de server opgeslagen**.
Daarnaast doet de server de recepten + AI-antwoorden.

---

## 1. Recepten

### 1.1 Recepten Zoeken & Filteren

**Methode:** GET
**URL:** `/api/recepten`

**Beschrijving:** Zoekt en filtert recepten. De frontend stuurt zoektermen en filters. De server retourneert een lijst recepten.

**Query Parameters:**

| Naam         | Type    | Verplicht | Beschrijving                               |
| ------------ | ------- | --------- | ------------------------------------------ |
| q            | String  | Nee       | Vrije zoekterm (titel, ingrediënten, tags) |
| moeilijkheid | String  | Nee       | `makkelijk`, `gemiddeld`, `moeilijk`        |
| tags         | String  | Nee       | Komma‑gescheiden lijst van tags            |

**Voorbeeld request:**
`/api/recepten?q=pasta&tags=italiaans,snel&maxTijd=30`

**Response (200):**

```json
[
  {
    "id": "123",
    "titel": "Pasta Carbonara",
    "tags": ["snel", "pasta", "italiaans"],
    "bereidingstijd": 20,
    "moeilijkheid": "makkelijk"
  }
]
```

---

### 1.2 Recept Detail

**Methode:** GET
**URL:** `/api/recepten/{id}`

**Response (200):**

```json
{
  "id": "123",
  "titel": "Pasta Carbonara",
  "ingrediënten": [
    {"naam": "pasta", "hoeveelheid": "200g"},
    {"naam": "eieren", "hoeveelheid": "2"}
  ],
  "stappen": [
    {"stapNummer": 1, "beschrijving": "Kook de pasta.", "duur": 10},
    {"stapNummer": 2, "beschrijving": "Meng eieren en kaas.", "duur": 5}
  ],
  "tags": ["snel", "pasta", "italiaans"],
  "bereidingstijd": 20,
  "moeilijkheid": "gemakkelijk"
}
```

---

## 2. Accounts & Login

### 2.1 Account Aanmaken

**Methode:** POST
**URL:** `/api/auth/register`

**Beschrijving:** Maakt een nieuw gebruikersaccount aan. Bij aanmaken worden voorkeurstags ingesteld op basis van gebruikerskeuzes.

**Request Body:**

```json
{
  "username": "janjansen",
  "wachtwoord": "securePassword123",
  "naam": "Jan Jansen",
  "voorkeurTags": {
    "snel": 0.25,
    "vegetarisch": 0.40,
    "gezond": 0.35
  }
}
```

**Response (201):**

```json
{
  "id": "user_456",
  "username": "janjansen",
  "naam": "Jan Jansen",
  "voorkeurTags": {
    "snel": 0.25,
    "vegetarisch": 0.40,
    "gezond": 0.35
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Foutafhandeling:**
- **400:** Wachtwoord te zwak of voorkeurstags tellen niet op tot 1.0
- **409:** Username al in gebruik

---

### 2.2 Inloggen

**Methode:** POST
**URL:** `/api/auth/login`

**Beschrijving:** Authenticeert een gebruiker en retourneert een auth-token.

**Request Body:**

```json
{
  "username": "janjansen",
  "wachtwoord": "securePassword123"
}
```

**Response (200):**

```json
{
  "id": "user_456",
  "username": "janjansen",
  "naam": "Jan Jansen",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600
}
```

**Foutafhandeling:**
- **401:** Ongeldig username of wachtwoord
- **404:** Gebruiker niet gevonden

---

### 2.3 Token Verificatie

**Methode:** GET
**URL:** `/api/auth/verify`

**Beschrijving:** Verifieert of een token nog geldig is. Alle beveiligde endpoints vereisen deze token in de `Authorization` header.

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200):**

```json
{
  "valid": true,
  "id": "user_456",
  "email": "user@example.com"
}
```

**Foutafhandeling:**
- **401:** Token ongeldig of verlopen
- **403:** Geen token opgegeven

---

### 2.4 Profiel Ophalen

**Methode:** GET
**URL:** `/api/auth/me`

**Beschrijving:** Haalt de gegevens van de ingelogde gebruiker op.

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200):**

```json
{
  "id": "user_456",
  "username": "janjansen",
  "naam": "Jan Jansen",
  "voorkeurTags": {
    "snel": 0.25,
    "vegetarisch": 0.40,
    "gezond": 0.35
  },
  "aanmaakDatum": "2025-01-15T10:30:00Z"
}
```

---

### 2.5 Profiel Bijwerken

**Methode:** PUT
**URL:** `/api/auth/me`

**Beschrijving:** Werkt de profielgegevens van de ingelogde gebruiker bij. Voorkeurstags kunnen hier niet worden gewijzigd.

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:**

```json
{
  "naam": "Jan Jansen",
  "username": "newright",
  "wachtwoord": "newSecurePassword123"
}
```

**Response (200):**

```json
{
  "id": "user_456",
  "username": "newright",
  "naam": "Jan Jansen",
  "voorkeurTags": {
    "snel": 0.25,
    "vegetarisch": 0.40,
    "gezond": 0.35
  },
  "aanmaakDatum": "2025-01-15T10:30:00Z"
}
```

**Foutafhandeling:**
- **400:** Wachtwoord te zwak
- **409:** Username al in gebruik

---

### 2.6 Uitloggen

**Methode:** Geen API call nodig

**Beschrijving:** De frontend verwijdert eenvoudigweg de token uit de lokale opslag (bijv. sessionStorage, state management, of cookies). Als de frontend geen geldige token vindt, betekent dit dat de gebruiker niet is ingelogd.

---

### 2.7 Profiel Verwijderen

**Methode:** DELETE
**URL:** `/api/auth/me`

**Beschrijving:** Verwijdert het account en alle bijbehorende gegevens van de ingelogde gebruiker (favorieten, voorkeurstags, etc.).

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:**

```json
{
  "wachtwoord": "securePassword123"
}
```

**Response (200):**

```json
{
  "message": "Account succesvol verwijderd"
}
```

**Foutafhandeling:**
- **401:** Wachtwoord onjuist
- **403:** Geen token opgegeven

---

## 3. Favorieten

### 3.1 Favorieten Ophalen

**Methode:** GET
**URL:** `/api/favorieten`

**Beschrijving:** Haalt alle favoriete recepten van de ingelogde gebruiker op.

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200):**

```json
{
  "favorieten": [
    {
      "id": "123",
      "titel": "Pasta Carbonara",
      "tags": ["snel", "pasta", "italiaans"],
      "bereidingstijd": 20,
      "moeilijkheid": "gemakkelijk",
      "toevoegdOp": "2025-01-20T14:30:00Z"
    },
    {
      "id": "456",
      "titel": "Tomatensoep",
      "tags": ["soep", "gezond"],
      "bereidingstijd": 30,
      "moeilijkheid": "gemakkelijk",
      "toevoegdOp": "2025-01-18T09:15:00Z"
    }
  ]
}
```

---

### 3.2 Favoriet Toevoegen

**Methode:** POST
**URL:** `/api/favorieten/{receptId}`

**Beschrijving:** Voegt een recept toe aan de favorieten van de ingelogde gebruiker.

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (201):**

```json
{
  "message": "Recept toegevoegd aan favorieten",
  "id": "123",
  "titel": "Pasta Carbonara",
  "toevoegdOp": "2025-01-20T14:30:00Z"
}
```

**Foutafhandeling:**
- **409:** Recept staat al in favorieten
- **404:** Recept niet gevonden

---

### 3.3 Favoriet Verwijderen

**Methode:** DELETE
**URL:** `/api/favorieten/{receptId}`

**Beschrijving:** Verwijdert een recept uit de favorieten van de ingelogde gebruiker.

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200):**

```json
{
  "message": "Recept verwijderd uit favorieten",
  "id": "123"
}
```

**Foutafhandeling:**
- **404:** Recept niet in favorieten of recept niet gevonden

---



## 4. Aanbevelingen

### 4.1 Aanbevelingen Ophalen

**Methode:** GET
**URL:** `/api/aanbevelingen`

**Beschrijving:** Retourneert vijf gepersonaliseerde receptaanbevelingslijsten. De frontend kiest welke lijsten worden weergegeven.

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200):**

```json
{
  "voorkeur": [
    {
      "id": "123",
      "titel": "Pasta Carbonara",
      "tags": ["snel", "pasta", "italiaans"],
      "bereidingstijd": 20,
      "moeilijkheid": "gemakkelijk"
    },
    {
      "id": "456",
      "titel": "Tomatensoep",
      "tags": ["soep", "gezond"],
      "bereidingstijd": 30,
      "moeilijkheid": "gemakkelijk"
    },
    {
      "id": "789",
      "titel": "Risotto",
      "tags": ["italiaans", "vegetarisch"],
      "bereidingstijd": 40,
      "moeilijkheid": "middel"
    }
  ],
  "trending": [
    {
      "id": "201",
      "titel": "Buddha Bowl",
      "tags": ["gezond", "vegetarisch"],
      "bereidingstijd": 25,
      "moeilijkheid": "gemakkelijk"
    },
    {
      "id": "202",
      "titel": "Acai Bowl",
      "tags": ["ontbijt", "gezond"],
      "bereidingstijd": 10,
      "moeilijkheid": "gemakkelijk"
    },
    {
      "id": "203",
      "titel": "Poke Bowl",
      "tags": ["aziatisch", "gezond"],
      "bereidingstijd": 20,
      "moeilijkheid": "gemakkelijk"
    }
  ],
  "voorkeur_ontbijt": [
    {
      "id": "301",
      "titel": "Pannenkoeken",
      "tags": ["ontbijt", "snel"],
      "bereidingstijd": 15,
      "moeilijkheid": "gemakkelijk"
    },
    {
      "id": "302",
      "titel": "Omelet",
      "tags": ["ontbijt", "snel"],
      "bereidingstijd": 10,
      "moeilijkheid": "gemakkelijk"
    },
    {
      "id": "303",
      "titel": "Granola met yoghurt",
      "tags": ["ontbijt", "gezond"],
      "bereidingstijd": 5,
      "moeilijkheid": "gemakkelijk"
    }
  ],
  "voorkeur_lunch": [
    {
      "id": "401",
      "titel": "Wraps",
      "tags": ["snel", "lunch"],
      "bereidingstijd": 20,
      "moeilijkheid": "gemakkelijk"
    },
    {
      "id": "402",
      "titel": "Salade",
      "tags": ["gezond", "snel", "lunch"],
      "bereidingstijd": 15,
      "moeilijkheid": "gemakkelijk"
    },
    {
      "id": "403",
      "titel": "Sandwich",
      "tags": ["snel", "lunch"],
      "bereidingstijd": 10,
      "moeilijkheid": "gemakkelijk"
    }
  ],
  "voorkeur_avondeten": [
    {
      "id": "501",
      "titel": "Biefstuk met groenten",
      "tags": ["avondeten", "gezond"],
      "bereidingstijd": 45,
      "moeilijkheid": "middel"
    },
    {
      "id": "502",
      "titel": "Zalm met dille",
      "tags": ["avondeten", "gezond"],
      "bereidingstijd": 35,
      "moeilijkheid": "middel"
    },
    {
      "id": "503",
      "titel": "Kip Tandoori",
      "tags": ["avondeten", "exotisch"],
      "bereidingstijd": 50,
      "moeilijkheid": "middel"
    }
  ],
  "generatedAt": "2025-01-20T12:30:00Z"
}
```


## 5. AI Integratie

### 5.1 Vraag Stellen Over Recept

**Methode:** POST
**URL:** `/api/recepten/{id}/vraag`

**Request Body:**

```json
{ "vraag": "Kan dit zonder boter?" }
```

**Response (200):**

```json
{
  "antwoord": "Je kunt boter vervangen door olijfolie."
}
```

---

## Beveiligingsopmerkingen

- **Tokens:** Alle endpoints onder `/api/auth/` (behalve register en login) en `/api/favorieten` vereisen een geldige JWT-token in de `Authorization: Bearer` header.
- **Token vervaldatum:** Tokens verlopen na 1 uur. Frontend dient een refresh-mechanism te implementeren.
- **HTTPS:** Alle communicatie moet via HTTPS plaatsvinden in productie.
- **Wachtwoord:** Wachtwoorden worden server-side gehasht (bijv. bcrypt) en nooit in plain text opgeslagen.