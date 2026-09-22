# Black Hole Horizon

[English](README.md) | [简体中文](README.zh-CN.md)

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
| Help | `H` |
| Reset view | `R` |

## Scientific Notes

### 1. Distances use gravitational radii

The project measures distance in gravitational radii, `r_g = GM/c²`. For a
black hole, `r_g` bundles the key quantities—mass and the strength of gravity—into
one natural length unit, so the same geometric rules can be described without
writing every formula in metres.

In the visualization, one unit of world space is one `r_g`. The HUD therefore
reads distances such as `42.00 r_g` rather than kilometres or light-seconds.
Changing the displayed solar mass does not require rebuilding the geometry; it
only changes how the same normalized scene would be scaled physically.

### 2. Event horizon and photon sphere

This is a Schwarzschild black hole: non-rotating and spherically symmetric. Its
event horizon lies at `2 r_g`. In simple terms, once light crosses this boundary,
there are no outward paths back to the distant universe, so the shader treats
crossing it as capture and leaves that direction black.

At `3 r_g` is the photon sphere, where light can temporarily orbit the black
hole. Nearby light paths can bend around it one or more times before escaping.
The GPU ray integrator follows this behavior, producing the dark shadow plus a
thin, bright photon ring near its edge.

### 3. Procedural accretion disk

An accretion disk is made of matter spiraling around the black hole. Material
closer in generally moves faster and becomes hotter, while turbulence creates
filaments and varying density. The renderer does not simulate a complete plasma
flow; instead, it procedurally combines these trends into a visible disk.

The disk spans `6 r_g` to `24 r_g` by default. Its shader changes color with a
temperature profile that falls outward, modulates brightness and structure with
turbulent density, and rotates material on an orbit-like angular profile. It
also applies two relativistic trends:

- **Doppler beaming and color shift:** material moving toward the camera appears
  brighter and bluer; material moving away appears dimmer and redder.
- **Gravitational redshift:** light from deeper in the gravitational well is
  shifted and reduced in brightness, making the innermost visible material look
  different from the cooler outer disk.

### 4. Coordinate time and proper time

General relativity predicts that clocks deeper in a gravitational field run more
slowly relative to far-away coordinate time. The experience therefore shows two
clocks: coordinate time and proper time.

For the readout, proper time is advanced using a simplified static-observer
factor at the camera's current radius. This communicates gravitational time
dilation, but it is not a full freely falling worldline calculation and does not
model the flight path's velocity, acceleration, or exact relativistic motion.
