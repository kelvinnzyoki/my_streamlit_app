import type { User } from '@/types/user';

export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('flowfit-user');
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function storeUser(user: User | null): void {
  if (typeof window === 'undefined') return;
  if (user) localStorage.setItem('flowfit-user', JSON.stringify(user));
  else localStorage.removeItem('flowfit-user');
}

export function hasSession(): boolean {
  if (typeof document === 'undefined') return false;
  try {
    return document.cookie.split(';').some((c) => c.trim().startsWith('ff_session='));
  } catch {
    return false;
  }
}
