'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import {
  LayoutDashboard,
  TrendingUp,
  BarChart3,
  Newspaper,
  Bell,
  FileText,
  Database,
  Radio,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  ChevronDown,
  ShieldAlert,
} from 'lucide-react';
import { useState } from 'react';
import RiskProfileSidebar from './RiskProfileSidebar';

const NAV_ITEMS = [
  { href: '/overview', label: 'Overview', icon: LayoutDashboard },
  { href: '/macro', label: 'Macro', icon: TrendingUp },
  { href: '/commodities', label: 'Commodities', icon: BarChart3 },
  { href: '/news', label: 'News Intelligence', icon: Newspaper },
  { href: '/alerts', label: 'Alerts', icon: Bell },
  { href: '/briefing', label: 'Executive Brief', icon: FileText },
  { href: '/catalog', label: 'Data Catalog', icon: Database },
  { href: '/news-control', label: 'News Control', icon: Radio },
  { href: '/admin', label: 'Admin', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const isRiskProfile = pathname.startsWith('/risk-profile');

  return (
    <aside
      className={clsx(
        'fixed left-0 top-0 bottom-0 z-40 flex flex-col border-r border-border-primary transition-all duration-300 ease-in-out',
        collapsed ? 'w-[72px]' : 'w-[260px]'
      )}
      style={{ background: 'var(--gradient-sidebar)' }}
    >
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-5 h-[64px] border-b border-border-primary">
        <Link
          href="/overview"
          className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0 hover:opacity-90 transition-opacity"
          style={{ background: 'var(--gradient-brand)' }}
          title="MacroRisk Dashboard"
        >
          <Shield className="w-5 h-5 text-white" />
        </Link>
        {!collapsed && (
          <div className="animate-fade-in overflow-hidden">
            <h1 className="text-sm font-bold text-text-primary tracking-tight leading-tight whitespace-nowrap">
              MacroRisk Dashboard
            </h1>
            <p className="text-[10px] font-medium text-text-muted tracking-widest uppercase whitespace-nowrap">
              Indo Fertilizer
            </p>
          </div>
        )}
      </div>

      {/* Navigation — conditional */}
      {isRiskProfile ? (
        <RiskProfileSidebar collapsed={collapsed} />
      ) : (
        <div className="flex-1 overflow-y-auto flex flex-col">
          {/* Org & Mode Switcher Block (Standard Sidebar) */}
          {!collapsed ? (
            <>
              <div className="px-4 pt-4 pb-3 border-b border-border-primary">
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-bg-tertiary/60 text-left">
                  <div
                    className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
                    style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}
                  >
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-primary truncate">
                      Fertilizer Indo
                    </p>
                    <p className="text-[10px] text-text-muted truncate">
                      Macro Intelligence
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-text-muted shrink-0" />
                </div>
              </div>

              {/* Mode Toggle: Makro Risk vs Profil Risiko */}
              <div className="px-4 pt-3 pb-2">
                <div className="flex gap-1 p-1 rounded-xl bg-bg-tertiary/50 border border-border-subtle">
                  <div className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-semibold text-text-primary bg-bg-card shadow-sm border border-bg-glass-border">
                    Macro Risk
                  </div>
                  <Link
                    href="/risk-profile/ringkasan"
                    className="flex-1 flex items-center justify-center gap-1 py-2 px-2.5 rounded-lg text-xs font-medium text-text-muted hover:text-text-primary hover:bg-bg-card-hover transition-all group"
                  >
                    <span>Risk Profile</span>
                  </Link>
                </div>
              </div>

              {/* Section label */}
              <div className="px-5 pt-3 pb-1">
                <p className="text-[10px] font-semibold text-text-muted tracking-[0.08em] uppercase">
                  Menu Utama
                </p>
              </div>
            </>
          ) : (
            <div className="p-2 border-b border-border-primary flex justify-center">
              <Link
                href="/risk-profile/ringkasan"
                title="Beralih ke Profil Risiko Korporasi"
                className="w-9 h-9 rounded-lg flex items-center justify-center bg-bg-tertiary hover:bg-bg-card-hover border border-border-subtle text-chart-4"
              >
                <ShieldAlert className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* Standard Navigation Links */}
          <nav className="flex-1 px-3 py-2 space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href === '/overview' && pathname === '/');
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx('nav-link', isActive && 'nav-link--active')}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="w-[18px] h-[18px] shrink-0" />
                  {!collapsed && (
                    <span className="truncate whitespace-nowrap">{item.label}</span>
                  )}
                </Link>
              );
            })}

          </nav>

          {/* System Status */}
          {!collapsed && (
            <div className="px-4 py-3 border-t border-border-primary animate-fade-in">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-risk-low animate-pulse" />
                <span className="text-[11px] font-medium text-text-muted">
                  71% Live · System Online
                </span>
              </div>
              <div className="flex gap-3 text-[10px] text-text-muted">
                <span>
                  <span className="text-risk-low font-semibold">4</span> Fresh
                </span>
                <span>
                  <span className="text-risk-elevated font-semibold">0</span> Partial
                </span>
                <span>
                  <span className="text-text-muted font-semibold">12</span> Stale
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center h-10 border-t border-border-primary text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>
    </aside>
  );
}


