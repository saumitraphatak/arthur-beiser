/* =====================================================================
   Concepts of Modern Physics — six derivations, a line at a time

   The modules show what the formulas do. These show where six of them
   came from, one line per click, with a reason for every line. Nothing
   is skipped and no step is left as "it can be shown that": the point
   of revealing them one at a time is that you can try to write the next
   line yourself before it appears, which is the only way reading a
   derivation teaches anything.
   ===================================================================== */
const DERIVATIONS = [
  {
    id:'dilation',
    title:'Time dilation, from a bouncing light pulse',
    card:'ch1-m2',
    result:'Δt = γΔt₀',
    intro:'Build a clock out of nothing but light: a pulse bouncing between two mirrors a distance L apart. One tick is one round trip. Then watch the same clock go past at speed v, remembering that light still travels at c for you.',
    steps:[
      {eq:'t₀ = 2L / c',
       why:'In the clock’s own frame the pulse goes straight up and back, so a tick is twice the gap divided by c. This is the proper time: it is measured by one clock at one place.'},
      {eq:'c·t = 2 √( L² + (v t / 2)² )',
       why:'In your frame the clock slides sideways by vt during one tick, so the pulse travels two slanted legs rather than two vertical ones. The left side is the distance light covers in time t — at c, because that is the postulate.'},
      {eq:'c² t² = 4L² + v² t²',
       why:'Square both sides. Everything that follows is algebra; the physics was all in the previous line.'},
      {eq:'t² (c² − v²) = 4L²',
       why:'Collect the t² terms. Notice c² − v², which is where the square root of the next line comes from.'},
      {eq:'t = 2L / √(c² − v²)  =  (2L/c) / √(1 − v²/c²)',
       why:'Solve for t, then pull a c out of the square root so the 2L/c from step 1 reappears.'},
      {eq:'t = t₀ / √(1 − v²/c²)  =  γ t₀',
       why:'And 2L/c was the proper time. The moving clock is slow by exactly γ.'},
      {eq:'— nothing about the clock was used —',
       why:'L cancelled out, and the only property of the pulse used was that it goes at c in both frames. So this is not a fact about light clocks; any other clock next to it must agree, or you could tell which frame you were in by comparing them.'}
    ]
  },
  {
    id:'emc2',
    title:'E = γmc², from the work done on a particle',
    card:'ch1-m7',
    result:'KE = (γ − 1)mc²',
    intro:'No postulate about mass and energy is needed. Push on a particle, add up the work, and insist only that momentum is γmv rather than mv.',
    steps:[
      {eq:'KE = ∫ F ds = ∫ (dp/dt) ds = ∫₀^p v dp',
       why:'Work is force times distance, force is the rate of change of momentum, and ds/dt is v. This is the ordinary definition of kinetic energy, untouched.'},
      {eq:'∫₀^p v dp = p v − ∫₀^v p dv = γmv² − ∫₀^v γ m v dv',
       why:'Integrate by parts, then substitute p = γmv. The relativistic momentum is the only thing put in by hand.'},
      {eq:'∫₀^v m v (1 − v²/c²)^(−1/2) dv = mc² ( 1 − 1/γ )',
       why:'Substitute u = 1 − v²/c², so v dv = −(c²/2) du and the integral is an elementary √u. Evaluating from 0 to v gives mc² − mc²√(1 − v²/c²).'},
      {eq:'KE = γmv² − mc² + mc²/γ',
       why:'Put the last two lines together. It does not look like anything yet.'},
      {eq:'γmv² + mc²/γ = γmc² ( v²/c² + 1/γ² ) = γmc² ( β² + 1 − β² )',
       why:'Factor γmc² out of the two surviving terms and use 1/γ² = 1 − β². The β² cancels — this is the step that makes the whole thing collapse.'},
      {eq:'KE = γmc² − mc² = (γ − 1) mc²',
       why:'So the kinetic energy is a difference of two terms, each of the form (something)·mc².'},
      {eq:'E = KE + mc² = γ m c²',
       why:'Set a particle at rest: γ = 1 and the kinetic energy is zero, but mc² does not go away. It is left over from an argument that only ever discussed pushing — which is why it must be energy the particle already had.'},
      {eq:'γ ≈ 1 + ½β²  ⟹  KE ≈ ½mv²',
       why:'Expand for small v and the classical result comes back, as it must. Newton was never wrong, only incomplete.'}
    ]
  },
  {
    id:'compton',
    title:'The Compton shift',
    card:'ch2-m4',
    result:'λ′ − λ = (h/mc)(1 − cos φ)',
    intro:'A photon of energy hν hits an electron sitting still, and comes off at angle φ with less energy. Conserve energy and momentum, then get rid of everything about the electron, which is the part nobody measures.',
    steps:[
      {eq:'hν/c = (hν′/c) cos φ + p cos θ<br>0 = (hν′/c) sin φ − p sin θ',
       why:'Momentum conservation along and across the original direction. The photon carries hν/c; the electron leaves with p at some angle θ.'},
      {eq:'p²c² = (hν)² − 2(hν)(hν′) cos φ + (hν′)²',
       why:'Move the photon terms to one side of each equation, square both, and add. The electron’s angle θ disappears because sin²θ + cos²θ = 1 — that is the whole reason for doing it this way.'},
      {eq:'hν + mc² = hν′ + E     with  E² = p²c² + m²c⁴',
       why:'Energy conservation, with the electron’s energy in its relativistic form. The electron starts at rest, so its initial energy is just mc².'},
      {eq:'( hν − hν′ + mc² )² = p²c² + m²c⁴',
       why:'Square the energy equation. Now both conservation laws give an expression for p²c², which is the only thing they have in common.'},
      {eq:'(hν − hν′)² + 2mc²(hν − hν′) = p²c²',
       why:'Expand the square; the m²c⁴ on each side cancels.'},
      {eq:'2mc²(hν − hν′) = 2(hν)(hν′)(1 − cos φ)',
       why:'Set this equal to the momentum result from step 2. The (hν)² and (hν′)² terms cancel, leaving only the cross terms.'},
      {eq:'mc² ( 1/ν′ − 1/ν ) / h = 1 − cos φ',
       why:'Divide through by 2h²νν′. The frequencies have turned into their reciprocals, which is the hint that this wants to be about wavelength.'},
      {eq:'λ′ − λ = (h/mc) (1 − cos φ)',
       why:'And λ = c/ν. The shift depends only on the angle — not on the incoming wavelength, not on the material. h/mc = 2.43 pm is a fixed length, the electron’s Compton wavelength, which is why the effect is invisible for visible light and obvious for X-rays.'}
    ]
  },
  {
    id:'bohr',
    title:'Bohr’s radii and energies, from a standing wave',
    card:'ch4-m4',
    result:'rₙ = n²a₀,  Eₙ = −13.6 eV / n²',
    intro:'Bohr had to assume that angular momentum comes in units of ħ. De Broglie made the assumption unnecessary: an orbit is a wave that has to close on itself.',
    steps:[
      {eq:'λ = h / mv',
       why:'The de Broglie wavelength of the orbiting electron. This is the only new ingredient.'},
      {eq:'n λ = 2π r ,  n = 1, 2, 3, …',
       why:'A wave running round a loop must meet itself in phase, or it cancels itself out on the next lap. Whole numbers of wavelengths, and nothing in between.'},
      {eq:'n h / (mv) = 2π r   ⟹   m v r = n ħ',
       why:'Substitute and rearrange. Bohr’s quantisation of angular momentum was not an extra postulate after all; it is what a closed wave means.'},
      {eq:'e² / (4πε₀ r²) = m v² / r',
       why:'Now the classical part: the Coulomb attraction supplies exactly the centripetal force needed to hold the electron in a circle.'},
      {eq:'rₙ = 4πε₀ ħ² n² / (m e²) = n² a₀',
       why:'Two equations, two unknowns — eliminate v. Everything on the right is a constant except n², so the orbits go 1, 4, 9, 16 times the smallest one, a₀ = 52.9 pm.'},
      {eq:'E = ½mv² − e²/(4πε₀ r) = − e² / (8πε₀ r)',
       why:'Total energy is kinetic plus potential, and the force equation above says the kinetic term is exactly half the magnitude of the potential one. The total comes out negative, which is what "bound" means.'},
      {eq:'Eₙ = − m e⁴ / (32π²ε₀²ħ²) · 1/n² = − 13.6 eV / n²',
       why:'Put rₙ in. The ladder of energies, and with it every line in the hydrogen spectrum, from one standing-wave condition and Coulomb’s law.'}
    ]
  },
  {
    id:'box',
    title:'The particle in a box, from the Schrödinger equation',
    card:'ch5-m2',
    result:'Eₙ = n²h² / 8mL²',
    intro:'The shortest honest quantum calculation there is: one particle, two walls, and no approximations anywhere.',
    steps:[
      {eq:'− (ħ²/2m) d²ψ/dx² = E ψ     ⟹     ψ″ = −k² ψ ,  k² = 2mE/ħ²',
       why:'Inside the box V = 0, so the time-independent Schrödinger equation is just this. The substitution is only bookkeeping.'},
      {eq:'ψ(x) = A sin kx + B cos kx',
       why:'The general solution of ψ″ = −k²ψ. At this point every energy E is still allowed — nothing is quantised yet.'},
      {eq:'ψ(0) = 0  ⟹  B = 0',
       why:'The walls are infinitely high, so the particle cannot be found at or beyond them, and ψ must go to zero there. cos 0 = 1, so the cosine has to go.'},
      {eq:'ψ(L) = 0  ⟹  sin kL = 0  ⟹  kL = nπ',
       why:'The same condition at the far wall. A sine vanishes only at multiples of π, and this is where the integers enter — from a boundary condition, not from an assumption.'},
      {eq:'n = 1, 2, 3, …   (n = 0 gives ψ ≡ 0)',
       why:'Not n = 0: that wave function is zero everywhere, which describes no particle at all rather than a particle at rest.'},
      {eq:'Eₙ = ħ²kₙ²/2m = n² π² ħ² / (2mL²) = n² h² / (8mL²)',
       why:'Substitute back into k² = 2mE/ħ². The energies go as n², and shrinking the box raises every one of them as 1/L².'},
      {eq:'∫₀^L A² sin²(nπx/L) dx = 1  ⟹  A = √(2/L)',
       why:'Normalisation: the particle is somewhere, with probability 1. The average of sin² over a whole number of half-periods is ½, so A²L/2 = 1.'},
      {eq:'E₁ = h²/8mL² > 0',
       why:'The lowest energy is not zero and cannot be made zero. Confining a particle to a length L forces a momentum spread on it, and this is the uncertainty principle arriving as a boundary condition rather than as a separate law.'}
    ]
  },
  {
    id:'decay',
    title:'The decay law, half-life and mean life',
    card:'ch12-m2',
    result:'N = N₀e^(−λt),  T½ = 0.693 τ',
    intro:'One assumption, which is the strange part: a nucleus has no memory. Its chance of decaying in the next second does not depend on how long it has already survived.',
    steps:[
      {eq:'P(decay in dt) = λ dt ,  independent of age',
       why:'This is the physical content. λ is a constant of the nuclide, and nothing about the individual nucleus — its history, its neighbours — enters.'},
      {eq:'dN = − λ N dt',
       why:'With N nuclei present, the expected number decaying in dt is λN dt. The minus sign is because they leave.'},
      {eq:'dN / N = − λ dt   ⟹   ln N = −λt + const',
       why:'Separate the variables and integrate. Both sides are elementary.'},
      {eq:'N = N₀ e^(−λt)',
       why:'Exponentiate, with N₀ the number at t = 0. Note what this is not: nothing has been said about individual nuclei, only about how many are left.'},
      {eq:'N₀/2 = N₀ e^(−λ T½)   ⟹   T½ = ln 2 / λ = 0.693 / λ',
       why:'Set N to half and solve. N₀ cancels, so the half-life does not depend on how much you started with — which is what lets it be quoted as a property of the nuclide.'},
      {eq:'τ = ∫₀^∞ t λ e^(−λt) dt = 1/λ',
       why:'The mean life is the average of t over the decay-time distribution. The integral is a standard one and gives exactly 1/λ.'},
      {eq:'T½ = 0.693 τ  <  τ',
       why:'The half-life is shorter than the average life, and the reason is the long tail: a few nuclei survive for many mean lives and drag the average up past the halfway point.'},
      {eq:'R = −dN/dt = λN = R₀ e^(−λt)',
       why:'Activity is what a counter actually measures, and it follows the same exponential with the same λ — so you can measure a half-life without ever knowing how many nuclei are in the sample.'}
    ]
  }
];

let _dvId = DERIVATIONS[0].id;
let _dvShown = 1;

function dvById(id){ return DERIVATIONS.find(d=>d.id===id) || DERIVATIONS[0]; }
function dvChapterOf(card){ return card.split('-')[0]; }

function drawDerivation(){
  const d = dvById(_dvId);
  const picker = document.getElementById('dv-picker');
  const body = document.getElementById('dv-body');
  if(!picker || !body) return;
  picker.innerHTML = DERIVATIONS.map(x=>
    `<button type="button" class="dv-chip${x.id===_dvId?' on':''}" data-id="${x.id}">${x.title}</button>`).join('');
  picker.querySelectorAll('.dv-chip').forEach(b=>{
    b.addEventListener('click', ()=>{ _dvId=b.dataset.id; _dvShown=1; drawDerivation(); });
  });

  const n = d.steps.length;
  const shown = Math.min(_dvShown, n);
  const lines = d.steps.slice(0,shown).map((s,i)=>
    `<div class="dv-step${i===shown-1?' fresh':''}">
       <div class="dv-eq">${s.eq}</div>
       <div class="dv-why"><span class="dv-n">${i+1}</span>${s.why}</div>
     </div>`).join('');
  const atEnd = shown>=n;
  body.innerHTML =
    `<p class="dv-intro">${d.intro}</p>
     <div class="dv-target">what we are heading for: <b>${d.result}</b></div>
     ${lines}
     <div class="dv-acts">
       <button type="button" class="dv-btn" id="dv-next"${atEnd?' disabled':''}>next line (${shown} of ${n})</button>
       <button type="button" class="dv-btn ghost" id="dv-all"${atEnd?' disabled':''}>show the rest</button>
       <button type="button" class="dv-btn ghost" id="dv-reset">start over</button>
       <button type="button" class="dv-btn ghost" id="dv-goto">go to the module</button>
     </div>`;
  const next=document.getElementById('dv-next'), all=document.getElementById('dv-all'),
        reset=document.getElementById('dv-reset'), go=document.getElementById('dv-goto');
  if(next) next.addEventListener('click', ()=>{ _dvShown=shown+1; drawDerivation(); scrollDvEnd(); });
  if(all)  all.addEventListener('click', ()=>{ _dvShown=n; drawDerivation(); });
  if(reset)reset.addEventListener('click', ()=>{ _dvShown=1; drawDerivation(); });
  if(go)   go.addEventListener('click', ()=>{ closeDerive(); goToModule(dvChapterOf(d.card), d.card); });
}
function scrollDvEnd(){
  const body=document.getElementById('dv-body');
  const last=body && body.querySelector('.dv-step.fresh');
  if(last) last.scrollIntoView({behavior: prefersReducedMotion()?'instant':'smooth', block:'nearest'});
}

function openDerive(){
  const ov=document.getElementById('dv-overlay');
  if(!ov) return;
  ov.hidden=false;
  drawDerivation();
}
function closeDerive(){
  const ov=document.getElementById('dv-overlay');
  if(ov) ov.hidden=true;
}
function initDerive(){
  const open=document.getElementById('dv-open'), close=document.getElementById('dv-close'),
        ov=document.getElementById('dv-overlay');
  if(open) open.addEventListener('click', openDerive);
  if(close) close.addEventListener('click', closeDerive);
  if(ov) ov.addEventListener('click', e=>{ if(e.target===ov) closeDerive(); });
}
