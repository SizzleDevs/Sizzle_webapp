/* ========= SAMPLE RECIPES =========
Each recipe: id, title, tags[], time (min), difficulty, ingredients[], steps[]
*/
const SAMPLE_RECIPES = [
    {
        id: 'pancakes',
        title: 'Fluffy Pancakes (Basis)',
        tags: ['vegetarisch','snel','ontbijt'],
        time: 20,
        difficulty: 'snel',
        ingredients: [
            '200 g bloem',
            '2 el suiker (optioneel)',
            '1 tl bakpoeder',
            '1 ei',
            '300 ml melk (koemelk of plantaardig)',
            '1 el boter of olie'
        ],
        steps: [
            'Meng bloem, suiker en bakpoeder in een kom.',
            'Voeg ei en melk toe en klop tot een glad beslag.',
            'Verhit een koekenpan met een beetje boter of olie.',
            'Schep 1/4 cup beslag per pannenkoek in de pan en bak 2-3 min per kant tot goudbruin.',
            'Serveer met fruit, stroop of poedersuiker.'
        ]
    },
    {
        id: 'oven_groenten',
        title: 'Oven geroosterde groenten',
        tags: ['vegetarisch','oven','gezond'],
        time: 40,
        difficulty: 'gemiddeld',
        ingredients: [
            '3 wortels',
            '1 rode paprika',
            '1 ui',
            '200 g courgette',
            '2 el olijfolie',
            'zout en peper naar smaak',
            'verse kruiden (optioneel)'
        ],
        steps: [
            'Verwarm de oven voor op 200°C.',
            'Snijd alle groenten in gelijke stukken.',
            'Meng groenten met olie, zout en peper in een schaal.',
            'Spreid uit op een bakplaat en rooster 25-30 minuten tot goudbruin en zacht.',
            'Garneer met verse kruiden voor het serveren.'
        ]
    },
    {
        id: 'kip_pasta',
        title: 'Kip-pasta met romige saus',
        tags: ['snel','hoofdgerecht'],
        time: 30,
        difficulty: 'gemiddeld',
        ingredients: [
            '300 g pasta',
            '300 g kipfilet in stukjes',
            '1 sjalotje',
            '150 ml room (of plantaardige room)',
            '2 el olijfolie',
            'zout en peper'
        ],
        steps: [
            'Kook de pasta volgens verpakking.',
            'Bak de kip in olie tot goudbruin en gaar.',
            'Fruit sjalotjes in dezelfde pan tot glazig.',
            'Voeg room toe en laat even pruttelen tot saus bindt.',
            'Meng de pasta met de saus en serveer warm.'
        ]
    },
    {
        id: 'brownies',
        title: 'Smeuïge Brownies (oven)',
        tags: ['oven','dessert'],
        time: 45,
        difficulty: 'moeilijk',
        ingredients: [
            '200 g pure chocolade',
            '150 g boter',
            '200 g suiker',
            '3 eieren',
            '100 g bloem',
            'snufje zout'
        ],
        steps: [
            'Verwarm de oven voor op 180°C.',
            'Smelt chocolade en boter au bain-marie.',
            'Meng suiker en eieren tot romig, voeg gesmolten chocolade toe.',
            'Zeef bloem en zout erdoor en meng kort.',
            'Giet in een vorm en bak 20-25 minuten. Laat afkoelen voor het snijden.'
        ]
    },
    {
        id: 'tonijnsalade',
        title: 'Snelle tonijnsalade',
        tags: ['snel','lunch'],
        time: 10,
        difficulty: 'snel',
        ingredients: [
            '1 blik tonijn in water, uitgelekt',
            '2 el mayonaise (of yoghurt)',
            '1 el citroensap',
            'zout en peper',
            'sla en tomaat (voor serveren)'
        ],
        steps: [
            'Meng tonijn met mayonaise, citroensap, zout en peper.',
            'Proef en pas de smaak aan.',
            'Serveer op brood of op een bedje van sla met tomaat.'
        ]
    }
];

/* ===== state & helpers ===== */
const state = {
    recipes: SAMPLE_RECIPES,
    selectedTags: new Set(),
    search: '',
    maxTime: 120,
    difficulty: 'any',
    favorites: new Set(),
    username: ''
};

const SUBSTITUTE_MAP = {
    'boter': ['margarine','olijfolie','appelmoes (voor bakken)'],
    'ei': ['appelmoes (1/4 cup per ei)','gemalen lijnzaad + water (vegan)'],
    'melk': ['amandelmelk','sojamelk','havermelk'],
    'room': ['kokosroom','sojaroom','rijstroom'],
    'suiker': ['honing','maple syrup','ahornsiroop'],
    'kipfilet': ['tofu','tempeh','kikkererwten'],
    'tonijn': ['zwarte bonen','kip (indien niet pescotarisch)']
};

/* ---- localStorage keys ---- */
const LS = {
    favorites: 'mr_favorites_v1',
    profile: 'mr_profile_v1'
};

/* ========= INIT ========= */
function init(){
    // load local storage
    loadLocal();
    renderTags();
    renderResults();
    renderFavoritesList();
    bindUI();
    updateRecommendations();
}

function loadLocal(){
    try{
        const fav = JSON.parse(localStorage.getItem(LS.favorites) || '[]');
        fav.forEach(id => state.favorites.add(id));
        const profile = JSON.parse(localStorage.getItem(LS.profile) || '{}');
        if(profile.username) {
            state.username = profile.username;
            document.getElementById('username').value = profile.username;
        }
    }catch(e){ console.warn('LS parse error', e) }
}

/* ========= UI BINDINGS ========= */
function bindUI(){
    document.getElementById('searchInput').addEventListener('input', e=>{
        state.search = e.target.value.toLowerCase();
        renderResults();
    });
    document.getElementById('clearSearch').addEventListener('click', ()=>{
        state.search = '';
        document.getElementById('searchInput').value = '';
        renderResults();
    });
    document.getElementById('applyTime').addEventListener('click', ()=>{
        const v = parseInt(document.getElementById('maxTime').value || '120',10);
        state.maxTime = v;
        renderResults();
    });
    document.getElementById('difficulty').addEventListener('change', e=>{
        state.difficulty = e.target.value;
        renderResults();
    });
    document.getElementById('saveProfile').addEventListener('click', ()=>{
        const name = document.getElementById('username').value.trim();
        state.username = name;
        localStorage.setItem(LS.profile, JSON.stringify({username:name}));
        alert('Profiel opgeslagen (lokaal).');
    });
    document.getElementById('clearProfile').addEventListener('click', ()=>{
        state.username = '';
        document.getElementById('username').value = '';
        localStorage.removeItem(LS.profile);
        alert('Profiel verwijderd.');
    });
}

/* ========= TAGS ========= */
function uniqueTags(){
    const s = new Set();
    state.recipes.forEach(r => r.tags.forEach(t => s.add(t)));
    return Array.from(s).sort();
}

function renderTags(){
    const container = document.getElementById('tags');
    container.innerHTML = '';
    uniqueTags().forEach(tag=>{
        const btn = document.createElement('button');
        btn.className='tag';
        btn.textContent = tag;
        btn.addEventListener('click', ()=>{
            if(state.selectedTags.has(tag)) state.selectedTags.delete(tag); else state.selectedTags.add(tag);
            btn.classList.toggle('active');
            renderResults();
        });
        container.appendChild(btn);
    });
}

/* ========= FILTER & SEARCH ========= */
function matchesFilters(recipe){
    // tags
    if(state.selectedTags.size>0){
        for(const t of state.selectedTags){
            if(!recipe.tags.includes(t)) return false;
        }
    }
    // time
    if(recipe.time > state.maxTime) return false;
    // difficulty
    if(state.difficulty !== 'any' && recipe.difficulty !== state.difficulty) return false;
    // search: title or ingredients
    if(state.search){
        const hay = (recipe.title + ' ' + recipe.ingredients.join(' ') + ' ' + recipe.tags.join(' ')).toLowerCase();
        if(!hay.includes(state.search)) return false;
    }
    return true;
}

/* ========= RENDER RESULTS ========= */
function renderResults(){
    const results = document.getElementById('results');
    const filtered = state.recipes.filter(matchesFilters);
    results.innerHTML = '';
    document.getElementById('resultCount').textContent = filtered.length;

    if(filtered.length === 0){
        results.innerHTML = '<div style="grid-column:1/-1;padding:20px;color:var(--muted)">Geen recepten gevonden. Probeer andere filters of zoektermen.</div>';
        return;
    }

    filtered.forEach(r => {
        const card = document.createElement('div');
        card.className = 'card';
        const header = document.createElement('div');
        header.style.display='flex'; header.style.alignItems='center';
        const title = document.createElement('h3'); title.textContent = r.title;
        const star = document.createElement('div');
        star.innerHTML = state.favorites.has(r.id) ? '★' : '☆';
        star.className = 'star' + (state.favorites.has(r.id) ? ' active' : '');
        star.title = 'Opslaan als favoriet';
        star.addEventListener('click', ()=>{
            toggleFavorite(r.id);
            star.innerHTML = state.favorites.has(r.id) ? '★' : '☆';
            star.classList.toggle('active');
            renderFavoritesList();
            updateRecommendations();
        });

        header.appendChild(title);
        header.appendChild(star);

        const meta = document.createElement('div'); meta.className='meta';
        meta.innerHTML = `<div class="small">${r.time} min · ${r.difficulty}</div>`;

        const chips = document.createElement('div'); chips.className='chips';
        r.tags.forEach(t=>{
            const c = document.createElement('div'); c.className='chip'; c.textContent = t; chips.appendChild(c);
        });

        const actions = document.createElement('div');
        const openBtn = document.createElement('button'); openBtn.className='btn'; openBtn.textContent='Open';
        openBtn.addEventListener('click', ()=> openDetail(r.id));
        actions.appendChild(openBtn);

        card.appendChild(header);
        card.appendChild(meta);
        card.appendChild(chips);
        card.appendChild(actions);

        results.appendChild(card);
    });
}

/* ========= FAVORITES ========= */
function toggleFavorite(id){
    if(state.favorites.has(id)) state.favorites.delete(id); else state.favorites.add(id);
    localStorage.setItem(LS.favorites, JSON.stringify(Array.from(state.favorites)));
}
function renderFavoritesList(){
    const container = document.getElementById('favoritesContainer');
    container.innerHTML = '';
    if(state.favorites.size === 0){ container.innerHTML = '<div class="small" style="color:var(--muted)">Geen favorieten</div>'; return; }
    state.favorites.forEach(id=>{
        const r = state.recipes.find(x=>x.id===id);
        if(!r) return;
        const item = document.createElement('div'); item.className='favorite-item';
        item.innerHTML = `<div style="flex:1">${r.title}</div><button class="btn ghost">Open</button>`;
        item.querySelector('button').addEventListener('click', ()=> openDetail(id));
        container.appendChild(item);
    });
}

/* ========= DETAIL / MODAL ========= */
function openDetail(id){
    const recipe = state.recipes.find(r=>r.id===id);
    if(!recipe) return;
    const modal = document.getElementById('detailModal');
    modal.style.display = 'block';
    modal.innerHTML = `
<div class="detail" id="detailWrap">
  <div class="panel" role="dialog" aria-modal="true">
    <div style="display:flex;gap:10px;align-items:center">
      <h2 style="margin:0">${escapeHtml(recipe.title)}</h2>
      <div style="margin-left:auto;font-size:13px;color:var(--muted)">${recipe.time} min · ${recipe.difficulty}</div>
      <button id="closeDetail" class="btn ghost">Sluit</button>
    </div>

    <div style="margin-top:10px;display:flex;gap:18px;flex-wrap:wrap">
      <div style="flex:1;min-width:260px">
        <div class="small" style="margin-bottom:6px">Ingrediënten</div>
        <div class="ingredients" id="ingredientsList">
          ${recipe.ingredients.map(i => `<div class="ingredient">${escapeHtml(i)}</div>`).join('')}
        </div>
      </div>
      <div style="flex:1;min-width:260px">
        <div class="small" style="margin-bottom:6px">Stappen</div>
        <div id="stepsList">
          ${recipe.steps.map((s,idx) => `<div class="step" data-idx="${idx}"><div>${escapeHtml(s)}</div><div class="time small" id="stepTime_${idx}">Tijd: —</div></div>`).join('')}
        </div>
      </div>
    </div>

    <div class="ai-block">
      <div style="display:flex;gap:8px;align-items:center">
        <button id="analyzeBtn" class="btn">AI stap-analyse</button>
        <button id="ingredientsAI" class="btn ghost">AI-ingrediëntanalyse</button>
        <button id="askBtn" class="btn ghost">Vraag binnen recept</button>
        <div style="margin-left:auto" class="small">AI geeft heuristische schattingen</div>
      </div>
      <div id="aiOutput" style="margin-top:10px"></div>
    </div>

    <div style="margin-top:12px;display:flex;gap:8px;align-items:center">
      <button id="favDetail" class="btn">${state.favorites.has(recipe.id) ? 'Verwijder favoriet' : 'Opslaan als favoriet'}</button>
      <button id="closeDetail2" class="btn ghost">Sluit</button>
    </div>

  </div>
</div>
`;

    // bind modal buttons
    document.getElementById('closeDetail').addEventListener('click', closeDetail);
    document.getElementById('closeDetail2').addEventListener('click', closeDetail);
    document.getElementById('favDetail').addEventListener('click', ()=>{
        toggleFavorite(recipe.id);
        document.getElementById('favDetail').textContent = state.favorites.has(recipe.id) ? 'Verwijder favoriet' : 'Opslaan als favoriet';
        renderFavoritesList();
        updateRecommendations();
    });
    document.getElementById('analyzeBtn').addEventListener('click', ()=> aiAnalyzeSteps(recipe));
    document.getElementById('ingredientsAI').addEventListener('click', ()=> aiIngredientAnalysis(recipe));
    document.getElementById('askBtn').addEventListener('click', ()=> openQuestionPrompt(recipe));
}

function closeDetail(){
    const modal = document.getElementById('detailModal');
    modal.style.display = 'none';
    modal.innerHTML = '';
}

/* ========= AI: STEP ANALYSIS (heuristisch) =========
We estimate time per step by:
- base time = words * 0.5 seconds
- add multipliers for action keywords (bake/cook/simmer -> longer)
- enforce minimum 20 seconds per step for real steps
Return per-step times and total in minutes.
*/
function aiAnalyzeSteps(recipe){
    const output = document.getElementById('aiOutput');
    output.innerHTML = '<div class="small">Bezig met analyseren...</div>';

    // quick heuristic (synchronous)
    const keywordsLong = ['roer','sudderen','sudder','pruttel','bakken','oven','roost','braden','koken','stoven','simmer','bakken','gaargaren'];
    const keywordsMedium = ['snijd','meng','klop','verhit','roerbak','fruit','mix','meng'];
    const stepTimes = [];
    let totalSec = 0;

    recipe.steps.forEach((s,idx) => {
        const text = s.toLowerCase();
        const words = text.split(/\s+/).filter(Boolean).length;
        let secs = Math.max(20, Math.round(words * 0.5)); // base: 0.5s/woord, min 20s
        // keyword adjustments
        for(const k of keywordsLong){ if(text.includes(k)) secs += 60; }
        for(const k of keywordsMedium){ if(text.includes(k)) secs += 18; }

        // if step references time explicitly like "2-3 min", parse it and prefer that
        const explicit = parseExplicitTime(text);
        if(explicit) secs = explicit;

        stepTimes.push(secs);
        totalSec += secs;

        // write to UI per step
        const el = document.getElementById(`stepTime_${idx}`);
        if(el) el.textContent = `Tijd (schatting): ${formatSecs(secs)}`;
    });

    // total
    const totalMin = Math.round(totalSec/60);
    output.innerHTML = `
<div class="small"><strong>Stap-analyse voltooid</strong></div>
<div style="margin-top:8px">Geschatte totale actieve kooktijd: <strong>${totalMin} min</strong> (${formatSecs(totalSec)})</div>
<div style="margin-top:8px;font-size:13px;color:var(--muted)">
  Uitleg: tijd per stap is een eenvoudige schatting gebaseerd op stap-lengte en sleutelwoorden. Past u altijd aan op basis van ervaring.
</div>
`;
}

/* parse strings like "2-3 min", "20 minutes", "25 minuten" */
function parseExplicitTime(text){
    const m = text.match(/(\d+)\s*-\s*(\d+)\s*(min|m|minuten|minutes)/);
    if(m) return Math.round(((+m[1])+(+m[2]))/2 * 60);
    const m2 = text.match(/(\d+)\s*(min|m|minuten|minutes)/);
    if(m2) return +m2[1]*60;
    const m3 = text.match(/(\d+)\s*(sec|s|secon)/);
    if(m3) return +m3[1];
    return null;
}
function formatSecs(sec){
    if(sec < 60) return sec + ' sec';
    const m = Math.floor(sec/60);
    const s = sec % 60;
    return s===0 ? `${m} min` : `${m} min ${s} sec`;
}

/* ========= AI: INGREDIENT ANALYSIS =========
- Detect optional ingredients (contain "optioneel" or between parentheses or "naar smaak")
- Suggest substitutions from a small dictionary
*/
function aiIngredientAnalysis(recipe){
    const output = document.getElementById('aiOutput');
    const lines = [];
    const optional = [];
    const subs = [];

    recipe.ingredients.forEach(ing => {
        const low = ing.toLowerCase();
        if(low.includes('optioneel') || low.includes('naar smaak') || ing.includes('(')){
            optional.push(ing);
        }
        // simple tokenization to find main words to suggest substitutions
        for(const key in SUBSTITUTE_MAP){
            if(low.includes(key)){
                subs.push({orig:ing, key, suggestions: SUBSTITUTE_MAP[key]});
            }
        }
    });

    let html = '<div class="small"><strong>Ingrediënt-analyse</strong></div>';
    if(optional.length>0){
        html += '<div style="margin-top:8px"><strong>Optionele ingrediënten</strong><div class="small" style="margin-top:6px">' +
            optional.map(o=>escapeHtml(o)).join('<br>') + '</div></div>';
    } else {
        html += '<div style="margin-top:8px" class="small">Geen expliciet optionele ingrediënten gedetecteerd.</div>';
    }

    if(subs.length>0){
        html += '<div style="margin-top:8px"><strong>Vervangingssuggesties</strong><div class="small" style="margin-top:6px">';
        subs.forEach(s=>{
            html += `<div style="margin-bottom:6px"><strong>${escapeHtml(s.orig)}</strong> → ${s.suggestions.map(x=>escapeHtml(x)).join(' / ')}</div>`;
        });
        html += '</div></div>';
    } else {
        html += '<div style="margin-top:8px" class="small">Geen bekende vervangingen gevonden voor de ingrediënten (probeer "boter", "ei", "melk", etc.).</div>';
    }

    html += `<div style="margin-top:10px" class="small">Tip: probeer plantaardige vervangers voor zuivel en ei voor een vegan versie.</div>`;

    output.innerHTML = html;
}

/* ========= AI: IN-RECIPE QUESTIONS (simple simulated Q&A) =========
Opens a quick prompt, uses heuristic answers (no server).
*/
function openQuestionPrompt(recipe){
    const q = prompt('Stel een vraag over dit recept (bijv. "Kan dit zonder boter?")');
    if(!q) return;
    const out = document.getElementById('aiOutput');
    out.innerHTML = `<div class="small"><strong>Vraag:</strong> ${escapeHtml(q)}</div><div style="margin-top:8px" class="small">Antwoord (heuristisch):</div>`;
    const answer = simpleRecipeQnA(q.toLowerCase(), recipe);
    out.innerHTML += `<div style="margin-top:8px">${escapeHtml(answer)}</div>`;
}

/* Simple rule-based Q&A */
function simpleRecipeQnA(q, recipe){
    if(q.includes('kan dit zonder boter') || q.includes('zonder boter') || q.includes('zonder boter?')){
        return 'Vaak wel — gebruik olijfolie of margarine, of appelmoes als vervanger bij bakken. Let op textuurverschil.';
    }
    if(q.includes('wat bedoelen ze met glazig') || q.includes('glazig')){
        return 'Glazig betekent dat de ui zacht en licht doorzichtig is geworden, niet bruin. Fruit op middelhoog vuur tot het glanst.';
    }
    if(q.includes('vegan') || q.includes('veganistisch')){
        return 'Soms eenvoudig: vervang boter, melk en ei door plantaardige alternatieven (olie, plantaardige melk, appelmoes of lijnzaadmix).';
    }
    if(q.includes('hoe lang') || q.includes('hoelang') || q.includes('hoeveel tijd')){
        return `AI-schatting: gebruik de knop "AI stap-analyse" voor schattingen per stap en totaal. De opgegeven totale tijd (${recipe.time} min) is een goede richtlijn.`;
    }
    return 'Goede vraag — meestal kan dit met kleine aanpassingen. Probeer de AI-ingrediëntanalyse-knop voor mogelijke vervangers.';
}

/* ========= RECOMMENDATIONS =========
Simple recommended tag/text based on favorites.
*/
function updateRecommendations(){
    const recEl = document.getElementById('recommendText');
    if(state.favorites.size === 0){
        recEl.textContent = 'Pro tip: sla favorieten op om aanbevelingen te zien.';
        return;
    }
    // pick top tag among favorites
    const tagCount = {};
    state.favorites.forEach(id=>{
        const r = state.recipes.find(x=>x.id===id);
        if(!r) return;
        r.tags.forEach(t=> tagCount[t] = (tagCount[t]||0)+1);
    });
    const sorted = Object.entries(tagCount).sort((a,b)=>b[1]-a[1]);
    if(sorted.length>0){
        recEl.textContent = `Aanbevolen op basis van je favorieten: ${sorted.slice(0,3).map(x=>x[0]).join(', ')}`;
    } else recEl.textContent = '';
}

/* ========= UTIL ========= */
function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

/* ========= START ========= */
init();
