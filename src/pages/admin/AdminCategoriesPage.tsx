// ...existing code...
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Container from '@/components/Layout/Container';
import Loading from '@/components/Loading';
import { categoryApi } from '@/apis/category.api';
import { adminApi } from '@/apis/admin.api';
import type { CategoryResponse } from '@/types/common.types';

const CategoryRow = ({ cat, onEdit, onDelete }: any) => (
  <tr className="border-t">
    <td className="p-3 text-sm">{cat.id}</td>
    <td className="p-3 text-sm">{cat.name}</td>
    <td className="p-3 text-sm">{cat.slug}</td>
    <td className="p-3 text-sm">{cat.parentName || '-'}</td>
    <td className="p-3 text-sm">
      <button onClick={() => onEdit(cat)} className="mr-2 px-3 py-1 text-sm bg-yellow-50 text-yellow-700 rounded">Edit</button>
      <button onClick={() => onDelete(cat)} className="px-3 py-1 text-sm bg-red-50 text-red-700 rounded">Delete</button>
    </td>
  </tr>
);

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [parentId, setParentId] = useState<number | undefined>(undefined);
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await categoryApi.getAllCategories();
      setCategories(data);
    } catch (e) {
      console.error(e);
      setCategories([]);
      toast.error('Lấy categories thất bại');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async () => {
    if (!name.trim() || !slug.trim()) {
      toast.error('Name và slug là bắt buộc');
      return;
    }
    setSaving(true);
    try {
      const created = await adminApi.createCategory({ name: name.trim(), slug: slug.trim(), parentId });
      toast.success('Tạo category thành công');
      // refresh list
      await fetchCategories();
      setName(''); setSlug(''); setParentId(undefined);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.response?.data?.message || 'Tạo category thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (cat: CategoryResponse) => {
    const newName = window.prompt('Tên mới', cat.name);
    if (newName == null) return;
    const newSlug = window.prompt('Slug mới', cat.slug || '');
    if (newSlug == null) return;
    try {
      const updated = await adminApi.updateCategory(cat.id, { name: newName.trim(), slug: newSlug.trim(), parentId: cat.parentId || undefined });
      toast.success('Cập nhật thành công');
      await fetchCategories();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.response?.data?.message || 'Cập nhật thất bại');
    }
  };

  const handleDelete = async (cat: CategoryResponse) => {
    if (!confirm(`Xóa category "${cat.name}"?\n\nLưu ý: nếu category này đang được sử dụng bởi các problem thì server sẽ chặn việc xóa.\nBạn vẫn muốn tiếp tục?`)) return;
    try {
      await adminApi.deleteCategory(cat.id);
      toast.success('Xóa thành công');
      setCategories((s) => s.filter(c => c.id !== cat.id));
    } catch (e: any) {
      console.error(e);
      toast.error(e?.response?.data?.message || 'Xóa thất bại (kiểm tra ràng buộc ở server)');
    }
  };

  if (loading) return <Loading />;

  return (
    <Container>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Manage Categories</h1>
      </div>

      <div className="bg-white p-4 rounded shadow mb-6">
        <div className="flex gap-2 items-center">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="border p-2 rounded flex-1" />
          <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="Slug (kebab-case)" className="border p-2 rounded w-64" />
          <select value={parentId ?? ''} onChange={(e) => setParentId(e.target.value ? Number(e.target.value) : undefined)} className="border p-2 rounded">
            <option value="">No parent</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
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
              <th className="p-3 text-left">Parent</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(cat => (
              <CategoryRow key={cat.id} cat={cat} onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </tbody>
        </table>
      </div>
    </Container>
  );
};

export default AdminCategoriesPage;