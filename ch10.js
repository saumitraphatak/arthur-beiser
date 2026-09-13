/* =====================================================================
   Concepts of Modern Physics — Interactive Companion
   Chapter 10: The Solid State
   Every number is computed live from the chapter's formulas.
   ===================================================================== */

const KE2_EV_NM = 1.43996;      // e^2/4*pi*eps0, in eV nm — the Coulomb constant in atomic units
const H2_2M_S     = 0.0380998;    // hbar^2/2m_e, in eV nm^2
const K_EV10    = 8.617e-5;     // Boltzmann constant, eV/K
const PHI0      = H_J/(2*EV_J); // flux quantum h/2e, T m^2

/* Ionic crystals. r0 = nearest-neighbour separation (nm); alpha = Madelung
   constant (1.748 for the rock-salt structure, 1.763 for the CsCl structure);
   IE = ionization energy of the metal (eV); EA = electron affinity of the
   halogen (eV); Eexp = measured cohesive energy per atom (eV).             */
const IONIC = {
  NaCl:{name:'NaCl', r0:0.281, alpha:1.748, IE:5.14, EA:3.61, Eexp:3.28, struct:'rock salt'},
  LiF: {name:'LiF',  r0:0.201, alpha:1.748, IE:5.39, EA:3.40, Eexp:4.46, struct:'rock salt'},
  KCl: {name:'KCl',  r0:0.315, alpha:1.748, IE:4.34, EA:3.61, Eexp:3.40, struct:'rock salt'},
  NaBr:{name:'NaBr', r0:0.298, alpha:1.748, IE:5.14, EA:3.36, Eexp:3.06, struct:'rock salt'},
  CsCl:{name:'CsCl', r0:0.356, alpha:1.763, IE:3.89, EA:3.61, Eexp:3.36, struct:'CsCl'},
  RbI: {name:'RbI',  r0:0.366, alpha:1.748, IE:4.18, EA:3.06, Eexp:2.63, struct:'rock salt'}
};

/* Lennard-Jones parameters for the noble-gas solids (eV, nm), and the measured
   nearest-neighbour spacing and cohesive energy to compare the model against. */
const NOBLE_S = {
  Ne:{name:'neon',    eps:0.0031, sigma:0.274, Rexp:0.313, Eexp:0.020, Tm:24.6},
  Ar:{name:'argon',   eps:0.0104, sigma:0.340, Rexp:0.376, Eexp:0.080, Tm:83.8},
  Kr:{name:'krypton', eps:0.0140, sigma:0.365, Rexp:0.400, Eexp:0.116, Tm:115.8},
  Xe:{name:'xenon',   eps:0.0200, sigma:0.398, Rexp:0.435, Eexp:0.170, Tm:161.4}
};
// fcc lattice sums for the 12th and 6th powers (Kittel)
const A12 = 12.13188, A6 = 14.45392;

/* Metals: n = free electrons per m^3 (one per atom unless noted),
   rho = resistivity at 20 C (ohm m).                                       */
const CONDUCTORS = {
  Cu:{name:'copper',    n:8.48e28, rho:1.72e-8, d:0.256},
  Ag:{name:'silver',    n:5.86e28, rho:1.59e-8, d:0.289},
  Au:{name:'gold',      n:5.90e28, rho:2.44e-8, d:0.288},
  Al:{name:'aluminium', n:18.1e28, rho:2.65e-8, d:0.286},
  Na:{name:'sodium',    n:2.65e28, rho:4.70e-8, d:0.372},
  Fe:{name:'iron',      n:17.0e28, rho:9.71e-8, d:0.248}
};

/* Semiconductors and insulators. Eg in eV at 300 K; mobilities in cm^2/V s;
   N = atoms per cm^3.                                                       */
/* me, mh are density-of-states effective masses in units of the free electron
   mass — the one place where the band structure has to be put back in by hand. */
const SEMI = {
  Si:  {name:'silicon',          Eg:1.11, mun:1350, mup:480,  N:5.00e22, niExp:1.0e10, me:1.08,   mh:0.81},
  Ge:  {name:'germanium',        Eg:0.67, mun:3900, mup:1900, N:4.42e22, niExp:2.4e13, me:0.56,   mh:0.29},
  GaAs:{name:'gallium arsenide', Eg:1.43, mun:8500, mup:400,  N:4.42e22, niExp:2.1e6,  me:0.067,  mh:0.47},
  InSb:{name:'indium antimonide',Eg:0.17, mun:77000,mup:850,  N:2.94e22, niExp:2.0e16, me:0.0136, mh:0.43},
  C:   {name:'diamond',          Eg:5.50, mun:2200, mup:1600, N:1.76e23, niExp:null,   me:0.57,   mh:0.80}
};

/* Superconductors: Tc in K, Bc in tesla (Bc(0) for type I, Bc2(0) for type II). */
const SUPER = {
  Zn:    {name:'zinc',      Tc:0.85,  Bc:0.0054, type:1},
  Al:    {name:'aluminium', Tc:1.18,  Bc:0.0105, type:1},
  Sn:    {name:'tin',       Tc:3.72,  Bc:0.0305, type:1},
  Hg:    {name:'mercury',   Tc:4.15,  Bc:0.0411, type:1},
  Pb:    {name:'lead',      Tc:7.19,  Bc:0.0803, type:1},
  Nb3Sn: {name:'Nb₃Sn',     Tc:18.0,  Bc:24.5,   type:2},
  Nb3Ge: {name:'Nb₃Ge',     Tc:23.2,  Bc:38,     type:2},
  YBCO:  {name:'YBa₂Cu₃O₇', Tc:92,    Bc:100,    type:2},
  HgBCCO:{name:'HgBa₂Ca₂Cu₃O₈', Tc:134, Bc:110,  type:2}
};

/* =====================================================================
   1. THE IONIC CRYSTAL
   ===================================================================== */
function setupIonicCrystal(){
  const canvas=document.getElementById('ic_canvas');
  const xtalEl=document.getElementById('ic_xtal');
  const nEl=document.getElementById('ic_n'), nVal=document.getElementById('ic_n_val');
  const readout=document.getElementById('ic_readout');

  // U(r) = -alpha e^2 / 4 pi eps0 r  +  B / r^n, with B fixed by dU/dr = 0 at r0
  function pieces(x, r0, alpha, n){
    const B = alpha*KE2_EV_NM*Math.pow(r0,n-1)/n;
    return {coul:-alpha*KE2_EV_NM/x, rep:B/Math.pow(x,n)};
  }

  function draw(){
    const {ctx,w,h}=fitCanvas(canvas);
    const c=IONIC[xtalEl.value], n=parseFloat(nEl.value);
    nVal.textContent=fmt(n,0);
    const r0=c.r0, alpha=c.alpha;
    const U0 = -alpha*KE2_EV_NM/r0*(1-1/n);

    const m={l:60,r:18,t:22,b:40};
    const xmax=r0*3.2, ymin=Math.min(-14,U0*1.45), ymax=-ymin*0.55;
    const {X,Y}=drawAxes(ctx,w,h,m,0,xmax,ymin,ymax,'ionic separation r (nm)','potential energy per ion pair (eV)',
      {nx:4,ny:6,xfmt:v=>v.toFixed(2),yfmt:v=>v.toFixed(0)});

    const cPts=[],rPts=[],tPts=[];
    const step=xmax/500;
    for(let x=r0*0.45;x<=xmax;x+=step){
      const p=pieces(x,r0,alpha,n);
      cPts.push({x,y:p.coul});
      rPts.push({x,y:p.rep>ymax?null:p.rep});
      const t=p.coul+p.rep;
      tPts.push({x,y:t>ymax?null:t});
    }
    plotLine(ctx,X,Y,cPts,'#1f6f78',1.8,[5,4]);
    plotLine(ctx,X,Y,rPts,'#8a6d1f',1.8,[5,4]);
    plotLine(ctx,X,Y,tPts,'#a4342c',2.8);

    // the equilibrium point
    plotLine(ctx,X,Y,[{x:r0,y:ymin},{x:r0,y:U0}],'#9aa0a6',1.2,[3,3]);
    plotLine(ctx,X,Y,[{x:0,y:U0},{x:r0,y:U0}],'#9aa0a6',1.2,[3,3]);
    dotAt(ctx,X,Y,r0,U0,'#a4342c',5.5);

    ctx.save(); ctx.font='11px Helvetica,Arial,sans-serif';
    ctx.textAlign='right';
    ctx.fillStyle='#1f6f78'; ctx.fillText('Coulomb attraction  −αe²/4πε₀r', w-m.r-8, m.t+44);
    ctx.fillStyle='#8a6d1f'; ctx.fillText(`exclusion-principle repulsion  B/r^${fmt(n,0)}`, w-m.r-8, m.t+14);
    ctx.fillStyle='#a4342c'; ctx.fillText('total', w-m.r-8, m.t+29);
    ctx.fillStyle='#5a5d63'; ctx.textAlign='left';
    ctx.fillText(`r₀ = ${fmt(r0,3)} nm`, X(r0)+6, h-m.b-8);
    ctx.restore();

    // cohesive energy, following Example 10.1 exactly
    const perIon = -U0/2;
    const transfer = (c.IE - c.EA)/2;      // per atom
    const cohesive = perIon - transfer;
    const err = (cohesive-c.Eexp)/c.Eexp*100;
    const repFrac = (1/n)*100;

    readout.innerHTML = `
      <div>crystal <b>${c.name}</b> — ${c.struct} structure, Madelung constant α = ${fmt(alpha,3)}</div>
      <div>equilibrium separation r₀ <b>${fmt(r0,3)} nm</b></div>
      <div>U₀ = −(αe²/4πε₀r₀)(1 − 1/n) <b>${fmt(U0,2)} eV</b> per ion pair</div>
      <div>&nbsp;&nbsp;→ per ion <b>${fmt(perIon,2)} eV</b></div>
      <div>electron transfer: ionization ${fmt(c.IE,2)} eV − affinity ${fmt(c.EA,2)} eV = ${fmt(c.IE-c.EA,2)} eV per pair
        <b>(${fmt(transfer,2)} eV per atom)</b></div>
      <div>cohesive energy per atom <b>${fmt(cohesive,2)} eV</b></div>
      <div>measured <b>${fmt(c.Eexp,2)} eV</b>
        <span class="badge ${Math.abs(err)<8?'ok':'no'}">${err>0?'+':''}${fmt(err,1)}%</span></div>
      <div>repulsion lowers the binding by 1/n = <b>${fmt(repFrac,1)}%</b></div>`;
  }
  xtalEl.addEventListener('change',draw);
  nEl.addEventListener('input',draw);
  registerCanvas('ic_canvas',draw);
}

/* =====================================================================
   2. THE VAN DER WAALS BOND
   ===================================================================== */
function setupVanDerWaals(){
  const canvas=document.getElementById('vw_canvas');
  const barCanvas=document.getElementById('vw_bars');
  const gasEl=document.getElementById('vw_gas');
  const readout=document.getElementById('vw_readout');

  // Lennard-Jones pair potential
  function ljPair(r,eps,sig){ const s=sig/r; return 4*eps*(Math.pow(s,12)-Math.pow(s,6)); }
  // the fcc lattice sum: energy per atom when nearest neighbours sit at R
  function ljLattice(R,eps,sig){
    const s=sig/R;
    return 2*eps*(A12*Math.pow(s,12) - A6*Math.pow(s,6));
  }

  function draw(){
    const {ctx,w,h}=fitCanvas(canvas);
    const g=NOBLE_S[gasEl.value];
    const Rmin = Math.pow(2*A12/A6, 1/6)*g.sigma;   // minimum of the lattice sum
    const Umin = ljLattice(Rmin,g.eps,g.sigma);
    const rPair = Math.pow(2,1/6)*g.sigma;          // minimum of the isolated pair

    const m={l:64,r:18,t:22,b:40};
    const xmax=g.sigma*2.6;
    const ymin=Umin*1.35, ymax=-ymin*0.8;
    const {X,Y}=drawAxes(ctx,w,h,m,g.sigma*0.82,xmax,ymin,ymax,
      'nearest-neighbour separation R (nm)','energy per atom (eV)',
      {nx:4,ny:6,xfmt:v=>v.toFixed(2),yfmt:v=>v.toFixed(3)});

    const latPts=[],parPts=[],attPts=[];
    for(let x=g.sigma*0.82;x<=xmax;x+=xmax/500){
      const v=ljLattice(x,g.eps,g.sigma);
      latPts.push({x,y:v>ymax?null:v});
      const p=ljPair(x,g.eps,g.sigma);
      parPts.push({x,y:p>ymax?null:p});
      attPts.push({x,y:-2*g.eps*A6*Math.pow(g.sigma/x,6)});
    }
    plotLine(ctx,X,Y,attPts,'#1f6f78',1.6,[5,4]);
    plotLine(ctx,X,Y,parPts,'#b9b2a4',1.8);
    plotLine(ctx,X,Y,latPts,'#a4342c',2.8);
    plotLine(ctx,X,Y,[{x:g.sigma*0.82,y:0},{x:xmax,y:0}],'#c9c4b8',1);
    dotAt(ctx,X,Y,Rmin,Umin,'#a4342c',5.5);
    plotLine(ctx,X,Y,[{x:g.Rexp,y:ymin},{x:g.Rexp,y:ymax*0.2}],'#1c1d20',1.4,[3,3]);

    ctx.save(); ctx.font='11px Helvetica,Arial,sans-serif'; ctx.textAlign='left';
    ctx.fillStyle='#a4342c'; ctx.fillText('fcc crystal, summed over all neighbours', m.l+10, m.t+14);
    ctx.fillStyle='#9a9384'; ctx.fillText('a single isolated pair', m.l+10, m.t+29);
    ctx.fillStyle='#1f6f78'; ctx.fillText('the −1/r⁶ attraction alone', m.l+10, m.t+44);
    ctx.fillStyle='#1c1d20'; ctx.textAlign='center';
    ctx.fillText('measured', X(g.Rexp), m.t+12);
    ctx.restore();

    // the bond-type comparison
    drawBars();

    const errR=(Rmin-g.Rexp)/g.Rexp*100, errE=(-Umin-g.Eexp)/g.Eexp*100;
    const kT_Tm = K_EV10*g.Tm;
    readout.innerHTML = `
      <div>solid <b>${g.name}</b> — ε = ${fmt(g.eps,4)} eV, σ = ${fmt(g.sigma,3)} nm</div>
      <div>pair minimum at 2<sup>1/6</sup>σ <b>${fmt(rPair,3)} nm</b>, depth ${fmt(g.eps,4)} eV</div>
      <div>fcc lattice sum gives R₀ = (2A₁₂/A₆)<sup>1/6</sup>σ <b>${fmt(Rmin,3)} nm</b>
        <span class="badge ${Math.abs(errR)<4?'ok':'no'}">${errR>0?'+':''}${fmt(errR,1)}% vs measured ${fmt(g.Rexp,3)}</span></div>
      <div>cohesive energy −U₀ = 8.61ε <b>${fmt(-Umin,4)} eV</b> per atom
        <span class="badge ${Math.abs(errE)<20?'ok':'no'}">${errE>0?'+':''}${fmt(errE,0)}% vs measured ${fmt(g.Eexp,3)}</span></div>
      <div>each atom is bound by <b>${fmt(-Umin/g.eps,2)}×</b> the single-pair depth — 12 near neighbours, plus the rest</div>
      <div>melting point <b>${fmt(g.Tm,1)} K</b>, where kT = <b>${fmt(kT_Tm,4)} eV</b> = ${fmt(kT_Tm/(-Umin)*100,0)}% of the bond</div>`;
  }

  function drawBars(){
    const {ctx,w,h}=fitCanvas(barCanvas);
    const BONDS=[
      {k:'van der Waals', ex:'solid argon',  E:0.08, Tm:84,   col:'#1f6f78'},
      {k:'hydrogen',      ex:'ice',          E:0.52, Tm:273,  col:'#4a8fa8'},
      {k:'metallic',      ex:'sodium',       E:1.11, Tm:371,  col:'#8a6d1f'},
      {k:'metallic',      ex:'copper',       E:3.49, Tm:1358, col:'#8a6d1f'},
      {k:'ionic',         ex:'NaCl',         E:3.28, Tm:1074, col:'#a4342c'},
      {k:'covalent',      ex:'silicon',      E:4.63, Tm:1687, col:'#5b3f8a'},
      {k:'covalent',      ex:'diamond',      E:7.37, Tm:3820, col:'#5b3f8a'}
    ];
    const m={l:64,r:56,t:22,b:40};
    const {X,Y}=drawAxes(ctx,w,h,m,-0.5,BONDS.length-0.5,0,8,'','cohesive energy (eV/atom)',
      {nx:BONDS.length-1,ny:4,xfmt:()=>'',yfmt:v=>v.toFixed(0)});
    const bw=(w-m.l-m.r)/BONDS.length*0.56;
    ctx.save(); ctx.font='10px Helvetica,Arial,sans-serif';
    BONDS.forEach((b,i)=>{
      ctx.fillStyle=b.col; ctx.globalAlpha=0.85;
      ctx.fillRect(X(i)-bw/2, Y(b.E), bw, Y(0)-Y(b.E));
      ctx.globalAlpha=1;
      ctx.fillStyle='#1c1d20'; ctx.textAlign='center';
      ctx.fillText(b.ex, X(i), h-m.b+14);
      ctx.fillStyle='#5a5d63';
      ctx.fillText(b.k, X(i), h-m.b+26);
    });
    // melting points on a second axis, to show they track the bond strength
    const Ymp = t => h-m.b - (t/4000)*(h-m.b-m.t);
    const mp=BONDS.map((b,i)=>({x:i,y:b.Tm/4000*8}));
    plotLine(ctx,X,Y,mp,'#1c1d20',1.8,[4,3]);
    mp.forEach(p=>dotAt(ctx,X,Y,p.x,p.y,'#1c1d20',3.5));
    ctx.fillStyle='#1c1d20'; ctx.textAlign='left'; ctx.font='11px Helvetica,Arial,sans-serif';
    ctx.fillText('melting point', m.l+10, m.t+14);
    ctx.textAlign='left';
    for(let i=0;i<=4;i++){
      ctx.fillStyle='#8a8d92';
      ctx.fillText((i*1000)+' K', w-m.r+6, Ymp(i*1000)+3);
    }
    ctx.restore();
  }

  gasEl.addEventListener('change',draw);
  registerCanvas('vw_canvas',draw);
  registerCanvas('vw_bars',draw);
}

/* =====================================================================
   3. FREE ELECTRONS, DRIFT AND OHM'S LAW
   ===================================================================== */
function setupDrift(){
  const canvas=document.getElementById('dr_canvas');
  const metEl=document.getElementById('dr_metal');
  const iEl=document.getElementById('dr_i'), iVal=document.getElementById('dr_i_val');
  const aEl=document.getElementById('dr_a'), aVal=document.getElementById('dr_a_val');
  const fieldEl=document.getElementById('dr_field');
  const readout=document.getElementById('dr_readout');

  function fermiEnergy(n){ return (H_J*H_J/(2*M_E))*Math.pow(3*n/(8*Math.PI),2/3)/EV_J; }

  // the walkers: random direction after each collision, plus a drift
  const N=26; let walkers=null, lastFrame=0;
  function reset(w,h){
    walkers=[];
    for(let i=0;i<N;i++)
      walkers.push({x:Math.random()*w, y:24+Math.random()*(h-48),
                    a:Math.random()*2*Math.PI, tNext:Math.random()*0.18, trail:[]});
  }

  function drawPaths(){
    const {ctx,w,h}=fitCanvas(canvas);
    if(!walkers) reset(w,h);
    ctx.fillStyle='#fbfaf7'; ctx.fillRect(0,0,w,h);
    // the ions
    ctx.save(); ctx.fillStyle='#e0dbd0';
    for(let x=22;x<w;x+=30) for(let y=22;y<h-14;y+=30){ ctx.beginPath(); ctx.arc(x,y,3.4,0,7); ctx.fill(); }
    ctx.restore();
    const drift=fieldEl.checked;
    ctx.save();
    walkers.forEach(p=>{
      ctx.strokeStyle=drift?'rgba(164,52,44,0.5)':'rgba(31,111,120,0.45)';
      ctx.lineWidth=1.2; ctx.beginPath();
      p.trail.forEach((q,i)=>{ i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y); });
      ctx.stroke();
      ctx.fillStyle=drift?'#a4342c':'#1f6f78';
      ctx.beginPath(); ctx.arc(p.x,p.y,2.6,0,7); ctx.fill();
    });
    ctx.restore();
    ctx.save(); ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle='#5a5d63';
    ctx.textAlign='left';
    ctx.fillText(drift ? 'field on — the same fast random motion, with a slow rightward creep'
                       : 'no field — random directions, no net transport', 12, 16);
    if(drift){
      ctx.strokeStyle='#a4342c'; ctx.lineWidth=1.6;
      ctx.beginPath(); ctx.moveTo(w-90,h-12); ctx.lineTo(w-20,h-12);
      ctx.lineTo(w-28,h-16); ctx.moveTo(w-20,h-12); ctx.lineTo(w-28,h-8); ctx.stroke();
      ctx.fillStyle='#a4342c'; ctx.textAlign='right'; ctx.fillText('E', w-96, h-8);
    }
    ctx.restore();
  }

  function step(dt,w,h){
    const drift=fieldEl.checked;
    const speed=90, vdrift=drift?26:0;
    walkers.forEach(p=>{
      p.tNext-=dt;
      if(p.tNext<=0){ p.a=Math.random()*2*Math.PI; p.tNext=0.10+Math.random()*0.16; }
      p.x+=Math.cos(p.a)*speed*dt + vdrift*dt;
      p.y+=Math.sin(p.a)*speed*dt;
      if(p.y<16||p.y>h-16){ p.a=-p.a; p.y=Math.max(16,Math.min(h-16,p.y)); }
      if(p.x>w+6){ p.x=-6; p.trail=[]; }
      if(p.x<-6){ p.x=w+6; p.trail=[]; }
      p.trail.push({x:p.x,y:p.y});
      if(p.trail.length>34) p.trail.shift();
    });
  }

  function loop(now){
    const dt=Math.min(0.05,(now-lastFrame)/1000); lastFrame=now;
    const sec=document.getElementById('ch10');
    const visible=sec && sec.classList.contains('active') && !prefersReducedMotion();
    if(visible && walkers && canvas.clientWidth){
      step(dt, canvas.clientWidth, intendedCssHeight(canvas));
      drawPaths();
    }
    requestAnimationFrame(loop);
  }

  function draw(){
    drawPaths();
    const met=CONDUCTORS[metEl.value];
    const I=parseFloat(iEl.value), Amm=parseFloat(aEl.value);
    iVal.textContent=fmt(I,1); aVal.textContent=fmt(Amm,1);
    const A=Amm*1e-6;
    const EF=fermiEnergy(met.n);
    const vF=Math.sqrt(2*EF*EV_J/M_E);
    const vd=I/(met.n*A*EV_J);
    const mfp=M_E*vF/(met.n*EV_J*EV_J*met.rho);
    const tau=mfp/vF;
    const ions=mfp/(met.d*1e-9);
    const yearPerM = 1/vd/(365.25*24*3600);

    readout.innerHTML = `
      <div>metal <b>${met.name}</b>, n = ${fmtSci(met.n,3)} m⁻³, ρ = ${fmtSci(met.rho,3)} Ω m</div>
      <div>Fermi energy from n <b>${fmt(EF,2)} eV</b>, Fermi speed v<sub>F</sub> = √(2ε<sub>F</sub>/m) <b>${fmtSci(vF,3)} m/s</b></div>
      <div>drift velocity v<sub>d</sub> = I/nAe <b>${fmtSci(vd,2)} m/s</b> = ${fmt(vd*1000,4)} mm/s</div>
      <div>v<sub>F</sub>/v<sub>d</sub> <b>${fmtSci(vF/vd,2)}</b> — the random motion utterly dominates</div>
      <div>mean free path λ = mv<sub>F</sub>/ne²ρ <b>${fmt(mfp*1e9,1)} nm</b></div>
      <div>&nbsp;&nbsp;→ past about <b>${fmt(ions,0)} ions</b> (spaced ${fmt(met.d,3)} nm) between collisions</div>
      <div>collision time τ = λ/v<sub>F</sub> <b>${fmtSci(tau,2)} s</b></div>
      <div>at this drift speed one electron takes <b>${fmt(yearPerM,1)} years</b> to travel one metre</div>`;
  }

  metEl.addEventListener('change',draw);
  iEl.addEventListener('input',draw);
  aEl.addEventListener('input',draw);
  fieldEl.addEventListener('change',draw);
  registerCanvas('dr_canvas',draw);
  requestAnimationFrame(loop);
}

/* =====================================================================
   4. HOW LEVELS BECOME BANDS
   ===================================================================== */
function setupBandFormation(){
  const canvas=document.getElementById('bf_canvas');
  const wideCanvas=document.getElementById('bf_wide');
  const nEl=document.getElementById('bf_n'), nVal=document.getElementById('bf_n_val');
  const aEl=document.getElementById('bf_a'), aVal=document.getElementById('bf_a_val');
  const readout=document.getElementById('bf_readout');

  // A chain of N identical atoms, nearest-neighbour coupling t. The eigenvalues
  // of that Hamiltonian are exactly E_j = E0 + 2t cos(j*pi/(N+1)), j = 1..N.
  function levels(N,E0,t){
    const out=[];
    for(let j=1;j<=N;j++) out.push(E0 + 2*t*Math.cos(j*Math.PI/(N+1)));
    return out;
  }
  // overlap falls off exponentially with separation: t = t0 exp(-(a-aRef)/delta)
  const A_REF=0.367;   // observed internuclear distance in solid sodium, nm
  function coupling(a,t0,delta){ return t0*Math.exp(-(a-A_REF)/delta); }

  const OUTER={E0:-5.14, t0:0.62, delta:0.105, label:'3s (outer)'};
  const INNER={E0:-30.8, t0:0.11, delta:0.042, label:'2p (inner)'};

  function draw(){
    const {ctx,w,h}=fitCanvas(canvas);
    const N=parseInt(nEl.value,10), a=parseFloat(aEl.value);
    nVal.textContent=N; aVal.textContent=fmt(a,3);

    const m={l:58,r:120,t:22,b:40};
    const {X,Y}=drawAxes(ctx,w,h,m,0,1,-34,2,'','energy (eV)',{nx:1,ny:6,xfmt:()=>'',yfmt:v=>v.toFixed(0)});

    [[OUTER,'#a4342c'],[INNER,'#1f6f78']].forEach(([lv,col])=>{
      const t=coupling(a,lv.t0,lv.delta);
      const E=levels(N,lv.E0,t);
      const width=Math.max(...E)-Math.min(...E);
      ctx.save();
      ctx.strokeStyle=col; ctx.lineWidth=N>60?0.7:1.5; ctx.globalAlpha=N>60?0.55:1;
      for(let i=0;i<N;i++){
        ctx.beginPath(); ctx.moveTo(X(0.16),Y(E[i])); ctx.lineTo(X(0.84),Y(E[i])); ctx.stroke();
      }
      ctx.restore();
      const yl=Math.max(m.t+12, Math.min(h-m.b-16, Y(lv.E0)-4));
      ctx.save(); ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle=col; ctx.textAlign='left';
      ctx.fillText(lv.label, w-m.r+8, yl);
      ctx.fillStyle='#5a5d63';
      ctx.fillText(`${N} levels`, w-m.r+8, yl+13);
      ctx.fillText(`spanning ${width<0.01?fmtSci(width,2):fmt(width,3)} eV`, w-m.r+8, yl+26);
      ctx.restore();
    });
    ctx.save(); ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle='#5a5d63'; ctx.textAlign='center';
    ctx.fillText(`${N} atom${N===1?'':'s'}, ${fmt(a,3)} nm apart`, m.l+(w-m.l-m.r)/2, h-6);
    ctx.restore();

    drawWide();

    const tO=coupling(a,OUTER.t0,OUTER.delta), tI=coupling(a,INNER.t0,INNER.delta);
    const limO=4*tO, limI=4*tI;
    const EO=levels(N,OUTER.E0,tO), EI=levels(N,INNER.E0,tI);
    const wO=Math.max(...EO)-Math.min(...EO), wI=Math.max(...EI)-Math.min(...EI);
    const NA=6.022e23;
    readout.innerHTML = `
      <div>atoms in the chain <b>${N}</b> → exactly <b>${N}</b> levels, no more and no fewer</div>
      <div>outer-level coupling t at ${fmt(a,3)} nm <b>${fmt(tO,4)} eV</b></div>
      <div>outer band width <b>${fmt(wO,4)} eV</b> — <b>${fmt(wO/limO*100,1)}%</b> of its N → ∞ limit of 4t = ${fmt(limO,3)} eV</div>
      <div>inner band width <b>${fmtSci(wI,2)} eV</b>
        <span class="badge">${fmt(wO/wI,0)}× narrower</span></div>
      <div>level spacing in the outer band <b>${fmtSci(wO/N,2)} eV</b></div>
      <div>the width converges almost at once; after that, adding atoms only subdivides it</div>
      <div>for a real mole of atoms the spacing would be <b>${fmtSci(limO/NA,2)} eV</b> — a continuum by any measurement</div>`;
  }

  // band width vs internuclear distance, the shape of Beiser's Fig. 10.20
  function drawWide(){
    const {ctx,w,h}=fitCanvas(wideCanvas);
    const a=parseFloat(aEl.value);
    const m={l:58,r:18,t:22,b:40};
    const {X,Y}=drawAxes(ctx,w,h,m,0.18,1.0,-34,2,'internuclear distance (nm)','energy (eV)',
      {nx:4,ny:6,xfmt:v=>v.toFixed(2),yfmt:v=>v.toFixed(0)});
    [[OUTER,'rgba(164,52,44,0.20)','#a4342c'],[INNER,'rgba(31,111,120,0.20)','#1f6f78']].forEach(([lv,fill,col])=>{
      const top=[],bot=[];
      for(let x=0.18;x<=1.0;x+=0.004){
        const t=coupling(x,lv.t0,lv.delta);
        top.push({x,y:lv.E0+2*t}); bot.push({x,y:lv.E0-2*t});
      }
      ctx.save(); ctx.fillStyle=fill; ctx.beginPath();
      top.forEach((p,i)=>{ i?ctx.lineTo(X(p.x),Y(p.y)):ctx.moveTo(X(p.x),Y(p.y)); });
      for(let i=bot.length-1;i>=0;i--) ctx.lineTo(X(bot[i].x),Y(bot[i].y));
      ctx.closePath(); ctx.fill(); ctx.restore();
      plotLine(ctx,X,Y,top,col,1.6); plotLine(ctx,X,Y,bot,col,1.6);
      plotLine(ctx,X,Y,[{x:0.18,y:lv.E0},{x:1.0,y:lv.E0}],col,1,[3,3]);
    });
    plotLine(ctx,X,Y,[{x:a,y:-34},{x:a,y:2}],'#1c1d20',1.6,[4,3]);
    plotLine(ctx,X,Y,[{x:A_REF,y:-34},{x:A_REF,y:2}],'#8a6d1f',1.4);
    ctx.save(); ctx.font='11px Helvetica,Arial,sans-serif';
    ctx.fillStyle='#8a6d1f'; ctx.textAlign='left';
    ctx.fillText('solid sodium, 0.367 nm', X(A_REF)+6, m.t+14);
    ctx.fillStyle='#1c1d20'; ctx.textAlign='right';
    ctx.fillText('you are here', X(a)-6, m.t+30);
    ctx.restore();
  }

  nEl.addEventListener('input',draw);
  aEl.addEventListener('input',draw);
  registerCanvas('bf_canvas',draw);
  registerCanvas('bf_wide',draw);
}

/* =====================================================================
   5. CONDUCTOR, SEMICONDUCTOR, INSULATOR
   ===================================================================== */
function setupBandGap(){
  const canvas=document.getElementById('gp_canvas');
  const arrCanvas=document.getElementById('gp_arr');
  const matEl=document.getElementById('gp_mat');
  const tEl=document.getElementById('gp_t'), tVal=document.getElementById('gp_t_val');
  const readout=document.getElementById('gp_readout');

  // intrinsic carrier concentration, per m^3
  function nIntrinsic(mat,T){
    const pref = 2*Math.pow(2*Math.PI*M_E*K_B*T/(H_J*H_J), 1.5)*Math.pow(mat.me*mat.mh, 0.75);
    return pref*Math.exp(-mat.Eg/(2*K_EV10*T));
  }
  function nFree(Eg,T){    // the same thing with m* set to m, for comparison
    return 2*Math.pow(2*Math.PI*M_E*K_B*T/(H_J*H_J),1.5)*Math.exp(-Eg/(2*K_EV10*T));
  }

  function draw(){
    const {ctx,w,h}=fitCanvas(canvas);
    const mat=SEMI[matEl.value], T=parseFloat(tEl.value);
    tVal.textContent=fmt(T,0);
    const Eg=mat.Eg, kT=K_EV10*T, EF=Eg/2;

    // Band diagram with the Fermi-Dirac occupancy drawn against it on a LOG
    // axis: f drops by e^(-1/kT) per eV, so the tail is a straight line whose
    // slope is the temperature, and you can read f at the band edge directly.
    const m={l:56,r:16,t:22,b:40};
    const emax=Eg+1.2, emin=-1.2;
    const LMIN=-30;
    const {X,Y}=drawAxes(ctx,w,h,m,LMIN,0,emin,emax,'log₁₀ of the occupancy  f(ε) = 1/(e^((ε−ε_F)/kT)+1)','energy (eV)',
      {nx:5,ny:5,xfmt:v=>v.toFixed(0),yfmt:v=>v.toFixed(1)});

    // the two bands as filled blocks
    ctx.save();
    ctx.fillStyle='rgba(31,111,120,0.16)';
    ctx.fillRect(X(LMIN),Y(0),X(0)-X(LMIN),Y(emin)-Y(0));
    ctx.fillStyle='rgba(164,52,44,0.10)';
    ctx.fillRect(X(LMIN),Y(emax),X(0)-X(LMIN),Y(Eg)-Y(emax));
    ctx.restore();

    const pts=[];
    for(let e=emin;e<=emax;e+=(emax-emin)/700){
      const lf=Math.log10(1/(Math.exp((e-EF)/kT)+1));
      pts.push({x:Math.max(lf,LMIN), y:e});
    }
    ctx.save(); ctx.strokeStyle='#1c1d20'; ctx.lineWidth=2.4; ctx.beginPath();
    pts.forEach((p,i)=>{ i?ctx.lineTo(X(p.x),Y(p.y)):ctx.moveTo(X(p.x),Y(p.y)); });
    ctx.stroke(); ctx.restore();

    plotLine(ctx,X,Y,[{x:LMIN,y:EF},{x:0,y:EF}],'#8a6d1f',1.5,[5,4]);
    plotLine(ctx,X,Y,[{x:LMIN,y:0},{x:0,y:0}],'#1f6f78',1.8);
    plotLine(ctx,X,Y,[{x:LMIN,y:Eg},{x:0,y:Eg}],'#a4342c',1.8);
    // where the tail crosses the conduction-band edge
    const lfEdge=Math.log10(1/(Math.exp((Eg-EF)/kT)+1));
    if(lfEdge>LMIN){
      dotAt(ctx,X,Y,lfEdge,Eg,'#a4342c',5);
      plotLine(ctx,X,Y,[{x:lfEdge,y:emin},{x:lfEdge,y:Eg}],'#a4342c',1.1,[3,3]);
    }

    ctx.save(); ctx.font='11px Helvetica,Arial,sans-serif'; ctx.textAlign='left';
    ctx.fillStyle='#a4342c'; ctx.fillText('conduction band', m.l+8, Y(Eg)-6);
    ctx.fillStyle='#1f6f78'; ctx.fillText('valence band', m.l+8, Y(0)+14);
    ctx.fillStyle='#8a6d1f'; ctx.fillText(`ε_F = ${fmt(EF,2)} eV`, m.l+8, Y(EF)-5);
    ctx.textAlign='right'; ctx.fillStyle='#5a5d63';
    ctx.fillText(`gap ${fmt(Eg,2)} eV — the tail falls ${fmt(1/(kT*Math.LN10),1)} decades per eV`, w-m.r-8, m.t+14);
    if(lfEdge>LMIN){
      ctx.fillStyle='#a4342c';
      ctx.fillText(`f at the band edge = 10^${fmt(lfEdge,1)}`, w-m.r-8, Y(Eg)-6);
    }
    ctx.restore();

    drawArrhenius();

    const ni=nIntrinsic(mat,T);
    const ni_cm=ni/1e6;
    const niFree_cm=nFree(Eg,T)/1e6;
    const fEdge=1/(Math.exp((Eg-EF)/kT)+1);
    const sigma=EV_J*ni_cm*1e6*(mat.mun+mat.mup)*1e-4;   // S/m, using n = p = ni
    const perAtom=ni_cm/mat.N;
    const volPerCarrier = ni>0 ? 1/ni : Infinity;
    const earth = 1.083e21;   // volume of the Earth, m^3
    let vol='';
    if(ni_cm<1e-6){
      vol = `<div>one conduction electron per <b>${fmtSci(volPerCarrier,2)} m³</b> — an Earth-sized ${mat.name} (1.08×10²¹ m³) would hold about <b>${fmt(earth/volPerCarrier,1)}</b> of them</div>`;
    }
    readout.innerHTML = `
      <div>material <b>${mat.name}</b>, gap <b>${fmt(Eg,2)} eV</b>, kT at ${fmt(T,0)} K = <b>${fmt(kT,4)} eV</b></div>
      <div>E<sub>g</sub>/kT <b>${fmt(Eg/kT,1)}</b></div>
      <div>occupancy at the conduction-band edge <b>${fmtSci(fEdge,2)}</b></div>
      <div>n<sub>i</sub> = 2(2πkT/h²)<sup>3/2</sup>(m*<sub>e</sub>m*<sub>h</sub>)<sup>3/4</sup> e<sup>−E<sub>g</sub>/2kT</sup> <b>${fmtSci(ni_cm,2)} cm⁻³</b>
        ${mat.niExp?`<span class="badge ${Math.abs(Math.log10(ni_cm/mat.niExp))<0.35?'ok':'no'}">measured ${fmtSci(mat.niExp,1)}</span>`:''}</div>
      <div>effective masses m*<sub>e</sub> = ${fmt(mat.me,3)}m, m*<sub>h</sub> = ${fmt(mat.mh,2)}m
        — with m* = m instead it would be ${fmtSci(niFree_cm,2)}, off by ${fmt(Math.max(niFree_cm/ni_cm,ni_cm/niFree_cm),1)}×</div>
      <div>that is <b>${fmtSci(perAtom,2)}</b> carriers per atom</div>
      ${ni_cm>1e-6?`<div>intrinsic conductivity σ = e·n<sub>i</sub>(μ<sub>n</sub>+μ<sub>p</sub>) <b>${fmtSci(sigma,2)} S/m</b>
        — copper is 5.8×10⁷</div>`:''}
      ${vol}`;
  }

  // the Arrhenius plot: ln(ni) against 1/T is a straight line of slope -Eg/2k
  function drawArrhenius(){
    const {ctx,w,h}=fitCanvas(arrCanvas);
    const T=parseFloat(tEl.value);
    const m={l:62,r:18,t:22,b:40};
    const {X,Y}=drawAxes(ctx,w,h,m,1,6,-20,30,'1000/T  (K⁻¹)','ln[ n_i (cm⁻³) ]',
      {nx:5,ny:5,xfmt:v=>v.toFixed(0),yfmt:v=>v.toFixed(0)});
    Object.keys(SEMI).forEach(k=>{
      const s=SEMI[k], sel=(k===matEl.value);
      const pts=[];
      for(let x=1;x<=6;x+=0.02){
        const TT=1000/x;
        pts.push({x,y:Math.log(nIntrinsic(s,TT)/1e6)});
      }
      plotLine(ctx,X,Y,pts,sel?'#a4342c':'#d9d3c7',sel?2.8:1.5);
      if(sel) dotAt(ctx,X,Y,1000/T,Math.log(nIntrinsic(s,T)/1e6),'#a4342c',5);
      ctx.save(); ctx.font='10px Helvetica,Arial,sans-serif'; ctx.fillStyle=sel?'#a4342c':'#9a9384';
      ctx.textAlign='left';
      const y1=pts.find(p=>p.x>=1.05);
      if(y1 && y1.y>-20 && y1.y<30) ctx.fillText(s.name, X(1.12), Y(y1.y)-4);
      ctx.restore();
    });
    ctx.save(); ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle='#5a5d63'; ctx.textAlign='right';
    ctx.fillText('slope = −E_g/2k — the gap read straight off a conductivity measurement', w-m.r-8, m.t+14);
    ctx.restore();
  }

  matEl.addEventListener('change',draw);
  tEl.addEventListener('input',draw);
  registerCanvas('gp_canvas',draw);
  registerCanvas('gp_arr',draw);
}

/* =====================================================================
   6. DOPING AND THE p-n JUNCTION
   ===================================================================== */
function setupJunction(){
  const bandCanvas=document.getElementById('pn_bands');
  const ivCanvas=document.getElementById('pn_iv');
  const matEl=document.getElementById('pn_mat');
  const dopeEl=document.getElementById('pn_dope'), dopeVal=document.getElementById('pn_dope_val');
  const vEl=document.getElementById('pn_v'), vVal=document.getElementById('pn_v_val');
  const tEl=document.getElementById('pn_t'), tVal=document.getElementById('pn_t_val');
  const readout=document.getElementById('pn_readout');

  function ni_cm(mat,T){
    return 2*Math.pow(2*Math.PI*M_E*K_B*T/(H_J*H_J),1.5)*Math.pow(mat.me*mat.mh,0.75)
           *Math.exp(-mat.Eg/(2*K_EV10*T))/1e6;
  }

  function drawBands(){
    const {ctx,w,h}=fitCanvas(bandCanvas);
    const mat=SEMI[matEl.value], T=parseFloat(tEl.value), V=parseFloat(vEl.value);
    const Eg=mat.Eg, kT=K_EV10*T;
    const logNd=parseFloat(dopeEl.value), Nd=Math.pow(10,logNd);
    const ni=ni_cm(mat,T);
    // Fermi level measured from the valence-band top
    const n=(Nd+Math.sqrt(Nd*Nd+4*ni*ni))/2;
    const p=ni*ni/n;
    const EFn=Math.min(Eg-0.03, Eg/2 + kT*Math.log(Math.max(n,ni)/ni));
    const EFp=Math.max(0.03, Eg/2 - kT*Math.log(Math.max(n,ni)/ni));
    const Vbi=EFn-EFp;                 // built-in potential (eV)
    const bend=Math.max(0.02, Vbi - V);

    ctx.fillStyle='#fbfaf7'; ctx.fillRect(0,0,w,h);
    const m={l:16,r:16,t:26,b:34};
    const top=m.t, bot=h-m.b;
    const Emin=-0.35, Emax=Eg+bend+0.45;
    const Y=e=>bot-(e-Emin)/(Emax-Emin)*(bot-top);
    const xl=m.l, xr=w-m.r, xj=(xl+xr)/2, dw=Math.min(80,(xr-xl)*0.18);

    // band edges: flat, then a smooth step of height `bend` across the junction
    function edge(x, base){
      if(x<=xj-dw) return base+bend;
      if(x>=xj+dw) return base;
      const u=(x-(xj-dw))/(2*dw);
      return base + bend*(1-(3*u*u-2*u*u*u));
    }
    function band(base,col,wid){
      ctx.save(); ctx.strokeStyle=col; ctx.lineWidth=wid; ctx.beginPath();
      for(let x=xl;x<=xr;x+=2){ const y=Y(edge(x,base)); x===xl?ctx.moveTo(x,y):ctx.lineTo(x,y); }
      ctx.stroke(); ctx.restore();
    }
    // depletion region
    ctx.save(); ctx.fillStyle='rgba(138,109,31,0.10)';
    ctx.fillRect(xj-dw,top,2*dw,bot-top); ctx.restore();

    band(Eg,'#a4342c',2.2);
    band(0,'#1f6f78',2.2);
    // Fermi levels: one flat line at zero bias, split by V otherwise
    ctx.save(); ctx.strokeStyle='#8a6d1f'; ctx.lineWidth=1.5; ctx.setLineDash([5,4]);
    ctx.beginPath(); ctx.moveTo(xl,Y(EFp+bend)); ctx.lineTo(xj-dw,Y(EFp+bend)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(xj+dw,Y(EFn)); ctx.lineTo(xr,Y(EFn)); ctx.stroke();
    ctx.restore();

    // carriers — deterministic jitter, so the picture doesn't flicker on redraw
    const jit=i=>((Math.sin(i*12.9898)*43758.5453)%1+1)%1;
    ctx.save();
    for(let i=0;i<16;i++){
      const x=xl+8+jit(i)*((xj-dw)-xl-16);
      ctx.fillStyle='#1f6f78'; ctx.beginPath();
      ctx.arc(x, Y(edge(x,0))+6+jit(i+40)*8, 2.6,0,7); ctx.fill();
    }
    for(let i=0;i<16;i++){
      const x=xj+dw+8+jit(i+80)*(xr-(xj+dw)-16);
      ctx.fillStyle='#a4342c'; ctx.beginPath();
      ctx.arc(x, Y(edge(x,Eg))-6-jit(i+120)*8, 2.6,0,7); ctx.fill();
    }
    ctx.restore();

    ctx.save(); ctx.font='11px Helvetica,Arial,sans-serif';
    ctx.textAlign='left';
    ctx.fillStyle='#a4342c'; ctx.fillText('conduction band', xl+4, Y(Eg+bend)-6);
    ctx.fillStyle='#1f6f78'; ctx.fillText('valence band', xl+4, Y(bend)-6);
    ctx.textAlign='right';
    ctx.fillStyle='#8a6d1f'; ctx.fillText('ε_F', xr-4, Y(EFn)-5);
    ctx.fillStyle='#5a5d63'; ctx.textAlign='center';
    ctx.fillText('p side — holes in the valence band', (xl+xj-dw)/2, h-12);
    ctx.fillText('n side — electrons in the conduction band', (xr+xj+dw)/2, h-12);
    ctx.fillStyle='#8a6d1f';
    ctx.fillText('depletion region', xj, top-8);
    ctx.textAlign='left'; ctx.fillStyle='#1c1d20';
    ctx.fillText(V>0.001?`forward bias ${fmt(V,2)} V — barrier down to ${fmt(bend,3)} eV`
                :V<-0.001?`reverse bias ${fmt(-V,2)} V — barrier up to ${fmt(bend,3)} eV`
                :`no bias — barrier is the built-in ${fmt(bend,3)} eV`, xl+4, top-8);
    ctx.restore();
  }

  function drawIV(){
    const {ctx,w,h}=fitCanvas(ivCanvas);
    const T=parseFloat(tEl.value), V=parseFloat(vEl.value);
    const kTv=K_EV10*T;                 // kT/e in volts
    const I0=1e-12;                     // 1 pA saturation current
    const m={l:66,r:18,t:22,b:40};
    const vmax=0.8, imax=0.02;
    const {X,Y}=drawAxes(ctx,w,h,m,-vmax,vmax,-imax*0.25,imax,'bias voltage V (V)','current (A)',
      {nx:8,ny:5,xfmt:v=>v.toFixed(1),yfmt:v=>(v*1000).toFixed(0)+' mA'});
    const pts=[];
    for(let v=-vmax;v<=vmax;v+=vmax/400){
      const i=I0*(Math.exp(v/kTv)-1);
      pts.push({x:v,y:i>imax?null:i});
    }
    plotLine(ctx,X,Y,[{x:-vmax,y:0},{x:vmax,y:0}],'#c9c4b8',1);
    plotLine(ctx,X,Y,[{x:0,y:-imax*0.25},{x:0,y:imax}],'#c9c4b8',1);
    plotLine(ctx,X,Y,pts,'#a4342c',2.8);
    const Inow=I0*(Math.exp(V/kTv)-1);
    if(Inow<imax && Inow>-imax*0.25) dotAt(ctx,X,Y,V,Inow,'#1c1d20',5);
    const decade=Math.LN10*kTv;
    ctx.save(); ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle='#5a5d63'; ctx.textAlign='left';
    ctx.fillText(`I = I₀(e^(eV/kT) − 1),  I₀ = 1 pA`, m.l+10, m.t+14);
    ctx.fillText(`${fmt(decade*1000,1)} mV per decade of current at ${fmt(T,0)} K`, m.l+10, m.t+29);
    ctx.textAlign='right'; ctx.fillStyle='#1f6f78';
    ctx.fillText('reverse: current saturates at −I₀', X(-0.1), Y(0)+18);
    ctx.restore();
  }

  function draw(){
    const mat=SEMI[matEl.value], T=parseFloat(tEl.value), V=parseFloat(vEl.value);
    const logNd=parseFloat(dopeEl.value);
    dopeVal.textContent='10^'+fmt(logNd,1); tVal.textContent=fmt(T,0); vVal.textContent=fmt(V,2);
    const Nd=Math.pow(10,logNd), ni=ni_cm(mat,T), kT=K_EV10*T;
    const n=(Nd+Math.sqrt(Nd*Nd+4*ni*ni))/2, p=ni*ni/n;
    drawBands(); drawIV();
    const sigInt=EV_J*ni*1e6*(mat.mun+mat.mup)*1e-4;
    const sigDop=EV_J*1e6*(n*mat.mun+p*mat.mup)*1e-4;
    const purity=mat.N/Nd;
    const I0=1e-12, I=I0*(Math.exp(V/kT)-1);
    readout.innerHTML = `
      <div>material <b>${mat.name}</b>, gap ${fmt(mat.Eg,2)} eV, T = ${fmt(T,0)} K</div>
      <div>intrinsic n<sub>i</sub> <b>${fmtSci(ni,2)} cm⁻³</b></div>
      <div>donor density N<sub>d</sub> <b>${fmtSci(Nd,2)} cm⁻³</b> — one donor per <b>${fmtSci(purity,2)}</b> host atoms</div>
      <div>electrons n <b>${fmtSci(n,2)} cm⁻³</b>, holes p = n<sub>i</sub>²/n <b>${fmtSci(p,2)} cm⁻³</b></div>
      <div>majority/minority ratio <b>${fmtSci(n/p,2)}</b></div>
      <div>conductivity: intrinsic ${fmtSci(sigInt,2)} S/m → doped <b>${fmtSci(sigDop,2)} S/m</b>
        <span class="badge ${sigDop/sigInt>10?'ok':''}">×${fmtSci(sigDop/sigInt,2)}</span></div>
      <div>built-in barrier kT·ln(n/n<sub>i</sub>) × 2 <b>${fmt(2*kT*Math.log(Math.max(n,ni)/ni),3)} eV</b></div>
      <div>diode current at ${fmt(V,2)} V <b>${Math.abs(I)>1e-6?fmtSci(I,2)+' A':fmtSci(I,2)+' A'}</b>
        (e<sup>eV/kT</sup> = ${fmtSci(Math.exp(V/kT),2)})</div>`;
  }

  matEl.addEventListener('change',draw);
  dopeEl.addEventListener('input',draw);
  vEl.addEventListener('input',draw);
  tEl.addEventListener('input',draw);
  registerCanvas('pn_bands',draw);
  registerCanvas('pn_iv',draw);
}

/* =====================================================================
   7. BRILLOUIN ZONES AND THE ORIGIN OF THE GAP
   ===================================================================== */
function setupBrillouin(){
  const ekCanvas=document.getElementById('bz_ek');
  const zoneCanvas=document.getElementById('bz_zones');
  const swCanvas=document.getElementById('bz_standing');
  const aEl=document.getElementById('bz_a'), aVal=document.getElementById('bz_a_val');
  const uEl=document.getElementById('bz_u'), uVal=document.getElementById('bz_u_val');
  const zEl=document.getElementById('bz_z'), zVal=document.getElementById('bz_z_val');
  const readout=document.getElementById('bz_readout');

  /* Eigenvalues of the symmetric tridiagonal matrix
        diag_n = hbar^2 (k + nG)^2 / 2m,  off-diagonal = U
     found by bisection on the Sturm sequence — exact to machine precision,
     and the whole band structure of the nearly-free-electron model.       */
  function sturmCount(d,e,lam){
    // number of eigenvalues strictly less than lam
    let count=0, q=d[0]-lam;
    if(q<0) count++;
    for(let i=1;i<d.length;i++){
      if(q===0) q=1e-14;
      q = d[i]-lam - e[i-1]*e[i-1]/q;
      if(q<0) count++;
    }
    return count;
  }
  function eigenvalues(d,e,want){
    let lo=Math.min(...d)-Math.abs(e[0])*2-1, hi=Math.max(...d)+Math.abs(e[0])*2+1;
    const out=[];
    for(let j=0;j<want;j++){
      let a=lo,b=hi;
      for(let it=0;it<70;it++){
        const mid=(a+b)/2;
        if(sturmCount(d,e,mid)<=j) a=mid; else b=mid;
      }
      out.push((a+b)/2);
    }
    return out;
  }
  const NPW=9;    // plane waves kept: n = -4 .. +4
  let _lastLimits=null;   // per-band min/max from the last E-k draw
  function bands(k,a,U){
    const G=2*Math.PI/a, d=[], e=[];
    for(let n=-4;n<=4;n++) d.push(H2_2M_S*Math.pow(k+n*G,2));
    for(let i=0;i<NPW-1;i++) e.push(U);
    return eigenvalues(d,e,4);
  }

  function drawEk(){
    const {ctx,w,h}=fitCanvas(ekCanvas);
    const a=parseFloat(aEl.value), U=parseFloat(uEl.value);
    const G=2*Math.PI/a, kb=Math.PI/a;
    const m={l:60,r:18,t:22,b:42};
    const kmax=3*kb, emax=H2_2M_S*kmax*kmax*1.05;
    const {X,Y}=drawAxes(ctx,w,h,m,-kmax,kmax,0,emax,'wave number k (nm⁻¹)','energy (eV)',
      {nx:6,ny:5,xfmt:v=>v.toFixed(0),yfmt:v=>v.toFixed(0)});

    // the free-electron parabola, for comparison
    const free=[];
    for(let k=-kmax;k<=kmax;k+=kmax/300) free.push({x:k,y:H2_2M_S*k*k});
    plotLine(ctx,X,Y,free,'#c9c4b8',1.6,[5,4]);

    // zone boundaries
    for(let n=-3;n<=3;n++){
      if(n===0) continue;
      plotLine(ctx,X,Y,[{x:n*kb,y:0},{x:n*kb,y:emax}],'#e0d8c8',1.2);
    }

    // the computed bands, drawn in the extended-zone scheme: band j is plotted
    // only where it is the branch the free electron would be on. The extremes
    // of each band, tracked here, are what actually define the forbidden ranges.
    const COLS=['#a4342c','#1f6f78','#8a6d1f','#5b3f8a'];
    const step=2*kb/260;
    const lim=[];
    for(let j=0;j<4;j++){
      const seg=[[],[]];
      let bmin=Infinity, bmax=-Infinity;
      for(let k=-kmax;k<=kmax;k+=step){
        const kr=((k % G)+G+ (Math.PI/a)) % G - (Math.PI/a);   // fold into first zone
        const E=bands(kr,a,U)[j];
        const inZone = Math.abs(k)>=j*kb-1e-9 && Math.abs(k)<=(j+1)*kb+1e-9;
        if(!inZone) continue;
        if(E<bmin) bmin=E; if(E>bmax) bmax=E;
        (k<0?seg[0]:seg[1]).push({x:k,y:E>emax?null:E});
      }
      lim.push({min:bmin,max:bmax});
      seg.forEach(s=>plotLine(ctx,X,Y,s,COLS[j],2.6));
    }

    // a forbidden range is where one band's ceiling lies below the next band's floor
    for(let j=0;j<3;j++){
      const lo=lim[j].max, hi=lim[j+1].min;
      if(hi-lo < 1e-4) continue;
      if(lo>emax) break;
      const yh=Y(Math.min(hi,emax)), yl2=Y(lo);
      ctx.save();
      ctx.fillStyle='rgba(164,52,44,0.14)';
      ctx.fillRect(m.l, yh, w-m.l-m.r, Math.max(1.5, yl2-yh));
      ctx.strokeStyle='rgba(164,52,44,0.75)'; ctx.lineWidth=1; ctx.setLineDash([3,3]);
      ctx.beginPath(); ctx.moveTo(m.l,yh); ctx.lineTo(w-m.r,yh);
      ctx.moveTo(m.l,yl2); ctx.lineTo(w-m.r,yl2); ctx.stroke();
      ctx.restore();
      ctx.save(); ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle='#a4342c'; ctx.textAlign='left';
      const lab=`forbidden — ${(hi-lo)<0.01?fmtSci(hi-lo,2):fmt(hi-lo,3)} eV`;
      ctx.fillText(lab, m.l+8, (yl2-yh)>26 ? (yh+yl2)/2+4 : yh-4);
      ctx.restore();
    }
    _lastLimits=lim;
    ctx.save(); ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle='#9a9384'; ctx.textAlign='right';
    ctx.fillText('free electron, E = ℏ²k²/2m', w-m.r-8, m.t+14);
    ctx.fillStyle='#5a5d63';
    ctx.fillText(`zone boundaries at k = ±nπ/a = ±${fmt(kb,1)}, ±${fmt(2*kb,1)}, ... nm⁻¹`, w-m.r-8, m.t+29);
    ctx.restore();
  }

  function drawZones(){
    const {ctx,w,h}=fitCanvas(zoneCanvas);
    const a=parseFloat(aEl.value), z=parseFloat(zEl.value);
    const kb=Math.PI/a;
    ctx.fillStyle='#fbfaf7'; ctx.fillRect(0,0,w,h);
    const cx=w/2, cy=h/2, S=(h-70)*0.5/(2*kb);   // px per nm^-1
    const P=(kx,ky)=>[cx+kx*S, cy-ky*S];

    // k axes
    ctx.save(); ctx.strokeStyle='#ddd8cc'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(24,cy); ctx.lineTo(w-24,cy);
    ctx.moveTo(cx,20); ctx.lineTo(cx,h-20); ctx.stroke();
    ctx.font='10px Helvetica,Arial,sans-serif'; ctx.fillStyle='#9a9384';
    [[-2,'−2π/a'],[-1,'−π/a'],[1,'π/a'],[2,'2π/a']].forEach(([n,lab])=>{
      const px=cx+n*kb*S;
      ctx.beginPath(); ctx.moveTo(px,cy-4); ctx.lineTo(px,cy+4); ctx.stroke();
      ctx.textAlign='center'; ctx.fillText(lab, px, cy+16);
    });
    ctx.textAlign='left'; ctx.fillText('k_x', w-40, cy-6);
    ctx.textAlign='center'; ctx.fillText('k_y', cx+16, 26);
    ctx.restore();

    // second zone: the diamond out to 2*kb along the diagonals
    ctx.save();
    ctx.fillStyle='rgba(31,111,120,0.12)';
    ctx.beginPath();
    ctx.moveTo(...P(2*kb,0)); ctx.lineTo(...P(0,2*kb));
    ctx.lineTo(...P(-2*kb,0)); ctx.lineTo(...P(0,-2*kb)); ctx.closePath(); ctx.fill();
    // first zone: the square
    ctx.fillStyle='rgba(164,52,44,0.16)';
    ctx.fillRect(...P(-kb,kb), 2*kb*S, 2*kb*S);
    ctx.restore();

    ctx.save(); ctx.strokeStyle='#a4342c'; ctx.lineWidth=2;
    ctx.strokeRect(...P(-kb,kb), 2*kb*S, 2*kb*S);
    ctx.strokeStyle='#1f6f78'; ctx.lineWidth=1.8; ctx.beginPath();
    ctx.moveTo(...P(2*kb,0)); ctx.lineTo(...P(0,2*kb));
    ctx.lineTo(...P(-2*kb,0)); ctx.lineTo(...P(0,-2*kb)); ctx.closePath(); ctx.stroke();
    ctx.restore();

    // the Fermi circle for z electrons per atom in a square lattice:
    // n = z/a^2 per unit area, and n = kF^2/(2*pi) counting two spins
    const kF=Math.sqrt(2*Math.PI*z)/a;
    ctx.save(); ctx.strokeStyle='#1c1d20'; ctx.lineWidth=2.4; ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(cx,cy,kF*S,0,7); ctx.stroke();
    ctx.fillStyle='rgba(28,29,32,0.06)'; ctx.fill();
    ctx.restore();

    ctx.save(); ctx.font='11px Helvetica,Arial,sans-serif';
    ctx.fillStyle='#a4342c'; ctx.textAlign='left'; ctx.fillText('first Brillouin zone', 12, 18);
    ctx.fillStyle='#1f6f78'; ctx.fillText('second zone', 12, 33);
    ctx.fillStyle='#1c1d20'; ctx.fillText(`Fermi circle, ${fmt(z,2)} electrons per atom`, 12, 48);
    ctx.textAlign='right'; ctx.fillStyle='#5a5d63';
    ctx.fillText(kF<kb ? 'circle inside the zone — a metal, no boundary reached'
                : kF<Math.SQRT2*kb ? 'circle crosses the zone faces — the lattice is distorting it'
                : 'circle beyond the zone corners — the first zone is full', w-12, h-12);
    ctx.restore();
  }

  function drawStanding(){
    const {ctx,w,h}=fitCanvas(swCanvas);
    const a=parseFloat(aEl.value);
    ctx.fillStyle='#fbfaf7'; ctx.fillRect(0,0,w,h);
    const m={l:20,r:20,t:20,b:34};
    const nCell=5, span=w-m.l-m.r;
    const X=x=>m.l+x/(nCell)*span;      // x in units of a
    const base=h-m.b, amp=(base-m.t)*0.42;

    // the ions
    ctx.save(); ctx.fillStyle='#d8d2c6';
    for(let i=0;i<=nCell;i++){ ctx.beginPath(); ctx.arc(X(i),base+8,5,0,7); ctx.fill(); }
    ctx.restore();

    function curve(f,col,off){
      ctx.save(); ctx.strokeStyle=col; ctx.lineWidth=2.4; ctx.beginPath();
      for(let x=0;x<=nCell;x+=0.004){
        const y=base-off-f(x)*amp*0.46;
        x===0?ctx.moveTo(X(x),y):ctx.lineTo(X(x),y);
      }
      ctx.stroke(); ctx.restore();
    }
    // |psi1|^2 = sin^2(pi x / a): nodes AT the ions -> higher energy
    // |psi2|^2 = cos^2(pi x / a): peaks AT the ions -> lower energy
    curve(x=>Math.pow(Math.sin(Math.PI*x),2), '#a4342c', 4);
    curve(x=>Math.pow(Math.cos(Math.PI*x),2), '#1f6f78', amp*0.62);

    ctx.save(); ctx.font='11px Helvetica,Arial,sans-serif'; ctx.textAlign='left';
    ctx.fillStyle='#a4342c'; ctx.fillText('|ψ₁|² = sin²(πx/a) — charge sits between the ions, higher energy', m.l, m.t-4);
    ctx.fillStyle='#1f6f78'; ctx.fillText('|ψ₂|² = cos²(πx/a) — charge sits on the ions, lower energy', m.l, m.t+11);
    ctx.fillStyle='#5a5d63'; ctx.textAlign='center';
    ctx.fillText(`the two standing waves at k = π/a — same wavelength ${fmt(2*a,3)} nm, different energies`, w/2, h-10);
    ctx.restore();
  }

  function draw(){
    const a=parseFloat(aEl.value), U=parseFloat(uEl.value), z=parseFloat(zEl.value);
    aVal.textContent=fmt(a,3); uVal.textContent=fmt(U,2); zVal.textContent=fmt(z,2);
    drawEk(); drawZones(); drawStanding();
    const kb=Math.PI/a, G=2*Math.PI/a;
    const Efree=H2_2M_S*kb*kb;
    const L=_lastLimits;
    const gap1=L?Math.max(0,L[1].min-L[0].max):0;
    const gap2=L?Math.max(0,L[2].min-L[1].max):0;
    const kF=Math.sqrt(2*Math.PI*z)/a;
    const lam=2*a;
    const pEdge=H_J/(lam*1e-9);
    readout.innerHTML = `
      <div>lattice spacing a <b>${fmt(a,3)} nm</b> → zone boundary π/a <b>${fmt(kb,2)} nm⁻¹</b>, G = 2π/a = ${fmt(G,2)} nm⁻¹</div>
      <div>electron wavelength at the boundary λ = 2a <b>${fmt(lam,3)} nm</b> — exactly the Bragg condition nλ = 2a sin θ at θ = 90°</div>
      <div>free-electron energy there ℏ²k²/2m <b>${fmt(Efree,3)} eV</b></div>
      <div>lattice potential |U| <b>${fmt(U,2)} eV</b></div>
      <div>computed gap at k = ±π/a <b>${fmt(gap1,3)} eV</b>
        <span class="badge ${Math.abs(gap1-2*U)<0.03*Math.max(U,0.05)+0.005?'ok':''}">2|U| = ${fmt(2*U,3)}</span></div>
      <div>gap at the next boundary, k = ±2π/a <b>${gap2>1e-4?fmt(gap2,4)+' eV':'closed — the bands overlap'}</b>
        ${gap2>1e-4?'— far narrower: it is a second-order effect, of order |U|²/E':''}</div>
      <div>Fermi circle radius for ${fmt(z,2)} electrons/atom <b>${fmt(kF,2)} nm⁻¹</b>
        <span class="badge ${kF<kb?'ok':'no'}">${kF<kb?'never touches the boundary':'reaches the boundary'}</span></div>`;
  }

  aEl.addEventListener('input',draw);
  uEl.addEventListener('input',draw);
  zEl.addEventListener('input',draw);
  registerCanvas('bz_ek',draw);
  registerCanvas('bz_zones',draw);
  registerCanvas('bz_standing',draw);
}

/* =====================================================================
   8. SUPERCONDUCTIVITY
   ===================================================================== */
function setupSuperconductivity(){
  const phaseCanvas=document.getElementById('sc_phase');
  const gapCanvas=document.getElementById('sc_gap');
  const matEl=document.getElementById('sc_mat');
  const tEl=document.getElementById('sc_t'), tVal=document.getElementById('sc_t_val');
  const bEl=document.getElementById('sc_b'), bVal=document.getElementById('sc_b_val');
  const readout=document.getElementById('sup_readout');

  /* The BCS gap equation, solved numerically. In reduced units where
       x = eps/Delta0,  the equation is
         asinh(W) = Integral_0^W  tanh( sqrt(x^2+u^2) * R/(2*t*u_of_0) ) / sqrt(x^2+u^2) dx
     It is easier to work with the dimensionless form directly: pick the
     coupling through W = hbar*omega_D/Delta0, then for each T solve
         1/lambda = Int_0^{W} tanh( sqrt(x^2+d^2) / (2*theta) ) / sqrt(x^2+d^2) dx
     with d = Delta(T)/Delta0, theta = kT/Delta0, and 1/lambda = asinh(W).
     The resulting curve is universal and lands on 2*Delta0 = 3.53 kTc.     */
  const W=Math.sinh(4);            // weak coupling: lambda = N(0)V = 0.25
  const INV_L=Math.asinh(W);
  function gapIntegral(d,theta){
    const N=400; let s=0;
    for(let i=0;i<N;i++){
      const x=(i+0.5)*W/N;
      const r=Math.sqrt(x*x+d*d);
      s += Math.tanh(r/(2*theta))/r;
    }
    return s*W/N;
  }
  function deltaOf(theta){         // theta = kT/Delta0; returns Delta(T)/Delta(0)
    if(gapIntegral(0,theta) < INV_L) return 0;
    let lo=0, hi=1.2;
    for(let i=0;i<48;i++){
      const mid=(lo+hi)/2;
      if(gapIntegral(mid,theta) > INV_L) lo=mid; else hi=mid;
    }
    return (lo+hi)/2;
  }
  // theta at which the gap closes = kTc/Delta0, so 2*Delta0/kTc = 2/thetaC
  let THETA_C=null, GAP_CURVE=null;
  function buildCurve(){
    let lo=0.1, hi=1.5;
    for(let i=0;i<50;i++){
      const mid=(lo+hi)/2;
      if(deltaOf(mid)>0) lo=mid; else hi=mid;
    }
    THETA_C=(lo+hi)/2;
    GAP_CURVE=[];
    for(let i=0;i<=100;i++){
      const tr=i/100;                       // T/Tc
      GAP_CURVE.push({x:tr, y: tr<1e-6 ? 1 : deltaOf(tr*THETA_C)});
    }
  }

  function drawPhase(){
    const {ctx,w,h}=fitCanvas(phaseCanvas);
    const s=SUPER[matEl.value], T=parseFloat(tEl.value), Bf=parseFloat(bEl.value);
    const B=Bf*s.Bc;
    const m={l:64,r:18,t:22,b:42};
    const {X,Y}=drawAxes(ctx,w,h,m,0,s.Tc*1.25,0,s.Bc*1.25,'temperature (K)',
      s.type===1?'critical field B_c (T)':'upper critical field B_c2 (T)',
      {nx:5,ny:5,xfmt:v=>v.toFixed(v<10?1:0),yfmt:v=>v<0.2?v.toFixed(3):v.toFixed(1)});
    const pts=[];
    for(let t=0;t<=s.Tc;t+=s.Tc/300) pts.push({x:t,y:s.Bc*(1-Math.pow(t/s.Tc,2))});
    ctx.save(); ctx.fillStyle='rgba(31,111,120,0.16)'; ctx.beginPath();
    ctx.moveTo(X(0),Y(0));
    pts.forEach(p=>ctx.lineTo(X(p.x),Y(p.y)));
    ctx.lineTo(X(s.Tc),Y(0)); ctx.closePath(); ctx.fill(); ctx.restore();
    plotLine(ctx,X,Y,pts,'#1f6f78',2.8);
    const Bc=s.Bc*(1-Math.pow(Math.min(T,s.Tc)/s.Tc,2));
    const on = T<s.Tc && B<Bc;
    dotAt(ctx,X,Y,T,B,on?'#1f6f78':'#a4342c',6);
    ctx.save(); ctx.font='11px Helvetica,Arial,sans-serif'; ctx.textAlign='left';
    ctx.fillStyle='#1f6f78'; ctx.fillText('superconducting', m.l+14, Y(s.Bc*0.22));
    ctx.fillStyle='#a4342c'; ctx.fillText('ordinary conductor', X(s.Tc*0.55), m.t+16);
    ctx.textAlign='right'; ctx.fillStyle=on?'#1f6f78':'#a4342c';
    ctx.fillText(on?'this sample is superconducting':'this sample has normal resistance', w-m.r-8, m.t+16);
    ctx.restore();
  }

  function drawGap(){
    const {ctx,w,h}=fitCanvas(gapCanvas);
    const s=SUPER[matEl.value], T=parseFloat(tEl.value);
    const m={l:62,r:18,t:22,b:42};
    const {X,Y}=drawAxes(ctx,w,h,m,0,1.1,0,1.15,'T / T_c','E_g(T) / E_g(0)',
      {nx:5,ny:5,xfmt:v=>v.toFixed(1),yfmt:v=>v.toFixed(1)});
    ctx.save(); ctx.fillStyle='rgba(164,52,44,0.12)'; ctx.beginPath();
    ctx.moveTo(X(0),Y(0));
    GAP_CURVE.forEach(p=>ctx.lineTo(X(p.x),Y(p.y)));
    ctx.lineTo(X(1),Y(0)); ctx.closePath(); ctx.fill(); ctx.restore();
    plotLine(ctx,X,Y,GAP_CURVE,'#a4342c',2.8);
    plotLine(ctx,X,Y,[{x:1,y:0},{x:1,y:1.15}],'#c9c4b8',1.4,[4,3]);
    const tr=Math.min(T/s.Tc,1.1);
    const g = tr>=1 ? 0 : deltaOf(tr*THETA_C);
    dotAt(ctx,X,Y,tr,g,'#1c1d20',5.5);
    ctx.save(); ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle='#5a5d63'; ctx.textAlign='right';
    ctx.fillText('BCS gap equation, solved numerically', w-m.r-8, m.t+14);
    ctx.textAlign='left'; ctx.fillStyle='#a4342c';
    ctx.fillText('flat at low T — pairs stay intact', m.l+10, Y(1.04));
    ctx.restore();
  }

  function draw(){
    if(!GAP_CURVE) buildCurve();
    const s=SUPER[matEl.value];
    tVal.textContent=fmt(parseFloat(tEl.value),2); bVal.textContent=fmt(parseFloat(bEl.value),2);
    drawPhase(); drawGap();
    const Tk=parseFloat(tEl.value), Bf=parseFloat(bEl.value), B=Bf*s.Bc;
    const Eg0=3.53*K_EV10*s.Tc;
    const tr=Math.min(Tk/s.Tc,1);
    const EgT = tr>=1 ? 0 : Eg0*deltaOf(tr*THETA_C);
    const nu=Eg0/H_EV, lam=C/nu;
    const Bc=s.Bc*(1-Math.pow(Math.min(Tk,s.Tc)/s.Tc,2));
    const ratio=2/THETA_C;
    const on = Tk<s.Tc && B<Bc;
    const kT300=K_EV10*300;
    readout.innerHTML = `
      <div>material <b>${s.name}</b> — type ${s.type}, T<sub>c</sub> = <b>${fmt(s.Tc,2)} K</b>,
        ${s.type===1?'B_c(0)':'B_c2(0)'} = <b>${s.Bc<1?fmt(s.Bc,4):fmt(s.Bc,1)} T</b></div>
      <div>at ${fmt(Tk,2)} K the critical field is <b>${Bc<1?fmt(Bc,4):fmt(Bc,2)} T</b>; applied field <b>${B<1?fmt(B,4):fmt(B,2)} T</b>
        <span class="badge ${on?'ok':'no'}">${on?'superconducting':'normal'}</span></div>
      <div>gap at 0 K, E<sub>g</sub> = 3.53kT<sub>c</sub> <b>${fmtSci(Eg0,3)} eV</b> = ${fmt(Eg0*1000,3)} meV</div>
      <div>gap at ${fmt(Tk,2)} K <b>${fmt(EgT*1000,4)} meV</b> — ${fmt(tr>=1?0:deltaOf(tr*THETA_C)*100,1)}% of its zero-temperature value</div>
      <div>photon needed to break a pair: ν = E<sub>g</sub>/h <b>${fmtSci(nu,3)} Hz</b>, λ = <b>${fmt(lam*1000,2)} mm</b> — microwaves</div>
      <div>the numerical BCS solution gives 2Δ(0)/kT<sub>c</sub> = <b>${fmt(ratio,3)}</b> — Beiser's 3.53, derived not assumed</div>
      <div>flux quantum Φ₀ = h/2e <b>${fmtSci(PHI0,4)} T m²</b>
        — through a 1 mm² ring that is a field of only ${fmtSci(PHI0/1e-6,2)} T</div>
      <div>room-temperature kT is <b>${kT300>Eg0?fmt(kT300/Eg0,1)+'×':fmt(Eg0/kT300,2)+'× smaller than'}</b> this gap${kT300>Eg0?' — which is exactly why superconductivity is cryogenic':' — and even so, T<sub>c</sub> is far below room temperature'}</div>`;
  }

  matEl.addEventListener('change',()=>{
    const s=SUPER[matEl.value];
    tEl.max=fmt(s.Tc*1.25,3); tEl.step=fmt(s.Tc/200,5);
    if(parseFloat(tEl.value)>s.Tc*1.25) tEl.value=fmt(s.Tc*0.5,3);
    draw();
  });
  tEl.addEventListener('input',draw);
  bEl.addEventListener('input',draw);
  registerCanvas('sc_phase',draw);
  registerCanvas('sc_gap',draw);
}

// register with the loader in app.js
registerModule('setupIonicCrystal', setupIonicCrystal);
registerModule('setupVanDerWaals', setupVanDerWaals);
registerModule('setupDrift', setupDrift);
registerModule('setupBandFormation', setupBandFormation);
registerModule('setupBandGap', setupBandGap);
registerModule('setupJunction', setupJunction);
registerModule('setupBrillouin', setupBrillouin);
registerModule('setupSuperconductivity', setupSuperconductivity);
