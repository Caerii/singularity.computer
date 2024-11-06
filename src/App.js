// App.js

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Environment, Effects } from '@react-three/drei';
import { Physics, useBox, usePlane } from '@react-three/cannon';
import { BoxGeometry, PlaneGeometry, MeshStandardMaterial, TextureLoader } from 'three';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import './App.css';

// Load textures for PBR materials
const textureLoader = new TextureLoader();
const roughnessTexture = textureLoader.load('path/to/roughness.jpg');  // Replace with your texture path
const metalnessTexture = textureLoader.load('path/to/metalness.jpg');
const normalTexture = textureLoader.load('path/to/normal.jpg');

function Floor() {
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, -1, 0],
  }));

  const planeGeometry = useMemo(() => new PlaneGeometry(500, 500), []);
  const planeMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: '#0a0a0a',
        roughness: 0.8,
        metalness: 0.3,
        roughnessMap: roughnessTexture,
        normalMap: normalTexture,
      }),
    []
  );

  return <mesh ref={ref} receiveShadow geometry={planeGeometry} material={planeMaterial} />;
}

function useCannonBox({ position }, onCollideCallback) {
  const [ref, api] = useBox(() => ({
    mass: 1,
    position,
    onCollide: onCollideCallback,
  }));

  const velocity = useRef([0, 0, 0]);
  useEffect(() => api.velocity.subscribe((v) => (velocity.current = v)), [api]);

  return [ref, api, velocity.current];
}

function InteractiveCube({ size, position, onClick }) {
  const [color, setColor] = useState(`#${Math.floor(Math.random() * 16777215).toString(16)}`);
  const [scale, setScale] = useState(1);

  const onCollide = () => {
    setColor(`#${Math.floor(Math.random() * 16777215).toString(16)}`);
    setScale((prev) => (Math.random() * 0.5 + 0.8) * prev);
  };

  const [ref, api] = useCannonBox({ position }, onCollide);

  useEffect(() => {
    const initialVelocity = [
      (Math.random() - 0.5) * 3,
      (Math.random() - 0.5) * 3,
      (Math.random() - 0.5) * 3,
    ];
    api.velocity.set(...initialVelocity);
  }, [api]);

  const cubeGeometry = useMemo(() => new BoxGeometry(size, size, size), [size]);
  const cubeMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color,
        roughness: 0.5,
        metalness: 1,
        metalnessMap: metalnessTexture,
        normalMap: normalTexture,
      }),
    [color]
  );

  useFrame(() => {
    if (ref.current) {
      ref.current.scale.set(scale, scale, scale);
      setScale((prev) => prev + (Math.sin(Date.now() * 0.001) * 0.02));
    }
  });

  return (
    <mesh
      ref={ref}
      onClick={onClick}
      castShadow
      receiveShadow
      geometry={cubeGeometry}
      material={cubeMaterial}
    />
  );
}

function CubeCluster() {
  const [cubes, setCubes] = useState(() =>
    Array.from({ length: 15 }, (_, i) => ({
      key: i,
      size: Math.random() * 0.7 + 0.3,
      position: [Math.random() * 20 - 10, Math.random() * 10 - 5, Math.random() * 20 - 10],
    }))
  );

  const addCube = () => {
    const newCube = {
      key: cubes.length,
      size: Math.random() * 0.7 + 0.3,
      position: [Math.random() * 20 - 10, Math.random() * 10 - 5, Math.random() * 20 - 10],
    };
    setCubes((prevCubes) => [...prevCubes, newCube]);
  };

  return (
    <>
      {cubes.map(({ key, size, position }) => (
        <InteractiveCube key={key} size={size} position={position} onClick={addCube} />
      ))}
    </>
  );
}

function App() {
  return (
    <div className="App">
      <Canvas shadows camera={{ position: [0, 10, 25], fov: 50 }} style={{ width: '100vw', height: '100vh' }}>
        <ambientLight intensity={0.1} />
        <directionalLight
          position={[10, 20, 10]}
          intensity={1.5}
          castShadow
          shadow-mapSize-width={4096}
          shadow-mapSize-height={4096}
          shadow-camera-far={100}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={20}
          shadow-camera-bottom={-20}
        />
        <Environment preset="city" background />
        <Stars radius={200} depth={100} count={10000} factor={6} fade speed={0.6} />
        <Physics gravity={[0, -1, 0]}>
          <Floor />
          <CubeCluster />
        </Physics>
        <OrbitControls enableDamping autoRotate autoRotateSpeed={0.3} />
        <EffectComposer>
          <Bloom luminanceThreshold={0.1} luminanceSmoothing={0.9} height={300} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}

export default App;
