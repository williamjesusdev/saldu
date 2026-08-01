'use client';

import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';

import { fetchApi } from '@/lib/apiClient';
import { LoginResponse, UserResponse } from '@/types/api';

interface AuthContextType {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: UserResponse | null;
  login: (email: string, password: string) => Promise<UserResponse>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const checkAuth = async () => {
    setIsLoading(true);
    const isAuthHint = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthHint) {
      setIsAuthenticated(false);
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const data = await fetchApi<UserResponse>('/api/v1/users/me');
      setUser(data);
      setIsAuthenticated(true);
    } catch {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('isAuthenticated');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<UserResponse> => {
    setIsLoading(true);
    try {
      await fetchApi<LoginResponse>('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      localStorage.setItem('isAuthenticated', 'true');

      const userData = await fetchApi<UserResponse>('/api/v1/users/me');
      setUser(userData);
      setIsAuthenticated(true);
      return userData;
    } catch (err) {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('isAuthenticated');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetchApi('/api/v1/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem('isAuthenticated');
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
