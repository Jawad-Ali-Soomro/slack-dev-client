import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Float, RoundedBox } from "@react-three/drei";
import * as THREE from "three";

function Laptop() {
  return (
    <group rotation={[0.18, 0.42, 0]} position={[0, -0.15, 0]}>
      <RoundedBox args={[2.55, 0.07, 1.7]} radius={0.05} position={[0, 0, 0]}>
        <meshStandardMaterial color="#161616" metalness={0.72} roughness={0.28} />
      </RoundedBox>
      <RoundedBox args={[2.2, 0.02, 1.15]} radius={0.02} position={[0, 0.05, 0.08]}>
        <meshStandardMaterial color="#2a2a2a" metalness={0.4} roughness={0.5} />
      </RoundedBox>
      <group position={[0, 0.92, -0.78]} rotation={[-0.18, 0, 0]}>
        <RoundedBox args={[2.55, 1.62, 0.07]} radius={0.05}>
          <meshStandardMaterial color="#101010" metalness={0.65} roughness={0.22} />
        </RoundedBox>
        <mesh position={[0, 0.02, 0.045]}>
          <planeGeometry args={[2.28, 1.36]} />
          <meshStandardMaterial
            color="#ff914b"
            emissive="#ff7a2e"
            emissiveIntensity={0.55}
            roughness={0.35}
          />
        </mesh>
        {[
          [-0.7, 0.28],
          [0, 0.28],
          [0.7, 0.28],
        ].map(([x, y]) => (
          <mesh key={`${x}-${y}`} position={[x, y, 0.05]}>
            <planeGeometry args={[0.52, 0.28]} />
            <meshStandardMaterial color="#fff5ed" roughness={0.4} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function CoreCrystal() {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.45;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.15;
  });
  return (
    <Float speed={2.2} rotationIntensity={0.4} floatIntensity={1.1}>
      <mesh ref={ref} position={[1.55, 1.05, 0.35]}>
        <icosahedronGeometry args={[0.42, 1]} />
        <meshStandardMaterial
          color="#ff914b"
          emissive="#e8772e"
          emissiveIntensity={0.35}
          metalness={0.3}
          roughness={0.2}
          wireframe
        />
      </mesh>
    </Float>
  );
}

function OrbitCubes() {
  const group = useRef();
  useFrame((state) => {
    if (group.current) group.current.rotation.y = state.clock.elapsedTime * 0.28;
  });
  const items = [
    [1.8, 0.4, 0.2, 0.18],
    [-1.7, 0.9, -0.4, 0.14],
    [0.4, 1.55, 1.1, 0.12],
    [-0.9, 0.2, 1.3, 0.16],
  ];
  return (
    <group ref={group}>
      {items.map(([x, y, z, s], i) => (
        <mesh key={i} position={[x, y, z]}>
          <boxGeometry args={[s, s, s]} />
          <meshStandardMaterial
            color={i % 2 ? "#111" : "#ff914b"}
            metalness={0.5}
            roughness={0.3}
          />
        </mesh>
      ))}
    </group>
  );
}

function Knot() {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.22;
    ref.current.rotation.z = state.clock.elapsedTime * 0.12;
  });
  return (
    <Float speed={1.6} floatIntensity={0.8}>
      <mesh ref={ref} position={[0, 0.35, 0]} scale={0.72}>
        <torusKnotGeometry args={[1, 0.28, 128, 18]} />
        <meshStandardMaterial
          color="#ff914b"
          metalness={0.7}
          roughness={0.18}
          emissive="#ff914b"
          emissiveIntensity={0.12}
        />
      </mesh>
    </Float>
  );
}

function Rig() {
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    state.camera.position.x = THREE.MathUtils.lerp(
      state.camera.position.x,
      state.pointer.x * 0.9,
      0.045,
    );
    state.camera.position.y = THREE.MathUtils.lerp(
      state.camera.position.y,
      1.15 + state.pointer.y * 0.25,
      0.045,
    );
    state.camera.lookAt(0, 0.35 + Math.sin(t * 0.4) * 0.04, 0);
  });
  return null;
}

export default function WorkspaceScene({ variant = "hero" }) {
  return (
    <div className="lp-canvas">
      <Canvas
        dpr={[1, 1.6]}
        camera={{ position: [0, 1.2, 4.2], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.7} />
        <hemisphereLight args={["#fff5ed", "#1a1a1a", 0.55]} />
        <spotLight
          position={[4, 6, 4]}
          angle={0.4}
          penumbra={0.8}
          intensity={2.2}
          color="#ffb07a"
        />
        <directionalLight position={[-3, 2, 2]} intensity={0.7} />
        <Suspense fallback={null}>
          {variant === "hero" ? (
            <>
              <Laptop />
              <CoreCrystal />
              <OrbitCubes />
            </>
          ) : (
            <>
              <Knot />
              <OrbitCubes />
            </>
          )}
          <ContactShadows
            position={[0, -0.7, 0]}
            opacity={0.35}
            scale={8}
            blur={2.4}
            far={2.5}
          />
        </Suspense>
        <Rig />
      </Canvas>
    </div>
  );
}
