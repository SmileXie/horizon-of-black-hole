# BLACK HOLE: INTO SPACETIME

Explore a black hole. Experience relativity.

A cinematic Three.js/WebGL2 experience built around GPU photon integration. The first
release focuses on a Schwarzschild black hole, gravitational lensing, an event-horizon
shadow, photon-ring structure, a procedural accretion disk, Doppler beaming, and
gravitational redshift.

## Quick Start

```bash
npm install
npm run dev
```

Open the printed local URL in a recent desktop version of Chrome, Edge, or Firefox.
For a production build:

```bash
npm run build
npm run preview
```

## Controls

| Action | Input |
| --- | --- |
| Enter flight mode | Click the canvas |
| Translate | `W` `A` `S` `D` |
| Vertical movement | `Q` / `E` |
| Look | Mouse while pointer-locked |
| Flight speed | Mouse wheel |
| Cruise / Approach / Precision | `1` / `2` / `3` |
| Toggle gravity experiment | `G` |
| Diagnostic HUD | `F1` |
| Help | `H` |
| Reset view | `R` |

## Scientific Notes

- Distances are expressed in gravitational radii, `r_g = GM/c²`.
- The Schwarzschild event horizon is at `2 r_g`; the photon sphere is at `3 r_g`.
- The disk is procedural and illustrates temperature, density, orbital motion,
  Doppler beaming, and gravitational redshift trends.
- Proper-time readout uses a simplified static-observer comparison. It is not a
  full freely falling worldline calculation.
- Press `G` to compare straight light with gravitationally curved light.
