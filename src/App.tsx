import { animated, useSpring } from "@react-spring/three";
import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import React, { useState } from "react";
import * as THREE from "three";
import "./App.css";

type Vec3 = [number, number, number];

type HemisphereShellProps = {
  position: Vec3;
  rotation: Vec3;
  hovered: boolean;
  color?: string;
  handleClick?: () => void;
  handleHovered?: (hovered: boolean) => void;
};

function HemisphereShell({
  position,
  rotation,
  hovered,
  color = "gold",
  handleClick,
  handleHovered,
}: HemisphereShellProps) {
  // 厚みのある半球殻を2重のSphereGeometryで作る
  // 外側
  const outerRadius = 1;
  const innerRadius = 0.95;
  const widthSegments = 64;
  const heightSegments = 32;
  const phiStart = 0;
  const phiLength = Math.PI;
  // 半球の殻＋断面
  return (
    <group position={position} rotation={rotation}>
      {/* 外側半球（hoverで色変更） */}
      <mesh
        castShadow
        receiveShadow
        onPointerOver={() => handleHovered?.(true)}
        onPointerOut={() => handleHovered?.(false)}
        onClick={handleClick}
      >
        <sphereGeometry
          args={[
            outerRadius,
            widthSegments,
            heightSegments,
            phiStart,
            phiLength,
          ]}
        />
        <meshStandardMaterial
          color={hovered ? "hotpink" : color}
          side={THREE.FrontSide}
        />
      </mesh>
      {/* 内側半球 */}
      <mesh castShadow receiveShadow>
        <sphereGeometry
          args={[
            innerRadius,
            widthSegments,
            heightSegments,
            phiStart,
            phiLength,
          ]}
        />
        <meshStandardMaterial color={color} side={THREE.BackSide} />
      </mesh>
      {/* 断面（円環） */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
        <ringGeometry args={[innerRadius, outerRadius, 64]} />
        <meshStandardMaterial color={color} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

function App(): React.JSX.Element {
  const [clicked, setClicked] = useState(false);
  const [hovered, setHovered] = useState(false);
  const { rotation0, rotation1 } = useSpring({
    rotation0: clicked ? [0, 0, -Math.PI / 2.2] : [0, 0, 0],
    rotation1: clicked ? [0, 0, +Math.PI / 2.2] : [0, 0, 0],
  });
  const handleClick = () => {
    setHovered(false);
    setClicked(!clicked);
  };
  return (
    <Canvas>
      <ambientLight intensity={Math.PI / 2} />
      <spotLight
        position={[10, 10, 10]}
        angle={0.15}
        penumbra={1}
        decay={0}
        intensity={Math.PI}
      />
      <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
      <group position={[0, 2, 0]}>
        <animated.group rotation={rotation0 as unknown as Vec3}>
          <HemisphereShell
            position={[0, -1, 0]}
            rotation={[0, -Math.PI / 2, 0]}
            hovered={hovered}
            handleClick={handleClick}
            handleHovered={setHovered}
          />
        </animated.group>
        <animated.group rotation={rotation1 as unknown as Vec3}>
          <HemisphereShell
            position={[0, -1, 0]}
            rotation={[0, +Math.PI / 2, 0]}
            hovered={hovered}
            handleClick={handleClick}
            handleHovered={setHovered}
          />
        </animated.group>
      </group>
      <OrbitControls />
    </Canvas>
  );
}

export default App;
