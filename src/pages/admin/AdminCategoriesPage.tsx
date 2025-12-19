import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Container from '@/components/Layout/Container';
import Loading from '@/components/Loading';
import { categoryApi } from '@/apis/category.api';
import { adminApi } from '@/apis/admin.api';
import type { CategoryResponse } from '@/types/common.types';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

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
      setCategories(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setCategories([]);
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async () => {
    if (!name.trim() || !slug.trim()) {
      toast.error('Name and slug are required');
      return;
    }
    setSaving(true);
    try {
      const created = await adminApi.createCategory({ name: name.trim(), slug: slug.trim(), parentId });
      toast.success('Category created successfully');
      await fetchCategories();
      setName(''); setSlug(''); setParentId(undefined);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.response?.data?.message || 'Failed to create category');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (cat: CategoryResponse) => {
    const newName = window.prompt('New name', cat.name);
    if (newName == null) return;
    const newSlug = window.prompt('New slug', cat.slug || '');
    if (newSlug == null) return;
    try {
      const updated = await adminApi.updateCategory(cat.id, { name: newName.trim(), slug: newSlug.trim(), parentId: cat.parentId || undefined });
      toast.success('Updated successfully');
      await fetchCategories();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.response?.data?.message || 'Update failed');
    }
  };

  const handleDelete = async (cat: CategoryResponse) => {
    if (!confirm(`Delete category "${cat.name}"?\n\nNote: if this category is being used by problems, the server will block the deletion.`)) return;
    try {
      await adminApi.deleteCategory(cat.id);
      toast.success('Deleted successfully');
      setCategories((s) => s.filter(c => c.id !== cat.id));
    } catch (e: any) {
      console.error(e);
      toast.error(e?.response?.data?.message || 'Delete failed');
    }
  };

  if (loading) return <Container><div className="py-12"><Loading /></div></Container>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Container>
        <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h1 className="text-xl font-semibold text-blue-600">Manage Categories</h1>
          </div>

          <div className="p-6 space-y-6">
            {/* Create Form */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Create New Category</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Algorithms"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Slug</label>
                  <input
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="e.g. algorithms"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Parent Category</label>
                  <select
                    value={parentId ?? ''}
                    onChange={(e) => setParentId(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">No parent</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <button
                onClick={handleCreate}
                disabled={saving}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Creating...' : 'Create Category'}
              </button>
            </div>

            {/* List Table */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Categories List</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Slug</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Parent</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {categories.map(cat => (
                      <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-600">{cat.id}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{cat.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 font-mono">{cat.slug}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{cat.parentName || '-'}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(cat)}
                              className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            >
                              <FiEdit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(cat)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <FiTrash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default AdminCategoriesPage;
