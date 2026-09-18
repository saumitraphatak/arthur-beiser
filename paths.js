/* =====================================================================
   Concepts of Modern Physics — routes through the book

   The chapters are in the order Beiser wrote them, which is not always
   the order an argument runs in. A route is a short sequence of modules
   that answers one question, with a line for each step saying why it is
   next. Once a route is running, a bar at the bottom of the page keeps
   your place in it while you read, so the route is something you travel
   rather than a list you look at.

   Steps carry only a card id and a reason; the titles are read off the
   cards themselves at open time, so renaming a module cannot leave a
   stale title here.
   ===================================================================== */
const PATH_KEY = 'beiser-path';
const PATHS = [
  {
    id:'atom',
    title:'The road to the atom',
    blurb:'Why matter is stable at all, and why it emits fixed wavelengths. Nine modules, in the order the argument was actually made.',
    steps:[
      {card:'ch4-m1', why:'Start where the nucleus was found: almost all the mass in almost none of the volume.'},
      {card:'ch4-m2', why:'That picture is fatal in classical physics — an orbiting charge radiates and falls in within 10⁻¹¹ s.'},
      {card:'ch2-m1', why:'The way out had already been found somewhere else entirely: energy comes in quanta.'},
      {card:'ch2-m2', why:'And the quantum is a particle, with the photoelectric effect settling it.'},
      {card:'ch3-m1', why:'De Broglie turns the argument around: if a wave is a particle, a particle is a wave.'},
      {card:'ch4-m4', why:'Now the orbit is a standing wave, and only whole numbers of wavelengths fit. That is the quantisation.'},
      {card:'ch4-m5', why:'Fixed orbits give fixed energies, and the differences between them are the spectral lines.'},
      {card:'ch4-m8', why:'Step back: every number you have just derived is mc² times a power of one constant.'},
      {card:'ch4-m7', why:'Finish with the experiment that confirmed the levels without using light at all.'}
    ]
  },
  {
    id:'why',
    title:'Why quantum mechanics had to happen',
    blurb:'Seven experiments and arguments that classical physics could not absorb, in the order they closed off the alternatives.',
    steps:[
      {card:'ch2-m1', why:'The ultraviolet catastrophe: classical thermodynamics predicts infinite energy from a warm object.'},
      {card:'ch2-m2', why:'Light knocks electrons out by frequency, not by brightness — energy arrives in lumps.'},
      {card:'ch2-m4', why:'And those lumps carry momentum, which a wave alone cannot explain.'},
      {card:'ch3-m3', why:'Then electrons diffract off a crystal. The particle is a wave too.'},
      {card:'ch4-m2', why:'Meanwhile the classical atom cannot survive a nanosecond.'},
      {card:'ch3-m6', why:'Being both means you cannot have position and momentum sharply at once — and that is a theorem, not a limitation of instruments.'},
      {card:'ch5-m1', why:'So what is left to describe a particle with? A wave function, and the rules for reading it.'}
    ]
  },
  {
    id:'exam',
    title:'One hour before the exam',
    blurb:'The twelve modules that carry the most of the book per minute spent. Formulas you will be asked to use, in the order they build.',
    steps:[
      {card:'ch1-m2', why:'Time dilation: γ, and which clock is the proper one.'},
      {card:'ch1-m7', why:'E = γmc², and where the classical ½mv² went.'},
      {card:'ch2-m2', why:'hν = φ + KEmax, and the threshold frequency.'},
      {card:'ch2-m4', why:'The Compton shift, and why it is a wavelength difference rather than a ratio.'},
      {card:'ch3-m1', why:'λ = h/p, with the relativistic p when it matters.'},
      {card:'ch3-m6', why:'ΔxΔp ≥ ħ/2, and the energy–time version you will need for line widths.'},
      {card:'ch5-m2', why:'Particle in a box: the n² ladder, straight from the boundary conditions.'},
      {card:'ch5-m4', why:'Tunnelling, and the exponential that dominates every estimate.'},
      {card:'ch6-m1', why:'n, ℓ, mℓ, and which combinations are allowed.'},
      {card:'ch7-m2', why:'The exclusion principle, and the 2n² that follows from it.'},
      {card:'ch11-m3', why:'Mass defect and binding energy per nucleon, with the curve.'},
      {card:'ch12-m2', why:'The decay law, half-life against mean life, and activity.'}
    ]
  },
  {
    id:'tunnel',
    title:'Tunnelling, all the way down',
    blurb:'One piece of quantum mechanics, followed into four places where it is the whole explanation.',
    steps:[
      {card:'ch5-m4', why:'The effect itself: a particle gets through a barrier it has no business getting through.'},
      {card:'ch12-m4', why:'Alpha decay is tunnelling, and the exponential is why half-lives span twenty-four decades.'},
      {card:'ch12-m8', why:'Fusion is tunnelling from the other side — the Sun runs well below its own Coulomb barrier.'},
      {card:'ch10-m6', why:'And in a diode, carriers crossing a junction they could not climb.'},
      {card:'ch10-m8', why:'Finish with pairs tunnelling coherently, which is a phenomenon with no classical shadow at all.'}
    ]
  },
  {
    id:'energy',
    title:'Where the energy comes from',
    blurb:'Follow mass–energy from a formula in Chapter 1 to the reason a star shines and the reason you weigh what you do.',
    steps:[
      {card:'ch1-m7', why:'E = mc² is not about bombs; it is a statement that mass is a form of energy.'},
      {card:'ch11-m3', why:'So a bound nucleus weighs less than its parts, and the difference is the binding energy.'},
      {card:'ch11-m4', why:'The liquid-drop model says why the curve has the shape it has, term by term.'},
      {card:'ch12-m7', why:'Past iron, splitting releases energy — and the model tells you which nuclei will.'},
      {card:'ch12-m8', why:'Before iron, joining does. This is where almost all the energy in the universe comes from.'},
      {card:'ch13-m5', why:'The last turn: the quarks account for about 2% of a proton. The rest of your mass is field energy.'}
    ]
  },
  {
    id:'pauli',
    title:'What one antisymmetry does',
    blurb:'The exclusion principle is a statement about swapping two labels. Follow what it holds up.',
    steps:[
      {card:'ch7-m1', why:'First, spin: an angular momentum with no classical rotation under it.'},
      {card:'ch7-m2', why:'Then the principle, as what it really is — a wave function that changes sign when two identical particles are swapped.'},
      {card:'ch7-m3', why:'It builds the periodic table. Chemistry is a filing rule.'},
      {card:'ch9-m3', why:'It splits statistical mechanics in two: what can share a state and what cannot.'},
      {card:'ch9-m6', why:'It stacks electrons in a metal into a sea electron-volts deep, cold as the metal may be.'},
      {card:'ch10-m4', why:'Filling bands, it decides conductor from insulator.'},
      {card:'ch11-m6', why:'And filling nuclear shells, it gives the magic numbers.'}
    ]
  }
];

let _pathState = null;     // {id, i} or null
let _pathWired = false;

function loadPath(){
  try{
    const raw = localStorage.getItem(PATH_KEY);
    if(!raw) return null;
    const p = JSON.parse(raw);
    return pathById(p.id) ? p : null;
  }catch(e){ return null; }
}
function savePath(){
  try{
    if(_pathState) localStorage.setItem(PATH_KEY, JSON.stringify(_pathState));
    else localStorage.removeItem(PATH_KEY);
  }catch(e){ /* private browsing; the route still works for this session */ }
}
function pathById(id){ return PATHS.find(p=>p.id===id) || null; }
function pathChapterOf(card){ return card.split('-')[0]; }
function pathCardTitle(card){
  const el = document.getElementById(card);
  const h = el && el.querySelector('h2');
  return h ? h.childNodes[0].textContent.trim() : card;
}

/* ---- the panel ---- */
function buildPathList(){
  const body = document.getElementById('path-body');
  if(!body) return;
  body.innerHTML = PATHS.map(p=>{
    const done = p.steps.filter(s=>PROGRESS[s.card]).length;
    const steps = p.steps.map((s,i)=>
      `<button type="button" class="path-step${PROGRESS[s.card]?' done':''}" data-path="${p.id}" data-i="${i}">
         <span class="ps-n">${i+1}</span>
         <span class="ps-t">${pathCardTitle(s.card)}</span>
         <span class="ps-w">${s.why}</span>
       </button>`).join('');
    // Six routes and forty-six steps is a lot of page to scroll past, so the
    // steps stay folded away until someone wants to see where a route goes.
    return `<div class="path-card">
      <h4>${p.title} <span class="path-count">${p.steps.length} modules${done?` · ${done} already marked understood`:''}</span></h4>
      <p class="path-blurb">${p.blurb}</p>
      <div class="path-acts">
        <button type="button" class="path-start" data-path="${p.id}">start this route</button>
        <button type="button" class="path-toggle" data-path="${p.id}">see the ${p.steps.length} steps</button>
      </div>
      <div class="path-steps" id="path-steps-${p.id}" hidden>${steps}</div>
    </div>`;
  }).join('');
  body.querySelectorAll('.path-step').forEach(b=>{
    b.addEventListener('click', ()=>{
      startPath(b.dataset.path, parseInt(b.dataset.i,10));
    });
  });
  body.querySelectorAll('.path-start').forEach(b=>{
    b.addEventListener('click', ()=>startPath(b.dataset.path, 0));
  });
  body.querySelectorAll('.path-toggle').forEach(b=>{
    b.addEventListener('click', ()=>{
      const box = document.getElementById('path-steps-'+b.dataset.path);
      const p = pathById(b.dataset.path);
      box.hidden = !box.hidden;
      b.textContent = box.hidden ? `see the ${p.steps.length} steps` : 'hide the steps';
    });
  });
}
function openPaths(){
  const ov=document.getElementById('path-overlay');
  if(!ov) return;
  buildPathList();                 // rebuilt each time, so the marks stay current
  ov.hidden=false;
}
function closePaths(){
  const ov=document.getElementById('path-overlay');
  if(ov) ov.hidden=true;
}

/* ---- the bar that keeps your place ---- */
function startPath(id, i){
  if(!pathById(id)) return;
  _pathState = {id, i: i||0};
  savePath();
  closePaths();
  showPathBar();
  gotoPathStep();
}
function stopPath(){
  _pathState = null;
  savePath();
  showPathBar();
}
function movePath(d){
  if(!_pathState) return;
  const p = pathById(_pathState.id);
  const n = p.steps.length;
  _pathState.i = Math.max(0, Math.min(n-1, _pathState.i + d));
  savePath();
  showPathBar();
  gotoPathStep();
}
function gotoPathStep(){
  if(!_pathState) return;
  const p = pathById(_pathState.id);
  const s = p.steps[_pathState.i];
  goToModule(pathChapterOf(s.card), s.card);
}
function showPathBar(){
  const bar=document.getElementById('path-bar');
  if(!bar) return;
  document.body.classList.toggle('has-path', !!_pathState);
  if(!_pathState){ bar.hidden = true; return; }
  const p = pathById(_pathState.id), s = p.steps[_pathState.i], n = p.steps.length;
  bar.hidden = false;
  document.getElementById('path-bar-title').textContent = `${p.title} — ${_pathState.i+1} of ${n}`;
  document.getElementById('path-bar-why').textContent = s.why;
  document.getElementById('path-prev').disabled = (_pathState.i===0);
  document.getElementById('path-next').disabled = (_pathState.i===n-1);
  // a thin fill across the top of the bar, so progress is visible without reading
  bar.style.setProperty('--path-frac', ((_pathState.i+1)/n*100).toFixed(1)+'%');
}

function initPaths(){
  const open=document.getElementById('path-open'), close=document.getElementById('path-close'),
        ov=document.getElementById('path-overlay');
  if(open) open.addEventListener('click', openPaths);
  if(close) close.addEventListener('click', closePaths);
  if(ov) ov.addEventListener('click', e=>{ if(e.target===ov) closePaths(); });
  if(!_pathWired){
    _pathWired = true;
    const prev=document.getElementById('path-prev'), next=document.getElementById('path-next'),
          quit=document.getElementById('path-quit'), jump=document.getElementById('path-bar-title');
    if(prev) prev.addEventListener('click', ()=>movePath(-1));
    if(next) next.addEventListener('click', ()=>movePath(1));
    if(quit) quit.addEventListener('click', stopPath);
    if(jump) jump.addEventListener('click', openPaths);
  }
  _pathState = loadPath();
  showPathBar();
}
