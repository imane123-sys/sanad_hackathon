'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';

export interface User {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  phone?: string | null;
  role: string;
  preferredLanguage: string;
  isEmailVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, deviceInfo?: string) => Promise<void>;
  register: (dto: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    role?: string;
    preferredLanguage?: string;
  }) => Promise<{ message: string; verificationToken?: string }>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<number>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore stored session on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem('sanad_access_token');
        const storedUser = localStorage.getItem('sanad_user');

        if (storedToken && storedUser) {
          setAccessToken(storedToken);
          setUser(JSON.parse(storedUser));

          // Fetch fresh profile from backend to ensure token & session are still valid
          try {
            const profile = await api.auth.getProfile();
            setUser(profile);
            localStorage.setItem('sanad_user', JSON.stringify(profile));
          } catch {
            // Token was revoked or expired on server
            localStorage.removeItem('sanad_access_token');
            localStorage.removeItem('sanad_user');
            setUser(null);
            setAccessToken(null);
          }
        }
      } catch {
        // Storage access error
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string, deviceInfo?: string) => {
    const res = await api.auth.login({ email, password, deviceInfo });
    setAccessToken(res.accessToken);
    setUser(res.user);
    localStorage.setItem('sanad_access_token', res.accessToken);
    localStorage.setItem('sanad_user', JSON.stringify(res.user));
  };

  const register = async (dto: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    role?: string;
    preferredLanguage?: string;
  }) => {
    return api.auth.register(dto);
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch {
      // Ignore if server unreachable or already expired
    } finally {
      localStorage.removeItem('sanad_access_token');
      localStorage.removeItem('sanad_user');
      setUser(null);
      setAccessToken(null);
    }
  };

  const logoutAll = async (): Promise<number> => {
    try {
      const res = await api.auth.logoutAll();
      localStorage.removeItem('sanad_access_token');
      localStorage.removeItem('sanad_user');
      setUser(null);
      setAccessToken(null);
      return res.revokedCount;
    } catch (e) {
      localStorage.removeItem('sanad_access_token');
      localStorage.removeItem('sanad_user');
      setUser(null);
      setAccessToken(null);
      return 0;
    }
  };

  const refreshProfile = async () => {
    try {
      const profile = await api.auth.getProfile();
      setUser(profile);
      localStorage.setItem('sanad_user', JSON.stringify(profile));
    } catch {
      setUser(null);
      setAccessToken(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        logoutAll,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
