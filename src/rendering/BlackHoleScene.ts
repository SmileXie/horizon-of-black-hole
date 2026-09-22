import {
  ACESFilmicToneMapping,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  SRGBColorSpace,
  Scene,
  ShaderMaterial,
  PerspectiveCamera,
  Vector2,
  WebGLRenderer,
} from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import type { QualityPreset } from "../physics/blackHole";
import {
  BLACK_HOLE_FRAGMENT_SHADER,
  BLACK_HOLE_VERTEX_SHADER,
  createBlackHoleShaderUniforms,
} from "./BlackHoleShader";

export class BlackHoleScene {
  readonly renderer: WebGLRenderer;
  private readonly scene = new Scene();
  private readonly screenCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private readonly material: ShaderMaterial;
  private readonly composer: EffectComposer;
  private readonly bloom: UnrealBloomPass;
  private readonly drawingSize = new Vector2();
  private renderScale = 1;
  private width = window.innerWidth;
  private height = window.innerHeight;

  constructor(
    canvas: HTMLCanvasElement,
    camera: PerspectiveCamera,
    quality: QualityPreset,
  ) {
    this.renderer = new WebGLRenderer({
      canvas,
      antialias: false,
      powerPreference: "high-performance",
    });
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.outputColorSpace = SRGBColorSpace;

    this.material = new ShaderMaterial({
      vertexShader: BLACK_HOLE_VERTEX_SHADER,
      fragmentShader: BLACK_HOLE_FRAGMENT_SHADER,
      uniforms: createBlackHoleShaderUniforms(),
      depthTest: false,
      depthWrite: false,
    });
    this.scene.add(new Mesh(new PlaneGeometry(2, 2), this.material));

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.screenCamera));
    this.bloom = new UnrealBloomPass(
      new Vector2(window.innerWidth, window.innerHeight),
      quality.bloomStrength,
      0.72,
      0.76,
    );
    this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());

    this.setQuality(quality);
    this.setCamera(camera);
    this.resize(this.width, this.height);
  }

  setCamera(camera: PerspectiveCamera) {
    camera.updateMatrixWorld();
    camera.updateProjectionMatrix();
    this.material.uniforms.uCameraPosition.value.copy(camera.position);
    this.material.uniforms.uCameraWorldMatrix.value.copy(camera.matrixWorld);
    this.material.uniforms.uInverseProjectionMatrix.value.copy(camera.projectionMatrixInverse);
  }

  setQuality(quality: QualityPreset) {
    this.material.uniforms.uMaxSteps.value = quality.raySteps;
    this.renderScale = quality.renderScale;
    this.bloom.strength = quality.bloomStrength;
    this.resize(this.width, this.height);
  }

  setTime(time: number) {
    this.material.uniforms.uTime.value = time;
  }

  resize(width: number, height: number) {
    this.width = width;
    this.height = height;
    const pixelRatio = Math.min(window.devicePixelRatio, 2) * this.renderScale;
    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setSize(width, height, false);
    this.composer.setPixelRatio(pixelRatio);
    this.composer.setSize(width, height);
    this.renderer.getDrawingBufferSize(this.drawingSize);
    this.material.uniforms.uResolution.value.copy(this.drawingSize);
  }

  render() {
    this.composer.render();
  }

  dispose() {
    this.material.dispose();
    this.composer.dispose();
    this.renderer.dispose();
  }
}
