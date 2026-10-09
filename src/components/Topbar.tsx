import React from 'react';
import { 
  LogOut, 
  Shield, 
  Globe, 
  Layers, 
  Lock, 
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Topbar: React.FC = () => {
  const { user, logout, isFloorUser, isSecuritySuperAdmin, isGlobalAdmin, securityViolation, clearSecurityViolation } = useAuth();

  if (!user) return null;

  const getRoleBadge = () => {
    if (isSecuritySuperAdmin) {
      return (
        <span className="role-topbar-badge badge-security">
          <Shield size={14} />
          SECURITY SUPER ADMIN
        </span>
      );
    }
    if (isGlobalAdmin) {
      return (
        <span className="role-topbar-badge badge-global">
          <Globe size={14} />
          GLOBAL ADMINISTRATOR
        </span>
      );
    }
    return (
      <span className="role-topbar-badge badge-floor">
        <Layers size={14} />
        FLOOR {user.allowedFloors[0]} OPERATOR
      </span>
    );
  };

  const getScopeText = () => {
    if (isFloorUser) {
      const fl = user.allowedFloors[0];
      const startRoom = `${fl}01`;
      const endRoom = `${fl}10`;
      return `RESTRICTED SCOPE: FLOOR ${fl} (${startRoom} – ${endRoom}, 10 ROOMS)`;
    }
    return `ENTERPRISE SCOPE: ALL 5 FLOORS (50 ROOMS TOTAL)`;
  };

  return (
    <header className="topbar">
      {/* Security Violation Banner if active */}
      {securityViolation && (
        <div className="security-violation-topbar">
          <AlertTriangle size={18} />
          <span>{securityViolation.message}</span>
          <button onClick={clearSecurityViolation} className="btn-dismiss-violation">Dismiss</button>
        </div>
      )}

      <div className="topbar-left">
        <div className="system-status">
          <span className="status-indicator status-online"></span>
          SENTINEL CORE ONLINE
        </div>

        <div className={`scope-badge ${isFloorUser ? 'scope-isolated' : 'scope-admin'}`}>
          <Lock size={13} />
          <span>{getScopeText()}</span>
        </div>
      </div>

      <div className="topbar-right">
        {getRoleBadge()}

        <div className="user-profile">
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)' }}>
              {user.name}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {user.email}
            </div>
          </div>
          
          <div className="avatar" style={{
            background: isSecuritySuperAdmin 
              ? 'linear-gradient(135deg, #ef4444, #991b1b)' 
              : isGlobalAdmin 
              ? 'linear-gradient(135deg, #a855f7, #6366f1)' 
              : 'linear-gradient(135deg, #06b6d4, #2563eb)'
          }}>
            {user.avatarInitial}
          </div>
        </div>

        <button 
          onClick={logout} 
          className="btn-signout"
          title="Terminate Session and Logout"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </header>
  );
};
