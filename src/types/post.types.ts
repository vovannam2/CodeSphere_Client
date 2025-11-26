export interface TagResponse {
  id: number;
  name: string;
  slug: string;
}

export interface CategoryResponse {
  id: number;
  name: string;
  slug: string;
  parentId?: number;
  parentName?: string;
  children?: CategoryResponse[];
}

export interface PostResponse {
  id: number;
  title: string;
  content: string;
  isAnonymous: boolean;
  isResolved: boolean;
  authorId: number;
  authorName: string;
  authorAvatar: string | null;
  totalVotes: number;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  viewCount: number;
  userVote: number | null; // null, 1 (like)
  tags: TagResponse[];
  createdAt: string;
  updatedAt: string;
}

import type { CommentResponse } from './comment.types';

export interface PostDetailResponse extends PostResponse {
  comments?: CommentResponse[]; // Comments từ backend (nếu có)
}

export interface CreatePostRequest {
  title: string;
  content: string;
  isAnonymous?: boolean;
  tagNames?: string[]; // Tên các tag (có thể tạo tag mới)
}

export interface VoteRequest {
  vote: number; // 1 (upvote), -1 (downvote), 0 (remove vote)
}

export interface VoteResponse {
  totalVotes: number;
  upvotes: number;
  downvotes: number;
  userVote: number | null;
}

