import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Physics, useBox } from '@react-three/cannon'; // Import physics-related components
import './App.css';

function RandomColorCube({ speed, size, onClick }) {
  const meshRef = useRef();
  const [color, setColor] = useState([Math.random(), Math.random(), Math.random()]);
  const [_, api] = useBox(() => ({ // Destructure api from useBox to set physics properties
    mass: 1, // Mass of the cube
    position: [Math.random() * 6 - 3, Math.random() * 6 - 3, Math.random() * 6 - 3], // Random initial position
    args: [size, size, size], // Size of the box (cube)
  }));

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01 * speed;
      meshRef.current.rotation.y += 0.01 * speed;
    }
  });

  const handleClick = () => {
    setColor([Math.random(), Math.random(), Math.random()]);
    onClick(); // Call the onClick handler passed from the parent component
  };

  return (
    <mesh
      ref={meshRef}
      onClick={handleClick}
    >
      <boxGeometry />
      <meshBasicMaterial color={color} />
      {/* Attach the physical body to the mesh */}
      <Physics>{/* The body component handles the physics simulation */}
        <meshPhysicalMaterial ref={api} />
      </Physics>
    </mesh>
  );
}

function RandomCubes() {
  const [cubes, setCubes] = useState(1); // Start with one cube

  const handleClick = () => {
    // There's a 50% chance of adding more cubes when the initial cube is clicked
    if (Math.random() < 0.5) {
      setCubes((prevCubes) => prevCubes + 1);
    }
  };

  return (
    <>
      {Array.from({ length: cubes }).map((_, index) => (
        <RandomColorCube key={index} speed={1} size={1} onClick={handleClick} />
      ))}
    </>
  );
}

function App() {
  return (
    <div className="App">
      <Canvas style={{ width: '80vw', height: '80vh' }} camera={{ position: [0, 0, 10] }}>
        <Physics>{/* Wrap the scene with the physics simulation */}
          <RandomCubes />
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <OrbitControls enableDamping />
        </Physics>
      </Canvas>
    </div>
  );
}

export default App;
