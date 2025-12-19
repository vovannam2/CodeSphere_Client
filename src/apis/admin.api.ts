// ...existing code...
import apiClient from './apiClient';
import type { DataResponse, PageResponse } from '@/types/common.types';
import type { LanguageResponse } from '@/types/language.types';
import type { UserManagementResponse, DashboardStatsResponse } from '@/types/admin.types';
import type { ContestResponse, ContestDetailResponse, CreateContestRequest, ContestProblemRequest } from '@/types/contest.types';

export const adminApi = {
  // Languages
  createLanguage: async (payload: { code: string; name: string; version?: string }) => {
    const res = await apiClient.post<DataResponse<LanguageResponse>>('/admin/languages', payload);
    return res.data.data!;
  },
  updateLanguage: async (id: number, payload: { name?: string; version?: string }) => {
    const res = await apiClient.put<DataResponse<LanguageResponse>>(`/admin/languages/${id}`, payload);
    return res.data.data!;
  },
  deleteLanguage: async (id: number) => {
    const res = await apiClient.delete<DataResponse<string>>(`/admin/languages/${id}`);
    return res.data.data!;
  },

  // Categories (admin)
  createCategory: async (payload: { name: string; slug: string; parentId?: number }) => {
    const res = await apiClient.post<DataResponse<CategoryResponse>>('/admin/categories', payload);
    return res.data.data!;
  },
  updateCategory: async (id: number, payload: { name?: string; slug?: string; parentId?: number }) => {
    const res = await apiClient.put<DataResponse<CategoryResponse>>(`/admin/categories/${id}`, payload);
    return res.data.data!;
  },
  deleteCategory: async (id: number) => {
    const res = await apiClient.delete<DataResponse<string>>(`/admin/categories/${id}`);
    return res.data.data!;
  },
  getProblems: async (page = 0, size = 20, params: Record<string, any> = {}) => {
    const qp = new URLSearchParams({ page: String(page), size: String(size), ...params }).toString();
    const res = await apiClient.get<DataResponse<PageResponse<ProblemResponse>>>(`/admin/problems?${qp}`);
    return res.data.data!;
  },
  
  getProblem: async (id: number) => {
    const res = await apiClient.get<DataResponse<ProblemDetailResponse>>(`/admin/problems/${id}`);
    return res.data.data!;
  },

  createProblem: async (payload: any) => {
    const res = await apiClient.post<DataResponse<ProblemDetailResponse>>('/admin/problems', payload);
    return res.data.data!;
  },

  updateProblem: async (id: number, payload: any) => {
    const res = await apiClient.put<DataResponse<ProblemDetailResponse>>(`/admin/problems/${id}`, payload);
    return res.data.data!;
  },

  deleteProblem: async (id: number) => {
    const res = await apiClient.delete<DataResponse<string>>(`/admin/problems/${id}`);
    return res.data.data!;
  },
  // Tags (admin)

  createTag: async (payload: { name: string; slug: string }) => {
    const res = await apiClient.post<DataResponse<TagResponse>>('/admin/tags', payload);
    return res.data.data!;
  },
  updateTag: async (id: number, payload: { name?: string; slug?: string }) => {
    const res = await apiClient.put<DataResponse<TagResponse>>(`/admin/tags/${id}`, payload);
    return res.data.data!;
  },
  deleteTag: async (id: number) => {
    const res = await apiClient.delete<DataResponse<string>>(`/admin/tags/${id}`);
    return res.data.data!;
  },
  // Testcases (admin)
  getTestCasesByProblem: async (problemId: number) => {
    const res = await apiClient.get<DataResponse<TestCaseResponse[]>>(`/problems/${problemId}/testcases`);
    return res.data.data!;
  },

  createTestCase: async (payload: { problemId: number; input: string; expectedOutput: string; isSample?: boolean; isHidden?: boolean; weight?: number }) => {
    const res = await apiClient.post<DataResponse<TestCaseResponse>>('/admin/testcases', payload);
    return res.data.data!;
  },

  updateTestCase: async (id: number, payload: { input?: string; expectedOutput?: string; isSample?: boolean; isHidden?: boolean; weight?: number }) => {
    const res = await apiClient.put<DataResponse<TestCaseResponse>>(`/admin/testcases/${id}`, payload);
    return res.data.data!;
  },

  deleteTestCase: async (id: number) => {
    const res = await apiClient.delete<DataResponse<string>>(`/admin/testcases/${id}`);
    return res.data.data!;
  },

  // Users (admin)
  getUsers: async (page = 0, size = 20, search?: string, role?: string, status?: string) => {
    const params: Record<string, string> = { page: String(page), size: String(size) };
    if (search) params.search = search;
    if (role) params.role = role;
    if (status) params.status = status;
    const qp = new URLSearchParams(params).toString();
    const res = await apiClient.get<DataResponse<PageResponse<UserManagementResponse>>>(`/admin/users?${qp}`);
    return res.data.data!;
  },

  getUserById: async (id: number) => {
    const res = await apiClient.get<DataResponse<UserManagementResponse>>(`/admin/users/${id}`);
    return res.data.data!;
  },

  updateUserStatus: async (id: number, status: string) => {
    const res = await apiClient.put<DataResponse<UserManagementResponse>>(`/admin/users/${id}/status?status=${status}`);
    return res.data.data!;
  },

  blockUser: async (id: number) => {
    const res = await apiClient.put<DataResponse<UserManagementResponse>>(`/admin/users/${id}/block`);
    return res.data.data!;
  },

  unblockUser: async (id: number) => {
    const res = await apiClient.put<DataResponse<UserManagementResponse>>(`/admin/users/${id}/unblock`);
    return res.data.data!;
  },

  changeUserRole: async (id: number, role: string) => {
    const res = await apiClient.put<DataResponse<UserManagementResponse>>(`/admin/users/${id}/role?role=${role}`);
    return res.data.data!;
  },

  deleteUser: async (id: number) => {
    const res = await apiClient.delete<DataResponse<string>>(`/admin/users/${id}`);
    return res.data.data!;
  },

  // Statistics (admin)
  getDashboardStats: async () => {
    const res = await apiClient.get<DataResponse<DashboardStatsResponse>>('/admin/statistics/dashboard');
    return res.data.data!;
  },

  // Contests (admin)
  getContests: async (page = 0, size = 20, search?: string, type?: string) => {
    const params: Record<string, string> = { page: String(page), size: String(size) };
    if (search) params.search = search;
    if (type) params.type = type;
    const qp = new URLSearchParams(params).toString();
    const res = await apiClient.get<DataResponse<PageResponse<ContestResponse>>>(`/admin/contests?${qp}`);
    return res.data.data!;
  },

  createContest: async (payload: CreateContestRequest) => {
    const res = await apiClient.post<DataResponse<ContestDetailResponse>>('/admin/contests', payload);
    return res.data.data!;
  },

  getContestById: async (id: number) => {
    const res = await apiClient.get<DataResponse<ContestDetailResponse>>(`/admin/contests/${id}`);
    return res.data.data!;
  },

  updateContest: async (id: number, payload: CreateContestRequest) => {
    const res = await apiClient.put<DataResponse<ContestDetailResponse>>(`/admin/contests/${id}`, payload);
    return res.data.data!;
  },

  deleteContest: async (id: number) => {
    const res = await apiClient.delete<DataResponse<string>>(`/admin/contests/${id}`);
    return res.data.data!;
  },

  addProblemToContest: async (id: number, payload: ContestProblemRequest) => {
    const res = await apiClient.post<DataResponse<string>>(`/admin/contests/${id}/problems`, payload);
    return res.data.data!;
  },

  removeProblemFromContest: async (id: number, problemId: number) => {
    const res = await apiClient.delete<DataResponse<string>>(`/admin/contests/${id}/problems/${problemId}`);
    return res.data.data!;
  },

  getContestRegistrations: async (id: number) => {
    const res = await apiClient.get<DataResponse<any[]>>(`/admin/contests/${id}/registrations`);
    return res.data.data!;
  },

  toggleContestVisibility: async (id: number) => {
    const res = await apiClient.put<DataResponse<string>>(`/admin/contests/${id}/toggle-visibility`);
    return res.data.data!;
  },
};
// ...existing code...