'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import {
  ShieldAlert,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register } = useAuth();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/overview';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password) {
      setError('Semua field wajib diisi.');
      return;
    }

    if (password.length < 6) {
      setError('Password minimal 6 karakter.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }

    setLoading(true);
    setError(null);

    const result = await register(name, email, password);
    setLoading(false);

    if (result.success) {
      window.location.href = redirectPath;
    } else {
      setError(result.error || 'Gagal mendaftarkan akun.');
    }
  };

  return (
    <div className="w-full max-w-md z-10 animate-fade-in">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-chart-1 to-chart-4 shadow-glow-blue text-white mb-4">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">
          FI MacroRisk Radar
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Pendaftaran Pengguna Baru Dashboard Risiko
        </p>
      </div>

      {/* Register Card */}
      <div className="glass-card p-8 border border-border-primary shadow-2xl relative">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-text-primary">
            Buat Akun Baru
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            Daftarkan akun untuk memonitor profil risiko dan indikator makro.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl border border-risk-critical/30 bg-risk-critical/10 text-risk-critical text-xs flex items-start gap-2.5 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">
              Nama Lengkap
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Budi Santoso"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-bg-tertiary/70 border border-border-primary text-text-primary text-xs focus:outline-none focus:border-chart-1 focus:ring-1 focus:ring-chart-1 transition-all placeholder:text-text-muted/60"
              />
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">
              Alamat Email Perusahaan
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
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
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

          {/* Confirm Password Field */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">
              Konfirmasi Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi password di atas"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-bg-tertiary/70 border border-border-primary text-text-primary text-xs focus:outline-none focus:border-chart-1 focus:ring-1 focus:ring-chart-1 transition-all placeholder:text-text-muted/60"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-chart-1 to-chart-2 text-white hover:opacity-95 shadow-glow-blue transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <span>Mendaftarkan...</span>
            ) : (
              <>
                <span>Daftar Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Login Footer Link */}
        <div className="mt-6 text-center text-xs text-text-muted pt-5 border-t border-border-subtle">
          Sudah punya akun?{' '}
          <Link
            href="/login"
            className="font-bold text-chart-1 hover:underline ml-1"
          >
            Masuk ke Akun
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-bg-primary">
      {/* Background Decorative Gradient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-chart-1/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-chart-4/10 rounded-full blur-3xl pointer-events-none" />

      <Suspense fallback={<div className="text-text-muted text-xs">Memuat formulir...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
