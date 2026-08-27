'use client';

import { Clock, Signal, Sun, Moon, RotateCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { clsx } from 'clsx';

export default function Header() {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>('Live');
  const { theme, toggleTheme } = useTheme();

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

  const isDark = theme === 'dark';

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-[64px] px-6 border-b border-border-primary bg-bg-primary/80 backdrop-blur-xl transition-colors duration-200">
      {/* Left: Breadcrumb area */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-text-primary">
          Fertilizer Indo Macro Intelligence
        </span>
        <span className="text-text-muted">·</span>
        <span className="text-xs text-text-muted">Powered by MaxAI</span>
      </div>

      {/* Right: System info + controls */}
      <div className="flex items-center gap-5">
        {/* Live sync / Data freshness */}
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-2.5 py-1 rounded-md border border-border-subtle hover:border-border-primary hover:bg-bg-card transition-all cursor-pointer text-xs"
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
        <div className="flex items-center gap-2">
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
      </div>
    </header>
  );
}
