export type AccuracyLabel = "FACT" | "SIMPLIFICATION" | "VISUALIZATION";

export interface KnowledgeRecord {
  id: string;
  title: string;
  shortExplanation: string;
  detail: string;
  accuracyLabel: AccuracyLabel;
}

export const KNOWLEDGE_RECORDS: Record<string, KnowledgeRecord> = {
  "gravitational-lensing": {
    id: "gravitational-lensing",
    title: "Gravitational Lensing",
    shortExplanation:
      "Mass curves spacetime. Light follows the curved geometry instead of a straight Euclidean line.",
    detail:
      "A black hole bends nearby light enough to expose parts of the disk that would normally be hidden behind it. Stars near the line of sight can smear into arcs or split into multiple images.",
    accuracyLabel: "FACT",
  },
  "black-hole-shadow": {
    id: "black-hole-shadow",
    title: "Black Hole Shadow",
    shortExplanation:
      "The shadow is the dark region where light paths fail to reach a distant observer.",
    detail:
      "The shadow is not a solid surface and is larger than the event horizon in appearance. Its boundary is governed by strongly curved photon trajectories.",
    accuracyLabel: "FACT",
  },
  "event-horizon": {
    id: "event-horizon",
    title: "Event Horizon",
    shortExplanation:
      "The event horizon is the boundary beyond which no signal can escape to infinity.",
    detail:
      "For a non-rotating black hole, it lies at the Schwarzschild radius. It is a causal boundary in spacetime, not a material shell that could be touched or heated by contact.",
    accuracyLabel: "FACT",
  },
  "photon-sphere": {
    id: "photon-sphere",
    title: "Photon Sphere",
    shortExplanation:
      "The photon sphere is where light can follow unstable circular orbits around the black hole.",
    detail:
      "In a Schwarzschild model it lies at 1.5 Schwarzschild radii. Slight inward or outward deviations cause capture or escape, which helps create high-contrast ring structure.",
    accuracyLabel: "FACT",
  },
  "photon-ring": {
    id: "photon-ring",
    title: "Photon Ring",
    shortExplanation:
      "Light that loops near the photon sphere can pile up into an extremely thin bright ring.",
    detail:
      "This rendering emphasizes the first-order ring. Real images depend on disk thickness, inclination, scattering, and detector resolution.",
    accuracyLabel: "VISUALIZATION",
  },
  "accretion-disk": {
    id: "accretion-disk",
    title: "Accretion Disk",
    shortExplanation:
      "Infalling matter forms a hot, differentially rotating disk before crossing inward.",
    detail:
      "Temperature generally rises toward the inner disk. The procedural disk represents density and temperature trends, not a unique astrophysical spectrum.",
    accuracyLabel: "SIMPLIFICATION",
  },
  "doppler-beaming": {
    id: "doppler-beaming",
    title: "Relativistic Doppler Beaming",
    shortExplanation:
      "Gas moving toward you appears brighter and bluer; gas moving away appears dimmer and redder.",
    detail:
      "The disk's orbital speed changes the observed frequency and intensity. This is distinct from gravitational redshift caused by depth in the gravitational potential.",
    accuracyLabel: "FACT",
  },
  "gravitational-redshift": {
    id: "gravitational-redshift",
    title: "Gravitational Redshift",
    shortExplanation:
      "Light climbing out of a gravitational potential loses frequency and energy.",
    detail:
      "Light from closer to the horizon is shifted more strongly. In this experience it is combined with a simplified disk-emission model rather than a full radiative transfer solution.",
    accuracyLabel: "SIMPLIFICATION",
  },
  "time-dilation": {
    id: "time-dilation",
    title: "Time Dilation",
    shortExplanation:
      "Clocks deeper in the gravitational field tick more slowly relative to distant clocks.",
    detail:
      "The HUD compares elapsed coordinate time with a simplified static-observer proper time. A freely falling observer would follow a different worldline.",
    accuracyLabel: "SIMPLIFICATION",
  },
};
