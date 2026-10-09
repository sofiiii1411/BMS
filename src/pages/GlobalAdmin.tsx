import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  Users, 
  Fan, 
  Zap, 
  CheckCircle2, 
  Layers, 
  Cpu, 
  Server, 
  Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { AuthorizedAccount } from '../types/auth';

export const GlobalAdmin: React.FC = () => {
  const { user, isGlobalAdmin, triggerSecurityViolation } = useAuth();
  const [data, setData] = useState<any>(null);
  const [accounts, setAccounts] = useState<AuthorizedAccount[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await api.getGlobalAdminStatus();
      if (res.success) {
        setData(res.overview);
        setAccounts(res.authorizedAccounts);
      }
    } catch (err: any) {
      triggerSecurityViolation(err.message || 'Access Denied: Global Admin clearance required.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGlobalHvac = async (mode: 'ECO' | 'PERFORMANCE' | 'OFF') => {
    if (!isGlobalAdmin) {
      triggerSecurityViolation('Access Denied: Global HVAC override requires Global Admin clearance.');
      return;
    }

    try {
      const res = await api.globalHvacOverride(mode);
      if (res.success) {
        setActionNotice(res.message);
        fetchData();
      }
    } catch (err: any) {
      triggerSecurityViolation(err.message);
    }
  };

  return (
    <div className="content-padding">
      {/* Banner */}
      <div className="global-admin-banner glass-panel">
        <div>
          <div className="global-badge">
            <Sliders size={16} color="var(--accent-purple)" />
            <span>ENTERPRISE SYSTEMS DIRECTORATE</span>
          </div>
          <h2 className="panel-title" style={{ fontSize: '1.75rem', marginTop: '8px' }}>
            SentinelAI Global Command & Policy Registry
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Active clearance: <strong>{user?.roleTitle}</strong> ({user?.email}). Full supervisory authority over all 5 floors, 50 rooms, BACnet controllers, and authorized role whitelist.
          </p>
        </div>
      </div>

      {actionNotice && (
        <div className="action-feedback-toast glass-panel" style={{ borderColor: 'var(--accent-purple)', marginTop: '20px' }}>
          <CheckCircle2 size={18} color="var(--accent-purple)" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Enterprise KPI Grid */}
      <div className="dashboard-grid" style={{ marginTop: '24px' }}>
        <div className="glass-panel stat-card">
          <div className="stat-header">
            <span className="stat-label">Whole Facility Rooms</span>
            <Layers className="stat-icon" size={20} />
          </div>
          <div className="stat-value">{data?.totalRooms || 50}</div>
          <div className="stat-label">10 Rooms per Floor (5 Floors)</div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-header">
            <span className="stat-label">Active Power Consumption</span>
            <Zap className="stat-icon" style={{ color: 'var(--accent-cyan)' }} size={20} />
          </div>
          <div className="stat-value">{data?.totalPowerKw || '64.8'} kW</div>
          <div className="stat-label">Real-time combined energy draw</div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-header">
            <span className="stat-label">Total Building Occupants</span>
            <Users className="stat-icon" style={{ color: 'var(--accent-purple)' }} size={20} />
          </div>
          <div className="stat-value">{data?.totalOccupants || 12}</div>
          <div className="stat-label">Across 50 building zones</div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-header">
            <span className="stat-label">Operating HVAC Chillers</span>
            <Fan className="stat-icon" style={{ color: 'var(--status-normal)' }} size={20} />
          </div>
          <div className="stat-value">{data?.activeHvacUnits || 42} / 50</div>
          <div className="stat-label">Optimal climate envelope</div>
        </div>
      </div>

      {/* Global HVAC Override Controls */}
      <div className="glass-panel" style={{ padding: '24px', marginTop: '24px' }}>
        <div className="panel-header">
          <div>
            <h3 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Fan color="var(--accent-blue)" />
              Facility-Wide HVAC & Energy Automation Override
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Broadcasts immediate setpoint calibrations to all 5 floor gateways and 50 terminal fan coil units.
            </p>
          </div>
        </div>

        <div className="global-hvac-buttons-grid">
          <button 
            type="button" 
            className="btn-hvac-preset btn-eco-preset"
            onClick={() => handleGlobalHvac('ECO')}
            disabled={isLoading}
          >
            <div className="preset-top">
              <Zap size={20} color="var(--status-normal)" />
              <span className="preset-title">Eco-Energy Saving Mode</span>
            </div>
            <p className="preset-desc">
              Sets target temperature to 25.0°C and HVAC to AUTO demand-controlled ventilation. Reduces peak grid load by ~22%.
            </p>
            <div className="preset-action">Apply to 50 Rooms →</div>
          </button>

          <button 
            type="button" 
            className="btn-hvac-preset btn-performance-preset"
            onClick={() => handleGlobalHvac('PERFORMANCE')}
            disabled={isLoading}
          >
            <div className="preset-top">
              <Fan size={20} color="var(--accent-cyan)" />
              <span className="preset-title">Peak Performance Cooling</span>
            </div>
            <p className="preset-desc">
              Enforces rapid chilling to 21.0°C with high CFM circulation. Ideal for server hubs, laboratories, and high-density events.
            </p>
            <div className="preset-action">Apply to 50 Rooms →</div>
          </button>
        </div>
      </div>

      {/* Authorized Accounts & Role Whitelist Registry */}
      <div className="glass-panel" style={{ padding: '24px', marginTop: '24px' }}>
        <div className="panel-header">
          <div>
            <h3 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Users color="var(--accent-purple)" />
              Authorized Accounts & Role Permissions Whitelist
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              The 7 authorized Gmail accounts registered in SentinelAI core. All other accounts are blocked at the authentication gateway.
            </p>
          </div>
          <span className="whitelist-pill">7 Verified Accounts</span>
        </div>

        <div className="accounts-registry-grid">
          {accounts.map(acc => (
            <div key={acc.email} className="account-registry-card glass-panel">
              <div className="acc-card-top">
                <div className="acc-avatar" style={{
                  background: acc.role === 'SECURITY_SUPER_ADMIN' 
                    ? '#ef4444' 
                    : acc.role === 'GLOBAL_ADMIN' 
                    ? '#a855f7' 
                    : '#06b6d4'
                }}>
                  {acc.avatarInitial}
                </div>
                <div>
                  <div className="acc-name">{acc.name}</div>
                  <div className="acc-role-title">{acc.roleTitle}</div>
                </div>
              </div>

              <div className="acc-email-box">
                <code>{acc.email}</code>
              </div>

              <div className="acc-details-list">
                <div className="acc-detail-row">
                  <span className="detail-key">Clearance:</span>
                  <span className="detail-val">{acc.clearanceLevel}</span>
                </div>
                <div className="acc-detail-row">
                  <span className="detail-key">Department:</span>
                  <span className="detail-val">{acc.department}</span>
                </div>
                <div className="acc-detail-row">
                  <span className="detail-key">Floor Scope:</span>
                  <span className="detail-val" style={{ fontWeight: '600', color: 'var(--accent-cyan)' }}>
                    {acc.allowedFloors.length === 5 ? 'All 5 Floors (50 Rooms)' : `Floor ${acc.allowedFloors[0]} (10 Rooms)`}
                  </span>
                </div>
              </div>

              <div className="acc-permissions-tags">
                {acc.permissions.map(perm => (
                  <span key={perm} className="perm-tag">
                    <Lock size={10} />
                    {perm}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gateway Controllers Status */}
      <div className="glass-panel" style={{ padding: '24px', marginTop: '24px' }}>
        <div className="panel-header">
          <h3 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Server color="var(--accent-cyan)" />
            Floor Edge Gateways & BACnet Controller Infrastructure
          </h3>
          <span className="status-online-pill">5 of 5 Online</span>
        </div>

        <div className="gateways-grid">
          {[1, 2, 3, 4, 5].map(floor => (
            <div key={floor} className="gateway-node-card">
              <div className="gateway-top">
                <Cpu size={16} color="var(--accent-cyan)" />
                <span className="gateway-title">GATEWAY-FL0{floor}</span>
              </div>
              <div className="gateway-desc">Controls 10 Terminal Nodes (Rooms {floor}01 - {floor}10)</div>
              <div className="gateway-status">
                <span className="status-indicator status-online"></span>
                BACnet/IP Connected (Latency: 4ms)
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GlobalAdmin;
