import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/utils/constants';
import { notificationApi, type NotificationResponse } from '@/apis/notification.api';
import { websocketService } from '@/services/websocket.service';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import Avatar from '@/components/Avatar';
import toast from 'react-hot-toast';

const NotificationDropdown = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      fetchNotifications();
      connectWebSocket();
    } else {
      // Disconnect when user logs out
      websocketService.disconnect();
      setNotifications([]);
      setUnreadCount(0);
    }

    return () => {
      // Only disconnect on unmount, not on user change
      if (!user) {
        websocketService.disconnect();
      }
    };
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const connectWebSocket = () => {
    if (!user?.id) {
      console.log('Cannot connect WebSocket: user not found');
      return;
    }

    console.log('Connecting WebSocket for user:', user.id);
    websocketService.connect(
      user.id.toString(),
      () => {
        console.log('WebSocket connected, subscribing to notifications...');
        // Subscribe to notifications - Spring uses /user/{userId}/queue/notifications
        const destination = `/user/${user.id}/queue/notifications`;
        const subscriptionId = websocketService.subscribe(destination, (notification: NotificationResponse) => {
          console.log('Received notification via WebSocket:', notification);
          // Add new notification to the list
          setNotifications((prev) => [notification, ...prev]);
          setUnreadCount((prev) => prev + 1);
          
          // Refresh unread count
          fetchUnreadCount();
          
          // Show toast notification
          toast.success(`${notification.title}: ${notification.content}`, {
            duration: 5000,
          });
        });
        
        if (subscriptionId) {
          console.log('Subscribed to notifications:', destination);
        } else {
          console.error('Failed to subscribe to notifications');
        }
      },
      (error) => {
        console.error('WebSocket connection error:', error);
      }
    );
  };

  const fetchUnreadCount = async () => {
    try {
      const count = await notificationApi.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      // Fetch cả read và unread để hiển thị đầy đủ
      const response = await notificationApi.getNotifications({
        page: 0,
        size: 10,
        sortBy: 'createdAt',
        sortDir: 'DESC',
        // Không filter isRead để lấy cả read và unread
      });
      setNotifications(response.content);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification: NotificationResponse) => {
    if (!notification.isRead) {
      try {
        await notificationApi.markAsRead(notification.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }

    // Navigate based on notification type
    if (notification.relatedPostId) {
      navigate(`/discuss/${notification.relatedPostId}`);
    } else if (notification.relatedUserId) {
      navigate(`/users/${notification.relatedUserId}`);
    } else if (notification.relatedConversationId) {
      navigate(`/messages`);
    }

    setIsOpen(false);
  };

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: vi });
    } catch {
      return dateString;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'FOLLOW':
        return '👤';
      case 'FRIEND_REQUEST':
        return '🤝';
      case 'FRIEND_ACCEPTED':
        return '✅';
      case 'POST_LIKE':
        return '❤️';
      case 'POST_COMMENT':
      case 'COMMENT_REPLY':
        return '💬';
      case 'MESSAGE':
        return '📨';
      default:
        return '🔔';
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
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
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
            <h3 className="font-semibold text-gray-900">Thông báo</h3>
            <Link
              to={ROUTES.NOTIFICATIONS}
              className="text-sm text-blue-600 hover:text-blue-700"
              onClick={() => setIsOpen(false)}
            >
              Xem tất cả
            </Link>
          </div>
          <div className="divide-y divide-gray-200">
            {loading ? (
              <div className="p-4 text-center text-gray-500 text-sm">Đang tải...</div>
            ) : notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.isRead ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {notification.relatedUserAvatar ? (
                      <Avatar
                        src={notification.relatedUserAvatar}
                        alt={notification.relatedUserName || ''}
                        size="sm"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-lg">
                        {getNotificationIcon(notification.type)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{notification.content}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatTime(notification.createdAt)}</p>
                    </div>
                    {!notification.isRead && (
                      <div className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0 mt-2"></div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500 text-sm">
                Không có thông báo mới
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
