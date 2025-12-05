// ...existing code...
import { useEffect, useState } from 'react';
import { adminApi } from '@/apis/admin.api';
import Container from '@/components/Layout/Container';
import Loading from '@/components/Loading';

const AdminLanguagesPage = () => {
  const [languages, setLanguages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [version, setVersion] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL?.replace('/api/v1','') || ''}/api/v1/languages`);
        const data = await res.json();
        setLanguages(data.data || []);
      } catch (e) {
        console.error(e);
        setLanguages([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleCreate = async () => {
    try {
      const created = await adminApi.createLanguage({ code, name, version });
      setLanguages((s) => [created, ...s]);
      setName(''); setCode(''); setVersion('');
    } catch (e: any) {
      console.error(e);
      alert('Create failed: ' + (e?.response?.data?.message || e.message));
    }
  };

  const handleEdit = async (lang: any) => {
    const newName = window.prompt('Tên mới', lang.name);
    if (newName == null) return;
    const newVersion = window.prompt('Version mới', lang.version || '');
    if (newVersion == null) return;

    try {
      const updated = await adminApi.updateLanguage(lang.id, { name: newName, version: newVersion });
      setLanguages((s) => s.map((l:any) => (l.id === updated.id ? updated : l)));
    } catch (e: any) {
      console.error(e);
      alert('Update failed: ' + (e?.response?.data?.message || e.message));
    }
  };

  if (loading) return <Loading />;

  return (
    <Container>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Manage Languages</h1>
      </div>

      <div className="grid gap-6">
        <div className="bg-white p-4 rounded shadow">
          <div className="flex gap-2">
            <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="code" className="border p-2 rounded" />
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="name" className="border p-2 rounded flex-1" />
            <input value={version} onChange={(e) => setVersion(e.target.value)} placeholder="version (ví dụ 3.11)" className="border p-2 rounded w-40" />
            <button onClick={handleCreate} className="px-4 py-2 bg-blue-600 text-white rounded">Create</button>
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <table className="min-w-full">
            <thead className="text-left text-sm text-gray-600">
              <tr>
                <th className="p-2">ID</th>
                <th className="p-2">Code</th>
                <th className="p-2">Name</th>
                <th className="p-2">Version</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {languages.map((l:any) => (
                <tr key={l.id} className="border-t">
                  <td className="p-2">{l.id}</td>
                  <td className="p-2">{l.code}</td>
                  <td className="p-2">{l.name}</td>
                  <td className="p-2">{l.version || '-'}</td>
                  <td className="p-2">
                    <button onClick={() => handleEdit(l)} className="mr-2 px-2 py-1 text-sm bg-yellow-50 text-yellow-700 rounded">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Container>
  );
};

export default AdminLanguagesPage;
// ...existing code...