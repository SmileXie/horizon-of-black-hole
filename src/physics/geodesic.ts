import { Vector3 } from "three";

export function schwarzschildPhotonAcceleration(
  position: Vector3,
  velocity: Vector3,
  target = new Vector3(),
): Vector3 {
  const angularMomentum = new Vector3().crossVectors(position, velocity);
  const radius = position.length();
  const coefficient =
    (-3 * angularMomentum.lengthSq()) / Math.pow(radius, 5);

  return target.copy(position).multiplyScalar(coefficient);
}
