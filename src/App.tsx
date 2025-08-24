import { animated, useSpring } from "@react-spring/three";
import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import React, { useRef, useState } from "react";
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

// Confetti（紙吹雪）コンポーネントの定義
type ConfettiProps = {
  position?: Vec3;
  velocity?: Vec3;
  color?: string;
  size?: [number, number];
  rotation?: Vec3;
  rotationSpeed?: Vec3;
  active?: boolean;
};

function Confetti({
  position = [0, 0, 0],
  velocity = [0, -0.02, 0],
  color = "white",
  size = [0.1, 0.2],
  rotation = [0, 0, 0],
  rotationSpeed = [0, 0, 0.1],
  active = false,
}: ConfettiProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const pos = useRef<Vec3>([...position]);
  const rot = useRef<Vec3>([...rotation]);
  // velocityに揺らぎを持たせる
  const velocityRef = useRef<Vec3>([...velocity]);
  const frameCount = useRef(0);
  // 各confettiごとに独立した更新間隔を持つ
  function getRandomUpdateInterval() {
    return Math.floor(5 + Math.random() * 20); // 5〜25frame
  }
  const updateInterval = useRef(getRandomUpdateInterval());
  function setRandomVelocity() {
    velocityRef.current[0] = (Math.random() - 0.5) * 0.1;
    velocityRef.current[2] = (Math.random() - 0.5) * 0.1;
    velocityRef.current[1] = -0.09 + Math.random() * 0.08;
  }
  useFrame(() => {
    if (!active) return;
    if (pos.current[1] <= -5) return;
    frameCount.current++;
    if (frameCount.current >= updateInterval.current) {
      setRandomVelocity();
      frameCount.current = 0;
      updateInterval.current = getRandomUpdateInterval(); // 次の間隔もランダム
    }
    pos.current[0] += velocityRef.current[0];
    pos.current[1] += velocityRef.current[1];
    pos.current[2] += velocityRef.current[2];
    rot.current[0] += rotationSpeed[0];
    rot.current[1] += rotationSpeed[1];
    rot.current[2] += rotationSpeed[2];
    if (meshRef.current) {
      meshRef.current.position.set(...pos.current);
      meshRef.current.rotation.set(...rot.current);
    }
  });

  return (
    <mesh ref={meshRef} position={position} rotation={rotation}>
      <planeGeometry args={size} />
      <meshStandardMaterial color={color} />
    </mesh>
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
    setClicked(true);
  };
  const handleHovered = (value: boolean) => {
    if (!clicked) {
      setHovered(value);
    }
  };
  // Confettiの初期値リストを生成（例: 300個、ランダムな位置・速度・色）
  const confettiList = React.useMemo(() => {
    const colors = [
      "#ff5252", // 赤
      "#ffd740", // 黄
      "#69f0ae", // 緑
      "#40c4ff", // 青
      "#b388ff", // 紫
      "#fff59d", // 淡黄
      "#ffb6c1", // ピンク
      "#ff9800", // オレンジ
      "#8d6e63", // ブラウン
      "#00bcd4", // シアン
      "#cddc39", // ライム
      "#e1bee7", // ラベンダー
    ];
    return Array.from({ length: 300 }, () => ({
      position: [
        (Math.random() - 0.5) * 1.2,
        Math.random() * 0.5,
        (Math.random() - 0.5) * 1.2,
      ] as Vec3,
      velocity: [
        (Math.random() - 0.5) * 0.1,
        -0.09 + Math.random() * 0.08, // -0.09〜-0.01程度
        (Math.random() - 0.5) * 0.1,
      ] as Vec3,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: [0.07 + Math.random() * 0.07, 0.1 + Math.random() * 0.08] as [
        number,
        number
      ],
      rotation: [0, 0, Math.random() * Math.PI * 2] as Vec3,
      rotationSpeed: [
        (Math.random() - 0.5) * 0.22,
        (Math.random() - 0.5) * 0.22,
        (Math.random() - 0.5) * 0.35,
      ] as Vec3,
    }));
  }, []);
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
            handleHovered={handleHovered}
          />
        </animated.group>
        <animated.group rotation={rotation1 as unknown as Vec3}>
          <HemisphereShell
            position={[0, -1, 0]}
            rotation={[0, +Math.PI / 2, 0]}
            hovered={hovered}
            handleClick={handleClick}
            handleHovered={handleHovered}
          />
        </animated.group>
      </group>
      <group position={[0, 1, 0]}>
        {confettiList.map((props, idx) => (
          <Confetti active={clicked} {...props} key={idx} />
        ))}
      </group>
      <OrbitControls />
    </Canvas>
  );
}

export default App;
