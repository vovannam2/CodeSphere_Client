import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiMessageSquare } from 'react-icons/fi';
import Avatar from '@/components/Avatar';
import { ROUTES } from '@/utils/constants';
import { conversationApi } from '@/apis/conversation.api';
import type { ConversationResponse } from '@/types/conversation.types';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import toast from 'react-hot-toast';
import Tooltip from './Tooltip';

const MessengerDropdown = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState<ConversationResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isActive = location.pathname === ROUTES.MESSAGES || location.pathname.startsWith(ROUTES.MESSAGES + '/');

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
      <Tooltip text="Tin nhắn">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`relative p-2 rounded-full transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-gray-100 ${
            isActive
              ? 'text-blue-600 bg-blue-100'
              : 'text-gray-600'
          }`}
        >
          <FiMessageSquare className="w-6 h-6 transition-transform duration-200 group-hover:scale-110" />
          {/* Unread badge */}
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </Tooltip>

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
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                Chưa có tin nhắn nào
              </div>
            ) : (
              conversations.slice(0, 5).map((conversation) => {
                const otherUser = getOtherUser(conversation);
                return (
                  <div
                    key={conversation.id}
                    onClick={() => {
                      navigate(`${ROUTES.MESSAGES}/${conversation.id}`);
                      setIsOpen(false);
                    }}
                    className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {conversation.type === 'DIRECT' && otherUser ? (
                        <Avatar
                          src={otherUser.avatar}
                          username={otherUser.username}
                          size="sm"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
                          {conversation.type === 'GROUP' ? 'G' : '?'}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {conversation.type === 'DIRECT' && otherUser
                              ? otherUser.username
                              : conversation.name || 'Nhóm'}
                          </p>
                          {conversation.lastMessage && (
                            <span className="text-xs text-gray-500 ml-2">
                              {formatTime(conversation.lastMessage.createdAt)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 truncate">
                          {conversation.lastMessage?.content || 'Chưa có tin nhắn'}
                        </p>
                        {conversation.unreadCount && conversation.unreadCount > 0 && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MessengerDropdown;

