import type { CategoryResponse, TagResponse, LanguageResponse } from './common.types';

export interface ProblemResponse {
  id: number;
  code: string;
  title: string;
  level: 'EASY' | 'MEDIUM' | 'HARD';
  timeLimitMs: number;
  memoryLimitMb?: number; // Giới hạn bộ nhớ RAM (megabytes), mặc định: 256MB
  authorId: number;
  authorName: string;
  categories: CategoryResponse[];
  tags: TagResponse[];
  languages: LanguageResponse[];
  isBookmarked?: boolean;
  status?: ProblemStatus;
  isPublic?: boolean; // true for public problems, false for premium/private
  isContest?: boolean; // true for contest-only problems
}

export interface ProblemDetailResponse {
  id: number;
  code: string;
  title: string;
  content: string; // HTML content
  level: 'EASY' | 'MEDIUM' | 'HARD';
  timeLimitMs: number;
  memoryLimitMb?: number; // Giới hạn bộ nhớ RAM (megabytes), mặc định: 256MB
  authorId?: number;
  authorName?: string;
  categories: CategoryResponse[];
  tags: TagResponse[];
  languages: LanguageResponse[];
}

export type ProblemStatus = 'NOT_ATTEMPTED' | 'ATTEMPTED_NOT_COMPLETED' | 'COMPLETED';
