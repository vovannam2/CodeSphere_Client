import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiAward } from 'react-icons/fi';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/utils/constants';
import Button from '@/components/Button';
import UserMenu from './UserMenu';
import NotificationDropdown from './NotificationDropdown';
import MessengerDropdown from './MessengerDropdown';

const Header = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  const navigationItems = [
    { path: ROUTES.PROBLEMS, label: 'Problems' },
    { path: ROUTES.DISCUSS, label: 'Discuss' },
    { path: ROUTES.CONTEST, label: 'Contest' },
  ];

  const isActive = (path: string) => {
    // Chỉ active khi pathname chính xác bằng path hoặc bắt đầu bằng path + '/'
    // Nhưng không active nếu pathname là '/' (home page)
    if (location.pathname === '/') return false;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to problems page with search query
      navigate(`${ROUTES.PROBLEMS}?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-14 relative">
          {/* Logo and App Name - Left */}
          <Link to={ROUTES.HOME} className="flex items-center space-x-3 flex-shrink-0 z-10 relative group">
            <div className="relative w-11 h-11">
              {/* Logo với gradient đẹp - Modern Code Sphere icon */}
              <svg
                className="w-11 h-11 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6"
                viewBox="0 0 44 44"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="headerLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="50%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                  <linearGradient id="headerLogoGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="50%" stopColor="#ec4899" />
                    <stop offset="100%" stopColor="#f59e0b" />
                  </linearGradient>
                </defs>
                {/* Background circle with gradient */}
                <circle cx="22" cy="22" r="20" fill="url(#headerLogoGradient)" opacity="0.15" />
                <circle cx="22" cy="22" r="18" fill="url(#headerLogoGradient)" opacity="0.08" />
                
                {/* Code brackets - styled */}
                <path
                  d="M13 15L9 19L13 23M31 15L35 19L31 23"
                  stroke="url(#headerLogoGradient)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Inner bracket accent */}
                <path
                  d="M14 15L10 19L14 23M30 15L34 19L30 23"
                  stroke="url(#headerLogoGradient2)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.6"
                />
                {/* Center elements */}
                <circle cx="22" cy="19" r="2.5" fill="url(#headerLogoGradient)" />
                <circle cx="18" cy="25" r="1" fill="url(#headerLogoGradient2)" opacity="0.8" />
                <circle cx="26" cy="25" r="1" fill="url(#headerLogoGradient2)" opacity="0.8" />
                {/* Decorative lines */}
                <path
                  d="M19 19L22 22L25 19"
                  stroke="url(#headerLogoGradient)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  opacity="0.5"
                />
              </svg>
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 via-cyan-500/20 to-purple-500/30 rounded-full blur-lg -z-10 group-hover:blur-xl group-hover:opacity-70 transition-all duration-300" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-purple-600 bg-clip-text text-transparent group-hover:from-blue-500 group-hover:via-cyan-500 group-hover:to-purple-500 transition-all duration-300">
              CodeSphere
            </span>
          </Link>

          {/* Navigation Links - Center (LeetCode style) */}
          {isAuthenticated && (
            <nav className="absolute left-1/2 transform -translate-x-1/2 flex items-center space-x-2 z-0">
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative px-5 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 whitespace-nowrap ${
                    isActive(item.path)
                      ? 'text-white bg-gradient-to-r from-blue-600 to-cyan-600 shadow-md shadow-blue-500/30 scale-105'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 hover:shadow-sm'
                  }`}
                >
                  {item.label}
                  {isActive(item.path) && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-white/10 to-cyan-600/0 rounded-lg" />
                  )}
                </Link>
              ))}
            </nav>
          )}

          {/* Right side - Search Bar and User menu */}
          <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
            {isAuthenticated ? (
              <>
                {/* Search Bar - LeetCode style */}
                <form onSubmit={handleSearch} className="hidden lg:block">
                  <div className="relative group">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search problems..."
                      className="w-72 px-4 py-2.5 pl-11 pr-4 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white focus:shadow-lg transition-all duration-200"
                    />
                    <svg
                      className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </form>

                {/* Leaderboard Icon */}
                <div className="relative group">
                  <Link
                    to={ROUTES.LEADERBOARD}
                    className={`block p-2 rounded-full transition-all duration-200 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isActive(ROUTES.LEADERBOARD)
                        ? 'text-blue-600 bg-blue-100'
                        : 'text-gray-600'
                    }`}
                  >
                    <FiAward className="w-6 h-6 transition-transform duration-200 group-hover:scale-110" />
                  </Link>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 px-2.5 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-lg">
                    Leaderboard
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-0 h-0 border-4 border-b-gray-900 border-l-transparent border-r-transparent border-t-transparent" />
                  </div>
                </div>
                <MessengerDropdown />
                <NotificationDropdown />
                <UserMenu />
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(ROUTES.LOGIN)}
                  className="px-4 py-2 text-gray-700 font-medium hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
                >
                  Đăng nhập
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate(ROUTES.REGISTER)}
                  className="px-5 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-lg shadow-md shadow-blue-500/30 hover:shadow-lg hover:shadow-blue-500/40 transition-all duration-200 transform hover:scale-105"
                >
                  Đăng ký
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
