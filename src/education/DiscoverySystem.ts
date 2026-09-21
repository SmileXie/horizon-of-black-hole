import type { KnowledgeRecord } from "./KnowledgeDatabase";
import { Vector3 } from "three";

interface TriggerCondition {
  id: string;
  maximumDistance?: number;
  minimumDistance?: number;
  minimumCenterAlignment?: number;
  delaySeconds?: number;
}

const TRIGGERS: TriggerCondition[] = [
  { id: "gravitational-lensing", delaySeconds: 2.2 },
  { id: "accretion-disk", maximumDistance: 34, minimumCenterAlignment: 0.18 },
  { id: "black-hole-shadow", maximumDistance: 24, minimumCenterAlignment: 0.58 },
  { id: "photon-ring", maximumDistance: 20, minimumCenterAlignment: 0.58 },
  { id: "doppler-beaming", maximumDistance: 28, minimumCenterAlignment: 0.12 },
  { id: "photon-sphere", maximumDistance: 16, minimumCenterAlignment: 0.45 },
  { id: "gravitational-redshift", maximumDistance: 12, minimumCenterAlignment: 0.3 },
  { id: "event-horizon", maximumDistance: 8, minimumCenterAlignment: 0.35 },
  { id: "time-dilation", maximumDistance: 9, minimumCenterAlignment: 0.2 },
];

export class DiscoverySystem {
  private readonly discovered = new Set<string>();
  private readonly abortController = new AbortController();
  private currentRecord: KnowledgeRecord | null = null;
  private cooldown = 0;
  private elapsed = 0;

  private readonly card: HTMLElement;
  private readonly tag: HTMLElement;
  private readonly title: HTMLElement;
  private readonly explanation: HTMLElement;
  private readonly detail: HTMLElement;
  private readonly detailTitle: HTMLElement;
  private readonly detailBody: HTMLElement;
  private readonly detailLabel: HTMLElement;

  constructor(
    private readonly root: HTMLElement,
    private readonly records: Record<string, KnowledgeRecord>,
  ) {
    this.root.insertAdjacentHTML("beforeend", `
      <section class="discovery" id="discovery-card" aria-live="polite">
        <small>NEW PHENOMENON</small>
        <h3 id="discovery-title"></h3>
        <p id="discovery-explanation"></p>
        <div class="control-row">
          <button id="learn-more">LEARN MORE</button>
          <button id="dismiss-discovery">CONTINUE</button>
        </div>
      </section>
      <section class="knowledge" id="knowledge-panel" aria-modal="true" role="dialog">
        <button class="close" id="close-knowledge" aria-label="Close">×</button>
        <small>SCIENTIFIC CONTEXT</small>
        <h2 id="knowledge-title"></h2>
        <span class="accuracy" id="knowledge-label"></span>
        <p id="knowledge-body"></p>
      </section>
    `);

    this.card = this.require("#discovery-card");
    this.tag = this.require("#discovery-card small");
    this.title = this.require("#discovery-title");
    this.explanation = this.require("#discovery-explanation");
    this.detail = this.require("#knowledge-panel");
    this.detailTitle = this.require("#knowledge-title");
    this.detailBody = this.require("#knowledge-body");
    this.detailLabel = this.require("#knowledge-label");

    this.require("#learn-more").addEventListener("click", () => {
      if (this.currentRecord) this.openKnowledge(this.currentRecord);
    }, { signal: this.abortController.signal });

    this.require("#dismiss-discovery").addEventListener("click", () => {
      this.hideCard();
    }, { signal: this.abortController.signal });

    this.require("#close-knowledge").addEventListener("click", () => {
      this.closeKnowledge();
    }, { signal: this.abortController.signal });

    window.addEventListener("keydown", (event) => {
      if (event.code === "Escape") this.closeKnowledge();
    }, { signal: this.abortController.signal });
  }

  update(
    deltaTime: number,
    distance: number,
    position: { x: number; y: number; z: number },
    cameraDirection: { x: number; y: number; z: number },
  ) {
    this.elapsed += deltaTime;
    this.cooldown = Math.max(0, this.cooldown - deltaTime);
    if (this.cooldown > 0 || this.card.classList.contains("visible")) return;

    for (const trigger of TRIGGERS) {
      if (this.discovered.has(trigger.id)) continue;
      if (trigger.delaySeconds) {
        if (this.elapsed >= trigger.delaySeconds) {
          this.discover(trigger.id);
          break;
        }
        continue;
      }

      const distancePass = (!trigger.maximumDistance || distance <= trigger.maximumDistance)
        && (!trigger.minimumDistance || distance >= trigger.minimumDistance);
      const alignment = trigger.minimumCenterAlignment
        ? this.viewAlignment(position, cameraDirection, trigger.minimumCenterAlignment)
        : true;

      if (distancePass && alignment) {
        this.discover(trigger.id);
        break;
      }
    }
  }

  hideCard() {
    this.card.classList.remove("visible");
    this.cooldown = 2.2;
  }

  closeKnowledge() {
    this.detail.classList.remove("open");
  }

  dispose() {
    this.abortController.abort();
  }

  private viewAlignment(
    position: { x: number; y: number; z: number },
    cameraDirection: { x: number; y: number; z: number },
    minimum: number,
  ) {
    const viewDirection = new Vector3(cameraDirection.x, cameraDirection.y, cameraDirection.z);
    const positionVector = new Vector3(position.x, position.y, position.z);
    if (viewDirection.lengthSq() === 0 || positionVector.lengthSq() === 0) return false;

    const towardCenter = positionVector.multiplyScalar(-1).normalize();
    return viewDirection.normalize().dot(towardCenter) >= minimum;
  }

  private discover(id: string) {
    const record = this.records[id];
    if (!record) return;

    this.discovered.add(id);
    this.currentRecord = record;
    this.tag.textContent = "NEW PHENOMENON";
    this.title.textContent = record.title;
    this.explanation.textContent = record.shortExplanation;
    this.card.classList.add("visible");
    this.cooldown = 6;
  }

  openKnowledge(record: KnowledgeRecord) {
    this.detailTitle.textContent = record.title;
    this.detailBody.textContent = record.detail;
    this.detailLabel.textContent = record.accuracyLabel;
    this.detail.classList.add("open");
  }

  private require(selector: string) {
    const element = this.root.querySelector<HTMLElement>(selector);
    if (!element) throw new Error(`Missing discovery element: ${selector}`);
    return element;
  }
}
