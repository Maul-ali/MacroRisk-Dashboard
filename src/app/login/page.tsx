'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import {
  ShieldAlert,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/overview';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Harap masukkan email dan password.');
      return;
    }

    setLoading(true);
    setError(null);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      window.location.href = redirectPath;
    } else {
      setError(result.error || 'Email atau password salah.');
    }
  };

  const handleDemoFill = () => {
    setEmail('admin@fertilizer-indo.com');
    setPassword('admin123');
    setError(null);
  };

  return (
    <div className="w-full max-w-md z-10 animate-fade-in">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-chart-1 to-chart-4 shadow-glow-blue text-white mb-4">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">
          RiskCompass
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Enterprise Risk Intelligence &amp; Macroeconomy
        </p>
      </div>

      {/* Login Card */}
      <div className="glass-card p-8 border border-border-primary shadow-2xl relative">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-text-primary">
            Masuk ke Akun
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            Masukkan kredensial Anda untuk mengakses dashboard intelijen risiko.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl border border-risk-critical/30 bg-risk-critical/10 text-risk-critical text-xs flex items-start gap-2.5 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">
              Alamat Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@fertilizer-indo.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-bg-tertiary/70 border border-border-primary text-text-primary text-xs focus:outline-none focus:border-chart-1 focus:ring-1 focus:ring-chart-1 transition-all placeholder:text-text-muted/60"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-text-secondary">
                Password
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-bg-tertiary/70 border border-border-primary text-text-primary text-xs focus:outline-none focus:border-chart-1 focus:ring-1 focus:ring-chart-1 transition-all placeholder:text-text-muted/60"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-chart-1 to-chart-2 text-white hover:opacity-95 shadow-glow-blue transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <span>Memverifikasi...</span>
            ) : (
              <>
                <span>Masuk ke Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Fast Fill Pill */}
        <div className="mt-6 pt-5 border-t border-border-subtle">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-text-muted">Akun Demo C-Level:</span>
            <button
              type="button"
              onClick={handleDemoFill}
              className="inline-flex items-center gap-1.5 text-[11px] font-bold text-chart-1 hover:underline cursor-pointer px-2 py-1 rounded-lg bg-chart-1/10 border border-chart-1/20"
            >
              <Sparkles className="w-3 h-3 text-chart-1" />
              <span>Gunakan Akun Demo</span>
            </button>
          </div>
          <p className="text-[10px] text-text-muted/80 mt-1 font-mono">
            admin@fertilizer-indo.com / admin123
          </p>
        </div>

        {/* Register Footer Link */}
        <div className="mt-6 text-center text-xs text-text-muted">
          Belum punya akun?{' '}
          <Link
            href="/register"
            className="font-bold text-chart-1 hover:underline ml-1"
          >
            Daftar di sini
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-bg-primary">
      {/* Background Decorative Gradient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-chart-1/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-chart-4/10 rounded-full blur-3xl pointer-events-none" />

      <Suspense fallback={<div className="text-text-muted text-xs">Memuat formulir...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
