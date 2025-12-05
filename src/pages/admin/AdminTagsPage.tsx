// ...existing code...
import { useEffect, useState } from 'react';
import Container from '@/components/Layout/Container';
import Loading from '@/components/Loading';
import toast from 'react-hot-toast';
import { adminApi } from '@/apis/admin.api';
import { tagApi } from '@/apis/tag.api';
import type { TagResponse } from '@/types/common.types';

const TagRow = ({ tag, onEdit, onDelete }: any) => (
  <tr className="border-t">
    <td className="p-3 text-sm">{tag.id}</td>
    <td className="p-3 text-sm">{tag.name}</td>
    <td className="p-3 text-sm">{tag.slug}</td>
    <td className="p-3 text-sm">
      <button onClick={() => onEdit(tag)} className="mr-2 px-3 py-1 text-sm bg-yellow-50 text-yellow-700 rounded">Edit</button>
      <button onClick={() => onDelete(tag)} className="px-3 py-1 text-sm bg-red-50 text-red-700 rounded">Delete</button>
    </td>
  </tr>
);

const AdminTagsPage = () => {
  const [tags, setTags] = useState<TagResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchTags = async () => {
    setLoading(true);
    try {
      const data = await tagApi.getAllTags();
      setTags(Array.isArray(data) ? data : []);
    } catch (e: any) {
      console.error(e);
      toast.error('Lấy tags thất bại');
      setTags([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleCreate = async () => {
    if (!name.trim() || !slug.trim()) {
      toast.error('Name và slug là bắt buộc');
      return;
    }
    setSaving(true);
    try {
      const created = await adminApi.createTag({ name: name.trim(), slug: slug.trim() });
      toast.success('Tạo tag thành công');
      setName(''); setSlug('');
      await fetchTags();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.response?.data?.message || 'Tạo tag thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (tag: TagResponse) => {
    const newName = window.prompt('Tên mới', tag.name);
    if (newName == null) return;
    const newSlug = window.prompt('Slug mới', tag.slug || '');
    if (newSlug == null) return;
    try {
      await adminApi.updateTag(tag.id, { name: newName.trim(), slug: newSlug.trim() });
      toast.success('Cập nhật thành công');
      await fetchTags();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.response?.data?.message || 'Cập nhật thất bại');
    }
  };

  const handleDelete = async (tag: TagResponse) => {
    if (!confirm(`Xóa tag "${tag.name}"?`)) return;
    try {
      await adminApi.deleteTag(tag.id);
      toast.success('Đã xóa');
      setTags((s) => s.filter(t => t.id !== tag.id));
    } catch (e: any) {
      console.error(e);
      toast.error(e?.response?.data?.message || 'Xóa thất bại (kiểm tra ràng buộc ở server)');
      await fetchTags();
    }
  };

  if (loading) return <Container><div className="py-12"><Loading /></div></Container>;

  return (
    <Container>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Manage Tags</h1>
      </div>

      <div className="bg-white p-4 rounded shadow mb-6">
        <div className="flex gap-2 items-center">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="border p-2 rounded flex-1" />
          <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="Slug (kebab-case)" className="border p-2 rounded w-64" />
          <button onClick={handleCreate} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded">
            {saving ? 'Saving...' : 'Create'}
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow overflow-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50 text-sm text-gray-600">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Slug</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tags.map(tag => (
              <TagRow key={tag.id} tag={tag} onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </tbody>
        </table>
      </div>
    </Container>
  );
};

export default AdminTagsPage;
// ...existing code...