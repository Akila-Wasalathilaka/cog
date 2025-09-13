import type { User, PasswordChangeRequest, ProfileUpdateData, UserStatusUpdate } from './user';

export * from './user';

export type { User, PasswordChangeRequest, ProfileUpdateData, UserStatusUpdate };

export interface Assessment {
  id: string;
  tenant_id: string;
  candidate_id: string;
  job_role_id: string;
  status: string;
  started_at?: string;
  completed_at?: string;
  total_score?: number;
  integrity_flags?: Record<string, any>;
  created_at: string;
}

export interface Game {
  id: string;
  code: string;
  title: string;
  description?: string;
  base_config: Record<string, any>;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role?: string;
  full_name?: string;
  job_role_id?: string;
}

export interface DashboardStats {
  total_candidates: number;
  active_candidates: number;
  total_assessments: number;
  completed_assessments: number;
}

export interface AnalyticsOverview {
  total_users: number;
  active_users: number;
  total_assessments: number;
  completion_rate: number;
}

export interface GameAnalytics {
  game_id: string;
  average_score: number;
  completion_rate: number;
  average_time: number;
}