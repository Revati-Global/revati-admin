import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderTree,
  Package,
  FileText,
  Wrench,
  Factory,
  Briefcase,
  Download,
  Image,
  Sparkles,
  Layers,
  HelpCircle,
  Mail,
  Send,
  Trash2,
  Users,
  Settings,
  HardDrive,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';

export function Sidebar({ mobileOpen, setMobileOpen }) {
  const { user } = useAuth();
  const [storageUsage, setStorageUsage] = useState(null);

  const role = (user?.role || 'admin').toLowerCase();

  // Fetch Supabase storage usage (1 GB limit)
  useEffect(() => {
    let mounted = true;
    async function loadUsage() {
      try {
        const res = await api.get('/admin/storage/usage');
        if (mounted && res.data.result === 'success') {
          setStorageUsage(res.data);
        }
      } catch (err) {
        // Silently skip storage widget error if offline
      }
    }
    loadUsage();
    return () => { mounted = false; };
  }, []);

  // Define modules with role restrictions
  const allGroups = [
    {
      title: 'Core Management',
      items: [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['super admin', 'admin', 'editor', 'sales'] },
        { name: 'Categories', path: '/categories', icon: FolderTree, roles: ['super admin', 'admin', 'editor'] },
        { name: 'Products & Systems', path: '/products', icon: Package, roles: ['super admin', 'admin', 'editor'] },
        { name: 'Articles & Blogs', path: '/blogs', icon: FileText, roles: ['super admin', 'admin', 'editor'] },
      ]
    },
    {
      title: 'Solutions & Engineering',
      items: [
        { name: 'Solutions', path: '/solutions', icon: Wrench, roles: ['super admin', 'admin', 'editor'] },
        { name: 'Applications', path: '/applications', icon: Factory, roles: ['super admin', 'admin', 'editor'] },
        { name: 'Projects & References', path: '/projects', icon: Briefcase, roles: ['super admin', 'admin', 'editor'] },
        { name: 'Brochures & Downloads', path: '/downloads', icon: Download, roles: ['super admin', 'admin', 'editor'] },
      ]
    },
    {
      title: 'Content & Media',
      items: [
        { name: 'Hero Banners', path: '/banners', icon: Image, roles: ['super admin', 'admin', 'editor'] },
        { name: 'Core Features', path: '/features', icon: Sparkles, roles: ['super admin', 'admin', 'editor'] },
        { name: 'Static Pages', path: '/pages', icon: Layers, roles: ['super admin', 'admin', 'editor'] },
        { name: 'FAQs', path: '/faqs', icon: HelpCircle, roles: ['super admin', 'admin', 'editor'] },
      ]
    },
    {
      title: 'Leads & Enquiries',
      items: [
        { name: 'Customer Enquiries', path: '/enquiries', icon: Mail, roles: ['super admin', 'admin', 'sales'] },
        { name: 'Subscribers', path: '/subscribers', icon: Send, roles: ['super admin', 'admin', 'sales'] },
      ]
    },
    {
      title: 'Administration',
      items: [
        { name: 'Users & Roles', path: '/users', icon: Users, roles: ['super admin'] },
        { name: 'Company Settings', path: '/settings', icon: Settings, roles: ['super admin', 'admin'] },
        { name: 'Storage & Cleanup', path: '/cleanup', icon: Trash2, roles: ['super admin', 'admin'] },
      ]
    }
  ];

  // Filter groups according to active user role
  const filteredGroups = allGroups.map(group => ({
    ...group,
    items: group.items.filter(item => item.roles.includes(role))
  })).filter(group => group.items.length > 0);

  const usagePercent = storageUsage?.percentUsed || 0;
  const isHighStorage = usagePercent >= 70;

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-64 bg-[#35313B] text-white shadow-2xl transition-transform duration-300 flex flex-col ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-20 px-5 flex items-center justify-between border-b border-[#524378] bg-[#28252D]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#645394] text-white flex items-center justify-center font-black text-sm shadow-md font-mono border border-white/20">
              RG
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-white font-heading">
                REVATI GLOBAL
              </span>
              <span className="text-[10px] text-[#D9DDE3] font-semibold tracking-wider uppercase font-mono">
                Management Portal
              </span>
            </div>
          </div>

          {/* Close button on Mobile */}
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-lg text-[#D9DDE3] hover:text-white hover:bg-white/10 lg:hidden transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {filteredGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#D9DDE3]/70 mb-1.5 font-mono">
                {group.title}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === '/'}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                          isActive
                            ? 'bg-[#524378] text-white shadow-sm border-l-4 border-[#645394] font-bold'
                            : 'text-[#D9DDE3] hover:text-white hover:bg-white/5'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110 text-[#645394]" />
                      <span className="truncate flex-1">{item.name}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Storage Bar (1 GB Limit) */}
        {storageUsage && (
          <div className="px-4 py-3 border-t border-[#524378]/60 bg-[#28252D]/80">
            <div className="flex items-center justify-between text-[11px] mb-1.5 font-mono">
              <span className="flex items-center gap-1.5 text-[#D9DDE3]">
                <HardDrive className="w-3.5 h-3.5 text-[#645394]" />
                Supabase Storage
              </span>
              <span className={isHighStorage ? 'text-amber-400 font-bold' : 'text-[#D9DDE3]'}>
                {storageUsage.totalUsedMB} / 1024 MB
              </span>
            </div>
            <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  isHighStorage ? 'bg-amber-400' : 'bg-[#645394]'
                }`}
                style={{ width: `${Math.min(100, usagePercent)}%` }}
              />
            </div>
          </div>
        )}

        {/* Footer / User card */}
        <div className="p-3 border-t border-[#524378] bg-[#28252D]">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/10 border border-white/15">
            <div className="w-8 h-8 rounded-lg bg-[#645394] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-sm font-mono">
              {user?.name ? user.name[0].toUpperCase() : 'R'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.name || 'Administrator'}</p>
              <p className="text-[10px] text-[#D9DDE3] truncate uppercase font-mono tracking-wider">
                {role}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
