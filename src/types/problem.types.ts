import type { CategoryResponse, TagResponse, LanguageResponse } from './common.types';

export interface ProblemResponse {
  id: number;
  code: string;
  title: string;
  slug: string;
  level: 'EASY' | 'MEDIUM' | 'HARD';
  timeLimitMs: number;
  memoryLimitMb: number;
  authorId: number;
  authorName: string;
  categories: CategoryResponse[];
  tags: TagResponse[];
  languages: LanguageResponse[];
  isBookmarked?: boolean;
  status?: ProblemStatus;
}

export interface ProblemDetailResponse {
  id: number;
  code: string;
  title: string;
  slug: string;
  content: string; // HTML content
  level: 'EASY' | 'MEDIUM' | 'HARD';
  sampleInput?: string;
  sampleOutput?: string;
  timeLimitMs: number;
  memoryLimitMb: number;
  authorId?: number;
  authorName?: string;
  categories: CategoryResponse[];
  tags: TagResponse[];
  languages: LanguageResponse[];
}

export type ProblemStatus = 'NOT_ATTEMPTED' | 'ATTEMPTED_NOT_COMPLETED' | 'COMPLETED';
