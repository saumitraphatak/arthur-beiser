/* =====================================================================
   Concepts of Modern Physics — Interactive Companion
   Chapter 12: Nuclear Transformations
   Masses, abundances and half-lives come from nuclides.js (Beiser's own
   Appendix table). Everything else is computed live from the chapter.
   ===================================================================== */

const M_E_U    = 0.00054858;    // electron mass, u
const SEC_YEAR = 3.1557e7;      // seconds in a Julian year
const CURIE    = 3.70e10;       // decays/s
const BARN     = 1e-28;         // m^2
const ALPHA_FS = 1/137.036;     // fine-structure constant
const KE2_JM   = 8.98755e9*EV_J*EV_J;   // e^2/4 pi eps0, in J m

function Mu(Z,A){ const r=NUC[Z+'_'+A]; return r?r.m:null; }
function halfLife(Z,A){ const r=NUC[Z+'_'+A]; return r&&r.t>0?r.t:null; }

// Q values, all in the atomic-mass bookkeeping where the electrons cancel
function qBetaMinus(Z,A){ const a=Mu(Z,A), b=Mu(Z+1,A); return (a!=null&&b!=null)?(a-b)*U_MEV:null; }
function qBetaPlus(Z,A){ const a=Mu(Z,A), b=Mu(Z-1,A); return (a!=null&&b!=null)?(a-b-2*M_E_U)*U_MEV:null; }
function qCapture(Z,A){ const a=Mu(Z,A), b=Mu(Z-1,A); return (a!=null&&b!=null)?(a-b)*U_MEV:null; }
function qAlpha(Z,A){ const a=Mu(Z,A), b=Mu(Z-2,A-4), h=Mu(2,4);
  return (a!=null&&b!=null)?(a-b-h)*U_MEV:null; }

function humanTime(s){
  if(s==null||!isFinite(s)) return '—';
  const Y=SEC_YEAR;
  if(s>=1e9*Y) return fmt(s/(1e9*Y),2)+' billion y';
  if(s>=1e6*Y) return fmt(s/(1e6*Y),2)+' million y';
  if(s>=Y)     return fmtSci(s/Y,3)+' y';
  if(s>=86400) return fmt(s/86400,3)+' d';
  if(s>=3600)  return fmt(s/3600,3)+' h';
  if(s>=60)    return fmt(s/60,3)+' min';
  if(s>=1e-3)  return fmt(s,4)+' s';
  return fmtSci(s,3)+' s';
}

/* =====================================================================
   1. FIVE KINDS OF DECAY, AND WHICH ONE A NUCLEUS PICKS
   ===================================================================== */
function setupDecayModes(){
  const canvas=document.getElementById('dm_canvas');
  const zEl=document.getElementById('dm_z'), zVal=document.getElementById('dm_z_val');
  const aEl=document.getElementById('dm_a'), aVal=document.getElementById('dm_a_val');
  const readout=document.getElementById('dm_readout');

  function draw(){
    const {ctx,w,h}=fitCanvas(canvas);
    const Z=parseInt(zEl.value,10), A=parseInt(aEl.value,10);
    zVal.textContent=Z; aVal.textContent=A;
    const N=A-Z;

    // zoom on the neighbourhood of the chosen nuclide
    const span=14;
    const z0=Math.max(0,Z-span), z1=Z+span, n0=Math.max(0,N-span), n1=N+span;
    const m={l:56,r:18,t:22,b:42};
    const {X,Y}=drawAxes(ctx,w,h,m,z0,z1,n0,n1,'proton number Z','neutron number N',
      {nx:7,ny:7,xfmt:v=>v.toFixed(0),yfmt:v=>v.toFixed(0)});
    plotLine(ctx,X,Y,[{x:z0,y:z0},{x:z1,y:z1}],'#d9d3c7',1.6,[5,4]);

    ctx.save();
    NUCLIDES.forEach(([zz,aa,mm,ab,st])=>{
      const nn=aa-zz;
      if(zz<z0||zz>z1||nn<n0||nn>n1) return;
      ctx.fillStyle = st ? '#1c1d20' : 'rgba(154,147,132,0.5)';
      ctx.beginPath(); ctx.arc(X(zz),Y(nn), st?4.5:3, 0, 7); ctx.fill();
    });
    ctx.restore();

    // the line of maximum stability, from the liquid drop
    const pred=[];
    for(let a=Math.max(4,A-40);a<=A+40;a++){ const z=zStable(a); pred.push({x:z,y:a-z}); }
    plotLine(ctx,X,Y,pred,'#a4342c',2.2);

    // the chosen nuclide and where each decay would take it
    const here=NUC[Z+'_'+A];
    dotAt(ctx,X,Y,Z,N,here&&here.st?'#1f6f78':'#c2701f',7);

    const MOVES=[
      {dz: 1,dn:-1,lab:'β⁻',  q:qBetaMinus(Z,A), col:'#1f6f78'},
      {dz:-1,dn: 1,lab:'β⁺',  q:qBetaPlus(Z,A),  col:'#8a6d1f'},
      {dz:-1,dn: 1,lab:'EC',  q:qCapture(Z,A),   col:'#8a6d1f', offset:true},
      {dz:-2,dn:-2,lab:'α',   q:qAlpha(Z,A),     col:'#a4342c'}
    ];
    ctx.save(); ctx.font='11px Helvetica,Arial,sans-serif';
    MOVES.forEach(mv=>{
      if(mv.q==null) return;
      const open=mv.q>0;
      const x1=X(Z+mv.dz), y1=Y(N+mv.dn);
      ctx.strokeStyle=open?mv.col:'#ddd8cc'; ctx.lineWidth=open?2.4:1.2;
      ctx.setLineDash(open?[]:[3,3]);
      ctx.beginPath(); ctx.moveTo(X(Z),Y(N)); ctx.lineTo(x1,y1); ctx.stroke();
      if(open){
        const ang=Math.atan2(y1-Y(N),x1-X(Z));
        ctx.beginPath(); ctx.moveTo(x1,y1);
        ctx.lineTo(x1-9*Math.cos(ang-0.4), y1-9*Math.sin(ang-0.4));
        ctx.moveTo(x1,y1);
        ctx.lineTo(x1-9*Math.cos(ang+0.4), y1-9*Math.sin(ang+0.4));
        ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.fillStyle=open?mv.col:'#b0aa9c'; ctx.textAlign='center';
      ctx.fillText(`${mv.lab} ${mv.q>0?'+':''}${fmt(mv.q,2)}`,
        (X(Z)+x1)/2 + (mv.offset?0:0), (Y(N)+y1)/2 - (mv.offset?12:-14));
    });
    ctx.restore();

    ctx.save(); ctx.font='11px Helvetica,Arial,sans-serif'; ctx.textAlign='left';
    ctx.fillStyle='#1c1d20'; ctx.fillText('stable', m.l+10, m.t+14);
    ctx.fillStyle='#9a9384'; ctx.fillText('radioactive', m.l+10, m.t+29);
    ctx.fillStyle='#a4342c'; ctx.fillText('the valley floor', m.l+10, m.t+44);
    ctx.fillStyle='#8a8d92'; ctx.textAlign='right'; ctx.fillText('N = Z', X(z1)-6, Y(z1)+14);
    ctx.restore();

    // what the decay energetics say
    const open=MOVES.filter(mv=>mv.q!=null&&mv.q>0);
    const zs=zStable(A);
    const rec=NUC[Z+'_'+A];
    let verdict;
    if(!rec) verdict = 'not in Beiser’s table';
    else if(rec.st) verdict = 'stable — every route above is closed';
    else if(!open.length) verdict = 'radioactive, but no route is open on these masses alone';
    else verdict = open.map(o=>o.lab).join(' or ');

    readout.innerHTML = `
      <div>nuclide <b>${nucName(Z,A)}</b> — Z = ${Z}, N = ${N}
        ${rec?`<span class="badge ${rec.st?'ok':'no'}">${rec.st?'stable':'radioactive'}</span>`:'<span class="badge no">not tabulated</span>'}
        ${rec&&rec.t>0?`<span class="badge">T½ = ${humanTime(rec.t)}</span>`:''}</div>
      <div>the valley floor at A = ${A} is Z = <b>${fmt(zs,2)}</b>, so this nuclide is
        <b>${Z<zs-0.5?'neutron-rich':(Z>zs+0.5?'proton-rich':'right on it')}</b></div>
      ${MOVES.map(mv=>mv.q==null?'':`<div>Q(${mv.lab}) <b>${fmt(mv.q,3)} MeV</b>
        <span class="badge ${mv.q>0?'ok':'no'}">${mv.q>0?'energetically allowed':'forbidden'}</span></div>`).join('')}
      <div>energetics say: <b>${verdict}</b></div>
      <div>β⁺ costs 2m<sub>e</sub>c² = <b>1.022 MeV</b> more than electron capture, which is why capture
        wins whenever the mass difference is small</div>`;
  }
  zEl.addEventListener('input',draw);
  aEl.addEventListener('input',draw);
  registerCanvas('dm_canvas',draw);
}

/* =====================================================================
   2. THE DECAY LAW, HALF-LIFE AND ACTIVITY
   ===================================================================== */
function setupDecayLaw(){
  const canvas=document.getElementById('dl_canvas');
  const nucEl=document.getElementById('dl_nuc');
  const mEl=document.getElementById('dl_mass'), mVal=document.getElementById('dl_mass_val');
  const tEl=document.getElementById('dl_t'), tVal=document.getElementById('dl_t_val');
  const logEl=document.getElementById('dl_log');
  const readout=document.getElementById('dl_readout');
  const boxCanvas=document.getElementById('dl_box');
  const boxCap=document.getElementById('dl_box_cap');
  const playBtn=document.getElementById('dl_play');

  /* ---- a real sample, decaying ----
     The exponential law is a statement about a crowd, not about any one
     nucleus: each of these waits its own random time and then goes, with no
     memory and no schedule. Give each one a lifetime drawn from the right
     distribution — P(t > T) = 2^-T in half-lives — and the smooth curve appears
     by itself, ragged at the edges, which is exactly how a real count behaves. */
  const NSIM=400;
  let lifetimes=new Float64Array(NSIM);
  let simT=0, playing=false, dlLast=performance.now();
  const trace=[];                 // the measured survival fraction, as it happens

  function reseed(){
    for(let i=0;i<NSIM;i++) lifetimes[i] = -Math.log2(Math.max(1e-12, Math.random()));
    simT=0; trace.length=0;
  }
  reseed();
  function survivors(t){
    let n=0;
    for(let i=0;i<NSIM;i++) if(lifetimes[i]>t) n++;
    return n;
  }

  function drawBox(){
    if(!boxCanvas) return;
    const {ctx,w,h}=fitCanvas(boxCanvas);
    ctx.clearRect(0,0,w,h);
    const cols=20, rows=Math.ceil(NSIM/cols);
    const S=Math.min((w-14)/cols, (h-14)/rows);
    const x0=(w-S*cols)/2, y0=(h-S*rows)/2;
    let alive=0;
    for(let i=0;i<NSIM;i++){
      const cx=x0+(i%cols)*S+S/2, cy=y0+Math.floor(i/cols)*S+S/2;
      const gone = lifetimes[i]<=simT;
      if(!gone) alive++;
      // a nucleus that has just gone flashes before settling to a pale husk
      const justWent = gone && (simT-lifetimes[i]) < 0.10;
      ctx.beginPath(); ctx.arc(cx,cy,S*0.30,0,7);
      ctx.fillStyle = gone ? (justWent ? '#a4342c' : '#e6e1d6') : '#1f6f78';
      ctx.fill();
      if(justWent){
        ctx.beginPath(); ctx.arc(cx,cy,S*0.30 + 6*(simT-lifetimes[i])/0.10, 0, 7);
        ctx.strokeStyle=`rgba(164,52,44,${1-(simT-lifetimes[i])/0.10})`;
        ctx.lineWidth=1.5; ctx.stroke();
      }
    }
    if(boxCap){
      boxCap.textContent = simT<=0
        ? `${NSIM} nuclei, each waiting its own random turn`
        : `${alive} left of ${NSIM} after ${fmt(simT,2)} half-lives — predicted ${fmt(NSIM*Math.pow(0.5,simT),0)}`;
    }
  }

  // populate from every tabulated nuclide that has a half-life
  const LIST=NUCLIDES.filter(r=>r[5]>0).sort((a,b)=>a[5]-b[5]);
  LIST.forEach(([Z,A,mm,ab,st,t])=>{
    const o=document.createElement('option');
    o.value=Z+'_'+A; o.textContent=`${EL[Z]}-${A}  (${humanTime(t)})`;
    if(Z===86&&A===222) o.selected=true;
    nucEl.appendChild(o);
  });

  function draw(){
    const {ctx,w,h}=fitCanvas(canvas);
    const key=nucEl.value, rec=NUC[key];
    const mg=parseFloat(mEl.value), nHalf=parseFloat(tEl.value);
    mVal.textContent=fmt(mg,2); tVal.textContent=fmt(nHalf,2);
    const T=rec.t, lam=Math.LN2/T;
    const logScale=logEl.checked;

    const m={l:62,r:18,t:22,b:42};
    const tmax=6;
    const {X,Y}=logScale
      ? drawAxes(ctx,w,h,m,0,tmax,-3,0,'time (half-lives)','log₁₀ of the fraction left',
          {nx:6,ny:3,xfmt:v=>v.toFixed(0),yfmt:v=>v.toFixed(0)})
      : drawAxes(ctx,w,h,m,0,tmax,0,1.05,'time (half-lives)','fraction of nuclei left',
          {nx:6,ny:5,xfmt:v=>v.toFixed(0),yfmt:v=>v.toFixed(2)});

    const pts=[];
    for(let x=0;x<=tmax;x+=tmax/500){
      const f=Math.pow(0.5,x);
      pts.push({x, y: logScale?Math.log10(f):f});
    }
    if(!logScale){
      ctx.save(); ctx.fillStyle='rgba(164,52,44,0.12)'; ctx.beginPath(); ctx.moveTo(X(0),Y(0));
      pts.forEach(p=>ctx.lineTo(X(p.x),Y(p.y))); ctx.lineTo(X(tmax),Y(0)); ctx.closePath(); ctx.fill(); ctx.restore();
    }
    plotLine(ctx,X,Y,pts,'#a4342c',2.8);

    // halving staircase
    ctx.save(); ctx.font='10px Helvetica,Arial,sans-serif'; ctx.fillStyle='#8a8d92';
    for(let k=1;k<=Math.min(6,tmax);k++){
      const f=Math.pow(0.5,k), yv=logScale?Math.log10(f):f;
      plotLine(ctx,X,Y,[{x:0,y:yv},{x:k,y:yv}],'#ddd8cc',1,[3,3]);
      plotLine(ctx,X,Y,[{x:k,y:logScale?-3:0},{x:k,y:yv}],'#ddd8cc',1,[3,3]);
      if(!logScale && k<=4){ ctx.textAlign='left'; ctx.fillText(`1/${Math.pow(2,k)}`, X(0)+4, Y(yv)-4); }
    }
    ctx.restore();

    // what the 400 simulated nuclei actually did, as it happened
    if(trace.length>1){
      const tp=trace.filter(p=>p.f>0).map(p=>({x:p.t, y:logScale?Math.log10(p.f):p.f}));
      plotLine(ctx,X,Y,tp,'#1f6f78',2);
      ctx.save(); ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle='#1f6f78'; ctx.textAlign='right';
      ctx.fillText('the 400 nuclei on the left, counted as they go', w-m.r-8, m.t+30);
      ctx.restore();
    }

    const fNow=Math.pow(0.5,nHalf);
    dotAt(ctx,X,Y,nHalf, logScale?Math.log10(fNow):fNow, '#1c1d20', 6);
    // the mean life, which is NOT the half-life
    const tau=1/Math.LN2;
    plotLine(ctx,X,Y,[{x:tau,y:logScale?-3:0},{x:tau,y:logScale?Math.log10(Math.exp(-1)):Math.exp(-1)}],'#1f6f78',1.6,[4,3]);
    ctx.save(); ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle='#1f6f78'; ctx.textAlign='left';
    ctx.fillText('mean life = 1.44 T½', X(tau)+6, m.t+14);
    ctx.fillStyle='#5a5d63'; ctx.textAlign='right';
    ctx.fillText(logScale?'a straight line on a log axis — that is what "exponential" means'
                         :'every half-life removes half of whatever is left',
                 w-m.r-8, m.t+14);
    ctx.restore();

    const atoms=mg*1e-6/(rec.A*U_KG);
    const R0=lam*atoms, R=R0*fNow;
    const tNow=nHalf*T;
    readout.innerHTML = `
      <div>nuclide <b>${nucName(rec.Z,rec.A)}</b>, half-life <b>${humanTime(T)}</b></div>
      <div>decay constant λ = ln2/T½ <b>${fmtSci(lam,3)} s⁻¹</b></div>
      <div>mean life 1/λ <b>${humanTime(1/lam)}</b> — <b>1.44×</b> the half-life, not equal to it</div>
      <div>${fmt(mg,2)} mg contains <b>${fmtSci(atoms,3)} nuclei</b></div>
      <div>initial activity R₀ = λN <b>${fmtSci(R0,3)} Bq</b> = <b>${fmtSci(R0/CURIE,3)} Ci</b></div>
      <div>after ${fmt(nHalf,2)} half-lives (<b>${humanTime(tNow)}</b>):
        <b>${fmt(fNow*100,3)}%</b> left, activity <b>${fmtSci(R/CURIE,3)} Ci</b></div>
      <div>time for 60% to decay: <b>${humanTime(Math.log(1/0.4)/lam)}</b></div>
      <div>each nucleus has a flat <b>50%</b> chance per half-life, forever — a nucleus has no memory,
        so 2 half-lives is 75% and not 100%</div>`;
  }
  nucEl.addEventListener('change',draw);
  mEl.addEventListener('input',draw);
  tEl.addEventListener('input',draw);
  logEl.addEventListener('change',draw);
  function dlLoop(now){
    const dt=Math.min(0.05,(now-dlLast)/1000); dlLast=now;
    const active=document.getElementById('ch12') && document.getElementById('ch12').classList.contains('active');
    if(playing && active){
      simT += dt*0.42;                        // six half-lives in about fourteen seconds
      const f=survivors(simT)/NSIM;
      trace.push({t:simT, f});
      tEl.value=Math.min(parseFloat(tEl.max), simT);
      if(simT>=parseFloat(tEl.max)){
        playing=false;
        playBtn.textContent='↺ Run it again — a fresh sample';
        playBtn.classList.remove('playing');
      }
      drawBox(); draw();
    }
    requestAnimationFrame(dlLoop);
  }
  if(playBtn) playBtn.addEventListener('click', ()=>{
    if(prefersReducedMotion()){
      simT=parseFloat(tEl.max); tEl.value=simT;
      trace.length=0;
      for(let t=0;t<=simT;t+=0.05) trace.push({t, f:survivors(t)/NSIM});
      drawBox(); draw();
      return;
    }
    if(!playing){
      // a new run means a new random sample, which is the point: the curve is
      // the same but the wobbles are never the same twice
      if(simT>=parseFloat(tEl.max)-1e-9 || simT<=0) reseed();
      playing=true; dlLast=performance.now();
      playBtn.textContent='⏸ Pause'; playBtn.classList.add('playing');
    } else {
      playing=false;
      playBtn.textContent='▶ Watch 400 nuclei decay';
      playBtn.classList.remove('playing');
    }
  });
  tEl.addEventListener('input',()=>{ if(!playing){ simT=parseFloat(tEl.value); drawBox(); } });

  registerCanvas('dl_canvas',draw);
  registerCanvas('dl_box',drawBox);
  requestAnimationFrame(dlLoop);
}

/* =====================================================================
   3. RADIOMETRIC DATING
   ===================================================================== */
function setupDating(){
  const canvas=document.getElementById('dt_canvas');
  const methEl=document.getElementById('dt_method');
  const fEl=document.getElementById('dt_frac'), fVal=document.getElementById('dt_frac_val');
  const readout=document.getElementById('dt_readout');

  // half-lives all come from the table; the daughter is named for context
  const METHODS={
    C14:  {Z:6, A:14,  daughter:'¹⁴N', label:'radiocarbon, ¹⁴C → ¹⁴N', col:'#a4342c'},
    K40:  {Z:19,A:40,  daughter:'⁴⁰Ar',label:'potassium–argon, ⁴⁰K → ⁴⁰Ar', col:'#1f6f78'},
    U235: {Z:92,A:235, daughter:'²⁰⁷Pb',label:'uranium–lead, ²³⁵U → ²⁰⁷Pb', col:'#8a6d1f'},
    U238: {Z:92,A:238, daughter:'²⁰⁶Pb',label:'uranium–lead, ²³⁸U → ²⁰⁶Pb', col:'#5b3f8a'},
    Th232:{Z:90,A:232, daughter:'²⁰⁸Pb',label:'thorium–lead, ²³²Th → ²⁰⁸Pb', col:'#c2701f'},
    Rb87: {Z:37,A:87,  daughter:'⁸⁷Sr', label:'rubidium–strontium, ⁸⁷Rb → ⁸⁷Sr', col:'#4a8fa8'}
  };
  const LANDMARKS=[
    {t:250,       lab:'the US Declaration of Independence'},
    {t:5300,      lab:'Ötzi the Iceman'},
    {t:17000,     lab:'the Lascaux cave paintings'},
    {t:50000,     lab:'the practical limit of radiocarbon'},
    {t:3.8e9,     lab:'the oldest rocks on Earth'},
    {t:4.6e9,     lab:'the solar system'}
  ];

  function draw(){
    const {ctx,w,h}=fitCanvas(canvas);
    const meth=METHODS[methEl.value];
    const frac=parseFloat(fEl.value);
    fVal.textContent=fmt(frac,3);
    const T=halfLife(meth.Z,meth.A);

    const m={l:66,r:18,t:22,b:42};
    // age in years, log axis
    const {X,Y}=drawAxes(ctx,w,h,m,0,1,0,11,'fraction of the parent still left','log₁₀ of the age in years',
      {nx:5,ny:11,xfmt:v=>v.toFixed(2),yfmt:v=>v.toFixed(0)});

    ctx.save(); ctx.font='10px Helvetica,Arial,sans-serif'; ctx.fillStyle='#b0aa9c'; ctx.textAlign='left';
    LANDMARKS.forEach(L=>{
      plotLine(ctx,X,Y,[{x:0,y:Math.log10(L.t)},{x:1,y:Math.log10(L.t)}],'#eee9df',1.4);
    });
    // the oldest rocks and the solar system are a hair apart on a log axis
    const lys = layoutLabels(ctx,
      LANDMARKS.map(L=>({x:m.l+8, y:Y(Math.log10(L.t))-3, text:L.lab, align:'left'})),
      {lineHeight:11, minY:m.t+10, maxY:h-m.b-2});
    LANDMARKS.forEach((L,i)=> ctx.fillText(L.lab, m.l+8, lys[i]));
    ctx.restore();

    Object.keys(METHODS).forEach(k=>{
      const mm=METHODS[k], sel=(k===methEl.value);
      const TT=halfLife(mm.Z,mm.A); if(!TT) return;
      const lam=Math.LN2/TT;
      const pts=[];
      for(let f=0.02;f<=0.995;f+=0.002){
        const age=Math.log(1/f)/lam/SEC_YEAR;
        pts.push({x:f,y:Math.log10(age)});
      }
      plotLine(ctx,X,Y,pts,sel?mm.col:'#dcd6ca',sel?2.8:1.5);
      if(sel){
        const age=Math.log(1/frac)/lam/SEC_YEAR;
        dotAt(ctx,X,Y,frac,Math.log10(age),mm.col,6);
        plotLine(ctx,X,Y,[{x:frac,y:0},{x:frac,y:Math.log10(age)}],mm.col,1.2,[3,3]);
      }
      const p=pts.find(p=>p.x>=0.5);
      if(p){ ctx.save(); ctx.font='10px Helvetica,Arial,sans-serif';
        ctx.fillStyle=sel?mm.col:'#a8a293'; ctx.textAlign='center';
        ctx.fillText(EL[mm.Z]+'-'+mm.A, X(0.5), Y(p.y)-5); ctx.restore(); }
    });

    ctx.save(); ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle='#5a5d63'; ctx.textAlign='right';
    ctx.fillText('each curve is one clock; the useful part is the steep middle', w-m.r-8, m.t+14);
    ctx.restore();

    const lam=Math.LN2/T;
    const age=Math.log(1/frac)/lam/SEC_YEAR;
    // the radiocarbon worked example
    const lamC=Math.LN2/halfLife(6,14);
    const ex=Math.log(16/13)/lamC/SEC_YEAR;
    readout.innerHTML = `
      <div>method <b>${meth.label}</b></div>
      <div>half-life <b>${humanTime(T)}</b> (from Beiser's table)</div>
      <div>parent remaining <b>${fmt(frac*100,2)}%</b> → age <b>${age<1e6?fmt(age,0)+' years':fmtSci(age,3)+' years'}</b></div>
      <div>that is <b>${fmt(Math.log(1/frac)/Math.LN2,2)}</b> half-lives</div>
      <div>useful range, roughly 1% to 99% of a half-life gone:
        <b>${fmtSci(0.014*T/SEC_YEAR,2)}</b> to <b>${fmtSci(6.6*T/SEC_YEAR,2)}</b> years</div>
      <div>Example 12.5 — wood at 13 counts/min·g against 16 for living wood:
        <b>${fmt(ex,0)} years</b></div>
      <div>every method needs the same two assumptions: the clock started with no daughter present,
        and nothing has entered or left since</div>`;
  }
  methEl.addEventListener('change',draw);
  fEl.addEventListener('input',draw);
  registerCanvas('dt_canvas',draw);
}

/* =====================================================================
   4. ALPHA DECAY AND THE GAMOW TUNNEL THEORY
   ===================================================================== */
function setupAlphaDecay(){
  const barCanvas=document.getElementById('ad_canvas');
  const gnCanvas=document.getElementById('ad_gn');
  const nucEl=document.getElementById('ad_nuc');
  const r0El=document.getElementById('ad_r0'), r0Val=document.getElementById('ad_r0_val');
  const readout=document.getElementById('ad_readout');

  const M_ALPHA_KG=4.0026*U_KG;

  // every tabulated nuclide whose alpha daughter is also tabulated
  const EMITTERS=[];
  NUCLIDES.forEach(([Z,A,mm,ab,st,t])=>{
    const q=qAlpha(Z,A);
    if(q==null||q<=0||Z<70) return;
    EMITTERS.push({Z,A,q,t});
  });
  EMITTERS.sort((a,b)=>a.q-b.q);
  EMITTERS.forEach(e=>{
    const o=document.createElement('option');
    o.value=e.Z+'_'+e.A;
    o.textContent=`${EL[e.Z]}-${e.A}   Q = ${fmt(e.q,2)} MeV`;
    if(e.Z===84&&e.A===210) o.selected=true;
    nucEl.appendChild(o);
  });

  // The WKB barrier integral for a pure Coulomb barrier has a closed form:
  //   gamma = (2/hbar) sqrt(2 m E) R [ arccos(sqrt(x)) - sqrt(x(1-x)) ],  x = R0/R
  // with R = 2Ze^2/(4 pi eps0 E) the outer turning point. T = e^-gamma.
  function gamow(Zd,A,Qmev,r0fm){
    const E=Qmev*1e6*EV_J;
    const R0=r0fm*(Math.cbrt(A-4)+Math.cbrt(4))*1e-15;
    const R=2*Zd*KE2_JM/E;
    if(R<=R0) return null;
    const x=R0/R;
    const gam=(2/HBAR)*Math.sqrt(2*M_ALPHA_KG*E)*R*(Math.acos(Math.sqrt(x))-Math.sqrt(x*(1-x)));
    const v=Math.sqrt(2*E/M_ALPHA_KG);
    const nu=v/(2*R0);
    const lam=nu*Math.exp(-gam);
    return {R0,R,x,gam,v,nu,lam,T:Math.exp(-gam),t12:Math.LN2/lam,
            barrier:2*Zd*KE2_JM/R0/EV_J/1e6};
  }

  function drawBarrier(){
    const {ctx,w,h}=fitCanvas(barCanvas);
    const [Z,A]=nucEl.value.split('_').map(Number);
    const Zd=Z-2, Q=qAlpha(Z,A), r0=parseFloat(r0El.value);
    const g=gamow(Zd,A,Q,r0);
    if(!g) return;
    const R0fm=g.R0*1e15, Rfm=g.R*1e15;

    const m={l:62,r:18,t:22,b:42};
    const xmax=Math.max(60, Rfm*1.6);
    const ymax=g.barrier*1.25, ymin=-45;
    const {X,Y}=drawAxes(ctx,w,h,m,0,xmax,ymin,ymax,'distance from the nuclear centre (fm)',
      'potential energy of the alpha particle (MeV)',
      {nx:6,ny:5,xfmt:v=>v.toFixed(0),yfmt:v=>v.toFixed(0)});

    // inside: a flat well; outside: the Coulomb tail
    const pts=[{x:0,y:ymin},{x:R0fm,y:ymin},{x:R0fm,y:g.barrier}];
    for(let r=R0fm;r<=xmax;r+=xmax/400) pts.push({x:r,y:2*Zd*KE2_JM/(r*1e-15)/EV_J/1e6});
    plotLine(ctx,X,Y,pts,'#1c1d20',2.4);

    // the tunnelling region, shaded
    ctx.save(); ctx.fillStyle='rgba(164,52,44,0.13)';
    ctx.beginPath(); ctx.moveTo(X(R0fm),Y(Q));
    for(let r=R0fm;r<=Rfm;r+=Math.max(0.02,(Rfm-R0fm)/300))
      ctx.lineTo(X(r),Y(2*Zd*KE2_JM/(r*1e-15)/EV_J/1e6));
    ctx.lineTo(X(Rfm),Y(Q)); ctx.closePath(); ctx.fill(); ctx.restore();

    plotLine(ctx,X,Y,[{x:0,y:Q},{x:xmax,y:Q}],'#a4342c',2,[6,4]);
    dotAt(ctx,X,Y,Rfm,Q,'#a4342c',5);

    ctx.save(); ctx.font='11px Helvetica,Arial,sans-serif'; ctx.textAlign='left';
    ctx.fillStyle='#a4342c'; ctx.fillText(`alpha energy Q = ${fmt(Q,2)} MeV`, X(xmax*0.42), Y(Q)-8);
    ctx.fillStyle='#5a5d63';
    ctx.fillText(`barrier top ${fmt(g.barrier,1)} MeV`, X(R0fm)+8, Y(g.barrier)-6);
    ctx.fillText(`it has to tunnel ${fmt(Rfm-R0fm,1)} fm`, X(R0fm)+8, Y(Q)+16);
    ctx.textAlign='center'; ctx.fillStyle='#8a8d92';
    ctx.fillText('R₀', X(R0fm), h-m.b+28);
    ctx.fillText('R', X(Rfm), h-m.b+28);
    ctx.restore();
  }

  function drawGN(){
    const {ctx,w,h}=fitCanvas(gnCanvas);
    const r0=parseFloat(r0El.value);
    const [Zs,As]=nucEl.value.split('_').map(Number);
    const m={l:66,r:18,t:22,b:42};
    const usable=EMITTERS.filter(e=>e.t>0&&e.q>=4.0&&e.Z<=98);
    // fit the axes to whatever the table actually contains
    const xs=usable.map(e=>(e.Z-2)/Math.sqrt(e.q));
    const ys=usable.map(e=>Math.log10(e.t));
    const x0=Math.floor(Math.min(...xs))-1, x1=Math.ceil(Math.max(...xs))+1;
    const y0=Math.floor(Math.min(...ys))-3, y1=Math.ceil(Math.max(...ys))+3;
    const {X,Y}=drawAxes(ctx,w,h,m,x0,x1,y0,y1,'Z / √Q   (Z of the daughter, Q in MeV)',
      'log₁₀ of the half-life in seconds',{nx:6,ny:6,xfmt:v=>v.toFixed(0),yfmt:v=>v.toFixed(0)});

    // the model's prediction for every usable emitter, joined by Z/sqrt(Q)
    const model=usable.map(e=>{
      const g=gamow(e.Z-2,e.A,e.q,r0);
      return g?{x:(e.Z-2)/Math.sqrt(e.q), y:Math.log10(g.t12), e}:null;
    }).filter(Boolean).sort((a,b)=>a.x-b.x);
    plotLine(ctx,X,Y,model.map(p=>({x:p.x,y:Math.max(y0,Math.min(y1,p.y))})),'#1f6f78',2.2);
    model.forEach(p=>{ if(p.y>y0&&p.y<y1) dotAt(ctx,X,Y,p.x,p.y,'#1f6f78',3.2); });

    // the measured points
    usable.forEach(e=>{
      const x=(e.Z-2)/Math.sqrt(e.q), y=Math.log10(e.t);
      if(y<y0||y>y1) return;
      const sel=(e.Z===Zs&&e.A===As);
      dotAt(ctx,X,Y,x,y,sel?'#1c1d20':'#a4342c',sel?7:4.2);
      if(sel){ ctx.save(); ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle='#1c1d20';
        ctx.textAlign='left'; ctx.fillText(`${EL[e.Z]}-${e.A}`, X(x)+9, Y(y)+4); ctx.restore(); }
    });

    // how well does this R0 do?
    let s=0,n=0;
    usable.forEach(e=>{
      const g=gamow(e.Z-2,e.A,e.q,r0); if(!g) return;
      s+=Math.abs(Math.log10(g.t12/e.t)); n++;
    });
    ctx.save(); ctx.font='11px Helvetica,Arial,sans-serif'; ctx.textAlign='left';
    ctx.fillStyle='#a4342c'; ctx.fillText('measured half-lives', m.l+10, m.t+14);
    ctx.fillStyle='#1f6f78'; ctx.fillText('the tunnelling model at this R₀', m.l+10, m.t+29);
    ctx.textAlign='right'; ctx.fillStyle='#5a5d63';
    ctx.fillText(`mean miss: ${fmt(s/n,2)} decades over ${n} emitters`, w-m.r-8, m.t+14);
    ctx.restore();
    return {mean:s/n, n};
  }

  function draw(){
    const r0=parseFloat(r0El.value); r0Val.textContent=fmt(r0,2);
    drawBarrier();
    const fit=drawGN();
    const [Z,A]=nucEl.value.split('_').map(Number);
    const Q=qAlpha(Z,A), g=gamow(Z-2,A,Q,r0);
    const rec=NUC[Z+'_'+A];
    const KEa=Q*(A-4)/A;
    const knocks=g?g.nu:0;
    readout.innerHTML = `
      <div>parent <b>${nucName(Z,A)}</b> → <b>${nucName(Z-2,A-4)}</b> + α</div>
      <div>Q from the measured masses <b>${fmt(Q,3)} MeV</b>;
        the alpha carries Q(A−4)/A = <b>${fmt(KEa,3)} MeV</b>, the nucleus recoils with the rest</div>
      <div>barrier top 2Ze²/4πε₀R₀ <b>${fmt(g.barrier,1)} MeV</b> — the alpha is
        <b>${fmt(g.barrier-Q,1)} MeV</b> short of climbing it</div>
      <div>outer turning point R = 2Ze²/4πε₀Q <b>${fmt(g.R*1e15,1)} fm</b>, so the barrier is
        <b>${fmt((g.R-g.R0)*1e15,1)} fm</b> thick</div>
      <div>Gamow exponent γ <b>${fmt(g.gam,1)}</b> → transmission e<sup>−γ</sup> = <b>${fmtSci(g.T,2)}</b></div>
      <div>it hits the wall <b>${fmtSci(knocks,2)} times a second</b> and gets through once in
        <b>${fmtSci(1/g.T,2)}</b> tries</div>
      <div>predicted half-life <b>${humanTime(g.t12)}</b></div>
      <div>measured <b>${rec&&rec.t>0?humanTime(rec.t):'—'}</b>
        ${rec&&rec.t>0?`<span class="badge ${Math.abs(Math.log10(g.t12/rec.t))<1?'ok':'no'}">${fmt(Math.log10(g.t12/rec.t),2)} decades off</span>`:''}</div>
      <div>across all ${fit.n} emitters the mean miss is <b>${fmt(fit.mean,2)} decades</b>
        — against a half-life range of 17 decades</div>`;
  }
  nucEl.addEventListener('change',draw);
  r0El.addEventListener('input',draw);
  registerCanvas('ad_canvas',draw);
  registerCanvas('ad_gn',draw);
}

/* =====================================================================
   5. BETA DECAY AND THE NEUTRINO
   ===================================================================== */
function setupBetaDecay(){
  const specCanvas=document.getElementById('bd_canvas');
  const kurieCanvas=document.getElementById('bd_kurie');
  const qEl=document.getElementById('bd_q'), qVal=document.getElementById('bd_q_val');
  const zEl=document.getElementById('bd_z'), zVal=document.getElementById('bd_z_val');
  const mEl=document.getElementById('bd_mnu'), mVal=document.getElementById('bd_mnu_val');
  const modeEl=document.getElementById('bd_mode');
  const readout=document.getElementById('bd_readout');

  const MEC2=0.51100;   // MeV

  // Fermi's golden-rule shape: the number of ways to share the energy between
  // electron and neutrino. N(KE) ~ p E (Q - KE) sqrt((Q-KE)^2 - m_nu^2 c^4) F(Z,E)
  function fermiFunction(Zd,beta,mode){
    if(beta<=1e-6) return 0;
    const eta=(mode==='minus'?1:-1)*Zd*ALPHA_FS/beta;
    const x=2*Math.PI*eta;
    if(Math.abs(x)<1e-9) return 1;
    return x/(1-Math.exp(-x));
  }
  function spectrum(KE,Q,Zd,mnu,mode){
    if(KE<=0) return 0;
    const Enu=Q-KE;
    if(Enu<=mnu) return 0;
    const E=KE+MEC2;
    const p=Math.sqrt(E*E-MEC2*MEC2);
    const beta=p/E;
    const pnu=Math.sqrt(Enu*Enu-mnu*mnu);
    return p*E*Enu*pnu*fermiFunction(Zd,beta,mode);
  }

  function draw(){
    const Q=parseFloat(qEl.value), Zd=parseInt(zEl.value,10);
    const mnu=parseFloat(mEl.value)/1000;   // slider is in keV
    const mode=modeEl.value;
    qVal.textContent=fmt(Q,2); zVal.textContent=Zd; mVal.textContent=fmt(parseFloat(mEl.value),0);

    // ---- the spectrum ----
    let {ctx,w,h}=fitCanvas(specCanvas);
    const m={l:60,r:18,t:22,b:42};
    const N=600, step=Q/N;
    const raw=[]; let peak=0, tot=0, eSum=0;
    for(let i=1;i<N;i++){
      const KE=i*step, v=spectrum(KE,Q,Zd,mnu,mode);
      raw.push({x:KE,y:v}); if(v>peak) peak=v;
      tot+=v*step; eSum+=v*KE*step;
    }
    const {X,Y}=drawAxes(ctx,w,h,m,0,Q*1.1,0,peak*1.2,'kinetic energy of the emitted electron (MeV)',
      'relative number',{nx:5,ny:4,xfmt:v=>v.toFixed(2),yfmt:()=>''});
    ctx.save(); ctx.fillStyle='rgba(164,52,44,0.14)'; ctx.beginPath(); ctx.moveTo(X(0),Y(0));
    raw.forEach(p=>ctx.lineTo(X(p.x),Y(p.y))); ctx.lineTo(X(Q),Y(0)); ctx.closePath(); ctx.fill(); ctx.restore();
    plotLine(ctx,X,Y,raw,'#a4342c',2.8);
    // what a two-body decay would give: a single line at Q
    plotLine(ctx,X,Y,[{x:Q,y:0},{x:Q,y:peak*1.12}],'#1c1d20',2.4);
    const mean=tot>0?eSum/tot:0;
    plotLine(ctx,X,Y,[{x:mean,y:0},{x:mean,y:peak*0.9}],'#1f6f78',1.6,[4,3]);
    ctx.save(); ctx.font='11px Helvetica,Arial,sans-serif'; ctx.textAlign='left';
    // Q sits at the right-hand end of the spectrum, so this caption has to be
    // pulled back inside the frame rather than written off the edge
    ctx.textAlign='right';
    ctx.fillStyle='#1c1d20'; ctx.fillText('where the line would be', Math.min(X(Q)+52, w-m.r-4), m.t+34);
    ctx.fillText('with no neutrino', Math.min(X(Q)+52, w-m.r-4), m.t+49);
    ctx.textAlign='left';
    ctx.fillStyle='#1f6f78'; ctx.fillText(`mean ${fmt(mean,3)} MeV`, X(mean)+6, Y(peak*0.9)-4);
    ctx.fillStyle='#5a5d63'; ctx.textAlign='right';
    ctx.fillText(mode==='minus'?'β⁻: the daughter attracts the electron, filling in the low end'
                               :'β⁺: the daughter repels the positron, emptying the low end',
                 w-m.r-8, m.t+14);
    ctx.restore();

    // ---- the Kurie plot ----
    const k=fitCanvas(kurieCanvas); ctx=k.ctx; w=k.w; h=k.h;
    const m2={l:66,r:18,t:22,b:42};
    const kpts=[], kpts0=[];
    for(let i=1;i<N;i++){
      const KE=i*step, E=KE+MEC2, p=Math.sqrt(E*E-MEC2*MEC2), beta=p/E;
      const F=fermiFunction(Zd,beta,mode);
      const v=spectrum(KE,Q,Zd,mnu,mode);
      const v0=spectrum(KE,Q,Zd,0,mode);
      if(p>0&&F>0){
        kpts.push({x:KE,y:v>0?Math.sqrt(v/(p*E*F)):0});
        kpts0.push({x:KE,y:v0>0?Math.sqrt(v0/(p*E*F)):0});
      }
    }
    const kmax=Math.max(...kpts0.map(p=>p.y));
    const {X:X2,Y:Y2}=drawAxes(ctx,w,h,m2,0,Q*1.06,0,kmax*1.12,
      'kinetic energy (MeV)','√[ N / (pEF) ]   — the Kurie plot',
      {nx:5,ny:4,xfmt:v=>v.toFixed(2),yfmt:()=>''});
    plotLine(ctx,X2,Y2,kpts0,'#c9c4b8',2.6,[5,4]);
    plotLine(ctx,X2,Y2,kpts,'#a4342c',2.8);
    plotLine(ctx,X2,Y2,[{x:Q,y:0},{x:Q,y:kmax*1.12}],'#ddd8cc',1.4);
    ctx.save(); ctx.font='11px Helvetica,Arial,sans-serif'; ctx.textAlign='left';
    ctx.fillStyle='#9a9384'; ctx.fillText('massless neutrino — a straight line to Q', m2.l+10, m2.t+14);
    ctx.fillStyle='#a4342c'; ctx.fillText(`neutrino mass ${fmt(mnu*1000,0)} keV`, m2.l+10, m2.t+29);
    ctx.textAlign='right'; ctx.fillStyle='#5a5d63';
    ctx.fillText('the endpoint is where the neutrino mass hides', w-m2.r-8, m2.t+14);
    ctx.restore();

    const fracNu=1-mean/Q;
    readout.innerHTML = `
      <div>decay energy Q <b>${fmt(Q,3)} MeV</b>, daughter charge Z = ${Zd}, mode
        <b>${mode==='minus'?'β⁻ (electron)':'β⁺ (positron)'}</b></div>
      <div>the electron comes out with anything from 0 to Q — a <b>continuous</b> spectrum,
        where a two-body decay would give one sharp line</div>
      <div>mean electron energy <b>${fmt(mean,3)} MeV</b> = ${fmt(mean/Q*100,1)}% of Q</div>
      <div>so the neutrino quietly carries off <b>${fmt(fracNu*100,1)}%</b> of the energy, on average</div>
      <div>three conservation laws broke at once before Pauli's 1930 "desperate remedy":
        energy (the missing fraction above), momentum (electron and recoil are not back-to-back),
        and angular momentum (three spin-½ particles cannot be two)</div>
      <div>neutrino mass set to <b>${fmt(mnu*1000,0)} keV</b> — watch the Kurie plot peel away from
        the straight line near the endpoint</div>
      <div>the real limit is under <b>1 eV</b>, which is why that measurement is so hard: it lives in
        the last few parts per million of the spectrum</div>`;
  }
  [qEl,zEl,mEl].forEach(e=>e.addEventListener('input',draw));
  modeEl.addEventListener('change',draw);
  registerCanvas('bd_canvas',draw);
  registerCanvas('bd_kurie',draw);
}

/* =====================================================================
   6. CROSS SECTION, ATTENUATION AND REACTION RATE
   ===================================================================== */
function setupCrossSection(){
  const canvas=document.getElementById('cs_canvas');
  const matEl=document.getElementById('cs_mat');
  const xEl=document.getElementById('cs_x'), xVal=document.getElementById('cs_x_val');
  const fluxEl=document.getElementById('cs_flux'), fluxVal=document.getElementById('cs_flux_val');
  const readout=document.getElementById('cs_readout');

  // thermal-neutron cross sections (barns), densities (kg/m^3), mean atomic mass (u),
  // and the abundance of the isotope that does the absorbing
  const ABSORBERS={
    Cd:  {name:'cadmium (the ¹¹³Cd in it)', sigma:2.0e4, rho:8.64e3,  M:112,  frac:0.12,  note:'reactor control rods'},
    Gd:  {name:'gadolinium (¹⁵⁷Gd)',        sigma:2.54e5,rho:7.90e3,  M:157,  frac:0.157, note:'the strongest absorber known'},
    B:   {name:'boron (¹⁰B)',               sigma:3.84e3,rho:2.34e3,  M:10.8, frac:0.199, note:'control rods, shielding, BF₃ counters'},
    Li:  {name:'lithium (⁶Li)',             sigma:940,   rho:0.534e3, M:6.94, frac:0.075, note:'breeds tritium for fusion'},
    U235:{name:'uranium-235 (fission)',     sigma:582,   rho:19.1e3,  M:235,  frac:1.0,   note:'the reaction a reactor runs on'},
    Au:  {name:'gold (¹⁹⁷Au)',              sigma:99,    rho:19.3e3,  M:197,  frac:1.0,   note:'neutron-flux foils'},
    Fe:  {name:'iron',                      sigma:2.6,   rho:7.87e3,  M:55.8, frac:1.0,   note:'structural, nearly transparent'},
    C:   {name:'carbon (graphite)',         sigma:0.0035,rho:2.25e3,  M:12,   frac:1.0,   note:'a moderator: slows without absorbing'}
  };

  function nDensity(a){ return a.frac*a.rho/(a.M*U_KG); }

  function draw(){
    const {ctx,w,h}=fitCanvas(canvas);
    const a=ABSORBERS[matEl.value];
    const xmm=parseFloat(xEl.value), logFlux=parseFloat(fluxEl.value);
    xVal.textContent=fmt(xmm,2); fluxVal.textContent='10^'+fmt(logFlux,1);
    const flux=Math.pow(10,logFlux);

    const n=nDensity(a), ns=n*a.sigma*BARN;
    const m={l:62,r:18,t:22,b:42};
    const xmax=Math.max(xmm*1.4, 1.0);
    const {X,Y}=drawAxes(ctx,w,h,m,0,xmax,-6,0,'thickness (mm)','log₁₀ of the fraction that gets through',
      {nx:5,ny:6,xfmt:v=>v.toFixed(2),yfmt:v=>v.toFixed(0)});

    Object.keys(ABSORBERS).forEach(k=>{
      const b=ABSORBERS[k], sel=(k===matEl.value);
      const nb=nDensity(b)*b.sigma*BARN;
      const pts=[];
      for(let x=0;x<=xmax;x+=xmax/400) pts.push({x,y:Math.max(-6,-nb*x*1e-3/Math.LN10)});
      plotLine(ctx,X,Y,pts,sel?'#a4342c':'#dcd6ca',sel?2.8:1.4);
      if(!sel){
        const p=pts.find(p=>p.y<=-1.2);
        if(p){ ctx.save(); ctx.font='10px Helvetica,Arial,sans-serif'; ctx.fillStyle='#a8a293';
          ctx.textAlign='left'; ctx.fillText(k.replace('235','-235'), X(p.x)+4, Y(p.y)); ctx.restore(); }
      }
    });

    const thru=Math.exp(-ns*xmm*1e-3);
    dotAt(ctx,X,Y,xmm,Math.max(-6,Math.log10(thru)),'#1c1d20',6);
    plotLine(ctx,X,Y,[{x:xmax*0,y:-2},{x:xmax,y:-2}],'#e7e4dc',1.2);
    ctx.save(); ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle='#5a5d63'; ctx.textAlign='right';
    ctx.fillText('99% stopped', w-m.r-8, Y(-2)-4);
    ctx.textAlign='left'; ctx.fillStyle='#a4342c';
    ctx.fillText(a.name, m.l+10, m.t+14);
    ctx.fillStyle='#5a5d63'; ctx.fillText(a.note, m.l+10, m.t+29);
    ctx.restore();

    const mfp=1/ns;
    const geo=Math.PI*Math.pow(1.2e-15*Math.cbrt(a.M),2)/BARN;
    // a 10 mg foil of the selected material in this flux
    const nAtoms=1e-5/(a.M*U_KG)*a.frac;
    const rate=flux*a.sigma*BARN*nAtoms;
    readout.innerHTML = `
      <div>absorber <b>${a.name}</b>, σ = <b>${fmtSci(a.sigma,3)} b</b> for thermal neutrons</div>
      <div>its geometric cross-section πR² is only <b>${fmt(geo,2)} b</b>
        <span class="badge">σ is ${fmtSci(a.sigma/geo,2)}× bigger</span></div>
      <div>absorbing nuclei per m³ <b>${fmtSci(n,3)}</b> → nσ = <b>${fmtSci(ns,3)} m⁻¹</b></div>
      <div>mean free path 1/nσ <b>${mfp*1000<1?fmt(mfp*1e6,1)+' µm':(mfp<1?fmt(mfp*1000,3)+' mm':fmt(mfp,3)+' m')}</b></div>
      <div>through <b>${fmt(xmm,2)} mm</b>: <b>${fmt((1-thru)*100,3)}%</b> absorbed,
        ${thru>1e-4?fmt(thru*100,4)+'%':fmtSci(thru*100,2)+'%'} gets through</div>
      <div>thickness to stop 99%: <b>${fmt(Math.log(100)/ns*1000,4)} mm</b></div>
      <div>a 10 mg foil in a flux of ${fmtSci(flux,2)} neutrons/m²·s reacts
        <b>${fmtSci(rate,3)} times per second</b></div>
      <div>a slow neutron's de Broglie wavelength is far larger than a nucleus, which is exactly why
        σ can be tens of thousands of times the geometric area</div>`;
  }
  matEl.addEventListener('change',draw);
  xEl.addEventListener('input',draw);
  fluxEl.addEventListener('input',draw);
  registerCanvas('cs_canvas',draw);
}

/* =====================================================================
   7. FISSION
   ===================================================================== */
function setupFission(){
  const barCanvas=document.getElementById('fs_canvas');
  const cmpCanvas=document.getElementById('fs_cmp');
  const shapeCanvas=document.getElementById('fs_shape');
  const shapeCap=document.getElementById('fs_shape_cap');
  const playBtn=document.getElementById('fs_play');
  const zEl=document.getElementById('fs_z'), zVal=document.getElementById('fs_z_val');
  const aEl=document.getElementById('fs_a'), aVal=document.getElementById('fs_a_val');
  const readout=document.getElementById('fs_readout');
  // a schematic sphere -> dumbbell -> two-fragment animation, played on demand.
  // Whether it springs back or runs away is decided by the same Z^2/A vs the
  // critical fissility computed below — this is illustration, not a new model.
  let stage='idle', stageT=0, playing=false, unstable=false, lastFrame=performance.now();

  // A liquid drop stretched into a prolate spheroid of eccentricity parameter eps
  // gains surface area and loses Coulomb energy, to leading order:
  //   E_surface -> E_s (1 + (2/5) eps^2),  E_coulomb -> E_c (1 - (1/5) eps^2)
  function deform(Z,A,eps){
    const Es=SEMF.a2*Math.pow(A,2/3);
    const Ec=SEMF.a3*Z*(Z-1)/Math.pow(A,1/3);
    return (2/5)*Es*eps*eps - (1/5)*Ec*eps*eps;   // loss of binding energy
  }
  const CRIT=2*SEMF.a2/SEMF.a3;   // Z^2/A above which the drop is unstable to any stretch

  function drawBarrier(){
    const {ctx,w,h}=fitCanvas(barCanvas);
    const Z=parseInt(zEl.value,10), A=parseInt(aEl.value,10);
    const m={l:64,r:18,t:22,b:42};
    const emax=Math.max(12, deform(Z,A,0.6)*1.3);
    const {X,Y}=drawAxes(ctx,w,h,m,0,0.6,Math.min(-6,-emax*0.4),emax,'deformation ε',
      'energy cost of deforming (MeV)',{nx:6,ny:5,xfmt:v=>v.toFixed(1),yfmt:v=>v.toFixed(0)});
    plotLine(ctx,X,Y,[{x:0,y:0},{x:0.6,y:0}],'#c9c4b8',1.2);

    [['surface  +(2/5)E_sε²','#5b3f8a',e=>(2/5)*SEMF.a2*Math.pow(A,2/3)*e*e],
     ['Coulomb  −(1/5)E_cε²','#1f6f78',e=>-(1/5)*SEMF.a3*Z*(Z-1)/Math.pow(A,1/3)*e*e]
    ].forEach(([lab,col,f])=>{
      const pts=[]; for(let e=0;e<=0.6;e+=0.005) pts.push({x:e,y:f(e)});
      plotLine(ctx,X,Y,pts,col,1.8,[5,4]);
    });
    const tot=[]; for(let e=0;e<=0.6;e+=0.005) tot.push({x:e,y:deform(Z,A,e)});
    plotLine(ctx,X,Y,tot,'#a4342c',2.8);

    const x=Z*Z/A/CRIT;
    ctx.save(); ctx.font='11px Helvetica,Arial,sans-serif'; ctx.textAlign='left';
    ctx.fillStyle='#5b3f8a'; ctx.fillText('surface tension resists stretching', m.l+10, m.t+14);
    ctx.fillStyle='#1f6f78'; ctx.fillText('electric repulsion encourages it', m.l+10, m.t+29);
    ctx.fillStyle='#a4342c'; ctx.fillText('their sum', m.l+10, m.t+44);
    ctx.textAlign='right'; ctx.fillStyle= x<1?'#5a5d63':'#a4342c';
    ctx.fillText(x<1 ? `Z²/A = ${fmt(Z*Z/A,1)} < ${fmt(CRIT,1)}: the drop springs back`
                     : `Z²/A = ${fmt(Z*Z/A,1)} > ${fmt(CRIT,1)}: any stretch runs away`,
                 w-m.r-8, m.t+14);
    ctx.restore();
  }

  function drawShape(){
    if(!shapeCanvas) return;
    const {ctx,w,h}=fitCanvas(shapeCanvas);
    ctx.clearRect(0,0,w,h);
    const cx=w/2, cy=h/2, R0=Math.min(w,h)*0.16;
    ctx.fillStyle='#a4342c'; ctx.strokeStyle='#5a2620'; ctx.lineWidth=1.4;
    function lobe(x,y,a,b){ ctx.beginPath(); ctx.ellipse(x,y,a,b,0,0,Math.PI*2); ctx.fill(); ctx.stroke(); }

    if(stage==='idle'){
      lobe(cx,cy,R0,R0);
    } else if(stage==='stretch'){
      const u=stageT, aMax=unstable?R0*2.0:R0*1.35;
      const a=R0+(aMax-R0)*u, b=(R0*R0)/a;
      lobe(cx,cy,a,b);
    } else if(stage==='pinch'){
      const u=stageT, a=unstable?R0*2.0:R0*1.35, b=(R0*R0)/a;
      const sep=b*0.4+u*(a*1.1), lobeR=b*(1-0.1*u);
      const neckW=(1-u)*b*0.85;
      if(neckW>0.6) ctx.fillRect(cx-sep*0.5, cy-neckW/2, sep, neckW);
      lobe(cx-sep*0.5,cy,lobeR*1.1,lobeR); lobe(cx+sep*0.5,cy,lobeR*1.1,lobeR);
    } else if(stage==='split'){
      const u=stageT, a=R0*2.0, b=(R0*R0)/a;
      const sep=a*1.15+u*R0*1.5;
      lobe(cx-sep*0.5,cy,b*1.05,b*1.05); lobe(cx+sep*0.5,cy,b*1.05,b*1.05);
      if(u<0.15){
        ctx.save(); ctx.globalAlpha=1-u/0.15; ctx.fillStyle='#f4d35e';
        ctx.beginPath(); ctx.arc(cx,cy,R0*0.55,0,Math.PI*2); ctx.fill(); ctx.restore();
      }
    } else if(stage==='springback'){
      const u=stageT, aMax=R0*1.35;
      const osc=Math.exp(-3*u)*Math.cos(2*Math.PI*1.6*u);
      const a=R0+(aMax-R0)*osc, b=(R0*R0)/Math.max(a,0.4*R0);
      lobe(cx,cy,a,b);
    }
    if(shapeCap){
      shapeCap.textContent =
        stage==='idle' ? 'the drop, at rest — press Play' :
        stage==='stretch' ? 'stretching under a nudge…' :
        stage==='pinch' ? 'a neck pinches inward…' :
        stage==='split' ? 'scission — two fragments fly apart' :
        stage==='springback' ? 'surface tension wins — it springs back' : '';
    }
  }

  function loop(now){
    const dt=Math.min(0.05,(now-lastFrame)/1000); lastFrame=now;
    const active=document.getElementById('ch12') && document.getElementById('ch12').classList.contains('active');
    if(playing && active){
      const DUR = stage==='stretch' ? (unstable?1.6:1.2) : stage==='pinch' ? 1.2 : stage==='split' ? 1.4 : 1.4;
      stageT += dt/DUR;
      if(stageT>=1){
        if(stage==='stretch'){ stage = unstable?'pinch':'springback'; stageT=0; }
        else if(stage==='pinch'){ stage='split'; stageT=0; }
        else { stageT=1; playing=false; playBtn.textContent='↺ Replay'; playBtn.classList.remove('playing'); }
      }
      drawShape();
    }
    requestAnimationFrame(loop);
  }
  if(playBtn) playBtn.addEventListener('click', ()=>{
    const Z=parseInt(zEl.value,10), A=parseInt(aEl.value,10);
    unstable = (Z*Z/A) > CRIT;
    if(prefersReducedMotion()){
      stage = unstable ? 'split' : 'idle'; stageT=1; drawShape();
      return;
    }
    if(!playing){
      stage='stretch'; stageT=0; playing=true; lastFrame=performance.now();
      playBtn.textContent='⏸ Pause'; playBtn.classList.add('playing');
    } else {
      playing=false; playBtn.textContent='▶ Nudge the drop and watch'; playBtn.classList.remove('playing');
    }
  });

  // why U-235 fissions on a thermal neutron and U-238 needs a fast one.
  // The neutron separation energy is computed from the liquid-drop formula; the
  // fission barriers are measured values, which the model cannot supply.
  const BARRIER={ '92_236':5.7, '92_239':6.2, '94_240':5.6, '90_233':6.5, '92_234':5.9 };
  function drawCompare(){
    const {ctx,w,h}=fitCanvas(cmpCanvas);
    const TARGETS=[
      {Z:92,A:235,lab:'\u00b2\u00b3\u2075U + n'}, {Z:92,A:238,lab:'\u00b2\u00b3\u2078U + n'},
      {Z:94,A:239,lab:'\u00b2\u00b3\u2079Pu + n'},{Z:90,A:232,lab:'\u00b2\u00b3\u00b2Th + n'},
      {Z:92,A:233,lab:'\u00b2\u00b3\u00b3U + n'}
    ];
    const vals=TARGETS.map(t=>{
      const Sn=semf(t.Z,t.A+1)-semf(t.Z,t.A);
      const barrier=BARRIER[t.Z+'_'+(t.A+1)];
      const evenEven=((t.A+1-t.Z)%2===0 && t.Z%2===0);
      return {...t, Sn, barrier, thermal:Sn>barrier, evenEven};
    });
    const m={l:66,r:20,t:26,b:56};
    const ymax=Math.max(...vals.flatMap(v=>[v.Sn,v.barrier]))*1.3;
    const {X,Y}=drawAxes(ctx,w,h,m,-0.5,vals.length-0.5,0,ymax,'','energy (MeV)',
      {nx:vals.length-1,ny:5,xfmt:()=>'',yfmt:v=>v.toFixed(0)});
    const bw=(w-m.l-m.r)/vals.length*0.26;
    ctx.save(); ctx.font='10px Helvetica,Arial,sans-serif';
    vals.forEach((v,i)=>{
      ctx.fillStyle='rgba(31,111,120,0.8)';
      ctx.fillRect(X(i)-bw-2, Y(v.Sn), bw, Y(0)-Y(v.Sn));
      ctx.fillStyle='rgba(164,52,44,0.8)';
      ctx.fillRect(X(i)+2, Y(v.barrier), bw, Y(0)-Y(v.barrier));
      ctx.fillStyle='#1c1d20'; ctx.textAlign='center';
      ctx.fillText(fmt(v.Sn,1), X(i)-bw/2-2, Y(v.Sn)-5);
      ctx.fillText(fmt(v.barrier,1), X(i)+bw/2+2, Y(v.barrier)-5);
      ctx.fillText(v.lab, X(i), h-m.b+15);
      ctx.fillStyle=v.thermal?'#1f6f78':'#a4342c';
      ctx.fillText(v.thermal?'fissions on a slow neutron':'needs a fast one', X(i), h-m.b+28);
      ctx.fillStyle='#9a9384';
      ctx.fillText(v.evenEven?'compound is even-even':'compound has an odd N', X(i), h-m.b+40);
    });
    ctx.textAlign='left'; ctx.font='11px Helvetica,Arial,sans-serif';
    ctx.fillStyle='#1f6f78'; ctx.fillText('binding energy released by swallowing the neutron (liquid drop)', m.l+8, m.t-8);
    ctx.fillStyle='#a4342c'; ctx.textAlign='right';
    ctx.fillText('measured fission barrier', w-m.r-8, m.t-8);
    ctx.restore();
  }

  function draw(){
    const Z=parseInt(zEl.value,10), A=parseInt(aEl.value,10);
    zVal.textContent=Z; aVal.textContent=A;
    drawBarrier(); drawCompare();
    const x=Z*Z/A;
    // fission Q from the liquid drop, splitting into two equal halves
    const Qsym=2*semf(Math.round(Z/2),Math.round(A/2))-semf(Z,A);
    const Sn235=semf(92,236)-semf(92,235), Sn238=semf(92,239)-semf(92,238);
    const pairTerm=SEMF.a5/Math.pow(236,0.75);
    const pairSwing=SEMF.a5/Math.pow(236,0.75)+SEMF.a5/Math.pow(239,0.75);
    readout.innerHTML = `
      <div>nucleus <b>${nucName(Z,A)}</b> — fissility Z²/A = <b>${fmt(x,2)}</b></div>
      <div>the liquid drop becomes unstable to any stretch at Z²/A = 2a₂/a₃ = <b>${fmt(CRIT,1)}</b>,
        so this nucleus is at <b>${fmt(x/CRIT*100,0)}%</b> of the way there</div>
      <div>at ε = 0.3 it costs <b>${fmt(deform(Z,A,0.3),2)} MeV</b> to deform —
        ${deform(Z,A,0.3)>0?'it springs back':'it keeps going'}</div>
      <div>energy released if it split into two halves (liquid drop) <b>${fmt(Qsym,0)} MeV</b></div>
      <div>²³⁵U + n releases <b>${fmt(Sn235,2)} MeV</b> of binding energy;
        ²³⁸U + n releases only <b>${fmt(Sn238,2)} MeV</b></div>
      <div>the difference is almost all the <b>pairing term</b>: ²³⁶U is even-even and gains
        +a₅/A<sup>3/4</sup> = <b>${fmt(pairTerm,2)} MeV</b>, while ²³⁹U has an odd neutron number and
        gains nothing — and ²³⁸U before it had the bonus, so the swing is
        <b>${fmt(pairSwing,2)} MeV</b> of the ${fmt(Sn235-Sn238,2)} MeV gap</div>
      <div>that single term is why ²³⁵U runs a reactor on slow neutrons and ²³⁸U — 99.3% of natural
        uranium — does not</div>`;
  }
  zEl.addEventListener('input',()=>{
    stage='idle'; stageT=0; playing=false;
    if(playBtn){ playBtn.textContent='▶ Nudge the drop and watch'; playBtn.classList.remove('playing'); }
    draw(); drawShape();
  });
  aEl.addEventListener('input',()=>{
    stage='idle'; stageT=0; playing=false;
    if(playBtn){ playBtn.textContent='▶ Nudge the drop and watch'; playBtn.classList.remove('playing'); }
    draw(); drawShape();
  });
  registerCanvas('fs_canvas',draw);
  registerCanvas('fs_cmp',draw);
  registerCanvas('fs_shape',drawShape);
  requestAnimationFrame(loop);
}

/* =====================================================================
   8. FUSION: STARS AND REACTORS
   ===================================================================== */
function setupFusion(){
  const rateCanvas=document.getElementById('fu_canvas');
  const peakCanvas=document.getElementById('fu_peak');
  const lawCanvas=document.getElementById('fu_lawson');
  const tEl=document.getElementById('fu_t'), tVal=document.getElementById('fu_t_val');
  const ntEl=document.getElementById('fu_nt'), ntVal=document.getElementById('fu_nt_val');
  const ktEl=document.getElementById('fu_kt'), ktVal=document.getElementById('fu_kt_val');
  const readout=document.getElementById('fu_readout');

  // Gamow energy: E_G = 2 mu c^2 (pi alpha Z1 Z2)^2
  function gamowEnergy(Z1,Z2,m1,m2){
    const mu=m1*m2/(m1+m2)*U_MEV;
    return 2*mu*Math.pow(Math.PI*ALPHA_FS*Z1*Z2,2);
  }
  const EG_PP  = gamowEnergy(1,1,1.00728,1.00728);   // p + p
  const EG_CNO = gamowEnergy(1,7,1.00783,14.00307);  // p + 14N, the slow step
  const EG_DT  = gamowEnergy(1,1,2.014102,3.016050); // D + T

  // thermally averaged rate, up to a constant: T^(-2/3) exp(-3 (E_G/4kT)^(1/3))
  function rate(EG,kT_MeV){
    return Math.pow(kT_MeV,-2/3)*Math.exp(-3*Math.pow(EG/(4*kT_MeV),1/3));
  }
  function slope(EG,kT_MeV){ return Math.pow(EG/(4*kT_MeV),1/3)-2/3; }

  // normalise so the two stellar cycles cross at 1.8e7 K, Beiser's figure
  const KT_CROSS=K_EV_11*1.8e7/1e6;
  const CNO_SCALE=rate(EG_PP,KT_CROSS)/rate(EG_CNO,KT_CROSS);

  function drawRates(){
    const {ctx,w,h}=fitCanvas(rateCanvas);
    const T7=parseFloat(tEl.value);
    const m={l:66,r:18,t:22,b:42};
    const {X,Y}=drawAxes(ctx,w,h,m,0.4,4.5,-6,6,'core temperature (10⁷ K)',
      'log₁₀ of the energy generation rate',{nx:5,ny:6,xfmt:v=>v.toFixed(1),yfmt:v=>v.toFixed(0)});
    const ref=rate(EG_PP,KT_CROSS);
    [[EG_PP,1,'proton–proton chain','#a4342c'],[EG_CNO,CNO_SCALE,'CNO cycle','#1f6f78']]
      .forEach(([EG,sc,lab,col])=>{
        const pts=[];
        for(let t=0.4;t<=4.5;t+=0.01){
          const kT=K_EV_11*t*1e7/1e6;
          pts.push({x:t,y:Math.log10(sc*rate(EG,kT)/ref)});
        }
        plotLine(ctx,X,Y,pts.filter(p=>p.y>-6.5&&p.y<6.5),col,2.8);
        const lp=pts.find(p=>p.y>-1.5);
        if(lp){ ctx.save(); ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle=col;
          ctx.textAlign='left'; ctx.fillText(lab, X(Math.min(lp.x+0.15,3.6)), Y(Math.min(lp.y+0.6,5.3))); ctx.restore(); }
      });
    plotLine(ctx,X,Y,[{x:1.8,y:-6},{x:1.8,y:6}],'#ddd8cc',1.6,[4,3]);
    plotLine(ctx,X,Y,[{x:1.5,y:-6},{x:1.5,y:6}],'#8a6d1f',1.6);
    plotLine(ctx,X,Y,[{x:T7,y:-6},{x:T7,y:6}],'#1c1d20',1.4,[3,3]);
    ctx.save(); ctx.font='11px Helvetica,Arial,sans-serif'; ctx.textAlign='left';
    ctx.fillStyle='#8a6d1f'; ctx.fillText('the Sun, 1.5×10⁷ K', X(1.5)+6, Y(4.6));
    ctx.fillStyle='#8a8d92'; ctx.fillText('they cross here', X(1.8)+6, Y(-4.4));
    ctx.textAlign='right'; ctx.fillStyle='#5a5d63';
    ctx.fillText('below the crossing the pp chain rules; above it, the CNO cycle', w-m.r-8, m.t+14);
    ctx.restore();
  }

  // the Gamow peak: the Maxwell tail falling, the tunnelling probability rising
  function drawPeak(){
    const {ctx,w,h}=fitCanvas(peakCanvas);
    const T7=parseFloat(tEl.value);
    const kT=K_EV_11*T7*1e7/1e6;    // MeV
    const m={l:62,r:18,t:22,b:42};
    const Emax=14*kT;
    const boltz=E=>Math.exp(-E/kT);
    const tunnel=E=>Math.exp(-Math.sqrt(EG_PP/E));
    let peak=0, Epk=0;
    for(let E=Emax/2000;E<=Emax;E+=Emax/2000){
      const v=boltz(E)*tunnel(E); if(v>peak){peak=v;Epk=E;}
    }
    const {X,Y}=drawAxes(ctx,w,h,m,0,Emax*1000,0,1.15,'relative energy of the colliding pair (keV)',
      'relative probability',{nx:5,ny:4,xfmt:v=>v.toFixed(1),yfmt:()=>''});
    const b=[],t=[],p=[];
    for(let E=Emax/800;E<=Emax;E+=Emax/800){
      b.push({x:E*1000,y:boltz(E)});
      t.push({x:E*1000,y:tunnel(E)/tunnel(Emax)});
      p.push({x:E*1000,y:boltz(E)*tunnel(E)/peak});
    }
    plotLine(ctx,X,Y,b,'#8a6d1f',1.8,[5,4]);
    plotLine(ctx,X,Y,t,'#1f6f78',1.8,[5,4]);
    ctx.save(); ctx.fillStyle='rgba(164,52,44,0.16)'; ctx.beginPath(); ctx.moveTo(X(0),Y(0));
    p.forEach(q=>ctx.lineTo(X(q.x),Y(q.y))); ctx.lineTo(X(Emax*1000),Y(0)); ctx.closePath(); ctx.fill(); ctx.restore();
    plotLine(ctx,X,Y,p,'#a4342c',2.8);
    dotAt(ctx,X,Y,Epk*1000,1,'#a4342c',5);
    plotLine(ctx,X,Y,[{x:kT*1000,y:0},{x:kT*1000,y:1.1}],'#1c1d20',1.4,[3,3]);
    ctx.save(); ctx.font='11px Helvetica,Arial,sans-serif'; ctx.textAlign='right';
    ctx.fillStyle='#8a6d1f'; ctx.fillText('how many pairs have this energy — e^(−E/kT)', w-m.r-8, m.t+14);
    ctx.fillStyle='#1f6f78'; ctx.fillText('chance of tunnelling at this energy', w-m.r-8, m.t+29);
    ctx.fillStyle='#a4342c'; ctx.fillText('their product — all the fusion happens in here', w-m.r-8, m.t+44);
    ctx.fillStyle='#5a5d63';
    ctx.fillText(`the peak sits at ${fmt(Epk/kT,1)} kT`, w-m.r-8, m.t+59);
    ctx.textAlign='left'; ctx.fillStyle='#1c1d20'; ctx.fillText('kT', X(kT*1000)+5, Y(1.06));
    ctx.restore();
    return {Epk,kT};
  }

  /* The Lawson condition, computed rather than sketched. The thermally averaged
     D-T reactivity follows the standard Gamow-form fit
         <sigma v> = 3.68e-18 T^(-2/3) exp(-19.94 T^(-1/3))  m^3/s, T in keV,
     good to about 25% below 25 keV. Power balance then gives
         n*tau  =  12 kT / ( <sigma v> E ),
     with E = 17.6 MeV (all the fusion energy) for breakeven and E = 3.5 MeV
     (only the alpha, which stays in the plasma) for ignition.              */
  function sigmaV(TkeV){
    return 3.68e-18*Math.pow(TkeV,-2/3)*Math.exp(-19.94*Math.pow(TkeV,-1/3));
  }
  function nTau(TkeV, E_MeV){
    return 12*TkeV*1e3*EV_J/(sigmaV(TkeV)*E_MeV*1e6*EV_J);
  }
  function drawLawson(){
    const {ctx,w,h}=fitCanvas(lawCanvas);
    const logNT=parseFloat(ntEl.value), TkeV=parseFloat(ktEl.value);
    const m={l:66,r:18,t:22,b:42};
    const {X,Y}=drawAxes(ctx,w,h,m,19,22,0,42,'log\u2081\u2080 of the confinement quality n\u03c4 (s/m\u00b3)',
      'plasma ion temperature (keV)',{nx:6,ny:5,xfmt:v=>v.toFixed(1),yfmt:v=>v.toFixed(0)});
    [['breakeven, Q = 1','#1f6f78',17.59],['ignition','#a4342c',3.5]].forEach(([lab,col,E])=>{
      const pts=[];
      for(let T=4;T<=40;T+=0.25) pts.push({x:Math.log10(nTau(T,E)),y:T});
      plotLine(ctx,X,Y,pts.filter(p=>p.x>19&&p.x<22),col,2.6);
      const lp=pts.find(p=>p.y>=26)||pts[pts.length-1];
      ctx.save(); ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle=col; ctx.textAlign='left';
      ctx.fillText(lab, X(lp.x)+8, Y(lp.y));
      ctx.restore();
    });
    // where the best tokamaks have actually reached
    dotAt(ctx,X,Y,Math.log10(2e19),30,'#1c1d20',6);
    dotAt(ctx,X,Y,logNT,TkeV,'#8a6d1f',6);
    const need=nTau(TkeV,17.59);
    ctx.save(); ctx.font='11px Helvetica,Arial,sans-serif'; ctx.textAlign='left';
    ctx.fillStyle='#1c1d20'; ctx.fillText('best tokamaks so far: 30 keV, n\u03c4 = 2\u00d710\u00b9\u2079', X(Math.log10(2e19))+9, Y(30));
    ctx.fillStyle='#8a6d1f';
    ctx.fillText(Math.pow(10,logNT)>=need?'your setting reaches breakeven':'your setting falls short', X(logNT)+9, Y(TkeV)+16);
    ctx.textAlign='right'; ctx.fillStyle='#5a5d63';
    ctx.fillText('you need temperature AND density AND time, all at once', w-m.r-8, m.t+14);
    ctx.restore();
  }

  function draw(){
    const T7=parseFloat(tEl.value), logNT=parseFloat(ntEl.value), TkeV=parseFloat(ktEl.value);
    tVal.textContent=fmt(T7,2); ntVal.textContent='10^'+fmt(logNT,2); ktVal.textContent=fmt(TkeV,0);
    drawRates();
    const pk=drawPeak();
    drawLawson();
    const kT=K_EV_11*T7*1e7/1e6;
    const barrier=1*1*KE2_JM/(2e-15)/EV_J/1e6;   // two protons at 2 fm, MeV
    const dt=(Mu(1,2)+Mu(1,3)-Mu(2,4)-M_N_U)*U_MEV;
    readout.innerHTML = `
      <div>core temperature <b>${fmt(T7,2)}×10⁷ K</b> → kT = <b>${fmt(kT*1000,3)} keV</b></div>
      <div>two protons must get within ~2 fm, where the Coulomb barrier is <b>${fmt(barrier,2)} MeV</b>
        — that is <b>${fmtSci(barrier/kT,2)}×</b> kT</div>
      <div>classically nothing would ever fuse. The reactions happen entirely by tunnelling, and
        entirely in the tail of the Maxwell distribution</div>
      <div>Gamow energy for p + p <b>${fmt(EG_PP*1000,0)} keV</b>; for p + ¹⁴N (the slow CNO step)
        <b>${fmt(EG_CNO,1)} MeV</b></div>
      <div>at this temperature the pp rate goes as <b>T<sup>${fmt(slope(EG_PP,kT),1)}</sup></b>
        and the CNO rate as <b>T<sup>${fmt(slope(EG_CNO,kT),0)}</sup></b></div>
      <div>the Gamow peak sits at <b>${fmt(pk.Epk*1000,2)} keV</b> = ${fmt(pk.Epk/kT,1)} kT —
        the only pairs that matter are the rare fast ones that also tunnel</div>
      <div>on Earth the reaction of choice is D + T → ⁴He + n, worth <b>${fmt(dt,2)} MeV</b></div>
      <div>at <b>${fmt(TkeV,0)} keV</b> breakeven needs nτ ≥ <b>${fmtSci(nTau(TkeV,17.59),2)} s/m³</b>
        and ignition <b>${fmtSci(nTau(TkeV,3.5),2)}</b>; you have set <b>10<sup>${fmt(logNT,2)}</sup></b>
        <span class="badge ${Math.pow(10,logNT)>=nTau(TkeV,17.59)?'ok':'no'}">${Math.pow(10,logNT)>=nTau(TkeV,17.59)?'breakeven':'short by '+fmt(nTau(TkeV,17.59)/Math.pow(10,logNT),1)+'×'}</span></div>
      <div>the reactivity fit above is good to about 25% below 25 keV; the real D–T cross section
        peaks near 65 keV, which is why reactor designs sit where they do</div>`;
  }
  tEl.addEventListener('input',draw);
  ntEl.addEventListener('input',draw);
  ktEl.addEventListener('input',draw);
  registerCanvas('fu_canvas',draw);
  registerCanvas('fu_peak',draw);
  registerCanvas('fu_lawson',draw);
}

// register with the loader in app.js
registerModule('setupDecayModes', setupDecayModes);
registerModule('setupDecayLaw', setupDecayLaw);
registerModule('setupDating', setupDating);
registerModule('setupAlphaDecay', setupAlphaDecay);
registerModule('setupBetaDecay', setupBetaDecay);
registerModule('setupCrossSection', setupCrossSection);
registerModule('setupFission', setupFission);
registerModule('setupFusion', setupFusion);
