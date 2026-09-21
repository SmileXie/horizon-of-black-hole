import { Matrix4, Vector2, Vector3 } from "three";
import { STAR_FIELD_GLSL } from "./StarField";

export const BLACK_HOLE_VERTEX_SHADER = /* glsl */ `
varying vec2 vNdc;

void main() {
  vNdc = position.xy;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

export const BLACK_HOLE_FRAGMENT_SHADER = /* glsl */ `
precision highp float;

varying vec2 vNdc;

uniform float uTime;
uniform float uGravityStrength;
uniform float uDiskInner;
uniform float uDiskOuter;
uniform int uMaxSteps;
uniform vec2 uResolution;
uniform vec3 uCameraPosition;
uniform mat4 uCameraWorldMatrix;
uniform mat4 uInverseProjectionMatrix;

const float MAX_STEPS = 144.0;
const float ESCAPE_RADIUS = 90.0;

${STAR_FIELD_GLSL}

vec3 photonAcceleration(vec3 position, float angularMomentumSquared) {
  float radiusSquared = dot(position, position);
  float radius = sqrt(radiusSquared);
  return position * (-3.0 * angularMomentumSquared / (radiusSquared * radiusSquared * radius));
}

vec3 blackbodyColor(float temperature) {
  float t = clamp(temperature, 0.08, 3.2);
  vec3 cool = vec3(1.0, 0.20, 0.035);
  vec3 warm = vec3(1.0, 0.52, 0.12);
  vec3 yellowWhite = vec3(1.0, 0.86, 0.58);
  vec3 white = vec3(1.0, 0.97, 0.92);
  vec3 blueWhite = vec3(0.72, 0.84, 1.0);

  vec3 color = mix(cool, warm, smoothstep(0.08, 0.45, t));
  color = mix(color, yellowWhite, smoothstep(0.45, 1.05, t));
  color = mix(color, white, smoothstep(1.05, 1.85, t));
  return mix(color, blueWhite, smoothstep(1.85, 3.2, t));
}

vec4 sampleAccretionDisk(vec3 hitPosition, vec3 rayDirection) {
  float radius = length(hitPosition.xz);
  float radialWindow = smoothstep(uDiskInner, uDiskInner + 1.3, radius)
    * (1.0 - smoothstep(uDiskOuter - 6.0, uDiskOuter, radius));

  if (radialWindow <= 0.001) {
    return vec4(0.0);
  }

  float angle = atan(hitPosition.z, hitPosition.x);
  float angularVelocity = 3.2 / pow(radius, 1.5);
  float materialAngle = angle - uTime * angularVelocity;
  vec3 materialPosition = vec3(
    cos(materialAngle) * radius,
    hitPosition.y,
    sin(materialAngle) * radius
  );

  float largeTurbulence = fbm(vec3(materialPosition.xz * 0.32, radius * 0.10));
  float fineTurbulence = fbm(vec3(materialPosition.xz * 1.20, radius * 0.28 + uTime * 0.05));
  float filament = pow(max(largeTurbulence * 1.20 - fineTurbulence * 0.20, 0.0), 1.7);
  float density = radialWindow * (0.18 + 1.55 * filament);

  float temperature = pow(uDiskInner / radius, 0.72);
  vec3 orbitalVelocity = normalize(vec3(-hitPosition.z, 0.0, hitPosition.x));
  float beta = clamp(sqrt(1.0 / radius), 0.02, 0.72);
  float directionAlignment = dot(orbitalVelocity, -rayDirection);
  float dopplerFactor = sqrt(1.0 - beta * beta)
    / (1.0 - beta * directionAlignment);
  float gravitationalFactor = sqrt(max(1.0 - 2.0 / radius, 0.025));
  float observedShift = dopplerFactor * gravitationalFactor;
  float observedTemperature = temperature * observedShift;

  float brightness = pow(temperature, 3.1)
    * pow(max(dopplerFactor, 0.02), 3.0)
    * pow(max(gravitationalFactor, 0.02), 2.0)
    * density * 0.58;

  vec3 color = blackbodyColor(observedTemperature) * brightness * 1.65;
  float opacity = clamp(density * 0.36, 0.0, 0.88);
  return vec4(max(color, vec3(0.0)), opacity);
}

void main() {
  vec4 nearPoint = uInverseProjectionMatrix * vec4(vNdc, -1.0, 1.0);
  vec4 farPoint = uInverseProjectionMatrix * vec4(vNdc, 1.0, 1.0);
  nearPoint /= nearPoint.w;
  farPoint /= farPoint.w;
  vec3 rayDirection = normalize((uCameraWorldMatrix * vec4(normalize(farPoint.xyz - nearPoint.xyz), 0.0)).xyz);

  vec3 position = uCameraPosition;
  vec3 velocity = rayDirection;
  vec3 angularMomentum = cross(position, velocity);
  float angularMomentumSquared = dot(angularMomentum, angularMomentum) * uGravityStrength;

  vec3 accumulated = vec3(0.0);
  float transmittance = 1.0;
  bool captured = false;
  bool escaped = false;
  float closestApproach = length(position);
  float nearPhotonSphereTime = 0.0;

  for (int stepIndex = 0; stepIndex < 144; stepIndex++) {
    if (stepIndex >= uMaxSteps) {
      break;
    }

    float radius = length(position);
    closestApproach = min(closestApproach, radius);
    nearPhotonSphereTime += exp(-abs(radius - 3.0) * 3.2) * clamp(radius * 0.07, 0.025, 0.62);

    if (radius < 2.0) {
      captured = true;
      break;
    }

    if (radius > ESCAPE_RADIUS && dot(position, velocity) > 0.0) {
      escaped = true;
      break;
    }

    float stepSize = clamp(radius * 0.05, 0.02, 1.8);
    vec3 oldPosition = position;
    vec3 acceleration = photonAcceleration(position, angularMomentumSquared);
    vec3 midPosition = position + velocity * (stepSize * 0.5);
    vec3 midAcceleration = photonAcceleration(midPosition, angularMomentumSquared);
    vec3 nextPosition = position + velocity * stepSize;
    vec3 nextAcceleration = photonAcceleration(nextPosition, angularMomentumSquared);

    position += velocity * stepSize + (acceleration * 0.1666667 + midAcceleration * 0.6666667 + nextAcceleration * 0.1666667) * stepSize * stepSize;
    velocity += (acceleration + 4.0 * midAcceleration + nextAcceleration) * (stepSize / 6.0);
    velocity = normalize(velocity);

    if (oldPosition.y * position.y < 0.0) {
      float crossing = oldPosition.y / (oldPosition.y - position.y);
      vec3 diskHit = mix(oldPosition, position, crossing);
      vec4 diskSample = sampleAccretionDisk(diskHit, velocity);
      accumulated += transmittance * diskSample.rgb;
      transmittance *= 1.0 - diskSample.a;

      if (transmittance < 0.02) {
        break;
      }
    }
  }

  if (escaped || !captured) {
    accumulated += transmittance * sampleUniverse(normalize(velocity));
  }

  gl_FragColor = vec4(accumulated, 1.0);
}
`;

export function createBlackHoleShaderUniforms() {
  return {
    uTime: { value: 0 },
    uGravityStrength: { value: 1 },
    uDiskInner: { value: 6 },
    uDiskOuter: { value: 24 },
    uMaxSteps: { value: 64 },
    uResolution: { value: new Vector2(1, 1) },
    uCameraPosition: { value: new Vector3() },
    uCameraWorldMatrix: { value: new Matrix4() },
    uInverseProjectionMatrix: { value: new Matrix4() },
  };
}
