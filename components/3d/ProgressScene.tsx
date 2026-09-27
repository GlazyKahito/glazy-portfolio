"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { SceneProps } from "@/components/3d/CanvasGate";
import { usePointer } from "@/lib/hooks/use-pointer";
import { lerp } from "@/lib/utils";

/**
 * An unfinished structure: the edges of an icosphere draw themselves in up
 * to the current completion value, vertices glow at the frontier, and the
 * whole thing slowly turns toward the pointer.
 */
function Structure({ value = 0.6, tier, reduced = false }: { value?: number; tier: "high" | "mid"; reduced?: boolean }) {
  const group = useRef<THREE.Group>(null);
  const edgesRef = useRef<THREE.LineSegments>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const pointer = usePointer();
  const progress = useRef(0);
  const tilt = useRef({ x: 0, y: 0 });

  const { edges, points, edgeCount } = useMemo(() => {
    const base = new THREE.IcosahedronGeometry(1.55, tier === "high" ? 2 : 1);
    const edges = new THREE.EdgesGeometry(base, 1);
    // Sort edges by height so the structure "builds" from the bottom up.
    const pos = edges.getAttribute("position") as THREE.BufferAttribute;
    const segs: number[][] = [];
    for (let i = 0; i < pos.count; i += 2) {
      segs.push([
        pos.getX(i), pos.getY(i), pos.getZ(i),
        pos.getX(i + 1), pos.getY(i + 1), pos.getZ(i + 1),
      ]);
    }
    segs.sort((a, b) => Math.min(a[1], a[4]) - Math.min(b[1], b[4]));
    const sorted = new Float32Array(segs.flat());
    edges.setAttribute("position", new THREE.BufferAttribute(sorted, 3));

    const points = new THREE.BufferGeometry();
    points.setAttribute("position", base.getAttribute("position").clone());
    base.dispose();
    return { edges, points, edgeCount: pos.count };
  }, [tier]);

  useFrame((state, delta) => {
    progress.current = lerp(progress.current, value, 0.03);
    if (edgesRef.current) {
      edgesRef.current.geometry.setDrawRange(0, Math.floor(edgeCount * progress.current));
    }
    if (group.current) {
      tilt.current.x = lerp(tilt.current.x, pointer.ny * 0.35, 0.04);
      tilt.current.y = lerp(tilt.current.y, pointer.nx * 0.5, 0.04);
      group.current.rotation.y += delta * (reduced ? 0.02 : 0.12);
      group.current.rotation.x = tilt.current.x + Math.sin(state.clock.elapsedTime * 0.3) * 0.08;
      group.current.rotation.z = tilt.current.y * 0.2;
    }
    if (pointsRef.current) {
      const m = pointsRef.current.material as THREE.PointsMaterial;
      m.size = 0.035 + Math.sin(state.clock.elapsedTime * 2) * 0.008;
    }
  });

  return (
    <group ref={group}>
      <lineSegments ref={edgesRef} geometry={edges}>
        <lineBasicMaterial color="#ff3b30" transparent opacity={0.85} />
      </lineSegments>
      {/* Ghost of the finished structure. */}
      <mesh>
        <icosahedronGeometry args={[1.55, tier === "high" ? 2 : 1]} />
        <meshBasicMaterial color="#f5f5f7" wireframe transparent opacity={0.05} />
      </mesh>
      <mesh>
        <icosahedronGeometry args={[1.5, 1]} />
        <meshBasicMaterial color="#0e0e11" transparent opacity={0.6} />
      </mesh>
      <points ref={pointsRef} geometry={points}>
        <pointsMaterial color="#f5f5f7" size={0.035} sizeAttenuation transparent opacity={0.9} />
      </points>
    </group>
  );
}

export function ProgressScene({ active, tier, value, reduced }: SceneProps) {
  return (
    <Canvas
      className="!absolute inset-0"
      camera={{ position: [0, 0, 5.2], fov: 40 }}
      dpr={[1, 1.5]}
      frameloop={active ? "always" : "never"}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ pointerEvents: "none", background: "transparent" }}
    >
      <Structure value={value} tier={tier} reduced={reduced} />
    </Canvas>
  );
}
