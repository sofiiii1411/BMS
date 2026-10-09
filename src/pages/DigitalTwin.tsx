import React, { useState, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import Room3D from '../components/Room3D';
import { 
  Thermometer, 
  Fan, 
  Lightbulb, 
  Lock, 
  Unlock, 
  Users, 
  Settings2, 
  AlertTriangle, 
  Layers, 
  Zap, 
  Check
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { Room } from '../types/auth';

export const DigitalTwin: React.FC = () => {
  const { user, isFloorUser, triggerSecurityViolation } = useAuth();
  
  // Default to user's first allowed floor
  const [selectedFloor, setSelectedFloor] = useState<number>(user?.allowedFloors[0] || 1);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Sync floor if user changes
  useEffect(() => {
    if (user?.allowedFloors && !user.allowedFloors.includes(selectedFloor)) {
      setSelectedFloor(user.allowedFloors[0]);
    }
  }, [user, selectedFloor]);

  // Fetch rooms for current floor
  const loadFloorRooms = useCallback(async (floorNum: number) => {
    setIsLoading(true);
    try {
      const res = await api.getFloorRooms(floorNum);
      if (res.success && res.rooms.length > 0) {
        setRooms(res.rooms);
        // Keep selected room if still on this floor, else select first room
        if (!res.rooms.some(r => r.id === selectedRoomId)) {
          setSelectedRoomId(res.rooms[0].id);
        }
      }
    } catch (err: any) {
      triggerSecurityViolation(
        err.message || `Failed to load Floor ${floorNum}. Access restricted by policy.`,
        floorNum
      );
    } finally {
      setIsLoading(false);
    }
  }, [selectedRoomId, triggerSecurityViolation]);

  useEffect(() => {
    loadFloorRooms(selectedFloor);
  }, [selectedFloor, loadFloorRooms]);

  // Current active room
  const currentRoom = rooms.find(r => r.id === selectedRoomId) || rooms[0];

  const handleFloorChange = (newFloor: number) => {
    if (isFloorUser && !user?.allowedFloors.includes(newFloor)) {
      triggerSecurityViolation(
        `Floor Access Restricted: Your account (${user?.email}) is restricted to Floor ${user?.allowedFloors.join(', ')}. Floor ${newFloor} is locked.`,
        newFloor
      );
      return;
    }
    setSelectedFloor(newFloor);
  };

  const showFeedback = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 2500);
  };

  // Live control handler
  const handleControlUpdate = async (updates: Partial<Room>) => {
    if (!currentRoom) return;
    try {
      const res = await api.updateRoomControl(currentRoom.id, updates);
      if (res.success && res.room) {
        setRooms(prev => prev.map(r => r.id === res.room.id ? res.room : r));
        showFeedback('Control command applied & verified by core');
      }
    } catch (err: any) {
      triggerSecurityViolation(err.message || 'Operation forbidden by SentinelAI security policy');
    }
  };

  const handleHeatRoom = () => {
    if (!currentRoom) return;
    handleControlUpdate({ temperature: Number((currentRoom.temperature + 1.5).toFixed(1)) });
  };

  const handleCoolRoom = () => {
    if (!currentRoom) return;
    handleControlUpdate({ temperature: Number((currentRoom.temperature - 1.5).toFixed(1)) });
  };

  const handleToggleFan = () => {
    if (!currentRoom) return;
    handleControlUpdate({ 
      fanOn: !currentRoom.fanOn,
      fanMode: !currentRoom.fanOn ? 'ON' : 'OFF'
    });
  };

  const handleToggleLight = () => {
    if (!currentRoom) return;
    handleControlUpdate({ lightOn: !currentRoom.lightOn });
  };

  const handleToggleLock = () => {
    if (!currentRoom) return;
    handleControlUpdate({ securityLocked: !currentRoom.securityLocked });
  };

  // Fallback room data for 3D model
  const room3DData = {
    id: currentRoom?.id || '101',
    temperature: currentRoom?.temperature ?? 24.5,
    humidity: currentRoom?.humidity ?? 50,
    occupancy: currentRoom?.occupancy ?? true,
    fanOn: currentRoom?.fanOn ?? true,
    lightOn: currentRoom?.lightOn ?? true,
    doorClosed: currentRoom?.doorClosed ?? true,
    securityLocked: currentRoom?.securityLocked ?? false,
    alert: currentRoom?.alert ?? false
  };

  return (
    <div className="digital-twin-wrapper" style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* 3D Canvas */}
      <div className="three-container">
        <Canvas camera={{ position: [10, 8, 12], fov: 45 }}>
          <ambientLight intensity={0.25} />
          <Environment preset="city" />
          <Room3D data={room3DData} />
          <OrbitControls 
            enablePan={false} 
            maxPolarAngle={Math.PI / 2 - 0.05} 
            minDistance={5}
            maxDistance={25}
          />
          <ContactShadows resolution={1024} scale={20} blur={2} opacity={0.5} far={10} color="#000000" />
        </Canvas>
      </div>

      {/* Top Floating Controls */}
      <div className="twin-top-nav overlay-element">
        {/* Floor Selection Bar */}
        <div className="glass-panel floor-selector-bar">
          <div className="floor-bar-label">
            <Layers size={16} color="var(--accent-cyan)" />
            <span>LEVEL:</span>
          </div>

          <div className="floor-pills">
            {[1, 2, 3, 4, 5].map(floorNum => {
              const isAllowed = user?.allowedFloors.includes(floorNum);
              const isActive = selectedFloor === floorNum;

              return (
                <button
                  key={floorNum}
                  type="button"
                  className={`floor-pill-btn ${isActive ? 'active' : ''} ${!isAllowed ? 'disabled-locked' : ''}`}
                  onClick={() => handleFloorChange(floorNum)}
                  title={isAllowed ? `View Floor ${floorNum}` : `Floor ${floorNum} Restricted for ${user?.roleTitle}`}
                >
                  <span>FL 0{floorNum}</span>
                  {!isAllowed && <Lock size={11} className="pill-lock-icon" />}
                </button>
              );
            })}
          </div>

          {isFloorUser && (
            <div className="floor-isolation-pill">
              <Lock size={12} />
              <span>ISOLATED: FLOOR {user?.allowedFloors[0]}</span>
            </div>
          )}
        </div>

        {/* Room Selection Dropdown/Pills for Selected Floor */}
        <div className="glass-panel room-selector-bar">
          <div className="room-bar-title">
            <span>Floor {selectedFloor} Rooms (10 Total):</span>
          </div>
          <div className="room-pills-scroll">
            {rooms.map(room => (
              <button
                key={room.id}
                type="button"
                className={`room-pill ${room.id === selectedRoomId ? 'active' : ''} ${room.alert ? 'has-alert' : ''}`}
                onClick={() => setSelectedRoomId(room.id)}
              >
                <span className="room-pill-id">{room.id}</span>
                <span className="room-pill-name">{room.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* UI Overlay Card (Right Side Room Diagnostics & Controls) */}
      <div className="overlay-ui">
        {/* Top Header Badge */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div className="glass-panel overlay-element" style={{ padding: '16px', display: 'flex', gap: '14px', alignItems: 'center' }}>
            <div style={{ background: 'rgba(6, 182, 212, 0.2)', padding: '10px', borderRadius: '10px' }}>
              <Settings2 color="var(--accent-cyan)" size={22} />
            </div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '1.1rem', letterSpacing: '0.02em' }}>
                FLOOR {selectedFloor} / ROOM {currentRoom?.id || selectedRoomId}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {currentRoom?.name || 'Interactive Digital Twin Node'}
              </div>
            </div>
          </div>
          
          {currentRoom?.alert && (
            <div className="glass-panel overlay-element alert-pulsing-banner">
              <AlertTriangle color="var(--status-danger)" />
              <div>
                <div style={{ color: 'var(--status-danger)', fontWeight: '700' }}>TEMPERATURE THRESHOLD WARNING</div>
                <div style={{ fontSize: '0.75rem', color: '#fca5a5' }}>{currentRoom.alertMessage || 'Exceeds standard setpoint'}</div>
              </div>
            </div>
          )}
        </div>

        {/* Main Room Info & Control Card */}
        <div className="glass-panel room-info-card overlay-element">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontWeight: '600', fontSize: '1rem' }}>Node Telemetry</h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>BACnet/IP Gateway Node #{currentRoom?.id}</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {actionSuccess && (
                <span className="action-success-pill">
                  <Check size={12} /> {actionSuccess}
                </span>
              )}
              <span 
                className="status-indicator" 
                style={{ 
                  background: currentRoom?.alert 
                    ? 'var(--status-danger)' 
                    : (currentRoom?.temperature && currentRoom.temperature > 28 ? 'var(--status-warning)' : 'var(--status-normal)') 
                }}
              ></span>
            </div>
          </div>

          {/* Sensor Telemetry List */}
          <div className="sensor-list">
            <div className="sensor-item">
              <div className="sensor-left">
                <Thermometer size={16} />
                <span>Temperature</span>
              </div>
              <div className={`sensor-value ${currentRoom?.alert ? 'value-danger' : (currentRoom?.temperature && currentRoom.temperature > 28 ? 'value-warning' : 'value-normal')}`}>
                {currentRoom?.temperature.toFixed(1)}°C
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '6px' }}>(Target: {currentRoom?.targetTemp}°C)</span>
              </div>
            </div>
            
            <div className="sensor-item">
              <div className="sensor-left">
                <Fan size={16} />
                <span>HVAC / Fan Mode</span>
              </div>
              <div className="sensor-value">
                {currentRoom?.fanOn ? (
                  <span style={{ color: 'var(--accent-blue)', fontWeight: '600' }}>ON ({currentRoom.fanMode})</span>
                ) : (
                  <span style={{ color: 'var(--text-muted)' }}>OFF</span>
                )}
              </div>
            </div>

            <div className="sensor-item">
              <div className="sensor-left">
                <Users size={16} />
                <span>Occupancy</span>
              </div>
              <div className="sensor-value" style={{ color: currentRoom?.occupancy ? 'var(--status-normal)' : 'var(--text-muted)' }}>
                {currentRoom?.occupancy ? `DETECTED (${currentRoom.occupancyCount} persons)` : 'VACANT'}
              </div>
            </div>

            <div className="sensor-item">
              <div className="sensor-left">
                <Lightbulb size={16} />
                <span>Lighting</span>
              </div>
              <div className="sensor-value" style={{ color: currentRoom?.lightOn ? 'var(--status-warning)' : 'var(--text-muted)' }}>
                {currentRoom?.lightOn ? 'ACTIVE (100%)' : 'STANDBY'}
              </div>
            </div>

            <div className="sensor-item">
              <div className="sensor-left">
                <Lock size={16} />
                <span>Security Access Door</span>
              </div>
              <div className="sensor-value" style={{ color: currentRoom?.securityLocked ? 'var(--status-danger)' : 'var(--status-normal)' }}>
                {currentRoom?.securityLocked ? 'LOCKED / SECURED' : 'UNLOCKED / NORMAL'}
              </div>
            </div>

            <div className="sensor-item">
              <div className="sensor-left">
                <Zap size={16} />
                <span>Power Draw</span>
              </div>
              <div className="sensor-value" style={{ color: 'var(--accent-cyan)' }}>
                {currentRoom?.powerDrawKw} kW
              </div>
            </div>
          </div>

          {/* Interactive BMS Control Panel */}
          <div className="room-control-buttons-section">
            <h4 className="control-section-title">Manual Override Dispatch</h4>

            <div className="control-buttons-grid">
              <button 
                type="button"
                onClick={handleHeatRoom}
                className="btn-control btn-heat"
                title="Increase room temperature setpoint"
                disabled={isLoading}
              >
                + Heat (+1.5°C)
              </button>
              
              <button 
                type="button"
                onClick={handleCoolRoom}
                className="btn-control btn-cool"
                title="Decrease room temperature setpoint"
                disabled={isLoading}
              >
                - Cool (-1.5°C)
              </button>

              <button 
                type="button"
                onClick={handleToggleFan}
                className={`btn-control ${currentRoom?.fanOn ? 'btn-active-cyan' : ''}`}
                disabled={isLoading}
              >
                <Fan size={14} />
                Fan: {currentRoom?.fanOn ? 'ON' : 'OFF'}
              </button>

              <button 
                type="button"
                onClick={handleToggleLight}
                className={`btn-control ${currentRoom?.lightOn ? 'btn-active-yellow' : ''}`}
                disabled={isLoading}
              >
                <Lightbulb size={14} />
                Light: {currentRoom?.lightOn ? 'ON' : 'OFF'}
              </button>
            </div>

            <div style={{ marginTop: '10px' }}>
              <button 
                type="button"
                onClick={handleToggleLock}
                className={`btn-control btn-full-width ${currentRoom?.securityLocked ? 'btn-danger-locked' : 'btn-normal-unlocked'}`}
                disabled={isLoading}
              >
                {currentRoom?.securityLocked ? <Lock size={14} /> : <Unlock size={14} />}
                <span>{currentRoom?.securityLocked ? 'Unlock Security Door' : 'Engage Physical Door Lock'}</span>
              </button>
            </div>
          </div>

          {/* Floor Scope Warning for Floor Users */}
          {isFloorUser && (
            <div className="floor-user-notice">
              <Lock size={12} />
              <span>Restricted by Role: You can view and control Floor {user?.allowedFloors[0]} rooms only.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DigitalTwin;
