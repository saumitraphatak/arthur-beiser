/* =====================================================================
   Concepts of Modern Physics — Interactive Companion
   Chapter 5: Quantum Mechanics
   Every number is computed live from the chapter's formulas.
   ===================================================================== */

// hbar^2 / 2m_e expressed in eV nm^2 — the workhorse constant of this chapter
const H2_2M = 0.0380998;

/* ---------- small numerical helpers ---------- */
function simpson(f, a, b, n){
  if(n%2) n++;
  const dx=(b-a)/n; let s=f(a)+f(b);
  for(let i=1;i<n;i++) s += f(a+i*dx)*(i%2?4:2);
  return s*dx/3;
}
function hermite(n,y){
  let hm=1, hc=2*y;
  if(n===0) return 1;
  for(let k=1;k<n;k++){ const nx=2*y*hc-2*k*hm; hm=hc; hc=nx; }
  return hc;
}

/* =====================================================================
   1. THE WAVE FUNCTION AND WHAT IT MEANS
   ===================================================================== */
function setupWaveFunction(){
  const canvas=document.getElementById('wf_canvas');
  const formEl=document.getElementById('wf_form');
  const x1El=document.getElementById('wf_x1'), x1Val=document.getElementById('wf_x1_val');
  const x2El=document.getElementById('wf_x2'), x2Val=document.getElementById('wf_x2_val');
  const readout=document.getElementById('wf_readout');

  // each is defined on [0,1]; normalisation is computed, never assumed
  const FORMS = {
    linear: {name:'ψ = ax   (Example 5.2)', f:x=>x},
    box:    {name:'ψ = sin πx   (box ground state)', f:x=>Math.sin(Math.PI*x)},
    box2:   {name:'ψ = sin 2πx   (first excited)', f:x=>Math.sin(2*Math.PI*x)},
    gauss:  {name:'ψ = Gaussian at the centre', f:x=>Math.exp(-Math.pow((x-0.5)/0.16,2)/2)}
  };

  function physics(){
    const F = FORMS[formEl.value];
    let x1=parseFloat(x1El.value), x2=parseFloat(x2El.value);
    if(x2<x1){ const t=x1; x1=x2; x2=t; }
    const norm = simpson(x=>F.f(x)*F.f(x), 0, 1, 2000);   // integral of |psi|^2
    const A = 1/Math.sqrt(norm);                          // normalisation constant
    const P = simpson(x=>A*A*F.f(x)*F.f(x), x1, x2, 1200);
    const xAvg = simpson(x=>x*A*A*F.f(x)*F.f(x), 0, 1, 2000);
    const x2Avg = simpson(x=>x*x*A*A*F.f(x)*F.f(x), 0, 1, 2000);
    const dx = Math.sqrt(Math.max(0, x2Avg - xAvg*xAvg));
    return {F,A,x1,x2,P,xAvg,x2Avg,dx};
  }

  function draw(){
    const {ctx,w,h}=fitCanvas(canvas);
    const p = physics();
    x1Val.textContent=fmt(p.x1,2); x2Val.textContent=fmt(p.x2,2);
    ctx.clearRect(0,0,w,h);
    const m={l:52,r:18,t:24,b:36};
    const X = x => m.l + x*(w-m.l-m.r);
    const mid = m.t + (h-m.t-m.b)*0.40;
    const psiAmp = (h-m.t-m.b)*0.30;
    const dens0 = h-m.b;
    const densAmp = (h-m.b-mid)*0.86;

    let pkPsi=0, pkD=0;
    for(let i=0;i<=400;i++){ const x=i/400, v=p.A*p.F.f(x); pkPsi=Math.max(pkPsi,Math.abs(v)); pkD=Math.max(pkD,v*v); }

    // the selected region, shaded under the density
    ctx.fillStyle='rgba(31,111,120,0.18)';
    ctx.beginPath(); ctx.moveTo(X(p.x1),dens0);
    for(let x=p.x1;x<=p.x2;x+=0.002){
      const v=p.A*p.F.f(x);
      ctx.lineTo(X(x), dens0 - densAmp*v*v/pkD);
    }
    ctx.lineTo(X(p.x2),dens0); ctx.closePath(); ctx.fill();

    // axes
    ctx.strokeStyle='#e0dbd0'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(m.l,mid); ctx.lineTo(w-m.r,mid); ctx.stroke();
    ctx.strokeStyle='#1c1d20'; ctx.lineWidth=1.3;
    ctx.beginPath(); ctx.moveTo(m.l,dens0); ctx.lineTo(w-m.r,dens0); ctx.stroke();

    // psi itself
    ctx.strokeStyle='#a4342c'; ctx.lineWidth=2.4; ctx.beginPath();
    for(let i=0;i<=600;i++){
      const x=i/600, y=mid - psiAmp*p.A*p.F.f(x)/pkPsi;
      if(i===0) ctx.moveTo(X(x),y); else ctx.lineTo(X(x),y);
    }
    ctx.stroke();
    // |psi|^2
    ctx.strokeStyle='#1f6f78'; ctx.lineWidth=2.4; ctx.beginPath();
    for(let i=0;i<=600;i++){
      const x=i/600, v=p.A*p.F.f(x), y=dens0 - densAmp*v*v/pkD;
      if(i===0) ctx.moveTo(X(x),y); else ctx.lineTo(X(x),y);
    }
    ctx.stroke();

    // expectation value
    ctx.strokeStyle='#1c1d20'; ctx.lineWidth=1.6; ctx.setLineDash([4,3]);
    ctx.beginPath(); ctx.moveTo(X(p.xAvg),mid-psiAmp); ctx.lineTo(X(p.xAvg),dens0); ctx.stroke();
    ctx.setLineDash([]);
    ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle='#1c1d20'; ctx.textAlign='center';
    ctx.fillText(`⟨x⟩ = ${fmt(p.xAvg,3)}`, X(p.xAvg), mid-psiAmp-6);

    ctx.textAlign='left'; ctx.fillStyle='#a4342c';
    ctx.fillText('ψ  — not itself observable', m.l+6, m.t+12);
    ctx.fillStyle='#1f6f78';
    ctx.fillText('|ψ|²  — the probability density, which is', m.l+6, mid+16);
    ctx.fillStyle='#8a8d92'; ctx.textAlign='center';
    [0,0.25,0.5,0.75,1].forEach(x=>{ ctx.fillText(x.toFixed(2), X(x), dens0+16); });
    ctx.fillStyle='#1c1d20'; ctx.fillText('x', m.l+(w-m.l-m.r)/2, h-6);

    readout.innerHTML = `
      <div>&int;|&psi;|&sup2;dx before normalising <b>${fmt(1/(p.A*p.A),4)}</b></div>
      <div>normalisation constant <b>${fmt(p.A,4)}</b></div>
      <div>region <b>${fmt(p.x1,2)} &rarr; ${fmt(p.x2,2)}</b></div>
      <div>P(found in region) <b>${fmt(p.P*100,2)}%</b></div>
      <div>classical guess (uniform) <b>${fmt((p.x2-p.x1)*100,2)}%</b></div>
      <div>&lang;x&rang; <b>${fmt(p.xAvg,4)}</b></div>
      <div>&lang;x&sup2;&rang; <b>${fmt(p.x2Avg,4)}</b></div>
      <div>&Delta;x = &radic;(&lang;x&sup2;&rang;&minus;&lang;x&rang;&sup2;) <b>${fmt(p.dx,4)}</b></div>`;
  }
  formEl.addEventListener('change',draw);
  x1El.addEventListener('input',draw);
  x2El.addEventListener('input',draw);
  registerCanvas('wf_canvas',draw);
}

/* =====================================================================
   2. PARTICLE IN A BOX, SOLVED PROPERLY
   ===================================================================== */
function setupQuantumBox(){
  const cWave=document.getElementById('qb_canvas');
  const cProb=document.getElementById('qb_canvas_prob');
  const nEl=document.getElementById('qb_n'), nVal=document.getElementById('qb_n_val');
  const LEl=document.getElementById('qb_L'), LVal=document.getElementById('qb_L_val');
  const readout=document.getElementById('qb_readout');
  const X1=0.45, X2=0.55;                       // Beiser's Example 5.4 window

  function En(n,L){ return n*n*Math.PI*Math.PI*H2_2M/(L*L); }   // eV, electron
  // P between fractions a and b of the box, analytically
  function prob(n,a,b){
    const F = u => u - Math.sin(2*n*Math.PI*u)/(2*n*Math.PI);
    return F(b)-F(a);
  }

  function drawWave(){
    const {ctx,w,h}=fitCanvas(cWave);
    const n=parseInt(nEl.value,10);
    ctx.clearRect(0,0,w,h);
    const m={l:46,r:22,t:22,b:30};
    const X=u=>m.l+u*(w-m.l-m.r);
    const mid=m.t+(h-m.t-m.b)*0.32, amp=(h-m.t-m.b)*0.26;
    const d0=h-m.b, dA=(h-m.b-mid)*0.82;

    // walls
    ctx.fillStyle='#efebe2'; ctx.fillRect(m.l-16,m.t,16,h-m.t-m.b); ctx.fillRect(w-m.r,m.t,16,h-m.t-m.b);
    ctx.strokeStyle='#1c1d20'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(m.l,m.t); ctx.lineTo(m.l,h-m.b); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(w-m.r,m.t); ctx.lineTo(w-m.r,h-m.b); ctx.stroke();
    ctx.strokeStyle='#e0dbd0'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(m.l,mid); ctx.lineTo(w-m.r,mid); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(m.l,d0); ctx.lineTo(w-m.r,d0); ctx.stroke();

    // psi_n and |psi_n|^2
    ctx.strokeStyle='#a4342c'; ctx.lineWidth=2.4; ctx.beginPath();
    for(let i=0;i<=700;i++){ const u=i/700, y=mid-amp*Math.sin(n*Math.PI*u);
      if(i===0) ctx.moveTo(X(u),y); else ctx.lineTo(X(u),y); }
    ctx.stroke();
    ctx.fillStyle='rgba(31,111,120,0.20)'; ctx.beginPath(); ctx.moveTo(X(0),d0);
    for(let i=0;i<=700;i++){ const u=i/700; ctx.lineTo(X(u), d0-dA*2*Math.pow(Math.sin(n*Math.PI*u),2)); }
    ctx.lineTo(X(1),d0); ctx.closePath(); ctx.fill();
    ctx.strokeStyle='#1f6f78'; ctx.lineWidth=2.2; ctx.beginPath();
    for(let i=0;i<=700;i++){ const u=i/700, y=d0-dA*2*Math.pow(Math.sin(n*Math.PI*u),2);
      if(i===0) ctx.moveTo(X(u),y); else ctx.lineTo(X(u),y); }
    ctx.stroke();
    // the classical prediction: equally likely anywhere
    ctx.strokeStyle='#8a8d92'; ctx.lineWidth=1.8; ctx.setLineDash([5,3]);
    ctx.beginPath(); ctx.moveTo(X(0),d0-dA); ctx.lineTo(X(1),d0-dA); ctx.stroke(); ctx.setLineDash([]);

    // the Example 5.4 window
    ctx.fillStyle='rgba(164,52,44,0.13)'; ctx.fillRect(X(X1),m.t,X(X2)-X(X1),h-m.t-m.b);
    ctx.font='11px Helvetica,Arial,sans-serif'; ctx.textAlign='center'; ctx.fillStyle='#a4342c';
    ctx.fillText('0.45L → 0.55L', X((X1+X2)/2), h-m.b+16);
    ctx.textAlign='left';
    ctx.fillText(`ψ${n}`, m.l+6, m.t+12);
    ctx.fillStyle='#1f6f78'; ctx.fillText(`|ψ${n}|²`, m.l+6, mid+18);
    ctx.fillStyle='#8a8d92'; ctx.textAlign='right';
    ctx.fillText('classical: uniform', w-m.r-6, d0-dA-6);
  }

  function drawProb(){
    const {ctx,w,h}=fitCanvas(cProb);
    const n=parseInt(nEl.value,10);
    ctx.clearRect(0,0,w,h);
    const m={l:56,r:18,t:24,b:36};
    const {X,Y}=drawAxes(ctx,w,h,m,1,10,0,0.30,'quantum number n','P(0.45L → 0.55L)',
                         {nx:9,ny:3,xfmt:v=>v.toFixed(0),yfmt:v=>(v*100).toFixed(0)+'%'});
    plotLine(ctx,X,Y,[{x:1,y:0.10},{x:10,y:0.10}],'#8a8d92',1.8,[5,3]);
    const pts=[]; for(let k=1;k<=10;k++) pts.push({x:k,y:prob(k,X1,X2)});
    plotLine(ctx,X,Y,pts,'#a4342c',2.4);
    pts.forEach(pt=>dotAt(ctx,X,Y,pt.x,pt.y,pt.x===n?'#1c1d20':'#c7c2b5',pt.x===n?6:3.5));
    ctx.font='11px Helvetica,Arial,sans-serif'; ctx.textAlign='right'; ctx.fillStyle='#8a8d92';
    ctx.fillText('classical answer: 10%', w-m.r-8, Y(0.10)-7);
    ctx.fillStyle='#a4342c'; ctx.fillText('quantum answer, state by state', w-m.r-8, m.t+14);
  }

  function draw(){
    const n=parseInt(nEl.value,10);
    const L=parseFloat(LEl.value);
    nVal.textContent=n; LVal.textContent=fmt(L,2);
    drawWave(); drawProb();
    const P=prob(n,X1,X2);
    readout.innerHTML = `
      <div>quantum number n <b>${n}</b></div>
      <div>box width L <b>${fmt(L,2)} nm</b></div>
      <div>E<sub>n</sub> = n&sup2;&pi;&sup2;&#8463;&sup2;/2mL&sup2; <b>${fmt(En(n,L),3)} eV</b></div>
      <div>E&#8321; <b>${fmt(En(1,L),3)} eV</b></div>
      <div>nodes inside <b>${n-1}</b></div>
      <div>&lang;x&rang; <b>L/2</b> for every n</div>
      <div>P(0.45L&rarr;0.55L) <b>${fmt(P*100,2)}%</b></div>
      <div>classical expectation <b>10%</b>
        ${P>0.12?'<span class="badge no">far more likely</span>':(P<0.08?'<span class="badge no">far less likely</span>':'')}</div>`;
  }
  nEl.addEventListener('input',draw);
  LEl.addEventListener('input',draw);
  registerCanvas('qb_canvas',draw);
  registerCanvas('qb_canvas_prob',draw);
}

/* =====================================================================
   3. FINITE POTENTIAL WELL
   ===================================================================== */
function setupFiniteWell(){
  const canvas=document.getElementById('fw_canvas');
  const UEl=document.getElementById('fw_U'), UVal=document.getElementById('fw_U_val');
  const LEl=document.getElementById('fw_L'), LVal=document.getElementById('fw_L_val');
  const nEl=document.getElementById('fw_n'), nVal=document.getElementById('fw_n_val');
  const readout=document.getElementById('fw_readout');

  // Symmetric well of depth U0 and width L. With z = kL/2 and
  // z0 = (L/2)*sqrt(2mU0)/hbar, bound states satisfy
  //   even:  z tan z  = sqrt(z0^2 - z^2)
  //   odd:  -z cot z  = sqrt(z0^2 - z^2)
  function levels(U0,L){
    const z0 = (L/2)*Math.sqrt(U0/H2_2M);
    const out=[];
    const f = (z,even) => {
      const rhs = Math.sqrt(Math.max(0,z0*z0 - z*z));
      return even ? z*Math.tan(z) - rhs : -z/Math.tan(z) - rhs;
    };
    for(let branch=0; branch*Math.PI/2 < z0; branch++){
      const even = (branch%2===0);
      const lo = branch*Math.PI/2 + 1e-6;
      const hi = Math.min(z0, (branch+1)*Math.PI/2 - 1e-6);
      if(hi<=lo) continue;
      let a=lo,b=hi,fa=f(a,even),fb=f(b,even);
      if(!(isFinite(fa)&&isFinite(fb))) continue;
      if(fa*fb>0){ if(Math.abs(fb)<1e-9) {} else continue; }
      for(let i=0;i<80;i++){
        const mdd=(a+b)/2, fm=f(mdd,even);
        if(fa*fm<=0){ b=mdd; fb=fm; } else { a=mdd; fa=fm; }
      }
      const z=(a+b)/2, k=2*z/L;
      out.push({E:H2_2M*k*k, k, even, kappa:Math.sqrt(Math.max(0,(U0-H2_2M*k*k)/H2_2M))});
    }
    return {z0, list: out.sort((p,q)=>p.E-q.E)};
  }

  function draw(){
    const {ctx,w,h}=fitCanvas(canvas);
    const U0=parseFloat(UEl.value), L=parseFloat(LEl.value);
    UVal.textContent=fmt(U0,1); LVal.textContent=fmt(L,2);
    const {z0,list}=levels(U0,L);
    nEl.max=Math.max(1,list.length);
    let n=Math.min(parseInt(nEl.value,10), Math.max(1,list.length));
    nEl.value=n; nVal.textContent=n;
    const st=list[n-1];
    ctx.clearRect(0,0,w,h);

    const m={l:60,r:22,t:24,b:36};
    const halfSpan=L*1.9;
    const X=x=>m.l+(x+halfSpan)/(2*halfSpan)*(w-m.l-m.r);
    const Y=E=>h-m.b-(E/(U0*1.15))*(h-m.t-m.b);

    // the well itself
    ctx.strokeStyle='#1c1d20'; ctx.lineWidth=2.2;
    ctx.beginPath();
    ctx.moveTo(X(-halfSpan),Y(U0)); ctx.lineTo(X(-L/2),Y(U0)); ctx.lineTo(X(-L/2),Y(0));
    ctx.lineTo(X(L/2),Y(0)); ctx.lineTo(X(L/2),Y(U0)); ctx.lineTo(X(halfSpan),Y(U0));
    ctx.stroke();
    ctx.fillStyle='#f2efe7';
    ctx.fillRect(X(-halfSpan),Y(U0),X(-L/2)-X(-halfSpan),h-m.b-Y(U0));
    ctx.fillRect(X(L/2),Y(U0),X(halfSpan)-X(L/2),h-m.b-Y(U0));
    ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle='#5a5d63'; ctx.textAlign='left';
    ctx.fillText(`U₀ = ${fmt(U0,1)} eV`, X(-halfSpan)+6, Y(U0)-7);

    // every bound level, with the selected one drawn as a wave function
    list.forEach((s,i)=>{
      const on=(i===n-1);
      ctx.strokeStyle = on ? '#a4342c' : '#c7c2b5';
      ctx.lineWidth = on ? 2.2 : 1.3;
      ctx.beginPath(); ctx.moveTo(X(-L/2*1.6),Y(s.E)); ctx.lineTo(X(L/2*1.6),Y(s.E)); ctx.stroke();
      ctx.fillStyle = on ? '#a4342c' : '#8a8d92'; ctx.textAlign='right';
      ctx.fillText(`${fmt(s.E,2)} eV`, m.l-6, Y(s.E)+4);
    });

    if(st){
      const amp=(h-m.t-m.b)*0.15;
      const base=Y(st.E);
      const A = st.even ? Math.cos(st.k*L/2) : Math.sin(st.k*L/2);
      ctx.strokeStyle='#1f6f78'; ctx.lineWidth=2.6; ctx.beginPath();
      for(let i=0;i<=900;i++){
        const x=-halfSpan+2*halfSpan*i/900;
        let v;
        if(Math.abs(x)<=L/2){ v = st.even ? Math.cos(st.k*x) : Math.sin(st.k*x); }
        else { v = A*Math.sign(st.even?1:Math.sign(x))*Math.exp(-st.kappa*(Math.abs(x)-L/2)); }
        const y=base-amp*v;
        if(i===0) ctx.moveTo(X(x),y); else ctx.lineTo(X(x),y);
      }
      ctx.stroke();
      // highlight the part that leaks into the classically forbidden walls
      ctx.fillStyle='rgba(31,111,120,0.20)';
      [[-halfSpan,-L/2],[L/2,halfSpan]].forEach(([xa,xb])=>{
        ctx.beginPath(); ctx.moveTo(X(xa),base);
        for(let x=xa;x<=xb;x+=halfSpan/300){
          const v=A*Math.sign(st.even?1:Math.sign(x))*Math.exp(-st.kappa*(Math.abs(x)-L/2));
          ctx.lineTo(X(x),base-amp*v);
        }
        ctx.lineTo(X(xb),base); ctx.closePath(); ctx.fill();
      });
      ctx.fillStyle='#1f6f78'; ctx.textAlign='center'; ctx.font='11px Helvetica,Arial,sans-serif';
      ctx.fillText('ψ leaks into the walls', X(0), base-amp-9);
    }
    ctx.fillStyle='#8a8d92'; ctx.textAlign='center'; ctx.font='11px Helvetica,Arial,sans-serif';
    ctx.fillText(`well width L = ${fmt(L,2)} nm`, X(0), h-m.b+16);

    const Einf = n*n*Math.PI*Math.PI*H2_2M/(L*L);
    const pen = st ? 1/st.kappa : 0;
    readout.innerHTML = `
      <div>well depth U&#8320; <b>${fmt(U0,2)} eV</b></div>
      <div>well width L <b>${fmt(L,2)} nm</b></div>
      <div>bound states <b>${list.length}</b></div>
      <div>selected level E<sub>${n}</sub> <b>${st?fmt(st.E,3)+' eV':'—'}</b></div>
      <div>same level, infinite well <b>${fmt(Einf,3)} eV</b></div>
      <div>lowered by <b>${st?fmt((1-st.E/Einf)*100,1)+'%':'—'}</b></div>
      <div>penetration depth 1/&kappa; <b>${st?fmt(pen,4)+' nm':'—'}</b></div>
      <div>z&#8320; = (L/2)&radic;(2mU&#8320;)/&#8463; <b>${fmt(z0,3)}</b></div>`;
  }
  [UEl,LEl,nEl].forEach(el=>el.addEventListener('input',draw));
  registerCanvas('fw_canvas',draw);
}

/* =====================================================================
   4. THE TUNNEL EFFECT
   ===================================================================== */
function setupTunnel(){
  const cBar=document.getElementById('tn_canvas');
  const cT=document.getElementById('tn_canvas_t');
  const EEl=document.getElementById('tn_E'), EVal=document.getElementById('tn_E_val');
  const UEl=document.getElementById('tn_U'), UVal=document.getElementById('tn_U_val');
  const LEl=document.getElementById('tn_L'), LVal=document.getElementById('tn_L_val');
  const readout=document.getElementById('tn_readout');
  const packetCanvas=document.getElementById('tn_packet');
  const fireBtn=document.getElementById('tn_fire');
  let tnPhase=0;

  /* ---- a packet actually thrown at the barrier ----
     The steady-state picture below shows what the formula says. This solves the
     time-dependent Schrödinger equation on a grid and lets a real wave packet
     hit the barrier, so the split into a reflected and a transmitted packet
     happens rather than being asserted. Units are ħ = m = dx = 1 and the
     barrier height is 1, with the packet's energy and the barrier's width
     chosen to match the two dimensionless numbers the transmission depends on
     (E/U and the decay exponent 2k₂L), so the fraction that gets through is the
     same fraction the formula gives for the settings above.
     Integration is Visscher's staggered leapfrog: explicit, cheap, stable. */
  const NG=900, SIG=32, XSTART=170;
  let gR=null, gI=null, gV=null, gBar=[0,0], gRunning=false, gT=0;
  let gTrans=0, gRefl=0, gInside=1, gTheory=0, gLast=performance.now();

  function launch(){
    const E=parseFloat(EEl.value), U=parseFloat(UEl.value), L=parseFloat(LEl.value);
    const e=Math.min(3, E/U);
    // Grid units are chosen so the packet is well resolved (about 30 points per
    // wavelength) while still being narrow enough in momentum to have a
    // meaningful energy. The barrier's width is then set so that the two
    // dimensionless numbers transmission depends on — E/U and the decay
    // exponent 2k2L — match the sliders above.
    const k0=0.2, Eg=k0*k0/2, V0=Eg/Math.max(0.02,e);
    let Lsim;
    if(e<1){
      const k2g=k0*Math.sqrt(1/Math.max(0.02,e)-1);
      Lsim=Math.min(200, (2*kIn(E,U)*L)/(2*k2g));
    } else {
      Lsim=Math.max(2, L*30);
    }
    const x0=XSTART, xb=470;
    gBar=[xb, xb+Lsim];
    gR=new Float64Array(NG); gI=new Float64Array(NG); gV=new Float64Array(NG);
    for(let i=0;i<NG;i++){
      // fractional cell overlap, so a barrier only a couple of cells wide still
      // carries the right integral of V and transmits the right amount
      const lo=Math.max(gBar[0], i-0.5), hi=Math.min(gBar[1], i+0.5);
      gV[i]=Math.max(0, hi-lo)*V0;
      const g=Math.exp(-Math.pow((i-x0)/SIG,2)/2);
      gR[i]=g*Math.cos(k0*(i-x0));
      gI[i]=g*Math.sin(k0*(i-x0));
    }
    let s=0; for(let i=0;i<NG;i++) s+=gR[i]*gR[i]+gI[i]*gI[i];
    const f=1/Math.sqrt(s);
    for(let i=0;i<NG;i++){ gR[i]*=f; gI[i]*=f; }
    gT=0; gTrans=0; gRefl=0; gInside=1; gRunning=true;
    gTheory=Texact(E,U,L);
  }

  function gStep(){
    const dt=0.25;
    for(let n=0;n<30;n++){
      for(let i=1;i<NG-1;i++) gR[i] += dt*(-0.5*(gI[i+1]-2*gI[i]+gI[i-1]) + gV[i]*gI[i]);
      for(let i=1;i<NG-1;i++) gI[i] -= dt*(-0.5*(gR[i+1]-2*gR[i]+gR[i-1]) + gV[i]*gR[i]);
      gT+=dt;
    }
    // A gentle absorber at the two ends, applied once a frame rather than once
    // a sub-step — otherwise it eats the packet and the percentages below stop
    // meaning anything.
    for(let k=0;k<40;k++){
      const damp=0.985+0.015*(k/40);
      gR[k]*=damp; gI[k]*=damp;
      gR[NG-1-k]*=damp; gI[NG-1-k]*=damp;
    }
    let tr=0, rf=0, inside=0, edge=0;
    for(let i=0;i<NG;i++){
      const p=gR[i]*gR[i]+gI[i]*gI[i];
      if(i>gBar[1]+6) tr+=p;
      else if(i<gBar[0]-6) rf+=p;
      else inside+=p;
      if(i<50 || i>NG-50) edge+=p;
    }
    const tot=tr+rf+inside;
    if(tot>0){ gTrans=tr/tot; gRefl=rf/tot; gInside=inside/tot; }
    // stop once the two packets have separated, before either runs into the
    // absorber and the split stops being trustworthy
    if(edge>0.02 || gT>4000) gRunning=false;
  }

  function drawPacket(){
    if(!packetCanvas) return;
    const {ctx,w,h}=fitCanvas(packetCanvas);
    ctx.clearRect(0,0,w,h);
    const m={l:14,r:14,t:26,b:26};
    const X=i=>m.l+(i/(NG-1))*(w-m.l-m.r);
    const base=h-m.b;
    if(!gR){
      ctx.font='12px Helvetica,Arial,sans-serif'; ctx.fillStyle='#8a8d92'; ctx.textAlign='center';
      ctx.fillText('press Fire to throw a wave packet at the barrier', w/2, h/2);
      return;
    }
    // the barrier
    const bw=Math.max(4, X(gBar[1])-X(gBar[0]));
    ctx.fillStyle='#efebe2';
    ctx.fillRect(X(gBar[0]), m.t, bw, base-m.t);
    ctx.strokeStyle='#c7c2b5'; ctx.lineWidth=1;
    ctx.strokeRect(X(gBar[0]), m.t, bw, base-m.t);

    let peak=1e-9;
    for(let i=0;i<NG;i++) peak=Math.max(peak, gR[i]*gR[i]+gI[i]*gI[i]);
    const amp=(base-m.t)*0.86/peak;
    // |psi|^2, which is where the particle would actually be found
    ctx.beginPath(); ctx.moveTo(X(0),base);
    for(let i=0;i<NG;i++) ctx.lineTo(X(i), base-(gR[i]*gR[i]+gI[i]*gI[i])*amp);
    ctx.lineTo(X(NG-1),base); ctx.closePath();
    ctx.fillStyle='rgba(164,52,44,0.18)'; ctx.fill();
    ctx.strokeStyle='#a4342c'; ctx.lineWidth=2; ctx.stroke();
    // the real part underneath, so the wiggle is visible
    ctx.beginPath();
    const ra=(base-m.t)*0.30/Math.sqrt(peak);
    for(let i=0;i<NG;i++){ const y=base-(base-m.t)*0.10-gR[i]*ra; i?ctx.lineTo(X(i),y):ctx.moveTo(X(i),y); }
    ctx.strokeStyle='rgba(31,111,120,0.55)'; ctx.lineWidth=1; ctx.stroke();

    ctx.font='11px Helvetica,Arial,sans-serif'; ctx.textAlign='left'; ctx.fillStyle='#5a5d63';
    ctx.fillText('|ψ|² — a real packet, solved on a grid, not a sketch', m.l, m.t-10);
    ctx.textAlign='right';
    if(gInside<0.02 && gTrans+gRefl>0.5){
      ctx.fillStyle='#1f6f78';
      ctx.fillText(`got through ${fmt(gTrans*100,2)}%   ·   bounced back ${fmt(gRefl*100,2)}%`
                   + (gTheory>1e-4?`   ·   the formula, for one exact energy, says ${fmt(gTheory*100,2)}%`:''), w-m.r, m.t-10);
    } else {
      ctx.fillStyle='#8a8d92'; ctx.fillText('incoming…', w-m.r, m.t-10);
    }
    ctx.textAlign='center'; ctx.fillStyle='#8a8d92'; ctx.font='10px Helvetica,Arial,sans-serif';
    ctx.fillText('barrier', X(gBar[0])+bw/2, base+14);
  }

  function gLoop(now){
    const dt=(now-gLast)/1000; gLast=now;
    const active=document.getElementById('ch5') && document.getElementById('ch5').classList.contains('active');
    if(active && gRunning && !prefersReducedMotion()){
      gStep();
      drawPacket();
      if(!gRunning && fireBtn){
        fireBtn.textContent='↺ Fire another';
        fireBtn.classList.remove('playing');
      }
    }
    requestAnimationFrame(gLoop);
  }

  function kOut(E){ return Math.sqrt(E/H2_2M); }                 // nm^-1
  function kIn(E,U){ return Math.sqrt(Math.max(0,(U-E))/H2_2M); }
  function Texact(E,U,L){
    if(E<=0) return 0;
    if(E>=U){                                     // above the barrier, still not 1
      const k2=Math.sqrt((E-U)/H2_2M);
      const s=Math.sin(k2*L);
      return 1/(1 + (U*U*s*s)/(4*E*(E-U)));
    }
    const k2=kIn(E,U), s=Math.sinh(k2*L);
    return 1/(1 + (U*U*s*s)/(4*E*(U-E)));
  }
  function Tapprox(E,U,L){ return E>=U?1:Math.exp(-2*kIn(E,U)*L); }

  function drawBar(){
    const {ctx,w,h}=fitCanvas(cBar);
    const E=parseFloat(EEl.value), U=parseFloat(UEl.value), L=parseFloat(LEl.value);
    ctx.clearRect(0,0,w,h);
    const m={l:52,r:20,t:22,b:34};
    const span=L*3.4;
    const X=x=>m.l+(x+span/2)/span*(w-m.l-m.r);
    const Y=v=>h-m.b-(v/(U*1.25))*(h-m.t-m.b);

    // barrier
    ctx.fillStyle='#f2efe7'; ctx.fillRect(X(0),Y(U),X(L)-X(0),h-m.b-Y(U));
    ctx.strokeStyle='#1c1d20'; ctx.lineWidth=2.2;
    ctx.beginPath(); ctx.moveTo(X(-span/2),Y(0)); ctx.lineTo(X(0),Y(0)); ctx.lineTo(X(0),Y(U));
    ctx.lineTo(X(L),Y(U)); ctx.lineTo(X(L),Y(0)); ctx.lineTo(X(span/2),Y(0)); ctx.stroke();
    // particle energy
    ctx.strokeStyle='#1f6f78'; ctx.lineWidth=1.8; ctx.setLineDash([5,3]);
    ctx.beginPath(); ctx.moveTo(X(-span/2),Y(E)); ctx.lineTo(X(span/2),Y(E)); ctx.stroke(); ctx.setLineDash([]);
    ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle='#1f6f78'; ctx.textAlign='left';
    ctx.fillText(`E = ${fmt(E,2)} eV`, m.l+4, Y(E)-6);
    ctx.fillStyle='#5a5d63';
    ctx.fillText(`U = ${fmt(U,1)} eV`, X(L)+6, Y(U)+14);

    // the wave: travelling in, dying across the barrier, travelling out the far
    // side with an amplitude that is usually far too small to see
    const T=Texact(E,U,L);
    const amp=(h-m.t-m.b)*0.15, base=Y(E);
    const k1=kOut(E), k2=kIn(E,U);
    const outAmp=Math.sqrt(Math.max(T,1e-300));
    const ph=tnPhase;
    // Magnify whatever comes out, and say by how much: the size of the factor
    // is itself the lesson.
    const mag=Math.min(1e12, 0.42/Math.max(outAmp,1e-300));

    // Inside and before the barrier everything is at true scale, so the collapse
    // across the barrier is honest; only what emerges on the far side is
    // magnified, and the caption says by how much.
    function wave(x, magnified){
      if(x<0) return Math.cos(k1*x*6 - ph);
      if(x<=L) return Math.exp(-k2*x)*Math.cos(ph);
      return outAmp*(magnified?mag:1)*Math.cos(k1*(x-L)*6 - ph);
    }
    // true scale first, faint: past the barrier it is a flat line, which is the truth
    ctx.strokeStyle='rgba(164,52,44,0.22)'; ctx.lineWidth=1.4; ctx.beginPath();
    for(let i=0;i<=900;i++){
      const x=-span/2+span*i/900, y=base-amp*wave(x,false);
      i===0?ctx.moveTo(X(x),y):ctx.lineTo(X(x),y);
    }
    ctx.stroke();
    // then the magnified version
    ctx.strokeStyle='#a4342c'; ctx.lineWidth=2.2; ctx.beginPath();
    for(let i=0;i<=900;i++){
      const x=-span/2+span*i/900, y=base-amp*Math.max(-1.2,Math.min(1.2,wave(x,true)));
      i===0?ctx.moveTo(X(x),y):ctx.lineTo(X(x),y);
    }
    ctx.stroke();
    // mark where the vertical scale changes
    if(mag>1.5){
      ctx.save(); ctx.strokeStyle='rgba(138,141,146,0.6)'; ctx.lineWidth=1; ctx.setLineDash([2,3]);
      ctx.beginPath(); ctx.moveTo(X(L),base-amp*1.3); ctx.lineTo(X(L),base+amp*1.3); ctx.stroke();
      ctx.restore();
    }

    ctx.fillStyle='#a4342c'; ctx.textAlign='center';
    ctx.fillText('incident', X(-span/4), base-amp-8);
    if(X(L)-X(0) > 54) ctx.fillText('decaying', X(L/2), base-amp-8);
    ctx.textAlign='right';
    ctx.fillText('transmitted', w-m.r-4, base-amp-8);
    if(mag>1.5){
      ctx.fillStyle='#8a8d92'; ctx.font='10px Helvetica,Arial,sans-serif';
      ctx.fillText(`amplitude past the barrier magnified ×${mag>1e4?fmtSci(mag,1):fmt(mag,0)}`, w-m.r-4, base-amp+6);
      ctx.font='11px Helvetica,Arial,sans-serif';
    }
    ctx.fillStyle='#8a8d92'; ctx.textAlign='center';
    ctx.fillText(`barrier width L = ${fmt(L,2)} nm`, X(L/2), h-m.b+16);
  }

  function drawT(){
    const {ctx,w,h}=fitCanvas(cT);
    const E=parseFloat(EEl.value), U=parseFloat(UEl.value), L=parseFloat(LEl.value);
    ctx.clearRect(0,0,w,h);
    const m={l:62,r:18,t:24,b:36};
    const Lmax=2.0, lgMin=-20, lgMax=0;
    const X=x=>m.l+(x/Lmax)*(w-m.l-m.r);
    const Y=t=>h-m.b-(Math.max(lgMin,Math.log10(Math.max(t,1e-30)))-lgMin)/(lgMax-lgMin)*(h-m.b-m.t);
    ctx.save(); ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle='#8a8d92'; ctx.strokeStyle='#e7e4dc';
    for(let x=0;x<=Lmax;x+=0.5){
      ctx.beginPath(); ctx.moveTo(X(x),m.t); ctx.lineTo(X(x),h-m.b); ctx.stroke();
      ctx.textAlign='center'; ctx.fillText(x.toFixed(1), X(x), h-m.b+16);
    }
    for(let e=lgMin;e<=lgMax;e+=5){
      ctx.beginPath(); ctx.moveTo(m.l,Y(Math.pow(10,e))); ctx.lineTo(w-m.r,Y(Math.pow(10,e))); ctx.stroke();
      ctx.textAlign='right'; ctx.fillText(supPow(e), m.l-8, Y(Math.pow(10,e))+3);
    }
    ctx.strokeStyle='#1c1d20'; ctx.lineWidth=1.3;
    ctx.beginPath(); ctx.moveTo(m.l,m.t); ctx.lineTo(m.l,h-m.b); ctx.lineTo(w-m.r,h-m.b); ctx.stroke();
    ctx.fillStyle='#1c1d20'; ctx.textAlign='center';
    ctx.fillText('barrier width (nm)', m.l+(w-m.l-m.r)/2, h-6);
    ctx.save(); ctx.translate(15,m.t+(h-m.b-m.t)/2); ctx.rotate(-Math.PI/2);
    ctx.fillText('transmission probability',0,0); ctx.restore();
    ctx.restore();

    // Each curve is labelled at a different width: all three labelled at the
    // same place stack on top of each other and become unreadable.
    [[1.0,'#c9776f',0.30],[2.0,'#a4342c',0.58],[5.0,'#1f6f78',1.02]].forEach(([e,col,xlab])=>{
      if(e>=U) return;
      ctx.strokeStyle=col; ctx.lineWidth = Math.abs(e-E)<0.05?3:1.8; ctx.beginPath();
      let st=false;
      for(let x=0.02;x<=Lmax;x+=0.005){
        const y=Y(Texact(e,U,x));
        if(y>h-m.b){ st=false; continue; }
        if(!st){ ctx.moveTo(X(x),y); st=true; } else ctx.lineTo(X(x),y);
      }
      ctx.stroke();
      ctx.font='11px Helvetica,Arial,sans-serif'; ctx.textAlign='left';
      const yl=Y(Texact(e,U,xlab));
      if(yl>m.t&&yl<h-m.b){
        ctx.lineWidth=3; ctx.strokeStyle='rgba(255,253,248,0.92)';
        ctx.strokeText(`E = ${e} eV`, X(xlab)+4, yl-5);
        ctx.fillStyle=col; ctx.fillText(`E = ${e} eV`, X(xlab)+4, yl-5);
      }
    });
    const yc=Y(Texact(E,U,L));
    if(yc>m.t&&yc<h-m.b){
      ctx.fillStyle='#1c1d20'; ctx.beginPath(); ctx.arc(X(L),yc,5.5,0,7); ctx.fill();
      ctx.strokeStyle='#fff'; ctx.lineWidth=1.5; ctx.stroke();
    }
    ctx.font='11px Helvetica,Arial,sans-serif'; ctx.textAlign='right'; ctx.fillStyle='#5a5d63';
    ctx.fillText('straight lines on a log scale — T falls exponentially with width', w-m.r-8, m.t+14);
  }

  function draw(){
    const E=parseFloat(EEl.value), U=parseFloat(UEl.value), L=parseFloat(LEl.value);
    EVal.textContent=fmt(E,2); UVal.textContent=fmt(U,1); LVal.textContent=fmt(L,2);
    if(E>=U){ EEl.value=Math.min(E,U-0.1); }
    drawBar(); drawT();
    const T=Texact(E,U,L), Ta=Tapprox(E,U,L);
    const k2=kIn(E,U);
    readout.innerHTML = `
      <div>particle energy E <b>${fmt(E,2)} eV</b></div>
      <div>barrier height U <b>${fmt(U,1)} eV</b></div>
      <div>barrier width L <b>${fmt(L,2)} nm</b></div>
      <div>decay constant k&#8322; <b>${fmtSci(k2*1e9,3)} m&#8315;&sup1;</b></div>
      <div>2k&#8322;L <b>${fmt(2*k2*L,2)}</b></div>
      <div>T (exact) <b>${fmtSci(T,2)}</b></div>
      <div>T &asymp; e<sup>&minus;2k&#8322;L</sup> <b>${fmtSci(Ta,2)}</b></div>
      <div>one particle in <b>${fmtSci(1/T,2)}</b> gets through</div>`;
  }
  [EEl,UEl,LEl].forEach(el=>el.addEventListener('input',draw));
  registerCanvas('tn_canvas',draw);
  registerCanvas('tn_canvas_t',draw);

  // let the wave actually travel: a still picture of a travelling wave hides
  // the fact that anything is arriving on the far side at all
  if(fireBtn) fireBtn.addEventListener('click', ()=>{
    if(prefersReducedMotion()){
      launch();
      for(let k=0;k<400 && gRunning;k++) gStep();     // run it through without animating
      gRunning=false; drawPacket();
      return;
    }
    launch();
    gLast=performance.now();
    fireBtn.textContent='⏸ running…'; fireBtn.classList.add('playing');
  });
  registerCanvas('tn_packet',drawPacket);
  requestAnimationFrame(gLoop);

  let tnLast=performance.now();
  function tnLoop(now){
    const dt=Math.min(0.05,(now-tnLast)/1000); tnLast=now;
    const active=document.getElementById('ch5') && document.getElementById('ch5').classList.contains('active');
    if(active && !prefersReducedMotion()){
      tnPhase += dt*3.4;
      drawBar();
    }
    requestAnimationFrame(tnLoop);
  }
  requestAnimationFrame(tnLoop);
}

/* =====================================================================
   5. THE HARMONIC OSCILLATOR
   ===================================================================== */
function setupHarmonic(){
  const cWave=document.getElementById('ho_canvas');
  const cLev=document.getElementById('ho_canvas_lev');
  const nEl=document.getElementById('ho_n'), nVal=document.getElementById('ho_n_val');
  const clEl=document.getElementById('ho_classical');
  const readout=document.getElementById('ho_readout');

  // work in the natural variable y = x*sqrt(m*omega/hbar); then E_n = (n+1/2)hbar*omega
  // and the classical turning points sit at y = +/- sqrt(2n+1).
  function psi(n,y){ return hermite(n,y)*Math.exp(-y*y/2); }

  function drawWave(){
    const {ctx,w,h}=fitCanvas(cWave);
    const n=parseInt(nEl.value,10);
    ctx.clearRect(0,0,w,h);
    const m={l:52,r:20,t:24,b:36};
    const A=Math.sqrt(2*n+1);                       // turning point in y
    const span=Math.max(A*1.6, 4.2);
    const X=y=>m.l+(y+span)/(2*span)*(w-m.l-m.r);
    const mid=m.t+(h-m.t-m.b)*0.30, amp=(h-m.t-m.b)*0.24;
    const d0=h-m.b, dA=(h-m.b-mid)*0.80;

    let pk=0;
    for(let i=0;i<=800;i++) pk=Math.max(pk, Math.abs(psi(n, -span+2*span*i/800)));

    // classically forbidden regions
    ctx.fillStyle='rgba(164,52,44,0.06)';
    ctx.fillRect(X(-span),m.t,X(-A)-X(-span),h-m.t-m.b);
    ctx.fillRect(X(A),m.t,X(span)-X(A),h-m.t-m.b);
    ctx.strokeStyle='#d8d3c6'; ctx.lineWidth=1.4; ctx.setLineDash([4,3]);
    [-A,A].forEach(t=>{ ctx.beginPath(); ctx.moveTo(X(t),m.t); ctx.lineTo(X(t),h-m.b); ctx.stroke(); });
    ctx.setLineDash([]);
    ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle='#a4342c'; ctx.textAlign='center';
    ctx.fillText('classical turning point', X(A), m.t+12);

    ctx.strokeStyle='#e0dbd0'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(m.l,mid); ctx.lineTo(w-m.r,mid); ctx.stroke();

    // psi_n
    ctx.strokeStyle='#a4342c'; ctx.lineWidth=2.4; ctx.beginPath();
    for(let i=0;i<=900;i++){ const y=-span+2*span*i/900, py=mid-amp*psi(n,y)/pk;
      if(i===0) ctx.moveTo(X(y),py); else ctx.lineTo(X(y),py); }
    ctx.stroke();

    // |psi_n|^2 against the classical density, BOTH normalised to unit area so
    // the comparison is honest rather than a matter of arbitrary scaling.
    const qArea = simpson(y=>Math.pow(psi(n,y),2), -span, span, 2000);
    const qDens = y => Math.pow(psi(n,y),2)/qArea;
    let qpk=0;
    for(let i=0;i<=800;i++){ qpk=Math.max(qpk, qDens(-span+2*span*i/800)); }
    const clDens = y => Math.abs(y)<A*0.999 ? 1/(Math.PI*Math.sqrt(A*A-y*y)) : null;
    const sc = dA/(qpk*1.10);

    ctx.fillStyle='rgba(31,111,120,0.20)'; ctx.beginPath(); ctx.moveTo(X(-span),d0);
    for(let i=0;i<=900;i++){ const y=-span+2*span*i/900; ctx.lineTo(X(y), d0-sc*qDens(y)); }
    ctx.lineTo(X(span),d0); ctx.closePath(); ctx.fill();
    ctx.strokeStyle='#1f6f78'; ctx.lineWidth=2.2; ctx.beginPath();
    for(let i=0;i<=900;i++){ const y=-span+2*span*i/900, py=d0-sc*qDens(y);
      if(i===0) ctx.moveTo(X(y),py); else ctx.lineTo(X(y),py); }
    ctx.stroke();

    if(clEl.checked){
      ctx.strokeStyle='#8a8d92'; ctx.lineWidth=2; ctx.setLineDash([5,3]); ctx.beginPath();
      let st=false;
      for(let i=0;i<=900;i++){
        const y=-span+2*span*i/900, v=clDens(y);
        if(v==null){ st=false; continue; }
        const py=Math.max(m.t, d0-sc*v);
        if(!st){ ctx.moveTo(X(y),py); st=true; } else ctx.lineTo(X(y),py);
      }
      ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle='#8a8d92'; ctx.textAlign='left'; ctx.font='11px Helvetica,Arial,sans-serif';
      ctx.fillText('classical oscillator, same energy, same total probability', m.l+6, d0-dA-6);
    }
    ctx.fillStyle='#a4342c'; ctx.textAlign='left'; ctx.font='11px Helvetica,Arial,sans-serif';
    ctx.fillText(`ψ${n}`, m.l+6, mid-amp+2);
    ctx.fillStyle='#1f6f78'; ctx.fillText(`|ψ${n}|²`, m.l+6, mid+18);
    ctx.fillStyle='#8a8d92'; ctx.textAlign='center';
    ctx.fillText('displacement from equilibrium', m.l+(w-m.l-m.r)/2, h-6);
  }

  function drawLev(){
    const {ctx,w,h}=fitCanvas(cLev);
    const n=parseInt(nEl.value,10);
    ctx.clearRect(0,0,w,h);
    const m={l:76,r:24,t:24,b:30};
    const NMAX=10;
    const Emax=NMAX+0.5+1;
    const Y=E=>h-m.b-(E/Emax)*(h-m.t-m.b);
    const X=y=>m.l+(y+4.2)/8.4*(w-m.l-m.r);
    // the parabola U = 1/2 k x^2, which in these units is y^2/2
    ctx.strokeStyle='#c7c2b5'; ctx.lineWidth=2; ctx.beginPath();
    let st=false;
    for(let y=-4.2;y<=4.2;y+=0.02){
      const U=y*y/2, py=Y(U);
      if(py<m.t){ st=false; continue; }
      if(!st){ ctx.moveTo(X(y),py); st=true; } else ctx.lineTo(X(y),py);
    }
    ctx.stroke();
    ctx.font='11px Helvetica,Arial,sans-serif';
    for(let k=0;k<=NMAX;k++){
      const E=k+0.5, on=(k===n);
      const A=Math.sqrt(2*k+1);
      ctx.strokeStyle = on?'#a4342c':'#ddd8cc'; ctx.lineWidth = on?2.6:1.3;
      ctx.beginPath(); ctx.moveTo(X(-A),Y(E)); ctx.lineTo(X(A),Y(E)); ctx.stroke();
      if(k<=6||on){
        ctx.fillStyle = on?'#a4342c':'#8a8d92'; ctx.textAlign='right';
        ctx.fillText(`n=${k}`, m.l-8, Y(E)+4);
      }
    }
    // zero-point energy
    ctx.strokeStyle='#1f6f78'; ctx.lineWidth=1.6; ctx.setLineDash([3,3]);
    ctx.beginPath(); ctx.moveTo(m.l,Y(0)); ctx.lineTo(w-m.r,Y(0)); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle='#1f6f78'; ctx.textAlign='left';
    ctx.fillText('E = 0 — classically allowed, quantum-mechanically forbidden', m.l+6, Y(0)-7);
    ctx.fillStyle='#1c1d20'; ctx.textAlign='center'; ctx.font='11px Helvetica,Arial,sans-serif';
    ctx.fillText('Eₙ = (n + ½)ℏω — evenly spaced, and the lowest is not zero',
                 m.l+(w-m.l-m.r)/2, m.t+12);
  }

  function draw(){
    const n=parseInt(nEl.value,10);
    nVal.textContent=n;
    drawWave(); drawLev();
    const A=Math.sqrt(2*n+1);
    // probability of being outside the classical turning points
    const num=simpson(y=>Math.pow(psi(n,y),2), A, A+12, 3000);
    const den=simpson(y=>Math.pow(psi(n,y),2), -(A+12), A+12, 6000);
    const outside=2*num/den;
    readout.innerHTML = `
      <div>quantum number n <b>${n}</b></div>
      <div>E<sub>n</sub> <b>(${n} + &frac12;)&#8463;&omega; = ${fmt(n+0.5,1)}&#8463;&omega;</b></div>
      <div>zero-point energy <b>&frac12;&#8463;&omega;</b></div>
      <div>spacing to the next level <b>&#8463;&omega;</b> (always)</div>
      <div>nodes <b>${n}</b></div>
      <div>turning point <b>&plusmn;${fmt(A,3)}</b> (natural units)</div>
      <div>P(outside the turning points) <b>${fmt(outside*100,2)}%</b>
        ${outside>0.1?'<span class="badge no">classically impossible</span>':''}</div>`;
  }
  nEl.addEventListener('input',draw);
  clEl.addEventListener('change',draw);
  registerCanvas('ho_canvas',draw);
  registerCanvas('ho_canvas_lev',draw);
}

/* =====================================================================
   6. SUPERPOSITION: WHY STATIONARY STATES ARE STATIONARY
   ===================================================================== */
function setupSuperposition(){
  const canvas=document.getElementById('su_canvas');
  const n1El=document.getElementById('su_n1'), n1Val=document.getElementById('su_n1_val');
  const n2El=document.getElementById('su_n2'), n2Val=document.getElementById('su_n2_val');
  const mixEl=document.getElementById('su_mix'), mixVal=document.getElementById('su_mix_val');
  const runEl=document.getElementById('su_run');
  const readout=document.getElementById('su_readout');
  let dims=fitCanvas(canvas), t=0, last=performance.now();

  function refit(){ dims=fitCanvas(canvas); render(); }
  registerCanvas('su_canvas', refit);

  function render(){
    const {ctx,w,h}=dims;
    const n1=parseInt(n1El.value,10), n2=parseInt(n2El.value,10);
    const c=parseFloat(mixEl.value);
    const a1=Math.sqrt(1-c), a2=Math.sqrt(c);
    ctx.clearRect(0,0,w,h);
    const m={l:46,r:22,t:24,b:34};
    const X=u=>m.l+u*(w-m.l-m.r);
    const d0=h-m.b, dA=(h-m.t-m.b)*0.78;
    // energies in units where E_1 = 1; the relative phase runs at (E2-E1)t
    const dPhase=(n2*n2-n1*n1)*t;

    ctx.fillStyle='#efebe2'; ctx.fillRect(m.l-14,m.t,14,h-m.t-m.b); ctx.fillRect(w-m.r,m.t,14,h-m.t-m.b);
    ctx.strokeStyle='#1c1d20'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(m.l,m.t); ctx.lineTo(m.l,d0); ctx.lineTo(w-m.r,d0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(w-m.r,m.t); ctx.lineTo(w-m.r,d0); ctx.stroke();

    // |Psi|^2 = a1^2 s1^2 + a2^2 s2^2 + 2 a1 a2 s1 s2 cos(dPhase)
    const dens=[];
    let pk=0;
    for(let i=0;i<=800;i++){
      const u=i/800;
      const s1=Math.sin(n1*Math.PI*u), s2=Math.sin(n2*Math.PI*u);
      const v=2*(a1*a1*s1*s1 + a2*a2*s2*s2 + 2*a1*a2*s1*s2*Math.cos(dPhase));
      dens.push(v); pk=Math.max(pk,v);
    }
    const SC = 2.4;                    // fixed scale so the sloshing is visible as motion
    ctx.fillStyle='rgba(31,111,120,0.22)'; ctx.beginPath(); ctx.moveTo(X(0),d0);
    dens.forEach((v,i)=>ctx.lineTo(X(i/800), d0-dA*v/SC));
    ctx.lineTo(X(1),d0); ctx.closePath(); ctx.fill();
    ctx.strokeStyle='#1f6f78'; ctx.lineWidth=2.4; ctx.beginPath();
    dens.forEach((v,i)=>{ const y=d0-dA*v/SC; if(i===0) ctx.moveTo(X(i/800),y); else ctx.lineTo(X(i/800),y); });
    ctx.stroke();

    // where the particle is, on average
    let num=0, den=0;
    dens.forEach((v,i)=>{ const u=i/800; num+=u*v; den+=v; });
    const xAvg=num/den;
    ctx.strokeStyle='#a4342c'; ctx.lineWidth=2; ctx.setLineDash([4,3]);
    ctx.beginPath(); ctx.moveTo(X(xAvg),m.t); ctx.lineTo(X(xAvg),d0); ctx.stroke(); ctx.setLineDash([]);
    ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle='#a4342c'; ctx.textAlign='center';
    ctx.fillText(`⟨x⟩ = ${fmt(xAvg,3)}L`, X(xAvg), m.t+12);

    ctx.textAlign='left'; ctx.fillStyle='#5a5d63';
    const pure = (c<0.005||c>0.995);
    ctx.fillText(pure ? 'a single energy state: |Ψ|² does not move — this is what "stationary" means'
                      : 'a mixture of two energies: |Ψ|² sloshes at the frequency of their difference',
                 m.l+4, h-m.b+16);
    return {xAvg, a1, a2, n1, n2};
  }

  function draw(){
    const n1=parseInt(n1El.value,10), n2=parseInt(n2El.value,10), c=parseFloat(mixEl.value);
    n1Val.textContent=n1; n2Val.textContent=n2; mixVal.textContent=fmt(c*100,0)+'%';
    const r=render();
    const dE=(n2*n2-n1*n1);
    readout.innerHTML = `
      <div>state 1 <b>n = ${n1}</b>, weight ${fmt((1-c)*100,0)}%</div>
      <div>state 2 <b>n = ${n2}</b>, weight ${fmt(c*100,0)}%</div>
      <div>&lang;E&rang; <b>${fmt((1-c)*n1*n1 + c*n2*n2,3)} E&#8321;</b></div>
      <div>energy difference <b>${dE} E&#8321;</b></div>
      <div>sloshing frequency <b>(E&#8322;&minus;E&#8321;)/h</b></div>
      <div>&lang;x&rang; right now <b>${fmt(r.xAvg,4)}L</b></div>
      <div>state <b>${(c<0.005||c>0.995)?'stationary':'not stationary'}</b>
        ${(c<0.005||c>0.995)?'<span class="badge ok">|Ψ|² constant in time</span>':'<span class="badge no">|Ψ|² moves</span>'}</div>`;
  }

  function loop(now){
    const dt=Math.min(0.05,(now-last)/1000); last=now;
    const vis=document.getElementById('ch5') && document.getElementById('ch5').classList.contains('active');
    if(vis && runEl.checked && !prefersReducedMotion()){ t+=dt*1.7; render(); }
    requestAnimationFrame(loop);
  }
  [n1El,n2El,mixEl].forEach(el=>el.addEventListener('input',draw));
  runEl.addEventListener('change',()=>{ last=performance.now(); });
  requestAnimationFrame(loop);
}

// register with the loader in app.js
registerModule('setupWaveFunction', setupWaveFunction);
registerModule('setupQuantumBox', setupQuantumBox);
registerModule('setupFiniteWell', setupFiniteWell);
registerModule('setupTunnel', setupTunnel);
registerModule('setupHarmonic', setupHarmonic);
registerModule('setupSuperposition', setupSuperposition);
