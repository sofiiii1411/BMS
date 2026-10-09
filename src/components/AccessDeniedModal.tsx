import React from 'react';
import { ShieldAlert, Lock, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AccessDeniedModal: React.FC = () => {
  const { user, securityViolation, clearSecurityViolation } = useAuth();

  if (!securityViolation) return null;

  return (
    <div className="security-modal-backdrop">
      <div className="glass-panel security-modal-card">
        <button 
          className="modal-close-btn" 
          onClick={clearSecurityViolation}
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="modal-icon-header">
          <div className="shield-pulse-wrapper">
            <ShieldAlert size={36} color="var(--status-danger)" />
          </div>
        </div>

        <h3 className="modal-title">ACCESS DENIED BY SECURITY POLICY</h3>
        <p className="modal-message">{securityViolation.message}</p>

        <div className="modal-user-scope-box">
          <div className="scope-box-header">
            <Lock size={14} color="var(--accent-cyan)" />
            <span>Active Account Permissions</span>
          </div>
          <div className="scope-box-row">
            <span className="key">Authenticated User:</span>
            <span className="val"><code>{user?.email}</code></span>
          </div>
          <div className="scope-box-row">
            <span className="key">Assigned Role:</span>
            <span className="val">{user?.roleTitle}</span>
          </div>
          <div className="scope-box-row">
            <span className="key">Authorized Floors:</span>
            <span className="val" style={{ color: 'var(--accent-cyan)', fontWeight: '600' }}>
              Floor(s) {user?.allowedFloors.join(', ')} ({user?.allowedFloors.length === 5 ? '50 Rooms' : '10 Rooms'})
            </span>
          </div>
        </div>

        <div className="modal-footer">
          <button 
            type="button" 
            className="btn-modal-dismiss"
            onClick={clearSecurityViolation}
          >
            Acknowledge & Return to Authorized Floor Scope
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessDeniedModal;
