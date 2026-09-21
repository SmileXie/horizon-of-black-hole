# Agent Guide

## Project Overview

Black Hole Horizon is a cinematic Three.js/WebGL2 experience about a
Schwarzschild black hole. It combines GPU photon integration, relativistic
rendering, procedural accretion disk visualization, camera flight controls, and
an educational science HUD.

## Commands

- Install dependencies: `npm install`
- Start the dev server: `npm run dev`
- Type-check and build: `npm run build`
- Preview the production build: `npm run preview`
- Run tests: `npm test`

## Architecture

- `index.html` — application entry point.
- `src/main.ts` — bootstraps and coordinates the application.
- `src/physics/` — black hole and geodesic calculations.
- `src/rendering/` — Three.js scene, GPU shader pipeline, and star field.
- `src/camera/` — explorer camera and flight behavior.
- `src/interaction/` — user interaction and experiment controls.
- `src/education/` — scientific knowledge content and discovery system.
- `src/ui/` — HUD and user-facing overlays.
- `tests/` — Vitest test suites.

## Working Conventions

- Use TypeScript modules and keep the existing ES-module structure.
- Preserve the project's scientific framing: distances use gravitational radii
  (`r_g = GM/c²`), the event horizon is `2 r_g`, and the photon sphere is
  `3 r_g`.
- Keep physics, rendering, interaction, and UI responsibilities separated.
- Prefer focused changes over broad refactors.
- Run `npm run build` and `npm test` after meaningful changes.
- Do not commit generated `dist/` output or local environment files.
