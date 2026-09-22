import type { QualityLevel } from "../physics/blackHole";

interface ExperimentEvents {
  onQuality: (quality: QualityLevel) => void;
  onReset: () => void;
}

export class ExperimentManager {
  private readonly qualityButtons: HTMLButtonElement[];
  private readonly abortController = new AbortController();

  constructor(
    root: HTMLElement,
    private readonly events: ExperimentEvents,
  ) {
    this.qualityButtons = Array.from(root.querySelectorAll<HTMLButtonElement>("[data-quality]"));

    this.qualityButtons.forEach((button) => {
      button.addEventListener("click", () => {
        this.setQuality(button.dataset.quality as QualityLevel);
      }, { signal: this.abortController.signal });
    });

    root.querySelector<HTMLButtonElement>("[data-reset]")?.addEventListener("click", () => {
      this.events.onReset();
    }, { signal: this.abortController.signal });

  }

  setQuality(quality: QualityLevel) {
    this.qualityButtons.forEach((button) => {
      button.classList.toggle("active", button.dataset.quality === quality);
    });
    this.events.onQuality(quality);
  }

  dispose() {
    this.abortController.abort();
  }
}
