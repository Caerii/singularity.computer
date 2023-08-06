import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import './App.css';

function RandomColorCube() {
  const meshRef = useRef();
  const [color, setColor] = useState([Math.random(), Math.random(), Math.random()]);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.01;
    }
  });

  const handleClick = () => {
    setColor([Math.random(), Math.random(), Math.random()]);
  };

  return (
    <mesh
      ref={meshRef}
      position={[Math.random() * 6 - 3, Math.random() * 6 - 3, Math.random() * 6 - 3]}
      onClick={handleClick}
    >
      <boxGeometry />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}

function RandomCubes() {
  return (
    <>
      {Array.from({ length: 10 }).map((_, index) => (
        <RandomColorCube key={index} />
      ))}
    </>
  );
}

function App() {
  return (
    <div className="App">
      <Canvas style={{ width: '80vw', height: '80vh' }} camera={{ position: [0, 0, 10] }}>
        <RandomCubes />
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <OrbitControls enableDamping />
      </Canvas>
    </div>
  );
}

export default App;
