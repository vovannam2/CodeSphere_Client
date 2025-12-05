// ...existing code...
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Avatar from '@/components/Avatar';
import { ROUTES } from '@/utils/constants';
import { FiSettings, FiUsers, FiLogOut, FiHome } from 'react-icons/fi';

const AdminUserMenu = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate(ROUTES.HOME);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen((s) => !s)}
        className="flex items-center space-x-2 focus:outline-none rounded-lg p-1"
        aria-label="Admin menu"
      >
        <Avatar user={user} size="sm" />
        <span className="hidden md:block text-sm font-medium text-gray-700">{user.username}</span>
        <svg className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none">
          <path stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-200">
          <Link to="/admin" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setIsOpen(false)}>
            <FiHome /> Dashboard
          </Link>
          <Link to="/admin/settings" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setIsOpen(false)}>
            <FiSettings /> Settings
          </Link>
          <hr className="my-1" />
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
          >
            <FiLogOut /> Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminUserMenu;
// ...existing code...