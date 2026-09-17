/* =====================================================================
   Concepts of Modern Physics — check yourself
   Every question picks its own numbers and works the answer out with the
   same constants, formulas and tables the modules use, so nothing here
   can drift away from the page beside it. The wrong options are not
   noise: each one is a specific mistake people actually make, and says
   so when you pick it.
   ===================================================================== */

/* =====================================================================
   CHAPTER 1 — RELATIVITY
   ===================================================================== */
registerQuiz('ch1', function(){
  const beta = qPick([0.6,0.8,0.9,0.95]);
  const g = 1/Math.sqrt(1-beta*beta);
  const t0 = qPick([1,2,5]);
  return {
    q: `A clock aboard a ship moving past you at ${beta}c ticks off <b>${t0} s</b> of its own time. How much of <em>your</em> time passes?`,
    opts: [
      {t:`${fmt(g*t0,3)} s`, ok:true,
       why:`Δt = γΔt₀ with γ = ${fmt(g,3)}. The moving clock runs slow, so more of your time has to pass for each of its seconds.`},
      {t:`${fmt(t0/g,3)} s`, ok:false,
       why:'This divides by γ instead of multiplying, which would make the moving clock run fast. Ask which clock measures the two ticks at the same place — that one reads the proper time, and it is the smaller number.'},
      {t:`${fmt(t0*(1-beta*beta),3)} s`, ok:false,
       why:'This is 1−β² without its square root. The Lorentz factor is 1/√(1−β²), not 1−β².'},
      {t:`${fmt(t0,3)} s`, ok:false,
       why:'This is the answer if time were absolute — exactly what the light-clock argument rules out once c is the same for everyone.'}
    ]
  };
});
registerQuiz('ch1', function(){
  const L0 = qPick([1,2,10]);
  const beta = qPick([0.6,0.8,0.99]);
  const g = 1/Math.sqrt(1-beta*beta);
  return {
    q: `A rod is <b>${L0} m</b> long at rest. It flies past you at ${beta}c, pointing along its direction of motion. How long do you measure it?`,
    opts: [
      {t:`${fmt(L0/g,4)} m`, ok:true,
       why:`L = L₀/γ = L₀√(1−β²) = ${fmt(L0/g,4)} m. The rod is shortest in the frame where it is moving.`},
      {t:`${fmt(L0*g,4)} m`, ok:false,
       why:'Multiplying by γ stretches the rod. Length contracts; only time dilates.'},
      {t:`${fmt(L0,4)} m`, ok:false,
       why:'That is the proper length, measured in the rod\'s own frame. You are not in it.'},
      {t:`${fmt(L0*(1-beta*beta),4)} m`, ok:false,
       why:'Square root missing again: the factor is √(1−β²), not 1−β².'}
    ]
  };
});
registerQuiz('ch1', function(){
  const beta = qPick([0.9,0.95,0.99]);
  const g = 1/Math.sqrt(1-beta*beta);
  return {
    q: `A particle moves at ${beta}c. By what factor does the classical ½mv² <em>understate</em> its true kinetic energy?`,
    opts: [
      {t:`${fmt((g-1)/(0.5*beta*beta),2)}×`, ok:true,
       why:`KE = (γ−1)mc² = ${fmt(g-1,3)}mc², while ½mv² = ${fmt(0.5*beta*beta,3)}mc². Classical mechanics is not slightly wrong here, it is wrong by a factor of ${fmt((g-1)/(0.5*beta*beta),2)}.`},
      {t:`${fmt(g,2)}×`, ok:false,
       why:'γ alone is not the ratio. The relativistic kinetic energy is (γ−1)mc², not γmc² — the rest energy is not kinetic.'},
      {t:'exactly 2×', ok:false,
       why:'The gap is not a fixed factor: it grows without limit as β approaches 1, and vanishes as β approaches 0.'},
      {t:'it does not — they agree at every speed', ok:false,
       why:'They agree only in the limit β → 0. Expanding (γ−1)mc² for small β gives ½mv² as its first term.'}
    ]
  };
});

/* =====================================================================
   CHAPTER 2 — PARTICLE PROPERTIES OF WAVES
   ===================================================================== */
registerQuiz('ch2', function(){
  const lam = qPick([200,250,300,400]);
  const phi = qPick([2.30,2.90,4.08]);
  const E = HC_EV_NM/lam;
  const KE = E-phi;
  return {
    q: `Light of <b>${lam} nm</b> falls on a metal whose work function is <b>${fmt(phi,2)} eV</b>. What is the maximum kinetic energy of the electrons that come off?`,
    opts: [
      {t: KE>0 ? `${fmt(KE,3)} eV` : 'no electrons come off at all', ok:true,
       why: KE>0
         ? `hν = 1240/${lam} = ${fmt(E,3)} eV, and KE_max = hν − φ = ${fmt(KE,3)} eV. The work function is the toll for getting out, paid once.`
         : `hν = ${fmt(E,3)} eV is less than the ${fmt(phi,2)} eV work function, so no electron can escape however bright the light is.`},
      {t:`${fmt(E,3)} eV`, ok:false,
       why:'That is the whole photon energy. Some of it is spent freeing the electron from the metal; only the remainder is kinetic.'},
      {t:`${fmt(E+phi,3)} eV`, ok:false,
       why:'The work function is subtracted, not added — it is a cost, not a bonus.'},
      {t:'it depends on how bright the light is', ok:false,
       why:'Brightness sets how many electrons come out per second, not how fast each one goes. That split is the whole reason the photoelectric effect needed photons.'}
    ]
  };
});
registerQuiz('ch2', function(){
  const th = qPick([45,90,180]);
  const d = LAMBDA_C_PM*(1-Math.cos(th*Math.PI/180));
  const lam0 = qPick([10,50,100]);
  return {
    q: `An X-ray photon of wavelength <b>${lam0} pm</b> Compton-scatters through <b>${th}°</b>. By how much does its wavelength change?`,
    opts: [
      {t:`${fmt(d,3)} pm`, ok:true,
       why:`Δλ = λ_C(1−cos θ) = ${fmt(LAMBDA_C_PM,3)} × ${fmt(1-Math.cos(th*Math.PI/180),3)} = ${fmt(d,3)} pm. Notice the incident wavelength never enters.`},
      {t:`${fmt(2*d,3)} pm`, ok:false,
       why:'Twice too much — check the factor in Δλ = λ_C(1−cos θ); there is no 2 in it.'},
      {t:'zero — scattering cannot change a photon\'s wavelength', ok:false,
       why:'That is the classical expectation, and it is what Compton\'s experiment disproved. The photon gives recoil energy to the electron and comes away redder.'},
      {t:`${fmt(lam0*(1-Math.cos(th*Math.PI/180)),3)} pm`, ok:false,
       why:'This uses the incident wavelength where the electron\'s Compton wavelength belongs. λ_C = h/m_ec = 2.426 pm is a property of the electron, not of the light.'}
    ]
  };
});
registerQuiz('ch2', function(){
  const T = qPick([3000,5800,10000]);
  const lp = (WIEN_B/T)*1e9;
  return {
    q: `A blackbody at <b>${T} K</b>. Where does its spectrum peak?`,
    opts: [
      {t:`${fmt(lp,0)} nm`, ok:true,
       why:`Wien: λ_peak = 2.898×10⁻³/T = ${fmt(lp,0)} nm — ${lp<380?'in the ultraviolet':(lp<=750?'in the visible':'in the infrared')}. Hotter bodies peak bluer.`},
      {t:`${fmt(lp*2,0)} nm`, ok:false,
       why:'This is the peak for half that temperature. λ_peak T is a fixed constant, so twice the wavelength means half the temperature.'},
      {t:`${fmt(lp/2,0)} nm`, ok:false,
       why:'This is the peak for twice that temperature. The direction is right — hotter is bluer — but the arithmetic has gone one step too far.'},
      {t:'it peaks at the shortest wavelength available', ok:false,
       why:'That is the Rayleigh–Jeans prediction — the ultraviolet catastrophe. Planck\'s quantisation turns the curve over and puts the peak at a finite wavelength.'}
    ]
  };
});

/* =====================================================================
   CHAPTER 3 — WAVE PROPERTIES OF PARTICLES
   ===================================================================== */
registerQuiz('ch3', function(){
  const V = qPick([54,100,200]);
  const lam_pm = HC_EV_PM/Math.sqrt(Math.pow(V+511e3,2)-Math.pow(511e3,2));
  return {
    q: `An electron is accelerated through <b>${V} V</b> from rest. What is its de Broglie wavelength?`,
    opts: [
      {t:`${fmt(lam_pm,1)} pm`, ok:true,
       why:`λ = h/p with p from KE = ${V} eV, giving ${fmt(lam_pm,1)} pm — comparable with atomic spacings, which is exactly why electrons diffract off a crystal.`},
      {t:`${fmt(HC_EV_PM/V,1)} pm`, ok:false,
       why:'This uses λ = hc/E, which is the relation for a photon. A massive particle has E² = (pc)² + (mc²)², so its momentum is not E/c.'},
      {t:`${fmt(lam_pm*10,1)} pm`, ok:false,
       why:'An order of magnitude too long. At this energy the electron wavelength is tens of picometres, not hundreds.'},
      {t:'an electron has no wavelength — only light does', ok:false,
       why:'Davisson and Germer settled that: electrons at this energy diffract off nickel exactly as a wave of this wavelength would.'}
    ]
  };
});
registerQuiz('ch3', function(){
  const beta = qPick([0.5,0.6,0.8]);
  return {
    q: `A particle moves at <b>${beta}c</b>. Its de Broglie phase velocity works out to c²/v — faster than light. What does that mean?`,
    opts: [
      {t:'nothing travels that fast; the particle goes at the group velocity, which is v', ok:true,
       why:`v_p = c²/v = ${fmt(1/beta,3)}c and v_g = ${beta}c, and v_p·v_g = c² always. A single crest carries no information — only the packet's envelope does, and it moves at exactly the particle's speed.`},
      {t:'relativity is violated, which is why de Broglie waves are only a calculating device', ok:false,
       why:'No signal outruns light here. A phase velocity above c is routine — it happens in a waveguide too — because a crest of an endless wave carries nothing.'},
      {t:'the particle really does travel at c²/v', ok:false,
       why:'The particle travels at the group velocity. The phase velocity belongs to the individual crests inside the packet, which slide forward through it.'},
      {t:'the phase velocity is always less than c for a massive particle', ok:false,
       why:'The opposite: for a massive particle v < c, so c²/v > c always. It is the group velocity that stays below c.'}
    ]
  };
});
registerQuiz('ch3', function(){
  const dxnm = qPick([0.1,0.5,1.0]);
  const dp = HBAR/(2*dxnm*1e-9);
  const dv = dp/M_E;
  return {
    q: `An electron is known to be inside a region <b>${dxnm} nm</b> across. What is the least uncertainty in its speed?`,
    opts: [
      {t:`${fmtSci(dv,2)} m/s`, ok:true,
       why:`Δp ≥ ℏ/2Δx gives Δp = ${fmtSci(dp,2)} kg·m/s, so Δv = Δp/m = ${fmtSci(dv,2)} m/s. Confining a light particle costs a lot of momentum spread, which is why electrons cannot sit still inside a nucleus.`},
      {t:'zero — position and speed can both be known exactly', ok:false,
       why:'That is the classical assumption. Δx·Δp ≥ ℏ/2 is not a limit of our instruments but of what "position" and "momentum" can simultaneously mean.'},
      {t:`${fmtSci(dv/1000,2)} m/s`, ok:false,
       why:'Three orders of magnitude too small — check the powers of ten in ℏ/2mΔx.'},
      {t:'it depends on how carefully you measure', ok:false,
       why:'It does not. This is the floor that remains after every experimental error has been removed.'}
    ]
  };
});

/* =====================================================================
   CHAPTER 4 — ATOMIC STRUCTURE
   ===================================================================== */
registerQuiz('ch4', function(){
  const n = qPick([2,3,4,5]);
  const E = -13.6/(n*n);
  return {
    q: `What is the energy of the <b>n = ${n}</b> level of hydrogen?`,
    opts: [
      {t:`${fmt(E,3)} eV`, ok:true,
       why:`E_n = −13.6/n² = ${fmt(E,3)} eV. Negative because the electron is bound: that much energy must be supplied to free it.`},
      {t:`${fmt(-13.6/n,3)} eV`, ok:false,
       why:'The dependence is 1/n², not 1/n. That square is why the levels crowd together so fast as n grows.'},
      {t:`${fmt(+13.6/(n*n),3)} eV`, ok:false,
       why:'The sign matters. A bound state sits below the free-electron energy, which is taken as zero.'},
      {t:`${fmt(-13.6*n*n,3)} eV`, ok:false,
       why:'This makes higher levels more tightly bound, which is backwards — outer electrons are easier to remove, not harder.'}
    ]
  };
});
registerQuiz('ch4', function(){
  const pairs = [[3,2,'Balmer α'],[4,2,'Balmer β'],[2,1,'Lyman α'],[3,1,'Lyman β']];
  const [ni,nf,name] = qPick(pairs);
  const dE = 13.6*(1/(nf*nf)-1/(ni*ni));
  const lam = HC_EV_NM/dE;
  return {
    q: `A hydrogen atom drops from <b>n = ${ni}</b> to <b>n = ${nf}</b>. What wavelength comes out?`,
    opts: [
      {t:`${fmt(lam,0)} nm`, ok:true,
       why:`ΔE = 13.6(1/${nf}² − 1/${ni}²) = ${fmt(dE,3)} eV, and λ = 1240/ΔE = ${fmt(lam,0)} nm — the ${name} line, ${lam<380?'in the ultraviolet':(lam<=750?'visible':'in the infrared')}.`},
      {t:`${fmt(HC_EV_NM/(13.6/(ni*ni)),0)} nm`, ok:false,
       why:'This uses the energy of the upper level alone. What is emitted is the difference between two levels, not the depth of one.'},
      {t:`${fmt(HC_EV_NM/(13.6*(1/nf-1/ni)),0)} nm`, ok:false,
       why:'The 1/n² has become 1/n. The Rydberg formula squares the quantum numbers.'},
      {t:`${fmt(lam/2,0)} nm`, ok:false,
       why:'A factor of two out. Work ΔE in eV and use λ(nm) = 1240/ΔE(eV) as a check.'}
    ]
  };
});
registerQuiz('ch4', function(){
  return {
    q: 'Why does a classical orbiting electron make the atom impossible?',
    opts: [
      {t:'an accelerating charge radiates, so it would spiral into the nucleus in about 10⁻¹¹ s', ok:true,
       why:'Circular motion is acceleration, and accelerated charges radiate. The orbit loses energy continuously and collapses almost instantly — and on the way it would emit a smear of frequencies, not the sharp lines actually seen.'},
      {t:'the electron would be attracted to the nucleus and stick to it immediately', ok:false,
       why:'Attraction alone is fine — planets orbit the Sun without falling in. The fatal problem is radiation, which has no gravitational counterpart.'},
      {t:'the electron would move faster than light', ok:false,
       why:'A Bohr-orbit electron moves at about c/137, comfortably below c. Speed is not the difficulty.'},
      {t:'the exclusion principle forbids it', ok:false,
       why:'The exclusion principle governs several electrons sharing states. One electron in hydrogen would still spiral in.'}
    ]
  };
});

/* =====================================================================
   CHAPTER 5 — QUANTUM MECHANICS
   ===================================================================== */
registerQuiz('ch5', function(){
  const L = qPick([0.1,0.2,0.5]);
  const n = qPick([2,3]);          // n = 1 would make the ground-state distractor the answer
  const E = n*n*Math.PI*Math.PI*H2_2M/(L*L);
  return {
    q: `An electron is trapped in a rigid box <b>${L} nm</b> wide. What is its <b>n = ${n}</b> energy?`,
    opts: [
      {t:`${fmt(E,3)} eV`, ok:true,
       why:`E_n = n²π²ℏ²/2mL² = ${fmt(E,3)} eV. Squeezing the box raises every level as 1/L², which is the whole reason small things have large energies.`},
      {t:`${fmt(E/(n*n),3)} eV`, ok:false,
       why:`That is the ground state. The levels go as n², so n = ${n} sits ${n*n}× higher.`},
      {t:`${fmt(E*L,3)} eV`, ok:false,
       why:'The width enters as 1/L², not as a multiplier. Narrower box, higher energy.'},
      {t:'zero, if it is sitting still', ok:false,
       why:'It cannot sit still. n = 0 would make ψ vanish everywhere, so the lowest allowed energy is not zero — that is the zero-point energy, forced by the uncertainty principle.'}
    ]
  };
});
registerQuiz('ch5', function(){
  const f = qPick([2,3]);
  return {
    q: `A particle tunnels through a barrier with probability T. You make the barrier <b>${f}× wider</b>, changing nothing else. Roughly what happens to T?`,
    opts: [
      {t:`it is raised to the power ${f} — T becomes about T${f===2?'²':'³'}`, ok:true,
       why:`T ≈ e^(−2k₂L), so ${f}× the width means ${f}× the exponent, and T^${f}. A transmission of 10⁻³ becomes 10⁻${3*f}: tunnelling dies exponentially with width, which is why an STM can resolve a single atomic step.`},
      {t:`it falls by a factor of ${f}`, ok:false,
       why:'The fall is exponential in the width, not proportional to it. That distinction is the difference between a microscope that works and one that does not.'},
      {t:`it falls by a factor of ${f*f}`, ok:false,
       why:'Still a power law. The exponent is what scales with L, so the probability itself gets raised to a power.'},
      {t:'nothing — T depends only on the barrier height', ok:false,
       why:'Height and width both matter, and they appear together in k₂L.'}
    ]
  };
});
registerQuiz('ch5', function(){
  return {
    q: 'A particle is in a stationary state. Why does its probability density not change with time?',
    opts: [
      {t:'the time factor is a phase e^(−iEt/ℏ), and multiplying by its conjugate cancels it', ok:true,
       why:'ψ does change with time — it rotates in phase — but |ψ|² = ψ*ψ removes that rotation exactly. This is why an atom in one energy level does not radiate, and why radiation needs a superposition of two.'},
      {t:'the wave function is genuinely constant in time', ok:false,
       why:'It is not: ψ carries e^(−iEt/ℏ) and keeps turning. Only the observable density is steady.'},
      {t:'the particle is at rest', ok:false,
       why:'Not at all — the box ground state has energy and momentum spread. "Stationary" refers to the probability distribution, not the particle.'},
      {t:'because energy is conserved', ok:false,
       why:'Energy conservation holds in a superposition too, and there the density does oscillate — at the frequency of the gap between the two levels.'}
    ]
  };
});

/* =====================================================================
   CHAPTER 6 — THE HYDROGEN ATOM
   ===================================================================== */
registerQuiz('ch6', function(){
  const n = qPick([2,3,4]);
  return {
    q: `How many distinct quantum states does hydrogen have with principal quantum number <b>n = ${n}</b>, counting spin?`,
    opts: [
      {t:`${2*n*n}`, ok:true,
       why:`For each n, ℓ runs 0…${n-1}; each ℓ has 2ℓ+1 values of m_ℓ, summing to n² = ${n*n}; and spin doubles it to ${2*n*n}. That count is exactly the length of each period of the periodic table.`},
      {t:`${n*n}`, ok:false,
       why:'This is the orbital count with spin forgotten. Every spatial state holds two electrons, one of each spin.'},
      {t:`${2*(2*n-1)}`, ok:false,
       why:`That is the capacity of the largest subshell on its own, ℓ = ${'${n-1}'}. The question asks for every state with this n, so all the smaller ℓ have to be added too.`},
      {t:`${n}`, ok:false,
       why:'This counts only the values of ℓ. Each of those carries its own set of m_ℓ values.'}
    ]
  };
});
registerQuiz('ch6', function(){
  const l = qPick([1,2,3]);
  const L = Math.sqrt(l*(l+1));
  return {
    q: `An electron has orbital quantum number <b>ℓ = ${l}</b>. What is the magnitude of its angular momentum?`,
    opts: [
      {t:`${fmt(L,3)}ℏ`, ok:true,
       why:`|L| = √(ℓ(ℓ+1))ℏ = ${fmt(L,3)}ℏ, which is strictly larger than the largest measurable component, ℓℏ = ${l}ℏ. The vector can never line up fully with any axis — if it did, both other components would be zero and known.`},
      {t:`${l}ℏ`, ok:false,
       why:`That is the maximum of L_z, not the magnitude. |L| = √(ℓ(ℓ+1))ℏ = ${fmt(L,3)}ℏ is always the bigger of the two.`},
      {t:`${fmt(l*l,3)}ℏ`, ok:false,
       why:'The square root is missing: it is √(ℓ(ℓ+1)), not ℓ².'},
      {t:`${fmt(l+1,3)}ℏ`, ok:false,
       why:'Close in form but wrong: the product ℓ(ℓ+1) sits under a square root.'}
    ]
  };
});
registerQuiz('ch6', function(){
  return {
    q: 'Why is a 3s → 2s transition never seen in hydrogen, even though it would release a perfectly good amount of energy?',
    opts: [
      {t:'the photon carries one unit of angular momentum, so ℓ has to change by one', ok:true,
       why:'Δℓ = ±1 is not a rule about energy but about bookkeeping: the emitted photon has spin 1, and the atom must supply that. Both s states have ℓ = 0, so there is nowhere for the photon\'s angular momentum to come from.'},
      {t:'the two states have the same energy, so no photon is possible', ok:false,
       why:'They do not: in hydrogen E depends on n, so 3s lies well above 2s. Energy is available; angular momentum is not.'},
      {t:'s states cannot radiate at all', ok:false,
       why:'They can — 2s → 1s is forbidden for the same reason, but 3s → 2p is perfectly allowed and does happen.'},
      {t:'the exclusion principle forbids it', ok:false,
       why:'Hydrogen has one electron, so the exclusion principle has nothing to act on here.'}
    ]
  };
});

/* =====================================================================
   CHAPTER 7 — MANY-ELECTRON ATOMS
   ===================================================================== */
registerQuiz('ch7', function(){
  const Z = qPick([11,13,17,19,20]);
  const right = configString(Z);
  const others = [Z-1,Z+1,Z+2].filter(z=>z>=1&&z<=54).map(z=>configString(z));
  return {
    q: `What is the ground-state configuration of <b>${ELEM[Z]}</b> (Z = ${Z})?`,
    opts: [
      {t:right, ok:true,
       why:`Electrons fill in order of increasing n + ℓ, and for ties, increasing n. That puts ${ELEM[Z]}'s ${Z} electrons here — and the outermost subshell is what fixes its chemistry.`},
      {t:others[0], ok:false, why:`That is ${ELEM[Z-1]}, one electron short.`},
      {t:others[1]||configString(2), ok:false, why:`That configuration holds a different number of electrons than ${Z}. Count them: they must add up to Z.`},
      {t:others[2]||configString(3), ok:false, why:'Wrong electron count again — the superscripts have to sum to Z.'}
    ]
  };
});
registerQuiz('ch7', function(){
  const l = qPick([1,2,3]);        // an s subshell holds 2, colliding with the last option
  const cap = 2*(2*l+1);
  return {
    q: `How many electrons fit in an <b>${ORB[l]}</b> subshell?`,
    opts: [
      {t:`${cap}`, ok:true,
       why:`2(2ℓ+1) = ${cap}: there are ${2*l+1} values of m_ℓ, each taking two spins. No two electrons may share all four quantum numbers, and that is the only reason matter takes up space.`},
      {t:`${2*l+1}`, ok:false, why:'This forgets spin. Each spatial orbital holds two electrons, not one.'},
      {t:`${2*(l+1)}`, ok:false, why:'The count of m_ℓ values is 2ℓ+1, not ℓ+1 — it runs from −ℓ to +ℓ inclusive.'},
      {t:'2, always', ok:false, why:'Two per orbital, but a subshell with ℓ > 0 has several orbitals.'}
    ]
  };
});

/* =====================================================================
   CHAPTER 8 — MOLECULES
   ===================================================================== */
registerQuiz('ch8', function(){
  const key = qPick(['CO','HCl','H2','O2']);
  const md = molData(key);
  return {
    q: `In the rotational spectrum of <b>${md.name}</b>, neighbouring lines are evenly spaced. What does that spacing tell you?`,
    opts: [
      {t:'the bond length, through the moment of inertia', ok:true,
       why:`Lines sit 2B apart with B = ℏ²/2I, so measuring the spacing (${fmtSci(2*md.B_eV,2)} eV here) gives I, and I = μR² gives R = ${fmt(md.R,4)} nm. Microwave spectroscopy is a ruler for molecules.`},
      {t:'the stiffness of the bond', ok:false,
       why:'That comes from the vibrational spacing, hν₀ = ℏ√(k/μ). Rotation is about how the mass is distributed, not how hard the bond resists stretching.'},
      {t:'the dissociation energy', ok:false,
       why:'The depth of the well is a separate quantity; the rotational spacing knows nothing about it.'},
      {t:'the temperature of the gas', ok:false,
       why:'Temperature sets which lines are <em>bright</em> — the envelope of the band — but not how far apart they are.'}
    ]
  };
});
registerQuiz('ch8', function(){
  return {
    q: 'Electronic, vibrational and rotational energies in a molecule are typically in what proportion?',
    opts: [
      {t:'electronic ≫ vibrational ≫ rotational, each about a hundredfold apart', ok:true,
       why:'Roughly eV, then tenths of an eV, then thousandths. That is why each kind of transition has its own instrument — ultraviolet, infrared, microwave — and why a single electronic band contains vibrational structure containing rotational structure.'},
      {t:'they are all comparable', ok:false,
       why:'If they were, molecular spectra would be an unresolvable mess. Their separation is exactly what makes the subject tractable.'},
      {t:'rotational ≫ vibrational ≫ electronic', ok:false,
       why:'Exactly upside down. Rotational quanta are the smallest — small enough to be fully excited at room temperature.'},
      {t:'vibrational ≫ electronic ≫ rotational', ok:false,
       why:'Electronic transitions are the largest by far; they are what put molecules into the visible and ultraviolet.'}
    ]
  };
});

/* =====================================================================
   CHAPTER 9 — STATISTICAL MECHANICS
   ===================================================================== */
registerQuiz('ch9', function(){
  const a = qPick(['H2','He','N2','O2']), b = qPick(['CO2','Xe','O2','N2']);
  if(GASES[a].M === GASES[b].M) return null;
  const ratio = Math.sqrt(GASES[b].M/GASES[a].M);
  return {
    q: `At the same temperature, how do the rms speeds of <b>${GASES[a].name}</b> and <b>${GASES[b].name}</b> compare?`,
    opts: [
      {t:`${GASES[a].name} is ${fmt(ratio,2)}× faster`, ok:true,
       why:`v_rms = √(3kT/m), so the ratio is √(M_${GASES[b].name}/M_${GASES[a].name}) = √(${fmt(GASES[b].M,1)}/${fmt(GASES[a].M,1)}) = ${fmt(ratio,2)}. Equal temperature means equal average kinetic energy, so the lighter molecule must move faster.`},
      {t:`${GASES[a].name} is ${fmt(GASES[b].M/GASES[a].M,2)}× faster`, ok:false,
       why:'This uses the mass ratio directly. Speed goes as the square root of it, because it is the energy that is shared equally, not the speed.'},
      {t:'they are the same — temperature fixes the speed', ok:false,
       why:'Temperature fixes the mean kinetic energy, ½mv². At the same energy a heavier molecule is slower.'},
      {t:`${GASES[b].name} is ${fmt(ratio,2)}× faster`, ok:false,
       why:'The wrong way round: the heavier gas is the slower one.'}
    ]
  };
});
registerQuiz('ch9', function(){
  return {
    q: 'In the Maxwell–Boltzmann distribution, how do the most probable, mean and rms speeds rank?',
    opts: [
      {t:'v_p < v̄ < v_rms', ok:true,
       why:'√(2kT/m) < √(8kT/πm) < √(3kT/m). The distribution has a long tail to the right, and each successive average weights that tail more heavily — v_rms/v̄ = √(3π/8) = 1.085 always, whatever the gas or temperature.'},
      {t:'they are all equal', ok:false,
       why:'They would be for a symmetric distribution. This one is skewed: there is no upper limit on speed but a hard floor at zero.'},
      {t:'v_rms < v̄ < v_p', ok:false,
       why:'Reversed. Squaring before averaging gives the fast tail extra weight, so v_rms comes out largest.'},
      {t:'it depends on the temperature', ok:false,
       why:'The ordering is fixed: all three scale as √T together, so their ratios never change.'}
    ]
  };
});

/* =====================================================================
   CHAPTER 10 — THE SOLID STATE
   ===================================================================== */
registerQuiz('ch10', function(){
  return {
    q: 'In a copper wire carrying a current, electrons move at about 10⁶ m/s, yet the drift velocity is well under a millimetre per second. How can both be true?',
    opts: [
      {t:'the fast motion is random, and the field adds only a tiny systematic lean to it', ok:true,
       why:'The Fermi speed is set by the electron density and the exclusion principle, and is there with or without a field. The field biases each free flight slightly, and averaged over all the electrons that bias is the drift — some ten orders of magnitude smaller.'},
      {t:'only a very small fraction of the electrons actually move', ok:false,
       why:'Essentially all the conduction electrons take part. It is not that few move, but that their motion very nearly cancels.'},
      {t:'the drift velocity is what each electron does between collisions', ok:false,
       why:'Between collisions an electron moves at roughly the Fermi speed. The drift is the leftover average after the random parts cancel.'},
      {t:'the signal travels at the drift velocity', ok:false,
       why:'If it did, a light would take hours to come on. The field propagates through the wire at nearly the speed of light; the electrons themselves barely crawl.'}
    ]
  };
});
registerQuiz('ch10', function(){
  const k = qPick(Object.keys(SEMI));
  const s = SEMI[k];
  return {
    q: `<b>${s.name}</b> has a band gap of <b>${fmt(s.Eg,2)} eV</b>. Warm it up and what happens to its conductivity?`,
    opts: [
      {t:'it rises steeply — roughly as e^(−E_g/2kT)', ok:true,
       why:'Carriers have to be lifted across the gap, and the number that make it is governed by the exponential tail of the Fermi–Dirac distribution. That is the opposite of a metal, whose resistance rises with temperature as the lattice vibrates harder.'},
      {t:'it falls, as in a metal', ok:false,
       why:'A metal already has its carriers and only gains more scattering. A semiconductor gains carriers exponentially, and that wins easily.'},
      {t:'it does not change — the gap is fixed', ok:false,
       why:'The gap barely changes, but the occupancy of the states above it changes enormously with temperature.'},
      {t:'it rises in proportion to the temperature', ok:false,
       why:'Not proportional but exponential: it is the Boltzmann factor that governs the carrier count, which is why a modest warming can change conductivity by orders of magnitude.'}
    ]
  };
});

/* =====================================================================
   CHAPTER 11 — NUCLEAR STRUCTURE
   ===================================================================== */
registerQuiz('ch11', function(){
  const A1 = qPick([8,27,64]), A2 = qPick([125,216,1000]);
  const r = Math.pow(A2/A1,1/3);
  return {
    q: `Nucleus A has <b>${A1}</b> nucleons and nucleus B has <b>${A2}</b>. How do their radii compare?`,
    opts: [
      {t:`B is ${fmt(r,2)}× the radius of A`, ok:true,
       why:`R = 1.2A^⅓ fm, so the ratio is (${A2}/${A1})^⅓ = ${fmt(r,2)}. Radius going as the cube root of A means the density is the same for every nucleus — about 2.3×10¹⁷ kg/m³, whatever it is made of.`},
      {t:`B is ${fmt(A2/A1,1)}× the radius of A`, ok:false,
       why:'That is the ratio of volumes, not radii. Nuclear matter is incompressible, so volume goes as A and radius as A^⅓.'},
      {t:`B is ${fmt(Math.sqrt(A2/A1),2)}× the radius of A`, ok:false,
       why:'A square root instead of a cube root. Nuclei are three-dimensional.'},
      {t:'they are the same size', ok:false,
       why:'Nuclei of different mass have genuinely different sizes; it is their <em>density</em> that is constant.'}
    ]
  };
});
registerQuiz('ch11', function(){
  return {
    q: 'Binding energy per nucleon peaks near iron. What follows from that?',
    opts: [
      {t:'both fusing light nuclei and splitting heavy ones release energy', ok:true,
       why:'Anything that moves nucleons toward the peak liberates the difference. Below iron, fusion pays; above it, fission does; at iron, neither — which is why iron is where stellar burning stops and why supernovae are needed to make anything heavier.'},
      {t:'iron is the most abundant element in the universe', ok:false,
       why:'Hydrogen is, by a long way. Being most tightly bound and being most common are different things.'},
      {t:'only fission releases energy', ok:false,
       why:'Fusion releases about four times as much per unit mass, which is why the Sun works and why fusion power is worth pursuing.'},
      {t:'iron nuclei cannot be split at all', ok:false,
       why:'They can be — it just costs energy rather than releasing it.'}
    ]
  };
});

/* =====================================================================
   CHAPTER 12 — NUCLEAR TRANSFORMATIONS
   ===================================================================== */
registerQuiz('ch12', function(){
  const n = qPick([2,3,4,5]);
  const f = Math.pow(0.5,n);
  return {
    q: `A radioactive sample is left for <b>${n} half-lives</b>. What fraction of the original nuclei survives?`,
    opts: [
      {t:`${fmt(f*100,2)}%  (1/${Math.pow(2,n)})`, ok:true,
       why:`Each half-life removes half of whatever is left, so ${n} of them leave (½)^${n} = 1/${Math.pow(2,n)}. The decay never quite finishes, because the fraction is halved rather than a fixed number being removed.`},
      {t:`${fmt(100/(n+1),1)}%`, ok:false,
       why:'The decay is exponential, not a division into equal parts. Two half-lives leave a quarter, not a third.'},
      {t:'0% — it is all gone after two half-lives', ok:false,
       why:'"Half-life" is not a lifetime after which everything has gone. Halving repeatedly never reaches zero.'},
      {t:`${fmt(100-n*50,0)}%`, ok:false,
       why:'This subtracts half the <em>original</em> each time, which would hit zero after two half-lives. Each half-life takes half of what remains.'}
    ]
  };
});
registerQuiz('ch12', function(){
  return {
    q: 'Alpha decay half-lives span more than twenty orders of magnitude, but the alpha energies vary only by a factor of about two. What explains that?',
    opts: [
      {t:'the alpha has to tunnel, and the tunnelling probability is exponential in the barrier', ok:true,
       why:'Gamow\'s insight: a small change in energy changes how far up the Coulomb barrier the alpha starts, and the transmission depends exponentially on the integral across it. A factor of two in energy becomes twenty decades in half-life.'},
      {t:'the heavier nuclei simply contain more alphas to emit', ok:false,
       why:'The number of possible alphas hardly varies across these nuclei, and could not produce twenty orders of magnitude in any case.'},
      {t:'the half-lives were measured badly', ok:false,
       why:'They are well measured, and the Gamow calculation reproduces them across the whole range — one of the first real triumphs of quantum mechanics.'},
      {t:'the strong force varies enormously from nucleus to nucleus', ok:false,
       why:'The strong force is much the same in all of them. What varies is how likely the alpha is to get through the electrostatic barrier outside.'}
    ]
  };
});
registerQuiz('ch12', function(){
  return {
    q: 'Why does ²³⁵U fission with a slow neutron while ²³⁸U needs a fast one?',
    opts: [
      {t:'²³⁶U is even-even and gains the pairing bonus; ²³⁹U has an odd neutron number and does not', ok:true,
       why:'Swallowing a neutron gives ²³⁵U about 6.8 MeV of excitation against a 5.7 MeV barrier — enough on its own. ²³⁸U gets only about 5.6 MeV against 6.2, and must be handed the shortfall as kinetic energy. The gap is almost entirely the pairing term.'},
      {t:'²³⁵U is lighter, so it splits more easily', ok:false,
       why:'Three nucleons make almost no difference to the fissility Z²/A. The decisive quantity is the excitation energy released by capture.'},
      {t:'²³⁸U is not radioactive', ok:false,
       why:'It is — it alpha-decays with a 4.5-billion-year half-life. That is unrelated to whether it fissions on neutron capture.'},
      {t:'²³⁸U has no fission barrier', ok:false,
       why:'It has a slightly higher one, 6.2 MeV against 5.7. The problem is that capture does not supply enough to clear it.'}
    ]
  };
});

/* =====================================================================
   CHAPTER 13 — ELEMENTARY PARTICLES
   ===================================================================== */
registerQuiz('ch13', function(){
  const taus = [['mu-',2.197e-6],['pi+',2.603e-8],['L0',2.63e-10]];
  const [k,tau] = qPick(taus);
  return {
    q: `The ${P13[k].sym} lives about <b>${fmtSci(tau,2)} s</b>. Which interaction takes it apart?`,
    opts: [
      {t:'the weak interaction', ok:true,
       why:`Anything living longer than about 10⁻¹³ s is decaying weakly — the strong interaction works on 10⁻²³ s and the electromagnetic on 10⁻¹⁶ s or so. A lifetime is a clock that tells you which force is responsible.`},
      {t:'the strong interaction', ok:false,
       why:'Strong decays are over in about 10⁻²³ s, some fifteen orders of magnitude faster. If a particle survives long enough to leave a track, the strong force is not what kills it.'},
      {t:'the electromagnetic interaction', ok:false,
       why:'Electromagnetic decays, like π⁰ → γγ, run at around 10⁻¹⁶ s — still far quicker than this.'},
      {t:'gravity', ok:false,
       why:'Gravity is about 10³⁸ times weaker than the strong force at this scale and plays no part in particle decays.'}
    ]
  };
});
registerQuiz('ch13', function(){
  return {
    q: 'The reaction p → e⁺ + π⁰ conserves charge and energy. Why has it never been seen?',
    opts: [
      {t:'it would not conserve baryon number', ok:true,
       why:'The proton has B = 1 and neither product carries any. Baryon number conservation is why the proton appears to be stable — experiments put its lifetime beyond 10³⁴ years — and therefore why ordinary matter persists at all.'},
      {t:'it would not conserve charge', ok:false,
       why:'Charge balances: +1 on the left, +1 + 0 on the right. That is not the obstacle.'},
      {t:'there is not enough energy', ok:false,
       why:'There is plenty: the proton is much heavier than a positron plus a neutral pion, so the reaction is energetically downhill.'},
      {t:'it would not conserve strangeness', ok:false,
       why:'No strange quarks are involved on either side, so strangeness is trivially conserved.'}
    ]
  };
});
registerQuiz('ch13', function(){
  const key = qPick(['p','n','L0','S+']);
  const p = P13[key];
  return {
    q: `What is the quark content of the <b>${p.sym}</b>?`,
    opts: [
      {t:p.quarks, ok:true,
       why:`A baryon is three quarks, and the charges have to add to ${sgn(p.q)}e with the strangeness (${p.S}) supplied by however many s quarks it contains.`},
      {t:P13[key==='p'?'n':'p'].quarks, ok:false,
       why:'That is a different baryon. Add the quark charges up — ⅔ for u, −⅓ for d and s — and check they give the right total.'},
      {t:'a quark and an antiquark', ok:false,
       why:'That is a meson. Baryons are three quarks, which is what gives them baryon number 1.'},
      {t:'it has no quark content — it is elementary', ok:false,
       why:'Only leptons and the field bosons are elementary. Every baryon is a composite, as deep inelastic scattering showed directly.'}
    ]
  };
});
