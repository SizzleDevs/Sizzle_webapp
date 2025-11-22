# Sizzle API Documentatie

**Architectuurkeuze:** De app heeft **geen gebruikersprofielen**, **geen login**, **geen server-opgeslagen voorkeuren**, en **geen favorieten op de server**.
Alle voorkeur-tags en gedrag worden **lokaal opgeslagen** in de app.
De server levert alleen recepten + AI-antwoorden.

Hierdoor is de API extreem simpel, en alle personalisatie gebeurt client-side.

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
| maxTijd      | Integer | Nee       | Maximale bereidingstijd (minuten)          |
| moeilijkheid | String  | Nee       | `gemakkelijk`, `middel`, `moeilijk`        |
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
    "moeilijkheid": "gemakkelijk"
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

## 3. AI Vragenfunctie.

### 3.1 Vraag Stellen Over Recept

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
