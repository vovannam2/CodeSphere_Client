import { FiHeart, FiEye, FiMessageCircle, FiMoreVertical } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import Avatar from '@/components/Avatar';
import type { PostResponse } from '@/types/post.types';
import { postApi } from '@/apis/post.api';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface PostCardProps {
  post: PostResponse;
  onVoteChange?: () => void;
}

const PostCard = ({ post, onVoteChange }: PostCardProps) => {
  const navigate = useNavigate();
  const [isVoting, setIsVoting] = useState(false);
  const [currentVote, setCurrentVote] = useState<number | null>(post.userVote);
  const [likeCount, setLikeCount] = useState(post.upvotes);

  const handleLike = async () => {
    if (isVoting) return;

    // Nếu đã like thì unlike (vote = 0), nếu chưa like thì like (vote = 1)
    const newVote = currentVote === 1 ? 0 : 1;
    
    setIsVoting(true);
    try {
      const response = await postApi.votePost(post.id, newVote);
      setCurrentVote(response.userVote);
      setLikeCount(response.upvotes);
      onVoteChange?.();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi like');
    } finally {
      setIsVoting(false);
    }
  };

  const handlePostClick = () => {
    navigate(`/discuss/${post.id}`);
  };

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: vi });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {!post.isAnonymous && post.authorId ? (
            <div
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/users/${post.authorId}`);
              }}
              className="cursor-pointer"
            >
              <Avatar
                user={{
                  id: post.authorId,
                  username: post.authorName,
                  email: '',
                  role: 'USER',
                  avatar: post.authorAvatar || undefined,
                }}
                size="md"
              />
            </div>
          ) : (
            <Avatar
              user={{
                id: post.authorId,
                username: post.authorName,
                email: '',
                role: 'USER',
                avatar: post.authorAvatar || undefined,
              }}
              size="md"
            />
          )}
          <div>
            <div className="flex items-center gap-2">
              {!post.isAnonymous && post.authorId ? (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/users/${post.authorId}`);
                  }}
                  className="font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                >
                  {post.authorName}
                </span>
              ) : (
                <span className="font-semibold text-gray-900">
                  Anonymous User
                </span>
              )}
              {post.isResolved && (
                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                  Resolved
                </span>
              )}
            </div>
            <span className="text-sm text-gray-500">{formatTime(post.createdAt)}</span>
          </div>
        </div>
        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <FiMoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* Title */}
      <h3
        onClick={handlePostClick}
        className="text-xl font-semibold text-gray-900 mb-2 cursor-pointer hover:text-blue-600 transition-colors"
      >
        {post.title}
      </h3>

      {/* Content Preview */}
      <div
        onClick={handlePostClick}
        className="text-gray-700 mb-4 line-clamp-3 cursor-pointer"
        dangerouslySetInnerHTML={{ __html: post.content.substring(0, 200) + (post.content.length > 200 ? '...' : '') }}
      />

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag) => (
            <span
              key={tag.id}
              className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded"
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}

      {/* Footer - Actions */}
      <div className="flex items-center gap-6 pt-4 border-t border-gray-100">
        <button
          onClick={handleLike}
          disabled={isVoting}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
            currentVote === 1
              ? 'bg-red-50 text-red-600'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <FiHeart className={`w-5 h-5 ${currentVote === 1 ? 'fill-current' : ''}`} />
          <span className="font-medium">{likeCount || 0}</span>
        </button>

        <button
          onClick={handlePostClick}
          className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <FiEye className="w-5 h-5" />
          <span className="font-medium">{post.viewCount || 0}</span>
        </button>

        <button
          onClick={handlePostClick}
          className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <FiMessageCircle className="w-5 h-5" />
          <span className="font-medium">{post.commentCount || 0}</span>
        </button>

      </div>
    </div>
  );
};

export default PostCard;

