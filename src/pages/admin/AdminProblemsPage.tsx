// ...existing code...
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Container from '@/components/Layout/Container';
import Loading from '@/components/Loading';
import { adminApi } from '@/apis/admin.api';
import { problemApi } from '@/apis/problem.api';
import toast from 'react-hot-toast';

const AdminProblemsPage = () => {
  const [loading, setLoading] = useState(true);
  const [problems, setProblems] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [size] = useState(20);
  const navigate = useNavigate();

  const fetchList = async () => {
    setLoading(true);
    try {
      // prefer adminApi.getProblems; fallback if not available
      const data = await adminApi.getProblems(page, size);
      setProblems(data?.content ?? data?.content ?? data);
    } catch (e) {
      console.error(e);
      toast.error('Lấy danh sách problems thất bại');
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
    if (!confirm('Xóa problem này? Hành động không thể hoàn tác.')) return;
    try {
      await adminApi.deleteProblem(id);
      toast.success('Đã xóa');
      setProblems((s) => s.filter(p => p.id !== id));
    } catch (e: any) {
      console.error(e);
      toast.error(e?.response?.data?.message || 'Xóa thất bại');
    }
  };

  if (loading) return <Container><div className="py-12"><Loading /></div></Container>;

  return (
    <Container>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Manage Problems</h1>
        <div>
          <button onClick={() => navigate('/admin/problems/new')} className="px-3 py-2 bg-blue-600 text-white rounded">New Problem</button>
        </div>
      </div>

      <div className="bg-white rounded shadow overflow-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50 text-sm text-gray-600">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Code</th>
              <th className="p-3 text-left">Title</th>
              <th className="p-3 text-left">Level</th>
              <th className="p-3 text-left">Categories</th>
              <th className="p-3 text-left">Languages</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {problems.map((p:any) => (
              <tr key={p.id} className="border-t">
                <td className="p-3 text-sm">{p.id}</td>
                <td className="p-3 text-sm">{p.code}</td>
                <td className="p-3 text-sm">{p.title}</td>
                <td className="p-3 text-sm">{p.level}</td>
                <td className="p-3 text-sm">{(p.categories||[]).map((c:any)=>c.name).join(', ')}</td>
                <td className="p-3 text-sm">{(p.languages||[]).map((l:any)=>l.name).join(', ')}</td>
                <td className="p-3 text-sm">
                  <Link to={`/admin/problems/${p.id}/edit`} className="mr-2 px-2 py-1 bg-yellow-50 text-yellow-700 rounded">Edit</Link>
                  <button onClick={() => handleDelete(p.id)} className="px-2 py-1 bg-red-50 text-red-700 rounded">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* simple pagination */}
      <div className="mt-4 flex justify-between items-center">
        <button disabled={page===0} onClick={()=>setPage(s=>Math.max(0,s-1))} className="px-3 py-1 bg-gray-100 rounded">Previous</button>
        <div>Page {page+1}</div>
        <button onClick={()=>setPage(s=>s+1)} className="px-3 py-1 bg-gray-100 rounded">Next</button>
      </div>
    </Container>
  );
};

export default AdminProblemsPage;
// ...existing code...