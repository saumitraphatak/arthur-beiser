/* =====================================================================
   Concepts of Modern Physics — Interactive Companion
   Chapter 3: Wave Properties of Particles
   Every number is computed live from the chapter's formulas.
   ===================================================================== */

/* ---------- shared helper: a decade axis for quantities spanning many
   orders of magnitude, which is most of this chapter ---------- */
function logAxis(ctx, w, m, lgMin, lgMax, y, label){
  const X = v => m.l + (Math.log10(v)-lgMin)/(lgMax-lgMin)*(w-m.l-m.r);
  ctx.save();
  ctx.strokeStyle='#1c1d20'; ctx.lineWidth=1.3;
  ctx.beginPath(); ctx.moveTo(m.l,y); ctx.lineTo(w-m.r,y); ctx.stroke();
  ctx.font='10px Helvetica,Arial,sans-serif'; ctx.fillStyle='#8a8d92'; ctx.textAlign='center';
  const step = (lgMax-lgMin) > 26 ? 6 : ((lgMax-lgMin) > 14 ? 3 : 2);
  for(let e=Math.ceil(lgMin); e<=lgMax; e+=step){
    const px=X(Math.pow(10,e));
    ctx.strokeStyle='#d8d3c6'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(px,y-4); ctx.lineTo(px,y+4); ctx.stroke();
    ctx.fillText(supPow(e), px, y+17);
  }
  if(label){ ctx.fillStyle='#5a5d63'; ctx.textAlign='left'; ctx.fillText(label, m.l, y+32); }
  ctx.restore();
  return X;
}
const _SUP = ['⁰','¹','²','³','⁴','⁵','⁶','⁷','⁸','⁹'];
function supPow(e){
  const digits = String(Math.abs(e)).split('').map(d=>_SUP[+d]).join('');
  return '10' + (e<0 ? '⁻' : '') + digits;
}

/* =====================================================================
   1. DE BROGLIE WAVELENGTH
   ===================================================================== */
function setupDeBroglie(){
  const canvas=document.getElementById('db_canvas');
  const objEl=document.getElementById('db_obj');
  const vEl=document.getElementById('db_v'), vVal=document.getElementById('db_v_val');
  const readout=document.getElementById('db_readout');

  // mass (kg) and the length scale each object would have to be wavelike against
  const OBJ = {
    electron: {name:'electron',   m:M_E,     scale:A0,      scaleName:'Bohr radius'},
    proton:   {name:'proton',     m:M_P,     scale:1.0e-15, scaleName:'proton diameter'},
    c60:      {name:'C₆₀ molecule', m:1.197e-24, scale:1.0e-9,  scaleName:'molecule width'},
    dust:     {name:'dust grain', m:1.0e-12, scale:1.0e-5,  scaleName:'grain width'},
    golf:     {name:'golf ball',  m:0.046,   scale:0.043,   scaleName:'ball diameter'},
    person:   {name:'person',     m:70,      scale:1.7,     scaleName:'height'}
  };
  // landmarks drawn along the decade axis
  const MARKS = [
    [1e-15,'nucleus'], [1e-10,'atom'], [1e-9,'molecule'], [1e-6,'bacterium'],
    [1e-3,'grain of salt'], [1e0,'person']
  ];

  function physics(){
    const o = OBJ[objEl.value];
    const v = Math.pow(10, parseFloat(vEl.value));      // m/s
    const beta = Math.min(v/C_EXACT, 0.9999999);
    const gamma = 1/Math.sqrt(1-beta*beta);
    const p = gamma*o.m*v;                              // relativistic momentum
    const lam = H_J/p;
    const E0 = o.m*C_EXACT*C_EXACT;
    const KE = (gamma-1)*E0;
    return {o,v,beta,gamma,p,lam,KE,E0};
  }

  function draw(){
    const {ctx,w,h}=fitCanvas(canvas);
    const p = physics();
    vVal.textContent = fmtSci(p.v,2);
    ctx.clearRect(0,0,w,h);

    const m={l:44,r:26};
    const lgMin=-38, lgMax=2;
    const axisY = h*0.62;
    const X = logAxis(ctx, w, m, lgMin, lgMax, axisY, 'metres');

    // landmark scales along the bottom
    ctx.font='10px Helvetica,Arial,sans-serif';
    MARKS.forEach(([v,label],i)=>{
      const px=X(v);
      if(px<m.l||px>w-m.r) return;
      const drop = 34 + (i%2)*17;          // alternate rows: these sit close together
      ctx.strokeStyle='#e7e4dc'; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(px,axisY+6); ctx.lineTo(px,axisY+drop-6); ctx.stroke();
      ctx.fillStyle='#b9b3a4'; ctx.textAlign='center';
      ctx.fillText(label, px, axisY+drop+6);
    });

    function flag(v,color,label,dy,dash){
      const raw = X(v);
      const px = Math.max(m.l, Math.min(w-m.r, raw));
      ctx.strokeStyle=color; ctx.lineWidth=2.2; if(dash) ctx.setLineDash(dash);
      ctx.beginPath(); ctx.moveTo(px,axisY); ctx.lineTo(px,axisY-dy); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle=color; ctx.beginPath(); ctx.arc(px,axisY-dy,4.5,0,7); ctx.fill();
      ctx.font='11px Helvetica,Arial,sans-serif';
      ctx.textAlign = px > w*0.62 ? 'right' : 'left';
      ctx.fillText(label, px + (px>w*0.62?-9:9), axisY-dy-4);
      return raw<m.l || raw>w-m.r;
    }
    const off1 = flag(p.o.scale, '#8a8d92', `${p.o.name}: ${p.o.scaleName}`, 40, [4,3]);
    const off2 = flag(p.lam, '#a4342c', `de Broglie λ = ${fmtSci(p.lam,2)} m`, 86);

    // the gap between the two is the whole point
    const xl = Math.max(m.l, Math.min(w-m.r, X(p.lam)));
    const xs = Math.max(m.l, Math.min(w-m.r, X(p.o.scale)));
    if(Math.abs(xs-xl) > 26){
      ctx.strokeStyle='rgba(31,111,120,.5)'; ctx.lineWidth=1.4; ctx.setLineDash([3,3]);
      ctx.beginPath(); ctx.moveTo(xl,axisY-24); ctx.lineTo(xs,axisY-24); ctx.stroke();
      ctx.setLineDash([]);
      const ratio = p.o.scale/p.lam;
      ctx.fillStyle='#1f6f78'; ctx.font='11px Helvetica,Arial,sans-serif'; ctx.textAlign='center';
      const midx = (xl+xs)/2;
      const factor = ratio>1 ? `λ is 10${supPow(Math.round(Math.log10(ratio))).slice(2)} times smaller`
                             : `λ is 10${supPow(Math.round(Math.log10(1/ratio))).slice(2)} times larger`;
      ctx.fillText(factor, midx, axisY-30);
    }

    ctx.font='12px Helvetica,Arial,sans-serif'; ctx.textAlign='left'; ctx.fillStyle='#1c1d20';
    ctx.fillText(`${p.o.name} at ${fmtSci(p.v,2)} m/s  (β = ${fmtSci(p.beta,2)})`, m.l, 20);
    if(off1||off2){
      ctx.fillStyle='#a4342c'; ctx.font='10px Helvetica,Arial,sans-serif';
      ctx.fillText('(a marker pinned at the edge lies off this scale)', m.l, 36);
    }

    const keEv = p.KE/EV_J;
    const ratio = p.lam/p.o.scale;
    readout.innerHTML = `
      <div>mass <b>${fmtSci(p.o.m,3)} kg</b></div>
      <div>speed <b>${fmtSci(p.v,3)} m/s</b></div>
      <div>&gamma; <b>${p.gamma<1.0001?'1.0000':fmt(p.gamma,4)}</b></div>
      <div>momentum p <b>${fmtSci(p.p,3)} kg m/s</b></div>
      <div>&lambda; = h/&gamma;m&upsilon; <b>${fmtSci(p.lam,3)} m</b></div>
      <div>kinetic energy <b>${keEv>1e6?fmt(keEv/1e6,3)+' MeV':(keEv>1e3?fmt(keEv/1e3,3)+' keV':fmtSci(keEv,3)+' eV')}</b></div>
      <div>&lambda; / ${p.o.scaleName} <b>${fmtSci(ratio,2)}</b>
        ${ratio>0.05?'<span class="badge ok">wave effects visible</span>':'<span class="badge no">hopelessly small</span>'}</div>`;
  }
  objEl.addEventListener('change',draw);
  vEl.addEventListener('input',draw);
  registerCanvas('db_canvas',draw);
}

/* =====================================================================
   2. PHASE AND GROUP VELOCITY
   ===================================================================== */
function setupPhaseGroup(){
  const cWave=document.getElementById('pg_canvas');
  const cPlot=document.getElementById('pg_canvas_plot');
  const betaEl=document.getElementById('pg_beta'), betaVal=document.getElementById('pg_beta_val');
  const runEl=document.getElementById('pg_run');
  const readout=document.getElementById('pg_readout');
  let dims = fitCanvas(cWave);
  let t = 0, lastFrame = performance.now(), crestN = null;

  function refit(){ dims = fitCanvas(cWave); drawWave(); }
  registerCanvas('pg_canvas', refit);

  function drawWave(){
    const {ctx,w,h}=dims;
    const beta = parseFloat(betaEl.value);
    ctx.clearRect(0,0,w,h);
    // de Broglie: group velocity is the particle speed, phase velocity is c^2/v.
    // Drawn in arbitrary display units with the SAME ratio vp/vg = 1/beta^2.
    const vg = 120*beta;                       // px per second on screen
    const vp = Math.min(900, vg/(beta*beta));
    const k0 = 0.085, lam = 2*Math.PI/k0;      // carrier wavenumber, wavelength
    const sigma = Math.max(46, w*0.10);        // half-width of the packet
    const midY = h*0.54, amp = h*0.23;

    // A genuinely localised packet, not an endless beat: one Gaussian envelope
    // that crosses the screen and wraps.
    const period = w + 4*sigma;
    const xc = -2*sigma + (((vg*t) % period) + period) % period;
    const env = x => Math.exp(-Math.pow((x-xc)/sigma, 2));

    // the single infinite de Broglie wave, for contrast: it localises nothing
    ctx.strokeStyle='rgba(138,141,146,0.35)'; ctx.lineWidth=1.2;
    ctx.beginPath();
    for(let x=0;x<=w;x++){
      const y = midY - amp*0.30*Math.cos(k0*(x - vp*t));
      x===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
    }
    ctx.stroke();

    // envelope
    ctx.strokeStyle='rgba(31,111,120,0.7)'; ctx.lineWidth=1.6; ctx.setLineDash([5,3]);
    for(const sgn of [1,-1]){
      ctx.beginPath();
      for(let x=0;x<=w;x++){
        const y = midY - sgn*amp*env(x);
        x===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
      }
      ctx.stroke();
    }
    ctx.setLineDash([]);
    // the packet itself
    ctx.strokeStyle='#a4342c'; ctx.lineWidth=2.2;
    ctx.beginPath();
    for(let x=0;x<=w;x++){
      const y = midY - amp*env(x)*Math.cos(k0*(x - vp*t));
      x===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
    }
    ctx.stroke();

    // a marker riding the envelope: this is what moves at the particle's speed
    ctx.fillStyle='#1f6f78';
    ctx.beginPath(); ctx.arc(xc, midY-amp, 6, 0, 7); ctx.fill();
    ctx.strokeStyle='#fff'; ctx.lineWidth=1.5; ctx.stroke();

    // and one riding a single crest. Crests sit at x = vp*t + n*lam; follow one
    // n until it has run out of the front of the packet, then pick up another
    // at the back — which is exactly what the crests are seen to do.
    if(crestN===null) crestN = Math.round((xc - vp*t)/lam - 1.3);
    let xcrest = vp*t + crestN*lam;
    if(xcrest - xc > 1.5*sigma){
      crestN = Math.round((xc - vp*t)/lam - 1.3);
      xcrest = vp*t + crestN*lam;
    }
    if(Math.abs(xcrest-xc) < 2.2*sigma && xcrest>=0 && xcrest<=w){
      ctx.fillStyle='#1c1d20';
      ctx.beginPath(); ctx.arc(xcrest, midY - amp*env(xcrest), 4.5, 0, 7); ctx.fill();
      ctx.strokeStyle='#fff'; ctx.lineWidth=1.4; ctx.stroke();
    }

    ctx.font='11px Helvetica,Arial,sans-serif'; ctx.textAlign='left';
    ctx.fillStyle='#1f6f78'; ctx.fillText('the packet — travels at the group velocity = the particle speed', 12, 16);
    ctx.fillStyle='#1c1d20'; ctx.fillText('a single crest — travels at the phase velocity, faster than light', 12, 32);
    ctx.fillStyle='#8a8d92'; ctx.fillText('one endless de Broglie wave — everywhere at once, so it is nowhere', 12, 48);
    ctx.textAlign='right';
    ctx.fillText('crests are born at the back and die off the front', w-12, h-10);
  }

  function drawPlot(){
    const {ctx,w,h}=fitCanvas(cPlot);
    const beta = parseFloat(betaEl.value);
    ctx.clearRect(0,0,w,h);
    const m={l:52,r:16,t:22,b:34};
    const {X,Y}=drawAxes(ctx,w,h,m,0,1,0,4,'β = v/c','velocity / c',{nx:5,ny:4});
    const vpPts=[], vgPts=[];
    for(let b=0.02;b<=1;b+=0.004){ vpPts.push({x:b,y:1/b}); vgPts.push({x:b,y:b}); }
    plotLine(ctx,X,Y,[{x:0,y:1},{x:1,y:1}],'#c7c2b5',1.4,[4,3]);
    plotLine(ctx,X,Y,vpPts,'#1c1d20',2.4);
    plotLine(ctx,X,Y,vgPts,'#1f6f78',2.4);
    dotAt(ctx,X,Y,beta,Math.min(4,1/beta),'#1c1d20',5);
    dotAt(ctx,X,Y,beta,beta,'#1f6f78',5);
    ctx.font='11px Helvetica,Arial,sans-serif'; ctx.textAlign='left';
    ctx.fillStyle='#1c1d20'; ctx.fillText('phase velocity  v_p = c²/v', m.l+8, m.t+14);
    ctx.fillStyle='#1f6f78'; ctx.fillText('group velocity  v_g = v', m.l+8, m.t+30);
    ctx.fillStyle='#8a8d92'; ctx.fillText('c', m.l+8, Y(1)-5);
  }

  function draw(){
    const beta = parseFloat(betaEl.value);
    betaVal.textContent = fmt(beta,3);
    drawWave(); drawPlot();
    const gamma = 1/Math.sqrt(1-beta*beta);
    const KEkeV = (gamma-1)*511;
    const lam_pm = HC_EV_PM/Math.sqrt(Math.pow((gamma-1)*511e3 + 511e3,2) - Math.pow(511e3,2));
    readout.innerHTML = `
      <div>particle speed v <b>${fmt(beta,3)}c</b></div>
      <div>&gamma; <b>${fmt(gamma,4)}</b></div>
      <div>group velocity v<sub>g</sub> <b>${fmt(beta,4)}c</b> <span class="badge ok">= the particle</span></div>
      <div>phase velocity v<sub>p</sub> = c&sup2;/v <b>${fmt(1/beta,4)}c</b>
        ${1/beta>1?'<span class="badge no">exceeds c</span>':''}</div>
      <div>v<sub>p</sub> &times; v<sub>g</sub> <b>${fmt(1,4)}c&sup2;</b></div>
      <div>electron KE at this speed <b>${KEkeV<1000?fmt(KEkeV,1)+' keV':fmt(KEkeV/1000,3)+' MeV'}</b></div>
      <div>its de Broglie &lambda; <b>${fmt(lam_pm,3)} pm</b></div>`;
  }

  function loop(now){
    const dt = Math.min(0.05,(now-lastFrame)/1000); lastFrame = now;
    const visible = document.getElementById('ch3') && document.getElementById('ch3').classList.contains('active');
    if(visible && runEl.checked && !prefersReducedMotion()){ t += dt; drawWave(); }
    requestAnimationFrame(loop);
  }
  betaEl.addEventListener('input',()=>{ crestN=null; draw(); });
  runEl.addEventListener('change',()=>{ lastFrame = performance.now(); });
  registerCanvas('pg_canvas_plot',drawPlot);
  requestAnimationFrame(loop);
}

/* =====================================================================
   3. DAVISSON-GERMER ELECTRON DIFFRACTION
   ===================================================================== */
function setupDavissonGermer(){
  const cPolar=document.getElementById('dg_canvas');
  const cScan =document.getElementById('dg_canvas_scan');
  const VEl=document.getElementById('dg_V'), VVal=document.getElementById('dg_V_val');
  const dEl=document.getElementById('dg_d'), dVal=document.getElementById('dg_d_val');
  const readout=document.getElementById('dg_readout');
  const THETA_BRAGG = 65;        // fixed by the crystal's plane family, as in Fig. 3.8
  const PHI_PEAK = 50;           // = 180 - 2*65, the direction the detector sees

  // Non-relativistic de Broglie wavelength of an electron accelerated through V volts,
  // in nm: lambda = h/sqrt(2 m e V).
  function lambdaOf(V){ return H_J/Math.sqrt(2*M_E*EV_J*V)*1e9; }

  function physics(){
    const V = parseFloat(VEl.value), d = parseFloat(dEl.value);
    const lam = lambdaOf(V);                       // nm
    const lamMatch = 2*d*Math.sin(THETA_BRAGG*Math.PI/180);  // nm the crystal wants
    const amp = Math.exp(-Math.pow((lam-lamMatch)/0.020,2)); // how well it is satisfied
    return {V,d,lam,lamMatch,amp};
  }
  function intensity(phiDeg, p){
    return 0.30 + 0.70*p.amp*Math.exp(-Math.pow((phiDeg-PHI_PEAK)/9,2));
  }

  function drawPolar(){
    const {ctx,w,h}=fitCanvas(cPolar);
    const p = physics();
    ctx.clearRect(0,0,w,h);
    const cx=w/2, cy=h-26, R=Math.min(w*0.40, h-54);

    // guide arcs and angle ticks; 0 deg is straight up, along the incident beam
    ctx.strokeStyle='#eee9de'; ctx.lineWidth=1;
    [0.25,0.5,0.75,1].forEach(f=>{
      ctx.beginPath(); ctx.arc(cx,cy,R*f,Math.PI,2*Math.PI); ctx.stroke();
    });
    ctx.font='10px Helvetica,Arial,sans-serif'; ctx.fillStyle='#b9b3a4';
    for(let a=0;a<=90;a+=30){
      for(const s of [-1,1]){
        if(a===0 && s<0) continue;
        const rad=(s*a)*Math.PI/180;
        const x=cx+R*1.06*Math.sin(rad), y=cy-R*1.06*Math.cos(rad);
        ctx.textAlign='center'; ctx.fillText(a+'°', x, y);
      }
    }
    // incident beam
    ctx.strokeStyle='#8a8d92'; ctx.lineWidth=2; ctx.setLineDash([5,3]);
    ctx.beginPath(); ctx.moveTo(cx,cy-R*1.0); ctx.lineTo(cx,cy); ctx.stroke(); ctx.setLineDash([]);

    // the scattered-intensity lobe
    ctx.fillStyle='rgba(164,52,44,0.16)'; ctx.strokeStyle='#a4342c'; ctx.lineWidth=2.2;
    ctx.beginPath();
    for(let a=-90;a<=90;a+=1){
      const r = R*intensity(Math.abs(a), p);
      const rad=a*Math.PI/180;
      const x=cx+r*Math.sin(rad), y=cy-r*Math.cos(rad);
      if(a===-90) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.stroke(); ctx.lineTo(cx,cy); ctx.closePath(); ctx.fill();

    // mark the 50 degree direction
    const rad=PHI_PEAK*Math.PI/180, rr=R*intensity(PHI_PEAK,p);
    ctx.strokeStyle='#1f6f78'; ctx.lineWidth=1.6; ctx.setLineDash([3,3]);
    ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx+R*1.02*Math.sin(rad), cy-R*1.02*Math.cos(rad)); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle='#1f6f78';
    ctx.beginPath(); ctx.arc(cx+rr*Math.sin(rad), cy-rr*Math.cos(rad), 5, 0, 7); ctx.fill();

    ctx.font='12px Helvetica,Arial,sans-serif'; ctx.fillStyle='#1c1d20'; ctx.textAlign='left';
    ctx.fillText(`${fmt(p.V,0)} V electrons`, 12, 18);
    ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle='#5a5d63';
    ctx.fillText(`nickel crystal, detector sweeps the scattering angle`, 12, 34);
    ctx.textAlign='right'; ctx.fillStyle='#1f6f78';
    ctx.fillText(`50° — where Davisson and Germer saw their peak`, w-12, 18);
  }

  function drawScan(){
    const {ctx,w,h}=fitCanvas(cScan);
    const p = physics();
    ctx.clearRect(0,0,w,h);
    const m={l:54,r:16,t:22,b:34};
    const {X,Y}=drawAxes(ctx,w,h,m,30,80,0,0.26,'accelerating voltage (V)','λ (nm)',{nx:5,ny:4,yfmt:v=>v.toFixed(2)});
    const pts=[]; for(let V=30;V<=80;V+=0.5) pts.push({x:V,y:lambdaOf(V)});
    plotLine(ctx,X,Y,pts,'#a4342c',2.4);
    // the wavelength the crystal will diffract
    plotLine(ctx,X,Y,[{x:30,y:p.lamMatch},{x:80,y:p.lamMatch}],'#1f6f78',2,[5,3]);
    dotAt(ctx,X,Y,p.V,Math.min(0.26,p.lam),'#1c1d20',5);
    ctx.font='11px Helvetica,Arial,sans-serif'; ctx.textAlign='left';
    ctx.fillStyle='#a4342c'; ctx.fillText('de Broglie λ = h/√(2m·eV)', m.l+8, m.t+14);
    ctx.fillStyle='#1f6f78';
    ctx.fillText(`2d sin65° = ${fmt(p.lamMatch,3)} nm — the wavelength this crystal diffracts`, m.l+8, Y(p.lamMatch)-7);
    // where they cross
    const Vmatch = H_J*H_J/(2*M_E*EV_J*Math.pow(p.lamMatch*1e-9,2));
    if(Vmatch>=30 && Vmatch<=80){
      plotLine(ctx,X,Y,[{x:Vmatch,y:0},{x:Vmatch,y:p.lamMatch}],'#8a8d92',1.3,[3,3]);
      ctx.fillStyle='#1c1d20'; ctx.textAlign='center';
      ctx.fillText(`match at ${fmt(Vmatch,0)} V`, X(Vmatch), h-m.b+30);
    }
  }

  function draw(){
    const p = physics();
    VVal.textContent = fmt(p.V,0); dVal.textContent = fmt(p.d,3);
    drawPolar(); drawScan();
    const nOrder = p.lamMatch/p.lam;
    readout.innerHTML = `
      <div>accelerating voltage <b>${fmt(p.V,0)} V</b></div>
      <div>electron &lambda; = h/&radic;(2m&middot;eV) <b>${fmt(p.lam,4)} nm</b></div>
      <div>plane spacing d <b>${fmt(p.d,3)} nm</b></div>
      <div>Bragg angle &theta; <b>65&deg;</b> (fixed by the crystal)</div>
      <div>2d sin&theta; <b>${fmt(p.lamMatch,4)} nm</b></div>
      <div>&lambda; / 2d sin&theta; <b>${fmt(1/nOrder,4)}</b></div>
      <div>peak strength <b>${fmt(p.amp*100,0)}%</b>
        ${p.amp>0.9?'<span class="badge ok">diffraction condition met</span>':''}</div>`;
  }
  VEl.addEventListener('input',draw); dEl.addEventListener('input',draw);
  registerCanvas('dg_canvas',draw);
  registerCanvas('dg_canvas_scan',draw);
}

/* =====================================================================
   4. PARTICLE IN A BOX
   ===================================================================== */
function setupParticleBox(){
  const cWave=document.getElementById('pb_canvas');
  const cLevels=document.getElementById('pb_canvas_levels');
  const massEl=document.getElementById('pb_mass');
  const LEl=document.getElementById('pb_L'), LVal=document.getElementById('pb_L_val');
  const nEl=document.getElementById('pb_n'), nVal=document.getElementById('pb_n_val');
  const readout=document.getElementById('pb_readout');

  function physics(){
    const m = parseFloat(massEl.value);
    const L = Math.pow(10, parseFloat(LEl.value));   // metres
    const n = parseInt(nEl.value,10);
    const En = j => j*j*H_J*H_J/(8*m*L*L);           // joules
    return {m,L,n,En, E1:En(1), Ecur:En(n), lam:2*L/n, v:Math.sqrt(2*En(n)/m)};
  }

  function fmtEnergy(J){
    const eV = J/EV_J;
    if(eV >= 1e6) return fmt(eV/1e6,3)+' MeV';
    if(eV >= 1e3) return fmt(eV/1e3,3)+' keV';
    if(eV >= 1e-3) return fmt(eV,3)+' eV';
    return fmtSci(J,3)+' J';
  }
  function fmtLen(mtr){
    if(mtr>=1e-2) return fmt(mtr*100,2)+' cm';
    if(mtr>=1e-3) return fmt(mtr*1000,2)+' mm';
    if(mtr>=1e-6) return fmt(mtr*1e6,2)+' \u00b5m';
    if(mtr>=1e-12) return fmt(mtr*1e9,3)+' nm';
    return fmt(mtr*1e12,3)+' pm';
  }

  function drawWave(){
    const {ctx,w,h}=fitCanvas(cWave);
    const p = physics();
    ctx.clearRect(0,0,w,h);
    const bx0=58, bx1=w-40;
    const topY=h*0.10, midY=h*0.40, botY=h*0.86;

    // the walls
    ctx.fillStyle='#efebe2';
    ctx.fillRect(bx0-13,topY-8,13,botY-topY+16);
    ctx.fillRect(bx1,topY-8,13,botY-topY+16);
    ctx.strokeStyle='#1c1d20'; ctx.lineWidth=2.2;
    ctx.beginPath(); ctx.moveTo(bx0,topY-8); ctx.lineTo(bx0,botY+8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(bx1,topY-8); ctx.lineTo(bx1,botY+8); ctx.stroke();
    ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle='#8a8d92'; ctx.textAlign='center';
    ctx.fillText(`L = ${fmtLen(p.L)}`, (bx0+bx1)/2, botY+22);

    // psi_n, and |psi_n|^2 beneath it
    const amp=(midY-topY)*0.86;
    ctx.strokeStyle='#a4342c'; ctx.lineWidth=2.4;
    ctx.beginPath();
    for(let x=bx0;x<=bx1;x++){
      const u=(x-bx0)/(bx1-bx0);
      const y = midY - amp*Math.sin(p.n*Math.PI*u);
      if(x===bx0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.stroke();
    ctx.strokeStyle='#e7e4dc'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(bx0,midY); ctx.lineTo(bx1,midY); ctx.stroke();

    const amp2=(botY-midY)*0.80;
    ctx.fillStyle='rgba(31,111,120,0.20)'; ctx.strokeStyle='#1f6f78'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(bx0,botY);
    for(let x=bx0;x<=bx1;x++){
      const u=(x-bx0)/(bx1-bx0);
      ctx.lineTo(x, botY - amp2*Math.pow(Math.sin(p.n*Math.PI*u),2));
    }
    ctx.lineTo(bx1,botY); ctx.closePath(); ctx.fill();
    ctx.beginPath();
    for(let x=bx0;x<=bx1;x++){
      const u=(x-bx0)/(bx1-bx0);
      const y = botY - amp2*Math.pow(Math.sin(p.n*Math.PI*u),2);
      if(x===bx0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.stroke();

    // nodes: n-1 of them, and they are why the energy is quantised
    ctx.fillStyle='#1c1d20';
    for(let j=1;j<p.n;j++){
      const x = bx0 + (bx1-bx0)*j/p.n;
      ctx.beginPath(); ctx.arc(x,midY,3.2,0,7); ctx.fill();
    }
    ctx.textAlign='left'; ctx.font='11px Helvetica,Arial,sans-serif';
    ctx.fillStyle='#a4342c'; ctx.fillText(`ψ${p.n}`, 12, midY-amp+4);
    ctx.fillStyle='#1f6f78'; ctx.fillText(`|ψ${p.n}|²`, 12, botY-amp2*0.5);
    ctx.fillStyle='#5a5d63'; ctx.textAlign='right';
    ctx.fillText(`λ = 2L/n = ${fmtLen(p.lam)}`, bx1-10, topY-10);
    ctx.textAlign='left'; ctx.fillStyle='#8a8d92';
    ctx.fillText(`${p.n-1} node${p.n===2?'':'s'} inside the box`, 12, h-8);
  }

  function drawLevels(){
    const {ctx,w,h}=fitCanvas(cLevels);
    const p = physics();
    ctx.clearRect(0,0,w,h);
    const m={l:70,r:20,t:22,b:30};
    const NMAX=6;
    const top=p.En(NMAX)*1.12;
    const Y = E => h-m.b - (E/top)*(h-m.b-m.t);
    ctx.strokeStyle='#1c1d20'; ctx.lineWidth=1.3;
    ctx.beginPath(); ctx.moveTo(m.l,m.t); ctx.lineTo(m.l,h-m.b); ctx.stroke();
    ctx.font='11px Helvetica,Arial,sans-serif';
    for(let j=1;j<=NMAX;j++){
      const y=Y(p.En(j)), on=(j===p.n);
      ctx.strokeStyle = on ? '#a4342c' : '#c7c2b5';
      ctx.lineWidth = on ? 2.8 : 1.5;
      ctx.beginPath(); ctx.moveTo(m.l,y); ctx.lineTo(w-m.r,y); ctx.stroke();
      ctx.fillStyle = on ? '#a4342c' : '#8a8d92'; ctx.textAlign='right';
      ctx.fillText('n = '+j, m.l-8, y+4);
      ctx.textAlign='left';
      ctx.fillText(fmtEnergy(p.En(j)), m.l+8, y-5);
    }
    ctx.fillStyle='#1c1d20'; ctx.textAlign='center'; ctx.font='11px Helvetica,Arial,sans-serif';
    ctx.fillText('E ∝ n²  — the spacing grows, it never closes up', m.l+(w-m.l-m.r)/2, h-8);
    ctx.save(); ctx.translate(15, m.t+(h-m.b-m.t)/2); ctx.rotate(-Math.PI/2);
    ctx.fillText('energy',0,0); ctx.restore();
  }

  function draw(){
    const p = physics();
    LVal.textContent = fmtLen(p.L); nVal.textContent = p.n;
    drawWave(); drawLevels();
    // the quantum number a classical object at a plausible speed would carry
    const vClassical = 0.333;                       // m/s, Beiser's marble
    const nClassical = Math.sqrt(0.5*p.m*vClassical*vClassical/p.E1);
    readout.innerHTML = `
      <div>mass <b>${fmtSci(p.m,3)} kg</b></div>
      <div>box width L <b>${fmtLen(p.L)}</b></div>
      <div>&lambda;<sub>n</sub> = 2L/n <b>${fmtLen(p.lam)}</b></div>
      <div>E&#8321; = h&sup2;/8mL&sup2; <b>${fmtEnergy(p.E1)}</b></div>
      <div>E<sub>${p.n}</sub> = ${p.n}&sup2;E&#8321; <b>${fmtEnergy(p.Ecur)}</b></div>
      <div>speed at E<sub>${p.n}</sub> <b>${fmtSci(p.v,3)} m/s</b></div>
      <div>n for a speed of 1/3 m/s <b>${nClassical>1e6?fmtSci(nClassical,2):fmt(nClassical,1)}</b>
        ${nClassical>1e12?'<span class="badge no">levels indistinguishable</span>':''}</div>`;
  }
  massEl.addEventListener('change',draw);
  LEl.addEventListener('input',draw);
  nEl.addEventListener('input',draw);
  registerCanvas('pb_canvas',draw);
  registerCanvas('pb_canvas_levels',draw);
}

/* =====================================================================
   5. BUILDING A WAVE PACKET  (why Dx.Dp has a floor)
   ===================================================================== */
function setupWavePacket(){
  const cSum=document.getElementById('wp_canvas');
  const cSpec=document.getElementById('wp_canvas_spec');
  const nEl=document.getElementById('wp_n'), nVal=document.getElementById('wp_n_val');
  const spreadEl=document.getElementById('wp_spread'), spreadVal=document.getElementById('wp_spread_val');
  const readout=document.getElementById('wp_readout');

  function physics(){
    const N = parseInt(nEl.value,10);
    const spread = parseFloat(spreadEl.value);       // fractional spread in k
    const k0 = 0.10;                                 // px^-1, the carrier
    const dk = k0*spread;
    return {N,spread,k0,dk};
  }

  function drawSum(){
    const {ctx,w,h}=fitCanvas(cSum);
    const p = physics();
    ctx.clearRect(0,0,w,h);
    const midY=h*0.56, amp=h*0.34;

    // a few of the component waves, faintly
    ctx.lineWidth=1; ctx.strokeStyle='rgba(138,141,146,0.30)';
    for(let i=0;i<p.N;i++){
      const k = p.N===1 ? p.k0 : p.k0 + p.dk*(2*i/(p.N-1) - 1);
      ctx.beginPath();
      for(let x=0;x<=w;x+=2){
        const y = midY - (amp*0.22)*Math.cos(k*(x-w/2));
        if(x===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      }
      ctx.stroke();
      if(i>10) break;
    }

    // Their sum, plus its envelope. The envelope is the modulus of the analytic
    // signal — summing the sines as well as the cosines — because the raw sum
    // oscillates through zero every carrier half-cycle, so measuring the packet
    // width off |sum| would just measure one ripple rather than the packet.
    let peak=0, envPeak=0;
    const vals=[], env=[];
    for(let x=0;x<=w;x++){
      let re=0, im=0;
      for(let i=0;i<p.N;i++){
        const k = p.N===1 ? p.k0 : p.k0 + p.dk*(2*i/(p.N-1) - 1);
        re += Math.cos(k*(x-w/2));
        im += Math.sin(k*(x-w/2));
      }
      re/=p.N; im/=p.N;
      const e = Math.hypot(re,im);
      vals.push(re); env.push(e);
      peak=Math.max(peak,Math.abs(re)); envPeak=Math.max(envPeak,e);
    }
    // envelope, drawn faintly above and below
    ctx.strokeStyle='rgba(31,111,120,0.45)'; ctx.lineWidth=1.5; ctx.setLineDash([5,3]);
    for(const sgn of [1,-1]){
      ctx.beginPath();
      env.forEach((e,x)=>{
        const y = midY - sgn*amp*e/(envPeak||1);
        if(x===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      });
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.strokeStyle='#a4342c'; ctx.lineWidth=2.2;
    ctx.beginPath();
    vals.forEach((s,x)=>{
      const y = midY - amp*s/(peak||1);
      if(x===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    });
    ctx.stroke();

    // packet half-width: where the ENVELOPE first falls to 1/e of its peak
    let halfWidth = w/2;
    for(let x=Math.floor(w/2); x<w; x++){
      if(env[x]/envPeak < 0.3679){ halfWidth = x-w/2; break; }
    }
    ctx.strokeStyle='#1f6f78'; ctx.lineWidth=1.6; ctx.setLineDash([4,3]);
    [w/2-halfWidth, w/2+halfWidth].forEach(x=>{
      ctx.beginPath(); ctx.moveTo(x,midY-amp*1.05); ctx.lineTo(x,h-18); ctx.stroke();
    });
    ctx.setLineDash([]);
    ctx.fillStyle='#1f6f78'; ctx.font='11px Helvetica,Arial,sans-serif'; ctx.textAlign='center';
    ctx.fillText(`packet width Δx`, w/2, h-5);
    ctx.textAlign='left'; ctx.fillStyle='#8a8d92';
    ctx.fillText(`${p.N} wave${p.N===1?'':'s'} added together`, 12, 16);
    ctx.fillStyle='#a4342c';
    ctx.fillText(p.N===1 ? 'one wavelength alone: infinitely long, position completely unknown'
                         : 'their sum: localised, because they cancel away from the centre', 12, 32);
    return halfWidth;
  }

  function drawSpec(){
    const {ctx,w,h}=fitCanvas(cSpec);
    const p = physics();
    ctx.clearRect(0,0,w,h);
    const m={l:48,r:16,t:22,b:34};
    const kmin=p.k0*0.4, kmax=p.k0*1.6;
    const {X,Y}=drawAxes(ctx,w,h,m,kmin,kmax,0,1.15,'wave number k  (momentum p = ℏk)','amount of each k',
                         {nx:4,ny:4,xfmt:v=>v.toFixed(3),yfmt:()=>''});
    for(let i=0;i<p.N;i++){
      const k = p.N===1 ? p.k0 : p.k0 + p.dk*(2*i/(p.N-1) - 1);
      if(k<kmin||k>kmax) continue;
      plotLine(ctx,X,Y,[{x:k,y:0},{x:k,y:1}], '#1f6f78', p.N>30?1.2:2.2);
    }
    if(p.dk>0){
      ctx.strokeStyle='#a4342c'; ctx.lineWidth=1.6; ctx.setLineDash([4,3]);
      [p.k0-p.dk,p.k0+p.dk].forEach(k=>{
        if(k<kmin||k>kmax) return;
        ctx.beginPath(); ctx.moveTo(X(k),m.t); ctx.lineTo(X(k),h-m.b); ctx.stroke();
      });
      ctx.setLineDash([]);
      ctx.fillStyle='#a4342c'; ctx.font='11px Helvetica,Arial,sans-serif'; ctx.textAlign='center';
      ctx.fillText(`Δk`, X(p.k0), m.t+13);
    }
  }

  function draw(){
    const p = physics();
    nVal.textContent = p.N;
    spreadVal.textContent = fmt(p.spread*100,0)+'%';
    const halfWidth = drawSum();
    drawSpec();
    // Dx.Dk in the display's own units: the dimensionless product is what matters
    const product = p.dk>0 ? halfWidth*p.dk : Infinity;
    readout.innerHTML = `
      <div>waves superposed <b>${p.N}</b></div>
      <div>spread in k <b>&plusmn;${fmt(p.spread*100,0)}%</b></div>
      <div>&Delta;k <b>${p.dk>0?fmt(p.dk,4):'0'}</b></div>
      <div>packet width &Delta;x <b>${p.dk>0?fmt(halfWidth,0)+' px':'unbounded'}</b></div>
      <div>&Delta;x &middot; &Delta;k <b>${isFinite(product)?fmt(product,2):'&mdash;'}</b>
        <span class="badge ok">never below ~½</span></div>
      <div>since p = &#8463;k <b>&Delta;x&middot;&Delta;p &ge; &#8463;/2</b></div>`;
  }
  nEl.addEventListener('input',draw);
  spreadEl.addEventListener('input',draw);
  registerCanvas('wp_canvas',draw);
  registerCanvas('wp_canvas_spec',draw);
}

/* =====================================================================
   6. APPLYING THE UNCERTAINTY PRINCIPLE
   ===================================================================== */
function setupUncertaintyApplied(){
  const canvas=document.getElementById('ua_canvas');
  const sizeEl=document.getElementById('ua_size'), sizeVal=document.getElementById('ua_size_val');
  const partEl=document.getElementById('ua_particle');
  const readout=document.getElementById('ua_readout');

  // reference energies to judge the answer against
  const REFS = [
    [13.6,        'hydrogen ground state'],
    [1.0e6,       'typical chemical → nuclear divide'],
    [0.511e6,     'electron rest energy'],
    [20e6,        'max energy of nuclear beta electrons'],
    [938.3e6,     'proton rest energy']
  ];

  function physics(){
    const dx = Math.pow(10, parseFloat(sizeEl.value));   // m
    const m  = parseFloat(partEl.value);
    const dp = HBAR/(2*dx);                              // the floor on momentum
    // If pc is comparable with the rest energy the estimate must be relativistic.
    const E0 = m*C_EXACT*C_EXACT;
    const pc = dp*C_EXACT;
    const E  = Math.sqrt(E0*E0 + pc*pc);
    const KE = E - E0;
    return {dx,m,dp,pc,E0,KE,relativistic: pc > 0.3*E0};
  }

  function draw(){
    const {ctx,w,h}=fitCanvas(canvas);
    const p = physics();
    sizeVal.textContent = p.dx>=1e-9 ? fmt(p.dx*1e9,3)+' nm' : fmt(p.dx*1e15,2)+' fm';
    ctx.clearRect(0,0,w,h);

    const m={l:46,r:26};
    const lgMin=0, lgMax=10;          // eV, from 1 eV to 10 GeV
    const axisY=h*0.60;
    const X = logAxis(ctx, w, m, lgMin, lgMax, axisY, 'minimum kinetic energy (eV)');

    REFS.forEach(([E,label],i)=>{
      const px=X(E);
      if(px<m.l||px>w-m.r) return;
      ctx.strokeStyle='#e7e4dc'; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(px,axisY+6); ctx.lineTo(px,axisY+30+ (i%2)*16); ctx.stroke();
      ctx.fillStyle='#b9b3a4'; ctx.font='10px Helvetica,Arial,sans-serif';
      ctx.textAlign = px>w*0.72?'right':'left';
      ctx.fillText(label, px+(px>w*0.72?-4:4), axisY+42+(i%2)*16);
    });

    const keEv = p.KE/EV_J;
    const raw = X(keEv);
    const px = Math.max(m.l, Math.min(w-m.r, raw));
    ctx.strokeStyle='#a4342c'; ctx.lineWidth=2.6;
    ctx.beginPath(); ctx.moveTo(px,axisY); ctx.lineTo(px,axisY-64); ctx.stroke();
    ctx.fillStyle='#a4342c'; ctx.beginPath(); ctx.arc(px,axisY-64,5.5,0,7); ctx.fill();
    ctx.font='12px Helvetica,Arial,sans-serif';
    ctx.textAlign = px>w*0.6?'right':'left';
    const shown = keEv>=1e6 ? fmt(keEv/1e6,1)+' MeV' : (keEv>=1e3 ? fmt(keEv/1e3,1)+' keV' : fmt(keEv,2)+' eV');
    ctx.fillText(`≥ ${shown}`, px+(px>w*0.6?-10:10), axisY-70);

    ctx.font='12px Helvetica,Arial,sans-serif'; ctx.textAlign='left'; ctx.fillStyle='#1c1d20';
    const pname = p.m===M_E ? 'electron' : 'proton';
    ctx.fillText(`confine an ${pname} to ${p.dx>=1e-9?fmt(p.dx*1e9,3)+' nm':fmt(p.dx*1e15,2)+' fm'}`, m.l, 20);
    ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle='#5a5d63';
    ctx.fillText(p.relativistic ? 'pc is comparable with mc² here, so the estimate uses E² = (mc²)² + (pc)²'
                                : 'pc ≪ mc² here, so the non-relativistic p²/2m is accurate', m.l, 36);

    readout.innerHTML = `
      <div>confinement &Delta;x <b>${p.dx>=1e-9?fmt(p.dx*1e9,4)+' nm':fmt(p.dx*1e15,3)+' fm'}</b></div>
      <div>&Delta;p &ge; &#8463;/2&Delta;x <b>${fmtSci(p.dp,3)} kg m/s</b></div>
      <div>pc <b>${fmtSci(p.pc/EV_J/1e6,3)} MeV</b></div>
      <div>rest energy mc&sup2; <b>${fmt(p.E0/EV_J/1e6,3)} MeV</b></div>
      <div>minimum KE <b>${shown}</b></div>
      <div>regime <b>${p.relativistic?'relativistic':'non-relativistic'}</b></div>`;
  }
  sizeEl.addEventListener('input',draw);
  partEl.addEventListener('change',draw);
  registerCanvas('ua_canvas',draw);
}

/* =====================================================================
   7. ENERGY, TIME, AND THE NATURAL WIDTH OF A SPECTRAL LINE
   ===================================================================== */
function setupEnergyTime(){
  const canvas=document.getElementById('et_canvas');
  const tauEl=document.getElementById('et_tau'), tauVal=document.getElementById('et_tau_val');
  const nuEl=document.getElementById('et_nu'), nuVal=document.getElementById('et_nu_val');
  const readout=document.getElementById('et_readout');

  function physics(){
    const tau = Math.pow(10, parseFloat(tauEl.value));    // s
    const nu0 = parseFloat(nuEl.value)*1e14;              // Hz
    const dE = HBAR/(2*tau);                              // J
    const dNu = dE/H_J;                                   // Hz
    return {tau,nu0,dE,dNu, rel:dNu/nu0};
  }

  function draw(){
    const {ctx,w,h}=fitCanvas(canvas);
    const p = physics();
    tauVal.textContent = fmtSci(p.tau,1)+' s';
    nuVal.textContent = fmt(p.nu0/1e14,2);
    ctx.clearRect(0,0,w,h);

    const m={l:56,r:18,t:24,b:36};
    // plot a Lorentzian across +/- 6 natural widths
    const span = 6*p.dNu;
    const {X,Y}=drawAxes(ctx,w,h,m,-span,span,0,1.12,'frequency offset from ν₀  (Hz)','intensity',
                         {nx:4,ny:4,xfmt:v=>fmtSci(v,1),yfmt:()=>''});
    const pts=[];
    for(let f=-span; f<=span; f+=span/240){
      pts.push({x:f, y: 1/(1 + Math.pow(2*f/p.dNu,2))});
    }
    plotLine(ctx,X,Y,pts,'#a4342c',2.6);
    // half-maximum width
    plotLine(ctx,X,Y,[{x:-p.dNu/2,y:0.5},{x:p.dNu/2,y:0.5}],'#1f6f78',2);
    [-p.dNu/2,p.dNu/2].forEach(f=>plotLine(ctx,X,Y,[{x:f,y:0},{x:f,y:0.5}],'#1f6f78',1.3,[3,3]));
    ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle='#1f6f78'; ctx.textAlign='center';
    ctx.fillText(`Δν ≈ ${fmtSci(p.dNu,2)} Hz`, X(0), Y(0.5)-8);
    ctx.fillStyle='#a4342c'; ctx.textAlign='left';
    ctx.fillText(`a state that lives ${fmtSci(p.tau,1)} s cannot have a sharper frequency than this`, m.l+8, m.t+13);

    readout.innerHTML = `
      <div>state lifetime &Delta;t <b>${fmtSci(p.tau,2)} s</b></div>
      <div>&Delta;E &ge; &#8463;/2&Delta;t <b>${fmtSci(p.dE,2)} J</b></div>
      <div>&Delta;E in eV <b>${fmtSci(p.dE/EV_J,2)} eV</b></div>
      <div>&Delta;&nu; = &Delta;E/h <b>${fmtSci(p.dNu,2)} Hz</b></div>
      <div>transition &nu;&#8320; <b>${fmtSci(p.nu0,2)} Hz</b></div>
      <div>&Delta;&nu;/&nu;&#8320; <b>${fmtSci(p.rel,2)}</b></div>
      <div>quality of the line <b>${fmtSci(1/p.rel,2)}</b> (ν₀/Δν)</div>`;
  }
  tauEl.addEventListener('input',draw);
  nuEl.addEventListener('input',draw);
  registerCanvas('et_canvas',draw);
}

// register with the loader in app.js
registerModule('setupDeBroglie', setupDeBroglie);
registerModule('setupPhaseGroup', setupPhaseGroup);
registerModule('setupDavissonGermer', setupDavissonGermer);
registerModule('setupParticleBox', setupParticleBox);
registerModule('setupWavePacket', setupWavePacket);
registerModule('setupUncertaintyApplied', setupUncertaintyApplied);
registerModule('setupEnergyTime', setupEnergyTime);
