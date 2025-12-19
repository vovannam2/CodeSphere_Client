import { FiHeart, FiEye, FiMessageCircle, FiMoreVertical, FiX, FiShare2 } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import Avatar from '@/components/Avatar';
import type { PostResponse } from '@/types/post.types';
import { postApi } from '@/apis/post.api';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Sync state với post prop chỉ khi post.id thay đổi (post mới), không sync khi vote
  useEffect(() => {
    setCurrentVote(post.userVote);
    setLikeCount(post.upvotes);
  }, [post.id]);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isVoting) return;

    // Nếu đã like thì unlike (vote = 0), nếu chưa like thì like (vote = 1)
    const isCurrentlyLiked = currentVote === 1;
    const newVote = isCurrentlyLiked ? 0 : 1;
    
    // Optimistic update
    const previousVote = currentVote;
    const previousCount = likeCount;
    
    const optimisticVote = newVote === 1 ? 1 : null;
    setCurrentVote(optimisticVote);
    setLikeCount(prev => isCurrentlyLiked ? Math.max(0, prev - 1) : prev + 1);
    
    setIsVoting(true);
    try {
      const response = await postApi.votePost(post.id, newVote);
      const serverUserVote = response.userVote !== null && response.userVote !== undefined 
        ? response.userVote 
        : null;
      
      if (serverUserVote !== null && serverUserVote !== undefined) {
        setCurrentVote(serverUserVote === 1 ? 1 : null);
      }
      
      setLikeCount(response.upvotes || likeCount);
      onVoteChange?.();
    } catch (error: any) {
      setCurrentVote(previousVote);
      setLikeCount(previousCount);
      toast.error(error?.response?.data?.message || 'Error liking post');
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

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/discuss/${post.id}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            onClick={(e) => {
              e.stopPropagation();
              if (!post.isAnonymous && post.authorId) navigate(`/users/${post.authorId}`);
            }}
            className={`${!post.isAnonymous && post.authorId ? 'cursor-pointer' : ''}`}
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
          <div>
            <div className="flex items-center gap-2">
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  if (!post.isAnonymous && post.authorId) navigate(`/users/${post.authorId}`);
                }}
                className={`font-bold text-gray-900 ${!post.isAnonymous && post.authorId ? 'hover:underline cursor-pointer' : ''}`}
              >
                {post.isAnonymous ? 'Anonymous User' : post.authorName}
              </span>
              {post.isResolved && (
                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded">
                  Resolved
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <span>{formatTime(post.createdAt)}</span>
              <span>•</span>
              <FiEye className="w-3 h-3" />
              <span>{post.viewCount || 0}</span>
            </div>
          </div>
        </div>
        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
          <FiMoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* Content Section */}
      <div className="px-4 pb-3">
        <h3
          onClick={handlePostClick}
          className="text-lg font-bold text-gray-900 mb-2 cursor-pointer hover:text-blue-600 transition-colors line-clamp-2"
        >
          {post.title}
        </h3>
        <div
          onClick={handlePostClick}
          className="text-gray-700 text-[15px] mb-3 line-clamp-3 cursor-pointer whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: post.content.substring(0, 300) + (post.content.length > 300 ? '...' : '') }}
        />

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {post.tags.map((tag) => (
              <span
                key={tag.id}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-md hover:bg-gray-200 cursor-pointer transition-colors"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Images */}
      {((post.images && post.images.length > 0) || post.imageUrl) && (
        <div className="border-y border-gray-100 bg-gray-50">
          {post.images && post.images.length > 0 ? (
            <div className={`grid gap-0.5 ${post.images.length >= 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {post.images.slice(0, 4).map((img, idx) => (
                <div key={idx} className="relative aspect-square overflow-hidden bg-gray-200">
                  <img
                    src={img}
                    alt={`Post image ${idx + 1}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage(img);
                    }}
                    className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                  />
                  {idx === 3 && (post.images?.length ?? 0) > 4 && (
                    <div 
                      className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImage(post.images?.[3] ?? null);
                      }}
                    >
                      <span className="text-white text-2xl font-bold">+{(post.images?.length ?? 0) - 4}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : post.imageUrl ? (
            <img
              src={post.imageUrl}
              alt="Post image"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(post.imageUrl!);
              }}
              className="w-full h-auto max-h-[500px] object-cover cursor-pointer"
            />
          ) : null}
        </div>
      )}

      {/* Interaction Stats */}
      <div className="px-4 py-2 flex items-center justify-between text-sm text-gray-500 border-b border-gray-100">
        <div className="flex items-center gap-1.5">
          <div className="flex -space-x-1">
            <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center border-2 border-white">
              <FiHeart className="w-2.5 h-2.5 text-white fill-white" />
            </div>
          </div>
          <span className="hover:underline cursor-pointer">{likeCount || 0}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hover:underline cursor-pointer">{post.commentCount || 0} comments</span>
          <span className="hover:underline cursor-pointer">0 shares</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-2 py-1 flex items-center gap-1">
        <button
          onClick={handleLike}
          disabled={isVoting}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-colors ${
            currentVote === 1
              ? 'text-blue-600 hover:bg-blue-50'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <FiHeart className={`w-5 h-5 ${currentVote === 1 ? 'fill-blue-600 text-blue-600' : ''}`} />
          <span className="font-semibold text-[14px]">Like</span>
        </button>

        <button
          onClick={handlePostClick}
          className="flex-1 flex items-center justify-center gap-2 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FiMessageCircle className="w-5 h-5" />
          <span className="font-semibold text-[14px]">Comment</span>
        </button>

        <button
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-2 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FiShare2 className="w-5 h-5" />
          <span className="font-semibold text-[14px]">Share</span>
        </button>
      </div>

      {/* Image Modal */}
      {selectedImage && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
          >
            <FiX className="w-8 h-8" />
          </button>
          <img
            src={selectedImage}
            alt="Full size"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>,
        document.body
      )}
    </div>
  );
};

export default PostCard;

