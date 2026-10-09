import type { Plugin } from 'vite';
import express from 'express';
import { 
  apiHandlers, 
  requireAuth, 
  requireFloorAccess, 
  requireAdminRole, 
  requireGlobalAdminRole 
} from './api.ts';


export function sentinelApiPlugin(): Plugin {
  return {
    name: 'sentinel-api-plugin',
    configureServer(server) {
      const app = express();
      app.use(express.json());

      // Public API endpoints
      app.get('/api/health', (req, res) => apiHandlers.health(req, res));
      app.get('/api/auth/directory', (req, res) => apiHandlers.getDirectory(req, res));
      app.post('/api/auth/login', (req, res) => apiHandlers.login(req, res));
      app.post('/api/auth/google', (req, res) => apiHandlers.googleSignIn(req, res));

      // Authenticated endpoints
      app.get('/api/auth/me', requireAuth, (req, res) => apiHandlers.getMe(req, res));
      app.post('/api/auth/logout', requireAuth, (req, res) => apiHandlers.logout(req, res));

      // Floors
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

      // Global Admin
      app.get('/api/admin/global/status', requireAuth, requireGlobalAdminRole, (req, res) => apiHandlers.getGlobalAdminStatus(req, res));
      app.post('/api/admin/global/hvac-override', requireAuth, requireGlobalAdminRole, (req, res) => apiHandlers.globalHvacOverride(req, res));

      // Global error handler (handles malformed JSON body gracefully)
      app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
        res.status(err.status || 400).json({
          success: false,
          error: 'BAD_REQUEST',
          message: err.message || 'Invalid request payload'
        });
      });

      server.middlewares.use(app);
      console.log('✅ SentinelAI Backend API mounted on Vite server at /api/*');


    }
  };
}
