import React, { useState } from 'react';
import { 
  Building2, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Layers, 
  Lock, 
  KeyRound,
  Fingerprint,
  Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { login, loginWithGoogle, error, clearError, isLoading } = useAuth();
  const [emailInput, setEmailInput] = useState('');
  const [activeTab, setActiveTab] = useState<'quick' | 'direct' | 'google'>('quick');
  const [lastAttemptedEmail, setLastAttemptedEmail] = useState<string | null>(null);

  const floorAccounts = [
    {
      floor: 1,
      email: 'floor1.sentinelai@gmail.com',
      title: 'Floor 1 Facility Engineer',
      rooms: 'Rooms 101 - 110 (10 Rooms)',
      zone: 'Ground Level & Reception',
      color: '#06b6d4'
    },
    {
      floor: 2,
      email: 'floor2.sentinelai@gmail.com',
      title: 'Floor 2 Facility Engineer',
      rooms: 'Rooms 201 - 210 (10 Rooms)',
      zone: 'Engineering & R&D Labs',
      color: '#3b82f6'
    },
    {
      floor: 3,
      email: 'floor3.sentinelai@gmail.com',
      title: 'Floor 3 Facility Engineer',
      rooms: 'Rooms 301 - 310 (10 Rooms)',
      zone: 'Commercial & Sales Suites',
      color: '#8b5cf6'
    },
    {
      floor: 4,
      email: 'floor4.sentinelai@gmail.com',
      title: 'Floor 4 Facility Engineer',
      rooms: 'Rooms 401 - 410 (10 Rooms)',
      zone: 'Corporate Finance & Legal',
      color: '#ec4899'
    },
    {
      floor: 5,
      email: 'floor5.sentinelai@gmail.com',
      title: 'Floor 5 Facility Engineer',
      rooms: 'Rooms 501 - 510 (10 Rooms)',
      zone: 'Executive Command Penthouse',
      color: '#f59e0b'
    }
  ];

  const adminAccounts = [
    {
      email: 'securitysuper.sentinelai@gmail.com',
      title: 'Security Super Admin',
      name: 'Marcus Vance',
      scope: 'All 5 Floors & All 50 Rooms',
      clearance: 'L5 - Top Secret Security',
      role: 'SECURITY_SUPER_ADMIN',
      badgeColor: '#ef4444',
      description: 'Physical & digital security lockdown, CCTV surveillance, perimeter access logs, and threat matrix control.'
    },
    {
      email: 'global.sentinelai@gmail.com',
      title: 'Global Administrator',
      name: 'Dr. Elena Rostova',
      scope: 'All 5 Floors & All 50 Rooms',
      clearance: 'L5 - Enterprise Executive',
      role: 'GLOBAL_ADMIN',
      badgeColor: '#a855f7',
      description: 'Overall facility command, global HVAC override, automation rule engine, system diagnostics, and user registry.'
    }
  ];

  const handleSelectAccount = async (email: string) => {
    clearError();
    setLastAttemptedEmail(email);
    await login(email);
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    clearError();
    setLastAttemptedEmail(emailInput.trim());
    await login(emailInput.trim());
  };

  const handleGoogleSimulator = async (email: string) => {
    clearError();
    setLastAttemptedEmail(email);
    await loginWithGoogle(undefined, email);
  };

  const handleTestUnauthorized = async () => {
    const unauthorizedEmail = 'intruder.unauthorized@gmail.com';
    clearError();
    setLastAttemptedEmail(unauthorizedEmail);
    await login(unauthorizedEmail);
  };

  return (
    <div className="login-page-container">
      {/* Background Holographic Grid Elements */}
      <div className="login-bg-glows">
        <div className="glow-sphere cyan-glow"></div>
        <div className="glow-sphere purple-glow"></div>
        <div className="glow-sphere red-glow"></div>
      </div>

      <div className="login-card-wrapper">
        {/* Header Branding */}
        <div className="login-header">
          <div className="login-brand">
            <div className="brand-badge-icon">
              <Building2 size={28} />
            </div>
            <div>
              <div className="login-brand-title">SENTINEL<span>AI</span></div>
              <div className="login-brand-subtitle">INTELLIGENT BUILDING MANAGEMENT & SECURITY</div>
            </div>
          </div>
          
          <div className="system-clearance-pill">
            <span className="live-dot"></span>
            ZERO-TRUST RBAC GATEWAY ACTIVE
          </div>
        </div>

        {/* Security Warning / Clearance Notice */}
        <div className="clearance-notice-banner">
          <Fingerprint size={18} color="var(--accent-cyan)" />
          <div>
            <strong>MANDATORY ACCESS CONTROL:</strong> Login is strictly restricted to the <strong>7 pre-authorized Gmail accounts</strong>. Floor operators receive isolated single-floor access (10 rooms); Administrators receive building-wide authority (all 5 floors / 50 rooms).
          </div>
        </div>

        {/* Error Alert Message */}
        {error && (
          <div className="login-error-alert animate-shake">
            <XCircle size={22} className="error-icon" />
            <div className="error-content">
              <div className="error-title">SECURITY GATEWAY: ACCESS REJECTED</div>
              <div className="error-detail">{error}</div>
              {lastAttemptedEmail && (
                <div className="error-account-tag">
                  Attempted Account: <code>{lastAttemptedEmail}</code> (Forbidden by backend policy)
                </div>
              )}
            </div>
          </div>
        )}

        {/* Method Switcher Tabs */}
        <div className="login-tabs">
          <button 
            type="button"
            className={`login-tab-btn ${activeTab === 'quick' ? 'active' : ''}`}
            onClick={() => { setActiveTab('quick'); clearError(); }}
          >
            <KeyRound size={16} />
            <span>Authorized Accounts Portal</span>
          </button>
          <button 
            type="button"
            className={`login-tab-btn ${activeTab === 'google' ? 'active' : ''}`}
            onClick={() => { setActiveTab('google'); clearError(); }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.4l3.7 2.9C6.5 7.4 9 5 12 5z"/>
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
              <path fill="#FBBC05" d="M5.6 14.7c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.2C.7 9.6 0 10.7 0 12s.7 2.4 1.9 4.8l3.7-2.1z"/>
              <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 16.4C3.7 20.2 7.5 23 12 23z"/>
            </svg>
            <span>Google Sign-In</span>
          </button>
          <button 
            type="button"
            className={`login-tab-btn ${activeTab === 'direct' ? 'active' : ''}`}
            onClick={() => { setActiveTab('direct'); clearError(); }}
          >
            <Layers size={16} />
            <span>Direct Email Input</span>
          </button>
        </div>

        {/* Tab 1: Authorized Accounts Fast-Switch Portal */}
        {activeTab === 'quick' && (
          <div className="tab-pane-content">
            <div className="section-label-group">
              <span className="section-sub-title">1. Overall Administration Users (5 Floors & 50 Rooms Access)</span>
              <span className="section-badge-admin">Full Executive & SOC Scope</span>
            </div>

            <div className="admin-accounts-grid">
              {adminAccounts.map(admin => (
                <div 
                  key={admin.email}
                  className="role-card admin-card"
                  onClick={() => !isLoading && handleSelectAccount(admin.email)}
                >
                  <div className="role-card-top">
                    <div className="role-badge-tag" style={{ background: `${admin.badgeColor}22`, color: admin.badgeColor, border: `1px solid ${admin.badgeColor}55` }}>
                      {admin.clearance}
                    </div>
                    <div className="scope-indicator">
                      {admin.scope}
                    </div>
                  </div>

                  <div className="role-title-row">
                    <div className="role-main-title">{admin.title}</div>
                    <div className="role-person-name">{admin.name}</div>
                  </div>

                  <div className="role-email-code">
                    <code>{admin.email}</code>
                  </div>

                  <p className="role-description-text">
                    {admin.description}
                  </p>

                  <div className="role-action-btn">
                    <span>Authenticate as {admin.title.split(' ')[0]} Admin</span>
                    <ArrowRight size={16} />
                  </div>
                </div>
              ))}
            </div>

            <div className="section-label-group" style={{ marginTop: '28px' }}>
              <span className="section-sub-title">2. Floor Users — Isolated 10 Rooms Per Floor</span>
              <span className="section-badge-floor">Strict Single-Floor Scope</span>
            </div>

            <div className="floor-accounts-grid">
              {floorAccounts.map(floor => (
                <div 
                  key={floor.email}
                  className="role-card floor-card"
                  onClick={() => !isLoading && handleSelectAccount(floor.email)}
                >
                  <div className="floor-num-badge" style={{ borderColor: floor.color, color: floor.color }}>
                    FLOOR 0{floor.floor}
                  </div>

                  <div className="floor-card-info">
                    <div className="floor-role-name">Floor {floor.floor} Operator</div>
                    <div className="floor-zone-name">{floor.zone}</div>
                    <div className="floor-rooms-tag">
                      <Lock size={12} />
                      {floor.rooms}
                    </div>
                    <div className="floor-email-text">
                      <code>{floor.email}</code>
                    </div>
                  </div>

                  <div className="floor-login-arrow">
                    <ArrowRight size={16} />
                  </div>
                </div>
              ))}
            </div>

            {/* Verification / Security Sandbox Test */}
            <div className="security-demo-box">
              <div className="demo-box-header">
                <ShieldAlert size={18} color="var(--status-danger)" />
                <span>Backend Policy Enforcement Test Sandbox</span>
              </div>
              <p>
                SentinelAI authenticates through backend validation and rejects all unauthorized emails with HTTP 403. Test this rejection live:
              </p>
              <button 
                type="button"
                className="btn-test-reject"
                onClick={handleTestUnauthorized}
                disabled={isLoading}
              >
                <XCircle size={16} />
                <span>Test Unauthorized Login (<code>intruder.unauthorized@gmail.com</code>)</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Google Sign-In */}
        {activeTab === 'google' && (
          <div className="tab-pane-content">
            <div className="google-auth-box">
              <div className="google-auth-header">
                <div className="google-large-icon">
                  <svg width="40" height="40" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.4l3.7 2.9C6.5 7.4 9 5 12 5z"/>
                    <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
                    <path fill="#FBBC05" d="M5.6 14.7c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.2C.7 9.6 0 10.7 0 12s.7 2.4 1.9 4.8l3.7-2.1z"/>
                    <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 16.4C3.7 20.2 7.5 23 12 23z"/>
                  </svg>
                </div>
                <h3>Google Workspace Sign-In</h3>
                <p>
                  Authenticate your Google account. SentinelAI verifies the account email against the server-side authorized whitelist before issuing a session.
                </p>
              </div>

              {/* Quick 1-Click Google OAuth Accounts */}
              <div className="google-accounts-picker">
                <div className="picker-title">Select Authenticated Google Account:</div>
                <div className="google-users-list">
                  <div className="google-account-item" onClick={() => handleGoogleSimulator('securitysuper.sentinelai@gmail.com')}>
                    <div className="google-avatar" style={{ background: '#ef4444' }}>SS</div>
                    <div className="google-item-info">
                      <div className="google-item-name">Marcus Vance (Security Super Admin)</div>
                      <div className="google-item-email">securitysuper.sentinelai@gmail.com</div>
                    </div>
                    <span className="google-verified-tag"><CheckCircle2 size={14} /> Authorized</span>
                  </div>

                  <div className="google-account-item" onClick={() => handleGoogleSimulator('global.sentinelai@gmail.com')}>
                    <div className="google-avatar" style={{ background: '#a855f7' }}>GA</div>
                    <div className="google-item-info">
                      <div className="google-item-name">Dr. Elena Rostova (Global Admin)</div>
                      <div className="google-item-email">global.sentinelai@gmail.com</div>
                    </div>
                    <span className="google-verified-tag"><CheckCircle2 size={14} /> Authorized</span>
                  </div>

                  <div className="google-account-item" onClick={() => handleGoogleSimulator('floor1.sentinelai@gmail.com')}>
                    <div className="google-avatar" style={{ background: '#06b6d4' }}>F1</div>
                    <div className="google-item-info">
                      <div className="google-item-name">Floor 1 Facility Engineer (Rooms 101-110)</div>
                      <div className="google-item-email">floor1.sentinelai@gmail.com</div>
                    </div>
                    <span className="google-verified-tag"><CheckCircle2 size={14} /> Authorized</span>
                  </div>

                  <div className="google-account-item" onClick={() => handleGoogleSimulator('floor2.sentinelai@gmail.com')}>
                    <div className="google-avatar" style={{ background: '#3b82f6' }}>F2</div>
                    <div className="google-item-info">
                      <div className="google-item-name">Floor 2 Facility Engineer (Rooms 201-210)</div>
                      <div className="google-item-email">floor2.sentinelai@gmail.com</div>
                    </div>
                    <span className="google-verified-tag"><CheckCircle2 size={14} /> Authorized</span>
                  </div>

                  <div className="google-account-item unauthorized" onClick={() => handleGoogleSimulator('unauthorized.guest@gmail.com')}>
                    <div className="google-avatar" style={{ background: '#64748b' }}>UN</div>
                    <div className="google-item-info">
                      <div className="google-item-name">Unauthorized Personal Gmail</div>
                      <div className="google-item-email">unauthorized.guest@gmail.com</div>
                    </div>
                    <span className="google-denied-tag"><XCircle size={14} /> Blocked</span>
                  </div>
                </div>
              </div>

              <div className="google-oauth-note">
                <Info size={16} />
                <span>
                  All Google OAuth tokens are validated by the backend API at <code>/api/auth/google</code>. No secrets or client credentials exist in client bundle.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Direct Email Input */}
        {activeTab === 'direct' && (
          <div className="tab-pane-content">
            <form onSubmit={handleManualSubmit} className="direct-login-form">
              <div className="form-group">
                <label htmlFor="email-input">Enter Authorized Gmail Account</label>
                <div className="input-with-icon">
                  <input
                    id="email-input"
                    type="email"
                    placeholder="e.g. floor1.sentinelai@gmail.com or global.sentinelai@gmail.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    required
                    className="login-input"
                  />
                </div>
                <div className="input-hint">
                  Must be one of the 7 authorized Gmail addresses registered in SentinelAI core.
                </div>
              </div>

              <button 
                type="submit" 
                className="btn-submit-login" 
                disabled={isLoading || !emailInput.trim()}
              >
                {isLoading ? 'Verifying with SentinelAI Core...' : 'Validate & Authenticate'}
                <ArrowRight size={18} />
              </button>

              <div className="whitelist-reminder">
                <div className="whitelist-title">Permitted Accounts Whitelist:</div>
                <ul>
                  <li><code>floor1.sentinelai@gmail.com</code> (Floor 1, Rooms 101-110)</li>
                  <li><code>floor2.sentinelai@gmail.com</code> (Floor 2, Rooms 201-210)</li>
                  <li><code>floor3.sentinelai@gmail.com</code> (Floor 3, Rooms 301-310)</li>
                  <li><code>floor4.sentinelai@gmail.com</code> (Floor 4, Rooms 401-410)</li>
                  <li><code>floor5.sentinelai@gmail.com</code> (Floor 5, Rooms 501-510)</li>
                  <li><code>securitysuper.sentinelai@gmail.com</code> (Security Super Admin - All Floors)</li>
                  <li><code>global.sentinelai@gmail.com</code> (Global Admin - All Floors)</li>
                </ul>
              </div>
            </form>
          </div>
        )}

        {/* Footer Security Badges */}
        <div className="login-footer">
          <div className="footer-item">
            <Lock size={14} color="var(--accent-cyan)" />
            <span>Zero-Trust Session Tokens</span>
          </div>
          <div className="footer-item">
            <Building2 size={14} color="var(--status-normal)" />
            <span>50 Rooms Across 5 Floors</span>
          </div>
          <div className="footer-item">
            <CheckCircle2 size={14} color="var(--accent-purple)" />
            <span>Cryptographic Backend Enforcement</span>
          </div>
        </div>
      </div>
    </div>
  );
};
