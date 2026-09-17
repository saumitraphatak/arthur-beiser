# arthur-beiser

Interactive companion to the whole of Arthur Beiser's *Concepts of Modern Physics* (6th ed.) — all
thirteen chapters, 92 modules — built to develop intuition for the equations by playing with them
rather than only reading them.

Open `index.html` in a browser (or serve the folder with e.g. `python3 -m http.server`, or via GitHub Pages). No build step, no dependencies, no CDNs — plain HTML, CSS, vanilla JS and canvas 2D.

Every module carries an explanation beneath it in the same four-part shape: how to read the visualization, a **Try this** box with specific settings reproducing one of Beiser's worked examples, the conceptual payoff, and a closing **The catch** note on whatever subtlety usually causes trouble.

Six things make ninety-two modules navigable:

- **Search** in the sidebar, across every module's title, equation and prose at once, from
  whichever chapter you happen to be in. `/` focuses it, Enter jumps to the first hit.
- **Every equation in the book** on one page, gathered from the cards themselves at load, so it
  cannot drift out of date. Click any equation to land on the module it came from.
- A **link** button on each module that copies a URL carrying that module's current control
  settings, so a particular configuration can be shared or bookmarked and comes back exactly.
  The hash looks like `#ch5|ch5-m4|tn_E=3.5&tn_U=10&tn_L=1.23`.
- **Check yourself** — a quiz on the chapter you're reading, 35 questions across the thirteen
  chapters. The numbers in each question are redrawn every time and the answer is computed from
  the same constants and functions the modules use, so a question cannot go stale or disagree with
  the page it came from. Every wrong option is a specific named mistake — dividing by γ instead of
  multiplying, counting `2n` states where the closed shell holds `n²` — and picking it says which
  mistake it was rather than just "incorrect".
- **The whole book, to scale** — three logarithmic rulers, energy, size and time, carrying 37 real
  quantities from the book, every one computed here from the same constants and tables the modules
  use. The reason they are on the same page is the tie between them: an energy fixes a length and a
  time on its own, through ℓ = ħc/E and t = ħ/E, so hovering any mark drops a marker at the matching
  place on the other two rulers. Sometimes that lands on the physics — the pion's rest energy gives
  1.41 fm, which is the mark already sitting there for the range of the nuclear force, to the pixel,
  and that is exactly the argument by which Yukawa predicted a particle nobody had seen. Sometimes
  the miss is the physics: hydrogen's 13.6 eV gives 14.5 nm, 270 times the size of the atom, and
  that factor is 2/α — a bound state sits at ħc/E only when it is relativistic.
- A **concept map** of 47 ideas and the 60 dependencies between them, laid out chapter by chapter.
  Hovering an idea lights up everything it rests on, in one colour, and everything that rests on it
  in another — and says so in words ("rests on 10 earlier ideas, and 2 later ones rest on it").
  Clicking one goes to its module. It answers the question the table of contents can't: what do I
  need to have understood before this will make sense.

Every module also has a **mark understood** toggle in its top-right corner. Checking it off is
saved to `localStorage` — nothing leaves the browser — and shows up three ways: a running
`n/total` on that chapter's pill in the top nav, a checkmark in the chapter's sidebar index, and
an overall `n of 92 modules marked understood` line under the title once you've checked off at
least one. A **reset progress** link appears in the sidebar once there's anything to reset. Since
it's per-browser storage, progress does not sync between devices and does not survive clearing
site data — there is no account and nothing is collected.

## Chapter 1 — Relativity
- The Michelson–Morley experiment (arm transit times, predicted fringe shift, the null result)
- Light-clock time dilation (animated)
- Length contraction
- Relativistic velocity addition
- Relativistic Doppler effect / cosmological redshift (Hubble's law)
- Twin paradox with spacetime diagram (animated — press Play to watch both ages tick as Dick flies out and back)
- Relativistic vs. classical kinetic energy & momentum
- Minkowski spacetime diagram (boosted axes, relativity of simultaneity)

## Chapter 2 — Particle Properties of Waves
- Blackbody radiation: Planck's law vs. the Rayleigh–Jeans "ultraviolet catastrophe" (the visible band in its real colours, cooler blackbodies nested underneath, the locus of the peaks, and a colour-vs-temperature strip — every colour integrated from the spectrum through the CIE colour-matching functions, not looked up)
- Photoelectric effect (the apparatus itself: photons in their true colour land on a cathode, electrons leave with a spread of energies and climb against the retarding voltage, turning back if they are too slow — plus stopping voltage and KE_max vs. frequency)
- X-ray production: the Duane–Hunt cutoff and characteristic lines
- Compton scattering (wavelength shift + momentum vector diagram)
- Bragg diffraction
- Pair production (threshold, energy partition, why a nucleus is required)
- Exponential attenuation of a photon beam
- Photons in a gravitational field (Pound–Rebka, gravitational redshift, the Schwarzschild limit)

## Chapter 3 — Wave Properties of Particles
- De Broglie wavelength across forty decades of scale
- Phase and group velocity (a genuinely localised travelling packet, with one crest tracked as it is born at the back and dies off the front, against a single endless de Broglie wave that localises nothing)
- Davisson–Germer electron diffraction
- Particle in a box (standing waves, the n² energy ladder)
- Building a wave packet — where Δx·Δp ≥ ℏ/2 actually comes from
- Applying the uncertainty principle (why nuclei cannot contain electrons)
- Energy–time uncertainty and the natural width of a spectral line

## Chapter 4 — Atomic Structure
- Rutherford scattering (an animated beam with impact parameters sampled the way a foil samples them — probability ∝ b db — so the rare backscatter is as rare on screen as it was in the lab; the plum-pudding prediction is drawn alongside rather than asserted)
- Why the classical atom collapses (the spiral, and the frequency smear it would emit)
- The hydrogen spectral series (Lyman through Pfund, plus the Balmer lines in true colour)
- Bohr orbits as standing de Broglie waves
- Energy levels, transitions, and the correspondence principle
- Reduced mass and the isotope shift (H, D, T, He⁺, positronium, muonic hydrogen)
- The Franck–Hertz experiment
- One number runs the atom (the whole Bohr model as mc² times a power of Zα, on one log ladder — with α and Z as sliders, and the Balmer lines sliding out of the visible band as you turn them)

## Chapter 5 — Quantum Mechanics
- The wave function and what it means (normalisation, probability, expectation values)
- Particle in a box, solved properly (quantization from boundary conditions)
- The finite potential well (leakage into the classically forbidden region)
- The tunnel effect (fire a wave packet at the barrier and watch it split into a reflected and a transmitted one — the time-dependent Schrödinger equation solved live on a grid, agreeing with the formula to within the energy spread of the packet; below it, the steady-state picture, with what emerges magnified by a stated factor)
- The harmonic oscillator (zero-point energy, quantum vs classical density)
- Superposition — why stationary states are stationary, and why atoms radiate

## Chapter 6 — Quantum Theory of the Hydrogen Atom
- Three dimensions, three quantum numbers (every state, and where each restriction comes from)
- Where the electron actually is (radial probability, most probable radius vs ⟨r⟩)
- Orbital shapes (|ψ|² density slices computed from the wave functions, with an animated electron-cloud overlay — dots sampled live from the density, so the smooth plot is visibly what a great many measurements would actually build up)
- Angular momentum cannot point anywhere (|L| = √(ℓ(ℓ+1))ℏ vs L_z = m_ℓℏ)
- Selection rules (Δℓ = ±1 and why it is angular-momentum conservation)
- The Zeeman effect (normal splitting, Example 6.4)

## Chapter 7 — Many-Electron Atoms
- Electron spin (two orientations, and why it cannot be literal rotation)
- The exclusion principle as a symmetry (antisymmetric wave functions vanish when states coincide)
- Building up the elements (Madelung filling, generated not looked up — press Play to walk Z upward and watch the periodic table assemble itself, its s, p and d blocks falling out of the filling order rather than being drawn in)
- The periodic trend made visible (measured ionization energies, Z = 1–54)
- Spin–orbit coupling and total angular momentum (j = ℓ ± ½, fine-structure doublets)
- X-ray spectra and Moseley's law (√ν linear in Z, and why it is Z − 1)

## Chapter 8 — Molecules
- The molecular bond (potential well, bond length, dissociation energy, zero-point tax)
- Electron sharing in H₂⁺ (bonding vs antibonding, and why one binds — press Play to walk the protons in from far apart and watch the charge gather between them while the energy slides into the well)
- Rotational energy levels and spectra (measuring bond length from line spacing)
- Vibrational energy levels (force constants, anharmonicity, Example 8.3)
- The vibration–rotation band (P and R branches, the missing centre line, plus an animated inset of the molecule actually stretching and tumbling at once)
- Three energy scales, four decades apart

## Chapter 9 — Statistical Mechanics
- The Maxwell–Boltzmann speed distribution (a simulated three-dimensional gas of 170 molecules colliding elastically, its speeds binned live against the analytic curve; start them all at one speed and watch collisions alone build the distribution)
- The energy distribution and the activation tail (why 10 K can double a reaction rate)
- Three statistics on one plot (Maxwell–Boltzmann, Bose–Einstein, Fermi–Dirac, and where they merge)
- Where Planck's law comes from (⟨ε⟩ per mode, and how equipartition fails)
- Specific heats of solids (Dulong–Petit, Einstein, Debye — with the Debye integral done numerically)
- The free-electron gas in a metal (Fermi energy from the electron density, and why electrons carry so little heat)

## Chapter 10 — The Solid State
- What holds an ionic crystal together (Madelung sums, the exclusion-principle repulsion, cohesive energy against measurement)
- The van der Waals bond (Lennard-Jones, the fcc lattice sums, and all five bond types compared against their melting points)
- Free electrons, drift and Ohm's law (animated; the average position of the whole cloud is tracked separately, because one electron's creep is invisible against its own random motion)
- How a level becomes a band (a chain of N atoms solved exactly, and what happens as N grows — press Play to watch the discrete levels smear into a band in real time)
- Conductor, semiconductor, insulator (Fermi–Dirac tails on a log scale, intrinsic carriers, the Arrhenius plot)
- Doping and the p–n junction (band bending under bias, np = n_i², the diode equation, 60 mV per decade)
- Brillouin zones (bands from diagonalising the nearly-free-electron Hamiltonian, and the two standing waves that make the gap)
- Superconductivity (critical field, the BCS gap equation solved numerically, Cooper pairs, the flux quantum)

## Chapter 11 — Nuclear Structure
- How big, how dense, how repulsive (R = 1.2A⅓, the Woods–Saxon profile, 2.3×10¹⁷ kg/m³, 40 N between two protons)
- Nuclear spin, the magneton, and how an MRI works (Larmor frequencies, and the few-per-million population excess an image is built from)
- The mass defect and the binding-energy curve (every point from a measured atomic mass; fusion and fission Q values)
- The liquid-drop model (five terms you can drag, fitted against every stable nuclide, and residuals that point at the shells)
- The valley of stability (the chart of the nuclides, and the isobar parabola that picks the stable element at each A)
- The shell model and the magic numbers (spin–orbit strength as a slider, all seven closures, the abundance spikes, and a fill animation that stacks nucleons onto the ladder one at a time, pausing on every magic number)
- Yukawa (ΔEΔt ≈ ℏ, the pion's mass from the range of the force, and the Yukawa potential against a plain 1/r)

## Chapter 12 — Nuclear Transformations
- Five kinds of decay, and which one a nucleus picks (decay arrows on the chart of the nuclides, every Q from measured masses)
- The decay law (half-life vs mean life, activity in Bq and Ci — and 400 simulated nuclei, each with its own random lifetime, decaying one by one while the surviving count traces the exponential with visible statistical wobble)
- Radiometric dating (six clocks on one log-time axis, from radiocarbon to rubidium–strontium)
- Alpha decay by tunnelling (the Gamow integral reproducing 17 decades of half-life, and recovering R₀ = 1.2 fm from decay rates alone)
- Beta decay and the neutrino (the Fermi spectrum, the Kurie plot, and where neutrino mass hides)
- Cross section (attenuation, mean free path, reaction rate, and why a slow neutron sees a nucleus 20,000× its size)
- Fission (the deformation barrier, the one pairing term that separates ²³⁵U from ²³⁸U, and a sphere-to-dumbbell-to-scission animation driven by the same stability criterion)
- Fusion (the Gamow peak, pp vs CNO and their T⁴ and T²⁰ laws, and the Lawson criterion)

## Chapter 13 — Elementary Particles
- The four interactions, thirty-nine decades apart (strong, electromagnetic, weak and gravity on one log-force plot, derived from an actual Yukawa potential rather than a schematic)
- The particle zoo, sorted (mass and lifetime plots that sort leptons, quarks, mesons, baryons and bosons on their own; press Play to watch a chosen particle decay, on a clock scaled to its own mean life)
- Antimatter (the Dirac sea, pair production and annihilation, and the energy released compared with the space shuttle's orbit)
- Is this reaction allowed? (a live ledger of charge, baryon number, the three lepton numbers and strangeness, checked against any reaction you build)
- Building hadrons out of quarks (the baryon octet and decuplet, and the meson multiplets, assembled from up, down and strange)
- Why you cannot have one quark (confinement, the linear potential, and why pulling a quark out just makes a pair of mesons)
- Field bosons, and why the weak force looks weak (the photon, gluons, W/Z and the electroweak unification scale)
- The history of the universe (the thermal epochs from the Planck time to today, and where each of the four interactions froze out)

Every number on screen is computed live from the chapter's formulas — nothing is pre-baked data.
The atomic data in Chapters 11 and 12 is the one exception: `nuclides.js` holds Beiser's own
appendix table — 378 nuclides with measured masses, natural abundances, stability and half-lives.
Every binding energy, Q value and decay constant is computed from those. Chapter 13's particle
and quark properties (`P13`, `QUARKS` in `ch13.js`) are the same kind of measured table, taken
from Beiser's own particle-physics tables.

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
    ch10.js
    ch11.js
    ch12.js
    ch13.js
    nuclides.js   atomic masses, abundances and half-lives, for Chapters 11-12
    quiz.js       per-chapter question banks, each generated fresh from live constants
    conceptmap.js the 45-idea dependency graph and its renderer
    scales.js     the energy/size/time rulers, and the ħc/E tie between them

Adding a chapter is additive: write `chNN.js`, add its `<section class="chapter" id="chNN">`,
add a `<script>` tag, and promote its pill in the nav from `.soon` to a button. `app.js`
never changes. The quiz and the concept map are registries in the same style — `registerQuiz('chNN', fn)`
and entries in `MAP_NODES`/`MAP_EDGES` — so a chapter without them still works; it just has nothing
to check yourself on.

Shared drawing machinery lives in `app.js` and is worth knowing about before adding a plot:

- `drawAxes()` picks its own tick positions — round multiples of 1, 2, 2.5 or 5 times a power of
  ten near the requested spacing — rather than dividing the range into equal parts, which is what
  used to produce axes labelled 0, 310, 620, 930, 1241. Pass `exactTicks:true` to get the old
  behaviour. With no `xfmt`/`yfmt` it also formats the labels itself, factoring a common power of
  ten into the axis title instead of repeating `8.1e5` on every tick.
- `drawAxes()` records the plotting box, and `plotLine()` clips to it, so a curve that runs off the
  top of its own axes stops there instead of being drawn across the rest of the card. A diagram
  that never calls `drawAxes()` is not clipped.
- `wavelengthRGB()`, `spectrumRGB()` and `cieBar()` turn a computed spectrum into the colour an eye
  would see, through analytic fits to the CIE 1931 colour-matching functions. Prefer them to a
  hand-tuned rainbow ramp.

Four conventions worth knowing before editing:

- `canvas.width`/`.height` **reflect the HTML attributes**, so never read an intended CSS
  size back out of the `height` attribute after writing it. `fitCanvas()` handles this and
  memoizes the fit; never resize a canvas on a slider `input` event.
- Every module setup and every per-canvas draw runs inside its own `try`/`catch`, so one
  broken module can never blank the others.
- Chapter files share one global scope, so top-level `const` names and DOM `id`s must be
  unique across the whole site. The test harness fails the build on duplicate element ids.
- A card's id (`chNN-mM`) is assigned by its position within the chapter and is what the
  progress-tracking feature keys a visitor's "understood" marks to in `localStorage`.
  Reordering or inserting a card in the middle of a chapter shifts every id after it, which
  silently reassigns existing visitors' checkmarks to the wrong module. Appending a new card
  at the end of a chapter is safe; reordering existing ones is not, without also accepting
  that saved progress.

Every chapter has at least one animation that is the point of the chapter rather than decoration:
the alpha beam in Ch 4, the photoelectric tube in Ch 2, a wave packet splitting on a barrier in
Ch 5, a gas thermalising in Ch 9, 400 nuclei decaying in Ch 12.

Verified at devicePixelRatio 1, 2 and 3 — bugs have hidden at dpr 1. The test harness also sweeps
every module for labels that run outside their canvas or land on top of each other, and checks
that each chapter's animation is actually moving. Quiz questions are validated by drawing each one
two hundred times and rejecting any draw where two options come out identical or where none is
correct — parameter choices that collapse a distractor onto the answer (Compton at λ₀ = 10, a
particle in a box at n = 1) are easy to write and impossible to spot by reading.

## Status

All thirteen chapters are built — **92 modules** in total. The book is complete.
