/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
"use-client";
import React, { useEffect, useState, useCallback, useRef } from "react";

import * as THREE from "three";
import { Canvas, useLoader, useFrame } from "@react-three/fiber";
import { Bloom, EffectComposer, LUT } from "@react-three/postprocessing";
import { LUTCubeLoader } from "postprocessing";
import { PerformanceMonitor } from '@react-three/drei';
import { Beam } from "./components/Beam";
import { Rainbow } from "./components/Rainbow";
import { Prism } from "./components/Prism";
import { Flare } from "./components/Flare";
import { Box } from "./components/Box";

export { default as handleNextShader } from "./handle";

export function lerp(object, prop, goal, speed = 0.1) {
  object[prop] = THREE.MathUtils.lerp(object[prop], goal, speed);
}

const vector = new THREE.Vector3();
export function lerpV3(value, goal, speed = 0.1) {
  value.lerp(vector.set(...goal), speed);
}

export function calculateRefractionAngle(
  incidentAngle,
  glassIor = 2.5,
  airIor = 1.000293
) {
  const theta = Math.asin((airIor * Math.sin(incidentAngle)) / glassIor) || 0;
  return theta;
}

function App() {
  const texture = useLoader(
    LUTCubeLoader,
    "https://uploads.codesandbox.io/uploads/user/b3e56831-8b98-4fee-b941-0e27f39883ab/DwlG-F-6800-STD.cube"
  );

  const handleContextLost = (event) => {
    event.preventDefault();
    console.warn("WebGL context lost. Attempting to restore...");
    // Handle context restoration logic here if needed
  };

  useEffect(() => {
    const canvas = document.querySelector("canvas");
    canvas.addEventListener("webglcontextlost", handleContextLost, false);
    return () => {
      canvas.removeEventListener("webglcontextlost", handleContextLost, false);
    };
  }, []);

  const [hasEffects] = useState(true);
  const [dpr, setDpr] = useState(2);

  return (
    <Canvas
      dpr={dpr}
      orthographic
      gl={{ antialias: false }}
      camera={{ position: [0, 0, 100], zoom: 70 }}
    >
      <PerformanceMonitor 
        onChange={({ factor }) => {
          if (hasEffects && factor > 0.5) {
            setDpr(1.5);
          } else {
            setDpr(2);
          }
        }}
      >
        <color attach="background" args={["black"]} />
        <Scene />
        <EffectComposer disableNormalPass>
          <Bloom
            mipmapBlur
            levels={9}
            intensity={1.5}
            luminanceThreshold={1}
            luminanceSmoothing={1}
          />
          <LUT lut={texture} />
        </EffectComposer>
      </PerformanceMonitor>
    </Canvas>
  );
}

function Scene() {
  const [isPrismHit, hitPrism] = useState(false);
  const flare = useRef(null);
  const ambient = useRef(null);
  const spot = useRef(null);
  const boxreflect = useRef(null);
  const rainbow = useRef(null);

  const rayOut = useCallback(() => hitPrism(false), []);
  const rayOver = useCallback((e) => {
    e.stopPropagation();
    hitPrism(true);
    rainbow.current.material.speed = 1;
    rainbow.current.material.emissiveIntensity = 20;
  }, []);

  const vec = new THREE.Vector3();
  const rayMove = useCallback(({ api, position, direction, normal }) => {
    if (!normal) return;
    vec.toArray(api.positions, api.number++ * 3);
    flare.current.position.set(position.x, position.y, -0.5);
    flare.current.rotation.set(0, 0, -Math.atan2(direction.x, direction.y));

    let angleScreenCenter = Math.atan2(-position.y, -position.x);
    const normalAngle = Math.atan2(normal.y, normal.x);
    const incidentAngle = angleScreenCenter - normalAngle;
    const refractionAngle = calculateRefractionAngle(incidentAngle) * 6;
    angleScreenCenter += refractionAngle;
    rainbow.current.rotation.z = angleScreenCenter;

    lerpV3(
      spot.current.target.position,
      [Math.cos(angleScreenCenter), Math.sin(angleScreenCenter), 0],
      0.05
    );
    spot.current.target.updateMatrixWorld();
    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame((state) => {
    boxreflect.current.setRay(
      [
        (state.pointer.x * state.viewport.width) / 2,
        (state.pointer.y * state.viewport.height) / 2,
        0,
      ],
      [0, 0, 0]
    );

    lerp(
      rainbow.current.material,
      "emissiveIntensity",
      isPrismHit ? 2.5 : 0,
      0.1
    );
    spot.current.intensity = rainbow.current.material.emissiveIntensity;
    lerp(ambient.current, "intensity", 0, 0.025);
  });

  return (
    <>
      <ambientLight ref={ambient} intensity={0} />
      <pointLight position={[10, -10, 0]} intensity={0.05} />
      <pointLight position={[0, 10, 0]} intensity={0.05} />
      <pointLight position={[-10, 0, 0]} intensity={0.05} />
      <spotLight
        ref={spot}
        intensity={1}
        distance={7}
        angle={1}
        penumbra={1}
        position={[0, 0, 1]}
      />
      <Beam ref={boxreflect} bounce={10} far={20}>
        <Prism
          scale={0.6}
          position={[0, -0.5, 0]}
          onRayOver={rayOver}
          onRayOut={rayOut}
          onRayMove={rayMove}
        />
        <Box position={[-1.4, 1, 0]} rotation={[0, 0, Math.PI / 8]} />
        <Box position={[-2.4, -1, 0]} rotation={[0, 0, Math.PI / -4]} />
      </Beam>
      <Rainbow ref={rainbow} startRadius={0} endRadius={0.5} fade={0} />
      <Flare
        ref={flare}
        visible={isPrismHit}
        renderOrder={10}
        scale={1.25}
        streak={[12.5, 20, 1]}
      />
    </>
  );
}

const NextShader = () => {
  return (
    <div className="w-full h-[50vh]">
      <App />
    </div>
  );
};

export default NextShader;
