import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Loading from '@/components/Loading';
import toast from 'react-hot-toast';
import { adminApi } from '@/apis/admin.api';
import { problemApi } from '@/apis/problem.api';
import { FiEdit2, FiTrash2, FiPlus, FiSearch, FiCode, FiDatabase, FiCheckCircle, FiX, FiInfo } from 'react-icons/fi';
import AdminPageHeader from '@/components/Admin/AdminPageHeader';
import Tooltip from '@/components/Layout/Tooltip';

const AdminTestcasesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const problemIdParam = searchParams.get('problemId');

  const [inputProblemId, setInputProblemId] = useState<string>(problemIdParam || '');
  const [selectedProblem, setSelectedProblem] = useState<any | null>(null);
  const [testcases, setTestcases] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Create form state
  const [newInput, setNewInput] = useState('');
  const [newExpected, setNewExpected] = useState('');
  const [newIsSample, setNewIsSample] = useState(false);
  const [newIsHidden, setNewIsHidden] = useState(false);
  const [newWeight, setNewWeight] = useState<number>(1);
  const [creating, setCreating] = useState(false);
  const [loadingProblem, setLoadingProblem] = useState(false);

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingTc, setEditingTc] = useState<any | null>(null);
  const [updating, setUpdating] = useState(false);

  const handleLoad = useCallback(async (pid: string) => {
    if (!pid) return;
    setLoadingProblem(true);
    try {
      let problem;
      try {
        problem = await adminApi.getProblem(Number(pid));
      } catch (err: any) {
        if (err?.response?.status === 404) {
          problem = await problemApi.getProblemDetail(Number(pid));
        } else {
          throw err;
        }
      }
      setSelectedProblem(problem);
      
      const tcs = await adminApi.getTestCasesByProblem(problem.id);
      setTestcases(tcs || []);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.response?.data?.message || 'Problem not found');
      setSelectedProblem(null);
      setTestcases([]);
    } finally {
      setLoadingProblem(false);
    }
  }, []);

  useEffect(() => {
    if (problemIdParam) {
      handleLoad(problemIdParam);
    }
  }, [problemIdParam, handleLoad]);

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputProblemId) {
      setSearchParams({ problemId: inputProblemId });
    }
  };

  const handleCreate = async () => {
    if (!selectedProblem) {
      toast.error('Select a problem first');
      return;
    }
    if (!newInput.trim() || !newExpected.trim()) {
      toast.error('Input and Expected Output are required');
      return;
    }
    setCreating(true);
    try {
      await adminApi.createTestCase({
        problemId: selectedProblem.id,
        input: newInput,
        expectedOutput: newExpected,
        isSample: newIsSample,
        isHidden: newIsHidden,
        weight: newWeight,
      });
      toast.success('Testcase created');
      setNewInput(''); setNewExpected(''); setNewIsSample(false); setNewIsHidden(false); setNewWeight(1);
      const tcs = await adminApi.getTestCasesByProblem(selectedProblem.id);
      setTestcases(tcs || []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this testcase?')) return;
    try {
      await adminApi.deleteTestCase(id);
      toast.success('Deleted');
      setTestcases(prev => prev.filter(tc => tc.id !== id));
    } catch (e: any) {
      toast.error('Delete failed');
    }
  };

  const openEditModal = (tc: any) => {
    setEditingTc({ ...tc });
    setEditModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingTc) return;
    setUpdating(true);
    try {
      await adminApi.updateTestCase(editingTc.id, {
        input: editingTc.input,
        expectedOutput: editingTc.expectedOutput,
        isSample: editingTc.isSample,
        isHidden: editingTc.isHidden,
        weight: editingTc.weight,
      });
      toast.success('Updated');
      setEditModalOpen(false);
      setTestcases(prev => prev.map(tc => tc.id === editingTc.id ? editingTc : tc));
    } catch (err: any) {
      toast.error('Update failed');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <AdminPageHeader 
        title="Testcases Management" 
        subtitle={
          selectedProblem ? (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span>Managing testcases for:</span>
              <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg font-bold border border-blue-100 shadow-sm animate-in fade-in zoom-in duration-300">
                {selectedProblem.title}
              </span>
            </div>
          ) : (
            "Manage input and output testcases for coding problems."
          )
        }
        actions={
          <form onSubmit={onSearchSubmit} className="flex items-center gap-2">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="number"
                placeholder="Enter Problem ID..."
                value={inputProblemId}
                onChange={(e) => setInputProblemId(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 w-48"
              />
            </div>
            <button type="submit" disabled={loadingProblem} className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">
              {loadingProblem ? 'Loading...' : 'Load'}
            </button>
          </form>
        }
      />

      <div className="grid grid-cols-1 desktop:grid-cols-12 gap-6">
        {/* Creation Form */}
        <div className="desktop:col-span-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-blue-600 mb-4 flex items-center gap-2">
              <FiPlus className="text-blue-500" />
              Create New Testcase
            </h3>
            
            {!selectedProblem ? (
              <div className="p-4 bg-gray-50 border border-dashed border-gray-200 rounded-lg text-center text-gray-500 text-sm">
                <FiInfo className="mx-auto mb-2 opacity-50" size={24} />
                Please enter a Problem ID to start adding testcases.
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Input</label>
                  <textarea
                    value={newInput}
                    onChange={(e) => setNewInput(e.target.value)}
                    placeholder="Provide test input..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Expected Output</label>
                  <textarea
                    value={newExpected}
                    onChange={(e) => setNewExpected(e.target.value)}
                    placeholder="Provide expected output..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
                  />
                </div>
                <div className="flex flex-wrap gap-4 items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={newIsSample} onChange={(e) => setNewIsSample(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm text-gray-700">Sample</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={newIsHidden} onChange={(e) => setNewIsHidden(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm text-gray-700">Hidden</span>
                  </label>
                  <div className="flex items-center gap-2 ml-auto">
                    <span className="text-sm text-gray-700">Weight:</span>
                    <input type="number" value={newWeight} min={1} onChange={(e) => setNewWeight(Number(e.target.value) || 1)} className="w-16 px-2 py-1 border border-gray-300 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <button
                  onClick={handleCreate}
                  disabled={creating}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 w-fit ml-auto"
                >
                  {creating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiPlus />}
                  Add Testcase
                </button>
              </div>
            )}
          </div>
        </div>

        {/* List Table */}
        <div className="desktop:col-span-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
              <h3 className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">Testcases List</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="p-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">ID</th>
                    <th className="p-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Input</th>
                    <th className="p-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Expected Output</th>
                    <th className="p-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">Sample</th>
                    <th className="p-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">Hidden</th>
                    <th className="p-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">Weight</th>
                    <th className="p-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {testcases.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-12 text-center text-slate-400">
                        <div className="flex flex-col items-center gap-2 opacity-30">
                          <FiDatabase size={40} />
                          <p className="font-medium text-sm">No testcases for this problem</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    testcases.map((tc) => (
                      <tr key={tc.id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 text-sm font-bold text-slate-400">#{tc.id}</td>
                        <td className="p-4">
                          <code className="text-[12px] font-mono text-slate-600 block max-w-[150px] truncate bg-slate-50 px-2 py-1 rounded" title={tc.input}>
                            {tc.input?.replace(/\n/g, '↵') || 'empty'}
                          </code>
                        </td>
                        <td className="p-4">
                          <code className="text-[12px] font-mono text-slate-600 block max-w-[150px] truncate bg-emerald-50/50 px-2 py-1 rounded" title={tc.expectedOutput}>
                            {tc.expectedOutput?.replace(/\n/g, '↵') || 'empty'}
                          </code>
                        </td>
                        <td className="p-4 text-center">
                          {tc.isSample ? (
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-full border border-blue-100 uppercase tracking-tighter">Yes</span>
                          ) : (
                            <span className="text-slate-300">No</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {tc.isHidden ? (
                            <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-full border border-amber-100 uppercase tracking-tighter">Yes</span>
                          ) : (
                            <span className="text-slate-300">No</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <span className="text-sm font-bold text-slate-700">{tc.weight || 1}</span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Tooltip text="Edit Testcase" position="top">
                              <button onClick={() => openEditModal(tc)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                                <FiEdit2 size={16} />
                              </button>
                            </Tooltip>
                            <Tooltip text="Delete Testcase" position="top">
                              <button onClick={() => handleDelete(tc.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
                                <FiTrash2 size={16} />
                              </button>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editModalOpen && editingTc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-blue-600">Edit Testcase #{editingTc.id}</h3>
              <button onClick={() => setEditModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-900 transition-colors">
                <FiX size={20} />
              </button>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Input Data</label>
                <textarea
                  value={editingTc.input}
                  onChange={(e) => setEditingTc({...editingTc, input: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[300px]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Expected Output</label>
                <textarea
                  value={editingTc.expectedOutput}
                  onChange={(e) => setEditingTc({...editingTc, expectedOutput: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[300px]"
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-wrap gap-6 items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={editingTc.isSample} onChange={(e) => setEditingTc({...editingTc, isSample: e.target.checked})} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm text-gray-700">Sample Testcase</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={editingTc.isHidden} onChange={(e) => setEditingTc({...editingTc, isHidden: e.target.checked})} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm text-gray-700">Hidden Testcase</span>
              </label>
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm text-gray-700">Weight:</span>
                <input type="number" value={editingTc.weight} min={1} onChange={(e) => setEditingTc({...editingTc, weight: Number(e.target.value) || 1})} className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div className="p-6 flex justify-end gap-3 border-t border-gray-200">
              <button onClick={() => setEditModalOpen(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={updating}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {updating && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTestcasesPage;
