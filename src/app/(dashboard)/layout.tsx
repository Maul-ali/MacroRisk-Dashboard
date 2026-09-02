'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { useAuth } from '@/components/providers/AuthProvider';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user, router]);

  // Show loading skeleton while verifying session
  if (loading) {
    return (
      <div className="flex min-h-screen">
        {/* Sidebar skeleton */}
        <div className="fixed left-0 top-0 bottom-0 w-[260px] border-r border-border-primary" style={{ background: 'var(--gradient-sidebar)' }}>
          <div className="flex items-center gap-3 px-5 h-[64px] border-b border-border-primary">
            <div className="w-9 h-9 rounded-lg bg-bg-tertiary/50 animate-pulse" />
            <div className="space-y-1.5 flex-1">
              <div className="h-3.5 w-32 rounded bg-bg-tertiary/50 animate-pulse" />
              <div className="h-2.5 w-20 rounded bg-bg-tertiary/30 animate-pulse" />
            </div>
          </div>
          <div className="p-4 space-y-2 mt-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-9 rounded-lg bg-bg-tertiary/30 animate-pulse" style={{ animationDelay: `${i * 80}ms` }} />
            ))}
          </div>
        </div>
        {/* Main content skeleton */}
        <div className="flex-1 ml-[260px]">
          <div className="h-[64px] border-b border-border-primary bg-bg-primary/80 flex items-center px-6">
            <div className="h-4 w-56 rounded bg-bg-tertiary/50 animate-pulse" />
          </div>
          <div className="p-6 space-y-4">
            <div className="h-8 w-64 rounded bg-bg-tertiary/40 animate-pulse" />
            <div className="h-4 w-96 rounded bg-bg-tertiary/30 animate-pulse" />
            <div className="grid grid-cols-3 gap-4 mt-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-48 rounded-xl bg-bg-tertiary/20 animate-pulse" style={{ animationDelay: `${i * 120}ms` }} />
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
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-[260px] transition-all duration-300">
        <Header />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
