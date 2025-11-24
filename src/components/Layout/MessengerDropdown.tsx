import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Avatar from '@/components/Avatar';
import { ROUTES } from '@/utils/constants';

const MessengerDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount] = useState(2); // Mock data - sẽ lấy từ API sau
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mock conversations
  const conversations = [
    {
      id: 1,
      user: { id: 1, email: 'john@example.com', username: 'John Doe', role: 'USER' },
      lastMessage: 'Xin chào! Bạn có thể giúp tôi với problem này không?',
      time: '5 phút trước',
      unread: 2,
    },
    {
      id: 2,
      user: { id: 2, email: 'jane@example.com', username: 'Jane Smith', role: 'USER' },
      lastMessage: 'Cảm ơn bạn đã giúp đỡ!',
      time: '1 giờ trước',
      unread: 0,
    },
  ];

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
            {conversations.length > 0 ? (
              conversations.map((conversation) => (
                <Link
                  key={conversation.id}
                  to={`${ROUTES.MESSAGES}/${conversation.id}`}
                  className="flex items-center p-4 hover:bg-gray-50 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Avatar user={conversation.user} size="md" className="mr-3" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {conversation.user.username}
                      </p>
                      {conversation.unread > 0 && (
                        <span className="ml-2 flex-shrink-0 h-5 w-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">
                          {conversation.unread}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-1">
                      {conversation.lastMessage}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{conversation.time}</p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500 text-sm">
                Không có tin nhắn mới
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MessengerDropdown;

