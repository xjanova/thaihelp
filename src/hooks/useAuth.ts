'use client';

import { useState, useEffect, useCallback } from 'react';
import { getUser, setUser, clearUser, type SimpleUser } from '@/lib/user-auth';

export function useAuth() {
  const [user, setUserState] = useState<SimpleUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUserState(getUser());
    setLoading(false);
  }, []);

  const login = useCallback((nickname: string, email?: string) => {
    const u = setUser(nickname, email);
    setUserState(u);
    return u;
  }, []);

  const logout = useCallback(() => {
    clearUser();
    setUserState(null);
  }, []);

  return { user, loading, login, logout };
}
