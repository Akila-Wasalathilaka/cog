export * from './user';

export interface PasswordChangeRequest {
  oldPassword: string;
  newPassword: string;
}

export interface ProfileUpdateData {
  fullName?: string;
  email?: string;
  phone?: string;
}

export interface UserStatusUpdate {
  isActive: boolean;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  full_name?: string;
}
