import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import {
  Users as UsersIcon,
  Plus,
  Search,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  RefreshCw,
  Shield,
  UserCheck,
  UserX,
  Key
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ROLES = ['super admin', 'admin', 'editor', 'sales'];

export function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'editor'
  });
  const [submitting, setSubmitting] = useState(false);

  // Delete State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users');
      if (res.data.result === 'success') {
        setUsers(res.data.users || []);
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to load user roster');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      if (res.data.result === 'success') {
        showToast('success', `Role changed to ${newRole}`);
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to update role');
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === 1 ? 0 : 1;
      const res = await api.patch(`/admin/users/${userId}/status`, { status: newStatus });
      if (res.data.result === 'success') {
        showToast('success', `User account ${newStatus === 1 ? 'activated' : 'disabled'}`);
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to toggle user status');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      showToast('error', 'All fields are required');
      return;
    }
    if (formData.password.length < 8) {
      showToast('error', 'Password must be at least 8 characters long');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/admin/users', formData);
      if (res.data.result === 'success') {
        showToast('success', 'User created successfully');
        setIsModalOpen(false);
        setFormData({ name: '', email: '', password: '', role: 'editor' });
        fetchUsers();
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    try {
      setDeleting(true);
      const res = await api.delete(`/admin/users/${userToDelete.id}`);
      if (res.data.result === 'success') {
        showToast('success', 'User removed successfully');
        setDeleteModalOpen(false);
        setUserToDelete(null);
        fetchUsers();
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.role?.toLowerCase().includes(search.toLowerCase())
  );

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
            <Shield className="w-6 h-6 text-[#645394]" />
            Users & Role Authorization
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Strict RBAC: Super Admin, Admin, Content Editor, and Sales Representative.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#645394] hover:bg-[#524378] transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create User</span>
          </button>
          <button onClick={fetchUsers} className="p-2.5 rounded-xl border border-[#D9DDE3] hover:bg-[#F2F1F5] text-slate-600 transition">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#645394]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-[#D9DDE3] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3 text-slate-500 text-xs">
            <Loader2 className="w-8 h-8 animate-spin text-[#645394]" />
            <span>Loading user accounts...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No users found matching query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F2F1F5] text-slate-700 font-bold border-b border-[#D9DDE3] uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Assigned Role</th>
                  <th className="py-3.5 px-4">Account Status</th>
                  <th className="py-3.5 px-4">Last Login</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9DDE3]">
                {filteredUsers.map((u) => {
                  const isSelf = currentUser?.id === u.id || currentUser?.email === u.email;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-bold text-[#35313B]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-[#645394] text-white flex items-center justify-center font-bold text-xs font-mono">
                            {u.name ? u.name[0].toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div>{u.name}</div>
                            {isSelf && <span className="text-[10px] text-[#645394] font-mono font-bold">(You)</span>}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{u.email}</td>
                      <td className="py-3 px-4">
                        <select
                          value={u.role || 'editor'}
                          disabled={isSelf}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="font-bold text-xs px-2.5 py-1 rounded-lg border border-[#D9DDE3] focus:outline-none bg-white uppercase text-[11px]"
                        >
                          {ROLES.map(r => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          disabled={isSelf}
                          onClick={() => handleStatusToggle(u.id, u.status)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition ${
                            u.status === 1
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                          }`}
                        >
                          {u.status === 1 ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                          <span>{u.status === 1 ? 'Active' : 'Disabled'}</span>
                        </button>
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {u.last_login ? new Date(u.last_login).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {!isSelf && (
                          <button
                            onClick={() => { setUserToDelete(u); setDeleteModalOpen(true); }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                            title="Delete user account"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#D9DDE3] space-y-4">
            <div className="flex items-center justify-between border-b border-[#D9DDE3] pb-3">
              <h3 className="font-bold text-[#35313B] text-base font-heading">
                Create Admin Account
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-[#F2F1F5]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#D9DDE3] focus:border-[#645394] focus:outline-none"
                  placeholder="e.g. Rahul Sharma"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#D9DDE3] focus:border-[#645394] focus:outline-none"
                  placeholder="name@revatiglobal.com"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Initial Password * (min 8 chars)</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#D9DDE3] focus:border-[#645394] focus:outline-none"
                  placeholder="••••••••••••"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Role & Privileges</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#D9DDE3] focus:border-[#645394] focus:outline-none bg-white uppercase font-bold text-[11px]"
                >
                  <option value="editor">Editor (Content & Products)</option>
                  <option value="sales">Sales (Enquiries & Leads)</option>
                  <option value="admin">Admin (All modules except user accounts)</option>
                  <option value="super admin">Super Admin (Full access)</option>
                </select>
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
                  <span>Create Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-rose-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertCircle className="w-6 h-6" />
              <h3 className="font-bold text-base">Delete User Account</h3>
            </div>
            <p className="text-xs text-slate-600">
              Are you sure you want to delete account <strong>{userToDelete.name}</strong> ({userToDelete.email})?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => { setDeleteModalOpen(false); setUserToDelete(null); }}
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
