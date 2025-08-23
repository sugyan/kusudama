import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import "./App.css";

type Vec3 = [number, number, number];
type HemisphereShellProps = {
  position?: Vec3;
  rotation?: Vec3;
  color?: string;
};

function HemisphereShell({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  color = "skyblue",
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
      {/* 外側半球 */}
      <mesh castShadow receiveShadow>
        <sphereGeometry
          args={[
            outerRadius,
            widthSegments,
            heightSegments,
            phiStart,
            phiLength,
          ]}
        />
        <meshStandardMaterial color={color} side={THREE.FrontSide} />
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
      {/* 左右に半球殻を配置 */}
      <HemisphereShell
        position={[-0.2, 0, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        color="skyblue"
      />
      <HemisphereShell
        position={[0.2, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
        color="pink"
      />
      <OrbitControls />
    </Canvas>
  );
}

export default App;
