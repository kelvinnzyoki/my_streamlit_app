export type User = {
  id: string;
  name?: string;
  fullName?: string;
  email: string;
  role?: 'USER' | 'ADMIN' | string;
  plan?: string;
  avatar?: string;
};
