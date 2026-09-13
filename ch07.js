/* =====================================================================
   Concepts of Modern Physics — Interactive Companion
   Chapter 7: Many-Electron Atoms
   Every number is computed live from the chapter's formulas.
   ===================================================================== */

const ELEM = ['','H','He','Li','Be','B','C','N','O','F','Ne','Na','Mg','Al','Si','P','S','Cl','Ar',
  'K','Ca','Sc','Ti','V','Cr','Mn','Fe','Co','Ni','Cu','Zn','Ga','Ge','As','Se','Br','Kr',
  'Rb','Sr','Y','Zr','Nb','Mo','Tc','Ru','Rh','Pd','Ag','Cd','In','Sn','Sb','Te','I','Xe'];
// measured first ionization energies, eV (Z = 1 .. 54)
const IE = [0,13.598,24.587,5.392,9.323,8.298,11.260,14.534,13.618,17.423,21.565,
  5.139,7.646,5.986,8.152,10.487,10.360,12.968,15.760,4.341,6.113,
  6.561,6.828,6.746,6.767,7.434,7.902,7.881,7.640,7.726,9.394,
  5.999,7.900,9.789,9.752,11.814,13.999,4.177,5.695,6.217,6.634,
  6.759,7.092,7.280,7.361,7.459,8.337,7.576,8.994,5.786,7.344,
  8.608,9.010,10.451,12.130];
const NOBLE = [2,10,18,36,54];

// Madelung order: fill by increasing n+l, then by increasing n
const SUBSHELLS = (()=>{
  const out=[];
  for(let s=1;s<=8;s++) for(let l=0;l<Math.min(s,5);l++){
    const n=s-l; if(n>l) out.push({n,l,cap:2*(2*l+1),key:(n+l)*100-n});
  }
  return out.sort((a,b)=>a.key===b.key?a.n-b.n:((a.n+a.l)-(b.n+b.l))||(a.n-b.n));
})();
// the well-known irregularities for Z <= 54
const EXCEPTIONS = {24:'[Ar] 3d⁵ 4s¹',29:'[Ar] 3d¹⁰ 4s¹',41:'[Kr] 4d⁴ 5s¹',42:'[Kr] 4d⁵ 5s¹',
  44:'[Kr] 4d⁷ 5s¹',45:'[Kr] 4d⁸ 5s¹',46:'[Kr] 4d¹⁰',47:'[Kr] 4d¹⁰ 5s¹'};
const SUP='⁰¹²³⁴⁵⁶⁷⁸⁹';
function supNum(k){ return String(k).split('').map(d=>SUP[+d]).join(''); }

function configure(Z){
  let left=Z; const filled=[];
  for(const s of SUBSHELLS){
    if(left<=0) break;
    const put=Math.min(left,s.cap);
    filled.push({n:s.n,l:s.l,count:put,cap:s.cap});
    left-=put;
  }
  return filled;
}
function configString(Z){
  return configure(Z).map(s=>`${s.n}${ORB[s.l]}${supNum(s.count)}`).join(' ');
}

/* =====================================================================
   1. ELECTRON SPIN
   ===================================================================== */
function setupSpin(){
  const canvas=document.getElementById('es_canvas');
  const rEl=document.getElementById('es_r'), rVal=document.getElementById('es_r_val');
  const readout=document.getElementById('es_readout');
  const S_MAG=Math.sqrt(0.5*1.5);                 // sqrt(s(s+1)) with s = 1/2

  function draw(){
    const {ctx,w,h}=fitCanvas(canvas);
    const rad=Math.pow(10,parseFloat(rEl.value));  // assumed electron radius, m
    rVal.textContent=fmtSci(rad,2)+' m';
    ctx.clearRect(0,0,w,h);

    // left: the two allowed spin orientations
    const cx=w*0.20, cy=h*0.50, S=Math.min(w*0.13,h*0.30)/S_MAG;
    ctx.strokeStyle='#1c1d20'; ctx.lineWidth=1.4;
    ctx.beginPath(); ctx.moveTo(cx,cy-S_MAG*S*1.3); ctx.lineTo(cx,cy+S_MAG*S*1.3); ctx.stroke();
    ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle='#1c1d20'; ctx.textAlign='center';
    ctx.fillText('z', cx, cy-S_MAG*S*1.3-8);
    [[0.5,'#a4342c','+½ħ  "up"'],[-0.5,'#1f6f78','−½ħ  "down"']].forEach(([ms,col,lab])=>{
      const cosT=ms/S_MAG, sinT=Math.sqrt(1-cosT*cosT);
      const tx=cx+S_MAG*S*sinT, ty=cy-S_MAG*S*cosT;
      ctx.strokeStyle=col; ctx.lineWidth=2.8;
      ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(tx,ty); ctx.stroke();
      ctx.fillStyle=col; ctx.beginPath(); ctx.arc(tx,ty,5,0,7); ctx.fill();
      ctx.strokeStyle=col; ctx.globalAlpha=0.4; ctx.lineWidth=1.4;
      ctx.beginPath(); ctx.ellipse(cx,ty,S_MAG*S*sinT,S_MAG*S*sinT*0.26,0,0,7); ctx.stroke();
      ctx.globalAlpha=1;
      ctx.textAlign='left'; ctx.fillText(lab, tx+9, ty+4);
    });
    ctx.fillStyle='#5a5d63'; ctx.textAlign='center'; ctx.font='11px Helvetica,Arial,sans-serif';
    ctx.fillText('only two orientations', cx, cy+S_MAG*S*1.3+22);

    // right: a Stern-Gerlach beam splitting in two
    const bx0=w*0.42, bx1=w-30, by=h*0.50;
    ctx.strokeStyle='#8a8d92'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(bx0,by); ctx.lineTo(bx0+(bx1-bx0)*0.40,by); ctx.stroke();
    ctx.fillStyle='#8a8d92'; ctx.textAlign='left'; ctx.font='11px Helvetica,Arial,sans-serif';
    ctx.fillText('beam of atoms', bx0, by-10);
    // magnet pole pieces
    const mx0=bx0+(bx1-bx0)*0.40, mx1=bx0+(bx1-bx0)*0.66;
    ctx.fillStyle='#efebe2'; ctx.fillRect(mx0,by-58,mx1-mx0,26); ctx.fillRect(mx0,by+32,mx1-mx0,26);
    ctx.strokeStyle='#c7c2b5'; ctx.lineWidth=1.4;
    ctx.strokeRect(mx0,by-58,mx1-mx0,26); ctx.strokeRect(mx0,by+32,mx1-mx0,26);
    ctx.fillStyle='#8a8d92'; ctx.textAlign='center';
    ctx.fillText('inhomogeneous B', (mx0+mx1)/2, by-64);
    // the two deflected beams
    [[-1,'#a4342c'],[1,'#1f6f78']].forEach(([sgn,col])=>{
      ctx.strokeStyle=col; ctx.lineWidth=2.4; ctx.beginPath();
      ctx.moveTo(mx0,by);
      for(let x=mx0;x<=bx1;x++){
        const u=(x-mx0)/(bx1-mx0);
        ctx.lineTo(x, by + sgn*26*u*u);
      }
      ctx.stroke();
      ctx.fillStyle=col; ctx.beginPath(); ctx.arc(bx1,by+sgn*26,5,0,7); ctx.fill();
    });
    ctx.strokeStyle='#1c1d20'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(bx1,by-40); ctx.lineTo(bx1,by+40); ctx.stroke();
    ctx.fillStyle='#5a5d63'; ctx.textAlign='right'; ctx.font='11px Helvetica,Arial,sans-serif';
    ctx.fillText('two spots, never a smear', bx1-8, by+56);

    // Example 7.1: how fast would a sphere of this radius have to spin?
    const v = 5*S_MAG*HBAR/(2*M_E*rad);
    readout.innerHTML = `
      <div>spin quantum number s <b>&frac12;</b> (fixed, unlike &ell;)</div>
      <div>|S| = &radic;(s(s+1))&#8463; <b>${fmt(S_MAG,4)}&#8463;</b></div>
      <div>S<sub>z</sub> = m<sub>s</sub>&#8463; <b>&plusmn;&frac12;&#8463;</b></div>
      <div>orientations <b>2</b> &mdash; an even number, impossible for orbital motion</div>
      <div>assumed electron radius <b>${fmtSci(rad,2)} m</b></div>
      <div>equatorial speed needed <b>${fmtSci(v,3)} m/s</b></div>
      <div>that is <b>${fmtSci(v/C_EXACT,3)}c</b>
        ${v>C_EXACT?'<span class="badge no">faster than light</span>':''}</div>`;
  }
  rEl.addEventListener('input',draw);
  registerCanvas('es_canvas',draw);
}

/* =====================================================================
   2. THE EXCLUSION PRINCIPLE AS A SYMMETRY
   ===================================================================== */
function setupExclusion(){
  const canvas=document.getElementById('ep_canvas');
  const n1El=document.getElementById('ep_n1'), n1Val=document.getElementById('ep_n1_val');
  const n2El=document.getElementById('ep_n2'), n2Val=document.getElementById('ep_n2_val');
  const readout=document.getElementById('ep_readout');
  const NG=150;
  const offS=document.createElement('canvas'); offS.width=NG; offS.height=NG;
  const offA=document.createElement('canvas'); offA.width=NG; offA.height=NG;

  function build(off, n1, n2, sign){
    const ctx=off.getContext('2d');
    const img=ctx.createImageData(NG,NG), d=img.data;
    const vals=new Float64Array(NG*NG);
    let peak=0;
    for(let j=0;j<NG;j++){
      const x2=(j+0.5)/NG;
      for(let i=0;i<NG;i++){
        const x1=(i+0.5)/NG;
        const a=Math.sin(n1*Math.PI*x1)*Math.sin(n2*Math.PI*x2);
        const b=Math.sin(n1*Math.PI*x2)*Math.sin(n2*Math.PI*x1);
        const v=Math.pow(a+sign*b,2);
        vals[j*NG+i]=v; if(v>peak) peak=v;
      }
    }
    for(let k=0;k<NG*NG;k++){
      const t = peak>1e-12 ? Math.pow(vals[k]/peak,0.55) : 0;
      const r0=255,g0=253,b0=248, r1=168,g1=200,b1=202, r2=20,g2=78,b2=84;
      let R,G,B;
      if(t<0.5){ const u=t*2; R=r0+(r1-r0)*u; G=g0+(g1-g0)*u; B=b0+(b1-b0)*u; }
      else { const u=(t-0.5)*2; R=r1+(r2-r1)*u; G=g1+(g2-g1)*u; B=b1+(b2-b1)*u; }
      d[k*4]=R; d[k*4+1]=G; d[k*4+2]=B; d[k*4+3]=255;
    }
    ctx.putImageData(img,0,0);
    return peak;
  }

  function draw(){
    const {ctx,w,h}=fitCanvas(canvas);
    const n1=parseInt(n1El.value,10), n2=parseInt(n2El.value,10);
    n1Val.textContent=n1; n2Val.textContent=n2;
    ctx.clearRect(0,0,w,h);
    const pkS=build(offS,n1,n2,+1);
    const pkA=build(offA,n1,n2,-1);

    const side=Math.min((w-110)/2, h-64);
    const y0=30;
    const xs=[ (w/2-side-18), (w/2+18) ];
    [[offS,'symmetric  ψ(1,2) = +ψ(2,1)','bosons',pkS],
     [offA,'antisymmetric  ψ(1,2) = −ψ(2,1)','fermions — electrons',pkA]].forEach(([off,title,who,pk],i)=>{
      ctx.imageSmoothingEnabled=true;
      if(pk>1e-12){
        ctx.drawImage(off, xs[i], y0, side, side);
      } else {
        ctx.fillStyle='#fffdf8'; ctx.fillRect(xs[i],y0,side,side);
        ctx.fillStyle='#a4342c'; ctx.font='13px Helvetica,Arial,sans-serif'; ctx.textAlign='center';
        ctx.fillText('ψ ≡ 0 everywhere', xs[i]+side/2, y0+side/2-6);
        ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle='#5a5d63';
        ctx.fillText('this state cannot exist', xs[i]+side/2, y0+side/2+14);
      }
      ctx.strokeStyle='#e0dbd0'; ctx.lineWidth=1; ctx.strokeRect(xs[i],y0,side,side);
      // the diagonal x1 = x2, where the two particles coincide
      ctx.strokeStyle='rgba(164,52,44,0.5)'; ctx.lineWidth=1.4; ctx.setLineDash([4,3]);
      ctx.beginPath(); ctx.moveTo(xs[i],y0+side); ctx.lineTo(xs[i]+side,y0); ctx.stroke();
      ctx.setLineDash([]);
      ctx.font='11px Helvetica,Arial,sans-serif'; ctx.textAlign='center'; ctx.fillStyle='#1c1d20';
      ctx.fillText(title, xs[i]+side/2, y0-14);
      ctx.fillStyle='#5a5d63'; ctx.fillText(who, xs[i]+side/2, y0+side+16);
      ctx.fillStyle='#8a8d92'; ctx.font='10px Helvetica,Arial,sans-serif';
      ctx.fillText('x₁ →', xs[i]+side/2, y0+side+32);
    });
    ctx.save(); ctx.translate(xs[0]-14, y0+side/2); ctx.rotate(-Math.PI/2);
    ctx.fillStyle='#8a8d92'; ctx.font='10px Helvetica,Arial,sans-serif'; ctx.textAlign='center';
    ctx.fillText('x₂ →',0,0); ctx.restore();
    ctx.fillStyle='#a4342c'; ctx.font='10px Helvetica,Arial,sans-serif'; ctx.textAlign='left';
    ctx.fillText('dashed line: both particles at the same place', 14, h-8);

    const same=(n1===n2);
    readout.innerHTML = `
      <div>particle 1 in state <b>n = ${n1}</b></div>
      <div>particle 2 in state <b>n = ${n2}</b></div>
      <div>symmetric combination <b>allowed</b> <span class="badge ok">bosons</span></div>
      <div>antisymmetric combination <b>${same?'vanishes identically':'allowed'}</b>
        ${same?'<span class="badge no">forbidden</span>':'<span class="badge ok">fermions</span>'}</div>
      <div>on the diagonal x&#8321;=x&#8322; <b>${same?'—':'antisymmetric ψ = 0'}</b></div>
      <div>meaning <b>${same?'two electrons cannot share one state':'electrons keep apart even with no force between them'}</b></div>`;
  }
  n1El.addEventListener('input',draw);
  n2El.addEventListener('input',draw);
  registerCanvas('ep_canvas',draw);
}

/* =====================================================================
   3. BUILDING THE PERIODIC TABLE
   ===================================================================== */
function setupPeriodicTable(){
  const canvas=document.getElementById('pt_canvas');
  const zEl=document.getElementById('pt_z'), zVal=document.getElementById('pt_z_val');
  const readout=document.getElementById('pt_readout');

  function draw(){
    const {ctx,w,h}=fitCanvas(canvas);
    const Z=parseInt(zEl.value,10);
    zVal.textContent=`${Z}  (${ELEM[Z]})`;
    ctx.clearRect(0,0,w,h);
    const cfg=configure(Z);
    const m={l:24,r:24,t:30,b:26};

    // one bar per subshell, in filling order, shaded by how full it is
    const rows=cfg.length;
    const barH=Math.min(22,(h-m.t-m.b)/Math.max(rows,1)-4);
    const gap=Math.max(2,(h-m.t-m.b-rows*barH)/Math.max(rows,1));
    const maxCap=14;
    const unit=Math.min(24,(w-m.l-m.r-170)/maxCap);

    ctx.font='11px Helvetica,Arial,sans-serif';
    cfg.forEach((s,i)=>{
      const y=m.t+i*(barH+gap);
      ctx.fillStyle='#5a5d63'; ctx.textAlign='right';
      ctx.fillText(`${s.n}${ORB[s.l]}`, m.l+30, y+barH*0.72);
      for(let k=0;k<s.cap;k++){
        const x=m.l+40+k*unit;
        const filled=k<s.count;
        ctx.fillStyle = filled ? ['#a4342c','#1f6f78','#8a6d1f','#5a5d63'][Math.min(s.l,3)] : '#efebe2';
        ctx.beginPath();
        ctx.arc(x+unit/2, y+barH/2, Math.min(unit,barH)*0.33, 0, 7);
        ctx.fill();
      }
      ctx.fillStyle = s.count===s.cap ? '#1f6f78' : '#a4342c';
      ctx.textAlign='left';
      ctx.fillText(`${s.count}/${s.cap}${s.count===s.cap?'  closed':''}`, m.l+44+s.cap*unit, y+barH*0.72);
    });

    ctx.font='13px Helvetica,Arial,sans-serif'; ctx.fillStyle='#1c1d20'; ctx.textAlign='left';
    ctx.fillText(`${ELEM[Z]}  (Z = ${Z})`, m.l, m.t-12);
    ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle='#8a8d92'; ctx.textAlign='right';
    ctx.fillText('filled in Madelung order: lowest n+ℓ first, then lowest n', w-m.r, m.t-12);

    const outer=cfg[cfg.length-1];
    const isNoble=NOBLE.includes(Z);
    const valence=cfg.filter(s=>s.n===Math.max(...cfg.map(t=>t.n))).reduce((a,s)=>a+s.count,0);
    readout.innerHTML = `
      <div>element <b>${ELEM[Z]}</b>, Z = ${Z}</div>
      <div>configuration <b>${EXCEPTIONS[Z]?EXCEPTIONS[Z]+' *':configString(Z)}</b></div>
      <div>outermost subshell <b>${outer.n}${ORB[outer.l]}</b>, ${outer.count}/${outer.cap}</div>
      <div>electrons in the outer shell <b>${valence}</b></div>
      <div>first ionization energy <b>${IE[Z]} eV</b></div>
      <div>type <b>${isNoble?'noble gas — every subshell closed':(outer.count===1&&outer.l===0?'alkali — one loose electron':'')}</b></div>
      ${EXCEPTIONS[Z]?'<div>* <b>an exception</b> — a half or fully filled d subshell wins</div>':''}`;
  }
  zEl.addEventListener('input',draw);
  registerCanvas('pt_canvas',draw);
}

/* =====================================================================
   4. THE PERIODIC TREND IN IONIZATION ENERGY
   ===================================================================== */
function setupIonization(){
  const canvas=document.getElementById('ie_canvas');
  const zEl=document.getElementById('ie_z'), zVal=document.getElementById('ie_z_val');
  const readout=document.getElementById('ie_readout');

  function draw(){
    const {ctx,w,h}=fitCanvas(canvas);
    const Z=parseInt(zEl.value,10);
    zVal.textContent=`${Z}  (${ELEM[Z]})`;
    ctx.clearRect(0,0,w,h);
    const m={l:52,r:18,t:26,b:38};
    const {X,Y}=drawAxes(ctx,w,h,m,1,54,0,26,'atomic number Z','first ionization energy (eV)',
                         {nx:53/6|0,ny:4,xfmt:v=>v.toFixed(0),yfmt:v=>v.toFixed(0)});
    // shade each period
    const starts=[1,3,11,19,37];
    starts.forEach((s,i)=>{
      const e=(NOBLE[i]||54);
      if(i%2===0){
        ctx.fillStyle='rgba(200,195,180,0.13)';
        ctx.fillRect(X(s),m.t,X(e)-X(s),h-m.b-m.t);
      }
    });
    const pts=[]; for(let k=1;k<=54;k++) pts.push({x:k,y:IE[k]});
    plotLine(ctx,X,Y,pts,'#a4342c',2.2);
    // the noble gases sit on the peaks, the alkalis in the troughs
    ctx.font='10px Helvetica,Arial,sans-serif';
    NOBLE.forEach(z=>{
      dotAt(ctx,X,Y,z,IE[z],'#1f6f78',4.5);
      ctx.fillStyle='#1f6f78'; ctx.textAlign='center';
      ctx.fillText(ELEM[z], X(z), Y(IE[z])-9);
    });
    [3,11,19,37].forEach(z=>{
      dotAt(ctx,X,Y,z,IE[z],'#8a8d92',3.5);
      ctx.fillStyle='#8a8d92'; ctx.textAlign='center';
      ctx.fillText(ELEM[z], X(z), Y(IE[z])+16);
    });
    dotAt(ctx,X,Y,Z,IE[Z],'#1c1d20',6);
    ctx.fillStyle='#1c1d20'; ctx.font='11px Helvetica,Arial,sans-serif'; ctx.textAlign='left';
    ctx.fillText(`${ELEM[Z]}: ${IE[Z]} eV`, X(Z)+9, Y(IE[Z])-6);

    const cfg=configure(Z);
    const outer=cfg[cfg.length-1];
    const prevNoble=[...NOBLE].reverse().find(z=>z<Z)||0;
    readout.innerHTML = `
      <div>element <b>${ELEM[Z]}</b> (Z = ${Z})</div>
      <div>ionization energy <b>${IE[Z]} eV</b></div>
      <div>outer subshell <b>${outer.n}${ORB[outer.l]}</b> ${outer.count}/${outer.cap}</div>
      <div>previous closed shell <b>${prevNoble?ELEM[prevNoble]:'—'}</b></div>
      <div>highest so far <b>He, ${IE[2]} eV</b></div>
      <div>lowest so far <b>Rb, ${IE[37]} eV</b></div>
      <div>ratio He / Rb <b>${fmt(IE[2]/IE[37],2)}&times;</b></div>`;
  }
  zEl.addEventListener('input',draw);
  registerCanvas('ie_canvas',draw);
}

/* =====================================================================
   5. SPIN-ORBIT COUPLING AND TOTAL ANGULAR MOMENTUM
   ===================================================================== */
function setupSpinOrbit(){
  const cLev=document.getElementById('so_canvas');
  const cVec=document.getElementById('so_canvas_vec');
  const lEl=document.getElementById('so_l'), lVal=document.getElementById('so_l_val');
  const splitEl=document.getElementById('so_split'), splitVal=document.getElementById('so_split_val');
  const lamEl=document.getElementById('so_lam'), lamVal=document.getElementById('so_lam_val');
  const readout=document.getElementById('so_readout');

  function jvals(l){ return l===0 ? [0.5] : [l+0.5, l-0.5]; }
  const mag = j => Math.sqrt(j*(j+1));

  function drawLev(){
    const {ctx,w,h}=fitCanvas(cLev);
    const l=parseInt(lEl.value,10);
    const dE=parseFloat(splitEl.value)*1e-5;        // eV
    const lam=parseFloat(lamEl.value);
    ctx.clearRect(0,0,w,h);
    const m={l:70,r:150,t:34,b:40};
    const yUp=m.t+56, yLo=h-m.b-26;
    const js=jvals(l);
    const spread=30;

    ctx.font='11px Helvetica,Arial,sans-serif';
    // the unsplit level
    ctx.strokeStyle='#d8d3c6'; ctx.lineWidth=1.6; ctx.setLineDash([4,3]);
    ctx.beginPath(); ctx.moveTo(m.l,yUp); ctx.lineTo(m.l+58,yUp); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle='#8a8d92'; ctx.textAlign='right';
    ctx.fillText('no spin–orbit', m.l-4, yUp+4);

    js.forEach((j,i)=>{
      const y = js.length===1 ? yUp : yUp + (i===0?-1:1)*spread;
      ctx.strokeStyle='#a4342c'; ctx.lineWidth=2.4;
      ctx.beginPath(); ctx.moveTo(m.l+62,y); ctx.lineTo(w-m.r-10,y); ctx.stroke();
      ctx.fillStyle='#a4342c'; ctx.textAlign='left';
      ctx.fillText(`j = ${j===Math.floor(j)?j:j*2+'/2'}   ( ${2*j+1} states )`, w-m.r-6, y+4);
    });
    ctx.strokeStyle='#1f6f78'; ctx.lineWidth=2.4;
    ctx.beginPath(); ctx.moveTo(m.l+62,yLo); ctx.lineTo(w-m.r-10,yLo); ctx.stroke();
    ctx.fillStyle='#1f6f78'; ctx.textAlign='left';
    ctx.fillText('lower level (s state)', w-m.r-6, yLo+4);

    // the two transitions, giving a doublet
    js.forEach((j,i)=>{
      const y = js.length===1 ? yUp : yUp + (i===0?-1:1)*spread;
      const x = w*0.44 + i*40;
      ctx.strokeStyle='#1c1d20'; ctx.lineWidth=1.8;
      ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x,yLo); ctx.stroke();
      ctx.fillStyle='#1c1d20'; ctx.beginPath(); ctx.moveTo(x,yLo);
      ctx.lineTo(x-5,yLo-10); ctx.lineTo(x+5,yLo-10); ctx.closePath(); ctx.fill();
    });

    if(l>0){
      const dLam = lam*lam*dE/HC_EV_NM;
      ctx.textAlign='left'; ctx.fillStyle='#5a5d63'; ctx.font='11px Helvetica,Arial,sans-serif';
      ctx.fillText(`splitting ΔE = ${fmtSci(dE,2)} eV  →  two lines ${fmt(dLam,3)} nm apart`, m.l, h-14);
    } else {
      ctx.textAlign='left'; ctx.fillStyle='#5a5d63';
      ctx.fillText('an s state has ℓ = 0, so there is no orbital field to couple to — no splitting', m.l, h-14);
    }
    ctx.fillStyle='#1c1d20'; ctx.font='12px Helvetica,Arial,sans-serif'; ctx.textAlign='left';
    ctx.fillText(`upper state: ℓ = ${l} (${ORB[l]})`, m.l, m.t-14);
  }

  function drawVec(){
    const {ctx,w,h}=fitCanvas(cVec);
    const l=parseInt(lEl.value,10);
    ctx.clearRect(0,0,w,h);
    const js=jvals(l);
    const L=Math.sqrt(l*(l+1)), S=Math.sqrt(0.75);
    const maxJ=Math.max(...js.map(mag), L+S);
    const scale=Math.min(w*0.20,h*0.36)/maxJ;

    js.forEach((j,i)=>{
      const cx=w*(js.length===1?0.5:(i===0?0.28:0.72)), cy=h*0.60;
      const J=mag(j);
      // draw L and S adding to J, with the geometry that gives |J| = sqrt(j(j+1))
      const cosLJ=(J*J+L*L-S*S)/(2*J*L||1);
      const angJ=-Math.PI/2;
      const Jx=cx+J*scale*Math.cos(angJ), Jy=cy+J*scale*Math.sin(angJ);
      const angL=angJ + (i===0?1:-1)*Math.acos(Math.max(-1,Math.min(1,cosLJ)));
      const Lx=cx+L*scale*Math.cos(angL), Ly=cy+L*scale*Math.sin(angL);
      function arrow(x0,y0,x1,y1,col,lab,w0){
        ctx.strokeStyle=col; ctx.fillStyle=col; ctx.lineWidth=w0||2.4;
        ctx.beginPath(); ctx.moveTo(x0,y0); ctx.lineTo(x1,y1); ctx.stroke();
        const a=Math.atan2(y1-y0,x1-x0);
        ctx.beginPath(); ctx.moveTo(x1,y1);
        ctx.lineTo(x1-9*Math.cos(a-0.4),y1-9*Math.sin(a-0.4));
        ctx.lineTo(x1-9*Math.cos(a+0.4),y1-9*Math.sin(a+0.4));
        ctx.closePath(); ctx.fill();
        ctx.font='11px Helvetica,Arial,sans-serif'; ctx.textAlign='left';
        ctx.fillText(lab, x1+6, y1);
      }
      if(l>0) arrow(cx,cy,Lx,Ly,'#1f6f78',`L = ${fmt(L,2)}ħ`);
      arrow(Lx,Ly,Jx,Jy,'#8a6d1f',`S`,2);
      arrow(cx,cy,Jx,Jy,'#a4342c',`J = ${fmt(J,2)}ħ`,2.8);
      ctx.fillStyle='#1c1d20'; ctx.font='12px Helvetica,Arial,sans-serif'; ctx.textAlign='center';
      ctx.fillText(`j = ${j*2}/2`, cx, h-14);
      ctx.font='10px Helvetica,Arial,sans-serif'; ctx.fillStyle='#5a5d63';
      ctx.fillText(i===0?'spin with the orbit':'spin against it', cx, h-30);
    });
    ctx.fillStyle='#5a5d63'; ctx.font='11px Helvetica,Arial,sans-serif'; ctx.textAlign='left';
    ctx.fillText('J = L + S, and only j = ℓ ± ½ are allowed', 14, 20);
  }

  function draw(){
    const l=parseInt(lEl.value,10);
    const dE=parseFloat(splitEl.value)*1e-5, lam=parseFloat(lamEl.value);
    lVal.textContent=`${l} (${ORB[l]})`;
    splitVal.textContent=fmtSci(dE,2);
    lamVal.textContent=fmt(lam,1);
    drawLev(); drawVec();
    const js=jvals(l);
    const dLam=lam*lam*dE/HC_EV_NM;
    readout.innerHTML = `
      <div>orbital &ell; <b>${l}</b>, spin s <b>&frac12;</b></div>
      <div>allowed j <b>${js.map(j=>j*2+'/2').join(', ')}</b></div>
      <div>|J| = &radic;(j(j+1))&#8463; <b>${js.map(j=>fmt(mag(j),3)).join(', ')}&#8463;</b></div>
      <div>states per level (2j+1) <b>${js.map(j=>2*j+1).join(', ')}</b></div>
      <div>splitting &Delta;E <b>${fmtSci(dE,3)} eV</b></div>
      <div>line at &lambda; <b>${fmt(lam,1)} nm</b></div>
      <div>doublet separation <b>${fmt(dLam,4)} nm</b></div>
      <div>&Delta;&lambda;/&lambda; <b>${fmtSci(dLam/lam,2)}</b></div>`;
  }
  [lEl,splitEl,lamEl].forEach(el=>el.addEventListener('input',draw));
  registerCanvas('so_canvas',draw);
  registerCanvas('so_canvas_vec',draw);
}

/* =====================================================================
   6. X-RAY SPECTRA AND MOSELEY'S LAW
   ===================================================================== */
function setupMoseley(){
  const cLine=document.getElementById('mo_canvas');
  const cRoot=document.getElementById('mo_canvas_root');
  const zEl=document.getElementById('mo_z'), zVal=document.getElementById('mo_z_val');
  const readout=document.getElementById('mo_readout');

  // K-alpha: an L electron drops into a 1s hole, screened by the one remaining 1s electron
  function nuKa(Z){ return (3/4)*C_EXACT*R_INF*Math.pow(Z-1,2); }
  function nuKb(Z){ return (8/9)*C_EXACT*R_INF*Math.pow(Z-1,2); }
  function lamNm(nu){ return C_EXACT/nu*1e9; }

  function drawLine(){
    const {ctx,w,h}=fitCanvas(cLine);
    const Z=parseInt(zEl.value,10);
    ctx.clearRect(0,0,w,h);
    const m={l:56,r:18,t:26,b:38};
    const {X,Y}=drawAxes(ctx,w,h,m,10,60,0,0.30,'atomic number Z','K wavelength (nm)',
                         {nx:5,ny:3,xfmt:v=>v.toFixed(0),yfmt:v=>v.toFixed(2)});
    const a=[],b=[];
    for(let k=10;k<=60;k+=0.5){ a.push({x:k,y:lamNm(nuKa(k))}); b.push({x:k,y:lamNm(nuKb(k))}); }
    plotLine(ctx,X,Y,a,'#a4342c',2.6);
    plotLine(ctx,X,Y,b,'#1f6f78',2);
    dotAt(ctx,X,Y,Z,lamNm(nuKa(Z)),'#1c1d20',5.5);
    ctx.font='11px Helvetica,Arial,sans-serif'; ctx.textAlign='right';
    ctx.fillStyle='#a4342c'; ctx.fillText('Kα', w-m.r-8, m.t+14);
    ctx.fillStyle='#1f6f78'; ctx.fillText('Kβ', w-m.r-8, m.t+30);
    ctx.fillStyle='#1c1d20'; ctx.textAlign='left';
    ctx.fillText(`${ELEM[Z]||'Z='+Z}: ${fmt(lamNm(nuKa(Z)),4)} nm`, X(Z)+8, Y(lamNm(nuKa(Z)))-6);
  }

  function drawRoot(){
    const {ctx,w,h}=fitCanvas(cRoot);
    const Z=parseInt(zEl.value,10);
    ctx.clearRect(0,0,w,h);
    const m={l:62,r:18,t:26,b:38};
    const top=Math.sqrt(nuKa(60))/1e8;
    const {X,Y}=drawAxes(ctx,w,h,m,10,60,0,top*1.08,'atomic number Z','√ν  (10⁸ Hz^½)',
                         {nx:5,ny:4,xfmt:v=>v.toFixed(0),yfmt:v=>v.toFixed(1)});
    const pts=[]; for(let k=10;k<=60;k+=0.5) pts.push({x:k,y:Math.sqrt(nuKa(k))/1e8});
    plotLine(ctx,X,Y,pts,'#a4342c',2.6);
    dotAt(ctx,X,Y,Z,Math.sqrt(nuKa(Z))/1e8,'#1c1d20',5.5);
    // the line passes through Z = 1, not Z = 0 — that is the screening
    plotLine(ctx,X,Y,[{x:1,y:0},{x:60,y:Math.sqrt(nuKa(60))/1e8}],'#c7c2b5',1.4,[4,3]);
    ctx.font='11px Helvetica,Arial,sans-serif'; ctx.textAlign='left'; ctx.fillStyle='#a4342c';
    ctx.fillText('√ν is a straight line in Z — Moseley, 1913', m.l+8, m.t+14);
    ctx.fillStyle='#5a5d63';
    ctx.fillText('and it extrapolates to zero at Z = 1, not Z = 0', m.l+8, m.t+30);
  }

  function draw(){
    const Z=parseInt(zEl.value,10);
    zVal.textContent=`${Z}${ELEM[Z]?'  ('+ELEM[Z]+')':''}`;
    drawLine(); drawRoot();
    const nu=nuKa(Z), lam=lamNm(nu);
    const E=HC_EV_NM/lam;
    readout.innerHTML = `
      <div>atomic number Z <b>${Z}</b> ${ELEM[Z]?'('+ELEM[Z]+')':''}</div>
      <div>&nu;(K&alpha;) = (3cR/4)(Z&minus;1)&sup2; <b>${fmtSci(nu,4)} Hz</b></div>
      <div>&lambda;(K&alpha;) <b>${fmt(lam,5)} nm</b> = ${fmt(lam*1000,2)} pm</div>
      <div>photon energy <b>${fmt(E/1000,3)} keV</b></div>
      <div>&lambda;(K&beta;) <b>${fmt(lamNm(nuKb(Z)),5)} nm</b></div>
      <div>effective charge seen <b>Z &minus; 1 = ${Z-1}</b></div>
      <div>compare: hydrogen Lyman-&alpha; <b>121.5 nm</b> — ${fmtSci(121.5/lam,2)}&times; longer</div>`;
  }
  zEl.addEventListener('input',draw);
  registerCanvas('mo_canvas',draw);
  registerCanvas('mo_canvas_root',draw);
}

// register with the loader in app.js
registerModule('setupSpin', setupSpin);
registerModule('setupExclusion', setupExclusion);
registerModule('setupPeriodicTable', setupPeriodicTable);
registerModule('setupIonization', setupIonization);
registerModule('setupSpinOrbit', setupSpinOrbit);
registerModule('setupMoseley', setupMoseley);
