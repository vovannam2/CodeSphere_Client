import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Avatar from '@/components/Avatar';
import CommentForm from './CommentForm';
import { FiMoreVertical, FiEdit2, FiTrash2, FiCornerDownRight, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { commentApi } from '@/apis/comment.api';
import type { Comment } from '@/types/comment.types';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale/vi';

interface CommentItemProps {
  comment: Comment;
  problemId?: number;
  postId?: number;
  onUpdate: () => void;
  onDelete?: () => void;
  level?: number;
}

const CommentItem = ({ comment, problemId, postId, onUpdate, onDelete, level = 0 }: CommentItemProps) => {
  const { user } = useAuth();
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showReplies, setShowReplies] = useState(false); // Mặc định ẩn replies như Facebook
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);

  // So sánh owner - đảm bảo cả hai đều có giá trị và so sánh đúng
  const userId = user?.id;
  const authorId = comment.authorId;
  
  // So sánh chính xác - convert cả hai về number để so sánh
  const isOwner = userId != null && 
                  authorId != null && 
                  Number(userId) === Number(authorId);
  const hasReplies = (comment.replies && comment.replies.length > 0) || (comment.replyCount && comment.replyCount > 0);

  const handleReply = async (content: string) => {
    try {
      setIsSubmitting(true);
      if (problemId) {
        await commentApi.createComment({
          problemId,
          content,
          parentId: comment.id,
        });
      } else if (postId) {
        await commentApi.createPostComment(postId, {
          content,
          parentId: comment.id,
        });
      }
      toast.success('Đã gửi bình luận');
      setIsReplying(false);
      onUpdate();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Lỗi khi gửi bình luận';
      toast.error(message);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!editContent.trim()) return;
    try {
      setIsSubmitting(true);
      await commentApi.updateComment(comment.id, { content: editContent });
      toast.success('Đã cập nhật bình luận');
      setIsEditing(false);
      onUpdate();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Lỗi khi cập nhật bình luận';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    const hasRepliesToDelete = hasReplies;
    const replyCount = comment.replyCount || comment.replies?.length || 0;
    const confirmMessage = hasRepliesToDelete
      ? `Bạn có chắc chắn muốn xóa bình luận này? Tất cả ${replyCount} phản hồi cũng sẽ bị xóa.`
      : 'Bạn có chắc chắn muốn xóa bình luận này?';
    
    if (!confirm(confirmMessage)) return;
    try {
      setIsDeleting(true);
      await commentApi.deleteComment(comment.id);
      toast.success(hasRepliesToDelete ? `Đã xóa bình luận và ${replyCount} phản hồi` : 'Đã xóa bình luận');
      onUpdate();
      if (onDelete) {
        onDelete();
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Lỗi khi xóa bình luận';
      toast.error(message);
    } finally {
      setIsDeleting(false);
      setShowMenu(false);
    }
  };

  return (
    <div className={`${level > 0 ? 'ml-12 mt-3 border-l-2 border-blue-200 pl-4' : 'mb-4'}`}>
      <div className="flex gap-3">
        <Avatar 
          user={{ 
            id: comment.authorId, 
            username: comment.authorName || 'User', 
            email: '', 
            role: '', 
            avatar: comment.authorAvatar 
          }} 
          size="md" 
        />
        <div className="flex-1 min-w-0">
          <div className={`rounded-lg p-4 ${level > 0 ? 'bg-blue-50/50 border border-blue-100' : 'bg-gray-50'}`}>
            <div className="flex items-start justify-between mb-2">
              <div>
                <span className="font-semibold text-gray-900">{comment.authorName}</span>
                <span className="text-sm text-gray-500 ml-2">
                  {formatDistanceToNow(new Date(comment.createdAt), { 
                    addSuffix: true, 
                    locale: vi 
                  })}
                </span>
                {comment.updatedAt !== comment.createdAt && (
                  <span className="text-xs text-gray-400 ml-2">(đã chỉnh sửa)</span>
                )}
              </div>
              {/* Luôn hiển thị icon 3 chấm, nhưng chỉ cho phép edit/delete nếu là owner */}
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                  title="Tùy chọn"
                >
                  <FiMoreVertical className="w-4 h-4" />
                </button>
                {showMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowMenu(false)}
                    />
                    <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg py-1 z-20 border border-gray-200">
                      {isOwner ? (
                        <>
                          <button
                            onClick={() => {
                              setIsEditing(true);
                              setShowMenu(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                          >
                            <FiEdit2 className="w-4 h-4" />
                            Chỉnh sửa
                          </button>
                          <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2 disabled:opacity-50"
                          >
                            <FiTrash2 className="w-4 h-4" />
                            {isDeleting ? 'Đang xóa...' : 'Xóa'}
                          </button>
                        </>
                      ) : (
                        <div className="px-4 py-2 text-sm text-gray-500">
                          Chỉ chủ sở hữu mới có thể chỉnh sửa
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {isEditing ? (
              <div className="space-y-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  disabled={isSubmitting}
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleEdit}
                    disabled={!editContent.trim() || isSubmitting}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Đang lưu...' : 'Lưu'}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditContent(comment.content);
                    }}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 disabled:opacity-50"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
            )}
          </div>

          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={() => setIsReplying(!isReplying)}
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              <FiCornerDownRight className="w-4 h-4" />
              Trả lời
            </button>
            {hasReplies && (
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors mt-1"
              >
                {showReplies ? (
                  <>
                    <FiChevronUp className="w-4 h-4" />
                    Ẩn {comment.replyCount || comment.replies?.length || 0} phản hồi
                  </>
                ) : (
                  <>
                    <FiChevronDown className="w-4 h-4" />
                    Xem {comment.replyCount || comment.replies?.length || 0} phản hồi
                  </>
                )}
              </button>
            )}
          </div>

          {isReplying && (
            <div className="mt-4">
                <CommentForm
                  problemId={problemId}
                  postId={postId}
                  parentId={comment.id}
                  onSubmit={handleReply}
                  onCancel={() => setIsReplying(false)}
                  placeholder="Viết phản hồi..."
                  isSubmitting={isSubmitting}
                />
            </div>
          )}

          {showReplies && hasReplies && comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-3">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  problemId={problemId}
                  postId={postId}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  level={level + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentItem;

