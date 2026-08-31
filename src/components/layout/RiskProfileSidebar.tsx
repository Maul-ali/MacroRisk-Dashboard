'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import {
  LayoutGrid,
  Map,
  BookOpen,
  ChevronDown,
  Calendar,
  Shield,
} from 'lucide-react';

const SUB_NAV_ITEMS = [
  { href: '/risk-profile/ringkasan', label: 'Ringkasan', icon: LayoutGrid },
  { href: '/risk-profile/peta-risiko', label: 'Peta Risiko', icon: Map },
  { href: '/risk-profile/kamus-risiko', label: 'Kamus Risiko', icon: BookOpen },
];

interface RiskProfileSidebarProps {
  collapsed: boolean;
}

export default function RiskProfileSidebar({ collapsed }: RiskProfileSidebarProps) {
  const pathname = usePathname();

  if (collapsed) {
    return (
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {SUB_NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx('nav-link', isActive && 'nav-link--active')}
              title={item.label}
            >
              <Icon className="w-[18px] h-[18px] shrink-0" />
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto flex flex-col">
      {/* Org / Mode Switcher Block */}
      <div className="px-4 pt-4 pb-3 border-b border-border-primary">
        <button className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-bg-tertiary/60 hover:bg-bg-card-hover transition-colors text-left cursor-pointer">
          <div
            className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
            style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }}
          >
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary truncate">
              Fertilizer Indo
            </p>
            <p className="text-[10px] text-text-muted truncate">
              Corporate Risk Profile
            </p>
          </div>
          <ChevronDown className="w-4 h-4 text-text-muted shrink-0" />
        </button>
      </div>

      {/* Mode Toggle */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex gap-1 p-1 rounded-xl bg-bg-tertiary/50">
          <Link
            href="/overview"
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium text-text-muted hover:text-text-secondary hover:bg-bg-card-hover transition-all"
          >
            Makro Risk
          </Link>
          <div className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold text-text-primary bg-bg-card shadow-sm border border-bg-glass-border">
            Profil Risiko
          </div>
        </div>
      </div>

      {/* Section Label */}
      <div className="px-5 pt-4 pb-2">
        <p className="text-[10px] font-semibold text-text-muted tracking-[0.08em] uppercase">
          Profil Risiko Korporasi
        </p>
      </div>

      {/* Sub-Navigation */}
      <nav className="px-3 space-y-1">
        {SUB_NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx('nav-link', isActive && 'nav-link--active')}
            >
              <Icon className="w-[18px] h-[18px] shrink-0" />
              <span className="truncate whitespace-nowrap">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Periode Laporan Box */}
      <div className="px-4 pb-3">
        <div className="p-3 rounded-xl border border-border-primary bg-bg-tertiary/40">
          <div className="flex items-center gap-2 mb-1.5">
            <Calendar className="w-3.5 h-3.5 text-text-muted" />
            <p className="text-[10px] font-semibold text-text-muted tracking-[0.06em] uppercase">
              Periode Laporan
            </p>
          </div>
          <p className="text-sm font-bold text-text-primary">
            Juni 2026
          </p>
          <p className="text-[11px] text-text-muted mt-0.5">
            43 parameter risiko · Data dummy
          </p>
        </div>
      </div>
    </div>
  );
}
