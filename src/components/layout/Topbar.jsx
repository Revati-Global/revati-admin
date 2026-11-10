import React from 'react';
import {
  Menu,
  LogOut,
  ExternalLink,
  Globe
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';

const routeTitles = {
  '/': 'Dashboard Overview',
  '/categories': 'Product Categories',
  '/products': 'Heating & HVAC Systems',
  '/blogs': 'Articles & Technical Blogs',
  '/services': 'Services & Capabilities',
  '/industries': 'Industry Sectors',
  '/banners': 'Hero Banners & Visual Media',
  '/features': 'Core Enterprise Features',
  '/pages': 'Static Pages & Corporate Content',
  '/faqs': 'Frequently Asked Questions',
  '/inquiries': 'Customer Inquiries & Leads',
  '/subscribers': 'Newsletter Subscribers',
  '/cleanup': 'Data Cleanup & Test Record Manager',
};

export function Topbar({ setMobileOpen }) {
  const { logout } = useAuth();
  const location = useLocation();
  const currentTitle = routeTitles[location.pathname] || 'Management Portal';

  return (
    <header className="h-16 sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#D9DDE3] px-4 sm:px-6 flex items-center justify-between transition-colors shadow-sm">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-xl text-slate-600 hover:text-[#645394] hover:bg-[#F2F1F5] border border-transparent hover:border-[#D9DDE3] lg:hidden transition"
          title="Open Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Current Section Title */}
        <div className="flex items-center gap-2.5">
          <div className="h-4 w-1.5 rounded-full bg-[#645394]" />
          <h2 className="text-sm sm:text-base font-bold text-[#35313B] tracking-tight truncate max-w-[200px] sm:max-w-none font-heading">
            {currentTitle}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* View live public site */}
        <a
          href={import.meta.env.VITE_SITE_URL || "https://revatiglobal.com"}
          target="_blank"
          rel="noreferrer"
          className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-[#645394] bg-[#645394]/10 hover:bg-[#645394]/15 border border-[#645394]/25 rounded-xl transition shadow-sm"
        >
          <Globe className="w-3.5 h-3.5 text-[#645394]" />
          <span>Live Website</span>
          <ExternalLink className="w-3 h-3 text-[#645394]" />
        </a>

        {/* User Info Capsule: Revati Global Admin */}
        <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#F2F1F5] border border-[#D9DDE3] text-xs">
          <div className="w-6 h-6 rounded-lg bg-[#645394] flex items-center justify-center text-white font-bold text-[10px] shadow-sm font-mono">
            R
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-[#35313B] leading-tight">
              Revati Global Admin
            </span>
            <span className="text-[10px] text-[#645394] font-semibold uppercase font-mono">
              Super Admin
            </span>
          </div>
        </div>

        {/* Logout Action */}
        <button
          onClick={logout}
          className="flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#524378] hover:text-white bg-[#F2F1F5] hover:bg-[#524378] border border-[#D9DDE3] transition shadow-sm active:scale-95"
          title="Sign out of portal"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}
