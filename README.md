# arthur-beiser

Interactive companion to Arthur Beiser's *Concepts of Modern Physics* (6th ed.) — built to develop intuition for the equations by playing with them, not just reading them.

Open `index.html` in a browser (or serve the folder with e.g. `python3 -m http.server`, or via GitHub Pages). No build step, no dependencies, no CDNs — plain HTML, CSS, vanilla JS and canvas 2D.

Every module carries an explanation beneath it in the same four-part shape: how to read the visualization, a **Try this** box with specific settings reproducing one of Beiser's worked examples, the conceptual payoff, and a closing **The catch** note on whatever subtlety usually causes trouble.

## Chapter 1 — Relativity
- The Michelson–Morley experiment (arm transit times, predicted fringe shift, the null result)
- Light-clock time dilation (animated)
- Length contraction
- Relativistic velocity addition
- Relativistic Doppler effect / cosmological redshift (Hubble's law)
- Twin paradox with spacetime diagram
- Relativistic vs. classical kinetic energy & momentum
- Minkowski spacetime diagram (boosted axes, relativity of simultaneity)

## Chapter 2 — Particle Properties of Waves
- Blackbody radiation: Planck's law vs. the Rayleigh–Jeans "ultraviolet catastrophe"
- Photoelectric effect (stopping voltage, KE_max vs. frequency)
- X-ray production: the Duane–Hunt cutoff and characteristic lines
- Compton scattering (wavelength shift + momentum vector diagram)
- Bragg diffraction
- Pair production (threshold, energy partition, why a nucleus is required)
- Exponential attenuation of a photon beam
- Photons in a gravitational field (Pound–Rebka, gravitational redshift, the Schwarzschild limit)

## Chapter 3 — Wave Properties of Particles
- De Broglie wavelength across forty decades of scale
- Phase and group velocity (animated packet; why v_p > c carries no information)
- Davisson–Germer electron diffraction
- Particle in a box (standing waves, the n² energy ladder)
- Building a wave packet — where Δx·Δp ≥ ℏ/2 actually comes from
- Applying the uncertainty principle (why nuclei cannot contain electrons)
- Energy–time uncertainty and the natural width of a spectral line

## Chapter 4 — Atomic Structure
- Rutherford scattering (numerically integrated trajectories, the 1/sin⁴(θ/2) law)
- Why the classical atom collapses (the spiral, and the frequency smear it would emit)
- The hydrogen spectral series (Lyman through Pfund, plus the Balmer lines in true colour)
- Bohr orbits as standing de Broglie waves
- Energy levels, transitions, and the correspondence principle
- Reduced mass and the isotope shift (H, D, T, He⁺, positronium, muonic hydrogen)
- The Franck–Hertz experiment

## Chapter 5 — Quantum Mechanics
- The wave function and what it means (normalisation, probability, expectation values)
- Particle in a box, solved properly (quantization from boundary conditions)
- The finite potential well (leakage into the classically forbidden region)
- The tunnel effect (exact and approximate transmission, the STM's sensitivity)
- The harmonic oscillator (zero-point energy, quantum vs classical density)
- Superposition — why stationary states are stationary, and why atoms radiate

## Chapter 6 — Quantum Theory of the Hydrogen Atom
- Three dimensions, three quantum numbers (every state, and where each restriction comes from)
- Where the electron actually is (radial probability, most probable radius vs ⟨r⟩)
- Orbital shapes (|ψ|² density slices computed from the wave functions)
- Angular momentum cannot point anywhere (|L| = √(ℓ(ℓ+1))ℏ vs L_z = m_ℓℏ)
- Selection rules (Δℓ = ±1 and why it is angular-momentum conservation)
- The Zeeman effect (normal splitting, Example 6.4)

## Chapter 7 — Many-Electron Atoms
- Electron spin (two orientations, and why it cannot be literal rotation)
- The exclusion principle as a symmetry (antisymmetric wave functions vanish when states coincide)
- Building up the elements (Madelung filling, generated not looked up)
- The periodic trend made visible (measured ionization energies, Z = 1–54)
- Spin–orbit coupling and total angular momentum (j = ℓ ± ½, fine-structure doublets)
- X-ray spectra and Moseley's law (√ν linear in Z, and why it is Z − 1)

## Chapter 8 — Molecules
- The molecular bond (potential well, bond length, dissociation energy, zero-point tax)
- Electron sharing in H₂⁺ (bonding vs antibonding, and why one binds)
- Rotational energy levels and spectra (measuring bond length from line spacing)
- Vibrational energy levels (force constants, anharmonicity, Example 8.3)
- The vibration–rotation band (P and R branches, the missing centre line)
- Three energy scales, four decades apart

## Chapter 9 — Statistical Mechanics
- The Maxwell–Boltzmann speed distribution (v_p, v̄, v_rms, and which gases a planet keeps)
- The energy distribution and the activation tail (why 10 K can double a reaction rate)
- Three statistics on one plot (Maxwell–Boltzmann, Bose–Einstein, Fermi–Dirac, and where they merge)
- Where Planck's law comes from (⟨ε⟩ per mode, and how equipartition fails)
- Specific heats of solids (Dulong–Petit, Einstein, Debye — with the Debye integral done numerically)
- The free-electron gas in a metal (Fermi energy from the electron density, and why electrons carry so little heat)

Every number on screen is computed live from the chapter's formulas — nothing is pre-baked data.

## Layout

    index.html    the shell: masthead, chapter nav, all chapter sections
    app.js        core: constants, canvas fitting, plot helpers, module registry
    ch01.js       one file per chapter, each self-registering its modules
    ch02.js
    ch03.js
    ch04.js
    ch05.js
    ch06.js
    ch07.js
    ch08.js
    ch09.js

Adding a chapter is additive: write `chNN.js`, add its `<section class="chapter" id="chNN">`,
add a `<script>` tag, and promote its pill in the nav from `.soon` to a button. `app.js`
never changes.

Two conventions worth knowing before editing:

- `canvas.width`/`.height` **reflect the HTML attributes**, so never read an intended CSS
  size back out of the `height` attribute after writing it. `fitCanvas()` handles this and
  memoizes the fit; never resize a canvas on a slider `input` event.
- Every module setup and every per-canvas draw runs inside its own `try`/`catch`, so one
  broken module can never blank the others.

Verified at devicePixelRatio 1, 2 and 3 — bugs have hidden at dpr 1.

More chapters to follow as they get read.
