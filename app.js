/* =====================================================================
   Concepts of Modern Physics — Interactive Companion
   All physics computed live from Beiser's Ch.1–2 formulas. No canned data.
   ===================================================================== */

// ---------- physical constants (SI unless noted) ----------
const C   = 2.998e8;          // m/s
const H_J = 6.626e-34;        // J s
const H_EV = 4.136e-15;       // eV s
const K_B = 1.381e-23;        // J/K
const HC_EV_NM = 1239.84;     // eV*nm
const HC_EV_PM = 1.23984e6;   // eV*pm
const LAMBDA_C_PM = 2.426;    // electron Compton wavelength, pm
const WIEN_B = 2.8978e-3;     // m*K
const C_EXACT = 2.99792458e8; // m/s, for ratios where the rounding shows
const ME_C2_MEV = 0.511;      // electron rest energy, MeV
const G_GRAV = 6.674e-11;     // m^3 kg^-1 s^-2
const G_EARTH = 9.80665;      // m/s^2
const M_SUN = 1.989e30, R_SUN = 6.957e8;      // kg, m
const M_EARTH = 5.972e24, R_EARTH = 6.371e6;  // kg, m
const HBAR = 1.054e-34;       // J s
const M_E = 9.109e-31;        // electron mass, kg
const M_P = 1.673e-27;        // proton mass, kg
const EV_J = 1.602e-19;       // J per eV
const A0 = 5.292e-11;         // Bohr radius, m

// ---------- module registry ----------
// Each chapter file calls registerModule() at the end. app.js never needs to
// know which chapters exist, so adding a chapter is purely additive: drop in a
// chNN.js, add its <section> and a <script> tag. Nothing here changes.
const MODULES = [];
function registerModule(name, fn){ MODULES.push([name, fn]); }

// ---------- canvas draw registry ----------
const drawFns = {};
function registerCanvas(id, fn){ drawFns[id] = fn; }
function redrawVisible(){
  const active = document.querySelector('.chapter.active');
  if(!active) return;
  // Each canvas draws in its own try/catch: one module throwing must never
  // stop the rest of the page from rendering.
  active.querySelectorAll('canvas').forEach(cv=>{
    const fn = drawFns[cv.id];
    if(!fn) return;
    try{ fn(); }
    catch(err){ console.error(`[arthur-beiser] draw failed for #${cv.id}:`, err); }
  });
}

// ---------- chapter navigation ----------
function showChapter(id, opts){
  const target = document.getElementById(id);
  if(!target) return;
  document.querySelectorAll('.chapter').forEach(c=>c.classList.remove('active'));
  target.classList.add('active');
  document.querySelectorAll('.chap-btn').forEach(b=>{
    const on = b.dataset.chapter===id;
    b.classList.toggle('active', on);
    b.setAttribute('aria-selected', on ? 'true' : 'false');
    if(on) b.scrollIntoView({block:'nearest', inline:'center'});
  });
  buildModuleIndex(target);
  if(!opts || !opts.keepScroll) window.scrollTo({top:0, behavior:'instant'});
  if(history.replaceState) history.replaceState(null,'','#'+id);
  requestAnimationFrame(redrawVisible);
}

// Build the jump-list of modules for whichever chapter is showing.
function buildModuleIndex(section){
  const nav = document.getElementById('module-index');
  if(!nav) return;
  const cards = [...section.querySelectorAll('.card')];
  nav.innerHTML = cards.map((card,i)=>{
    if(!card.id) card.id = section.id + '-m' + (i+1);
    const h = card.querySelector('h2');
    const title = h ? h.childNodes[0].textContent.trim() : ('Module '+(i+1));
    const done = !!PROGRESS[card.id];
    return `<a href="#${card.id}"${done?' class="done"':''}><span class="mi-num">${done?'✓':i+1}</span>${title}</a>`;
  }).join('');
  nav.querySelectorAll('a').forEach(a=>{
    a.addEventListener('click', e=>{
      e.preventDefault();
      const el = document.getElementById(a.getAttribute('href').slice(1));
      if(el) el.scrollIntoView({behavior: prefersReducedMotion() ? 'instant' : 'smooth', block:'start'});
    });
  });
  observeCards(cards, nav);
}

/* =====================================================================
   PROGRESS TRACKING — "mark as understood", saved to localStorage only
   (per browser, never sent anywhere). Purely additive: every module
   works exactly as before if this fails to load or storage is blocked.
   ===================================================================== */
const PROG_KEY = 'beiser-progress';
function loadProgress(){
  try{ return JSON.parse(localStorage.getItem(PROG_KEY) || '{}'); }
  catch(e){ return {}; }
}
function saveProgress(){
  try{ localStorage.setItem(PROG_KEY, JSON.stringify(PROGRESS)); }
  catch(e){ /* private browsing / storage disabled: progress just won't persist */ }
}
let PROGRESS = loadProgress();

// Every card needs a stable id up front — not just the active chapter's,
// the way buildModuleIndex lazily does it — so chapter pills can show
// accurate counts before a chapter has ever been opened.
function assignAllCardIds(){
  document.querySelectorAll('.chapter').forEach(section=>{
    [...section.querySelectorAll('.card')].forEach((card,i)=>{
      if(!card.id) card.id = section.id + '-m' + (i+1);
    });
  });
}

function addProgressToggles(){
  document.querySelectorAll('.card').forEach(card=>{
    const h2 = card.querySelector('h2');
    if(!h2 || h2.querySelector('.prog-toggle')) return;
    card.classList.toggle('done', !!PROGRESS[card.id]);
    // a link that reopens this module with the controls exactly as they are now
    const link = document.createElement('button');
    link.type = 'button';
    link.className = 'card-link';
    link.title = 'copy a link to this module with its current settings';
    link.textContent = 'link';
    link.addEventListener('click', ()=>{
      const url = linkForCard(card);
      const done = ()=>{ link.textContent='copied'; setTimeout(()=>{ link.textContent='link'; }, 1400); };
      if(navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(url).then(done, ()=>{ location.hash=url.split('#')[1]; done(); });
      } else {
        location.hash = url.split('#')[1];
        done();
      }
    });
    h2.appendChild(link);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'prog-toggle' + (PROGRESS[card.id] ? ' on' : '');
    btn.setAttribute('aria-pressed', PROGRESS[card.id] ? 'true' : 'false');
    btn.textContent = PROGRESS[card.id] ? '✓ understood' : 'mark understood';
    h2.appendChild(btn);
    btn.addEventListener('click', ()=>{
      const on = !PROGRESS[card.id];
      if(on) PROGRESS[card.id] = true; else delete PROGRESS[card.id];
      saveProgress();
      btn.classList.toggle('on', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      btn.textContent = on ? '✓ understood' : 'mark understood';
      card.classList.toggle('done', on);
      refreshChapterProgress();
      const active = document.querySelector('.chapter.active');
      if(active) buildModuleIndex(active);
    });
  });
}

function refreshChapterProgress(){
  document.querySelectorAll('.chap-btn[data-chapter]').forEach(btn=>{
    const section = document.getElementById(btn.dataset.chapter);
    if(!section) return;
    const cards = [...section.querySelectorAll('.card')];
    const total = cards.length;
    const done = cards.filter(c=>PROGRESS[c.id]).length;
    let frac = btn.querySelector('.prog-frac');
    if(!frac){ frac = document.createElement('span'); frac.className='prog-frac'; btn.appendChild(frac); }
    frac.textContent = done>0 ? `${done}/${total}` : '';
    btn.classList.toggle('all-done', total>0 && done===total);
  });
  const summary = document.getElementById('overall-progress');
  if(summary){
    const total = document.querySelectorAll('.card').length;
    const done = Object.keys(PROGRESS).filter(id=>document.getElementById(id)).length;
    summary.textContent = done>0 ? `${done} of ${total} modules marked understood` : '';
  }
  const resetBtn = document.getElementById('reset-progress');
  if(resetBtn){
    const any = Object.keys(PROGRESS).some(id=>document.getElementById(id));
    resetBtn.style.display = any ? 'inline' : 'none';
  }
}

/* =====================================================================
   QUIZ REGISTRY
   Questions live in quiz.js and are functions, not strings: each one
   picks its own numbers and works the answer out with the same formulas
   and tables the modules use, so a question can never drift away from
   what the page next to it says. Wrong options are specific mistakes
   rather than noise, and each says what went wrong.
   ===================================================================== */
const QUIZ = {};
function registerQuiz(chapterId, fn){
  (QUIZ[chapterId] = QUIZ[chapterId] || []).push(fn);
}
function qPick(a){ return a[Math.floor(Math.random()*a.length)]; }
function qShuffle(a){
  const out = a.slice();
  for(let i=out.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [out[i],out[j]]=[out[j],out[i]]; }
  return out;
}

/* =====================================================================
   SEARCH, FORMULA SHEET, AND LINKS THAT REMEMBER THE SLIDERS
   Ninety-one modules is more than a chapter nav can carry, so: search
   across all of them at once, one page with every equation on it, and a
   link per module that reopens it with the controls exactly as they are.
   ===================================================================== */
let SEARCH_INDEX = null;
function buildSearchIndex(){
  SEARCH_INDEX = [];
  document.querySelectorAll('.chapter').forEach(section=>{
    const chBtn = document.querySelector(`.chap-btn[data-chapter="${section.id}"]`);
    const chName = chBtn ? chBtn.textContent.replace(/^\d+/,'').trim() : section.id;
    const chNum = chBtn && chBtn.querySelector('.n') ? chBtn.querySelector('.n').textContent : '';
    section.querySelectorAll('.card').forEach(card=>{
      const h = card.querySelector('h2');
      const title = h ? h.childNodes[0].textContent.trim() : '';
      const tag = card.querySelector('.eqtag');
      const desc = card.querySelector('p.desc');
      const eq = card.querySelector('.eq');
      const explain = card.querySelector('.explain');
      SEARCH_INDEX.push({
        id: card.id, chapter: section.id, chName, chNum, title,
        // title and tag are what people actually search for, so they are
        // matched separately and rank above a hit buried in the prose
        strong: `${title} ${tag?tag.textContent:''}`.toLowerCase(),
        weak: `${desc?desc.textContent:''} ${eq?eq.textContent:''} ${explain?explain.textContent:''}`.toLowerCase()
      });
    });
  });
}
function runSearch(q){
  const nav = document.getElementById('module-index');
  const titleEl = document.getElementById('sidebar-title');
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  if(!terms.length){
    if(titleEl) titleEl.textContent = 'In this chapter';
    const active = document.querySelector('.chapter.active');
    if(active) buildModuleIndex(active);
    return;
  }
  if(!SEARCH_INDEX) buildSearchIndex();
  const hits = [];
  SEARCH_INDEX.forEach(m=>{
    let score = 0;
    for(const t of terms){
      if(m.strong.includes(t)) score += 10;
      else if(m.weak.includes(t)) score += 1;
      else { score = -1; break; }            // every term has to appear somewhere
    }
    if(score > 0) hits.push({m, score});
  });
  // ties break by chapter order, numerically — "ch12" sorts before "ch5" as text
  const chNo = m => parseInt(m.chapter.replace(/\D/g,''),10) || 0;
  hits.sort((a,b)=> b.score-a.score || chNo(a.m)-chNo(b.m));
  if(titleEl) titleEl.textContent = `${hits.length} match${hits.length===1?'':'es'}`;
  if(!hits.length){
    nav.innerHTML = '<div class="mi-none">nothing matches that</div>';
    return;
  }
  nav.innerHTML = hits.slice(0,40).map(({m})=>
    `<a href="#${m.id}" data-ch="${m.chapter}" data-card="${m.id}">` +
    `<span class="mi-ch">${m.chNum}</span>${m.title}</a>`).join('');
  nav.querySelectorAll('a').forEach(a=>{
    a.addEventListener('click', e=>{
      e.preventDefault();
      goToModule(a.dataset.ch, a.dataset.card);
    });
  });
}
function goToModule(chapterId, cardId){
  const active = document.querySelector('.chapter.active');
  if(!active || active.id !== chapterId) showChapter(chapterId, {keepScroll:true});
  requestAnimationFrame(()=>{
    const el = document.getElementById(cardId);
    if(el) el.scrollIntoView({behavior: prefersReducedMotion() ? 'instant' : 'smooth', block:'start'});
  });
}

function buildFormulaSheet(){
  const body = document.getElementById('sheet-body');
  if(!body) return;
  let html = '';
  document.querySelectorAll('.chapter').forEach(section=>{
    const btn = document.querySelector(`.chap-btn[data-chapter="${section.id}"]`);
    // the pill's number lives in its own span, so textContent runs them
    // together into "1Relativity" unless they are pulled apart
    let name = section.id;
    if(btn){
      const n = btn.querySelector('.n');
      const num = n ? n.textContent.trim() : '';
      const rest = n ? btn.textContent.replace(num,'').trim() : btn.textContent.trim();
      name = num ? `${num} · ${rest}` : rest;
    }
    const rows = [];
    section.querySelectorAll('.card').forEach(card=>{
      const eq = card.querySelector('.eq');
      if(!eq) return;
      const h = card.querySelector('h2');
      const title = h ? h.childNodes[0].textContent.trim() : '';
      rows.push(`<button type="button" class="sheet-row" data-ch="${section.id}" data-card="${card.id}">
        <span class="sr-name">${title}</span><span class="sr-eq">${eq.innerHTML}</span></button>`);
    });
    if(rows.length) html += `<h4>${name}</h4>` + rows.join('');
  });
  body.innerHTML = html;
  body.querySelectorAll('.sheet-row').forEach(r=>{
    r.addEventListener('click', ()=>{
      closeSheet();
      goToModule(r.dataset.ch, r.dataset.card);
    });
  });
}
function openSheet(){
  const ov=document.getElementById('sheet-overlay');
  if(!ov) return;
  if(!document.getElementById('sheet-body').innerHTML) buildFormulaSheet();
  ov.hidden=false;
}
function closeSheet(){
  const ov=document.getElementById('sheet-overlay');
  if(ov) ov.hidden=true;
}

/* ---- links that carry the controls with them ---- */
function cardControls(card){
  return [...card.querySelectorAll('input[type=range], input[type=checkbox], select')].filter(el=>el.id);
}
function linkForCard(card){
  const parts = cardControls(card).map(el=>{
    const v = el.type==='checkbox' ? (el.checked?'1':'0') : el.value;
    return `${encodeURIComponent(el.id)}=${encodeURIComponent(v)}`;
  });
  const section = card.closest('.chapter');
  const base = location.href.split('#')[0];
  return `${base}#${section.id}|${card.id}` + (parts.length?`|${parts.join('&')}`:'');
}
// #chapter|card|id=value&id=value
function applyStateFromHash(){
  const raw = decodeURIComponent(location.hash.slice(1));
  if(!raw.includes('|')) return false;
  const [chapterId, cardId, query] = raw.split('|');
  if(!document.getElementById(chapterId)) return false;
  showChapter(chapterId, {keepScroll:true});
  if(query){
    query.split('&').forEach(pair=>{
      const [k,v] = pair.split('=');
      const el = document.getElementById(decodeURIComponent(k||''));
      if(!el) return;
      const val = decodeURIComponent(v||'');
      if(el.type==='checkbox') el.checked = (val==='1');
      else el.value = val;
      el.dispatchEvent(new Event(el.tagName==='SELECT'?'change':'input', {bubbles:true}));
    });
  }
  if(cardId){
    requestAnimationFrame(()=>{
      const el=document.getElementById(cardId);
      if(el) el.scrollIntoView({block:'start', behavior:'instant'});
    });
  }
  return true;
}

/* ---- quiz UI ---- */
let quizRight = 0, quizAsked = 0, quizLastIdx = -1;
function drawQuizQuestion(){
  const body = document.getElementById('quiz-body');
  const active = document.querySelector('.chapter.active');
  if(!body || !active) return;
  const pool = QUIZ[active.id] || [];
  const titleEl = document.getElementById('quiz-title');
  const btn = document.querySelector(`.chap-btn[data-chapter="${active.id}"]`);
  if(titleEl) titleEl.textContent = 'Check yourself — ' + (btn ? btn.textContent.replace(/^\d+/,'').trim() : active.id);
  const scoreEl = document.getElementById('quiz-score');
  if(scoreEl) scoreEl.textContent = quizAsked ? `${quizRight} / ${quizAsked}` : '';
  if(!pool.length){
    body.innerHTML = '<p class="qz-none">No questions for this chapter yet.</p>';
    return;
  }
  // a question may decline to be asked (its random draw came out degenerate)
  let item = null, guard = 0;
  while(!item && guard++ < 30){
    let i = Math.floor(Math.random()*pool.length);
    if(pool.length > 1 && i === quizLastIdx) i = (i+1) % pool.length;
    try{ item = pool[i](); }catch(err){ console.error('[arthur-beiser] a quiz question threw:', err); item = null; }
    if(item) quizLastIdx = i;
  }
  if(!item){ body.innerHTML = '<p class="qz-none">No questions for this chapter yet.</p>'; return; }

  const opts = qShuffle(item.opts);
  body.innerHTML = `<p class="qz-q">${item.q}</p>` +
    opts.map((o,i)=>`<button type="button" class="qz-opt" data-i="${i}">${o.t}</button>`).join('') +
    `<div id="qz-feedback"></div>`;
  let answered = false;
  body.querySelectorAll('.qz-opt').forEach(b=>{
    b.addEventListener('click', ()=>{
      if(answered) return;
      answered = true;
      quizAsked++;
      const chosen = opts[+b.dataset.i];
      if(chosen.ok) quizRight++;
      body.querySelectorAll('.qz-opt').forEach((el,i)=>{
        el.disabled = true;
        if(opts[i].ok) el.classList.add('right');
        else if(el===b) el.classList.add('wrong');
      });
      const fb = document.getElementById('qz-feedback');
      const right = opts.find(o=>o.ok);
      fb.innerHTML =
        `<div class="qz-why${chosen.ok?'':' no'}">${chosen.ok?'':'<b>Not quite.</b> '}${chosen.why}</div>` +
        (chosen.ok ? '' : `<div class="qz-why"><b>The answer is ${right.t}.</b> ${right.why}</div>`) +
        `<button type="button" class="qz-next">Next question</button>`;
      const sc = document.getElementById('quiz-score');
      if(sc) sc.textContent = `${quizRight} / ${quizAsked}`;
      fb.querySelector('.qz-next').addEventListener('click', drawQuizQuestion);
    });
  });
}
function openQuiz(){
  const ov = document.getElementById('quiz-overlay');
  if(!ov) return;
  ov.hidden = false;
  drawQuizQuestion();
}
function closeQuiz(){
  const ov = document.getElementById('quiz-overlay');
  if(ov) ov.hidden = true;
}

function initExtras(){
  const search = document.getElementById('module-search');
  if(search){
    // count the modules rather than hard-coding a number that can drift
    buildSearchIndex();
    search.placeholder = `Search all ${SEARCH_INDEX.length} modules…`;
    let t;
    search.addEventListener('input', ()=>{ clearTimeout(t); t=setTimeout(()=>runSearch(search.value), 90); });
    search.addEventListener('keydown', e=>{
      if(e.key==='Escape'){ search.value=''; runSearch(''); search.blur(); }
      if(e.key==='Enter'){
        const first=document.querySelector('#module-index a[data-card]');
        if(first){ e.preventDefault(); first.click(); }
      }
    });
  }
  // "/" focuses the search box, the way it does everywhere else
  document.addEventListener('keydown', e=>{
    if(e.key==='/' && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)){
      e.preventDefault();
      if(search){ search.focus(); search.select(); }
    }
    if(e.key==='Escape'){ closeSheet(); closeQuiz(); closeMap(); }
  });
  const open=document.getElementById('sheet-open'), close=document.getElementById('sheet-close'),
        ov=document.getElementById('sheet-overlay');
  if(open) open.addEventListener('click', openSheet);
  if(close) close.addEventListener('click', closeSheet);
  if(ov) ov.addEventListener('click', e=>{ if(e.target===ov) closeSheet(); });

  const qOpen=document.getElementById('quiz-open'), qClose=document.getElementById('quiz-close'),
        qOv=document.getElementById('quiz-overlay');
  if(qOpen) qOpen.addEventListener('click', openQuiz);
  if(qClose) qClose.addEventListener('click', closeQuiz);
  if(qOv) qOv.addEventListener('click', e=>{ if(e.target===qOv) closeQuiz(); });

  const mOpen=document.getElementById('map-open'), mClose=document.getElementById('map-close'),
        mOv=document.getElementById('map-overlay');
  if(mOpen) mOpen.addEventListener('click', openMap);
  if(mClose) mClose.addEventListener('click', closeMap);
  if(mOv) mOv.addEventListener('click', e=>{ if(e.target===mOv) closeMap(); });
}

function initProgressTracking(){
  assignAllCardIds();
  addProgressToggles();
  refreshChapterProgress();
  const resetBtn = document.getElementById('reset-progress');
  if(resetBtn) resetBtn.addEventListener('click', ()=>{
    PROGRESS = {};
    saveProgress();
    document.querySelectorAll('.prog-toggle.on').forEach(b=>{
      b.classList.remove('on'); b.setAttribute('aria-pressed','false'); b.textContent='mark understood';
    });
    document.querySelectorAll('.card.done').forEach(c=>c.classList.remove('done'));
    refreshChapterProgress();
    const active = document.querySelector('.chapter.active');
    if(active) buildModuleIndex(active);
  });
}

// Highlight whichever module is currently on screen.
let _cardObserver = null;
function observeCards(cards, nav){
  if(_cardObserver) _cardObserver.disconnect();
  if(!('IntersectionObserver' in window)) return;
  const links = [...nav.querySelectorAll('a')];
  _cardObserver = new IntersectionObserver(entries=>{
    entries.forEach(en=>{
      const i = cards.indexOf(en.target);
      if(i<0 || !links[i]) return;
      if(en.isIntersecting) {
        links.forEach(l=>l.classList.remove('current'));
        links[i].classList.add('current');
      }
    });
  }, {rootMargin:'-45% 0px -50% 0px'});
  cards.forEach(c=>_cardObserver.observe(c));
}

function prefersReducedMotion(){
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

let resizeT;
window.addEventListener('resize', ()=>{ clearTimeout(resizeT); resizeT=setTimeout(redrawVisible,80); });

// ---------- canvas fitting ----------
// Resizing a canvas's backing buffer (canvas.width = ...) forces the browser
// to reallocate and re-scale its whole pixel buffer, which is expensive —
// especially at devicePixelRatio > 1. Every module used to call fitCanvas()
// on *every* slider "input" event (many times per second while dragging),
// which is what made the page feel laggy. Since the on-screen CSS size of a
// canvas doesn't change while dragging a slider — only its content needs to
// be repainted — we cache the last-fit size per canvas and skip the
// expensive reallocation whenever nothing has actually changed. A real
// resize (window resize, tab switch revealing a previously-hidden canvas)
// still gets a full refit because clientWidth/height will differ.
const _canvasFitCache = new WeakMap();

// The canvas .width/.height IDL properties REFLECT the HTML content attributes:
// writing `canvas.height = 600` literally rewrites height="600" in the markup.
// So the intended CSS height must be captured exactly once, before we ever
// touch the attribute — reading it back afterwards would return the already-
// scaled buffer height and multiply it by dpr all over again on every redraw
// (300 -> 600 -> 1200 -> 2400 ... on any dpr>1 display, until the browser can
// no longer allocate the backing buffer and paints a broken-image icon).
function intendedCssHeight(canvas){
  if(canvas.dataset.cssHeight === undefined){
    canvas.dataset.cssHeight = String(parseFloat(canvas.getAttribute('height')) || 260);
  }
  return parseFloat(canvas.dataset.cssHeight);
}

// Hard ceiling so a bad measurement can never ask the browser for a buffer it
// cannot allocate. Chrome's practical per-canvas limits are well above this.
const MAX_CANVAS_PX = 8192;

function fitCanvas(canvas){
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  const cssH = intendedCssHeight(canvas);
  const cssWraw = canvas.clientWidth || (canvas.parentElement && canvas.parentElement.clientWidth) || 600;
  const cssW = Math.max(1, Math.min(cssWraw, MAX_CANVAS_PX/dpr));

  const cached = _canvasFitCache.get(canvas);
  if(cached && cached.cssW===cssW && cached.cssH===cssH && cached.dpr===dpr){
    cached.ctx.clearRect(0,0,cssW,cssH); // cheap: just repaint, no buffer reallocation
    cached.ctx._plotRect = null;         // plotLine clips only to the axes drawn this pass
    return cached.dims;
  }

  canvas.style.height = cssH + 'px';
  canvas.width  = Math.max(1, Math.min(MAX_CANVAS_PX, Math.round(cssW*dpr)));
  canvas.height = Math.max(1, Math.min(MAX_CANVAS_PX, Math.round(cssH*dpr)));
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.clearRect(0,0,cssW,cssH);
  ctx._plotRect = null;
  const dims = {ctx, w:cssW, h:cssH};
  _canvasFitCache.set(canvas, {cssW, cssH, dpr, ctx, dims});
  return dims;
}

// ---------- axis ticks ----------
// Dividing a range into N equal parts gives ticks like 0, 310, 620, 930, 1241 —
// arithmetically correct and horrible to read. Real plots put ticks on round
// numbers, so pick a step of 1, 2, 2.5 or 5 times a power of ten near the
// requested spacing and land the ticks on multiples of it.
function niceTicks(min, max, target){
  if(!isFinite(min) || !isFinite(max) || max<=min) return [min, max];
  target = Math.max(2, target||5);
  const raw = (max-min)/target;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw/mag;
  const step = (norm<1.5 ? 1 : norm<2.25 ? 2 : norm<3.5 ? 2.5 : norm<7.5 ? 5 : 10) * mag;
  const out = [];
  const eps = step*1e-9;
  for(let v=Math.ceil(min/step - 1e-9)*step; v<=max+eps; v+=step){
    out.push(Math.abs(v) < eps ? 0 : v);
  }
  return out.length ? out : [min, max];
}
function _equalTicks(min, max, n){
  const out=[];
  for(let i=0;i<=n;i++) out.push(min + i*(max-min)/n);
  return out;
}
// how many decimals it takes to write this step exactly
function _decimalsFor(step){
  step = Math.abs(step);
  if(!isFinite(step) || step===0) return 0;
  for(let d=0; d<=6; d++){
    const r = step*Math.pow(10,d);
    if(Math.abs(r-Math.round(r)) < 1e-6*Math.max(1,Math.abs(r))) return d;
  }
  return 6;
}
const _SUPD = {'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹','-':'⁻'};
function _supDigits(n){ return String(n).split('').map(c=>_SUPD[c]||c).join(''); }

// Pick a formatter for a set of ticks. When the numbers are very large or very
// small, factor the common power of ten out into the axis label rather than
// repeating "8.1e5" on every tick.
function _autoLabeler(ticks){
  const finite = ticks.filter(t=>isFinite(t));
  const maxabs = finite.reduce((a,t)=>Math.max(a,Math.abs(t)), 0);
  const step = finite.length>1 ? Math.abs(finite[1]-finite[0]) : (maxabs||1);
  let e = 0;
  if(maxabs>0 && (maxabs>=1e4 || maxabs<1e-2)) e = Math.floor(Math.log10(maxabs));
  const scale = Math.pow(10, e);
  const dec = _decimalsFor(step/scale);
  const fmt = v => {
    let s = (v/scale).toFixed(dec);
    if(/^-0(\.0*)?$/.test(s)) s = s.slice(1);   // no "-0"
    return s;
  };
  return {fmt, suffix: e ? `  ×10${_supDigits(e)}` : ''};
}

// ---------- generic xy-plot axes helper ----------
function drawAxes(ctx, w, h, m, xmin, xmax, ymin, ymax, xlabel, ylabel, opts){
  opts = opts||{};
  const X = x => m.l + (x-xmin)/(xmax-xmin)*(w-m.l-m.r);
  const Y = y => h-m.b - (y-ymin)/(ymax-ymin)*(h-m.b-m.t);
  // Remember the plotting box so plotLine can clip to it. A curve that runs off
  // the top of its own axes used to keep going across the rest of the card.
  ctx._plotRect = {x:m.l, y:m.t, w:w-m.l-m.r, h:h-m.b-m.t};

  const xt = opts.exactTicks ? _equalTicks(xmin,xmax,opts.nx||5) : niceTicks(xmin,xmax,opts.nx||5);
  const yt = opts.exactTicks ? _equalTicks(ymin,ymax,opts.ny||5) : niceTicks(ymin,ymax,opts.ny||5);
  const xl = opts.xfmt ? {fmt:opts.xfmt, suffix:''} : _autoLabeler(xt);
  const yl = opts.yfmt ? {fmt:opts.yfmt, suffix:''} : _autoLabeler(yt);

  ctx.save();
  ctx.font = '11px Helvetica, Arial, sans-serif';
  ctx.strokeStyle = '#e7e4dc'; ctx.lineWidth = 1;
  ctx.fillStyle = '#8a8d92';
  xt.forEach(xv=>{
    const px = X(xv);
    ctx.beginPath(); ctx.moveTo(px, m.t); ctx.lineTo(px, h-m.b); ctx.stroke();
    ctx.textAlign='center'; ctx.fillText(xl.fmt(xv), px, h-m.b+16);
  });
  yt.forEach(yv=>{
    const py = Y(yv);
    ctx.beginPath(); ctx.moveTo(m.l, py); ctx.lineTo(w-m.r, py); ctx.stroke();
    ctx.textAlign='right'; ctx.fillText(yl.fmt(yv), m.l-8, py+3);
  });
  ctx.strokeStyle = '#1c1d20'; ctx.lineWidth = 1.3;
  ctx.beginPath(); ctx.moveTo(m.l,m.t); ctx.lineTo(m.l,h-m.b); ctx.lineTo(w-m.r,h-m.b); ctx.stroke();
  ctx.fillStyle = '#1c1d20'; ctx.textAlign='center';
  ctx.fillText(xlabel + xl.suffix, m.l+(w-m.l-m.r)/2, h-6);
  ctx.save(); ctx.translate(12, m.t+(h-m.b-m.t)/2); ctx.rotate(-Math.PI/2);
  ctx.fillText(ylabel + yl.suffix, 0, 0); ctx.restore();
  ctx.restore();
  return {X,Y};
}
function plotLine(ctx, X, Y, pts, color, width, dash){
  ctx.save();
  // clip to the axes box when there is one (drawAxes sets it; free-form
  // diagrams that never call drawAxes are left alone)
  const R = ctx._plotRect;
  if(R){ ctx.beginPath(); ctx.rect(R.x-2, R.y-2, R.w+4, R.h+4); ctx.clip(); }
  ctx.strokeStyle=color; ctx.lineWidth=width||2; if(dash) ctx.setLineDash(dash);
  ctx.beginPath();
  let started=false;
  pts.forEach(p=>{
    if(p.y==null || !isFinite(p.y)){ started=false; return; }
    const px=X(p.x), py=Y(p.y);
    if(!started){ ctx.moveTo(px,py); started=true; } else ctx.lineTo(px,py);
  });
  ctx.stroke(); ctx.restore();
}
/* Labels that land on top of each other are the commonest way one of these
   plots goes unreadable — particles of equal mass, degenerate energy levels,
   two curves that meet. Given the labels a plot wants to draw, this pushes
   overlapping ones apart vertically and keeps them inside the canvas. Set
   ctx.font first; returns the resolved y for each item, in input order. */
function layoutLabels(ctx, items, opts){
  opts = opts || {};
  const lh   = opts.lineHeight || 12;
  const pad  = opts.pad == null ? 2 : opts.pad;
  const minY = opts.minY == null ? 10 : opts.minY;
  const maxY = opts.maxY == null ? 1e9 : opts.maxY;
  const dir  = opts.down ? 1 : -1;            // stack upward by default
  const placed = [];
  return items.map(it=>{
    const w = ctx.measureText(it.text).width;
    const align = it.align || 'center';
    const x0 = align==='center' ? it.x-w/2 : (align==='right' ? it.x-w : it.x);
    const hits = y => placed.some(p =>
      Math.abs(p.y-y) < lh && x0 < p.x0+p.w+pad && p.x0 < x0+w+pad);
    let y = it.y, guard = 0;
    while(guard++ < 60 && hits(y) && y+dir*lh >= minY && y+dir*lh <= maxY) y += dir*lh;
    if(hits(y)){                                // ran out of room: try the other way
      y = it.y; guard = 0;
      while(guard++ < 60 && hits(y) && y-dir*lh >= minY && y-dir*lh <= maxY) y -= dir*lh;
    }
    y = Math.max(minY, Math.min(maxY, y));
    placed.push({x0, w, y});
    return y;
  });
}

function dotAt(ctx,X,Y,x,y,color,r){
  ctx.save(); ctx.fillStyle=color; ctx.beginPath(); ctx.arc(X(x),Y(y),r||5,0,7); ctx.fill();
  ctx.strokeStyle='#fff'; ctx.lineWidth=1.5; ctx.stroke(); ctx.restore();
}
function fmt(x,d){ if(!isFinite(x)) return '—'; d=d==null?3:d; return Number(x).toFixed(d); }
function fmtSci(x,d){ if(!isFinite(x)) return '—'; d=d==null?3:d; return Number(x).toExponential(d).replace('e+','e'); }

/* ---------- colorimetry ----------
   Analytic fits to the CIE 1931 colour-matching functions (Wyman, Sloan &
   Shirley, JCGT 2013), so a computed spectrum can be turned into the colour an
   eye would actually see, instead of a hand-tuned rainbow ramp. Used for the
   blackbody colour strip and the visible band. */
function _pieceGauss(x, mu, s1, s2){
  const t = (x-mu)/(x<mu ? s1 : s2);
  return Math.exp(-0.5*t*t);
}
function cieBar(nm){
  return [
    1.056*_pieceGauss(nm,599.8,37.9,31.0) + 0.362*_pieceGauss(nm,442.0,16.0,26.7)
      - 0.065*_pieceGauss(nm,501.1,20.4,26.2),
    0.821*_pieceGauss(nm,568.8,46.9,40.5) + 0.286*_pieceGauss(nm,530.9,16.3,31.1),
    1.217*_pieceGauss(nm,437.0,11.8,36.0) + 0.681*_pieceGauss(nm,459.0,26.0,13.8)
  ];
}
// XYZ -> sRGB, desaturating rather than clipping when a colour falls outside
// the monitor's gamut (which pure spectral colours always do).
function xyzToRgb(X,Y,Z,opts){
  opts = opts||{};
  let r =  3.2406*X - 1.5372*Y - 0.4986*Z;
  let g = -0.9689*X + 1.8758*Y + 0.0415*Z;
  let b =  0.0557*X - 0.2040*Y + 1.0570*Z;
  const mn = Math.min(r,g,b);
  if(mn < 0){ r-=mn; g-=mn; b-=mn; }
  const mx = Math.max(r,g,b,1e-12);
  if(opts.normalize !== false){ r/=mx; g/=mx; b/=mx; }
  const gam = c => { c=Math.max(0,Math.min(1,c)); return c<=0.0031308 ? 12.92*c : 1.055*Math.pow(c,1/2.4)-0.055; };
  return [Math.round(255*gam(r)), Math.round(255*gam(g)), Math.round(255*gam(b))];
}
function wavelengthRGB(nm, opts){
  const [x,y,z] = cieBar(nm);
  return xyzToRgb(x,y,z,opts);
}
// colour of an arbitrary spectrum f(nm) -> spectral power
function spectrumRGB(f, lo, hi, step){
  lo=lo||360; hi=hi||780; step=step||4;
  let X=0,Y=0,Z=0;
  for(let nm=lo; nm<=hi; nm+=step){
    const p=f(nm);
    if(!isFinite(p) || p<=0) continue;
    const [x,y,z]=cieBar(nm);
    X+=p*x; Y+=p*y; Z+=p*z;
  }
  return xyzToRgb(X,Y,Z);
}
function rgbCss(c){ return `rgb(${c[0]},${c[1]},${c[2]})`; }

function wavelengthToColor(nm){
  let r,g,b;
  if(nm<380) nm=380; if(nm>750) nm=750;
  if(nm<440){r=-(nm-440)/(440-380); g=0; b=1;}
  else if(nm<490){r=0; g=(nm-440)/(490-440); b=1;}
  else if(nm<510){r=0; g=1; b=-(nm-510)/(510-490);}
  else if(nm<580){r=(nm-510)/(580-510); g=1; b=0;}
  else if(nm<645){r=1; g=-(nm-645)/(645-580); b=0;}
  else {r=1; g=0; b=0;}
  let factor = (nm<420)?0.3+0.7*(nm-380)/(420-380):(nm>700?0.3+0.7*(750-nm)/(750-700):1);
  const adj = v => v<=0?0:Math.round(255*Math.pow(v*factor,0.8));
  return `rgb(${adj(r)},${adj(g)},${adj(b)})`;
}

document.addEventListener('DOMContentLoaded', ()=>{
  // Wire the chapter buttons.
  document.querySelectorAll('.chap-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>showChapter(btn.dataset.chapter));
  });

  // Each module initialises in its own try/catch, so one broken module can
  // only ever take itself down, never the rest of the page.
  MODULES.forEach(([name, fn])=>{
    try{ fn(); }
    catch(err){ console.error(`[arthur-beiser] ${name}() failed to initialize:`, err); }
  });

  try{ initProgressTracking(); }
  catch(err){ console.error('[arthur-beiser] progress tracking failed to initialize:', err); }
  try{ initExtras(); }
  catch(err){ console.error('[arthur-beiser] search / formula sheet failed to initialize:', err); }

  // a link that carries slider settings takes priority over a plain #chapter
  let restored = false;
  try{ restored = applyStateFromHash(); }
  catch(err){ console.error('[arthur-beiser] could not restore the link state:', err); }
  if(!restored){
    const wanted = location.hash && document.querySelector(location.hash + '.chapter')
      ? location.hash.slice(1)
      : (document.querySelector('.chapter.active') || document.querySelector('.chapter')).id;
    showChapter(wanted, {keepScroll:true});
  }
});








/* =====================================================================
   CHAPTER 2
   ===================================================================== */









