import express from 'express';
import cors from 'cors';
import { 
  apiHandlers, 
  requireAuth, 
  requireFloorAccess, 
  requireAdminRole, 
  requireGlobalAdminRole 
} from './api';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Public API
app.get('/api/health', (req, res) => apiHandlers.health(req, res));
app.get('/api/auth/directory', (req, res) => apiHandlers.getDirectory(req, res));
app.post('/api/auth/login', (req, res) => apiHandlers.login(req, res));
app.post('/api/auth/google', (req, res) => apiHandlers.googleSignIn(req, res));

// Authenticated User
app.get('/api/auth/me', requireAuth, (req, res) => apiHandlers.getMe(req, res));
app.post('/api/auth/logout', requireAuth, (req, res) => apiHandlers.logout(req, res));

// Floors (Protected with Floor-Level Access Control)
app.get('/api/floors', requireAuth, (req, res) => apiHandlers.getFloors(req, res));
app.get('/api/floors/:floorId', requireAuth, requireFloorAccess('floorId'), (req, res) => apiHandlers.getFloorDetail(req, res));
app.get('/api/floors/:floorId/rooms', requireAuth, requireFloorAccess('floorId'), (req, res) => apiHandlers.getFloorRooms(req, res));

// Rooms
app.get('/api/rooms', requireAuth, (req, res) => apiHandlers.getAllAccessibleRooms(req, res));
app.get('/api/rooms/:roomId', requireAuth, (req, res) => apiHandlers.getRoomDetail(req, res));
app.post('/api/rooms/:roomId/control', requireAuth, (req, res) => apiHandlers.updateRoomControl(req, res));

// Security Super Admin & Global Admin (SOC)
app.get('/api/admin/security/soc', requireAuth, requireAdminRole, (req, res) => apiHandlers.getSecuritySoc(req, res));
app.post('/api/admin/security/lockdown', requireAuth, requireAdminRole, (req, res) => apiHandlers.toggleLockdown(req, res));
app.post('/api/admin/security/threat-level', requireAuth, requireAdminRole, (req, res) => apiHandlers.setThreatLevel(req, res));

// Global Admin Exclusives
app.get('/api/admin/global/status', requireAuth, requireGlobalAdminRole, (req, res) => apiHandlers.getGlobalAdminStatus(req, res));
app.post('/api/admin/global/hvac-override', requireAuth, requireGlobalAdminRole, (req, res) => apiHandlers.globalHvacOverride(req, res));

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🛡️ SentinelAI Security Core Backend running on http://localhost:${PORT}`);
  });
}

export default app;
