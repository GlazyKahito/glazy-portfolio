"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { AdaptiveDpr, Environment, Float, Lightformer } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { glazeFragment, glazeVertex } from "@/components/3d/glaze-shader";
import type { SceneProps } from "@/components/3d/CanvasGate";
import { usePointer } from "@/lib/hooks/use-pointer";
import { lerp } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Glazed surface                                                       */
/* ------------------------------------------------------------------ */
function GlazePlane({ scroll, tier, reduced }: Pick<SceneProps, "scroll" | "tier" | "reduced">) {
  const pointer = usePointer();
  const viewport = useThree((s) => s.viewport);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: glazeVertex,
        fragmentShader: glazeFragment,
        uniforms: {
          uTime: { value: 0 },
          uMouse: { value: new THREE.Vector2(0.15, 0.1) },
          uAspect: { value: 1 },
          uScroll: { value: 0 },
          uOctaves: { value: tier === "high" ? 5 : 4 },
          uReveal: { value: 0 },
        },
        depthWrite: false,
      }),
    [tier],
  );
  const mouse = useRef(new THREE.Vector2(0.15, 0.1));
  const mesh = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    const mat = mesh.current?.material as THREE.ShaderMaterial | undefined;
    if (!mat) return;
    const u = mat.uniforms;
    u.uTime.value += Math.min(delta, 0.05) * (reduced ? 0.15 : 1);
    u.uAspect.value = viewport.width / viewport.height;
    u.uScroll.value = scroll?.get() ?? 0;
    u.uReveal.value = Math.min(1, u.uReveal.value + delta * 0.6);
    const target = pointer.active ? pointer : { nx: 0.15, ny: -0.1 };
    mouse.current.x = lerp(mouse.current.x, target.nx, 0.05);
    mouse.current.y = lerp(mouse.current.y, -target.ny, 0.05);
    u.uMouse.value.copy(mouse.current);
  });

  return (
    <mesh ref={mesh} position={[0, 0, -0.5]} material={material} frustumCulled={false}>
      <planeGeometry args={[viewport.width * 1.15, viewport.height * 1.15, 1, 1]} />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/* Floating shards                                                      */
/* ------------------------------------------------------------------ */
const SHARDS = [
  { kind: "ico", position: [2.9, 1.15, 0.3], scale: 0.85, rotation: [0.4, 0.2, 0.1], speed: 1.1, depth: 1.0 },
  { kind: "slab", position: [2.3, -1.75, 0.9], scale: 1, rotation: [0.9, -0.5, 0.3], speed: 0.8, depth: 1.6 },
  { kind: "oct", position: [-3.3, -1.4, -0.4], scale: 0.62, rotation: [0.2, 0.7, 0.4], speed: 1.3, depth: 0.7 },
  { kind: "dodeca", position: [-2.7, 1.9, -0.7], scale: 0.42, rotation: [0.6, 0.1, 0.8], speed: 1.6, depth: 0.5 },
] as const;

function ShardGeometry({ kind }: { kind: (typeof SHARDS)[number]["kind"] }) {
  switch (kind) {
    case "ico":
      return <icosahedronGeometry args={[1, 0]} />;
    case "oct":
      return <octahedronGeometry args={[1, 0]} />;
    case "dodeca":
      return <dodecahedronGeometry args={[1, 0]} />;
    case "slab":
      return <boxGeometry args={[1.7, 0.07, 1.05]} />;
  }
}

function Shards({ scroll, tier, reduced }: Pick<SceneProps, "scroll" | "tier" | "reduced">) {
  const group = useRef<THREE.Group>(null);
  const pointer = usePointer();
  const current = useRef({ x: 0, y: 0 });

  useFrame((_, delta) => {
    if (!group.current) return;
    const s = scroll?.get() ?? 0;
    current.current.x = lerp(current.current.x, pointer.nx, 0.04);
    current.current.y = lerp(current.current.y, pointer.ny, 0.04);
    group.current.rotation.y = current.current.x * 0.12;
    group.current.rotation.x = current.current.y * 0.08;
    group.current.position.y = -s * 2.2;
    group.current.position.z = -s * 1.5;
    // Keep material time cheap: rotate whole group slowly.
    group.current.rotation.z += delta * 0.01;
  });

  return (
    <group ref={group}>
      {SHARDS.map((shard, i) => (
        <Float
          key={i}
          speed={reduced ? 0 : shard.speed}
          rotationIntensity={reduced ? 0 : 0.6}
          floatIntensity={reduced ? 0 : 0.9}
          floatingRange={[-0.15, 0.15]}
        >
          <mesh
            position={shard.position as unknown as THREE.Vector3Tuple}
            rotation={shard.rotation as unknown as THREE.EulerTuple}
            scale={shard.scale}
            castShadow={false}
            receiveShadow={false}
          >
            <ShardGeometry kind={shard.kind} />
            <meshPhysicalMaterial
              color="#34343c"
              metalness={0.75}
              roughness={0.3}
              clearcoat={1}
              clearcoatRoughness={0.08}
              iridescence={tier === "high" ? 1 : 0.7}
              iridescenceIOR={1.4}
              iridescenceThicknessRange={[140, 520]}
              envMapIntensity={2.4}
              flatShading
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Lights                                                               */
/* ------------------------------------------------------------------ */
function KeyLight() {
  const light = useRef<THREE.PointLight>(null);
  const pointer = usePointer();
  useFrame(() => {
    if (!light.current) return;
    light.current.position.x = lerp(light.current.position.x, pointer.nx * 4.5, 0.05);
    light.current.position.y = lerp(light.current.position.y, -pointer.ny * 3, 0.05);
  });
  return <pointLight ref={light} position={[1, 1, 3.2]} intensity={16} color="#ff3b30" distance={14} decay={2} />;
}

/* ------------------------------------------------------------------ */
/* Scene                                                                */
/* ------------------------------------------------------------------ */
export function HeroScene({ scroll, active, tier, reduced = false }: SceneProps) {
  return (
    <Canvas
      className="!absolute inset-0"
      camera={{ position: [0, 0, 6], fov: 42, near: 0.1, far: 30 }}
      dpr={[1, tier === "high" ? 1.75 : 1.25]}
      frameloop={active ? "always" : "never"}
      performance={{ min: 0.5 }}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.05,
      }}
      style={{ pointerEvents: "none" }}
    >
      <color attach="background" args={["#050506"]} />
      <AdaptiveDpr pixelated />
      <GlazePlane scroll={scroll} tier={tier} reduced={reduced} />
      <ambientLight intensity={0.25} />
      <KeyLight />
      <directionalLight position={[-4, 3, 2]} intensity={1.2} color="#ffd9a8" />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={5} position={[0, 5, -1]} scale={[10, 2, 1]} color="#f5f5f7" />
        <Lightformer form="rect" intensity={3} position={[-6, 1, 2]} rotation-y={Math.PI / 2} scale={[3, 8, 1]} color="#ff2d1a" />
        <Lightformer form="rect" intensity={2.5} position={[6, -1, 2]} rotation-y={-Math.PI / 2} scale={[3, 8, 1]} color="#ffd9a8" />
        <Lightformer form="ring" intensity={1.6} position={[0, -4, 3]} scale={4} color="#8fa9ff" />
        {/* Soft fill so faces that reflect nothing bright still read as a surface. */}
        <Lightformer form="rect" intensity={0.9} position={[0, 0, -9]} scale={[24, 24, 1]} color="#3a3a44" />
      </Environment>
      <Shards scroll={scroll} tier={tier} reduced={reduced} />
    </Canvas>
  );
}
