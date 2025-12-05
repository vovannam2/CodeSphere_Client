// ...existing code...
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiBox, FiFileText, FiTag, FiPlus, FiRefreshCw } from 'react-icons/fi';
import Container from '@/components/Layout/Container';
import Loading from '@/components/Loading';
import { problemApi } from '@/apis/problem.api';
import { categoryApi } from '@/apis/category.api';
import apiClient from '@/apis/apiClient';
import { ROUTES } from '@/utils/constants';

const StatCard = ({ title, count, to, icon, color = 'blue' }: any) => (
  <Link
    to={to}
    className={`group block p-5 rounded-xl shadow-sm hover:shadow-md transition bg-white border border-gray-100`}
  >
    <div className="flex items-center justify-between">
      <div>
        <div className="text-xs text-gray-400">{title}</div>
        <div className="mt-2 text-3xl font-bold text-gray-900">{count ?? '-'}</div>
        <div className="mt-1 text-sm text-gray-500">Manage {title.toLowerCase()}</div>
      </div>
      <div className={`flex items-center justify-center w-14 h-14 rounded-lg bg-${color}-50 text-${color}-600 group-hover:scale-105 transition`}>
        <div className="text-2xl">{icon}</div>
      </div>
    </div>
  </Link>
);

const RecentItem = ({ text, time }: any) => (
  <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded">
    <div className="w-2.5 h-2.5 bg-blue-500 rounded-full mt-2" />
    <div className="flex-1">
      <div className="text-sm text-gray-800">{text}</div>
      <div className="text-xs text-gray-400 mt-1">{time}</div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [problemsCount, setProblemsCount] = useState<number | null>(null);
  const [categoriesCount, setCategoriesCount] = useState<number | null>(null);
  const [languagesCount, setLanguagesCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // animated display values
  const [pDisplay, setPDisplay] = useState<number>(0);
  const [cDisplay, setCDisplay] = useState<number>(0);
  const [lDisplay, setLDisplay] = useState<number>(0);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const problemsRes = await problemApi.getProblems({
          page: 0,
          size: 1,
          sortBy: 'createdAt',
          sortDir: 'DESC',
        });
        const pCount = (problemsRes as any)?.totalElements ?? (problemsRes as any)?.total ?? null;
        setProblemsCount(typeof pCount === 'number' ? pCount : null);

        const cats = await categoryApi.getAllCategories();
        const cCount = Array.isArray(cats) ? cats.length : (cats as any)?.totalElements ?? null;
        setCategoriesCount(typeof cCount === 'number' ? cCount : null);

        try {
          const langRes = await apiClient.get('/languages');
          const langData = langRes?.data?.data ?? langRes?.data ?? null;
          const lCount = Array.isArray(langData) ? langData.length : (langData as any)?.totalElements ?? null;
          setLanguagesCount(typeof lCount === 'number' ? lCount : null);
        } catch {
          setLanguagesCount(null);
        }
      } catch (e: any) {
        console.error(e);
        setError(e?.response?.data?.message || e?.message || 'Lấy thống kê thất bại');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // animate numbers when counts change
  useEffect(() => {
    const animate = (target: number | null, setter: (v: number) => void) => {
      if (target == null) return setter(NaN);
      const duration = 600;
      const steps = 30;
      const stepTime = duration / steps;
      let current = 0;
      const inc = Math.max(1, Math.round(target / steps));
      const id = setInterval(() => {
        current += inc;
        if (current >= target) {
          setter(target);
          clearInterval(id);
        } else {
          setter(current);
        }
      }, stepTime);
    };
    animate(problemsCount, setPDisplay);
    animate(categoriesCount, setCDisplay);
    animate(languagesCount, setLDisplay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problemsCount, categoriesCount, languagesCount]);

  if (loading) {
    return (
      <Container>
        <div className="py-12"><Loading text="Đang tải thống kê..." /></div>
      </Container>
    );
  }

  const adminProblemsRoute = ROUTES.ADMIN_PROBLEMS ?? '/admin/problems';
  const adminCategoriesRoute = ROUTES.ADMIN_CATEGORIES ?? '/admin/categories';
  const adminLanguagesRoute = ROUTES.ADMIN_LANGUAGES ?? '/admin/languages';

  // sample recent items (replace with real API later)
  const recent = [
    { text: 'Created problem "Two Sum"', time: '2 hours ago' },
    { text: 'Updated category "Graph"', time: '1 day ago' },
    { text: 'Added language "Rust 1.70"', time: '3 days ago' },
  ];

  return (
    <Container>
      {error && (
        <div className="mb-4 p-3 rounded bg-red-50 text-red-700 border border-red-100">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-semibold">Admin dashboard</h1>
        <div className="flex items-center gap-2">
          <Link to="/admin/problems/new" className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded">
            <FiPlus /> New problem
          </Link>
          <button onClick={() => window.location.reload()} className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded">
            <FiRefreshCw /> Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Problems" count={Number.isFinite(pDisplay) ? pDisplay : '-'} to={adminProblemsRoute} icon={<FiFileText />} color="indigo" />
        <StatCard title="Categories" count={Number.isFinite(cDisplay) ? cDisplay : '-'} to={adminCategoriesRoute} icon={<FiTag />} color="green" />
        <StatCard title="Languages" count={Number.isFinite(lDisplay) ? lDisplay : '-'} to={adminLanguagesRoute} icon={<FiBox />} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2 bg-white rounded-xl p-4 shadow">
          <h3 className="text-lg font-semibold mb-3">Recent activity</h3>
          <div className="divide-y">
            {recent.length === 0 ? (
              <div className="p-4 text-sm text-gray-500">No recent activity</div>
            ) : (
              recent.map((r, i) => <RecentItem key={i} text={r.text} time={r.time} />)
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow">
          <h3 className="text-lg font-semibold mb-3">Quick actions</h3>
          <div className="flex flex-col gap-3">
            <Link to="/admin/problems/new" className="px-3 py-2 bg-blue-50 text-blue-700 rounded">Create problem</Link>
            <Link to="/admin/categories" className="px-3 py-2 bg-green-50 text-green-700 rounded">Manage categories</Link>
            <Link to="/admin/languages" className="px-3 py-2 bg-purple-50 text-purple-700 rounded">Manage languages</Link>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default AdminDashboard;
// ...existing code...