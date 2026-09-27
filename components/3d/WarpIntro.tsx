"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useState, type RefObject } from "react";
import * as THREE from "three";

/**
 * Warp tunnel for the opening sequence, after the DCN Virtual Lab's intro:
 * an instanced field of light streaks rushing past the camera, rings for
 * depth, a barrel roll that tightens with speed, then a collapse onto the
 * vanishing point as the wordmark forms.
 *
 * The parent owns time (`elapsed`, seconds); the choreography lives here.
 */
export interface WarpClock {
  t: number;
}

const RING_COUNT = 14;
const PACKET_RATIO = 0.1;
const UNITS_PER_SECOND = 7;
const tmpObject = new THREE.Object3D();
const tmpColor = new THREE.Color();

const lerp = (a: number, b: number, t: number) => a + (b - a) * Math.min(1, Math.max(0, t));

function choreography(t: number) {
  const speed = t < 0.25 ? 1 : t < 1.3 ? lerp(1, 6.5, (t - 0.25) / 1.05) : t < 1.8 ? 6.5 : lerp(6.5, 0.6, (t - 1.8) / 0.8);
  const collapse = t < 1.65 ? 0 : lerp(0, 1, (t - 1.65) / 0.6);
  const intensity = t < 0.45 ? lerp(0, 1, t / 0.45) : t < 2.2 ? 1 : lerp(1, 0, (t - 2.2) / 0.6);
  return { speed, collapse, intensity };
}

function autoCount() {
  if (typeof window === "undefined") return 300;
  const cores = navigator.hardwareConcurrency ?? 8;
  if (window.innerWidth < 768) return 160;
  if (cores <= 4) return 220;
  return 380;
}

interface TunnelData {
  angle: Float32Array;
  r: Float32Array;
  z: Float32Array;
  length: Float32Array;
  velocity: Float32Array;
  packet: Uint8Array;
  base: THREE.Color[];
  ringZ: Float32Array;
  ringSpin: Float32Array;
  ringColor: THREE.Color;
}

/** Randomised streak field. Called from the frame loop, never during render. */
function buildData(count: number, radius: number, depth: number): TunnelData {
  const angle = new Float32Array(count);
  const r = new Float32Array(count);
  const z = new Float32Array(count);
  const length = new Float32Array(count);
  const velocity = new Float32Array(count);
  const packet = new Uint8Array(count);
  const base: THREE.Color[] = [];
  const bone = new THREE.Color("#f5f5f7");
  const rosso = new THREE.Color("#ff2d1a");
  for (let i = 0; i < count; i++) {
    angle[i] = Math.random() * Math.PI * 2;
    r[i] = radius * (0.55 + Math.random() * 0.6);
    z[i] = -Math.random() * depth;
    packet[i] = Math.random() < PACKET_RATIO ? 1 : 0;
    length[i] = packet[i] ? 0.35 + Math.random() * 0.3 : 0.5 + Math.random() * 1.4;
    velocity[i] = packet[i] ? 1.35 + Math.random() * 0.4 : 0.75 + Math.random() * 0.5;
    base.push(packet[i] ? bone.clone() : bone.clone().lerp(rosso, Math.random() * 0.9));
  }
  const ringZ = new Float32Array(RING_COUNT);
  const ringSpin = new Float32Array(RING_COUNT);
  for (let i = 0; i < RING_COUNT; i++) {
    ringZ[i] = -(i / RING_COUNT) * depth;
    ringSpin[i] = Math.random() * Math.PI * 2;
  }
  return { angle, r, z, length, velocity, packet, base, ringZ, ringSpin, ringColor: bone.clone().lerp(rosso, 0.6) };
}

function Tunnel({ clock, radius = 3, depth = 60 }: { clock: RefObject<WarpClock>; radius?: number; depth?: number }) {
  const streaks = useRef<THREE.InstancedMesh>(null);
  const rings = useRef<THREE.InstancedMesh>(null);
  const [count] = useState(() => autoCount());
  const live = useRef({ speed: 1, intensity: 0, collapse: 0, roll: 0 });
  const dataRef = useRef<TunnelData | null>(null);

  useFrame((state, delta) => {
    const s = streaks.current;
    const g = rings.current;
    if (!s || !g) return;
    if (!dataRef.current) dataRef.current = buildData(count, radius, depth);
    const data = dataRef.current;
    const dt = Math.min(delta, 1 / 20);
    const target = choreography(clock.current?.t ?? 0);
    const L = live.current;
    L.speed += (target.speed - L.speed) * (1 - Math.exp(-dt * 2.6));
    L.intensity += (target.intensity - L.intensity) * (1 - Math.exp(-dt * 3.2));
    L.collapse += (target.collapse - L.collapse) * (1 - Math.exp(-dt * 4.5));
    const squeeze = 1 - 0.92 * L.collapse * L.collapse;
    const travel = L.speed * UNITS_PER_SECOND * dt;
    const stretch = 1 + Math.min(L.speed, 8) * 1.1;
    const energy = 0.35 + (Math.min(L.speed, 6) / 6) * 0.65;
    const { angle, r, z, length, velocity, packet, base } = data;

    for (let i = 0; i < count; i++) {
      z[i] += travel * velocity[i];
      if (z[i] > 0.5) {
        z[i] -= depth;
        angle[i] = Math.random() * Math.PI * 2;
      }
      const len = length[i] * (packet[i] ? 1 + (stretch - 1) * 0.35 : stretch);
      const thick = packet[i] ? 0.024 : 0.016;
      tmpObject.position.set(Math.cos(angle[i]) * r[i] * squeeze, Math.sin(angle[i]) * r[i] * squeeze, z[i] - len / 2);
      tmpObject.rotation.set(0, 0, 0);
      tmpObject.scale.set(thick, thick, len);
      tmpObject.updateMatrix();
      s.setMatrixAt(i, tmpObject.matrix);
      const near = 1 + z[i] / depth;
      const closeFade = Math.min(1, -z[i] / 4);
      const fade = near * near * closeFade * L.intensity * energy * (packet[i] ? 1.5 : 1);
      tmpColor.copy(base[i]).multiplyScalar(fade);
      s.setColorAt(i, tmpColor);
    }
    s.instanceMatrix.needsUpdate = true;
    if (s.instanceColor) s.instanceColor.needsUpdate = true;

    for (let i = 0; i < RING_COUNT; i++) {
      data.ringZ[i] += travel * 0.9;
      if (data.ringZ[i] > 0) data.ringZ[i] -= depth;
      data.ringSpin[i] += dt * 0.15;
      tmpObject.position.set(0, 0, data.ringZ[i]);
      tmpObject.rotation.set(0, 0, data.ringSpin[i]);
      tmpObject.scale.setScalar(radius * 1.22 * squeeze);
      tmpObject.updateMatrix();
      g.setMatrixAt(i, tmpObject.matrix);
      const near = 1 + data.ringZ[i] / depth;
      tmpColor.copy(data.ringColor).multiplyScalar(near * near * 0.22 * L.intensity);
      g.setColorAt(i, tmpColor);
    }
    g.instanceMatrix.needsUpdate = true;
    if (g.instanceColor) g.instanceColor.needsUpdate = true;

    L.roll += dt * (0.02 + L.speed * 0.012);
    state.camera.rotation.z = L.roll;
  });

  return (
    <>
      <color attach="background" args={["#050506"]} />
      <instancedMesh ref={streaks} args={[undefined, undefined, count]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={rings} args={[undefined, undefined, RING_COUNT]} frustumCulled={false}>
        <ringGeometry args={[1, 1.004, 96, 1, 0, Math.PI * 1.35]} />
        <meshBasicMaterial transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} side={THREE.DoubleSide} />
      </instancedMesh>
    </>
  );
}

export function WarpIntro({ clock }: { clock: RefObject<WarpClock> }) {
  return (
    <Canvas
      className="!absolute inset-0"
      camera={{ position: [0, 0, 0.1], fov: 70, near: 0.05, far: 80 }}
      dpr={[1, 1.5]}
      gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
      style={{ pointerEvents: "none" }}
    >
      <Tunnel clock={clock} />
    </Canvas>
  );
}
