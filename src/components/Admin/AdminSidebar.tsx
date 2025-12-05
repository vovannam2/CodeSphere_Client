// ...existing code...
import { NavLink } from 'react-router-dom';
import { FiGrid, FiFileText, FiTag, FiHash, FiClipboard, FiUsers, FiGlobe, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useState } from 'react';

const items = [
  { to: '/admin', label: 'Dashboard', icon: <FiGrid /> },
  { to: '/admin/users', label: 'Users', icon: <FiUsers /> },
  { to: '/admin/languages', label: 'Languages', icon: <FiGlobe /> },
  { to: '/admin/problems', label: 'Problems', icon: <FiFileText /> },
  { to: '/admin/testcases', label: 'Testcases', icon: <FiClipboard /> },
  { to: '/admin/categories', label: 'Categories', icon: <FiHash /> },
  { to: '/admin/tags', label: 'Tags', icon: <FiTag /> },
];

const AdminSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`flex flex-col bg-white border-r transition-all duration-200 ${collapsed ? 'w-20' : 'w-64'}`}>
      <div className="flex items-center justify-between px-4 h-16 border-b">
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 flex-shrink-0">
            <svg
              className="w-9 h-9 transition-all duration-300 group-hover:scale-105"
              viewBox="0 0 44 44"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="sidebarLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="50%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
                <linearGradient id="sidebarLogoGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="50%" stopColor="#ec4899" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
              </defs>
              <circle cx="22" cy="22" r="20" fill="url(#sidebarLogoGrad)" opacity="0.12" />
              <path
                d="M13 15L9 19L13 23M31 15L35 19L31 23"
                stroke="url(#sidebarLogoGrad)"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M14 15L10 19L14 23M30 15L34 19L30 23"
                stroke="url(#sidebarLogoGrad2)"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.7"
              />
              <circle cx="22" cy="19" r="2.2" fill="url(#sidebarLogoGrad)" />
            </svg>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 via-cyan-500/20 to-purple-500/30 rounded-full blur-md -z-10 transition-all" />
          </div>

          {!collapsed && (
            <div>
              <div className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-cyan-600 to-purple-600">
                CodeSphere Admin
              </div>
              <div className="text-xs text-gray-500">Management</div>
            </div>
          )}
        </div>

        <button
          aria-label="Toggle sidebar"
          onClick={() => setCollapsed((s) => !s)}
          className="p-2 rounded hover:bg-gray-100"
        >
          {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
        </button>
      </div>

      <nav className="flex-1 px-1 py-4 space-y-1">
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors ${
                isActive ? 'bg-blue-50 text-blue-600 font-medium' : ''
              }`
            }
          >
            <div className="text-lg">{it.icon}</div>
            {!collapsed && <span>{it.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t">
        {!collapsed ? (
          <div className="text-xs text-gray-500">v1.0 · Admin</div>
        ) : (
          <div className="text-xs text-gray-500 text-center">v1</div>
        )}
      </div>
    </aside>
  );
};

export default AdminSidebar;
// ...existing code...