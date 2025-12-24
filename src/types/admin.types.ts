export interface UserManagementResponse {
  id: number;
  username: string;
  email: string | null;
  role: string;
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  isBlocked: boolean;
  createdAt: string;
  lastLoginAt: string;
  totalSubmissions: number;
  totalSolved: number;
}

export interface DashboardStatsResponse {
  totalUsers: number;
  totalProblems: number;
  totalContests: number;
  totalSubmissions: number;
  activeUsers: number;
  activeNow: number;
  blockedUsers: number;
  administrators: number;
  newUsersThisMonth: number;
  submissionsToday: number;
}

