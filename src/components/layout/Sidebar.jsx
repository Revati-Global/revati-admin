import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderTree,
  Package,
  FileText,
  Wrench,
  Factory,
  Image,
  Sparkles,
  Layers,
  HelpCircle,
  Mail,
  Send,
  Trash2,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navigationGroups = [
  {
    title: 'Core Management',
    items: [
      { name: 'Dashboard', path: '/', icon: LayoutDashboard },
      { name: 'Categories', path: '/categories', icon: FolderTree },
      { name: 'Products', path: '/products', icon: Package },
      { name: 'Articles & Blogs', path: '/blogs', icon: FileText },
    ]
  },
  {
    title: 'Business & Solutions',
    items: [
      { name: 'Services', path: '/services', icon: Wrench },
      { name: 'Industries', path: '/industries', icon: Factory },
    ]
  },
  {
    title: 'Content & Media',
    items: [
      { name: 'Hero Banners', path: '/banners', icon: Image },
      { name: 'Core Features', path: '/features', icon: Sparkles },
      { name: 'Static Pages', path: '/pages', icon: Layers },
      { name: 'FAQs', path: '/faqs', icon: HelpCircle },
    ]
  },
  {
    title: 'Leads & Applications',
    items: [
      { name: 'Inquiries (Contact)', path: '/inquiries', icon: Mail },
      { name: 'Subscribers', path: '/subscribers', icon: Send },
    ]
  },
  {
    title: 'System & Tools',
    items: [
      { name: 'Data Cleanup Suite', path: '/cleanup', icon: Trash2 },
    ]
  }
];

export function Sidebar({ mobileOpen, setMobileOpen }) {
  const { user } = useAuth();

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
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-white font-heading">
                REVATI GLOBAL
              </span>
              <span className="text-[11px] text-[#D9DDE3] font-semibold tracking-wider uppercase font-mono">
                Admin Panel
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
          {navigationGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#D9DDE3] mb-1.5 font-mono">
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
                            : 'text-[#D9DDE3] hover:text-white hover:bg-[#524378]'
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

        {/* Footer / User card */}
        <div className="p-3 border-t border-[#524378] bg-[#28252D]">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/10 border border-white/15">
            <div className="w-8 h-8 rounded-lg bg-[#645394] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-sm font-mono">
              R
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">Revati Global</p>
              <p className="text-[10px] text-[#D9DDE3] truncate uppercase font-mono tracking-wider">
                SUPER ADMIN
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
