// src/types/user.ts
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  subscription: 'free' | 'pro' | 'premium';
  createdAt: string;
  streakDays: number;
  totalWorkouts: number;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
}
