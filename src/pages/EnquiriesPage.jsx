import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import {
  Inbox,
  Search,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  RefreshCw,
  Mail,
  Phone,
  Calendar,
  Eye,
  Download,
  Filter,
  Check,
  Building,
  Tag
} from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'new', label: 'New Lead', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  { value: 'contacted', label: 'Contacted', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  { value: 'qualified', label: 'Qualified', color: 'bg-purple-100 text-purple-800 border-purple-300' },
  { value: 'converted', label: 'Converted', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { value: 'closed', label: 'Closed', color: 'bg-gray-100 text-gray-800 border-gray-300' }
];

export function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [toast, setToast] = useState(null);

  // View Modal State
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);

  // Delete State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [enquiryToDelete, setEnquiryToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = await api.get('/admin/enquiries', { params });
      if (res.data.result === 'success') {
        setEnquiries(res.data.enquiries || res.data.data || []);
      }
    } catch (err) {
      showToast('error', 'Failed to load customer enquiries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, [statusFilter]);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await api.patch(`/admin/enquiries/${id}/status`, { status: newStatus });
      if (res.data.result === 'success') {
        showToast('success', `Status updated to ${newStatus}`);
        setEnquiries(prev => prev.map(e => e.id === id ? { ...e, status: newStatus } : e));
        if (selectedEnquiry && selectedEnquiry.id === id) {
          setSelectedEnquiry(prev => ({ ...prev, status: newStatus }));
        }
      }
    } catch (err) {
      showToast('error', 'Failed to update status');
    }
  };

  const handleExportCsv = async () => {
    try {
      setExporting(true);
      const res = await api.get('/admin/enquiries/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `revati-enquiries-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast('success', 'Enquiries exported to CSV');
    } catch (err) {
      showToast('error', 'Failed to export enquiries to CSV');
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!enquiryToDelete) return;
    try {
      setDeleting(true);
      const res = await api.delete(`/admin/enquiries/${enquiryToDelete.id}`);
      if (res.data.result === 'success') {
        showToast('success', 'Enquiry deleted successfully');
        setDeleteModalOpen(false);
        setEnquiryToDelete(null);
        fetchEnquiries();
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to delete enquiry');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl border shadow-2xl flex items-center gap-3 text-sm font-medium transition-all ${
            toast.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-950/90 border-rose-500/30 text-rose-300'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#D9DDE3] shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-[#35313B] font-heading flex items-center gap-2.5">
            <Inbox className="w-6 h-6 text-[#645394]" />
            Customer Enquiries & RFQs
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review RFQ submissions, update qualification status, and export leads.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            disabled={exporting || enquiries.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#645394] hover:bg-[#524378] transition shadow-sm disabled:opacity-50"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>Export CSV</span>
          </button>

          <button
            onClick={fetchEnquiries}
            className="p-2.5 rounded-xl border border-[#D9DDE3] hover:bg-[#F2F1F5] text-slate-600 transition"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#645394]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-xl border border-[#D9DDE3]">
        <form
          onSubmit={(e) => { e.preventDefault(); fetchEnquiries(); }}
          className="relative flex-1 w-full"
        >
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, company, email, phone or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[#D9DDE3] focus:outline-none focus:border-[#645394]"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-[#D9DDE3] focus:outline-none focus:border-[#645394] bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="new">New Lead</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="converted">Converted</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Enquiries Table */}
      <div className="bg-white rounded-2xl border border-[#D9DDE3] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3 text-slate-500 text-xs">
            <Loader2 className="w-8 h-8 animate-spin text-[#645394]" />
            <span>Loading enquiries...</span>
          </div>
        ) : enquiries.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No customer enquiries found matching the criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F2F1F5] text-slate-700 font-bold border-b border-[#D9DDE3] uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Customer / Company</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Subject / Message</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Alert Email</th>
                  <th className="py-3.5 px-4">Received</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9DDE3]">
                {enquiries.map((enq) => {
                  const statusObj = STATUS_OPTIONS.find(s => s.value === (enq.status || 'new')) || STATUS_OPTIONS[0];
                  return (
                    <tr key={enq.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#35313B]">{enq.name}</div>
                        {enq.company && (
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Building className="w-3 h-3 text-[#645394]" />
                            {enq.company}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-700">{enq.email}</div>
                        {enq.phone && (
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5">{enq.phone}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        {enq.subject && (
                          <div className="font-semibold text-[#35313B] truncate">{enq.subject}</div>
                        )}
                        <div className="text-[11px] text-slate-500 truncate">{enq.message}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <select
                          value={enq.status || 'new'}
                          onChange={(e) => handleStatusChange(enq.id, e.target.value)}
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border focus:outline-none ${statusObj.color}`}
                        >
                          {STATUS_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            enq.notify_status === 'sent'
                              ? 'bg-emerald-100 text-emerald-800'
                              : enq.notify_status === 'failed'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {enq.notify_status || 'pending'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        {enq.created_at ? new Date(enq.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => { setSelectedEnquiry(enq); setIsViewModalOpen(true); }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#645394] hover:bg-[#F2F1F5] transition"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => { setEnquiryToDelete(enq); setDeleteModalOpen(true); }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Detail Modal */}
      {isViewModalOpen && selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#D9DDE3] space-y-4">
            <div className="flex items-center justify-between border-b border-[#D9DDE3] pb-3">
              <h3 className="font-bold text-[#35313B] text-base font-heading">
                Enquiry Details
              </h3>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-[#F2F1F5]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-[#F2F1F5] p-3 rounded-xl">
                <div>
                  <span className="text-slate-500 block">Customer Name</span>
                  <span className="font-bold text-[#35313B]">{selectedEnquiry.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Company</span>
                  <span className="font-bold text-[#35313B]">{selectedEnquiry.company || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Email</span>
                  <a href={`mailto:${selectedEnquiry.email}`} className="text-[#645394] font-semibold underline">
                    {selectedEnquiry.email}
                  </a>
                </div>
                <div>
                  <span className="text-slate-500 block">Phone</span>
                  <a href={`tel:${selectedEnquiry.phone}`} className="text-[#645394] font-semibold">
                    {selectedEnquiry.phone || 'N/A'}
                  </a>
                </div>
              </div>

              {selectedEnquiry.subject && (
                <div>
                  <span className="text-slate-500 block font-semibold">Subject / Product of Interest:</span>
                  <p className="mt-1 text-slate-800 font-bold">{selectedEnquiry.subject}</p>
                </div>
              )}

              <div>
                <span className="text-slate-500 block font-semibold">Full Message / RFQ Specifications:</span>
                <div className="mt-1 p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {selectedEnquiry.message}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-slate-500">
                  Received on {new Date(selectedEnquiry.created_at).toLocaleString()}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Status:</span>
                  <select
                    value={selectedEnquiry.status || 'new'}
                    onChange={(e) => handleStatusChange(selectedEnquiry.id, e.target.value)}
                    className="font-bold text-xs px-2 py-1 rounded-lg border border-[#D9DDE3]"
                  >
                    {STATUS_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#D9DDE3]">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#645394] text-white font-bold text-xs hover:bg-[#524378]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && enquiryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-rose-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertCircle className="w-6 h-6" />
              <h3 className="font-bold text-base">Delete Enquiry</h3>
            </div>
            <p className="text-xs text-slate-600">
              Are you sure you want to permanently delete this enquiry from <strong>{enquiryToDelete.name}</strong>?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => { setDeleteModalOpen(false); setEnquiryToDelete(null); }}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
