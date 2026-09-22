import { Euler, PerspectiveCamera, Vector3 } from "three";

const LIGHT_SPEED_VISUAL_SCALE = 38;
const MAX_NAVIGATION_SPEED = 37;
const APPROACH_SPEED = 5;

export function clampNavigationSpeed(speed: number) {
  return Math.min(speed, MAX_NAVIGATION_SPEED);
}

export class ExplorerCamera {
  readonly camera: PerspectiveCamera;
  readonly canvas: HTMLCanvasElement;

  speedMultiplier = 1;
  velocity = new Vector3();
  pointerLocked = false;

  private keys = new Set<string>();
  private yaw: number;
  private pitch: number;
  private targetVelocity = new Vector3();
  private euler = new Euler(0, 0, 0, "YXZ");
  private forward = new Vector3();
  private right = new Vector3();
  private up = new Vector3();
  private eventTarget: EventTarget = window;
  private abortController = new AbortController();

  constructor(camera: PerspectiveCamera, canvas: HTMLCanvasElement) {
    this.camera = camera;
    this.canvas = canvas;

    const direction = new Vector3(0, 0, 0)
      .sub(camera.position)
      .normalize();
    this.pitch = Math.asin(direction.y);
    this.yaw = Math.atan2(-direction.x, -direction.z);
    this.applyOrientation();

    this.bindEvents();
  }

  get baseSpeed() {
    return clampNavigationSpeed(APPROACH_SPEED * this.speedMultiplier);
  }

  get speedAsFractionOfC() {
    return this.velocity.length() / LIGHT_SPEED_VISUAL_SCALE;
  }

  reset(initialPosition: Vector3) {
    this.camera.position.copy(initialPosition);
    const direction = new Vector3(0, 0, 0)
      .sub(initialPosition)
      .normalize();
    this.pitch = Math.asin(direction.y);
    this.yaw = Math.atan2(-direction.x, -direction.z);
    this.velocity.set(0, 0, 0);
    this.targetVelocity.set(0, 0, 0);
    this.applyOrientation();
  }

  update(deltaTime: number) {
    this.updateVectors();
    this.targetVelocity.set(0, 0, 0);
    const speed = this.baseSpeed;

    if (this.keys.has("KeyW")) this.targetVelocity.addScaledVector(this.forward, speed);
    if (this.keys.has("KeyS")) this.targetVelocity.addScaledVector(this.forward, -speed);
    if (this.keys.has("KeyD")) this.targetVelocity.addScaledVector(this.right, speed);
    if (this.keys.has("KeyA")) this.targetVelocity.addScaledVector(this.right, -speed);
    if (this.keys.has("KeyE")) this.targetVelocity.addScaledVector(this.up, speed);
    if (this.keys.has("KeyQ")) this.targetVelocity.addScaledVector(this.up, -speed);

    const smoothing = 1 - Math.exp(-deltaTime * 7);
    this.velocity.lerp(this.targetVelocity, smoothing);
    this.camera.position.addScaledVector(this.velocity, deltaTime);

    const radius = this.camera.position.length();
    if (radius < 2.18) {
      this.camera.position.setLength(2.18);
      this.velocity.multiplyScalar(0.05);
      this.emit("horizonproximity", {});
    }

    this.camera.updateMatrixWorld();
  }

  dispose() {
    this.abortController.abort();
  }

  private bindEvents() {
    const options = { signal: this.abortController.signal };

    this.canvas.addEventListener("click", () => {
      if (!this.pointerLocked) void this.canvas.requestPointerLock();
    }, options);

    document.addEventListener("pointerlockchange", () => {
      this.pointerLocked = document.pointerLockElement === this.canvas;
      this.emit("pointerlockchange", { locked: this.pointerLocked });
    }, options);

    document.addEventListener("mousemove", (event) => {
      if (!this.pointerLocked) return;
      const sensitivity = 0.0018;
      this.yaw -= event.movementX * sensitivity;
      this.pitch = Math.max(-1.53, Math.min(1.53, this.pitch - event.movementY * sensitivity));
      this.applyOrientation();
    }, options);

    window.addEventListener("keydown", (event) => {
      if (["KeyW", "KeyA", "KeyS", "KeyD", "KeyQ", "KeyE"].includes(event.code)) {
        this.keys.add(event.code);
      }

    }, options);

    window.addEventListener("keyup", (event) => {
      this.keys.delete(event.code);
    }, options);

    this.canvas.addEventListener("wheel", (event) => {
      event.preventDefault();
      const delta = event.deltaY > 0 ? 0.88 : 1.14;
      this.speedMultiplier = Math.max(0.16, Math.min(4.2, this.speedMultiplier * delta));
      this.emit("speedchange", { multiplier: this.speedMultiplier });
    }, { ...options, passive: false });
  }

  private updateVectors() {
    this.applyOrientation();
    this.forward.set(0, 0, -1).applyQuaternion(this.camera.quaternion).normalize();
    this.right.set(1, 0, 0).applyQuaternion(this.camera.quaternion).normalize();
    this.up.set(0, 1, 0).applyQuaternion(this.camera.quaternion).normalize();
  }

  private applyOrientation() {
    this.euler.set(this.pitch, this.yaw, 0);
    this.camera.quaternion.setFromEuler(this.euler);
    this.camera.updateMatrixWorld();
  }

  private emit(type: string, detail: unknown) {
    this.eventTarget.dispatchEvent(new CustomEvent(type, { detail }));
  }
}
