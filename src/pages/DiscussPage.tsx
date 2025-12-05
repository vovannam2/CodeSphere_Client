import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '@/components/Layout/Container';
import PostCard from '@/components/Post/PostCard';
import Avatar from '@/components/Avatar';
import { FiPlus, FiTrendingUp, FiStar, FiSearch, FiX, FiUsers, FiUserPlus, FiUserX } from 'react-icons/fi';
import { postApi } from '@/apis/post.api';
import { tagApi } from '@/apis/tag.api';
import { userApi } from '@/apis/user.api';
import { followApi } from '@/apis/follow.api';
import { useAuth } from '@/hooks/useAuth';
import type { PostResponse, TagResponse } from '@/types/post.types';
import type { UserSearchResponse } from '@/types/user.types';
import { ROUTES } from '@/utils/constants';
import toast from 'react-hot-toast';

type SortType = 'votes' | 'newest';
type FilterType = 'all' | 'following';

const DiscussPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortType, setSortType] = useState<SortType>('votes');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [tags, setTags] = useState<TagResponse[]>([]);
  
  // Sidebar states
  const [sidebarSearchQuery, setSidebarSearchQuery] = useState('');
  const [searchedUsers, setSearchedUsers] = useState<UserSearchResponse[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [followingStatuses, setFollowingStatuses] = useState<Record<number, boolean>>({});
  const [processingFollow, setProcessingFollow] = useState<number | null>(null);
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchTags();
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [sortType, page, selectedTag, filterType, searchQuery]);

  // Search users with debounce
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (sidebarSearchQuery.trim().length >= 2) {
      const timeout = setTimeout(async () => {
        setLoadingSearch(true);
        try {
          const response = await userApi.searchUsers(sidebarSearchQuery.trim(), 0, 10);
          // Filter out current user
          const filtered = response.content.filter(
            (u) => u.userId !== user?.id
          );
          setSearchedUsers(filtered);
          
          // Check follow status for all users at once
          if (user?.id && filtered.length > 0) {
            try {
              const following = await followApi.getFollowing(user.id);
              const followingIds = new Set(following.map(f => f.userId));
              const statuses: Record<number, boolean> = {};
              filtered.forEach((u) => {
                statuses[u.userId] = followingIds.has(u.userId);
              });
              setFollowingStatuses(statuses);
            } catch (error) {
              console.error('Error checking follow status:', error);
              // Set all to false if error
              const statuses: Record<number, boolean> = {};
              filtered.forEach((u) => {
                statuses[u.userId] = false;
              });
              setFollowingStatuses(statuses);
            }
          }
        } catch (error) {
          console.error('Error searching users:', error);
          setSearchedUsers([]);
        } finally {
          setLoadingSearch(false);
        }
      }, 500); // Debounce 500ms

      setSearchTimeout(timeout);
    } else {
      setSearchedUsers([]);
      setFollowingStatuses({});
    }

    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [sidebarSearchQuery, user?.id]);

  const handleFollow = async (userId: number) => {
    if (processingFollow === userId) return;
    
    setProcessingFollow(userId);
    try {
      const isFollowing = followingStatuses[userId];
      if (isFollowing) {
        await followApi.unfollowUser(userId);
        setFollowingStatuses({ ...followingStatuses, [userId]: false });
        toast.success('Đã bỏ theo dõi');
      } else {
        await followApi.followUser(userId);
        setFollowingStatuses({ ...followingStatuses, [userId]: true });
        toast.success('Đã theo dõi');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setProcessingFollow(null);
    }
  };

  const fetchTags = async () => {
    try {
      const tagsData = await tagApi.getAllTags('POST'); // Chỉ lấy tags cho posts
      setTags(tagsData);
    } catch (error: any) {
      console.error('Error fetching tags:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await postApi.getPosts({
        page,
        size: 20,
        sortBy: 'createdAt',
        sortDir: 'DESC',
        tag: selectedTag || undefined,
        search: searchQuery.trim() || undefined,
        followedOnly: filterType === 'following' ? true : undefined,
      });
      
      let sortedPosts = response.content;
      // Sort by votes ở frontend nếu cần
      if (sortType === 'votes') {
        sortedPosts = [...response.content].sort((a, b) => (b.totalVotes || 0) - (a.totalVotes || 0));
      }
      
      if (page === 0) {
        setPosts(sortedPosts);
      } else {
        setPosts((prev) => [...prev, ...sortedPosts]);
      }
      
      setHasMore(response.number < response.totalPages - 1);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi tải bài viết');
    } finally {
      setLoading(false);
    }
  };

  const handleSortChange = (newSort: SortType) => {
    setSortType(newSort);
    setPage(0);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchPosts();
  };

  const handleTagFilter = (tagSlug: string | null) => {
    setSelectedTag(tagSlug);
    setPage(0);
  };

  const clearFilters = () => {
    setSelectedTag(null);
    setSearchQuery('');
    setFilterType('all');
    setPage(0);
  };

  const handleFilterChange = (newFilter: FilterType) => {
    setFilterType(newFilter);
    setPage(0);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Container>
        <div className="flex gap-6">
          {/* Sidebar - Search Users */}
          {user && (
            <div className="w-80 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 sticky top-4">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Tìm kiếm</h3>
                
                {/* Search Input */}
                <div className="relative mb-4">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm người dùng..."
                    value={sidebarSearchQuery}
                    onChange={(e) => setSidebarSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-colors"
                  />
                </div>

                {/* Search Results */}
                {sidebarSearchQuery.trim().length >= 2 && (
                  <div className="space-y-1 max-h-[calc(100vh-250px)] overflow-y-auto">
                    {loadingSearch ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : searchedUsers.length > 0 ? (
                      searchedUsers.map((userResult) => {
                        const isFollowing = followingStatuses[userResult.userId] || false;
                        const isProcessing = processingFollow === userResult.userId;
                        
                        return (
                          <div
                            key={userResult.userId}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                          >
                            <button
                              onClick={() => navigate(`/users/${userResult.userId}`)}
                              className="flex items-center gap-3 flex-1 min-w-0 text-left"
                            >
                              <Avatar
                                src={userResult.avatar || undefined}
                                alt={userResult.username}
                                size="md"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                                  {userResult.username}
                                </p>
                              </div>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFollow(userResult.userId);
                              }}
                              disabled={isProcessing}
                              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 ${
                                isFollowing
                                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md'
                              }`}
                            >
                              {isProcessing ? (
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              ) : isFollowing ? (
                                <span className="flex items-center gap-1.5">
                                  <FiUserX className="w-4 h-4" />
                                  <span>Đã theo dõi</span>
                                </span>
                              ) : (
                                <span className="flex items-center gap-1.5">
                                  <FiUserPlus className="w-4 h-4" />
                                  <span>Theo dõi</span>
                                </span>
                              )}
                            </button>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-sm text-gray-500">Không tìm thấy người dùng</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Empty State - chỉ hiển thị khi chưa search */}
                {sidebarSearchQuery.trim().length < 2 && (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-3">
                      <FiSearch className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500">Tìm kiếm người dùng để theo dõi</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Discuss</h1>
          <button
            onClick={() => navigate(ROUTES.CREATE_POST)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FiPlus className="w-5 h-5" />
            <span>Create</span>
          </button>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm bài viết..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setPage(0);
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-5 h-5" />
              </button>
            )}
          </div>
        </form>

        {/* Tags Filter */}
        {tags.length > 0 && (
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-700 mb-3 block">Tags:</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleTagFilter(null)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  !selectedTag
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tất cả
              </button>
              {tags.map((tag) => {
                const isSelected = selectedTag === tag.slug;
                return (
                  <button
                    key={tag.id}
                    onClick={() => handleTagFilter(isSelected ? null : tag.slug)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tag.name}
                  </button>
                );
              })}
            </div>
            
            {/* Clear Filters */}
            {(selectedTag || searchQuery || filterType !== 'all') && (
              <button
                onClick={clearFilters}
                className="mt-3 flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
              >
                <FiX className="w-4 h-4" />
                <span>Xóa bộ lọc</span>
              </button>
            )}
          </div>
        )}

        {/* Filter and Sorting Options */}
        <div className="flex items-center justify-between mb-6">
          {/* Filter: All / Following */}
          {user && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleFilterChange('all')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  filterType === 'all'
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <span>Tất cả</span>
              </button>
              <button
                onClick={() => handleFilterChange('following')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  filterType === 'following'
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <FiUsers className="w-5 h-5" />
                <span>Đang theo dõi</span>
              </button>
            </div>
          )}

          {/* Sorting Options */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleSortChange('votes')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                sortType === 'votes'
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <FiTrendingUp className="w-5 h-5" />
              <span>Most Votes</span>
            </button>
            <button
              onClick={() => handleSortChange('newest')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                sortType === 'newest'
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <FiStar className="w-5 h-5" />
              <span>Newest</span>
            </button>
          </div>
        </div>

        {/* Posts List */}
        {loading && posts.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">Đang tải...</div>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-500">Chưa có bài viết nào. Hãy tạo bài viết đầu tiên!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onVoteChange={fetchPosts} />
            ))}

            {/* Load More */}
            {hasMore && (
              <div className="text-center pt-4">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Đang tải...' : 'Tải thêm'}
                </button>
              </div>
            )}
          </div>
        )}
          </div>
        </div>
      </Container>
    </div>
  );
};

export default DiscussPage;

