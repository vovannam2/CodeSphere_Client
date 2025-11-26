import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Container from '@/components/Layout/Container';
import Avatar from '@/components/Avatar';
import PostCard from '@/components/Post/PostCard';
import { FiUserPlus, FiUserX, FiArrowLeft, FiUsers, FiFileText, FiMessageSquare } from 'react-icons/fi';
import { userApi } from '@/apis/user.api';
import { followApi } from '@/apis/follow.api';
import { conversationApi } from '@/apis/conversation.api';
import { postApi } from '@/apis/post.api';
import type { UserPublicProfileResponse } from '@/types/user.types';
import type { PostResponse } from '@/types/post.types';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

type TabType = 'posts' | 'about' | 'stats';

const PublicProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<UserPublicProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [isFollowing, setIsFollowing] = useState<boolean | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  useEffect(() => {
    if (profile && activeTab === 'posts') {
      fetchPosts();
    }
  }, [profile, activeTab]);

  const fetchProfile = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const profileData = await userApi.getPublicProfile(Number(userId));
      setProfile(profileData);
      setIsFollowing(profileData.isFollowing);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi tải profile');
      navigate('/discuss');
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    if (!userId) return;
    
    try {
      setLoadingPosts(true);
      const response = await postApi.getPosts({
        authorId: Number(userId),
        page: 0,
        size: 20,
        sortBy: 'createdAt',
        sortDir: 'DESC',
      });
      setPosts(response.content);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi tải bài viết');
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleFollow = async () => {
    if (!userId || isProcessing) return;
    
    setIsProcessing(true);
    try {
      if (isFollowing) {
        await followApi.unfollowUser(Number(userId));
        setIsFollowing(false);
        if (profile) {
          setProfile({ ...profile, followerCount: profile.followerCount - 1 });
        }
        toast.success('Đã bỏ theo dõi');
      } else {
        await followApi.followUser(Number(userId));
        setIsFollowing(true);
        if (profile) {
          setProfile({ ...profile, followerCount: profile.followerCount + 1 });
        }
        toast.success('Đã theo dõi');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMessage = async () => {
    if (!userId || isProcessing) return;
    
    setIsProcessing(true);
    try {
      // Tạo hoặc lấy DIRECT conversation với user này
      const conversation = await conversationApi.createOrGetDirectConversation(Number(userId));
      navigate(`/messages/${conversation.id}`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi tạo cuộc trò chuyện');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Chưa cập nhật';
    try {
      const date = new Date(dateString);
      return format(date, 'dd/MM/yyyy', { locale: vi });
    } catch {
      return 'Chưa cập nhật';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <Container>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-gray-500">Đang tải...</div>
          </div>
        </Container>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const isOwnProfile = currentUser && currentUser.id === profile.userId;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Container>
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <FiArrowLeft className="mr-2" />
          Quay lại
        </button>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <Avatar
                src={profile.avatar || undefined}
                alt={profile.username}
                size="lg"
                className="w-24 h-24"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{profile.username}</h1>
                <div className="mt-2 flex items-center space-x-6 text-sm text-gray-600">
                  <div className="flex items-center">
                    <FiUsers className="mr-1" />
                    <span className="font-medium">{profile.followerCount}</span>
                    <span className="ml-1">người theo dõi</span>
                  </div>
                  <div className="flex items-center">
                    <FiUsers className="mr-1" />
                    <span className="font-medium">{profile.followingCount}</span>
                    <span className="ml-1">đang theo dõi</span>
                  </div>
                  <div className="flex items-center">
                    <FiFileText className="mr-1" />
                    <span className="font-medium">{profile.postCount}</span>
                    <span className="ml-1">bài viết</span>
                  </div>
                </div>
              </div>
            </div>

            {!isOwnProfile && currentUser && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleFollow}
                  disabled={isProcessing}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isFollowing
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  } disabled:opacity-50`}
                >
                  {isFollowing ? (
                    <>
                      <FiUserX className="inline mr-2" />
                      Bỏ theo dõi
                    </>
                  ) : (
                    <>
                      <FiUserPlus className="inline mr-2" />
                      Theo dõi
                    </>
                  )}
                </button>
                <button
                  onClick={handleMessage}
                  disabled={isProcessing}
                  className="px-4 py-2 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <FiMessageSquare className="inline mr-2" />
                  Nhắn tin
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('posts')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'posts'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Bài viết ({profile.postCount})
              </button>
              <button
                onClick={() => setActiveTab('about')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'about'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Giới thiệu
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'stats'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Thống kê
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'posts' && (
              <div>
                {loadingPosts ? (
                  <div className="text-center py-8 text-gray-500">Đang tải...</div>
                ) : posts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">Chưa có bài viết nào</div>
                ) : (
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'about' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Ngày sinh</h3>
                  <p className="text-gray-900">{formatDate(profile.dob)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Giới tính</h3>
                  <p className="text-gray-900">{profile.gender || 'Chưa cập nhật'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Tham gia</h3>
                  <p className="text-gray-900">{formatDate(profile.createdAt)}</p>
                </div>
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-500 mb-1">Bài viết</div>
                  <div className="text-2xl font-bold text-gray-900">{profile.postCount}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-500 mb-1">Người theo dõi</div>
                  <div className="text-2xl font-bold text-gray-900">{profile.followerCount}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-500 mb-1">Đang theo dõi</div>
                  <div className="text-2xl font-bold text-gray-900">{profile.followingCount}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
};

export default PublicProfilePage;

