import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { directUploadFile } from '../api/uploadHelper';
import {
  Wrench,
  Plus,
  Search,
  Edit2,
  Trash2,
  Loader2,
  Upload,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle2,
  X,
  RefreshCw
} from 'lucide-react';

export function SolutionsPage() {
  const [solutions, setSolutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [toast, setToast] = useState(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [currentSolution, setCurrentSolution] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    summary: '',
    description: '',
    features: '',
    order: 0,
    status: 1,
    seo_title: '',
    seo_keyword: '',
    seo_description: '',
    image: ''
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Delete state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [solutionToDelete, setSolutionToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchSolutions = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = await api.get('/admin/solutions', { params });
      if (res.data.result === 'success') {
        setSolutions(res.data.solutions || res.data.data || []);
      }
    } catch (err) {
      showToast('error', 'Failed to load engineering solutions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSolutions();
  }, [statusFilter]);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const openCreateModal = () => {
    setModalMode('create');
    setCurrentSolution(null);
    setFormData({
      title: '',
      slug: '',
      summary: '',
      description: '',
      features: '',
      order: solutions.length + 1,
      status: 1,
      seo_title: '',
      seo_keyword: '',
      seo_description: '',
      image: ''
    });
    setImageFile(null);
    setImagePreview(null);
    setUploadProgress(0);
    setIsModalOpen(true);
  };

  const openEditModal = (sol) => {
    setModalMode('edit');
    setCurrentSolution(sol);
    setFormData({
      title: sol.title || '',
      slug: sol.slug || '',
      summary: sol.summary || '',
      description: sol.description || '',
      features: Array.isArray(sol.features) ? sol.features.join('\n') : (sol.features || ''),
      order: sol.order || 0,
      status: sol.status ?? 1,
      seo_title: sol.seo_title || '',
      seo_keyword: sol.seo_keyword || '',
      seo_description: sol.seo_description || '',
      image: sol.image || ''
    });
    setImageFile(null);
    setImagePreview(sol.image || null);
    setUploadProgress(0);
    setIsModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('error', 'Solution title is required');
      return;
    }

    try {
      setSubmitting(true);
      let imagePath = formData.image;

      // Direct client-side WebP compression and signed Supabase upload
      if (imageFile) {
        const uploadResult = await directUploadFile(imageFile, 'product', (p) => setUploadProgress(p));
        imagePath = uploadResult.path;
      }

      const payload = {
        ...formData,
        image: imagePath,
        features: formData.features
          ? formData.features.split('\n').map(s => s.trim()).filter(Boolean)
          : []
      };

      if (modalMode === 'create') {
        const res = await api.post('/admin/solutions', payload);
        if (res.data.result === 'success') {
          showToast('success', 'Engineering solution created successfully');
          setIsModalOpen(false);
          fetchSolutions();
        }
      } else {
        const res = await api.put(`/admin/solutions/${currentSolution.id}`, payload);
        if (res.data.result === 'success') {
          showToast('success', 'Solution updated successfully');
          setIsModalOpen(false);
          fetchSolutions();
        }
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!solutionToDelete) return;
    try {
      setDeleting(true);
      const res = await api.delete(`/admin/solutions/${solutionToDelete.id}`);
      if (res.data.result === 'success') {
        showToast('success', 'Solution deleted successfully');
        setDeleteModalOpen(false);
        setSolutionToDelete(null);
        fetchSolutions();
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to delete solution');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl border shadow-2xl flex items-center gap-3 text-sm font-medium ${
          toast.type === 'success' ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-300' : 'bg-rose-950/90 border-rose-500/30 text-rose-300'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-rose-400" />}
          <span>{toast.message}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#D9DDE3] shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-[#35313B] font-heading flex items-center gap-2.5">
            <Wrench className="w-6 h-6 text-[#645394]" />
            Engineering Solutions
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage comprehensive heating, cleanroom, and thermal engineering solutions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#645394] hover:bg-[#524378] transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Solution</span>
          </button>
          <button onClick={fetchSolutions} className="p-2.5 rounded-xl border border-[#D9DDE3] hover:bg-[#F2F1F5] text-slate-600 transition">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#645394]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Solutions Table */}
      <div className="bg-white rounded-2xl border border-[#D9DDE3] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3 text-slate-500 text-xs">
            <Loader2 className="w-8 h-8 animate-spin text-[#645394]" />
            <span>Loading engineering solutions...</span>
          </div>
        ) : solutions.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No solutions found. Click "Add Solution" to create one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F2F1F5] text-slate-700 font-bold border-b border-[#D9DDE3] uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Solution</th>
                  <th className="py-3.5 px-4">Slug</th>
                  <th className="py-3.5 px-4">Summary</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Order</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9DDE3]">
                {solutions.map((sol) => (
                  <tr key={sol.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-bold text-[#35313B] flex items-center gap-3">
                      {sol.image ? (
                        <img src={sol.image} alt={sol.title} className="w-10 h-10 rounded-lg object-cover border border-slate-200" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                      )}
                      <span>{sol.title}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{sol.slug}</td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{sol.summary || '-'}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        sol.status === 1 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {sol.status === 1 ? 'Active' : 'Draft'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono">{sol.order}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => openEditModal(sol)} className="p-1.5 rounded-lg text-slate-500 hover:text-[#645394] hover:bg-[#F2F1F5]">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => { setSolutionToDelete(sol); setDeleteModalOpen(true); }} className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-[#D9DDE3] space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#D9DDE3] pb-3">
              <h3 className="font-bold text-[#35313B] text-base font-heading">
                {modalMode === 'create' ? 'Create Engineering Solution' : 'Edit Solution'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-[#F2F1F5]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#D9DDE3] focus:border-[#645394] focus:outline-none"
                    placeholder="e.g. Industrial Cleanroom HVAC"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Slug (auto-generated if empty)</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#D9DDE3] focus:border-[#645394] focus:outline-none font-mono"
                    placeholder="cleanroom-hvac"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Summary (Short overview)</label>
                <textarea
                  rows={2}
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#D9DDE3] focus:border-[#645394] focus:outline-none"
                  placeholder="Key capabilities and value proposition"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Engineering Description</label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#D9DDE3] focus:border-[#645394] focus:outline-none"
                  placeholder="Comprehensive technical specifications and implementation details"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Key Features (One per line)</label>
                <textarea
                  rows={3}
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#D9DDE3] focus:border-[#645394] focus:outline-none font-mono"
                  placeholder="High efficiency variable capacity&#10;HEPA filtration stage&#10;BMS automation ready"
                />
              </div>

              {/* Direct Image Upload */}
              <div className="border border-dashed border-[#D9DDE3] p-4 rounded-xl space-y-2 bg-[#F2F1F5]/50">
                <label className="font-bold text-slate-700 block">Cover Image (Direct Supabase WebP Upload)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#645394] file:text-white hover:file:bg-[#524378] cursor-pointer"
                />
                {imagePreview && (
                  <div className="mt-2 flex items-center gap-3">
                    <img src={imagePreview} alt="Preview" className="w-16 h-16 rounded-xl object-cover border border-[#D9DDE3]" />
                    <span className="text-[11px] text-slate-500">Image selected for direct client compression</span>
                  </div>
                )}
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-2">
                    <div className="bg-[#645394] h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
                )}
              </div>

              {/* SEO Meta Fields */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-800 text-xs">SEO Metadata</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-600 block mb-1">SEO Title</label>
                    <input
                      type="text"
                      value={formData.seo_title}
                      onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#645394]"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1">SEO Keywords</label>
                    <input
                      type="text"
                      value={formData.seo_keyword}
                      onChange={(e) => setFormData({ ...formData, seo_keyword: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#645394]"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-slate-600 block mb-1">SEO Description</label>
                  <textarea
                    rows={2}
                    value={formData.seo_description}
                    onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#645394]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Display Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-[#D9DDE3] focus:border-[#645394] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[#D9DDE3] focus:border-[#645394] focus:outline-none bg-white"
                  >
                    <option value={1}>Active</option>
                    <option value={0}>Draft</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#D9DDE3]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#645394] text-white hover:bg-[#524378] font-bold flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{modalMode === 'create' ? 'Create Solution' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && solutionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-rose-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertCircle className="w-6 h-6" />
              <h3 className="font-bold text-base">Delete Solution</h3>
            </div>
            <p className="text-xs text-slate-600">
              Are you sure you want to delete <strong>{solutionToDelete.title}</strong>? Any linked storage assets will be safely removed.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => { setDeleteModalOpen(false); setSolutionToDelete(null); }}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete Solution'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
