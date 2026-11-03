import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Float,
  Lightformer,
  useGLTF,
} from "@react-three/drei";
import * as THREE from "three";
import cupModel from "@/assets/models/cup-coffee.glb.asset.json";

/* Hero 3D scene — CC0 Kenney "Food Kit" cup, slow rotation, floating beans
   and rising steam. Warm cinematic lighting, no third-party HDR fetches. */

function CupModel() {
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF(cupModel.url);

  const model = useMemo(() => {
    const clone = scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const scale = 2.0 / Math.max(size.x, size.y, size.z);
    clone.scale.setScalar(scale);
    clone.updateMatrixWorld(true);
    const fitted = new THREE.Box3().setFromObject(clone);
    const center = fitted.getCenter(new THREE.Vector3());
    clone.position.x -= center.x;
    clone.position.z -= center.z;
    clone.position.y -= fitted.min.y;
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return clone;
  }, [scene]);

  useFrame((_, delta) => {
    if (group.current) {
      group.current.rotation.y += Math.min(delta, 0.05) * 0.45;
      group.current.position.y = Math.sin(performance.now() * 0.001) * 0.06;
    }
  });

  return (
    <group ref={group}>
      <primitive object={model} />
      <Steam />
    </group>
  );
}

function steamTexture(): THREE.Texture {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size * 2;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 4, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "rgba(255, 244, 224, 0.55)");
  gradient.addColorStop(0.5, "rgba(255, 244, 224, 0.16)");
  gradient.addColorStop(1, "rgba(255, 244, 224, 0)");
  ctx.fillStyle = gradient;
  for (let y = 0; y < canvas.height; y += 2) {
    const alpha = 1 - y / canvas.height;
    ctx.globalAlpha = Math.max(alpha, 0);
    ctx.fillRect(0, y, size, 2);
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function SteamWisp({
  offset,
  x,
  speed,
  scale,
}: {
  offset: number;
  x: number;
  speed: number;
  scale: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const texture = useMemo(() => steamTexture(), []);
  useFrame((state) => {
    const mesh = ref.current;
    if (!mesh) return;
    const t = (state.clock.elapsedTime * speed + offset) % 1;
    mesh.position.y = 1.35 + t * 2.4;
    mesh.position.x = x + Math.sin((t + offset) * Math.PI * 2.2) * 0.16;
    const material = mesh.material as THREE.MeshBasicMaterial;
    material.opacity = Math.sin(t * Math.PI) * 0.5;
    mesh.scale.setScalar(scale * (0.7 + t * 0.9));
  });
  return (
    <mesh ref={ref} position={[x, 1.4, 0]}>
      <planeGeometry args={[1, 2]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={0.4}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function Steam() {
  const wisps = [
    { offset: 0.0, x: -0.12, speed: 0.1, scale: 0.5 },
    { offset: 0.3, x: 0.05, speed: 0.12, scale: 0.62 },
    { offset: 0.55, x: 0.18, speed: 0.09, scale: 0.45 },
    { offset: 0.8, x: -0.02, speed: 0.13, scale: 0.55 },
  ];
  return (
    <group>
      {wisps.map((w, i) => (
        <SteamWisp key={i} {...w} />
      ))}
    </group>
  );
}

function Bean({ angle, radius, y, speed, scale }: { angle: number; radius: number; y: number; speed: number; scale: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    const g = ref.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    g.position.set(
      Math.cos(angle + t * speed) * radius,
      y + Math.sin(t * 0.9 + angle * 3) * 0.35,
      Math.sin(angle + t * speed) * radius,
    );
    g.rotation.set(t * 0.6 + angle, t * 0.45, Math.sin(t + angle) * 0.4);
  });
  return (
    <group ref={ref} scale={scale}>
      <mesh castShadow>
        <sphereGeometry args={[0.16, 24, 24]} />
        <meshStandardMaterial color="#4a2c17" roughness={0.55} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0, 0.115]} scale={[0.32, 0.85, 0.4]}>
        <sphereGeometry args={[0.16, 20, 20]} />
        <meshStandardMaterial color="#2e1a0d" roughness={0.7} />
      </mesh>
    </group>
  );
}

function FloatingBeans() {
  const beans = [
    { angle: 0.4, radius: 2.4, y: 1.0, speed: 0.16, scale: 1.15 },
    { angle: 1.5, radius: 2.7, y: 0.2, speed: 0.13, scale: 0.9 },
    { angle: 2.6, radius: 2.3, y: 1.7, speed: 0.18, scale: 0.75 },
    { angle: 3.7, radius: 2.8, y: 0.7, speed: 0.12, scale: 1.0 },
    { angle: 4.8, radius: 2.5, y: 1.9, speed: 0.15, scale: 0.85 },
    { angle: 5.6, radius: 2.2, y: 0.15, speed: 0.17, scale: 1.05 },
    { angle: 1.1, radius: 3.1, y: 1.4, speed: 0.11, scale: 0.7 },
    { angle: 4.2, radius: 3.0, y: 2.2, speed: 0.14, scale: 0.8 },
  ];
  return (
    <group>
      {beans.map((b, i) => (
        <Bean key={i} {...b} />
      ))}
    </group>
  );
}

export default function HeroScene() {
  return (
    <div
      className="h-full w-full"
      ref={(el) => {
        if (el) (el as HTMLElement & { __ready?: boolean }).__ready = false;
      }}
      data-scene-pending=""
    >
      <Canvas
        shadows
        dpr={[1, 1.75]}
        camera={{ position: [0, 1.5, 5.6], fov: 38 }}
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl, scene: threeScene }) => {
          const container = gl.domElement.parentElement;
          if (container) {
            container.setAttribute("data-scene-ready", "true");
            container.removeAttribute("data-scene-pending");
          }
          threeScene.fog = new THREE.Fog("#150f0a", 8, 16);
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.15;
        }}
      >
        <color attach="background" args={["#150f0a"]} />
        <fog attach="fog" args={["#150f0a", 8, 16]} />

        <ambientLight intensity={0.5} color="#ffdcb0" />
        <spotLight
          position={[4, 6, 3]}
          angle={0.5}
          penumbra={0.8}
          intensity={140}
          color="#ffca8a"
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <pointLight position={[-4, 2, -2]} intensity={20} color="#c98a4b" />
        <pointLight position={[0, 1.2, 3.5]} intensity={8} color="#ffe3bd" />

        <Suspense fallback={null}>
          <group position={[0, -0.9, 0]}>
            <CupModel />
          </group>
          <FloatingBeans />
          <ContactShadows position={[0, -0.92, 0]} opacity={0.55} scale={9} blur={2.6} far={4} color="#120b06" />
        </Suspense>

        <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.4}>
          <Environment resolution={256}>
            <Lightformer intensity={2.2} color="#ffd9a0" position={[0, 5, 0]} rotation-x={Math.PI / 2} scale={[10, 10, 1]} />
            <Lightformer intensity={1.2} color="#c98a4b" position={[-5, 1, -1]} rotation-y={Math.PI / 2} scale={[20, 2, 1]} />
            <Lightformer intensity={0.8} color="#8a5a30" position={[5, 1, 0]} rotation-y={-Math.PI / 2} scale={[20, 2, 1]} />
          </Environment>
        </Float>
      </Canvas>
    </div>
  );
}

useGLTF.preload(cupModel.url);
