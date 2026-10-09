import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Lock, 
  Unlock, 
  Activity, 
  Cctv, 
  History, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Flame, 
  Radio
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { SecurityState, AccessLog } from '../types/auth';

export const SecuritySOC: React.FC = () => {
  const { isFloorUser, triggerSecurityViolation } = useAuth();

  const [securityState, setSecurityState] = useState<SecurityState | null>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const fetchSOCData = async () => {
    setIsLoading(true);
    try {
      const res = await api.getSecuritySoc();
      if (res.success) {
        setSecurityState(res.securityState);
        setMetrics(res.metrics);
        setLogs(res.recentLogs);
      }
    } catch (err: any) {
      triggerSecurityViolation(err.message || 'Access Denied: SOC requires Security Super Admin clearance.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSOCData();
  }, []);

  const handleToggleLockdown = async () => {
    if (isFloorUser) {
      triggerSecurityViolation('Access Denied: Building lockdown requires Security Super Admin clearance.');
      return;
    }

    try {
      const targetState = !securityState?.lockdownActive;
      const res = await api.toggleLockdown(targetState);
      if (res.success) {
        setSecurityState(prev => prev ? { ...prev, lockdownActive: res.lockdownActive } : null);
        setActionNotice(res.message);
        fetchSOCData();
      }
    } catch (err: any) {
      triggerSecurityViolation(err.message);
    }
  };

  const handleThreatLevel = async (level: string) => {
    try {
      const res = await api.setThreatLevel(level);
      if (res.success) {
        setSecurityState(prev => prev ? { ...prev, threatLevel: res.threatLevel as any } : null);
        setActionNotice(res.message);
      }
    } catch (err: any) {
      triggerSecurityViolation(err.message);
    }
  };

  const threatLevels = [
    { label: 'DEFCON-5 (LOW)', color: '#10b981' },
    { label: 'DEFCON-4 (GUARDED)', color: '#06b6d4' },
    { label: 'DEFCON-3 (ELEVATED)', color: '#f59e0b' },
    { label: 'DEFCON-2 (HIGH)', color: '#f97316' },
    { label: 'DEFCON-1 (SEVERE)', color: '#ef4444' }
  ];

  return (
    <div className="content-padding">
      {/* SOC Header */}
      <div className="soc-header-banner glass-panel">
        <div className="soc-header-left">
          <div className="soc-badge">
            <ShieldAlert size={16} color="var(--status-danger)" />
            <span>CENTRAL SECURITY BUREAU — SOC COMMAND</span>
          </div>
          <h2 className="soc-title">Building 01 Physical & Cyber Access Matrix</h2>
          <p className="soc-subtitle">
            Restricted to Chief Security Officer (<code>securitysuper.sentinelai@gmail.com</code>). 
            Supervisory command across all 5 floors (50 rooms), CCTV nodes, and biometric access barriers.
          </p>
        </div>

        <div className="soc-threat-pill" style={{ 
          borderColor: securityState?.lockdownActive ? 'var(--status-danger)' : 'var(--status-normal)',
          background: securityState?.lockdownActive ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.1)'
        }}>
          <Radio size={16} className={securityState?.lockdownActive ? 'pulse-red' : ''} />
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ACTIVE THREAT POSTURE</div>
            <div style={{ fontWeight: '700', color: securityState?.lockdownActive ? 'var(--status-danger)' : 'var(--status-normal)' }}>
              {securityState?.threatLevel || 'DEFCON-5 (LOW)'}
            </div>
          </div>
        </div>
      </div>

      {actionNotice && (
        <div className="action-feedback-toast glass-panel" style={{ borderColor: 'var(--accent-cyan)' }}>
          <Activity size={18} color="var(--accent-cyan)" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Main SOC Control Section */}
      <div className="dashboard-grid" style={{ marginTop: '24px' }}>
        <div className="glass-panel stat-card">
          <div className="stat-header">
            <span className="stat-label">Secured / Locked Rooms</span>
            <Lock className="stat-icon" style={{ color: 'var(--status-danger)' }} size={20} />
          </div>
          <div className="stat-value">{metrics?.lockedRooms ?? 0} / 50</div>
          <div className="stat-label">Across all 5 floors</div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-header">
            <span className="stat-label">Perimeter Gateways</span>
            <Radio className="stat-icon" style={{ color: 'var(--status-normal)' }} size={20} />
          </div>
          <div className="stat-value">5 / 5</div>
          <div className="stat-label">All floor gateway nodes online</div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-header">
            <span className="stat-label">CCTV Cameras</span>
            <Cctv className="stat-icon" style={{ color: 'var(--accent-cyan)' }} size={20} />
          </div>
          <div className="stat-value">48 Active</div>
          <div className="stat-label">Zero tampering incidents</div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-header">
            <span className="stat-label">Security Alerts</span>
            <AlertTriangle className="stat-icon" style={{ color: metrics?.criticalAlerts > 0 ? 'var(--status-danger)' : 'var(--status-normal)' }} size={20} />
          </div>
          <div className="stat-value">{metrics?.criticalAlerts ?? 0}</div>
          <div className="stat-label" style={{ color: metrics?.criticalAlerts > 0 ? 'var(--status-danger)' : 'var(--status-normal)' }}>
            {metrics?.criticalAlerts > 0 ? 'Immediate verification required' : 'Perimeter nominal'}
          </div>
        </div>
      </div>

      {/* Master Lockdown Control Panel */}
      <div className="glass-panel" style={{ padding: '24px', marginTop: '24px' }}>
        <div className="panel-header">
          <div>
            <h3 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Flame color="var(--status-danger)" />
              Master Emergency Building Lockdown Protocol
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Engages physical magnetic fail-secure locks across all 50 rooms and perimeter doors on all 5 floors simultaneously.
            </p>
          </div>

          <button 
            type="button"
            className={`btn-lockdown-master ${securityState?.lockdownActive ? 'btn-lockdown-engaged' : ''}`}
            onClick={handleToggleLockdown}
            disabled={isLoading}
          >
            {securityState?.lockdownActive ? (
              <>
                <Unlock size={20} />
                <span>RELEASE FULL FACILITY LOCKDOWN</span>
              </>
            ) : (
              <>
                <Lock size={20} />
                <span>ENGAGE EMERGENCY 50-ROOM LOCKDOWN</span>
              </>
            )}
          </button>
        </div>

        {/* Threat Level Switcher */}
        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-glass)' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '10px', color: 'var(--text-secondary)' }}>
            Calibrate Threat Advisory Posture:
          </div>
          <div className="threat-buttons-row">
            {threatLevels.map(t => (
              <button
                key={t.label}
                type="button"
                className={`threat-level-btn ${securityState?.threatLevel === t.label ? 'active' : ''}`}
                style={{ borderColor: securityState?.threatLevel === t.label ? t.color : 'rgba(255,255,255,0.1)' }}
                onClick={() => handleThreatLevel(t.label)}
              >
                <span className="threat-dot" style={{ background: t.color }}></span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Live Access Control Audit Logs */}
      <div className="glass-panel" style={{ padding: '24px', marginTop: '24px' }}>
        <div className="panel-header">
          <div>
            <h3 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <History color="var(--accent-cyan)" />
              Live Access & Authentication Audit Trail
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Every login attempt, role transition, floor navigation, and control dispatch is recorded on the backend.
            </p>
          </div>
          <button type="button" className="btn-refresh-logs" onClick={fetchSOCData}>
            Refresh Audit Logs
          </button>
        </div>

        <div className="logs-table-wrapper">
          <table className="logs-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Subject / Email</th>
                <th>Action</th>
                <th>Target Scope</th>
                <th>Status</th>
                <th>Security Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id} className={log.status === 'DENIED' ? 'log-row-denied' : ''}>
                  <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td>
                    <code>{log.userEmail}</code>
                  </td>
                  <td style={{ fontWeight: '500' }}>{log.action}</td>
                  <td>{log.target}</td>
                  <td>
                    <span className={`log-status-pill ${log.status === 'GRANTED' ? 'status-granted' : 'status-denied'}`}>
                      {log.status === 'GRANTED' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                      {log.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SecuritySOC;
