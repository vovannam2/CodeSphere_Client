// ...existing code...
import apiClient from './apiClient';
import type { DataResponse, PageResponse } from '@/types/common.types';
import type { LanguageResponse } from '@/types/language.types';

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
    const res = await apiClient.get<DataResponse<PageResponse<ProblemResponse>>>(`/problems?${qp}`);
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
};
// ...existing code...