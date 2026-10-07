import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import api from '../services/api';
import type { LoginRequest, RegisterRequest, AuthResponse, Role } from '../types';

interface AuthUser {
  username: string;
  role: Role;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function loadStoredUser(): AuthUser | null {
  const username = localStorage.getItem('username');
  const role = localStorage.getItem('role') as Role | null;
  if (username && role) {
    return { username, role };
  }
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(loadStoredUser());

  function persist(username: string, role: Role, token: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
    localStorage.setItem('role', role);
    setUser({ username, role });
  }

  async function login(data: LoginRequest) {
    const res = await api.post<AuthResponse>('/auth/login', data);
    persist(res.data.username, res.data.role, res.data.token);
  }

  async function register(data: any) {
    const res = await api.post<AuthResponse>('/auth/register', data);
    persist(res.data.username, res.data.role, res.data.token);
  }

  function logout() {
    localStorage.clear();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}