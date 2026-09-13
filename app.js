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
    return `<a href="#${card.id}"><span class="mi-num">${i+1}</span>${title}</a>`;
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
    return cached.dims;
  }

  canvas.style.height = cssH + 'px';
  canvas.width  = Math.max(1, Math.min(MAX_CANVAS_PX, Math.round(cssW*dpr)));
  canvas.height = Math.max(1, Math.min(MAX_CANVAS_PX, Math.round(cssH*dpr)));
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.clearRect(0,0,cssW,cssH);
  const dims = {ctx, w:cssW, h:cssH};
  _canvasFitCache.set(canvas, {cssW, cssH, dpr, ctx, dims});
  return dims;
}

// ---------- generic xy-plot axes helper ----------
function drawAxes(ctx, w, h, m, xmin, xmax, ymin, ymax, xlabel, ylabel, opts){
  opts = opts||{};
  const X = x => m.l + (x-xmin)/(xmax-xmin)*(w-m.l-m.r);
  const Y = y => h-m.b - (y-ymin)/(ymax-ymin)*(h-m.b-m.t);
  ctx.save();
  ctx.font = '11px Helvetica, Arial, sans-serif';
  // gridlines
  ctx.strokeStyle = '#e7e4dc'; ctx.lineWidth = 1;
  const nx = opts.nx||5, ny = opts.ny||5;
  ctx.fillStyle = '#8a8d92';
  for(let i=0;i<=nx;i++){
    const xv = xmin + i*(xmax-xmin)/nx;
    const px = X(xv);
    ctx.beginPath(); ctx.moveTo(px, m.t); ctx.lineTo(px, h-m.b); ctx.stroke();
    ctx.textAlign='center'; ctx.fillText(opts.xfmt?opts.xfmt(xv):xv.toFixed(2), px, h-m.b+16);
  }
  for(let i=0;i<=ny;i++){
    const yv = ymin + i*(ymax-ymin)/ny;
    const py = Y(yv);
    ctx.beginPath(); ctx.moveTo(m.l, py); ctx.lineTo(w-m.r, py); ctx.stroke();
    ctx.textAlign='right'; ctx.fillText(opts.yfmt?opts.yfmt(yv):yv.toFixed(2), m.l-8, py+3);
  }
  ctx.strokeStyle = '#1c1d20'; ctx.lineWidth = 1.3;
  ctx.beginPath(); ctx.moveTo(m.l,m.t); ctx.lineTo(m.l,h-m.b); ctx.lineTo(w-m.r,h-m.b); ctx.stroke();
  ctx.fillStyle = '#1c1d20'; ctx.textAlign='center';
  ctx.fillText(xlabel, m.l+(w-m.l-m.r)/2, h-6);
  ctx.save(); ctx.translate(12, m.t+(h-m.b-m.t)/2); ctx.rotate(-Math.PI/2); ctx.fillText(ylabel,0,0); ctx.restore();
  ctx.restore();
  return {X,Y};
}
function plotLine(ctx, X, Y, pts, color, width, dash){
  ctx.save(); ctx.strokeStyle=color; ctx.lineWidth=width||2; if(dash) ctx.setLineDash(dash);
  ctx.beginPath();
  let started=false;
  pts.forEach(p=>{
    if(p.y==null || !isFinite(p.y)){ started=false; return; }
    const px=X(p.x), py=Y(p.y);
    if(!started){ ctx.moveTo(px,py); started=true; } else ctx.lineTo(px,py);
  });
  ctx.stroke(); ctx.restore();
}
function dotAt(ctx,X,Y,x,y,color,r){
  ctx.save(); ctx.fillStyle=color; ctx.beginPath(); ctx.arc(X(x),Y(y),r||5,0,7); ctx.fill();
  ctx.strokeStyle='#fff'; ctx.lineWidth=1.5; ctx.stroke(); ctx.restore();
}
function fmt(x,d){ if(!isFinite(x)) return '—'; d=d==null?3:d; return Number(x).toFixed(d); }
function fmtSci(x,d){ if(!isFinite(x)) return '—'; d=d==null?3:d; return Number(x).toExponential(d).replace('e+','e'); }

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

  const wanted = location.hash && document.querySelector(location.hash + '.chapter')
    ? location.hash.slice(1)
    : (document.querySelector('.chapter.active') || document.querySelector('.chapter')).id;
  showChapter(wanted, {keepScroll:true});
});








/* =====================================================================
   CHAPTER 2
   ===================================================================== */









