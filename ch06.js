/* =====================================================================
   Concepts of Modern Physics — Interactive Companion
   Chapter 6: Quantum Theory of the Hydrogen Atom
   Every number is computed live from the chapter's formulas.
   ===================================================================== */

const MU_B_EV = 5.7884e-5;      // Bohr magneton, eV/T
const MU_B_J  = 9.274e-24;      // Bohr magneton, J/T
const ORB = ['s','p','d','f','g'];

/* ---------- hydrogen wave functions ----------
   R_nl(r) ∝ ρ^l e^(-ρ/2) L^(2l+1)_{n-l-1}(ρ),  ρ = 2r/(n a0).
   Normalised numerically, which avoids factorial overflow entirely. */
function laguerre(k, alpha, x){
  if(k===0) return 1;
  let lm=1, lc=1+alpha-x;
  for(let i=1;i<k;i++){ const nx=((2*i+1+alpha-x)*lc-(i+alpha)*lm)/(i+1); lm=lc; lc=nx; }
  return lc;
}
function radialRaw(n,l,rOverA0){
  const rho = 2*rOverA0/n;
  return Math.pow(rho,l)*Math.exp(-rho/2)*laguerre(n-l-1, 2*l+1, rho);
}
const _radNorm = {};
function radial(n,l,rOverA0){
  const key=n+'_'+l;
  if(!_radNorm[key]){
    // integral of R^2 r^2 dr in units of a0
    const rmax = 30*n*n;
    let s=0; const N=4000, dr=rmax/N;
    for(let i=0;i<=N;i++){
      const r=i*dr, v=radialRaw(n,l,r);
      const wgt = (i===0||i===N)?1:(i%2?4:2);
      s += wgt*v*v*r*r;
    }
    _radNorm[key] = Math.sqrt(s*dr/3);
  }
  return radialRaw(n,l,rOverA0)/_radNorm[key];
}
// |Theta_{l,m}(theta)|, the angular factor (Table 6.1), up to l = 3
function angular(l,m,theta){
  const c=Math.cos(theta), s=Math.sin(theta), am=Math.abs(m);
  if(l===0) return 1;
  if(l===1) return am===0 ? Math.abs(c) : Math.abs(s);
  if(l===2){
    if(am===0) return Math.abs(3*c*c-1);
    if(am===1) return Math.abs(s*c);
    return s*s;
  }
  if(l===3){
    if(am===0) return Math.abs(5*c*c*c-3*c);
    if(am===1) return Math.abs(s*(5*c*c-1));
    if(am===2) return s*s*Math.abs(c);
    return s*s*s;
  }
  return 1;
}
function orbitalName(n,l){ return n + (ORB[l]||('l='+l)); }

/* =====================================================================
   1. THE THREE QUANTUM NUMBERS
   ===================================================================== */
function setupQuantumNumbers(){
  const canvas=document.getElementById('qn_canvas');
  const nEl=document.getElementById('qn_n'), nVal=document.getElementById('qn_n_val');
  const readout=document.getElementById('qn_readout');

  function draw(){
    const {ctx,w,h}=fitCanvas(canvas);
    const N=parseInt(nEl.value,10);
    nVal.textContent=N;
    ctx.clearRect(0,0,w,h);
    const m={l:54,r:20,t:42,b:30};                 // room for the m_l header above
    const rows=N;                                  // one row per n
    const rowH=(h-m.t-m.b)/rows;
    const mMax=N-1;                                // widest ml range shown
    const colW=(w-m.l-m.r)/(2*mMax+1);
    const X=ml=>m.l+(ml+mMax+0.5)*colW;

    ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle='#8a8d92'; ctx.textAlign='center';
    for(let ml=-mMax;ml<=mMax;ml++) ctx.fillText(ml>0?'+'+ml:String(ml), X(ml), m.t-16);
    ctx.fillStyle='#5a5d63'; ctx.fillText('mₗ', m.l+(w-m.l-m.r)/2, m.t-31);

    let total=0;
    for(let n=1;n<=N;n++){
      const y0=m.t+(n-1)*rowH;
      ctx.textAlign='right'; ctx.fillStyle='#1c1d20'; ctx.font='11px Helvetica,Arial,sans-serif';
      ctx.fillText('n = '+n, m.l-8, y0+rowH/2+4);
      const subH=rowH/n;
      for(let l=0;l<n;l++){
        const yc=y0+(l+0.5)*subH;
        ctx.textAlign='left'; ctx.fillStyle='#8a8d92'; ctx.font='10px Helvetica,Arial,sans-serif';
        ctx.fillText(orbitalName(n,l), m.l-48, yc+3);
        for(let ml=-l;ml<=l;ml++){
          total++;
          const cx=X(ml), cy=yc;
          ctx.fillStyle = ['#a4342c','#1f6f78','#8a6d1f','#5a5d63'][Math.min(l,3)];
          ctx.beginPath(); ctx.arc(cx,cy,Math.min(6, subH*0.34),0,7); ctx.fill();
        }
      }
      ctx.strokeStyle='#efebe2'; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(m.l-52,y0+rowH); ctx.lineTo(w-m.r,y0+rowH); ctx.stroke();
      ctx.textAlign='right'; ctx.fillStyle='#1f6f78'; ctx.font='11px Helvetica,Arial,sans-serif';
      ctx.fillText(`${n*n} states`, w-m.r, y0+12);
    }
    ctx.textAlign='left'; ctx.fillStyle='#5a5d63'; ctx.font='11px Helvetica,Arial,sans-serif';
    ctx.fillText('each dot is one quantum state (n, ℓ, mₗ)', m.l-52, h-8);

    const En = -E1_H/(N*N);
    readout.innerHTML = `
      <div>shells shown <b>n = 1 &hellip; ${N}</b></div>
      <div>&ell; runs <b>0 &hellip; n&minus;1</b></div>
      <div>m<sub>&ell;</sub> runs <b>&minus;&ell; &hellip; +&ell;</b></div>
      <div>states in shell n = ${N} <b>${N*N}</b></div>
      <div>subshells in that shell <b>${N}</b> (${Array.from({length:N},(_,i)=>ORB[i]||'?').join(', ')})</div>
      <div>total states up to n = ${N} <b>${total}</b></div>
      <div>energy of shell ${N} <b>${fmt(En,3)} eV</b> — depends on n alone</div>`;
  }
  nEl.addEventListener('input',draw);
  registerCanvas('qn_canvas',draw);
}

/* =====================================================================
   2. RADIAL PROBABILITY DENSITY
   ===================================================================== */
function setupRadial(){
  const cR=document.getElementById('rd_canvas');
  const cP=document.getElementById('rd_canvas_p');
  const nEl=document.getElementById('rd_n'), nVal=document.getElementById('rd_n_val');
  const lEl=document.getElementById('rd_l'), lVal=document.getElementById('rd_l_val');
  const readout=document.getElementById('rd_readout');

  function stats(n,l){
    const rmax=Math.max(25, 2.2*n*n+12);
    const N=4000, dr=rmax/N;
    let best=0, bestR=0, mean=0, norm=0, insideA0=0;
    for(let i=1;i<=N;i++){
      const r=i*dr, R=radial(n,l,r), P=R*R*r*r;
      if(P>best){ best=P; bestR=r; }
      mean+=P*r*dr; norm+=P*dr;
      if(r<=1) insideA0+=P*dr;
    }
    return {rmax,best,bestR,mean:mean/norm,insideA0:insideA0/norm};
  }

  function drawR(){
    const {ctx,w,h}=fitCanvas(cR);
    const n=parseInt(nEl.value,10), l=parseInt(lEl.value,10);
    ctx.clearRect(0,0,w,h);
    const s=stats(n,l);
    const m={l:60,r:18,t:24,b:36};
    let lo=0,hi=0;
    for(let i=0;i<=600;i++){ const v=radial(n,l,s.rmax*i/600); lo=Math.min(lo,v); hi=Math.max(hi,v); }
    const pad=(hi-lo)*0.12;
    const {X,Y}=drawAxes(ctx,w,h,m,0,s.rmax,lo-pad,hi+pad,'r / a₀','Rₙₗ(r)',
                         {nx:5,ny:4,xfmt:v=>v.toFixed(0),yfmt:v=>v.toFixed(1)});
    plotLine(ctx,X,Y,[{x:0,y:0},{x:s.rmax,y:0}],'#d8d3c6',1.2);
    const pts=[]; for(let i=0;i<=900;i++){ const r=s.rmax*i/900; pts.push({x:r,y:radial(n,l,r)}); }
    plotLine(ctx,X,Y,pts,'#a4342c',2.6);
    // radial nodes: n - l - 1 of them
    const nodes=n-l-1;
    let found=0, prev=radial(n,l,1e-4);
    for(let i=1;i<=2000 && found<nodes;i++){
      const r=s.rmax*i/2000, v=radial(n,l,r);
      if(prev*v<0){
        dotAt(ctx,X,Y,r,0,'#1c1d20',4); found++;
      }
      prev=v;
    }
    ctx.font='11px Helvetica,Arial,sans-serif'; ctx.textAlign='right'; ctx.fillStyle='#1c1d20';
    ctx.fillText(`${orbitalName(n,l)} — ${nodes} radial node${nodes===1?'':'s'}`, w-m.r-8, m.t+14);
  }

  function drawP(){
    const {ctx,w,h}=fitCanvas(cP);
    const n=parseInt(nEl.value,10), l=parseInt(lEl.value,10);
    ctx.clearRect(0,0,w,h);
    const s=stats(n,l);
    const m={l:60,r:18,t:24,b:36};
    const {X,Y}=drawAxes(ctx,w,h,m,0,s.rmax,0,s.best*1.18,'r / a₀','P(r) = r²|R|²',
                         {nx:5,ny:4,xfmt:v=>v.toFixed(0),yfmt:()=>''});
    const pts=[];
    for(let i=0;i<=900;i++){ const r=s.rmax*i/900, R=radial(n,l,r); pts.push({x:r,y:R*R*r*r}); }
    // shade it, because this is the curve that actually means something
    ctx.save(); ctx.fillStyle='rgba(31,111,120,0.18)'; ctx.beginPath(); ctx.moveTo(X(0),Y(0));
    pts.forEach(p=>ctx.lineTo(X(p.x),Y(p.y))); ctx.lineTo(X(s.rmax),Y(0)); ctx.closePath(); ctx.fill(); ctx.restore();
    plotLine(ctx,X,Y,pts,'#1f6f78',2.6);
    plotLine(ctx,X,Y,[{x:s.bestR,y:0},{x:s.bestR,y:s.best}],'#a4342c',1.8,[4,3]);
    plotLine(ctx,X,Y,[{x:s.mean,y:0},{x:s.mean,y:s.best*0.82}],'#1c1d20',1.6,[2,3]);
    ctx.font='11px Helvetica,Arial,sans-serif'; ctx.textAlign='left';
    ctx.fillStyle='#a4342c'; ctx.fillText(`most probable r = ${fmt(s.bestR,2)}a₀`, X(s.bestR)+6, Y(s.best)-6);
    ctx.fillStyle='#1c1d20'; ctx.fillText(`⟨r⟩ = ${fmt(s.mean,2)}a₀`, X(s.mean)+6, Y(s.best*0.82)-5);
    // where Bohr would have put it
    const rBohr=n*n;
    if(rBohr<=s.rmax){
      plotLine(ctx,X,Y,[{x:rBohr,y:0},{x:rBohr,y:s.best*1.1}],'#8a8d92',1.4,[6,3]);
      ctx.fillStyle='#8a8d92'; ctx.textAlign='center';
      ctx.fillText(`Bohr orbit n²a₀`, X(rBohr), m.t+12);
    }
  }

  function draw(){
    const n=parseInt(nEl.value,10);
    lEl.max=n-1;
    let l=Math.min(parseInt(lEl.value,10), n-1);
    lEl.value=l;
    nVal.textContent=n; lVal.textContent=`${l}  (${ORB[l]})`;
    drawR(); drawP();
    const s=stats(n,l);
    // Example 6.3: how much more likely is a 1s electron at a0 than at a0/2?
    const ratio = (r1,r2)=>{ const A=radial(n,l,r1), B=radial(n,l,r2);
      return (A*A*r1*r1)/(B*B*r2*r2); };
    readout.innerHTML = `
      <div>orbital <b>${orbitalName(n,l)}</b> &nbsp; (n=${n}, &ell;=${l})</div>
      <div>energy <b>${fmt(-E1_H/(n*n),3)} eV</b></div>
      <div>radial nodes n&minus;&ell;&minus;1 <b>${n-l-1}</b></div>
      <div>most probable r <b>${fmt(s.bestR,3)} a&#8320;</b></div>
      <div>Bohr's n&sup2;a&#8320; <b>${n*n} a&#8320;</b></div>
      <div>&lang;r&rang; <b>${fmt(s.mean,3)} a&#8320;</b></div>
      <div>P(r &lt; a&#8320;) <b>${fmt(s.insideA0*100,1)}%</b></div>
      <div>P(a&#8320;) / P(a&#8320;/2) <b>${fmt(ratio(1,0.5),3)}</b></div>`;
  }
  nEl.addEventListener('input',draw);
  lEl.addEventListener('input',draw);
  registerCanvas('rd_canvas',draw);
  registerCanvas('rd_canvas_p',draw);
}

/* =====================================================================
   3. ORBITAL SHAPES
   ===================================================================== */
function setupOrbitalShapes(){
  const canvas=document.getElementById('os_canvas');
  const nEl=document.getElementById('os_n'), nVal=document.getElementById('os_n_val');
  const lEl=document.getElementById('os_l'), lVal=document.getElementById('os_l_val');
  const mEl=document.getElementById('os_m'), mVal=document.getElementById('os_m_val');
  const readout=document.getElementById('os_readout');
  // density is computed on a coarse grid and scaled up: fast enough to drag
  const NX=224, NY=224;   // square grid drawn into a square box, so no aspect distortion
  const off=document.createElement('canvas'); off.width=NX; off.height=NY;
  const offCtx=off.getContext('2d');
  let vals=new Float64Array(NX*NY), peak=1, span=6;
  let n=1,l=0,ml=0;
  // "electron detections": a handful of dots that pop in at random points sampled
  // from |psi|^2 and fade out again, so the smooth density plot is visibly what it
  // actually is — where a great many individual measurements would land, not a
  // little orbiting ball.
  const dots=[];
  const MAX_DOTS=42;

  function sampleGridPoint(){
    // rejection sampling straight off the density grid already computed for the heatmap
    for(let tries=0;tries<60;tries++){
      const i=Math.floor(Math.random()*NX), j=Math.floor(Math.random()*NY);
      if(Math.random() < vals[j*NX+i]/peak) return {i,j};
    }
    return {i:Math.floor(NX/2), j:Math.floor(NY/2)};
  }

  function compute(){
    n=parseInt(nEl.value,10);
    lEl.max=n-1;
    l=Math.min(parseInt(lEl.value,10), n-1); lEl.value=l;
    mEl.max=l; mEl.min=-l;
    ml=Math.max(-l, Math.min(parseInt(mEl.value,10), l)); mEl.value=ml;
    nVal.textContent=n; lVal.textContent=`${l} (${ORB[l]})`; mVal.textContent=ml;

    span=Math.max(6, 2.4*n*n);              // half-width in units of a0
    const img=offCtx.createImageData(NX,NY);
    const d=img.data;
    peak=0;
    vals=new Float64Array(NX*NY);
    for(let j=0;j<NY;j++){
      const z=span*(1-2*j/(NY-1));                 // z runs down the screen
      for(let i=0;i<NX;i++){
        const x=span*(2*i/(NX-1)-1);
        const r=Math.hypot(x,z);
        const th=r<1e-9?0:Math.acos(z/r);
        const R=radial(n,l,r), A=angular(l,ml,th);
        const v=R*R*A*A;
        vals[j*NX+i]=v;
        if(v>peak) peak=v;
      }
    }
    // a mild gamma keeps the faint outer lobes visible
    for(let k=0;k<NX*NY;k++){
      const t=Math.pow(vals[k]/peak, 0.42);
      // paper -> dusty rose -> deep red
      const r0=255,g0=253,b0=248, r1=217,g1=168,b1=152, r2=125,g2=33,b2=24;
      let R,G,B;
      if(t<0.5){ const u=t*2; R=r0+(r1-r0)*u; G=g0+(g1-g0)*u; B=b0+(b1-b0)*u; }
      else { const u=(t-0.5)*2; R=r1+(r2-r1)*u; G=g1+(g2-g1)*u; B=b1+(b2-b1)*u; }
      d[k*4]=R; d[k*4+1]=G; d[k*4+2]=B; d[k*4+3]=255;
    }
    offCtx.putImageData(img,0,0);
    dots.length=0;
  }

  function draw(){
    const {ctx,w,h}=fitCanvas(canvas);
    ctx.clearRect(0,0,w,h);
    const side=Math.min(w*0.62, h-54);
    const x0=(w-side)/2 - w*0.14, y0=(h-side)/2 - 6;
    ctx.imageSmoothingEnabled=true;
    ctx.drawImage(off, x0, y0, side, side);
    ctx.strokeStyle='#e0dbd0'; ctx.lineWidth=1; ctx.strokeRect(x0,y0,side,side);

    // electron-detection dots, sampled from the same density grid as the heatmap
    const reduced=prefersReducedMotion();
    if(!reduced){
      if(dots.length<MAX_DOTS && Math.random()<0.55){
        const p=sampleGridPoint();
        dots.push({i:p.i, j:p.j, age:0, maxAge:40+Math.random()*55});
      }
      for(let k=dots.length-1;k>=0;k--){
        const dt=dots[k]; dt.age++;
        if(dt.age>dt.maxAge){ dots.splice(k,1); continue; }
        const u=dt.age/dt.maxAge;
        const fade = u<0.25 ? u/0.25 : (u>0.75 ? (1-u)/0.25 : 1);
        const cx=x0+side*dt.i/(NX-1), cy=y0+side*dt.j/(NY-1);
        ctx.beginPath(); ctx.arc(cx,cy,2.6,0,7);
        ctx.fillStyle=`rgba(31,111,120,${0.75*fade})`;
        ctx.fill();
        ctx.lineWidth=1; ctx.strokeStyle=`rgba(255,255,255,${0.6*fade})`; ctx.stroke();
      }
    }

    // the z axis, which is the direction m_l is measured against
    ctx.strokeStyle='rgba(31,111,120,0.5)'; ctx.lineWidth=1.4; ctx.setLineDash([4,3]);
    ctx.beginPath(); ctx.moveTo(x0+side/2,y0); ctx.lineTo(x0+side/2,y0+side); ctx.stroke();
    ctx.setLineDash([]);
    ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle='#1f6f78'; ctx.textAlign='center';
    ctx.fillText('z', x0+side/2, y0-5);
    ctx.fillStyle='#8a8d92';
    ctx.fillText(`${fmt(2*span,0)} a₀ across`, x0+side/2, y0+side+16);

    const bx=x0+side+22;
    ctx.textAlign='left'; ctx.font='15px Helvetica,Arial,sans-serif'; ctx.fillStyle='#1c1d20';
    ctx.fillText(orbitalName(n,l), bx, y0+26);
    ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle='#5a5d63';
    ctx.fillText(`n = ${n},  ℓ = ${l},  mₗ = ${ml}`, bx, y0+48);
    ctx.fillText(`${n-l-1} radial node${n-l-1===1?'':'s'}`, bx, y0+68);
    ctx.fillText(`${l-Math.abs(ml)} angular node${l-Math.abs(ml)===1?'':'s'}`, bx, y0+86);
    ctx.fillText(`${n-1} nodes in total`, bx, y0+104);
    ctx.fillStyle='#8a8d92';
    ctx.fillText('a slice through the atom,', bx, y0+130);
    ctx.fillText('containing the z axis', bx, y0+146);
    if(!reduced){
      ctx.fillText('teal dots: where a single', bx, y0+168);
      ctx.fillText('measurement would land', bx, y0+184);
    }

    readout.innerHTML = `
      <div>orbital <b>${orbitalName(n,l)}</b></div>
      <div>quantum numbers <b>(${n}, ${l}, ${ml})</b></div>
      <div>energy <b>${fmt(-E1_H/(n*n),3)} eV</b></div>
      <div>|L| = &radic;(&ell;(&ell;+1))&#8463; <b>${fmt(Math.sqrt(l*(l+1)),3)}&#8463;</b></div>
      <div>L<sub>z</sub> = m<sub>&ell;</sub>&#8463; <b>${ml}&#8463;</b></div>
      <div>radial nodes <b>${n-l-1}</b></div>
      <div>angular nodes <b>${l-Math.abs(ml)}</b></div>
      <div>total nodes <b>${n-1}</b> — always n&minus;1</div>`;
  }

  function fullRedraw(){ compute(); draw(); }
  [nEl,lEl,mEl].forEach(el=>el.addEventListener('input',fullRedraw));
  registerCanvas('os_canvas',fullRedraw);

  function loop(){
    const active=document.getElementById('ch6') && document.getElementById('ch6').classList.contains('active');
    if(active && !prefersReducedMotion()) draw();
    requestAnimationFrame(loop);
  }
  compute();
  requestAnimationFrame(loop);
}

/* =====================================================================
   4. ANGULAR MOMENTUM QUANTIZATION
   ===================================================================== */
function setupAngularMomentum(){
  const canvas=document.getElementById('am_canvas');
  const lEl=document.getElementById('am_l'), lVal=document.getElementById('am_l_val');
  const mEl=document.getElementById('am_m'), mVal=document.getElementById('am_m_val');
  const readout=document.getElementById('am_readout');

  function draw(){
    const {ctx,w,h}=fitCanvas(canvas);
    const l=parseInt(lEl.value,10);
    mEl.max=l; mEl.min=-l;
    let ml=Math.max(-l,Math.min(parseInt(mEl.value,10),l)); mEl.value=ml;
    lVal.textContent=l; mVal.textContent=ml;
    ctx.clearRect(0,0,w,h);

    const L=Math.sqrt(l*(l+1));
    const cx=w*0.40, cy=h*0.52;
    const S=Math.min(w*0.30, h*0.38)/Math.max(L,0.7);

    // the z axis with its allowed projections marked
    ctx.strokeStyle='#1c1d20'; ctx.lineWidth=1.4;
    ctx.beginPath(); ctx.moveTo(cx,cy-L*S*1.25); ctx.lineTo(cx,cy+L*S*1.25); ctx.stroke();
    ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle='#1c1d20'; ctx.textAlign='center';
    ctx.fillText('z', cx, cy-L*S*1.25-8);

    ctx.strokeStyle='#e0dbd0'; ctx.setLineDash([3,3]); ctx.lineWidth=1;
    for(let k=-l;k<=l;k++){
      const y=cy-k*S;
      ctx.beginPath(); ctx.moveTo(cx-L*S*1.15,y); ctx.lineTo(cx+L*S*1.15,y); ctx.stroke();
      ctx.textAlign='right'; ctx.fillStyle = k===ml?'#a4342c':'#b9b3a4';
      ctx.fillText(`${k>0?'+':''}${k}ħ`, cx-L*S*1.2, y+4);
    }
    ctx.setLineDash([]);

    // every allowed orientation, with the selected one solid
    for(let k=-l;k<=l;k++){
      const cosT=k/L, sinT=Math.sqrt(Math.max(0,1-cosT*cosT));
      const tipX=cx+L*S*sinT, tipY=cy-L*S*cosT;
      const on=(k===ml);
      ctx.strokeStyle = on?'#a4342c':'#ddd8cc'; ctx.lineWidth = on?2.8:1.4;
      ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(tipX,tipY); ctx.stroke();
      if(on){
        ctx.fillStyle='#a4342c'; ctx.beginPath(); ctx.arc(tipX,tipY,5,0,7); ctx.fill();
        // the cone the vector precesses around: Lx and Ly stay unknown
        ctx.strokeStyle='rgba(164,52,44,0.45)'; ctx.lineWidth=1.4;
        ctx.beginPath();
        ctx.ellipse(cx, tipY, L*S*sinT, L*S*sinT*0.26, 0, 0, 2*Math.PI);
        ctx.stroke();
      }
    }
    // the sphere of possible |L|
    ctx.strokeStyle='#efebe2'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.arc(cx,cy,L*S,0,7); ctx.stroke();

    const bx=w*0.68;
    ctx.textAlign='left'; ctx.font='11px Helvetica,Arial,sans-serif';
    ctx.fillStyle='#1c1d20'; ctx.font='13px Helvetica,Arial,sans-serif';
    ctx.fillText(`ℓ = ${l}`, bx, h*0.24);
    ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle='#5a5d63';
    ctx.fillText(`|L| = √(ℓ(ℓ+1))ħ = ${fmt(L,3)}ħ`, bx, h*0.24+22);
    ctx.fillText(`largest component along z = ${l}ħ`, bx, h*0.24+40);
    ctx.fillStyle='#a4342c';
    ctx.fillText(`so L can never lie along z`, bx, h*0.24+62);
    ctx.fillStyle='#5a5d63';
    ctx.fillText(`${2*l+1} allowed orientations`, bx, h*0.24+84);
    if(l>0){
      const ang=Math.acos(ml/L)*180/Math.PI;
      ctx.fillText(`this one is ${fmt(ang,1)}° from z`, bx, h*0.24+102);
    }

    const ratio = l>0 ? l/L : 0;
    readout.innerHTML = `
      <div>orbital quantum number &ell; <b>${l}</b></div>
      <div>|L| <b>${fmt(L,4)}&#8463;</b></div>
      <div>m<sub>&ell;</sub> <b>${ml}</b></div>
      <div>L<sub>z</sub> <b>${ml}&#8463;</b></div>
      <div>angle to z <b>${l>0?fmt(Math.acos(ml/L)*180/Math.PI,2)+'&deg;':'undefined'}</b></div>
      <div>allowed orientations <b>${2*l+1}</b></div>
      <div>max L<sub>z</sub>/|L| <b>${l>0?fmt(ratio,4):'—'}</b>
        ${l>0?'<span class="badge no">always &lt; 1</span>':''}</div>`;
  }
  lEl.addEventListener('input',draw);
  mEl.addEventListener('input',draw);
  registerCanvas('am_canvas',draw);
}

/* =====================================================================
   5. SELECTION RULES
   ===================================================================== */
function setupSelectionRules(){
  const canvas=document.getElementById('sr_canvas');
  const nEl=document.getElementById('sr_n'), nVal=document.getElementById('sr_n_val');
  const lEl=document.getElementById('sr_l'), lVal=document.getElementById('sr_l_val');
  const readout=document.getElementById('sr_readout');
  const NMAX=5, LMAX=3;

  function draw(){
    const {ctx,w,h}=fitCanvas(canvas);
    const n=parseInt(nEl.value,10);
    lEl.max=n-1;
    let l=Math.min(parseInt(lEl.value,10), n-1); lEl.value=l;
    nVal.textContent=n; lVal.textContent=`${l} (${ORB[l]})`;
    ctx.clearRect(0,0,w,h);

    const m={l:96,r:26,t:38,b:34};        // room for "n=1   -13.60 eV" at the left
    const colW=(w-m.l-m.r)/(LMAX+1);
    const X=ll=>m.l+(ll+0.5)*colW;
    const E=k=>-E1_H/(k*k);
    const Y=e=>m.t+(e-E(1))/(0-E(1))*(h-m.t-m.b);

    ctx.font='12px Helvetica,Arial,sans-serif'; ctx.textAlign='center'; ctx.fillStyle='#5a5d63';
    for(let ll=0;ll<=LMAX;ll++) ctx.fillText(`ℓ = ${ll}  (${ORB[ll]})`, X(ll), m.t-16);

    // every level
    const lw=colW*0.62;
    for(let k=1;k<=NMAX;k++){
      for(let ll=0;ll<k && ll<=LMAX;ll++){
        const y=Y(E(k)), on=(k===n&&ll===l);
        const allowed = Math.abs(ll-l)===1 && !(k===n&&ll===l);
        ctx.strokeStyle = on?'#a4342c':(allowed?'#1f6f78':'#d8d3c6');
        ctx.lineWidth = on?3:(allowed?2:1.3);
        ctx.beginPath(); ctx.moveTo(X(ll)-lw/2,y); ctx.lineTo(X(ll)+lw/2,y); ctx.stroke();
        if(ll===0){
          // one line, not two: the upper levels crowd together and a second
          // line runs straight into the next level's label
          ctx.textAlign='right'; ctx.fillStyle='#8a8d92'; ctx.font='11px Helvetica,Arial,sans-serif';
          ctx.fillText(`n=${k}   ${fmt(E(k),2)} eV`, m.l-8, y+4);
        }
      }
    }
    // transitions down from the selected state that the rule permits
    let count=0;
    for(let k=1;k<n;k++){
      for(let ll=0;ll<k && ll<=LMAX;ll++){
        if(Math.abs(ll-l)!==1) continue;
        count++;
        const x1=X(l), y1=Y(E(n)), x2=X(ll), y2=Y(E(k));
        ctx.strokeStyle='rgba(31,111,120,0.75)'; ctx.lineWidth=1.8;
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
        ctx.fillStyle='rgba(31,111,120,0.75)';
        const a=Math.atan2(y2-y1,x2-x1);
        ctx.beginPath(); ctx.moveTo(x2,y2);
        ctx.lineTo(x2-9*Math.cos(a-0.4), y2-9*Math.sin(a-0.4));
        ctx.lineTo(x2-9*Math.cos(a+0.4), y2-9*Math.sin(a+0.4));
        ctx.closePath(); ctx.fill();
      }
    }
    // one forbidden example, drawn crossed out
    const forb = [];
    for(let k=1;k<n;k++) for(let ll=0;ll<k&&ll<=LMAX;ll++) if(Math.abs(ll-l)!==1) forb.push([k,ll]);
    if(forb.length){
      const [k,ll]=forb[0];
      const x1=X(l), y1=Y(E(n)), x2=X(ll), y2=Y(E(k));
      ctx.strokeStyle='rgba(164,52,44,0.35)'; ctx.lineWidth=1.6; ctx.setLineDash([4,4]);
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke(); ctx.setLineDash([]);
      const mx=(x1+x2)/2, my=(y1+y2)/2;
      ctx.strokeStyle='#a4342c'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(mx-6,my-6); ctx.lineTo(mx+6,my+6); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(mx+6,my-6); ctx.lineTo(mx-6,my+6); ctx.stroke();
      ctx.font='10px Helvetica,Arial,sans-serif'; ctx.fillStyle='#a4342c'; ctx.textAlign='left';
      ctx.fillText(`Δℓ = ${ll-l} forbidden`, mx+10, my-8);
    }
    ctx.font='11px Helvetica,Arial,sans-serif'; ctx.textAlign='left'; ctx.fillStyle='#5a5d63';
    ctx.fillText('teal: allowed by Δℓ = ±1.   grey: exists, but not reachable from here.', m.l, h-10);

    readout.innerHTML = `
      <div>starting state <b>${orbitalName(n,l)}</b></div>
      <div>selection rule <b>&Delta;&ell; = &plusmn;1</b></div>
      <div>also required <b>&Delta;m<sub>&ell;</sub> = 0, &plusmn;1</b></div>
      <div>allowed downward transitions <b>${count}</b></div>
      <div>blocked by the rule <b>${forb.length}</b></div>
      <div>reason <b>the photon carries 1&#8463; of angular momentum</b></div>`;
  }
  nEl.addEventListener('input',draw);
  lEl.addEventListener('input',draw);
  registerCanvas('sr_canvas',draw);
}

/* =====================================================================
   6. THE ZEEMAN EFFECT
   ===================================================================== */
function setupZeeman(){
  const cLev=document.getElementById('ze_canvas');
  const cLine=document.getElementById('ze_canvas_line');
  const BEl=document.getElementById('ze_B'), BVal=document.getElementById('ze_B_val');
  const lamEl=document.getElementById('ze_lam'), lamVal=document.getElementById('ze_lam_val');
  const lEl=document.getElementById('ze_l'), lVal=document.getElementById('ze_l_val');
  const readout=document.getElementById('ze_readout');

  function physics(){
    const B=parseFloat(BEl.value), lam=parseFloat(lamEl.value), l=parseInt(lEl.value,10);
    const dE = MU_B_EV*B;                        // eV per unit of m_l
    // normal Zeeman: the line splits into three, separated by dLambda
    const dLam = lam*lam*dE/HC_EV_NM;            // nm  (lambda^2 * dE / hc, with hc in eV nm)
    const dNu = dE*EV_J/H_J;                     // Hz
    return {B,lam,l,dE,dLam,dNu};
  }

  function drawLev(){
    const {ctx,w,h}=fitCanvas(cLev);
    const p=physics();
    ctx.clearRect(0,0,w,h);
    const m={l:80,r:30,t:30,b:34};
    const yUp=m.t+42, yLo=h-m.b-30;
    const spread=Math.min(34, (yLo-yUp)*0.13);

    // upper level splits into 2l+1; lower level is an s state and does not
    ctx.font='11px Helvetica,Arial,sans-serif';
    for(let ml=-p.l;ml<=p.l;ml++){
      const y=yUp-ml*spread;
      ctx.strokeStyle='#a4342c'; ctx.lineWidth=2.2;
      ctx.beginPath(); ctx.moveTo(m.l+60,y); ctx.lineTo(w-m.r-90,y); ctx.stroke();
      ctx.fillStyle='#a4342c'; ctx.textAlign='left';
      ctx.fillText(`mₗ = ${ml>0?'+':''}${ml}`, w-m.r-84, y+4);
    }
    ctx.strokeStyle='#1f6f78'; ctx.lineWidth=2.4;
    ctx.beginPath(); ctx.moveTo(m.l+60,yLo); ctx.lineTo(w-m.r-90,yLo); ctx.stroke();
    ctx.fillStyle='#1f6f78'; ctx.textAlign='right';
    ctx.fillText('mₗ = 0 — an s state does not split', w-m.r-4, yLo+4);

    // the field-free levels for reference
    ctx.strokeStyle='#d8d3c6'; ctx.lineWidth=1.4; ctx.setLineDash([4,3]);
    ctx.beginPath(); ctx.moveTo(m.l,yUp); ctx.lineTo(m.l+56,yUp); ctx.stroke();
    ctx.setLineDash([]);
    ctx.textAlign='right'; ctx.fillStyle='#8a8d92';
    ctx.fillText('no field', m.l-4, yUp+4);

    // the three transitions that the rule allows
    const xs=[w*0.40, w*0.50, w*0.60];
    [-1,0,1].forEach((dm,i)=>{
      if(Math.abs(dm)>p.l) return;
      const y1=yUp-dm*spread;
      ctx.strokeStyle = dm===0?'#1c1d20':'#1f6f78'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(xs[i],y1); ctx.lineTo(xs[i],yLo); ctx.stroke();
      ctx.fillStyle = dm===0?'#1c1d20':'#1f6f78';
      ctx.beginPath(); ctx.moveTo(xs[i],yLo);
      ctx.lineTo(xs[i]-5,yLo-10); ctx.lineTo(xs[i]+5,yLo-10); ctx.closePath(); ctx.fill();
      ctx.font='10px Helvetica,Arial,sans-serif'; ctx.textAlign='center';
      ctx.fillText(`Δmₗ=${dm>0?'+':''}${dm}`, xs[i], yLo+16);
    });
    ctx.font='11px Helvetica,Arial,sans-serif'; ctx.textAlign='left'; ctx.fillStyle='#5a5d63';
    ctx.fillText(`B = ${fmt(p.B,2)} T  →  each step is μʙB = ${fmtSci(p.dE,3)} eV`, m.l, m.t-12);
  }

  function drawLine(){
    const {ctx,w,h}=fitCanvas(cLine);
    const p=physics();
    ctx.clearRect(0,0,w,h);
    const m={l:30,r:30,t:34,b:44};
    const half=Math.max(p.dLam*2.4, 1e-6);
    const X=dl=>m.l+(dl+half)/(2*half)*(w-m.l-m.r);

    ctx.fillStyle='#15161a'; ctx.fillRect(m.l,m.t,w-m.l-m.r,h-m.t-m.b);
    const col=wavelengthToColor(p.lam);
    [-1,0,1].forEach(dm=>{
      const x=X(dm*p.dLam);
      const g=ctx.createLinearGradient(x-9,0,x+9,0);
      g.addColorStop(0,'rgba(0,0,0,0)'); g.addColorStop(0.5,col); g.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=g; ctx.fillRect(x-9,m.t,18,h-m.t-m.b);
      ctx.fillStyle=col; ctx.fillRect(x-1.2,m.t,2.4,h-m.t-m.b);
    });
    // where the unsplit line was
    ctx.strokeStyle='rgba(255,255,255,0.35)'; ctx.lineWidth=1; ctx.setLineDash([3,3]);
    ctx.beginPath(); ctx.moveTo(X(0),m.t); ctx.lineTo(X(0),h-m.b); ctx.stroke(); ctx.setLineDash([]);

    ctx.font='11px Helvetica,Arial,sans-serif'; ctx.textAlign='center'; ctx.fillStyle='#5a5d63';
    ctx.fillText(`${fmt(p.lam-p.dLam,4)} nm`, X(-p.dLam), h-m.b+16);
    ctx.fillText(`${fmt(p.lam,3)} nm`, X(0), h-m.b+30);
    ctx.fillText(`${fmt(p.lam+p.dLam,4)} nm`, X(p.dLam), h-m.b+16);
    ctx.fillStyle='#1c1d20'; ctx.textAlign='left';
    ctx.fillText('one line becomes three — the normal Zeeman effect', m.l, m.t-12);
  }

  function draw(){
    const p=physics();
    BVal.textContent=fmt(p.B,2); lamVal.textContent=fmt(p.lam,0); lVal.textContent=p.l;
    drawLev(); drawLine();
    readout.innerHTML = `
      <div>magnetic field B <b>${fmt(p.B,3)} T</b></div>
      <div>Bohr magneton &mu;<sub>B</sub> <b>${fmtSci(MU_B_J,4)} J/T</b></div>
      <div>level shift &mu;<sub>B</sub>B <b>${fmtSci(p.dE,3)} eV</b></div>
      <div>upper level splits into <b>${2*p.l+1}</b> sublevels</div>
      <div>frequency shift <b>${fmtSci(p.dNu,3)} Hz</b></div>
      <div>wavelength shift &Delta;&lambda; <b>${fmtSci(p.dLam,3)} nm</b></div>
      <div>&Delta;&lambda; in metres <b>${fmtSci(p.dLam*1e-9,3)} m</b></div>
      <div>lines observed <b>3</b> — whatever &ell; is</div>`;
  }
  [BEl,lamEl,lEl].forEach(el=>el.addEventListener('input',draw));
  registerCanvas('ze_canvas',draw);
  registerCanvas('ze_canvas_line',draw);
}

// register with the loader in app.js
registerModule('setupQuantumNumbers', setupQuantumNumbers);
registerModule('setupRadial', setupRadial);
registerModule('setupOrbitalShapes', setupOrbitalShapes);
registerModule('setupAngularMomentum', setupAngularMomentum);
registerModule('setupSelectionRules', setupSelectionRules);
registerModule('setupZeeman', setupZeeman);
