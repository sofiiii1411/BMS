import type { AuthorizedAccount, Room, FloorInfo, AccessLog, SecurityState } from '../types/auth';

const TOKEN_KEY = 'sentinelai_session_token';

export class ApiError extends Error {
  status: number;
  code?: string;
  allowedFloors?: number[];

  constructor(message: string, status: number, code?: string, allowedFloors?: number[]) {
    super(message);
    this.status = status;
    this.code = code;
    this.allowedFloors = allowedFloors;
    this.name = 'ApiError';
  }
}

export const api = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  clearToken() {
    localStorage.removeItem(TOKEN_KEY);
  },

  async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers = new Headers(options.headers || {});
    
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(path, {
      ...options,
      headers
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage = data?.message || data?.error || `Request failed with status ${response.status}`;
      throw new ApiError(errorMessage, response.status, data?.error, data?.allowedFloors);
    }

    return data as T;
  },

  // Auth endpoints
  async getDirectory(): Promise<{ success: boolean; directory: AuthorizedAccount[] }> {
    return this.request<{ success: boolean; directory: AuthorizedAccount[] }>('/api/auth/directory');
  },

  async login(email: string): Promise<{ success: boolean; token: string; user: AuthorizedAccount; expiresAt: number }> {
    const res = await this.request<{ success: boolean; token: string; user: AuthorizedAccount; expiresAt: number }>(
      '/api/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email })
      }
    );
    if (res.token) {
      this.setToken(res.token);
    }
    return res;
  },

  async googleSignIn(credential?: string, emailHint?: string): Promise<{ success: boolean; token: string; user: AuthorizedAccount; expiresAt: number }> {
    const res = await this.request<{ success: boolean; token: string; user: AuthorizedAccount; expiresAt: number }>(
      '/api/auth/google',
      {
        method: 'POST',
        body: JSON.stringify({ credential, emailHint })
      }
    );
    if (res.token) {
      this.setToken(res.token);
    }
    return res;
  },

  async getMe(): Promise<{ success: boolean; user: AuthorizedAccount; expiresAt: number }> {
    return this.request<{ success: boolean; user: AuthorizedAccount; expiresAt: number }>('/api/auth/me');
  },

  async logout(): Promise<void> {
    try {
      await this.request('/api/auth/logout', { method: 'POST' });
    } finally {
      this.clearToken();
    }
  },

  // Floor endpoints
  async getFloors(): Promise<{ success: boolean; floors: FloorInfo[]; allowedFloorNumbers: number[]; userClearance: string }> {
    return this.request<{ success: boolean; floors: FloorInfo[]; allowedFloorNumbers: number[]; userClearance: string }>('/api/floors');
  },

  async getFloorDetail(floorId: number): Promise<{ success: boolean; floor: FloorInfo }> {
    return this.request<{ success: boolean; floor: FloorInfo }>(`/api/floors/${floorId}`);
  },

  async getFloorRooms(floorId: number): Promise<{ success: boolean; floorId: number; roomCount: number; rooms: Room[] }> {
    return this.request<{ success: boolean; floorId: number; roomCount: number; rooms: Room[] }>(`/api/floors/${floorId}/rooms`);
  },

  // Room endpoints
  async getAllAccessibleRooms(): Promise<{ success: boolean; totalAccessible: number; allowedFloors: number[]; rooms: Room[] }> {
    return this.request<{ success: boolean; totalAccessible: number; allowedFloors: number[]; rooms: Room[] }>('/api/rooms');
  },

  async getRoom(roomId: string): Promise<{ success: boolean; room: Room }> {
    return this.request<{ success: boolean; room: Room }>(`/api/rooms/${roomId}`);
  },

  async updateRoomControl(roomId: string, updates: Partial<Room>): Promise<{ success: boolean; room: Room }> {
    return this.request<{ success: boolean; room: Room }>(`/api/rooms/${roomId}/control`, {
      method: 'POST',
      body: JSON.stringify(updates)
    });
  },

  // Security Admin (SOC)
  async getSecuritySoc(): Promise<{
    success: boolean;
    securityState: SecurityState;
    metrics: {
      totalRooms: number;
      lockedRooms: number;
      unlockedRooms: number;
      criticalAlerts: number;
      surveillanceCamerasActive: number;
      accessControlGatewaysOnline: number;
    };
    recentLogs: AccessLog[];
  }> {
    return this.request('/api/admin/security/soc');
  },

  async toggleLockdown(activate: boolean): Promise<{ success: boolean; lockdownActive: boolean; message: string }> {
    return this.request('/api/admin/security/lockdown', {
      method: 'POST',
      body: JSON.stringify({ activate })
    });
  },

  async setThreatLevel(threatLevel: string): Promise<{ success: boolean; threatLevel: string; message: string }> {
    return this.request('/api/admin/security/threat-level', {
      method: 'POST',
      body: JSON.stringify({ threatLevel })
    });
  },

  // Global Admin
  async getGlobalAdminStatus(): Promise<{
    success: boolean;
    overview: {
      totalFloors: number;
      totalRooms: number;
      totalPowerKw: number;
      totalOccupants: number;
      avgTemperature: number;
      avgHumidity: number;
      activeHvacUnits: number;
    };
    authorizedAccounts: AuthorizedAccount[];
    activeLogsCount: number;
  }> {
    return this.request('/api/admin/global/status');
  },

  async globalHvacOverride(mode: 'ECO' | 'PERFORMANCE' | 'OFF', targetTemp?: number): Promise<{ success: boolean; mode: string; message: string }> {
    return this.request('/api/admin/global/hvac-override', {
      method: 'POST',
      body: JSON.stringify({ mode, targetTemp })
    });
  }
};
