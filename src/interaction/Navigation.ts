export class Navigation {
  private abortController = new AbortController();

  constructor(
    private readonly onReset: () => void,
    private readonly onToggleHelp: () => void,
  ) {
    const options = { signal: this.abortController.signal };

    window.addEventListener("keydown", (event) => {
      if (event.code === "KeyR") this.onReset();
      if (event.code === "KeyH") this.onToggleHelp();
    }, options);

  }

  dispose() {
    this.abortController.abort();
  }
}
