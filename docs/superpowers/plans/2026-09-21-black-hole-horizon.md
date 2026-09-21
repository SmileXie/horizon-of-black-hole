# Black Hole Horizon Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver the first cinematic, explorable Schwarzschild black hole experience with physically motivated GPU ray bending, accretion disk, relativistic color, scientific HUD, and discovery-based education.

**Architecture:** A fullscreen postprocessing ray-tracing pass integrates photon paths through Schwarzschild spacetime on the GPU, samples a procedural accretion disk and universe, then applies selective bloom. CPU-side modules manage camera navigation, simulation state, quality, HUD, discoveries, and educational content.

**Tech Stack:** Vite, TypeScript, Three.js WebGL2, custom GLSL, UnrealBloomPass, EffectComposer.

**Spec:** `/home/spencer/.codex/attachments/0e2abe2a-e591-43f6-9612-dd5f7eec4b75/pasted-text.txt`

## Global Constraints

- First release implements Schwarzschild only; Kerr/spin UI can be represented as disabled/locked pending phase two.
- Never use a simple black sphere, textured disk, or generic glowing torus as the black hole.
- Event horizon, black hole shadow, and photon sphere must remain conceptually distinct in copy.
- Language: cinematic scientific English UI with concise, physically accurate explanations.
- Preserve visual hierarchy: background universe < accretion disk < photon ring.
- Provide LOW/MEDIUM/HIGH/ULTRA ray-step and render-scale settings.
- Desktop Chrome is the target; WebGL2 fallback is the first release path.

## File Structure

- `index.html` — root app, HUD overlay, education drawer, loading state.
- `src/main.ts` — composition root and render/update loop.
- `src/physics/blackHole.ts` — black hole state, units, quality/time state.
- `src/physics/geodesic.ts` — CPU-side constants and validation helpers used by renderer configuration.
- `src/rendering/BlackHoleScene.ts` — renderer, composer, fullscreen photon-tracing pass, bloom.
- `src/rendering/BlackHoleShader.ts` — GLSL source and shader uniforms contract.
- `src/rendering/StarField.ts` — procedural background universe and supernova-like accents.
- `src/camera/ExplorerCamera.ts` — pointer-locked six-direction flight and speed modes.
- `src/interaction/Navigation.ts` — input bindings and control help.
- `src/interaction/ExperimentManager.ts` — quality, debug, light-bending toggle, and educational experiments.
- `src/education/KnowledgeDatabase.ts` — knowledge records keyed to visual phenomena.
- `src/education/DiscoverySystem.ts` — proximity/visibility triggers and discovery notifications.
- `src/ui/ScientificHUD.ts` — scientific instrument HUD and debug readouts.
- `src/style.css` — cinematic dark UI, overlay, drawer, and accessibility styles.
- `tests/blackHole.test.ts` — state and knowledge-base unit tests.

## Tasks

### Task 1: Project scaffold

**Files:** Create `package.json`, `tsconfig.json`, `index.html`, `src/style.css`, `src/main.ts`, `tests/blackHole.test.ts`, `.gitignore`.

**Interfaces:** Produces Vite app entry and npm scripts `dev`, `build`, `preview`, `test`.

- [ ] Initialize TypeScript + Three.js + Vitest configuration.
- [ ] Add semantic app shell and base cinematic styles.
- [ ] Run `npm test` after adding the first failing state tests, then implement minimal state types.
- [ ] Run `npm run build` to verify scaffold.

### Task 2: Black hole simulation and shader contract

**Files:** Create `src/physics/blackHole.ts`, `src/physics/geodesic.ts`, `src/rendering/BlackHoleShader.ts`, `src/rendering/BlackHoleScene.ts`.

**Interfaces:** Produces `BlackHoleState`, `QualityLevel`, `createBlackHoleState()`, `QUALITY_PRESETS`, `BLACK_HOLE_SHADER`, and `BlackHoleScene`.

- [ ] Add failing tests for unit conversion, quality presets, and conceptual copy distinctions.
- [ ] Implement GPU ray-marching uniforms and GLSL Schwarzschild null-geodesic integration.
- [ ] Implement renderer/composer with render scale, adaptive quality, bloom, and ray-step uniforms.
- [ ] Run unit tests and production build.

### Task 3: Procedural universe and accretion disk

**Files:** Modify `src/rendering/BlackHoleShader.ts`; Add `src/rendering/StarField.ts` for shared shader helpers.

**Interfaces:** Produces `sampleUniverse()`, `sampleAccretionDisk()`, and `applyRelativisticColor()` GLSL functions.

- [ ] Add layered procedural stars, nebulae, and galaxies.
- [ ] Add turbulent disk density, temperature gradient, orbital motion, Doppler beaming, gravitational redshift, and blueshift.
- [ ] Capture event horizon and photon ring through geodesic termination and high step concentration.
- [ ] Build and visually inspect at multiple camera distances.

### Task 4: Navigation, HUD, and interactions

**Files:** Create `src/camera/ExplorerCamera.ts`, `src/interaction/Navigation.ts`, `src/interaction/ExperimentManager.ts`, `src/ui/ScientificHUD.ts`; modify `src/main.ts`.

**Interfaces:** Produces `ExplorerCamera`, `Navigation`, `ExperimentManager`, and `ScientificHUD`.

- [ ] Add pointer lock, WASD/QE movement, wheel speed, cruise/approach/precision modes, reset, and help.
- [ ] Add scientific HUD, proper/coordinate time, r/r_g, debug mode, quality controls, and light-bending experiment.
- [ ] Ensure collision/protection and clear camera recover behavior.
- [ ] Test app behavior in development preview and run build.

### Task 5: Discovery education system

**Files:** Create `src/education/KnowledgeDatabase.ts`, `src/education/DiscoverySystem.ts`; modify UI wiring.

**Interfaces:** Produces `KnowledgeDatabase`, `DiscoverySystem`, and knowledge record contract.

- [ ] Add knowledge records for lensing, event horizon, shadow, photon sphere/ring, accretion disk, Doppler beaming, redshift, and time dilation.
- [ ] Trigger concise discovery cards from distance/view context, with optional detail drawer.
- [ ] Mark FACT / SIMPLIFICATION / VISUALIZATION on detailed content.
- [ ] Run unit tests and production build.

### Task 6: Final verification

**Files:** Modify only defects found during verification; update `README.md`.

- [ ] Add user-facing controls and science notes.
- [ ] Run `npm test`, `npm run build`, `npm run preview`, and browser checks.
- [ ] Verify FPS, render scale, quality switching, camera controls, discoveries, and conceptual accuracy.
- [ ] Confirm first-run journey: distorted stars → bright ring → disk asymmetry → closer phenomena → explanations.
