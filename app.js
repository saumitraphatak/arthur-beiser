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

// ---------- tab switching ----------
const drawFns = {};
function registerCanvas(id, fn){ drawFns[id] = fn; }
function redrawVisible(){
  const active = document.querySelector('.chapter.active');
  if(!active) return;
  // Each canvas is drawn in its own try/catch: one module throwing must never
  // stop the rest of the page from rendering (previously a single error here
  // aborted the whole forEach, so everything after the failing canvas in DOM
  // order stayed blank).
  active.querySelectorAll('canvas').forEach(cv=>{
    const fn = drawFns[cv.id];
    if(!fn) return;
    try{ fn(); }
    catch(err){ console.error(`[arthur-beiser] draw failed for #${cv.id}:`, err); }
  });
}
document.querySelectorAll('.tab-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.chapter').forEach(c=>c.classList.remove('active'));
    document.getElementById(btn.dataset.chapter).classList.add('active');
    requestAnimationFrame(redrawVisible);
  });
});
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
  // Each module's setup runs in its own try/catch. Previously these ran as one
  // unguarded sequence, so if any single setupX() threw, every module after it
  // in this list never got its event listeners wired up at all. Isolating them
  // means one broken module can only ever take itself down, never the rest of
  // the page.
  const modules = [
    ['setupMichelsonMorley', setupMichelsonMorley],
    ['setupTimeDilation', setupTimeDilation],
    ['setupLengthContraction', setupLengthContraction],
    ['setupVelocityAddition', setupVelocityAddition],
    ['setupDoppler', setupDoppler],
    ['setupTwinParadox', setupTwinParadox],
    ['setupKEMomentum', setupKEMomentum],
    ['setupMinkowski', setupMinkowski],
    ['setupBlackbody', setupBlackbody],
    ['setupPhotoelectric', setupPhotoelectric],
    ['setupXrayProduction', setupXrayProduction],
    ['setupBragg', setupBragg],
    ['setupCompton', setupCompton],
    ['setupPairProduction', setupPairProduction],
    ['setupAttenuation', setupAttenuation],
    ['setupGravRedshift', setupGravRedshift],
  ];
  modules.forEach(([name, fn])=>{
    try{ fn(); }
    catch(err){ console.error(`[arthur-beiser] ${name}() failed to initialize:`, err); }
  });
  redrawVisible();
});

/* =====================================================================
   1. LIGHT CLOCK / TIME DILATION
   ===================================================================== */
function setupTimeDilation(){
  const canvas = document.getElementById('td_canvas');
  const betaEl = document.getElementById('td_beta');
  const betaVal = document.getElementById('td_beta_val');
  const speedEl = document.getElementById('td_speed');
  const readout = document.getElementById('td_readout');
  let dims = fitCanvas(canvas);
  let simT = 0; // ground-frame time, seconds (sim units)
  const T0 = 1.0; // proper period, sim-seconds
  let trailBottom = [];
  let lastFrame = performance.now();

  function refit(){ dims = fitCanvas(canvas); }
  registerCanvas('td_canvas', refit);

  function loop(now){
    const dtReal = Math.min(0.05,(now-lastFrame)/1000); lastFrame = now;
    const active = document.getElementById('ch1').classList.contains('active');
    if(active){
      const speed = parseFloat(speedEl.value);
      simT += dtReal*speed;
      draw();
    }
    requestAnimationFrame(loop);
  }

  function draw(){
    const {ctx,w,h} = dims;
    const beta = parseFloat(betaEl.value);
    betaVal.textContent = beta.toFixed(3);
    const gamma = 1/Math.sqrt(1-beta*beta);
    ctx.clearRect(0,0,w,h);

    const laneH = h/2;
    const mirrorMargin = 46;
    const topY0 = 18, topY1 = laneH-24;
    const botY0 = laneH+18, botY1 = h-24;

    // lane labels
    ctx.font='12px Helvetica,Arial,sans-serif'; ctx.fillStyle='#5a5d63'; ctx.textAlign='left';
    ctx.fillText('Clock at rest (proper frame)', 10, 12);
    ctx.fillText('Same clock moving at βc, seen from the ground', 10, laneH+12);

    // draw mirrors
    function mirrors(y0,y1,xL,xR){
      ctx.strokeStyle='#c7c2b5'; ctx.lineWidth=3;
      ctx.beginPath(); ctx.moveTo(xL,y0); ctx.lineTo(xR,y0); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(xL,y1); ctx.lineTo(xR,y1); ctx.stroke();
    }
    mirrors(topY0,topY1, mirrorMargin, w-mirrorMargin);

    // top clock: bounces at rest, x fixed
    const xTop = w/2;
    const phaseTop = (simT/T0);
    const yTop = topY0 + (topY1-topY0)*Math.abs(Math.sin(Math.PI*phaseTop));
    ctx.fillStyle = '#a4342c';
    ctx.beginPath(); ctx.arc(xTop,yTop,7,0,7); ctx.fill();
    const ticksTop = Math.floor(simT/T0);

    // bottom clock: moving at beta*c (scaled), bounce period = gamma*T0 (ground time per tick)
    const Tmoving = gamma*T0;
    const phaseBot = simT/Tmoving;
    const yBot = botY0 + (botY1-botY0)*Math.abs(Math.sin(Math.PI*phaseBot));
    const laneWidth = (w-2*mirrorMargin);
    const speedPxPerSec = 90*beta + 4; // visual drift speed, scaled for viewing
    const xBot = mirrorMargin + ((simT*speedPxPerSec) % laneWidth);
    mirrors(botY0,botY1, mirrorMargin, w-mirrorMargin);

    trailBottom.push({x:xBot,y:yBot});
    if(trailBottom.length>70) trailBottom.shift();
    // break trail where it wraps around
    ctx.strokeStyle='rgba(31,111,120,0.35)'; ctx.lineWidth=1.5;
    ctx.beginPath();
    let started=false;
    for(let i=0;i<trailBottom.length;i++){
      const p=trailBottom[i];
      if(i>0 && Math.abs(p.x-trailBottom[i-1].x)>laneWidth*0.5){ started=false; }
      if(!started){ ctx.moveTo(p.x,p.y); started=true; } else ctx.lineTo(p.x,p.y);
    }
    ctx.stroke();

    ctx.fillStyle = '#1f6f78';
    ctx.beginPath(); ctx.arc(xBot,yBot,7,0,7); ctx.fill();
    const ticksBot = Math.floor(simT/Tmoving);

    readout.innerHTML = `
      <div>&beta; = v/c <b>${fmt(beta,3)}</b></div>
      <div>&gamma; <b>${fmt(gamma,4)}</b></div>
      <div>Ground-frame time per tick <b>${fmt(Tmoving,3)} T&#8320;</b></div>
      <div>Rest-clock ticks so far <b>${ticksTop}</b></div>
      <div>Moving-clock ticks so far <b>${ticksBot}</b></div>
      <div>Elapsed ground time <b>${fmt(simT,2)} T&#8320;</b></div>`;
  }
  betaEl.addEventListener('input', draw);
  speedEl.addEventListener('input', ()=>{});
  requestAnimationFrame(loop);
}

/* =====================================================================
   2. LENGTH CONTRACTION
   ===================================================================== */
function setupLengthContraction(){
  const canvas=document.getElementById('lc_canvas');
  const betaEl=document.getElementById('lc_beta'), betaVal=document.getElementById('lc_beta_val');
  const lenEl=document.getElementById('lc_len'), lenVal=document.getElementById('lc_len_val');
  const readout=document.getElementById('lc_readout');
  function draw(){
    const {ctx,w,h}=fitCanvas(canvas);
    const beta=parseFloat(betaEl.value), L0=parseFloat(lenEl.value);
    betaVal.textContent=beta.toFixed(3); lenVal.textContent=L0.toFixed(0);
    const gamma=1/Math.sqrt(1-beta*beta);
    const L = L0/gamma;
    ctx.clearRect(0,0,w,h);

    const barAreaH = h*0.42;
    const scale = (w-140)/60; // px per metre, max L0=50
    const barX0 = 70;

    ctx.font='12px Helvetica,Arial,sans-serif'; ctx.textAlign='left'; ctx.fillStyle='#5a5d63';
    ctx.fillText('Proper length L₀ (rest frame)', barX0, 16);
    ctx.fillStyle='#a4342c';
    ctx.fillRect(barX0, 24, L0*scale, 20);
    ctx.fillStyle='#1c1d20'; ctx.fillText(`${L0.toFixed(1)} m`, barX0+L0*scale+8, 39);

    ctx.fillStyle='#5a5d63';
    ctx.fillText('Length measured from the ground, moving at βc', barX0, 66);
    ctx.fillStyle='#1f6f78';
    ctx.fillRect(barX0, 74, L*scale, 20);
    ctx.fillStyle='#1c1d20'; ctx.fillText(`${L.toFixed(2)} m`, barX0+L*scale+8, 89);

    // curve L/L0 vs beta
    const m={l:56,r:20,t:20,b:34};
    const plotTop = barAreaH+30;
    ctx.save(); ctx.translate(0,plotTop);
    const {X,Y}=drawAxes(ctx, w, h-plotTop-4, m, 0,0.999,0,1,'β = v/c','L/L₀',{ny:4});
    const pts=[]; for(let b=0;b<=0.999;b+=0.005){ pts.push({x:b,y:Math.sqrt(1-b*b)}); }
    plotLine(ctx,X,Y,pts,'#a4342c',2.2);
    dotAt(ctx,X,Y,beta,Math.sqrt(1-beta*beta),'#1f6f78',5.5);
    ctx.restore();

    readout.innerHTML = `
      <div>&beta; <b>${fmt(beta,3)}</b></div>
      <div>&gamma; <b>${fmt(gamma,4)}</b></div>
      <div>L / L&#8320; <b>${fmt(L/L0,4)}</b></div>
      <div>Contraction <b>${fmt((1-L/L0)*100,2)}%</b></div>`;
  }
  betaEl.addEventListener('input',draw); lenEl.addEventListener('input',draw);
  registerCanvas('lc_canvas',draw);
}

/* =====================================================================
   3. VELOCITY ADDITION
   ===================================================================== */
function setupVelocityAddition(){
  const canvas=document.getElementById('va_canvas');
  const vEl=document.getElementById('va_v'), vVal=document.getElementById('va_v_val');
  const uEl=document.getElementById('va_u'), uVal=document.getElementById('va_u_val');
  const readout=document.getElementById('va_readout');
  function draw(){
    const {ctx,w,h}=fitCanvas(canvas);
    const v=parseFloat(vEl.value), u=parseFloat(uEl.value);
    vVal.textContent=v.toFixed(2); uVal.textContent=u.toFixed(2);
    const classical = u+v;
    const rel = (u+v)/(1+u*v);
    ctx.clearRect(0,0,w,h);
    const m={l:30,r:30,t:28,b:34};
    const xmin=-2.1,xmax=2.1;
    const X = x => m.l + (x-xmin)/(xmax-xmin)*(w-m.l-m.r);
    const yAxis = h-m.b-30;

    // forbidden zones
    ctx.fillStyle='rgba(164,52,44,0.08)';
    ctx.fillRect(X(1), m.t, X(xmax)-X(1), yAxis-m.t+30);
    ctx.fillRect(X(xmin), m.t, X(-1)-X(xmin), yAxis-m.t+30);

    // axis line
    ctx.strokeStyle='#1c1d20'; ctx.lineWidth=1.3;
    ctx.beginPath(); ctx.moveTo(m.l,yAxis); ctx.lineTo(w-m.r,yAxis); ctx.stroke();
    ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle='#5a5d63'; ctx.textAlign='center';
    [-2,-1,0,1,2].forEach(t=>{
      ctx.beginPath(); ctx.moveTo(X(t),yAxis-6); ctx.lineTo(X(t),yAxis+6); ctx.stroke();
      ctx.fillText(t===0?'0':(t===1?'c':(t===-1?'−c':(t+'c'))), X(t), yAxis+22);
    });
    ctx.strokeStyle='#a4342c'; ctx.setLineDash([4,3]);
    ctx.beginPath(); ctx.moveTo(X(1),m.t); ctx.lineTo(X(1),yAxis+8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(X(-1),m.t); ctx.lineTo(X(-1),yAxis+8); ctx.stroke();
    ctx.setLineDash([]);

    function marker(x,color,label,dy){
      const px=Math.max(m.l,Math.min(w-m.r,X(x)));
      ctx.fillStyle=color;
      ctx.beginPath(); ctx.moveTo(px,yAxis-dy); ctx.lineTo(px-6,yAxis-dy-11); ctx.lineTo(px+6,yAxis-dy-11); ctx.closePath(); ctx.fill();
      ctx.textAlign='center'; ctx.fillText(label, px, yAxis-dy-16);
    }
    marker(v, '#8a8d92', `v=${v.toFixed(2)}c`, 46);
    marker(classical, Math.abs(classical)>1?'#a4342c':'#8a8d92', `classical u′+v=${classical.toFixed(2)}c`, 68);
    marker(rel, '#1f6f78', `relativistic u=${rel.toFixed(3)}c`, 24);

    readout.innerHTML = `
      <div>v <b>${fmt(v,3)}c</b></div>
      <div>u&prime; <b>${fmt(u,3)}c</b></div>
      <div>classical u&prime;+v <b>${fmt(classical,3)}c</b> ${Math.abs(classical)>1?'<span class="badge no">exceeds c</span>':''}</div>
      <div>relativistic u <b>${fmt(rel,4)}c</b> <span class="badge ok">&lt; c always</span></div>`;
  }
  vEl.addEventListener('input',draw); uEl.addEventListener('input',draw);
  registerCanvas('va_canvas',draw);
}

/* =====================================================================
   4. DOPPLER EFFECT / HUBBLE REDSHIFT
   ===================================================================== */
function setupDoppler(){
  const canvas=document.getElementById('dp_canvas');
  const betaEl=document.getElementById('dp_beta'), betaVal=document.getElementById('dp_beta_val');
  const lamEl=document.getElementById('dp_lam'), lamVal=document.getElementById('dp_lam_val');
  const distEl=document.getElementById('dp_dist'), distVal=document.getElementById('dp_dist_val');
  const readout=document.getElementById('dp_readout');
  const swSrc=document.getElementById('dp_swatch_src'), swObs=document.getElementById('dp_swatch_obs');
  const H0 = 21; // km/s per 1e6 ly (as given in the text)

  distEl.addEventListener('input', ()=>{
    const d = parseFloat(distEl.value); // in units of 1e6 ly
    const vRecession = H0*d; // km/s
    const beta = vRecession/299792.458;
    betaEl.value = Math.min(0.9, beta).toFixed(4);
    draw();
  });

  function draw(){
    const {ctx,w,h}=fitCanvas(canvas);
    const beta=parseFloat(betaEl.value), lam0=parseFloat(lamEl.value);
    const dist=parseFloat(distEl.value);
    betaVal.textContent=beta.toFixed(3); lamVal.textContent=lam0.toFixed(0); distVal.textContent=dist.toFixed(0);
    const factor = Math.sqrt((1+beta)/(1-beta));
    const lamObs = lam0*factor;
    ctx.clearRect(0,0,w,h);

    const barY=h*0.25, barH=h*0.3;
    const lamMin=380, lamMax=750;
    const gradSteps=60;
    for(let i=0;i<gradSteps;i++){
      const l0 = lamMin + i*(lamMax-lamMin)/gradSteps;
      const l1 = lamMin + (i+1)*(lamMax-lamMin)/gradSteps;
      ctx.fillStyle = wavelengthToColor((l0+l1)/2);
      const x0 = (l0-lamMin)/(lamMax-lamMin)*(w-60)+30;
      const x1 = (l1-lamMin)/(lamMax-lamMin)*(w-60)+30;
      ctx.fillRect(x0,barY,x1-x0+1,barH);
    }
    function xOf(l){ const lc=Math.max(lamMin,Math.min(lamMax,l)); return (lc-lamMin)/(lamMax-lamMin)*(w-60)+30; }
    ctx.strokeStyle='#1c1d20'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(xOf(lam0),barY-10); ctx.lineTo(xOf(lam0),barY+barH+10); ctx.stroke();
    ctx.font='11px Helvetica,Arial,sans-serif'; ctx.textAlign='center'; ctx.fillStyle='#1c1d20';
    ctx.fillText('source λ₀', xOf(lam0), barY-14);

    ctx.strokeStyle='#a4342c'; ctx.setLineDash([5,3]); ctx.lineWidth=2.4;
    ctx.beginPath(); ctx.moveTo(xOf(lamObs),barY-10); ctx.lineTo(xOf(lamObs),barY+barH+10); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle='#a4342c'; ctx.fillText(`observed λ`, xOf(lamObs), barY+barH+26);

    swSrc.style.background = wavelengthToColor(lam0);
    swObs.style.background = lamObs>750||lamObs<380 ? '#333' : wavelengthToColor(lamObs);

    readout.innerHTML = `
      <div>&beta; <b>${fmt(beta,4)}</b> ${beta>=0?'(receding)':'(approaching)'}</div>
      <div>&lambda;&#8320; <b>${fmt(lam0,0)} nm</b></div>
      <div>&lambda;<sub>obs</sub> <b>${fmt(lamObs,1)} nm</b> ${lamObs>750?'<span class="badge no">outside visible (IR)</span>':(lamObs<380?'<span class="badge no">outside visible (UV)</span>':'')}</div>
      <div>&Delta;&lambda;/&lambda;&#8320; <b>${fmt((lamObs-lam0)/lam0*100,2)}%</b></div>
      <div>Hubble distance <b>${fmt(dist,0)}&times;10&#8310; ly</b></div>
      <div>implied recession speed <b>${fmt(H0*dist,0)} km/s</b></div>`;
  }
  betaEl.addEventListener('input',draw); lamEl.addEventListener('input',draw);
  registerCanvas('dp_canvas',draw);
}

/* =====================================================================
   5. TWIN PARADOX
   ===================================================================== */
function setupTwinParadox(){
  const canvas=document.getElementById('tw_canvas');
  const betaEl=document.getElementById('tw_beta'), betaVal=document.getElementById('tw_beta_val');
  const distEl=document.getElementById('tw_dist'), distVal=document.getElementById('tw_dist_val');
  const ageEl=document.getElementById('tw_age'), ageVal=document.getElementById('tw_age_val');
  const readout=document.getElementById('tw_readout');
  function draw(){
    const {ctx,w,h}=fitCanvas(canvas);
    const beta=parseFloat(betaEl.value), D=parseFloat(distEl.value), age0=parseFloat(ageEl.value);
    betaVal.textContent=beta.toFixed(2); distVal.textContent=D.toFixed(0); ageVal.textContent=age0.toFixed(0);
    const gamma=1/Math.sqrt(1-beta*beta);
    const Tearth = 2*D/beta;
    const Ttrav = Tearth/gamma;
    ctx.clearRect(0,0,w,h);

    const m={l:56,r:20,t:20,b:40};
    const xmax = D*1.25, ymax=Tearth*1.12;
    const {X,Y} = drawAxes(ctx,w,h,m,0,xmax,0,ymax,'x (light-years)','ct (years)',{nx:4,ny:5});

    // light cone
    plotLine(ctx,X,Y,[{x:0,y:0},{x:xmax,y:xmax}], '#c7c2b5',1.5,[4,3]);

    // earth worldline
    plotLine(ctx,X,Y,[{x:0,y:0},{x:0,y:Tearth}], '#1f6f78', 3);
    // traveler worldline
    plotLine(ctx,X,Y,[{x:0,y:0},{x:D,y:D/beta},{x:0,y:Tearth}], '#a4342c', 3);

    dotAt(ctx,X,Y,D,D/beta,'#a4342c',5);
    dotAt(ctx,X,Y,0,Tearth,'#1f6f78',5);
    ctx.font='11px Helvetica,Arial,sans-serif'; ctx.textAlign='left'; ctx.fillStyle='#1c1d20';
    ctx.fillText(`turnaround: earth t=${fmt(D/beta,1)} yr`, X(D)+8, Y(D/beta)-6);
    ctx.fillText(`Dick's proper time so far: ${fmt((D/beta)*Math.sqrt(1-beta*beta),1)} yr`, X(D)+8, Y(D/beta)+12);
    ctx.textAlign='right';
    ctx.fillText(`reunion: Jane ${fmt(age0+Tearth,1)} yr old`, X(0)-8, Y(Tearth)-8);
    ctx.fillText(`Dick ${fmt(age0+Ttrav,1)} yr old`, X(0)-8, Y(Tearth)+8);

    readout.innerHTML = `
      <div>&gamma; <b>${fmt(gamma,3)}</b></div>
      <div>Earth-frame trip time <b>${fmt(Tearth,2)} yr</b></div>
      <div>Traveler's proper time <b>${fmt(Ttrav,2)} yr</b></div>
      <div>Age difference on return <b>${fmt(Tearth-Ttrav,2)} yr</b></div>
      <div>Jane's final age <b>${fmt(age0+Tearth,1)}</b></div>
      <div>Dick's final age <b>${fmt(age0+Ttrav,1)}</b></div>`;
  }
  [betaEl,distEl,ageEl].forEach(el=>el.addEventListener('input',draw));
  registerCanvas('tw_canvas',draw);
}

/* =====================================================================
   6. KINETIC ENERGY & MOMENTUM
   ===================================================================== */
function setupKEMomentum(){
  const cKE=document.getElementById('ke_canvas_ke'), cP=document.getElementById('ke_canvas_p');
  const betaEl=document.getElementById('ke_beta'), betaVal=document.getElementById('ke_beta_val');
  const partEl=document.getElementById('ke_particle');
  const readout=document.getElementById('ke_readout');
  function draw(){
    const beta=parseFloat(betaEl.value); betaVal.textContent=beta.toFixed(3);
    const mc2 = parseFloat(partEl.value); // MeV
    const gamma=1/Math.sqrt(1-beta*beta);

    // KE plot
    {
      const {ctx,w,h}=fitCanvas(cKE);
      const m={l:52,r:16,t:22,b:34};
      const {X,Y}=drawAxes(ctx,w,h,m,0,1,0,3,'β = v/c','KE / mc²',{ny:3});
      const cl=[],rl=[];
      for(let b=0;b<=0.999;b+=0.004){
        cl.push({x:b,y:0.5*b*b});
        rl.push({x:b,y:1/Math.sqrt(1-b*b)-1});
      }
      plotLine(ctx,X,Y,cl,'#8a8d92',2,[5,3]);
      plotLine(ctx,X,Y,rl,'#a4342c',2.4);
      const keC=0.5*beta*beta, keR=gamma-1;
      dotAt(ctx,X,Y,beta,Math.min(3,keC),'#8a8d92',4.5);
      dotAt(ctx,X,Y,beta,Math.min(3,keR),'#a4342c',4.5);
      ctx.font='11px Helvetica,Arial,sans-serif'; ctx.textAlign='left';
      ctx.fillStyle='#8a8d92'; ctx.fillText('classical ½mυ²',m.l+8,m.t+14);
      ctx.fillStyle='#a4342c'; ctx.fillText('relativistic (γ−1)mc²',m.l+8,m.t+30);
    }
    // p plot
    {
      const {ctx,w,h}=fitCanvas(cP);
      const m={l:52,r:16,t:22,b:34};
      const {X,Y}=drawAxes(ctx,w,h,m,0,1,0,4,'β = v/c','p / (mc)',{ny:4});
      const cl=[],rl=[];
      for(let b=0;b<=0.999;b+=0.004){ cl.push({x:b,y:b}); rl.push({x:b,y:b/Math.sqrt(1-b*b)}); }
      plotLine(ctx,X,Y,cl,'#8a8d92',2,[5,3]);
      plotLine(ctx,X,Y,rl,'#1f6f78',2.4);
      dotAt(ctx,X,Y,beta,Math.min(4,beta),'#8a8d92',4.5);
      dotAt(ctx,X,Y,beta,Math.min(4,gamma*beta),'#1f6f78',4.5);
      ctx.font='11px Helvetica,Arial,sans-serif'; ctx.textAlign='left';
      ctx.fillStyle='#8a8d92'; ctx.fillText('classical mυ',m.l+8,m.t+14);
      ctx.fillStyle='#1f6f78'; ctx.fillText('relativistic γmυ',m.l+8,m.t+30);
    }
    const keC_MeV=0.5*beta*beta*mc2, keR_MeV=(gamma-1)*mc2;
    const pC_MeV=beta*mc2, pR_MeV=gamma*beta*mc2;
    readout.innerHTML = `
      <div>&gamma; <b>${fmt(gamma,4)}</b></div>
      <div>KE classical <b>${fmt(keC_MeV,3)} MeV</b></div>
      <div>KE relativistic <b>${fmt(keR_MeV,3)} MeV</b></div>
      <div>understatement <b>${fmt((1-keC_MeV/keR_MeV)*100,1)}%</b></div>
      <div>p classical <b>${fmt(pC_MeV,3)} MeV/c</b></div>
      <div>p relativistic <b>${fmt(pR_MeV,3)} MeV/c</b></div>`;
  }
  betaEl.addEventListener('input',draw); partEl.addEventListener('change',draw);
  registerCanvas('ke_canvas_ke',draw); registerCanvas('ke_canvas_p',draw);
}

/* =====================================================================
   7. MINKOWSKI DIAGRAM
   ===================================================================== */
function setupMinkowski(){
  const canvas=document.getElementById('mk_canvas');
  const betaEl=document.getElementById('mk_beta'), betaVal=document.getElementById('mk_beta_val');
  const readout=document.getElementById('mk_readout');
  function draw(){
    const {ctx,w,h}=fitCanvas(canvas);
    const beta=parseFloat(betaEl.value); betaVal.textContent=beta.toFixed(2);
    const gamma=1/Math.sqrt(1-beta*beta);
    ctx.clearRect(0,0,w,h);
    const R=6;
    const m={l:36,r:16,t:16,b:16};
    const cx = m.l+(w-m.l-m.r)/2, cy=m.t+(h-m.t-m.b)/2;
    const scale = Math.min(w-m.l-m.r,h-m.t-m.b)/(2*R);
    const X = x => cx + x*scale, Y = y => cy - y*scale;

    // faint grid
    ctx.strokeStyle='#eee9de'; ctx.lineWidth=1;
    for(let i=-R;i<=R;i++){
      ctx.beginPath(); ctx.moveTo(X(i),Y(-R)); ctx.lineTo(X(i),Y(R)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(X(-R),Y(i)); ctx.lineTo(X(R),Y(i)); ctx.stroke();
    }
    // light cone
    ctx.strokeStyle='#c7c2b5'; ctx.setLineDash([5,3]); ctx.lineWidth=1.6;
    plotLine(ctx,X,Y,[{x:-R,y:-R},{x:R,y:R}],'#c7c2b5',1.6,[5,3]);
    plotLine(ctx,X,Y,[{x:-R,y:R},{x:R,y:-R}],'#c7c2b5',1.6,[5,3]);
    ctx.setLineDash([]);

    // S axes
    ctx.strokeStyle='#1c1d20'; ctx.lineWidth=1.6;
    plotLine(ctx,X,Y,[{x:-R,y:0},{x:R,y:0}],'#1c1d20',1.6);
    plotLine(ctx,X,Y,[{x:0,y:-R},{x:0,y:R}],'#1c1d20',1.6);

    // constant-t' lines (parallel to x' axis), offset by k/gamma for t'=k
    [-4,-2,2,4].forEach(k=>{
      const off=k/gamma;
      plotLine(ctx,X,Y,[{x:-R,y:beta*(-R)+off},{x:R,y:beta*R+off}],'rgba(164,52,44,0.35)',1.2,[3,3]);
    });
    // x' axis (t'=0): ct = beta*x
    plotLine(ctx,X,Y,[{x:-R,y:-beta*R},{x:R,y:beta*R}],'#a4342c',2.4);
    // ct' axis (x'=0): x = beta*ct  -> ct=y, x=beta*y
    plotLine(ctx,X,Y,[{x:-beta*R,y:-R},{x:beta*R,y:R}],'#1f6f78',2.4);

    ctx.font='12px Helvetica,Arial,sans-serif'; ctx.fillStyle='#1c1d20';
    ctx.fillText('x', X(R)-14, Y(0)-8);
    ctx.fillText('ct', X(0)+8, Y(R)+14);
    ctx.fillStyle='#a4342c'; ctx.fillText("x′", X(R*0.92), Y(beta*R*0.92)-8);
    ctx.fillStyle='#1f6f78'; ctx.fillText("ct′", X(beta*R*0.92)+10, Y(R*0.92));

    readout.innerHTML = `
      <div>&beta; <b>${fmt(beta,3)}</b></div>
      <div>&gamma; <b>${fmt(gamma,4)}</b></div>
      <div>axis tilt arctan&beta; <b>${fmt(Math.atan(Math.abs(beta))*180/Math.PI,1)}&deg;</b></div>
      <div>dashed lines = events simultaneous <em>in S&prime;</em> &mdash; tilted, so not simultaneous in S</div>`;
  }
  betaEl.addEventListener('input',draw);
  registerCanvas('mk_canvas',draw);
}

/* =====================================================================
   CHAPTER 2
   ===================================================================== */

/* ---------- 1. Blackbody radiation ---------- */
function setupBlackbody(){
  const canvas=document.getElementById('bb_canvas');
  const TEl=document.getElementById('bb_T'), TVal=document.getElementById('bb_T_val');
  const rjEl=document.getElementById('bb_rj');
  const readout=document.getElementById('bb_readout');
  function planckLambda(lam_m,T){ // energy density per unit wavelength, arbitrary units (8pi hc / lam^5) is huge; keep SI
    const x = H_J*C/(lam_m*K_B*T);
    if(x>700) return 0;
    return (8*Math.PI*H_J*C/Math.pow(lam_m,5))/(Math.exp(x)-1);
  }
  function rjLambda(lam_m,T){ return 8*Math.PI*K_B*T/Math.pow(lam_m,4); }
  function draw(){
    const {ctx,w,h}=fitCanvas(canvas);
    const T=parseFloat(TEl.value); TVal.textContent=T.toFixed(0);
    const lamPeak_nm = (WIEN_B/T)*1e9;
    const xmax = Math.max(2500, lamPeak_nm*3.4);
    ctx.clearRect(0,0,w,h);
    const m={l:56,r:16,t:20,b:34};
    const peakVal = planckLambda(lamPeak_nm*1e-9, T);
    const ymax = peakVal*1.25;
    const {X,Y}=drawAxes(ctx,w,h,m,0,xmax,0,ymax,'λ (nm)','u(λ) (rel. units)',{nx:5,ny:4,yfmt:v=>fmtSci(v,1)});

    // visible band shading
    if(380<xmax){
      ctx.fillStyle='rgba(120,180,255,0.10)';
      ctx.fillRect(X(Math.min(380,xmax)), m.t, X(Math.min(750,xmax))-X(Math.min(380,xmax)), (h-m.b)-m.t);
    }
    const pts=[]; for(let l=5;l<=xmax;l+=xmax/300){ pts.push({x:l,y:planckLambda(l*1e-9,T)}); }
    plotLine(ctx,X,Y,pts,'#a4342c',2.4);
    if(rjEl.checked){
      const rjpts=[]; for(let l=5;l<=xmax;l+=xmax/300){ rjpts.push({x:l,y:Math.min(ymax*1.4,rjLambda(l*1e-9,T))}); }
      plotLine(ctx,X,Y,rjpts,'#8a8d92',2,[5,3]);
    }
    plotLine(ctx,X,Y,[{x:lamPeak_nm,y:0},{x:lamPeak_nm,y:ymax}],'#1f6f78',1.6,[3,3]);
    ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle='#1f6f78'; ctx.textAlign='left';
    ctx.fillText(`λ_peak = ${fmt(lamPeak_nm,0)} nm`, X(lamPeak_nm)+6, m.t+14);
    ctx.fillStyle='#a4342c'; ctx.fillText('Planck', m.l+8, m.t+14);
    if(rjEl.checked){ ctx.fillStyle='#8a8d92'; ctx.fillText('Rayleigh–Jeans (classical)', m.l+8, m.t+30); }

    let band='infrared';
    if(lamPeak_nm<380) band='ultraviolet'; else if(lamPeak_nm<=750) band='visible';
    readout.innerHTML = `
      <div>T <b>${fmt(T,0)} K</b></div>
      <div>&lambda;<sub>peak</sub> (Wien) <b>${fmt(lamPeak_nm,0)} nm</b></div>
      <div>peak lies in the <b>${band}</b></div>`;
  }
  TEl.addEventListener('input',draw); rjEl.addEventListener('change',draw);
  registerCanvas('bb_canvas',draw);
}

/* ---------- 2. Photoelectric effect ---------- */
function setupPhotoelectric(){
  const cIV=document.getElementById('pe_canvas_iv'), cSlope=document.getElementById('pe_canvas_slope');
  const metalEl=document.getElementById('pe_metal'), lamEl=document.getElementById('pe_lam'), lamVal=document.getElementById('pe_lam_val');
  const readout=document.getElementById('pe_readout');
  function draw(){
    const phi=parseFloat(metalEl.value);
    const lam=parseFloat(lamEl.value); lamVal.textContent=lam.toFixed(0);
    const Ephoton = HC_EV_NM/lam;
    const KEmax = Ephoton-phi;
    const nu0 = phi/H_EV; // threshold frequency, Hz
    const nu = C/(lam*1e-9);

    // IV curve
    {
      const {ctx,w,h}=fitCanvas(cIV);
      const m={l:46,r:16,t:22,b:34};
      const V0 = Math.max(0.05,KEmax);
      const {X,Y}=drawAxes(ctx,w,h,m,0,Math.max(1,V0*1.4),0,3.3,'Retarding voltage V (volts)','Photocurrent (rel.)',{nx:4,ny:3});
      [1,2,3].forEach((rel,idx)=>{
        const pts=[];
        for(let v=0; v<=V0*1.4; v+=V0*1.4/80){
          let I;
          if(KEmax<=0) I=0;
          else I = v>=V0 ? 0 : rel*Math.pow(1-v/V0,0.6);
          pts.push({x:v,y:I});
        }
        plotLine(ctx,X,Y,pts, idx===2?'#a4342c':(idx===1?'#c9776f':'#e3ada7'), 2.2);
      });
      if(KEmax>0){
        plotLine(ctx,X,Y,[{x:V0,y:0},{x:V0,y:3.3}],'#1f6f78',1.6,[4,3]);
        ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle='#1f6f78'; ctx.textAlign='left';
        ctx.fillText(`V₀=${fmt(V0,2)} V`, X(V0)+6, m.t+14);
      } else {
        ctx.font='12px Helvetica,Arial,sans-serif'; ctx.fillStyle='#a4342c'; ctx.textAlign='center';
        ctx.fillText('below threshold — no photoemission', (w+m.l)/2, (h)/2);
      }
    }
    // KEmax vs nu
    {
      const {ctx,w,h}=fitCanvas(cSlope);
      const m={l:52,r:16,t:22,b:34};
      const numin=4.0e14, numax=3.2e15;
      const {X,Y}=drawAxes(ctx,w,h,m,numin,numax,-2,6,'ν (Hz)','KE_max (eV)',{nx:3,ny:4,xfmt:v=>fmtSci(v,1)});
      plotLine(ctx,X,Y,[{x:numin,y:0},{x:numax,y:0}],'#e7e4dc',1);
      function lineFor(phiVal,color,dashed){
        const pts=[{x:numin,y:H_EV*numin-phiVal},{x:numax,y:H_EV*numax-phiVal}];
        plotLine(ctx,X,Y,pts,color,dashed?1.4:2.4,dashed?[4,3]:null);
      }
      lineFor(1.9,'#c7c2b5',true); lineFor(4.7,'#c7c2b5',true);
      lineFor(phi,'#a4342c',false);
      dotAt(ctx,X,Y,nu,Math.max(-2,Math.min(6,KEmax)),'#1f6f78',5);
      ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle='#5a5d63'; ctx.textAlign='left';
      ctx.fillText('grey dashed: Cs (φ=1.9) & Cu (φ=4.7) for reference', m.l+8, m.t+14);
    }
    readout.innerHTML = `
      <div>work function &phi; <b>${fmt(phi,2)} eV</b></div>
      <div>photon energy h&nu; <b>${fmt(Ephoton,3)} eV</b></div>
      <div>threshold &nu;&#8320; <b>${fmtSci(nu0,2)} Hz</b></div>
      <div>KE<sub>max</sub> <b>${fmt(KEmax,3)} eV</b> ${KEmax<0?'<span class="badge no">no emission</span>':'<span class="badge ok">emits</span>'}</div>
      <div>stopping voltage V&#8320; <b>${fmt(Math.max(0,KEmax),3)} V</b></div>`;
  }
  metalEl.addEventListener('change',draw); lamEl.addEventListener('input',draw);
  registerCanvas('pe_canvas_iv',draw); registerCanvas('pe_canvas_slope',draw);
}

/* ---------- 3. Compton scattering ---------- */
function setupCompton(){
  const canvas=document.getElementById('cp_canvas');
  const lamEl=document.getElementById('cp_lam'), lamVal=document.getElementById('cp_lam_val');
  const thEl=document.getElementById('cp_theta'), thVal=document.getElementById('cp_theta_val');
  const readout=document.getElementById('cp_readout');
  function draw(){
    const {ctx,w,h}=fitCanvas(canvas);
    const lam0=parseFloat(lamEl.value); lamVal.textContent=lam0.toFixed(1);
    const thetaDeg=parseFloat(thEl.value); thVal.textContent=thetaDeg.toFixed(0)+'°';
    const theta = thetaDeg*Math.PI/180;
    const dLam = LAMBDA_C_PM*(1-Math.cos(theta));
    const lam1 = lam0+dLam;
    const E0 = HC_EV_PM/lam0, E1 = HC_EV_PM/lam1;
    const KEe = E0-E1;

    ctx.clearRect(0,0,w,h);
    const ox=w*0.32, oy=h*0.56;
    // incident-photon arrow is drawn at a fixed pixel length; since p=h/lambda,
    // the scattered arrow scales relative to it as lam0/lam1 (always <= incident, since lam1>=lam0)
    const p0px = 115;
    const p1px = p0px*(lam0/lam1);
    const p0x=p0px, p0y=0;
    const p1x=p1px*Math.cos(theta), p1y=-p1px*Math.sin(theta); // scattered "up" on screen (canvas y down, so negative = up)
    const pex = p0x-p1x, pey = p0y-p1y;

    function arrow(x0,y0,x1,y1,color,label){
      ctx.strokeStyle=color; ctx.fillStyle=color; ctx.lineWidth=2.6;
      ctx.beginPath(); ctx.moveTo(x0,y0); ctx.lineTo(x1,y1); ctx.stroke();
      const ang=Math.atan2(y1-y0,x1-x0);
      ctx.beginPath(); ctx.moveTo(x1,y1);
      ctx.lineTo(x1-10*Math.cos(ang-0.35), y1-10*Math.sin(ang-0.35));
      ctx.lineTo(x1-10*Math.cos(ang+0.35), y1-10*Math.sin(ang+0.35));
      ctx.closePath(); ctx.fill();
      ctx.font='12px Helvetica,Arial,sans-serif'; ctx.textAlign='left';
      ctx.fillText(label, x1+8, y1);
    }
    // faint incoming ray extension
    ctx.strokeStyle='#e7e4dc'; ctx.setLineDash([4,3]); ctx.lineWidth=1.2;
    ctx.beginPath(); ctx.moveTo(ox-80,oy); ctx.lineTo(ox,oy); ctx.stroke(); ctx.setLineDash([]);

    arrow(ox,oy,ox+p0x,oy+p0y,'#8a8d92','incident γ (p₀)');
    arrow(ox,oy,ox+p1x,oy+p1y,'#a4342c',`scattered γ′ (θ=${thetaDeg.toFixed(0)}°)`);
    arrow(ox,oy,ox+pex,oy+pey,'#1f6f78',`recoil e⁻`);

    // target dot
    ctx.fillStyle='#1c1d20'; ctx.beginPath(); ctx.arc(ox,oy,4,0,7); ctx.fill();

    readout.innerHTML = `
      <div>&Delta;&lambda; <b>${fmt(dLam,4)} pm</b></div>
      <div>&lambda;&#8320; &rarr; &lambda;&prime; <b>${fmt(lam0,2)} &rarr; ${fmt(lam1,4)} pm</b></div>
      <div>E&#8320; (photon in) <b>${fmt(E0,1)} eV</b></div>
      <div>E&prime; (photon out) <b>${fmt(E1,1)} eV</b></div>
      <div>KE of recoil electron <b>${fmt(KEe,1)} eV</b></div>
      <div>&lambda;<sub>C</sub> (electron) <b>${LAMBDA_C_PM} pm</b></div>`;
  }
  lamEl.addEventListener('input',draw); thEl.addEventListener('input',draw);
  registerCanvas('cp_canvas',draw);
}

/* ---------- 4. Bragg diffraction ---------- */
function setupBragg(){
  const canvas=document.getElementById('bg_canvas');
  const dEl=document.getElementById('bg_d'), dVal=document.getElementById('bg_d_val');
  const lamEl=document.getElementById('bg_lam'), lamVal=document.getElementById('bg_lam_val');
  const thEl=document.getElementById('bg_theta'), thVal=document.getElementById('bg_theta_val');
  const readout=document.getElementById('bg_readout');
  function draw(){
    const {ctx,w,h}=fitCanvas(canvas);
    const d=parseFloat(dEl.value), lam=parseFloat(lamEl.value), thetaDeg=parseFloat(thEl.value);
    dVal.textContent=d.toFixed(3); lamVal.textContent=lam.toFixed(3); thVal.textContent=thetaDeg.toFixed(1)+'°';
    const theta = thetaDeg*Math.PI/180;
    const pathDiff = 2*d*Math.sin(theta);
    const ratio = pathDiff/lam;
    const n = Math.round(ratio);
    const isConstructive = n>=1 && Math.abs(ratio-n)<0.03;
    ctx.clearRect(0,0,w,h);

    // --- ray diagram (top 60%) ---
    const diagH = h*0.56;
    const planeY0 = diagH*0.35, planeY1 = diagH*0.72;
    const px0=60, px1=w-60;
    ctx.strokeStyle='#c7c2b5'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(px0,planeY0); ctx.lineTo(px1,planeY0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(px0,planeY1); ctx.lineTo(px1,planeY1); ctx.stroke();
    ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle='#8a8d92'; ctx.textAlign='left';
    ctx.fillText('crystal plane 1', px1-2, planeY0-6);
    ctx.fillText('crystal plane 2', px1-2, planeY1+14);

    const Apx=w*0.42, Apy=planeY0;
    const Bpx=Apx, Bpy=planeY1;
    const L=90;
    ctx.strokeStyle='#1f6f78'; ctx.lineWidth=2;
    // incident ray to A
    ctx.beginPath(); ctx.moveTo(Apx-L*Math.cos(theta),Apy-L*Math.sin(theta)); ctx.lineTo(Apx,Apy); ctx.stroke();
    // reflected ray from A
    ctx.beginPath(); ctx.moveTo(Apx,Apy); ctx.lineTo(Apx+L*Math.cos(theta),Apy-L*Math.sin(theta)); ctx.stroke();
    // incident ray to B (parallel, offset so it's above plane1 then continues to plane2)
    const offsetX = (Bpy-Apy)/Math.tan(theta);
    ctx.strokeStyle='#a4342c';
    ctx.beginPath(); ctx.moveTo(Bpx-offsetX-L*Math.cos(theta),Bpy-(Bpy-Apy)-L*Math.sin(theta)); ctx.lineTo(Bpx,Bpy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(Bpx,Bpy); ctx.lineTo(Bpx+offsetX+L*Math.cos(theta), Bpy-(Bpy-Apy)-L*Math.sin(theta)); ctx.stroke();

    ctx.fillStyle='#1c1d20';
    ctx.beginPath(); ctx.arc(Apx,Apy,4,0,7); ctx.fill();
    ctx.beginPath(); ctx.arc(Bpx,Bpy,4,0,7); ctx.fill();
    ctx.fillText('A', Apx+8, Apy-8);
    ctx.fillText('B', Bpx+8, Bpy+16);
    ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle='#5a5d63';
    ctx.fillText(`θ=${thetaDeg.toFixed(1)}°`, Apx-40, Apy-14);
    ctx.fillText(`d=${d.toFixed(3)} nm`, Apx+16, (Apy+Bpy)/2);

    // badge text
    ctx.font='bold 13px Helvetica,Arial,sans-serif';
    ctx.fillStyle = isConstructive? '#1e7a3d':'#a4342c';
    ctx.textAlign='center';
    ctx.fillText(isConstructive?`CONSTRUCTIVE — order n=${n}`:'no constructive interference here', w/2, diagH-6);

    // --- scan plot (bottom) ---
    const m={l:52,r:16,t:diagH+22,b:30};
    const {X,Y}=drawAxes(ctx,w,h-6,{l:m.l,r:m.r,t:m.t,b:m.b},0,90,0,1,'θ (deg, scan)','intensity (schematic)',{nx:6,ny:2});
    const pts=[];
    for(let t=0.2;t<90;t+=0.3){
      const tr=t*Math.PI/180;
      const ratioT = (2*d*Math.sin(tr))/lam;
      let val=0;
      for(let k=1;k<=6;k++){
        const dd = ratioT-k;
        val += Math.exp(-(dd*dd)/(2*0.006));
      }
      pts.push({x:t,y:Math.min(1,val)});
    }
    plotLine(ctx,X,Y,pts,'#1f6f78',1.8);
    plotLine(ctx,X,Y,[{x:thetaDeg,y:0},{x:thetaDeg,y:1}],'#a4342c',1.6,[3,3]);

    readout.innerHTML = `
      <div>path difference 2d sin&theta; <b>${fmt(pathDiff,4)} nm</b></div>
      <div>(2d sin&theta;)/&lambda; <b>${fmt(ratio,3)}</b></div>
      <div>nearest order n <b>${n}</b></div>
      <div>status <b>${isConstructive?'constructive':'destructive / partial'}</b></div>`;
  }
  [dEl,lamEl,thEl].forEach(el=>el.addEventListener('input',draw));
  registerCanvas('bg_canvas',draw);
}

/* ---------- 5. Attenuation ---------- */
function setupAttenuation(){
  const canvas=document.getElementById('at_canvas');
  const muEl=document.getElementById('at_mu'), muVal=document.getElementById('at_mu_val');
  const xEl=document.getElementById('at_x'), xVal=document.getElementById('at_x_val');
  const readout=document.getElementById('at_readout');
  function draw(){
    const {ctx,w,h}=fitCanvas(canvas);
    const mu=parseFloat(muEl.value), x=parseFloat(xEl.value);
    muVal.textContent=mu.toFixed(2); xVal.textContent=x.toFixed(1);
    const xhalf = Math.log(2)/mu;
    const ratio = Math.exp(-mu*x);
    ctx.clearRect(0,0,w,h);
    const m={l:52,r:16,t:20,b:34};
    const xmax=60;
    const {X,Y}=drawAxes(ctx,w,h,m,0,xmax,0,1,'thickness x (cm)','I / I₀',{nx:6,ny:4});
    const pts=[]; for(let xx=0;xx<=xmax;xx+=0.5){ pts.push({x:xx,y:Math.exp(-mu*xx)}); }
    plotLine(ctx,X,Y,pts,'#a4342c',2.4);
    plotLine(ctx,X,Y,[{x:xhalf,y:0},{x:xhalf,y:0.5}],'#1f6f78',1.4,[3,3]);
    plotLine(ctx,X,Y,[{x:0,y:0.5},{x:xhalf,y:0.5}],'#1f6f78',1.4,[3,3]);
    dotAt(ctx,X,Y,Math.min(xmax,x),ratio,'#1c1d20',5);
    ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle='#1f6f78'; ctx.textAlign='left';
    if(xhalf<=xmax) ctx.fillText(`x₁/₂ = ${fmt(xhalf,2)} cm`, X(xhalf)+6, Y(0.5)-6);

    readout.innerHTML = `
      <div>&mu; <b>${fmt(mu,3)} cm&#8315;&sup1;</b></div>
      <div>half-thickness x&#8321;&#8260;&#8322; <b>${fmt(xhalf,2)} cm</b></div>
      <div>x <b>${fmt(x,1)} cm</b> = <b>${fmt(x/xhalf,2)}</b> half-thicknesses</div>
      <div>I/I&#8320; <b>${fmt(ratio,4)}</b></div>
      <div>attenuated <b>${fmt((1-ratio)*100,2)}%</b></div>`;
  }
  muEl.addEventListener('input',draw); xEl.addEventListener('input',draw);
  registerCanvas('at_canvas',draw);
}

/* =====================================================================
   0. MICHELSON-MORLEY  (the experiment that started Chapter 1)
   ===================================================================== */
function setupMichelsonMorley(){
  const cDiag = document.getElementById('mm_canvas');
  const cFr   = document.getElementById('mm_canvas_fringes');
  const vEl=document.getElementById('mm_v'), vVal=document.getElementById('mm_v_val');
  const LEl=document.getElementById('mm_L'), LVal=document.getElementById('mm_L_val');
  const lamEl=document.getElementById('mm_lam'), lamVal=document.getElementById('mm_lam_val');
  const readout=document.getElementById('mm_readout');
  const SENSITIVITY = 0.01;   // fringes; what the 1887 apparatus could see

  function physics(){
    const v = parseFloat(vEl.value)*1000;          // km/s -> m/s
    const L = parseFloat(LEl.value);               // m
    const lam = parseFloat(lamEl.value)*1e-9;      // nm -> m
    const beta = v/C_EXACT;
    const b2 = beta*beta;
    // round-trip times through a hypothetical ether wind
    const tPar  = (2*L/C_EXACT)/(1-b2);            // arm along the wind
    const tPerp = (2*L/C_EXACT)/Math.sqrt(1-b2);   // arm across the wind
    const dt = tPar - tPerp;
    const pathDiff = C_EXACT*dt;                   // metres of extra path
    // rotating the apparatus 90 deg swaps the arms, so the shift is doubled
    const fringes = 2*pathDiff/lam;
    return {v,L,lam,beta,tPar,tPerp,dt,pathDiff,fringes};
  }

  function drawDiagram(){
    const {ctx,w,h}=fitCanvas(cDiag);
    const p = physics();
    ctx.clearRect(0,0,w,h);

    const sx = Math.min(w*0.30, 118);              // arm length on screen
    const bsx = w*0.34, bsy = h*0.70;              // beam splitter position
    const mirA = {x:bsx, y:bsy-sx};                // perpendicular arm (up)
    const mirB = {x:bsx+sx, y:bsy};                // parallel arm (along wind)

    // ether wind arrows across the background
    ctx.strokeStyle='rgba(31,111,120,0.30)'; ctx.fillStyle='rgba(31,111,120,0.30)'; ctx.lineWidth=1.4;
    for(let i=0;i<4;i++){
      const y = 16 + i*((h-30)/4), x0 = 8, x1 = 8+34;
      ctx.beginPath(); ctx.moveTo(x0,y); ctx.lineTo(x1,y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x1,y); ctx.lineTo(x1-6,y-3.5); ctx.lineTo(x1-6,y+3.5); ctx.closePath(); ctx.fill();
    }
    ctx.font='11px Helvetica,Arial,sans-serif'; ctx.textAlign='left'; ctx.fillStyle='#1f6f78';
    ctx.fillText(`hypothetical ether wind  v = ${fmt(p.v/1000,0)} km/s`, 8, h-8);

    // beams
    ctx.lineWidth=2.2;
    ctx.strokeStyle='#a4342c';                     // parallel arm (with/against the wind)
    ctx.beginPath(); ctx.moveTo(bsx,bsy); ctx.lineTo(mirB.x,mirB.y); ctx.stroke();
    ctx.strokeStyle='#1f6f78';                     // perpendicular arm (across the wind)
    ctx.beginPath(); ctx.moveTo(bsx,bsy); ctx.lineTo(mirA.x,mirA.y); ctx.stroke();
    ctx.strokeStyle='#8a8d92';                     // source in, combined beam out
    ctx.beginPath(); ctx.moveTo(bsx-sx*0.75,bsy); ctx.lineTo(bsx,bsy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(bsx,bsy); ctx.lineTo(bsx,bsy+sx*0.42); ctx.stroke();

    // mirrors
    function mirror(x,y,horiz,label,color){
      ctx.strokeStyle=color; ctx.lineWidth=4;
      ctx.beginPath();
      if(horiz){ ctx.moveTo(x-16,y); ctx.lineTo(x+16,y); } else { ctx.moveTo(x,y-16); ctx.lineTo(x,y+16); }
      ctx.stroke();
      ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle=color; ctx.textAlign='center';
      ctx.fillText(label, x, horiz? y-8 : y-22);
    }
    mirror(mirA.x,mirA.y,true,'mirror A (across)','#1f6f78');
    mirror(mirB.x,mirB.y,false,'mirror B (along)','#a4342c');

    // beam splitter
    ctx.strokeStyle='#1c1d20'; ctx.lineWidth=2.5;
    ctx.beginPath(); ctx.moveTo(bsx-11,bsy+11); ctx.lineTo(bsx+11,bsy-11); ctx.stroke();
    ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle='#5a5d63'; ctx.textAlign='right';
    ctx.fillText('half-silvered mirror', bsx-14, bsy+22);
    ctx.textAlign='left';
    ctx.fillText('source', bsx-sx*0.75, bsy-8);
    ctx.textAlign='center';
    ctx.fillText('screen', bsx, bsy+sx*0.42+14);

    // Per-arm transit times. Printing them in full is useless — they agree to
    // eight significant figures — so show each arm's DELAY relative to the
    // no-ether round trip 2L/c, which is where the whole effect lives.
    const base = 2*p.L/C_EXACT;
    const tx = bsx + sx + 34;
    ctx.font='11px Helvetica,Arial,sans-serif'; ctx.textAlign='left';
    ctx.fillStyle='#5a5d63';
    ctx.fillText(`with no ether both arms take 2L/c = ${fmtSci(base,4)} s`, tx, bsy+20);
    ctx.fillStyle='#a4342c';
    ctx.fillText(`along:  +${fmtSci(p.tPar-base,3)} s   (≈ 2L/c · β²)`, tx, bsy+37);
    ctx.fillStyle='#1f6f78';
    ctx.fillText(`across: +${fmtSci(p.tPerp-base,3)} s   (≈ 2L/c · β²/2)`, tx, bsy+52);
    ctx.fillStyle='#1c1d20';
    ctx.fillText(`difference Δt = ${fmtSci(p.dt,3)} s`, tx, bsy+69);
  }

  function drawFringes(){
    const {ctx,w,h}=fitCanvas(cFr);
    const p = physics();
    ctx.clearRect(0,0,w,h);
    const m={l:14,r:14};
    const bandH = 40, gap = 30;
    const fringeW = 46;                             // px per fringe, purely for display
    const y0 = 26, y1 = y0+bandH+gap+14;

    function band(yTop, shiftFringes, label, labelColor){
      for(let x=m.l; x<w-m.r; x++){
        const phase = (x - m.l)/fringeW - shiftFringes;
        const I = Math.pow(Math.cos(Math.PI*phase),2);
        const g = Math.round(255*(1-0.92*I));
        ctx.fillStyle = `rgb(${g},${g},${g})`;
        ctx.fillRect(x,yTop,1,bandH);
      }
      ctx.strokeStyle='#c7c2b5'; ctx.lineWidth=1; ctx.strokeRect(m.l,yTop,w-m.l-m.r,bandH);
      ctx.font='11px Helvetica,Arial,sans-serif'; ctx.textAlign='left'; ctx.fillStyle=labelColor;
      ctx.fillText(label, m.l, yTop-6);
    }

    band(y0, 0, 'Fringes before rotating the apparatus', '#5a5d63');
    band(y1, p.fringes, `Ether theory predicts this pattern after a 90° rotation — shifted by ${fmt(p.fringes,3)} fringes`, '#a4342c');

    // mark a reference fringe centre in both bands so the shift is visible
    const refX = m.l + fringeW*Math.round((w-m.l-m.r)/(2*fringeW));
    ctx.strokeStyle='#1f6f78'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(refX,y0-2); ctx.lineTo(refX,y0+bandH+2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(refX,y1-2); ctx.lineTo(refX,y1+bandH+2); ctx.stroke();
    const shiftedX = refX + p.fringes*fringeW;
    if(shiftedX > m.l && shiftedX < w-m.r){
      ctx.strokeStyle='#a4342c'; ctx.setLineDash([4,3]);
      ctx.beginPath(); ctx.moveTo(shiftedX,y1-2); ctx.lineTo(shiftedX,y1+bandH+2); ctx.stroke();
      ctx.setLineDash([]);
    }

    // the actual result
    ctx.font='bold 12px Helvetica,Arial,sans-serif'; ctx.textAlign='center'; ctx.fillStyle='#1e7a3d';
    ctx.fillText('Measured in 1887, and in every repeat since: no shift whatsoever.', w/2, y1+bandH+24);
  }

  function draw(){
    const p = physics();
    vVal.textContent = fmt(p.v/1000,0);
    LVal.textContent = fmt(p.L,1);
    lamVal.textContent = fmt(p.lam*1e9,0);
    drawDiagram(); drawFringes();
    const detectable = p.fringes/SENSITIVITY;
    readout.innerHTML = `
      <div>&beta; = v/c <b>${fmtSci(p.beta,3)}</b></div>
      <div>t&#8741; &minus; t&#8869; <b>${fmtSci(p.dt,3)} s</b></div>
      <div>extra path <b>${fmt(p.pathDiff*1e9,4)} nm</b></div>
      <div>predicted shift <b>${fmt(p.fringes,3)} fringes</b></div>
      <div>apparatus could see <b>${SENSITIVITY} fringes</b></div>
      <div>predicted / detectable <b>${fmt(detectable,1)}&times;</b>
        ${detectable>1?'<span class="badge no">should have been obvious</span>':'<span class="badge ok">too small to see</span>'}</div>
      <div>observed shift <b>0</b> <span class="badge ok">no ether</span></div>`;
  }
  [vEl,LEl,lamEl].forEach(el=>el.addEventListener('input',draw));
  registerCanvas('mm_canvas',draw);
  registerCanvas('mm_canvas_fringes',draw);
}

/* =====================================================================
   X-RAY PRODUCTION  (the inverse photoelectric effect)
   ===================================================================== */
function setupXrayProduction(){
  const canvas=document.getElementById('xr_canvas');
  const VEl=document.getElementById('xr_V'), VVal=document.getElementById('xr_V_val');
  const targetEl=document.getElementById('xr_target');
  const classicalEl=document.getElementById('xr_classical');
  const readout=document.getElementById('xr_readout');

  // K-series lines: excitation energy (keV) and line wavelengths (pm)
  const TARGETS = {
    'W':  {name:'Tungsten',    Z:74, Kedge:69.5, Ka:20.9,  Kb:18.4},
    'Mo': {name:'Molybdenum',  Z:42, Kedge:20.0, Ka:71.1,  Kb:63.2},
    'Cu': {name:'Copper',      Z:29, Kedge:8.98, Ka:154.1, Kb:139.2}
  };

  // Kramers' law for the bremsstrahlung continuum, zero below the cutoff
  function kramers(lam, lamMin){
    if(lam <= lamMin) return 0;
    return (1/(lam*lam))*(lam/lamMin - 1);
  }

  function draw(){
    const {ctx,w,h}=fitCanvas(canvas);
    const kV = parseFloat(VEl.value); VVal.textContent = fmt(kV,0);
    const t = TARGETS[targetEl.value];
    const lamMin = HC_EV_PM/(kV*1000);          // pm; depends ONLY on the voltage
    const Emax = kV;                             // keV
    ctx.clearRect(0,0,w,h);

    const xmax = 200;                            // pm
    const m={l:56,r:16,t:22,b:34};
    // continuum peaks at 2*lamMin; normalise the plot to that
    const peak = kramers(2*lamMin, lamMin);
    const ymax = peak*1.45;
    const {X,Y}=drawAxes(ctx,w,h,m,0,xmax,0,ymax,'λ (pm)','relative intensity',
                         {nx:5,ny:4,yfmt:()=>''});

    // what classical electromagnetism predicts: a continuum with no cutoff at all
    if(classicalEl.checked){
      const cl=[];
      for(let l=2;l<=xmax;l+=0.5){
        // same falling shape, but continuing straight through the cutoff to lambda -> 0
        cl.push({x:l, y:Math.min(ymax*1.4, peak*Math.pow(2*lamMin/l,2))});
      }
      plotLine(ctx,X,Y,cl,'#8a8d92',1.8,[5,3]);
    }

    // the measured continuum
    const pts=[];
    for(let l=0.2;l<=xmax;l+=0.35) pts.push({x:l,y:kramers(l,lamMin)});
    plotLine(ctx,X,Y,pts,'#a4342c',2.4);

    // sharp cutoff line
    plotLine(ctx,X,Y,[{x:lamMin,y:0},{x:lamMin,y:ymax}],'#1f6f78',1.8,[3,3]);
    ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle='#1f6f78'; ctx.textAlign='left';
    ctx.fillText(`λ_min = ${fmt(lamMin,1)} pm`, X(lamMin)+6, m.t+14);

    // characteristic lines, present only if the beam can knock out a K electron
    const excited = kV >= t.Kedge;
    if(excited){
      const drive = Math.pow((kV - t.Kedge)/t.Kedge, 1.5);
      [[t.Ka,'Kα',1.0],[t.Kb,'Kβ',0.52]].forEach(([lam,label,rel])=>{
        if(lam>xmax || lam<lamMin) return;
        const hgt = Math.min(ymax*0.96, ymax*0.42*rel*Math.max(0.35,Math.min(2.4,drive)) + kramers(lam,lamMin));
        plotLine(ctx,X,Y,[{x:lam,y:kramers(lam,lamMin)},{x:lam,y:hgt}],'#1c1d20',2.6);
        ctx.fillStyle='#1c1d20'; ctx.textAlign='center';
        ctx.fillText(label, X(lam), Y(hgt)-6);
      });
    }

    // legend on the right, clear of the cutoff label on the left
    ctx.font='11px Helvetica,Arial,sans-serif'; ctx.textAlign='right';
    let ly = m.t+14;
    ctx.fillStyle='#a4342c'; ctx.fillText(`${t.name} target, ${fmt(kV,0)} kV`, w-m.r-8, ly); ly+=16;
    if(classicalEl.checked){
      ctx.fillStyle='#8a8d92'; ctx.fillText('classical prediction: no cutoff', w-m.r-8, ly); ly+=16;
    }
    ctx.fillStyle='#5a5d63';
    ctx.fillText(excited
      ? `${fmt(kV,0)} kV clears the ${fmt(t.Kedge,1)} kV K edge — lines present`
      : `below the ${fmt(t.Kedge,1)} kV K edge — no ${t.name} lines`, w-m.r-8, ly);

    readout.innerHTML = `
      <div>accelerating voltage <b>${fmt(kV,0)} kV</b></div>
      <div>max photon energy <b>${fmt(Emax,1)} keV</b></div>
      <div>&lambda;<sub>min</sub> = hc/eV <b>${fmt(lamMin,2)} pm</b></div>
      <div>continuum peak &asymp; 2&lambda;<sub>min</sub> <b>${fmt(2*lamMin,1)} pm</b></div>
      <div>${t.name} K excitation <b>${fmt(t.Kedge,1)} kV</b></div>
      <div>K lines <b>${excited?`K&alpha; ${fmt(t.Ka,1)} pm`:'not excited'}</b>
        ${excited?'<span class="badge ok">present</span>':'<span class="badge no">absent</span>'}</div>`;
  }
  VEl.addEventListener('input',draw);
  targetEl.addEventListener('change',draw);
  classicalEl.addEventListener('change',draw);
  registerCanvas('xr_canvas',draw);
}

/* =====================================================================
   PAIR PRODUCTION
   ===================================================================== */
function setupPairProduction(){
  const cEvent=document.getElementById('pp_canvas');
  const cSplit=document.getElementById('pp_canvas_split');
  const EEl=document.getElementById('pp_E'), EVal=document.getElementById('pp_E_val');
  const readout=document.getElementById('pp_readout');
  const THRESH = 2*ME_C2_MEV;   // 1.022 MeV

  function drawEvent(){
    const {ctx,w,h}=fitCanvas(cEvent);
    const E = parseFloat(EEl.value);
    ctx.clearRect(0,0,w,h);
    const allowed = E >= THRESH;
    const nx = w*0.44, ny = h*0.52;

    // incoming photon drawn as a wave
    ctx.strokeStyle='#8a8d92'; ctx.lineWidth=2.2;
    ctx.beginPath();
    const x0 = 24, amp = 7, per = 17;
    for(let x=x0;x<=nx-16;x++){
      const y = ny + amp*Math.sin((x-x0)/per*2*Math.PI);
      if(x===x0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.stroke();
    ctx.beginPath(); ctx.moveTo(nx-16,ny); ctx.lineTo(nx-26,ny-5); ctx.lineTo(nx-26,ny+5); ctx.closePath();
    ctx.fillStyle='#8a8d92'; ctx.fill();
    ctx.font='11px Helvetica,Arial,sans-serif'; ctx.textAlign='left'; ctx.fillStyle='#8a8d92';
    ctx.fillText(`photon, ${fmt(E,3)} MeV`, x0, ny-16);

    // the nucleus, which is what makes the whole thing possible
    ctx.fillStyle='#1c1d20'; ctx.beginPath(); ctx.arc(nx,ny,9,0,7); ctx.fill();
    ctx.fillStyle='#5a5d63'; ctx.textAlign='center';
    ctx.fillText('nucleus', nx, ny+26);

    if(allowed){
      // tracks curve apart, as they would in a bubble chamber's magnetic field.
      // higher momentum => straighter track, so curvature falls as energy rises.
      const KEtot = E - THRESH;
      // Each track is a circular arc whose radius grows with the particle's
      // momentum, exactly as it would in a bubble chamber: stiffer particles
      // bend less. Marched forward until the arc would leave the frame.
      const pMeV = Math.sqrt(Math.max(0,Math.pow(E/2,2) - ME_C2_MEV*ME_C2_MEV));
      const R = 42 + pMeV*95;
      [[-1,'#a4342c','e⁻'],[1,'#1f6f78','e⁺']].forEach(([sgn,color,label])=>{
        ctx.strokeStyle=color; ctx.lineWidth=2.4;
        ctx.beginPath();
        let lastX=nx, lastY=ny;
        for(let phi=0; phi<=Math.PI*0.92; phi+=0.012){
          const x = nx + R*Math.sin(phi);
          const y = ny + sgn*R*(1-Math.cos(phi));
          if(x > w-104 || y < 15 || y > h-15) break;
          if(phi===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
          lastX=x; lastY=y;
        }
        ctx.stroke();
        ctx.fillStyle=color; ctx.textAlign='left';
        const ly = Math.max(14, Math.min(h-8, lastY + sgn*13));
        ctx.fillText(`${label}  KE ${fmt(KEtot/2,3)} MeV`, Math.min(lastX+8, w-100), ly);
      });
      ctx.textAlign='center'; ctx.fillStyle='#1e7a3d'; ctx.font='bold 12px Helvetica,Arial,sans-serif';
      ctx.fillText('pair created', nx+60, 18);
    } else {
      // photon simply carries on
      ctx.strokeStyle='#c7c2b5'; ctx.lineWidth=2; ctx.setLineDash([5,3]);
      ctx.beginPath();
      for(let x=nx+12;x<=w-24;x++){
        const y = ny + amp*Math.sin((x-x0)/per*2*Math.PI);
        if(x===nx+12) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      }
      ctx.stroke(); ctx.setLineDash([]);
      ctx.textAlign='center'; ctx.fillStyle='#a4342c'; ctx.font='bold 12px Helvetica,Arial,sans-serif';
      ctx.fillText(`below threshold — needs ${THRESH} MeV`, w/2, 18);
      ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle='#5a5d63';
      ctx.fillText('no pair can be made; the photon carries on', w/2, h-10);
    }
  }

  function drawSplit(){
    const {ctx,w,h}=fitCanvas(cSplit);
    const E = parseFloat(EEl.value);
    ctx.clearRect(0,0,w,h);
    const m={l:52,r:16,t:22,b:34};
    const xmax=10;
    const {X,Y}=drawAxes(ctx,w,h,m,0,xmax,0,10,'photon energy hν (MeV)','energy (MeV)',{nx:5,ny:5});

    // the fixed rest-mass floor that must be paid before anything else happens
    const restPts=[], kePts=[];
    for(let e=0;e<=xmax;e+=0.05){
      restPts.push({x:e, y: e>=THRESH ? THRESH : null});
      kePts.push({x:e, y: e>=THRESH ? e : null});
    }
    // shade the region that becomes kinetic energy
    ctx.save();
    ctx.fillStyle='rgba(31,111,120,0.13)';
    ctx.beginPath();
    ctx.moveTo(X(THRESH),Y(THRESH));
    for(let e=THRESH;e<=xmax;e+=0.05) ctx.lineTo(X(e),Y(e));
    ctx.lineTo(X(xmax),Y(THRESH)); ctx.closePath(); ctx.fill();
    ctx.restore();

    plotLine(ctx,X,Y,kePts,'#1f6f78',2.4);
    plotLine(ctx,X,Y,restPts,'#a4342c',2.2,[5,3]);
    plotLine(ctx,X,Y,[{x:THRESH,y:0},{x:THRESH,y:10}],'#a4342c',1.4,[3,3]);

    ctx.font='11px Helvetica,Arial,sans-serif'; ctx.textAlign='left';
    ctx.fillStyle='#a4342c'; ctx.fillText('rest energy 2m₀c² = 1.022 MeV (fixed)', m.l+8, Y(THRESH)-8);
    ctx.fillStyle='#1f6f78'; ctx.fillText('shaded: shared kinetic energy', m.l+8, m.t+14);
    if(E>=THRESH){
      dotAt(ctx,X,Y,E,Math.min(10,E),'#1f6f78',5);
      dotAt(ctx,X,Y,E,THRESH,'#a4342c',4);
    } else {
      plotLine(ctx,X,Y,[{x:E,y:0},{x:E,y:THRESH}],'#8a8d92',2);
    }
  }

  function draw(){
    const E = parseFloat(EEl.value); EVal.textContent = fmt(E,2);
    drawEvent(); drawSplit();
    const allowed = E>=THRESH;
    const KEtot = Math.max(0, E-THRESH);
    const gamma = E/(2*ME_C2_MEV);
    const beta = gamma>1 ? Math.sqrt(1-1/(gamma*gamma)) : 0;
    const lam_pm = HC_EV_PM/(E*1e6);
    readout.innerHTML = `
      <div>photon energy <b>${fmt(E,3)} MeV</b></div>
      <div>&lambda; of that photon <b>${fmt(lam_pm,4)} pm</b></div>
      <div>threshold 2m&#8320;c&sup2; <b>${THRESH} MeV</b></div>
      <div>status <b>${allowed?'pair can be created':'forbidden'}</b>
        ${allowed?'<span class="badge ok">allowed</span>':'<span class="badge no">below threshold</span>'}</div>
      <div>kinetic energy shared <b>${fmt(KEtot,3)} MeV</b></div>
      <div>KE each particle <b>${fmt(KEtot/2,3)} MeV</b></div>
      <div>&gamma; of each <b>${allowed?fmt(gamma,3):'—'}</b></div>
      <div>speed of each <b>${allowed?fmt(beta,4)+'c':'—'}</b></div>
      <div>fraction spent on rest mass <b>${allowed?fmt(THRESH/E*100,1)+'%':'—'}</b></div>`;
  }
  EEl.addEventListener('input',draw);
  registerCanvas('pp_canvas',draw);
  registerCanvas('pp_canvas_split',draw);
}

/* =====================================================================
   PHOTONS IN A GRAVITATIONAL FIELD  (Pound-Rebka, and the red shift)
   ===================================================================== */
function setupGravRedshift(){
  const cTower=document.getElementById('gr_canvas');
  const cStar =document.getElementById('gr_canvas_star');
  const HEl=document.getElementById('gr_H'), HVal=document.getElementById('gr_H_val');
  const objEl=document.getElementById('gr_obj');
  const readout=document.getElementById('gr_readout');

  // M (kg), R (m)
  const OBJECTS = {
    earth: {name:'Earth',              M:M_EARTH,       R:R_EARTH},
    sun:   {name:'the Sun',            M:M_SUN,         R:R_SUN},
    wd:    {name:'Sirius B (white dwarf)', M:1.018*M_SUN, R:5.85e6},
    ns:    {name:'a neutron star',     M:1.4*M_SUN,     R:1.2e4}
  };

  function drawTower(){
    const {ctx,w,h}=fitCanvas(cTower);
    const H = parseFloat(HEl.value);
    ctx.clearRect(0,0,w,h);
    const shift = G_EARTH*H/(C_EXACT*C_EXACT);     // fractional, for a photon falling H

    const gx = w*0.30, top = 26, bot = h-34;
    // tower
    ctx.strokeStyle='#c7c2b5'; ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(gx-26,bot); ctx.lineTo(gx-26,top); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(gx+26,bot); ctx.lineTo(gx+26,top); ctx.stroke();
    ctx.strokeStyle='#8a8d92'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(gx-46,bot); ctx.lineTo(gx+46,bot); ctx.stroke();

    // falling photon, drawn as a wave that tightens very slightly on the way down
    ctx.strokeStyle='#a4342c'; ctx.lineWidth=2;
    ctx.beginPath();
    for(let y=top+6;y<=bot-6;y++){
      const f = (y-top)/(bot-top);
      const per = 20*(1-0.30*f);                   // visual exaggeration, stated in the label
      const x = gx + 9*Math.sin(y/per*2*Math.PI);
      if(y===top+6) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.stroke();

    ctx.font='11px Helvetica,Arial,sans-serif'; ctx.textAlign='left'; ctx.fillStyle='#5a5d63';
    ctx.fillText('emitted at the top: ν', gx+40, top+10);
    ctx.fillStyle='#a4342c';
    ctx.fillText(`detected at the bottom: ν(1 + gH/c²)`, gx+40, bot-6);
    ctx.fillStyle='#8a8d92';
    ctx.fillText(`H = ${fmt(H,1)} m`, gx-96, (top+bot)/2);
    ctx.fillText('(wavelength change', gx+40, (top+bot)/2 - 7);
    ctx.fillText('hugely exaggerated)', gx+40, (top+bot)/2 + 8);

    // the actual size of the effect, spelled out
    ctx.font='12px Helvetica,Arial,sans-serif'; ctx.textAlign='center'; ctx.fillStyle='#1c1d20';
    ctx.fillText(`Δν/ν = gH/c² = ${fmtSci(shift,3)}`, w/2, h-12);
  }

  function drawStar(){
    const {ctx,w,h}=fitCanvas(cStar);
    ctx.clearRect(0,0,w,h);
    const m={l:62,r:16,t:22,b:36};
    // log-log: the four objects span ten decades, so a linear axis would pile
    // Earth and the Sun onto the baseline and show nothing.
    const lgXmin=0, lgXmax=9;        // R/R_S from 1 to 10^9
    const lgYmin=-11, lgYmax=0;      // fractional frequency loss
    const X = x => m.l + (Math.log10(x)-lgXmin)/(lgXmax-lgXmin)*(w-m.l-m.r);
    const Y = y => h-m.b - (Math.log10(y)-lgYmin)/(lgYmax-lgYmin)*(h-m.b-m.t);
    const SUP = ['\u2070','\u00b9','\u00b2','\u00b3','\u2074','\u2075','\u2076','\u2077','\u2078','\u2079'];
    const sup = n => String(Math.abs(n)).split('').map(d=>SUP[+d]).join('');
    const pow10 = n => n===0 ? '1' : (n===1 ? '10' : '10'+(n<0?'\u207b':'')+sup(n));

    ctx.save(); ctx.font='11px Helvetica,Arial,sans-serif';
    ctx.strokeStyle='#e7e4dc'; ctx.lineWidth=1; ctx.fillStyle='#8a8d92';
    for(let e=lgXmin;e<=lgXmax;e++){
      const px=X(Math.pow(10,e));
      ctx.beginPath(); ctx.moveTo(px,m.t); ctx.lineTo(px,h-m.b); ctx.stroke();
      ctx.textAlign='center'; ctx.fillText(pow10(e), px, h-m.b+16);
    }
    for(let e=lgYmin;e<=lgYmax;e+=2){
      const py=Y(Math.pow(10,e));
      ctx.beginPath(); ctx.moveTo(m.l,py); ctx.lineTo(w-m.r,py); ctx.stroke();
      ctx.textAlign='right'; ctx.fillText(pow10(e), m.l-8, py+3);
    }
    ctx.strokeStyle='#1c1d20'; ctx.lineWidth=1.3;
    ctx.beginPath(); ctx.moveTo(m.l,m.t); ctx.lineTo(m.l,h-m.b); ctx.lineTo(w-m.r,h-m.b); ctx.stroke();
    ctx.fillStyle='#1c1d20'; ctx.textAlign='center';
    ctx.fillText('R / R\u209b   (radius, in Schwarzschild radii)', m.l+(w-m.l-m.r)/2, h-6);
    ctx.save(); ctx.translate(14, m.t+(h-m.b-m.t)/2); ctx.rotate(-Math.PI/2);
    ctx.fillText('fractional frequency loss',0,0); ctx.restore();
    ctx.restore();

    // Beiser Eq 2.29 in these units is exactly 1/(2x); exact GR is 1 - sqrt(1-1/x)
    function plotLog(fn,color,width,dash){
      ctx.save(); ctx.strokeStyle=color; ctx.lineWidth=width; if(dash) ctx.setLineDash(dash);
      ctx.beginPath(); let started=false;
      for(let lg=lgXmax; lg>=lgXmin; lg-=0.005){
        const x=Math.pow(10,lg), y=fn(x);
        if(y==null||!isFinite(y)||y<=0){ started=false; continue; }
        const py=Y(Math.min(1,y));
        if(!started){ ctx.moveTo(X(x),py); started=true; } else ctx.lineTo(X(x),py);
      }
      ctx.stroke(); ctx.restore();
    }
    plotLog(x => x>1 ? 1-Math.sqrt(1-1/x) : null, '#1f6f78', 2.6);
    plotLog(x => 1/(2*x), '#a4342c', 2, [5,3]);

    // where real objects sit
    Object.keys(OBJECTS).forEach(k=>{
      const o=OBJECTS[k];
      const Rs = 2*G_GRAV*o.M/(C_EXACT*C_EXACT);
      const x = o.R/Rs, y = 1/(2*x);
      if(x<1 || x>Math.pow(10,lgXmax) || y<Math.pow(10,lgYmin)) return;
      const isCur = (k===objEl.value);
      ctx.fillStyle = isCur ? '#1c1d20' : '#b9b3a4';
      ctx.beginPath(); ctx.arc(X(x), Y(y), isCur?5.5:3.5, 0, 7); ctx.fill();
      ctx.font = (isCur?'bold ':'')+'11px Helvetica,Arial,sans-serif';
      ctx.fillStyle = isCur ? '#1c1d20' : '#8a8d92';
      ctx.textAlign = X(x) > w*0.62 ? 'right' : 'left';
      ctx.fillText(o.name, X(x) + (X(x)>w*0.62?-9:9), Y(y)-7);
    });

    ctx.font='11px Helvetica,Arial,sans-serif'; ctx.textAlign='right';
    ctx.fillStyle='#1f6f78'; ctx.fillText('exact (general relativity)', w-m.r-8, m.t+14);
    ctx.fillStyle='#a4342c'; ctx.fillText('Beiser Eq. 2.29:  GM/c\u00b2R', w-m.r-8, m.t+30);
  }

  function draw(){
    const H = parseFloat(HEl.value); HVal.textContent = fmt(H,1);
    drawTower(); drawStar();
    const towerShift = G_EARTH*H/(C_EXACT*C_EXACT);
    const nuRed = 7.3e14;                       // Beiser's Example 2.8 red light
    const o = OBJECTS[objEl.value];
    const Rs = 2*G_GRAV*o.M/(C_EXACT*C_EXACT);
    const zApprox = G_GRAV*o.M/(C_EXACT*C_EXACT*o.R);
    const ratio = o.R/Rs;
    const zExact = ratio>1 ? 1/Math.sqrt(1-1/ratio) - 1 : Infinity;
    const lam0 = 500;                           // nm, a green line for comparison
    readout.innerHTML = `
      <div>tower height H <b>${fmt(H,1)} m</b></div>
      <div>&Delta;&nu;/&nu; = gH/c&sup2; <b>${fmtSci(towerShift,3)}</b></div>
      <div>for red light (7.3&times;10&sup1;&#8308; Hz) <b>${fmt(towerShift*nuRed,2)} Hz</b></div>
      <div>escaping <b>${o.name}</b></div>
      <div>&Delta;&nu;/&nu; = GM/c&sup2;R <b>${fmtSci(zApprox,3)}</b></div>
      <div>exact GR red shift z <b>${isFinite(zExact)?fmtSci(zExact,3):'∞'}</b></div>
      <div>Schwarzschild radius <b>${Rs>1000?fmt(Rs/1000,2)+' km':fmt(Rs*1000,2)+' mm'}</b></div>
      <div>R / R<sub>S</sub> <b>${fmtSci(ratio,3)}</b></div>
      <div>a 500 nm line arrives at <b>${fmt(lam0*(1+zApprox),4)} nm</b></div>`;
  }
  HEl.addEventListener('input',draw);
  objEl.addEventListener('change',draw);
  registerCanvas('gr_canvas',draw);
  registerCanvas('gr_canvas_star',draw);
}
