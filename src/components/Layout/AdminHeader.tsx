// ...existing code...
import { Link } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';
import UserMenu from './UserMenu';
import AdminUserMenu from './AdminUserMenu';
import Avatar from '@/components/Avatar';

const AdminHeader = () => {
  return (
    <header className="h-14 border-b bg-white flex items-center px-4">
      <div className="flex items-center gap-4 w-full">
        {/* Small brand / breadcrumb - dùng lại logo + chữ gradient từ Header.tsx */}
        <div className="flex items-center gap-3 min-w-[220px]">
          <Link to="/admin" className="flex items-center gap-3 flex-shrink-0 group">
            <div className="relative w-9 h-9">
              <svg
                className="w-9 h-9 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6"
                viewBox="0 0 44 44"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="adminLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="50%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                  <linearGradient id="adminLogoGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="50%" stopColor="#ec4899" />
                    <stop offset="100%" stopColor="#f59e0b" />
                  </linearGradient>
                </defs>
                <circle cx="22" cy="22" r="20" fill="url(#adminLogoGrad)" opacity="0.15" />
                <circle cx="22" cy="22" r="18" fill="url(#adminLogoGrad)" opacity="0.08" />
                <path
                  d="M13 15L9 19L13 23M31 15L35 19L31 23"
                  stroke="url(#adminLogoGrad)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M14 15L10 19L14 23M30 15L34 19L30 23"
                  stroke="url(#adminLogoGrad2)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.6"
                />
                <circle cx="22" cy="19" r="2.5" fill="url(#adminLogoGrad)" />
                <circle cx="18" cy="25" r="1" fill="url(#adminLogoGrad2)" opacity="0.8" />
                <circle cx="26" cy="25" r="1" fill="url(#adminLogoGrad2)" opacity="0.8" />
                <path
                  d="M19 19L22 22L25 19"
                  stroke="url(#adminLogoGrad)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  opacity="0.5"
                />
              </svg>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 via-cyan-500/20 to-purple-500/30 rounded-full blur-lg -z-10 group-hover:blur-xl group-hover:opacity-70 transition-all duration-300" />
            </div>

            <div className="hidden sm:block">
              <div className="text-sm font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-cyan-600 to-purple-600">
                Admin
              </div>
              <div className="text-xs text-gray-500">CodeSphere</div>
            </div>
          </Link>
        </div>

        {/* Compact search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
              <FiSearch />
            </span>
            <input
              className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tìm problem, user, category..."
            />
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3 ml-auto">
          <div className="hidden sm:flex items-center gap-3">
            <button className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-sm">Quick action</button>
            <div className="text-sm text-gray-600 hidden md:block">Admin</div>
          </div>
          <AdminUserMenu />
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
// ...existing code...