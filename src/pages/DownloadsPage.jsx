import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { directUploadFile } from '../api/uploadHelper';
import {
  Download,
  Plus,
  Search,
  Edit2,
  Trash2,
  Loader2,
  FileText,
  AlertCircle,
  CheckCircle2,
  X,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

export function DownloadsPage() {
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [currentDownload, setCurrentDownload] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: 'Brochure',
    description: '',
    file: '',
    file_size: '',
    order: 0,
    status: 1
  });

  const [pdfFile, setPdfFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Delete state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [downloadToDelete, setDownloadToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchDownloads = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;

      const res = await api.get('/admin/downloads', { params });
      if (res.data.result === 'success') {
        setDownloads(res.data.downloads || res.data.data || []);
      }
    } catch (err) {
      showToast('error', 'Failed to load downloads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDownloads();
  }, []);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const openCreateModal = () => {
    setModalMode('create');
    setCurrentDownload(null);
    setFormData({
      title: '',
      slug: '',
      category: 'Brochure',
      description: '',
      file: '',
      file_size: '',
      order: downloads.length + 1,
      status: 1
    });
    setPdfFile(null);
    setUploadProgress(0);
    setIsModalOpen(true);
  };

  const openEditModal = (d) => {
    setModalMode('edit');
    setCurrentDownload(d);
    setFormData({
      title: d.title || '',
      slug: d.slug || '',
      category: d.category || 'Brochure',
      description: d.description || '',
      file: d.file || '',
      file_size: d.file_size || '',
      order: d.order || 0,
      status: d.status ?? 1
    });
    setPdfFile(null);
    setUploadProgress(0);
    setIsModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        showToast('error', 'Only PDF files are permitted for downloads');
        return;
      }
      setPdfFile(file);
      setFormData(prev => ({
        ...prev,
        file_size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`
      }));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('error', 'Document title is required');
      return;
    }

    try {
      setSubmitting(true);
      let filePath = formData.file;

      if (pdfFile) {
        const uploadResult = await directUploadFile(pdfFile, 'pdf', (p) => setUploadProgress(p));
        filePath = uploadResult.path;
      }

      if (!filePath) {
        showToast('error', 'Please select a PDF document to upload');
        return;
      }

      const payload = {
        ...formData,
        file: filePath
      };

      if (modalMode === 'create') {
        const res = await api.post('/admin/downloads', payload);
        if (res.data.result === 'success') {
          showToast('success', 'Document created successfully');
          setIsModalOpen(false);
          fetchDownloads();
        }
      } else {
        const res = await api.put(`/admin/downloads/${currentDownload.id}`, payload);
        if (res.data.result === 'success') {
          showToast('success', 'Document updated successfully');
          setIsModalOpen(false);
          fetchDownloads();
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
    if (!downloadToDelete) return;
    try {
      setDeleting(true);
      const res = await api.delete(`/admin/downloads/${downloadToDelete.id}`);
      if (res.data.result === 'success') {
        showToast('success', 'Document deleted successfully');
        setDeleteModalOpen(false);
        setDownloadToDelete(null);
        fetchDownloads();
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to delete document');
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
            <Download className="w-6 h-6 text-[#645394]" />
            Brochures & Technical Datasheets
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage corporate brochures, technical product datasheets, and ISO certifications.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#645394] hover:bg-[#524378] transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
          <button onClick={fetchDownloads} className="p-2.5 rounded-xl border border-[#D9DDE3] hover:bg-[#F2F1F5] text-slate-600 transition">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#645394]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Downloads Table */}
      <div className="bg-white rounded-2xl border border-[#D9DDE3] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3 text-slate-500 text-xs">
            <Loader2 className="w-8 h-8 animate-spin text-[#645394]" />
            <span>Loading documents...</span>
          </div>
        ) : downloads.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No documents found. Click "Upload Document" to add brochures or datasheets.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F2F1F5] text-slate-700 font-bold border-b border-[#D9DDE3] uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Title</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">File Size</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Order</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9DDE3]">
                {downloads.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-bold text-[#35313B] flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div>{d.title}</div>
                        {d.description && <div className="text-[11px] text-slate-400 font-normal">{d.description}</div>}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                        {d.category || 'Datasheet'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{d.file_size || 'PDF'}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        d.status === 1 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {d.status === 1 ? 'Active' : 'Draft'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono">{d.order}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {d.file && (
                          <a
                            href={d.file}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#645394] hover:bg-[#F2F1F5]"
                            title="Open PDF"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        <button onClick={() => openEditModal(d)} className="p-1.5 rounded-lg text-slate-500 hover:text-[#645394] hover:bg-[#F2F1F5]">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => { setDownloadToDelete(d); setDeleteModalOpen(true); }} className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50">
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#D9DDE3] space-y-4">
            <div className="flex items-center justify-between border-b border-[#D9DDE3] pb-3">
              <h3 className="font-bold text-[#35313B] text-base font-heading">
                {modalMode === 'create' ? 'Upload Technical Document' : 'Edit Document'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-[#F2F1F5]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#D9DDE3] focus:border-[#645394] focus:outline-none"
                  placeholder="e.g. Revati Global Corporate Brochure 2026"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#D9DDE3] focus:border-[#645394] focus:outline-none bg-white"
                  >
                    <option value="Brochure">Corporate Brochure</option>
                    <option value="Datasheet">Product Datasheet</option>
                    <option value="Certificate">Certificate / Compliance</option>
                    <option value="Manual">Operation Manual</option>
                  </select>
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

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#D9DDE3] focus:border-[#645394] focus:outline-none"
                  placeholder="Short notes on document revision or scope"
                />
              </div>

              <div className="border border-dashed border-[#D9DDE3] p-4 rounded-xl space-y-2 bg-[#F2F1F5]/50">
                <label className="font-bold text-slate-700 block">PDF File (Direct Supabase Storage Upload, max 10 MB)</label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#645394] file:text-white hover:file:bg-[#524378] cursor-pointer"
                />
                {formData.file && (
                  <div className="text-[11px] text-slate-500 mt-1 font-mono truncate">
                    Current: {formData.file}
                  </div>
                )}
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-2">
                    <div className="bg-[#645394] h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
                )}
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
                  <span>{modalMode === 'create' ? 'Upload Document' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && downloadToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-rose-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertCircle className="w-6 h-6" />
              <h3 className="font-bold text-base">Delete Document</h3>
            </div>
            <p className="text-xs text-slate-600">
              Are you sure you want to delete <strong>{downloadToDelete.title}</strong>? The PDF in Supabase Storage will be purged.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => { setDeleteModalOpen(false); setDownloadToDelete(null); }}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
