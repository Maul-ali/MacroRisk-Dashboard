'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { SidebarProvider, useSidebar } from '@/components/layout/SidebarContext';
import { useAuth } from '@/components/providers/AuthProvider';
import { clsx } from 'clsx';

function DashboardLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { collapsed, toggleCollapsed } = useSidebar();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user, router]);

  // Show loading skeleton while verifying session
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-bg-primary">
        {/* Full-width Header skeleton */}
        <div className="sticky top-0 z-30 w-full h-[64px] border-b border-border-primary bg-bg-primary/80 backdrop-blur-xl flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-28 rounded bg-bg-tertiary/50 animate-pulse" />
            <div className="h-4 w-48 rounded bg-bg-tertiary/30 animate-pulse hidden sm:block" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-24 rounded bg-bg-tertiary/40 animate-pulse hidden md:block" />
            <div className="h-8 w-8 rounded-lg bg-bg-tertiary/40 animate-pulse" />
          </div>
        </div>

        {/* Body container: Sidebar below header + main content */}
        <div className="flex-1 flex">
          {/* Sidebar skeleton fixed below header */}
          <div
            className="fixed left-0 top-[64px] bottom-0 w-[260px] border-r border-border-primary p-4 space-y-2"
            style={{ background: 'var(--gradient-sidebar)' }}
          >
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="h-9 rounded-lg bg-bg-tertiary/30 animate-pulse"
                style={{ animationDelay: `${i * 80}ms` }}
              />
            ))}
          </div>

          {/* Main content skeleton */}
          <div className="flex-1 ml-[260px] p-6 space-y-4">
            <div className="h-8 w-64 rounded bg-bg-tertiary/40 animate-pulse" />
            <div className="h-4 w-96 rounded bg-bg-tertiary/30 animate-pulse" />
            <div className="grid grid-cols-3 gap-4 mt-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-48 rounded-xl bg-bg-tertiary/20 animate-pulse"
                  style={{ animationDelay: `${i * 120}ms` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If not loading and no user, don't render (redirect will happen)
  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      {/* Header spans full-width across the top */}
      <Header />

      {/* Body: Fixed Sidebar below Header + dynamic margin Main Content */}
      <div className="flex-1 flex">
        <Sidebar collapsed={collapsed} onToggle={toggleCollapsed} />
        <main
          className={clsx(
            'flex-1 p-6 transition-all duration-300 ease-in-out min-w-0',
            collapsed ? 'ml-[72px]' : 'ml-[260px]'
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </SidebarProvider>
  );
}
