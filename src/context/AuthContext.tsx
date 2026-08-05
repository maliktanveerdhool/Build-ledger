import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authApi } from '../lib/api';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; role?: 'admin' | 'user'; company?: string; clientId?: string }) => Promise<void>;
  logout: () => void;
  switchDemoUser: (role: 'admin' | 'user') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('buildledger_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize profile check if token exists
  useEffect(() => {
    async function initAuth() {
      const storedToken = localStorage.getItem('buildledger_token');
      if (!storedToken) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        const profile = await authApi.getProfile();
        setUser(profile);
      } catch (err) {
        console.error('Session expired or invalid token:', err);
        localStorage.removeItem('buildledger_token');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });
      localStorage.setItem('buildledger_token', response.token);
      setToken(response.token);
      setUser(response.user);
      toast.success(`Welcome back, ${response.user.name}!`);
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to sign in. Check your credentials.';
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const register = async (data: { name: string; email: string; password: string; role?: 'admin' | 'user'; company?: string; clientId?: string }) => {
    try {
      const response = await authApi.register(data);
      localStorage.setItem('buildledger_token', response.token);
      setToken(response.token);
      setUser(response.user);
      toast.success(`Account registered successfully as ${response.user.role.toUpperCase()}!`);
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to create account.';
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const logout = () => {
    localStorage.removeItem('buildledger_token');
    setToken(null);
    setUser(null);
    toast.info('Logged out successfully.');
  };

  const switchDemoUser = async (role: 'admin' | 'user') => {
    if (role === 'admin') {
      await login('admin@buildledger.com', 'admin123');
    } else {
      await login('john@apexdev.com', 'user123');
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, token, isLoading, isAdmin, login, register, logout, switchDemoUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
