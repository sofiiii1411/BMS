export interface AuthorizedAccount {
  email: string;
  name: string;
  role: 'FLOOR_USER' | 'SECURITY_SUPER_ADMIN' | 'GLOBAL_ADMIN';
  roleTitle: string;
  allowedFloors: number[];
  permissions: string[];
  avatarInitial: string;
  department: string;
  clearanceLevel: string;
  description: string;
}

export interface Room {
  id: string;
  floor: number;
  name: string;
  type: 'office' | 'server_room' | 'conference' | 'lab' | 'executive';
  temperature: number;
  targetTemp: number;
  humidity: number;
  occupancy: boolean;
  occupancyCount: number;
  fanOn: boolean;
  fanMode: 'AUTO' | 'ON' | 'OFF';
  lightOn: boolean;
  doorClosed: boolean;
  securityLocked: boolean;
  co2: number;
  powerDrawKw: number;
  alert: boolean;
  alertMessage?: string;
  lastUpdated: string;
}

export interface FloorInfo {
  floorNumber: number;
  name: string;
  zone: string;
  description: string;
  roomCount: number;
  roomsRange: string;
  status: 'OPTIMAL' | 'WARNING' | 'ALERT';
  assignedUser: string;
}

export interface AccessLog {
  id: string;
  timestamp: string;
  userEmail: string;
  action: string;
  target: string;
  status: 'GRANTED' | 'DENIED' | 'FLAGGED';
  details: string;
}

export interface SecurityState {
  lockdownActive: boolean;
  threatLevel: 'DEFCON-5 (LOW)' | 'DEFCON-4 (GUARDED)' | 'DEFCON-3 (ELEVATED)' | 'DEFCON-2 (HIGH)' | 'DEFCON-1 (SEVERE)';
  lastLockdownChange: string;
  activeAlarmsCount: number;
  socStatus: 'ACTIVE' | 'STANDBY' | 'EMERGENCY';
}
