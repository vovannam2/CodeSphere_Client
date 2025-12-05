// ...existing code...
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Container from '@/components/Layout/Container';
import Loading from '@/components/Loading';
import { adminApi } from '@/apis/admin.api';
import { categoryApi } from '@/apis/category.api';
import { tagApi } from '@/apis/tag.api';
import { languageApi } from '@/apis/language.api';
import toast from 'react-hot-toast';

const AdminProblemForm = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({
    code: '', title: '', slug: '', content: '', level: 'EASY',
    sampleInput: '', sampleOutput: '', timeLimitMs: 2000, memoryLimitMb: 256,
    categoryIds: [], tagIds: [], languageIds: [],
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [languages, setLanguages] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const cats = await categoryApi.getAllCategories(); setCategories(Array.isArray(cats)?cats:cats.content||[]);
        const t = await tagApi.getAllTags(); setTags(Array.isArray(t)?t:t.content||[]);
        const langs = await languageApi.getAllLanguages(); setLanguages(Array.isArray(langs)?langs:langs.content||[]);
        if (isEdit && id) {
          const data = await adminApi.getProblem(Number(id));
          setForm({
            code: data.code || '',
            title: data.title || '',
            slug: data.slug || '',
            content: data.content || '',
            level: data.level || 'EASY',
            sampleInput: data.sampleInput || '',
            sampleOutput: data.sampleOutput || '',
            timeLimitMs: data.timeLimitMs ?? 2000,
            memoryLimitMb: data.memoryLimitMb ?? 256,
            categoryIds: (data.categories||[]).map((c:any)=>c.id),
            tagIds: (data.tags||[]).map((t:any)=>t.id),
            languageIds: (data.languages||[]).map((l:any)=>l.id),
          });
        }
      } catch (e) {
        console.error(e);
        toast.error('Tải dữ liệu thất bại');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleChange = (k: string, v: any) => setForm((s:any)=>({ ...s, [k]: v }));

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!form.code || !form.title || !form.slug) {
      toast.error('Code, title và slug là bắt buộc');
      return;
    }
    setSaving(true);
    try {
      if (isEdit && id) {
        await adminApi.updateProblem(Number(id), form);
        toast.success('Cập nhật problem thành công');
        navigate('/admin/problems');
      } else {
        await adminApi.createProblem(form);
        toast.success('Tạo problem thành công');
        // Sau khi tạo xong, chuyển về trang danh sách problems
        navigate('/admin/problems');
        return;
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Container><div className="py-12"><Loading /></div></Container>;

  return (
    <Container>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">{isEdit ? 'Edit Problem' : 'Create Problem'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input value={form.code} onChange={e=>handleChange('code', e.target.value)} placeholder="Code (e.g. TWO_SUM)" className="border p-2 rounded col-span-1" />
          <input value={form.title} onChange={e=>handleChange('title', e.target.value)} placeholder="Title" className="border p-2 rounded col-span-2" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input value={form.slug} onChange={e=>handleChange('slug', e.target.value)} placeholder="slug (kebab-case)" className="border p-2 rounded" />
          <select value={form.level} onChange={e=>handleChange('level', e.target.value)} className="border p-2 rounded">
            <option value="EASY">EASY</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HARD">HARD</option>
          </select>
          <div className="flex gap-2">
            <input type="number" value={form.timeLimitMs} onChange={e=>handleChange('timeLimitMs', Number(e.target.value))} className="border p-2 rounded w-1/2" />
            <input type="number" value={form.memoryLimitMb} onChange={e=>handleChange('memoryLimitMb', Number(e.target.value))} className="border p-2 rounded w-1/2" />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-600">Content (HTML)</label>
          <textarea value={form.content} onChange={e=>handleChange('content', e.target.value)} rows={8} className="w-full border p-2 rounded" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-sm block mb-1">Categories</label>
            <select multiple value={form.categoryIds.map(String)} onChange={e=> {
              const opts = Array.from(e.target.selectedOptions).map(o=>Number(o.value));
              handleChange('categoryIds', opts);
            }} className="border p-2 rounded w-full h-32">
              {categories.map((c:any)=> <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm block mb-1">Tags</label>
            <select multiple value={form.tagIds.map(String)} onChange={e=> {
              const opts = Array.from(e.target.selectedOptions).map(o=>Number(o.value));
              handleChange('tagIds', opts);
            }} className="border p-2 rounded w-full h-32">
              {tags.map((t:any)=> <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm block mb-1">Languages</label>
            <select multiple value={form.languageIds.map(String)} onChange={e=> {
              const opts = Array.from(e.target.selectedOptions).map(o=>Number(o.value));
              handleChange('languageIds', opts);
            }} className="border p-2 rounded w-full h-32">
              {languages.map((l:any)=> <option key={l.id} value={l.id}>{l.name} {l.version ? `(${l.version})` : ''}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-sm block mb-1">Sample Input</label>
            <textarea value={form.sampleInput} onChange={e=>handleChange('sampleInput', e.target.value)} rows={4} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="text-sm block mb-1">Sample Output</label>
            <textarea value={form.sampleOutput} onChange={e=>handleChange('sampleOutput', e.target.value)} rows={4} className="w-full border p-2 rounded" />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button type="button" onClick={()=>navigate('/admin/problems')} className="px-4 py-2 bg-gray-100 rounded">Cancel</button>
          <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded">{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </form>
    </Container>
  );
};

export default AdminProblemForm;
// ...existing code...