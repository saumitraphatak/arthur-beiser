/* =====================================================================
   Concepts of Modern Physics — Interactive Companion
   Chapter 13: Elementary Particles
   Particle properties are Beiser's Tables 13.2–13.4 (measured data).
   Every conservation check, mass prediction, range and density below is
   computed live from those.
   ===================================================================== */

const G_N      = 6.674e-11;       // gravitational constant
const KE_SI    = 8.98755e9;       // 1/4 pi eps0
const HBARC_MF = 197.327;         // hbar c, MeV fm
const MPC_M    = 3.0857e22;       // metres in a megaparsec
const MLY_M    = 9.4607e21;       // metres in a million light-years

/* Particle table. q = charge in e, B = baryon number, Le/Lm/Lt = lepton
   numbers, S = strangeness, J = spin, m = mass in MeV/c^2, tau = mean life
   in seconds (0 = stable, null = not applicable). Quark content where the
   quark model assigns one.                                              */
const P13 = {
  gamma:{sym:'γ',    m:0,       q:0, B:0, Le:0, Lm:0, Lt:0, S:0, J:1,   tau:0,       cls:'boson'},
  'e-' :{sym:'e⁻',   m:0.511,   q:-1,B:0, Le:1, Lm:0, Lt:0, S:0, J:0.5, tau:0,       cls:'lepton'},
  'e+' :{sym:'e⁺',   m:0.511,   q:1, B:0, Le:-1,Lm:0, Lt:0, S:0, J:0.5, tau:0,       cls:'lepton'},
  nue  :{sym:'ν_e',  m:0,       q:0, B:0, Le:1, Lm:0, Lt:0, S:0, J:0.5, tau:0,       cls:'lepton'},
  anue :{sym:'ν̄_e',  m:0,       q:0, B:0, Le:-1,Lm:0, Lt:0, S:0, J:0.5, tau:0,       cls:'lepton'},
  'mu-':{sym:'μ⁻',   m:105.66,  q:-1,B:0, Le:0, Lm:1, Lt:0, S:0, J:0.5, tau:2.197e-6,cls:'lepton'},
  'mu+':{sym:'μ⁺',   m:105.66,  q:1, B:0, Le:0, Lm:-1,Lt:0, S:0, J:0.5, tau:2.197e-6,cls:'lepton'},
  numu :{sym:'ν_μ',  m:0,       q:0, B:0, Le:0, Lm:1, Lt:0, S:0, J:0.5, tau:0,       cls:'lepton'},
  anumu:{sym:'ν̄_μ',  m:0,       q:0, B:0, Le:0, Lm:-1,Lt:0, S:0, J:0.5, tau:0,       cls:'lepton'},
  'tau-':{sym:'τ⁻',  m:1776.9,  q:-1,B:0, Le:0, Lm:0, Lt:1, S:0, J:0.5, tau:2.903e-13,cls:'lepton'},
  nutau:{sym:'ν_τ',  m:0,       q:0, B:0, Le:0, Lm:0, Lt:1, S:0, J:0.5, tau:0,       cls:'lepton'},
  'pi+':{sym:'π⁺',   m:139.57,  q:1, B:0, Le:0, Lm:0, Lt:0, S:0, J:0,   tau:2.603e-8,cls:'meson', quarks:'ud̄'},
  'pi-':{sym:'π⁻',   m:139.57,  q:-1,B:0, Le:0, Lm:0, Lt:0, S:0, J:0,   tau:2.603e-8,cls:'meson', quarks:'dū'},
  pi0  :{sym:'π⁰',   m:134.98,  q:0, B:0, Le:0, Lm:0, Lt:0, S:0, J:0,   tau:8.4e-17, cls:'meson', quarks:'uū/dd̄'},
  'K+' :{sym:'K⁺',   m:493.7,   q:1, B:0, Le:0, Lm:0, Lt:0, S:1, J:0,   tau:1.238e-8,cls:'meson', quarks:'us̄'},
  'K-' :{sym:'K⁻',   m:493.7,   q:-1,B:0, Le:0, Lm:0, Lt:0, S:-1,J:0,   tau:1.238e-8,cls:'meson', quarks:'sū'},
  K0   :{sym:'K⁰',   m:497.6,   q:0, B:0, Le:0, Lm:0, Lt:0, S:1, J:0,   tau:8.9e-11, cls:'meson', quarks:'ds̄'},
  aK0  :{sym:'K̄⁰',   m:497.6,   q:0, B:0, Le:0, Lm:0, Lt:0, S:-1,J:0,   tau:5.2e-8,  cls:'meson', quarks:'sd̄'},
  eta  :{sym:'η⁰',   m:547.9,   q:0, B:0, Le:0, Lm:0, Lt:0, S:0, J:0,   tau:5e-19,   cls:'meson', quarks:'uū/dd̄/ss̄'},
  p    :{sym:'p',    m:938.27,  q:1, B:1, Le:0, Lm:0, Lt:0, S:0, J:0.5, tau:0,       cls:'baryon',quarks:'uud'},
  ap   :{sym:'p̄',    m:938.27,  q:-1,B:-1,Le:0, Lm:0, Lt:0, S:0, J:0.5, tau:0,       cls:'baryon',quarks:'ūūd̄'},
  n    :{sym:'n',    m:939.57,  q:0, B:1, Le:0, Lm:0, Lt:0, S:0, J:0.5, tau:879.4,   cls:'baryon',quarks:'udd'},
  an   :{sym:'n̄',    m:939.57,  q:0, B:-1,Le:0, Lm:0, Lt:0, S:0, J:0.5, tau:879.4,   cls:'baryon',quarks:'ūd̄d̄'},
  L0   :{sym:'Λ⁰',   m:1115.7,  q:0, B:1, Le:0, Lm:0, Lt:0, S:-1,J:0.5, tau:2.63e-10,cls:'baryon',quarks:'uds'},
  'S+' :{sym:'Σ⁺',   m:1189.4,  q:1, B:1, Le:0, Lm:0, Lt:0, S:-1,J:0.5, tau:8.0e-11, cls:'baryon',quarks:'uus'},
  S0   :{sym:'Σ⁰',   m:1192.6,  q:0, B:1, Le:0, Lm:0, Lt:0, S:-1,J:0.5, tau:7.4e-20, cls:'baryon',quarks:'uds'},
  'S-' :{sym:'Σ⁻',   m:1197.4,  q:-1,B:1, Le:0, Lm:0, Lt:0, S:-1,J:0.5, tau:1.48e-10,cls:'baryon',quarks:'dds'},
  X0   :{sym:'Ξ⁰',   m:1314.9,  q:0, B:1, Le:0, Lm:0, Lt:0, S:-2,J:0.5, tau:2.9e-10, cls:'baryon',quarks:'uss'},
  'X-' :{sym:'Ξ⁻',   m:1321.7,  q:-1,B:1, Le:0, Lm:0, Lt:0, S:-2,J:0.5, tau:1.64e-10,cls:'baryon',quarks:'dss'},
  'O-' :{sym:'Ω⁻',   m:1672.5,  q:-1,B:1, Le:0, Lm:0, Lt:0, S:-3,J:1.5, tau:8.2e-11, cls:'baryon',quarks:'sss'}
};
const P13_KEYS = Object.keys(P13);

// Quarks, Beiser's Table 13.4 — constituent masses in GeV
const QUARKS = {
  u:{sym:'u', m:0.3,  q: 2/3, S:0,  gen:1, name:'up'},
  d:{sym:'d', m:0.3,  q:-1/3, S:0,  gen:1, name:'down'},
  s:{sym:'s', m:0.5,  q:-1/3, S:-1, gen:2, name:'strange'},
  c:{sym:'c', m:1.5,  q: 2/3, S:0,  gen:2, name:'charmed'},
  b:{sym:'b', m:4.3,  q:-1/3, S:0,  gen:3, name:'bottom'},
  t:{sym:'t', m:174,  q: 2/3, S:0,  gen:3, name:'top'}
};

function fmtQ(x){
  const r=Math.round(x*3);
  if(Math.abs(x*3-r)>1e-6) return fmt(x,3);
  if(r%3===0) return String(r/3);
  return (r<0?'−':'+')+Math.abs(r)+'/3';
}
function sgn(x){ return (x>0?'+':'')+x; }

/* =====================================================================
   1. THE FOUR INTERACTIONS
   ===================================================================== */
function setupInteractions(){
  const canvas=document.getElementById('in_canvas');
  const rEl=document.getElementById('in_r'), rVal=document.getElementById('in_r_val');
  const readout=document.getElementById('in_readout');

  // two protons, the one pair on which all four can be compared
  function forces(r){
    const em = KE_SI*EV_J*EV_J/(r*r);
    const gr = G_N*M_P*M_P/(r*r);
    // strong: the force from a Yukawa potential of range 1.4 fm,
    //   F = A e^(-r/R) (1/r^2 + 1/rR), normalised to 1e3 N at 1 fm, which is
    //   what 8 MeV of binding spread over 2 fm amounts to
    const R=1.4e-15, r1=1e-15;
    const yuk = x => Math.exp(-x/R)*(1/(x*x) + 1/(x*R));
    const strong = 1.0e3*yuk(r)/yuk(r1);
    // weak: the same shape with the W's range of 0.0025 fm
    const Rw=2.45e-18;
    const yukW = x => Math.exp(-x/Rw)*(1/(x*x) + 1/(x*Rw));
    const weak = 1.0e3*yukW(r)/yukW(r1);
    return {em,gr,strong,weak};
  }

  function draw(){
    const {ctx,w,h}=fitCanvas(canvas);
    const logr=parseFloat(rEl.value);
    const r=Math.pow(10,logr);
    rVal.textContent='10^'+fmt(logr,1);

    const m={l:66,r:18,t:22,b:42};
    const {X,Y}=drawAxes(ctx,w,h,m,-19,-9,-50,10,'log₁₀ of the separation (m)',
      'log₁₀ of the force (N)',{nx:5,ny:6,xfmt:v=>v.toFixed(0),yfmt:v=>v.toFixed(0)});

    const SERIES=[['strong','#a4342c'],['em','#1f6f78'],['weak','#8a6d1f'],['gr','#5b3f8a']];
    const LABEL={strong:'strong',em:'electromagnetic',weak:'weak',gr:'gravitational'};
    SERIES.forEach(([k,col])=>{
      const pts=[];
      for(let lg=-19;lg<=-9;lg+=0.02){
        const v=forces(Math.pow(10,lg))[k];
        pts.push({x:lg,y:v>0?Math.log10(v):null});
      }
      plotLine(ctx,X,Y,pts.filter(p=>p.y!=null&&p.y>-50&&p.y<10),col,2.6);
    });

    // scale landmarks
    [[-15,'a nucleon'],[-14,'a nucleus'],[-10,'an atom']].forEach(([lg,lab])=>{
      plotLine(ctx,X,Y,[{x:lg,y:-50},{x:lg,y:10}],'#eee9df',1.4);
      ctx.save(); ctx.font='10px Helvetica,Arial,sans-serif'; ctx.fillStyle='#b0aa9c';
      ctx.textAlign='center'; ctx.fillText(lab, X(lg), m.t-6); ctx.restore();
    });
    plotLine(ctx,X,Y,[{x:logr,y:-50},{x:logr,y:10}],'#1c1d20',1.4,[3,3]);

    const f=forces(r);
    ctx.save(); ctx.font='11px Helvetica,Arial,sans-serif'; ctx.textAlign='right';
    SERIES.forEach(([k,col],i)=>{
      ctx.fillStyle=col; ctx.fillText(LABEL[k], w-m.r-8, m.t+30+i*15);
      if(f[k]>1e-50&&f[k]<1e10) dotAt(ctx,X,Y,logr,Math.log10(f[k]),col,4.5);
    });
    ctx.fillStyle='#5a5d63';
    ctx.fillText('two protons, this far apart', w-m.r-8, m.t+14);
    ctx.restore();

    const emGrP=KE_SI*EV_J*EV_J/(G_N*M_P*M_P);
    const emGrE=KE_SI*EV_J*EV_J/(G_N*M_E*M_E);
    readout.innerHTML = `
      <div>separation <b>${fmtSci(r,2)} m</b> = ${r>1e-12?fmt(r*1e9,4)+' nm':fmt(r*1e15,4)+' fm'}</div>
      <div>strong <b>${f.strong>1e-40?fmtSci(f.strong,2):'~0'} N</b></div>
      <div>electromagnetic <b>${fmtSci(f.em,2)} N</b></div>
      <div>weak <b>${f.weak>1e-60?fmtSci(f.weak,2):'~0'} N</b></div>
      <div>gravitational <b>${fmtSci(f.gr,2)} N</b></div>
      <div>electromagnetic ÷ gravitational, two protons <b>${fmtSci(emGrP,3)}</b></div>
      <div>&nbsp;&nbsp;two electrons <b>${fmtSci(emGrE,3)}</b> — gravity is weaker still between lighter things</div>
      <div>at this distance the electric repulsion is <b>${fmtSci(f.em/f.gr,2)}×</b> the gravitational
        attraction — and that ratio never changes, because both go as 1/r²</div>`;
  }
  rEl.addEventListener('input',draw);
  registerCanvas('in_canvas',draw);
}

/* =====================================================================
   2. THE PARTICLE ZOO
   ===================================================================== */
function setupParticleZoo(){
  const massCanvas=document.getElementById('pz_canvas');
  const lifeCanvas=document.getElementById('pz_life');
  const selEl=document.getElementById('pz_sel');
  const gamEl=document.getElementById('pz_gamma'), gamVal=document.getElementById('pz_gamma_val');
  const readout=document.getElementById('pz_readout');

  P13_KEYS.filter(k=>P13[k].m>0).sort((a,b)=>P13[a].m-P13[b].m).forEach(k=>{
    const o=document.createElement('option');
    o.value=k; o.textContent=`${P13[k].sym}  —  ${fmt(P13[k].m,2)} MeV`;
    if(k==='mu-') o.selected=true;
    selEl.appendChild(o);
  });

  const COL={lepton:'#1f6f78',meson:'#8a6d1f',baryon:'#a4342c',boson:'#5b3f8a'};

  function drawMass(){
    const {ctx,w,h}=fitCanvas(massCanvas);
    const m={l:66,r:18,t:26,b:42};
    // everything with a mass, plus the quarks, on one log axis
    const rows=[];
    P13_KEYS.forEach(k=>{ if(P13[k].m>0) rows.push({lab:P13[k].sym,m:P13[k].m,cls:P13[k].cls,key:k}); });
    Object.keys(QUARKS).forEach(k=>rows.push({lab:QUARKS[k].sym,m:QUARKS[k].m*1000,cls:'quark'}));
    [['W',80379],['Z',91188]].forEach(([s,mm])=>rows.push({lab:s,m:mm,cls:'boson'}));
    const lo=Math.floor(Math.log10(Math.min(...rows.map(r=>r.m))))-0.5;
    const hi=Math.ceil(Math.log10(Math.max(...rows.map(r=>r.m))))+0.5;
    const {X,Y}=drawAxes(ctx,w,h,m,lo,hi,0,5,'log₁₀ of the rest mass (MeV/c²)','',
      {nx:6,ny:5,xfmt:v=>v.toFixed(0),yfmt:()=>''});
    const LANE={lepton:4,quark:3,meson:2,baryon:1,boson:0};
    const LANELAB={4:'leptons',3:'quarks',2:'mesons',1:'baryons',0:'field bosons'};
    Object.keys(LANELAB).forEach(l=>{
      plotLine(ctx,X,Y,[{x:lo,y:+l+0.5},{x:hi,y:+l+0.5}],'#f0ece3',1.2);
      ctx.save(); ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle='#b0aa9c';
      ctx.textAlign='left'; ctx.fillText(LANELAB[l], m.l+6, Y(+l+0.34)); ctx.restore();
    });
    const sel=selEl.value;
    ctx.save(); ctx.font='10px Helvetica,Arial,sans-serif'; ctx.textAlign='center';
    rows.forEach(r=>{
      const y=LANE[r.cls==='quark'?'quark':r.cls]+0.12;
      const on=(r.key===sel);
      ctx.fillStyle= r.cls==='quark' ? '#c2701f' : COL[r.cls];
      ctx.globalAlpha=on?1:0.8;
      ctx.beginPath(); ctx.arc(X(Math.log10(r.m)),Y(y),on?6:3.4,0,7); ctx.fill();
      ctx.globalAlpha=1;
      ctx.fillStyle=on?'#1c1d20':'#8a8d92';
      ctx.font=on?'bold 11px Helvetica,Arial,sans-serif':'10px Helvetica,Arial,sans-serif';
      ctx.fillText(r.lab, X(Math.log10(r.m)), Y(y)-9);
    });
    ctx.restore();
    ctx.save(); ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle='#5a5d63'; ctx.textAlign='right';
    ctx.fillText(`${fmt(hi-lo,0)} decades of mass, from the electron to the top quark`, w-m.r-8, m.t-8);
    ctx.restore();
  }

  // lifetime against mass: the three interactions sort themselves into bands
  function drawLife(){
    const {ctx,w,h}=fitCanvas(lifeCanvas);
    const m={l:66,r:18,t:26,b:42};
    const rows=P13_KEYS.filter(k=>P13[k].tau>0).map(k=>({key:k,...P13[k]}));
    const {X,Y}=drawAxes(ctx,w,h,m,0,3.5,-22,4,'log₁₀ of the mass (MeV/c²)',
      'log₁₀ of the mean life (s)',{nx:7,ny:6,xfmt:v=>v.toFixed(1),yfmt:v=>v.toFixed(0)});
    // the interaction bands
    [[-24,-18,'strong / electromagnetic decays','rgba(164,52,44,0.09)'],
     [-11,4,'weak decays','rgba(31,111,120,0.09)']].forEach(([a,b,lab,col])=>{
      ctx.save(); ctx.fillStyle=col;
      ctx.fillRect(m.l,Y(Math.min(b,4)),w-m.l-m.r,Y(Math.max(a,-22))-Y(Math.min(b,4)));
      ctx.restore();
      ctx.save(); ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle='#9a9384';
      ctx.textAlign='left'; ctx.fillText(lab, m.l+10, Y((Math.max(a,-22)+Math.min(b,4))/2)); ctx.restore();
    });
    const sel=selEl.value;
    ctx.save(); ctx.font='10px Helvetica,Arial,sans-serif'; ctx.textAlign='center';
    rows.forEach(r=>{
      const x=Math.log10(r.m), y=Math.log10(r.tau);
      if(y<-22||y>4) return;
      const on=(r.key===sel);
      ctx.fillStyle=COL[r.cls]; ctx.beginPath(); ctx.arc(X(x),Y(y),on?6:3.6,0,7); ctx.fill();
      ctx.fillStyle=on?'#1c1d20':'#8a8d92';
      ctx.font=on?'bold 11px Helvetica,Arial,sans-serif':'10px Helvetica,Arial,sans-serif';
      ctx.fillText(r.sym, X(x), Y(y)-9);
    });
    ctx.restore();
    ctx.save(); ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle='#5a5d63'; ctx.textAlign='right';
    ctx.fillText('lifetime tells you which interaction takes it apart — strong decays, at 10⁻²³ s, are faster than anything here', w-m.r-8, m.t-8);
    ctx.restore();
  }

  function draw(){
    const p=P13[selEl.value];
    const gam=parseFloat(gamEl.value);
    gamVal.textContent=fmt(gam,0);
    drawMass(); drawLife();
    const ct=p.tau>0?C*p.tau:null;
    let mech='—';
    if(p.tau>0){
      mech = p.tau>1e-11 ? 'weak — nothing faster is available'
           : (p.tau>1e-20 ? 'electromagnetic' : 'strong');
    }
    readout.innerHTML = `
      <div>particle <b>${p.sym}</b> — ${p.cls}, mass <b>${fmt(p.m,3)} MeV/c²</b>
        ${p.quarks?`<span class="badge">${p.quarks}</span>`:''}</div>
      <div>charge <b>${sgn(p.q)}e</b>, spin <b>${p.J===0.5?'½':(p.J===1.5?'3/2':p.J)}</b>,
        baryon number <b>${p.B}</b>, strangeness <b>${p.S}</b></div>
      <div>mean life <b>${p.tau===0?'stable':fmtSci(p.tau,3)+' s'}</b></div>
      ${ct!=null?`<div>at the speed of light it would travel cτ = <b>${ct>1?fmt(ct,3)+' m':fmtSci(ct,2)+' m'}</b> before decaying</div>`:''}
      ${ct!=null?`<div>at γ = ${fmt(gam,0)} time dilation stretches that to <b>${gam*ct>1000?fmt(gam*ct/1000,2)+' km':fmt(gam*ct,2)+' m'}</b></div>`:''}
      ${p.tau>0?`<div>a lifetime of ${fmtSci(p.tau,1)} s means it is taken apart by the
        <b>${mech}</b> interaction</div>`:''}
      <div>heavier than the electron by <b>${fmtSci(p.m/0.511,3)}×</b>;
        ${p.m>938?'heavier':'lighter'} than a proton</div>`;
  }
  selEl.addEventListener('change',draw);
  gamEl.addEventListener('input',draw);
  registerCanvas('pz_canvas',draw);
  registerCanvas('pz_life',draw);
}

/* =====================================================================
   3. ANTIMATTER
   ===================================================================== */
function setupAntimatter(){
  const seaCanvas=document.getElementById('an_canvas');
  const barCanvas=document.getElementById('an_bars');
  const eEl=document.getElementById('an_e'), eVal=document.getElementById('an_e_val');
  const pEl=document.getElementById('an_p');
  const readout=document.getElementById('an_readout');

  const PAIRS={
    e:{sym:'e⁻e⁺', m:0.511,  name:'electron–positron'},
    mu:{sym:'μ⁻μ⁺',m:105.66, name:'muon pair'},
    pi:{sym:'π⁺π⁻',m:139.57, name:'charged pion pair'},
    p:{sym:'pp̄',   m:938.27, name:'proton–antiproton'}
  };

  function drawSea(){
    const {ctx,w,h}=fitCanvas(seaCanvas);
    const pair=PAIRS[pEl.value];
    const E=parseFloat(eEl.value)*pair.m;   // slider is in units of mc^2
    ctx.fillStyle='#fbfaf7'; ctx.fillRect(0,0,w,h);
    const m={l:70,r:20,t:26,b:34};
    const top=m.t, bot=h-m.b, mid=(top+bot)/2;
    const gap=(bot-top)*0.16;   // half the 2mc^2 gap, in pixels

    // the filled negative-energy sea
    ctx.save(); ctx.fillStyle='rgba(31,111,120,0.14)';
    ctx.fillRect(m.l, mid+gap, w-m.l-m.r, bot-(mid+gap));
    ctx.strokeStyle='#1f6f78'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(m.l,mid+gap); ctx.lineTo(w-m.r,mid+gap); ctx.stroke();
    ctx.strokeStyle='#a4342c';
    ctx.beginPath(); ctx.moveTo(m.l,mid-gap); ctx.lineTo(w-m.r,mid-gap); ctx.stroke();
    ctx.restore();
    // sea electrons
    const jit=i=>((Math.sin(i*12.9898)*43758.5453)%1+1)%1;
    ctx.save();
    for(let i=0;i<48;i++){
      const x=m.l+16+jit(i)*(w-m.l-m.r-32);
      const y=mid+gap+10+jit(i+50)*(bot-mid-gap-18);
      ctx.fillStyle= (i===7 && E>=2*pair.m) ? '#fbfaf7' : '#1f6f78';
      ctx.beginPath(); ctx.arc(x,y,3.2,0,7); ctx.fill();
      if(i===7 && E>=2*pair.m){ ctx.strokeStyle='#a4342c'; ctx.lineWidth=1.5; ctx.stroke();
        ctx.save(); ctx.font='10px Helvetica,Arial,sans-serif'; ctx.fillStyle='#a4342c';
        ctx.textAlign='center'; ctx.fillText('hole = antiparticle', x, y+18); ctx.restore(); }
    }
    ctx.restore();
    // the promoted particle
    if(E>=2*pair.m){
      const x=m.l+16+jit(7)*(w-m.l-m.r-32);
      const y=mid-gap-14-Math.min(40,(E-2*pair.m)/pair.m*10);
      ctx.save(); ctx.fillStyle='#a4342c'; ctx.beginPath(); ctx.arc(x,y,4,0,7); ctx.fill();
      ctx.strokeStyle='#a4342c'; ctx.lineWidth=1.6; ctx.setLineDash([3,3]);
      ctx.beginPath(); ctx.moveTo(x,mid+gap+10+jit(57)*(bot-mid-gap-18)); ctx.lineTo(x,y); ctx.stroke();
      ctx.restore();
    }
    ctx.save(); ctx.font='11px Helvetica,Arial,sans-serif'; ctx.textAlign='right';
    ctx.fillStyle='#a4342c'; ctx.fillText('+mc²', m.l-8, mid-gap+4);
    ctx.fillStyle='#1f6f78'; ctx.fillText('−mc²', m.l-8, mid+gap+4);
    ctx.fillStyle='#8a8d92'; ctx.fillText('0', m.l-8, mid+4);
    ctx.textAlign='left'; ctx.fillStyle='#5a5d63';
    ctx.fillText('the sea of filled negative-energy states', m.l+10, bot-10);
    ctx.fillText(E>=2*pair.m ? `photon of ${fmt(E,3)} MeV — enough: a pair appears`
                             : `photon of ${fmt(E,3)} MeV — not enough, nothing happens`,
                 m.l+10, m.t-8);
    ctx.restore();
  }

  function drawBars(){
    const {ctx,w,h}=fitCanvas(barCanvas);
    const m={l:70,r:20,t:26,b:52};
    const rows=[
      {lab:'burning petrol',      J:4.7e7,  col:'#8a6d1f'},
      {lab:'fission of ²³⁵U',     J:8.2e13, col:'#c2701f'},
      {lab:'D–T fusion',          J:3.4e14, col:'#1f6f78'},
      {lab:'matter–antimatter',   J:8.988e16,col:'#a4342c'}
    ];
    const {X,Y}=drawAxes(ctx,w,h,m,-0.5,rows.length-0.5,6,18,'','log₁₀ of the energy per kg (J/kg)',
      {nx:rows.length-1,ny:6,xfmt:()=>'',yfmt:v=>v.toFixed(0)});
    const bw=(w-m.l-m.r)/rows.length*0.45;
    ctx.save(); ctx.font='10px Helvetica,Arial,sans-serif';
    rows.forEach((r,i)=>{
      const y=Math.log10(r.J);
      ctx.fillStyle=r.col; ctx.globalAlpha=0.85;
      ctx.fillRect(X(i)-bw/2, Y(y), bw, Y(6)-Y(y)); ctx.globalAlpha=1;
      ctx.fillStyle='#1c1d20'; ctx.textAlign='center';
      ctx.fillText(fmtSci(r.J,2), X(i), Y(y)-6);
      ctx.fillText(r.lab, X(i), h-m.b+15);
      ctx.fillStyle='#8a8d92';
      ctx.fillText(`${fmtSci(8.988e16/r.J,2)}× less than annihilation`, X(i), h-m.b+28);
    });
    ctx.textAlign='left'; ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle='#5a5d63';
    ctx.fillText('annihilation converts 100% of the mass; nothing else comes close', m.l+8, m.t-8);
    ctx.restore();
  }

  function draw(){
    const pair=PAIRS[pEl.value];
    const mult=parseFloat(eEl.value);
    eVal.textContent=fmt(mult,2);
    const E=mult*pair.m;
    drawSea(); drawBars();
    const thr=2*pair.m;
    const ke=Math.max(0,E-thr);
    const stamp=5e-5;   // 50 mg
    const shuttle=0.5*1.0e5*7800*7800;
    readout.innerHTML = `
      <div>pair <b>${pair.name}</b>, each of mass ${fmt(pair.m,3)} MeV/c²</div>
      <div>threshold 2mc² <b>${fmt(thr,3)} MeV</b></div>
      <div>photon energy <b>${fmt(E,3)} MeV</b>
        <span class="badge ${E>=thr?'ok':'no'}">${E>=thr?'pair production possible':'below threshold'}</span></div>
      <div>${E>=thr?`leftover kinetic energy shared by the pair <b>${fmt(ke,3)} MeV</b>`:`short by <b>${fmt(thr-E,3)} MeV</b>`}</div>
      <div>photon wavelength at threshold <b>${fmtSci(HC_EV_NM/(thr*1e6),3)} nm</b> — a gamma ray</div>
      <div>run it backwards: an ${pair.name.split('–')[0]} meeting its antiparticle at rest gives two photons of
        <b>${fmt(pair.m,3)} MeV</b> each, back to back</div>
      <div>annihilation releases <b>c² = ${fmtSci(C_EXACT*C_EXACT,3)} J</b> per kilogram
        = ${fmt(C_EXACT*C_EXACT/4.184e15,1)} megatons of TNT</div>
      <div>two postage stamps of 50 mg, one of each kind, would release
        <b>${fmtSci(2*stamp*C_EXACT*C_EXACT,2)} J</b> — about <b>${fmt(2*stamp*C_EXACT*C_EXACT/shuttle,1)}×</b>
        the kinetic energy of a shuttle in orbit</div>`;
  }
  eEl.addEventListener('input',draw);
  pEl.addEventListener('change',draw);
  registerCanvas('an_canvas',draw);
  registerCanvas('an_bars',draw);
}

/* =====================================================================
   4. CONSERVATION LAWS: IS THIS REACTION ALLOWED?
   ===================================================================== */
function setupConservation(){
  const canvas=document.getElementById('cn_canvas');
  const presetEl=document.getElementById('cn_preset');
  const slots=['cn_a','cn_b','cn_c','cn_d','cn_e'].map(id=>document.getElementById(id));
  const readout=document.getElementById('cn_readout');

  slots.forEach((sel,i)=>{
    if(i>=2){ const o=document.createElement('option'); o.value=''; o.textContent='— none —'; sel.appendChild(o); }
    P13_KEYS.forEach(k=>{
      const o=document.createElement('option'); o.value=k; o.textContent=P13[k].sym; sel.appendChild(o);
    });
  });

  const PRESETS={
    ndecay:   {lab:'n → p + e⁻ + ν̄ₑ   (free neutron decay)',       in:['n',''],     out:['p','e-','anue']},
    pidecay:  {lab:'π⁺ → μ⁺ + ν_μ',                               in:['pi+',''],   out:['mu+','numu','']},
    mudecay:  {lab:'μ⁻ → e⁻ + ν̄ₑ + ν_μ',                          in:['mu-',''],   out:['e-','anue','numu']},
    assoc:    {lab:'p + π⁻ → Λ⁰ + K⁰   (associated production)',   in:['p','pi-'],  out:['L0','K0','']},
    xicascade:{lab:'Ξ⁻ → Λ⁰ + π⁻   (the cascade, one step at a time)', in:['X-',''], out:['L0','pi-','']},
    xibad:    {lab:'Ξ⁻ → n + π⁻   (why the cascade cannot skip)',  in:['X-',''],    out:['n','pi-','']},
    pdecay:   {lab:'p → e⁺ + π⁰   (proton decay, never seen)',     in:['p',''],     out:['e+','pi0','']},
    nobar:    {lab:'n → p + e⁻   (no antineutrino)',               in:['n',''],     out:['p','e-','']},
    lambdadk: {lab:'Λ⁰ → p + π⁻',                                 in:['L0',''],    out:['p','pi-','']},
    omegadk:  {lab:'Ω⁻ → Ξ⁰ + π⁻',                                in:['O-',''],    out:['X0','pi-','']}
  };
  Object.keys(PRESETS).forEach(k=>{
    const o=document.createElement('option'); o.value=k; o.textContent=PRESETS[k].lab;
    if(k==='ndecay') o.selected=true;
    presetEl.appendChild(o);
  });

  function sumOf(keys,field){
    return keys.filter(Boolean).reduce((s,k)=>s+P13[k][field],0);
  }
  const LAWS=[
    {k:'q',  lab:'electric charge Q',      strict:true},
    {k:'B',  lab:'baryon number B',        strict:true},
    {k:'Le', lab:'electron number L_e',    strict:true},
    {k:'Lm', lab:'muon number L_μ',        strict:true},
    {k:'Lt', lab:'tau number L_τ',         strict:true},
    {k:'S',  lab:'strangeness S',          strict:false}
  ];

  function draw(){
    const {ctx,w,h}=fitCanvas(canvas);
    const inK=[slots[0].value,slots[1].value].filter(Boolean);
    const outK=[slots[2].value,slots[3].value,slots[4].value].filter(Boolean);
    ctx.fillStyle='#fbfaf7'; ctx.fillRect(0,0,w,h);

    const mIn=sumOf(inK,'m'), mOut=sumOf(outK,'m');
    const energyOk = inK.length>1 ? true : mIn>=mOut;   // a collision can supply KE

    // the equation, drawn large
    ctx.save();
    ctx.font='22px Georgia, serif'; ctx.textAlign='center'; ctx.fillStyle='#1c1d20';
    const eq = inK.map(k=>P13[k].sym).join('  +  ') + '   →   ' + (outK.map(k=>P13[k].sym).join('  +  ')||'?');
    ctx.fillText(eq, w/2, 42);
    ctx.restore();

    // the ledger
    const rows=LAWS.map(L=>{
      const a=sumOf(inK,L.k), b=sumOf(outK,L.k);
      return {...L, a, b, ok: L.strict ? Math.abs(a-b)<1e-9 : Math.abs(a-b)<1e-9, d:b-a};
    });
    const x0=w*0.12, x1=w*0.52, x2=w*0.66, x3=w*0.80;
    ctx.save(); ctx.font='12px Helvetica,Arial,sans-serif';
    ctx.fillStyle='#8a8d92'; ctx.textAlign='left';
    ctx.fillText('conserved quantity', x0, 76);
    ctx.textAlign='center';
    ctx.fillText('before', x1, 76); ctx.fillText('after', x2, 76); ctx.fillText('', x3, 76);
    ctx.strokeStyle='#e7e4dc'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(x0,84); ctx.lineTo(w*0.92,84); ctx.stroke();
    rows.forEach((r,i)=>{
      const y=104+i*22;
      ctx.textAlign='left'; ctx.fillStyle='#5a5d63'; ctx.fillText(r.lab, x0, y);
      ctx.textAlign='center'; ctx.fillStyle='#1c1d20';
      ctx.fillText(fmtQ(r.a), x1, y); ctx.fillText(fmtQ(r.b), x2, y);
      ctx.textAlign='left';
      if(r.ok){ ctx.fillStyle='#1f6f78'; ctx.fillText('conserved', x3, y); }
      else if(!r.strict && Math.abs(r.d)<=1){ ctx.fillStyle='#8a6d1f';
        ctx.fillText(`changes by ${sgn(r.d)} — weak decays may`, x3, y); }
      else { ctx.fillStyle='#a4342c'; ctx.fillText(`violated by ${sgn(r.d)}`, x3, y); }
    });
    const ey=104+rows.length*22;
    ctx.textAlign='left'; ctx.fillStyle='#5a5d63'; ctx.fillText('rest mass (MeV)', x0, ey);
    ctx.textAlign='center'; ctx.fillStyle='#1c1d20';
    ctx.fillText(fmt(mIn,2), x1, ey); ctx.fillText(fmt(mOut,2), x2, ey);
    ctx.textAlign='left';
    ctx.fillStyle=energyOk?'#1f6f78':'#a4342c';
    ctx.fillText(energyOk ? (inK.length>1?'a collision can supply the difference':`Q = ${fmt(mIn-mOut,2)} MeV released`)
                          : `needs ${fmt(mOut-mIn,2)} MeV it does not have`, x3, ey);
    ctx.restore();

    // the verdict
    const broken=rows.filter(r=>!r.ok&&r.strict);
    const sChange=rows.find(r=>r.k==='S'&&!r.ok);
    let verdict, col;
    if(broken.length){ verdict='FORBIDDEN — '+broken.map(r=>r.lab).join(', ')+' not conserved'; col='#a4342c'; }
    else if(!energyOk){ verdict='FORBIDDEN — not enough rest energy'; col='#a4342c'; }
    else if(sChange && Math.abs(sChange.d)>1){ verdict='FORBIDDEN — strangeness cannot change by more than 1'; col='#a4342c'; }
    else if(sChange){ verdict='ALLOWED, but only through the weak interaction (ΔS = ±1)'; col='#8a6d1f'; }
    else { verdict='ALLOWED — every rule holds'; col='#1f6f78'; }
    ctx.save(); ctx.font='bold 14px Helvetica,Arial,sans-serif'; ctx.fillStyle=col; ctx.textAlign='center';
    ctx.fillText(verdict, w/2, h-18);
    ctx.restore();

    readout.innerHTML = `
      <div>reaction <b>${eq}</b></div>
      ${rows.map(r=>`<div>${r.lab}: ${fmtQ(r.a)} → ${fmtQ(r.b)}
        <span class="badge ${r.ok?'ok':(r.strict?'no':'')}">${r.ok?'conserved':sgn(r.d)}</span></div>`).join('')}
      <div>rest mass ${fmt(mIn,2)} → ${fmt(mOut,2)} MeV
        <span class="badge ${energyOk?'ok':'no'}">${inK.length>1?'collision':(mIn>=mOut?'Q = '+fmt(mIn-mOut,2)+' MeV':'short')}</span></div>
      <div><b>${verdict}</b></div>`;
  }

  presetEl.addEventListener('change',()=>{
    const P=PRESETS[presetEl.value];
    slots[0].value=P.in[0]; slots[1].value=P.in[1]||'';
    slots[2].value=P.out[0]; slots[3].value=P.out[1]||''; slots[4].value=P.out[2]||'';
    draw();
  });
  slots.forEach(s=>s.addEventListener('change',draw));
  // start on the preset
  const P0=PRESETS.ndecay;
  slots[0].value=P0.in[0]; slots[1].value='';
  slots[2].value=P0.out[0]; slots[3].value=P0.out[1]; slots[4].value=P0.out[2];
  registerCanvas('cn_canvas',draw);
}

/* =====================================================================
   5. QUARKS: BUILD A HADRON
   ===================================================================== */
function setupQuarkModel(){
  const buildCanvas=document.getElementById('qm_canvas');
  const latCanvas=document.getElementById('qm_lattice');
  const qEls=['qm_q1','qm_q2','qm_q3'].map(id=>document.getElementById(id));
  const typeEl=document.getElementById('qm_type');
  const readout=document.getElementById('qm_readout');

  qEls.forEach((sel,i)=>{
    Object.keys(QUARKS).forEach(k=>{
      const o=document.createElement('option'); o.value=k; o.textContent=QUARKS[k].sym; sel.appendChild(o);
      const o2=document.createElement('option'); o2.value='~'+k; o2.textContent=QUARKS[k].sym+'̄'; sel.appendChild(o2);
    });
    sel.value=['u','u','d'][i];
  });

  function qProps(code){
    const anti=code[0]==='~';
    const q=QUARKS[anti?code.slice(1):code];
    return {sym:q.sym+(anti?'̄':''), m:q.m, q:(anti?-1:1)*q.q, S:(anti?-1:1)*q.S,
            B:(anti?-1:1)/3, name:(anti?'anti-':'')+q.name};
  }

  // the spin-1/2 octet and the spin-3/2 decuplet, positioned by Gell-Mann–Nishijima
  const OCTET=[['p',0.5,0,938.27],['n',-0.5,0,939.57],['Σ⁺',1,-1,1189.4],['Σ⁰',0,-1,1192.6],
               ['Λ⁰',0,-1,1115.7],['Σ⁻',-1,-1,1197.4],['Ξ⁰',0.5,-2,1314.9],['Ξ⁻',-0.5,-2,1321.7]];
  const DECUPLET=[['Δ⁺⁺',1.5,0,1232],['Δ⁺',0.5,0,1232],['Δ⁰',-0.5,0,1232],['Δ⁻',-1.5,0,1232],
                  ['Σ*⁺',1,-1,1385],['Σ*⁰',0,-1,1385],['Σ*⁻',-1,-1,1385],
                  ['Ξ*⁰',0.5,-2,1533],['Ξ*⁻',-0.5,-2,1533],['Ω⁻',0,-3,1672]];

  function drawLattice(){
    const {ctx,w,h}=fitCanvas(latCanvas);
    ctx.fillStyle='#fbfaf7'; ctx.fillRect(0,0,w,h);
    const m={l:56,r:18,t:30,b:40};
    const half=(w-m.l-m.r)/2;
    function panel(x0,rows,title,rmax){
      const X=i3=>x0+half/2+i3*(half*0.26);
      const Y=s=>m.t+16+(-s)*((h-m.t-m.b-24)/3.2);
      ctx.save(); ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle='#5a5d63';
      ctx.textAlign='center'; ctx.fillText(title, x0+half/2, m.t-10);
      ctx.font='10px Helvetica,Arial,sans-serif'; ctx.fillStyle='#b0aa9c'; ctx.textAlign='right';
      for(let s=0;s>=-3;s--){ ctx.fillText('S = '+s, x0+18, Y(s)+4); }
      ctx.restore();
      // group rows by strangeness and draw
      const seen={};
      rows.forEach(([lab,i3,s,mm])=>{
        (seen[s]=seen[s]||[]).push({lab,i3,mm});
      });
      ctx.save();
      Object.keys(seen).forEach(s=>{
        const list=seen[s];
        ctx.strokeStyle='#eee9df'; ctx.lineWidth=1.4;
        ctx.beginPath();
        ctx.moveTo(X(Math.min(...list.map(r=>r.i3))),Y(+s));
        ctx.lineTo(X(Math.max(...list.map(r=>r.i3))),Y(+s)); ctx.stroke();
      });
      // Λ⁰ and Σ⁰ sit at the same point — nudge them apart so both can be read
      const dup={};
      rows.forEach(([lab,i3,s])=>{ const k=i3+'_'+s; dup[k]=(dup[k]||0)+1; });
      const seenAt={};
      rows.forEach(([lab,i3,s,mm])=>{
        const k=i3+'_'+s;
        let off=0;
        if(dup[k]>1){ seenAt[k]=(seenAt[k]||0); off=(seenAt[k]-(dup[k]-1)/2)*0.34; seenAt[k]++; }
        const x=X(i3+off), y=Y(s);
        ctx.fillStyle= lab==='Ω⁻' ? '#a4342c' : '#1f6f78';
        ctx.beginPath(); ctx.arc(x,y,5.5,0,7); ctx.fill();
        ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle='#1c1d20'; ctx.textAlign='center';
        ctx.fillText(lab, x, y-10);
        ctx.font='9px Helvetica,Arial,sans-serif'; ctx.fillStyle='#9a9384';
        ctx.fillText(mm, x, y+18);
      });
      ctx.restore();
    }
    panel(m.l, OCTET, 'spin-½ baryon octet', 3);
    panel(m.l+half, DECUPLET, 'spin-3/2 baryon decuplet', 3);
    // the row spacings that predicted the Omega
    const rows=[1232,1385,1533,1672];
    const gaps=[rows[1]-rows[0],rows[2]-rows[1],rows[3]-rows[2]];
    const mean=(gaps[0]+gaps[1])/2;
    ctx.save(); ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle='#a4342c'; ctx.textAlign='right';
    ctx.fillText(`rows are evenly spaced: ${gaps[0]}, ${gaps[1]} MeV → Ω⁻ predicted at ${Math.round(1533+mean)}, found at 1672`,
      w-m.r-8, h-14);
    ctx.restore();
  }

  function drawBuild(){
    const {ctx,w,h}=fitCanvas(buildCanvas);
    ctx.fillStyle='#fbfaf7'; ctx.fillRect(0,0,w,h);
    const isBaryon = typeEl.value==='baryon';
    const n = isBaryon?3:2;
    const parts=[];
    for(let i=0;i<n;i++) parts.push(qProps(qEls[i].value));

    // the composite, drawn as a little cluster
    const cx=w/2, cy=h*0.46, R=42;
    ctx.save();
    ctx.strokeStyle='#ddd8cc'; ctx.lineWidth=2; ctx.setLineDash([4,4]);
    ctx.beginPath(); ctx.arc(cx,cy,R+26,0,7); ctx.stroke(); ctx.setLineDash([]);
    parts.forEach((p,i)=>{
      const a=-Math.PI/2 + i*2*Math.PI/n;
      const x=cx+R*Math.cos(a), y=cy+R*Math.sin(a);
      ctx.fillStyle = p.q>0 ? '#a4342c' : '#1f6f78';
      ctx.beginPath(); ctx.arc(x,y,20,0,7); ctx.fill();
      ctx.fillStyle='#fff'; ctx.font='bold 17px Georgia, serif'; ctx.textAlign='center';
      ctx.fillText(p.sym, x, y+6);
      ctx.fillStyle='#5a5d63'; ctx.font='11px Helvetica,Arial,sans-serif';
      ctx.fillText(fmtQ(p.q)+'e', x, y+36);
    });
    ctx.restore();
    const Q=parts.reduce((s,p)=>s+p.q,0);
    const B=parts.reduce((s,p)=>s+p.B,0);
    const S=parts.reduce((s,p)=>s+p.S,0);
    const M=parts.reduce((s,p)=>s+p.m,0);
    ctx.save(); ctx.font='13px Helvetica,Arial,sans-serif'; ctx.textAlign='center';
    ctx.fillStyle='#1c1d20';
    ctx.fillText(`Q = ${fmtQ(Q)}e     B = ${fmtQ(B)}     S = ${S}`, cx, h-42);
    ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle='#5a5d63';
    ctx.fillText(`constituent masses add to ${fmt(M*1000,0)} MeV/c²`, cx, h-22);
    ctx.textAlign='left'; ctx.fillStyle='#8a8d92';
    ctx.fillText(isBaryon?'three quarks — a baryon':'quark + antiquark — a meson', 14, 22);
    ctx.restore();
    return {Q,B,S,M,parts};
  }

  function draw(){
    const isBaryon = typeEl.value==='baryon';
    qEls[2].parentElement.style.opacity = isBaryon?'1':'0.35';
    qEls[2].disabled = !isBaryon;
    const r=drawBuild();
    drawLattice();
    // does this match a known hadron?
    let match=null;
    P13_KEYS.forEach(k=>{
      const p=P13[k];
      if(!p.quarks) return;
      const want=isBaryon?'baryon':'meson';
      if(p.cls!==want) return;
      if(Math.abs(p.q-r.Q)<1e-6 && Math.abs(p.B-r.B)<1e-6 && p.S===r.S){
        if(!match||Math.abs(p.m-r.M*1000)<Math.abs(match.m-r.M*1000)) match=p;
      }
    });
    const err = match ? (r.M*1000-match.m)/match.m*100 : null;
    readout.innerHTML = `
      <div>content <b>${r.parts.map(p=>p.sym).join(' ')}</b></div>
      <div>charge = sum of quark charges <b>${fmtQ(r.Q)}e</b>
        <span class="badge ${Math.abs(r.Q-Math.round(r.Q))<1e-6?'ok':'no'}">${Math.abs(r.Q-Math.round(r.Q))<1e-6?'a whole number, as every hadron must be':'not a whole number — impossible'}</span></div>
      <div>baryon number <b>${fmtQ(r.B)}</b>, strangeness <b>${r.S}</b></div>
      <div>constituent masses add to <b>${fmt(r.M*1000,0)} MeV/c²</b></div>
      ${match?`<div>this is <b>${match.sym}</b>, measured at <b>${fmt(match.m,1)} MeV/c²</b>
        <span class="badge ${Math.abs(err)<12?'ok':'no'}">${err>0?'+':''}${fmt(err,1)}%</span></div>`
             :`<div>no hadron in Beiser's table has this combination of Q, B and S</div>`}
      <div>${isBaryon?'three spin-½ quarks give a half-integral total spin — baryons are fermions'
                     :'a quark and an antiquark give integral spin — mesons are bosons'}</div>
      <div>charges of ±1/3 and ±2/3 appear nowhere else in nature, and they always combine so the
        hadron comes out at 0 or ±1</div>`;
  }
  qEls.forEach(s=>s.addEventListener('change',draw));
  typeEl.addEventListener('change',draw);
  registerCanvas('qm_canvas',draw);
  registerCanvas('qm_lattice',draw);
}

/* =====================================================================
   6. CONFINEMENT AND THE COLOUR FORCE
   ===================================================================== */
function setupConfinement(){
  const canvas=document.getElementById('cf_canvas');
  const rEl=document.getElementById('cf_r'), rVal=document.getElementById('cf_r_val');
  const kEl=document.getElementById('cf_k'), kVal=document.getElementById('cf_k_val');
  const readout=document.getElementById('cf_readout');

  // the Cornell potential: a Coulomb-like short-range part plus a linear
  // confining term V = -(4/3) alpha_s / r + k r, with alpha_s ~ 0.3
  const ALPHA_S=0.3;
  function V(r,k){ return -(4/3)*ALPHA_S*HBARC_MF/1000/r + k*r; }   // GeV, r in fm

  function draw(){
    const {ctx,w,h}=fitCanvas(canvas);
    const r=parseFloat(rEl.value), k=parseFloat(kEl.value);
    rVal.textContent=fmt(r,2); kVal.textContent=fmt(k,2);

    const m={l:66,r:18,t:22,b:42};
    const rmax=2.2;
    const {X,Y}=drawAxes(ctx,w,h,m,0,rmax,-1.2,2.4,'separation of the quarks (fm)',
      'potential energy (GeV)',{nx:5,ny:6,xfmt:v=>v.toFixed(1),yfmt:v=>v.toFixed(1)});
    plotLine(ctx,X,Y,[{x:0,y:0},{x:rmax,y:0}],'#c9c4b8',1.2);

    const pts=[],coul=[],lin=[];
    for(let x=0.04;x<=rmax;x+=0.005){
      const v=V(x,k);
      pts.push({x,y:v>2.4?null:v});
      coul.push({x,y:Math.max(-1.2,-(4/3)*ALPHA_S*HBARC_MF/1000/x)});
      lin.push({x,y:k*x});
    }
    plotLine(ctx,X,Y,coul,'#1f6f78',1.8,[5,4]);
    plotLine(ctx,X,Y,lin,'#8a6d1f',1.8,[5,4]);
    plotLine(ctx,X,Y,pts,'#a4342c',2.8);

    // where the stored energy pays for a new quark-antiquark pair
    const mPi=2*0.13957;
    const rBreak=mPi/k;
    if(rBreak<rmax){
      ctx.save(); ctx.fillStyle='rgba(164,52,44,0.10)';
      ctx.fillRect(X(rBreak),m.t,X(rmax)-X(rBreak),Y(-1.2)-m.t); ctx.restore();
      plotLine(ctx,X,Y,[{x:rBreak,y:-1.2},{x:rBreak,y:2.4}],'#a4342c',1.6,[4,3]);
      ctx.save(); ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle='#a4342c'; ctx.textAlign='left';
      ctx.fillText(`past here the string can pay for a new pair`, X(rBreak)+6, m.t+44);
      ctx.restore();
    }
    plotLine(ctx,X,Y,[{x:0,y:mPi},{x:rmax,y:mPi}],'#ddd8cc',1.4);
    dotAt(ctx,X,Y,r,Math.min(2.4,V(r,k)),'#1c1d20',6);

    ctx.save(); ctx.font='11px Helvetica,Arial,sans-serif'; ctx.textAlign='right';
    ctx.fillStyle='#1f6f78'; ctx.fillText('the short-range part, like a Coulomb attraction', w-m.r-8, m.t+14);
    ctx.fillStyle='#8a6d1f'; ctx.fillText('the confining part — energy grows without limit', w-m.r-8, m.t+29);
    ctx.fillStyle='#a4342c'; ctx.fillText('their sum', w-m.r-8, m.t+44);
    ctx.textAlign='left'; ctx.fillStyle='#9a9384';
    ctx.fillText('2m_π c² — the cost of a new pion', m.l+10, Y(mPi)-5);
    ctx.restore();

    const stored=Math.max(0,k*r);
    const nPairs=Math.floor(stored/mPi);
    readout.innerHTML = `
      <div>string tension k <b>${fmt(k,2)} GeV/fm</b> = <b>${fmtSci(k*1e9*EV_J/1e-15,2)} N</b>
        — about <b>${fmt(k*1e9*EV_J/1e-15/9.81,1)} kg</b> of weight, between two point particles</div>
      <div>separation <b>${fmt(r,2)} fm</b> → the string holds <b>${fmt(stored,3)} GeV</b></div>
      <div>a new quark–antiquark pair costs at least <b>${fmt(mPi,3)} GeV</b> (two pions)</div>
      <div>the string snaps at r = 2m<sub>π</sub>c²/k = <b>${fmt(mPi/k,3)} fm</b></div>
      <div>at this separation the stored energy would buy <b>${nPairs}</b> new pair${nPairs===1?'':'s'}
        <span class="badge ${nPairs>0?'no':'ok'}">${nPairs>0?'the string breaks — you get mesons, not a free quark':'still one hadron'}</span></div>
      <div>pull harder and you do not free a quark; you make more hadrons. This is why no isolated
        quark has ever been seen, and why finding one would <em>disprove</em> the theory</div>
      <div>compare an electron and proton: their attraction <b>falls</b> as 1/r², so they separate freely.
        The colour force does the opposite, and that one sign is the whole difference</div>`;
  }
  rEl.addEventListener('input',draw);
  kEl.addEventListener('input',draw);
  registerCanvas('cf_canvas',draw);
}

/* =====================================================================
   7. FIELD BOSONS AND ELECTROWEAK UNIFICATION
   ===================================================================== */
function setupBosons(){
  const rangeCanvas=document.getElementById('fb_canvas');
  const ewCanvas=document.getElementById('fb_ew');
  const eEl=document.getElementById('fb_e'), eVal=document.getElementById('fb_e_val');
  const readout=document.getElementById('fb_readout');

  const BOSONS=[
    {sym:'γ',     name:'photon',  m:0,      inter:'electromagnetic', col:'#1f6f78'},
    {sym:'g',     name:'gluon',   m:0,      inter:'colour (strong)', col:'#a4342c'},
    {sym:'π',     name:'pion',    m:139.57, inter:'strong, between nucleons', col:'#c2701f'},
    {sym:'W±',    name:'W boson', m:80379,  inter:'weak', col:'#8a6d1f'},
    {sym:'Z⁰',    name:'Z boson', m:91188,  inter:'weak', col:'#5b3f8a'},
    {sym:'H',     name:'Higgs',   m:125250, inter:'gives mass', col:'#4a8fa8'}
  ];
  const MW=80.379;   // GeV

  function drawRange(){
    const {ctx,w,h}=fitCanvas(rangeCanvas);
    const m={l:66,r:18,t:26,b:42};
    const {X,Y}=drawAxes(ctx,w,h,m,-1,6,-4,3,'log₁₀ of the mediator mass (MeV/c²)',
      'log₁₀ of the range (fm)',{nx:7,ny:7,xfmt:v=>v.toFixed(0),yfmt:v=>v.toFixed(0)});
    // range = hbar c / mc^2
    const pts=[];
    for(let lg=-1;lg<=6;lg+=0.02) pts.push({x:lg,y:Math.log10(HBARC_MF/Math.pow(10,lg))});
    plotLine(ctx,X,Y,pts.filter(p=>p.y>-4&&p.y<3),'#1c1d20',2.4);
    ctx.save(); ctx.font='11px Helvetica,Arial,sans-serif';
    BOSONS.forEach(b=>{
      if(b.m<=0){
        ctx.fillStyle=b.col; ctx.textAlign='left';
        ctx.fillText(`${b.sym} — massless, so the range is infinite`, m.l+10, m.t+14+(b.sym==='g'?15:0));
        return;
      }
      const x=Math.log10(b.m), y=Math.log10(HBARC_MF/b.m);
      dotAt(ctx,X,Y,x,y,b.col,6);
      ctx.fillStyle=b.col; ctx.textAlign='left';
      ctx.fillText(`${b.sym}  ${HBARC_MF/b.m>0.01?fmt(HBARC_MF/b.m,2):fmtSci(HBARC_MF/b.m,2)} fm`, X(x)+10, Y(y)+4);
    });
    ctx.textAlign='right'; ctx.fillStyle='#5a5d63';
    ctx.fillText('range × mass = ℏc = 197 MeV·fm, always', w-m.r-8, m.t-8);
    ctx.restore();
  }

  // why the weak interaction looks weak: the propagator suppression q^2/(q^2+M_W^2)
  function drawEW(){
    const {ctx,w,h}=fitCanvas(ewCanvas);
    const E=parseFloat(eEl.value);
    const m={l:66,r:18,t:26,b:42};
    const {X,Y}=drawAxes(ctx,w,h,m,-3,3.5,-22,1,'log₁₀ of the collision energy (GeV)',
      'log₁₀ of the interaction strength, relative to electromagnetic',
      {nx:6,ny:6,xfmt:v=>v.toFixed(0),yfmt:v=>v.toFixed(0)});
    plotLine(ctx,X,Y,[{x:-3,y:0},{x:3.5,y:0}],'#1f6f78',2.4);
    const pts=[];
    for(let lg=-3;lg<=3.5;lg+=0.01){
      const q=Math.pow(10,lg);
      const s=Math.pow(q*q/(q*q+MW*MW),2);
      pts.push({x:lg,y:Math.log10(s)});
    }
    plotLine(ctx,X,Y,pts.filter(p=>p.y>-22),'#8a6d1f',2.8);
    plotLine(ctx,X,Y,[{x:Math.log10(MW),y:-22},{x:Math.log10(MW),y:1}],'#ddd8cc',1.6,[4,3]);
    const s=Math.pow(E*E/(E*E+MW*MW),2);
    if(Math.log10(s)>-22) dotAt(ctx,X,Y,Math.log10(E),Math.log10(s),'#1c1d20',6);
    ctx.save(); ctx.font='11px Helvetica,Arial,sans-serif'; ctx.textAlign='left';
    ctx.fillStyle='#1f6f78'; ctx.fillText('electromagnetic', m.l+10, Y(0)-7);
    ctx.fillStyle='#8a6d1f'; ctx.fillText('weak', X(-1.6), Y(-9)-7);
    ctx.fillStyle='#9a9384'; ctx.textAlign='right';
    ctx.fillText('M_W c² = 80 GeV', X(Math.log10(MW))-6, Y(-16));
    ctx.textAlign='left';
    ctx.textAlign='right'; ctx.fillStyle='#5a5d63';
    ctx.fillText('the two become one interaction once the collision can make a real W', w-m.r-8, m.t-8);
    ctx.restore();
  }

  function draw(){
    const E=parseFloat(eEl.value);
    eVal.textContent=E<1?fmt(E,4):fmt(E,2);
    drawRange(); drawEW();
    const s=Math.pow(E*E/(E*E+MW*MW),2);
    readout.innerHTML = `
      <div>collision energy <b>${E<1?fmt(E*1000,2)+' MeV':fmt(E,2)+' GeV'}</b></div>
      <div>weak strength relative to electromagnetic <b>${fmtSci(s,2)}</b></div>
      <div>at nuclear energies (~1 MeV) that ratio is about <b>${fmtSci(Math.pow(1e-3*1e-3/(1e-3*1e-3+MW*MW),2),1)}</b>
        — which is the whole reason the weak interaction is called weak</div>
      <div>it is not intrinsically feeble. Its coupling is comparable to the electromagnetic one; the
        suppression is entirely the mass of the W, which makes the exchange enormously improbable
        at low energy</div>
      <div>W range ℏc/M<sub>W</sub>c² <b>${fmtSci(HBARC_MF/80379,3)} fm</b> — about a thousandth of a proton</div>
      <div>photon and gluon are massless, so their ranges are infinite. The strong force is nonetheless
        short-ranged, but for a different reason — confinement, not mass</div>
      <div>at <b>${fmt(MW,0)} GeV</b> the curves meet: above that the weak and electromagnetic
        interactions are one <b>electroweak</b> interaction, and this is what the colliders that found
        the W and Z in 1983 were built to reach</div>`;
  }
  eEl.addEventListener('input',draw);
  registerCanvas('fb_canvas',draw);
  registerCanvas('fb_ew',draw);
}

/* =====================================================================
   8. THE HISTORY OF THE UNIVERSE
   ===================================================================== */
function setupCosmology(){
  const histCanvas=document.getElementById('co_canvas');
  const fateCanvas=document.getElementById('co_fate');
  const tEl=document.getElementById('co_t'), tVal=document.getElementById('co_t_val');
  const hEl=document.getElementById('co_h'), hVal=document.getElementById('co_h_val');
  const dEl=document.getElementById('co_d'), dVal=document.getElementById('co_d_val');
  const readout=document.getElementById('co_readout');

  // radiation era: kT ~ 1 MeV at t ~ 1 s, falling as t^(-1/2)
  function tempAt(t){ return 1.5e10/Math.sqrt(t); }   // kelvin
  const EPOCHS=[
    {t:1.35e-43, lab:'Planck time'},
    {t:1e-35,    lab:'strong separates'},
    {t:1e-10,    lab:'weak separates'},
    {t:1e-6,     lab:'quarks → hadrons'},
    {t:1,        lab:'neutrinos decouple'},
    {t:300,      lab:'helium forms'},
    {t:1.1e13,   lab:'atoms form'},
    {t:4.3e17,   lab:'now'}
  ];

  function drawHistory(){
    const {ctx,w,h}=fitCanvas(histCanvas);
    const logt=parseFloat(tEl.value);
    const m={l:66,r:18,t:26,b:42};
    const {X,Y}=drawAxes(ctx,w,h,m,-44,18,-1,33,'log₁₀ of the time since the Big Bang (s)',
      'log₁₀ of the temperature (K)',{nx:6,ny:6,xfmt:v=>v.toFixed(0),yfmt:v=>v.toFixed(0)});
    const pts=[];
    for(let lg=-44;lg<=18;lg+=0.1) pts.push({x:lg,y:Math.log10(tempAt(Math.pow(10,lg)))});
    plotLine(ctx,X,Y,pts,'#a4342c',2.8);
    ctx.save(); ctx.font='10px Helvetica,Arial,sans-serif';
    EPOCHS.forEach((e,i)=>{
      const x=Math.log10(e.t), y=Math.log10(tempAt(e.t));
      plotLine(ctx,X,Y,[{x,y:-1},{x,y:33}],'#efe9df',1.2);
      dotAt(ctx,X,Y,x,y,'#1f6f78',4);
      ctx.save();
      ctx.translate(X(x)-4, Y(y)-12); ctx.rotate(-Math.PI/3);
      ctx.fillStyle='#8a8d92'; ctx.textAlign='left'; ctx.fillText(e.lab, 0, 0);
      ctx.restore();
    });
    ctx.restore();
    plotLine(ctx,X,Y,[{x:logt,y:-1},{x:logt,y:33}],'#1c1d20',1.4,[3,3]);
    const T=tempAt(Math.pow(10,logt));
    if(Math.log10(T)<33) dotAt(ctx,X,Y,logt,Math.log10(T),'#1c1d20',6);
    ctx.save(); ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle='#5a5d63'; ctx.textAlign='right';
    ctx.fillText('T ∝ t^(−½) — the whole radiation era on one line', w-m.r-8, m.t-8);
    ctx.restore();
  }

  function drawFate(){
    const {ctx,w,h}=fitCanvas(fateCanvas);
    const Hkm=parseFloat(hEl.value), omega=parseFloat(dEl.value);
    const m={l:66,r:18,t:26,b:42};
    const {X,Y}=drawAxes(ctx,w,h,m,0,3,0,2.4,'time (in units of the present age)',
      'relative size of the universe',{nx:6,ny:6,xfmt:v=>v.toFixed(1),yfmt:v=>v.toFixed(1)});
    // three schematic histories, distinguished by Omega
    [[0.4,'#1f6f78','open — expands forever'],
     [1.0,'#8a6d1f','flat — just barely coasts to a stop'],
     [2.5,'#a4342c','closed — recollapses']].forEach(([om,col,lab])=>{
      const pts=[];
      for(let t=0;t<=3;t+=0.005){
        let a;
        if(om<1)      a=Math.pow(t,0.85);
        else if(om===1) a=Math.pow(t,2/3);
        else { const u=Math.PI*t/2.1; a= u<Math.PI ? 1.15*Math.sin(u) : null; }
        if(a!=null&&a<=2.4) pts.push({x:t,y:a});
      }
      const on=Math.abs(omega-om)<0.35;
      plotLine(ctx,X,Y,pts,on?col:'#ddd8cc',on?2.8:1.6);
      if(on){ ctx.save(); ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle=col;
        ctx.textAlign='left'; ctx.fillText(lab, m.l+10, m.t+14); ctx.restore(); }
    });
    plotLine(ctx,X,Y,[{x:1,y:0},{x:1,y:2.4}],'#ddd8cc',1.4,[4,3]);
    ctx.save(); ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle='#8a8d92'; ctx.textAlign='center';
    ctx.fillText('now', X(1), m.t+14);
    ctx.textAlign='right'; ctx.fillStyle='#5a5d63';
    ctx.fillText('which curve we are on depends on one number: ρ/ρ_c', w-m.r-8, m.t-8);
    ctx.restore();
  }

  function draw(){
    const logt=parseFloat(tEl.value), Hkm=parseFloat(hEl.value), omega=parseFloat(dEl.value);
    tVal.textContent='10^'+fmt(logt,1);
    hVal.textContent=fmt(Hkm,0);
    dVal.textContent=fmt(omega,2);
    drawHistory(); drawFate();
    const t=Math.pow(10,logt), T=tempAt(t);
    const kT=K_EV_11*T;
    const Hsi=Hkm*1e3/MLY_M;
    const rhoC=3*Hsi*Hsi/(8*Math.PI*G_N);
    const lP=Math.sqrt(G_N*H_J/Math.pow(C_EXACT,3));
    const tP=Math.sqrt(G_N*H_J/Math.pow(C_EXACT,5));
    const age=1/Hsi;
    readout.innerHTML = `
      <div>at t = <b>${fmtSci(t,2)} s</b> the temperature was <b>${fmtSci(T,3)} K</b>,
        i.e. kT = <b>${kT>1e6?fmt(kT/1e6,3)+' MeV':(kT>1?fmt(kT,3)+' eV':fmtSci(kT,2)+' eV')}</b></div>
      <div>Planck length √(Gh/c³) <b>${fmtSci(lP,3)} m</b>, Planck time √(Gh/c⁵) <b>${fmtSci(tP,3)} s</b>
        — below these, no theory we have applies</div>
      <div>Hubble parameter <b>${fmt(Hkm,0)} km/s</b> per million light-years
        = ${fmt(Hkm*3.2616,0)} km/s/Mpc = <b>${fmtSci(Hsi,3)} s⁻¹</b></div>
      <div>critical density ρ<sub>c</sub> = 3H²/8πG <b>${fmtSci(rhoC,3)} kg/m³</b></div>
      <div>&nbsp;&nbsp;= <b>${fmt(rhoC/M_P,2)}</b> hydrogen atoms per cubic metre — the emptiest vacuum
        any laboratory has ever made is denser than that by a factor of 10¹⁰</div>
      <div>1/H <b>${fmt(age/SEC_YEAR/1e9,2)} billion years</b> — a first estimate of the age of the universe</div>
      <div>your ρ/ρ<sub>c</sub> = <b>${fmt(omega,2)}</b> →
        <b>${omega<0.98?'open: expands forever':(omega>1.02?'closed: ends in a Big Crunch':'flat: expands ever more slowly, never quite stopping')}</b></div>
      <div>the CMB is a blackbody at <b>2.7 K</b>, peaking at ${fmt(WIEN_B/2.7*1000,2)} mm — the
        most perfect blackbody spectrum ever measured, and it is the sky</div>`;
  }
  [tEl,hEl,dEl].forEach(e=>e.addEventListener('input',draw));
  registerCanvas('co_canvas',draw);
  registerCanvas('co_fate',draw);
}

// register with the loader in app.js
registerModule('setupInteractions', setupInteractions);
registerModule('setupParticleZoo', setupParticleZoo);
registerModule('setupAntimatter', setupAntimatter);
registerModule('setupConservation', setupConservation);
registerModule('setupQuarkModel', setupQuarkModel);
registerModule('setupConfinement', setupConfinement);
registerModule('setupBosons', setupBosons);
registerModule('setupCosmology', setupCosmology);
