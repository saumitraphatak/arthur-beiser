/* =====================================================================
   Concepts of Modern Physics — Interactive Companion
   Chapter 2: Particle Properties of Waves
   Every number is computed live from the chapter's formulas.
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
  // the colour an eye sees, integrated from this very spectrum through the CIE
  // colour-matching functions — not a look-up
  function bbColor(T){ return spectrumRGB(nm=>planckLambda(nm*1e-9,T)); }

  // a few familiar radiators to anchor the temperature scale
  const LANDMARKS=[[1900,'candle'],[2800,'bulb'],[5800,'Sun'],[9940,'Rigel']];

  function draw(){
    const {ctx,w,h}=fitCanvas(canvas);
    const T=parseFloat(TEl.value); TVal.textContent=T.toFixed(0);
    const lamPeak_nm = (WIEN_B/T)*1e9;
    const xmax = Math.max(2500, lamPeak_nm*3.4);
    ctx.clearRect(0,0,w,h);

    /* ---- colour-vs-temperature strip across the top ---- */
    // Its axis is temperature, not wavelength, so it deliberately does not line
    // up with the plot below.
    const Tlo=parseFloat(TEl.min), Thi=parseFloat(TEl.max);
    const sx0=104, sx1=w-16, stripY=8, stripH=17;
    for(let px=sx0; px<=sx1; px++){
      const Tp = Tlo + (Thi-Tlo)*(px-sx0)/(sx1-sx0);
      ctx.fillStyle = rgbCss(bbColor(Tp));
      ctx.fillRect(px, stripY, 1, stripH);
    }
    ctx.strokeStyle='#d8d3c6'; ctx.lineWidth=1; ctx.strokeRect(sx0,stripY,sx1-sx0,stripH);
    ctx.font='10px Helvetica,Arial,sans-serif'; ctx.fillStyle='#8a8d92'; ctx.textAlign='right';
    ctx.fillText('colour to the eye', sx0-8, stripY+12);
    const Tx = Tp => sx0 + (sx1-sx0)*(Tp-Tlo)/(Thi-Tlo);
    ctx.textAlign='center';
    LANDMARKS.forEach(([Tl,lab])=>{
      if(Tl<Tlo||Tl>Thi) return;
      ctx.strokeStyle='rgba(28,29,32,0.45)'; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(Tx(Tl),stripY+stripH); ctx.lineTo(Tx(Tl),stripY+stripH+3); ctx.stroke();
      ctx.fillStyle='#8a8d92'; ctx.fillText(lab, Tx(Tl), stripY+stripH+13);
    });
    // current temperature: a notched marker drawn through the strip itself
    ctx.strokeStyle='#fffdf8'; ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(Tx(T),stripY); ctx.lineTo(Tx(T),stripY+stripH); ctx.stroke();
    ctx.strokeStyle='#1c1d20'; ctx.lineWidth=1.4;
    ctx.beginPath(); ctx.moveTo(Tx(T),stripY-2); ctx.lineTo(Tx(T),stripY+stripH+2); ctx.stroke();

    const m={l:56,r:16,t:52,b:34};
    const peakVal = planckLambda(lamPeak_nm*1e-9, T);
    const ymax = peakVal*1.25;
    const {X,Y}=drawAxes(ctx,w,h,m,0,xmax,0,ymax,'λ (nm)','u(λ) (rel. units)',{nx:5,ny:4});

    /* ---- the visible band, in its actual colours ---- */
    // Hue at full saturation, but faded by the eye's own luminous efficiency
    // ȳ(λ), so the band dies away at the violet and red ends instead of turning
    // muddy grey the way an unnormalised spectral colour does.
    if(380<xmax){
      const vx0=X(380), vx1=X(Math.min(750,xmax));
      for(let px=vx0; px<=vx1; px++){
        const nm = 380 + (750-380)*(px-vx0)/(vx1-vx0);
        const c = wavelengthRGB(nm);
        const lum = Math.pow(Math.min(1,cieBar(nm)[1]), 0.55);   // lift the dim ends a little
        ctx.fillStyle=`rgba(${c[0]},${c[1]},${c[2]},${0.44*lum})`;
        ctx.fillRect(px, m.t, 1, (h-m.b)-m.t);
      }
      ctx.save();
      ctx.strokeStyle='rgba(28,29,32,0.16)'; ctx.lineWidth=1; ctx.setLineDash([3,3]);
      [vx0,vx1].forEach(px=>{ ctx.beginPath(); ctx.moveTo(px,m.t); ctx.lineTo(px,h-m.b); ctx.stroke(); });
      ctx.restore();
      ctx.font='10px Helvetica,Arial,sans-serif'; ctx.fillStyle='#8a8d92'; ctx.textAlign='center';
      ctx.fillText('visible', (vx0+vx1)/2, h-m.b-6);
    }

    /* ---- cooler blackbodies, for the shape of Wien's law ---- */
    // Only temperatures below the current one: they always nest underneath, so
    // nothing has to be clipped, and dragging T upward leaves a visible trail.
    const ghosts=[];
    for(let Tg=1000; Tg<T-200; Tg+=(T>6000?1500:1000)) ghosts.push(Tg);
    ghosts.slice(-5).forEach(Tg=>{
      const gp=[]; for(let l=5;l<=xmax;l+=xmax/220) gp.push({x:l,y:planckLambda(l*1e-9,Tg)});
      const c=bbColor(Tg);
      plotLine(ctx,X,Y,gp,`rgba(${Math.round(c[0]*0.75)},${Math.round(c[1]*0.6)},${Math.round(c[2]*0.55)},0.85)`,1.5);
      const lp=(WIEN_B/Tg)*1e9, ly=planckLambda(lp*1e-9,Tg);
      if(Y(ly) > m.t+10 && X(lp) < w-m.r-30){
        ctx.font='9px Helvetica,Arial,sans-serif'; ctx.textAlign='center';
        // haloed, so it stays readable where it crosses the colour band
        ctx.lineWidth=3; ctx.strokeStyle='rgba(255,253,248,0.92)';
        ctx.strokeText(`${fmt(Tg,0)} K`, X(lp), Y(ly)-4);
        ctx.fillStyle='#6b6152';
        ctx.fillText(`${fmt(Tg,0)} K`, X(lp), Y(ly)-4);
      }
    });

    /* ---- the locus of the peaks: λ_peak ∝ 1/T, u_peak ∝ T⁵ ---- */
    const locus=[];
    for(let Tg=Tlo; Tg<=Thi; Tg+=50){
      const lp=(WIEN_B/Tg)*1e9;
      if(lp<=xmax) locus.push({x:lp, y:planckLambda(lp*1e-9,Tg)});
    }
    plotLine(ctx,X,Y,locus,'rgba(138,109,31,0.85)',1.5,[4,3]);

    if(rjEl.checked){
      const rjpts=[]; for(let l=5;l<=xmax;l+=xmax/300){ rjpts.push({x:l,y:rjLambda(l*1e-9,T)}); }
      plotLine(ctx,X,Y,rjpts,'#8a8d92',2,[5,3]);
    }

    const pts=[]; for(let l=5;l<=xmax;l+=xmax/300){ pts.push({x:l,y:planckLambda(l*1e-9,T)}); }
    plotLine(ctx,X,Y,pts,'#a4342c',2.6);

    plotLine(ctx,X,Y,[{x:lamPeak_nm,y:0},{x:lamPeak_nm,y:peakVal}],'#1f6f78',1.6,[3,3]);
    dotAt(ctx,X,Y,lamPeak_nm,peakVal,'#1f6f78',4.5);

    ctx.font='11px Helvetica,Arial,sans-serif'; ctx.textAlign='left';
    ctx.fillStyle='#1f6f78';
    ctx.fillText(`λ_peak = ${fmt(lamPeak_nm,0)} nm`, Math.min(X(lamPeak_nm)+8, w-m.r-120), m.t+14);
    ctx.fillStyle='#a4342c'; ctx.fillText(`Planck, ${fmt(T,0)} K`, m.l+8, m.t+14);
    ctx.fillStyle='#8a6d1f'; ctx.fillText('locus of the peaks', m.l+8, m.t+30);
    if(rjEl.checked){ ctx.fillStyle='#8a8d92'; ctx.fillText('Rayleigh–Jeans (classical)', m.l+8, m.t+46); }

    let band='infrared';
    if(lamPeak_nm<380) band='ultraviolet'; else if(lamPeak_nm<=750) band='visible';
    // fraction of the radiated energy that actually falls in the visible
    let vis=0, tot=0;
    for(let l=10;l<=20000;l+=10){
      const u=planckLambda(l*1e-9,T)*10;
      tot+=u; if(l>=380&&l<=750) vis+=u;
    }
    const c=bbColor(T);
    readout.innerHTML = `
      <div>T <b>${fmt(T,0)} K</b></div>
      <div>&lambda;<sub>peak</sub> (Wien) <b>${fmt(lamPeak_nm,0)} nm</b> — in the <b>${band}</b></div>
      <div>colour to the eye
        <b style="display:inline-block;width:14px;height:14px;border-radius:3px;vertical-align:-2px;
           border:1px solid rgba(0,0,0,.2);background:rgb(${c[0]},${c[1]},${c[2]})"></b>
        rgb(${c[0]}, ${c[1]}, ${c[2]})</div>
      <div>energy landing in the visible <b>${fmt(vis/tot*100,1)}%</b></div>
      <div>total radiated power &prop; T&#8308; — <b>${fmt(Math.pow(T/5800,4),2)}&times;</b> the Sun's per unit area</div>`;
  }
  TEl.addEventListener('input',draw); rjEl.addEventListener('change',draw);
  registerCanvas('bb_canvas',draw);
}

/* ---------- 2. Photoelectric effect ---------- */
function setupPhotoelectric(){
  const cIV=document.getElementById('pe_canvas_iv'), cSlope=document.getElementById('pe_canvas_slope');
  const cStage=document.getElementById('pe_stage');
  const metalEl=document.getElementById('pe_metal'), lamEl=document.getElementById('pe_lam'), lamVal=document.getElementById('pe_lam_val');
  const VEl=document.getElementById('pe_V'), VVal=document.getElementById('pe_V_val');
  const IEl=document.getElementById('pe_I'), IVal=document.getElementById('pe_I_val');
  const readout=document.getElementById('pe_readout');

  /* ---- the actual experiment ----
     Photons arrive at the cathode; if one carries more than the work function
     an electron leaves with anything up to hν − φ, and has to cross the gap
     against the retarding voltage to be counted. Everything the I–V curve says
     is visible here: the threshold is about colour, the rate is about
     brightness, and the knee is the spread of electron energies. */
  const photons=[], electrons=[];
  let peLast=performance.now(), photonAcc=0, collected=0, ejected=0, absorbed=0;
  let flash=[];

  function stageGeom(w,h){
    return {cathX:Math.round(w*0.17), collX:Math.round(w*0.86),
            y0:Math.round(h*0.16), y1:Math.round(h*0.86)};
  }

  function drawStage(){
    if(!cStage) return;
    const {ctx,w,h}=fitCanvas(cStage);
    ctx.clearRect(0,0,w,h);
    const g=stageGeom(w,h);
    const phi=parseFloat(metalEl.value);
    const lam=parseFloat(lamEl.value);
    const V=parseFloat(VEl.value);
    const Eph=HC_EV_NM/lam, KEmax=Eph-phi;
    const pc = lam<380 ? [150,120,210] : wavelengthRGB(lam);

    // the tube
    ctx.strokeStyle='#e0dbd0'; ctx.lineWidth=1;
    ctx.strokeRect(g.cathX-6, g.y0-14, g.collX-g.cathX+12, g.y1-g.y0+28);
    // retarding field between the plates
    if(V>0.02){
      ctx.strokeStyle='rgba(31,111,120,0.22)'; ctx.lineWidth=1;
      for(let k=1;k<=5;k++){
        const yy=g.y0+(g.y1-g.y0)*k/6;
        ctx.beginPath(); ctx.moveTo(g.collX-14,yy); ctx.lineTo(g.cathX+14,yy); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(g.cathX+14,yy);
        ctx.lineTo(g.cathX+22,yy-3.5); ctx.lineTo(g.cathX+22,yy+3.5); ctx.closePath();
        ctx.fillStyle='rgba(31,111,120,0.22)'; ctx.fill();
      }
    }
    // cathode and collector
    ctx.fillStyle='#8a8d92'; ctx.fillRect(g.cathX-7, g.y0, 7, g.y1-g.y0);
    ctx.fillStyle='#b9b3a4'; ctx.fillRect(g.collX, g.y0, 7, g.y1-g.y0);
    ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle='#5a5d63';
    ctx.textAlign='center';
    ctx.fillText('cathode', g.cathX-3, g.y1+18);
    ctx.fillText('collector', g.collX+3, g.y1+18);

    // photons, in their own colour
    photons.forEach(p=>{
      ctx.strokeStyle=`rgba(${pc[0]},${pc[1]},${pc[2]},0.95)`;
      ctx.lineWidth=2;
      ctx.beginPath();
      for(let k=0;k<=12;k++){
        const t=k/12, px=p.x-14*t*Math.cos(p.a), py=p.y-14*t*Math.sin(p.a);
        const off=3*Math.sin(k*1.1);
        const qx=px+off*Math.sin(p.a), qy=py-off*Math.cos(p.a);
        k===0?ctx.moveTo(qx,qy):ctx.lineTo(qx,qy);
      }
      ctx.stroke();
    });
    // little flashes where a photon was swallowed without freeing anything
    flash.forEach(f=>{
      ctx.fillStyle=`rgba(138,141,146,${0.5*f.life})`;
      ctx.beginPath(); ctx.arc(f.x,f.y,7*(1-f.life)+2,0,7); ctx.fill();
    });
    // electrons
    electrons.forEach(e=>{
      const x=g.cathX+(g.collX-g.cathX)*e.s;
      ctx.fillStyle = e.back ? '#b06a62' : '#1f6f78';
      ctx.beginPath(); ctx.arc(x,e.y,3.6,0,7); ctx.fill();
    });

    ctx.textAlign='left'; ctx.font='11px Helvetica,Arial,sans-serif';
    if(KEmax<=0){
      ctx.fillStyle='#a4342c';
      ctx.fillText(`hν = ${fmt(Eph,2)} eV is below the ${fmt(phi,2)} eV work function —`, g.cathX+16, g.y0-24);
      ctx.fillText('no electrons at any brightness', g.cathX+16, g.y0-10);
    } else {
      ctx.fillStyle='#5a5d63';
      ctx.fillText(`hν = ${fmt(Eph,2)} eV − φ = ${fmt(phi,2)} eV → up to ${fmt(KEmax,2)} eV each`, g.cathX+16, g.y0-10);
    }
    ctx.textAlign='right'; ctx.fillStyle='#8a8d92';
    ctx.fillText(`${collected} collected / ${ejected} freed`, g.collX-4, g.y0-10);
    if(V>0.02 && KEmax>0){
      ctx.fillStyle=V>=KEmax?'#a4342c':'#1f6f78';
      ctx.fillText(V>=KEmax?`V = ${fmt(V,2)} V stops every one of them`
                           :`V = ${fmt(V,2)} V turns back the slowest`, g.collX-4, g.y1+18);
    }
  }

  function stepStage(dt){
    const {w,h}=fitCanvas(cStage);
    const g=stageGeom(w,h);
    const phi=parseFloat(metalEl.value);
    const lam=parseFloat(lamEl.value);
    const V=parseFloat(VEl.value);
    const inten=parseFloat(IEl.value);
    const KEmax=HC_EV_NM/lam-phi;

    // photons arrive at a rate set by the brightness alone
    photonAcc += dt*inten*11;
    while(photonAcc>1){
      photonAcc-=1;
      const y=g.y0+Math.random()*(g.y1-g.y0);
      const a=Math.atan2(y-(g.y0-70), g.cathX-(g.cathX-150));
      photons.push({x:g.cathX-150, y:g.y0-70, tx:g.cathX, ty:y, a, s:0});
    }
    for(let i=photons.length-1;i>=0;i--){
      const p=photons[i];
      p.s += dt*1.5;
      p.x = (g.cathX-150) + (p.tx-(g.cathX-150))*p.s;
      p.y = (g.y0-70) + (p.ty-(g.y0-70))*p.s;
      p.a = Math.atan2(p.ty-(g.y0-70), p.tx-(g.cathX-150));
      if(p.s>=1){
        photons.splice(i,1);
        if(KEmax>0){
          // a real photoelectron leaves with anything from nothing up to hν − φ
          ejected++;
          electrons.push({s:0, y:p.ty+(Math.random()-0.5)*8, KE:Math.random()*KEmax, back:false});
        } else {
          absorbed++;
          flash.push({x:p.tx, y:p.ty, life:1});
        }
      }
    }
    for(let i=flash.length-1;i>=0;i--){
      flash[i].life -= dt*3;
      if(flash[i].life<=0) flash.splice(i,1);
    }
    for(let i=electrons.length-1;i>=0;i--){
      const e=electrons[i];
      const KEhere = e.KE - V*e.s;               // energy left after climbing V·s
      if(KEhere<=0) e.back=true;
      const sp = 0.85*Math.sqrt(Math.max(0.02, Math.abs(KEhere))/Math.max(0.2,e.KE||0.2));
      e.s += (e.back?-1:1)*dt*sp;
      if(e.s>=1){ collected++; electrons.splice(i,1); }
      else if(e.s<0) electrons.splice(i,1);      // fell back into the cathode
    }
  }

  function peLoop(now){
    const dt=Math.min(0.05,(now-peLast)/1000); peLast=now;
    const active=document.getElementById('ch2') && document.getElementById('ch2').classList.contains('active');
    if(active && !prefersReducedMotion()){
      stepStage(dt);
      drawStage();
    }
    requestAnimationFrame(peLoop);
  }

  function draw(){
    const phi=parseFloat(metalEl.value);
    const lam=parseFloat(lamEl.value); lamVal.textContent=lam.toFixed(0);
    if(VVal) VVal.textContent=parseFloat(VEl.value).toFixed(2);
    if(IVal) IVal.textContent=parseFloat(IEl.value).toFixed(1);
    drawStage();
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
        // where the animation above is currently sitting on this curve
        const Vnow=parseFloat(VEl.value);
        if(Vnow<=V0*1.4){
          const Inow = Vnow>=V0 ? 0 : 3*Math.pow(1-Vnow/V0,0.6);
          plotLine(ctx,X,Y,[{x:Vnow,y:0},{x:Vnow,y:Inow}],'#8a6d1f',1.4,[3,3]);
          dotAt(ctx,X,Y,Vnow,Inow,'#8a6d1f',4.5);
        }
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
  // changing the light or the metal restarts the experiment, so the tallies and
  // whatever is mid-flight belong to the new settings
  function peReset(){ collected=0; ejected=0; absorbed=0; electrons.length=0; photons.length=0; flash.length=0; draw(); }
  metalEl.addEventListener('change',peReset);
  lamEl.addEventListener('input',peReset);
  [VEl,IEl].forEach(el=>{ if(el) el.addEventListener('input',peReset); });
  registerCanvas('pe_canvas_iv',draw); registerCanvas('pe_canvas_slope',draw);
  registerCanvas('pe_stage',drawStage);
  requestAnimationFrame(peLoop);
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
    ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle='#8a8d92'; ctx.textAlign='right';
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

// register with the loader in app.js
registerModule('setupBlackbody', setupBlackbody);
registerModule('setupPhotoelectric', setupPhotoelectric);
registerModule('setupXrayProduction', setupXrayProduction);
registerModule('setupCompton', setupCompton);
registerModule('setupBragg', setupBragg);
registerModule('setupPairProduction', setupPairProduction);
registerModule('setupAttenuation', setupAttenuation);
registerModule('setupGravRedshift', setupGravRedshift);
