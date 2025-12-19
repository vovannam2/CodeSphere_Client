import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Container from '@/components/Layout/Container';
import Loading from '@/components/Loading';
import { adminApi } from '@/apis/admin.api';
import { categoryApi } from '@/apis/category.api';
import { tagApi } from '@/apis/tag.api';
import { languageApi } from '@/apis/language.api';
import toast from 'react-hot-toast';
import RichTextEditor from '@/components/Editor/RichTextEditor';

const AdminProblemForm = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [codeManuallyEdited, setCodeManuallyEdited] = useState(false);
  
  const [description, setDescription] = useState('');
  const [constraints, setConstraints] = useState('');

  const [form, setForm] = useState<any>({
    code: '', title: '', content: '', level: 'EASY',
    timeLimitMs: 2000, memoryLimitMb: 256,
    categoryIds: [], tagIds: [], languageIds: [],
    isPublic: true, isContest: false,
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [languages, setLanguages] = useState<any[]>([]);
  
  // Dropdown states
  const [categorySearch, setCategorySearch] = useState('');
  const [tagSearch, setTagSearch] = useState('');
  const [languageSearch, setLanguageSearch] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLDivElement>(null);
  const languageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const [cats, t, langs] = await Promise.all([
          categoryApi.getAllCategories(),
          tagApi.getAllTags(),
          languageApi.getAllLanguages(),
        ]);
        setCategories(Array.isArray(cats) ? cats : (cats as any)?.content || []);
        setTags(Array.isArray(t) ? t : (t as any)?.content || []);
        setLanguages(Array.isArray(langs) ? langs : (langs as any)?.content || []);
        
        if (isEdit && id) {
          const data = await adminApi.getProblem(Number(id));
          setForm({
            code: data.code || '',
            title: data.title || '',
            content: data.content || '',
            level: data.level || 'EASY',
            timeLimitMs: data.timeLimitMs ?? 2000,
            memoryLimitMb: data.memoryLimitMb ?? 256,
            categoryIds: (data.categories||[]).map((c:any)=>c.id),
            tagIds: (data.tags||[]).map((t:any)=>t.id),
            languageIds: (data.languages||[]).map((l:any)=>l.id),
            isPublic: data.isPublic ?? true,
            isContest: data.isContest ?? false,
          });
          
          // Parse HTML content to extract description and constraints
          if (data.content) {
            const { parsedDescription, parsedConstraints } = parseHTMLContent(data.content);
            setDescription(parsedDescription || '');
            setConstraints(parsedConstraints || '');
          } else {
            setDescription('');
            setConstraints('');
          }
        }
      } catch (e) {
        console.error(e);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false);
      }
      if (tagRef.current && !tagRef.current.contains(event.target as Node)) {
        setShowTagDropdown(false);
      }
      if (languageRef.current && !languageRef.current.contains(event.target as Node)) {
        setShowLanguageDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  const parseHTMLContent = (html: string) => {
    // Parse description - find opening and closing div properly
    let parsedDescription = '';
    
    // Find the start of problem-description div
    const descStartMatch = html.match(/<div[^>]*class="problem-description[^"]*"[^>]*>/);
    if (descStartMatch) {
      const startIndex = descStartMatch.index! + descStartMatch[0].length;
      
      // Find the matching closing div by counting depth
      let depth = 1;
      let i = startIndex;
      while (i < html.length && depth > 0) {
        if (html.substring(i).startsWith('<div')) {
          depth++;
          i += 4;
        } else if (html.substring(i).startsWith('</div>')) {
          depth--;
          if (depth === 0) {
            parsedDescription = html.substring(startIndex, i).trim();
            break;
          }
          i += 6;
        } else {
          i++;
        }
      }
    }
    
    // Fallback: try simple regex if above failed
    if (!parsedDescription) {
      const simpleMatch = html.match(/<div[^>]*class="problem-description[^"]*"[^>]*>(.*?)<\/div>/s);
      if (simpleMatch) {
        parsedDescription = simpleMatch[1].trim();
      }
    }
    
    // ReactQuill works with HTML directly, so keep HTML but remove our custom classes
    // (Quill will add its own classes when editing)
    if (parsedDescription) {
      // Remove our custom classes, Quill will handle styling
      parsedDescription = parsedDescription.replace(/class="problem-[^"]*"/g, '');
      parsedDescription = parsedDescription.replace(/class='problem-[^']*'/g, '');
    } else {
      // If still empty, try to get raw content (for old problems)
      console.warn('Could not parse description, using raw content');
      const rawMatch = html.match(/<div class="problem-description[^"]*">(.*?)<\/div>/s);
      if (rawMatch) {
        parsedDescription = rawMatch[1].trim();
        // Remove custom classes
        parsedDescription = parsedDescription.replace(/class="problem-[^"]*"/g, '');
      }
    }

    // Parse constraints (remove the auto-generated Time/Memory limit part)
    const constraintsMatch = html.match(/<div class="problem-constraints">(.*?)<\/div>\s*<\/div>\s*<\/div>/s);
    let parsedConstraints = '';
    if (constraintsMatch) {
      const constraintsHtml = constraintsMatch[1];
      const contentMatch = constraintsHtml.match(/<div[^>]*>\s*<div>(.*?)<\/div>/s);
      if (contentMatch) {
        parsedConstraints = contentMatch[1].trim();
      }
    }

    return { parsedDescription, parsedConstraints };
  };

  const generateProfessionalHTML = () => {
    // ReactQuill returns HTML directly, just need to add styling classes
    let processedDescription = description || '';
    
    // Quill already returns HTML, so we just need to add our custom classes
    // Replace existing tags with our styled versions
    processedDescription = processedDescription.replace(/<strong>/g, '<strong class="problem-bold">');
    processedDescription = processedDescription.replace(/<em>/g, '<em class="problem-italic">');
    processedDescription = processedDescription.replace(/<code>/g, '<code class="problem-code">');
    processedDescription = processedDescription.replace(/<h1>/g, '<h1 class="problem-h1">');
    processedDescription = processedDescription.replace(/<h2>/g, '<h2 class="problem-h2">');
    processedDescription = processedDescription.replace(/<h3>/g, '<h3 class="problem-h3">');
    
    // Wrap paragraphs if they're not already wrapped
    processedDescription = processedDescription.replace(/<p>/g, '<p class="problem-paragraph">');
    
    // If content doesn't have paragraph tags, wrap it
    if (!processedDescription.includes('<p>') && !processedDescription.includes('<h1') && !processedDescription.includes('<h2') && !processedDescription.includes('<h3')) {
      // Split by double newlines and wrap each as paragraph
      const paragraphs = processedDescription.split(/\n\s*\n/).filter(p => p.trim());
      processedDescription = paragraphs.map(p => `<p class="problem-paragraph">${p.replace(/\n/g, '<br>')}</p>`).join('');
    }
    
    let html = `<div class="problem-description">${processedDescription}</div>`;

    html += `
      <div class="problem-constraints">
        <p class="font-semibold text-slate-800 mb-2">Constraints:</p>
        <div class="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-700 space-y-3">
          ${constraints ? `<div>${constraints}</div>` : ''}
          <div class="flex flex-wrap gap-x-6 gap-y-2 pt-3 border-t border-slate-200 mt-1">
            <div class="flex items-center gap-2 text-xs text-slate-600">
              <span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
              Time Limit: ${form.timeLimitMs}ms
            </div>
            <div class="flex items-center gap-2 text-xs text-slate-600">
              <span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
              Memory Limit: ${form.memoryLimitMb}MB
            </div>
          </div>
        </div>
      </div>`;

    return html;
  };

  const generateCodeFromTitle = (title: string): string => {
    if (!title) return '';
    const normalizeVietnamese = (str: string): string => {
      return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D');
    };
    let normalized = normalizeVietnamese(title).toUpperCase();
    return normalized
      .replace(/[^A-Z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  };

  const handleChange = (k: string, v: any) => {
    setForm((s:any) => {
      const newForm = { ...s, [k]: v };
      if (k === 'title' && !isEdit && !codeManuallyEdited) {
        const generatedCode = generateCodeFromTitle(v);
        if (generatedCode) newForm.code = generatedCode;
      }
      if (k === 'code') setCodeManuallyEdited(true);
      return newForm;
    });
  };

  const handleToggleCategory = (categoryId: number) => {
    if (form.categoryIds.includes(categoryId)) {
      handleChange('categoryIds', form.categoryIds.filter((id: number) => id !== categoryId));
    } else {
      handleChange('categoryIds', [...form.categoryIds, categoryId]);
    }
    setCategorySearch('');
    setShowCategoryDropdown(false);
  };

  const handleToggleTag = (tagId: number) => {
    if (form.tagIds.includes(tagId)) {
      handleChange('tagIds', form.tagIds.filter((id: number) => id !== tagId));
    } else {
      handleChange('tagIds', [...form.tagIds, tagId]);
    }
    setTagSearch('');
    setShowTagDropdown(false);
  };

  const handleToggleLanguage = (languageId: number) => {
    if (form.languageIds.includes(languageId)) {
      handleChange('languageIds', form.languageIds.filter((id: number) => id !== languageId));
    } else {
      handleChange('languageIds', [...form.languageIds, languageId]);
    }
    setLanguageSearch('');
    setShowLanguageDropdown(false);
  };

  const handleRemoveCategory = (categoryId: number) => {
    handleChange('categoryIds', form.categoryIds.filter((id: number) => id !== categoryId));
  };

  const handleRemoveTag = (tagId: number) => {
    handleChange('tagIds', form.tagIds.filter((id: number) => id !== tagId));
  };

  const handleRemoveLanguage = (languageId: number) => {
    handleChange('languageIds', form.languageIds.filter((id: number) => id !== languageId));
  };

  const filteredCategories = categories.filter(c =>
    c.name?.toLowerCase().includes(categorySearch.toLowerCase())
  );
  const filteredTags = tags.filter(t =>
    t.name?.toLowerCase().includes(tagSearch.toLowerCase())
  );
  const filteredLanguages = languages.filter(l =>
    l.name?.toLowerCase().includes(languageSearch.toLowerCase())
  );

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    
    const finalContent = generateProfessionalHTML();

    if (!form.title || !description) {
      toast.error('Title and Description are required');
      return;
    }
    
    const problemData = {
      ...form,
      content: finalContent,
    };

    if (!problemData.code || !isEdit) {
      const generatedCode = generateCodeFromTitle(problemData.title);
      if (!generatedCode) {
        toast.error('Could not generate code from title.');
        return;
      }
      problemData.code = generatedCode;
    }

    if (!problemData.categoryIds?.length) {
      toast.error('At least 1 category must be selected');
      return;
    }

    if (!problemData.languageIds?.length) {
      toast.error('At least 1 language must be selected');
      return;
    }

    setSaving(true);
    try {
      if (isEdit && id) {
        await adminApi.updateProblem(Number(id), problemData);
        toast.success('Problem updated successfully');
      } else {
        await adminApi.createProblem(problemData);
        toast.success('Problem created successfully');
      }
      navigate('/admin/problems');
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Container><div className="py-12"><Loading /></div></Container>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
    <Container>
        <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h1 className="text-xl font-semibold text-blue-600">{isEdit ? 'Edit Problem' : 'Create Problem'}</h1>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => navigate('/admin/problems')}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Problem'}
              </button>
            </div>
      </div>

          <div className="p-6 space-y-6">
            {/* Title */}
        <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
          <input 
                type="text"
            value={form.title} 
                onChange={e => handleChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter problem title..."
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              <RichTextEditor
                value={description}
                onChange={setDescription}
                height="500px"
              />
        </div>
        
            {/* Constraints */}
          <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Constraints</label>
              <RichTextEditor
                value={constraints}
                onChange={setConstraints}
                height="150px"
              />
            </div>

            {/* Configuration Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Difficulty</label>
                <select
                  value={form.level}
                  onChange={e => handleChange('level', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
          </div>

          <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Visibility</label>
                <select
                  value={form.isContest ? 'CONTEST' : 'PUBLIC'}
                  onChange={e => {
                    const val = e.target.value;
                    handleChange('isContest', val === 'CONTEST');
                    handleChange('isPublic', val === 'PUBLIC');
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="PUBLIC">Public</option>
                  <option value="CONTEST">Contest Only</option>
            </select>
          </div>

          <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Time Limit (ms)</label>
            <input 
              type="number" 
              value={form.timeLimitMs} 
                  onChange={e => handleChange('timeLimitMs', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
          </div>

          <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Memory Limit (MB)</label>
            <input 
              type="number" 
              value={form.memoryLimitMb} 
                  onChange={e => handleChange('memoryLimitMb', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
          </div>
        </div>

            {/* Categories */}
        <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Categories</label>
              <div className="space-y-3">
                {/* Selected Categories */}
                {form.categoryIds.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {form.categoryIds.map((catId: number) => {
                      const cat = categories.find(c => c.id === catId);
                      return cat ? (
                        <div
                          key={catId}
                          className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm border border-blue-300"
                        >
                          <span>{cat.name}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveCategory(catId)}
                            className="ml-1 text-blue-700 hover:text-blue-900 font-bold"
                          >
                            ×
                          </button>
                        </div>
                      ) : null;
                    })}
        </div>
                )}
                
                {/* Category Search Dropdown */}
                <div className="relative" ref={categoryRef}>
                      <input
                    type="text"
                    placeholder="Search or select category..."
                    value={categorySearch}
                    onChange={e => {
                      setCategorySearch(e.target.value);
                      setShowCategoryDropdown(true);
                    }}
                    onFocus={() => setShowCategoryDropdown(true)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  
                  {showCategoryDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredCategories.length === 0 ? (
                        <div className="p-3 text-sm text-gray-400 text-center">No category found</div>
                      ) : (
                        filteredCategories.map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => handleToggleCategory(cat.id)}
                            disabled={form.categoryIds.includes(cat.id)}
                            className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                              form.categoryIds.includes(cat.id)
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {cat.name}
                            {form.categoryIds.includes(cat.id) && (
                              <span className="ml-2 text-xs text-gray-400">(selected)</span>
                            )}
                          </button>
                        ))
                      )}
                </div>
              )}
            </div>
            </div>
          </div>

            {/* Tags */}
          <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tags</label>
              <div className="space-y-3">
                {form.tagIds.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {form.tagIds.map((tagId: number) => {
                      const tag = tags.find(t => t.id === tagId);
                      return tag ? (
                        <div
                          key={tagId}
                          className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm border border-green-300"
                        >
                          <span>{tag.name}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tagId)}
                            className="ml-1 text-green-700 hover:text-green-900 font-bold"
                          >
                            ×
                          </button>
                        </div>
                      ) : null;
                    })}
                  </div>
                )}
                
                <div className="relative" ref={tagRef}>
                      <input
                    type="text"
                    placeholder="Search or select tag..."
                    value={tagSearch}
                    onChange={e => {
                      setTagSearch(e.target.value);
                      setShowTagDropdown(true);
                    }}
                    onFocus={() => setShowTagDropdown(true)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  
                  {showTagDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredTags.length === 0 ? (
                        <div className="p-3 text-sm text-gray-400 text-center">No tag found</div>
                      ) : (
                        filteredTags.map((tag) => (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => handleToggleTag(tag.id)}
                            disabled={form.tagIds.includes(tag.id)}
                            className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                              form.tagIds.includes(tag.id)
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {tag.name}
                            {form.tagIds.includes(tag.id) && (
                              <span className="ml-2 text-xs text-gray-400">(selected)</span>
                            )}
                          </button>
                        ))
                      )}
                </div>
              )}
            </div>
          </div>
        </div>

            {/* Languages */}
          <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Allowed Languages</label>
              <div className="space-y-3">
                {form.languageIds.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {form.languageIds.map((langId: number) => {
                      const lang = languages.find(l => l.id === langId);
                      return lang ? (
                        <div
                          key={langId}
                          className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm border border-purple-300"
                        >
                          <span>{lang.name} {lang.version && `(${lang.version})`}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveLanguage(langId)}
                            className="ml-1 text-purple-700 hover:text-purple-900 font-bold"
                          >
                            ×
                          </button>
          </div>
                      ) : null;
                    })}
          </div>
                )}

                <div className="relative" ref={languageRef}>
              <input 
                    type="text"
                    placeholder="Search or select language..."
                    value={languageSearch}
                    onChange={e => {
                      setLanguageSearch(e.target.value);
                      setShowLanguageDropdown(true);
                    }}
                    onFocus={() => setShowLanguageDropdown(true)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  
                  {showLanguageDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredLanguages.length === 0 ? (
                        <div className="p-3 text-sm text-gray-400 text-center">No language found</div>
                      ) : (
                        filteredLanguages.map((lang) => (
                          <button
                            key={lang.id}
                            type="button"
                            onClick={() => handleToggleLanguage(lang.id)}
                            disabled={form.languageIds.includes(lang.id)}
                            className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                              form.languageIds.includes(lang.id)
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {lang.name} {lang.version && `(${lang.version})`}
                            {form.languageIds.includes(lang.id) && (
                              <span className="ml-2 text-xs text-gray-400">(selected)</span>
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
              </div>
          </div>
        </div>
      </Container>
        </div>
  );
};

export default AdminProblemForm;
