export interface LeaderboardResponse {
  rank: number;
  userId: number;
  username: string;
  bestScore: number;
  bestSubmissionId: number;
  totalSubmissions: number;
  bestSubmissionTime: string; // ISO date string
  statusMsg: string;
  statusRuntime: string;
  statusMemory: string;
  isAccepted: boolean;
}

export interface GlobalLeaderboardResponse {
  rank: number;
  userId: number;
  username: string;
  totalSolved: number;
  solvedEasy: number;
  solvedMedium: number;
  solvedHard: number;
}

