/* =====================================================================
   Concepts of Modern Physics — Interactive Companion
   Chapter 9: Statistical Mechanics
   Every number is computed live from the chapter's formulas.
   ===================================================================== */

const U_AMU = 1.6605e-27;          // kg
const K_EV  = 8.617e-5;            // Boltzmann constant, eV/K
const R_GAS = 8.314;               // J / mol K
const GASES = {
  H2:{name:'H₂', M:2.016}, He:{name:'He', M:4.003}, N2:{name:'N₂', M:28.014},
  O2:{name:'O₂', M:31.998}, CO2:{name:'CO₂', M:44.01}, Xe:{name:'Xe', M:131.29}
};
const METALS = {
  Na:{name:'sodium', n:2.65e28}, Cu:{name:'copper', n:8.49e28}, Ag:{name:'silver', n:5.86e28},
  Au:{name:'gold', n:5.90e28}, Al:{name:'aluminium', n:18.1e28}, Zn:{name:'zinc', n:13.2e28}
};
const SOLIDS = {
  Pb:{name:'lead', tD:105}, Ag:{name:'silver', tD:225}, Cu:{name:'copper', tD:343},
  Al:{name:'aluminium', tD:428}, Fe:{name:'iron', tD:470}, C:{name:'diamond', tD:2230}
};

/* =====================================================================
   1. THE MAXWELL-BOLTZMANN SPEED DISTRIBUTION
   ===================================================================== */
function setupMaxwell(){
  const canvas=document.getElementById('mw_canvas');
  const boxCanvas=document.getElementById('mw_box');
  const gasEl=document.getElementById('mw_gas');
  const tEl=document.getElementById('mw_t'), tVal=document.getElementById('mw_t_val');
  const resetEl=document.getElementById('mw_reset');
  const readout=document.getElementById('mw_readout');

  function speeds(M,T){
    const m=M*U_AMU;
    return {m,
      vp:Math.sqrt(2*K_B*T/m),
      vav:Math.sqrt(8*K_B*T/(Math.PI*m)),
      vrms:Math.sqrt(3*K_B*T/m)};
  }
  function nv(v,m,T){
    const a=m/(2*K_B*T);
    return 4*Math.PI*Math.pow(a/Math.PI,1.5)*v*v*Math.exp(-a*v*v);
  }

  /* ---- a real gas, simulated ----
     N molecules in a cubic box, bouncing elastically off the walls and off each
     other. Positions are in units of the box; velocities are in m/s, so the
     histogram of their speeds lands on the same axis as the analytic curve and
     can be compared with it directly. Only the drawing is two-dimensional — the
     dynamics, and therefore the distribution, are fully three-dimensional. */
  const N=170, RAD=0.030;
  const mol=[];                 // {x,y,z,vx,vy,vz}
  const NBIN=34;
  let hist=new Float64Array(NBIN), samples=0, binMax=1;
  let lastFrame=performance.now(), simT=300, simM=28;

  function gaussian(){
    let u=0,v=0;
    while(u===0) u=Math.random();
    while(v===0) v=Math.random();
    return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);
  }
  function clearHist(){ hist=new Float64Array(NBIN); samples=0; }

  // draw each velocity component from a Gaussian of width sqrt(kT/m): that is
  // exactly what makes the speeds Maxwell-Boltzmann
  function thermalise(M,T){
    const m=M*U_AMU, sig=Math.sqrt(K_B*T/m);
    mol.length=0;
    for(let i=0;i<N;i++){
      mol.push({x:Math.random(), y:Math.random(), z:Math.random(),
                vx:gaussian()*sig, vy:gaussian()*sig, vz:gaussian()*sig});
    }
    simT=T; simM=M; clearHist();
  }
  // every molecule at the rms speed, directions random: the same total energy,
  // the wrong distribution, and collisions alone fix it
  function sameSpeed(M,T){
    const m=M*U_AMU, v=Math.sqrt(3*K_B*T/m);
    mol.length=0;
    for(let i=0;i<N;i++){
      const ct=2*Math.random()-1, st=Math.sqrt(1-ct*ct), ph=2*Math.PI*Math.random();
      mol.push({x:Math.random(), y:Math.random(), z:Math.random(),
                vx:v*st*Math.cos(ph), vy:v*st*Math.sin(ph), vz:v*ct});
    }
    simT=T; simM=M; clearHist();
  }

  function step(dt, vScale){
    const d = dt*vScale;
    for(let i=0;i<N;i++){
      const p=mol[i];
      p.x+=p.vx*d; p.y+=p.vy*d; p.z+=p.vz*d;
      if(p.x<RAD){ p.x=RAD; p.vx=Math.abs(p.vx); } else if(p.x>1-RAD){ p.x=1-RAD; p.vx=-Math.abs(p.vx); }
      if(p.y<RAD){ p.y=RAD; p.vy=Math.abs(p.vy); } else if(p.y>1-RAD){ p.y=1-RAD; p.vy=-Math.abs(p.vy); }
      if(p.z<RAD){ p.z=RAD; p.vz=Math.abs(p.vz); } else if(p.z>1-RAD){ p.z=1-RAD; p.vz=-Math.abs(p.vz); }
    }
    // equal masses: an elastic collision just swaps the velocity components
    // along the line of centres
    const D2=(2*RAD)*(2*RAD);
    for(let i=0;i<N;i++){
      const a=mol[i];
      for(let j=i+1;j<N;j++){
        const b=mol[j];
        const dx=b.x-a.x, dy=b.y-a.y, dz=b.z-a.z;
        const r2=dx*dx+dy*dy+dz*dz;
        if(r2>D2 || r2<1e-12) continue;
        const r=Math.sqrt(r2), nx=dx/r, ny=dy/r, nz=dz/r;
        const dvx=b.vx-a.vx, dvy=b.vy-a.vy, dvz=b.vz-a.vz;
        const along=dvx*nx+dvy*ny+dvz*nz;
        if(along>0) continue;                      // already separating
        a.vx+=along*nx; a.vy+=along*ny; a.vz+=along*nz;
        b.vx-=along*nx; b.vy-=along*ny; b.vz-=along*nz;
        const push=(2*RAD-r)/2 + 1e-4;             // unstick them
        a.x-=nx*push; a.y-=ny*push; a.z-=nz*push;
        b.x+=nx*push; b.y+=ny*push; b.z+=nz*push;
      }
    }
  }

  function accumulate(){
    for(let i=0;i<N;i++){
      const p=mol[i];
      const v=Math.sqrt(p.vx*p.vx+p.vy*p.vy+p.vz*p.vz);
      const k=Math.floor(v/binMax*NBIN);
      if(k>=0 && k<NBIN) hist[k]++;
    }
    samples++;
  }

  function drawBox(){
    if(!boxCanvas) return;
    const {ctx,w,h}=fitCanvas(boxCanvas);
    ctx.clearRect(0,0,w,h);
    const S=Math.min(w,h)-10, x0=(w-S)/2, y0=(h-S)/2;
    ctx.fillStyle='#fffdf8'; ctx.fillRect(x0,y0,S,S);
    ctx.strokeStyle='#d8d3c6'; ctx.lineWidth=1; ctx.strokeRect(x0,y0,S,S);
    const vr=Math.sqrt(3*K_B*simT/(simM*U_AMU));
    // paint the faster molecules warm and the slower ones cool, so the spread
    // of speeds is visible in the box itself and not only in the histogram
    for(let i=0;i<N;i++){
      const p=mol[i];
      const v=Math.sqrt(p.vx*p.vx+p.vy*p.vy+p.vz*p.vz);
      const t=Math.max(0,Math.min(1,v/(1.8*vr)));
      const depth=0.45+0.55*p.z;                     // further away = paler
      // slow -> teal, middling -> gold, fast -> red
      const stops=[[31,111,120],[201,162,39],[164,52,44]];
      const f=t*2, k=f<1?0:1, u=f<1?f:f-1;
      const r=Math.round(stops[k][0]+(stops[k+1][0]-stops[k][0])*u);
      const g=Math.round(stops[k][1]+(stops[k+1][1]-stops[k][1])*u);
      const bl=Math.round(stops[k][2]+(stops[k+1][2]-stops[k][2])*u);
      ctx.fillStyle=`rgba(${r},${g},${bl},${depth})`;
      ctx.beginPath();
      ctx.arc(x0+p.x*S, y0+p.y*S, RAD*S*(0.55+0.45*p.z), 0, 7);
      ctx.fill();
    }
  }

  function draw(){
    const {ctx,w,h}=fitCanvas(canvas);
    const g=GASES[gasEl.value], T=parseFloat(tEl.value);
    tVal.textContent=fmt(T,0);
    const s=speeds(g.M,T);
    ctx.clearRect(0,0,w,h);
    const m={l:56,r:18,t:26,b:38};
    const vmax=s.vrms*3;
    const peak=nv(s.vp,s.m,T);
    const {X,Y}=drawAxes(ctx,w,h,m,0,vmax,0,peak*1.15,'molecular speed (m/s)','relative number',
                         {nx:5,ny:4,xfmt:v=>v.toFixed(0),yfmt:()=>''});
    // every gas at this temperature, faintly, for comparison
    Object.keys(GASES).forEach(k=>{
      if(k===gasEl.value) return;
      const s2=speeds(GASES[k].M,T);
      const pts=[]; for(let v=1;v<=vmax;v+=vmax/300) pts.push({x:v,y:nv(v,s2.m,T)});
      plotLine(ctx,X,Y,pts,'#e4dfd4',1.4);
    });
    // the simulated gas, binned — an estimate of the very curve above it
    binMax = vmax;
    if(samples>0){
      const bw = vmax/NBIN;
      ctx.save();
      ctx.fillStyle='rgba(31,111,120,0.30)';
      ctx.strokeStyle='rgba(31,111,120,0.55)'; ctx.lineWidth=1;
      for(let k=0;k<NBIN;k++){
        const pdf = hist[k]/(samples*N*bw);        // counts -> probability density
        if(!(pdf>0)) continue;
        const xA=X(k*bw), xB=X((k+1)*bw), yT=Y(pdf);
        if(yT < m.t) continue;
        ctx.fillRect(xA, yT, Math.max(1,xB-xA-1), Y(0)-yT);
        ctx.strokeRect(xA, yT, Math.max(1,xB-xA-1), Y(0)-yT);
      }
      ctx.restore();
    }

    const pts=[]; for(let v=1;v<=vmax;v+=vmax/400) pts.push({x:v,y:nv(v,s.m,T)});
    ctx.save(); ctx.fillStyle='rgba(164,52,44,0.10)'; ctx.beginPath(); ctx.moveTo(X(0),Y(0));
    pts.forEach(p=>ctx.lineTo(X(p.x),Y(p.y))); ctx.lineTo(X(vmax),Y(0)); ctx.closePath(); ctx.fill(); ctx.restore();
    plotLine(ctx,X,Y,pts,'#a4342c',2.6);

    [[s.vp,'#1f6f78','most probable'],[s.vav,'#8a6d1f','average'],[s.vrms,'#1c1d20','rms']].forEach(([v,col,lab],i)=>{
      plotLine(ctx,X,Y,[{x:v,y:0},{x:v,y:nv(v,s.m,T)}],col,1.8,[4,3]);
      ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle=col; ctx.textAlign='left';
      ctx.fillText(`${lab} ${fmt(v,0)}`, X(v)+5, m.t+48+i*15);   // below the legend block
    });
    ctx.font='11px Helvetica,Arial,sans-serif'; ctx.textAlign='right'; ctx.fillStyle='#5a5d63';
    ctx.fillText(`${g.name} at ${fmt(T,0)} K — the other gases are shown faintly`, w-m.r-8, m.t+14);
    if(samples>0){
      ctx.fillStyle='#1f6f78';
      ctx.fillText(`teal bars: the ${N} simulated molecules, sampled as they fly`, w-m.r-8, m.t+30);
    }

    // escape speeds put the distribution in context
    const vEsc=11200, vEscMoon=2380;
    readout.innerHTML = `
      <div>gas <b>${g.name}</b>, M = ${g.M} u</div>
      <div>temperature <b>${fmt(T,0)} K</b></div>
      <div>most probable &radic;(2kT/m) <b>${fmt(s.vp,0)} m/s</b></div>
      <div>average &radic;(8kT/&pi;m) <b>${fmt(s.vav,0)} m/s</b></div>
      <div>rms &radic;(3kT/m) <b>${fmt(s.vrms,0)} m/s</b></div>
      <div>rms / average <b>${fmt(s.vrms/s.vav,4)}</b> — always &radic;(3&pi;/8)</div>
      <div>v<sub>rms</sub> / earth escape speed <b>${fmt(s.vrms/vEsc,3)}</b></div>
      <div>v<sub>rms</sub> / moon escape speed <b>${fmt(s.vrms/vEscMoon,3)}</b></div>`;
  }
  function loop(now){
    const dt=Math.min(0.05,(now-lastFrame)/1000); lastFrame=now;
    const active=document.getElementById('ch9') && document.getElementById('ch9').classList.contains('active');
    if(active && !prefersReducedMotion() && mol.length){
      const vr=Math.sqrt(3*K_B*simT/(simM*U_AMU));
      // cross the box in about four seconds whatever the real speed is
      step(dt, 0.25/vr);
      accumulate();
      drawBox();
      draw();
    }
    requestAnimationFrame(loop);
  }

  function reThermalise(){
    thermalise(GASES[gasEl.value].M, parseFloat(tEl.value));
    drawBox(); draw();
  }
  gasEl.addEventListener('change',reThermalise);
  tEl.addEventListener('input',reThermalise);
  if(resetEl) resetEl.addEventListener('click',()=>{
    sameSpeed(GASES[gasEl.value].M, parseFloat(tEl.value));
    drawBox(); draw();
  });
  registerCanvas('mw_canvas',draw);
  registerCanvas('mw_box',drawBox);
  thermalise(GASES[gasEl.value].M, parseFloat(tEl.value));
  requestAnimationFrame(loop);
}

/* =====================================================================
   2. THE ENERGY DISTRIBUTION AND ACTIVATION
   ===================================================================== */
function setupEnergyDist(){
  const canvas=document.getElementById('me_canvas');
  const tEl=document.getElementById('me_t'), tVal=document.getElementById('me_t_val');
  const eaEl=document.getElementById('me_ea'), eaVal=document.getElementById('me_ea_val');
  const readout=document.getElementById('me_readout');

  // n(E) ∝ sqrt(E) exp(-E/kT), normalised
  function nE(E,kT){ return (2/Math.sqrt(Math.PI))*Math.pow(kT,-1.5)*Math.sqrt(E)*Math.exp(-E/kT); }

  function draw(){
    const {ctx,w,h}=fitCanvas(canvas);
    const T=parseFloat(tEl.value), Ea=parseFloat(eaEl.value);
    tVal.textContent=fmt(T,0); eaVal.textContent=fmt(Ea,2);
    const kT=K_EV*T;
    ctx.clearRect(0,0,w,h);
    const m={l:56,r:18,t:26,b:38};
    const Emax=Math.max(Ea*1.6, kT*9);
    const peak=nE(kT/2,kT);
    const {X,Y}=drawAxes(ctx,w,h,m,0,Emax,0,peak*1.12,'molecular energy (eV)','relative number',
                         {nx:5,ny:4,xfmt:v=>v.toFixed(2),yfmt:()=>''});
    const pts=[]; for(let E=0.0001;E<=Emax;E+=Emax/500) pts.push({x:E,y:nE(E,kT)});
    plotLine(ctx,X,Y,pts,'#a4342c',2.6);
    // the tail beyond the activation energy
    ctx.save(); ctx.fillStyle='rgba(31,111,120,0.30)'; ctx.beginPath(); ctx.moveTo(X(Ea),Y(0));
    for(let E=Ea;E<=Emax;E+=Emax/400) ctx.lineTo(X(E),Y(nE(E,kT)));
    ctx.lineTo(X(Emax),Y(0)); ctx.closePath(); ctx.fill(); ctx.restore();
    plotLine(ctx,X,Y,[{x:Ea,y:0},{x:Ea,y:peak*1.06}],'#1f6f78',2);
    plotLine(ctx,X,Y,[{x:1.5*kT,y:0},{x:1.5*kT,y:nE(1.5*kT,kT)}],'#1c1d20',1.6,[3,3]);

    // fraction above Ea, integrated numerically
    let above=0, total=0;
    const dE=Emax*4/6000;
    for(let E=1e-6;E<=Emax*4;E+=dE){ const v=nE(E,kT)*dE; total+=v; if(E>=Ea) above+=v; }
    const frac=above/total;

    ctx.font='11px Helvetica,Arial,sans-serif'; ctx.textAlign='left';
    ctx.fillStyle='#1f6f78'; ctx.fillText(`Eₐ = ${fmt(Ea,2)} eV`, X(Ea)+6, m.t+14);
    ctx.fillText(`${fmtSci(frac,2)} of molecules are above it`, X(Ea)+6, m.t+30);
    ctx.fillStyle='#1c1d20'; ctx.fillText(`⟨E⟩ = 3kT/2`, X(1.5*kT)+5, Y(nE(1.5*kT,kT))-8);

    const frac2=(()=>{ const kT2=K_EV*(T+10); let a=0,t=0;
      for(let E=1e-6;E<=Emax*4;E+=dE){ const v=nE(E,kT2)*dE; t+=v; if(E>=Ea) a+=v; } return a/t; })();
    readout.innerHTML = `
      <div>temperature <b>${fmt(T,0)} K</b></div>
      <div>kT <b>${fmt(kT,4)} eV</b></div>
      <div>average energy 3kT/2 <b>${fmt(1.5*kT,4)} eV</b></div>
      <div>most probable energy kT/2 <b>${fmt(0.5*kT,4)} eV</b></div>
      <div>activation energy E<sub>a</sub> <b>${fmt(Ea,3)} eV</b> = ${fmt(Ea/kT,1)} kT</div>
      <div>fraction above E<sub>a</sub> <b>${fmtSci(frac,3)}</b></div>
      <div>after a 10 K rise <b>${fmtSci(frac2,3)}</b></div>
      <div>rate multiplied by <b>${fmt(frac2/frac,2)}&times;</b> for 10 K
        ${frac2/frac>1.8?'<span class="badge no">chemistry is exquisitely temperature-sensitive</span>':''}</div>`;
  }
  tEl.addEventListener('input',draw);
  eaEl.addEventListener('input',draw);
  registerCanvas('me_canvas',draw);
}

/* =====================================================================
   3. THE THREE STATISTICS
   ===================================================================== */
function setupThreeStats(){
  const canvas=document.getElementById('st_canvas');
  const tEl=document.getElementById('st_t'), tVal=document.getElementById('st_t_val');
  const aEl=document.getElementById('st_alpha'), aVal=document.getElementById('st_alpha_val');
  const readout=document.getElementById('st_readout');

  function draw(){
    const {ctx,w,h}=fitCanvas(canvas);
    const T=parseFloat(tEl.value);
    const mu=parseFloat(aEl.value);                 // chemical potential, eV
    tVal.textContent=fmt(T,0); aVal.textContent=fmt(mu,2);
    const kT=K_EV*T;
    ctx.clearRect(0,0,w,h);
    const m={l:58,r:18,t:26,b:38};
    const Emax=Math.max(mu+8*kT, 6*kT);
    const {X,Y}=drawAxes(ctx,w,h,m,0,Emax,0,2.4,'energy ε (eV)','average occupancy of a state',
                         {nx:5,ny:4,xfmt:v=>v.toFixed(2),yfmt:v=>v.toFixed(1)});
    plotLine(ctx,X,Y,[{x:0,y:1},{x:Emax,y:1}],'#e4dfd4',1.4);

    const mb=[],be=[],fd=[];
    for(let E=0.0005;E<=Emax;E+=Emax/600){
      const x=(E-mu)/kT;
      mb.push({x:E, y:Math.min(2.4, Math.exp(-x))});
      const b=Math.exp(x)-1;
      be.push({x:E, y: b>1e-6 ? Math.min(2.4, 1/b) : null});
      fd.push({x:E, y:1/(Math.exp(x)+1)});
    }
    plotLine(ctx,X,Y,be,'#8a6d1f',2.4);
    plotLine(ctx,X,Y,mb,'#8a8d92',2,[5,3]);
    plotLine(ctx,X,Y,fd,'#a4342c',2.8);
    plotLine(ctx,X,Y,[{x:mu,y:0},{x:mu,y:2.4}],'#1f6f78',1.6,[3,3]);

    ctx.font='11px Helvetica,Arial,sans-serif'; ctx.textAlign='right';
    ctx.fillStyle='#8a6d1f'; ctx.fillText('Bose–Einstein — bosons crowd in', w-m.r-8, m.t+14);
    ctx.fillStyle='#8a8d92'; ctx.fillText('Maxwell–Boltzmann — classical', w-m.r-8, m.t+30);
    ctx.fillStyle='#a4342c'; ctx.fillText('Fermi–Dirac — never above 1', w-m.r-8, m.t+46);
    ctx.fillStyle='#1f6f78'; ctx.textAlign='left';
    ctx.fillText('ε = μ', X(mu)+5, h-m.b-8);
    ctx.fillStyle='#5a5d63';
    ctx.fillText('all three merge once ε − μ exceeds a few kT', m.l+8, m.t+14);

    const at = E => {
      const x=(E-mu)/kT;
      return {mb:Math.exp(-x), be:1/(Math.exp(x)-1), fd:1/(Math.exp(x)+1)};
    };
    const hi=at(mu+4*kT), lo=at(mu+0.5*kT);
    readout.innerHTML = `
      <div>temperature <b>${fmt(T,0)} K</b>, kT = ${fmt(kT,4)} eV</div>
      <div>chemical potential &mu; <b>${fmt(mu,3)} eV</b></div>
      <div>at &epsilon; = &mu;: FD <b>0.500</b> exactly</div>
      <div>at &epsilon; = &mu; + &frac12;kT: MB ${fmt(lo.mb,3)}, BE ${fmt(lo.be,3)}, FD <b>${fmt(lo.fd,3)}</b></div>
      <div>at &epsilon; = &mu; + 4kT: MB ${fmt(hi.mb,4)}, BE ${fmt(hi.be,4)}, FD <b>${fmt(hi.fd,4)}</b></div>
      <div>BE / MB there <b>${fmt(hi.be/hi.mb,4)}</b></div>
      <div>FD / MB there <b>${fmt(hi.fd/hi.mb,4)}</b>
        <span class="badge ok">both within 2% of classical</span></div>`;
  }
  tEl.addEventListener('input',draw);
  aEl.addEventListener('input',draw);
  registerCanvas('st_canvas',draw);
}

/* =====================================================================
   4. WHERE PLANCK'S LAW COMES FROM
   ===================================================================== */
function setupPlanckDerivation(){
  const canvas=document.getElementById('pd_canvas');
  const tEl=document.getElementById('pd_t'), tVal=document.getElementById('pd_t_val');
  const readout=document.getElementById('pd_readout');

  function draw(){
    const {ctx,w,h}=fitCanvas(canvas);
    const T=parseFloat(tEl.value);
    tVal.textContent=fmt(T,0);
    const kT=K_B*T;
    ctx.clearRect(0,0,w,h);
    const m={l:58,r:18,t:26,b:38};
    // plot average energy per mode against h*nu / kT
    const xmax=8;
    const {X,Y}=drawAxes(ctx,w,h,m,0,xmax,0,1.15,'hν / kT','average energy per mode, in units of kT',
                         {nx:4,ny:4,xfmt:v=>v.toFixed(0),yfmt:v=>v.toFixed(1)});
    // equipartition says kT for every mode, forever
    plotLine(ctx,X,Y,[{x:0,y:1},{x:xmax,y:1}],'#8a8d92',2.2,[5,3]);
    // Bose-Einstein says hv/(e^(hv/kT) - 1)
    const pts=[];
    for(let x=0.02;x<=xmax;x+=xmax/500) pts.push({x, y:x/(Math.exp(x)-1)});
    plotLine(ctx,X,Y,pts,'#a4342c',2.8);

    ctx.font='11px Helvetica,Arial,sans-serif'; ctx.textAlign='right';
    ctx.fillStyle='#8a8d92'; ctx.fillText('classical equipartition: kT per mode', w-m.r-8, m.t+14);
    ctx.fillStyle='#a4342c'; ctx.fillText('Bose–Einstein: hν/(e^(hν/kT) − 1)', w-m.r-8, m.t+30);
    ctx.textAlign='left'; ctx.fillStyle='#5a5d63';
    ctx.fillText('the two agree only where the quantum is small compared with kT', m.l+8, h-m.b-10);
    // mark where they part company
    const xHalf=(()=>{ for(let x=0.02;x<8;x+=0.001){ if(x/(Math.exp(x)-1)<0.5) return x; } return 8; })();
    plotLine(ctx,X,Y,[{x:xHalf,y:0},{x:xHalf,y:0.5}],'#1f6f78',1.6,[3,3]);
    ctx.fillStyle='#1f6f78';
    ctx.fillText(`half of kT at hν = ${fmt(xHalf,2)}kT`, X(xHalf)+6, Y(0.5)-7);

    // where visible light sits at this temperature
    const nuVis=C_EXACT/550e-9;
    const xVis=H_J*nuVis/kT;
    if(xVis<=xmax){
      dotAt(ctx,X,Y,xVis,xVis/(Math.exp(xVis)-1),'#1c1d20',5);
      ctx.fillStyle='#1c1d20'; ctx.fillText('550 nm light', X(xVis)+7, Y(xVis/(Math.exp(xVis)-1))-6);
    }

    const occVis=1/(Math.exp(xVis)-1);
    readout.innerHTML = `
      <div>temperature <b>${fmt(T,0)} K</b>, kT = ${fmtSci(kT/EV_J,3)} eV</div>
      <div>modes per unit volume grow as <b>&nu;&sup2;</b></div>
      <div>classical energy per mode <b>kT</b>, whatever &nu;</div>
      <div>quantum energy per mode <b>h&nu;/(e^(h&nu;/kT)&minus;1)</b></div>
      <div>at h&nu; = kT it is already <b>${fmt(1/(Math.E-1),3)} kT</b></div>
      <div>for 550 nm light h&nu;/kT <b>${fmt(xVis,2)}</b></div>
      <div>average photons in such a mode <b>${fmtSci(occVis,2)}</b></div>
      <div>so the ultraviolet catastrophe <b>${xVis>6?'is suppressed exponentially':'is only just beginning'}</b></div>`;
  }
  tEl.addEventListener('input',draw);
  registerCanvas('pd_canvas',draw);
}

/* =====================================================================
   5. SPECIFIC HEATS OF SOLIDS
   ===================================================================== */
function setupSpecificHeat(){
  const canvas=document.getElementById('cv_canvas');
  const solEl=document.getElementById('cv_sol');
  const tEl=document.getElementById('cv_t'), tVal=document.getElementById('cv_t_val');
  const readout=document.getElementById('cv_readout');

  function einstein(T,tE){
    const x=tE/T;
    if(x>60) return 0;
    const e=Math.exp(x);
    return 3*R_GAS*x*x*e/Math.pow(e-1,2);
  }
  function debye(T,tD){
    const xm=tD/T;
    if(xm>50) return 3*R_GAS*(4*Math.pow(Math.PI,4)/5)/Math.pow(xm,3);
    const N=400; let s=0;
    for(let i=1;i<=N;i++){
      const x=xm*i/N;
      const e=Math.exp(x);
      s += (Math.pow(x,4)*e/Math.pow(e-1,2))*(xm/N);
    }
    return 9*R_GAS*s/Math.pow(xm,3);
  }

  function draw(){
    const {ctx,w,h}=fitCanvas(canvas);
    const sol=SOLIDS[solEl.value];
    const T=parseFloat(tEl.value);
    tVal.textContent=fmt(T,0);
    const tE=0.75*sol.tD;
    ctx.clearRect(0,0,w,h);
    const m={l:60,r:18,t:26,b:38};
    const Tmax=sol.tD*1.9;
    const {X,Y}=drawAxes(ctx,w,h,m,0,Tmax,0,3*R_GAS*1.12,'temperature (K)','molar heat capacity (J/mol K)',
                         {nx:5,ny:4,xfmt:v=>v.toFixed(0),yfmt:v=>v.toFixed(0)});
    plotLine(ctx,X,Y,[{x:0,y:3*R_GAS},{x:Tmax,y:3*R_GAS}],'#8a8d92',2,[5,3]);
    const de=[],ei=[];
    for(let t=Tmax/400;t<=Tmax;t+=Tmax/400){ de.push({x:t,y:debye(t,sol.tD)}); ei.push({x:t,y:einstein(t,tE)}); }
    plotLine(ctx,X,Y,ei,'#1f6f78',2.2,[4,3]);
    plotLine(ctx,X,Y,de,'#a4342c',2.8);
    dotAt(ctx,X,Y,T,debye(T,sol.tD),'#1c1d20',5.5);
    plotLine(ctx,X,Y,[{x:sol.tD,y:0},{x:sol.tD,y:3*R_GAS}],'#e0dbd0',1.4,[3,3]);

    ctx.font='11px Helvetica,Arial,sans-serif'; ctx.textAlign='left';
    // labels the 3R asymptote, which runs along the top — keep it clear of the
    // legend in the top-left corner
    ctx.textAlign='right';
    ctx.fillStyle='#8a8d92'; ctx.fillText('Dulong–Petit: 3R, independent of T', w-m.r-8, Y(3*R_GAS)-8);
    ctx.textAlign='left';
    ctx.fillStyle='#a4342c'; ctx.fillText('Debye', m.l+8, m.t+16);
    ctx.fillStyle='#1f6f78'; ctx.fillText('Einstein', m.l+8, m.t+32);
    ctx.fillStyle='#8a8d92'; ctx.textAlign='center';
    ctx.fillText(`θᴅ = ${sol.tD} K`, X(sol.tD), h-m.b+16);

    const cD=debye(T,sol.tD), cE=einstein(T,tE);
    readout.innerHTML = `
      <div>solid <b>${sol.name}</b></div>
      <div>Debye temperature &theta;<sub>D</sub> <b>${sol.tD} K</b></div>
      <div>temperature <b>${fmt(T,0)} K</b> = ${fmt(T/sol.tD,3)} &theta;<sub>D</sub></div>
      <div>Dulong&ndash;Petit 3R <b>${fmt(3*R_GAS,2)} J/mol K</b></div>
      <div>Debye c<sub>V</sub> <b>${fmt(cD,2)} J/mol K</b> = ${fmt(cD/(3*R_GAS)*100,1)}% of 3R</div>
      <div>Einstein c<sub>V</sub> <b>${fmt(cE,2)} J/mol K</b></div>
      <div>Debye's low-T law <b>c<sub>V</sub> &prop; T&sup3;</b>
        ${T<sol.tD/10?'<span class="badge ok">this regime</span>':''}</div>`;
  }
  solEl.addEventListener('change',draw);
  tEl.addEventListener('input',draw);
  registerCanvas('cv_canvas',draw);
}

/* =====================================================================
   6. FREE ELECTRONS IN A METAL
   ===================================================================== */
function setupFreeElectrons(){
  const cDist=document.getElementById('fe_canvas');
  const cOcc=document.getElementById('fe_canvas_occ');
  const metEl=document.getElementById('fe_metal');
  const tEl=document.getElementById('fe_t'), tVal=document.getElementById('fe_t_val');
  const readout=document.getElementById('fe_readout');

  function fermiEnergy(n){
    // E_F = (h^2/2m)(3n/8pi)^(2/3)
    return (H_J*H_J/(2*M_E))*Math.pow(3*n/(8*Math.PI),2/3)/EV_J;
  }
  const fd=(E,EF,kT)=> 1/(Math.exp((E-EF)/kT)+1);

  function drawOcc(){
    const {ctx,w,h}=fitCanvas(cOcc);
    const met=METALS[metEl.value], T=parseFloat(tEl.value);
    const EF=fermiEnergy(met.n), kT=K_EV*T;
    ctx.clearRect(0,0,w,h);
    const m={l:56,r:18,t:26,b:38};
    const Emax=EF*1.6;
    const {X,Y}=drawAxes(ctx,w,h,m,0,Emax,0,1.12,'electron energy (eV)','occupancy f(ε)',
                         {nx:4,ny:4,xfmt:v=>v.toFixed(1),yfmt:v=>v.toFixed(1)});
    // the T = 0 step, for comparison
    plotLine(ctx,X,Y,[{x:0,y:1},{x:EF,y:1}],'#8a8d92',2,[5,3]);
    plotLine(ctx,X,Y,[{x:EF,y:1},{x:EF,y:0}],'#8a8d92',2,[5,3]);
    plotLine(ctx,X,Y,[{x:EF,y:0},{x:Emax,y:0}],'#8a8d92',2,[5,3]);
    const pts=[]; for(let E=0;E<=Emax;E+=Emax/500) pts.push({x:E,y:fd(E,EF,kT)});
    plotLine(ctx,X,Y,pts,'#a4342c',2.8);
    // the smeared region is only a few kT wide
    ctx.save(); ctx.fillStyle='rgba(31,111,120,0.18)';
    ctx.fillRect(X(EF-2*kT), m.t, X(EF+2*kT)-X(EF-2*kT), h-m.b-m.t); ctx.restore();
    ctx.font='11px Helvetica,Arial,sans-serif'; ctx.textAlign='center'; ctx.fillStyle='#1f6f78';
    ctx.fillText('±2kT', X(EF), m.t+13);
    ctx.textAlign='left'; ctx.fillStyle='#8a8d92';
    ctx.fillText('T = 0: a perfect step', m.l+8, Y(1)-7);
    ctx.fillStyle='#a4342c'; ctx.textAlign='right';
    ctx.fillText(`${fmt(T,0)} K`, w-m.r-8, m.t+14);
  }

  function drawDist(){
    const {ctx,w,h}=fitCanvas(cDist);
    const met=METALS[metEl.value], T=parseFloat(tEl.value);
    const EF=fermiEnergy(met.n), kT=K_EV*T;
    ctx.clearRect(0,0,w,h);
    const m={l:56,r:18,t:26,b:38};
    const Emax=EF*1.6;
    // n(E) = g(E) f(E), with g proportional to sqrt(E)
    const peak=Math.sqrt(EF);
    const {X,Y}=drawAxes(ctx,w,h,m,0,Emax,0,peak*1.18,'electron energy (eV)','electrons per unit energy',
                         {nx:4,ny:4,xfmt:v=>v.toFixed(1),yfmt:()=>''});
    const pts=[]; for(let E=0;E<=Emax;E+=Emax/500) pts.push({x:E,y:Math.sqrt(E)*fd(E,EF,kT)});
    ctx.save(); ctx.fillStyle='rgba(164,52,44,0.16)'; ctx.beginPath(); ctx.moveTo(X(0),Y(0));
    pts.forEach(p=>ctx.lineTo(X(p.x),Y(p.y))); ctx.lineTo(X(Emax),Y(0)); ctx.closePath(); ctx.fill(); ctx.restore();
    plotLine(ctx,X,Y,pts,'#a4342c',2.6);
    plotLine(ctx,X,Y,[{x:EF,y:0},{x:EF,y:peak*1.1}],'#1f6f78',1.8,[4,3]);
    ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle='#1f6f78'; ctx.textAlign='left';
    ctx.fillText(`ε_F = ${fmt(EF,2)} eV`, X(EF)+6, m.t+14);
    ctx.fillStyle='#5a5d63';
    ctx.fillText('only the electrons near the top can absorb thermal energy', m.l+8, m.t+14);
  }

  function draw(){
    const met=METALS[metEl.value], T=parseFloat(tEl.value);
    tVal.textContent=fmt(T,0);
    drawDist(); drawOcc();
    const EF=fermiEnergy(met.n), kT=K_EV*T;
    const TF=EF/K_EV;
    const frac=kT/EF;
    const vF=Math.sqrt(2*EF*EV_J/M_E);
    readout.innerHTML = `
      <div>metal <b>${met.name}</b></div>
      <div>electron density n <b>${fmtSci(met.n,3)} m&#8315;&sup3;</b></div>
      <div>Fermi energy &epsilon;<sub>F</sub> <b>${fmt(EF,3)} eV</b></div>
      <div>Fermi temperature &epsilon;<sub>F</sub>/k <b>${fmtSci(TF,3)} K</b></div>
      <div>kT at ${fmt(T,0)} K <b>${fmt(kT,4)} eV</b></div>
      <div>kT / &epsilon;<sub>F</sub> <b>${fmtSci(frac,2)}</b></div>
      <div>fraction of electrons that can respond <b>&asymp; ${fmt(frac*100,2)}%</b></div>
      <div>Fermi speed <b>${fmtSci(vF,3)} m/s</b> — at absolute zero</div>`;
  }
  metEl.addEventListener('change',draw);
  tEl.addEventListener('input',draw);
  registerCanvas('fe_canvas',draw);
  registerCanvas('fe_canvas_occ',draw);
}

// register with the loader in app.js
registerModule('setupMaxwell', setupMaxwell);
registerModule('setupEnergyDist', setupEnergyDist);
registerModule('setupThreeStats', setupThreeStats);
registerModule('setupPlanckDerivation', setupPlanckDerivation);
registerModule('setupSpecificHeat', setupSpecificHeat);
registerModule('setupFreeElectrons', setupFreeElectrons);
