import type { Request, Response, NextFunction } from 'express';
import { 
  AUTHORIZED_ACCOUNTS, 
  FLOORS_METADATA, 
  ROOMS_STATE, 
  ACCESS_LOGS, 
  SECURITY_STATE,
  updateSecurityState,
  logAccessEvent
} from './data.ts';
import { AuthService, type UserSession } from './auth.ts';

// Augment Request type for authenticated session
export interface AuthenticatedRequest extends Request {
  userSession?: UserSession;
}

function getParam(param: string | string[] | undefined): string {
  if (Array.isArray(param)) return param[0] || '';
  return param || '';
}

/**
 * Middleware: Verify Bearer session token
 */
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const session = AuthService.validateSession(authHeader);

  if (!session) {
    res.status(401).json({
      success: false,
      error: 'UNAUTHORIZED',
      message: 'Authentication required. Invalid or expired SentinelAI session token.'
    });
    return;
  }

  req.userSession = session;
  next();
}

/**
 * Middleware: Verify specific floor permission
 */
export function requireFloorAccess(paramKey = 'floorId') {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const session = req.userSession;
    if (!session) {
      res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
      return;
    }

    const paramVal = getParam(req.params[paramKey]);
    const floorId = parseInt(paramVal, 10);
    if (isNaN(floorId)) {
      res.status(400).json({ success: false, error: 'INVALID_FLOOR_ID' });
      return;
    }

    if (!session.user.allowedFloors.includes(floorId)) {
      logAccessEvent({
        userEmail: session.email,
        action: `Unauthorized Floor Access Attempt`,
        target: `Floor ${floorId}`,
        status: 'DENIED',
        details: `Policy Violation: ${session.user.roleTitle} attempted to access restricted Floor ${floorId}. Allowed floors: [${session.user.allowedFloors.join(', ')}].`
      });

      res.status(403).json({
        success: false,
        error: 'FORBIDDEN_FLOOR_ACCESS',
        message: `Security Violation: Your account (${session.email}) is restricted to Floor(s) [${session.user.allowedFloors.join(', ')}]. Access to Floor ${floorId} is denied by SentinelAI security policy.`,
        allowedFloors: session.user.allowedFloors
      });
      return;
    }

    next();
  };
}

/**
 * Middleware: Verify Admin roles (Security Super Admin or Global Admin)
 */
export function requireAdminRole(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const session = req.userSession;
  if (!session) {
    res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
    return;
  }

  const isSuperSecurity = session.user.role === 'SECURITY_SUPER_ADMIN';
  const isGlobalAdmin = session.user.role === 'GLOBAL_ADMIN';

  if (!isSuperSecurity && !isGlobalAdmin) {
    logAccessEvent({
      userEmail: session.email,
      action: `Unauthorized Administration Endpoint Call`,
      target: req.originalUrl,
      status: 'DENIED',
      details: `Floor user attempted to call restricted administrative endpoint.`
    });

    res.status(403).json({
      success: false,
      error: 'FORBIDDEN_ADMIN_ROLE_REQUIRED',
      message: 'Access Denied: Administrative privileges (Security Super Admin or Global Admin) are required to access this endpoint.'
    });
    return;
  }

  next();
}

/**
 * Middleware: Verify Global Admin role exclusively
 */
export function requireGlobalAdminRole(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const session = req.userSession;
  if (!session) {
    res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
    return;
  }

  if (session.user.role !== 'GLOBAL_ADMIN') {
    res.status(403).json({
      success: false,
      error: 'FORBIDDEN_GLOBAL_ADMIN_REQUIRED',
      message: 'Access Denied: Global Administrator clearance required.'
    });
    return;
  }

  next();
}

// Router handler collection
export const apiHandlers = {
  // System health
  health(_req: Request, res: Response) {
    res.json({
      system: 'SentinelAI Core BMS API',
      status: 'OPERATIONAL',
      timestamp: new Date().toISOString(),
      authorizedAccountsCount: Object.keys(AUTHORIZED_ACCOUNTS).length,
      totalRooms: Object.keys(ROOMS_STATE).length
    });
  },

  // Directory of authorized accounts for frontend display / verification
  getDirectory(_req: Request, res: Response) {
    const directory = Object.values(AUTHORIZED_ACCOUNTS).map(acc => ({
      email: acc.email,
      name: acc.name,
      role: acc.role,
      roleTitle: acc.roleTitle,
      allowedFloors: acc.allowedFloors,
      avatarInitial: acc.avatarInitial,
      department: acc.department,
      clearanceLevel: acc.clearanceLevel,
      description: acc.description
    }));

    res.json({
      success: true,
      directory
    });
  },

  // Direct login for authorized Gmail accounts
  login(req: Request, res: Response) {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      res.status(400).json({ success: false, error: 'EMAIL_REQUIRED', message: 'Email address is required.' });
      return;
    }

    const result = AuthService.loginAuthorizedEmail(email, 'DIRECT');
    if (!result.success || !result.session) {
      res.status(403).json(result);
      return;
    }

    res.json({
      success: true,
      token: result.session.token,
      expiresAt: result.session.expiresAt,
      user: result.session.user
    });
  },

  // Google Sign-In verification endpoint
  async googleSignIn(req: Request, res: Response) {
    const { credential, emailHint } = req.body;

    let targetEmail: string | undefined;

    if (credential) {
      const verification = await AuthService.verifyGoogleIdToken(credential);
      if (!verification.success || !verification.email) {
        res.status(400).json({
          success: false,
          error: 'INVALID_GOOGLE_TOKEN',
          message: verification.error || 'Failed to verify Google Sign-In credential.'
        });
        return;
      }
      targetEmail = verification.email;
    } else if (emailHint) {
      targetEmail = emailHint;
    } else {
      res.status(400).json({
        success: false,
        error: 'MISSING_CREDENTIAL',
        message: 'Google Sign-In credential or email is required.'
      });
      return;
    }

    if (!targetEmail) {
      res.status(400).json({
        success: false,
        error: 'EMAIL_REQUIRED',
        message: 'Unable to extract email from Google credential.'
      });
      return;
    }

    const result = AuthService.loginAuthorizedEmail(targetEmail, 'GOOGLE_OAUTH');

    if (!result.success || !result.session) {
      res.status(403).json(result);
      return;
    }

    res.json({
      success: true,
      token: result.session.token,
      expiresAt: result.session.expiresAt,
      user: result.session.user
    });
  },

  // Get current logged-in user profile & permissions
  getMe(req: AuthenticatedRequest, res: Response) {
    const session = req.userSession!;
    res.json({
      success: true,
      user: session.user,
      expiresAt: session.expiresAt
    });
  },

  // Logout
  logout(req: AuthenticatedRequest, res: Response) {
    const authHeader = req.headers.authorization;
    AuthService.logout(authHeader || '');
    res.json({ success: true, message: 'Logged out successfully.' });
  },


  // Get accessible floors
  getFloors(req: AuthenticatedRequest, res: Response) {
    const session = req.userSession!;
    const userAllowed = session.user.allowedFloors;

    const accessibleFloors = FLOORS_METADATA.filter(f => userAllowed.includes(f.floorNumber));

    res.json({
      success: true,
      floors: accessibleFloors,
      userClearance: session.user.clearanceLevel,
      allowedFloorNumbers: userAllowed
    });
  },

  // Get single floor detail
  getFloorDetail(req: AuthenticatedRequest, res: Response) {
    const floorId = parseInt(getParam(req.params.floorId), 10);
    const floor = FLOORS_METADATA.find(f => f.floorNumber === floorId);

    if (!floor) {
      res.status(404).json({ success: false, error: 'FLOOR_NOT_FOUND' });
      return;
    }

    res.json({
      success: true,
      floor
    });
  },

  // Get rooms for a specific floor (protected by requireFloorAccess)
  getFloorRooms(req: AuthenticatedRequest, res: Response) {
    const floorId = parseInt(getParam(req.params.floorId), 10);
    const rooms = Object.values(ROOMS_STATE).filter(r => r.floor === floorId);

    res.json({
      success: true,
      floorId,
      roomCount: rooms.length,
      rooms
    });
  },

  // Get all rooms accessible to the authenticated user
  getAllAccessibleRooms(req: AuthenticatedRequest, res: Response) {
    const session = req.userSession!;
    const userAllowedFloors = session.user.allowedFloors;

    const accessibleRooms = Object.values(ROOMS_STATE).filter(r => 
      userAllowedFloors.includes(r.floor)
    );

    res.json({
      success: true,
      totalAccessible: accessibleRooms.length,
      allowedFloors: userAllowedFloors,
      rooms: accessibleRooms
    });
  },

  // Get single room details
  getRoomDetail(req: AuthenticatedRequest, res: Response) {
    const session = req.userSession!;
    const roomId = getParam(req.params.roomId);
    const room = ROOMS_STATE[roomId];

    if (!room) {
      res.status(404).json({ success: false, error: 'ROOM_NOT_FOUND' });
      return;
    }

    // Enforce floor permission
    if (!session.user.allowedFloors.includes(room.floor)) {
      logAccessEvent({
        userEmail: session.email,
        action: `Unauthorized Room Access`,
        target: `Room ${roomId} (Floor ${room.floor})`,
        status: 'DENIED',
        details: `Access Denied: User role ${session.user.roleTitle} cannot access Room ${roomId} on Floor ${room.floor}.`
      });

      res.status(403).json({
        success: false,
        error: 'FORBIDDEN_ROOM_ACCESS',
        message: `Security Violation: Room ${roomId} is on Floor ${room.floor}, which is outside your authorized scope [Floor(s) ${session.user.allowedFloors.join(', ')}].`
      });
      return;
    }

    res.json({
      success: true,
      room
    });
  },

  // Update room state
  updateRoomControl(req: AuthenticatedRequest, res: Response) {
    const session = req.userSession!;
    const roomId = getParam(req.params.roomId);
    const room = ROOMS_STATE[roomId];

    if (!room) {
      res.status(404).json({ success: false, error: 'ROOM_NOT_FOUND' });
      return;
    }

    // Enforce floor permission
    if (!session.user.allowedFloors.includes(room.floor)) {
      logAccessEvent({
        userEmail: session.email,
        action: `Unauthorized Room Control Attempt`,
        target: `Room ${roomId} (Floor ${room.floor})`,
        status: 'DENIED',
        details: `Access Denied: Attempted to control Room ${roomId} without Floor ${room.floor} permissions.`
      });

      res.status(403).json({
        success: false,
        error: 'FORBIDDEN_ROOM_CONTROL',
        message: `Security Violation: You do not have permission to control Room ${roomId} on Floor ${room.floor}.`
      });
      return;
    }

    const { temperature, targetTemp, fanOn, fanMode, lightOn, securityLocked, doorClosed } = req.body;

    if (temperature !== undefined) room.temperature = Number(Number(temperature).toFixed(1));
    if (targetTemp !== undefined) room.targetTemp = Number(Number(targetTemp).toFixed(1));
    if (fanOn !== undefined) room.fanOn = Boolean(fanOn);
    if (fanMode !== undefined) room.fanMode = fanMode;
    if (lightOn !== undefined) room.lightOn = Boolean(lightOn);
    if (doorClosed !== undefined) room.doorClosed = Boolean(doorClosed);
    
    // Only admins can override server room locks
    if (securityLocked !== undefined) {
      if (session.user.role === 'FLOOR_USER' && room.type === 'server_room') {
        res.status(403).json({
          success: false,
          error: 'LOCK_REQUIRES_ADMIN',
          message: 'Server room physical security locks can only be overridden by Security Super Admin.'
        });
        return;
      }
      room.securityLocked = Boolean(securityLocked);
    }

    // Check alert trigger
    if (room.temperature > 30) {
      room.alert = true;
      room.alertMessage = `High temperature threshold triggered (${room.temperature}°C)`;
    } else {
      room.alert = false;
      room.alertMessage = undefined;
    }

    room.lastUpdated = new Date().toISOString();

    logAccessEvent({
      userEmail: session.email,
      action: 'Room Control Applied',
      target: `Room ${roomId}`,
      status: 'GRANTED',
      details: `Updated parameters: temp=${room.temperature}°C, fan=${room.fanOn ? 'ON' : 'OFF'}, light=${room.lightOn ? 'ON' : 'OFF'}`
    });

    res.json({
      success: true,
      room
    });
  },

  // Security Operations Center (SOC) status for Security Super Admin
  getSecuritySoc(_req: AuthenticatedRequest, res: Response) {
    const allRooms = Object.values(ROOMS_STATE);
    const lockedCount = allRooms.filter(r => r.securityLocked).length;
    const alertCount = allRooms.filter(r => r.alert).length;

    res.json({
      success: true,
      securityState: SECURITY_STATE,
      metrics: {
        totalRooms: allRooms.length,
        lockedRooms: lockedCount,
        unlockedRooms: allRooms.length - lockedCount,
        criticalAlerts: alertCount,
        surveillanceCamerasActive: 48,
        accessControlGatewaysOnline: 5
      },
      recentLogs: ACCESS_LOGS.slice(0, 20)
    });
  },

  // Emergency building lockdown
  toggleLockdown(req: AuthenticatedRequest, res: Response) {
    const session = req.userSession!;
    const { activate } = req.body;
    const targetState = Boolean(activate);

    // Apply lock state across all 50 rooms
    Object.values(ROOMS_STATE).forEach(room => {
      room.securityLocked = targetState;
      room.doorClosed = true;
    });

    updateSecurityState({
      lockdownActive: targetState,
      lastLockdownChange: new Date().toISOString(),
      threatLevel: targetState ? 'DEFCON-2 (HIGH)' : 'DEFCON-5 (LOW)'
    });

    logAccessEvent({
      userEmail: session.email,
      action: targetState ? 'BUILDING LOCKDOWN ENGAGED' : 'LOCKDOWN RELEASED',
      target: 'All 5 Floors (50 Rooms)',
      status: 'GRANTED',
      details: `Master lockdown protocol changed by ${session.user.name} (${session.user.roleTitle}). All 50 perimeter and suite doors secured.`
    });

    res.json({
      success: true,
      lockdownActive: targetState,
      message: targetState 
        ? 'Emergency lockdown protocol activated. All 50 rooms across 5 floors secured.'
        : 'Lockdown protocol released. Normal building operations restored.'
    });
  },

  // Threat level adjustment
  setThreatLevel(req: AuthenticatedRequest, res: Response) {
    const { threatLevel } = req.body;
    updateSecurityState({ threatLevel });
    res.json({
      success: true,
      threatLevel,
      message: `Threat level calibrated to ${threatLevel}`
    });
  },

  // Global Admin enterprise overview
  getGlobalAdminStatus(_req: AuthenticatedRequest, res: Response) {
    const allRooms = Object.values(ROOMS_STATE);
    const totalPower = allRooms.reduce((acc, r) => acc + r.powerDrawKw, 0);
    const totalOccupants = allRooms.reduce((acc, r) => acc + r.occupancyCount, 0);
    const avgTemp = (allRooms.reduce((acc, r) => acc + r.temperature, 0) / allRooms.length).toFixed(1);
    const avgHumidity = Math.round(allRooms.reduce((acc, r) => acc + r.humidity, 0) / allRooms.length);

    res.json({
      success: true,
      overview: {
        totalFloors: 5,
        totalRooms: 50,
        totalPowerKw: Number(totalPower.toFixed(2)),
        totalOccupants,
        avgTemperature: Number(avgTemp),
        avgHumidity,
        activeHvacUnits: allRooms.filter(r => r.fanOn).length
      },
      authorizedAccounts: Object.values(AUTHORIZED_ACCOUNTS),
      activeLogsCount: ACCESS_LOGS.length
    });
  },

  // Global HVAC override
  globalHvacOverride(req: AuthenticatedRequest, res: Response) {
    const session = req.userSession!;
    const { mode, targetTemp } = req.body;

    Object.values(ROOMS_STATE).forEach(room => {
      if (mode === 'ECO') {
        room.targetTemp = 25.0;
        room.fanMode = 'AUTO';
      } else if (mode === 'PERFORMANCE') {
        room.targetTemp = 21.0;
        room.fanOn = true;
        room.fanMode = 'ON';
      } else if (mode === 'OFF') {
        room.fanOn = false;
        room.fanMode = 'OFF';
      }

      if (targetTemp !== undefined) {
        room.targetTemp = Number(targetTemp);
      }
    });

    logAccessEvent({
      userEmail: session.email,
      action: 'Global HVAC Override',
      target: 'Entire Facility (50 Rooms)',
      status: 'GRANTED',
      details: `Mode set to ${mode || 'CUSTOM'}. Target setpoint: ${targetTemp || 'Standard'}`
    });

    res.json({
      success: true,
      mode,
      message: `Global HVAC override successfully broadcast to all 5 floors.`
    });
  }
};
