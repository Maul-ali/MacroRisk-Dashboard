'use client';

import { Clock, Signal, Sun, Moon, RotateCw, User, LogOut, LogIn } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useAuth } from '@/components/providers/AuthProvider';
import { clsx } from 'clsx';

export default function Header() {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>('Live');
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }) +
        ', ' +
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }) +
        ' WIB'
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/refresh', { method: 'POST' });
      if (res.ok) {
        setLastRefreshed('Just now');
        // Refresh page data
        window.location.reload();
      }
    } catch {
      // Ignore
    } finally {
      setIsRefreshing(false);
    }
  };

  const pathname = usePathname();
  const isRiskProfile = pathname.startsWith('/risk-profile');
  const isDark = theme === 'dark';

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-[64px] px-6 border-b border-border-primary bg-bg-primary/80 backdrop-blur-xl transition-colors duration-200">
      {/* Left: Breadcrumb area */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-text-primary">
          {isRiskProfile ? 'Fertilizer Indo Corporate Risk Profile' : 'Fertilizer Indo Macro Intelligence'}
        </span>
      </div>

      {/* Right: System info + controls */}
      <div className="flex items-center gap-4">
        {/* Live sync / Data freshness */}
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md border border-border-subtle hover:border-border-primary hover:bg-bg-card transition-all cursor-pointer text-xs"
          title="Click to sync live feeds"
        >
          <RotateCw
            className={clsx(
              'w-3.5 h-3.5 text-risk-low transition-transform',
              isRefreshing && 'animate-spin text-chart-1'
            )}
          />
          <span className="text-xs font-medium text-text-secondary">
            {isRefreshing ? 'Syncing Live...' : lastRefreshed === 'Just now' ? 'Live (Synced)' : '17 series · Live Feeds'}
          </span>
        </button>

        {/* Clock */}
        <div className="hidden md:flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-text-muted" />
          <span className="text-xs text-text-muted font-mono">
            {currentTime}
          </span>
        </div>

        {/* Dark/Light mode toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center w-8 h-8 rounded-lg border border-border-primary text-text-muted hover:text-text-primary hover:bg-bg-card transition-all cursor-pointer shadow-xs"
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400 hover:text-amber-300 transition-colors" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700 hover:text-slate-900 transition-colors" />
          )}
        </button>

        {/* User Profile / Auth Status */}
        {user ? (
          <div className="flex items-center gap-2 pl-2 border-l border-border-subtle">
            <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-bg-tertiary/60 border border-border-subtle">
              <div className="w-6 h-6 rounded-full bg-chart-1/20 text-chart-1 font-bold text-[10px] flex items-center justify-center">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-semibold text-text-primary leading-tight">
                  {user.name}
                </p>
                <p className="text-[10px] text-text-muted leading-tight">
                  {user.role}
                </p>
              </div>
            </div>
            <button
              onClick={() => logout()}
              className="p-1.5 rounded-lg border border-border-primary text-text-muted hover:text-risk-critical hover:bg-risk-critical/10 transition-colors cursor-pointer"
              title="Keluar (Logout)"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-chart-1 to-chart-2 text-white hover:opacity-95 transition-opacity shadow-xs cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Masuk</span>
          </Link>
        )}
      </div>
    </header>
  );
}
