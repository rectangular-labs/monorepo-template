/* biome-disable lint/a11y/noStaticElementInteractions */

import { Environment, Lightformer, RoundedBox } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import { AdditiveBlending, CanvasTexture, type Group, MathUtils, RepeatWrapping } from "three";

interface TargetRotationRef {
  current: { x: number; y: number };
}

interface RotationOffsetRef {
  current: { x: number; y: number };
}

function RectangleMesh({
  target,
  rotationOffset,
  meshRef,
}: {
  target: TargetRotationRef;
  rotationOffset: RotationOffsetRef;
  meshRef: React.RefObject<Group | null>;
}) {
  const hatchTexture = useMemo(() => {
    const size = 128;
    const lineWidth = 2;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, size, size);
      ctx.strokeStyle = "rgba(255,255,255,0.6)";
      ctx.lineWidth = lineWidth;
      ctx.lineCap = "square";
      // Diagonal 1
      ctx.beginPath();
      ctx.moveTo(-size * 0.1, size * 0.1);
      ctx.lineTo(size * 1.1, size * 0.9);
      ctx.stroke();
      // Diagonal 2
      ctx.beginPath();
      ctx.moveTo(size * 0.1, -size * 0.1);
      ctx.lineTo(size * 0.9, size * 1.1);
      ctx.stroke();
    }
    const texture = new CanvasTexture(canvas);
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.repeat.set(12, 12);
    return texture;
  }, []);

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    // Slow base rotation
    const t = state.clock.elapsedTime;
    const baseX = Math.sin(t * 0.3) * 0.08;
    const baseY = t * 0.2;
    const baseZ = -Math.PI / 12; // 15° right tilt

    // Pointer/touch driven offsets (normalized -1..1)
    const targetX = baseX + target.current.y * 0.35 + rotationOffset.current.x;
    const targetY = baseY + target.current.x * 0.6 + rotationOffset.current.y;
    const targetZ = baseZ + target.current.x * 0.1;

    mesh.rotation.x = MathUtils.damp(mesh.rotation.x, targetX, 4, delta);
    mesh.rotation.y = MathUtils.damp(mesh.rotation.y, targetY, 4, delta);
    mesh.rotation.z = MathUtils.damp(mesh.rotation.z, targetZ, 4, delta);
  });

  return (
    <group ref={meshRef}>
      <RoundedBox args={[1.4, 2.3, 1.4]} castShadow radius={0.06} receiveShadow smoothness={8}>
        <meshPhysicalMaterial
          clearcoat={0.9}
          clearcoatRoughness={0.8}
          envMapIntensity={0.6}
          iridescence={0.6}
          iridescenceIOR={1.3}
          iridescenceThicknessRange={[100, 400]}
          metalness={1}
          roughness={0.5}
        />
      </RoundedBox>
      {/* Cross-hatch overlay as a slightly larger shell to avoid z-fighting */}
      <RoundedBox args={[1.4, 2.3, 1.4]} radius={0.06} scale={[1.002, 1.002, 1.002]} smoothness={8}>
        <meshStandardMaterial
          alphaMap={hatchTexture}
          blending={AdditiveBlending}
          color="#fffffb"
          depthWrite={false}
          metalness={0}
          opacity={0.22}
          roughness={0.8}
          transparent
        />
      </RoundedBox>
    </group>
  );
}

function HudOverlay({
  meshRef,
  target,
  rotationOffset,
  setSpinRate,
  setAttitude,
  setControl,
  setOffsetDeg,
  setPeakFlash,
}: {
  meshRef: React.RefObject<Group | null>;
  target: TargetRotationRef;
  rotationOffset: RotationOffsetRef;
  setSpinRate: React.Dispatch<React.SetStateAction<number>>;
  setAttitude: React.Dispatch<React.SetStateAction<{ p: number; y: number; r: number }>>;
  setControl: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  setOffsetDeg: React.Dispatch<React.SetStateAction<{ px: number; yy: number }>>;
  setPeakFlash: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const peakTimeoutRef = useRef<number | null>(null);
  const last = useRef<{ t: number; x: number; y: number; z: number } | null>(null);
  const accu = useRef<number>(0);

  useFrame((state, _delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const t = state.clock.elapsedTime;
    const rx = mesh.rotation.x;
    const ry = mesh.rotation.y;
    const rz = mesh.rotation.z;

    if (last.current) {
      const dt = t - last.current.t || 1 / 60;
      const dx = rx - last.current.x;
      const dy = ry - last.current.y;
      const dz = rz - last.current.z;
      const radPerSec = Math.sqrt(dx * dx + dy * dy + dz * dz) / dt;
      const degPerSec = radPerSec * (180 / Math.PI);
      setSpinRate((s) => {
        const next = degPerSec;
        if (next > s + 10) {
          if (peakTimeoutRef.current) window.clearTimeout(peakTimeoutRef.current);
          setPeakFlash(true);
          peakTimeoutRef.current = window.setTimeout(() => setPeakFlash(false), 500);
        }
        return next;
      });
    }
    last.current = { t, x: rx, y: ry, z: rz };

    accu.current += _delta;
    if (accu.current > 0.08) {
      const p = rx * (180 / Math.PI);
      const y = ry * (180 / Math.PI);
      const r = rz * (180 / Math.PI);
      setAttitude({ p, y, r });
      setControl({ x: target.current.x, y: target.current.y });
      setOffsetDeg({
        px: rotationOffset.current.x * (180 / Math.PI),
        yy: rotationOffset.current.y * (180 / Math.PI),
      });
      accu.current = 0;
    }
  });

  return null;
}

export function InteractiveRectangle() {
  const target = useRef({ x: 0, y: 0 });
  const rotationOffset = useRef({ x: 0, y: 0 });
  const meshRef = useRef<Group | null>(null);
  const dragState = useRef<{
    dragging: boolean;
    sx: number;
    sy: number;
    ox: number;
    oy: number;
  } | null>(null);

  function signed(n: number, digits = 1) {
    const v = Number.isFinite(n) ? n : 0;
    const f = v.toFixed(digits);
    return (v >= 0 ? "+" : "") + f;
  }

  function updateFromPointer(clientX: number, clientY: number, el: HTMLElement) {
    const rect = el.getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width; // 0..1
    const y = (clientY - rect.top) / rect.height; // 0..1
    // Normalize to -1..1 and invert Y for natural tilt
    target.current.x = (x - 0.5) * 2;
    target.current.y = (0.5 - y) * 2;
  }

  const [attitude, setAttitude] = useState<{ p: number; y: number; r: number }>({
    p: 0,
    y: 0,
    r: 0,
  });
  const [control, setControl] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [offsetDeg, setOffsetDeg] = useState<{ px: number; yy: number }>({
    px: 0,
    yy: 0,
  });
  const [spinRate, setSpinRate] = useState<number>(0);
  const [peakFlash, setPeakFlash] = useState<boolean>(false);
  const controlPctX = Math.max(0, Math.min(100, (control.x + 1) * 50));
  const controlPctY = Math.max(0, Math.min(100, (control.y + 1) * 50));

  return (
    <div className="h-72 w-full md:relative md:h-80">
      <div className="pointer-none absolute inset-0 font-mono text-[10px] tracking-wider select-none md:text-xs">
        <div className="absolute top-3 left-3 text-cyan-700 dark:text-cyan-300/90">
          <div className="opacity-80">ATTITUDE</div>
          <div className="text-cyan-900 dark:text-cyan-100">
            P {signed(attitude.p)}°<span className="mx-2">Y {signed(attitude.y)}°</span>R{" "}
            {signed(attitude.r)}°
          </div>
        </div>

        <div className="absolute bottom-3 left-3 text-sky-700 dark:text-sky-200/90">
          <div className="hidden opacity-80 md:block">CONTROL</div>
          <div className="hidden text-sky-900 md:block dark:text-sky-100">
            X {signed(control.x, 2)} Y {signed(control.y, 2)}
          </div>
          <div className="mt-1 hidden w-40 max-w-[45vw] md:block">
            <div className="h-[2px] bg-black/10 dark:bg-white/10">
              <div
                className="h-[2px] bg-sky-600 dark:bg-sky-300"
                style={{ width: `${controlPctX}%` }}
              />
            </div>
            <div className="mt-1 h-[2px] bg-black/10 dark:bg-white/10">
              <div
                className="h-[2px] bg-sky-600 dark:bg-sky-300"
                style={{ width: `${controlPctY}%` }}
              />
            </div>
          </div>
          <div className="mt-2 opacity-80">OFFSET</div>
          <div className="text-sky-900 dark:text-sky-100">
            P {signed(offsetDeg.px)}° Y {signed(offsetDeg.yy)}°
          </div>
        </div>

        <div className="absolute top-3 right-3 text-lime-700 dark:text-lime-200/90">
          <div className="opacity-80">SPIN</div>
          <div className="flex items-center gap-2 text-lime-900 dark:text-lime-100">
            {spinRate.toFixed(1)}°/s
            {peakFlash ? (
              <span className="rounded-sm bg-lime-500/15 px-1 py-0.5 text-[9px] tracking-widest text-lime-700 uppercase dark:bg-lime-300/20 dark:text-lime-200">
                PEAK
              </span>
            ) : null}
          </div>
        </div>
      </div>
      <Canvas
        camera={{ position: [0, 0, 3.2], fov: 55 }}
        dpr={[1, 1.25]}
        gl={{
          powerPreference: "high-performance",
          antialias: true,
          alpha: true,
          stencil: false,
        }}
        onCreated={({ gl }) => {
          const canvas = gl.domElement as HTMLCanvasElement;
          canvas.addEventListener("webglcontextlost", (e) => e.preventDefault(), false);
        }}
        onPointerDown={(e) => {
          dragState.current = {
            dragging: true,
            sx: e.clientX,
            sy: e.clientY,
            ox: rotationOffset.current.x,
            oy: rotationOffset.current.y,
          };
        }}
        onPointerLeave={() => {
          target.current.x = 0;
          target.current.y = 0;
          dragState.current = null;
        }}
        onPointerMove={(e) => {
          updateFromPointer(e.clientX, e.clientY, e.currentTarget);
          const d = dragState.current;
          if (d?.dragging) {
            const dx = e.clientX - d.sx;
            const dy = e.clientY - d.sy;
            rotationOffset.current.y = d.oy + dx * 0.0025; // yaw with horizontal drag
            rotationOffset.current.x = d.ox + dy * 0.002; // pitch with vertical drag
          }
        }}
        onPointerUp={() => {
          dragState.current = null;
        }}
        onTouchMove={(e) => {
          const t = e.touches[0];
          if (!t) return;
          updateFromPointer(t.clientX, t.clientY, e.currentTarget);
        }}
      >
        <ambientLight intensity={0.8} />
        <hemisphereLight groundColor="#bbbbbb" intensity={0.45} />
        <directionalLight castShadow={false} intensity={0.35} position={[2.5, 3, 5]} />
        <Environment resolution={256}>
          {/* Cyan fill */}
          <Lightformer
            color="#00e5ff"
            form="rect"
            intensity={1.6}
            position={[2.5, 0.4, -1.5]}
            rotation={[0, Math.PI - 0.2, 0]}
            scale={[3, 2, 1]}
          />
          {/* Magenta kicker */}
          <Lightformer
            color="#ff7ab3"
            form="rect"
            intensity={1.6}
            position={[-3.2, 0.1, 0.8]}
            rotation={[0, 0.45, 0]}
            scale={[3, 2, 1]}
          />
          {/* Lime rim */}
          <Lightformer
            color="#7cff8e"
            form="ring"
            intensity={0.2}
            position={[0.2, -1.8, 1.8]}
            scale={[4, 4, 1]}
          />
          {/* Warm top */}
          <Lightformer
            color="#ffd36e"
            form="rect"
            intensity={1.2}
            position={[0.5, 2.2, 1]}
            rotation={[-0.5, 0, 0]}
            scale={[2.8, 1, 1]}
          />
          {/* Small white edge highlight */}
          <Lightformer
            color="#fffffa"
            form="rect"
            intensity={1}
            position={[-0.5, 1.5, 2.5]}
            scale={[0.6, 0.6, 1]}
          />
        </Environment>
        <RectangleMesh
          meshRef={meshRef}
          rotationOffset={rotationOffset as unknown as RotationOffsetRef}
          target={target as unknown as TargetRotationRef}
        />
        <HudOverlay
          meshRef={meshRef}
          rotationOffset={rotationOffset}
          setAttitude={setAttitude}
          setControl={setControl}
          setOffsetDeg={setOffsetDeg}
          setPeakFlash={setPeakFlash}
          setSpinRate={setSpinRate}
          target={target}
        />
      </Canvas>
    </div>
  );
}
