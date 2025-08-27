export type UserRole = 'buyer' | 'seller' | 'admin';

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
  role: Exclude<UserRole, 'admin'>; // only buyer or seller via public API
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResult {
  token: string;
  user: { id: number; name: string; email: string; role: UserRole };
}
