import React, { useState, useEffect } from 'react';
import { 
  Thermometer, 
  Droplets, 
  Users, 
  AlertCircle, 
  Fan, 
  Activity, 
  ShieldAlert, 
  Lock, 
  Unlock, 
  Zap, 
  Layers, 
  Sliders, 
  ShieldCheck, 
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { Room, SecurityState } from '../types/auth';

interface OverviewProps {
  onNavigateTab?: (tab: string) => void;
}

export const Overview: React.FC<OverviewProps> = ({ onNavigateTab }) => {
  const { user, isFloorUser, isSecuritySuperAdmin, isGlobalAdmin, triggerSecurityViolation } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [securityState, setSecurityState] = useState<SecurityState | null>(null);
  const [_isLoading, setIsLoading] = useState<boolean>(true);

  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const roomsRes = await api.getAllAccessibleRooms();
        if (roomsRes.success) {
          setRooms(roomsRes.rooms);
        }

        if (isSecuritySuperAdmin || isGlobalAdmin) {
          const socRes = await api.getSecuritySoc();
          if (socRes.success) {
            setSecurityState(socRes.securityState);
          }
        }
      } catch (err: any) {
        triggerSecurityViolation(err.message || 'Failed to fetch overview metrics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isSecuritySuperAdmin, isGlobalAdmin, triggerSecurityViolation]);

  const showNotification = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 3000);
  };

  // Calculations
  const roomCount = rooms.length;
  const avgTemp = roomCount > 0 ? (rooms.reduce((acc, r) => acc + r.temperature, 0) / roomCount).toFixed(1) : '24.0';
  const avgHumidity = roomCount > 0 ? Math.round(rooms.reduce((acc, r) => acc + r.humidity, 0) / roomCount) : 50;
  const totalOccupants = rooms.reduce((acc, r) => acc + r.occupancyCount, 0);
  const activeAlerts = rooms.filter(r => r.alert).length;
  const activeHvac = rooms.filter(r => r.fanOn).length;
  const lockedDoors = rooms.filter(r => r.securityLocked).length;
  const totalPower = rooms.reduce((acc, r) => acc + r.powerDrawKw, 0).toFixed(1);

  const handleQuickLockdown = async () => {
    if (isFloorUser) {
      triggerSecurityViolation('Access Denied: Building-wide lockdown requires Security Super Admin clearance.');
      return;
    }
    try {
      const target = !(securityState?.lockdownActive);
      const res = await api.toggleLockdown(target);
      if (res.success) {
        setSecurityState(prev => prev ? { ...prev, lockdownActive: res.lockdownActive } : null);
        showNotification(res.message);
        // Refresh rooms
        const updated = await api.getAllAccessibleRooms();
        if (updated.success) setRooms(updated.rooms);
      }
    } catch (err: any) {
      triggerSecurityViolation(err.message);
    }
  };

  const handleGlobalHvac = async (mode: 'ECO' | 'PERFORMANCE') => {
    if (!isGlobalAdmin) {
      triggerSecurityViolation('Access Denied: Global HVAC override requires Global Administrator privileges.');
      return;
    }
    try {
      const res = await api.globalHvacOverride(mode);
      if (res.success) {
        showNotification(`Global HVAC calibrated to ${mode} mode across all 50 rooms.`);
        const updated = await api.getAllAccessibleRooms();
        if (updated.success) setRooms(updated.rooms);
      }
    } catch (err: any) {
      triggerSecurityViolation(err.message);
    }
  };

  return (
    <div className="content-padding">
      {/* Scope Banner & Role Introduction */}
      <div className="dashboard-welcome-banner glass-panel">
        <div className="welcome-left">
          <div className="welcome-role-tag">
            {isSecuritySuperAdmin ? (
              <span className="badge-crimson"><ShieldAlert size={14} /> SECURITY OPERATIONS CENTER CONTEXT</span>
            ) : isGlobalAdmin ? (
              <span className="badge-purple"><Sliders size={14} /> ENTERPRISE FACILITY COMMAND CONTEXT</span>
            ) : (
              <span className="badge-cyan"><Layers size={14} /> FLOOR {user?.allowedFloors[0]} DEDICATED CONTEXT</span>
            )}
          </div>
          <h2 className="welcome-title">
            {isFloorUser 
              ? `Floor ${user?.allowedFloors[0]} Management Console` 
              : `SentinelAI Enterprise Facility Command`}
          </h2>
          <p className="welcome-subtitle">
            {isFloorUser 
              ? `Assigned scope: 10 rooms (Rooms ${user?.allowedFloors[0]}01 – ${user?.allowedFloors[0]}10). All external floors quarantined.` 
              : `Overall access scope: All 5 floors and all 50 rooms with administrative authority.`}
          </p>
        </div>

        <div className="welcome-right">
          <div className="scope-stat-pill">
            <span className="stat-num">{roomCount}</span>
            <span className="stat-desc">Permitted Rooms</span>
          </div>
          <div className="scope-stat-pill">
            <span className="stat-num">{user?.allowedFloors.length}</span>
            <span className="stat-desc">Active Floors</span>
          </div>
        </div>
      </div>

      {actionMessage && (
        <div className="action-feedback-toast glass-panel">
          <ShieldCheck size={18} color="var(--status-normal)" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="dashboard-grid">
        <div className="glass-panel stat-card">
          <div className="stat-header">
            <span className="stat-label">Active Alerts</span>
            <AlertCircle className="stat-icon" style={{ color: activeAlerts > 0 ? 'var(--status-danger)' : 'var(--status-normal)' }} size={20} />
          </div>
          <div className="stat-value">{activeAlerts}</div>
          <div className="stat-label" style={{ color: activeAlerts > 0 ? 'var(--status-danger)' : 'var(--status-normal)' }}>
            {activeAlerts > 0 ? `${activeAlerts} rooms require attention` : 'All telemetry nominal'}
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-header">
            <span className="stat-label">Avg Temperature</span>
            <Thermometer className="stat-icon" size={20} />
          </div>
          <div className="stat-value">{avgTemp}°C</div>
          <div className="stat-label">Target Setpoint: 23.5°C</div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-header">
            <span className="stat-label">Avg Humidity</span>
            <Droplets className="stat-icon" style={{ color: 'var(--accent-blue)' }} size={20} />
          </div>
          <div className="stat-value">{avgHumidity}%</div>
          <div className="stat-label">Normal Range (45 - 65%)</div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-header">
            <span className="stat-label">Live Occupancy</span>
            <Users className="stat-icon" style={{ color: 'var(--accent-purple)' }} size={20} />
          </div>
          <div className="stat-value">{totalOccupants}</div>
          <div className="stat-label">Across {roomCount} Authorized Rooms</div>
        </div>
      </div>

      {/* Secondary Metrics & Quick Actions */}
      <div className="dashboard-main">
        {/* Subsystem Telemetry Status */}
        <div className="glass-panel panel-content" style={{ padding: '24px' }}>
          <div className="panel-header">
            <h3 className="panel-title">Facility Infrastructure Telemetry</h3>
            <span className="panel-tag">{isFloorUser ? `Floor ${user?.allowedFloors[0]} Scope` : 'Building-Wide (50 Nodes)'}</span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="telemetry-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div className="telemetry-icon-box" style={{ background: 'rgba(59, 130, 246, 0.15)' }}>
                  <Fan style={{ color: 'var(--accent-blue)' }} />
                </div>
                <div>
                  <div style={{ fontWeight: '600' }}>HVAC Circulation Units</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {activeHvac} / {roomCount} Units Operating
                  </div>
                </div>
              </div>
              <div className="telemetry-status-badge">
                <span className="status-indicator status-online"></span>
                ACTIVE COOLING
              </div>
            </div>

            <div className="telemetry-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div className="telemetry-icon-box" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
                  <Activity style={{ color: 'var(--status-normal)' }} />
                </div>
                <div>
                  <div style={{ fontWeight: '600' }}>Indoor Air Quality (IAQ)</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Average CO2: 440 ppm</div>
                </div>
              </div>
              <div style={{ color: 'var(--status-normal)', fontWeight: '600' }}>
                OPTIMAL (AQI 38)
              </div>
            </div>

            <div className="telemetry-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div className="telemetry-icon-box" style={{ background: 'rgba(245, 158, 11, 0.15)' }}>
                  <Zap style={{ color: 'var(--status-warning)' }} />
                </div>
                <div>
                  <div style={{ fontWeight: '600' }}>Electrical Grid Load</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Total Draw: {totalPower} kW
                  </div>
                </div>
              </div>
              <div style={{ color: 'var(--status-warning)', fontWeight: '600' }}>
                NORMAL EFFICIENCY
              </div>
            </div>

            <div className="telemetry-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div className="telemetry-icon-box" style={{ background: 'rgba(239, 68, 68, 0.15)' }}>
                  <Lock style={{ color: 'var(--status-danger)' }} />
                </div>
                <div>
                  <div style={{ fontWeight: '600' }}>Physical Perimeter Locks</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {lockedDoors} of {roomCount} Doors Secured
                  </div>
                </div>
              </div>
              <div style={{ color: lockedDoors > 0 ? 'var(--status-warning)' : 'var(--status-normal)', fontWeight: '600' }}>
                {lockedDoors > 0 ? `${lockedDoors} SECURED` : 'UNRESTRICTED'}
              </div>
            </div>
          </div>
        </div>

        {/* Role-Specific Quick Control Actions */}
        <div className="glass-panel panel-content" style={{ padding: '24px' }}>
          <div className="panel-header">
            <h3 className="panel-title">Role-Authorized Dispatch</h3>
            <span className="clearance-badge-small">{user?.clearanceLevel}</span>
          </div>

          <div style={{ display: 'grid', gap: '14px' }}>
            {/* Security Lockdown button (Accessible to Security Super Admin & Global Admin) */}
            {isSecuritySuperAdmin || isGlobalAdmin ? (
              <button 
                type="button"
                className={`quick-action-btn ${securityState?.lockdownActive ? 'btn-lockdown-active' : 'btn-lockdown-ready'}`}
                onClick={handleQuickLockdown}
              >
                <div className="action-btn-left">
                  {securityState?.lockdownActive ? <Unlock size={18} /> : <Lock size={18} />}
                  <span>{securityState?.lockdownActive ? 'RELEASE BUILDING LOCKDOWN' : 'EMERGENCY 50-ROOM LOCKDOWN'}</span>
                </div>
                <ArrowRight size={16} />
              </button>
            ) : (
              <div className="quick-action-disabled" title="Floor users cannot trigger building lockdown">
                <div className="action-btn-left">
                  <Lock size={16} />
                  <span>Building Lockdown (Security Admin Required)</span>
                </div>
                <span className="forbidden-badge">RESTRICTED</span>
              </div>
            )}

            {/* Global HVAC Override (Global Admin only) */}
            {isGlobalAdmin ? (
              <>
                <button 
                  type="button"
                  className="quick-action-btn btn-eco"
                  onClick={() => handleGlobalHvac('ECO')}
                >
                  <div className="action-btn-left">
                    <Fan size={18} />
                    <span>Global HVAC Eco-Mode (All 50 Rooms)</span>
                  </div>
                  <ArrowRight size={16} />
                </button>

                <button 
                  type="button"
                  className="quick-action-btn btn-performance"
                  onClick={() => handleGlobalHvac('PERFORMANCE')}
                >
                  <div className="action-btn-left">
                    <Zap size={18} />
                    <span>Global Performance Cooling (All Floors)</span>
                  </div>
                  <ArrowRight size={16} />
                </button>
              </>
            ) : isSecuritySuperAdmin ? (
              <button 
                type="button"
                className="quick-action-btn"
                onClick={() => onNavigateTab && onNavigateTab('security-soc')}
              >
                <div className="action-btn-left">
                  <ShieldAlert size={18} />
                  <span>Open Security Operations Center (SOC)</span>
                </div>
                <ArrowRight size={16} />
              </button>
            ) : (
              <button 
                type="button"
                className="quick-action-btn btn-eco"
                onClick={() => onNavigateTab && onNavigateTab('3d-building')}
              >
                <div className="action-btn-left">
                  <Layers size={18} />
                  <span>Inspect Floor {user?.allowedFloors[0]} Digital Twin</span>
                </div>
                <ArrowRight size={16} />
              </button>
            )}

            <button 
              type="button"
              className="quick-action-btn btn-secondary-action"
              onClick={() => onNavigateTab && onNavigateTab('rooms')}
            >
              <div className="action-btn-left">
                <Users size={18} />
                <span>View {isFloorUser ? `My 10 Rooms Grid` : 'Full 50 Rooms Directory'}</span>
              </div>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Authorized Room Preview Grid */}
      <div className="rooms-preview-section" style={{ marginTop: '32px' }}>
        <div className="panel-header">
          <div>
            <h3 className="panel-title">
              {isFloorUser 
                ? `Floor ${user?.allowedFloors[0]} Rooms Roster (10 Rooms Authorized)` 
                : `Authorized Rooms Matrix (${roomCount} Rooms Accessible)`}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Live real-time telemetry from BACnet gateway nodes
            </p>
          </div>
          <button 
            type="button" 
            className="btn-view-all-rooms"
            onClick={() => onNavigateTab && onNavigateTab('rooms')}
          >
            Manage All Rooms →
          </button>
        </div>

        <div className="overview-rooms-cards-grid">
          {rooms.slice(0, 10).map(room => (
            <div 
              key={room.id}
              className={`room-overview-card glass-panel ${room.alert ? 'card-has-alert' : ''}`}
              onClick={() => onNavigateTab && onNavigateTab('3d-building')}
            >
              <div className="room-card-top">
                <div className="room-card-badge">ROOM {room.id}</div>
                <span 
                  className="status-indicator" 
                  style={{ 
                    background: room.alert 
                      ? 'var(--status-danger)' 
                      : (room.temperature > 28 ? 'var(--status-warning)' : 'var(--status-normal)') 
                  }}
                ></span>
              </div>

              <div className="room-card-name">{room.name}</div>
              
              <div className="room-card-stats">
                <div className="stat-pill">
                  <Thermometer size={14} />
                  <span>{room.temperature.toFixed(1)}°C</span>
                </div>
                <div className="stat-pill">
                  <Fan size={14} style={{ color: room.fanOn ? 'var(--accent-blue)' : 'var(--text-muted)' }} />
                  <span>{room.fanOn ? 'ON' : 'OFF'}</span>
                </div>
                <div className="stat-pill">
                  <Users size={14} style={{ color: room.occupancy ? 'var(--status-normal)' : 'var(--text-muted)' }} />
                  <span>{room.occupancy ? `${room.occupancyCount}P` : '0'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Overview;
