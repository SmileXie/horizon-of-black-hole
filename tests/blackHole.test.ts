import { describe, expect, it } from "vitest";
import { Vector3 } from "three";
import { QUALITY_PRESETS, createBlackHoleState } from "../src/physics/blackHole";
import { schwarzschildPhotonAcceleration } from "../src/physics/geodesic";
import { clampNavigationSpeed } from "../src/camera/ExplorerCamera";
import { KNOWLEDGE_RECORDS } from "../src/education/KnowledgeDatabase";
import { BLACK_HOLE_FRAGMENT_SHADER } from "../src/rendering/BlackHoleShader";

describe("black hole state", () => {
  it("starts outside the disk in the Schwarzschild model", () => {
    const state = createBlackHoleState();
    expect(state.model).toBe("schwarzschild");
    expect(state.spin).toBe(0);
    expect(state.massSolarMasses).toBe(10);
    expect(state.cameraPosition.length()).toBeGreaterThan(state.diskOuter);
  });

  it("provides four quality presets with increasing integration", () => {
    expect(QUALITY_PRESETS.map((preset) => preset.label)).toEqual([
      "LOW",
      "MEDIUM",
      "HIGH",
      "ULTRA",
    ]);
    expect(QUALITY_PRESETS[1].raySteps).toBe(64);
    expect(QUALITY_PRESETS[2].raySteps).toBe(96);
    expect(QUALITY_PRESETS[3].raySteps).toBeGreaterThan(128);
  });
});

describe("Schwarzschild photon acceleration", () => {
  it("bends light toward the black hole using r_g units", () => {
    const position = new Vector3(10, 0, 0);
    const velocity = new Vector3(0, 0, 1);
    const acceleration = schwarzschildPhotonAcceleration(position, velocity);
    const radial = position.clone().normalize();

    expect(acceleration.dot(radial)).toBeLessThan(0);
    expect(acceleration.length()).toBeGreaterThan(0);
  });

  it("uses the r_g equation with a horizon at radius two", () => {
    const position = new Vector3(10, 0, 0);
    const velocity = new Vector3(0, 0, 1);
    const acceleration = schwarzschildPhotonAcceleration(position, velocity);

    expect(acceleration.x).toBeCloseTo(-3 / 10 ** 2, 12);
    expect(Math.abs(acceleration.y)).toBeLessThan(1e-12);
    expect(Math.abs(acceleration.z)).toBeLessThan(1e-12);
  });
});

describe("accretion disk rendering", () => {
  it("rotates disk material slightly faster than the physical baseline", () => {
    expect(BLACK_HOLE_FRAGMENT_SHADER).toMatch(
      /const float DISK_ROTATION_SPEED_MULTIPLIER = 1\.4;/,
    );
    expect(BLACK_HOLE_FRAGMENT_SHADER).toMatch(
      /float angularVelocity = DISK_ROTATION_SPEED_MULTIPLIER \* 3\.2 \/ pow\(radius, 1\.5\);/,
    );
  });
});

describe("knowledge database", () => {
  it("keeps distinct phenomena conceptually separate", () => {
    const shadow = KNOWLEDGE_RECORDS["black-hole-shadow"];
    const horizon = KNOWLEDGE_RECORDS["event-horizon"];
    const photonSphere = KNOWLEDGE_RECORDS["photon-sphere"];
    expect(shadow.shortExplanation).not.toContain("is the event horizon");
    expect(horizon.shortExplanation).toMatch(/boundary/i);
    expect(photonSphere.shortExplanation).toMatch(/unstable/i);
  });

  it("labels detailed science as fact, simplification, or visualization", () => {
    for (const record of Object.values(KNOWLEDGE_RECORDS)) {
      expect(["FACT", "SIMPLIFICATION", "VISUALIZATION"]).toContain(record.accuracyLabel);
    }
  });
});

describe("explorer navigation", () => {
  it("keeps the displayed flight velocity below light speed", () => {
    expect(clampNavigationSpeed(52)).toBeCloseTo(37, 12);
    expect(clampNavigationSpeed(12)).toBe(12);
  });
});
