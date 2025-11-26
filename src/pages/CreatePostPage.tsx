import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '@/components/Layout/Container';
import { FiSend } from 'react-icons/fi';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import { postApi } from '@/apis/post.api';
import { tagApi } from '@/apis/tag.api';
import { ROUTES } from '@/utils/constants';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import type { TagResponse } from '@/types/post.types';

const CreatePostPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTagNames, setSelectedTagNames] = useState<string[]>([]);
  const [tags, setTags] = useState<TagResponse[]>([]);
  const [loadingTags, setLoadingTags] = useState(true);
  const [tagSearchQuery, setTagSearchQuery] = useState('');
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  const tagDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTags();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tagDropdownRef.current && !tagDropdownRef.current.contains(event.target as Node)) {
        setIsTagDropdownOpen(false);
      }
    };

    if (isTagDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isTagDropdownOpen]);

  const fetchTags = async () => {
    try {
      setLoadingTags(true);
      const tagsData = await tagApi.getAllTags('POST'); // Chỉ lấy tags cho posts
      setTags(tagsData);
    } catch (error: any) {
      toast.error('Không thể tải danh sách tags');
      console.error('Error fetching tags:', error);
    } finally {
      setLoadingTags(false);
    }
  };

  const handleTagToggle = (tagName: string) => {
    setSelectedTagNames((prev) =>
      prev.includes(tagName)
        ? prev.filter((name) => name !== tagName)
        : [...prev, tagName]
    );
    setTagSearchQuery('');
    setIsTagDropdownOpen(false);
  };

  const handleCreateNewTag = (tagName: string) => {
    const trimmedName = tagName.trim();
    if (trimmedName && !selectedTagNames.includes(trimmedName)) {
      setSelectedTagNames((prev) => [...prev, trimmedName]);
      setTagSearchQuery('');
      setIsTagDropdownOpen(false);
    }
  };

  const handleRemoveTag = (tagName: string) => {
    setSelectedTagNames((prev) => prev.filter((name) => name !== tagName));
  };

  // Filter tags based on search query
  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(tagSearchQuery.toLowerCase())
  );

  // Check if search query doesn't match any existing tag
  const canCreateNewTag = tagSearchQuery.trim() !== '' && 
    !filteredTags.some(tag => tag.name.toLowerCase() === tagSearchQuery.trim().toLowerCase()) &&
    !selectedTagNames.includes(tagSearchQuery.trim());

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('Vui lòng nhập tiêu đề');
      return;
    }

    if (!content || !content.trim()) {
      toast.error('Vui lòng nhập nội dung');
      return;
    }

    if (!user) {
      toast.error('Vui lòng đăng nhập');
      navigate(ROUTES.LOGIN);
      return;
    }

    setIsSubmitting(true);
    try {
      await postApi.createPost({
        title: title.trim(),
        content,
        tagNames: selectedTagNames,
      });
      
      toast.success('Tạo bài viết thành công!');
      navigate(ROUTES.DISCUSS);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi tạo bài viết');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (title || content) {
      if (window.confirm('Bạn có chắc muốn hủy? Nội dung chưa lưu sẽ bị mất.')) {
        navigate(ROUTES.DISCUSS);
      }
    } else {
      navigate(ROUTES.DISCUSS);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Container>
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <FiSend className="w-5 h-5" />
              <span>Post</span>
            </button>
          </div>

          {/* Title Input */}
          <div className="p-4 border-b border-gray-200">
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-2xl font-semibold text-gray-900 placeholder-gray-400 border-none outline-none"
              maxLength={200}
            />
          </div>

          {/* Tags */}
          <div className="p-4 border-b border-gray-200">
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-500 font-medium">Tags:</span>
                {/* Selected Tags */}
                {selectedTagNames.map((tagName) => (
                  <div
                    key={tagName}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium border border-blue-300"
                  >
                    <span>{tagName}</span>
                    <button
                      onClick={() => handleRemoveTag(tagName)}
                      className="ml-1 text-blue-700 hover:text-blue-900 font-bold"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              
              {/* Tag Search Dropdown */}
              <div className="relative" ref={tagDropdownRef}>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Tìm kiếm hoặc tạo tag mới..."
                      value={tagSearchQuery}
                      onChange={(e) => {
                        setTagSearchQuery(e.target.value);
                        setIsTagDropdownOpen(true);
                      }}
                      onFocus={() => setIsTagDropdownOpen(true)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && canCreateNewTag) {
                          e.preventDefault();
                          handleCreateNewTag(tagSearchQuery.trim());
                        }
                      }}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    
                    {/* Dropdown */}
                    {isTagDropdownOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {loadingTags ? (
                          <div className="p-3 text-sm text-gray-400 text-center">Đang tải tags...</div>
                        ) : filteredTags.length === 0 && !canCreateNewTag ? (
                          <div className="p-3 text-sm text-gray-400 text-center">
                            {tagSearchQuery.trim() === '' ? 'Nhập để tìm kiếm tags' : 'Không tìm thấy tag'}
                          </div>
                        ) : (
                          <>
                            {/* Create New Tag Option */}
                            {canCreateNewTag && (
                              <button
                                onClick={() => handleCreateNewTag(tagSearchQuery.trim())}
                                className="w-full px-4 py-2 text-left text-sm text-blue-600 hover:bg-blue-50 border-b border-gray-200 flex items-center gap-2"
                              >
                                <span className="font-medium">+ Tạo tag:</span>
                                <span className="font-semibold">{tagSearchQuery.trim()}</span>
                              </button>
                            )}
                            
                            {/* Existing Tags */}
                            {filteredTags.map((tag) => (
                              <button
                                key={tag.id}
                                onClick={() => handleTagToggle(tag.name)}
                                disabled={selectedTagNames.includes(tag.name)}
                                className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                                  selectedTagNames.includes(tag.name)
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                {tag.name}
                                {selectedTagNames.includes(tag.name) && (
                                  <span className="ml-2 text-xs text-gray-400">(đã chọn)</span>
                                )}
                              </button>
                            ))}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Markdown Editor */}
          <div className="p-4" data-color-mode="light">
            <MDEditor
              value={content}
              onChange={(value) => setContent(value || '')}
              preview="edit"
              height={500}
              visibleDragbar={false}
              textareaProps={{
                placeholder: 'Write your post content here...',
              }}
            />
          </div>

          {/* Footer Info */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <p className="text-xs text-gray-500">
              Tip: Use markdown or rich text editor to format your post. You can add code blocks, images, and links.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default CreatePostPage;

