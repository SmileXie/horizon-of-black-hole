export const STAR_FIELD_GLSL = /* glsl */ `
float hash13(vec3 seed) {
  vec3 p = fract(seed * 0.1031);
  p += dot(p, p.zyx + 31.32);
  return fract((p.x + p.y) * p.z);
}

vec3 hash33(vec3 seed) {
  vec3 p = fract(seed * vec3(0.1031, 0.1030, 0.0973));
  p += dot(p, p.yxz + 33.33);
  return fract((p.xxy + p.yxx) * p.zyx);
}

float valueNoise(vec3 p) {
  vec3 cell = floor(p);
  vec3 local = fract(p);
  vec3 smoothPoint = local * local * (3.0 - 2.0 * local);

  float n000 = hash13(cell);
  float n100 = hash13(cell + vec3(1.0, 0.0, 0.0));
  float n010 = hash13(cell + vec3(0.0, 1.0, 0.0));
  float n110 = hash13(cell + vec3(1.0, 1.0, 0.0));
  float n001 = hash13(cell + vec3(0.0, 0.0, 1.0));
  float n101 = hash13(cell + vec3(1.0, 0.0, 1.0));
  float n011 = hash13(cell + vec3(0.0, 1.0, 1.0));
  float n111 = hash13(cell + vec3(1.0, 1.0, 1.0));

  return mix(
    mix(mix(n000, n100, smoothPoint.x), mix(n010, n110, smoothPoint.x), smoothPoint.y),
    mix(mix(n001, n101, smoothPoint.x), mix(n011, n111, smoothPoint.x), smoothPoint.y),
    smoothPoint.z
  );
}

float fbm(vec3 p) {
  float sum = 0.0;
  float amplitude = 0.5;

  for (int octave = 0; octave < 5; octave++) {
    sum += amplitude * valueNoise(p);
    p *= 2.03;
    amplitude *= 0.5;
  }

  return sum;
}

vec3 starLayer(vec3 direction, float scale, float threshold, float sharpness, float intensity) {
  vec3 p = direction * scale;
  vec3 cell = floor(p);
  vec3 local = fract(p);
  vec3 random = hash33(cell);

  if (random.z < threshold) {
    return vec3(0.0);
  }

  vec3 starPosition = 0.5 + (random - 0.5) * 0.72;
  float distanceToStar = length(local - starPosition);
  float core = exp(-distanceToStar * distanceToStar * sharpness);
  float halo = exp(-distanceToStar * distanceToStar * sharpness * 0.16) * 0.16;
  float temperature = random.x;
  vec3 color = mix(vec3(1.0, 0.76, 0.52), vec3(0.68, 0.82, 1.0), temperature);
  color = mix(color, vec3(1.0), 0.24);

  return color * (core + halo) * intensity;
}

vec3 sampleUniverse(vec3 direction) {
  vec3 color = vec3(0.0);

  color += starLayer(direction, 42.0, 0.885, 520.0, 1.55);
  color += starLayer(direction, 88.0, 0.905, 860.0, 1.05);
  color += starLayer(direction, 180.0, 0.925, 1500.0, 0.55);

  float nebula = fbm(direction * 2.7 + vec3(11.3, 4.2, 7.1));
  nebula = pow(max(nebula, 0.0), 2.1);
  vec3 nebulaColor = mix(vec3(0.055, 0.10, 0.22), vec3(0.12, 0.045, 0.15), fbm(direction * 5.2));
  color += nebulaColor * nebula * 0.42;

  float galaxy = fbm(direction * 1.35 + vec3(-8.0, 3.0, 2.0));
  galaxy = smoothstep(0.68, 0.94, galaxy);
  float filament = fbm(direction * 6.0 + vec3(4.0, 1.0, 9.0));
  vec3 galaxyColor = mix(vec3(0.14, 0.14, 0.20), vec3(0.23, 0.13, 0.10), filament);
  color += galaxyColor * galaxy * 0.34;

  color += vec3(0.006, 0.008, 0.013);
  return max(color, vec3(0.0));
}
`;
