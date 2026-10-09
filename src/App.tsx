import React, { useState } from 'react';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './components/LoginPage';
import { Topbar } from './components/Topbar';
import { Sidebar } from './components/Sidebar';
import { AccessDeniedModal } from './components/AccessDeniedModal';
import Overview from './pages/Overview';
import DigitalTwin from './pages/DigitalTwin';
import RoomsPage from './pages/RoomsPage';
import SecuritySOC from './pages/SecuritySOC';
import GlobalAdmin from './pages/GlobalAdmin';

const MainAppContent: React.FC = () => {
  const { user, isLoading, isFloorUser } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('overview');

  if (isLoading) {
    return (
      <div className="app-loading-screen">
        <div className="loading-pulsing-logo">
          <div className="loading-spinner"></div>
          <div className="loading-title">SENTINEL<span>AI</span></div>
          <div className="loading-subtitle">Verifying cryptographic session...</div>
        </div>
      </div>
    );
  }

  // If unauthenticated, present the LoginPage
  if (!user) {
    return <LoginPage />;
  }

  // Tab routing
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview onNavigateTab={setActiveTab} />;
      case '3d-building':
        return <DigitalTwin />;
      case 'rooms':
        return (
          <RoomsPage 
            onSelectRoomFor3D={(_roomId) => {
              setActiveTab('3d-building');
            }} 
          />
        );
      case 'security-soc':
      case 'access-logs':
        if (isFloorUser) {
          return <Overview onNavigateTab={setActiveTab} />;
        }
        return <SecuritySOC />;
      case 'global-admin':
      case 'users-registry':
        if (isFloorUser) {
          return <Overview onNavigateTab={setActiveTab} />;
        }
        return <GlobalAdmin />;
      case 'hvac':
      case 'energy':
      case 'automation':
        return <Overview onNavigateTab={setActiveTab} />;
      default:
        return <Overview onNavigateTab={setActiveTab} />;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar with Role-Based Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Panel */}
      <main className="main-content">
        {/* Topbar with Profile & Clearance Badges */}
        <Topbar />
        
        {/* Dynamic Content Area */}
        <div className="content-area">
          {renderContent()}
        </div>
      </main>

      {/* Access Denied / Security Policy Modal */}
      <AccessDeniedModal />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}

export default App;
