import "./style.css";
import { Clock, PerspectiveCamera, Vector3 } from "three";
import { QUALITY_PRESETS, createBlackHoleState, type QualityLevel, type QualityPreset } from "./physics/blackHole";
import { BlackHoleScene } from "./rendering/BlackHoleScene";
import { ExplorerCamera } from "./camera/ExplorerCamera";
import { Navigation } from "./interaction/Navigation";
import { ExperimentManager } from "./interaction/ExperimentManager";
import { ScientificHUD } from "./ui/ScientificHUD";
import { DiscoverySystem } from "./education/DiscoverySystem";
import { KNOWLEDGE_RECORDS } from "./education/KnowledgeDatabase";

const canvas = document.querySelector<HTMLCanvasElement>("#universe");
const appRoot = document.querySelector<HTMLElement>("#app");

if (!canvas || !appRoot) {
  throw new Error("The black hole canvas or application root is missing.");
}

const app = appRoot;

function chooseInitialQuality(): QualityLevel {
  const cores = navigator.hardwareConcurrency ?? 4;
  if (cores >= 8) return "HIGH";
  if (cores >= 4) return "MEDIUM";
  return "LOW";
}

function getQuality(level: QualityLevel): QualityPreset {
  return QUALITY_PRESETS.find((preset) => preset.label === level) ?? QUALITY_PRESETS[1];
}

function showError(message: string) {
  app.insertAdjacentHTML("beforeend", `<div class="notice">${message}</div>`);
}

try {
  const state = createBlackHoleState();
  const initialQuality = chooseInitialQuality();
  const camera = new PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.05, 1200);
  camera.position.copy(state.cameraPosition);
  camera.lookAt(0, 0, 0);

  const explorer = new ExplorerCamera(camera, canvas);
  const scene = new BlackHoleScene(canvas, camera, getQuality(initialQuality));
  const hud = new ScientificHUD(app);
  const discovery = new DiscoverySystem(app, KNOWLEDGE_RECORDS);
  let quality: QualityLevel = initialQuality;
  let debug = false;
  let fps = 60;
  let elapsed = 0;

  const resetExperience = () => {
    explorer.reset(state.cameraPosition);
  };

  const experimentManager = new ExperimentManager(app, {
    onQuality: (nextQuality) => {
      quality = nextQuality;
      scene.setQuality(getQuality(nextQuality));
    },
    onDebugToggle: () => {
      debug = experimentManager.debugEnabled;
    },
    onReset: resetExperience,
  });

  const navigation = new Navigation(
    explorer,
    resetExperience,
    () => helpPanel.classList.toggle("open"),
  );

  experimentManager.setQuality(initialQuality);

  const hint = document.createElement("div");
  hint.className = "hint";
  hint.innerHTML = `CLICK TO FLY · W A S D MOVE · Q E VERTICAL · WHEEL SPEED · F1 DIAGNOSTIC`;
  app.appendChild(hint);

  const helpPanel = document.createElement("section");
  helpPanel.className = "knowledge help-panel";
  helpPanel.innerHTML = `
    <button class="close" data-close-help aria-label="Close help">×</button>
    <small>EXPLORER MANUAL</small>
    <h2>Navigation</h2>
    <p>Click the universe to enter flight mode. Use <strong>W A S D</strong> to translate,
    <strong>Q E</strong> to descend or climb, and the mouse to look. The mouse wheel scales
    flight speed. Modes are <strong>1 Cruise</strong>, <strong>2 Approach</strong>, and
    <strong>3 Precision</strong>.</p>
    <h2>Diagnostics</h2>
    <p>Press <strong>F1</strong> for diagnostics and <strong>R</strong> to reset the camera.</p>
    <h2>Scientific note</h2>
    <p>The ray tracer uses Schwarzschild null-geodesic integration in gravitational-radius units.
    Proper-time readout applies a simplified static-observer comparison; it does not model the
    camera as a freely falling worldline.</p>
  `;
  app.appendChild(helpPanel);
  helpPanel.querySelector("[data-close-help]")?.addEventListener("click", () => {
    helpPanel.classList.remove("open");
  });

  document.addEventListener("pointerlockchange", () => {
    hint.classList.toggle("hidden", explorer.pointerLocked);
  });

  window.addEventListener("keydown", (event) => {
    if (event.code === "Escape") helpPanel.classList.remove("open");
  });

  window.addEventListener("togglehelp", () => {
    helpPanel.classList.toggle("open");
  });

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    scene.resize(window.innerWidth, window.innerHeight);
  });

  const clock = new Clock();
  const forwardDirection = new Vector3();

  function frame() {
    const deltaTime = Math.min(clock.getDelta(), 0.05);
    elapsed += deltaTime;
    fps += ((1 / Math.max(deltaTime, 0.0001)) - fps) * 0.08;

    explorer.update(deltaTime);
    state.cameraPosition.copy(camera.position);
    state.coordinateTime += deltaTime;

    const radius = camera.position.length();
    const staticObserverFactor = Math.sqrt(Math.max(1 - 2 / Math.max(radius, 2.001), 0));
    state.properTime += deltaTime * staticObserverFactor;

    scene.setCamera(camera);
    scene.setTime(elapsed);
    scene.render();

    camera.getWorldDirection(forwardDirection);
    discovery.update(deltaTime, radius, camera.position, forwardDirection);
    hud.update({
      distance: radius,
      speed: explorer.speedAsFractionOfC,
      massSolarMasses: state.massSolarMasses,
      spin: state.spin,
      coordinateTime: state.coordinateTime,
      properTime: state.properTime,
      flightMode: explorer.flightMode,
      quality,
      fps,
      raySteps: getQuality(quality).raySteps,
      renderScale: getQuality(quality).renderScale,
      debug,
    });

    requestAnimationFrame(frame);
  }

  frame();

  window.addEventListener("beforeunload", () => {
    explorer.dispose();
    navigation.dispose();
    experimentManager.dispose();
    discovery.dispose();
    scene.dispose();
  });
} catch (error) {
  console.error(error);
  showError("This experience requires WebGL2. Please open it in a recent desktop Chrome, Edge, or Firefox.");
}
