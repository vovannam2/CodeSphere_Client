import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiBox, FiFileText, FiTag, FiPlus, FiRefreshCw, FiUsers, FiAward, FiActivity, FiArrowUpRight, FiClock, FiMessageSquare, FiGlobe } from 'react-icons/fi';
import Loading from '@/components/Loading';
import { adminApi } from '@/apis/admin.api';
import { ROUTES } from '@/utils/constants';
import type { DashboardStatsResponse } from '@/types/admin.types';
import AdminStatCard from '@/components/Admin/AdminStatCard';
import AdminPageHeader from '@/components/Admin/AdminPageHeader';

const RecentActivityItem = ({ text, time, icon, color = 'blue' }: any) => {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors">
      <div className={`p-2 rounded-lg ${colorMap[color as keyof typeof colorMap]}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900 truncate">{text}</p>
        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
          <FiClock size={12} />
          {time}
        </p>
      </div>
      <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
        <FiArrowUpRight size={18} />
      </button>
    </div>
  );
};

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await adminApi.getDashboardStats();
        setStats(data);
      } catch (e: any) {
        console.error(e);
        setError(e?.response?.data?.message || e?.message || 'Failed to fetch statistics');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="py-24 flex justify-center items-center">
        <Loading text="Loading your dashboard..." />
      </div>
    );
  }

  const recentActivities = [
    { text: 'New problem "Dynamic Programming Intro" created', time: '2 hours ago', icon: <FiFileText />, color: 'blue' },
    { text: 'User @john_doe promoted to Administrator', time: '5 hours ago', icon: <FiUsers />, color: 'purple' },
    { text: 'Weekly Contest #42 started', time: '1 day ago', icon: <FiAward />, color: 'green' },
    { text: 'System maintenance scheduled for Sunday', time: '2 days ago', icon: <FiActivity />, color: 'orange' },
  ];

  return (
    <div className="space-y-8 pb-12">
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 text-rose-700 border border-rose-100 flex items-center gap-3">
          <FiActivity className="flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <AdminPageHeader 
        title="Dashboard Overview" 
        subtitle="Welcome back, Admin. Here's what's happening today."
        actions={
          <>
            <button 
              onClick={() => window.location.reload()} 
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all font-semibold shadow-sm"
            >
              <FiRefreshCw size={18} />
              <span>Refresh</span>
            </button>
            <Link 
              to="/admin/problems/new" 
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold shadow-lg shadow-blue-600/20"
            >
              <FiPlus size={18} />
              <span>New Problem</span>
            </Link>
          </>
        }
      />

      {/* Main Stats */}
      <div className="grid grid-cols-1 tablet:grid-cols-2 small_desktop:grid-cols-4 desktop:grid-cols-4 gap-6">
        <AdminStatCard title="Total Users" value={stats?.totalUsers ?? 0} icon={<FiUsers size={20} />} color="blue" />
        <AdminStatCard title="Active Now" value={stats?.activeNow ?? 0} icon={<FiActivity size={20} />} color="green" />
        <AdminStatCard title="Blocked" value={stats?.blockedUsers ?? 0} icon={<FiUsers size={20} />} color="red" />
        <AdminStatCard title="Administrators" value={stats?.administrators ?? 0} icon={<FiUsers size={20} />} color="purple" />
      </div>

      <div className="grid grid-cols-1 tablet:grid-cols-1 small_desktop:grid-cols-3 desktop:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="small_desktop:col-span-2 desktop:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg font-bold text-slate-900">Recent Activity</h3>
            <button className="text-sm font-bold text-blue-600 hover:underline">View All</button>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden divide-y divide-slate-50">
            {recentActivities.map((activity, index) => (
              <RecentActivityItem key={index} {...activity} />
            ))}
          </div>
        </div>

        {/* Quick Insights & Actions */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 px-2">Performance</h3>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                  <span className="text-slate-500">Active Users</span>
                  <span className="text-blue-600">{stats?.activeUsers ?? 0}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '65%' }} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                  <span className="text-slate-500">New Users (Month)</span>
                  <span className="text-indigo-600">{stats?.newUsersThisMonth ?? 0}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: '40%' }} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                  <span className="text-slate-500">Daily Submissions</span>
                  <span className="text-emerald-600">{stats?.submissionsToday ?? 0}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '80%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 px-2">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/admin/categories" className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-all group">
                <div className="p-2 rounded-lg bg-slate-50 text-slate-500 group-hover:bg-white group-hover:text-blue-600 transition-colors">
                  <FiTag size={20} />
                </div>
                <span className="text-xs font-bold text-slate-600 group-hover:text-blue-700 uppercase tracking-wider">Tags</span>
              </Link>
              <Link to="/admin/languages" className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all group">
                <div className="p-2 rounded-lg bg-slate-50 text-slate-500 group-hover:bg-white group-hover:text-indigo-600 transition-colors">
                  <FiGlobe size={20} />
                </div>
                <span className="text-xs font-bold text-slate-600 group-hover:text-indigo-700 uppercase tracking-wider">Languages</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
