import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Loading from '@/components/Loading';
import { adminApi } from '@/apis/admin.api';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiFilter, FiFileText, FiActivity, FiCpu, FiClock, FiX, FiDatabase } from 'react-icons/fi';
import AdminStatCard from '@/components/Admin/AdminStatCard';
import AdminPageHeader from '@/components/Admin/AdminPageHeader';
import Tooltip from '@/components/Layout/Tooltip';

const AdminProblemsPage = () => {
  const [loading, setLoading] = useState(true);
  const [problems, setProblems] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [size] = useState(20);
  const navigate = useNavigate();

  const fetchList = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getProblems(page, size);
      setProblems(data?.content ?? data);
    } catch (e: any) {
      console.error(e);
      toast.error('Failed to fetch problems list');
      setProblems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this problem? This action is permanent.')) return;
    try {
      await adminApi.deleteProblem(id);
      toast.success('Problem deleted successfully');
      setProblems((s) => s.filter(p => p.id !== id));
    } catch (e: any) {
      console.error(e);
      toast.error(e?.response?.data?.message || 'Delete failed');
    }
  };

  const getDifficultyColor = (level: string) => {
    const colors = {
      EASY: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      MEDIUM: 'text-amber-600 bg-amber-50 border-amber-100',
      HARD: 'text-rose-600 bg-rose-50 border-rose-100',
    };
    return colors[level as keyof typeof colors] || 'text-slate-600 bg-slate-50 border-slate-100';
  };

  if (loading && problems.length === 0) return <div className="py-24 flex justify-center items-center"><Loading /></div>;

  return (
    <div className="space-y-6 pb-12">
      <AdminPageHeader 
        title="Problems Management" 
        subtitle="Create and manage coding challenges for your users."
        actions={
          <button 
            onClick={() => navigate('/admin/problems/new')} 
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold shadow-lg shadow-blue-600/20"
          >
            <FiPlus size={18} />
            <span>New Problem</span>
          </button>
        }
      />

      {/* Stats row */}
      <div className="grid grid-cols-1 tablet:grid-cols-2 small_desktop:grid-cols-4 desktop:grid-cols-4 gap-6">
        <AdminStatCard title="Total Problems" value={problems.length + 45} icon={<FiFileText size={20} />} color="blue" />
        <AdminStatCard title="Submissions" value="1.2k" icon={<FiActivity size={20} />} color="indigo" trend={{ value: 5, isUp: true }} />
        <AdminStatCard title="Avg. Success" value="68%" icon={<FiCpu size={20} />} color="green" />
        <AdminStatCard title="Avg. Time" value="1.5s" icon={<FiClock size={20} />} color="orange" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-50 bg-slate-50/30 flex flex-col tablet:flex-row gap-4 items-center justify-between">
          <div className="relative w-full max-w-md">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title or code..."
              className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all text-sm font-medium">
              <FiFilter /> Filter
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="p-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Problem</th>
                <th className="p-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Level</th>
                <th className="p-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Categories</th>
                <th className="p-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {problems.map((p:any) => (
                <tr key={p.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{p.title}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded uppercase">{p.code}</span>
                      </div>
                      <div className="text-[12px] text-slate-500 mt-0.5 truncate max-w-md">
                        {(p.languages||[]).map((l:any)=>l.name).join(', ') || 'All languages'}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getDifficultyColor(p.level)}`}>
                      {p.level}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {(p.categories||[]).map((c:any)=>(
                        <span key={c.id} className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {c.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <Tooltip text="Manage Testcases" position="top">
                        <Link 
                          to={`/admin/testcases?problemId=${p.id}`} 
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        >
                          <FiDatabase size={18} />
                        </Link>
                      </Tooltip>
                      <Tooltip text="Edit Problem" position="top">
                        <Link 
                          to={`/admin/problems/${p.id}/edit`} 
                          className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                        >
                          <FiEdit2 size={18} />
                        </Link>
                      </Tooltip>
                      <Tooltip text="Delete Problem" position="top">
                        <button 
                          onClick={() => handleDelete(p.id)} 
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </Tooltip>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 bg-slate-50/30 border-t border-slate-50 flex items-center justify-between">
          <button disabled={page===0} onClick={()=>setPage(s=>Math.max(0,s-1))} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold disabled:opacity-50 hover:bg-slate-50 transition-all shadow-sm">
            Previous
          </button>
          <div className="text-sm font-bold text-slate-600">Page {page+1}</div>
          <button onClick={()=>setPage(s=>s+1)} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminProblemsPage;
