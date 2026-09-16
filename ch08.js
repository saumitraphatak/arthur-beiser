/* =====================================================================
   Concepts of Modern Physics — Interactive Companion
   Chapter 8: Molecules
   Every number is computed live from the chapter's formulas.
   ===================================================================== */

// measured molecular constants: reduced mass (kg), bond length (nm),
// vibrational frequency (Hz), dissociation energy (eV)
const MOL = {
  H2:  {name:'H₂',  mu:8.368e-28, R:0.0741, nu:1.319e14, D:4.48},
  HCl: {name:'HCl', mu:1.627e-27, R:0.1275, nu:8.661e13, D:4.43},
  HBr: {name:'HBr', mu:1.652e-27, R:0.1414, nu:7.944e13, D:3.75},
  CO:  {name:'CO',  mu:1.139e-26, R:0.1128, nu:6.424e13, D:11.09},
  N2:  {name:'N₂',  mu:1.163e-26, R:0.1098, nu:7.074e13, D:9.76},
  O2:  {name:'O₂',  mu:1.328e-26, R:0.1208, nu:4.741e13, D:5.12}
};
const KT_ROOM = 0.02585;        // kT at 300 K, eV

function molData(key){
  const m=MOL[key];
  const I = m.mu*Math.pow(m.R*1e-9,2);                 // kg m^2
  const B_J = HBAR*HBAR/(2*I);                         // joules
  const B_eV = B_J/EV_J;
  const k = 4*Math.PI*Math.PI*m.nu*m.nu*m.mu;          // N/m
  const hv = H_J*m.nu/EV_J;                            // eV
  return {...m, I, B_eV, k, hv};
}

/* =====================================================================
   1. THE MOLECULAR BOND
   ===================================================================== */
function setupMolecularBond(){
  const canvas=document.getElementById('mb_canvas');
  const molEl=document.getElementById('mb_mol');
  const rEl=document.getElementById('mb_r'), rVal=document.getElementById('mb_r_val');
  const readout=document.getElementById('mb_readout');

  function morse(d, Re, a, R){ const e=1-Math.exp(-a*(R-Re)); return d*e*e - d; }

  function draw(){
    const {ctx,w,h}=fitCanvas(canvas);
    const md=molData(molEl.value);
    const a=Math.sqrt(md.k/(2*md.D*EV_J))*1e-9;         // per nm
    const R=parseFloat(rEl.value);
    rVal.textContent=fmt(R,3);
    ctx.clearRect(0,0,w,h);
    const m={l:58,r:18,t:24,b:38};
    const Rmax=md.R*4.2;
    const {X,Y}=drawAxes(ctx,w,h,m,0.02,Rmax,-md.D*1.12,md.D*0.55,
                         'nuclear separation R (nm)','potential energy (eV)',
                         {nx:5,ny:4,xfmt:v=>v.toFixed(2),yfmt:v=>v.toFixed(1)});
    plotLine(ctx,X,Y,[{x:0.02,y:0},{x:Rmax,y:0}],'#d8d3c6',1.4,[4,3]);

    const pts=[];
    for(let r=0.02;r<=Rmax;r+=Rmax/600){
      const u=morse(md.D,md.R,a,r);
      pts.push({x:r, y: u>md.D*0.55 ? null : u});
    }
    plotLine(ctx,X,Y,pts,'#a4342c',2.6);

    // the lowest few vibrational levels, sitting inside the well
    const hv=md.hv;
    for(let v=0;v<8;v++){
      const E = hv*(v+0.5) - Math.pow(hv*(v+0.5),2)/(4*md.D) - md.D;
      if(E>0) break;
      // classical turning points of this level
      let ra=md.R, rb=md.R;
      for(let r=md.R;r>0.02;r-=0.0002){ if(morse(md.D,md.R,a,r)>E){ ra=r; break; } }
      for(let r=md.R;r<Rmax;r+=0.0002){ if(morse(md.D,md.R,a,r)>E){ rb=r; break; } }
      ctx.strokeStyle = v===0?'#1f6f78':'rgba(31,111,120,0.45)';
      ctx.lineWidth = v===0?2:1.3;
      ctx.beginPath(); ctx.moveTo(X(ra),Y(E)); ctx.lineTo(X(rb),Y(E)); ctx.stroke();
    }

    // equilibrium and the point you have dragged to
    const U=morse(md.D,md.R,a,R);
    plotLine(ctx,X,Y,[{x:md.R,y:-md.D},{x:md.R,y:0}],'#8a8d92',1.3,[3,3]);
    if(U<md.D*0.55) dotAt(ctx,X,Y,R,U,'#1c1d20',5.5);

    ctx.font='11px Helvetica,Arial,sans-serif'; ctx.textAlign='left';
    ctx.fillStyle='#8a8d92'; ctx.fillText(`Rₑ = ${fmt(md.R,4)} nm`, X(md.R)+6, Y(0)-6);
    ctx.fillStyle='#1f6f78'; ctx.fillText('v = 0, the zero-point level', X(md.R)+8, Y(-md.D+hv/2)-7);
    ctx.fillStyle='#a4342c'; ctx.textAlign='right';
    ctx.fillText(`${md.name}: bond energy ${fmt(md.D,2)} eV`, w-m.r-8, m.t+14);
    ctx.fillStyle='#5a5d63';
    ctx.fillText('repulsion at short R, attraction at long R', w-m.r-8, m.t+30);

    const E0 = hv*0.5 - Math.pow(hv*0.5,2)/(4*md.D);
    readout.innerHTML = `
      <div>molecule <b>${md.name}</b></div>
      <div>bond length R<sub>e</sub> <b>${fmt(md.R,4)} nm</b></div>
      <div>well depth D<sub>e</sub> <b>${fmt(md.D,3)} eV</b></div>
      <div>force constant k <b>${fmt(md.k,0)} N/m</b></div>
      <div>zero-point energy <b>${fmt(E0,4)} eV</b></div>
      <div>energy actually needed to break it <b>${fmt(md.D-E0,3)} eV</b></div>
      <div>U at R = ${fmt(R,3)} nm <b>${fmt(U,3)} eV</b></div>
      <div>compare kT at 300 K <b>${fmt(KT_ROOM,4)} eV</b></div>`;
  }
  molEl.addEventListener('change',draw);
  rEl.addEventListener('input',draw);
  registerCanvas('mb_canvas',draw);
}

/* =====================================================================
   2. ELECTRON SHARING: THE H2+ MOLECULAR ION
   ===================================================================== */
function setupElectronSharing(){
  const cDens=document.getElementById('sh_canvas');
  const cE=document.getElementById('sh_canvas_e');
  const rEl=document.getElementById('sh_r'), rVal=document.getElementById('sh_r_val');
  const modeEl=document.getElementById('sh_mode');
  const readout=document.getElementById('sh_readout');
  const R_EQ=0.106, D_EQ=2.65;         // H2+ bond length (nm) and bond energy (eV)

  // 1s orbitals on each nucleus, combined with + or -
  function psi(x, R, sign){
    const a=0.0529;                     // Bohr radius in nm
    const r1=Math.abs(x+R/2), r2=Math.abs(x-R/2);
    return Math.exp(-r1/a) + sign*Math.exp(-r2/a);
  }

  function drawDens(){
    const {ctx,w,h}=fitCanvas(cDens);
    const R=parseFloat(rEl.value);
    const sign = modeEl.value==='bonding' ? 1 : -1;
    ctx.clearRect(0,0,w,h);
    const m={l:40,r:24,t:26,b:40};
    const span=Math.max(0.42, R*2.2);
    const X=x=>m.l+(x+span/2)/span*(w-m.l-m.r);
    const mid=m.t+(h-m.t-m.b)*0.34, amp=(h-m.t-m.b)*0.24;
    const d0=h-m.b, dA=(h-m.b-mid)*0.80;

    let pk=0, pkd=0;
    for(let i=0;i<=600;i++){ const x=-span/2+span*i/600, v=psi(x,R,sign);
      pk=Math.max(pk,Math.abs(v)); pkd=Math.max(pkd,v*v); }

    // the two nuclei
    [-R/2,R/2].forEach(xp=>{
      ctx.strokeStyle='#e0dbd0'; ctx.lineWidth=1; ctx.setLineDash([3,3]);
      ctx.beginPath(); ctx.moveTo(X(xp),m.t); ctx.lineTo(X(xp),d0); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle='#1c1d20'; ctx.beginPath(); ctx.arc(X(xp),d0+12,5,0,7); ctx.fill();
    });
    ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle='#5a5d63'; ctx.textAlign='center';
    ctx.fillText('proton', X(-R/2), d0+30); ctx.fillText('proton', X(R/2), d0+30);

    ctx.strokeStyle='#e0dbd0'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(m.l,mid); ctx.lineTo(w-m.r,mid); ctx.stroke();
    // psi
    ctx.strokeStyle='#a4342c'; ctx.lineWidth=2.4; ctx.beginPath();
    for(let i=0;i<=700;i++){ const x=-span/2+span*i/700, y=mid-amp*psi(x,R,sign)/pk;
      if(i===0) ctx.moveTo(X(x),y); else ctx.lineTo(X(x),y); }
    ctx.stroke();
    // |psi|^2
    ctx.fillStyle='rgba(31,111,120,0.20)'; ctx.beginPath(); ctx.moveTo(X(-span/2),d0);
    for(let i=0;i<=700;i++){ const x=-span/2+span*i/700, v=psi(x,R,sign);
      ctx.lineTo(X(x), d0-dA*v*v/pkd); }
    ctx.lineTo(X(span/2),d0); ctx.closePath(); ctx.fill();
    ctx.strokeStyle='#1f6f78'; ctx.lineWidth=2.2; ctx.beginPath();
    for(let i=0;i<=700;i++){ const x=-span/2+span*i/700, v=psi(x,R,sign), y=d0-dA*v*v/pkd;
      if(i===0) ctx.moveTo(X(x),y); else ctx.lineTo(X(x),y); }
    ctx.stroke();

    ctx.font='11px Helvetica,Arial,sans-serif'; ctx.textAlign='left';
    ctx.fillStyle='#a4342c'; ctx.fillText(sign>0?'ψ = ψₐ + ψᵇ  (symmetric)':'ψ = ψₐ − ψᵇ  (antisymmetric)', m.l+4, m.t+12);
    ctx.fillStyle='#1f6f78';
    ctx.fillText(sign>0 ? 'charge piles up between the nuclei — they are pulled together'
                        : 'a node between the nuclei — nothing holds them together', m.l+4, mid+18);
  }

  function drawE(){
    const {ctx,w,h}=fitCanvas(cE);
    const R=parseFloat(rEl.value);
    ctx.clearRect(0,0,w,h);
    const m={l:58,r:18,t:24,b:38};
    const Rmax=0.42;
    const {X,Y}=drawAxes(ctx,w,h,m,0.03,Rmax,-3.4,5.5,'nuclear separation R (nm)','energy relative to H + H⁺ (eV)',
                         {nx:5,ny:4,xfmt:v=>v.toFixed(2),yfmt:v=>v.toFixed(1)});
    plotLine(ctx,X,Y,[{x:0.03,y:0},{x:Rmax,y:0}],'#d8d3c6',1.4,[4,3]);
    // Morse-like curve for the bonding state, and a purely repulsive antibonding one
    const a=Math.sqrt(2)/0.052;
    const bond=[], anti=[];
    for(let r=0.03;r<=Rmax;r+=Rmax/500){
      const e=1-Math.exp(-a*(r-R_EQ)/1);
      bond.push({x:r, y:Math.min(5.5, D_EQ*e*e - D_EQ)});
      anti.push({x:r, y:Math.min(5.5, 6.2*Math.exp(-(r-0.03)/0.062))});
    }
    plotLine(ctx,X,Y,bond,'#1f6f78',2.6);
    plotLine(ctx,X,Y,anti,'#a4342c',2.2,[5,3]);
    plotLine(ctx,X,Y,[{x:R_EQ,y:-D_EQ},{x:R_EQ,y:0}],'#8a8d92',1.3,[3,3]);
    const cur = modeEl.value==='bonding'
      ? (()=>{ const e=1-Math.exp(-a*(R-R_EQ)); return D_EQ*e*e-D_EQ; })()
      : 6.2*Math.exp(-(R-0.03)/0.062);
    if(cur<5.5 && R>=0.03) dotAt(ctx,X,Y,R,cur,'#1c1d20',5.5);
    ctx.font='11px Helvetica,Arial,sans-serif'; ctx.textAlign='right';
    ctx.fillStyle='#1f6f78'; ctx.fillText('symmetric (bonding) — has a minimum', w-m.r-8, m.t+14);
    ctx.fillStyle='#a4342c'; ctx.fillText('antisymmetric (antibonding) — no minimum', w-m.r-8, m.t+30);
    ctx.textAlign='left'; ctx.fillStyle='#8a8d92';
    ctx.fillText(`Rₑ = ${R_EQ} nm`, X(R_EQ)+6, Y(0)-6);
  }

  function draw(){
    const R=parseFloat(rEl.value);
    rVal.textContent=fmt(R,3);
    drawDens(); drawE();
    const bonding = modeEl.value==='bonding';
    readout.innerHTML = `
      <div>state <b>${bonding?'symmetric (bonding)':'antisymmetric (antibonding)'}</b></div>
      <div>separation R <b>${fmt(R,4)} nm</b></div>
      <div>equilibrium R<sub>e</sub> <b>${R_EQ} nm</b></div>
      <div>bond energy of H&#8322;&#8314; <b>${D_EQ} eV</b></div>
      <div>total binding vs H&#8314; + e&#8315; <b>${fmt(13.6+D_EQ,2)} eV</b></div>
      <div>charge between the nuclei <b>${bonding?'enhanced':'zero at the midpoint'}</b></div>
      <div>result <b>${bonding?'a stable molecule':'no bond forms'}</b>
        ${bonding?'<span class="badge ok">bound</span>':'<span class="badge no">unbound</span>'}</div>`;
  }
  rEl.addEventListener('input',draw);
  modeEl.addEventListener('change',draw);
  registerCanvas('sh_canvas',draw);
  registerCanvas('sh_canvas_e',draw);
}

/* =====================================================================
   3. ROTATIONAL ENERGY LEVELS AND SPECTRA
   ===================================================================== */
function setupRotational(){
  const cLev=document.getElementById('rt_canvas');
  const cSpec=document.getElementById('rt_canvas_spec');
  const molEl=document.getElementById('rt_mol');
  const jEl=document.getElementById('rt_j'), jVal=document.getElementById('rt_j_val');
  const readout=document.getElementById('rt_readout');

  function drawLev(){
    const {ctx,w,h}=fitCanvas(cLev);
    const md=molData(molEl.value);
    const J=parseInt(jEl.value,10);
    ctx.clearRect(0,0,w,h);
    const m={l:70,r:120,t:26,b:30};
    const JMAX=7;
    const Emax=JMAX*(JMAX+1)*md.B_eV;
    const Y=E=>h-m.b-(E/(Emax*1.06))*(h-m.t-m.b);
    ctx.font='11px Helvetica,Arial,sans-serif';
    for(let j=0;j<=JMAX;j++){
      const E=j*(j+1)*md.B_eV, y=Y(E), on=(j===J);
      ctx.strokeStyle = on?'#a4342c':'#c7c2b5'; ctx.lineWidth = on?2.8:1.5;
      ctx.beginPath(); ctx.moveTo(m.l,y); ctx.lineTo(w-m.r,y); ctx.stroke();
      ctx.fillStyle = on?'#a4342c':'#8a8d92'; ctx.textAlign='right';
      ctx.fillText(`J = ${j}`, m.l-8, y+4);
      ctx.textAlign='left';
      ctx.fillText(`${fmtSci(E,2)} eV`, w-m.r+6, y+4);
      // the gaps grow as 2B(J+1), which is why the spectrum is evenly spaced
      if(j>0){
        const prev=Y((j-1)*j*md.B_eV);
        ctx.strokeStyle='rgba(31,111,120,0.5)'; ctx.lineWidth=1.4;
        const xg=m.l+(w-m.l-m.r)*0.80;
        ctx.beginPath(); ctx.moveTo(xg,prev); ctx.lineTo(xg,y); ctx.stroke();
        ctx.fillStyle='#1f6f78'; ctx.textAlign='center'; ctx.font='10px Helvetica,Arial,sans-serif';
        ctx.fillText(`${2*j}B`, xg+14, (prev+y)/2+3);
        ctx.font='11px Helvetica,Arial,sans-serif';
      }
    }
    // kT at room temperature, to show how many levels are populated
    const yk=Y(KT_ROOM);
    if(yk>m.t){
      ctx.strokeStyle='#8a6d1f'; ctx.lineWidth=1.6; ctx.setLineDash([5,3]);
      ctx.beginPath(); ctx.moveTo(m.l,yk); ctx.lineTo(w-m.r,yk); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle='#8a6d1f'; ctx.textAlign='left'; ctx.font='10px Helvetica,Arial,sans-serif';
      ctx.fillText('kT at 300 K', m.l+6, yk-5);
    }
    ctx.fillStyle='#1c1d20'; ctx.font='12px Helvetica,Arial,sans-serif'; ctx.textAlign='left';
    ctx.fillText(`${md.name}:  E = J(J+1)ħ²/2I`, m.l, m.t-10);
  }

  function drawSpec(){
    const {ctx,w,h}=fitCanvas(cSpec);
    const md=molData(molEl.value);
    const J=parseInt(jEl.value,10);
    ctx.clearRect(0,0,w,h);
    const m={l:52,r:18,t:26,b:40};
    // absorption lines at nu = 2B(J+1)/h, evenly spaced by 2B/h
    const B_Hz=md.B_eV*EV_J/H_J;
    const fmax=2*B_Hz*9;
    const X=f=>m.l+(f/fmax)*(w-m.l-m.r);
    ctx.strokeStyle='#1c1d20'; ctx.lineWidth=1.3;
    ctx.beginPath(); ctx.moveTo(m.l,h-m.b); ctx.lineTo(w-m.r,h-m.b); ctx.stroke();
    ctx.font='10px Helvetica,Arial,sans-serif'; ctx.fillStyle='#8a8d92'; ctx.textAlign='center';
    for(let i=0;i<=4;i++){
      const f=fmax*i/4;
      ctx.beginPath(); ctx.moveTo(X(f),h-m.b-4); ctx.lineTo(X(f),h-m.b+4); ctx.stroke();
      ctx.fillText(fmtSci(f,1), X(f), h-m.b+17);
    }
    ctx.fillStyle='#1c1d20'; ctx.fillText('frequency (Hz)', m.l+(w-m.l-m.r)/2, h-8);

    for(let j=0;j<=8;j++){
      const f=2*B_Hz*(j+1);
      if(f>fmax) break;
      // intensity roughly follows the thermal population of the lower level
      const pop=(2*j+1)*Math.exp(-j*(j+1)*md.B_eV/KT_ROOM);
      const hgt=(h-m.t-m.b)*Math.min(1, pop/2.4);
      const on=(j===J);
      ctx.strokeStyle = on?'#a4342c':'#1f6f78'; ctx.lineWidth = on?3:2;
      ctx.beginPath(); ctx.moveTo(X(f),h-m.b); ctx.lineTo(X(f),h-m.b-hgt); ctx.stroke();
      if(j<5){
        ctx.fillStyle = on?'#a4342c':'#8a8d92'; ctx.font='10px Helvetica,Arial,sans-serif';
        ctx.fillText(`${j}→${j+1}`, X(f), h-m.b-hgt-6);
      }
    }
    ctx.font='11px Helvetica,Arial,sans-serif'; ctx.textAlign='left'; ctx.fillStyle='#5a5d63';
    ctx.fillText(`evenly spaced by 2B/h = ${fmtSci(2*B_Hz,3)} Hz — measuring that spacing gives the bond length`,
                 m.l, m.t+12);
  }

  function draw(){
    const md=molData(molEl.value);
    const J=parseInt(jEl.value,10);
    jVal.textContent=J;
    drawLev(); drawSpec();
    const E=J*(J+1)*md.B_eV;
    const omega=J>0?Math.sqrt(2*E*EV_J/md.I):0;
    const f01=2*md.B_eV*EV_J/H_J;
    readout.innerHTML = `
      <div>molecule <b>${md.name}</b></div>
      <div>reduced mass <b>${fmtSci(md.mu,3)} kg</b></div>
      <div>moment of inertia I = &mu;R&sup2; <b>${fmtSci(md.I,3)} kg m&sup2;</b></div>
      <div>B = &#8463;&sup2;/2I <b>${fmtSci(md.B_eV,3)} eV</b></div>
      <div>E(J=${J}) <b>${fmtSci(E,3)} eV</b> = ${fmtSci(E*EV_J,3)} J</div>
      <div>angular velocity <b>${fmtSci(omega,3)} rad/s</b></div>
      <div>J=0&rarr;1 line at <b>${fmtSci(f01,3)} Hz</b></div>
      <div>E(J=1) / kT at 300 K <b>${fmtSci(2*md.B_eV/KT_ROOM,2)}</b>
        <span class="badge ok">rotations are thermally excited</span></div>`;
  }
  molEl.addEventListener('change',draw);
  jEl.addEventListener('input',draw);
  registerCanvas('rt_canvas',draw);
  registerCanvas('rt_canvas_spec',draw);
}

/* =====================================================================
   4. VIBRATIONAL ENERGY LEVELS
   ===================================================================== */
function setupVibrational(){
  const canvas=document.getElementById('vb_canvas');
  const molEl=document.getElementById('vb_mol');
  const vEl=document.getElementById('vb_v'), vVal=document.getElementById('vb_v_val');
  const readout=document.getElementById('vb_readout');

  function draw(){
    const {ctx,w,h}=fitCanvas(canvas);
    const md=molData(molEl.value);
    const v=parseInt(vEl.value,10);
    vVal.textContent=v;
    ctx.clearRect(0,0,w,h);
    const m={l:62,r:20,t:26,b:38};
    const a=Math.sqrt(md.k/(2*md.D*EV_J))*1e-9;
    const Rmax=md.R*3.4;
    const {X,Y}=drawAxes(ctx,w,h,m,0.02,Rmax,-md.D*1.08,md.D*0.25,
                         'nuclear separation R (nm)','energy (eV)',
                         {nx:5,ny:4,xfmt:v2=>v2.toFixed(2),yfmt:v2=>v2.toFixed(1)});
    // the real (Morse) curve and the harmonic approximation to it
    const mor=[], har=[];
    for(let r=0.02;r<=Rmax;r+=Rmax/500){
      const e=1-Math.exp(-a*(r-md.R));
      const um=md.D*e*e-md.D;
      const uh=0.5*md.k*Math.pow((r-md.R)*1e-9,2)/EV_J - md.D;
      mor.push({x:r, y: um>md.D*0.25?null:um});
      har.push({x:r, y: uh>md.D*0.25?null:uh});
    }
    plotLine(ctx,X,Y,har,'#8a8d92',1.8,[5,3]);
    plotLine(ctx,X,Y,mor,'#a4342c',2.6);

    const hv=md.hv;
    let vmaxShown=0;
    for(let k=0;k<=12;k++){
      const Eh = hv*(k+0.5) - md.D;                         // harmonic ladder
      const Em = hv*(k+0.5) - Math.pow(hv*(k+0.5),2)/(4*md.D) - md.D;   // anharmonic
      if(Em>0) break;
      vmaxShown=k;
      let ra=md.R, rb=md.R;
      for(let r=md.R;r>0.02;r-=0.0002){ const e=1-Math.exp(-a*(r-md.R)); if(md.D*e*e-md.D>Em){ ra=r; break; } }
      for(let r=md.R;r<Rmax;r+=0.0002){ const e=1-Math.exp(-a*(r-md.R)); if(md.D*e*e-md.D>Em){ rb=r; break; } }
      const on=(k===v);
      ctx.strokeStyle = on?'#1f6f78':'rgba(31,111,120,0.40)';
      ctx.lineWidth = on?2.8:1.3;
      ctx.beginPath(); ctx.moveTo(X(ra),Y(Em)); ctx.lineTo(X(rb),Y(Em)); ctx.stroke();
      if(on){
        ctx.fillStyle='#1f6f78'; ctx.font='11px Helvetica,Arial,sans-serif'; ctx.textAlign='left';
        ctx.fillText(`v = ${k}`, X(rb)+6, Y(Em)+4);
      }
      // where the harmonic ladder would have put it
      if(k>0 && Eh<md.D*0.25){
        ctx.strokeStyle='rgba(138,141,146,0.55)'; ctx.lineWidth=1;
        ctx.beginPath(); ctx.moveTo(X(md.R)-14,Y(Eh)); ctx.lineTo(X(md.R)+14,Y(Eh)); ctx.stroke();
      }
    }
    ctx.font='11px Helvetica,Arial,sans-serif'; ctx.textAlign='right';
    ctx.fillStyle='#a4342c'; ctx.fillText('real bond (anharmonic)', w-m.r-8, m.t+14);
    ctx.fillStyle='#8a8d92'; ctx.fillText('harmonic approximation', w-m.r-8, m.t+30);

    const Ev = hv*(v+0.5) - Math.pow(hv*(v+0.5),2)/(4*md.D) - md.D;
    const Evp = hv*(v+1.5) - Math.pow(hv*(v+1.5),2)/(4*md.D) - md.D;
    const lam = HC_EV_NM/hv;
    readout.innerHTML = `
      <div>molecule <b>${md.name}</b></div>
      <div>vibration frequency &nu;&#8320; <b>${fmtSci(md.nu,4)} Hz</b></div>
      <div>force constant k = 4&pi;&sup2;&nu;&#8320;&sup2;&mu; <b>${fmt(md.k,0)} N/m</b></div>
      <div>level spacing h&nu;&#8320; <b>${fmt(hv,4)} eV</b></div>
      <div>zero-point energy <b>${fmt(hv/2,4)} eV</b></div>
      <div>E(v=${v}) above the well bottom <b>${fmt(Ev+md.D,4)} eV</b></div>
      <div>actual gap to v=${v+1} <b>${fmt(Evp-Ev,4)} eV</b> ${(Evp-Ev)<hv*0.97?'<span class="badge no">below h&nu;&#8320;</span>':''}</div>
      <div>absorbs at <b>${fmt(lam*1000,2)} &micro;m</b> — infrared</div>
      <div>h&nu;&#8320; / kT at 300 K <b>${fmt(hv/KT_ROOM,1)}</b>
        <span class="badge ok">vibrations stay frozen</span></div>`;
    void vmaxShown;
  }
  molEl.addEventListener('change',draw);
  vEl.addEventListener('input',draw);
  registerCanvas('vb_canvas',draw);
}

/* =====================================================================
   5. THE VIBRATION-ROTATION BAND
   ===================================================================== */
function setupVibRot(){
  const canvas=document.getElementById('vr_canvas');
  const molCanvas=document.getElementById('vr_mol_canvas');
  const molEl=document.getElementById('vr_mol');
  const tEl=document.getElementById('vr_t'), tVal=document.getElementById('vr_t_val');
  const readout=document.getElementById('vr_readout');
  let vibPhase=0, rotPhase=0, lastFrame=performance.now();
  let vibRate=3, rotRate=0.6; // rad/s — visual rates only, but set from the real k and J below

  function drawMolecule(){
    if(!molCanvas) return;
    const {ctx,w,h}=fitCanvas(molCanvas);
    ctx.clearRect(0,0,w,h);
    const cx=w/2, cy=h*0.44;
    const armBase=Math.min(w,h)*0.30;
    const stretch=1+0.22*Math.sin(vibPhase);          // vibration, exaggerated so it's visible
    const arm=armBase*stretch;
    const dx=Math.cos(rotPhase)*arm, dy=Math.sin(rotPhase)*arm*0.55;   // tumbling, viewed at a tilt
    const x1=cx-dx, y1=cy-dy, x2=cx+dx, y2=cy+dy;

    // bond drawn as a little spring so the stretching reads clearly
    const nx0=-(y2-y1), ny0=(x2-x1); const nl=Math.hypot(nx0,ny0)||1;
    const nx=nx0/nl, ny=ny0/nl;
    ctx.strokeStyle='#c7c2b5'; ctx.lineWidth=2.2; ctx.beginPath(); ctx.moveTo(x1,y1);
    const N=7;
    for(let i=1;i<N;i++){
      const t=i/N, px=x1+(x2-x1)*t, py=y1+(y2-y1)*t, perp=(i%2===0?1:-1)*4;
      ctx.lineTo(px+nx*perp, py+ny*perp);
    }
    ctx.lineTo(x2,y2); ctx.stroke();
    ctx.beginPath(); ctx.arc(x1,y1,9,0,7); ctx.fillStyle='#a4342c'; ctx.fill();
    ctx.beginPath(); ctx.arc(x2,y2,7,0,7); ctx.fillStyle='#1f6f78'; ctx.fill();
    ctx.font='10px Helvetica,Arial,sans-serif'; ctx.fillStyle='#8a8d92'; ctx.textAlign='center';
    ctx.fillText('stretch & spin exaggerated, not to scale', cx, h-8);
  }

  function loop(now){
    const dt=Math.min(0.05,(now-lastFrame)/1000); lastFrame=now;
    const active=document.getElementById('ch8') && document.getElementById('ch8').classList.contains('active');
    if(active && !prefersReducedMotion()){
      vibPhase += dt*vibRate;
      rotPhase += dt*rotRate;
      drawMolecule();
    }
    requestAnimationFrame(loop);
  }

  function draw(){
    const {ctx,w,h}=fitCanvas(canvas);
    const md=molData(molEl.value);
    const T=parseFloat(tEl.value);
    tVal.textContent=fmt(T,0);
    ctx.clearRect(0,0,w,h);
    const kT=8.617e-5*T;                                  // eV
    const B=md.B_eV, hv=md.hv;
    const m={l:52,r:18,t:28,b:44};
    const JMAX=14;
    const span=2*B*(JMAX+1)*1.25;
    const X=dE=>m.l+(dE+span)/(2*span)*(w-m.l-m.r);
    const base=h-m.b;

    ctx.strokeStyle='#1c1d20'; ctx.lineWidth=1.3;
    ctx.beginPath(); ctx.moveTo(m.l,base); ctx.lineTo(w-m.r,base); ctx.stroke();
    // the band centre, where no line appears
    ctx.strokeStyle='#d8d3c6'; ctx.lineWidth=1.4; ctx.setLineDash([4,3]);
    ctx.beginPath(); ctx.moveTo(X(0),m.t); ctx.lineTo(X(0),base); ctx.stroke(); ctx.setLineDash([]);

    let peak=0;
    const lines=[];
    for(let J=0;J<=JMAX;J++){
      const pop=(2*J+1)*Math.exp(-J*(J+1)*B/kT);
      peak=Math.max(peak,pop);
      lines.push({J, R:2*B*(J+1), P:-2*B*J, pop});
    }
    lines.forEach(ln=>{
      const hgt=(h-m.t-m.b)*0.86*ln.pop/peak;
      // R branch: J -> J+1
      ctx.strokeStyle='#a4342c'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(X(ln.R),base); ctx.lineTo(X(ln.R),base-hgt); ctx.stroke();
      // P branch: J+1 -> J, on the low side
      if(ln.J>0){
        ctx.strokeStyle='#1f6f78'; ctx.lineWidth=2;
        ctx.beginPath(); ctx.moveTo(X(ln.P),base); ctx.lineTo(X(ln.P),base-hgt); ctx.stroke();
      }
    });

    ctx.font='11px Helvetica,Arial,sans-serif'; ctx.textAlign='center'; ctx.fillStyle='#8a8d92';
    ctx.fillText('band centre hν₀', X(0), base+18);
    ctx.fillText('(no line here: ΔJ = 0 is forbidden)', X(0), base+32);
    ctx.fillStyle='#1f6f78'; ctx.textAlign='left';
    ctx.fillText('P branch  ΔJ = −1', m.l+6, m.t+12);
    ctx.fillStyle='#a4342c'; ctx.textAlign='right';
    ctx.fillText('R branch  ΔJ = +1', w-m.r-6, m.t+12);
    ctx.fillStyle='#5a5d63'; ctx.textAlign='center'; ctx.font='10px Helvetica,Arial,sans-serif';
    ctx.fillText(`energy relative to the band centre — full width shown ±${fmtSci(span,2)} eV`,
                 m.l+(w-m.l-m.r)/2, h-8);

    // which J is most populated
    const Jmax=Math.max(0, Math.round(Math.sqrt(kT/(2*B))-0.5));
    readout.innerHTML = `
      <div>molecule <b>${md.name}</b></div>
      <div>temperature <b>${fmt(T,0)} K</b>, kT = ${fmt(kT,4)} eV</div>
      <div>band centre h&nu;&#8320; <b>${fmt(hv,4)} eV</b></div>
      <div>line spacing 2B <b>${fmtSci(2*B,3)} eV</b></div>
      <div>lines per eV of band <b>${fmt(1/(2*B),0)}</b></div>
      <div>most populated J <b>${Jmax}</b></div>
      <div>h&nu;&#8320; / 2B <b>${fmt(hv/(2*B),0)}</b> — rotational structure is ${fmt(hv/(2*B),0)}&times; finer</div>`;

    // drive the little vibrating/tumbling inset from the same molecule and
    // temperature: stiffer bonds wiggle faster, more populated J spins faster.
    vibRate = 2.4 + 2.8*Math.min(1, md.k/2200);
    rotRate = 0.3 + 0.22*Jmax;
    drawMolecule();
  }
  molEl.addEventListener('change',draw);
  tEl.addEventListener('input',draw);
  registerCanvas('vr_canvas',draw);
  registerCanvas('vr_mol_canvas',drawMolecule);
  requestAnimationFrame(loop);
}

/* =====================================================================
   6. THE THREE ENERGY SCALES
   ===================================================================== */
function setupEnergyScales(){
  const canvas=document.getElementById('sc_canvas');
  const molEl=document.getElementById('sc_mol');
  const readout=document.getElementById('sc_readout');

  function draw(){
    const {ctx,w,h}=fitCanvas(canvas);
    const md=molData(molEl.value);
    ctx.clearRect(0,0,w,h);
    const m={l:44,r:26};
    const axisY=h*0.56;
    const X=logAxis(ctx, w, m, -5, 1, axisY, 'energy (eV)');

    const items=[
      [md.B_eV*2, 'rotational\n2B', '#1f6f78'],
      [md.hv, 'vibrational\nhν₀', '#8a6d1f'],
      [4.0, 'electronic\n~ a few eV', '#a4342c'],
      [KT_ROOM, 'kT at 300 K', '#8a8d92']
    ];
    items.forEach(([E,label,col],i)=>{
      const raw=X(E);
      const px=Math.max(m.l,Math.min(w-m.r,raw));
      const dy=46+ (i%2)*40;
      ctx.strokeStyle=col; ctx.lineWidth = col==='#8a8d92'?1.8:2.6;
      if(col==='#8a8d92') ctx.setLineDash([4,3]);
      ctx.beginPath(); ctx.moveTo(px,axisY); ctx.lineTo(px,axisY-dy); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle=col; ctx.beginPath(); ctx.arc(px,axisY-dy,5,0,7); ctx.fill();
      ctx.font='11px Helvetica,Arial,sans-serif';
      ctx.textAlign = px>w*0.62?'right':'left';
      label.split('\n').forEach((t,k)=>{
        ctx.fillText(t, px+(px>w*0.62?-9:9), axisY-dy-4+k*14);
      });
      ctx.fillStyle='#8a8d92'; ctx.font='10px Helvetica,Arial,sans-serif';
      ctx.fillText(fmtSci(E,2)+' eV', px+(px>w*0.62?-9:9), axisY-dy+ (label.includes('\n')?24:10));
    });

    // what part of the spectrum each one lands in
    const bands=[[1e-5,1e-3,'microwave'],[1e-3,1.6,'infrared'],[1.6,3.3,'visible'],[3.3,10,'ultraviolet']];
    bands.forEach(([lo,hi,name])=>{
      const x0=Math.max(m.l,X(lo)), x1=Math.min(w-m.r,X(hi));
      if(x1<=x0) return;
      ctx.fillStyle='rgba(200,195,180,0.16)';
      ctx.fillRect(x0,axisY+34,x1-x0,20);
      ctx.strokeStyle='#e0dbd0'; ctx.lineWidth=1; ctx.strokeRect(x0,axisY+34,x1-x0,20);
      ctx.fillStyle='#8a8d92'; ctx.font='10px Helvetica,Arial,sans-serif'; ctx.textAlign='center';
      ctx.fillText(name,(x0+x1)/2,axisY+48);
    });

    ctx.font='12px Helvetica,Arial,sans-serif'; ctx.fillStyle='#1c1d20'; ctx.textAlign='left';
    ctx.fillText(`${md.name}: three kinds of molecular energy, four decades apart`, m.l, 20);

    readout.innerHTML = `
      <div>molecule <b>${md.name}</b></div>
      <div>rotational 2B <b>${fmtSci(2*md.B_eV,3)} eV</b> (microwave)</div>
      <div>vibrational h&nu;&#8320; <b>${fmt(md.hv,4)} eV</b> (infrared)</div>
      <div>electronic <b>&asymp; 4 eV</b> (visible / UV)</div>
      <div>vibrational / rotational <b>${fmt(md.hv/(2*md.B_eV),0)}&times;</b></div>
      <div>electronic / vibrational <b>${fmt(4/md.hv,0)}&times;</b></div>
      <div>kT at 300 K <b>${fmt(KT_ROOM,4)} eV</b> — above rotational, below vibrational</div>`;
  }
  molEl.addEventListener('change',draw);
  registerCanvas('sc_canvas',draw);
}

// register with the loader in app.js
registerModule('setupMolecularBond', setupMolecularBond);
registerModule('setupElectronSharing', setupElectronSharing);
registerModule('setupRotational', setupRotational);
registerModule('setupVibrational', setupVibrational);
registerModule('setupVibRot', setupVibRot);
registerModule('setupEnergyScales', setupEnergyScales);
