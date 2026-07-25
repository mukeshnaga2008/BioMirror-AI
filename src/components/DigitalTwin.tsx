import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useHealthStore } from '../store/healthStore';

// Individual Organ Component inside the 3D Scene
// Texture map linking organ names to uploaded transparent PNG files
const organTextureMap: Record<string, string> = {
  brain: '/brain.png',
  heart: '/heart.png',
  lungs: '/lungs.png',
  liver: '/liver.png',
  kidneys: '/kidneys.png',
  stomach: '/stomach.png',
  intestines: '/small_intestine.png',
  bones: '/spinal_cord.png'
};

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
  name, position, color, isSelected, onSelect, scale = 1, glowIntensity = 1.2, visible = true
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const texturePath = organTextureMap[name.toLowerCase()] || '/heart.png';
  const texture = useTexture(texturePath);

  // Animate pulse
  useFrame(({ clock }) => {
    if (meshRef.current && visible) {
      const time = clock.getElapsedTime();
      const pulseSpeed = name.toLowerCase() === 'heart' ? 6.0 : 2.0;
      const pulseAmp = name.toLowerCase() === 'heart' ? 0.08 : 0.03;
      const factor = 1.0 + Math.sin(time * pulseSpeed) * pulseAmp;
      
      const baseScale = name.toLowerCase() === 'lungs' ? 0.22 : 0.16;
      meshRef.current.scale.set(baseScale * factor, baseScale * factor, baseScale * factor);
    }
  });

  if (!visible) return null;

  const isCritical = color === '#ef4444';
  const isMonitor = color === '#f59e0b';

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <planeGeometry args={[1.0, 1.0]} />
      <meshBasicMaterial
        map={texture}
        transparent={true}
        color={color}
        opacity={isSelected ? 1.0 : 0.85}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
      {(isCritical || isMonitor) && (
        <mesh scale={[1.22, 1.22, 1.22]}>
          <planeGeometry args={[1.0, 1.0]} />
          <meshBasicMaterial
            map={texture}
            transparent={true}
            color={color}
            opacity={0.35}
            side={THREE.DoubleSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}
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

// Luminous holographic 3D body loaded from custom GLB files
interface HolographicBodyProps {
  gender: string;
  height: number;
  weight: number;
}

const HolographicBody: React.FC<HolographicBodyProps> = ({ gender, height, weight }) => {
  const modelPath = gender.toLowerCase() === 'female' ? '/female_front.glb' : '/male_front.glb';
  const { scene } = useGLTF(modelPath);

  const holographicModel = useMemo(() => {
    const clone = scene.clone();
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).material = new THREE.MeshStandardMaterial({
          color: '#00f2fe',
          emissive: '#0077ff',
          emissiveIntensity: 0.9,
          roughness: 0.1,
          metalness: 0.9,
          transparent: true,
          opacity: 0.22,
          wireframe: false,
          side: THREE.DoubleSide
        });
      }
    });
    return clone;
  }, [scene]);

  // Dynamic scale stretching based on height (Y) and weight (X, Z)
  const scaleX = 1.25 * (weight / 76);
  const scaleY = 1.25 * (height / 178);
  const scaleZ = 1.25 * (weight / 76);

  return (
    <primitive 
      object={holographicModel} 
      scale={[scaleX, scaleY, scaleZ]} 
      position={[0, -1.0, 0]} 
    />
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

// High-fidelity Spinal Cord (Skeleton) Texture Overlay
const BoneTextureMesh: React.FC<{ position: [number, number, number]; torsoHeight: number }> = ({ position, torsoHeight }) => {
  const texture = useTexture('/spinal_cord.png');
  return (
    <mesh position={position}>
      <planeGeometry args={[0.3, torsoHeight * 1.5]} />
      <meshBasicMaterial map={texture} transparent={true} color="#a5f3fc" opacity={0.8} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  );
};

// High-fidelity Blood Vessels Texture Overlay
const VesselTextureMesh: React.FC<{ position: [number, number, number]; torsoHeight: number }> = ({ position, torsoHeight }) => {
  const texture = useTexture('/blood_vessels.png');
  return (
    <mesh position={position}>
      <planeGeometry args={[0.42, torsoHeight * 1.5]} />
      <meshBasicMaterial map={texture} transparent={true} color="#f87171" opacity={0.75} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  );
};

const AnatomicalCore: React.FC<AnatomicalCoreProps> = ({ gender, height, weight, visibility }) => {
  const heightScale = height / 175;
  const weightScale = weight / 70;

  const shoulderWidth = gender.toLowerCase() === 'female' ? 0.24 * weightScale : 0.36 * weightScale;
  const hipWidth = gender.toLowerCase() === 'female' ? 0.32 * weightScale : 0.24 * weightScale;
  const torsoHeight = 0.55 * heightScale;
  const legLength = 0.65 * heightScale;
  
  const bodyBaseY = -0.5;
  const pelvisY = bodyBaseY + legLength;

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
            opacity={0.03} 
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Bones */}
      {visibility.skeleton && (
        <group>
          <BoneTextureMesh position={[0, pelvisY + torsoHeight * 0.45, 0.015]} torsoHeight={torsoHeight} />
        </group>
      )}

      {/* Blood Vessels */}
      {visibility.bloodVessels && (
        <group>
          <VesselTextureMesh position={[0, pelvisY + torsoHeight * 0.45, 0.02]} torsoHeight={torsoHeight} />
        </group>
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

          {/* Luminous 3D Surface Mesh from GLB */}
          <HolographicBody gender={user.gender} height={user.height} weight={user.weight} />

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

      {/* Floating Organ Analysis Card */}
      {selectedOrgan && organs[selectedOrgan] && (
        <div className="absolute bottom-4 left-4 right-4 md:right-auto md:w-80 glass-panel p-5 rounded-2xl z-10 flex flex-col gap-3.5 border border-[#00f2fe]/30 shadow-lg shadow-[#00f2fe]/5">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-xs font-mono text-[#00f2fe] uppercase tracking-wider">Anatomical Inspection</h4>
              <h3 className="text-base font-extrabold text-white font-mono uppercase mt-0.5">{selectedOrgan}</h3>
            </div>
            <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full uppercase border ${
              organs[selectedOrgan].status === 'healthy' 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : organs[selectedOrgan].status === 'monitor'
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                : 'bg-red-500/10 text-red-400 border-red-500/20'
            }`}>
              {organs[selectedOrgan].status}
            </span>
          </div>

          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-xs border-b border-cyan-950/40 pb-1.5">
              <span className="text-gray-400">Health Index Score:</span>
              <span className="font-mono text-white font-bold">{organs[selectedOrgan].healthScore}%</span>
            </div>
            
            <div className="text-[11px] text-gray-300 leading-relaxed font-sans">
              <strong className="text-white block mb-0.5 font-mono text-[10px] uppercase text-[#00f2fe]/80">Primary Biomarkers:</strong>
              {organs[selectedOrgan].biomarkers?.join(', ') || 'N/A'}
            </div>

            <div className="text-[11px] text-gray-300 leading-relaxed font-sans">
              <strong className="text-white block mb-0.5 font-mono text-[10px] uppercase text-amber-400">Diagnostics:</strong>
              {organs[selectedOrgan].reason || 'Metrics operate within target range.'}
            </div>

            <div className="text-[10px] text-gray-400 italic leading-normal border-t border-cyan-950/40 pt-2 font-mono">
              {organs[selectedOrgan].details || 'No chronic alerts detected.'}
            </div>
          </div>

          <button 
            onClick={() => setSelectedOrgan(null)}
            className="w-full py-1.5 bg-cyan-950/50 hover:bg-cyan-900/80 border border-cyan-400/20 text-[10px] font-mono text-cyan-400 rounded-lg tracking-wider cursor-pointer"
          >
            DISMISS REPORT
          </button>
        </div>
      )}
    </div>
  );
};

export default DigitalTwin;
