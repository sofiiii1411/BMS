import React from 'react';
import { 
  Building2, 
  LayoutDashboard, 
  Box, 
  Grid, 
  ShieldAlert, 
  Sliders, 
  Lock, 
  Users, 
  History, 
  Zap, 
  Fan, 
  Cpu, 
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { user, isFloorUser, isSecuritySuperAdmin, isGlobalAdmin, triggerSecurityViolation } = useAuth();

  if (!user) return null;

  const currentFloor = user.allowedFloors[0];

  const handleRestrictedClick = (targetName: string, requiredClearance: string) => {
    triggerSecurityViolation(
      `Access Denied: ${targetName} requires ${requiredClearance}. Your account (${user.email}) is restricted to Floor ${user.allowedFloors.join(', ')}.`
    );
  };

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="brand-icon">
          <Building2 size={20} />
        </div>
        <div>
          <div className="brand-title">BMS SentinelAI</div>
          <div className="brand-badge-sub">RBAC Enforced</div>
        </div>
      </div>
      
      <div className="sidebar-nav">
        {/* Main Section */}
        <div className="nav-section">
          <div className="nav-section-title">Core Operations</div>
          
          <div 
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} 
            onClick={() => setActiveTab('overview')}
          >
            <LayoutDashboard />
            <span>{isFloorUser ? `Floor ${currentFloor} Dashboard` : 'Enterprise Overview'}</span>
          </div>

          <div 
            className={`nav-item ${activeTab === '3d-building' ? 'active' : ''}`} 
            onClick={() => setActiveTab('3d-building')}
          >
            <Box />
            <span>3D Digital Twin</span>
            {isFloorUser && <span className="mini-tag">Fl {currentFloor}</span>}
          </div>

          <div 
            className={`nav-item ${activeTab === 'rooms' ? 'active' : ''}`} 
            onClick={() => setActiveTab('rooms')}
          >
            <Grid />
            <span>{isFloorUser ? `My 10 Rooms` : 'All 50 Rooms'}</span>
            <span className="room-count-pill">{isFloorUser ? '10' : '50'}</span>
          </div>
        </div>

        {/* Security SOC Section (Dedicated to Security Super Admin & Global Admin) */}
        <div className="nav-section">
          <div className="nav-section-title">
            <span>Security Operations</span>
            {isFloorUser && <Lock size={12} className="title-lock" />}
          </div>

          {isSecuritySuperAdmin || isGlobalAdmin ? (
            <>
              <div 
                className={`nav-item ${activeTab === 'security-soc' ? 'active' : ''} admin-highlight`} 
                onClick={() => setActiveTab('security-soc')}
              >
                <ShieldAlert className="text-red" />
                <span>Security SOC Command</span>
              </div>
              <div 
                className={`nav-item ${activeTab === 'access-logs' ? 'active' : ''}`} 
                onClick={() => setActiveTab('access-logs')}
              >
                <History />
                <span>Audit Access Logs</span>
              </div>
            </>
          ) : (
            <div 
              className="nav-item nav-item-locked" 
              onClick={() => handleRestrictedClick('Security Operations Center', 'Security Super Admin')}
              title="Restricted: Requires Security Super Admin"
            >
              <ShieldAlert />
              <span>Security SOC (Restricted)</span>
              <Lock size={14} className="locked-icon" />
            </div>
          )}
        </div>

        {/* Global Admin Section (Dedicated to Global Admin) */}
        <div className="nav-section">
          <div className="nav-section-title">
            <span>Enterprise Admin</span>
            {isFloorUser && <Lock size={12} className="title-lock" />}
          </div>

          {isGlobalAdmin ? (
            <>
              <div 
                className={`nav-item ${activeTab === 'global-admin' ? 'active' : ''} admin-highlight-purple`} 
                onClick={() => setActiveTab('global-admin')}
              >
                <Sliders className="text-purple" />
                <span>Global Command Center</span>
              </div>
              <div 
                className={`nav-item ${activeTab === 'users-registry' ? 'active' : ''}`} 
                onClick={() => setActiveTab('users-registry')}
              >
                <Users />
                <span>Authorized Accounts</span>
              </div>
            </>
          ) : isSecuritySuperAdmin ? (
            <div 
              className={`nav-item ${activeTab === 'users-registry' ? 'active' : ''}`} 
              onClick={() => setActiveTab('users-registry')}
            >
              <Users />
              <span>Authorized Accounts</span>
            </div>
          ) : (
            <div 
              className="nav-item nav-item-locked" 
              onClick={() => handleRestrictedClick('Enterprise Administration', 'Global Administrator')}
              title="Restricted: Requires Global Admin"
            >
              <Sliders />
              <span>Enterprise Admin (Restricted)</span>
              <Lock size={14} className="locked-icon" />
            </div>
          )}
        </div>

        {/* Building Automation & Energy */}
        <div className="nav-section">
          <div className="nav-section-title">Facility Systems</div>
          <div 
            className={`nav-item ${activeTab === 'hvac' ? 'active' : ''}`} 
            onClick={() => setActiveTab('hvac')}
          >
            <Fan />
            <span>HVAC Climate Control</span>
          </div>
          <div 
            className={`nav-item ${activeTab === 'energy' ? 'active' : ''}`} 
            onClick={() => setActiveTab('energy')}
          >
            <Zap />
            <span>Energy & Grid</span>
          </div>
          <div 
            className={`nav-item ${activeTab === 'automation' ? 'active' : ''}`} 
            onClick={() => setActiveTab('automation')}
          >
            <Cpu />
            <span>Automation Rules</span>
          </div>
        </div>

        {/* Clearance Footnote */}
        <div className="sidebar-footer-clearance">
          <ShieldCheck size={16} color="var(--accent-cyan)" />
          <div>
            <div className="clearance-tag-label">{user.clearanceLevel}</div>
            <div className="clearance-department">{user.department}</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
