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
} from 'lucide-react';
import { useState } from 'react';

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

  return (
    <aside
      className={clsx(
        'fixed left-0 top-0 bottom-0 z-40 flex flex-col border-r border-border-primary transition-all duration-300 ease-in-out',
        collapsed ? 'w-[72px]' : 'w-[260px]'
      )}
      style={{ background: 'var(--gradient-sidebar)' }}
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 h-[64px] border-b border-border-primary">
        <div
          className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0"
          style={{ background: 'var(--gradient-brand)' }}
        >
          <Shield className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in overflow-hidden">
            <h1 className="text-sm font-bold text-text-primary tracking-tight leading-tight whitespace-nowrap">
              FI MacroRisk
            </h1>
            <p className="text-[10px] font-medium text-text-muted tracking-widest uppercase whitespace-nowrap">
              Radar
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
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
