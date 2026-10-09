
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

export const AUTHORIZED_ACCOUNTS: Record<string, AuthorizedAccount> = {
  'floor1.sentinelai@gmail.com': {
    email: 'floor1.sentinelai@gmail.com',
    name: 'Floor 1 Operator',
    role: 'FLOOR_USER',
    roleTitle: 'Floor 1 Facility Engineer',
    allowedFloors: [1],
    permissions: ['VIEW_FLOOR_1', 'CONTROL_FLOOR_1_ROOMS'],
    avatarInitial: 'F1',
    department: 'Level 1 Operations',
    clearanceLevel: 'L1 - Floor Specific',
    description: 'Dedicated access to Ground Floor & Reception facilities (Rooms 101 - 110).'
  },
  'floor2.sentinelai@gmail.com': {
    email: 'floor2.sentinelai@gmail.com',
    name: 'Floor 2 Operator',
    role: 'FLOOR_USER',
    roleTitle: 'Floor 2 Facility Engineer',
    allowedFloors: [2],
    permissions: ['VIEW_FLOOR_2', 'CONTROL_FLOOR_2_ROOMS'],
    avatarInitial: 'F2',
    department: 'Level 2 Operations',
    clearanceLevel: 'L1 - Floor Specific',
    description: 'Dedicated access to Engineering & R&D facilities (Rooms 201 - 210).'
  },
  'floor3.sentinelai@gmail.com': {
    email: 'floor3.sentinelai@gmail.com',
    name: 'Floor 3 Operator',
    role: 'FLOOR_USER',
    roleTitle: 'Floor 3 Facility Engineer',
    allowedFloors: [3],
    permissions: ['VIEW_FLOOR_3', 'CONTROL_FLOOR_3_ROOMS'],
    avatarInitial: 'F3',
    department: 'Level 3 Operations',
    clearanceLevel: 'L1 - Floor Specific',
    description: 'Dedicated access to Marketing & Client Experience facilities (Rooms 301 - 310).'
  },
  'floor4.sentinelai@gmail.com': {
    email: 'floor4.sentinelai@gmail.com',
    name: 'Floor 4 Operator',
    role: 'FLOOR_USER',
    roleTitle: 'Floor 4 Facility Engineer',
    allowedFloors: [4],
    permissions: ['VIEW_FLOOR_4', 'CONTROL_FLOOR_4_ROOMS'],
    avatarInitial: 'F4',
    department: 'Level 4 Operations',
    clearanceLevel: 'L1 - Floor Specific',
    description: 'Dedicated access to Finance, Legal & HR facilities (Rooms 401 - 410).'
  },
  'floor5.sentinelai@gmail.com': {
    email: 'floor5.sentinelai@gmail.com',
    name: 'Floor 5 Operator',
    role: 'FLOOR_USER',
    roleTitle: 'Floor 5 Facility Engineer',
    allowedFloors: [5],
    permissions: ['VIEW_FLOOR_5', 'CONTROL_FLOOR_5_ROOMS'],
    avatarInitial: 'F5',
    department: 'Level 5 Operations',
    clearanceLevel: 'L1 - Floor Specific',
    description: 'Dedicated access to Executive Boardroom & Penthouse facilities (Rooms 501 - 510).'
  },
  'securitysuper.sentinelai@gmail.com': {
    email: 'securitysuper.sentinelai@gmail.com',
    name: 'Marcus Vance',
    role: 'SECURITY_SUPER_ADMIN',
    roleTitle: 'Security Super Admin',
    allowedFloors: [1, 2, 3, 4, 5],
    permissions: [
      'VIEW_ALL_FLOORS',
      'CONTROL_ALL_ROOMS',
      'SECURITY_LOCKDOWN',
      'ACCESS_LOGS',
      'CCTV_MONITORING',
      'INCIDENT_MANAGEMENT',
      'SECURITY_ADMIN'
    ],
    avatarInitial: 'SS',
    department: 'Central Security Bureau (SOC)',
    clearanceLevel: 'L5 - Top Secret Security',
    description: 'Overall facility physical & digital access control across all 5 floors and 50 rooms.'
  },
  'global.sentinelai@gmail.com': {
    email: 'global.sentinelai@gmail.com',
    name: 'Dr. Elena Rostova',
    role: 'GLOBAL_ADMIN',
    roleTitle: 'Global Administrator',
    allowedFloors: [1, 2, 3, 4, 5],
    permissions: [
      'VIEW_ALL_FLOORS',
      'CONTROL_ALL_ROOMS',
      'GLOBAL_OVERRIDE',
      'AUTOMATION_RULES',
      'USER_MANAGEMENT',
      'ANALYTICS_REPORTS',
      'SYSTEM_CONFIGURATION',
      'GLOBAL_ADMIN'
    ],
    avatarInitial: 'GA',
    department: 'Enterprise Systems Directorate',
    clearanceLevel: 'L5 - Enterprise Executive',
    description: 'Unrestricted overall administration of SentinelAI BMS across all 5 floors, 50 rooms, and subsystems.'
  }
};

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

export const FLOORS_METADATA: FloorInfo[] = [
  {
    floorNumber: 1,
    name: 'Ground Level & Reception',
    zone: 'Zone 1 — Public Access & Intake',
    description: 'Main lobby, security intake, conference atrium, visitor suites and server backup.',
    roomCount: 10,
    roomsRange: 'Rooms 101 - 110',
    status: 'OPTIMAL',
    assignedUser: 'floor1.sentinelai@gmail.com'
  },
  {
    floorNumber: 2,
    name: 'Engineering & R&D Labs',
    zone: 'Zone 2 — High-Density Technical',
    description: 'Software development bays, hardware labs, testing facilities and workshop suites.',
    roomCount: 10,
    roomsRange: 'Rooms 201 - 210',
    status: 'OPTIMAL',
    assignedUser: 'floor2.sentinelai@gmail.com'
  },
  {
    floorNumber: 3,
    name: 'Commercial & Client Experience',
    zone: 'Zone 3 — Business & Operations',
    description: 'Marketing agency room, sales pit, customer briefing center and collaboration hubs.',
    roomCount: 10,
    roomsRange: 'Rooms 301 - 310',
    status: 'OPTIMAL',
    assignedUser: 'floor3.sentinelai@gmail.com'
  },
  {
    floorNumber: 4,
    name: 'Corporate Services & Finance',
    zone: 'Zone 4 — Confidential Corporate',
    description: 'Finance department, legal counsel, HR interview rooms and corporate vault.',
    roomCount: 10,
    roomsRange: 'Rooms 401 - 410',
    status: 'OPTIMAL',
    assignedUser: 'floor4.sentinelai@gmail.com'
  },
  {
    floorNumber: 5,
    name: 'Executive & Strategic Command',
    zone: 'Zone 5 — Restricted Penthouse',
    description: 'C-Suite suites, boardrooms, strategic war room, sky lounge and central command.',
    roomCount: 10,
    roomsRange: 'Rooms 501 - 510',
    status: 'OPTIMAL',
    assignedUser: 'floor5.sentinelai@gmail.com'
  }
];

// Helper to generate 10 rooms per floor = 50 total rooms
function generateInitialRooms(): Record<string, Room> {
  const rooms: Record<string, Room> = {};
  
  const roomNames: Record<number, string[]> = {
    1: [
      'Main Reception & Atrium',
      'Visitor Briefing Lounge',
      'Zone 1 Sub-Server Hub',
      'Conference Alpha',
      'Security Intake Office',
      'Facility Logistics Center',
      'Staff Wellness Suite',
      'West Transit Corridor',
      'Telecom & Fiber Node',
      'Emergency Dispatch Unit'
    ],
    2: [
      'AI Research Lab',
      'Robotics Testing Chamber',
      'Software Engineering Pit',
      'DevOps Server Room',
      'Hardware Prototyping Bay',
      'Firmware QA Room',
      'Scrum & Sprint Studio',
      'Engineering Focus Pod A',
      'Engineering Focus Pod B',
      'Clean Room Beta'
    ],
    3: [
      'Marketing Creative Studio',
      'Global Sales Command',
      'Client Presentation Theater',
      'Customer Success Wing',
      'Digital Production Room',
      'Strategy Discussion Pod',
      'Brand Identity Suite',
      'Video Conference Hub',
      'Field Operations Center',
      'Executive Dining Suite'
    ],
    4: [
      'Finance & Accounting Dept',
      'Legal & Compliance Chamber',
      'Human Capital Office',
      'Confidential Audit Room',
      'Corporate Records Archive',
      'Risk Management Unit',
      'Executive Interview Suite',
      'Legal Deposition Room',
      'Financial Modeling Lab',
      'Secure Data Vault 4'
    ],
    5: [
      'Chief Executive Suite',
      'Global Boardroom Prime',
      'Presidential Meeting Room',
      'Strategic War Room',
      'Chief Technology Officer Wing',
      'Chief Information Security Hub',
      'Sky Lounge Observation',
      'High-Clearance Briefing',
      'Master HVAC Control Hub',
      'Penthouse Helipad Dispatch'
    ]
  };

  const types: Array<'office' | 'server_room' | 'conference' | 'lab' | 'executive'> = [
    'office', 'conference', 'server_room', 'conference', 'office',
    'lab', 'office', 'office', 'server_room', 'executive'
  ];

  for (let floor = 1; floor <= 5; floor++) {
    for (let i = 1; i <= 10; i++) {
      const roomId = `${floor}${i < 10 ? '0' + i : i}`;
      const name = roomNames[floor][i - 1];
      const type = floor === 5 ? (i <= 2 ? 'executive' : 'conference') : types[i - 1];
      const isServer = type === 'server_room';
      
      const baseTemp = isServer ? 21.5 : (23.0 + (floor * 0.4) + ((i % 3) * 0.6));
      const isOccupied = !isServer && (i % 2 === 1 || floor === 5);
      
      rooms[roomId] = {
        id: roomId,
        floor,
        name,
        type,
        temperature: Number(baseTemp.toFixed(1)),
        targetTemp: isServer ? 20.0 : 23.5,
        humidity: Math.round(48 + ((floor * 3 + i * 2) % 15)),
        occupancy: isOccupied,
        occupancyCount: isOccupied ? (i % 4 + 1) : 0,
        fanOn: true,
        fanMode: 'AUTO',
        lightOn: isOccupied || isServer,
        doorClosed: true,
        securityLocked: isServer || floor === 5,
        co2: isOccupied ? 580 + (i * 25) : 410,
        powerDrawKw: Number((1.2 + (floor * 0.3) + (i * 0.15)).toFixed(2)),
        alert: isServer && roomId === '204' ? true : false,
        alertMessage: isServer && roomId === '204' ? 'Thermal threshold approaching 26°C' : undefined,
        lastUpdated: new Date().toISOString()
      };
    }
  }

  return rooms;
}

export let ROOMS_STATE: Record<string, Room> = generateInitialRooms();

export interface AccessLog {
  id: string;
  timestamp: string;
  userEmail: string;
  action: string;
  target: string;
  status: 'GRANTED' | 'DENIED' | 'FLAGGED';
  details: string;
}

export let ACCESS_LOGS: AccessLog[] = [
  {
    id: 'log-101',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    userEmail: 'securitysuper.sentinelai@gmail.com',
    action: 'SOC Perimeter Verification',
    target: 'All 5 Floors (50 Rooms)',
    status: 'GRANTED',
    details: 'Automated biometric audit cleared. Threat status: NORMAL.'
  },
  {
    id: 'log-102',
    timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    userEmail: 'floor1.sentinelai@gmail.com',
    action: 'HVAC Calibration',
    target: 'Room 103 (Sub-Server Hub)',
    status: 'GRANTED',
    details: 'Fan mode switched to AUTO cooling.'
  },
  {
    id: 'log-103',
    timestamp: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
    userEmail: 'intruder.unknown@gmail.com',
    action: 'Login Attempt',
    target: 'Authentication Gateway',
    status: 'DENIED',
    details: 'Email not present in authorized Gmail registry. Access blocked.'
  }
];

export function logAccessEvent(entry: Omit<AccessLog, 'id' | 'timestamp'>) {
  const newLog: AccessLog = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    ...entry
  };
  ACCESS_LOGS.unshift(newLog);
  if (ACCESS_LOGS.length > 100) {
    ACCESS_LOGS.pop();
  }
  return newLog;
}

export interface SecurityState {
  lockdownActive: boolean;
  threatLevel: 'DEFCON-5 (LOW)' | 'DEFCON-4 (GUARDED)' | 'DEFCON-3 (ELEVATED)' | 'DEFCON-2 (HIGH)' | 'DEFCON-1 (SEVERE)';
  lastLockdownChange: string;
  activeAlarmsCount: number;
  socStatus: 'ACTIVE' | 'STANDBY' | 'EMERGENCY';
}

export let SECURITY_STATE: SecurityState = {
  lockdownActive: false,
  threatLevel: 'DEFCON-5 (LOW)',
  lastLockdownChange: new Date().toISOString(),
  activeAlarmsCount: 1,
  socStatus: 'ACTIVE'
};

export function updateSecurityState(updates: Partial<SecurityState>) {
  SECURITY_STATE = { ...SECURITY_STATE, ...updates };
  return SECURITY_STATE;
}
