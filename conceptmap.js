/* =====================================================================
   Concepts of Modern Physics — how the book fits together

   Forty-five of the ninety-one modules, the ones that carry the
   argument, with an arrow wherever one idea genuinely rests on another.
   Chapters run down the page, so most arrows point downward and the
   ones that do not are the interesting ones: tunnelling reaching into
   nuclear decay, the exclusion principle turning up in three separate
   chapters, mass-energy from Chapter 1 underwriting binding energy in
   Chapter 11.
   ===================================================================== */
const MAP_NODES = [
  {id:'ch1-m2',  label:'time dilation'},
  {id:'ch1-m7',  label:'mass–energy, γmv'},
  {id:'ch2-m1',  label:'quantisation'},
  {id:'ch2-m2',  label:'the photon'},
  {id:'ch2-m4',  label:'photon momentum'},
  {id:'ch3-m1',  label:'de Broglie waves'},
  {id:'ch3-m5',  label:'wave packets'},
  {id:'ch3-m6',  label:'uncertainty'},
  {id:'ch4-m1',  label:'the nucleus'},
  {id:'ch4-m2',  label:'why atoms collapse'},
  {id:'ch4-m4',  label:'Bohr orbits'},
  {id:'ch4-m5',  label:'energy levels'},
  {id:'ch5-m1',  label:'the wave function'},
  {id:'ch5-m2',  label:'particle in a box'},
  {id:'ch5-m4',  label:'tunnelling'},
  {id:'ch5-m5',  label:'harmonic oscillator'},
  {id:'ch6-m1',  label:'n, ℓ, mℓ'},
  {id:'ch6-m3',  label:'orbital shapes'},
  {id:'ch6-m4',  label:'angular momentum'},
  {id:'ch6-m5',  label:'selection rules'},
  {id:'ch7-m1',  label:'spin'},
  {id:'ch7-m2',  label:'exclusion principle'},
  {id:'ch7-m3',  label:'the periodic table'},
  {id:'ch8-m2',  label:'the covalent bond'},
  {id:'ch8-m3',  label:'rotation'},
  {id:'ch8-m4',  label:'vibration'},
  {id:'ch9-m1',  label:'Maxwell–Boltzmann'},
  {id:'ch9-m3',  label:'three statistics'},
  {id:'ch9-m4',  label:"Planck's law, derived"},
  {id:'ch9-m6',  label:'the Fermi sea'},
  {id:'ch10-m4', label:'bands'},
  {id:'ch10-m5', label:'semiconductors'},
  {id:'ch10-m6', label:'the p–n junction'},
  {id:'ch10-m8', label:'superconductivity'},
  {id:'ch11-m1', label:'nuclear size'},
  {id:'ch11-m3', label:'binding energy'},
  {id:'ch11-m4', label:'the liquid drop'},
  {id:'ch11-m6', label:'the shell model'},
  {id:'ch11-m7', label:'Yukawa'},
  {id:'ch12-m2', label:'the decay law'},
  {id:'ch12-m4', label:'alpha decay'},
  {id:'ch12-m7', label:'fission'},
  {id:'ch12-m8', label:'fusion'},
  {id:'ch13-m1', label:'four interactions'},
  {id:'ch13-m4', label:'conservation laws'},
  {id:'ch13-m5', label:'quarks'}
];

// [needed first, rests on it]
const MAP_EDGES = [
  ['ch1-m2','ch1-m7'],
  ['ch2-m1','ch2-m2'], ['ch2-m2','ch2-m4'],
  ['ch2-m4','ch3-m1'], ['ch1-m7','ch3-m1'],
  ['ch3-m1','ch3-m5'], ['ch3-m5','ch3-m6'],
  ['ch3-m1','ch4-m4'],
  ['ch4-m1','ch4-m2'], ['ch4-m2','ch4-m4'], ['ch4-m4','ch4-m5'], ['ch2-m1','ch4-m5'],
  ['ch3-m6','ch5-m1'], ['ch3-m5','ch5-m1'],
  ['ch5-m1','ch5-m2'], ['ch5-m2','ch5-m4'], ['ch5-m2','ch5-m5'],
  ['ch5-m2','ch6-m1'], ['ch4-m5','ch6-m1'],
  ['ch6-m1','ch6-m3'], ['ch6-m1','ch6-m4'], ['ch6-m4','ch6-m5'],
  ['ch6-m1','ch7-m2'], ['ch7-m1','ch7-m2'], ['ch7-m2','ch7-m3'],
  ['ch6-m3','ch8-m2'], ['ch7-m2','ch8-m2'],
  ['ch8-m2','ch8-m3'], ['ch8-m2','ch8-m4'], ['ch5-m5','ch8-m4'],
  ['ch9-m1','ch9-m3'], ['ch7-m2','ch9-m3'],
  ['ch2-m1','ch9-m4'], ['ch9-m3','ch9-m4'], ['ch9-m3','ch9-m6'],
  ['ch9-m6','ch10-m4'], ['ch5-m2','ch10-m4'],
  ['ch10-m4','ch10-m5'], ['ch9-m3','ch10-m5'], ['ch10-m5','ch10-m6'],
  ['ch9-m6','ch10-m8'],
  ['ch4-m1','ch11-m1'], ['ch11-m1','ch11-m3'], ['ch1-m7','ch11-m3'],
  ['ch11-m3','ch11-m4'], ['ch11-m4','ch11-m6'], ['ch7-m2','ch11-m6'],
  ['ch3-m6','ch11-m7'],
  ['ch12-m2','ch12-m4'], ['ch5-m4','ch12-m4'],
  ['ch11-m3','ch12-m7'], ['ch11-m4','ch12-m7'],
  ['ch11-m3','ch12-m8'], ['ch5-m4','ch12-m8'],
  ['ch11-m7','ch13-m1'], ['ch13-m1','ch13-m4'], ['ch13-m4','ch13-m5']
];

let _mapLayout = null, _mapHover = null, _mapWired = false;

function mapChapterOf(id){ return id.split('-')[0]; }

function buildMapLayout(w,h){
  const rows = [];
  MAP_NODES.forEach(n=>{
    const ch = mapChapterOf(n.id);
    let row = rows.find(r=>r.ch===ch);
    if(!row){ row = {ch, items:[]}; rows.push(row); }
    row.items.push(n);
  });
  rows.sort((a,b)=> (+a.ch.replace(/\D/g,'')) - (+b.ch.replace(/\D/g,'')));
  const left = 64, top = 16, bottom = 12;
  const rowH = (h - top - bottom) / rows.length;
  const boxH = Math.min(24, rowH - 12);
  const avail = w - left - 18;
  const pos = {};
  rows.forEach((r,ri)=>{
    const n = r.items.length;
    const boxW = Math.min(150, avail/Math.max(n,1) - 12);
    const gap = n>1 ? (avail - n*boxW)/(n-1) : 0;
    r.items.forEach((it,ci)=>{
      pos[it.id] = {
        x: left + ci*(boxW+gap), y: top + ri*rowH + (rowH-boxH)/2,
        w: boxW, h: boxH, label: it.label, ch: r.ch,
        cx: left + ci*(boxW+gap) + boxW/2
      };
    });
    r.y = top + ri*rowH + rowH/2;
  });
  // who needs whom, both ways, for the hover trace
  const up = {}, down = {};
  MAP_EDGES.forEach(([a,b])=>{
    (down[a] = down[a] || []).push(b);
    (up[b] = up[b] || []).push(a);
  });
  return {rows, pos, up, down};
}
function mapReach(adj, start){
  const seen = new Set(), stack = [start];
  while(stack.length){
    const cur = stack.pop();
    (adj[cur]||[]).forEach(nx=>{ if(!seen.has(nx)){ seen.add(nx); stack.push(nx); } });
  }
  return seen;
}

function drawConceptMap(){
  const canvas = document.getElementById('map-canvas');
  if(!canvas) return;
  const {ctx,w,h} = fitCanvas(canvas);
  ctx.clearRect(0,0,w,h);
  const L = _mapLayout = buildMapLayout(w,h);

  let lit = null;
  if(_mapHover){
    lit = new Set([_mapHover]);
    mapReach(L.up,_mapHover).forEach(x=>lit.add(x));
    mapReach(L.down,_mapHover).forEach(x=>lit.add(x));
  }

  // chapter numbers down the left
  ctx.font='10px Helvetica,Arial,sans-serif'; ctx.textAlign='right'; ctx.fillStyle='#b0aa9c';
  L.rows.forEach(r=>{
    ctx.fillText('ch '+r.ch.replace(/\D/g,''), 50, r.y+3);
  });

  // arrows
  MAP_EDGES.forEach(([a,b])=>{
    const pa=L.pos[a], pb=L.pos[b];
    if(!pa||!pb) return;
    const on = lit ? (lit.has(a) && lit.has(b)) : false;
    ctx.strokeStyle = lit ? (on ? 'rgba(164,52,44,0.72)' : 'rgba(199,194,181,0.22)')
                          : 'rgba(150,145,133,0.40)';
    ctx.lineWidth = on ? 1.8 : 1;
    const x0=pa.cx, y0=pa.y+pa.h, x1=pb.cx, y1=pb.y;
    ctx.beginPath();
    ctx.moveTo(x0,y0);
    ctx.bezierCurveTo(x0, y0+(y1-y0)*0.45, x1, y1-(y1-y0)*0.45, x1, y1);
    ctx.stroke();
    // arrowhead
    ctx.beginPath();
    ctx.moveTo(x1,y1); ctx.lineTo(x1-3.2,y1-5); ctx.lineTo(x1+3.2,y1-5); ctx.closePath();
    ctx.fillStyle = ctx.strokeStyle; ctx.fill();
  });

  // boxes
  ctx.textAlign='center';
  MAP_NODES.forEach(n=>{
    const p=L.pos[n.id]; if(!p) return;
    const isHover = (_mapHover===n.id);
    const on = lit ? lit.has(n.id) : true;
    ctx.globalAlpha = on ? 1 : 0.28;
    ctx.fillStyle = isHover ? '#a4342c' : '#ffffff';
    ctx.strokeStyle = isHover ? '#a4342c' : (on && lit ? '#a4342c' : '#ddd8cc');
    ctx.lineWidth = isHover ? 2 : 1;
    const r=6;
    ctx.beginPath();
    ctx.moveTo(p.x+r,p.y); ctx.arcTo(p.x+p.w,p.y,p.x+p.w,p.y+p.h,r);
    ctx.arcTo(p.x+p.w,p.y+p.h,p.x,p.y+p.h,r); ctx.arcTo(p.x,p.y+p.h,p.x,p.y,r);
    ctx.arcTo(p.x,p.y,p.x+p.w,p.y,r); ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = isHover ? '#fff' : '#3a3d42';
    ctx.font = '10px Helvetica,Arial,sans-serif';
    let lab = p.label;
    while(ctx.measureText(lab).width > p.w-10 && lab.length>4) lab = lab.slice(0,-2);
    if(lab !== p.label) lab = lab.slice(0,-1) + '…';
    ctx.fillText(lab, p.cx, p.y+p.h/2+3.5);
    ctx.globalAlpha = 1;
  });

  if(_mapHover && L.pos[_mapHover]){
    const nUp = mapReach(L.up,_mapHover).size, nDown = mapReach(L.down,_mapHover).size;
    ctx.textAlign='left'; ctx.font='11px Helvetica,Arial,sans-serif'; ctx.fillStyle='#5a5d63';
    ctx.fillText(`${L.pos[_mapHover].label}: rests on ${nUp} earlier idea${nUp===1?'':'s'}, and ${nDown} later one${nDown===1?'':'s'} rest on it`, 8, h-4);
  }
}

function mapNodeAt(canvas, ev){
  if(!_mapLayout) return null;
  const r = canvas.getBoundingClientRect();
  const x = (ev.clientX-r.left) * (canvas.clientWidth/r.width);
  const y = (ev.clientY-r.top)  * (canvas.clientHeight/r.height);
  for(const n of MAP_NODES){
    const p=_mapLayout.pos[n.id];
    if(p && x>=p.x && x<=p.x+p.w && y>=p.y && y<=p.y+p.h) return n.id;
  }
  return null;
}

function openMap(){
  const ov=document.getElementById('map-overlay');
  if(!ov) return;
  ov.hidden=false;
  const canvas=document.getElementById('map-canvas');
  if(canvas && !_mapWired){
    _mapWired = true;
    canvas.addEventListener('mousemove', ev=>{
      const id = mapNodeAt(canvas,ev);
      if(id !== _mapHover){ _mapHover = id; canvas.style.cursor = id?'pointer':'default'; drawConceptMap(); }
    });
    canvas.addEventListener('mouseleave', ()=>{ if(_mapHover){ _mapHover=null; drawConceptMap(); } });
    canvas.addEventListener('click', ev=>{
      const id = mapNodeAt(canvas,ev);
      if(id){ closeMap(); goToModule(mapChapterOf(id), id); }
    });
  }
  requestAnimationFrame(drawConceptMap);
}
function closeMap(){
  const ov=document.getElementById('map-overlay');
  if(ov) ov.hidden=true;
}
