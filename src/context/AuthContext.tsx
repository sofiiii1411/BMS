import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

import { api, ApiError } from '../services/api';
import type { AuthorizedAccount } from '../types/auth';

interface AuthContextType {
  user: AuthorizedAccount | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string) => Promise<boolean>;
  loginWithGoogle: (credential?: string, emailHint?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
  hasFloorAccess: (floorNumber: number) => boolean;
  isFloorUser: boolean;
  isSecuritySuperAdmin: boolean;
  isGlobalAdmin: boolean;
  allowedFloors: number[];
  securityViolation: { message: string; floorId?: number } | null;
  triggerSecurityViolation: (message: string, floorId?: number) => void;
  clearSecurityViolation: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthorizedAccount | null>(null);
  const [token, setToken] = useState<string | null>(api.getToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [securityViolation, setSecurityViolation] = useState<{ message: string; floorId?: number } | null>(null);

  const clearError = () => setError(null);
  const clearSecurityViolation = () => setSecurityViolation(null);

  const triggerSecurityViolation = useCallback((message: string, floorId?: number) => {
    setSecurityViolation({ message, floorId });
  }, []);

  // Validate existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = api.getToken();
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await api.getMe();
        if (res.success && res.user) {
          setUser(res.user);
          setToken(storedToken);
        } else {
          api.clearToken();
          setToken(null);
          setUser(null);
        }
      } catch {
        api.clearToken();
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.login(email);
      if (res.success && res.user) {
        setUser(res.user);
        setToken(res.token);
        return true;
      }
      return false;
    } catch (err: any) {
      const message = err instanceof ApiError ? err.message : (err.message || 'Authentication failed');
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (credential?: string, emailHint?: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.googleSignIn(credential, emailHint);
      if (res.success && res.user) {
        setUser(res.user);
        setToken(res.token);
        return true;
      }
      return false;
    } catch (err: any) {
      const message = err instanceof ApiError ? err.message : (err.message || 'Google Sign-In failed');
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await api.logout();
    } catch {
      // Ignore network errors on logout
    } finally {
      setUser(null);
      setToken(null);
      setError(null);
      setSecurityViolation(null);
      setIsLoading(false);
    }
  };

  const hasFloorAccess = (floorNumber: number): boolean => {
    if (!user) return false;
    return user.allowedFloors.includes(floorNumber);
  };

  const isFloorUser = user?.role === 'FLOOR_USER';
  const isSecuritySuperAdmin = user?.role === 'SECURITY_SUPER_ADMIN';
  const isGlobalAdmin = user?.role === 'GLOBAL_ADMIN';
  const allowedFloors = user?.allowedFloors || [];

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        error,
        login,
        loginWithGoogle,
        logout,
        clearError,
        hasFloorAccess,
        isFloorUser,
        isSecuritySuperAdmin,
        isGlobalAdmin,
        allowedFloors,
        securityViolation,
        triggerSecurityViolation,
        clearSecurityViolation
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
