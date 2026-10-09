import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Thermometer, 
  Fan, 
  Lightbulb, 
  Lock, 
  Unlock, 
  Users, 
  Box, 
  AlertTriangle, 
  Zap, 
  CheckCircle2, 
  Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { Room } from '../types/auth';

interface RoomsPageProps {
  onSelectRoomFor3D?: (roomId: string) => void;
}

export const RoomsPage: React.FC<RoomsPageProps> = ({ onSelectRoomFor3D }) => {
  const { user, isFloorUser, triggerSecurityViolation } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [floorFilter, setFloorFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    const fetchRooms = async () => {
      setIsLoading(true);
      try {
        const res = await api.getAllAccessibleRooms();
        if (res.success) {
          setRooms(res.rooms);
        }
      } catch (err: any) {
        triggerSecurityViolation(err.message || 'Failed to load rooms directory');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRooms();
  }, [triggerSecurityViolation]);

  const showNotification = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 2500);
  };

  const handleToggleFan = async (room: Room) => {
    try {
      const res = await api.updateRoomControl(room.id, { fanOn: !room.fanOn, fanMode: !room.fanOn ? 'ON' : 'OFF' });
      if (res.success) {
        setRooms(prev => prev.map(r => r.id === room.id ? res.room : r));
        showNotification(`Room ${room.id} fan set to ${!room.fanOn ? 'ON' : 'OFF'}`);
      }
    } catch (err: any) {
      triggerSecurityViolation(err.message);
    }
  };

  const handleToggleLight = async (room: Room) => {
    try {
      const res = await api.updateRoomControl(room.id, { lightOn: !room.lightOn });
      if (res.success) {
        setRooms(prev => prev.map(r => r.id === room.id ? res.room : r));
        showNotification(`Room ${room.id} lighting toggled`);
      }
    } catch (err: any) {
      triggerSecurityViolation(err.message);
    }
  };

  const handleToggleLock = async (room: Room) => {
    try {
      const res = await api.updateRoomControl(room.id, { securityLocked: !room.securityLocked });
      if (res.success) {
        setRooms(prev => prev.map(r => r.id === room.id ? res.room : r));
        showNotification(`Room ${room.id} door ${!room.securityLocked ? 'LOCKED' : 'UNLOCKED'}`);
      }
    } catch (err: any) {
      triggerSecurityViolation(err.message);
    }
  };

  // Filter logic
  const filteredRooms = rooms.filter(r => {
    // Floor filter (for admin)
    if (floorFilter !== 'all' && r.floor !== parseInt(floorFilter, 10)) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesId = r.id.toLowerCase().includes(q);
      const matchesName = r.name.toLowerCase().includes(q);
      const matchesType = r.type.toLowerCase().includes(q);
      if (!matchesId && !matchesName && !matchesType) return false;
    }

    // Status filter
    if (statusFilter === 'alert' && !r.alert) return false;
    if (statusFilter === 'occupied' && !r.occupancy) return false;
    if (statusFilter === 'locked' && !r.securityLocked) return false;
    if (statusFilter === 'cooling' && !r.fanOn) return false;

    return true;
  });

  return (
    <div className="content-padding">
      {/* Header */}
      <div className="panel-header" style={{ marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 className="panel-title">
              {isFloorUser ? `Floor ${user?.allowedFloors[0]} Rooms Directory` : 'Enterprise Rooms Matrix'}
            </h2>
            <span className="room-count-badge">
              {filteredRooms.length} of {rooms.length} Rooms
            </span>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {isFloorUser 
              ? `Isolated Floor ${user?.allowedFloors[0]} perimeter. 10 rooms allocated to ${user?.email}.` 
              : 'Unrestricted enterprise directory covering all 5 floors and 50 building rooms.'}
          </p>
        </div>

        {feedback && (
          <div className="action-feedback-pill">
            <CheckCircle2 size={14} />
            <span>{feedback}</span>
          </div>
        )}
      </div>

      {/* Filter and Search Controls */}
      <div className="glass-panel rooms-filter-bar">
        {/* Search */}
        <div className="search-input-box">
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search by room # (e.g. 103), name, or room type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rooms-search-input"
          />
        </div>

        {/* Floor Filter (If Admin) */}
        {!isFloorUser && (
          <div className="filter-group">
            <span className="filter-label"><Layers size={14} /> Floor:</span>
            <select 
              value={floorFilter} 
              onChange={(e) => setFloorFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All 5 Floors (50 Rooms)</option>
              <option value="1">Floor 1 (Rooms 101 - 110)</option>
              <option value="2">Floor 2 (Rooms 201 - 210)</option>
              <option value="3">Floor 3 (Rooms 301 - 310)</option>
              <option value="4">Floor 4 (Rooms 401 - 410)</option>
              <option value="5">Floor 5 (Rooms 501 - 510)</option>
            </select>
          </div>
        )}

        {/* Status Filter */}
        <div className="filter-group">
          <span className="filter-label">Filter Status:</span>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Statuses</option>
            <option value="occupied">Occupied Rooms</option>
            <option value="cooling">HVAC Cooling Active</option>
            <option value="locked">Door Locked / Secured</option>
            <option value="alert">Active Thermal Alerts</option>
          </select>
        </div>
      </div>

      {/* Rooms Card Grid */}
      <div className="rooms-cards-grid" style={{ marginTop: '24px' }}>
        {filteredRooms.map(room => (
          <div 
            key={room.id}
            className={`room-full-card glass-panel ${room.alert ? 'card-has-alert' : ''}`}
          >
            {/* Card Header */}
            <div className="room-card-header-row">
              <div>
                <div className="room-id-tag">
                  FLOOR 0{room.floor} / ROOM {room.id}
                </div>
                <div className="room-full-name">{room.name}</div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span 
                  className="status-indicator" 
                  style={{ 
                    background: room.alert 
                      ? 'var(--status-danger)' 
                      : (room.temperature > 28 ? 'var(--status-warning)' : 'var(--status-normal)') 
                  }}
                  title={room.alert ? 'Thermal alert' : 'Nominal'}
                ></span>
              </div>
            </div>

            {room.alert && (
              <div className="card-alert-strip">
                <AlertTriangle size={14} />
                <span>{room.alertMessage || 'High temperature threshold!'}</span>
              </div>
            )}

            {/* Sensor Data Grid */}
            <div className="room-metrics-grid">
              <div className="metric-box">
                <div className="metric-header">
                  <Thermometer size={14} />
                  <span>Temp</span>
                </div>
                <div className={`metric-val ${room.temperature > 28 ? 'value-warning' : 'value-normal'}`}>
                  {room.temperature.toFixed(1)}°C
                </div>
              </div>

              <div className="metric-box">
                <div className="metric-header">
                  <Fan size={14} />
                  <span>HVAC</span>
                </div>
                <div className="metric-val" style={{ color: room.fanOn ? 'var(--accent-blue)' : 'var(--text-muted)' }}>
                  {room.fanOn ? 'ON' : 'OFF'}
                </div>
              </div>

              <div className="metric-box">
                <div className="metric-header">
                  <Users size={14} />
                  <span>People</span>
                </div>
                <div className="metric-val" style={{ color: room.occupancy ? 'var(--status-normal)' : 'var(--text-muted)' }}>
                  {room.occupancy ? `${room.occupancyCount}` : 'None'}
                </div>
              </div>

              <div className="metric-box">
                <div className="metric-header">
                  <Zap size={14} />
                  <span>Power</span>
                </div>
                <div className="metric-val" style={{ color: 'var(--accent-cyan)' }}>
                  {room.powerDrawKw} kW
                </div>
              </div>
            </div>

            {/* Quick Action Toggles */}
            <div className="room-card-actions">
              <button 
                type="button" 
                className={`btn-action-pill ${room.fanOn ? 'active-fan' : ''}`}
                onClick={() => handleToggleFan(room)}
                title="Toggle HVAC Fan"
              >
                <Fan size={13} />
                <span>{room.fanOn ? 'Fan ON' : 'Fan OFF'}</span>
              </button>

              <button 
                type="button" 
                className={`btn-action-pill ${room.lightOn ? 'active-light' : ''}`}
                onClick={() => handleToggleLight(room)}
                title="Toggle Lights"
              >
                <Lightbulb size={13} />
                <span>{room.lightOn ? 'Light ON' : 'Light OFF'}</span>
              </button>

              <button 
                type="button" 
                className={`btn-action-pill ${room.securityLocked ? 'active-locked' : ''}`}
                onClick={() => handleToggleLock(room)}
                title="Toggle Security Lock"
              >
                {room.securityLocked ? <Lock size={13} /> : <Unlock size={13} />}
                <span>{room.securityLocked ? 'Locked' : 'Unlocked'}</span>
              </button>

              <button 
                type="button" 
                className="btn-action-pill btn-open-3d"
                onClick={() => onSelectRoomFor3D && onSelectRoomFor3D(room.id)}
                title="Open in 3D Digital Twin"
              >
                <Box size={13} />
                <span>3D View</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredRooms.length === 0 && !isLoading && (
        <div className="empty-rooms-box glass-panel">
          <p>No rooms found matching the current search query or filter.</p>
        </div>
      )}
    </div>
  );
};

export default RoomsPage;
