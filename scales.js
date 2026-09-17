/* =====================================================================
   Concepts of Modern Physics — everything in the book, on one ruler

   Three logarithmic rulers: energy, size, time. Every mark is a real
   quantity from the book, computed here from the same constants and
   tables the modules use, and clicking one goes to the module it
   belongs to.

   The point of putting them together is the tie between them. Any
   energy E fixes a length and a time on its own, with no other input:

        ℓ = ħc/E        t = ħ/E

   so hovering any mark puts a marker at the matching place on the
   other two rulers. Sometimes the answer is the physics: the pion's
   rest energy gives 1.4 fm, which is the range of the nuclear force —
   Yukawa read the one off the other and predicted a particle nobody
   had seen. Sometimes the gap is the physics: hydrogen's 13.6 eV gives
   14 nm, which is 270 times the size of the atom, and that factor is
   the electron being slow. A bound state sits at ħc/E only when it is
   relativistic.
   ===================================================================== */

const SC_HBARC_EV_NM = HC_EV_NM/(2*Math.PI);   // ħc = 197.3 eV nm
const SC_HBAR_EV_S   = H_EV/(2*Math.PI);       // ħ  = 6.582e-16 eV s
const SC_ROWS = [
  {key:'E', title:'energy',  unit:'eV', col:'#1f6f78'},
  {key:'L', title:'size',    unit:'m',  col:'#8a6d1f'},
  {key:'T', title:'time',    unit:'s',  col:'#7a5aa0'}
];

let _scaleItems = null, _scaleLayout = null, _scaleHover = null, _scaleWired = false, _scaleTapped = null;

/* ---- the marks, all computed from the chapters' own data ---- */
function scNuc(Z,A){
  for(const r of NUCLIDES) if(r[0]===Z && r[1]===A) return r;
  return null;
}
function scHalfLife(Z,A){ const r=scNuc(Z,A); return r ? r[5] : 0; }
function scBindPerA(Z,A){
  const r = scNuc(Z,A); if(!r) return 0;
  return (Z*M_H_U + (A-Z)*M_N_U - r[2])*U_MEV/A * 1e6;   // eV per nucleon
}
// the work functions live in the photoelectric module's own <select>, so take
// the number from there rather than writing a second copy of it here
function scWorkFunction(metal, fallback){
  const sel = document.getElementById('pe_metal');
  if(sel) for(const o of sel.options) if(o.textContent.indexOf(metal)===0) return parseFloat(o.value);
  return fallback;
}
function scAlphaQ(Z,A){
  const par=scNuc(Z,A), dau=scNuc(Z-2,A-4), he=scNuc(2,4);
  if(!par||!dau||!he) return 0;
  return (par[2]-dau[2]-he[2])*U_MEV*1e6;                // eV
}

function buildScaleItems(){
  if(_scaleItems) return _scaleItems;
  const CO = molData('CO'), H2 = molData('H2');
  const ALPHA = 1/137.036;
  const E1_H  = ME_C2_MEV*1e6*ALPHA*ALPHA/2;             // 13.6 eV, from mc²α²/2
  const LAM_VIS = 550;                                   // nm, middle of the visible band
  const R_FE = R0_FM*Math.pow(56,1/3)*1e-15;             // m
  const it = [];
  const add = (row,v,label,card,note)=>{ if(isFinite(v)&&v>0) it.push({row,v,label,card,note}); };

  /* --- energy, in eV --- */
  add('E', K_B*2.725/EV_J, 'the microwave background', 'ch9-m4',
      'kT at 2.725 K. Planck\'s law fitted to this is the best blackbody spectrum ever measured.');
  add('E', KT_ROOM, 'room temperature', 'ch9-m1',
      'kT at 300 K. Everything below this line is stirred up by heat alone; everything above it is not.');
  add('E', 2*CO.B_eV, 'a molecule turning', 'ch8-m3',
      'The first rotational step in CO. Well below kT, which is why a warm gas is always spinning.');
  add('E', CO.hv, 'a molecule vibrating', 'ch8-m4',
      'One vibrational quantum of CO. Ten times kT, which is why the vibrations stay frozen out at room temperature.');
  add('E', SEMI.Si.Eg, 'the gap in silicon', 'ch10-m5',
      'Forty times kT, so fewer than one atom in 10¹² is ionised — and yet that is a semiconductor.');
  add('E', HC_EV_NM/LAM_VIS, 'a photon of green light', 'ch2-m2',
      'hc/λ at 550 nm. Enough to lift an electron over the gap in silicon, which is why a solar cell works.');
  add('E', scWorkFunction('Copper', 4.7), 'prying an electron off copper', 'ch2-m2',
      'The work function, off the photoelectric module\'s own list. Green light cannot do it; ultraviolet can, and no amount of red light ever will.');
  add('E', E1_H, 'ionising hydrogen', 'ch4-m5',
      'mc²α²/2. Look at where ħc/E lands on the size ruler: 270 times bigger than the atom itself. That factor is 2/α, and it is the electron being slow — a bound state sits at ħc/E only when it is relativistic.');
  add('E', 10.2*(29-1)*(29-1), 'a copper Kα X-ray', 'ch7-m6',
      'Moseley\'s law, (Z−1)² times the hydrogen scale — the innermost electrons see almost the full nuclear charge.');
  add('E', ME_C2_MEV*1e6, 'the electron\'s rest energy', 'ch1-m7',
      'mc². Two of these is the threshold for making matter out of light.');
  add('E', scAlphaQ(90,230) || scAlphaQ(92,234), 'an alpha particle', 'ch12-m4',
      'The Q value of ²³⁰Th → ²²⁶Ra, from the measured masses. One of these carries as much energy as a million chemical bonds.');
  add('E', scBindPerA(26,56), 'binding, per nucleon in iron', 'ch11-m3',
      'The top of the binding-energy curve. Everything heavier wants to split, everything lighter wants to fuse.');
  add('E', P13['pi+'].m*1e6, 'the pion\'s rest energy', 'ch11-m7',
      'Yukawa\'s particle. Look at the size ruler: ħc/E lands exactly on the range of the nuclear force — which is how he predicted the pion before anyone had seen one.');
  add('E', P13.p.m*1e6, 'the proton\'s rest energy', 'ch13-m5',
      'Only about 2% of it is the quark masses. The rest is the energy of the field holding them in.');
  add('E', 200e6, 'one fission of uranium-235', 'ch12-m7',
      'Mostly the Coulomb repulsion of the two fragments flying apart — 50 million times a chemical bond.');
  add('E', QUARKS.t.m*1e9, 'the top quark', 'ch13-m5',
      'As heavy as a whole tungsten atom, and it decays before it can even form a hadron.');

  /* --- size, in m --- */
  add('L', H_J/Math.sqrt(3*M_E*K_B*300), 'a thermal electron\'s wavelength', 'ch3-m1',
      'h/√(3mkT) at 300 K. Far bigger than an atom, which is why electrons in matter must be treated as waves.');
  add('L', LAM_VIS*1e-9, 'green light', 'ch2-m5',
      'Three thousand atoms across — which is exactly why no microscope using it can resolve one.');
  add('L', HC_EV_NM/Math.sqrt(2*ME_C2_MEV*1e6*54 + 54*54)*1e-9, 'a 54 eV electron\'s wavelength', 'ch3-m3',
      'The Davisson–Germer beam. It matches the spacing of nickel atoms, so a crystal diffracts it.');
  add('L', A0, 'the hydrogen atom', 'ch4-m4',
      'The Bohr radius, a₀ = ħ/(αm c). It is the Compton wavelength of the electron divided by α — the atom is big because the electron is slow.');
  add('L', H2.R*1e-9, 'the bond in H₂', 'ch8-m2',
      'Closer than two Bohr radii: the two protons share the same electron cloud rather than sitting side by side.');
  add('L', LAMBDA_C_PM*1e-12, 'the electron\'s Compton wavelength', 'ch2-m4',
      'h/mc. The shift Compton measured, and the size below which "one electron" stops being a useful idea.');
  add('L', LAMBDA_C_PM/2*1e-12, 'a pair-production photon', 'ch2-m6',
      'At the 2mc² threshold the wavelength is exactly half the electron\'s Compton wavelength — hc/2mc² = (h/mc)/2, with nothing else in it.');
  add('L', R0_FM*1e-15, 'the proton', 'ch11-m1',
      'R₀A^(1/3) at A = 1. Every nucleus has the same density; they differ only in how many nucleons are packed in.');
  add('L', SC_HBARC_EV_NM/(P13['pi+'].m*1e6)*1e-9, 'the range of the nuclear force', 'ch11-m7',
      'ħ/m_πc. The force reaches about one nucleon past itself, which is why a nucleon feels only its neighbours and the binding energy per nucleon flattens out.');
  add('L', R_FE, 'the iron nucleus', 'ch11-m3',
      '4.6 fm across, inside an atom ten thousand times wider. The atom is almost entirely empty.');
  add('L', R0_FM*Math.pow(238,1/3)*1e-15, 'the uranium nucleus', 'ch12-m7',
      'Big enough that the Coulomb repulsion across it nearly cancels the surface tension holding it together.');

  /* --- time, in s --- */
  add('T', scHalfLife(92,238), 'uranium-238 half-life', 'ch12-m3',
      '4.5 billion years — the age of the Earth, which is not a coincidence: it is how we know that age.');
  add('T', scHalfLife(6,14), 'carbon-14 half-life', 'ch12-m3',
      '5730 years. Long enough to survive an archaeological sample, short enough to still be changing.');
  add('T', P13.n.tau, 'the free neutron', 'ch12-m5',
      'Fifteen minutes on its own; stable forever inside a nucleus, because there is nowhere lower for it to go.');
  add('T', P13['mu-'].tau, 'the muon', 'ch1-m2',
      '2.2 µs. At rest it would travel 660 m; time dilation is what gets cosmic-ray muons to the ground.');
  add('T', P13['pi+'].tau, 'the charged pion', 'ch13-m7',
      'A weak decay, which is why it is 10⁹ times slower than its neutral twin.');
  add('T', P13['tau-'].tau, 'the tau lepton', 'ch13-m2',
      'Heavy enough to decay into hadrons — the only lepton that can.');
  add('T', P13.pi0.tau, 'the neutral pion', 'ch13-m7',
      'Decays electromagnetically into two photons. Compare it with the charged pion: same particle, different force.');
  add('T', 2*Math.PI*A0/(ALPHA*C), 'one orbit in hydrogen', 'ch4-m4',
      '2πa₀/αc. A classical electron radiating this fast would spiral in within 10⁻¹¹ s — the reason quantum theory had to exist.');
  add('T', LAM_VIS*1e-9/C, 'one cycle of green light', 'ch2-m2',
      'The period, λ/c. A photodetector cannot follow this; it can only count photons.');
  add('T', 2*R_FE/C, 'light crossing a nucleus', 'ch13-m1',
      'The fastest anything nuclear can happen, and it is what a strong decay takes. Compare the pions above.');

  _scaleItems = it;
  return it;
}

/* ---- formatting ---- */
function scEnergyStr(eV){
  const a=Math.abs(eV);
  if(a>=1e9) return fmt(eV/1e9,a/1e9<10?2:0)+' GeV';
  if(a>=1e6) return fmt(eV/1e6,a/1e6<10?2:1)+' MeV';
  if(a>=1e3) return fmt(eV/1e3,a/1e3<10?2:0)+' keV';
  if(a>=1)   return fmt(eV,2)+' eV';
  if(a>=1e-3)return fmt(eV*1e3,1)+' meV';
  return fmtSci(eV,2)+' eV';
}
function scLenStr(m){
  const a=Math.abs(m);
  if(a>=1e3)  return fmt(m/1e3,a/1e3<10?2:0)+' km';
  if(a>=1)    return fmt(m,a<10?2:0)+' m';
  if(a>=1e-3) return fmt(m*1e3,a*1e3<10?2:0)+' mm';
  if(a>=1e-6) return fmt(m*1e6,a*1e6<10?2:1)+' µm';
  if(a>=1e-9) return fmt(m*1e9,a*1e9<10?2:1)+' nm';
  if(a>=1e-12)return fmt(m*1e12,a*1e12<10?2:1)+' pm';
  if(a>=1e-15)return fmt(m*1e15,a*1e15<10?2:1)+' fm';
  return fmtSci(m,2)+' m';
}
function scTimeStr(s){
  const a=Math.abs(s), YR=3.156e7;
  if(a>=1e9*YR) return fmt(s/YR/1e9,2)+' billion years';
  if(a>=YR)     return fmt(s/YR,a/YR<1e3?0:0)+' years';
  if(a>=86400)  return fmt(s/86400,1)+' days';
  if(a>=60)     return fmt(s/60,1)+' minutes';
  if(a>=1)      return fmt(s,a<10?2:0)+' s';
  if(a>=1e-3)   return fmt(s*1e3,2)+' ms';
  if(a>=1e-6)   return fmt(s*1e6,2)+' µs';
  if(a>=1e-9)   return fmt(s*1e9,2)+' ns';
  return fmtSci(s,2)+' s';
}
function scValStr(row,v){ return row==='E'?scEnergyStr(v) : row==='L'?scLenStr(v) : scTimeStr(v); }
// every mark is also an energy: a length through ħc/ℓ, a time through ħ/t
function scEnergyOf(item){
  if(item.row==='E') return item.v;
  if(item.row==='L') return SC_HBARC_EV_NM/(item.v*1e9);
  return SC_HBAR_EV_S/item.v;
}
function scPartner(row, eV){
  if(row==='E') return eV;
  if(row==='L') return SC_HBARC_EV_NM/eV*1e-9;
  return SC_HBAR_EV_S/eV;
}

/* ---- layout ---- */
function buildScaleLayout(ctx,w,h){
  const items = buildScaleItems();
  const left = 58, right = 16, top = 10;
  const blockH = (h - top - 22)/SC_ROWS.length;
  const plotW = w - left - right;
  const showLabels = plotW >= 520;
  const rows = {};
  SC_ROWS.forEach((r,ri)=>{
    const mine = items.filter(i=>i.row===r.key);
    const vs = mine.map(i=>i.v);
    // a decade of air at each end, so a ħc/E marker just past the last mark
    // still has somewhere to land
    const lo = Math.floor(Math.log10(Math.min(...vs))) - 1;
    const hi = Math.ceil(Math.log10(Math.max(...vs))) + 1;
    const axisY = top + ri*blockH + blockH - 26;
    const x = v => left + plotW*(Math.log10(v)-lo)/(hi-lo);
    rows[r.key] = {...r, lo, hi, axisY, x, top: top+ri*blockH, mine};

    // Labels go above the line, in as many lanes as it takes not to collide.
    // On a phone there is no width for them at all, so the marks stay and the
    // caption does the naming when one is tapped.
    ctx.font = '10px Helvetica,Arial,sans-serif';
    const laneEnd = [];
    mine.sort((a,b)=>a.v-b.v).forEach(it=>{
      it.cx = x(it.v);
      it.tw = showLabels ? ctx.measureText(it.label).width : 0;
      if(!showLabels){ it.lx = it.cx; it.lane = 0; return; }
      // a mark at either end would hang its label off the canvas, so the label
      // slides inward and the leader line does the pointing. Pack the lanes on
      // where the label actually ends up, not on where the mark is.
      it.lx = Math.max(it.tw/2+2, Math.min(w-2-it.tw/2, it.cx));
      let lane = 0;
      while(lane<8 && laneEnd[lane]!=null && it.lx - it.tw/2 < laneEnd[lane] + 7) lane++;
      laneEnd[lane] = it.lx + it.tw/2;
      it.lane = lane;
    });
    const lanes = Math.max(1, ...mine.map(i=>i.lane+1));
    const laneH = Math.min(15, (blockH-40)/lanes);
    mine.forEach(it=>{ it.ly = showLabels ? axisY - 10 - (lanes-1-it.lane)*laneH : axisY - 8; });
    rows[r.key].showLabels = showLabels;
  });
  return {rows, left, right, plotW};
}

function drawScaleRuler(){
  const canvas = document.getElementById('scale-canvas');
  if(!canvas) return;
  const {ctx,w,h} = fitCanvas(canvas);
  ctx.clearRect(0,0,w,h);
  const L = _scaleLayout = buildScaleLayout(ctx,w,h);
  const hov = _scaleHover;
  const hovE = hov ? scEnergyOf(hov) : null;

  SC_ROWS.forEach(r=>{
    const R = L.rows[r.key];
    // axis
    ctx.strokeStyle='#ddd8cc'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(L.left,R.axisY+0.5); ctx.lineTo(w-L.right,R.axisY+0.5); ctx.stroke();
    // decade ticks, thinned if there are too many to label
    const span = R.hi-R.lo;
    const every = span>26 ? 6 : span>16 ? 3 : span>9 ? 2 : 1;
    ctx.font='9px Helvetica,Arial,sans-serif'; ctx.textAlign='center'; ctx.fillStyle='#b0aa9c';
    for(let e=R.lo;e<=R.hi;e++){
      const x=R.x(Math.pow(10,e));
      ctx.strokeStyle = (e-R.lo)%every===0 ? '#ddd8cc' : '#eeeae0';
      ctx.beginPath(); ctx.moveTo(x,R.axisY); ctx.lineTo(x,R.axisY+((e-R.lo)%every===0?5:3)); ctx.stroke();
      if((e-R.lo)%every===0) ctx.fillText('10'+_supDigits(e), x, R.axisY+15);
    }
    // row title
    ctx.textAlign='left'; ctx.font='700 10px Helvetica,Arial,sans-serif'; ctx.fillStyle=r.col;
    ctx.fillText(r.title, 6, R.axisY-3);
    ctx.font='9px Helvetica,Arial,sans-serif'; ctx.fillStyle='#b0aa9c';
    ctx.fillText(r.unit, 6, R.axisY+13);

    // the matching point on every ruler, when something is hovered
    if(hovE){
      const pv = scPartner(r.key, hovE);
      const px = R.x(pv);
      if(px < L.left-1 || px > w-L.right+1){
        // off this ruler entirely — say so, and which way, rather than silently
        // dropping the link
        const atLeft = px < L.left;
        const ax = atLeft ? L.left+8 : w-L.right-8;
        ctx.fillStyle='rgba(164,52,44,0.8)';
        ctx.beginPath();
        ctx.moveTo(atLeft?ax-7:ax+7, R.axisY); ctx.lineTo(ax, R.axisY-4); ctx.lineTo(ax, R.axisY+4);
        ctx.closePath(); ctx.fill();
        ctx.font='9px Helvetica,Arial,sans-serif'; ctx.fillStyle='#a4342c';
        ctx.textAlign = atLeft ? 'left' : 'right';
        ctx.fillText(scValStr(r.key, pv)+', off this ruler', atLeft?ax+4:ax-4, R.axisY-6);
      } else {
        const isSelf = (hov.row===r.key);
        ctx.save();
        ctx.setLineDash([3,3]);
        ctx.strokeStyle = isSelf ? 'rgba(164,52,44,0.85)' : 'rgba(164,52,44,0.45)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(px, R.top+2); ctx.lineTo(px, R.axisY); ctx.stroke();
        ctx.restore();
        if(!isSelf){
          ctx.fillStyle='rgba(164,52,44,0.85)';
          ctx.beginPath(); ctx.arc(px, R.axisY, 3, 0, 2*Math.PI); ctx.fill();
          ctx.font='9px Helvetica,Arial,sans-serif'; ctx.textAlign='center'; ctx.fillStyle='#a4342c';
          const tag = r.key==='E' ? 'E = ' : r.key==='L' ? 'ħc/E = ' : 'ħ/E = ';
          const txt = tag + scValStr(r.key, pv);
          let tx = px, half = ctx.measureText(txt).width/2;
          if(tx-half < 2) tx = 2+half;
          if(tx+half > w-2) tx = w-2-half;
          ctx.fillText(txt, tx, R.axisY-4);
        }
      }
    }

    // Stems first, labels after: a stem reaching a high lane crosses the labels
    // in the lanes below it, and text drawn on top of a line is unreadable.
    R.mine.forEach(it=>{
      ctx.globalAlpha = (!hov || hov===it) ? 1 : 0.32;
      ctx.strokeStyle = hov===it ? '#a4342c' : r.col;
      ctx.lineWidth = hov===it ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(it.cx, R.axisY); ctx.lineTo(it.cx, it.ly+5);
      if(R.showLabels) ctx.lineTo(it.lx, it.ly+3);
      ctx.stroke();
      ctx.fillStyle = hov===it ? '#a4342c' : r.col;
      ctx.beginPath(); ctx.arc(it.cx, R.axisY, hov===it?3.4:2.2, 0, 2*Math.PI); ctx.fill();
      ctx.globalAlpha = 1;
    });
    if(R.showLabels) R.mine.forEach(it=>{
      ctx.font = (hov===it?'700 ':'')+'10px Helvetica,Arial,sans-serif';
      ctx.textAlign='center';
      // the mask goes down at full opacity whatever the label's own fading is,
      // or the stem it is meant to hide shows straight through it
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#fffdf8';                       // --plot-bg, the canvas's own colour
      ctx.fillRect(it.lx-it.tw/2-2, it.ly-8, it.tw+4, 11);
      ctx.globalAlpha = (!hov || hov===it) ? 1 : 0.32;
      ctx.fillStyle = hov===it ? '#a4342c' : '#5a5d63';
      ctx.fillText(it.label, it.lx, it.ly);
      ctx.globalAlpha = 1;
    });
  });

  // what the hovered mark means, in words
  const cap = document.getElementById('scale-caption');
  if(cap){
    if(hov){
      const E = hovE, Lp = scPartner('L',E), Tp = scPartner('T',E);
      const parts = [`<b>${hov.label}</b> — ${scValStr(hov.row, hov.v)}.`];
      // say something different depending on which ruler it sits on, so the
      // sentence never just restates the quantity back through its own definition
      if(hov.row==='E'){
        parts.push(`The scales this energy sets on its own: ħc/E = ${scLenStr(Lp)}, ħ/E = ${scTimeStr(Tp)}. ` +
                   `(A photon of this energy has a wavelength 2π times that, ${scLenStr(Lp*2*Math.PI)}.)`);
      } else if(hov.row==='L'){
        parts.push(`Probing it takes an energy of about ħc/ℓ = ${scEnergyStr(E)}, and light crosses it in ${scTimeStr(Tp)}.`);
      } else {
        parts.push(`Light travels ${scLenStr(Lp)} in that time, and ħ/t = ${scEnergyStr(E)} is the width it gives an energy level.`);
      }
      if(hov.note) parts.push(hov.note);
      cap.innerHTML = parts.join(' ');
    } else {
      cap.innerHTML = 'Hover any mark. The dashed lines show where that same quantity lands on the other two rulers, through ℓ = ħc/E and t = ħ/E. Click to go to the module.';
    }
  }
}

function scaleItemAt(canvas, ev){
  if(!_scaleLayout) return null;
  const r = canvas.getBoundingClientRect();
  const x = (ev.clientX-r.left) * (canvas.clientWidth/r.width);
  const y = (ev.clientY-r.top)  * (canvas.clientHeight/r.height);
  let best=null, bd=1e9;
  SC_ROWS.forEach(row=>{
    const R=_scaleLayout.rows[row.key]; if(!R) return;
    R.mine.forEach(it=>{
      // the dot, and the label's own box
      const dd = Math.hypot(x-it.cx, y-R.axisY);
      const inLabel = Math.abs(x-it.lx) < it.tw/2+4 && y > it.ly-11 && y < it.ly+4;
      const d = inLabel ? 0 : dd;
      if(d < bd){ bd=d; best=it; }
    });
  });
  return bd<=14 ? best : null;
}

function scaleChapterOf(cardId){ return cardId.split('-')[0]; }

function openScale(){
  const ov=document.getElementById('scale-overlay');
  if(!ov) return;
  ov.hidden=false;
  const canvas=document.getElementById('scale-canvas');
  if(canvas && !_scaleWired){
    _scaleWired = true;
    canvas.addEventListener('mousemove', ev=>{
      const it = scaleItemAt(canvas,ev);
      if(it !== _scaleHover){ _scaleHover = it; canvas.style.cursor = it?'pointer':'default'; drawScaleRuler(); }
    });
    canvas.addEventListener('mouseleave', ()=>{ if(_scaleHover){ _scaleHover=null; drawScaleRuler(); } });
    canvas.addEventListener('click', ev=>{
      const it = scaleItemAt(canvas,ev);
      if(!it || !it.card) return;
      // Where the labels do not fit, a mark is anonymous until it is picked, so
      // the first tap names it in the caption and only the second one leaves.
      const R = _scaleLayout && _scaleLayout.rows[it.row];
      if(R && !R.showLabels && _scaleTapped !== it){
        _scaleTapped = it; _scaleHover = it; drawScaleRuler();
        return;
      }
      closeScale();
      goToModule(scaleChapterOf(it.card), it.card);
    });
  }
  requestAnimationFrame(drawScaleRuler);
}
function closeScale(){
  const ov=document.getElementById('scale-overlay');
  if(ov) ov.hidden=true;
}
