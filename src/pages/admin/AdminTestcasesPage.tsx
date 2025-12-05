import { useEffect, useState } from 'react';
import Container from '@/components/Layout/Container';
import Loading from '@/components/Loading';
import toast from 'react-hot-toast';
import { adminApi } from '@/apis/admin.api';
import { problemApi } from '@/apis/problem.api';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

const AdminTestcasesPage = () => {
  const [inputProblemId, setInputProblemId] = useState<number | ''>('');
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

  const handleLoad = async () => {
    if (!inputProblemId) {
      toast.error('Vui lòng nhập Problem ID');
      return;
    }
    setLoadingProblem(true);
    setSelectedProblem(null);
    setTestcases([]);
    try {
      let problem;
      try {
        problem = await adminApi.getProblem(Number(inputProblemId));
      } catch (err: any) {
        if (err?.response?.status === 404) {
          problem = await problemApi.getProblemDetail(Number(inputProblemId));
        } else {
          throw err;
        }
      }
      setSelectedProblem(problem);
      toast.success(`Selected problem: ${problem.code} — ${problem.title}`);
      try {
        const tcs = await adminApi.getTestCasesByProblem(problem.id);
        setTestcases(tcs || []);
      } catch (e: any) {
        console.warn('Could not load admin testcases:', e);
        setTestcases([]);
      }
    } catch (e: any) {
      console.error(e);
      const msg = e?.response?.data?.message || 'Không tìm thấy problem hoặc lỗi khi gọi API';
      toast.error(msg);
      setSelectedProblem(null);
      setTestcases([]);
    } finally {
      setLoadingProblem(false);
    }
  };

  const handleCreate = async () => {
    if (!selectedProblem) {
      toast.error('Vui lòng Load và chọn problem trước khi tạo testcase');
      return;
    }
    if (!newInput.trim() || !newExpected.trim()) {
      toast.error('Input và Expected Output là bắt buộc');
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
      toast.success('Tạo testcase thành công');
      setNewInput(''); setNewExpected(''); setNewIsSample(false); setNewIsHidden(false); setNewWeight(1);
      try {
        const tcs = await adminApi.getTestCasesByProblem(selectedProblem.id);
        setTestcases(tcs || []);
      } catch {
        // ignore
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Tạo testcase thất bại');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Xóa testcase này?')) return;
    try {
      await adminApi.deleteTestCase(id);
      toast.success('Đã xóa');
      if (selectedProblem) {
        const tcs = await adminApi.getTestCasesByProblem(selectedProblem.id);
        setTestcases(tcs || []);
      }
    } catch (e: any) {
      console.error(e);
      const status = e?.response?.status;
      const msg = e?.response?.data?.message || 'Xóa thất bại';
      if (status === 409) {
        toast.error(msg);
      } else if (status === 404) {
        toast.error('Testcase không tồn tại');
      } else {
        toast.error(msg);
      }
    }
  };

  const openEditModal = (tc: any) => {
    setEditingTc({
      id: tc.id,
      input: tc.input ?? '',
      expectedOutput: tc.expectedOutput ?? '',
      isSample: !!tc.isSample,
      isHidden: !!tc.isHidden,
      weight: tc.weight ?? 1,
    });
    setEditModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingTc) return;
    if (!editingTc.input.trim() || !editingTc.expectedOutput.trim()) {
      toast.error('Input và Expected Output là bắt buộc');
      return;
    }
    setUpdating(true);
    try {
      await adminApi.updateTestCase(editingTc.id, {
        input: editingTc.input,
        expectedOutput: editingTc.expectedOutput,
        isSample: editingTc.isSample,
        isHidden: editingTc.isHidden,
        weight: editingTc.weight,
      });
      toast.success('Cập nhật testcase thành công');
      setEditModalOpen(false);
      setEditingTc(null);
      if (selectedProblem) {
        const tcs = await adminApi.getTestCasesByProblem(selectedProblem.id);
        setTestcases(tcs || []);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Cập nhật thất bại');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Container>
      {/* Edit Modal */}
      {editModalOpen && editingTc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded shadow-lg w-full max-w-2xl p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">Edit Testcase #{editingTc.id}</h3>
              <button onClick={() => { setEditModalOpen(false); setEditingTc(null); }} className="text-gray-500 hover:text-gray-800">Close</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Input</label>
                <textarea value={editingTc.input} onChange={(e)=>setEditingTc({...editingTc, input: e.target.value})} rows={8} className="w-full border rounded p-2 font-mono" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Expected Output</label>
                <textarea value={editingTc.expectedOutput} onChange={(e)=>setEditingTc({...editingTc, expectedOutput: e.target.value})} rows={8} className="w-full border rounded p-2 font-mono" />
              </div>
            </div>
            <div className="flex items-center gap-4 mt-3">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={editingTc.isSample} onChange={(e)=>setEditingTc({...editingTc, isSample: e.target.checked})} />
                <span className="text-sm">isSample</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={editingTc.isHidden} onChange={(e)=>setEditingTc({...editingTc, isHidden: e.target.checked})} />
                <span className="text-sm">isHidden</span>
              </label>
              <label className="flex items-center gap-2">
                <span className="text-sm">Weight</span>
                <input type="number" value={editingTc.weight} min={1} onChange={(e)=>setEditingTc({...editingTc, weight: Number(e.target.value)||1})} className="border p-1 rounded w-20" />
              </label>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={()=>{ setEditModalOpen(false); setEditingTc(null); }} className="px-3 py-1 border rounded">Cancel</button>
              <button onClick={handleUpdate} disabled={updating} className="px-4 py-2 bg-blue-600 text-white rounded">{updating ? 'Updating...' : 'Update'}</button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-4 flex gap-2 items-center">
        <input
          type="number"
          placeholder="Problem ID"
          value={inputProblemId ?? ''}
          onChange={(e) => setInputProblemId(e.target.value === '' ? '' : Number(e.target.value))}
          className="border p-2 rounded w-36"
        />
        <button onClick={handleLoad} disabled={loadingProblem} className="px-3 py-2 bg-blue-600 text-white rounded">
          {loadingProblem ? 'Loading...' : 'Load'}
        </button>

        <div className="ml-4">
          {selectedProblem ? (
            <div className="p-2 bg-green-50 text-sm text-green-800 rounded">
              <div><strong>{selectedProblem.code}</strong> — {selectedProblem.title}</div>
              <div className="text-xs text-gray-600">slug: {selectedProblem.slug}</div>
            </div>
          ) : (
            <div className="p-2 bg-yellow-50 text-sm text-yellow-800 rounded">No problem selected</div>
          )}
        </div>
      </div>

      {/* Create form */}
      <div className={`bg-white p-4 rounded shadow mb-4 ${!selectedProblem ? 'opacity-70' : ''}`}>
        <h3 className="font-semibold mb-2">Tạo Testcase mới</h3>
        {!selectedProblem && <div className="text-sm text-red-500 mb-2">Hãy Load problem trước khi tạo testcase.</div>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <textarea
            value={newInput}
            onChange={(e) => setNewInput(e.target.value)}
            placeholder="Input"
            className="w-full p-2 border rounded col-span-1 md:col-span-1 font-mono"
            rows={4}
            disabled={!selectedProblem}
          />
          <textarea
            value={newExpected}
            onChange={(e) => setNewExpected(e.target.value)}
            placeholder="Expected Output"
            className="w-full p-2 border rounded col-span-1 md:col-span-1 font-mono"
            rows={4}
            disabled={!selectedProblem}
          />
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={newIsSample} onChange={(e) => setNewIsSample(e.target.checked)} disabled={!selectedProblem} />
              <span className="text-sm">isSample</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={newIsHidden} onChange={(e) => setNewIsHidden(e.target.checked)} disabled={!selectedProblem} />
              <span className="text-sm">isHidden</span>
            </label>
            <label className="flex items-center gap-2">
              <span className="text-sm">Weight</span>
              <input
                type="number"
                value={newWeight}
                min={1}
                onChange={(e) => setNewWeight(Number(e.target.value) || 1)}
                className="border p-1 rounded w-20"
                disabled={!selectedProblem}
              />
            </label>
            <div className="mt-auto">
              <button onClick={handleCreate} disabled={creating || !selectedProblem} className="px-4 py-2 bg-green-600 text-white rounded">
                {creating ? 'Creating...' : 'Create Testcase'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : (
        <div className="bg-white p-4 rounded shadow">
          <div className="overflow-x-auto">
            <table className="table-auto w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-600">
                <tr>
                  <th className="px-4 py-3 w-16 text-left">ID</th>
                  <th className="px-4 py-3 w-1/4 text-left">Input</th>
                  <th className="px-4 py-3 w-1/4 text-left">Expected</th>
                  <th className="px-4 py-3 w-20 text-center">Sample</th>
                  <th className="px-4 py-3 w-20 text-center">Hidden</th>
                  <th className="px-4 py-3 w-20 text-center">Weight</th>
                  <th className="px-4 py-3 w-36 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {testcases.map((tc) => (
                  <tr key={tc.id} className="border-t">
                    <td className="px-4 py-3 align-top font-medium">{tc.id}</td>
                    <td className="px-4 py-3 align-top">
                      <div className="font-mono text-xs text-gray-800 max-w-md truncate" title={tc.input}>{tc.input?.replace(/\n/g, ' ↵ ')}</div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="font-mono text-xs text-gray-800 max-w-md truncate" title={tc.expectedOutput}>{tc.expectedOutput?.replace(/\n/g, ' ↵ ')}</div>
                    </td>
                    <td className="px-4 py-3 text-center align-top">{tc.isSample ? 'Yes' : 'No'}</td>
                    <td className="px-4 py-3 text-center align-top">{tc.isHidden ? 'Yes' : 'No'}</td>
                    <td className="px-4 py-3 text-center align-top">{tc.weight}</td>
                    <td className="px-4 py-3 text-right align-top flex justify-end gap-2">
                      <button
                        onClick={() => openEditModal(tc)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded text-sm"
                        aria-label={`Edit testcase ${tc.id}`}
                      >
                        <FiEdit2 />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(tc.id)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                        aria-label={`Delete testcase ${tc.id}`}
                      >
                        <FiTrash2 />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
                {testcases.length === 0 && (
                  <tr><td colSpan={7} className="p-4 text-center text-sm text-gray-500">No testcases</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Container>
  );
};

export default AdminTestcasesPage;