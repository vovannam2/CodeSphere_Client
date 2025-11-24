import apiClient from './apiClient';
import type { DataResponse } from '@/types/common.types';

export interface MyStatsResponse {
  totalSolved: number;
  solvedEasy: number;
  solvedMedium: number;
  solvedHard: number;
  totalAttempted: number;
  totalSubmissions: number;
  acceptedSubmissions: number;
  acceptanceRate: number;
  progressRate: number;
  attemptedEasy: number;
  attemptedMedium: number;
  attemptedHard: number;
}

export const statisticsApi = {
  getMyStats: async (): Promise<MyStatsResponse> => {
    const response = await apiClient.get<DataResponse<MyStatsResponse>>('/stats/my-stats');
    return response.data.data!;
  },
};

