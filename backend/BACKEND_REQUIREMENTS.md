# Backend Vereisten voor Compatibiliteit met Render

Dit document beschrijft **alle technische vereisten** waar onze backend-code aan moet voldoen om later probleemloos te draaien op Render. Deze regels zijn verplicht — afwijkingen veroorzaken gegarandeerd deploy-problemen.

---

## 1. Eén duidelijke start-entrypoint
De backend moet kunnen starten met één enkel command.

**Vereisten:**
- Eén hoofd-bestand (bijv. `server.js`, `main.py`, `app/index.ts`).
- Start van de webserver gebeurt automatisch wanneer dit bestand draait.
- Geen interactieve prompts of handmatige stappen.

---

## 2. Serverpoort moet komen uit de `PORT` environment-variabele
Render geeft dynamisch een poort. Hardcoded poorten gaan stuk.

**Voorbeeld (Node.js):**
```js
const PORT = process.env.PORT || 3000;
app.listen(PORT);
````

**Voorbeeld (Python):**

```python
port = int(os.environ.get("PORT", 3000))
uvicorn.run(app, host="0.0.0.0", port=port)
```

---

## 3. Server moet binden aan `0.0.0.0`

Render moet extern verkeer kunnen doorsturen.

**Niet toegestaan:** `localhost`
**Wel toegestaan:** `0.0.0.0`

---

## 4. Alle dependencies moeten installeerbaar zijn via package manager

### Node.js

* Alles in `package.json`.
* Geen globale installaties.

### Python

* Alles in `requirements.txt`.
* Geen handmatige lokale libraries.

---

## 5. Geen opslag op lokale schijf voor dynamische data

Render’s filesystem is **niet persistent**.

**Niet toegestaan:**

* Wegschrijven van gebruikersdata naar `.json` files.
* Lokale opslag als database.
* Afhankelijk zijn van runtime gegenereerde bestanden.

**Wel toegestaan:**

* Statische data in read-only files (bijv. recepten).
* Opslag via een database (Render PostgreSQL).

---

## 6. Configuratie via environment variables

Alle gevoelige of omgeving-specifieke configuratie moet via env vars.

Voorbeelden:

* AI API keys
* Database connecties
* Secret tokens
* Omgevingsinstellingen

**Niet toegestaan:** hardcoded secrets.

---

## 7. Geen absolute paden — alleen project-relative paden

Backend moet onafhankelijk zijn van bestandsstructuur.

**Voorbeeld (correct):**

```js
path.join(__dirname, "data/recipes.json");
```

---

## 8. Geen interactieve login of handmatige authenticatie

Render kan geen:

* browsers openen,
* terminal-prompts tonen,
* lokale loginflows uitvoeren.

Gebruik tokens via environment variables.

---

## 9. Geen CPU-zware of blokkerende taken

Render’s gratis tier heeft beperkte resources.

**Niet toegestaan:**

* zware loops,
* blokkerende taken,
* in-memory cache als enige bron van waarheid.

**Wel toegestaan:**

* AI-verzoeken extern afhandelen,
* caching die mag verdwijnen bij restarts.

---

## 10. Applicatie moet binnen 60 seconden starten

Render stopt de service als de startup te lang duurt.

Vermijd:

* enorme datasets laden,
* dynamische installaties tijdens runtime.

---

## 11. Services moeten los startbaar zijn

Als we later workers, queues of cron jobs gebruiken:

Voorbeelden:

* Webservice: `npm start`
* Worker: `npm run worker`
* Cron job: `npm run cleanup`

---

## 12. Code moet builden zonder internettoegang

Tijdens build kunnen alleen dependencies worden geïnstalleerd.

**Niet toegestaan tijdens build:**

* Externe API-calls.

**Runtime mag uiteraard wél internet gebruiken.**

---

## 13. Logging moet stdout/stderr gebruiken

Render leest alleen logs via stdout/stderr.

**Niet toegestaan:** logbestanden op disk.
**Wel toegestaan:** `console.log`, `print`, etc.