import type { QualityLevel } from "../physics/blackHole";

export interface HudReadout {
  distance: number;
  speed: number;
  massSolarMasses: number;
  spin: number;
  coordinateTime: number;
  properTime: number;
  quality: QualityLevel;
  fps: number;
  raySteps: number;
  renderScale: number;
  debug: boolean;
}

export class ScientificHUD {
  private readonly distance: HTMLElement;
  private readonly speed: HTMLElement;
  private readonly mass: HTMLElement;
  private readonly spin: HTMLElement;
  private readonly coordinate: HTMLElement;
  private readonly proper: HTMLElement;
  private readonly quality: HTMLElement;
  private readonly debugPanel: HTMLElement;
  private readonly fps: HTMLElement;
  private readonly renderInfo: HTMLElement;

  constructor(private readonly root: HTMLElement) {
    this.root.insertAdjacentHTML("beforeend", `
      <section class="brand" aria-label="Experience title">
        <h1>BLACK HOLE<br />INTO SPACETIME</h1>
        <p>EXPLORE · OBSERVE · RELATIVITY</p>
      </section>
      <section class="hud" aria-label="Scientific readout">
        <div class="hud-label"><span>OBSERVATION PLATFORM</span><span>SCHWARZSCHILD</span></div>
        <div class="hud-grid">
          <div class="hud-item"><small>Distance</small><strong id="hud-distance">--</strong></div>
          <div class="hud-item"><small>Velocity</small><strong id="hud-speed">--</strong></div>
          <div class="hud-item"><small>Mass</small><strong id="hud-mass">--</strong></div>
          <div class="hud-item"><small>Spin</small><strong id="hud-spin">--</strong></div>
          <div class="hud-item"><small>Coordinate time</small><strong id="hud-coordinate">--</strong></div>
          <div class="hud-item"><small>Proper time</small><strong id="hud-proper">--</strong></div>
        </div>
      </section>
      <section class="controls" aria-label="Navigation and experiments">
        <small>Navigation</small>
        <div class="hud-grid">
          <div class="hud-item"><small>Quality</small><strong id="hud-quality">--</strong></div>
        </div>
        <div class="control-row">
          <button data-quality="LOW">LOW</button>
          <button data-quality="MEDIUM">MEDIUM</button>
          <button data-quality="HIGH">HIGH</button>
          <button data-quality="ULTRA">ULTRA</button>
        </div>
        <div class="control-row">
          <button data-debug>DEBUG F1</button>
          <button data-reset>RESET R</button>
          <button data-help>HELP H</button>
        </div>
      </section>
      <div id="debug-panel" class="debug-panel" hidden>
        <small>Diagnostic</small>
        <div>FPS <span id="hud-fps">--</span></div>
        <div>RENDER <span id="hud-render">--</span></div>
      </div>
    `);

    this.distance = this.require("#hud-distance");
    this.speed = this.require("#hud-speed");
    this.mass = this.require("#hud-mass");
    this.spin = this.require("#hud-spin");
    this.coordinate = this.require("#hud-coordinate");
    this.proper = this.require("#hud-proper");
    this.quality = this.require("#hud-quality");
    this.debugPanel = this.require("#debug-panel");
    this.fps = this.require("#hud-fps");
    this.renderInfo = this.require("#hud-render");

    this.root.querySelector<HTMLButtonElement>("[data-help]")?.addEventListener("click", () => {
      window.dispatchEvent(new CustomEvent("togglehelp"));
    });
  }

  update(readout: HudReadout) {
    this.distance.textContent = `${readout.distance.toFixed(2)} r_g`;
    this.speed.textContent = `${readout.speed.toFixed(3)} c`;
    this.mass.textContent = `${readout.massSolarMasses} M☉`;
    this.spin.textContent = readout.spin.toFixed(3);
    this.coordinate.textContent = formatTime(readout.coordinateTime);
    this.proper.textContent = formatTime(readout.properTime);
    this.quality.textContent = readout.quality;

    this.debugPanel.hidden = !readout.debug;
    if (readout.debug) {
      this.fps.textContent = readout.fps.toFixed(0);
      this.renderInfo.textContent = `${readout.raySteps} steps · ${Math.round(readout.renderScale * 100)}%`;
    }
  }

  private require(selector: string) {
    const element = this.root.querySelector<HTMLElement>(selector);
    if (!element) throw new Error(`Missing HUD element: ${selector}`);
    return element;
  }
}

export function formatTime(seconds: number) {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60);
  const remaining = safeSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remaining.toFixed(2).padStart(5, "0")}`;
}
