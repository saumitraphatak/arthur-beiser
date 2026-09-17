/* =====================================================================
   Concepts of Modern Physics — Interactive Companion
   Chapter 1: Relativity
   Every number is computed live from the chapter's formulas.
   ===================================================================== */

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
      <div>extra path <b>${fmt(p.pathDiff*1e9,2)} nm</b></div>
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
  const live=document.getElementById('tw_live');
  const playBtn=document.getElementById('tw_play');
  let simT=0, playing=false, lastFrame=performance.now();

  function getTearth(){ return 2*parseFloat(distEl.value)/parseFloat(betaEl.value); }

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
    // the reunion is at x = 0, hard against the left margin, so these have to be
    // written out to the right of it rather than off the edge of the canvas
    ctx.textAlign='right';
    ctx.fillText(`reunion: Jane ${fmt(age0+Tearth,1)} yr old`, w-m.r-8, Y(Tearth)-8);
    ctx.fillText(`Dick ${fmt(age0+Ttrav,1)} yr old`, w-m.r-8, Y(Tearth)+8);

    // moving markers: Dick's position bends at the star, Jane's just climbs the ct axis.
    if(simT>0){
      const t=Math.min(simT,Tearth);
      const dickX = t<=D/beta ? beta*t : 2*D-beta*t;
      dotAt(ctx,X,Y,0,t,'#1f6f78',6.5);
      dotAt(ctx,X,Y,dickX,t,'#a4342c',6.5);
      ctx.beginPath(); ctx.arc(X(dickX),Y(t),10,0,7);
      ctx.strokeStyle='rgba(164,52,44,0.4)'; ctx.lineWidth=1.5; ctx.stroke();
    }

    readout.innerHTML = `
      <div>&gamma; <b>${fmt(gamma,3)}</b></div>
      <div>Earth-frame trip time <b>${fmt(Tearth,2)} yr</b></div>
      <div>Traveler's proper time <b>${fmt(Ttrav,2)} yr</b></div>
      <div>Age difference on return <b>${fmt(Tearth-Ttrav,2)} yr</b></div>
      <div>Jane's final age <b>${fmt(age0+Tearth,1)}</b></div>
      <div>Dick's final age <b>${fmt(age0+Ttrav,1)}</b></div>`;

    if(simT>0){
      const t=Math.min(simT,Tearth);
      const janeAge = age0+t, dickAge = age0+t/gamma;
      live.innerHTML = `
        <div style="color:#1f6f78">Jane's age right now <b>${fmt(janeAge,2)}</b></div>
        <div style="color:#a4342c">Dick's age right now <b>${fmt(dickAge,2)}</b></div>
        <div>gap so far <b>${fmt(janeAge-dickAge,2)} yr</b></div>`;
    } else {
      live.innerHTML = `<div style="color:var(--sub)">Press Play to watch both ages tick as Dick flies out, turns around, and comes home.</div>`;
    }
  }

  function loop(now){
    const dt=Math.min(0.05,(now-lastFrame)/1000); lastFrame=now;
    const active=document.getElementById('ch1') && document.getElementById('ch1').classList.contains('active');
    if(playing && active){
      const Tearth=getTearth();
      simT += dt*(Tearth/7); // the whole round trip animates over ~7 real seconds
      if(simT>=Tearth){ simT=Tearth; playing=false; playBtn.textContent='↺ Replay'; playBtn.classList.remove('playing'); }
      draw();
    }
    requestAnimationFrame(loop);
  }

  if(playBtn) playBtn.addEventListener('click', ()=>{
    if(prefersReducedMotion()){
      // Respect reduced-motion: jump straight to the finished trip instead of animating it.
      simT = simT>0 ? 0 : getTearth();
      playBtn.textContent = simT>0 ? '↺ Replay' : '▶ Play the trip';
      draw();
      return;
    }
    if(!playing){
      if(simT<=0 || simT>=getTearth()-1e-9) simT=0;
      playing=true; lastFrame=performance.now(); playBtn.textContent='⏸ Pause'; playBtn.classList.add('playing');
    } else {
      playing=false; playBtn.textContent='▶ Play the trip'; playBtn.classList.remove('playing');
    }
  });

  [betaEl,distEl,ageEl].forEach(el=>el.addEventListener('input',()=>{
    simT=0; playing=false;
    if(playBtn){ playBtn.textContent='▶ Play the trip'; playBtn.classList.remove('playing'); }
    draw();
  }));
  registerCanvas('tw_canvas',draw);
  requestAnimationFrame(loop);
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

// register with the loader in app.js
registerModule('setupMichelsonMorley', setupMichelsonMorley);
registerModule('setupTimeDilation', setupTimeDilation);
registerModule('setupLengthContraction', setupLengthContraction);
registerModule('setupVelocityAddition', setupVelocityAddition);
registerModule('setupDoppler', setupDoppler);
registerModule('setupTwinParadox', setupTwinParadox);
registerModule('setupKEMomentum', setupKEMomentum);
registerModule('setupMinkowski', setupMinkowski);
