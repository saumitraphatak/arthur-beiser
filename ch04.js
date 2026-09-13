/* =====================================================================
   Concepts of Modern Physics — Interactive Companion
   Chapter 4: Atomic Structure
   Every number is computed live from the chapter's formulas.
   ===================================================================== */

// chapter-local constants (app.js stays untouched as chapters are added)
const E_CHG = 1.602e-19;         // C
const EPS0  = 8.854e-12;         // F/m
const KCOUL = 8.988e9;           // 1/4*pi*eps0, N m^2 / C^2
const R_INF = 1.097e7;           // Rydberg constant, m^-1
const E1_H  = 13.6;              // hydrogen ground-state binding energy, eV
const MEV_FM = 1.43996;          // e^2/4*pi*eps0 in MeV fm — handy for Rutherford
const M_D   = 3.3436e-27;        // deuteron mass, kg
const M_T   = 5.0074e-27;        // triton mass, kg
const M_MU  = 1.8835e-28;        // muon mass, kg

/* =====================================================================
   1. RUTHERFORD SCATTERING
   ===================================================================== */
function setupRutherford(){
  const cTraj=document.getElementById('rs_canvas');
  const cDist=document.getElementById('rs_canvas_dist');
  const keEl=document.getElementById('rs_ke'), keVal=document.getElementById('rs_ke_val');
  const bEl=document.getElementById('rs_b'), bVal=document.getElementById('rs_b_val');
  const zEl=document.getElementById('rs_z');
  const readout=document.getElementById('rs_readout');

  function physics(){
    const KE = parseFloat(keEl.value);            // MeV
    const b  = parseFloat(bEl.value);             // fm
    const Z2 = parseFloat(zEl.value);
    const Z1 = 2;                                 // alpha particle
    // D is the head-on distance of closest approach; tan(theta/2) = D/2b
    const D = Z1*Z2*MEV_FM/KE;                    // fm
    const theta = b<=0 ? Math.PI : 2*Math.atan(D/(2*b));
    // closest approach on this particular trajectory
    const rmin = (D/2)*(1 + 1/Math.sin(theta/2));
    return {KE,b,Z1,Z2,D,theta,rmin};
  }

  // Integrate the actual trajectory rather than sketching a curve: unit mass,
  // unit speed at infinity, so KE = 1/2 and the Coulomb constant is D/2.
  function trajectory(D,b){
    const k = D/2, X0 = Math.max(14*Math.max(D,1), 10*b + 6*D);
    let x=-X0, y=b||1e-6, vx=1, vy=0;
    const dt = X0/4200;
    const pts=[[x,y]];
    for(let i=0;i<9000;i++){
      const r2 = x*x+y*y, r = Math.sqrt(r2);
      const a = k/(r2*r);                 // magnitude k/r^2, split into components
      vx += a*x*dt; vy += a*y*dt;         // repulsive: pushed away from the origin
      x += vx*dt;   y += vy*dt;
      pts.push([x,y]);
      if(x*x+y*y > X0*X0*1.05 && i>50) break;
    }
    return pts;
  }

  function drawTraj(){
    const {ctx,w,h}=fitCanvas(cTraj);
    const p = physics();
    ctx.clearRect(0,0,w,h);
    const pts = trajectory(p.D, p.b);
    // Frame the interaction region, not the long straight run-in — otherwise the
    // hyperbola collapses into a corner of the plot.
    const ext = Math.max(2.6*p.b, 2.4*p.D, 6);
    const cx=w*0.44, cy=h*0.56, S=Math.min(w*0.40, h*0.40)/ext;
    const X=x=>cx+x*S, Y=y=>cy-y*S;

    // the atom's own scale, to make the point about how empty it is
    ctx.strokeStyle='#eee9de'; ctx.lineWidth=1; ctx.setLineDash([3,3]);
    [0.25,0.5,0.75,1].forEach(f=>{ ctx.beginPath(); ctx.arc(cx,cy,ext*S*f,0,7); ctx.stroke(); });
    ctx.setLineDash([]);

    // incoming asymptote
    ctx.strokeStyle='#d8d3c6'; ctx.lineWidth=1.2; ctx.setLineDash([5,3]);
    ctx.beginPath(); ctx.moveTo(X(-ext),Y(p.b)); ctx.lineTo(X(ext),Y(p.b)); ctx.stroke();
    ctx.setLineDash([]);

    // impact parameter
    ctx.strokeStyle='#1f6f78'; ctx.lineWidth=1.6;
    ctx.beginPath(); ctx.moveTo(X(-ext*0.72),Y(0)); ctx.lineTo(X(-ext*0.72),Y(p.b)); ctx.stroke();
    ctx.fillStyle='#1f6f78'; ctx.font='11px Helvetica,Arial,sans-serif'; ctx.textAlign='right';
    ctx.fillText(`b = ${fmt(p.b,1)} fm`, X(-ext*0.72)-8, (Y(0)+Y(p.b))/2 + (p.b>0?0:-8));

    // the trajectory
    ctx.strokeStyle='#a4342c'; ctx.lineWidth=2.4;
    ctx.beginPath();
    let drawn=false, lastIn=pts.length-1;
    pts.forEach(([x,y],i)=>{
      const px=X(x), py=Y(y);
      if(Math.abs(x)<=ext*1.02 && Math.abs(y)<=ext*1.02){
        if(!drawn){ ctx.moveTo(px,py); drawn=true; } else ctx.lineTo(px,py);
        lastIn=i;
      }
    });
    ctx.stroke();
    // arrowhead where the path leaves the frame
    const n=lastIn+1;
    if(n>6){
      const [x1,y1]=pts[n-1], [x0,y0]=pts[n-6];
      const ang=Math.atan2(Y(y1)-Y(y0), X(x1)-X(x0));
      ctx.fillStyle='#a4342c'; ctx.beginPath();
      ctx.moveTo(X(x1),Y(y1));
      ctx.lineTo(X(x1)-11*Math.cos(ang-0.35), Y(y1)-11*Math.sin(ang-0.35));
      ctx.lineTo(X(x1)-11*Math.cos(ang+0.35), Y(y1)-11*Math.sin(ang+0.35));
      ctx.closePath(); ctx.fill();
    }

    // the nucleus, drawn to scale against the trajectory
    const rNuc = 1.2*Math.pow(197,1/3);          // gold, fm
    ctx.fillStyle='#1c1d20';
    ctx.beginPath(); ctx.arc(cx,cy,Math.max(3.2,rNuc*S),0,7); ctx.fill();
    ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle='#5a5d63'; ctx.textAlign='center';
    ctx.fillText('nucleus', cx, cy+Math.max(3.2,rNuc*S)+15);

    ctx.font='12px Helvetica,Arial,sans-serif'; ctx.textAlign='left'; ctx.fillStyle='#1c1d20';
    ctx.fillText(`α particle, ${fmt(p.KE,1)} MeV`, 12, 20);
    ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle='#a4342c';
    ctx.fillText(`scattered through ${fmt(p.theta*180/Math.PI,1)}°`, 12, 37);
  }

  function drawDist(){
    const {ctx,w,h}=fitCanvas(cDist);
    const p = physics();
    ctx.clearRect(0,0,w,h);
    const m={l:58,r:16,t:22,b:34};
    // log scale, because 1/sin^4 spans everything
    const lgMin=-1, lgMax=7;
    const X = a => m.l + (a-1)/(179)*(w-m.l-m.r);
    const Y = v => h-m.b - (Math.log10(v)-lgMin)/(lgMax-lgMin)*(h-m.b-m.t);
    ctx.save(); ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle='#8a8d92';
    ctx.strokeStyle='#e7e4dc'; ctx.lineWidth=1;
    for(let a=0;a<=180;a+=30){
      const px=X(Math.max(1,a));
      ctx.beginPath(); ctx.moveTo(px,m.t); ctx.lineTo(px,h-m.b); ctx.stroke();
      ctx.textAlign='center'; ctx.fillText(a+'°', px, h-m.b+16);
    }
    for(let e=lgMin;e<=lgMax;e+=2){
      const py=Y(Math.pow(10,e));
      ctx.beginPath(); ctx.moveTo(m.l,py); ctx.lineTo(w-m.r,py); ctx.stroke();
      ctx.textAlign='right'; ctx.fillText(supPow(e), m.l-8, py+3);
    }
    ctx.strokeStyle='#1c1d20'; ctx.lineWidth=1.3;
    ctx.beginPath(); ctx.moveTo(m.l,m.t); ctx.lineTo(m.l,h-m.b); ctx.lineTo(w-m.r,h-m.b); ctx.stroke();
    ctx.fillStyle='#1c1d20'; ctx.textAlign='center';
    ctx.fillText('scattering angle θ', m.l+(w-m.l-m.r)/2, h-6);
    ctx.save(); ctx.translate(14, m.t+(h-m.b-m.t)/2); ctx.rotate(-Math.PI/2);
    ctx.fillText('relative number scattered', 0, 0); ctx.restore();
    ctx.restore();

    // the Rutherford law
    ctx.strokeStyle='#a4342c'; ctx.lineWidth=2.6; ctx.beginPath();
    let started=false;
    for(let a=1;a<=180;a+=0.5){
      const v = 1/Math.pow(Math.sin(a*Math.PI/360),4);
      const py=Y(v);
      if(py<m.t||py>h-m.b){ started=false; continue; }
      if(!started){ ctx.moveTo(X(a),py); started=true; } else ctx.lineTo(X(a),py);
    }
    ctx.stroke();
    const th=p.theta*180/Math.PI;
    if(th>=1){
      const v=1/Math.pow(Math.sin(th*Math.PI/360),4);
      if(Y(v)>m.t && Y(v)<h-m.b){
        ctx.fillStyle='#1f6f78'; ctx.beginPath(); ctx.arc(X(th),Y(v),5.5,0,7); ctx.fill();
        ctx.strokeStyle='#fff'; ctx.lineWidth=1.5; ctx.stroke();
      }
    }
    ctx.font='11px Helvetica,Arial,sans-serif'; ctx.textAlign='right'; ctx.fillStyle='#a4342c';
    ctx.fillText('N(θ) ∝ 1/sin⁴(θ/2)', w-m.r-8, m.t+14);
    ctx.fillStyle='#5a5d63';
    ctx.fillText('a Thomson "plum pudding" atom predicts nothing beyond ~1°', w-m.r-8, m.t+30);
  }

  function draw(){
    const p = physics();
    keVal.textContent = fmt(p.KE,1); bVal.textContent = fmt(p.b,1);
    drawTraj(); drawDist();
    const rNuc = 1.2*Math.pow(197,1/3);
    const atomFm = 144000;                        // gold atomic radius, fm
    readout.innerHTML = `
      <div>&alpha; energy <b>${fmt(p.KE,2)} MeV</b></div>
      <div>target Z <b>${fmt(p.Z2,0)}</b></div>
      <div>impact parameter b <b>${fmt(p.b,2)} fm</b></div>
      <div>head-on approach D <b>${fmt(p.D,2)} fm</b></div>
      <div>scattering angle <b>${fmt(p.theta*180/Math.PI,2)}&deg;</b></div>
      <div>closest approach <b>${fmt(p.rmin,2)} fm</b>
        ${p.rmin<rNuc?'<span class="badge no">inside the nucleus</span>':''}</div>
      <div>nuclear radius <b>&asymp; ${fmt(rNuc,1)} fm</b></div>
      <div>atom / nucleus <b>${fmtSci(atomFm/rNuc,2)}&times;</b></div>`;
  }
  [keEl,bEl].forEach(el=>el.addEventListener('input',draw));
  zEl.addEventListener('change',draw);
  registerCanvas('rs_canvas',draw);
  registerCanvas('rs_canvas_dist',draw);
}

/* =====================================================================
   2. WHY THE CLASSICAL ATOM COLLAPSES
   ===================================================================== */
function setupClassicalCollapse(){
  const cSpiral=document.getElementById('cc_canvas');
  const cFreq=document.getElementById('cc_canvas_freq');
  const r0El=document.getElementById('cc_r0'), r0Val=document.getElementById('cc_r0_val');
  const readout=document.getElementById('cc_readout');

  // classical electron radius; the collapse time is r0^3 / (3 rc^2 c)
  const RC = KCOUL*E_CHG*E_CHG/(M_E*C_EXACT*C_EXACT);
  function collapseTime(r0){ return r0*r0*r0/(3*RC*RC*C_EXACT); }
  // r(t) from dr/dt: r(t) = (r0^3 - 3 rc^2 c t)^(1/3)
  function radiusAt(r0,t){
    const v = r0*r0*r0 - 3*RC*RC*C_EXACT*t;
    return v<=0 ? 0 : Math.pow(v,1/3);
  }
  function orbitFreq(r){ return Math.sqrt(KCOUL*E_CHG*E_CHG/(M_E*r*r*r))/(2*Math.PI); }

  function drawSpiral(){
    const {ctx,w,h}=fitCanvas(cSpiral);
    const r0 = Math.pow(10, parseFloat(r0El.value));
    ctx.clearRect(0,0,w,h);
    const cx=w/2, cy=h/2, S=Math.min(w,h)*0.42/r0;
    const T = collapseTime(r0);

    ctx.strokeStyle='#a4342c'; ctx.lineWidth=1.6;
    ctx.beginPath();
    let first=true;
    // walk forward in time; the electron sweeps through many turns as it falls
    for(let i=0;i<=4000;i++){
      const t = T*(i/4000)*0.99999;
      const r = radiusAt(r0,t);
      if(r<=0) break;
      // The true number of turns is ~10^5, which would render as a solid disc,
      // so the winding is compressed to 24 visible turns. The caption says so.
      const ang = 2*Math.PI*24*(1-Math.pow(r/r0,2.5));
      const px=cx+r*S*Math.cos(ang), py=cy-r*S*Math.sin(ang);
      if(first){ ctx.moveTo(px,py); first=false; } else ctx.lineTo(px,py);
    }
    ctx.stroke();

    ctx.fillStyle='#1c1d20'; ctx.beginPath(); ctx.arc(cx,cy,5,0,7); ctx.fill();
    ctx.fillStyle='#1f6f78'; ctx.beginPath(); ctx.arc(cx+r0*S,cy,5.5,0,7); ctx.fill();
    ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle='#1f6f78'; ctx.textAlign='left';
    ctx.fillText('electron starts here', cx+r0*S+9, cy+4);
    ctx.fillStyle='#5a5d63'; ctx.textAlign='center';
    ctx.fillText('nucleus', cx, cy+20);
    ctx.font='12px Helvetica,Arial,sans-serif'; ctx.fillStyle='#a4342c'; ctx.textAlign='left';
    ctx.fillText(`an accelerating charge radiates — so the orbit decays`, 12, 20);
    ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle='#5a5d63';
    ctx.fillText(`(turns compressed for display; the real number is far larger)`, 12, 36);
  }

  function drawFreq(){
    const {ctx,w,h}=fitCanvas(cFreq);
    const r0 = Math.pow(10, parseFloat(r0El.value));
    ctx.clearRect(0,0,w,h);
    const T = collapseTime(r0);
    const m={l:64,r:16,t:22,b:36};
    const f0 = orbitFreq(r0);
    const lgMin=Math.log10(f0), lgMax=lgMin+5;
    const X = t => m.l + (t/T)*(w-m.l-m.r);
    const Y = f => h-m.b - (Math.min(lgMax,Math.log10(f))-lgMin)/(lgMax-lgMin)*(h-m.b-m.t);
    ctx.save(); ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle='#8a8d92'; ctx.strokeStyle='#e7e4dc';
    for(let i=0;i<=4;i++){
      const t=T*i/4, px=X(t);
      ctx.beginPath(); ctx.moveTo(px,m.t); ctx.lineTo(px,h-m.b); ctx.stroke();
      ctx.textAlign='center'; ctx.fillText(fmtSci(t,1), px, h-m.b+16);
    }
    for(let e=Math.ceil(lgMin);e<=lgMax;e++){
      const py=Y(Math.pow(10,e));
      if(py<m.t) continue;
      ctx.beginPath(); ctx.moveTo(m.l,py); ctx.lineTo(w-m.r,py); ctx.stroke();
      ctx.textAlign='right'; ctx.fillText(supPow(e), m.l-8, py+3);
    }
    ctx.strokeStyle='#1c1d20'; ctx.lineWidth=1.3;
    ctx.beginPath(); ctx.moveTo(m.l,m.t); ctx.lineTo(m.l,h-m.b); ctx.lineTo(w-m.r,h-m.b); ctx.stroke();
    ctx.fillStyle='#1c1d20'; ctx.textAlign='center';
    ctx.fillText('time (s)', m.l+(w-m.l-m.r)/2, h-6);
    ctx.save(); ctx.translate(15, m.t+(h-m.b-m.t)/2); ctx.rotate(-Math.PI/2);
    ctx.fillText('radiated frequency (Hz)',0,0); ctx.restore();
    ctx.restore();

    ctx.strokeStyle='#a4342c'; ctx.lineWidth=2.6; ctx.beginPath();
    let started=false;
    for(let i=0;i<=600;i++){
      const t=T*(i/600)*0.9995;
      const r=radiusAt(r0,t); if(r<=0) break;
      const py=Y(orbitFreq(r));
      if(py<m.t){ started=false; continue; }
      if(!started){ ctx.moveTo(X(t),py); started=true; } else ctx.lineTo(X(t),py);
    }
    ctx.stroke();
    ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle='#a4342c'; ctx.textAlign='left';
    ctx.fillText('the frequency sweeps continuously upward as the orbit shrinks —', m.l+8, m.t+14);
    ctx.fillText('so a classical atom would emit a smear, not sharp spectral lines', m.l+8, m.t+30);
  }

  function draw(){
    const r0 = Math.pow(10, parseFloat(r0El.value));
    r0Val.textContent = fmt(r0*1e12,1)+' pm';
    drawSpiral(); drawFreq();
    const T = collapseTime(r0);
    const f0 = orbitFreq(r0);
    const v0 = Math.sqrt(KCOUL*E_CHG*E_CHG/(M_E*r0));
    const E0 = -KCOUL*E_CHG*E_CHG/(2*r0)/E_CHG;
    readout.innerHTML = `
      <div>initial radius <b>${fmt(r0*1e12,2)} pm</b></div>
      <div>orbital speed <b>${fmtSci(v0,3)} m/s</b> (${fmtSci(v0/C_EXACT,2)}c)</div>
      <div>orbital frequency <b>${fmtSci(f0,3)} Hz</b></div>
      <div>total energy <b>${fmt(E0,2)} eV</b></div>
      <div>time to spiral in <b>${fmtSci(T,3)} s</b>
        <span class="badge no">atoms do not do this</span></div>
      <div>orbits completed first <b>&asymp; ${fmtSci(f0*T*0.4,2)}</b></div>`;
  }
  r0El.addEventListener('input',draw);
  registerCanvas('cc_canvas',draw);
  registerCanvas('cc_canvas_freq',draw);
}

/* =====================================================================
   3. HYDROGEN SPECTRAL SERIES
   ===================================================================== */
function setupSpectralSeries(){
  const cSpec=document.getElementById('hs_canvas');
  const cVis=document.getElementById('hs_canvas_vis');
  const nfEl=document.getElementById('hs_nf'), nfVal=document.getElementById('hs_nf_val');
  const niEl=document.getElementById('hs_ni'), niVal=document.getElementById('hs_ni_val');
  const readout=document.getElementById('hs_readout');
  const SERIES = [
    {nf:1, name:'Lyman',    region:'ultraviolet', color:'#7a4fa3'},
    {nf:2, name:'Balmer',   region:'visible',     color:'#a4342c'},
    {nf:3, name:'Paschen',  region:'infrared',    color:'#8a6d1f'},
    {nf:4, name:'Brackett', region:'infrared',    color:'#1f6f78'},
    {nf:5, name:'Pfund',    region:'infrared',    color:'#5a5d63'}
  ];
  // 1/lambda = R (1/nf^2 - 1/ni^2)
  function lambda_nm(nf,ni){ return 1e9/(R_INF*(1/(nf*nf) - 1/(ni*ni))); }
  function limit_nm(nf){ return 1e9/(R_INF/(nf*nf)); }

  function drawSpec(){
    const {ctx,w,h}=fitCanvas(cSpec);
    const nf = parseInt(nfEl.value,10), ni = parseInt(niEl.value,10);
    ctx.clearRect(0,0,w,h);
    const m={l:52,r:22,t:26,b:40};
    const lgMin=Math.log10(80), lgMax=Math.log10(8000);
    const X = l => m.l + (Math.log10(l)-lgMin)/(lgMax-lgMin)*(w-m.l-m.r);

    // visible band behind everything
    ctx.fillStyle='rgba(120,180,255,0.10)';
    ctx.fillRect(X(380), m.t, X(750)-X(380), h-m.b-m.t);
    ctx.font='10px Helvetica,Arial,sans-serif'; ctx.fillStyle='#8a9db8'; ctx.textAlign='center';
    ctx.fillText('visible', (X(380)+X(750))/2, m.t+11);

    // wavelength axis
    ctx.strokeStyle='#1c1d20'; ctx.lineWidth=1.3;
    ctx.beginPath(); ctx.moveTo(m.l,h-m.b); ctx.lineTo(w-m.r,h-m.b); ctx.stroke();
    ctx.font='10px Helvetica,Arial,sans-serif'; ctx.fillStyle='#8a8d92';
    [100,200,500,1000,2000,5000].forEach(l=>{
      const px=X(l);
      ctx.strokeStyle='#d8d3c6'; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(px,h-m.b-4); ctx.lineTo(px,h-m.b+4); ctx.stroke();
      ctx.textAlign='center'; ctx.fillText(l>=1000?(l/1000)+' µm':l+' nm', px, h-m.b+17);
    });

    // one row per series
    const rowH = (h-m.b-m.t-14)/SERIES.length;
    SERIES.forEach((s,idx)=>{
      const y0 = m.t+14+idx*rowH, y1 = y0+rowH*0.62;
      const on = (s.nf===nf);
      ctx.font='11px Helvetica,Arial,sans-serif'; ctx.textAlign='right';
      ctx.fillStyle = on ? s.color : '#b9b3a4';
      ctx.fillText(s.name, m.l-6, (y0+y1)/2+4);
      for(let n=s.nf+1;n<=s.nf+14;n++){
        const l = lambda_nm(s.nf,n);
        const px = X(l);
        if(px<m.l||px>w-m.r) continue;
        const isCur = on && n===ni;
        ctx.strokeStyle = isCur ? '#1c1d20' : (on ? s.color : '#ddd8cc');
        ctx.lineWidth = isCur ? 2.8 : (on ? 1.8 : 1.1);
        ctx.beginPath(); ctx.moveTo(px,y0); ctx.lineTo(px,y1); ctx.stroke();
      }
      // series limit
      const lim = limit_nm(s.nf);
      if(X(lim)>m.l && X(lim)<w-m.r){
        ctx.strokeStyle = on ? s.color : '#e7e4dc'; ctx.lineWidth=1; ctx.setLineDash([2,2]);
        ctx.beginPath(); ctx.moveTo(X(lim),y0-3); ctx.lineTo(X(lim),y1+3); ctx.stroke();
        ctx.setLineDash([]);
      }
    });

    const cur = lambda_nm(nf,ni);
    if(X(cur)>m.l && X(cur)<w-m.r){
      ctx.fillStyle='#1c1d20'; ctx.font='11px Helvetica,Arial,sans-serif';
      ctx.textAlign = X(cur)>w*0.6?'right':'left';
      ctx.fillText(`${fmt(cur,1)} nm`, X(cur)+(X(cur)>w*0.6?-6:6), m.t+11);
    }
  }

  function drawVis(){
    const {ctx,w,h}=fitCanvas(cVis);
    const nf = parseInt(nfEl.value,10), ni = parseInt(niEl.value,10);
    ctx.clearRect(0,0,w,h);
    const m={l:20,r:20};
    const lo=380, hi=750;
    const X = l => m.l + (l-lo)/(hi-lo)*(w-m.l-m.r);
    // a black background with the Balmer lines drawn in their true colours
    ctx.fillStyle='#15161a'; ctx.fillRect(m.l, 22, w-m.l-m.r, h-62);
    for(let n=3;n<=12;n++){
      const l=lambda_nm(2,n);
      if(l<lo||l>hi) continue;
      const px=X(l);
      const isCur=(nf===2&&n===ni);
      const grad=ctx.createLinearGradient(px-7,0,px+7,0);
      const col=wavelengthToColor(l);
      grad.addColorStop(0,'rgba(0,0,0,0)'); grad.addColorStop(0.5,col); grad.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=grad; ctx.fillRect(px-7,22,14,h-62);
      ctx.fillStyle=col; ctx.fillRect(px-1.1,22,2.2,h-62);
      ctx.font='10px Helvetica,Arial,sans-serif'; ctx.textAlign='center';
      ctx.fillStyle = isCur ? '#fff' : 'rgba(255,255,255,.55)';
      const lbl = n<=6 ? ['','','','Hα','Hβ','Hγ','Hδ'][n] : '';
      if(lbl) ctx.fillText(lbl, px, 16);
      ctx.fillText(fmt(l,1), px, h-26);
    }
    ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle='#5a5d63'; ctx.textAlign='left';
    ctx.fillText('the Balmer series as the eye sees it — this is what a hydrogen discharge tube looks like through a prism', m.l, h-8);
  }

  function draw(){
    const nf = parseInt(nfEl.value,10);
    let ni = parseInt(niEl.value,10);
    if(ni<=nf){ ni=nf+1; niEl.value=ni; }
    niEl.min = nf+1;
    nfVal.textContent = nf; niVal.textContent = ni;
    drawSpec(); drawVis();
    const l = lambda_nm(nf,ni);
    const s = SERIES.find(x=>x.nf===nf);
    const E = HC_EV_NM/l;
    readout.innerHTML = `
      <div>transition <b>n = ${ni} &rarr; ${nf}</b></div>
      <div>series <b>${s?s.name:'—'}</b> (${s?s.region:''})</div>
      <div>1/&lambda; = R(1/${nf}&sup2; &minus; 1/${ni}&sup2;) <b>${fmtSci(1/(l*1e-9),4)} m&#8315;&sup1;</b></div>
      <div>&lambda; <b>${fmt(l,2)} nm</b></div>
      <div>photon energy <b>${fmt(E,3)} eV</b></div>
      <div>series limit (n &rarr; &infin;) <b>${fmt(limit_nm(nf),1)} nm</b></div>`;
  }
  nfEl.addEventListener('input',draw);
  niEl.addEventListener('input',draw);
  registerCanvas('hs_canvas',draw);
  registerCanvas('hs_canvas_vis',draw);
}

/* =====================================================================
   4. BOHR ORBITS AS STANDING DE BROGLIE WAVES
   ===================================================================== */
function setupBohrWaves(){
  const canvas=document.getElementById('bw_canvas');
  const mEl=document.getElementById('bw_m'), mVal=document.getElementById('bw_m_val');
  const readout=document.getElementById('bw_readout');

  function draw(){
    const {ctx,w,h}=fitCanvas(canvas);
    const mWaves = parseFloat(mEl.value);         // wavelengths around the orbit
    mVal.textContent = fmt(mWaves,2);
    ctx.clearRect(0,0,w,h);
    const n = Math.round(mWaves);
    const closes = Math.abs(mWaves-n) < 0.02;

    const cx=w*0.36, cy=h*0.5, R=Math.min(w*0.26, h*0.34);
    // the bare orbit
    ctx.strokeStyle='#e0dbd0'; ctx.lineWidth=1.4; ctx.setLineDash([4,3]);
    ctx.beginPath(); ctx.arc(cx,cy,R,0,7); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle='#1c1d20'; ctx.beginPath(); ctx.arc(cx,cy,5,0,7); ctx.fill();

    // the de Broglie wave wrapped around it
    const amp=R*0.26;
    ctx.strokeStyle = closes ? '#1f6f78' : '#a4342c';
    ctx.lineWidth=2.4;
    ctx.beginPath();
    const STEPS=1400;
    for(let i=0;i<=STEPS;i++){
      const phi = 2*Math.PI*i/STEPS;
      const rr = R + amp*Math.sin(mWaves*phi);
      const px=cx+rr*Math.cos(phi), py=cy-rr*Math.sin(phi);
      if(i===0) ctx.moveTo(px,py); else ctx.lineTo(px,py);
    }
    ctx.stroke();

    // if it does not close, show the mismatch at the join
    if(!closes){
      const startR = R + amp*Math.sin(0);
      const endR   = R + amp*Math.sin(mWaves*2*Math.PI);
      ctx.strokeStyle='#1c1d20'; ctx.lineWidth=2; ctx.setLineDash([3,2]);
      ctx.beginPath(); ctx.moveTo(cx+startR,cy); ctx.lineTo(cx+endR,cy); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle='#a4342c'; ctx.font='11px Helvetica,Arial,sans-serif'; ctx.textAlign='left';
      ctx.fillText('the wave does not join onto itself', 14, h-26);
      ctx.fillText('→ destructive interference, it dies out', 14, h-10);
    } else {
      ctx.fillStyle='#1f6f78'; ctx.font='11px Helvetica,Arial,sans-serif'; ctx.textAlign='left';
      ctx.fillText(`closes exactly: ${n} wavelength${n===1?'':'s'} around the orbit`, 14, h-26);
      ctx.fillText('→ a standing wave that persists', 14, h-10);
    }

    // the Bohr quantities for this n, on the right
    const rn = A0*n*n, En = -E1_H/(n*n);
    const vn = KCOUL*E_CHG*E_CHG/(n*HBAR);
    const lam = 2*Math.PI*rn/n;
    const bx = w*0.68;
    ctx.font='12px Helvetica,Arial,sans-serif'; ctx.textAlign='left'; ctx.fillStyle='#1c1d20';
    if(closes){
      ctx.fillText(`Bohr orbit n = ${n}`, bx, h*0.30);
      ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle='#5a5d63';
      ctx.fillText(`radius  rₙ = n²a₀ = ${fmt(rn*1e12,1)} pm`, bx, h*0.30+22);
      ctx.fillText(`speed   ${fmtSci(vn,3)} m/s`, bx, h*0.30+40);
      ctx.fillText(`λ = 2πrₙ/n = ${fmt(lam*1e12,1)} pm`, bx, h*0.30+58);
      ctx.fillStyle='#a4342c';
      ctx.fillText(`energy  Eₙ = ${fmt(En,3)} eV`, bx, h*0.30+78);
    } else {
      ctx.fillStyle='#a4342c';
      ctx.fillText(`${fmt(mWaves,2)} wavelengths`, bx, h*0.30);
      ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle='#5a5d63';
      ctx.fillText('not a whole number, so no such', bx, h*0.30+22);
      ctx.fillText('orbit exists. Quantization is', bx, h*0.30+40);
      ctx.fillText('nothing more exotic than this.', bx, h*0.30+58);
    }

    readout.innerHTML = closes ? `
      <div>quantum number n <b>${n}</b></div>
      <div>orbit radius <b>${fmt(rn*1e12,2)} pm</b> = ${n*n}a&#8320;</div>
      <div>de Broglie &lambda; <b>${fmt(lam*1e12,2)} pm</b></div>
      <div>circumference 2&pi;r <b>${fmt(2*Math.PI*rn*1e12,2)} pm</b> = ${n}&lambda;</div>
      <div>orbital speed <b>${fmtSci(vn,3)} m/s</b> (${fmtSci(vn/C_EXACT,2)}c)</div>
      <div>angular momentum <b>${n}&#8463;</b></div>
      <div>energy <b>${fmt(En,4)} eV</b></div>` : `
      <div>wavelengths around the orbit <b>${fmt(mWaves,2)}</b></div>
      <div>status <b>not an allowed orbit</b> <span class="badge no">wave cannot close</span></div>
      <div>nearest allowed n <b>${n}</b></div>`;
  }
  mEl.addEventListener('input',draw);
  registerCanvas('bw_canvas',draw);
}

/* =====================================================================
   5. ENERGY LEVELS, TRANSITIONS, AND THE CORRESPONDENCE PRINCIPLE
   ===================================================================== */
function setupEnergyLevels(){
  const cLev=document.getElementById('el_canvas');
  const cCorr=document.getElementById('el_canvas_corr');
  const niEl=document.getElementById('el_ni'), niVal=document.getElementById('el_ni_val');
  const nfEl=document.getElementById('el_nf'), nfVal=document.getElementById('el_nf_val');
  const readout=document.getElementById('el_readout');
  const NMAX=8;
  const SERIES_NAME = {1:'Lyman',2:'Balmer',3:'Paschen',4:'Brackett',5:'Pfund'};

  const En = n => -E1_H/(n*n);                         // eV
  // classical orbital frequency of the nth Bohr orbit
  const fOrb = n => Math.pow(M_E*Math.pow(E_CHG,4)/(4*EPS0*EPS0*Math.pow(H_J,3)), 1)/Math.pow(n,3);

  function drawLevels(){
    const {ctx,w,h}=fitCanvas(cLev);
    const ni=parseInt(niEl.value,10), nf=parseInt(nfEl.value,10);
    ctx.clearRect(0,0,w,h);
    const m={l:74,r:150,t:26,b:26};
    // energy maps linearly, so the crowding toward n = infinity is visible
    const Y = E => m.t + (E - 0)/(En(1) - 0)*(h-m.t-m.b);
    ctx.font='11px Helvetica,Arial,sans-serif';

    // ionisation limit
    ctx.strokeStyle='#1c1d20'; ctx.lineWidth=1.6; ctx.setLineDash([5,3]);
    ctx.beginPath(); ctx.moveTo(m.l,Y(0)); ctx.lineTo(w-m.r,Y(0)); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle='#1c1d20'; ctx.textAlign='right';
    ctx.fillText('n = ∞   0 eV', m.l-8, Y(0)+4);
    ctx.textAlign='left'; ctx.fillStyle='#5a5d63';
    ctx.fillText('ionised — electron free', w-m.r+8, Y(0)+4);

    for(let n=1;n<=NMAX;n++){
      const y=Y(En(n));
      const involved = (n===ni||n===nf);
      ctx.strokeStyle = involved ? '#a4342c' : '#c7c2b5';
      ctx.lineWidth = involved ? 2.6 : 1.4;
      ctx.beginPath(); ctx.moveTo(m.l,y); ctx.lineTo(w-m.r,y); ctx.stroke();
      ctx.fillStyle = involved ? '#a4342c' : '#8a8d92'; ctx.textAlign='right';
      ctx.fillText(`n = ${n}`, m.l-8, y+4);
      if(n<=5 || involved){
        ctx.textAlign='left';
        ctx.fillText(`${fmt(En(n),2)} eV`, w-m.r+8, y+4);
      }
    }
    // the transition itself
    const yi=Y(En(ni)), yf=Y(En(nf));
    const x=m.l+(w-m.l-m.r)*0.62;
    const down = ni>nf;
    ctx.strokeStyle='#1f6f78'; ctx.lineWidth=2.8;
    ctx.beginPath(); ctx.moveTo(x,yi); ctx.lineTo(x,yf); ctx.stroke();
    const tipY = down? yf : yi, dir = down? 1 : -1;
    ctx.fillStyle='#1f6f78'; ctx.beginPath();
    ctx.moveTo(x,tipY); ctx.lineTo(x-6,tipY+dir*11); ctx.lineTo(x+6,tipY+dir*11);
    ctx.closePath(); ctx.fill();
    const lam = HC_EV_NM/Math.abs(En(ni)-En(nf));
    ctx.fillStyle='#1f6f78'; ctx.textAlign='left'; ctx.font='11px Helvetica,Arial,sans-serif';
    ctx.fillText(`${down?'emits':'absorbs'} ${fmt(lam,1)} nm`, x+10, (yi+yf)/2);

    ctx.font='12px Helvetica,Arial,sans-serif'; ctx.fillStyle='#1c1d20'; ctx.textAlign='left';
    ctx.fillText('Eₙ = −13.6 eV / n²', m.l, 16);
  }

  function drawCorr(){
    const {ctx,w,h}=fitCanvas(cCorr);
    ctx.clearRect(0,0,w,h);
    const m={l:60,r:16,t:24,b:36};
    const nMin=1, nMax=40;
    const X = n => m.l + (Math.log10(n)-Math.log10(nMin))/(Math.log10(nMax)-Math.log10(nMin))*(w-m.l-m.r);
    const Y = r => h-m.b - (Math.max(0,Math.min(2,r))/2)*(h-m.b-m.t);
    ctx.save(); ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle='#8a8d92'; ctx.strokeStyle='#e7e4dc';
    [1,2,5,10,20,40].forEach(n=>{
      const px=X(n);
      ctx.beginPath(); ctx.moveTo(px,m.t); ctx.lineTo(px,h-m.b); ctx.stroke();
      ctx.textAlign='center'; ctx.fillText(n, px, h-m.b+16);
    });
    [0,0.5,1,1.5,2].forEach(r=>{
      const py=Y(r);
      ctx.beginPath(); ctx.moveTo(m.l,py); ctx.lineTo(w-m.r,py); ctx.stroke();
      ctx.textAlign='right'; ctx.fillText(r.toFixed(1), m.l-8, py+3);
    });
    ctx.strokeStyle='#1c1d20'; ctx.lineWidth=1.3;
    ctx.beginPath(); ctx.moveTo(m.l,m.t); ctx.lineTo(m.l,h-m.b); ctx.lineTo(w-m.r,h-m.b); ctx.stroke();
    ctx.fillStyle='#1c1d20'; ctx.textAlign='center';
    ctx.fillText('quantum number n', m.l+(w-m.l-m.r)/2, h-6);
    ctx.save(); ctx.translate(14, m.t+(h-m.b-m.t)/2); ctx.rotate(-Math.PI/2);
    ctx.fillText('photon ν  /  orbital frequency', 0, 0); ctx.restore();
    ctx.restore();

    // ratio of the n -> n-1 photon frequency to the classical orbital frequency
    plotLine(ctx, X, Y, (()=>{ const a=[]; for(let n=2;n<=nMax;n+=0.02) a.push({x:n,y:1}); return a; })(),
             '#c7c2b5', 1.6, [4,3]);
    const pts=[];
    for(let n=2;n<=nMax;n+=0.25){
      const k=Math.round(n);
      if(k<2) continue;
      const nuPhoton = (E1_H*EV_J/H_J)*(1/((k-1)*(k-1)) - 1/(k*k));
      pts.push({x:k, y: nuPhoton/fOrb(k)});
    }
    plotLine(ctx, X, Y, pts, '#a4342c', 2.6);
    ctx.font='11px Helvetica,Arial,sans-serif'; ctx.textAlign='right';
    ctx.fillStyle='#a4342c'; ctx.fillText('n → n−1 photon, over the classical orbital frequency', w-m.r-8, m.t+14);
    ctx.fillStyle='#5a5d63'; ctx.fillText('the two agree in the limit of large n', w-m.r-8, m.t+30);
  }

  function draw(){
    let ni=parseInt(niEl.value,10), nf=parseInt(nfEl.value,10);
    niVal.textContent=ni; nfVal.textContent=nf;
    drawLevels(); drawCorr();
    if(ni===nf){
      readout.innerHTML = `<div>pick two different levels <b>—</b></div>`;
      return;
    }
    const dE = Math.abs(En(ni)-En(nf));
    const lam = HC_EV_NM/dE;
    const lo = Math.min(ni,nf);
    const nuPhoton = dE*EV_J/H_J;
    const region = lam<380?'ultraviolet':(lam<=750?'visible':'infrared');
    readout.innerHTML = `
      <div>from <b>n = ${ni}</b> (${fmt(En(ni),3)} eV)</div>
      <div>to <b>n = ${nf}</b> (${fmt(En(nf),3)} eV)</div>
      <div>photon energy <b>${fmt(dE,3)} eV</b></div>
      <div>wavelength <b>${fmt(lam,2)} nm</b> (${region})</div>
      <div>series <b>${SERIES_NAME[lo]||'beyond Pfund'}</b></div>
      <div>process <b>${ni>nf?'emission':'absorption'}</b></div>
      <div>orbital frequency at n=${ni} <b>${fmtSci(fOrb(ni),3)} Hz</b></div>
      <div>photon frequency <b>${fmtSci(nuPhoton,3)} Hz</b></div>`;
  }
  niEl.addEventListener('input',draw);
  nfEl.addEventListener('input',draw);
  registerCanvas('el_canvas',draw);
  registerCanvas('el_canvas_corr',draw);
}

/* =====================================================================
   6. REDUCED MASS AND THE ISOTOPE SHIFT
   ===================================================================== */
function setupReducedMass(){
  const canvas=document.getElementById('rm_canvas');
  const sysEl=document.getElementById('rm_sys');
  const niEl=document.getElementById('rm_ni'), niVal=document.getElementById('rm_ni_val');
  const readout=document.getElementById('rm_readout');

  // orbiting mass m, nuclear mass M, nuclear charge Z
  const SYS = {
    H:    {name:'hydrogen (¹H)',        m:M_E,  M:M_P,        Z:1},
    D:    {name:'deuterium (²H)',       m:M_E,  M:M_D,        Z:1},
    T:    {name:'tritium (³H)',         m:M_E,  M:M_T,        Z:1},
    He:   {name:'singly ionised helium', m:M_E, M:6.6447e-27, Z:2},
    Ps:   {name:'positronium',          m:M_E,  M:M_E,        Z:1},
    muH:  {name:'muonic hydrogen',      m:M_MU, M:M_P,        Z:1}
  };
  function physics(){
    const s = SYS[sysEl.value];
    const mu = s.m*s.M/(s.m+s.M);
    const scale = (mu/M_E)*s.Z*s.Z;             // energies scale as mu*Z^2
    const E1 = -E1_H*scale;
    const a  = A0*(M_E/mu)/s.Z;                 // the orbit scales the other way
    return {s,mu,scale,E1,a};
  }
  function lambda(sysKey, ni, nf){
    const s=SYS[sysKey]; const mu=s.m*s.M/(s.m+s.M);
    const dE = E1_H*(mu/M_E)*s.Z*s.Z*(1/(nf*nf) - 1/(ni*ni));
    return HC_EV_NM/dE;
  }

  function draw(){
    const {ctx,w,h}=fitCanvas(canvas);
    const p = physics();
    const ni = parseInt(niEl.value,10);
    niVal.textContent = ni;
    ctx.clearRect(0,0,w,h);

    // compare the same n -> 2 line across every system, as a wavelength ruler
    const keys = Object.keys(SYS);
    const lams = keys.map(k=>lambda(k,ni,2));
    const lo = Math.min(...lams), hi = Math.max(...lams);
    const pad = (hi-lo)*0.12 || hi*0.02;
    const m={l:150,r:40,t:34,b:44};
    const X = l => m.l + (l-(lo-pad))/((hi+pad)-(lo-pad))*(w-m.l-m.r);

    ctx.strokeStyle='#1c1d20'; ctx.lineWidth=1.3;
    ctx.beginPath(); ctx.moveTo(m.l,h-m.b); ctx.lineTo(w-m.r,h-m.b); ctx.stroke();
    ctx.font='10px Helvetica,Arial,sans-serif'; ctx.fillStyle='#8a8d92'; ctx.textAlign='center';
    for(let i=0;i<=4;i++){
      const l=(lo-pad)+i*((hi+pad)-(lo-pad))/4;
      ctx.beginPath(); ctx.moveTo(X(l),h-m.b-4); ctx.lineTo(X(l),h-m.b+4); ctx.stroke();
      ctx.fillText(fmt(l,2), X(l), h-m.b+17);
    }
    ctx.fillStyle='#1c1d20'; ctx.fillText('wavelength (nm)', m.l+(w-m.l-m.r)/2, h-8);

    const rowH=(h-m.t-m.b-12)/keys.length;
    keys.forEach((k,i)=>{
      const y=m.t+i*rowH;
      const cur = (k===sysEl.value);
      const px = X(lams[i]);
      ctx.strokeStyle = cur ? '#a4342c' : '#d8d3c6';
      ctx.lineWidth = cur ? 3 : 1.6;
      ctx.beginPath(); ctx.moveTo(px,y); ctx.lineTo(px,h-m.b); ctx.stroke();
      ctx.fillStyle = cur ? '#a4342c' : '#b9b3a4';
      ctx.beginPath(); ctx.arc(px,y,cur?5:3.5,0,7); ctx.fill();
      ctx.font = (cur?'bold ':'')+'11px Helvetica,Arial,sans-serif';
      ctx.textAlign='right'; ctx.fillStyle = cur ? '#1c1d20' : '#8a8d92';
      ctx.fillText(SYS[k].name, m.l-10, y+4);
      ctx.textAlign='left';
      ctx.fillText(fmt(lams[i],3)+' nm', px+9, y+4);
    });
    ctx.font='12px Helvetica,Arial,sans-serif'; ctx.fillStyle='#1c1d20'; ctx.textAlign='left';
    ctx.fillText(`the n = ${ni} → 2 line, compared across systems`, m.l-140, 18);

    const shift = lambda('H',ni,2) - lambda('D',ni,2);
    readout.innerHTML = `
      <div>system <b>${p.s.name}</b></div>
      <div>nuclear mass M <b>${fmtSci(p.s.M,3)} kg</b></div>
      <div>reduced mass &mu; <b>${fmtSci(p.mu,4)} kg</b></div>
      <div>&mu;/m <b>${fmt(p.mu/p.s.m,6)}</b></div>
      <div>ground state E&#8321; <b>${fmt(p.E1,3)} eV</b></div>
      <div>orbit scale <b>${fmt(p.a*1e12,2)} pm</b></div>
      <div>this n=${ni}&rarr;2 line <b>${fmt(lambda(sysEl.value,ni,2),3)} nm</b></div>
      <div>H &minus; D shift <b>${fmt(shift,3)} nm</b></div>`;
  }
  sysEl.addEventListener('change',draw);
  niEl.addEventListener('input',draw);
  registerCanvas('rm_canvas',draw);
}

/* =====================================================================
   7. THE FRANCK-HERTZ EXPERIMENT
   ===================================================================== */
function setupFranckHertz(){
  const canvas=document.getElementById('fh_canvas');
  const gasEl=document.getElementById('fh_gas');
  const vEl=document.getElementById('fh_v'), vVal=document.getElementById('fh_v_val');
  const readout=document.getElementById('fh_readout');
  const GAS = {
    hg: {name:'mercury vapour', E:4.9,  line:253.6},
    na: {name:'sodium vapour',  E:2.1,  line:589.0},
    ne: {name:'neon',           E:18.7, line:66.3}
  };
  const VMAX = 30;

  // Schematic but structurally faithful: current climbs with voltage and drops
  // each time the electrons have just enough energy for one more inelastic
  // collision, so the dips land at multiples of the excitation energy.
  function current(V, Eexc){
    let I = 0.12 + 0.88*Math.sqrt(Math.max(0,V)/VMAX);
    for(let k=1;k*Eexc<=VMAX+Eexc;k++){
      const c = k*Eexc + 0.55;
      I -= 0.60*Math.exp(-Math.pow((V-c)/(0.42+0.045*Eexc),2));
    }
    return Math.max(0.02, I);
  }

  function draw(){
    const {ctx,w,h}=fitCanvas(canvas);
    const g = GAS[gasEl.value];
    const V = parseFloat(vEl.value);
    vVal.textContent = fmt(V,1);
    ctx.clearRect(0,0,w,h);
    const m={l:54,r:18,t:24,b:36};
    const {X,Y}=drawAxes(ctx,w,h,m,0,VMAX,0,1.12,'accelerating voltage V (volts)','plate current',
                         {nx:6,ny:4,xfmt:v=>v.toFixed(0),yfmt:()=>''});

    // mark the critical potentials
    for(let k=1;k*g.E<=VMAX;k++){
      const v=k*g.E;
      plotLine(ctx,X,Y,[{x:v,y:0},{x:v,y:1.12}],'#d8d3c6',1.2,[3,3]);
      ctx.font='10px Helvetica,Arial,sans-serif'; ctx.fillStyle='#b9b3a4'; ctx.textAlign='center';
      ctx.fillText(`${k}×`, X(v), m.t+11);
    }
    const pts=[]; for(let v=0;v<=VMAX;v+=0.05) pts.push({x:v,y:current(v,g.E)});
    plotLine(ctx,X,Y,pts,'#a4342c',2.6);
    dotAt(ctx,X,Y,V,current(V,g.E),'#1f6f78',5.5);

    ctx.font='11px Helvetica,Arial,sans-serif'; ctx.textAlign='left'; ctx.fillStyle='#5a5d63';
    ctx.fillText(`${g.name}: first excited state at ${g.E} eV`, m.l+8, h-m.b-10);
    ctx.textAlign='right'; ctx.fillStyle='#a4342c';
    ctx.fillText('every dip is one more inelastic collision per electron', w-m.r-8, m.t+14);

    const nColl = Math.floor(V/g.E);
    const leftover = V - nColl*g.E;
    readout.innerHTML = `
      <div>vapour <b>${g.name}</b></div>
      <div>excitation energy <b>${g.E} eV</b></div>
      <div>accelerating voltage <b>${fmt(V,1)} V</b></div>
      <div>inelastic collisions possible <b>${nColl}</b></div>
      <div>energy left over <b>${fmt(leftover,2)} eV</b></div>
      <div>emitted line <b>${fmt(HC_EV_NM/g.E,1)} nm</b></div>
      <div>observed line <b>${g.line} nm</b>
        ${Math.abs(HC_EV_NM/g.E-g.line)/g.line<0.02?'<span class="badge ok">matches</span>':''}</div>`;
  }
  gasEl.addEventListener('change',draw);
  vEl.addEventListener('input',draw);
  registerCanvas('fh_canvas',draw);
}

// register with the loader in app.js
registerModule('setupRutherford', setupRutherford);
registerModule('setupClassicalCollapse', setupClassicalCollapse);
registerModule('setupSpectralSeries', setupSpectralSeries);
registerModule('setupBohrWaves', setupBohrWaves);
registerModule('setupEnergyLevels', setupEnergyLevels);
registerModule('setupReducedMass', setupReducedMass);
registerModule('setupFranckHertz', setupFranckHertz);
