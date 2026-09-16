/* =====================================================================
   Concepts of Modern Physics — Interactive Companion
   Chapter 11: Nuclear Structure
   Atomic masses come from nuclides.js (Beiser's own Appendix table).
   Everything else is computed live from the chapter's formulas.
   ===================================================================== */

const U_MEV   = 931.49;        // MeV per atomic mass unit
const M_H_U   = 1.007825;      // atomic mass of 1H, u
const M_N_U   = 1.008665;      // neutron mass, u
const U_KG    = 1.6605e-27;    // kg per u
const R0_FM   = 1.2;           // R = R0 A^(1/3), fm
const MU_N_EV = 3.152e-8;      // nuclear magneton, eV/T
const MU_N_J  = 5.051e-27;     // nuclear magneton, J/T
const KE2_N   = 8.99e9;        // 1/4 pi eps0, N m^2 / C^2
const HBARC_MEVFM = 197.327;   // hbar c, MeV fm

// von Weizsäcker coefficients, Beiser's set (MeV)
const SEMF = {a1:14.1, a2:13.0, a3:0.595, a4:19.0, a5:33.5};
const K_EV_11 = 8.617e-5;   // Boltzmann constant, eV/K

// index the nuclide table
const NUC = {};
NUCLIDES.forEach(([Z,A,m,ab,st])=>{ NUC[Z+'_'+A]={Z,A,m,ab,st,sym:EL[Z]}; });
function nucName(Z,A){ return `<sup>${A}</sup>${EL[Z]||'?'}`; }

// measured binding energy from the mass defect — Eq. (11.7)
function bindingEnergy(Z,A){
  const r=NUC[Z+'_'+A];
  if(!r) return null;
  return (Z*M_H_U + (A-Z)*M_N_U - r.m)*U_MEV;
}
// the semi-empirical formula — Eq. (11.18)
function semf(Z,A,c){
  c=c||SEMF;
  const pair = (Z%2===0 && (A-Z)%2===0) ? 1 : ((Z%2===1 && (A-Z)%2===1) ? -1 : 0);
  return c.a1*A
       - c.a2*Math.pow(A,2/3)
       - c.a3*Z*(Z-1)/Math.pow(A,1/3)
       - c.a4*Math.pow(A-2*Z,2)/A
       + pair*c.a5/Math.pow(A,0.75);
}

/* =====================================================================
   1. HOW BIG, HOW DENSE, HOW REPULSIVE
   ===================================================================== */
function setupNuclearSize(){
  const canvas=document.getElementById('ns_canvas');
  const profCanvas=document.getElementById('ns_profile');
  const aEl=document.getElementById('ns_a'), aVal=document.getElementById('ns_a_val');
  const sEl=document.getElementById('ns_sep'), sVal=document.getElementById('ns_sep_val');
  const readout=document.getElementById('ns_readout');

  function radius(A){ return R0_FM*Math.cbrt(A); }

  // a deterministic packing of A nucleons inside the sphere, for the picture
  function pack(A,R){
    const out=[]; let s=12345;
    const rnd=()=>{ s=(s*1103515245+12345)&0x7fffffff; return s/0x7fffffff; };
    let guard=0;
    while(out.length<A && guard<A*400){
      guard++;
      const u=rnd(), v=rnd(), w=rnd();
      const rr=R*Math.cbrt(u), th=Math.acos(2*v-1), ph=2*Math.PI*w;
      const x=rr*Math.sin(th)*Math.cos(ph), y=rr*Math.sin(th)*Math.sin(ph), z=rr*Math.cos(th);
      if(out.every(p=>(p.x-x)**2+(p.y-y)**2+(p.z-z)**2 > 1.5)) out.push({x,y,z});
    }
    return out;
  }

  let cache={};
  function draw(){
    const {ctx,w,h}=fitCanvas(canvas);
    const A=parseInt(aEl.value,10);
    aVal.textContent=A;
    const R=radius(A);
    ctx.fillStyle='#fbfaf7'; ctx.fillRect(0,0,w,h);

    // fixed scale in fm/px so the growth with A is visible
    const Rmax=radius(250), S=(h*0.42)/Rmax;
    const cx=w/2, cy=h/2;
    // a uranium-sized outline for comparison
    ctx.save(); ctx.strokeStyle='#e0dbd0'; ctx.lineWidth=1.4; ctx.setLineDash([4,4]);
    ctx.beginPath(); ctx.arc(cx,cy,Rmax*S,0,7); ctx.stroke(); ctx.restore();

    const key='p'+A;
    if(!cache[key]) cache[key]=pack(A,R);
    const pts=cache[key].slice().sort((a,b)=>a.z-b.z);
    // guess a plausible Z for the colouring from the line of stability
    const Zs=Math.round(zStable(A));
    ctx.save();
    pts.forEach((p,i)=>{
      const depth=(p.z+R)/(2*R);
      ctx.globalAlpha=0.45+0.55*depth;
      ctx.fillStyle = i%A < Zs ? '#a4342c' : '#1f6f78';
      ctx.beginPath(); ctx.arc(cx+p.x*S, cy-p.y*S, Math.max(1.6,0.62*S), 0, 7); ctx.fill();
    });
    ctx.restore();
    ctx.save(); ctx.strokeStyle='#9aa0a6'; ctx.lineWidth=1; ctx.setLineDash([2,3]);
    ctx.beginPath(); ctx.arc(cx,cy,R*S,0,7); ctx.stroke(); ctx.restore();

    ctx.save(); ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle='#5a5d63';
    ctx.textAlign='center';
    ctx.fillText(`A = ${A}, R = 1.2 A⅓ = ${fmt(R,2)} fm`, cx, h-12);
    ctx.textAlign='left';
    ctx.fillStyle='#a4342c'; ctx.fillText('protons', 14, 20);
    ctx.fillStyle='#1f6f78'; ctx.fillText('neutrons', 74, 20);
    ctx.fillStyle='#b0aa9c'; ctx.fillText('dashed circle: uranium, A = 250, at the same scale', 14, 37);
    // scale bar
    ctx.strokeStyle='#1c1d20'; ctx.lineWidth=1.6; ctx.setLineDash([]);
    const bx=w-24-5*S, by=h-22;
    ctx.beginPath(); ctx.moveTo(bx,by); ctx.lineTo(bx+5*S,by); ctx.stroke();
    ctx.fillStyle='#1c1d20'; ctx.textAlign='right'; ctx.fillText('5 fm', bx-8, by+4);
    ctx.restore();

    drawProfile();

    const Rm=R*1e-15;
    const rho=A*U_KG/((4/3)*Math.PI*Rm*Rm*Rm);
    const sep=parseFloat(sEl.value); sVal.textContent=fmt(sep,2);
    const F=KE2_N*EV_J*EV_J/Math.pow(sep*1e-15,2);
    const acc=F/M_P;
    const nsR=1e4, nsM=1.4*M_SUN;
    const rhoNS=nsM/((4/3)*Math.PI*nsR*nsR*nsR);
    const earthAsNucleus=Math.cbrt(M_EARTH/rho*3/(4*Math.PI));
    readout.innerHTML = `
      <div>mass number <b>A = ${A}</b> → radius <b>${fmt(R,2)} fm</b>; doubling R needs 8× the nucleons</div>
      <div>volume per nucleon <b>${fmt((4/3)*Math.PI*Math.pow(R0_FM,3),2)} fm³</b> — the same for every nucleus</div>
      <div>nuclear density <b>${fmtSci(rho,3)} kg/m³</b>
        <span class="badge ok">independent of A</span></div>
      <div>&nbsp;&nbsp;= ${fmtSci(rho/1e3/1e6,2)} tonnes per cm³, or about ${fmtSci(rho*1.6387e-5/1e3/1e9,1)} billion tonnes per cubic inch</div>
      <div>a neutron star (1.4 M<sub>☉</sub> in a 10 km sphere) is <b>${fmtSci(rhoNS,2)} kg/m³</b> — ${fmt(rhoNS/rho,1)}× nuclear density</div>
      <div>the Earth at nuclear density would be a ball <b>${fmt(earthAsNucleus*2/1000,2)} km</b> across</div>
      <div>two protons ${fmt(sep,2)} fm apart repel with <b>${fmt(F,1)} N</b> — ${fmt(F/4.448,1)} pounds, on a particle of mass 1.7×10⁻²⁷ kg</div>
      <div>that force would accelerate one at <b>${fmtSci(acc,2)} m/s²</b> = ${fmtSci(acc/G_EARTH,2)} g</div>`;
  }

  // Woods-Saxon density profile, which is what electron scattering actually measures
  function drawProfile(){
    const {ctx,w,h}=fitCanvas(profCanvas);
    const A=parseInt(aEl.value,10);
    const m={l:60,r:18,t:22,b:40};
    const {X,Y}=drawAxes(ctx,w,h,m,0,11,0,1.25,'radial distance (fm)','relative nucleon density',
      {nx:11,ny:5,xfmt:v=>v.toFixed(0),yfmt:v=>v.toFixed(2)});
    const a=0.55;   // surface diffuseness, fm
    [[59,'Co','#c9c4b8'],[197,'Au','#c9c4b8'],[A,'',   '#a4342c']].forEach(([AA,lab,col],i)=>{
      const R=radius(AA), pts=[];
      for(let r=0;r<=11;r+=0.02) pts.push({x:r,y:1/(1+Math.exp((r-R)/a))});
      plotLine(ctx,X,Y,pts,col,i===2?2.8:1.6);
      if(i===2){
        plotLine(ctx,X,Y,[{x:R,y:0},{x:R,y:0.5}],'#a4342c',1.2,[3,3]);
        dotAt(ctx,X,Y,R,0.5,'#a4342c',5);
      } else {
        ctx.save(); ctx.font='10px Helvetica,Arial,sans-serif'; ctx.fillStyle='#9a9384'; ctx.textAlign='left';
        ctx.fillText(`${AA}${lab}`, X(radius(AA))+4, Y(0.55)); ctx.restore();
      }
    });
    ctx.save(); ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle='#5a5d63'; ctx.textAlign='right';
    ctx.fillText('flat inside, and the same skin thickness whatever the size', w-m.r-8, m.t+14);
    ctx.textAlign='left'; ctx.fillStyle='#a4342c';
    ctx.fillText(`R = 1.2 A⅓ is where the density is half its central value`, m.l+10, m.t+14);
    ctx.restore();
  }

  aEl.addEventListener('input',draw);
  sEl.addEventListener('input',draw);
  registerCanvas('ns_canvas',draw);
  registerCanvas('ns_profile',draw);
}

// the SEMF's line of maximum stability — derived in Example 11.7
function zStable(A){
  const {a3,a4}=SEMF;
  const A23=Math.pow(A,2/3);
  return (4*a4*A + a3*A23)/(2*a3*A23 + 8*a4);
}

/* =====================================================================
   2. NUCLEAR SPIN, THE MAGNETON, AND NMR
   ===================================================================== */
function setupNMR(){
  const canvas=document.getElementById('nm_canvas');
  const nucEl=document.getElementById('nm_nuc');
  const bEl=document.getElementById('nm_b'), bVal=document.getElementById('nm_b_val');
  const readout=document.getElementById('nm_readout');

  // magnetic moment in nuclear magnetons, and spin I
  const NMR = {
    H1:  {label:'¹H  (proton)',     mu: 2.79285, I:0.5, ab:99.99},
    H2:  {label:'²H  (deuteron)',   mu: 0.85744, I:1.0, ab:0.015},
    C13: {label:'¹³C',              mu: 0.70241, I:0.5, ab:1.11},
    N14: {label:'¹⁴N',              mu: 0.40376, I:1.0, ab:99.63},
    F19: {label:'¹⁹F',              mu: 2.62887, I:0.5, ab:100},
    Na23:{label:'²³Na',             mu: 2.21752, I:1.5, ab:100},
    P31: {label:'³¹P',              mu: 1.13160, I:0.5, ab:100},
    n:   {label:'neutron',          mu:-1.91304, I:0.5, ab:0}
  };

  function draw(){
    const {ctx,w,h}=fitCanvas(canvas);
    const k=nucEl.value, nu=NMR[k], B=parseFloat(bEl.value);
    bVal.textContent=fmt(B,2);

    const m={l:70,r:150,t:24,b:40};
    ctx.fillStyle='#fbfaf7'; ctx.fillRect(0,0,w,h);

    // energy levels as a function of B, for a spin-I nucleus: 2I+1 sublevels
    const twoI=Math.round(2*nu.I);
    const Bmax=Math.max(3, B*1.2);
    const gamma=nu.mu/nu.I;              // in nuclear magnetons per unit spin
    const dEmax=Math.abs(gamma)*MU_N_EV*Bmax;
    const X=b=>m.l+(b/Bmax)*(w-m.l-m.r);
    const Y=e=>h/2 - (e/(dEmax*(twoI/2)+1e-30))*(h/2-m.t-10);

    // gridlines
    ctx.save(); ctx.strokeStyle='#e7e4dc'; ctx.lineWidth=1;
    for(let i=0;i<=4;i++){ const px=X(Bmax*i/4);
      ctx.beginPath(); ctx.moveTo(px,m.t); ctx.lineTo(px,h-m.b); ctx.stroke(); }
    ctx.strokeStyle='#1c1d20'; ctx.lineWidth=1.3;
    ctx.beginPath(); ctx.moveTo(m.l,m.t); ctx.lineTo(m.l,h-m.b); ctx.lineTo(w-m.r,h-m.b); ctx.stroke();
    ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle='#8a8d92'; ctx.textAlign='center';
    for(let i=0;i<=4;i++) ctx.fillText(fmt(Bmax*i/4,1), X(Bmax*i/4), h-m.b+16);
    ctx.fillStyle='#1c1d20';
    ctx.fillText('magnetic field B (T)', m.l+(w-m.l-m.r)/2, h-8);
    ctx.save(); ctx.translate(16,h/2); ctx.rotate(-Math.PI/2);
    ctx.fillText('magnetic energy  U = −μ_z B', 0,0); ctx.restore();
    ctx.restore();

    // the 2I+1 sublevels fan out linearly in B
    for(let i=0;i<=twoI;i++){
      const mI=nu.I-i;
      const E=-gamma*MU_N_EV*mI;         // eV per tesla
      const col = i===0 ? '#1f6f78' : (i===twoI ? '#a4342c' : '#8a6d1f');
      plotLine(ctx,X,Y,[{x:0,y:0},{x:Bmax,y:E*Bmax}],col,2.2);
      ctx.save(); ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle=col; ctx.textAlign='left';
      ctx.fillText(`m_I = ${mI===0?'0':(mI>0?'+':'−')+fmt(Math.abs(mI),mI%1?1:0)}`, w-m.r+8, Y(E*Bmax)+4);
      ctx.restore();
    }
    // the transition at the chosen field
    if(B>0.001 && twoI>0){
      const step=Math.abs(gamma)*MU_N_EV*B;
      const yTop=Y(Math.abs(gamma)*MU_N_EV*B*nu.I), yBot=Y(-Math.abs(gamma)*MU_N_EV*B*nu.I);
      ctx.save(); ctx.strokeStyle='#1c1d20'; ctx.lineWidth=1.6;
      ctx.beginPath(); ctx.moveTo(X(B),Math.min(yTop,yBot)); ctx.lineTo(X(B),Math.max(yTop,yBot)); ctx.stroke();
      ctx.setLineDash([3,3]); ctx.strokeStyle='#9aa0a6';
      ctx.beginPath(); ctx.moveTo(X(B),m.t); ctx.lineTo(X(B),h-m.b); ctx.stroke();
      ctx.restore();
      ctx.save(); ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle='#1c1d20'; ctx.textAlign='right';
      ctx.fillText(`ΔE = ${fmtSci(step,2)} eV per step`, X(B)-8, m.t+16);
      ctx.restore();
    }
    ctx.save(); ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle='#5a5d63'; ctx.textAlign='left';
    ctx.fillText(`${nu.label}: I = ${nu.I}, μ = ${fmt(nu.mu,4)} μ_N → ${twoI+1} sublevel${twoI?'s':''}`, m.l+10, m.t+16);
    ctx.restore();

    // the numbers
    const dE=Math.abs(gamma)*MU_N_EV*B;              // eV between adjacent sublevels
    const nuL=dE/H_EV;                                // Hz
    const lam=nuL>0?C/nuL:Infinity;
    const kT=K_EV_11*300;
    const excess=dE/(2*kT);                           // fractional population difference, dE << kT
    const muB=9.274e-24;
    readout.innerHTML = `
      <div>nucleus <b>${nu.label}</b>, spin I = ${nu.I}, moment <b>${fmt(nu.mu,5)} μ<sub>N</sub></b>
        ${nu.ab?`<span class="badge">${fmt(nu.ab,2)}% natural abundance</span>`:''}</div>
      <div>nuclear magneton μ<sub>N</sub> = eℏ/2m<sub>p</sub> <b>${fmtSci(MU_N_J,4)} J/T</b> = ${fmtSci(MU_N_EV,4)} eV/T</div>
      <div>&nbsp;&nbsp;smaller than the Bohr magneton by <b>${fmt(muB/MU_N_J,0)}</b> — the proton/electron mass ratio</div>
      <div>at B = ${fmt(B,2)} T: ΔE <b>${fmtSci(dE,4)} eV</b></div>
      <div>Larmor frequency ν = ΔE/h <b>${fmt(nuL/1e6,3)} MHz</b>
        <span class="badge">${fmt(nuL/1e6/Math.max(B,1e-9),2)} MHz per tesla</span></div>
      <div>wavelength <b>${isFinite(lam)?fmt(lam,3)+' m':'—'}</b> — radio waves, which pass straight through tissue</div>
      <div>kT at 300 K is <b>${fmt(kT/dE,0)}×</b> this splitting, so the population excess in the lower state is only
        <b>${fmtSci(excess,2)}</b> — about ${fmt(excess*1e6,0)} nuclei per million</div>`;
  }
  nucEl.addEventListener('change',draw);
  bEl.addEventListener('input',draw);
  registerCanvas('nm_canvas',draw);
}

/* =====================================================================
   3. THE MASS DEFECT AND THE BINDING-ENERGY CURVE
   ===================================================================== */
function setupBindingCurve(){
  const canvas=document.getElementById('bc_canvas');
  const barCanvas=document.getElementById('bc_bars');
  const zEl=document.getElementById('bc_z'), zVal=document.getElementById('bc_z_val');
  const aEl=document.getElementById('bc_a'), aVal=document.getElementById('bc_a_val');
  const readout=document.getElementById('bc_readout');

  function draw(){
    const {ctx,w,h}=fitCanvas(canvas);
    const m={l:62,r:18,t:22,b:42};
    const {X,Y}=drawAxes(ctx,w,h,m,0,250,0,10,'mass number A','binding energy per nucleon (MeV)',
      {nx:5,ny:5,xfmt:v=>v.toFixed(0),yfmt:v=>v.toFixed(0)});

    // every nuclide in the table, stable ones emphasised
    const stable=[], unstable=[];
    NUCLIDES.forEach(([Z,A,mm,ab,st])=>{
      const E=(Z*M_H_U+(A-Z)*M_N_U-mm)*U_MEV/A;
      (st?stable:unstable).push({x:A,y:E});
    });
    ctx.save();
    unstable.forEach(p=>{ ctx.fillStyle='rgba(154,147,132,0.45)';
      ctx.beginPath(); ctx.arc(X(p.x),Y(p.y),2,0,7); ctx.fill(); });
    stable.forEach(p=>{ ctx.fillStyle='#a4342c';
      ctx.beginPath(); ctx.arc(X(p.x),Y(p.y),2.4,0,7); ctx.fill(); });
    ctx.restore();

    // the SEMF curve along the line of stability, for comparison
    const th=[];
    for(let A=4;A<=250;A++){ const Z=Math.round(zStable(A)); th.push({x:A,y:semf(Z,A)/A}); }
    plotLine(ctx,X,Y,th,'#1f6f78',1.8,[5,4]);

    // the peak and the selected nuclide
    let best=null;
    NUCLIDES.forEach(([Z,A,mm,ab,st])=>{
      if(!st) return;
      const E=(Z*M_H_U+(A-Z)*M_N_U-mm)*U_MEV/A;
      if(!best||E>best.E) best={Z,A,E};
    });
    dotAt(ctx,X,Y,best.A,best.E,'#8a6d1f',5.5);
    const Zs=parseInt(zEl.value,10), As=parseInt(aEl.value,10);
    const Eb=bindingEnergy(Zs,As);
    if(Eb!=null){ dotAt(ctx,X,Y,As,Eb/As,'#1c1d20',6); }

    // a few landmark labels
    ctx.save(); ctx.font='10px Helvetica,Arial,sans-serif'; ctx.textAlign='center';
    [[4,2,'⁴He'],[12,6,'¹²C'],[56,26,'⁵⁶Fe'],[238,92,'²³⁸U']].forEach(([A,Z,lab])=>{
      const E=bindingEnergy(Z,A); if(E==null) return;
      ctx.fillStyle='#5a5d63'; ctx.fillText(lab, X(A), Y(E/A)-8);
    });
    ctx.textAlign='left'; ctx.font='11px Helvetica,Arial,sans-serif';
    ctx.fillStyle='#a4342c'; ctx.fillText('stable nuclides (measured masses)', m.l+10, m.t+14);
    ctx.fillStyle='#9a9384'; ctx.fillText('radioactive nuclides', m.l+10, m.t+29);
    ctx.fillStyle='#1f6f78'; ctx.fillText('the liquid-drop formula', m.l+10, m.t+44);
    ctx.textAlign='right'; ctx.fillStyle='#8a6d1f';
    ctx.fillText(`peak: ${EL[best.Z]}-${best.A} at ${fmt(best.E,4)} MeV/nucleon`, w-m.r-8, m.t+14);
    // fusion / fission arrows
    ctx.fillStyle='#5a5d63'; ctx.textAlign='center';
    ctx.fillText('◀ fusion releases energy', X(35), Y(2.2));
    ctx.fillText('fission releases energy ▶', X(180), Y(2.2));
    ctx.restore();

    drawBars();

    const r=NUC[Zs+'_'+As];
    if(!r){
      readout.innerHTML=`<div>no nuclide with Z = ${Zs}, A = ${As} in Beiser's table — try another combination</div>`;
      return;
    }
    const expected=Zs*M_H_U+(As-Zs)*M_N_U;
    const defect=expected-r.m;
    const pred=semf(Zs,As);
    // separation energies
    const nSep=(NUC[Zs+'_'+(As-1)]) ? (NUC[Zs+'_'+(As-1)].m+M_N_U-r.m)*U_MEV : null;
    const pSep=(NUC[(Zs-1)+'_'+(As-1)]) ? (NUC[(Zs-1)+'_'+(As-1)].m+M_H_U-r.m)*U_MEV : null;
    readout.innerHTML = `
      <div>nuclide <b>${nucName(Zs,As)}</b> — Z = ${Zs}, N = ${As-Zs}
        <span class="badge ${r.st?'ok':'no'}">${r.st?'stable':'radioactive'}</span>
        ${r.ab?`<span class="badge">${fmt(r.ab,3)}% of natural ${EL[Zs]}</span>`:''}</div>
      <div>Z·m(¹H) + N·m(n) = <b>${fmt(expected,6)} u</b>, but the atom weighs <b>${fmt(r.m,6)} u</b></div>
      <div>mass defect <b>${fmt(defect,6)} u</b> — ${fmt(defect/expected*100,3)}% of the mass simply is not there</div>
      <div>binding energy <b>${fmt(Eb,2)} MeV</b>, or <b>${fmt(Eb/As,3)} MeV per nucleon</b></div>
      <div>liquid-drop prediction <b>${fmt(pred,1)} MeV</b>
        <span class="badge ${Math.abs(pred-Eb)/Eb<0.01?'ok':''}">${(pred-Eb)>0?'+':''}${fmt((pred-Eb)/Eb*100,2)}%</span></div>
      ${nSep!=null?`<div>energy to pull out one neutron <b>${fmt(nSep,2)} MeV</b></div>`:''}
      ${pSep!=null?`<div>energy to pull out one proton <b>${fmt(pSep,2)} MeV</b>${nSep!=null&&pSep<nSep?' — less, because the proton is also pushed out electrically':''}</div>`:''}
      <div>in everyday units <b>${fmtSci(Eb*1e6*EV_J/(As*U_KG)/1000,2)} kJ/kg</b>; vaporising water takes 2260 kJ/kg</div>`;
  }

  // what fission and fusion actually pay out
  function drawBars(){
    const {ctx,w,h}=fitCanvas(barCanvas);
    const m={l:66,r:20,t:26,b:62};
    const REACTIONS=[
      {lab:'²H + ³H → ⁴He + n', have:[[1,2],[1,3]], make:[[2,4]], free:1, note:'fusion — a tokamak'},
      {lab:'²H + ²H → ⁴He',     have:[[1,2],[1,2]], make:[[2,4]], free:0, note:'fusion'},
      {lab:'4¹H → ⁴He',         have:[[1,1],[1,1],[1,1],[1,1]], make:[[2,4]], free:0, note:'the Sun'},
      {lab:'²³⁵U → A ≈ 95 + 140', curve:{parent:[92,235], frags:[[42,95],[58,140]]}, note:'fission'},
      {lab:'²³⁴U → ²³⁰Th + ⁴He', have:[[92,234]], make:[[90,230],[2,4]], free:0, note:'alpha decay'}
    ];
    const vals=REACTIONS.map(rx=>{
      if(rx.curve){
        // Beiser's own estimate: A times the gain in binding energy per nucleon
        const [pz,pa]=rx.curve.parent;
        const ep=bindingEnergy(pz,pa)/pa;
        let tot=0, n=0;
        rx.curve.frags.forEach(([z,a])=>{ tot+=bindingEnergy(z,a); n+=a; });
        const ef=tot/n;
        return {...rx, Q:(ef-ep)*pa, A:pa, perNucleon:ef-ep, est:true};
      }
      let mi=0, mo=0, ok=true;
      rx.have.forEach(([z,a])=>{ const n=NUC[z+'_'+a]; if(!n) ok=false; else mi+=n.m; });
      rx.make.forEach(([z,a])=>{ const n=NUC[z+'_'+a]; if(!n) ok=false; else mo+=n.m; });
      mo += rx.free*M_N_U;
      const Q = ok ? (mi-mo)*U_MEV : null;
      const A = rx.have.reduce((s,[z,a])=>s+a,0);
      return {...rx, Q, A, perNucleon: Q!=null?Q/A:null};
    });
    const maxQ=Math.max(...vals.map(v=>v.Q||0))*1.15;
    const {X,Y}=drawAxes(ctx,w,h,m,-0.5,vals.length-0.5,0,maxQ,'','energy released Q (MeV)',
      {nx:vals.length-1,ny:5,xfmt:()=>'',yfmt:v=>v.toFixed(0)});
    const bw=(w-m.l-m.r)/vals.length*0.5;
    ctx.save(); ctx.font='10px Helvetica,Arial,sans-serif';
    vals.forEach((v,i)=>{
      if(v.Q==null) return;
      const fus = v.note.indexOf('fusion')===0 || v.note==='the Sun';
      ctx.fillStyle=fus ? '#1f6f78' : '#a4342c';
      ctx.globalAlpha=0.85; ctx.fillRect(X(i)-bw/2, Y(v.Q), bw, Y(0)-Y(v.Q)); ctx.globalAlpha=1;
      ctx.fillStyle='#1c1d20'; ctx.textAlign='center';
      ctx.fillText(`${fmt(v.Q,1)} MeV`, X(i), Y(v.Q)-6);
      ctx.fillText(v.lab, X(i), h-m.b+15);
      ctx.fillStyle=fus?'#1f6f78':'#a4342c';
      ctx.fillText(v.note, X(i), h-m.b+28);
      ctx.fillStyle='#8a8d92';
      ctx.fillText(`${fmt(v.perNucleon,2)} MeV per nucleon`, X(i), h-m.b+41);
    });
    ctx.textAlign='left'; ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle='#5a5d63';
    ctx.fillText('every Q computed from the measured atomic masses, not looked up', m.l+8, m.t-8);
    ctx.textAlign='right'; ctx.fillStyle='#9a9384';
    ctx.fillText('fission: the binding-energy-curve estimate, since real fragments are neutron-rich', w-m.r-8, m.t-8);
    ctx.restore();
  }

  function sync(){
    zVal.textContent=zEl.value; aVal.textContent=aEl.value;
    draw();
  }
  zEl.addEventListener('input',sync);
  aEl.addEventListener('input',sync);
  registerCanvas('bc_canvas',draw);
  registerCanvas('bc_bars',draw);
}

/* =====================================================================
   4. THE LIQUID-DROP MODEL
   ===================================================================== */
function setupLiquidDrop(){
  const canvas=document.getElementById('ld_canvas');
  const resCanvas=document.getElementById('ld_resid');
  const ids=['a1','a2','a3','a4','a5'];
  const els={}; ids.forEach(k=>{ els[k]={s:document.getElementById('ld_'+k), v:document.getElementById('ld_'+k+'_val')}; });
  const readout=document.getElementById('ld_readout');

  function coeffs(){
    const c={}; ids.forEach(k=>{ c[k]=parseFloat(els[k].s.value); els[k].v.textContent=fmt(c[k],2); });
    return c;
  }

  function draw(){
    const {ctx,w,h}=fitCanvas(canvas);
    const c=coeffs();
    const m={l:64,r:18,t:22,b:42};
    const {X,Y}=drawAxes(ctx,w,h,m,0,250,-11,16,'mass number A','contribution to E_b/A (MeV)',
      {nx:5,ny:6,xfmt:v=>v.toFixed(0),yfmt:v=>v.toFixed(0)});
    plotLine(ctx,X,Y,[{x:0,y:0},{x:250,y:0}],'#c9c4b8',1);

    const vol=[],sur=[],cou=[],asy=[],tot=[];
    for(let A=4;A<=250;A++){
      const Z=Math.round(zStable(A));
      vol.push({x:A,y:c.a1});
      sur.push({x:A,y:-c.a2/Math.cbrt(A)});
      cou.push({x:A,y:-c.a3*Z*(Z-1)/(Math.pow(A,1/3)*A)});
      asy.push({x:A,y:-c.a4*Math.pow(A-2*Z,2)/(A*A)});
      tot.push({x:A,y:semf(Z,A,{a1:c.a1,a2:c.a2,a3:c.a3,a4:c.a4,a5:c.a5})/A});
    }
    plotLine(ctx,X,Y,vol,'#8a6d1f',1.8,[5,4]);
    plotLine(ctx,X,Y,sur,'#5b3f8a',1.8,[5,4]);
    plotLine(ctx,X,Y,cou,'#1f6f78',1.8,[5,4]);
    plotLine(ctx,X,Y,asy,'#c2701f',1.8,[5,4]);
    plotLine(ctx,X,Y,tot,'#a4342c',2.8);

    // the measured points underneath
    ctx.save();
    NUCLIDES.forEach(([Z,A,mm,ab,st])=>{
      if(!st) return;
      const E=(Z*M_H_U+(A-Z)*M_N_U-mm)*U_MEV/A;
      ctx.fillStyle='rgba(28,29,32,0.35)';
      ctx.beginPath(); ctx.arc(X(A),Y(E),1.8,0,7); ctx.fill();
    });
    ctx.restore();

    ctx.save(); ctx.font='11px Helvetica,Arial,sans-serif'; ctx.textAlign='right';
    ctx.fillStyle='#8a6d1f'; ctx.fillText('volume  +a₁', w-m.r-8, Y(c.a1)-6);
    ctx.fillStyle='#5b3f8a'; ctx.fillText('surface  −a₂/A⅓', w-m.r-8, Y(-c.a2/Math.cbrt(250))-6);
    ctx.fillStyle='#1f6f78'; ctx.fillText('Coulomb  −a₃Z(Z−1)/A⁴ᐟ³', w-m.r-8, Y(cou[cou.length-1].y)+14);
    ctx.fillStyle='#c2701f'; ctx.fillText('asymmetry  −a₄(A−2Z)²/A²', w-m.r-8, Y(asy[asy.length-1].y)+14);
    ctx.textAlign='left'; ctx.fillStyle='#a4342c'; ctx.fillText('their sum', m.l+10, Y(tot[60].y)-8);
    ctx.fillStyle='#5a5d63'; ctx.fillText('grey dots: the measured stable nuclides', m.l+10, m.t+14);
    ctx.restore();

    drawResid(c);

    // how well does it do?
    let n=0, sum=0, worst=null;
    NUCLIDES.forEach(([Z,A,mm,ab,st])=>{
      if(!st||A<16) return;
      const E=(Z*M_H_U+(A-Z)*M_N_U-mm)*U_MEV;
      const p=semf(Z,A,c);
      const err=Math.abs(p-E)/E*100;
      sum+=err; n++;
      if(!worst||err>worst.err) worst={Z,A,err,E,p};
    });
    const zn=semf(30,64,c), znMeas=bindingEnergy(30,64);
    readout.innerHTML = `
      <div>coefficients a₁ = ${fmt(c.a1,2)}, a₂ = ${fmt(c.a2,2)}, a₃ = ${fmt(c.a3,3)}, a₄ = ${fmt(c.a4,2)}, a₅ = ${fmt(c.a5,2)} MeV</div>
      <div>over all <b>${n}</b> stable nuclides with A ≥ 16, mean error <b>${fmt(sum/n,3)}%</b></div>
      <div>worst case ${nucName(worst.Z,worst.A)}: predicted ${fmt(worst.p,1)} vs measured ${fmt(worst.E,1)} MeV
        <span class="badge no">${fmt(worst.err,2)}%</span></div>
      <div>Example 11.6, ${nucName(30,64)}: measured <b>${fmt(znMeas,1)} MeV</b>, formula <b>${fmt(zn,1)} MeV</b>
        <span class="badge ${Math.abs(zn-znMeas)/znMeas<0.01?'ok':''}">${fmt(Math.abs(zn-znMeas)/znMeas*100,2)}%</span></div>
      <div>at A = 250 the four terms are volume ${fmt(c.a1,1)}, surface ${fmt(-c.a2/Math.cbrt(250),2)},
        Coulomb ${fmt(cou[cou.length-1].y,2)}, asymmetry ${fmt(asy[asy.length-1].y,2)} MeV per nucleon</div>
      <div>the curve peaks because surface loss dies away as A grows while Coulomb loss keeps growing</div>`;
  }

  // residuals: where the smooth model fails is exactly where the shells are
  function drawResid(c){
    const {ctx,w,h}=fitCanvas(resCanvas);
    const m={l:64,r:18,t:22,b:42};
    const {X,Y}=drawAxes(ctx,w,h,m,0,150,-12,12,'neutron number N','measured − predicted binding energy (MeV)',
      {nx:5,ny:6,xfmt:v=>v.toFixed(0),yfmt:v=>v.toFixed(0)});
    plotLine(ctx,X,Y,[{x:0,y:0},{x:150,y:0}],'#c9c4b8',1.4);
    const MAGIC=[2,8,20,28,50,82,126];
    MAGIC.forEach(M=>{
      plotLine(ctx,X,Y,[{x:M,y:-12},{x:M,y:12}],'#e0d4c0',1.6);
      ctx.save(); ctx.font='10px Helvetica,Arial,sans-serif'; ctx.fillStyle='#a08a5a'; ctx.textAlign='center';
      ctx.fillText(M, X(M), m.t-6); ctx.restore();
    });
    // the residuals, and a moving average so the shell bumps stand out against
    // the model's overall drift
    const byN={};
    NUCLIDES.forEach(([Z,A,mm,ab,st])=>{
      if(!st) return;
      const N=A-Z;
      const d=(Z*M_H_U+(A-Z)*M_N_U-mm)*U_MEV - semf(Z,A,c);
      (byN[N]=byN[N]||[]).push(d);
    });
    ctx.save();
    Object.keys(byN).forEach(N=>{
      const n=+N, magic=MAGIC.indexOf(n)>=0;
      byN[N].forEach(d=>{
        ctx.fillStyle= magic ? '#a4342c' : 'rgba(31,111,120,0.5)';
        ctx.beginPath(); ctx.arc(X(n),Y(Math.max(-12,Math.min(12,d))), magic?3.4:2.2,0,7); ctx.fill();
      });
    });
    ctx.restore();
    const avg=[];
    for(let N=4;N<=145;N++){
      let s=0,k=0;
      for(let j=N-7;j<=N+7;j++) if(byN[j]) byN[j].forEach(d=>{s+=d;k++;});
      if(k>=4) avg.push({x:N,y:Math.max(-12,Math.min(12,s/k))});
    }
    plotLine(ctx,X,Y,avg,'#8a6d1f',2.2);
    ctx.save(); ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle='#5a5d63'; ctx.textAlign='right';
    ctx.fillText('above the trend = more tightly bound than the liquid drop predicts', w-m.r-8, m.t+14);
    ctx.textAlign='left'; ctx.fillStyle='#a4342c';
    ctx.fillText('red: N is a magic number', m.l+10, m.t+14);
    ctx.fillStyle='#8a6d1f'; ctx.fillText('gold: the local trend, so the shell bumps show', m.l+10, m.t+29);
    ctx.restore();
  }

  ids.forEach(k=>els[k].s.addEventListener('input',draw));
  document.getElementById('ld_reset').addEventListener('click',()=>{
    els.a1.s.value=14.1; els.a2.s.value=13.0; els.a3.s.value=0.595;
    els.a4.s.value=19.0; els.a5.s.value=33.5; draw();
  });
  registerCanvas('ld_canvas',draw);
  registerCanvas('ld_resid',draw);
}

/* =====================================================================
   5. THE VALLEY OF STABILITY
   ===================================================================== */
function setupValley(){
  const chartCanvas=document.getElementById('vs_chart');
  const isoCanvas=document.getElementById('vs_iso');
  const aEl=document.getElementById('vs_a'), aVal=document.getElementById('vs_a_val');
  const readout=document.getElementById('vs_readout');

  function drawChart(){
    const {ctx,w,h}=fitCanvas(chartCanvas);
    const m={l:56,r:18,t:22,b:42};
    const {X,Y}=drawAxes(ctx,w,h,m,0,95,0,150,'proton number Z','neutron number N',
      {nx:5,ny:5,xfmt:v=>v.toFixed(0),yfmt:v=>v.toFixed(0)});
    // N = Z reference
    plotLine(ctx,X,Y,[{x:0,y:0},{x:95,y:95}],'#c9c4b8',1.6,[5,4]);

    ctx.save();
    NUCLIDES.forEach(([Z,A,mm,ab,st])=>{
      const N=A-Z;
      ctx.fillStyle = st ? '#1c1d20' : 'rgba(154,147,132,0.40)';
      ctx.beginPath(); ctx.arc(X(Z),Y(N), st?2.6:1.8, 0, 7); ctx.fill();
    });
    ctx.restore();

    // the SEMF's own prediction of where stability lies
    const pred=[];
    for(let A=4;A<=250;A++){ const Z=zStable(A); pred.push({x:Z,y:A-Z}); }
    plotLine(ctx,X,Y,pred,'#a4342c',2.4);

    const A=parseInt(aEl.value,10);
    // the isobar line A = const
    plotLine(ctx,X,Y,[{x:Math.max(0,A-150),y:Math.min(150,A)},{x:Math.min(95,A),y:Math.max(0,A-95)}],'#1f6f78',1.6,[4,3]);

    ctx.save(); ctx.font='11px Helvetica,Arial,sans-serif'; ctx.textAlign='left';
    ctx.fillStyle='#1c1d20'; ctx.fillText('stable nuclides', m.l+10, m.t+14);
    ctx.fillStyle='#9a9384'; ctx.fillText('radioactive', m.l+10, m.t+29);
    ctx.fillStyle='#a4342c'; ctx.fillText('the liquid-drop formula’s prediction', m.l+10, m.t+44);
    ctx.fillStyle='#1f6f78'; ctx.fillText(`A = ${A}`, m.l+10, m.t+59);
    ctx.textAlign='right'; ctx.fillStyle='#8a8d92';
    ctx.fillText('N = Z', X(88), Y(92));
    ctx.restore();
  }

  function drawIsobar(){
    const {ctx,w,h}=fitCanvas(isoCanvas);
    const A=parseInt(aEl.value,10);
    const Zc=zStable(A);
    const zlo=Math.max(1,Math.round(Zc)-4), zhi=Math.min(A-1,Math.round(Zc)+4);
    const m={l:64,r:18,t:22,b:42};
    let vals=[];
    for(let Z=zlo;Z<=zhi;Z++) vals.push({Z, pred:semf(Z,A), meas:bindingEnergy(Z,A), rec:NUC[Z+'_'+A]});
    // zoom on the top of the parabola: that is where the physics is, and the
    // full span (a hundred MeV or more) would flatten it into a featureless arc
    const ys=vals.flatMap(v=>[v.pred, v.meas]).filter(v=>v!=null);
    const top=Math.max(...ys);
    const span=Math.max(10, 6*SEMF.a5/Math.pow(A,0.75));
    const ymax=top+span*0.12, ymin=top-span;
    const {X,Y}=drawAxes(ctx,w,h,m,zlo,zhi,ymin,ymax,'proton number Z','binding energy (MeV)',
      {nx:zhi-zlo,ny:5,xfmt:v=>Math.round(v).toFixed(0),yfmt:v=>v.toFixed(0)});

    // the same formula with the pairing term dropped: a single smooth parabola
    const smooth=[];
    for(let z=zlo;z<=zhi;z+=0.05){
      smooth.push({x:z, y: SEMF.a1*A - SEMF.a2*Math.pow(A,2/3)
        - SEMF.a3*z*(z-1)/Math.pow(A,1/3) - SEMF.a4*Math.pow(A-2*z,2)/A});
    }
    plotLine(ctx,X,Y,smooth,'#c9c4b8',1.8,[5,4]);

    // the formula at integer Z, with pairing — this is the zigzag
    plotLine(ctx,X,Y,vals.map(v=>({x:v.Z,y:v.pred})),'#1f6f78',1.4);
    vals.forEach(v=>dotAt(ctx,X,Y,v.Z,v.pred,'#1f6f78',3.4));
    // and the measured values
    vals.forEach(v=>{ if(v.meas!=null) dotAt(ctx,X,Y,v.Z,v.meas, v.rec&&v.rec.st?'#a4342c':'#9a9384', v.rec&&v.rec.st?6:4); });

    // the predicted best Z
    plotLine(ctx,X,Y,[{x:Zc,y:ymin},{x:Zc,y:ymax}],'#8a6d1f',1.6,[4,3]);
    ctx.save(); ctx.font='11px Helvetica,Arial,sans-serif'; ctx.textAlign='left';
    ctx.fillStyle='#8a6d1f'; ctx.fillText(`formula's optimum Z = ${fmt(Zc,2)}`, X(Zc)+6, m.t+14);
    ctx.fillStyle='#a4342c'; ctx.fillText('measured, stable', m.l+10, m.t+14);
    ctx.fillStyle='#9a9384'; ctx.fillText('measured, radioactive', m.l+10, m.t+29);
    ctx.fillStyle='#1f6f78'; ctx.fillText('liquid-drop formula at integer Z', m.l+10, m.t+44);
    ctx.restore();
    return {A,Zc,vals};
  }

  function draw(){
    const A=parseInt(aEl.value,10);
    aVal.textContent=A;
    drawChart();
    const {Zc,vals}=drawIsobar();
    const bestPred=vals.reduce((b,v)=>(!b||v.pred>b.pred)?v:b, null);
    const stable=vals.filter(v=>v.rec&&v.rec.st);
    const bestMeas=vals.filter(v=>v.meas!=null).reduce((b,v)=>(!b||v.meas>b.meas)?v:b, null);
    const pairTerm=SEMF.a5/Math.pow(A,0.75);
    readout.innerHTML = `
      <div>isobars of <b>A = ${A}</b></div>
      <div>the smooth optimum, dE<sub>b</sub>/dZ = 0, gives <b>Z = ${fmt(Zc,2)}</b></div>
      <div>with the pairing term at integer Z the formula picks <b>Z = ${bestPred.Z}</b> — ${nucName(bestPred.Z,A)}</div>
      <div>the measured masses put the maximum at <b>Z = ${bestMeas?bestMeas.Z:'—'}</b>${bestMeas?` — ${nucName(bestMeas.Z,A)}`:''}</div>
      <div>actually stable at this A: <b>${stable.length?stable.map(v=>nucName(v.Z,A)).join(', '):'none in the table'}</b></div>
      ${bestMeas?`<div>at that Z the formula gives ${fmt(bestPred.pred,1)} MeV against a measured ${fmt(bestMeas.meas,1)}
        <span class="badge ${Math.abs(bestPred.pred-bestMeas.meas)/bestMeas.meas<0.01?'ok':'no'}">${fmt(Math.abs(bestPred.pred-bestMeas.meas)/bestMeas.meas*100,2)}%</span>
        ${A<40?' — the formula always overshoots the light nuclei':''}</div>`:''}
      <div>pairing term ±a₅/A<sup>3/4</sup> = <b>±${fmt(pairTerm,2)} MeV</b> ${A%2===0?'— this is what makes the even-A zigzag':'— zero for every odd-A isobar, so no zigzag'}</div>
      <div>${A%2===0?'Even A: two parabolas, one for even-even and one for odd-odd. A nucleus on the upper one can often beta-decay in <em>either</em> direction, and several even-A values have two or three stable isobars.'
                   :'Odd A: one parabola, one minimum, and almost always exactly one stable isobar.'}</div>`;
  }

  aEl.addEventListener('input',draw);
  registerCanvas('vs_chart',draw);
  registerCanvas('vs_iso',draw);
}

/* =====================================================================
   6. THE SHELL MODEL AND MAGIC NUMBERS
   ===================================================================== */
function setupShellModel(){
  const canvas=document.getElementById('sm_canvas');
  const abCanvas=document.getElementById('sm_abund');
  const soEl=document.getElementById('sm_so'), soVal=document.getElementById('sm_so_val');
  const readout=document.getElementById('sm_readout');
  const playBtn=document.getElementById('sm_play');
  // fillN = how many nucleons have been "placed" so far, lowest level first —
  // this is what the play button animates, from empty up to every level full.
  let fillN=0, playing=false, holdT=0, lastFrame=performance.now();

  /* Beiser's Fig. 11.17 level sequence. Each entry: label, l, j, capacity 2j+1.
     The shells close at the large gaps, and the running totals are the magic
     numbers. Beiser's n-labelling counts levels of each l from 1 upward with an
     offset; the standard spectroscopic names are given alongside.            */
  const LEVELS=[
    {lab:'1s½',  std:'1s½',  l:0, j:0.5, cap:2,  E0:-50.0},
    {lab:'2p₃⁄₂',std:'1p₃⁄₂',l:1, j:1.5, cap:4,  E0:-40.0},
    {lab:'2p½',  std:'1p½',  l:1, j:0.5, cap:2,  E0:-40.0},
    {lab:'3d₅⁄₂',std:'1d₅⁄₂',l:2, j:2.5, cap:6,  E0:-30.5},
    {lab:'2s½',  std:'2s½',  l:0, j:0.5, cap:2,  E0:-29.0},
    {lab:'3d₃⁄₂',std:'1d₃⁄₂',l:2, j:1.5, cap:4,  E0:-30.5},
    {lab:'4f₇⁄₂',std:'1f₇⁄₂',l:3, j:3.5, cap:8,  E0:-22.0},
    {lab:'3p₃⁄₂',std:'2p₃⁄₂',l:1, j:1.5, cap:4,  E0:-18.0},
    {lab:'4f₅⁄₂',std:'1f₅⁄₂',l:3, j:2.5, cap:6,  E0:-22.0},
    {lab:'3p½',  std:'2p½',  l:1, j:0.5, cap:2,  E0:-18.0},
    {lab:'5g₉⁄₂',std:'1g₉⁄₂',l:4, j:4.5, cap:10, E0:-14.5},
    {lab:'5g₇⁄₂',std:'1g₇⁄₂',l:4, j:3.5, cap:8,  E0:-14.5},
    {lab:'4d₅⁄₂',std:'2d₅⁄₂',l:2, j:2.5, cap:6,  E0:-11.5},
    {lab:'4d₃⁄₂',std:'2d₃⁄₂',l:2, j:1.5, cap:4,  E0:-11.5},
    {lab:'3s½',  std:'3s½',  l:0, j:0.5, cap:2,  E0:-11.0},
    {lab:'6h₁₁⁄₂',std:'1h₁₁⁄₂',l:5,j:5.5,cap:12, E0:-8.0},
    {lab:'6h₉⁄₂',std:'1h₉⁄₂',l:5, j:4.5, cap:10, E0:-8.0},
    {lab:'5f₇⁄₂',std:'2f₇⁄₂',l:3, j:3.5, cap:8,  E0:-6.0},
    {lab:'5f₅⁄₂',std:'2f₅⁄₂',l:3, j:2.5, cap:6,  E0:-6.0},
    {lab:'4p₃⁄₂',std:'3p₃⁄₂',l:1, j:1.5, cap:4,  E0:-4.5},
    {lab:'4p½',  std:'3p½',  l:1, j:0.5, cap:2,  E0:-4.5},
    {lab:'7i₁₃⁄₂',std:'1i₁₃⁄₂',l:6,j:6.5,cap:14, E0:-3.0}
  ];
  const MAGIC=[2,8,20,28,50,82,126];

  // spin-orbit shift: proportional to <L.S> = [j(j+1) - l(l+1) - 3/4]/2, scaled
  function energy(lv,strength){
    const ls=(lv.j*(lv.j+1)-lv.l*(lv.l+1)-0.75)/2;
    return lv.E0 - strength*ls*(lv.l?1:0);
  }

  function getRows(){
    const s=parseFloat(soEl.value);
    const rows=LEVELS.map(lv=>({...lv, E:energy(lv,s)})).sort((a,b)=>a.E-b.E);
    let run=0;
    rows.forEach(r=>{ run+=r.cap; r.total=run; r.closes=MAGIC.indexOf(run)>=0; });
    return rows;
  }

  function draw(){
    const {ctx,w,h}=fitCanvas(canvas);
    const s=parseFloat(soEl.value);
    soVal.textContent=fmt(s,2);
    ctx.fillStyle='#fbfaf7'; ctx.fillRect(0,0,w,h);
    const m={l:64,r:190,t:26,b:34};

    const rows=getRows();

    const emin=Math.min(...rows.map(r=>r.E))-2, emax=Math.max(...rows.map(r=>r.E))+2;
    const Y=e=>h-m.b-((e-emin)/(emax-emin))*(h-m.b-m.t);
    // axis
    ctx.save(); ctx.strokeStyle='#1c1d20'; ctx.lineWidth=1.3;
    ctx.beginPath(); ctx.moveTo(m.l,m.t); ctx.lineTo(m.l,h-m.b); ctx.stroke();
    ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle='#1c1d20';
    ctx.save(); ctx.translate(18,h/2); ctx.rotate(-Math.PI/2); ctx.textAlign='center';
    ctx.fillText('single-nucleon energy (MeV, schematic)',0,0); ctx.restore();
    ctx.restore();

    const x0=m.l+24, x1=w-m.r-30;
    // Near-degenerate levels would draw on top of each other and their labels
    // would collide, so push them apart to a minimum readable gap. The vertical
    // axis is schematic anyway; the ordering and the capacities are what matter.
    const GAP=12;
    rows.forEach(r=>{ r.y=Y(r.E); });
    // rows[0] is the lowest level (largest y); walk upward pushing each one up
    for(let i=1;i<rows.length;i++)
      if(rows[i-1].y - rows[i].y < GAP) rows[i].y = rows[i-1].y - GAP;
    // then rescale the whole ladder back into the plotting area, so the real
    // gaps between shells survive and nothing falls off either end
    const yBot=rows[0].y, yTop=rows[rows.length-1].y;
    const lo=h-m.b-8, hi=m.t+6;
    if(yBot>yTop){
      const k=(lo-hi)/(yBot-yTop);
      rows.forEach(r=>{ r.y = hi + (r.y-yTop)*k; });
    }

    rows.forEach(r=>{
      const y=r.y;
      ctx.save();
      ctx.strokeStyle=r.closes?'#a4342c':'#1f6f78';
      ctx.lineWidth=r.closes?2.6:1.6;
      ctx.beginPath(); ctx.moveTo(x0,y); ctx.lineTo(x1,y); ctx.stroke();
      ctx.font='10px Helvetica,Arial,sans-serif';
      ctx.fillStyle=r.closes?'#a4342c':'#5a5d63'; ctx.textAlign='right';
      ctx.fillText(r.lab, x0-6, y+3);
      ctx.textAlign='left';
      ctx.fillText(`${r.cap}`, x1+6, y+3);
      if(r.closes){
        ctx.fillStyle='#a4342c'; ctx.font='bold 11px Helvetica,Arial,sans-serif';
        ctx.fillText(`shell closes — ${r.total}`, x1+28, y+3);
      }
      // nucleons "placed" so far by the fill animation, as beads along the level
      const start=r.total-r.cap;
      const filled=Math.max(0, Math.min(r.cap, Math.round(fillN)-start));
      if(filled>0){
        const seg=(x1-8)-(x0+8);
        ctx.fillStyle=r.closes?'#a4342c':'#1f6f78';
        for(let k=0;k<filled;k++){
          const fx=r.cap===1?(x0+x1)/2:(x0+8)+seg*(k/(r.cap-1||1));
          ctx.beginPath(); ctx.arc(fx,y,3.4,0,7); ctx.fill();
          ctx.lineWidth=1; ctx.strokeStyle='#fbfaf7'; ctx.stroke();
        }
      }
      ctx.restore();
    });
    ctx.save(); ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle='#5a5d63'; ctx.textAlign='left';
    ctx.fillText(`spin–orbit strength ×${fmt(s,2)}  —  ${rows.filter(r=>r.closes).length} of the 7 magic numbers reproduced`, m.l+24, m.t-8);
    ctx.textAlign='right'; ctx.fillStyle='#8a8d92';
    ctx.fillText('2j+1', x1+18, m.t-8);
    ctx.restore();

    drawAbundance();

    const got=rows.filter(r=>r.closes).map(r=>r.total);
    const missing=MAGIC.filter(M=>got.indexOf(M)<0);
    const nf=Math.round(fillN);
    const fillLine = nf<=0
      ? `<div>press <b>Fill the shells</b> to watch nucleons stack up the ladder, lowest level first</div>`
      : `<div>nucleons placed so far <b>${nf}</b>${MAGIC.indexOf(nf)>=0 ? ' — a magic number: the shell directly below just closed' : ''}</div>`;
    readout.innerHTML = `
      <div>spin–orbit strength <b>×${fmt(s,2)}</b> of the value that reproduces the data</div>
      <div>running totals that land on a magic number: <b>${got.join(', ')||'none'}</b></div>
      <div>missed: <b>${missing.join(', ')||'none — all seven'}</b></div>
      <div>the splitting is <b>ΔE ∝ [j(j+1) − ℓ(ℓ+1) − ¾]/2</b>, and the j = ℓ + ½ level always drops</div>
      <div>with no spin–orbit coupling at all the closures come out 2, 8, 20, 40, 70, 112 — the harmonic-oscillator numbers, and wrong above 20</div>
      <div>states per shell in Beiser's sequence: <b>2, 6, 12, 8, 22, 32, 44</b> → 2, 8, 20, 28, 50, 82, 126</div>
      ${fillLine}`;
  }

  // natural abundance really does spike at the magic numbers
  function drawAbundance(){
    const {ctx,w,h}=fitCanvas(abCanvas);
    const m={l:64,r:18,t:26,b:42};
    // number of stable isotones (fixed N) and isotopes (fixed Z)
    const byN={}, byZ={};
    NUCLIDES.forEach(([Z,A,mm,ab,st])=>{
      if(!st) return;
      byN[A-Z]=(byN[A-Z]||0)+1; byZ[Z]=(byZ[Z]||0)+1;
    });
    const {X,Y}=drawAxes(ctx,w,h,m,0,130,0,8,'nucleon number  (N for the teal bars, Z for the red)',
      'how many stable nuclides have this number',{nx:5,ny:4,xfmt:v=>v.toFixed(0),yfmt:v=>v.toFixed(0)});
    const MAGICL=[2,8,20,28,50,82,126];
    MAGICL.forEach(M=>{
      plotLine(ctx,X,Y,[{x:M,y:0},{x:M,y:8}],'#efe4d2',2.6);
      ctx.save(); ctx.font='10px Helvetica,Arial,sans-serif'; ctx.fillStyle='#a08a5a'; ctx.textAlign='center';
      ctx.fillText(M, X(M), m.t-8); ctx.restore();
    });
    const bw=Math.max(1.6,(X(1)-X(0))*0.4);
    ctx.save();
    Object.keys(byN).forEach(N=>{ const n=+N; if(n>130) return;
      ctx.fillStyle='rgba(31,111,120,0.75)';
      ctx.fillRect(X(n)-bw, Y(byN[N]), bw, Y(0)-Y(byN[N])); });
    Object.keys(byZ).forEach(Z=>{ const z=+Z; if(z>130) return;
      ctx.fillStyle='rgba(164,52,44,0.65)';
      ctx.fillRect(X(z), Y(byZ[Z]), bw, Y(0)-Y(byZ[Z])); });
    ctx.restore();
    ctx.save(); ctx.font='11px Helvetica,Arial,sans-serif'; ctx.textAlign='left';
    ctx.fillStyle='#1f6f78'; ctx.fillText('stable isotones — same N', m.l+10, m.t+14);
    ctx.fillStyle='#a4342c'; ctx.fillText('stable isotopes — same Z', m.l+10, m.t+29);
    ctx.fillStyle='#a08a5a'; ctx.textAlign='right';
    ctx.fillText('vertical bands: the magic numbers', w-m.r-8, m.t+14);
    ctx.restore();
  }

  function loop(now){
    const dt=Math.min(0.05,(now-lastFrame)/1000); lastFrame=now;
    const active=document.getElementById('ch11') && document.getElementById('ch11').classList.contains('active');
    if(playing && active){
      const rows=getRows();
      const TOTAL=rows[rows.length-1].total;
      if(holdT>0){ holdT-=dt; }
      else{
        const prev=fillN;
        fillN=Math.min(TOTAL, fillN+dt*16); // ~16 nucleons/sec baseline
        const crossed=MAGIC.find(M=>prev<M && fillN>=M);
        if(crossed!==undefined){ fillN=crossed; holdT=0.7; } // pause on every magic number
      }
      if(fillN>=TOTAL){ playing=false; playBtn.textContent='↺ Replay: fill the shells'; playBtn.classList.remove('playing'); }
      draw();
    }
    requestAnimationFrame(loop);
  }
  if(playBtn) playBtn.addEventListener('click', ()=>{
    const TOTAL=getRows().slice(-1)[0].total;
    if(prefersReducedMotion()){
      fillN = fillN>0 ? 0 : TOTAL;
      draw();
      return;
    }
    if(!playing){
      if(fillN>=TOTAL-1e-9) fillN=0;
      playing=true; holdT=0; lastFrame=performance.now();
      playBtn.textContent='⏸ Pause'; playBtn.classList.add('playing');
    } else {
      playing=false; playBtn.textContent='▶ Fill the shells, one nucleon at a time'; playBtn.classList.remove('playing');
    }
  });

  soEl.addEventListener('input',()=>{
    fillN=0; playing=false;
    if(playBtn){ playBtn.textContent='▶ Fill the shells, one nucleon at a time'; playBtn.classList.remove('playing'); }
    draw();
  });
  registerCanvas('sm_canvas',draw);
  registerCanvas('sm_abund',draw);
  requestAnimationFrame(loop);
}

/* =====================================================================
   7. YUKAWA: RANGE, MASS, AND THE UNCERTAINTY PRINCIPLE
   ===================================================================== */
function setupYukawa(){
  const canvas=document.getElementById('yk_canvas');
  const rEl=document.getElementById('yk_r'), rVal=document.getElementById('yk_r_val');
  const readout=document.getElementById('yk_readout');

  function draw(){
    const {ctx,w,h}=fitCanvas(canvas);
    const R=parseFloat(rEl.value);       // assumed range, fm
    rVal.textContent=fmt(R,2);
    const m={l:66,r:18,t:22,b:42};
    const {X,Y}=drawAxes(ctx,w,h,m,0.3,6,-120,40,'nucleon separation r (fm)','potential energy (MeV)',
      {nx:6,ny:4,xfmt:v=>v.toFixed(1),yfmt:v=>v.toFixed(0)});
    plotLine(ctx,X,Y,[{x:0.3,y:0},{x:6,y:0}],'#c9c4b8',1);

    // Yukawa: U = -g^2 e^(-r/R)/r, normalised to -100 MeV at r = 1 fm
    const g2 = 100*Math.exp(1/R);
    const yuk=[], cou=[];
    for(let r=0.3;r<=6;r+=0.01){
      const u=-g2*Math.exp(-r/R)/r;
      yuk.push({x:r,y:u<-120?null:u});
      cou.push({x:r,y:KE2_N*EV_J*EV_J/(r*1e-15)/EV_J/1e6});   // proton-proton, MeV
    }
    plotLine(ctx,X,Y,cou,'#8a6d1f',1.8,[5,4]);
    plotLine(ctx,X,Y,yuk,'#a4342c',2.8);
    // a 1/r comparison, same depth at 1 fm, to show how much faster Yukawa dies
    const inv=[]; for(let r=0.3;r<=6;r+=0.01){ const u=-100/r; inv.push({x:r,y:u<-120?null:u}); }
    plotLine(ctx,X,Y,inv,'#c9c4b8',1.6,[3,3]);
    plotLine(ctx,X,Y,[{x:R,y:-120},{x:R,y:40}],'#1f6f78',1.4,[4,3]);

    ctx.save(); ctx.font='11px Helvetica,Arial,sans-serif'; ctx.textAlign='right';
    ctx.fillStyle='#a4342c'; ctx.fillText('Yukawa  −g²e^(−r/r₀)/r', w-m.r-8, m.t+14);
    ctx.fillStyle='#b0aa9c'; ctx.fillText('a plain −1/r, for comparison', w-m.r-8, m.t+29);
    ctx.fillStyle='#8a6d1f'; ctx.fillText('proton–proton Coulomb repulsion', w-m.r-8, m.t+44);
    ctx.textAlign='left'; ctx.fillStyle='#1f6f78';
    ctx.fillText(`r₀ = ${fmt(R,2)} fm`, X(R)+6, m.t+59);
    ctx.restore();

    // the estimate: E t ~ hbar with E = mc^2 and t = r/c
    const mkg=HBAR/(R*1e-15*C);
    const mMeV=mkg*C*C/EV_J/1e6;
    const mMe=mkg/M_E;
    const pionMeV=139.57, pionMe=pionMeV*1e6*EV_J/(C*C)/M_E;
    const rangeFromPion=HBARC_MEVFM/pionMeV;
    const tFlight=R*1e-15/C;
    readout.innerHTML = `
      <div>assumed range of the nuclear force <b>${fmt(R,2)} fm</b></div>
      <div>flight time at c, t = r/c <b>${fmtSci(tFlight,2)} s</b></div>
      <div>ΔE ≈ ℏ/Δt gives ΔE <b>${fmt(mMeV,1)} MeV</b></div>
      <div>so the exchanged particle has m = ℏ/rc = <b>${fmtSci(mkg,2)} kg</b> = <b>${fmt(mMe,0)} electron masses</b></div>
      <div>the pion actually weighs <b>139.6 MeV/c²</b> = ${fmt(pionMe,0)} m<sub>e</sub>
        <span class="badge ${Math.abs(mMeV-pionMeV)/pionMeV<0.35?'ok':''}">estimate is ${fmt(mMeV/pionMeV,2)}× that</span></div>
      <div>run it backwards: a 139.6 MeV pion gives a range ℏc/mc² = <b>${fmt(rangeFromPion,2)} fm</b></div>
      <div>for comparison, a <b>massless</b> exchanged particle would give infinite range — which is exactly the photon and the Coulomb force</div>
      <div>ℏc = <b>${fmt(HBARC_MEVFM,1)} MeV·fm</b> is the whole conversion: range in fm × mass in MeV ≈ 197</div>`;
  }
  rEl.addEventListener('input',draw);
  registerCanvas('yk_canvas',draw);
}

// register with the loader in app.js
registerModule('setupNuclearSize', setupNuclearSize);
registerModule('setupNMR', setupNMR);
registerModule('setupBindingCurve', setupBindingCurve);
registerModule('setupLiquidDrop', setupLiquidDrop);
registerModule('setupValley', setupValley);
registerModule('setupShellModel', setupShellModel);
registerModule('setupYukawa', setupYukawa);
