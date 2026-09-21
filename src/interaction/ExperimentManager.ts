import type { QualityLevel } from "../physics/blackHole";

interface ExperimentEvents {
  onQuality: (quality: QualityLevel) => void;
  onGravityToggle: (enabled: boolean) => void;
  onDebugToggle: () => void;
  onReset: () => void;
}

export class ExperimentManager {
  gravityEnabled = true;
  debugEnabled = false;

  private readonly qualityButtons: HTMLButtonElement[];
  private readonly gravityButton: HTMLButtonElement;
  private readonly abortController = new AbortController();

  constructor(
    root: HTMLElement,
    private readonly events: ExperimentEvents,
  ) {
    this.qualityButtons = Array.from(root.querySelectorAll<HTMLButtonElement>("[data-quality]"));
    this.gravityButton = root.querySelector<HTMLButtonElement>("[data-gravity]")!;

    this.qualityButtons.forEach((button) => {
      button.addEventListener("click", () => {
        this.setQuality(button.dataset.quality as QualityLevel);
      }, { signal: this.abortController.signal });
    });

    this.gravityButton.addEventListener("click", () => {
      this.setGravity(!this.gravityEnabled);
    }, { signal: this.abortController.signal });

    root.querySelector<HTMLButtonElement>("[data-reset]")?.addEventListener("click", () => {
      this.events.onReset();
    }, { signal: this.abortController.signal });

    root.querySelector<HTMLButtonElement>("[data-debug]")?.addEventListener("click", () => {
      this.toggleDebug();
    }, { signal: this.abortController.signal });

    window.addEventListener("keydown", (event) => {
      if (event.code === "KeyG") this.setGravity(!this.gravityEnabled);
      if (event.code === "F1") {
        event.preventDefault();
        this.toggleDebug();
      }
    }, { signal: this.abortController.signal });
  }

  setQuality(quality: QualityLevel) {
    this.qualityButtons.forEach((button) => {
      button.classList.toggle("active", button.dataset.quality === quality);
    });
    this.events.onQuality(quality);
  }

  setGravity(enabled: boolean) {
    this.gravityEnabled = enabled;
    this.gravityButton.classList.toggle("active", enabled);
    this.gravityButton.textContent = enabled ? "GRAVITY ON" : "STRAIGHT LIGHT";
    this.events.onGravityToggle(enabled);
  }

  toggleDebug() {
    this.debugEnabled = !this.debugEnabled;
    this.events.onDebugToggle();
  }

  dispose() {
    this.abortController.abort();
  }
}
