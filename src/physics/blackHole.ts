import { Vector3 } from "three";

export type BlackHoleModel = "schwarzschild";
export type QualityLevel = "LOW" | "MEDIUM" | "HIGH" | "ULTRA";

export interface QualityPreset {
  label: QualityLevel;
  raySteps: number;
  renderScale: number;
  bloomStrength: number;
}

export interface BlackHoleState {
  model: BlackHoleModel;
  massSolarMasses: number;
  spin: number;
  diskInner: number;
  diskOuter: number;
  cameraPosition: Vector3;
  coordinateTime: number;
  properTime: number;
}

export const SCHWARZSCHILD_RADIUS_IN_GRAVITATIONAL_RADII = 2;
export const PHOTON_SPHERE_IN_GRAVITATIONAL_RADII = 3;

export const QUALITY_PRESETS: QualityPreset[] = [
  { label: "LOW", raySteps: 32, renderScale: 0.55, bloomStrength: 0.85 },
  { label: "MEDIUM", raySteps: 64, renderScale: 0.75, bloomStrength: 1.0 },
  { label: "HIGH", raySteps: 96, renderScale: 1.0, bloomStrength: 1.15 },
  { label: "ULTRA", raySteps: 144, renderScale: 1.0, bloomStrength: 1.25 },
];

export function createBlackHoleState(): BlackHoleState {
  return {
    model: "schwarzschild",
    massSolarMasses: 10,
    spin: 0,
    diskInner: 6,
    diskOuter: 24,
    cameraPosition: new Vector3(0.0, 5.0, 42.0),
    coordinateTime: 0,
    properTime: 0,
  };
}
