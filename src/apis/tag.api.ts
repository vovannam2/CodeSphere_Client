import apiClient from './apiClient';

export const tagApi = {
  getAllTags: async () => {
    const res = await apiClient.get('/tags');
    return res.data?.data ?? res.data ?? [];
  },

  getTag: async (id: number) => {
    const res = await apiClient.get(`/tags/${id}`);
    return res.data?.data ?? res.data;
  },
};

export default tagApi;