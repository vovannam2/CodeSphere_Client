import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Avatar from '@/components/Avatar';
import { ROUTES } from '@/utils/constants';
import { conversationApi } from '@/apis/conversation.api';
import type { ConversationResponse } from '@/types/conversation.types';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import toast from 'react-hot-toast';

const MessengerDropdown = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState<ConversationResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchConversations();
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const data = await conversationApi.getConversations();
      setConversations(data);
      const totalUnread = data.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
      setUnreadCount(totalUnread);
    } catch (error: any) {
      console.error('Error fetching conversations:', error);
      toast.error('Có lỗi xảy ra khi tải tin nhắn');
    } finally {
      setLoading(false);
    }
  };

  const getOtherUser = (conversation: ConversationResponse) => {
    if (conversation.type === 'DIRECT' && conversation.participants) {
      return conversation.participants.find((p) => p.userId !== user?.id);
    }
    return null;
  };

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: vi });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-xl transition-all duration-200 group"
      >
        <svg
          className="w-6 h-6 transition-transform group-hover:scale-110"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 block h-5 w-5 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold flex items-center justify-center shadow-md shadow-red-500/30 border-2 border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50 border border-gray-200 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">Tin nhắn</h3>
            <Link
              to={ROUTES.MESSAGES}
              className="text-sm text-blue-600 hover:text-blue-700"
              onClick={() => setIsOpen(false)}
            >
              Xem tất cả
            </Link>
          </div>
          <div className="divide-y divide-gray-200">
            {loading ? (
              <div className="p-4 text-center text-gray-500 text-sm">Đang tải...</div>
            ) : conversations.length > 0 ? (
              conversations.slice(0, 5).map((conversation) => {
                const otherUser = getOtherUser(conversation);
                const displayName = conversation.type === 'DIRECT' && otherUser
                  ? otherUser.username
                  : conversation.name || 'Nhóm chat';
                const displayAvatar = conversation.type === 'DIRECT' && otherUser
                  ? otherUser.avatar
                  : conversation.avatar;

                return (
                  <div
                    key={conversation.id}
                    onClick={() => {
                      navigate(`${ROUTES.MESSAGES}/${conversation.id}`);
                      setIsOpen(false);
                    }}
                    className="flex items-center p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <Avatar
                      src={displayAvatar || undefined}
                      alt={displayName}
                      size="md"
                      className="mr-3"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {displayName}
                        </p>
                        {conversation.unreadCount > 0 && (
                          <span className="ml-2 flex-shrink-0 h-5 w-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">
                            {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-1">
                        {conversation.lastMessage?.content || 'Chưa có tin nhắn'}
                      </p>
                      {conversation.lastMessage && (
                        <p className="text-xs text-gray-400 mt-1">
                          {formatTime(conversation.lastMessage.createdAt)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-center text-gray-500 text-sm">
                Không có tin nhắn
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MessengerDropdown;

