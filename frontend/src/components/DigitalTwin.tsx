import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useHealthStore } from '../store/healthStore';

// Individual Organ Component inside the 3D Scene
interface OrganMeshProps {
  name: string;
  position: [number, number, number];
  color: string;
  isSelected: boolean;
  onSelect: () => void;
  scale?: [number, number, number] | number;
  geometryType?: 'sphere' | 'box' | 'cylinder' | 'double-torus' | 'helix' | 'cone';
  glowIntensity?: number;
  visible?: boolean;
}

const OrganMesh: React.FC<OrganMeshProps> = ({
  name, position, color, isSelected, onSelect, scale = 1, geometryType = 'sphere', glowIntensity = 1.2, visible = true
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Animate pulse
  useFrame(({ clock }) => {
    if (meshRef.current && visible) {
      const time = clock.getElapsedTime();
      const pulseSpeed = name.toLowerCase() === 'heart' ? 6.0 : 2.0;
      const pulseAmp = name.toLowerCase() === 'heart' ? 0.08 : 0.03;
      
      const factor = 1.0 + Math.sin(time * pulseSpeed) * pulseAmp;
      
      if (Array.isArray(scale)) {
        meshRef.current.scale.set(scale[0] * factor, scale[1] * factor, scale[2] * factor);
      } else {
        meshRef.current.scale.set(scale * factor, scale * factor, scale * factor);
      }
      
      meshRef.current.rotation.y = time * 0.3;
    }
  });

  if (!visible) return null;

  const getGeometry = () => {
    switch (geometryType) {
      case 'box':
        return <boxGeometry args={[0.08, 0.08, 0.08]} />;
      case 'cylinder':
        return <cylinderGeometry args={[0.04, 0.04, 0.12, 16]} />;
      case 'double-torus':
        return <torusGeometry args={[0.05, 0.015, 8, 24]} />;
      case 'helix':
        return <torusGeometry args={[0.06, 0.02, 16, 32, Math.PI * 1.8]} />;
      case 'cone':
        return <coneGeometry args={[0.05, 0.1, 16]} />;
      case 'sphere':
      default:
        return <sphereGeometry args={[0.055, 32, 32]} />;
    }
  };

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {getGeometry()}
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={isSelected ? 4.0 : glowIntensity}
        roughness={0.1}
        metalness={0.9}
        transparent
        opacity={0.8}
      />
    </mesh>
  );
};

// Orbiting Holographic Rings
const HolographicRings: React.FC = () => {
  const ringsRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (ringsRef.current) {
      const time = clock.getElapsedTime();
      const children = ringsRef.current.children;
      if (children.length >= 6) {
        children[0].rotation.y = time * 0.15;
        children[1].rotation.y = -time * 0.22;
        children[2].rotation.z = time * 0.18;
        children[3].rotation.x = time * 0.25;
        children[4].rotation.y = time * 0.12;
        children[5].rotation.y = -time * 0.28;
      }
    }
  });

  return (
    <group ref={ringsRef}>
      {/* Horizontal Rings */}
      <mesh position={[0, 1.15, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.22, 0.23, 64]} />
        <meshBasicMaterial color="#00f2fe" transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.65, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.35, 0.362, 64]} />
        <meshBasicMaterial color="#00f2fe" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
      
      {/* Tilted Rings */}
      <mesh position={[0, 0.3, 0]} rotation={[Math.PI / 2.3, 0.1, 0.2]}>
        <ringGeometry args={[0.32, 0.33, 64]} />
        <meshBasicMaterial color="#d4af37" transparent opacity={0.35} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -0.2, 0]} rotation={[Math.PI / 2.6, -0.15, 0.1]}>
        <ringGeometry args={[0.28, 0.292, 64]} />
        <meshBasicMaterial color="#00f2fe" transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>

      {/* Vertical Ring */}
      <mesh position={[0, 0.45, 0]} rotation={[0, Math.PI / 2, 0]}>
        <ringGeometry args={[0.42, 0.428, 64]} />
        <meshBasicMaterial color="#00f2fe" transparent opacity={0.25} side={THREE.DoubleSide} />
      </mesh>

      {/* Tilted Gold ring */}
      <mesh position={[0, 0.8, 0]} rotation={[Math.PI / 3, -0.2, 0.3]}>
        <ringGeometry args={[0.3, 0.308, 64]} />
        <meshBasicMaterial color="#d4af37" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

// Renders Skeleton bones, Neural pathways, and Blood vessels using Lines
interface AnatomicalCoreProps {
  gender: string;
  height: number;
  weight: number;
  visibility: {
    skeleton: boolean;
    nervousSystem: boolean;
    bloodVessels: boolean;
    muscles: boolean;
  };
}

// Chest AI Bio-Core Component
interface BioCoreProps {
  position: [number, number, number];
}

const BioCore: React.FC<BioCoreProps> = ({ position }) => {
  const coreRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (coreRef.current) {
      const time = clock.getElapsedTime();
      coreRef.current.rotation.z = time * 0.4;
      const pulse = 1.0 + Math.sin(time * 3.5) * 0.04;
      coreRef.current.scale.set(pulse, pulse, pulse);
    }
  });
  return (
    <group ref={coreRef} position={position}>
      {/* Gold metallic ring */}
      <mesh>
        <torusGeometry args={[0.075, 0.007, 16, 32]} />
        <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Pulsing bright cyan core */}
      <mesh>
        <sphereGeometry args={[0.035, 16, 16]} />
        <meshStandardMaterial color="#00f2fe" emissive="#00f2fe" emissiveIntensity={3.5} />
      </mesh>
      {/* Floating medical data ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.05, 0.052, 16]} />
        <meshBasicMaterial color="#00f2fe" transparent opacity={0.4} />
      </mesh>
    </group>
  );
};

// Ground Circular Holographic Platform
interface GroundPlatformProps {
  yPosition: number;
}

const GroundPlatform: React.FC<GroundPlatformProps> = ({ yPosition }) => {
  const platRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (platRef.current) {
      const time = clock.getElapsedTime();
      platRef.current.rotation.y = time * 0.12;
    }
  });
  return (
    <group ref={platRef} position={[0, yPosition, 0]}>
      {/* Outer concentric glowing ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.42, 0.44, 64]} />
        <meshBasicMaterial color="#00f2fe" transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>
      {/* Inner gold accent ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <ringGeometry args={[0.24, 0.25, 32]} />
        <meshBasicMaterial color="#d4af37" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
      {/* Platform base cylinder */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.015, 0]}>
        <cylinderGeometry args={[0.48, 0.48, 0.015, 32]} />
        <meshStandardMaterial color="#070d1e" roughness={0.4} metalness={0.9} transparent opacity={0.8} />
      </mesh>
    </group>
  );
};

// Floating AI HUD Panels around the body
interface FloatingHUDProps {
  pelvisY: number;
  shoulderWidth: number;
}

const FloatingHUD: React.FC<FloatingHUDProps> = ({ pelvisY, shoulderWidth }) => {
  const leftRef = useRef<THREE.Group>(null);
  const rightRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    const hover = Math.sin(time * 1.2) * 0.015;
    if (leftRef.current) {
      leftRef.current.position.y = pelvisY + 0.1 + hover;
      leftRef.current.rotation.y = 0.35 + Math.sin(time * 0.4) * 0.02;
    }
    if (rightRef.current) {
      rightRef.current.position.y = pelvisY + 0.1 - hover;
      rightRef.current.rotation.y = -0.35 - Math.sin(time * 0.4) * 0.02;
    }
  });

  return (
    <>
      {/* Left panel HUD */}
      <group ref={leftRef} position={[-shoulderWidth * 1.5, pelvisY + 0.1, 0.15]}>
        <mesh>
          <planeGeometry args={[0.22, 0.32]} />
          <meshBasicMaterial color="#00f2fe" transparent opacity={0.05} side={THREE.DoubleSide} />
        </mesh>
        <lineSegments>
          <edgesGeometry args={[new THREE.PlaneGeometry(0.22, 0.32)]} />
          <lineBasicMaterial color="#00f2fe" transparent opacity={0.25} />
        </lineSegments>
        <mesh position={[-0.07, 0.11, 0.005]}>
          <boxGeometry args={[0.02, 0.01, 0.002]} />
          <meshBasicMaterial color="#d4af37" />
        </mesh>
      </group>

      {/* Right panel HUD */}
      <group ref={rightRef} position={[shoulderWidth * 1.5, pelvisY + 0.1, 0.15]}>
        <mesh>
          <planeGeometry args={[0.22, 0.32]} />
          <meshBasicMaterial color="#00f2fe" transparent opacity={0.05} side={THREE.DoubleSide} />
        </mesh>
        <lineSegments>
          <edgesGeometry args={[new THREE.PlaneGeometry(0.22, 0.32)]} />
          <lineBasicMaterial color="#00f2fe" transparent opacity={0.25} />
        </lineSegments>
        <mesh position={[0.07, 0.11, 0.005]}>
          <boxGeometry args={[0.02, 0.01, 0.002]} />
          <meshBasicMaterial color="#00f2fe" />
        </mesh>
      </group>
    </>
  );
};

const RotatingTwin: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const groupRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (groupRef.current) {
      const time = clock.getElapsedTime();
      // Rotate 360 degrees every 11 seconds (2 * Math.PI / 11 = ~0.57)
      groupRef.current.rotation.y = time * 0.57;
      
      // Chest breathing cycle
      const breath = 1.0 + Math.sin(time * 1.5) * 0.008;
      groupRef.current.scale.set(1.0, breath, breath);
    }
  });
  return <group ref={groupRef}>{children}</group>;
};

const AnatomicalCore: React.FC<AnatomicalCoreProps> = ({ gender, height, weight, visibility }) => {


  const heightScale = height / 175;
  const weightScale = weight / 70;

  // Proportions: Female wider hips, Male wider shoulders
  const shoulderWidth = gender.toLowerCase() === 'female' ? 0.24 * weightScale : 0.36 * weightScale;
  const hipWidth = gender.toLowerCase() === 'female' ? 0.32 * weightScale : 0.24 * weightScale;
  const torsoHeight = 0.55 * heightScale;
  const legLength = 0.65 * heightScale;
  
  const bodyBaseY = -0.5;
  const pelvisY = bodyBaseY + legLength;
  const neckY = pelvisY + torsoHeight;
  const headY = neckY + 0.12;

  // 1. Skeleton Bones (light blue)
  const boneLines = useMemo(() => {
    const points: THREE.Vector3[] = [];
    
    // Spine
    points.push(new THREE.Vector3(0, pelvisY, 0), new THREE.Vector3(0, neckY, 0));
    
    // Rib cage mock rings (horizontal)
    for (let r = 0; r < 5; r++) {
      const ry = pelvisY + torsoHeight * 0.4 + (r * 0.06);
      const rSize = shoulderWidth * 0.35 * (1 - r * 0.05);
      // Half circular lines
      for (let theta = 0; theta < Math.PI * 2; theta += 0.4) {
        const x1 = Math.cos(theta) * rSize;
        const z1 = Math.sin(theta) * rSize * 0.6;
        const x2 = Math.cos(theta + 0.4) * rSize;
        const z2 = Math.sin(theta + 0.4) * rSize * 0.6;
        points.push(new THREE.Vector3(x1, ry, z1), new THREE.Vector3(x2, ry, z2));
      }
    }

    // Shoulders / Collarbone
    points.push(new THREE.Vector3(-shoulderWidth * 0.5, neckY, 0), new THREE.Vector3(shoulderWidth * 0.5, neckY, 0));
    
    // Pelvis (Wider for female)
    points.push(new THREE.Vector3(-hipWidth * 0.5, pelvisY, 0), new THREE.Vector3(hipWidth * 0.5, pelvisY, 0));
    points.push(new THREE.Vector3(-hipWidth * 0.5, pelvisY, 0), new THREE.Vector3(0, pelvisY - 0.05, 0));
    points.push(new THREE.Vector3(hipWidth * 0.5, pelvisY, 0), new THREE.Vector3(0, pelvisY - 0.05, 0));

    // Left Arm
    points.push(new THREE.Vector3(-shoulderWidth * 0.5, neckY, 0), new THREE.Vector3(-shoulderWidth * 0.6, neckY - torsoHeight * 0.4, 0));
    points.push(new THREE.Vector3(-shoulderWidth * 0.6, neckY - torsoHeight * 0.4, 0), new THREE.Vector3(-shoulderWidth * 0.65, neckY - torsoHeight * 0.85, 0));

    // Right Arm
    points.push(new THREE.Vector3(shoulderWidth * 0.5, neckY, 0), new THREE.Vector3(shoulderWidth * 0.6, neckY - torsoHeight * 0.4, 0));
    points.push(new THREE.Vector3(shoulderWidth * 0.6, neckY - torsoHeight * 0.4, 0), new THREE.Vector3(shoulderWidth * 0.65, neckY - torsoHeight * 0.85, 0));

    // Left Leg
    points.push(new THREE.Vector3(-hipWidth * 0.4, pelvisY, 0), new THREE.Vector3(-hipWidth * 0.38, pelvisY - legLength * 0.5, 0));
    points.push(new THREE.Vector3(-hipWidth * 0.38, pelvisY - legLength * 0.5, 0), new THREE.Vector3(-hipWidth * 0.35, bodyBaseY, 0));

    // Right Leg
    points.push(new THREE.Vector3(hipWidth * 0.4, pelvisY, 0), new THREE.Vector3(hipWidth * 0.38, pelvisY - legLength * 0.5, 0));
    points.push(new THREE.Vector3(hipWidth * 0.38, pelvisY - legLength * 0.5, 0), new THREE.Vector3(hipWidth * 0.35, bodyBaseY, 0));

    return points;
  }, [gender, height, weight]);

  // 2. Nervous System (Cyan/Blue lines radiating from brain)
  const neuralLines = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const brainCenter = new THREE.Vector3(0, headY, 0);
    points.push(brainCenter, new THREE.Vector3(0, pelvisY, 0));

    for (let y = pelvisY + 0.05; y < neckY; y += 0.05) {
      const isLeft = Math.random() > 0.5;
      const angle = isLeft ? Math.PI + Math.random() * 0.5 : -Math.random() * 0.5;
      const span = shoulderWidth * 0.4;
      const tip = new THREE.Vector3(Math.cos(angle) * span, y - 0.08, Math.sin(angle) * span * 0.5);
      points.push(new THREE.Vector3(0, y, 0), tip);
    }
    return points;
  }, [gender, height, weight]);

  // 3. Blood Vessels (Red/Pink lines radiating from Heart)
  const bloodLines = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const heartCenter = new THREE.Vector3(-0.03, neckY - torsoHeight * 0.3, 0.04);
    points.push(heartCenter, new THREE.Vector3(0, neckY, 0));
    points.push(heartCenter, new THREE.Vector3(0, pelvisY, 0));

    points.push(heartCenter, new THREE.Vector3(-shoulderWidth * 0.5, neckY, 0));
    points.push(heartCenter, new THREE.Vector3(shoulderWidth * 0.5, neckY, 0));
    
    for (let i = 0; i < 15; i++) {
      const progress = Math.random();
      const startY = pelvisY + progress * (neckY - pelvisY);
      const isLeft = Math.random() > 0.5;
      const width = shoulderWidth * 0.35 * (1 - Math.abs(progress - 0.5) * 0.5);
      const start = new THREE.Vector3(0, startY, 0);
      const end = new THREE.Vector3(isLeft ? -width : width, startY - 0.04, Math.random() * 0.05);
      points.push(start, end);
    }
    return points;
  }, [gender, height, weight]);

  return (
    <group>
      {/* 3D Transparent Muscle Shell */}
      {visibility.muscles && (
        <mesh position={[0, pelvisY + torsoHeight * 0.5, 0]}>
          <cylinderGeometry args={[shoulderWidth * 0.52, hipWidth * 0.52, torsoHeight + 0.15, 32, 4, true]} />
          <meshBasicMaterial 
            color="#ef4444" 
            wireframe 
            transparent 
            opacity={0.06} 
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Bones */}
      {visibility.skeleton && (
        <lineSegments key={boneLines.length}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[new Float32Array(boneLines.flatMap(p => [p.x, p.y, p.z])), 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#e0f2fe" transparent opacity={0.45} />
        </lineSegments>
      )}

      {/* Neural Lines (Blue) */}
      {visibility.nervousSystem && (
        <lineSegments key={neuralLines.length}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[new Float32Array(neuralLines.flatMap(p => [p.x, p.y, p.z])), 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#0077ff" transparent opacity={0.35} />
        </lineSegments>
      )}

      {/* Blood Lines (Red) */}
      {visibility.bloodVessels && (
        <lineSegments key={bloodLines.length}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[new Float32Array(bloodLines.flatMap(p => [p.x, p.y, p.z])), 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#ef4444" transparent opacity={0.35} />
        </lineSegments>
      )}
    </group>
  );
};

// Moving AI Scan Plane inside WebGL
const ScanningPlane: React.FC = () => {
  const scanLineRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (scanLineRef.current) {
      const time = clock.getElapsedTime();
      const scanPeriod = 15;
      const progress = (time % scanPeriod) / scanPeriod;
      scanLineRef.current.position.y = 1.4 - progress * 1.9;
    }
  });
  return (
    <mesh ref={scanLineRef} rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.01, 0.4, 32]} />
      <meshBasicMaterial 
        color="#00f2fe" 
        transparent 
        opacity={0.15} 
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

interface DigitalTwinProps {
  customCameraTarget?: [number, number, number];
  customCameraPosition?: [number, number, number];
  customVisibility?: {
    skeleton?: boolean;
    muscles?: boolean;
    bloodVessels?: boolean;
    nervousSystem?: boolean;
    organs?: boolean;
  };
}

// Main 3D Digital Twin Viewer Canvas
export const DigitalTwin: React.FC<DigitalTwinProps> = ({ 
  customCameraTarget = [0, 0.3, 0],
  customCameraPosition = [0, 0.5, 1.8],
  customVisibility
}) => {
  const { user, organs, selectedOrgan, setSelectedOrgan } = useHealthStore();

  // Combine store visibility settings (fallback if not customized)
  const visibility = {
    skeleton: customVisibility?.skeleton ?? true,
    muscles: customVisibility?.muscles ?? true,
    bloodVessels: customVisibility?.bloodVessels ?? true,
    nervousSystem: customVisibility?.nervousSystem ?? true,
    organs: customVisibility?.organs ?? true
  };

  const getOrganColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return '#10b981'; // Emerald Green
      case 'monitor':
        return '#f59e0b'; // Amber Warning
      case 'critical':
        return '#ef4444'; // Red Alert
      default:
        return '#9ca3af'; // Grey
    }
  };

  // Anatomically mapped 3D placements matching the skeleton framework
  const heightScale = user.height / 175;
  const legLength = 0.65 * heightScale;
  const bodyBaseY = -0.5;
  const pelvisY = bodyBaseY + legLength;
  const torsoHeight = 0.55 * heightScale;
  const neckY = pelvisY + torsoHeight;
  const headY = neckY + 0.12;

  // Detailed coordinate mapping including Stomach, Intestines, Lymph nodes
  const organPositions: Record<string, [number, number, number]> = {
    brain: [0, headY, 0],
    heart: [-0.04, neckY - torsoHeight * 0.28, 0.05],
    lungs: [0.08, neckY - torsoHeight * 0.28, 0.03],
    liver: [0.06, neckY - torsoHeight * 0.44, 0.04],
    kidneys: [-0.07, neckY - torsoHeight * 0.65, -0.04],
    stomach: [-0.06, neckY - torsoHeight * 0.5, 0.04], // yellow-green
    intestines: [0, neckY - torsoHeight * 0.72, 0.03], // pink loops
    bones: [-0.15, pelvisY - legLength * 0.5, 0] // knee joint
  };

  return (
    <div className="w-full h-full relative" style={{ minHeight: '380px' }}>
      {/* Background radial overlay */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#030712]/50 to-[#030712] pointer-events-none" />

      <Canvas
        camera={{ position: customCameraPosition, fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.4} />
        {/* Luxury blue-and-gold cyber studio lights */}
        <pointLight position={[2, 1, 2]} color="#00f2fe" intensity={2.5} />
        <pointLight position={[-2, 1, -2]} color="#d4af37" intensity={2.0} />
        <spotLight position={[0, 4, 3]} intensity={1.5} />

        {/* Floating circular holographic platform */}
        <GroundPlatform yPosition={bodyBaseY - 0.02} />

        <RotatingTwin>
          {/* Orbiting Ring Loops */}
          <HolographicRings />

          {/* AI Chest Bio-Core */}
          <BioCore position={[0, neckY - torsoHeight * 0.28, 0.08]} />

          {/* Floating AI HUD Panels */}
          <FloatingHUD 
            pelvisY={pelvisY} 
            shoulderWidth={user.gender.toLowerCase() === 'female' ? 0.24 * (user.weight / 70) : 0.36 * (user.weight / 70)} 
          />

          {/* Anatomical Systems lines */}
          <AnatomicalCore 
            gender={user.gender}
            height={user.height}
            weight={user.weight}
            visibility={visibility}
          />

          {/* 3D Visual Organs */}
          {visibility.organs && (
            <>
              <OrganMesh
                name="brain"
                position={organPositions.brain}
                color={getOrganColor(organs.brain?.status || 'healthy')}
                isSelected={selectedOrgan === 'brain'}
                onSelect={() => setSelectedOrgan('brain')}
                scale={0.8}
              />

              <OrganMesh
                name="heart"
                position={organPositions.heart}
                color={getOrganColor(organs.heart?.status || 'healthy')}
                isSelected={selectedOrgan === 'heart'}
                onSelect={() => setSelectedOrgan('heart')}
                scale={0.7}
                geometryType="sphere"
              />

              <OrganMesh
                name="lungs"
                position={organPositions.lungs}
                color={getOrganColor(organs.lungs?.status || 'healthy')}
                isSelected={selectedOrgan === 'lungs'}
                onSelect={() => setSelectedOrgan('lungs')}
                scale={[0.7, 1.3, 0.7]}
                geometryType="cylinder"
              />

              <OrganMesh
                name="liver"
                position={organPositions.liver}
                color={getOrganColor(organs.liver?.status || 'monitor')}
                isSelected={selectedOrgan === 'liver'}
                onSelect={() => setSelectedOrgan('liver')}
                scale={0.95}
                geometryType="box"
              />

              <OrganMesh
                name="kidneys"
                position={organPositions.kidneys}
                color={getOrganColor(organs.kidneys?.status || 'healthy')}
                isSelected={selectedOrgan === 'kidneys'}
                onSelect={() => setSelectedOrgan('kidneys')}
                scale={0.65}
                geometryType="double-torus"
              />

              {/* stomach */}
              <OrganMesh
                name="stomach"
                position={organPositions.stomach}
                color="#eab308" // yellow-green stomach
                isSelected={selectedOrgan === 'stomach'}
                onSelect={() => setSelectedOrgan('stomach')}
                scale={0.75}
                geometryType="cone"
              />

              {/* intestines */}
              <OrganMesh
                name="intestines"
                position={organPositions.intestines}
                color="#d946ef" // magenta intestines
                isSelected={selectedOrgan === 'intestines'}
                onSelect={() => setSelectedOrgan('intestines')}
                scale={0.9}
                geometryType="helix"
              />

              <OrganMesh
                name="bones"
                position={organPositions.bones}
                color={getOrganColor(organs.bones?.status || 'monitor')}
                isSelected={selectedOrgan === 'bones'}
                onSelect={() => setSelectedOrgan('bones')}
                scale={0.7}
                geometryType="cylinder"
              />
            </>
          )}
        </RotatingTwin>

        {/* Moving AI Scan Plane inside WebGL */}
        <ScanningPlane />

        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={1.0}
          maxDistance={2.5}
          target={customCameraTarget}
        />
      </Canvas>

      {/* Floating Organ Labels in 2D overlays */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-1.5 text-[10px] font-mono pointer-events-none text-right">
        <div className="text-emerald-400">● HEALTHY: Brain, Heart, Lungs, Kidneys</div>
        <div className="text-amber-500">● MONITOR: Liver, Bones</div>
        <div className="text-purple-400">● MAPPED: Stomach, Intestines</div>
      </div>
    </div>
  );
};

export default DigitalTwin;
