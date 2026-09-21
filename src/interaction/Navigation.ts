import type { ExplorerCamera, FlightMode } from "../camera/ExplorerCamera";

export class Navigation {
  private abortController = new AbortController();

  constructor(
    private readonly camera: ExplorerCamera,
    private readonly onReset: () => void,
    private readonly onToggleHelp: () => void,
  ) {
    const options = { signal: this.abortController.signal };

    window.addEventListener("keydown", (event) => {
      if (event.code === "KeyR") this.onReset();
      if (event.code === "KeyH") this.onToggleHelp();
    }, options);

    window.addEventListener("flightmodechange", (event) => {
      const detail = (event as CustomEvent<{ mode: FlightMode }>).detail;
      window.dispatchEvent(new CustomEvent("navigationstate", { detail: { ...detail } }));
    }, options);
  }

  get mode(): FlightMode {
    return this.camera.flightMode;
  }

  dispose() {
    this.abortController.abort();
  }
}
