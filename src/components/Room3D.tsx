import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Sphere, Cylinder, Text, Plane, Edges } from '@react-three/drei';
import * as THREE from 'three';

export interface Room3DProps {
  data: {
    id?: string;
    temperature: number;
    humidity: number;
    occupancy: boolean;
    fanOn: boolean;
    lightOn: boolean;
    doorClosed: boolean;
    securityLocked?: boolean;
    alert: boolean;
  };
}

export const Room3D: React.FC<Room3DProps> = ({ data }) => {
  const fanRef = useRef<THREE.Group>(null);
  
  // Rotate fan if ON
  useFrame((_state, delta) => {
    if (data.fanOn && fanRef.current) {
      fanRef.current.rotation.y += delta * 5;
    }
  });

  // Color logic
  const wallColor = data.alert 
    ? '#4a1111' 
    : data.securityLocked 
    ? '#1c1917' 
    : (data.temperature > 28 ? '#3a2010' : '#121826');
  
  const edgeColor = data.alert 
    ? '#ef4444' 
    : data.securityLocked 
    ? '#f59e0b' 
    : '#06b6d4';

  return (
    <group position={[0, -1, 0]}>
      {/* Room Floor */}
      <Plane args={[10, 10]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#0a0e17" roughness={0.8} />
        <Edges color={edgeColor} />
      </Plane>

      {/* Walls (glassy) */}
      <Box args={[10, 5, 0.2]} position={[0, 2.5, -5]}>
        <meshPhysicalMaterial color={wallColor} transparent opacity={0.6} roughness={0.1} metalness={0.8} />
        <Edges color={edgeColor} />
      </Box>
      <Box args={[0.2, 5, 10]} position={[-5, 2.5, 0]}>
        <meshPhysicalMaterial color={wallColor} transparent opacity={0.6} roughness={0.1} metalness={0.8} />
        <Edges color={edgeColor} />
      </Box>

      {/* A simple workstation table */}
      <Box args={[3, 0.2, 2]} position={[0, 1.5, -2]}>
        <meshStandardMaterial color="#334155" />
      </Box>
      <Cylinder args={[0.1, 0.1, 1.5]} position={[-1.3, 0.75, -2.8]}>
        <meshStandardMaterial color="#475569" />
      </Cylinder>
      <Cylinder args={[0.1, 0.1, 1.5]} position={[1.3, 0.75, -2.8]}>
        <meshStandardMaterial color="#475569" />
      </Cylinder>
      <Cylinder args={[0.1, 0.1, 1.5]} position={[-1.3, 0.75, -1.2]}>
        <meshStandardMaterial color="#475569" />
      </Cylinder>
      <Cylinder args={[0.1, 0.1, 1.5]} position={[1.3, 0.75, -1.2]}>
        <meshStandardMaterial color="#475569" />
      </Cylinder>

      {/* Door */}
      <Box args={[2, 4, 0.3]} position={[-3, 2, -4.9]}>
        <meshStandardMaterial color={data.doorClosed ? '#1e293b' : '#334155'} />
        <Edges color={data.securityLocked ? '#ef4444' : (data.doorClosed ? '#3b82f6' : '#94a3b8')} />
      </Box>

      {/* Light Source */}
      {data.lightOn && (
        <pointLight position={[0, 4.5, 0]} intensity={1.5} color="#e0f2fe" distance={10} />
      )}
      <Sphere args={[0.3, 16, 16]} position={[0, 4.8, 0]}>
        <meshBasicMaterial color={data.lightOn ? '#e0f2fe' : '#334155'} />
      </Sphere>

      {/* HVAC Unit & Fan */}
      <group position={[3, 4, -4.5]}>
        <Box args={[2, 1, 1]}>
          <meshStandardMaterial color="#1e293b" />
          <Edges color="#3b82f6" />
        </Box>
        {/* Fan blades inside HVAC */}
        <group ref={fanRef} position={[0, 0, 0.6]}>
          <Box args={[1.5, 0.1, 0.05]} position={[0, 0, 0]}>
            <meshStandardMaterial color="#94a3b8" />
          </Box>
          <Box args={[0.1, 1.5, 0.05]} position={[0, 0, 0]}>
            <meshStandardMaterial color="#94a3b8" />
          </Box>
        </group>
        {/* Air flow indicator */}
        {data.fanOn && (
          <Text position={[0, -1, 0.5]} fontSize={0.3} color="#06b6d4" anchorX="center" anchorY="middle">
            ~ AIR FLOW ACTIVE ~
          </Text>
        )}
      </group>

      {/* Sensor Displays on Wall */}
      <group position={[0, 3, -4.8]}>
        <Text position={[0, 0.5, 0]} fontSize={0.38} color={data.alert ? "#ef4444" : "#f8fafc"}>
          {data.temperature.toFixed(1)}°C
        </Text>
        <Text position={[0, 0.0, 0]} fontSize={0.2} color="#06b6d4">
          HUMIDITY: {data.humidity}%
        </Text>
        {data.occupancy && (
          <Text position={[0, -0.4, 0]} fontSize={0.2} color="#10b981">
            OCCUPIED
          </Text>
        )}
        {data.securityLocked && (
          <Text position={[0, -0.8, 0]} fontSize={0.2} color="#ef4444">
            PERIMETER LOCKED
          </Text>
        )}
      </group>
    </group>
  );
};

export default Room3D;
