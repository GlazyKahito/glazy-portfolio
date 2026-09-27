/**
 * "Glaze" surface shader.
 *
 * A domain-warped noise height field, lit by a key light that follows the
 * pointer. Specular highlights are coloured by a thin-film interference
 * palette, so the surface reads like light on a glazed, slightly liquid
 * obsidian slab rather than a flat gradient.
 */
export const glazeVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const glazeFragment = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform vec2 uMouse;      // -1..1, y up
  uniform float uAspect;
  uniform float uScroll;    // 0..1
  uniform float uOctaves;   // 3..5
  uniform float uReveal;    // 0..1 entrance
  varying vec2 vUv;

  vec2 hash2(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(dot(hash2(i), f), dot(hash2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
      mix(dot(hash2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)), dot(hash2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
    for (int i = 0; i < 5; i++) {
      if (float(i) >= uOctaves) break;
      v += a * noise(p);
      p = m * p;
      a *= 0.5;
    }
    return v;
  }

  float field(vec2 p, float t) {
    vec2 q = vec2(fbm(p + t * 0.05), fbm(p + vec2(5.2, 1.3) - t * 0.04));
    vec2 r = vec2(fbm(p + 2.6 * q + vec2(1.7, 9.2) + t * 0.06), fbm(p + 2.6 * q + vec2(8.3, 2.8) - t * 0.03));
    return fbm(p + 2.2 * r);
  }

  // Thin-film interference palette biased warm: white → rosso → amber glints.
  vec3 film(float x) {
    return 0.5 + 0.5 * cos(6.28318 * (x + vec3(0.00, 0.09, 0.18)));
  }

  void main() {
    vec2 uv = vUv;
    // Large, slow features: this should read as a slab of black glass, not noise.
    vec2 p = (uv - 0.5) * vec2(uAspect, 1.0) * 1.05;
    float t = uTime;
    vec2 m = uMouse * vec2(uAspect, 1.0) * 0.6;

    float h = field(p, t);

    // Screen-space derivatives give a cheap surface normal.
    float hx = dFdx(h);
    float hy = dFdy(h);
    vec3 n = normalize(vec3(-hx * 70.0, -hy * 70.0, 1.0));

    vec3 V = vec3(0.0, 0.0, 1.0);

    // Key light follows the pointer.
    vec3 L = normalize(vec3(m - p, 0.8));
    vec3 H = normalize(L + V);
    float diff = max(dot(n, L), 0.0);
    float spec = pow(max(dot(n, H), 0.0), 64.0);

    // Fixed rim light from the top-left keeps the surface legible without the pointer.
    vec3 L2 = normalize(vec3(-0.6, 0.9, 0.55));
    float spec2 = pow(max(dot(n, normalize(L2 + V)), 0.0), 110.0);

    float fres = pow(1.0 - max(dot(n, V), 0.0), 3.0);
    float dist = length(p - m);
    float glow = exp(-dist * dist * 1.6);

    vec3 base = vec3(0.026, 0.026, 0.031);
    // Mostly white glints with a restrained thin-film shimmer.
    vec3 iri = film(h * 1.2 + fres * 0.6 + t * 0.01);
    vec3 tint = mix(vec3(0.96, 0.96, 0.98), iri, 0.26);

    vec3 col = base;
    col += diff * 0.028 * vec3(0.85, 0.92, 1.0) * (0.3 + glow);
    col += spec * tint * (0.35 + 0.6 * glow);
    col += spec2 * vec3(1.0, 0.93, 0.84) * 0.16;
    col += fres * iri * 0.03;

    // Faint glaze bands where the field crosses a threshold.
    float bands = smoothstep(0.40, 0.49, h) * smoothstep(0.62, 0.53, h);
    col += bands * tint * 0.02 * (0.5 + glow);

    // Vignette and scroll fade.
    float vig = smoothstep(1.45, 0.3, length((uv - 0.5) * vec2(uAspect, 1.0) * 1.35));
    col *= mix(0.7, 1.0, vig);
    col *= 1.0 - uScroll * 0.65;

    // Entrance: light rises from below.
    float reveal = smoothstep(0.0, 1.0, uReveal);
    col = mix(base * 0.6, col, reveal);

    // Ordered dither to avoid banding in the darks.
    float d = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
    col += (d - 0.5) * 0.008;

    gl_FragColor = vec4(col, 1.0);
  }
`;
