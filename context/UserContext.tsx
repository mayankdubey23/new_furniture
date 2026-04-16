'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { getApiUrl } from '@/lib/api/browser';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

interface UserContextValue {
  user: AuthUser | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

interface AuthMeResponse {
  authenticated?: boolean;
  user?: {
    id?: string;
    name?: string;
    email?: string;
  } | null;
  userId?: string | null;
  name?: string | null;
  email?: string | null;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch(getApiUrl('/api/auth/user/me'), { credentials: 'include' });
      if (res.ok) {
        const data = (await res.json()) as AuthMeResponse;
        let nextUser: AuthUser | null = null;

        if (
          data.user &&
          typeof data.user.id === 'string' &&
          typeof data.user.name === 'string' &&
          typeof data.user.email === 'string'
        ) {
          nextUser = { id: data.user.id, name: data.user.name, email: data.user.email };
        } else if (
          typeof data.userId === 'string' &&
          typeof data.name === 'string' &&
          typeof data.email === 'string'
        ) {
          nextUser = { id: data.userId, name: data.name, email: data.email };
        }

        setUser(nextUser);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const logout = useCallback(async () => {
    try {
      await fetch(getApiUrl('/api/auth/user/logout'), {
        method: 'POST',
        credentials: 'include',
      });
    } catch {

    }
    setUser(null);
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, refreshUser, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}
