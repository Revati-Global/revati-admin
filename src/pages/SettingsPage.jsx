import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { directUploadFile } from '../api/uploadHelper';
import {
  Settings as SettingsIcon,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Upload,
  Globe,
  Mail,
  Phone,
  MapPin,
  Building
} from 'lucide-react';

export function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [settings, setSettings] = useState({
    company_name: 'Revati Global',
    site_title: 'Revati Global | Industrial Thermal & HVAC Engineering',
    meta_description: 'Industrial Process Heating, Heat Pumps & Turnkey HVAC Solutions',
    email: 'info@revatiglobal.com',
    phone: '+91 98765 43210',
    address: 'Pune, Maharashtra, India',
    logo: '',
    social_links: {
      linkedin: '',
      twitter: '',
      facebook: '',
      youtube: ''
    }
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/settings');
      if (res.data.result === 'success' && res.data.settings) {
        setSettings(prev => ({
          ...prev,
          ...res.data.settings,
          social_links: typeof res.data.settings.social_links === 'object'
            ? res.data.settings.social_links
            : prev.social_links
        }));
        if (res.data.settings.logo) {
          setLogoPreview(res.data.settings.logo);
        }
      }
    } catch (err) {
      showToast('error', 'Failed to load company settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      let logoPath = settings.logo;

      if (logoFile) {
        const uploadResult = await directUploadFile(logoFile, 'logo', (p) => setUploadProgress(p));
        logoPath = uploadResult.path;
      }

      const payload = {
        ...settings,
        logo: logoPath
      };

      const res = await api.put('/admin/settings', payload);
      if (res.data.result === 'success') {
        showToast('success', 'Settings updated successfully');
        fetchSettings();
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
      setUploadProgress(0);
    }
  };

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center gap-3 text-slate-500 text-xs">
        <Loader2 className="w-8 h-8 animate-spin text-[#645394]" />
        <span>Loading corporate settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl border shadow-2xl flex items-center gap-3 text-sm font-medium ${
          toast.type === 'success' ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-300' : 'bg-rose-950/90 border-rose-500/30 text-rose-300'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-rose-400" />}
          <span>{toast.message}</span>
        </div>
      )}

      <div className="bg-white p-5 rounded-2xl border border-[#D9DDE3] shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-[#35313B] font-heading flex items-center gap-2.5">
            <SettingsIcon className="w-6 h-6 text-[#645394]" />
            Company & Site Settings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Global corporate identity, contact details, social links, and brand assets.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Brand & Identity */}
        <div className="bg-white p-6 rounded-2xl border border-[#D9DDE3] shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-[#35313B] font-heading flex items-center gap-2 border-b border-[#D9DDE3] pb-3">
            <Building className="w-4 h-4 text-[#645394]" />
            Brand & Identity
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Company Legal Name</label>
              <input
                type="text"
                value={settings.company_name}
                onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#D9DDE3] focus:border-[#645394] focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Site Title</label>
              <input
                type="text"
                value={settings.site_title}
                onChange={(e) => setSettings({ ...settings, site_title: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#D9DDE3] focus:border-[#645394] focus:outline-none"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="font-bold text-slate-700 block mb-1">Default Meta Description</label>
            <textarea
              rows={2}
              value={settings.meta_description}
              onChange={(e) => setSettings({ ...settings, meta_description: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-[#D9DDE3] focus:border-[#645394] focus:outline-none"
            />
          </div>

          {/* Logo Direct Upload */}
          <div className="border border-dashed border-[#D9DDE3] p-4 rounded-xl space-y-2 bg-[#F2F1F5]/50 text-xs">
            <label className="font-bold text-slate-700 block">Brand Logo (Direct Supabase WebP Upload, max 80 KB)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#645394] file:text-white hover:file:bg-[#524378] cursor-pointer"
            />
            {logoPreview && (
              <div className="mt-2 flex items-center gap-3">
                <img src={logoPreview} alt="Logo" className="h-12 max-w-xs object-contain border border-[#D9DDE3] p-1 bg-white rounded-lg" />
                <span className="text-[11px] text-slate-500">Logo preview</span>
              </div>
            )}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-2">
                <div className="bg-[#645394] h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
              </div>
            )}
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white p-6 rounded-2xl border border-[#D9DDE3] shadow-sm space-y-4 text-xs">
          <h3 className="font-bold text-sm text-[#35313B] font-heading flex items-center gap-2 border-b border-[#D9DDE3] pb-3">
            <MapPin className="w-4 h-4 text-[#645394]" />
            Corporate Contact Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Official Email Address</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#D9DDE3] focus:border-[#645394] focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Official Telephone / Mobile</label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#D9DDE3] focus:border-[#645394] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Corporate Office Address</label>
            <textarea
              rows={2}
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-[#D9DDE3] focus:border-[#645394] focus:outline-none"
            />
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-white p-6 rounded-2xl border border-[#D9DDE3] shadow-sm space-y-4 text-xs">
          <h3 className="font-bold text-sm text-[#35313B] font-heading flex items-center gap-2 border-b border-[#D9DDE3] pb-3">
            <Globe className="w-4 h-4 text-[#645394]" />
            Social Profiles
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">LinkedIn Profile</label>
              <input
                type="url"
                value={settings.social_links?.linkedin || ''}
                onChange={(e) => setSettings({
                  ...settings,
                  social_links: { ...settings.social_links, linkedin: e.target.value }
                })}
                placeholder="https://linkedin.com/company/revatiglobal"
                className="w-full px-3 py-2 rounded-xl border border-[#D9DDE3] focus:border-[#645394] focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Twitter / X Profile</label>
              <input
                type="url"
                value={settings.social_links?.twitter || ''}
                onChange={(e) => setSettings({
                  ...settings,
                  social_links: { ...settings.social_links, twitter: e.target.value }
                })}
                placeholder="https://x.com/revatiglobal"
                className="w-full px-3 py-2 rounded-xl border border-[#D9DDE3] focus:border-[#645394] focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#645394] text-white hover:bg-[#524378] font-bold text-xs transition shadow-sm disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
