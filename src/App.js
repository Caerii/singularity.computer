import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { Physics, useBox, usePlane } from '@react-three/cannon';
import { BoxGeometry, PlaneGeometry, MeshStandardMaterial } from 'three';
import './App.css';

function Floor() {
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, -1, 0],
  }));

  const planeGeometry = useMemo(() => new PlaneGeometry(100, 100), []);
  const planeMaterial = useMemo(() => new MeshStandardMaterial({ color: '#111111' }), []);

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

function RandomColorCube({ size, position, onClick }) {
  const [color, setColor] = useState(`#${Math.floor(Math.random() * 16777215).toString(16)}`);
  const [scale, setScale] = useState(1);
  
  // Change color and scale on collision
  const onCollide = () => {
    setColor(`#${Math.floor(Math.random() * 16777215).toString(16)}`);
    setScale((prevScale) => (Math.random() * 0.5 + 0.75) * prevScale);
  };

  const [ref, api] = useCannonBox({ position }, onCollide);

  useEffect(() => {
    const initialVelocity = [
      (Math.random() - 0.5) * 5,
      (Math.random() - 0.5) * 5,
      (Math.random() - 0.5) * 5,
    ];
    api.velocity.set(...initialVelocity);
  }, [api]);

  const cubeGeometry = useMemo(() => new BoxGeometry(size, size, size), [size]);
  const cubeMaterial = useMemo(() => new MeshStandardMaterial({ color }), [color]);

  useFrame(() => {
    if (ref.current) {
      ref.current.scale.set(scale, scale, scale);
      setScale((prev) => prev + (Math.sin(Date.now() * 0.001) * 0.01));
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

function RandomCubes() {
  const [cubes, setCubes] = useState(() =>
    Array.from({ length: 10 }, (_, i) => ({
      key: i,
      size: Math.random() * 0.5 + 0.5,
      position: [Math.random() * 10 - 5, Math.random() * 10 - 5, Math.random() * 10 - 5],
    }))
  );

  const addCube = () => {
    const newCube = {
      key: cubes.length,
      size: Math.random() * 0.5 + 0.5,
      position: [Math.random() * 10 - 5, Math.random() * 10 - 5, Math.random() * 10 - 5],
    };
    setCubes((prevCubes) => [...prevCubes, newCube]);
  };

  return (
    <>
      {cubes.map(({ key, size, position }) => (
        <RandomColorCube key={key} size={size} position={position} onClick={addCube} />
      ))}
    </>
  );
}

function App() {
  return (
    <div className="App">
      <Canvas shadows camera={{ position: [0, 5, 15], fov: 60 }} style={{ width: '100vw', height: '100vh' }}>
        <ambientLight intensity={0.3} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />
        <Stars radius={100} depth={50} count={5000} factor={4} fade speed={0.5} />
        <Physics gravity={[0, -5, 0]}>
          <Floor />
          <RandomCubes />
        </Physics>
        <OrbitControls enableDamping autoRotate autoRotateSpeed={0.4} />
      </Canvas>
    </div>
  );
}

export default App;
