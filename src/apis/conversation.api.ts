import apiClient from './apiClient';
import type { DataResponse } from '@/types/common.types';
import type { ConversationResponse, CreateConversationRequest } from '@/types/conversation.types';

export const conversationApi = {
  getConversations: async (): Promise<ConversationResponse[]> => {
    const response = await apiClient.get<DataResponse<ConversationResponse[]>>('/conversations');
    return response.data.data!;
  },

  getConversationById: async (id: number): Promise<ConversationResponse> => {
    const response = await apiClient.get<DataResponse<ConversationResponse>>(`/conversations/${id}`);
    return response.data.data!;
  },

  createConversation: async (request: CreateConversationRequest): Promise<ConversationResponse> => {
    const response = await apiClient.post<DataResponse<ConversationResponse>>('/conversations', request);
    return response.data.data!;
  },

  createOrGetDirectConversation: async (otherUserId: number): Promise<ConversationResponse> => {
    // Tạo DIRECT conversation với 1 participant
    const request: CreateConversationRequest = {
      type: 'DIRECT',
      participantIds: [otherUserId],
    };
    return conversationApi.createConversation(request);
  },
};

