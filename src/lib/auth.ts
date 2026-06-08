import { tokenManager } from './api';
export function getStoredUser() { return tokenManager.getUser(); }
export function isAdmin() { return getStoredUser()?.role === 'ADMIN'; }
