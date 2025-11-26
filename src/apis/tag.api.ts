import apiClient from './apiClient';
import type { DataResponse } from '@/types/common.types';
import type { TagResponse } from '@/types/post.types';

export const tagApi = {
  getAllTags: async (type?: 'POST' | 'PROBLEM'): Promise<TagResponse[]> => {
    const params = type ? { type } : {};
    const response = await apiClient.get<DataResponse<TagResponse[]>>('/tags', { params });
    return response.data.data!;
  },
};

