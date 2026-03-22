'use client';

// Simple user auth — nickname + optional email stored in localStorage
// No password needed — just identify yourself to report

const USER_KEY = 'thaihelp_user';

export interface SimpleUser {
  nickname: string;
  email?: string;
  createdAt: string;
}

export function getUser(): SimpleUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function setUser(nickname: string, email?: string): SimpleUser {
  const user: SimpleUser = {
    nickname: nickname.trim(),
    email: email?.trim() || undefined,
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}

export function clearUser(): void {
  localStorage.removeItem(USER_KEY);
}
