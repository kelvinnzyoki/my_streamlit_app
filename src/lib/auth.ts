import type { User } from '@/types/user';

export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('flowfit-user');
    return raw ? JSON.parse(raw) as User : null;
  } catch {
    return null;
  }
}

export function storeUser(user: User | null) {
  if (typeof window === 'undefined') return;
  if (user) localStorage.setItem('flowfit-user', JSON.stringify(user));
  else localStorage.removeItem('flowfit-user');
}
