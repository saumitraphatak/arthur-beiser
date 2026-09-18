/* =====================================================================
   Concepts of Modern Physics — problems with a number at the end

   The multiple-choice questions test whether you can recognise the
   right answer. These ask you to produce one. Each problem draws its
   own numbers, computes the answer from the same constants the modules
   use, accepts anything within a couple of percent, and then shows the
   working line by line whether you got it or not.

   A problem returns:
     q         the question, as HTML
     answer    the number, in the stated unit
     unit      what the box expects
     tol       relative tolerance (default 0.02)
     trap      one line naming the mistake a wrong answer usually is
     solution  [{eq, why}] — the working, shown afterwards
   ===================================================================== */

/* ---------- CHAPTER 1 ---------- */
registerProblem('ch1', function(){
  const L0 = qPick([1.50, 2.00, 2.50, 4.00]);
  const beta = qPick([0.600, 0.800, 0.900, 0.950]);
  const g = 1/Math.sqrt(1-beta*beta);
  return {
    q:`A rod measures <b>${fmt(L0,2)} m</b> at rest. How long is it to an observer it flies past at <b>${fmt(beta,3)}c</b>, along its own length?`,
    answer: L0/g, unit:'m', tol:0.02,
    trap:'If you got a longer rod, you multiplied by γ instead of dividing — lengths contract while times dilate.',
    solution:[
      {eq:`γ = 1/√(1 − ${fmt(beta,3)}²) = ${fmt(g,4)}`, why:'The same γ as everywhere else in the chapter.'},
      {eq:`L = L₀/γ = ${fmt(L0,2)}/${fmt(g,4)} = ${fmt(L0/g,4)} m`,
       why:'Proper length is the longest any observer measures, so the moving rod is shorter. Only the dimension along the motion changes; the other two are untouched.'}
    ]
  };
});
registerProblem('ch1', function(){
  const g = qPick([2.00, 3.00, 5.00, 10.0]);
  const KE = (g-1)*ME_C2_MEV;
  return {
    q:`How much kinetic energy must an electron be given to reach <b>γ = ${fmt(g,2)}</b>? Answer in MeV.`,
    answer: KE, unit:'MeV', tol:0.02,
    trap:'A common slip is to answer γmc² — that is the total energy, which includes the 0.511 MeV the electron had before you did anything.',
    solution:[
      {eq:'KE = (γ − 1)mc²', why:'From the work integral: the total energy is γmc² and the rest energy mc² was already there.'},
      {eq:`KE = (${fmt(g,2)} − 1)(0.511 MeV) = ${fmt(KE,3)} MeV`,
       why:`At γ = ${fmt(g,2)} the speed is ${fmt(Math.sqrt(1-1/(g*g)),4)}c, so ½mv² would have given about ${fmt(0.5*ME_C2_MEV*(1-1/(g*g)),3)} MeV — badly wrong, and always too small.`}
    ]
  };
});

/* ---------- CHAPTER 2 ---------- */
registerProblem('ch2', function(){
  const lam = qPick([200, 250, 300, 350, 400]);
  const phi = qPick([1.9, 2.3, 2.5, 3.2]);
  const KE = HC_EV_NM/lam - phi;
  return {
    q:`Light of wavelength <b>${lam} nm</b> falls on a metal whose work function is <b>${fmt(phi,1)} eV</b>. What is the maximum kinetic energy of the electrons that come off?`,
    answer: KE, unit:'eV', tol:0.03,
    trap:'If your answer is far too big, check whether you used hc = 1240 eV·nm rather than h alone — the shortcut only works with λ in nanometres.',
    solution:[
      {eq:`E = hc/λ = 1240/${lam} = ${fmt(HC_EV_NM/lam,3)} eV`,
       why:'hc = 1240 eV·nm is worth memorising; it turns every photon-energy question into one division.'},
      {eq:`KEmax = E − φ = ${fmt(HC_EV_NM/lam,3)} − ${fmt(phi,1)} = ${fmt(KE,3)} eV`,
       why:'Einstein\'s relation. Electrons deeper in the metal come out with less, which is why this is a maximum and not a single value.'}
    ]
  };
});
registerProblem('ch2', function(){
  const phi = qPick([30, 45, 60, 90, 120, 180]);
  const d = LAMBDA_C_PM*(1-Math.cos(phi*Math.PI/180));
  return {
    q:`A photon is Compton-scattered through <b>${phi}°</b> by an electron at rest. By how much does its wavelength increase? Answer in picometres.`,
    answer: d, unit:'pm', tol:0.03,
    trap:'This is a shift in wavelength, not a fractional change — it does not depend on the incoming wavelength at all.',
    solution:[
      {eq:'Δλ = (h/mc)(1 − cos φ)', why:'From conserving energy and momentum and eliminating the electron.'},
      {eq:`Δλ = 2.426 pm × (1 − cos ${phi}°) = ${fmt(d,4)} pm`,
       why:`h/mc = 2.426 pm is the electron's Compton wavelength, a fixed length. The largest possible shift is twice it, at 180°.`}
    ]
  };
});

/* ---------- CHAPTER 3 ---------- */
registerProblem('ch3', function(){
  const V = qPick([50, 100, 200, 400, 1000]);
  const lam = HC_EV_NM/Math.sqrt(2*ME_C2_MEV*1e6*V);   // non-relativistic, fine at these V
  return {
    q:`An electron is accelerated from rest through <b>${V} V</b>. What is its de Broglie wavelength, in nanometres?`,
    answer: lam, unit:'nm', tol:0.03,
    trap:'If you are out by a large factor, check that you took the square root of the energy — λ goes as 1/√V, not 1/V.',
    solution:[
      {eq:`pc = √(2mc²·K) = √(2 × 511000 × ${V}) = ${fmtSci(Math.sqrt(2*ME_C2_MEV*1e6*V),3)} eV`,
       why:`K = ${V} eV is far below mc², so the non-relativistic p = √(2mK) is good to better than a tenth of a percent.`},
      {eq:`λ = hc/pc = 1240/${fmtSci(Math.sqrt(2*ME_C2_MEV*1e6*V),3)} = ${fmtSci(lam,3)} nm`,
       why:'Smaller than an atom, which is why a crystal can diffract it and an ordinary grating cannot.'}
    ]
  };
});
registerProblem('ch3', function(){
  const dx = qPick([0.050, 0.100, 0.200, 1.00]);   // nm
  const pc = (HC_EV_NM/(2*Math.PI))/(2*dx);        // ħc/(2Δx), in eV
  return {
    q:`An electron is known to be somewhere inside a region <b>${fmt(dx,3)} nm</b> across. What is the smallest its momentum uncertainty can be, expressed as Δp·c in eV?`,
    answer: pc, unit:'eV', tol:0.03,
    trap:'Watch the difference between ħ and h, and between ħ/2 and ħ — the standard statement is ΔxΔp ≥ ħ/2.',
    solution:[
      {eq:'Δx Δp ≥ ħ/2   ⟹   Δp·c ≥ ħc / (2Δx)', why:'Multiply both sides by c so the answer comes out in eV without converting to kilograms.'},
      {eq:`Δp·c = 197.3 / (2 × ${fmt(dx,3)}) = ${fmt(pc,1)} eV`,
       why:`ħc = 197.3 eV·nm. That momentum corresponds to a kinetic energy of about ${fmt(pc*pc/(2*ME_C2_MEV*1e6),2)} eV — which is why confining an electron to atomic size costs electron-volts, and confining it to nuclear size would cost tens of MeV.`}
    ]
  };
});

/* ---------- CHAPTER 4 ---------- */
registerProblem('ch4', function(){
  const Z = qPick([1,2,3,6]);
  const n = qPick([1,2,3,4]);
  const E = 13.606*Z*Z/(n*n);
  return {
    q:`A one-electron ion has nuclear charge <b>Z = ${Z}</b>. How much energy does it take to remove the electron from the <b>n = ${n}</b> level? Answer in eV.`,
    answer: E, unit:'eV', tol:0.02,
    trap:'Z enters squared and n enters squared — one multiplies, the other divides.',
    solution:[
      {eq:'Eₙ = −13.6 Z²/n² eV', why:'Z² because the Coulomb energy and the orbit radius each bring in a factor of Z; n² from the standing-wave condition.'},
      {eq:`E = 13.6 × ${Z}²/${n}² = ${fmt(E,3)} eV`,
       why:'The ionisation energy is the depth of the level, so it is the magnitude of a negative number.'}
    ]
  };
});
registerProblem('ch4', function(){
  const nf = qPick([1,2]);
  const ni = nf===1 ? qPick([2,3,4]) : qPick([3,4,5,6]);
  const dE = 13.606*(1/(nf*nf) - 1/(ni*ni));
  const lam = HC_EV_NM/dE;
  return {
    q:`Hydrogen makes the transition <b>n = ${ni} → n = ${nf}</b>. What wavelength comes out, in nanometres?`,
    answer: lam, unit:'nm', tol:0.02,
    trap:'The energy of the line is the difference between two levels, not either level on its own.',
    solution:[
      {eq:`ΔE = 13.6 (1/${nf}² − 1/${ni}²) = ${fmt(dE,4)} eV`,
       why:'Both levels are negative; the photon carries away the difference.'},
      {eq:`λ = 1240/ΔE = ${fmt(lam,1)} nm`,
       why: nf===1 ? 'The Lyman series, all of it in the ultraviolet — which is why hydrogen looks transparent.'
                   : 'The Balmer series, the one that lands in the visible and gives hydrogen its colour.'}
    ]
  };
});

/* ---------- CHAPTER 5 ---------- */
registerProblem('ch5', function(){
  const L = qPick([0.100, 0.200, 0.500, 1.00]);   // nm
  const n = qPick([1,2,3]);
  const E = n*n*HC_EV_NM*HC_EV_NM/(8*ME_C2_MEV*1e6*L*L);
  return {
    q:`An electron is trapped in a one-dimensional box <b>${fmt(L,3)} nm</b> wide. What is the energy of its <b>n = ${n}</b> level, in eV?`,
    answer: E, unit:'eV', tol:0.02,
    trap:'Both n and L appear squared. Halving the box quadruples every level.',
    solution:[
      {eq:'Eₙ = n²h²/(8mL²) = n²(hc)²/(8 mc² L²)',
       why:'Writing it with hc and mc² keeps everything in eV and nm, so no kilograms are needed.'},
      {eq:`E = ${n}² × 1240²/(8 × 511000 × ${fmt(L,3)}²) = ${fmt(E,3)} eV`,
       why:`The ground state of this box is ${fmt(HC_EV_NM*HC_EV_NM/(8*ME_C2_MEV*1e6*L*L),3)} eV and cannot be lowered — confinement alone costs that much.`}
    ]
  };
});
registerProblem('ch5', function(){
  const U = qPick([10, 12, 15]);
  const E = qPick([2, 4, 6]);
  const Lnm = qPick([0.100, 0.150, 0.200]);
  const H2_2M_EV = HC_EV_NM*HC_EV_NM/(8*Math.PI*Math.PI*ME_C2_MEV*1e6);  // ħ²/2m in eV nm²
  const k = Math.sqrt((U-E)/H2_2M_EV);        // 1/nm
  const T = 16*E*(U-E)/(U*U)*Math.exp(-2*k*Lnm);
  return {
    q:`An electron of energy <b>${E} eV</b> meets a barrier <b>${U} eV</b> high and <b>${fmt(Lnm,3)} nm</b> thick. Estimate the transmission probability with T ≈ 16E(U−E)/U² · e<sup>−2kL</sup>. Give the answer as a plain number.`,
    answer: T, unit:'', tol:0.12,
    trap:'The exponential does nearly all the work here; if you are out by orders of magnitude, check the units inside k.',
    solution:[
      {eq:`k = √(2m(U−E))/ħ = √((${U}−${E})/0.0381) = ${fmt(k,2)} nm⁻¹`,
       why:'ħ²/2m = 0.0381 eV·nm² for an electron, which is the constant that makes this arithmetic bearable.'},
      {eq:`2kL = 2 × ${fmt(k,2)} × ${fmt(Lnm,3)} = ${fmt(2*k*Lnm,2)}`,
       why:`e^(−${fmt(2*k*Lnm,2)}) = ${fmtSci(Math.exp(-2*k*Lnm),2)}. Doubling the thickness squares this.`},
      {eq:`T ≈ 16 × ${E} × ${U-E}/${U}² × ${fmtSci(Math.exp(-2*k*Lnm),2)} = ${fmtSci(T,2)}`,
       why:'The prefactor is of order one and never matters much; the exponent is the physics, which is why tunnelling rates span so many decades.'}
    ]
  };
});

/* ---------- CHAPTER 6 ---------- */
registerProblem('ch6', function(){
  const n = qPick([2,3,4,5]);
  return {
    q:`Counting spin, how many distinct quantum states does a hydrogen atom have with principal quantum number <b>n = ${n}</b>?`,
    answer: 2*n*n, unit:'states', tol:0.001,
    trap:'2n², not 2n: every value of ℓ from 0 to n−1 contributes its own 2ℓ+1 values of mℓ.',
    solution:[
      {eq:`ℓ = 0 … ${n-1}, and each ℓ has 2ℓ+1 values of mℓ`, why:'The restriction ℓ < n comes straight out of solving the radial equation.'},
      {eq:`Σ (2ℓ+1) = n² = ${n*n}`, why:'The sum of the first n odd numbers is n² — which is why the shells hold 2, 8, 18, 32.'},
      {eq:`× 2 for spin = ${2*n*n}`, why:'Spin up and spin down for each, and by the exclusion principle that is how many electrons the shell can hold.'}
    ]
  };
});
registerProblem('ch6', function(){
  const l = qPick([1,2,3,4]);
  const L = Math.sqrt(l*(l+1));
  return {
    q:`An electron is in a state with orbital quantum number <b>ℓ = ${l}</b>. What is the magnitude of its orbital angular momentum, in units of ħ?`,
    answer: L, unit:'ħ', tol:0.02,
    trap:'Not ℓ itself: the magnitude is always a little larger than the largest component, which is what stops L from ever pointing along z.',
    solution:[
      {eq:`L = √(ℓ(ℓ+1)) ħ = √(${l}×${l+1}) ħ = ${fmt(L,4)} ħ`, why:'The eigenvalue of L² is ℓ(ℓ+1)ħ², not ℓ²ħ².'},
      {eq:`largest Lz = ℓħ = ${l}ħ < ${fmt(L,4)}ħ`,
       why:'Because the magnitude always exceeds the biggest allowed component, the vector can never lie along the axis — if it did, the other two components would both be zero and known exactly.'}
    ]
  };
});

/* ---------- CHAPTER 7 ---------- */
registerProblem('ch7', function(){
  const Z = qPick([20, 26, 29, 42, 47, 74]);
  const E = 10.2*(Z-1)*(Z-1);
  return {
    q:`Use Moseley's law, E = 10.2(Z−1)² eV, to estimate the Kα X-ray energy of the element with <b>Z = ${Z}</b>. Answer in keV.`,
    answer: E/1000, unit:'keV', tol:0.03,
    trap:'The screening is a single electron — it is (Z−1)², not (Z−1) and not Z².',
    solution:[
      {eq:`E = 10.2 × (${Z}−1)² eV = ${fmt(E,0)} eV = ${fmt(E/1000,2)} keV`,
       why:'10.2 eV is ¾ × 13.6, the hydrogen n = 2 → 1 energy; the (Z−1)² scales it up.'},
      {eq:'why Z − 1', why:'The transition ends in the K shell, where one electron is still sitting. The falling electron sees the full nuclear charge minus that one — screening by a single electron, which is why Moseley\'s plot of √E against Z is so straight.'}
    ]
  };
});
registerProblem('ch7', function(){
  const l = qPick([0,1,2,3]);
  const name = ['s','p','d','f'][l];
  return {
    q:`How many electrons fit in a <b>${name}</b> subshell (ℓ = ${l})?`,
    answer: 2*(2*l+1), unit:'electrons', tol:0.001,
    trap:'2(2ℓ+1) — the 2ℓ+1 orientations each take two spins.',
    solution:[
      {eq:`mℓ = −${l} … +${l}, so 2ℓ+1 = ${2*l+1} orbitals`, why:'One state for each allowed orientation of the angular momentum.'},
      {eq:`× 2 spins = ${2*(2*l+1)}`, why:`Which is why the ${name} block of the periodic table is ${2*(2*l+1)} columns wide.`}
    ]
  };
});

/* ---------- CHAPTER 8 ---------- */
registerProblem('ch8', function(){
  const key = qPick(['H2','HCl','CO','N2','O2']);
  const md = molData(key);
  const E = 2*md.B_eV*1000;   // J = 0 -> 1 costs 2B, in meV
  return {
    q:`For <b>${md.name}</b>, how much energy does the lowest rotational transition J = 0 → 1 take? Answer in meV.`,
    answer: E, unit:'meV', tol:0.04,
    trap:'The J = 0 → 1 step costs 2B, not B: the levels go as J(J+1), so they are spaced 2B, 4B, 6B apart.',
    solution:[
      {eq:`E_J = J(J+1) ħ²/2I , with B = ħ²/2I = ${fmt(md.B_eV*1000,4)} meV`,
       why:`I = μR² with the reduced mass and the measured bond length, so nothing here is fitted.`},
      {eq:`ΔE = E₁ − E₀ = 2B = ${fmt(E,3)} meV`,
       why:`Compare kT at room temperature, 25.9 meV: this is ${fmt(25.85/E,0)} times smaller, so a warm gas is always rotating, in many levels at once.`}
    ]
  };
});
registerProblem('ch8', function(){
  const key = qPick(['H2','HCl','HBr','CO','N2','O2']);
  const md = molData(key);
  return {
    q:`The vibrational frequency of <b>${md.name}</b> is <b>${fmtSci(md.nu,3)} Hz</b>. What is one vibrational quantum, in eV?`,
    answer: md.hv, unit:'eV', tol:0.03,
    trap:'Use h = 4.136 × 10⁻¹⁵ eV·s and the answer comes out in eV directly.',
    solution:[
      {eq:`E = hν = 4.136e−15 × ${fmtSci(md.nu,3)} = ${fmt(md.hv,4)} eV`,
       why:'The oscillator levels are evenly spaced, so every vibrational step costs the same.'},
      {eq:`compare kT = 0.0259 eV`,
       why:`This is about ${fmt(md.hv/KT_ROOM,0)} times kT, so at room temperature almost every molecule sits in v = 0 — vibration is frozen out while rotation is not, and that is why the specific heat of a diatomic gas is what it is.`}
    ]
  };
});

/* ---------- CHAPTER 9 ---------- */
registerProblem('ch9', function(){
  const T = qPick([100, 300, 500, 1000]);
  const M = qPick([2, 4, 28, 32]);           // g/mol: H2, He, N2, O2
  const names = {2:'H₂', 4:'He', 28:'N₂', 32:'O₂'};
  const m = M*1e-3/6.022e23;
  const vp = Math.sqrt(2*K_B*T/m);
  return {
    q:`What is the most probable speed of a <b>${names[M]}</b> molecule (molar mass ${M} g/mol) at <b>${T} K</b>? Answer in m/s.`,
    answer: vp, unit:'m/s', tol:0.03,
    trap:'The most probable speed is √(2kT/m); the rms speed is √(3kT/m) and is about 22% larger.',
    solution:[
      {eq:`m = ${M}e−3/6.022e23 = ${fmtSci(m,3)} kg`, why:'Molar mass over Avogadro, per molecule.'},
      {eq:`v_p = √(2kT/m) = √(2 × 1.381e−23 × ${T} / ${fmtSci(m,3)}) = ${fmt(vp,0)} m/s`,
       why:`It is the peak of the distribution, not its average: v̄ = ${fmt(Math.sqrt(8*K_B*T/(Math.PI*m)),0)} m/s and v_rms = ${fmt(Math.sqrt(3*K_B*T/m),0)} m/s, all three within about 20% of each other.`}
    ]
  };
});
registerProblem('ch9', function(){
  const metals = {copper:8.5e28, silver:5.86e28, gold:5.90e28, aluminium:18.1e28};
  const name = qPick(Object.keys(metals));
  const n = metals[name];
  const EF = (HBAR*HBAR/(2*M_E))*Math.pow(3*Math.PI*Math.PI*n, 2/3)/EV_J;
  return {
    q:`<b>${name.charAt(0).toUpperCase()+name.slice(1)}</b> has <b>${fmtSci(n,3)}</b> free electrons per cubic metre. What is its Fermi energy, in eV?`,
    answer: EF, unit:'eV', tol:0.04,
    trap:'The density enters as n^(2/3), so a factor of eight in density only doubles the Fermi energy.',
    solution:[
      {eq:'E_F = (ħ²/2m)(3π²n)^(2/3)', why:'Fill states from the bottom up until the electrons run out; this is the energy of the last one in.'},
      {eq:`E_F = ${fmt(EF,2)} eV`,
       why:`kT at room temperature is 0.026 eV, about ${fmt(EF/KT_ROOM,0)} times smaller. The electron sea is effectively at zero temperature no matter how warm the metal is, which is why a metal's electrons contribute almost nothing to its specific heat.`}
    ]
  };
});

/* ---------- CHAPTER 10 ---------- */
registerProblem('ch10', function(){
  const key = qPick(['Si','Ge','GaAs','InSb','C']);
  const s = SEMI[key];
  const lam = HC_EV_NM/s.Eg;
  return {
    q:`What is the longest wavelength of light that <b>${s.name}</b> (gap ${fmt(s.Eg,2)} eV) can absorb across its gap? Answer in nanometres.`,
    answer: lam, unit:'nm', tol:0.02,
    trap:'Longest wavelength means the smallest photon energy that still works, which is exactly the gap.',
    solution:[
      {eq:`λ = hc/Eg = 1240/${fmt(s.Eg,2)} = ${fmt(lam,0)} nm`,
       why:'A photon with less energy than the gap cannot lift an electron across it and passes straight through.'},
      {eq: lam>750 ? 'infrared — so the material looks opaque to visible light and clear in the infrared'
                   : 'shorter than the visible band, so visible light passes through and the material looks transparent',
       why:'This one number decides both what a detector can see and what colour a crystal is.'}
    ]
  };
});
registerProblem('ch10', function(){
  const key = qPick(['Si','Ge','GaAs','InSb']);
  const s = SEMI[key];
  const E = qPick([100, 250, 500, 1000]);        // V/m
  const v = s.mun*1e-4*E;                        // mobility given in cm²/Vs
  return {
    q:`Electrons in <b>${s.name}</b> have mobility <b>${s.mun} cm²/V·s</b>. In a field of <b>${E} V/m</b>, what is their drift speed? Answer in m/s.`,
    answer: v, unit:'m/s', tol:0.03,
    trap:'1 cm²/V·s = 10⁻⁴ m²/V·s. Getting this factor wrong is the usual reason for being out by 10 000.',
    solution:[
      {eq:`μ = ${s.mun} cm²/V·s = ${fmtSci(s.mun*1e-4,3)} m²/V·s`, why:'Two factors of a hundred, because it is an area.'},
      {eq:`v = μE = ${fmtSci(s.mun*1e-4,3)} × ${E} = ${fmt(v,2)} m/s`,
       why:'A crawl — and yet a signal travels down the wire at nearly the speed of light, because it is the field that propagates, not the electrons.'}
    ]
  };
});

/* ---------- CHAPTER 11 ---------- */
registerProblem('ch11', function(){
  const A = qPick([16, 27, 56, 107, 197, 238]);
  const R = R0_FM*Math.pow(A,1/3);
  return {
    q:`What is the radius of a nucleus with mass number <b>A = ${A}</b>? Answer in femtometres.`,
    answer: R, unit:'fm', tol:0.02,
    trap:'A enters as a cube root, because it is the volume that is proportional to the number of nucleons.',
    solution:[
      {eq:`R = R₀A^(1/3) = 1.2 × ${A}^(1/3) = ${fmt(R,3)} fm`, why:'R₀ = 1.2 fm from electron-scattering measurements.'},
      {eq:`ρ = A/(4πR³/3) — the same for every nucleus`,
       why:'Because R goes as A^(1/3), the density is constant: nuclear matter is incompressible, which is the observation the liquid-drop model is built on.'}
    ]
  };
});
registerProblem('ch11', function(){
  const picks = [[6,12],[8,16],[26,56],[47,107],[79,197],[92,238]];
  const [Z,A] = qPick(picks);
  let row=null; for(const r of NUCLIDES) if(r[0]===Z && r[1]===A) row=r;
  if(!row) return null;
  const B = (Z*M_H_U + (A-Z)*M_N_U - row[2])*U_MEV;
  return {
    q:`The atomic mass of <b>${EL[Z]}-${A}</b> is <b>${fmt(row[2],6)} u</b>. What is its binding energy per nucleon, in MeV?`,
    answer: B/A, unit:'MeV', tol:0.03,
    trap:'Use the atomic mass of ¹H (1.007825 u), not the proton mass — that way the Z electron masses cancel.',
    solution:[
      {eq:`Δm = ${Z}(1.007825) + ${A-Z}(1.008665) − ${fmt(row[2],6)} = ${fmt(Z*M_H_U+(A-Z)*M_N_U-row[2],6)} u`,
       why:'The parts weigh more apart than together; that missing mass is the binding.'},
      {eq:`B = Δm × 931.49 = ${fmt(B,2)} MeV,  B/A = ${fmt(B/A,3)} MeV`,
       why:'Almost every nucleus lands between 7 and 9 MeV per nucleon, which is the flatness that says the nuclear force is short-ranged and saturates.'}
    ]
  };
});

/* ---------- CHAPTER 12 ---------- */
registerProblem('ch12', function(){
  const half = qPick([5.0, 12.3, 30.0, 138]);
  const nh = qPick([0.5, 1.5, 2.0, 3.5, 5.0]);
  const t = nh*half;
  const frac = Math.pow(2,-nh)*100;
  return {
    q:`A sample has a half-life of <b>${fmt(half,1)} days</b>. What percentage of it is left after <b>${fmt(t,1)} days</b>?`,
    answer: frac, unit:'%', tol:0.03,
    trap:'Halving repeatedly, not subtracting: after two half-lives a quarter is left, not nothing.',
    solution:[
      {eq:`t/T½ = ${fmt(t,1)}/${fmt(half,1)} = ${fmt(nh,2)} half-lives`, why:'Count in half-lives and the arithmetic is one power.'},
      {eq:`N/N₀ = 2^(−${fmt(nh,2)}) = ${fmt(frac,2)}%`,
       why:'Equivalently e^(−λt) with λ = 0.693/T½. The exponential never reaches zero, which is why "completely decayed" is never a date.'}
    ]
  };
});
registerProblem('ch12', function(){
  const picks = [[6,14],[19,40],[92,238],[92,235],[90,232],[11,22]];
  const [Z,A] = qPick(picks);
  let row=null; for(const r of NUCLIDES) if(r[0]===Z && r[1]===A) row=r;
  if(!row || !row[5]) return null;
  const T = row[5];
  const mass = qPick([1.0, 2.0, 5.0]);      // grams
  const N = mass/A*6.022e23;
  const lambda = Math.log(2)/T;
  const R = lambda*N;
  return {
    q:`<b>${EL[Z]}-${A}</b> has a half-life of <b>${fmtSci(T,3)} s</b>. What is the activity of <b>${fmt(mass,1)} g</b> of it, in becquerel (decays per second)?`,
    answer: R, unit:'Bq', tol:0.04,
    trap:'Activity is λN, and λ = ln2/T½ — using 1/T½ instead leaves you 44% low.',
    solution:[
      {eq:`N = (${fmt(mass,1)}/${A}) × 6.022e23 = ${fmtSci(N,3)} nuclei`, why:'Moles times Avogadro.'},
      {eq:`λ = ln2/T½ = ${fmtSci(lambda,3)} s⁻¹`, why:'The decay constant is the chance per nucleus per second.'},
      {eq:`R = λN = ${fmtSci(R,3)} Bq`,
       why:'Note that a long half-life means a small activity for the same amount of material — the two are inverse, which is why the most radioactive samples are the shortest-lived ones.'}
    ]
  };
});

/* ---------- CHAPTER 13 ---------- */
registerProblem('ch13', function(){
  const key = qPick(['mu-','pi+','tau-','pi0']);
  const p = P13[key];
  const beta = qPick([0.900, 0.950, 0.990, 0.999]);
  const g = 1/Math.sqrt(1-beta*beta);
  const d = g*beta*C*p.tau;
  return {
    q:`A <b>${p.sym}</b> (mean life ${fmtSci(p.tau,3)} s) travels at <b>${fmt(beta,3)}c</b>. How far does it get, on average, before decaying? Answer in metres.`,
    answer: d, unit:'m', tol:0.04,
    trap:'The mean life is measured in the particle\'s own frame, so the lab distance carries a factor of γ as well as β.',
    solution:[
      {eq:`γ = 1/√(1 − ${fmt(beta,3)}²) = ${fmt(g,3)}`, why:'The same γ as Chapter 1; nothing about particle physics is new here.'},
      {eq:`d = γβcτ = ${fmt(g,3)} × ${fmt(beta,3)} × 3e8 × ${fmtSci(p.tau,3)} = ${fmtSci(d,3)} m`,
       why:'Without the γ you would predict ' + fmtSci(beta*C*p.tau,3) + ' m. That difference is exactly how cosmic-ray muons, made 15 km up, reach the ground at all.'}
    ]
  };
});
registerProblem('ch13', function(){
  const combos = [
    {q:'uud', name:'the proton'}, {q:'udd', name:'the neutron'},
    {q:'uus', name:'the Σ⁺'},     {q:'dds', name:'the Σ⁻'},
    {q:'uss', name:'the Ξ⁰'},     {q:'sss', name:'the Ω⁻'}
  ];
  const c = qPick(combos);
  // 2/3 − 1/3 − 1/3 does not come out as exactly zero in floating point, and
  // an answer of 1.1e−16 would be printed as if it meant something
  const chg = Math.round(c.q.split('').reduce((a,x)=>a+QUARKS[x].q, 0) * 3) / 3;
  return {
    q:`<b>${c.name}</b> is made of <b>${c.q}</b>. What is its charge, in units of e?`,
    answer: chg, unit:'e', tol:0.03,
    trap:'u carries +2/3 and both d and s carry −1/3; the three must add to a whole number, which is the check.',
    solution:[
      {eq:c.q.split('').map(x=>`${x} = ${x==='u'?'+2/3':'−1/3'}`).join(' , '), why:'Two flavours of charge among the light quarks, and that is all there is to it.'},
      {eq:`total = ${fmt(chg,3)} e`,
       why:'Every combination of three quarks that occurs in nature comes out with an integer charge. That is not an accident of this table — it is the reason free quarks, with their thirds, are never seen on their own.'}
    ]
  };
});
